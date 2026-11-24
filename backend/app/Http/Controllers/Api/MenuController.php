<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Models\Tenant;
use App\Support\ImageValidator;
use App\Support\PhotoFocus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MenuController extends Controller
{
    /**
     * Menampilkan daftar menu untuk katalog pelanggan.
     * Secara default hanya menampilkan menu yang tersedia (status_tersedia = true),
     * serta mendukung filter id_tenant, id_kategori, status_tersedia, dan pencarian.
     */
    public function index(Request $request)
    {
        $compact = $request->boolean('compact_media', false);
        $data = $this->indexData($request, $compact);

        return response()->json([
            'success' => true,
            'message' => 'Daftar menu berhasil diambil.',
            'data' => $data,
        ], 200);
    }

    public function indexData(Request $request, bool $compact = false)
    {
        $query = $this->buildMenuQuery($compact);

        if ($request->filled('id_tenant')) {
            $query->where('id_tenant', (int) $request->query('id_tenant'));
        }

        if ($request->filled('id_kategori')) {
            $query->where('id_kategori', (int) $request->query('id_kategori'));
        }

        if ($request->has('status_tersedia') && $request->query('status_tersedia') !== '') {
            $query->where('status_tersedia', $request->boolean('status_tersedia'));
        } elseif (!$request->boolean('include_unavailable', false)) {
            $query->where('status_tersedia', true);
        }

        $search = $request->query('search') ?? $request->query('q');
        if ($search !== null && trim((string) $search) !== '') {
            $keyword = trim((string) $search);
            $query->where(function ($subQuery) use ($keyword) {
                $subQuery->where('nama_menu', 'like', '%' . $keyword . '%')
                    ->orWhere('deskripsi', 'like', '%' . $keyword . '%');
            });
        }

        $menus = $query->orderBy('id_menu', 'asc')->get();

        return $this->attachReviewStats($menus, $compact);
    }

    private function buildMenuQuery(bool $compact)
    {
        if (!$compact) {
            return Menu::with(['tenant', 'category']);
        }

        $tenantCols = [
            'id_tenant',
            'id_user',
            'nama_tenant',
            'deskripsi',
            'status_buka',
            'jam_buka',
            'jam_tutup',
            'auto_schedule',
            'foto_x',
            'foto_y',
            'foto_zoom',
        ];

        return Menu::select([
            'id_menu',
            'id_tenant',
            'id_kategori',
            'nama_menu',
            'deskripsi',
            'harga',
            'estimasi_menit',
            'status_tersedia',
            'foto_x',
            'foto_y',
            'foto_zoom',
        ])
            ->selectRaw(MediaController::previewSql('gambar', 'gambar', true))
            ->with([
                'category',
                'tenant' => fn ($q) => $q->select($tenantCols)->selectRaw(MediaController::previewSql('logo', 'logo', false)),
            ]);
    }

    /**
     * Menampilkan detail satu menu berdasarkan id_menu.
     */
    public function show(int $id)
    {
        $menu = Menu::with(['tenant', 'category'])->find($id);

        if (!$menu) {
            return response()->json([
                'success' => false,
                'message' => 'Menu tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail menu berhasil diambil.',
            'data' => $menu,
        ], 200);
    }

    /**
     * Menampilkan seluruh menu milik tenant yang dikelola oleh Vendor yang sedang login.
     */
    public function vendorMenus(Request $request)
    {
        $user = $request->user();
        $compact = $request->boolean('compact_media', false);
        $data = $this->vendorMenusData($request, $user, $compact);

        return response()->json([
            'success' => true,
            'message' => 'Daftar menu tenant berhasil diambil.',
            'data' => $data,
        ], 200);
    }

    public function vendorMenusData(Request $request, $user, bool $compact = false, ?int $tenantId = null)
    {
        $query = $this->buildMenuQuery($compact);
    
        if ($tenantId !== null) {
            $query->where('id_tenant', $tenantId);
        } else {
            $tenantIds = Tenant::where('id_user', $user->id_user)->pluck('id_tenant');
            $query->whereIn('id_tenant', $tenantIds);
        }
    
        if ($request->filled('id_kategori')) {
            $query->where('id_kategori', (int) $request->query('id_kategori'));
        }

        if ($request->has('status_tersedia') && $request->query('status_tersedia') !== '') {
            $query->where('status_tersedia', $request->boolean('status_tersedia'));
        }

        $search = $request->query('search') ?? $request->query('q');
        if ($search !== null && trim((string) $search) !== '') {
            $keyword = trim((string) $search);
            $query->where('nama_menu', 'like', '%' . $keyword . '%');
        }

        $menus = $query->orderBy('id_menu', 'asc')->get();

        return $this->attachReviewStats($menus, $compact);
    }

    /**
     * Menambahkan menu baru oleh Vendor pada tenant miliknya.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'id_tenant' => 'nullable|integer|exists:tenants,id_tenant',
            'id_kategori' => 'nullable|integer|exists:categories,id_kategori',
            'kategori_nama' => 'nullable|string|max:100',
            'nama_menu' => 'required|string|max:100',
            'deskripsi' => 'nullable|string|max:1000',
            'gambar' => ['nullable', 'string', ImageValidator::rule('gambar menu')],
            'harga' => 'required|integer|min:0|max:10000000',
            'estimasi_menit' => 'required|integer|min:1|max:180',
            'status_tersedia' => 'sometimes|boolean',
            ...PhotoFocus::rules(),
        ]);

        $categoryId = null;
        if (!empty($validated['kategori_nama'])) {
            $legacyMap = [
                'Rice & Mains' => ['Rice & Mains', 'Makanan'],
                'Snacks' => ['Snacks', 'Camilan'],
                'Drinks' => ['Drinks', 'Minuman'],
            ];
            $names = $legacyMap[$validated['kategori_nama']] ?? [$validated['kategori_nama']];
            $categoryId = \App\Models\Category::whereIn('nama_kategori', $names)->value('id_kategori');
        }
        if (!$categoryId && !empty($validated['id_kategori'])) {
            $categoryId = $validated['id_kategori'];
        }
        if (!$categoryId) {
            $categoryId = \App\Models\Category::value('id_kategori');
        }
        if (!$categoryId) {
            return response()->json([
                'success' => false,
                'message' => 'Kategori menu tidak valid.',
            ], 422);
        }

        if (!empty($validated['id_tenant'])) {
            $tenant = Tenant::find($validated['id_tenant']);
        } else {
            $tenant = Tenant::where('id_user', $user->id_user)->first();
        }

        if (!$tenant) {
            return response()->json([
                'success' => false,
                'message' => 'Tenant untuk akun Vendor ini belum ditemukan.',
            ], 404);
        }

        if ((int) $tenant->id_user !== (int) $user->id_user && strtolower((string) $user->peran) !== 'administrator') {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak akses untuk menambahkan menu pada tenant lain.',
            ], 403);
        }

        $menu = Menu::create([
            'id_tenant' => $tenant->id_tenant,
            'id_kategori' => $categoryId,
            'nama_menu' => $validated['nama_menu'],
            'deskripsi' => $validated['deskripsi'] ?? '',
            'gambar' => $validated['gambar'] ?? '',
            'harga' => $validated['harga'],
            'estimasi_menit' => $validated['estimasi_menit'],
            'status_tersedia' => $validated['status_tersedia'] ?? true,
            ...PhotoFocus::defaultsForCreate(),
            ...PhotoFocus::normalize($validated),
        ]);

        if (!empty($menu->gambar) && (!$tenant->logo || $tenant->logo === 'tenant/default.png')) {
            $tenant->logo = $menu->gambar;
            $tenant->save();
        }

        $menu->load(['tenant', 'category']);

        return response()->json([
            'success' => true,
            'message' => 'Menu berhasil ditambahkan.',
            'data' => $this->attachReviewStats(collect([$menu]))->first(),
        ], 201);
    }

    private function attachReviewStats($menus, bool $compactMedia = false)
    {
        $statsByMenu = [];
        // Total unit terjual per menu (pesanan tidak dibatalkan) untuk urutan "paling laris".
        $soldByMenu = [];
        if ($menus->isNotEmpty()) {
            $rows = \App\Models\Review::whereIn('id_menu', $menus->pluck('id_menu'))
                ->selectRaw('id_menu, COUNT(*) as cnt, AVG(rating) as avg_rating')
                ->groupBy('id_menu')
                ->get();
            foreach ($rows as $row) {
                $statsByMenu[(int) $row->id_menu] = [
                    'cnt' => (int) $row->cnt,
                    'avg' => number_format((float) $row->avg_rating, 1, '.', ''),
                ];
            }

            $soldRows = DB::table('order_details')
                ->join('orders', 'orders.id_pesanan', '=', 'order_details.id_pesanan')
                ->whereIn('order_details.id_menu', $menus->pluck('id_menu'))
                ->where('orders.status_pesanan', '!=', 'Dibatalkan')
                ->selectRaw('order_details.id_menu, SUM(order_details.jumlah) as sold')
                ->groupBy('order_details.id_menu')
                ->get();
            foreach ($soldRows as $row) {
                $soldByMenu[(int) $row->id_menu] = (int) $row->sold;
            }
        }

        return $menus->map(function (Menu $menu) use ($statsByMenu, $soldByMenu, $compactMedia) {
            $arr = $menu->toArray();
            if ($compactMedia) {
                $arr['gambar'] = MediaController::compactMediaValue(
                    'menu',
                    (int) $menu->id_menu,
                    $menu->gambar_preview ?? '',
                    $menu->gambar_len ?? 0
                );
                unset($arr['gambar_preview'], $arr['gambar_len']);
                if (isset($arr['tenant']) && is_array($arr['tenant'])) {
                    $tLogo = MediaController::compactMediaValue(
                        'tenant',
                        (int) ($arr['tenant']['id_tenant'] ?? 0),
                        $arr['tenant']['logo_preview'] ?? '',
                        $arr['tenant']['logo_len'] ?? 0
                    );
                    $arr['tenant']['logo'] = $tLogo;
                    $arr['tenant']['gambar'] = $tLogo;
                    unset($arr['tenant']['logo_preview'], $arr['tenant']['logo_len']);
                }
            }
            $st = $statsByMenu[(int) $menu->id_menu] ?? null;
            $arr['rating'] = $st ? $st['avg'] : null;
            $arr['reviews'] = $st ? $st['cnt'] : 0;
            $arr['reviews_count'] = $st ? $st['cnt'] : 0;
            $arr['sold_total'] = $soldByMenu[(int) $menu->id_menu] ?? 0;
            return $arr;
        })->values();
    }

    /**
     * Memperbarui informasi menu oleh Vendor pemilik tenant.
     */
    public function update(Request $request, int $id)
    {
        $user = $request->user();
        $menu = Menu::with('tenant')->find($id);

        if (!$menu) {
            return response()->json([
                'success' => false,
                'message' => 'Menu tidak ditemukan.',
            ], 404);
        }

        if (!$menu->tenant || ((int) $menu->tenant->id_user !== (int) $user->id_user && strtolower((string) $user->peran) !== 'administrator')) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak akses untuk mengubah menu milik tenant lain.',
            ], 403);
        }

        $validated = $request->validate([
            'id_kategori' => 'sometimes|required|integer|exists:categories,id_kategori',
            'nama_menu' => 'sometimes|required|string|max:100',
            'deskripsi' => 'nullable|string|max:1000',
            'gambar' => ['nullable', 'string', ImageValidator::rule('gambar menu')],
            'harga' => 'sometimes|required|integer|min:0|max:10000000',
            'estimasi_menit' => 'sometimes|required|integer|min:1|max:180',
            'status_tersedia' => 'sometimes|boolean',
            ...PhotoFocus::rules(),
        ]);

        if (array_key_exists('deskripsi', $validated) && $validated['deskripsi'] === null) {
            $validated['deskripsi'] = '';
        }

        if (array_key_exists('gambar', $validated)) {
            if ($validated['gambar'] === null) {
                $validated['gambar'] = $menu->gambar ?? '';
            } elseif (MediaController::isMediaEndpointRef($validated['gambar'])) {
                unset($validated['gambar']);
            }
        }

        $menu->update(PhotoFocus::merge($validated));
        $menu->load(['tenant', 'category']);

        return response()->json([
            'success' => true,
            'message' => 'Informasi menu berhasil diperbarui.',
            'data' => $menu,
        ], 200);
    }

    /**
     * Memperbarui status ketersediaan menu oleh Vendor pemilik tenant.
     */
    public function updateAvailability(Request $request, int $id)
    {
        $user = $request->user();
        $menu = Menu::with('tenant')->find($id);

        if (!$menu) {
            return response()->json([
                'success' => false,
                'message' => 'Menu tidak ditemukan.',
            ], 404);
        }

        if (!$menu->tenant || ((int) $menu->tenant->id_user !== (int) $user->id_user && strtolower((string) $user->peran) !== 'administrator')) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak akses untuk mengubah ketersediaan menu milik tenant lain.',
            ], 403);
        }

        $validated = $request->validate([
            'status_tersedia' => 'required|boolean',
        ]);

        $menu->update([
            'status_tersedia' => $validated['status_tersedia'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status ketersediaan menu berhasil diperbarui.',
            'data' => [
                'id_menu' => $menu->id_menu,
                'nama_menu' => $menu->nama_menu,
                'status_tersedia' => $menu->status_tersedia,
            ],
        ], 200);
    }

    /**
     * Menghapus menu oleh Vendor pemilik tenant dengan pemeriksaan integritas referensial.
     */
    public function destroy(Request $request, int $id)
    {
        $user = $request->user();
        $menu = Menu::with('tenant')->find($id);

        if (!$menu) {
            return response()->json([
                'success' => false,
                'message' => 'Menu tidak ditemukan.',
            ], 404);
        }

        if (!$menu->tenant || ((int) $menu->tenant->id_user !== (int) $user->id_user && strtolower((string) $user->peran) !== 'administrator')) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak akses untuk menghapus menu milik tenant lain.',
            ], 403);
        }

        if ($menu->orderDetails()->exists() || $menu->cartItems()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Menu tidak dapat dihapus karena sudah digunakan dalam keranjang atau riwayat pesanan. Silakan ubah status ketersediaan menjadi tidak tersedia.',
            ], 409);
        }

        $menu->delete();

        return response()->json([
            'success' => true,
            'message' => 'Menu berhasil dihapus.',
            'data' => null,
        ], 200);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Models\Tenant;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    /**
     * Menampilkan daftar menu untuk katalog pelanggan.
     * Secara default hanya menampilkan menu yang tersedia (status_tersedia = true),
     * serta mendukung filter id_tenant, id_kategori, status_tersedia, dan pencarian.
     */
    public function index(Request $request)
    {
        $query = Menu::with(['tenant', 'category']);

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

        return response()->json([
            'success' => true,
            'message' => 'Daftar menu berhasil diambil.',
            'data' => $menus,
        ], 200);
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
        $tenantIds = Tenant::where('id_user', $user->id_user)->pluck('id_tenant');

        $query = Menu::with(['tenant', 'category'])
            ->whereIn('id_tenant', $tenantIds);

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

        return response()->json([
            'success' => true,
            'message' => 'Daftar menu tenant berhasil diambil.',
            'data' => $menus,
        ], 200);
    }

    /**
     * Menambahkan menu baru oleh Vendor pada tenant miliknya.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'id_tenant' => 'nullable|integer|exists:tenants,id_tenant',
            'id_kategori' => 'required|integer|exists:categories,id_kategori',
            'nama_menu' => 'required|string|max:100',
            'deskripsi' => 'nullable|string',
            'gambar' => 'nullable|string|max:255',
            'harga' => 'required|integer|min:0',
            'estimasi_menit' => 'required|integer|min:1',
            'status_tersedia' => 'sometimes|boolean',
        ]);

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
            'id_kategori' => $validated['id_kategori'],
            'nama_menu' => $validated['nama_menu'],
            'deskripsi' => $validated['deskripsi'] ?? '',
            'gambar' => $validated['gambar'] ?? 'menu/default.png',
            'harga' => $validated['harga'],
            'estimasi_menit' => $validated['estimasi_menit'],
            'status_tersedia' => $validated['status_tersedia'] ?? true,
        ]);

        $menu->load(['tenant', 'category']);

        return response()->json([
            'success' => true,
            'message' => 'Menu berhasil ditambahkan.',
            'data' => $menu,
        ], 201);
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
            'deskripsi' => 'nullable|string',
            'gambar' => 'nullable|string|max:255',
            'harga' => 'sometimes|required|integer|min:0',
            'estimasi_menit' => 'sometimes|required|integer|min:1',
            'status_tersedia' => 'sometimes|boolean',
        ]);

        if (array_key_exists('deskripsi', $validated) && $validated['deskripsi'] === null) {
            $validated['deskripsi'] = '';
        }

        if (array_key_exists('gambar', $validated) && $validated['gambar'] === null) {
            $validated['gambar'] = $menu->gambar ?? 'menu/default.png';
        }

        $menu->update($validated);
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

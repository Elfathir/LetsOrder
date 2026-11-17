<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class TenantController extends Controller
{
    /**
     * Menampilkan daftar seluruh tenant.
     * Mendukung filter status_buka dan pencarian nama_tenant.
     */
    public function index(Request $request)
    {
        $query = Tenant::query();

        if ($request->has('status_buka') && $request->query('status_buka') !== '') {
            $query->where('status_buka', $request->boolean('status_buka'));
        }

        $search = $request->query('search') ?? $request->query('q');
        if ($search !== null && trim((string) $search) !== '') {
            $keyword = trim((string) $search);
            $query->where(function ($subQuery) use ($keyword) {
                $subQuery->where('nama_tenant', 'like', '%' . $keyword . '%')
                    ->orWhere('deskripsi', 'like', '%' . $keyword . '%');
            });
        }

        $tenants = $query
            ->with(['user:id_user,avatar', 'menus' => fn ($q) => $q->select('id_menu', 'id_tenant', 'gambar')])
            ->orderByDesc('status_buka')
            ->orderBy('id_tenant', 'asc')
            ->get()
            ->map(fn (Tenant $t) => $this->formatTenant($t));

        return response()->json([
            'success' => true,
            'message' => 'Daftar tenant berhasil diambil.',
            'data' => $tenants,
        ], 200);
    }

    /**
     * Menampilkan informasi detail satu tenant beserta menu yang tersedia.
     */
    public function show(Request $request, int $id)
    {
        $includeUnavailable = $request->boolean('include_unavailable', false);

        $tenant = Tenant::with([
            'menus' => function ($query) use ($includeUnavailable) {
                if (!$includeUnavailable) {
                    $query->where('status_tersedia', true);
                }
                $query->with('category')->orderBy('id_menu', 'asc');
            },
        ])->find($id);

        if (!$tenant) {
            return response()->json([
                'success' => false,
                'message' => 'Tenant tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail tenant berhasil diambil.',
            'data' => $tenant,
        ], 200);
    }

    /**
     * Menampilkan daftar menu berdasarkan tenant tertentu.
     */
    public function menus(Request $request, int $id)
    {
        $tenant = Tenant::find($id);

        if (!$tenant) {
            return response()->json([
                'success' => false,
                'message' => 'Tenant tidak ditemukan.',
            ], 404);
        }

        $query = Menu::with(['tenant', 'category'])
            ->where('id_tenant', $tenant->id_tenant);

        if ($request->filled('id_kategori')) {
            $query->where('id_kategori', (int) $request->query('id_kategori'));
        }

        if ($request->has('status_tersedia') && $request->query('status_tersedia') !== '') {
            $query->where('status_tersedia', $request->boolean('status_tersedia'));
        } elseif (!$request->boolean('include_unavailable', false)) {
            $query->where('status_tersedia', true);
        }

        $menus = $query->orderBy('id_menu', 'asc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar menu tenant berhasil diambil.',
            'data' => $menus,
            'tenant' => $tenant,
        ], 200);
    }

    /**
     * Menampilkan informasi tenant milik Vendor yang sedang login.
     */
    public function vendorTenant(Request $request)
    {
        $user = $request->user();

        $tenant = Tenant::with(['menus.category'])
            ->where('id_user', $user->id_user)
            ->first();

        if (!$tenant) {
            return response()->json([
                'success' => false,
                'message' => 'Data tenant untuk akun Vendor ini belum ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Informasi tenant berhasil diambil.',
            'data' => $this->formatTenant($tenant),
        ], 200);
    }

    /**
     * Memperbarui informasi tenant milik Vendor yang sedang login.
     */
    public function updateVendorTenant(Request $request)
    {
        $user = $request->user();

        $tenant = Tenant::where('id_user', $user->id_user)->first();

        if (!$tenant) {
            return response()->json([
                'success' => false,
                'message' => 'Data tenant untuk akun Vendor ini belum ditemukan.',
            ], 404);
        }

        return $this->performTenantUpdate($request, $tenant);
    }

    /**
     * Memperbarui informasi tenant berdasarkan id_tenant (Vendor pemilik atau Administrator).
     */
    public function update(Request $request, int $id)
    {
        $user = $request->user();
        $tenant = Tenant::find($id);

        if (!$tenant) {
            return response()->json([
                'success' => false,
                'message' => 'Tenant tidak ditemukan.',
            ], 404);
        }

        $isAdmin = strtolower((string) $user->peran) === 'administrator';
        $isOwner = (int) $tenant->id_user === (int) $user->id_user;

        if (!$isOwner && !$isAdmin) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak akses untuk memperbarui tenant ini.',
            ], 403);
        }

        return $this->performTenantUpdate($request, $tenant);
    }

    /**
     * Helper validasi dan pembaruan atribut tenant sesuai ERD.
     */
    private function performTenantUpdate(Request $request, Tenant $tenant)
    {
        if ($request->has('gambar') && !$request->has('logo')) {
            $request->merge(['logo' => $request->input('gambar')]);
        }

        $validated = $request->validate([
            'nama_tenant' => 'sometimes|required|string|max:100',
            'deskripsi' => 'nullable|string',
            'logo' => 'nullable|string',
            'status_buka' => 'sometimes|boolean',
            'jam_buka' => 'nullable|string|max:10',
            'jam_tutup' => 'nullable|string|max:10',
            'auto_schedule' => 'sometimes|boolean',
        ]);

        if (array_key_exists('deskripsi', $validated) && $validated['deskripsi'] === null) {
            $validated['deskripsi'] = '';
        }

        if (array_key_exists('logo', $validated) && $validated['logo'] === null) {
            $validated['logo'] = $tenant->logo ?? '';
        }

        if (!Schema::hasColumn('tenants', 'jam_buka')) {
            unset($validated['jam_buka'], $validated['jam_tutup'], $validated['auto_schedule']);
        }

        $tenant->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Informasi tenant berhasil diperbarui.',
            'data' => $this->formatTenant($tenant->fresh()),
        ], 200);
    }

    private function formatTenant(Tenant $tenant): array
    {
        $rawLogo = $tenant->logo && $tenant->logo !== 'tenant/default.png' ? $tenant->logo : '';
        $userAvatar = $tenant->relationLoaded('user') ? ($tenant->user?->avatar ?? '') : '';
        $menuImg = $tenant->relationLoaded('menus')
            ? ($tenant->menus->first(fn ($m) => !empty($m->gambar) && $m->gambar !== 'menu/default.png')?->gambar ?? '')
            : '';
        $effectiveImage = $rawLogo ?: ($userAvatar ?: $menuImg);

        $reviewsCount = 0;
        $avgRating = null;
        if (Schema::hasTable('reviews')) {
            $stats = \App\Models\Review::where('id_tenant', $tenant->id_tenant)
                ->selectRaw('COUNT(*) as cnt, AVG(rating) as avg_rating')
                ->first();
            $reviewsCount = (int) ($stats->cnt ?? 0);
            if ($reviewsCount > 0) {
                $avgRating = number_format((float) $stats->avg_rating, 1, '.', '');
            }
        }

        return [
            'id_tenant' => $tenant->id_tenant,
            'id_user' => $tenant->id_user,
            'nama_tenant' => $tenant->nama_tenant,
            'deskripsi' => $tenant->deskripsi,
            'logo' => $rawLogo ?: $effectiveImage,
            'gambar' => $effectiveImage,
            'status_buka' => (bool) $tenant->status_buka,
            'jam_buka' => $tenant->jam_buka ?? '07:00',
            'jam_tutup' => $tenant->jam_tutup ?? '21:00',
            'auto_schedule' => (bool) ($tenant->auto_schedule ?? false),
            'status_buka_efektif' => $tenant->isCurrentlyOpen(),
            'rating' => $avgRating,
            'reviews_count' => $reviewsCount,
        ];
    }
}


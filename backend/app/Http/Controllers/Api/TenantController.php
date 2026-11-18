<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Models\Tenant;
use App\Support\ImageValidator;
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
        $compact = $request->boolean('compact_media', false);
        $tenants = $this->indexData($request, $compact);

        return response()->json([
            'success' => true,
            'message' => 'Daftar tenant berhasil diambil.',
            'data' => $tenants,
        ], 200);
    }

    public function indexData(Request $request, bool $compact = false): \Illuminate\Support\Collection
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

        $includeUnconfigured = $request->boolean('include_unconfigured', false);

        if ($compact) {
            $cols = [
                'id_tenant',
                'id_user',
                'nama_tenant',
                'deskripsi',
                'status_buka',
                'jam_buka',
                'jam_tutup',
                'auto_schedule',
            ];
            $query->select($cols)->selectRaw(MediaController::previewSql('logo', 'logo', false));
            $query->with([
                'user' => fn ($q) => $q->select('id_user')->selectRaw(MediaController::previewSql('avatar', 'avatar', false)),
                'menus' => fn ($q) => $q->select('id_menu', 'id_tenant')->selectRaw(MediaController::previewSql('gambar', 'gambar', true)),
            ]);
        } else {
            $query->with([
                'user:id_user,avatar',
                'menus' => fn ($q) => $q->select('id_menu', 'id_tenant', 'gambar'),
            ]);
        }

        $tenantCollection = $query
            ->orderByDesc('status_buka')
            ->orderBy('id_tenant', 'asc')
            ->get()
            ->filter(fn (Tenant $t) => $includeUnconfigured || self::isTenantConfigured($t))
            ->values();

        // Pre-aggregate review stats in a single query instead of querying per tenant
        $reviewStatsByTenant = [];
        if ($tenantCollection->isNotEmpty()) {
            $tenantIds = $tenantCollection->pluck('id_tenant')->all();
            $rows = \App\Models\Review::whereIn('id_tenant', $tenantIds)
                ->selectRaw('id_tenant, COUNT(*) as cnt, AVG(rating) as avg_rating')
                ->groupBy('id_tenant')
                ->get();
            foreach ($rows as $row) {
                $reviewStatsByTenant[(int) $row->id_tenant] = [
                    'cnt' => (int) $row->cnt,
                    'avg' => (float) $row->avg_rating,
                ];
            }
        }

        return $tenantCollection
            ->map(fn (Tenant $t) => $this->formatTenant($t, $reviewStatsByTenant, $compact))
            ->values();
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
        $compact = $request->boolean('compact_media', false);
        $data = $this->vendorTenantData((int) $user->id_user, $compact);

        if (!$data) {
            return response()->json([
                'success' => false,
                'message' => 'Data tenant untuk akun Vendor ini belum ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Informasi tenant berhasil diambil.',
            'data' => $data,
        ], 200);
    }

    public function vendorTenantData(int $userId, bool $compact = false): ?array
    {
        $query = Tenant::where('id_user', $userId);
        if ($compact) {
            $cols = [
                'id_tenant',
                'id_user',
                'nama_tenant',
                'deskripsi',
                'status_buka',
                'jam_buka',
                'jam_tutup',
                'auto_schedule',
            ];
            $query->select($cols)->selectRaw(MediaController::previewSql('logo', 'logo', false));
            $query->with([
                'user' => fn ($q) => $q->select('id_user')->selectRaw(MediaController::previewSql('avatar', 'avatar', false)),
                'menus' => fn ($q) => $q->select('id_menu', 'id_tenant')->selectRaw(MediaController::previewSql('gambar', 'gambar', true)),
            ]);
        } else {
            $query->with(['user:id_user,avatar', 'menus.category']);
        }

        $tenant = $query->first();
        if (!$tenant) {
            return null;
        }

        return $this->formatTenant($tenant, null, $compact);
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
            'deskripsi' => 'nullable|string|max:1000',
            'logo' => ['nullable', 'string', ImageValidator::rule('logo tenant')],
            'status_buka' => 'sometimes|boolean',
            'jam_buka' => 'nullable|string|max:10',
            'jam_tutup' => 'nullable|string|max:10',
            'auto_schedule' => 'sometimes|boolean',
        ]);

        if (array_key_exists('deskripsi', $validated) && $validated['deskripsi'] === null) {
            $validated['deskripsi'] = '';
        }

        if (array_key_exists('logo', $validated)) {
            if ($validated['logo'] === null) {
                $validated['logo'] = $tenant->logo ?? '';
            } elseif (MediaController::isMediaEndpointRef($validated['logo'])) {
                unset($validated['logo']);
            }
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

    public static function isTenantConfigured(Tenant $tenant): bool
    {
        $defaultDescriptions = ['', 'tenant kantin kampus upnvj', 'tenant kantin kampus', 'campus canteen tenant'];
        $desc = strtolower(trim((string) ($tenant->deskripsi ?? '')));
        $hasCustomDesc = !in_array($desc, $defaultDescriptions, true);
        $rawLogoVal = (string) ($tenant->logo_preview ?? $tenant->logo ?? '');
        $hasLogo = $rawLogoVal !== '' && $rawLogoVal !== 'tenant/default.png';
        $hasMenus = $tenant->relationLoaded('menus')
            ? $tenant->menus->isNotEmpty()
            : Menu::where('id_tenant', $tenant->id_tenant)->exists();

        return $hasCustomDesc || $hasLogo || $hasMenus;
    }

    private function formatTenant(Tenant $tenant, ?array $reviewStatsByTenant = null, bool $compactMedia = false): array
    {
        $defaultDescriptions = ['', 'tenant kantin kampus upnvj', 'tenant kantin kampus', 'campus canteen tenant'];
        $rawDesc = trim((string) ($tenant->deskripsi ?? ''));
        $cleanDesc = in_array(strtolower($rawDesc), $defaultDescriptions, true) ? '' : $rawDesc;

        if ($compactMedia) {
            $logoPreview = trim((string) ($tenant->logo_preview ?? $tenant->logo ?? ''));
            $rawLogo = ($logoPreview !== '' && $logoPreview !== 'tenant/default.png')
                ? MediaController::compactMediaValue('tenant', (int) $tenant->id_tenant, $logoPreview, $tenant->logo_len ?? strlen($logoPreview))
                : '';

            $userAvatarRaw = $tenant->relationLoaded('user') ? trim((string) ($tenant->user?->avatar_preview ?? $tenant->user?->avatar ?? '')) : '';
            $userAvatar = $userAvatarRaw !== ''
                ? MediaController::compactMediaValue('tenant', (int) $tenant->id_tenant, $userAvatarRaw, $tenant->user?->avatar_len ?? strlen($userAvatarRaw))
                : '';

            $firstMenu = $tenant->relationLoaded('menus')
                ? $tenant->menus->first(fn ($m) => !empty($m->gambar_preview ?? $m->gambar) && ($m->gambar_preview ?? $m->gambar) !== 'menu/default.png')
                : null;
            $menuImgRaw = $firstMenu ? trim((string) ($firstMenu->gambar_preview ?? $firstMenu->gambar ?? '')) : '';
            $menuImg = $menuImgRaw !== ''
                ? MediaController::compactMediaValue('tenant', (int) $tenant->id_tenant, $menuImgRaw, $firstMenu->gambar_len ?? strlen($menuImgRaw))
                : '';
            $effectiveImage = $rawLogo ?: ($userAvatar ?: $menuImg);
        } else {
            $rawLogo = $tenant->logo && $tenant->logo !== 'tenant/default.png' ? $tenant->logo : '';
            $userAvatar = $tenant->relationLoaded('user') ? ($tenant->user?->avatar ?? '') : '';
            $menuImg = $tenant->relationLoaded('menus')
                ? ($tenant->menus->first(fn ($m) => !empty($m->gambar) && $m->gambar !== 'menu/default.png')?->gambar ?? '')
                : '';
            $effectiveImage = $rawLogo ?: ($userAvatar ?: $menuImg);
        }

        $reviewsCount = 0;
        $avgRating = null;
        if ($reviewStatsByTenant !== null) {
            $stat = $reviewStatsByTenant[(int) $tenant->id_tenant] ?? null;
        
            if ($stat && $stat['cnt'] > 0) {
                $reviewsCount = (int) $stat['cnt'];
                $avgRating = number_format((float) $stat['avg'], 1, '.', '');
            }
        } else {
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
            'deskripsi' => $cleanDesc,
            'logo' => $rawLogo ?: $effectiveImage,
            'gambar' => $effectiveImage,
            'is_configured' => self::isTenantConfigured($tenant),
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


<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
    public const VALID_ROLES = [
        'Customer',
        'Vendor',
        'Administrator',
    ];

    /**
     * Menampilkan daftar seluruh pengguna untuk Administrator.
     */
    public function users(Request $request)
    {
        $query = User::with('tenants');

        if ($request->filled('peran')) {
            $query->where('peran', $request->query('peran'));
        }

        $search = $request->query('search') ?? $request->query('q');
        if ($search !== null && trim((string) $search) !== '') {
            $keyword = trim((string) $search);
            $query->where(function ($subQuery) use ($keyword) {
                $subQuery->where('username', 'like', '%' . $keyword . '%')
                    ->orWhere('nama', 'like', '%' . $keyword . '%')
                    ->orWhere('email', 'like', '%' . $keyword . '%');
            });
        }

        $users = $query->orderBy('id_user', 'asc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Data pengguna berhasil diambil.',
            'data' => $users,
        ], 200);
    }

    /**
     * Menampilkan detail satu pengguna untuk Administrator.
     */
    public function showUser(int $id)
    {
        $user = User::with('tenants')->find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Pengguna tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail pengguna berhasil diambil.',
            'data' => $user,
        ], 200);
    }

    /**
     * Memperbarui informasi dan peran pengguna oleh Administrator.
     */
    public function updateUser(Request $request, int $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Pengguna tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'username' => [
                'sometimes',
                'required',
                'string',
                'max:50',
                Rule::unique('users', 'username')->ignore($user->id_user, 'id_user'),
            ],
            'nama' => 'sometimes|required|string|max:100',
            'email' => [
                'sometimes',
                'required',
                'email',
                'max:100',
                Rule::unique('users', 'email')->ignore($user->id_user, 'id_user'),
            ],
            'peran' => ['sometimes', 'required', 'string', Rule::in(self::VALID_ROLES)],
            'password' => 'nullable|string|min:8',
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Informasi pengguna berhasil diperbarui.',
            'data' => $user->fresh('tenants'),
        ], 200);
    }

    /**
     * Menampilkan daftar seluruh tenant untuk Administrator.
     */
    public function tenants(Request $request)
    {
        $query = Tenant::with(['user', 'menus']);

        if ($request->has('status_buka') && $request->query('status_buka') !== '') {
            $query->where('status_buka', $request->boolean('status_buka'));
        }

        $tenants = $query->orderBy('id_tenant', 'asc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar tenant berhasil diambil.',
            'data' => $tenants,
        ], 200);
    }

    /**
     * Membuat data tenant baru oleh Administrator.
     */
    public function storeTenant(Request $request)
    {
        $validated = $request->validate([
            'id_user' => 'required|integer|exists:users,id_user',
            'nama_tenant' => 'required|string|max:100',
            'deskripsi' => 'nullable|string',
            'logo' => 'nullable|string|max:255',
            'status_buka' => 'sometimes|boolean',
        ]);

        $tenant = Tenant::create([
            'id_user' => $validated['id_user'],
            'nama_tenant' => $validated['nama_tenant'],
            'deskripsi' => $validated['deskripsi'] ?? '',
            'logo' => $validated['logo'] ?? 'tenant/default.png',
            'status_buka' => $validated['status_buka'] ?? true,
        ]);

        $tenant->load('user');

        return response()->json([
            'success' => true,
            'message' => 'Data tenant berhasil dibuat.',
            'data' => $tenant,
        ], 201);
    }

    /**
     * Menampilkan detail tenant untuk Administrator.
     */
    public function showTenant(int $id)
    {
        $tenant = Tenant::with(['user', 'menus.category'])->find($id);

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
     * Memperbarui informasi tenant oleh Administrator.
     */
    public function updateTenant(Request $request, int $id)
    {
        $tenant = Tenant::find($id);

        if (!$tenant) {
            return response()->json([
                'success' => false,
                'message' => 'Tenant tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'id_user' => 'sometimes|required|integer|exists:users,id_user',
            'nama_tenant' => 'sometimes|required|string|max:100',
            'deskripsi' => 'nullable|string',
            'logo' => 'nullable|string|max:255',
            'status_buka' => 'sometimes|boolean',
        ]);

        if (array_key_exists('deskripsi', $validated) && $validated['deskripsi'] === null) {
            $validated['deskripsi'] = '';
        }

        if (array_key_exists('logo', $validated) && $validated['logo'] === null) {
            $validated['logo'] = $tenant->logo ?? 'tenant/default.png';
        }

        $tenant->update($validated);
        $tenant->load('user');

        return response()->json([
            'success' => true,
            'message' => 'Informasi tenant berhasil diperbarui.',
            'data' => $tenant,
        ], 200);
    }

    /**
     * Menghapus data tenant oleh Administrator dengan pemeriksaan integritas referensial.
     */
    public function destroyTenant(int $id)
    {
        $tenant = Tenant::find($id);

        if (!$tenant) {
            return response()->json([
                'success' => false,
                'message' => 'Tenant tidak ditemukan.',
            ], 404);
        }

        if ($tenant->menus()->exists() || $tenant->orders()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Tenant tidak dapat dihapus karena masih memiliki data menu atau pesanan terkait.',
            ], 409);
        }

        $tenant->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data tenant berhasil dihapus.',
            'data' => null,
        ], 200);
    }
}


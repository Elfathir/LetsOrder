<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Promo;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;

class PromoController extends Controller
{
    public function index(Request $request)
    {
        if (!Schema::hasTable('promos')) {
            return response()->json(['success' => true, 'data' => []], 200);
        }

        $query = Promo::where('aktif', true);
        if ($request->filled('id_tenant')) {
            $idTenant = (int) $request->query('id_tenant');
            $query->where(function ($q) use ($idTenant) {
                $q->whereNull('id_tenant')->orWhere('id_tenant', $idTenant);
            });
        }

        return response()->json([
            'success' => true,
            'data' => $query->orderByDesc('id_promo')->get(),
        ], 200);
    }

    public function vendorIndex(Request $request)
    {
        if (!Schema::hasTable('promos')) {
            return response()->json(['success' => true, 'data' => []], 200);
        }

        $user = $request->user();
        $tenant = Tenant::where('id_user', $user->id_user)->first();
        if (!$tenant) {
            return response()->json(['success' => true, 'data' => []], 200);
        }

        $promos = Promo::where('id_tenant', $tenant->id_tenant)
            ->orderByDesc('id_promo')
            ->get();

        return response()->json(['success' => true, 'data' => $promos], 200);
    }

    public function store(Request $request)
    {
        if (!Schema::hasTable('promos')) {
            return response()->json([
                'success' => false,
                'message' => 'Tabel promo belum tersedia. Jalankan php artisan migrate terlebih dahulu.',
            ], 503);
        }

        $user = $request->user();
        $tenant = Tenant::where('id_user', $user->id_user)->first();
        if (!$tenant) {
            return response()->json([
                'success' => false,
                'message' => 'Data tenant tidak ditemukan.',
            ], 404);
        }

        $rawCode = strtoupper(preg_replace('/[^A-Za-z0-9_-]/', '', (string) $request->input('kode_promo', '')));
        $request->merge(['kode_promo' => $rawCode]);

        $validated = $request->validate([
            'kode_promo' => ['required', 'string', 'max:32', Rule::unique('promos', 'kode_promo')],
            'judul' => 'required|string|max:120',
            'tipe' => ['required', 'string', Rule::in(['fixed', 'percentage'])],
            'diskon' => 'required|integer|min:1',
            'minimal_belanja' => 'nullable|integer|min:0',
            'aktif' => 'sometimes|boolean',
        ]);

        if (in_array($validated['kode_promo'], ['COMBO3K', 'STUDENT10', 'HEMAT5K', 'EARLYBIRD'], true)) {
            return response()->json([
                'success' => false,
                'message' => "Kode promo '{$validated['kode_promo']}' sudah digunakan sebagai promo sistem.",
            ], 422);
        }

        if ($validated['tipe'] === 'percentage' && $validated['diskon'] > 90) {
            return response()->json([
                'success' => false,
                'message' => 'Diskon persentase maksimal 90%.',
            ], 422);
        }

        $promo = Promo::create([
            'id_tenant' => $tenant->id_tenant,
            'kode_promo' => $validated['kode_promo'],
            'judul' => $validated['judul'],
            'tipe' => $validated['tipe'],
            'diskon' => (int) $validated['diskon'],
            'minimal_belanja' => (int) ($validated['minimal_belanja'] ?? 0),
            'aktif' => $validated['aktif'] ?? true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Promo khusus tenant berhasil dibuat.',
            'data' => $promo,
        ], 201);
    }

    public function update(Request $request, int $id)
    {
        if (!Schema::hasTable('promos')) {
            return response()->json(['success' => false, 'message' => 'Tabel promo belum ada.'], 503);
        }

        $promo = Promo::find($id);
        if (!$promo) {
            return response()->json(['success' => false, 'message' => 'Promo tidak ditemukan.'], 404);
        }

        $user = $request->user();
        $tenant = Tenant::where('id_user', $user->id_user)->first();
        $isAdmin = strtolower((string) $user->peran) === 'administrator';
        if (!$isAdmin && (!$tenant || (int) $promo->id_tenant !== (int) $tenant->id_tenant)) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak.'], 403);
        }

        $validated = $request->validate([
            'aktif' => 'sometimes|boolean',
            'judul' => 'sometimes|required|string|max:120',
            'minimal_belanja' => 'sometimes|integer|min:0',
        ]);

        $promo->update($validated);
        return response()->json(['success' => true, 'data' => $promo], 200);
    }

    public function destroy(Request $request, int $id)
    {
        if (!Schema::hasTable('promos')) {
            return response()->json(['success' => false, 'message' => 'Tabel promo belum ada.'], 503);
        }

        $promo = Promo::find($id);
        if (!$promo) {
            return response()->json(['success' => false, 'message' => 'Promo tidak ditemukan.'], 404);
        }

        $user = $request->user();
        $tenant = Tenant::where('id_user', $user->id_user)->first();
        $isAdmin = strtolower((string) $user->peran) === 'administrator';
        if (!$isAdmin && (!$tenant || (int) $promo->id_tenant !== (int) $tenant->id_tenant)) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak.'], 403);
        }

        $promo->delete();
        return response()->json(['success' => true, 'message' => 'Promo berhasil dihapus.'], 200);
    }
}

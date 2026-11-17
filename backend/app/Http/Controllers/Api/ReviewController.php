<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Order;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        if (!Schema::hasTable('reviews')) {
            return response()->json(['success' => true, 'data' => []], 200);
        }

        $query = Review::with([
            'user:id_user,username,nama',
            'menu:id_menu,nama_menu',
            'order:id_pesanan,nomor_antrean',
        ]);

        if ($request->filled('id_menu')) {
            $query->where('id_menu', (int) $request->query('id_menu'));
        }
        if ($request->filled('id_tenant')) {
            $query->where('id_tenant', (int) $request->query('id_tenant'));
        }
        if ($request->filled('id_pesanan')) {
            $query->where('id_pesanan', (int) $request->query('id_pesanan'));
        }

        $rows = $query->orderByDesc('id_review')->get()->map(fn (Review $r) => [
            'id_review' => $r->id_review,
            'id_pesanan' => $r->id_pesanan,
            'nomor_antrean' => $r->order?->nomor_antrean,
            'id_user' => $r->id_user,
            'id_tenant' => $r->id_tenant,
            'id_menu' => $r->id_menu,
            'nama_menu' => $r->menu?->nama_menu ?? 'Menu',
            'reviewer_name' => $r->user?->nama ?? $r->user?->username ?? 'Pelanggan',
            'rating' => (int) $r->rating,
            'komentar' => $r->komentar ?? '',
            'dibuat_pada' => $r->dibuat_pada?->format('Y-m-d H:i:s'),
        ]);

        return response()->json([
            'success' => true,
            'data' => $rows,
        ], 200);
    }

    public function storeForOrder(Request $request, int $id)
    {
        if (!Schema::hasTable('reviews')) {
            return response()->json([
                'success' => false,
                'message' => 'Tabel ulasan belum dibuat. Jalankan php artisan migrate terlebih dahulu.',
            ], 503);
        }

        $user = $request->user();
        $order = Order::with(['tenant', 'orderDetails.menu'])->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak ditemukan.',
            ], 404);
        }

        if ((int) $order->id_user !== (int) $user->id_user) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak akses untuk mengulas pesanan ini.',
            ], 403);
        }

        if ($order->status_pesanan !== 'Selesai') {
            return response()->json([
                'success' => false,
                'message' => 'Rating dan ulasan hanya dapat diberikan setelah pesanan selesai.',
            ], 422);
        }

        if (Review::where('id_pesanan', $order->id_pesanan)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan ini sudah pernah diberi ulasan.',
            ], 409);
        }

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'komentar' => 'nullable|string|max:500',
            'id_menu' => 'nullable|integer|exists:menus,id_menu',
        ]);

        $menuIds = !empty($validated['id_menu'])
            ? [(int) $validated['id_menu']]
            : $order->orderDetails->pluck('id_menu')->unique()->values()->all();

        $now = now();
        $created = DB::transaction(function () use ($user, $order, $validated, $menuIds, $now) {
            $rows = [];
            foreach ($menuIds as $menuId) {
                $rows[] = Review::create([
                    'id_pesanan' => $order->id_pesanan,
                    'id_user' => $user->id_user,
                    'id_tenant' => $order->id_tenant,
                    'id_menu' => $menuId,
                    'rating' => (int) $validated['rating'],
                    'komentar' => trim((string) ($validated['komentar'] ?? '')),
                    'dibuat_pada' => $now,
                ]);
            }

            if ($order->tenant && $order->tenant->id_user) {
                Notification::create([
                    'id_user' => $order->tenant->id_user,
                    'id_pesanan' => $order->id_pesanan,
                    'pesan' => "{$user->nama} memberi rating {$validated['rating']}/5 untuk pesanan {$order->nomor_antrean}.",
                    'status_baca' => false,
                ]);
            }

            return $rows;
        });

        return response()->json([
            'success' => true,
            'message' => 'Terima kasih atas rating & ulasan Anda.',
            'data' => $created,
        ], 201);
    }
}

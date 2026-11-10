<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Menampilkan daftar notifikasi milik pengguna yang sedang login.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Notification::with('order.tenant')
            ->where('id_user', $user->id_user);

        if ($request->has('status_baca') && $request->query('status_baca') !== '') {
            $query->where('status_baca', $request->boolean('status_baca'));
        }

        $notifications = $query->orderByDesc('id_notifikasi')->get();

        return response()->json([
            'success' => true,
            'message' => 'Notifikasi berhasil diambil.',
            'data' => $notifications,
        ], 200);
    }

    /**
     * Memperbarui status baca pada satu notifikasi milik pengguna yang sedang login.
     */
    public function markAsRead(Request $request, int $id)
    {
        $user = $request->user();

        $notification = Notification::find($id);

        if (!$notification) {
            return response()->json([
                'success' => false,
                'message' => 'Notifikasi tidak ditemukan.',
            ], 404);
        }

        if ((int) $notification->id_user !== (int) $user->id_user) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak akses untuk mengubah notifikasi milik pengguna lain.',
            ], 403);
        }

        $statusBaca = $request->has('status_baca')
            ? $request->boolean('status_baca')
            : true;

        $notification->update([
            'status_baca' => $statusBaca,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status baca notifikasi berhasil diperbarui.',
            'data' => $notification,
        ], 200);
    }

    /**
     * Menandai seluruh notifikasi pengguna yang sedang login sebagai sudah dibaca.
     */
    public function markAllAsRead(Request $request)
    {
        $user = $request->user();

        Notification::where('id_user', $user->id_user)
            ->where('status_baca', false)
            ->update(['status_baca' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Seluruh notifikasi berhasil ditandai sudah dibaca.',
            'data' => null,
        ], 200);
    }
}


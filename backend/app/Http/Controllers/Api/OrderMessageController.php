<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Order;
use App\Models\OrderMessage;
use App\Support\ImageValidator;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class OrderMessageController extends Controller
{
    public const PAID_STATUSES = ['Sedang Diproses', 'Diproses', 'Siap Diambil', 'Selesai'];

    /**
     * Pastikan tabel order_messages tersedia meskipun php artisan migrate belum dijalankan manual.
     */
    public static function ensureTableExists(): void
    {
        try {
            if (!Schema::hasTable('order_messages')) {
                Schema::create('order_messages', function (Blueprint $table) {
                    $table->increments('id_pesan');
                    $table->unsignedInteger('id_pesanan');
                    $table->unsignedInteger('id_pengirim');
                    $table->string('peran_pengirim', 20);
                    $table->string('nama_pengirim', 120);
                    $table->text('teks')->nullable();
                    $table->longText('gambar')->nullable();
                    $table->dateTime('waktu');
                    $table->index('id_pesanan');
                });
            }
        } catch (\Throwable $e) {
            Log::warning('order_messages.auto_create_failed', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Chat hanya terbuka setelah pembayaran terverifikasi
     * (atau pesanan sudah masuk tahap proses oleh tenant).
     */
    public static function isOrderPaid(Order $order): bool
    {
        if (in_array($order->status_pesanan, self::PAID_STATUSES, true)) {
            return true;
        }

        $latestPayment = $order->relationLoaded('payments')
            ? $order->payments->sortByDesc('id_pembayaran')->first()
            : $order->payments()->orderByDesc('id_pembayaran')->first();

        return $latestPayment && $latestPayment->status_verifikasi === 'Terverifikasi';
    }

    public function index(Request $request, int $id)
    {
        self::ensureTableExists();
        [$order, $access, $error] = $this->resolveOrder($request, $id);
        if ($error) {
            return $error;
        }

        $messages = OrderMessage::where('id_pesanan', $order->id_pesanan)
            ->orderBy('id_pesan')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Chat pesanan berhasil diambil.',
            'data' => [
                'order' => [
                    'id_pesanan' => $order->id_pesanan,
                    'nomor_antrean' => $order->nomor_antrean,
                    'status_pesanan' => $order->status_pesanan,
                    'is_paid' => true,
                    'tenant_name' => $order->tenant?->nama_tenant ?? 'Kantin',
                    'customer_name' => $order->user?->nama ?: ($order->user?->username ?: 'Pembeli'),
                ],
                'messages' => $messages,
            ],
        ], 200);
    }

    public function store(Request $request, int $id)
    {
        self::ensureTableExists();
        [$order, $access, $error] = $this->resolveOrder($request, $id);
        if ($error) {
            return $error;
        }

        $user = $request->user();
        $teks = trim((string) ($request->input('teks') ?? $request->input('message') ?? ''));
        $gambarInput = $request->input('gambar');
        $gambar = is_string($gambarInput) ? trim($gambarInput) : '';

        if ($teks === '' && $gambar === '') {
            return response()->json([
                'success' => false,
                'message' => 'Pesan teks atau gambar wajib diisi.',
            ], 422);
        }

        if (mb_strlen($teks) > 1000) {
            return response()->json([
                'success' => false,
                'message' => 'Pesan teks maksimal 1000 karakter.',
            ], 422);
        }

        if ($gambar !== '' && !ImageValidator::isSafe($gambar)) {
            return response()->json([
                'success' => false,
                'message' => 'Format gambar tidak diizinkan (gunakan JPG, PNG, WEBP, atau GIF, maks. 5 MB).',
            ], 422);
        }

        $isAdmin = $access['is_admin'];
        $isCustomerOwner = $access['is_customer_owner'];
        $isVendorOwner = $access['is_vendor_owner'];

        $actingAsVendor = $isVendorOwner
            && (strtolower((string) $user->peran) === 'vendor' || !$isCustomerOwner);
        $senderRole = $actingAsVendor
            ? 'Vendor'
            : ($isAdmin && !$isCustomerOwner ? 'Administrator' : 'Customer');
        $senderName = $actingAsVendor
            ? ($order->tenant?->nama_tenant ?: ($user->nama ?: ($user->username ?: 'Tenant')))
            : ($user->nama ?: ($user->username ?: 'Pembeli'));

        $preview = $teks !== '' ? Str::limit($teks, 60, '...') : '[Mengirim gambar]';
        $notifText = "Chat baru dari {$senderName} ({$order->nomor_antrean}): {$preview}";

        $message = DB::transaction(function () use (
            $order, $user, $senderRole, $senderName, $teks, $gambar, $actingAsVendor, $notifText
        ) {
            $message = OrderMessage::create([
                'id_pesanan' => $order->id_pesanan,
                'id_pengirim' => $user->id_user,
                'peran_pengirim' => $senderRole,
                'nama_pengirim' => $senderName,
                'teks' => $teks,
                'gambar' => $gambar,
                'waktu' => now(),
            ]);

            $recipientId = $actingAsVendor
                ? $order->id_user
                : $order->tenant?->id_user;

            if ($recipientId && (int) $recipientId !== (int) $user->id_user) {
                Notification::create([
                    'id_user' => $recipientId,
                    'id_pesanan' => $order->id_pesanan,
                    'pesan' => $notifText,
                    'status_baca' => false,
                ]);
            }

            return $message;
        });

        return response()->json([
            'success' => true,
            'message' => 'Pesan chat berhasil dikirim.',
            'data' => $message->fresh(),
        ], 201);
    }

    /**
     * @return array{0: ?Order, 1: array, 2: ?\Illuminate\Http\JsonResponse}
     */
    private function resolveOrder(Request $request, int $id): array
    {
        $user = $request->user();
        $order = Order::with(['tenant', 'user', 'payments'])->find($id);

        if (!$order) {
            return [null, [], response()->json([
                'success' => false,
                'message' => 'Pesanan tidak ditemukan.',
            ], 404)];
        }

        $access = [
            'is_admin' => strtolower((string) $user->peran) === 'administrator',
            'is_customer_owner' => (int) $order->id_user === (int) $user->id_user,
            'is_vendor_owner' => $order->tenant && (int) $order->tenant->id_user === (int) $user->id_user,
        ];

        if (!$access['is_admin'] && !$access['is_customer_owner'] && !$access['is_vendor_owner']) {
            Log::warning('security_event.access_denied_order_chat', [
                'user_id' => $user->id_user,
                'id_pesanan' => $order->id_pesanan,
                'ip' => $request->ip(),
            ]);

            return [null, $access, response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak akses ke chat pesanan ini.',
            ], 403)];
        }

        if (!self::isOrderPaid($order)) {
            return [null, $access, response()->json([
                'success' => false,
                'message' => 'Fitur chat hanya tersedia setelah pesanan dibayar dan terverifikasi.',
            ], 422)];
        }

        return [$order, $access, null];
    }
}

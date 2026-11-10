<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Order;
use App\Models\Payment;
use App\Models\StatusHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class PaymentController extends Controller
{
    public const ALLOWED_METHODS = [
        'QRIS',
        'Dompet Digital',
        'E-Wallet',
        'GoPay',
        'OVO',
        'DANA',
        'ShopeePay',
    ];

    public const ALLOWED_VERIFICATION_STATUSES = [
        'Menunggu',
        'Terverifikasi',
        'Gagal',
        'Kedaluwarsa',
    ];

    /**
     * Membuat data pembayaran simulasi (QRIS atau Dompet Digital) untuk suatu pesanan.
     */
    public function store(Request $request, int $id)
    {
        $user = $request->user();
        $order = Order::with(['tenant', 'payments'])->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak ditemukan.',
            ], 404);
        }

        if ((int) $order->id_user !== (int) $user->id_user && strtolower((string) $user->peran) !== 'administrator') {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak akses untuk membuat pembayaran pada pesanan pengguna lain.',
            ], 403);
        }

        if (in_array($order->status_pesanan, ['Dibatalkan', 'Selesai'], true)) {
            return response()->json([
                'success' => false,
                'message' => "Tidak dapat membuat pembayaran untuk pesanan dengan status '{$order->status_pesanan}'.",
            ], 422);
        }

        $validated = $request->validate([
            'metode_pembayaran' => ['required', 'string', Rule::in(self::ALLOWED_METHODS)],
        ]);

        $verifiedPayment = $order->payments
            ->where('status_verifikasi', 'Terverifikasi')
            ->first();

        if ($verifiedPayment) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan ini sudah memiliki pembayaran yang terverifikasi.',
            ], 409);
        }

        $method = $validated['metode_pembayaran'];
        $prefix = strtoupper($method) === 'QRIS' ? 'QRIS-SIMULASI' : 'WALLET-SIMULASI';
        $kodeSimulasi = sprintf('%s-%03d', $prefix, $order->id_pesanan);
        $batasWaktu = now()->addMinutes(15);

        $existingPending = $order->payments
            ->where('status_verifikasi', 'Menunggu')
            ->sortByDesc('id_pembayaran')
            ->first();

        if ($existingPending) {
            $existingPending->update([
                'metode_pembayaran' => $method,
                'kode_qris' => $kodeSimulasi,
                'total_bayar' => (int) $order->total_harga,
                'status_verifikasi' => 'Menunggu',
                'batas_waktu' => $batasWaktu,
                'waktu_bayar' => null,
            ]);
            $payment = $existingPending->refresh();
        } else {
            $payment = Payment::create([
                'id_pesanan' => $order->id_pesanan,
                'metode_pembayaran' => $method,
                'kode_qris' => $kodeSimulasi,
                'total_bayar' => (int) $order->total_harga,
                'status_verifikasi' => 'Menunggu',
                'batas_waktu' => $batasWaktu,
                'waktu_bayar' => null,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Pembayaran simulasi berhasil dibuat.',
            'data' => $this->formatPaymentResponse($payment),
        ], 201);
    }

    /**
     * Menampilkan informasi pembayaran berdasarkan id_pesanan.
     */
    public function showByOrder(Request $request, int $id)
    {
        $user = $request->user();
        $order = Order::with(['tenant', 'payments'])->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak ditemukan.',
            ], 404);
        }

        if (!$this->canAccessOrderPayment($user, $order)) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak akses untuk melihat informasi pembayaran ini.',
            ], 403);
        }

        $payment = $order->payments->sortByDesc('id_pembayaran')->first();

        if (!$payment) {
            return response()->json([
                'success' => false,
                'message' => 'Data pembayaran untuk pesanan ini belum dibuat.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Informasi pembayaran berhasil diambil.',
            'data' => $this->formatPaymentResponse($payment),
        ], 200);
    }

    /**
     * Memperbarui status verifikasi pembayaran simulasi berdasarkan id_pembayaran.
     */
    public function verify(Request $request, int $id)
    {
        $payment = Payment::with('order.tenant')->find($id);

        if (!$payment || !$payment->order) {
            return response()->json([
                'success' => false,
                'message' => 'Data pembayaran tidak ditemukan.',
            ], 404);
        }

        return $this->processVerification($request, $payment);
    }

    /**
     * Memperbarui status verifikasi pembayaran simulasi berdasarkan id_pesanan.
     */
    public function verifyByOrder(Request $request, int $id)
    {
        $order = Order::with(['tenant', 'payments'])->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak ditemukan.',
            ], 404);
        }

        $payment = $order->payments->sortByDesc('id_pembayaran')->first();

        if (!$payment) {
            return response()->json([
                'success' => false,
                'message' => 'Data pembayaran untuk pesanan ini belum dibuat.',
            ], 404);
        }

        $payment->setRelation('order', $order);

        return $this->processVerification($request, $payment);
    }

    /**
     * Proses inti verifikasi pembayaran simulasi dan pembaruan status pesanan.
     */
    private function processVerification(Request $request, Payment $payment)
    {
        $user = $request->user();
        $order = $payment->order;

        if (!$this->canAccessOrderPayment($user, $order)) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak akses untuk memverifikasi pembayaran ini.',
            ], 403);
        }

        $validated = $request->validate([
            'status_verifikasi' => ['sometimes', 'required', 'string', Rule::in(self::ALLOWED_VERIFICATION_STATUSES)],
        ]);

        $newStatus = $validated['status_verifikasi'] ?? 'Terverifikasi';

        if (
            $newStatus === 'Terverifikasi'
            && $payment->batas_waktu
            && now()->greaterThan($payment->batas_waktu)
        ) {
            $payment->update([
                'status_verifikasi' => 'Kedaluwarsa',
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Batas waktu pembayaran simulasi telah berakhir. Silakan buat ulang pembayaran.',
                'data' => $this->formatPaymentResponse($payment->refresh()),
            ], 422);
        }

        $now = now();

        DB::transaction(function () use ($payment, $order, $newStatus, $now) {
            $payment->update([
                'status_verifikasi' => $newStatus,
                'waktu_bayar' => $newStatus === 'Terverifikasi' ? $now : $payment->waktu_bayar,
            ]);

            if ($newStatus === 'Terverifikasi' && $order->status_pesanan === 'Menunggu Pembayaran') {
                $order->update([
                    'status_pesanan' => 'Sedang Diproses',
                ]);

                StatusHistory::create([
                    'id_pesanan' => $order->id_pesanan,
                    'status' => 'Sedang Diproses',
                    'waktu' => $now,
                ]);

                Notification::create([
                    'id_user' => $order->id_user,
                    'id_pesanan' => $order->id_pesanan,
                    'pesan' => "Pembayaran simulasi pesanan {$order->nomor_antrean} berhasil diverifikasi. Pesanan sedang diproses oleh tenant.",
                    'status_baca' => false,
                ]);

                if ($order->tenant && $order->tenant->id_user) {
                    Notification::create([
                        'id_user' => $order->tenant->id_user,
                        'id_pesanan' => $order->id_pesanan,
                        'pesan' => "Pembayaran pesanan {$order->nomor_antrean} telah terverifikasi. Silakan proses pesanan.",
                        'status_baca' => false,
                    ]);
                }
            } elseif ($newStatus === 'Gagal') {
                Notification::create([
                    'id_user' => $order->id_user,
                    'id_pesanan' => $order->id_pesanan,
                    'pesan' => "Verifikasi pembayaran simulasi untuk pesanan {$order->nomor_antrean} gagal. Silakan coba kembali.",
                    'status_baca' => false,
                ]);
            }
        });

        $payment->refresh();

        return response()->json([
            'success' => true,
            'message' => 'Status verifikasi pembayaran simulasi berhasil diperbarui.',
            'data' => $this->formatPaymentResponse($payment),
        ], 200);
    }

    /**
     * Memeriksa kewenangan akses pembayaran (Customer pemilik, Vendor tenant terkait, atau Administrator).
     */
    private function canAccessOrderPayment($user, Order $order): bool
    {
        if (!$user) {
            return false;
        }

        if (strtolower((string) $user->peran) === 'administrator') {
            return true;
        }

        if ((int) $order->id_user === (int) $user->id_user) {
            return true;
        }

        if ($order->tenant && (int) $order->tenant->id_user === (int) $user->id_user) {
            return true;
        }

        return false;
    }

    /**
     * Menyusun format response pembayaran sesuai API Specification.
     */
    private function formatPaymentResponse(Payment $payment): array
    {
        return [
            'id_pembayaran' => $payment->id_pembayaran,
            'id_pesanan' => $payment->id_pesanan,
            'metode_pembayaran' => $payment->metode_pembayaran,
            'kode_qris' => $payment->kode_qris,
            'total_bayar' => (int) $payment->total_bayar,
            'status_verifikasi' => $payment->status_verifikasi,
            'batas_waktu' => $payment->batas_waktu?->format('Y-m-d H:i:s'),
            'waktu_bayar' => $payment->waktu_bayar?->format('Y-m-d H:i:s'),
        ];
    }
}


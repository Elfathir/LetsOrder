<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Notification;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\StatusHistory;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    /**
     * Daftar status pesanan yang sah sesuai alur bisnis self-pickup.
     */
    public const VALID_STATUSES = [
        'Menunggu Pembayaran',
        'Sedang Diproses',
        'Diproses',
        'Siap Diambil',
        'Selesai',
        'Dibatalkan',
    ];

    /**
     * Menampilkan daftar/riwayat pesanan milik Customer yang sedang login.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Order::with([
            'tenant',
            'orderDetails.menu',
            'payments',
            'statusHistories',
        ])->where('id_user', $user->id_user);

        if ($request->filled('status_pesanan')) {
            $query->where('status_pesanan', $request->query('status_pesanan'));
        }

        $orders = $query
            ->orderByDesc('waktu_pesan')
            ->orderByDesc('id_pesanan')
            ->get()
            ->map(fn (Order $order) => $this->formatOrderResponse($order));

        return response()->json([
            'success' => true,
            'message' => 'Daftar pesanan berhasil diambil.',
            'data' => $orders,
        ], 200);
    }

    /**
     * Membuat pesanan baru dari keranjang belanja Customer (Self-Pickup).
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'catatan' => 'nullable|string|max:500',
        ]);

        $cart = Cart::with(['cartItems.menu.tenant'])
            ->where('id_user', $user->id_user)
            ->first();

        if (!$cart || $cart->cartItems->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Keranjang belanja kosong. Tambahkan menu terlebih dahulu sebelum membuat pesanan.',
            ], 422);
        }

        $cartItems = $cart->cartItems;

        // Pastikan seluruh item memiliki menu yang valid
        foreach ($cartItems as $item) {
            if (!$item->menu) {
                return response()->json([
                    'success' => false,
                    'message' => 'Terdapat item menu yang tidak valid di dalam keranjang.',
                ], 422);
            }

            if (!$item->menu->status_tersedia) {
                return response()->json([
                    'success' => false,
                    'message' => "Menu '{$item->menu->nama_menu}' sedang tidak tersedia.",
                ], 422);
            }
        }

        // Pastikan seluruh item berasal dari satu tenant yang sama
        $tenantIds = $cartItems->pluck('menu.id_tenant')->unique()->values();
        if ($tenantIds->count() !== 1) {
            return response()->json([
                'success' => false,
                'message' => 'Satu pesanan hanya boleh berisi menu dari satu tenant yang sama.',
            ], 422);
        }

        $idTenant = (int) $tenantIds->first();
        $tenant = Tenant::find($idTenant);

        if (!$tenant) {
            return response()->json([
                'success' => false,
                'message' => 'Tenant tujuan tidak ditemukan.',
            ], 404);
        }

        if (!$tenant->status_buka) {
            return response()->json([
                'success' => false,
                'message' => "Tenant '{$tenant->nama_tenant}' sedang tutup dan tidak dapat menerima pesanan.",
            ], 422);
        }

        // Hitung total harga berdasarkan detail item keranjang
        $totalHarga = 0;
        $itemNotes = [];
        foreach ($cartItems as $item) {
            $subtotal = (int) $item->menu->harga * (int) $item->jumlah;
            $totalHarga += $subtotal;
            if (!empty($item->catatan)) {
                $itemNotes[] = "{$item->menu->nama_menu}: {$item->catatan}";
            }
        }

        $orderNote = $validated['catatan'] ?? '';
        if ($orderNote === '' && !empty($itemNotes)) {
            $orderNote = implode('; ', $itemNotes);
        }

        $waktuPesan = now();

        $order = DB::transaction(function () use (
            $user,
            $tenant,
            $cart,
            $cartItems,
            $totalHarga,
            $orderNote,
            $waktuPesan
        ) {
            $nomorAntrean = $this->generateQueueNumber($tenant->id_tenant);

            $newOrder = Order::create([
                'id_user' => $user->id_user,
                'id_tenant' => $tenant->id_tenant,
                'nomor_antrean' => $nomorAntrean,
                'status_pesanan' => 'Menunggu Pembayaran',
                'total_harga' => $totalHarga,
                'catatan' => $orderNote,
                'waktu_pesan' => $waktuPesan,
            ]);

            foreach ($cartItems as $item) {
                $subtotal = (int) $item->menu->harga * (int) $item->jumlah;

                OrderDetail::create([
                    'id_pesanan' => $newOrder->id_pesanan,
                    'id_menu' => $item->id_menu,
                    'jumlah' => (int) $item->jumlah,
                    'subtotal' => $subtotal,
                ]);
            }

            StatusHistory::create([
                'id_pesanan' => $newOrder->id_pesanan,
                'status' => 'Menunggu Pembayaran',
                'waktu' => $waktuPesan,
            ]);

            Notification::create([
                'id_user' => $user->id_user,
                'id_pesanan' => $newOrder->id_pesanan,
                'pesan' => "Pesanan dengan nomor antrean {$nomorAntrean} berhasil dibuat. Silakan lanjutkan pembayaran simulasi.",
                'status_baca' => false,
            ]);

            if ($tenant->id_user && (int) $tenant->id_user !== (int) $user->id_user) {
                Notification::create([
                    'id_user' => $tenant->id_user,
                    'id_pesanan' => $newOrder->id_pesanan,
                    'pesan' => "Pesanan baru nomor antrean {$nomorAntrean} telah dibuat oleh {$user->nama}.",
                    'status_baca' => false,
                ]);
            }

            $cart->cartItems()->delete();

            return $newOrder;
        });

        $order->load([
            'tenant',
            'orderDetails.menu',
            'payments',
            'statusHistories',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pesanan berhasil dibuat.',
            'data' => $this->formatOrderResponse($order),
        ], 201);
    }

    /**
     * Menampilkan detail pesanan (Customer pemilik, Vendor terkait, atau Administrator).
     */
    public function show(Request $request, int $id)
    {
        $user = $request->user();

        $order = Order::with([
            'user',
            'tenant',
            'orderDetails.menu',
            'payments',
            'statusHistories',
        ])->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak ditemukan.',
            ], 404);
        }

        if (!$this->canAccessOrder($user, $order)) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak akses untuk melihat pesanan ini.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail pesanan berhasil diambil.',
            'data' => $this->formatOrderResponse($order),
        ], 200);
    }

    /**
     * Menampilkan daftar pesanan yang masuk ke tenant milik Vendor yang sedang login.
     */
    public function vendorOrders(Request $request)
    {
        $user = $request->user();
        $tenantIds = Tenant::where('id_user', $user->id_user)->pluck('id_tenant');

        $query = Order::with([
            'user',
            'tenant',
            'orderDetails.menu',
            'payments',
            'statusHistories',
        ])->whereIn('id_tenant', $tenantIds);

        if ($request->filled('status_pesanan')) {
            $query->where('status_pesanan', $request->query('status_pesanan'));
        }

        $orders = $query
            ->orderByDesc('waktu_pesan')
            ->orderByDesc('id_pesanan')
            ->get()
            ->map(fn (Order $order) => $this->formatOrderResponse($order));

        return response()->json([
            'success' => true,
            'message' => 'Daftar pesanan tenant berhasil diambil.',
            'data' => $orders,
        ], 200);
    }

    /**
     * Menampilkan detail pesanan untuk Vendor pemilik tenant.
     */
    public function vendorOrderShow(Request $request, int $id)
    {
        $user = $request->user();

        $order = Order::with([
            'user',
            'tenant',
            'orderDetails.menu',
            'payments',
            'statusHistories',
        ])->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak ditemukan.',
            ], 404);
        }

        $isVendorOwner = $order->tenant && (int) $order->tenant->id_user === (int) $user->id_user;
        $isAdmin = strtolower((string) $user->peran) === 'administrator';

        if (!$isVendorOwner && !$isAdmin) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak akses terhadap pesanan dari tenant lain.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail pesanan tenant berhasil diambil.',
            'data' => $this->formatOrderResponse($order),
        ], 200);
    }

    /**
     * Memperbarui status pesanan oleh Vendor pemilik tenant,
     * mencatat riwayat status, dan mengirimkan notifikasi kepada Customer.
     */
    public function updateStatus(Request $request, int $id)
    {
        $user = $request->user();

        $order = Order::with(['tenant', 'user'])->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak ditemukan.',
            ], 404);
        }

        $isVendorOwner = $order->tenant && (int) $order->tenant->id_user === (int) $user->id_user;
        $isAdmin = strtolower((string) $user->peran) === 'administrator';

        if (!$isVendorOwner && !$isAdmin) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak akses untuk memperbarui status pesanan tenant lain.',
            ], 403);
        }

        $validated = $request->validate([
            'status_pesanan' => ['required', 'string', Rule::in(self::VALID_STATUSES)],
        ]);

        $newStatus = $validated['status_pesanan'];

        if (in_array($order->status_pesanan, ['Selesai', 'Dibatalkan'], true) && $order->status_pesanan !== $newStatus) {
            return response()->json([
                'success' => false,
                'message' => "Pesanan yang sudah berstatus '{$order->status_pesanan}' tidak dapat diubah lagi.",
            ], 422);
        }

        $now = now();

        DB::transaction(function () use ($order, $newStatus, $now) {
            $order->update([
                'status_pesanan' => $newStatus,
            ]);

            StatusHistory::create([
                'id_pesanan' => $order->id_pesanan,
                'status' => $newStatus,
                'waktu' => $now,
            ]);

            $notificationMessage = $this->buildStatusNotificationMessage($order, $newStatus);

            Notification::create([
                'id_user' => $order->id_user,
                'id_pesanan' => $order->id_pesanan,
                'pesan' => $notificationMessage,
                'status_baca' => false,
            ]);
        });

        $order->load([
            'user',
            'tenant',
            'orderDetails.menu',
            'payments',
            'statusHistories',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status pesanan berhasil diperbarui.',
            'data' => $this->formatOrderResponse($order),
        ], 200);
    }

    /**
     * Melihat status terkini pesanan (Order Tracking API).
     */
    public function status(Request $request, int $id)
    {
        $user = $request->user();
        $order = Order::with('tenant')->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak ditemukan.',
            ], 404);
        }

        if (!$this->canAccessOrder($user, $order)) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak akses untuk melihat status pesanan ini.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'message' => 'Status pesanan berhasil diambil.',
            'data' => [
                'id_pesanan' => $order->id_pesanan,
                'id_tenant' => $order->id_tenant,
                'nama_tenant' => $order->tenant?->nama_tenant,
                'nomor_antrean' => $order->nomor_antrean,
                'status_pesanan' => $order->status_pesanan,
                'waktu_pesan' => $order->waktu_pesan?->format('Y-m-d H:i:s'),
            ],
        ], 200);
    }

    /**
     * Melihat riwayat perubahan status pesanan (Order Tracking API).
     */
    public function statusHistory(Request $request, int $id)
    {
        $user = $request->user();
        $order = Order::with('tenant')->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak ditemukan.',
            ], 404);
        }

        if (!$this->canAccessOrder($user, $order)) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak akses untuk melihat riwayat status pesanan ini.',
            ], 403);
        }

        $histories = StatusHistory::where('id_pesanan', $order->id_pesanan)
            ->orderBy('waktu', 'asc')
            ->orderBy('id_riwayat', 'asc')
            ->get()
            ->map(fn (StatusHistory $history) => [
                'id_riwayat' => $history->id_riwayat,
                'id_pesanan' => $history->id_pesanan,
                'status' => $history->status,
                'waktu' => $history->waktu?->format('Y-m-d H:i:s'),
            ]);

        return response()->json([
            'success' => true,
            'message' => 'Riwayat status berhasil diambil.',
            'data' => $histories,
        ], 200);
    }

    /**
     * Menghasilkan nomor antrean unik (contoh: A001, A002) tanpa menambah atribut di luar ERD.
     */
    private function generateQueueNumber(int $idTenant): string
    {
        $prefix = chr(64 + (($idTenant - 1) % 26) + 1); // Tenant 1 -> A, Tenant 2 -> B, dst.
        $todayCount = Order::where('id_tenant', $idTenant)
            ->whereDate('waktu_pesan', now()->toDateString())
            ->count();

        $sequence = $todayCount + 1;
        $candidate = sprintf('%s%03d', $prefix, $sequence);

        while (
            Order::where('id_tenant', $idTenant)
                ->whereDate('waktu_pesan', now()->toDateString())
                ->where('nomor_antrean', $candidate)
                ->exists()
        ) {
            $sequence++;
            $candidate = sprintf('%s%03d', $prefix, $sequence);
        }

        return $candidate;
    }

    /**
     * Memeriksa apakah pengguna berhak mengakses pesanan tertentu.
     */
    private function canAccessOrder($user, Order $order): bool
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
     * Menyusun pesan notifikasi otomatis saat status pesanan berubah.
     */
    private function buildStatusNotificationMessage(Order $order, string $newStatus): string
    {
        $tenantName = $order->tenant?->nama_tenant ?? 'tenant';

        return match ($newStatus) {
            'Sedang Diproses', 'Diproses' => "Pesanan {$order->nomor_antrean} sedang diproses oleh {$tenantName}.",
            'Siap Diambil' => "Pesanan {$order->nomor_antrean} sudah siap diambil di {$tenantName}. Tunjukkan nomor antrean saat pengambilan (self-pickup).",
            'Selesai' => "Pesanan {$order->nomor_antrean} telah selesai diambil. Terima kasih telah memesan di LetsOrder.com!",
            'Dibatalkan' => "Pesanan {$order->nomor_antrean} telah dibatalkan.",
            default => "Status pesanan {$order->nomor_antrean} diperbarui menjadi: {$newStatus}.",
        };
    }

    /**
     * Menyusun format response pesanan yang konsisten dengan API Specification.
     */
    private function formatOrderResponse(Order $order): array
    {
        $details = $order->relationLoaded('orderDetails')
            ? $order->orderDetails->map(fn (OrderDetail $detail) => [
                'id_detail' => $detail->id_detail,
                'id_pesanan' => $detail->id_pesanan,
                'id_menu' => $detail->id_menu,
                'nama_menu' => $detail->menu?->nama_menu,
                'harga' => $detail->menu?->harga,
                'gambar' => $detail->menu?->gambar,
                'jumlah' => $detail->jumlah,
                'subtotal' => $detail->subtotal,
                'menu' => $detail->menu,
            ])->values()
            : [];

        $latestPayment = $order->relationLoaded('payments')
            ? $order->payments->sortByDesc('id_pembayaran')->first()
            : null;

        return [
            'id_pesanan' => $order->id_pesanan,
            'id_user' => $order->id_user,
            'id_tenant' => $order->id_tenant,
            'nomor_antrean' => $order->nomor_antrean,
            'status_pesanan' => $order->status_pesanan,
            'total_harga' => (int) $order->total_harga,
            'catatan' => $order->catatan,
            'waktu_pesan' => $order->waktu_pesan?->format('Y-m-d H:i:s'),
            'user' => $order->relationLoaded('user') ? $order->user : null,
            'tenant' => $order->relationLoaded('tenant') ? $order->tenant : null,
            'details' => $details,
            'order_details' => $details,
            'payment' => $latestPayment,
            'payments' => $order->relationLoaded('payments') ? $order->payments : [],
            'status_histories' => $order->relationLoaded('statusHistories') ? $order->statusHistories : [],
        ];
    }
}


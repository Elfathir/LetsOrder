<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Notification;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\OrderMessage;
use App\Models\Promo;
use App\Models\StatusHistory;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
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
        $compact = $request->boolean('compact_media', false);
        $statusFilter = $request->filled('status_pesanan') ? (string) $request->query('status_pesanan') : null;
        $orders = $this->ordersDataForUser($user, false, $compact, $statusFilter);

        return response()->json([
            'success' => true,
            'message' => 'Daftar pesanan berhasil diambil.',
            'data' => $orders,
        ], 200);
    }

    public function ordersDataForUser($user, bool $asVendor = false, bool $compact = false, ?string $statusFilter = null)
    {
        $hasReviews = true;
        $relations = [
            'payments',
            'statusHistories',
        ];
        if ($asVendor) {
            $relations[] = 'user:id_user,username,nama,email,peran';
        }
        if ($compact) {
            $tenantCols = ['id_tenant', 'id_user', 'nama_tenant', 'deskripsi', 'status_buka'];
            array_push($tenantCols, 'jam_buka', 'jam_tutup', 'auto_schedule');
            $relations['tenant'] = fn ($q) => $q->select($tenantCols)->selectRaw(MediaController::previewSql('logo', 'logo', false));
            $relations['orderDetails'] = fn ($q) => $q->with([
                'menu' => fn ($mq) => $mq->select(['id_menu', 'id_tenant', 'id_kategori', 'nama_menu', 'harga', 'estimasi_menit', 'status_tersedia'])
                    ->selectRaw(MediaController::previewSql('gambar', 'gambar', true)),
            ]);
        } else {
            $relations[] = 'tenant';
            $relations[] = 'orderDetails.menu';
        }
        if ($hasReviews) {
            $relations[] = 'reviews';
        }

        $query = Order::with($relations);
        if ($asVendor) {
            $tenantIds = Tenant::where('id_user', $user->id_user)->pluck('id_tenant');
            if ($tenantIds->isEmpty()) {
                return collect([]);
            }
            $query->whereIn('id_tenant', $tenantIds);
        } else {
            $query->where('id_user', $user->id_user);
        }

        if ($statusFilter !== null && $statusFilter !== '') {
            $query->where('status_pesanan', $statusFilter);
        }

        $orderRows = $query
            ->orderByDesc('waktu_pesan')
            ->orderByDesc('id_pesanan')
            ->get();

        // Batch-load OrderMessage counts & latest chat instead of 2 queries per order
        $chatStatsByOrder = [];
        if ($orderRows->isNotEmpty()) {
            $orderIds = $orderRows->pluck('id_pesanan')->all();
            $counts = OrderMessage::whereIn('id_pesanan', $orderIds)
                ->selectRaw('id_pesanan, COUNT(*) as cnt, MAX(id_pesan) as max_id')
                ->groupBy('id_pesanan')
                ->get();
            $latestIds = $counts->pluck('max_id')->filter()->values()->all();
            $latestById = !empty($latestIds)
                ? OrderMessage::whereIn('id_pesan', $latestIds)->get()->keyBy('id_pesan')
                : collect();
            foreach ($counts as $c) {
                $latestMsg = $latestById->get((int) $c->max_id);
                $chatStatsByOrder[(int) $c->id_pesanan] = [
                    'cnt' => (int) $c->cnt,
                    'last' => $latestMsg,
                ];
            }
        }

        return $orderRows
            ->map(fn (Order $order) => $this->formatOrderResponse($order, $hasReviews, $chatStatsByOrder, $compact))
            ->values();
    }

    /**
     * Membuat pesanan baru dari keranjang belanja Customer (Self-Pickup).
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'catatan' => 'nullable|string|max:500',
            'promo_code' => 'nullable|string|max:32',
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

        if (!$tenant->isCurrentlyOpen()) {
            return response()->json([
                'success' => false,
                'message' => "Tenant '{$tenant->nama_tenant}' sedang tutup dan tidak dapat menerima pesanan.",
            ], 422);
        }

        // Hitung total harga & diskon promo secara server-side (custom tenant promo + promo sistem)
        $totalHarga = 0;
        $itemNotes = [];
        foreach ($cartItems as $item) {
            $subtotal = (int) $item->menu->harga * (int) $item->jumlah;
            $totalHarga += $subtotal;
            if (!empty($item->catatan)) {
                $itemNotes[] = "{$item->menu->nama_menu}: {$item->catatan}";
            }
        }

        $promoCode = strtoupper(trim((string) ($validated['promo_code'] ?? '')));
        $appliedDiscount = 0;
        PromoController::ensureSchema();
        if ($promoCode !== '' && Schema::hasTable('promos')) {
            $customPromo = Promo::where('kode_promo', $promoCode)
                ->where('aktif', true)
                ->where(function ($q) use ($idTenant) {
                    $q->whereNull('id_tenant')->orWhere('id_tenant', $idTenant);
                })
                ->first();
            if ($customPromo) {
                $limitPerUser = (int) ($customPromo->batas_per_user ?? 1);
                if ($limitPerUser > 0) {
                    $usedCount = PromoController::countUserPromoUsage((int) $user->id_user, $promoCode);
                    if ($usedCount >= $limitPerUser) {
                        return response()->json([
                            'success' => false,
                            'message' => "Voucher '{$promoCode}' sudah mencapai batas pemakaian ({$limitPerUser}x) untuk akun Anda.",
                        ], 422);
                    }
                }
                if ($totalHarga >= (int) $customPromo->minimal_belanja) {
                    if ($customPromo->tipe === 'percentage') {
                        $pct = $customPromo->diskon > 1 ? min(100, $customPromo->diskon) / 100 : $customPromo->diskon;
                        $appliedDiscount = (int) round($totalHarga * $pct);
                    } else {
                        $appliedDiscount = (int) $customPromo->diskon;
                    }
                }
            }
        }

        if ($appliedDiscount === 0 && $promoCode !== '') {
            $promoRules = [
                'COMBO3K' => ['type' => 'fixed', 'discount' => 3000, 'minSpend' => 20000],
                'STUDENT10' => ['type' => 'percentage', 'discount' => 0.1, 'minSpend' => 25000],
                'HEMAT5K' => ['type' => 'fixed', 'discount' => 5000, 'minSpend' => 30000],
                'EARLYBIRD' => ['type' => 'percentage', 'discount' => 0.15, 'minSpend' => 15000],
            ];
            if (isset($promoRules[$promoCode]) && $totalHarga >= $promoRules[$promoCode]['minSpend']) {
                $rule = $promoRules[$promoCode];
                $appliedDiscount = $rule['type'] === 'percentage'
                    ? (int) round($totalHarga * $rule['discount'])
                    : (int) $rule['discount'];
            }
        }

        $totalHarga = max(0, $totalHarga - min($totalHarga, $appliedDiscount));

        $orderNote = $validated['catatan'] ?? '';
        if ($orderNote === '' && !empty($itemNotes)) {
            $orderNote = implode('; ', $itemNotes);
        }

        $waktuPesan = now();

        $appliedPromoCode = $appliedDiscount > 0 ? $promoCode : null;

        $order = DB::transaction(function () use (
            $user,
            $tenant,
            $cart,
            $cartItems,
            $totalHarga,
            $appliedPromoCode,
            $orderNote,
            $waktuPesan
        ) {
            $nomorAntrean = $this->generateQueueNumber($tenant->id_tenant);

            $orderCreateData = [
                'id_user' => $user->id_user,
                'id_tenant' => $tenant->id_tenant,
                'nomor_antrean' => $nomorAntrean,
                'status_pesanan' => 'Menunggu Pembayaran',
                'total_harga' => $totalHarga,
                'catatan' => $orderNote,
                'waktu_pesan' => $waktuPesan,
            ];
            if (Schema::hasColumn('orders', 'promo_code')) {
                $orderCreateData['promo_code'] = $appliedPromoCode;
            }

            $newOrder = Order::create($orderCreateData);

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

        $relations = [
            'user',
            'tenant',
            'orderDetails.menu',
            'payments',
            'statusHistories',
        ];
        if (Schema::hasTable('reviews')) {
            $relations[] = 'reviews';
        }
        $order = Order::with($relations)->find($id);

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
        $compact = $request->boolean('compact_media', false);
        $statusFilter = $request->filled('status_pesanan') ? (string) $request->query('status_pesanan') : null;
        $orders = $this->ordersDataForUser($user, true, $compact, $statusFilter);

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

        $relations = [
            'user',
            'tenant',
            'orderDetails.menu',
            'payments',
            'statusHistories',
        ];
        if (Schema::hasTable('reviews')) {
            $relations[] = 'reviews';
        }
        $order = Order::with($relations)->find($id);

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
     * Pembatalan pesanan oleh Customer (sebelum Siap Diambil) atau Vendor pemilik tenant / Admin.
     */
    public function cancel(Request $request, int $id)
    {
        $user = $request->user();
        $order = Order::with(['tenant', 'user'])->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak ditemukan.',
            ], 404);
        }

        $isAdmin = strtolower((string) $user->peran) === 'administrator';
        $isVendorOwner = $order->tenant && (int) $order->tenant->id_user === (int) $user->id_user;
        $isCustomerOwner = (int) $order->id_user === (int) $user->id_user;

        if (!$isAdmin && !$isVendorOwner && !$isCustomerOwner) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak akses untuk membatalkan pesanan ini.',
            ], 403);
        }

        if (in_array($order->status_pesanan, ['Selesai', 'Dibatalkan'], true)) {
            return response()->json([
                'success' => false,
                'message' => "Pesanan berstatus '{$order->status_pesanan}' tidak dapat dibatalkan.",
            ], 422);
        }

        if ($isCustomerOwner && !$isVendorOwner && !$isAdmin && $order->status_pesanan === 'Siap Diambil') {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan sudah siap diambil dan tidak dapat dibatalkan oleh pelanggan.',
            ], 422);
        }

        $reason = trim((string) ($request->input('alasan') ?? $request->input('reason') ?? ''));
        $reason = mb_substr($reason, 0, 300);
        $actorLabel = $isVendorOwner ? 'Tenant' : ($isAdmin ? 'Admin' : 'Pelanggan');
        $cancelLine = $reason !== '' ? "Dibatalkan ({$actorLabel}): {$reason}" : "Dibatalkan oleh {$actorLabel}";
        $updatedNote = trim(($order->catatan ? $order->catatan . ' | ' : '') . $cancelLine);

        $now = now();
        DB::transaction(function () use ($order, $updatedNote, $cancelLine, $user, $now) {
            $order->update([
                'status_pesanan' => 'Dibatalkan',
                'catatan' => $updatedNote,
            ]);

            StatusHistory::create([
                'id_pesanan' => $order->id_pesanan,
                'status' => 'Dibatalkan',
                'waktu' => $now,
            ]);

            Notification::create([
                'id_user' => $order->id_user,
                'id_pesanan' => $order->id_pesanan,
                'pesan' => "Pesanan {$order->nomor_antrean} {$cancelLine}.",
                'status_baca' => false,
            ]);

            if ($order->tenant && $order->tenant->id_user && (int) $order->tenant->id_user !== (int) $user->id_user) {
                Notification::create([
                    'id_user' => $order->tenant->id_user,
                    'id_pesanan' => $order->id_pesanan,
                    'pesan' => "Pesanan {$order->nomor_antrean} {$cancelLine}.",
                    'status_baca' => false,
                ]);
            }
        });

        $order->load(['user', 'tenant', 'orderDetails.menu', 'payments', 'statusHistories']);

        Log::info('security_event.order_cancelled', [
            'id_pesanan' => $order->id_pesanan,
            'actor_id' => $user->id_user,
            'actor_role' => $user->peran,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pesanan berhasil dibatalkan.',
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
            ->lockForUpdate()
            ->count();

        $sequence = $todayCount + 1;
        $candidate = sprintf('%s%03d', $prefix, $sequence);

        while (
            Order::where('id_tenant', $idTenant)
                ->whereDate('waktu_pesan', now()->toDateString())
                ->where('nomor_antrean', $candidate)
                ->lockForUpdate()
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
    private function formatOrderResponse(
        Order $order,
        ?bool $hasReviewsTable = null,
        ?array $chatStatsByOrder = null,
        bool $compactMedia = false
    ): array {
        $details = $order->relationLoaded('orderDetails')
            ? $order->orderDetails->map(function (OrderDetail $detail) use ($compactMedia) {
                $menuModel = $detail->menu;
                $gambar = $menuModel?->gambar;
                $menuPayload = $menuModel;
                if ($compactMedia && $menuModel) {
                    $gambar = MediaController::compactMediaValue(
                        'menu',
                        (int) $menuModel->id_menu,
                        $menuModel->gambar_preview ?? '',
                        $menuModel->gambar_len ?? 0
                    );
                    $menuArr = $menuModel->toArray();
                    $menuArr['gambar'] = $gambar;
                    unset($menuArr['gambar_preview'], $menuArr['gambar_len']);
                    $menuPayload = $menuArr;
                }
                return [
                    'id_detail' => $detail->id_detail,
                    'id_pesanan' => $detail->id_pesanan,
                    'id_menu' => $detail->id_menu,
                    'nama_menu' => $menuModel?->nama_menu,
                    'harga' => $menuModel?->harga,
                    'gambar' => $gambar,
                    'jumlah' => $detail->jumlah,
                    'subtotal' => $detail->subtotal,
                    'menu' => $menuPayload,
                ];
            })->values()
            : [];

        $latestPayment = $order->relationLoaded('payments')
            ? $order->payments->sortByDesc('id_pembayaran')->first()
            : null;

        $reviews = [];
        $reviewsAvailable = $hasReviewsTable ?? Schema::hasTable('reviews');
        if ($reviewsAvailable) {
            $reviews = $order->relationLoaded('reviews')
                ? $order->reviews->toArray()
                : \App\Models\Review::where('id_pesanan', $order->id_pesanan)->get()->toArray();
        }

        $chatCount = 0;
        $lastChat = null;
        if ($chatStatsByOrder !== null) {
            $stat = $chatStatsByOrder[(int) $order->id_pesanan] ?? null;
            if ($stat) {
                $chatCount = (int) $stat['cnt'];
                $last = $stat['last'];
                if ($last) {
                    $lastChat = [
                        'id_pesan' => $last->id_pesan,
                        'id_pengirim' => $last->id_pengirim,
                        'peran_pengirim' => $last->peran_pengirim,
                        'nama_pengirim' => $last->nama_pengirim,
                        'teks' => (string) ($last->teks ?? ''),
                        'has_image' => !empty($last->gambar),
                        'waktu' => $last->waktu?->format('Y-m-d H:i:s'),
                    ];
                }
            }
        } else {
            static $hasMessagesTable = null;
            $hasMessagesTable ??= Schema::hasTable('order_messages');
            if ($hasMessagesTable) {
                $chatCount = OrderMessage::where('id_pesanan', $order->id_pesanan)->count();
                $last = $chatCount > 0
                    ? OrderMessage::where('id_pesanan', $order->id_pesanan)->orderByDesc('id_pesan')->first()
                    : null;
                if ($last) {
                    $lastChat = [
                        'id_pesan' => $last->id_pesan,
                        'id_pengirim' => $last->id_pengirim,
                        'peran_pengirim' => $last->peran_pengirim,
                        'nama_pengirim' => $last->nama_pengirim,
                        'teks' => (string) ($last->teks ?? ''),
                        'has_image' => !empty($last->gambar),
                        'waktu' => $last->waktu?->format('Y-m-d H:i:s'),
                    ];
                }
            }
        }

        $tenantPayload = null;
        if ($order->relationLoaded('tenant') && $order->tenant) {
            if ($compactMedia) {
                $tArr = $order->tenant->toArray();
                $tLogo = MediaController::compactMediaValue(
                    'tenant',
                    (int) $order->tenant->id_tenant,
                    $tArr['logo_preview'] ?? '',
                    $tArr['logo_len'] ?? 0
                );
                $tArr['logo'] = $tLogo;
                $tArr['gambar'] = $tLogo;
                unset($tArr['logo_preview'], $tArr['logo_len']);
                $tenantPayload = $tArr;
            } else {
                $tenantPayload = $order->tenant;
            }
        }

        $isPaid = in_array($order->status_pesanan, OrderMessageController::PAID_STATUSES, true)
            || ($latestPayment && $latestPayment->status_verifikasi === 'Terverifikasi');

        return [
            'id_pesanan' => $order->id_pesanan,
            'id_user' => $order->id_user,
            'id_tenant' => $order->id_tenant,
            'nomor_antrean' => $order->nomor_antrean,
            'status_pesanan' => $order->status_pesanan,
            'is_paid' => $isPaid,
            'chat_count' => $chatCount,
            'last_chat' => $lastChat,
            'total_harga' => (int) $order->total_harga,
            'promo_code' => $order->promo_code ?? null,
            'catatan' => $order->catatan,
            'waktu_pesan' => $order->waktu_pesan?->format('Y-m-d H:i:s'),
            'user' => $order->relationLoaded('user') ? $order->user : null,
            'tenant' => $tenantPayload,
            'details' => $details,
            'order_details' => $details,
            'payment' => $latestPayment,
            'payments' => $order->relationLoaded('payments') ? $order->payments : [],
            'reviews' => $reviews,
            'has_reviewed' => count($reviews) > 0,
            'status_histories' => $order->relationLoaded('statusHistories') ? $order->statusHistories : [],
        ];
    }
}


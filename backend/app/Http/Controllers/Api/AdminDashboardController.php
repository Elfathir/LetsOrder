<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Endpoint dashboard Administrator: daftar seluruh pesanan, pembayaran,
 * dan statistik ringkasan. Bentuk respons dibuat sama dengan `server.mjs`
 * agar panel admin React bekerja pada kedua backend.
 */
class AdminDashboardController extends Controller
{
    private const PAID_STATUSES = ['Sedang Diproses', 'Diproses', 'Siap Diambil', 'Selesai'];

    private function perPage(Request $request): int
    {
        return min(100, max(5, (int) $request->query('per_page', 20)));
    }

    private function stamp($value): ?string
    {
        if (!$value) {
            return null;
        }
        return $value instanceof \DateTimeInterface ? $value->format('Y-m-d H:i:s') : (string) $value;
    }

    /**
     * Bentuk payload pesanan untuk panel admin.
     */
    private function orderPayload(Order $order): array
    {
        $payment = $order->payments->sortByDesc('id_pembayaran')->first();

        $items = $order->orderDetails
            ->map(function ($detail) {
                return [
                    'id_menu' => (int) $detail->id_menu,
                    'nama_menu' => $detail->menu->nama_menu ?? 'Menu',
                    'jumlah' => (int) $detail->jumlah,
                    'harga' => (int) ($detail->menu->harga ?? 0),
                    'subtotal' => (int) $detail->subtotal,
                    'catatan' => (string) ($detail->catatan ?? ''),
                    'gambar' => (string) ($detail->menu->gambar ?? ''),
                ];
            })
            ->values()
            ->all();

        $history = $order->statusHistories
            ->map(function ($row) {
                return [
                    'status' => $row->status,
                    'waktu' => $this->stamp($row->waktu),
                ];
            })
            ->values()
            ->all();

        if (empty($history)) {
            $history = [['status' => $order->status_pesanan, 'waktu' => $this->stamp($order->waktu_pesan)]];
        }

        return [
            'id_pesanan' => (int) $order->id_pesanan,
            'nomor_antrean' => $order->nomor_antrean,
            'status_pesanan' => $order->status_pesanan,
            'total_harga' => (int) $order->total_harga,
            'promo_code' => $order->promo_code ?? null,
            'catatan' => (string) ($order->catatan ?? ''),
            'waktu_pesan' => $this->stamp($order->waktu_pesan),
            'is_paid' => $payment && $payment->status_verifikasi === 'Terverifikasi',
            'tenant' => $order->tenant
                ? [
                    'id_tenant' => (int) $order->tenant->id_tenant,
                    'nama_tenant' => $order->tenant->nama_tenant,
                    'booth' => (string) ($order->tenant->booth ?? ''),
                    'logo' => (string) ($order->tenant->logo ?? ''),
                    'status_buka' => (bool) $order->tenant->status_buka,
                ]
                : null,
            'customer' => $order->user
                ? [
                    'id_user' => (int) $order->user->id_user,
                    'nama' => $order->user->nama,
                    'username' => $order->user->username,
                    'email' => $order->user->email,
                ]
                : null,
            'items' => $items,
            'payment' => $payment
                ? [
                    'id_pembayaran' => (int) $payment->id_pembayaran,
                    'metode_pembayaran' => $payment->metode_pembayaran,
                    'kode_qris' => (string) ($payment->kode_qris ?? ''),
                    'total_bayar' => (int) $payment->total_bayar,
                    'status_verifikasi' => $payment->status_verifikasi,
                    'batas_waktu' => $this->stamp($payment->batas_waktu),
                    'waktu_bayar' => $this->stamp($payment->waktu_bayar),
                ]
                : null,
            'status_history' => $history,
        ];
    }

    /**
     * GET /api/admin/orders
     */
    public function orders(Request $request)
    {
        $perPage = $this->perPage($request);

        $query = Order::with(['tenant', 'user', 'orderDetails.menu', 'payments', 'statusHistories']);

        $status = (string) $request->query('status', '');
        if ($status !== '' && $status !== 'All') {
            $query->where('status_pesanan', $status);
        }

        $idTenant = (int) $request->query('id_tenant', 0);
        if ($idTenant > 0) {
            $query->where('id_tenant', $idTenant);
        }

        $from = (string) $request->query('from', '');
        if ($from !== '') {
            $query->whereDate('waktu_pesan', '>=', $from);
        }

        $to = (string) $request->query('to', '');
        if ($to !== '') {
            $query->whereDate('waktu_pesan', '<=', $to);
        }

        $keyword = trim((string) $request->query('q', ''));
        if ($keyword !== '') {
            $query->where(function ($sub) use ($keyword) {
                $sub->where('nomor_antrean', 'like', '%' . $keyword . '%')
                    ->orWhereHas('tenant', function ($tenantQuery) use ($keyword) {
                        $tenantQuery->where('nama_tenant', 'like', '%' . $keyword . '%');
                    })
                    ->orWhereHas('user', function ($userQuery) use ($keyword) {
                        $userQuery->where('nama', 'like', '%' . $keyword . '%')
                            ->orWhere('username', 'like', '%' . $keyword . '%')
                            ->orWhere('email', 'like', '%' . $keyword . '%');
                    });
            });
        }

        $paginator = $query->orderByDesc('id_pesanan')->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Daftar pesanan admin berhasil diambil.',
            'data' => collect($paginator->items())->map(fn (Order $order) => $this->orderPayload($order))->values(),
            'meta' => [
                'total' => $paginator->total(),
                'page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'pages' => $paginator->lastPage(),
            ],
        ], 200);
    }

    /**
     * GET /api/admin/orders/{id}
     */
    public function orderShow(int $id)
    {
        $order = Order::with(['tenant', 'user', 'orderDetails.menu', 'payments', 'statusHistories'])->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail pesanan berhasil diambil.',
            'data' => $this->orderPayload($order),
        ], 200);
    }

    /**
     * GET /api/admin/payments
     */
    public function payments(Request $request)
    {
        $perPage = $this->perPage($request);

        $query = Payment::query();

        $status = (string) $request->query('status', '');
        if ($status !== '' && $status !== 'All') {
            $query->where('status_verifikasi', $status);
        }

        $from = (string) $request->query('from', '');
        if ($from !== '') {
            $query->whereDate('batas_waktu', '>=', $from);
        }

        $to = (string) $request->query('to', '');
        if ($to !== '') {
            $query->whereDate('batas_waktu', '<=', $to);
        }

        $keyword = trim((string) $request->query('q', ''));
        if ($keyword !== '') {
            $matchingOrderIds = Order::query()
                ->where('nomor_antrean', 'like', '%' . $keyword . '%')
                ->pluck('id_pesanan')
                ->all();

            $query->where(function ($sub) use ($keyword, $matchingOrderIds) {
                $sub->where('kode_qris', 'like', '%' . $keyword . '%')
                    ->orWhere('metode_pembayaran', 'like', '%' . $keyword . '%');
                if (!empty($matchingOrderIds)) {
                    $sub->orWhereIn('id_pesanan', $matchingOrderIds);
                }
            });
        }

        $paginator = $query->orderByDesc('id_pembayaran')->paginate($perPage);

        $payments = collect($paginator->items());
        $orderIds = $payments->pluck('id_pesanan')->unique()->all();
        $orders = empty($orderIds)
            ? collect()
            : Order::with(['tenant', 'user'])->whereIn('id_pesanan', $orderIds)->get()->keyBy('id_pesanan');

        $now = now();

        $data = $payments->map(function (Payment $payment) use ($orders, $now) {
            $order = $orders->get($payment->id_pesanan);
            $limit = $payment->batas_waktu;
            $isExpired = $payment->status_verifikasi === 'Kedaluwarsa'
                || ($payment->status_verifikasi === 'Menunggu' && $limit && $limit->lt($now));

            return [
                'id_pembayaran' => (int) $payment->id_pembayaran,
                'id_pesanan' => (int) $payment->id_pesanan,
                'nomor_antrean' => $order->nomor_antrean ?? '-',
                'metode_pembayaran' => $payment->metode_pembayaran,
                'kode_qris' => (string) ($payment->kode_qris ?? ''),
                'total_bayar' => (int) $payment->total_bayar,
                'status_verifikasi' => $payment->status_verifikasi,
                'batas_waktu' => $this->stamp($payment->batas_waktu),
                'waktu_bayar' => $this->stamp($payment->waktu_bayar),
                'order_status' => $order->status_pesanan ?? null,
                'tenant_name' => $order->tenant->nama_tenant ?? '-',
                'customer_name' => $order->user->nama ?? '-',
                'is_expired' => (bool) $isExpired,
            ];
        })->values();

        return response()->json([
            'success' => true,
            'message' => 'Daftar pembayaran berhasil diambil.',
            'data' => $data,
            'meta' => [
                'total' => $paginator->total(),
                'page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'pages' => $paginator->lastPage(),
            ],
        ], 200);
    }

    /**
     * GET /api/admin/stats/overview?days=7
     */
    public function overview(Request $request)
    {
        $days = min(30, max(1, (int) $request->query('days', 7) ?: 7));
        $today = now()->toDateString();
        $now = now();

        $series = [];
        for ($i = $days - 1; $i >= 0; $i -= 1) {
            $date = now()->subDays($i)->toDateString();
            $series[] = [
                'date' => $date,
                'orders' => Order::whereDate('waktu_pesan', $date)->count(),
                'revenue' => (int) Order::whereDate('waktu_pesan', $date)
                    ->whereIn('status_pesanan', self::PAID_STATUSES)
                    ->sum('total_harga'),
            ];
        }

        $ordersToday = Order::whereDate('waktu_pesan', $today)->count();
        $revenueToday = (int) Order::whereDate('waktu_pesan', $today)
            ->whereIn('status_pesanan', self::PAID_STATUSES)
            ->sum('total_harga');

        $expiredPayments = Payment::where(function ($query) use ($now) {
            $query->where('status_verifikasi', 'Kedaluwarsa')
                ->orWhere(function ($pending) use ($now) {
                    $pending->where('status_verifikasi', 'Menunggu')
                        ->where('batas_waktu', '<', $now);
                });
        })->count();

        $staleUnpaid = Order::where('status_pesanan', 'Menunggu Pembayaran')
            ->where('waktu_pesan', '<', $now->copy()->subMinutes(15))
            ->count();

        $rangeStart = now()->subDays($days - 1)->startOfDay()->toDateTimeString();
        $rangeEnd = now()->toDateTimeString();

        $topTenants = Order::query()
            ->join('tenants', 'orders.id_tenant', '=', 'tenants.id_tenant')
            ->whereBetween('orders.waktu_pesan', [$rangeStart, $rangeEnd])
            ->where('orders.status_pesanan', '!=', 'Dibatalkan')
            ->groupBy('orders.id_tenant', 'tenants.nama_tenant')
            ->selectRaw('orders.id_tenant as id_tenant, tenants.nama_tenant as nama_tenant, COUNT(*) as orders, SUM(orders.total_harga) as revenue')
            ->orderByDesc('revenue')
            ->limit(5)
            ->get()
            ->map(function ($row) {
                return [
                    'id_tenant' => (int) $row->id_tenant,
                    'nama_tenant' => $row->nama_tenant,
                    'orders' => (int) $row->orders,
                    'revenue' => (int) $row->revenue,
                ];
            })
            ->values();

        $topMenus = DB::table('order_details')
            ->join('orders', 'order_details.id_pesanan', '=', 'orders.id_pesanan')
            ->join('menus', 'order_details.id_menu', '=', 'menus.id_menu')
            ->whereBetween('orders.waktu_pesan', [$rangeStart, $rangeEnd])
            ->where('orders.status_pesanan', '!=', 'Dibatalkan')
            ->groupBy('order_details.id_menu', 'menus.nama_menu')
            ->selectRaw('order_details.id_menu as id_menu, menus.nama_menu as nama_menu, SUM(order_details.jumlah) as qty, SUM(order_details.subtotal) as revenue')
            ->orderByDesc('qty')
            ->limit(5)
            ->get()
            ->map(function ($row) {
                return [
                    'id_menu' => (int) $row->id_menu,
                    'nama_menu' => $row->nama_menu,
                    'qty' => (int) $row->qty,
                    'revenue' => (int) $row->revenue,
                ];
            })
            ->values();

        $recentOrders = Order::with(['tenant', 'user'])
            ->orderByDesc('id_pesanan')
            ->limit(6)
            ->get()
            ->map(function (Order $order) {
                return [
                    'id_pesanan' => (int) $order->id_pesanan,
                    'nomor_antrean' => $order->nomor_antrean,
                    'status_pesanan' => $order->status_pesanan,
                    'total_harga' => (int) $order->total_harga,
                    'waktu_pesan' => $this->stamp($order->waktu_pesan),
                    'tenant_name' => $order->tenant->nama_tenant ?? 'Tenant',
                    'customer_name' => $order->user->nama ?? 'Pengguna',
                ];
            })
            ->values();

        return response()->json([
            'success' => true,
            'message' => 'Statistik admin berhasil diambil.',
            'data' => [
                'today' => [
                    'orders' => $ordersToday,
                    'revenue' => $revenueToday,
                    'awaiting_payment' => Order::where('status_pesanan', 'Menunggu Pembayaran')->count(),
                    'expired_payments' => $expiredPayments,
                    'open_tenants' => Tenant::where('status_buka', true)->count(),
                    'total_tenants' => Tenant::count(),
                    'customers' => User::where('peran', 'Customer')->count(),
                    'vendors' => User::where('peran', 'Vendor')->count(),
                ],
                'totals' => [
                    'orders' => Order::count(),
                    'revenue' => (int) Order::whereIn('status_pesanan', self::PAID_STATUSES)->sum('total_harga'),
                    'users' => User::count(),
                    'tenants' => Tenant::count(),
                    'menus' => DB::table('menus')->count(),
                ],
                'series' => $series,
                'top_tenants' => $topTenants,
                'top_menus' => $topMenus,
                'recent_orders' => $recentOrders,
                'alerts' => [
                    'stale_unpaid' => $staleUnpaid,
                    'expired_payments' => $expiredPayments,
                    'closed_tenants' => Tenant::where('status_buka', false)->count(),
                    'empty_tenants' => Tenant::whereDoesntHave('menus')->count(),
                ],
            ],
        ], 200);
    }
}

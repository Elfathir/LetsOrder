<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Promo;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Laravel\Sanctum\PersonalAccessToken;

class SyncController extends Controller
{
    public function index(Request $request)
    {
        $syncStartedAt = microtime(true);
        $syncLastMark = $syncStartedAt;
        
        $queryStats = [
            'count' => 0,
            'total_ms' => 0,
            'slowest_ms' => 0,
            'slowest_sql' => null,
        ];
        
        DB::listen(function ($query) use (&$queryStats) {
            $queryStats['count']++;
            $queryStats['total_ms'] += $query->time;
        
            if ($query->time > $queryStats['slowest_ms']) {
                $queryStats['slowest_ms'] = $query->time;
                $queryStats['slowest_sql'] = $query->sql;
            }
        });
        
        $bearer = $request->bearerToken();
        $user = $bearer ? Auth::guard('sanctum')->user() : null;

        if ($bearer && !$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        // Sliding token renewal matching ExtendTokenExpirationMiddleware
        if ($user) {
            $token = $user->currentAccessToken();
            if ($token instanceof PersonalAccessToken && $token->expires_at !== null) {
                $days = max(1, (int) env('SESSION_INACTIVITY_DAYS', 5));
                $targetExpiry = now()->addDays($days);
                if ($token->expires_at->lt($targetExpiry->copy()->subMinutes(5))) {
                    $token->forceFill(['expires_at' => $targetExpiry])->saveQuietly();
                }
            }
        }

        $includeCatalog = $request->boolean('catalog', true);
        $compact = $request->boolean('compact_media', true);

        $tenantCtrl = app(TenantController::class);
        $menuCtrl = app(MenuController::class);
        $orderCtrl = app(OrderController::class);
        $promoCtrl = app(PromoController::class);
        $cartCtrl = app(CartController::class);

        $isVendor = $user && strtolower((string) $user->peran) === 'vendor';

        $tenants = null;
        $menus = null;
        $promos = null;
        $vendorTenant = null;
        $vendorMenus = null;
        $vendorPromos = null;
        $vendorReviews = null;

        $syncLastMark = microtime(true);
        if ($includeCatalog) {
            $tenants = $tenantCtrl->indexData(new Request(), $compact);
            $menus = $menuCtrl->indexData(new Request(['include_unavailable' => 'true']), $compact);
            if ($user) {
                $request->setUserResolver(fn () => $user);
            }
            $promoRes = $promoCtrl->index($request);
            $promoDecoded = $promoRes->getData(true);
            $promos = $promoDecoded['data'] ?? [];

            if ($isVendor) {
                $vendorTenant = $tenantCtrl->vendorTenantData((int) $user->id_user, $compact);

                $vendorMenus = $vendorTenant
                    ? $menuCtrl->vendorMenusData(
                        new Request(),
                        $user,
                        $compact,
                        (int) $vendorTenant['id_tenant']
                    )
                    : collect();

                if ($vendorTenant) {
                    $vendorPromos = Promo::where('id_tenant', $vendorTenant['id_tenant'])
                        ->orderByDesc('id_promo')
                        ->get();
                } else {
                    $vendorPromos = [];
                }
                if ($vendorTenant) {
                    $vendorReviews = Review::with([
                        'user:id_user,username,nama',
                        'menu:id_menu,nama_menu',
                        'order:id_pesanan,nomor_antrean',
                    ])
                        ->where('id_tenant', $vendorTenant['id_tenant'])
                        ->orderByDesc('id_review')
                        ->get()
                        ->map(fn (Review $r) => [
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
                        ])
                        ->values();
                } else {
                    $vendorReviews = [];
                }
            }
        } elseif ($isVendor) {
            $vendorTenant = $tenantCtrl->vendorTenantData((int) $user->id_user, $compact);
        }

        Log::info('SYNC timing catalog', [
            'ms' => round((microtime(true) - $syncLastMark) * 1000, 2),
            'catalog' => $includeCatalog,
        ]);
        
        $syncLastMark = microtime(true);
        
        $orders = null;
        $vendorOrders = null;
        $cart = null;
        $notifications = null;

        if ($user) {
            if ($isVendor) {
                $vendorOrders = $orderCtrl->ordersDataForUser($user, true, $compact);
            } else {
                $orders = $orderCtrl->ordersDataForUser($user, false, $compact);
                if (strtolower((string) $user->peran) === 'customer') {
                    $cart = $cartCtrl->cartPayloadForUser((int) $user->id_user, $compact);
                }
            }
            $notifications = Notification::with('order:id_pesanan,id_tenant,nomor_antrean,status_pesanan')
                ->where('id_user', $user->id_user)
                ->orderByDesc('id_notifikasi')
                ->get();
        }

        Log::info('SYNC timing user_data', [
            'ms' => round((microtime(true) - $syncLastMark) * 1000, 2),
        ]);

        $syncLastMark = microtime(true);

        $userPayload = null;
        if ($user) {
            $userPayload = $user->toArray();
            if ($compact && !empty($userPayload['avatar'])) {
                $userPayload['avatar'] = MediaController::compactMediaValue(
                    'user',
                    (int) $user->id_user,
                    $user->avatar,
                    strlen((string) $user->avatar)
                );
            }
            if ($isVendor && $vendorTenant) {
                $userPayload['tenant'] = $vendorTenant;
            }
        }
        
        Log::info('SYNC timing total', [
            'ms' => round((microtime(true) - $syncStartedAt) * 1000, 2),
        ]);

        Log::info('SYNC database queries', [
            'count' => $queryStats['count'],
            'total_ms' => round($queryStats['total_ms'], 2),
            'slowest_ms' => round($queryStats['slowest_ms'], 2),
            'slowest_sql' => $queryStats['slowest_sql'],
        ]);
        
        return response()->json([
            'success' => true,
            'data' => [
                'authenticated' => (bool) $user,
                'user' => $userPayload,
                'tenants' => $tenants,
                'menus' => $menus,
                'promos' => $promos,
                'orders' => $orders,
                'cart' => $cart,
                'notifications' => $notifications,
                'vendor_tenant' => $vendorTenant,
                'vendor_menus' => $vendorMenus,
                'vendor_orders' => $vendorOrders,
                'vendor_promos' => $vendorPromos,
                'vendor_reviews' => $vendorReviews,
            ],
        ], 200);
    }
}

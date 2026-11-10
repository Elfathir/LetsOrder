<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\TenantController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — LetsOrder.com
|--------------------------------------------------------------------------
|
| Seluruh endpoint didukung pada root prefix (/api/*) maupun (/api/v1/*)
| agar kompatibel dengan frontend React dan spesifikasi dokumentasi API.
|
*/

$registerApiRoutes = function () {
    // Health Check
    Route::get('/health', function () {
        return response()->json([
            'success' => true,
            'application' => 'LetsOrder.com',
            'message' => 'API is available.',
        ]);
    });

    // Authentication (Publik & Terautentikasi)
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);

        Route::middleware('auth:sanctum')->group(function () {
            Route::get('/me', [AuthController::class, 'me']);
            Route::post('/logout', [AuthController::class, 'logout']);
        });
    });

    // Public Catalog: Categories, Tenants, Menus
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{id}', [CategoryController::class, 'show'])->whereNumber('id');

    Route::get('/tenants', [TenantController::class, 'index']);
    Route::get('/tenants/{id}', [TenantController::class, 'show'])->whereNumber('id');
    Route::get('/tenants/{id}/menus', [TenantController::class, 'menus'])->whereNumber('id');

    Route::get('/menus', [MenuController::class, 'index']);
    Route::get('/menus/{id}', [MenuController::class, 'show'])->whereNumber('id');

    // Protected Endpoints (Sanctum)
    Route::middleware('auth:sanctum')->group(function () {
        // Notification API (Seluruh pengguna terautentikasi pada notifikasi miliknya)
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::patch('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
        Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->whereNumber('id');
        Route::patch('/notifications/{id}', [NotificationController::class, 'markAsRead'])->whereNumber('id');

        // Cart API (Khusus Customer)
        Route::middleware('role:Customer')->group(function () {
            Route::get('/cart', [CartController::class, 'index']);
            Route::delete('/cart', [CartController::class, 'clearCart']);
            Route::post('/cart/items', [CartController::class, 'storeItem']);
            Route::put('/cart/items/{id}', [CartController::class, 'updateItem'])->whereNumber('id');
            Route::patch('/cart/items/{id}', [CartController::class, 'updateItem'])->whereNumber('id');
            Route::delete('/cart/items/{id}', [CartController::class, 'destroyItem'])->whereNumber('id');

            // Pembuatan Pesanan oleh Customer
            Route::post('/orders', [OrderController::class, 'store']);
        });

        // Order, Payment, & Order Tracking API
        Route::get('/orders', [OrderController::class, 'index'])
            ->middleware('role:Customer,Administrator');

        Route::get('/orders/{id}', [OrderController::class, 'show'])
            ->whereNumber('id')
            ->middleware('role:Customer,Vendor,Administrator');

        Route::get('/orders/{id}/status', [OrderController::class, 'status'])
            ->whereNumber('id')
            ->middleware('role:Customer,Vendor,Administrator');

        Route::get('/orders/{id}/status-history', [OrderController::class, 'statusHistory'])
            ->whereNumber('id')
            ->middleware('role:Customer,Vendor,Administrator');

        Route::patch('/orders/{id}/status', [OrderController::class, 'updateStatus'])
            ->whereNumber('id')
            ->middleware('role:Vendor,Administrator');

        Route::post('/orders/{id}/payment', [PaymentController::class, 'store'])
            ->whereNumber('id')
            ->middleware('role:Customer,Administrator');

        Route::get('/orders/{id}/payment', [PaymentController::class, 'showByOrder'])
            ->whereNumber('id')
            ->middleware('role:Customer,Vendor,Administrator');

        Route::post('/orders/{id}/payment/verify', [PaymentController::class, 'verifyByOrder'])
            ->whereNumber('id')
            ->middleware('role:Customer,Vendor,Administrator');

        Route::patch('/payments/{id}/verification', [PaymentController::class, 'verify'])
            ->whereNumber('id')
            ->middleware('role:Customer,Vendor,Administrator');

        // Vendor API & Pengelolaan Tenant/Menu/Pesanan
        Route::middleware('role:Vendor,Administrator')->group(function () {
            // Endpoint langsung pada /tenants/{id} dan /menus sesuai API Specification
            Route::put('/tenants/{id}', [TenantController::class, 'update'])->whereNumber('id');
            Route::patch('/tenants/{id}', [TenantController::class, 'update'])->whereNumber('id');

            Route::post('/menus', [MenuController::class, 'store']);
            Route::put('/menus/{id}', [MenuController::class, 'update'])->whereNumber('id');
            Route::patch('/menus/{id}', [MenuController::class, 'update'])->whereNumber('id');
            Route::delete('/menus/{id}', [MenuController::class, 'destroy'])->whereNumber('id');
            Route::patch('/menus/{id}/availability', [MenuController::class, 'updateAvailability'])->whereNumber('id');

            // Endpoint dengan prefix /vendor/*
            Route::prefix('vendor')->group(function () {
                Route::get('/tenant', [TenantController::class, 'vendorTenant']);
                Route::put('/tenant', [TenantController::class, 'updateVendorTenant']);
                Route::patch('/tenant', [TenantController::class, 'updateVendorTenant']);

                Route::get('/menus', [MenuController::class, 'vendorMenus']);
                Route::post('/menus', [MenuController::class, 'store']);
                Route::put('/menus/{id}', [MenuController::class, 'update'])->whereNumber('id');
                Route::patch('/menus/{id}', [MenuController::class, 'update'])->whereNumber('id');
                Route::delete('/menus/{id}', [MenuController::class, 'destroy'])->whereNumber('id');
                Route::patch('/menus/{id}/availability', [MenuController::class, 'updateAvailability'])->whereNumber('id');

                Route::get('/orders', [OrderController::class, 'vendorOrders']);
                Route::get('/orders/{id}', [OrderController::class, 'vendorOrderShow'])->whereNumber('id');
                Route::patch('/orders/{id}/status', [OrderController::class, 'updateStatus'])->whereNumber('id');
            });
        });

        // Administrator API
        Route::prefix('admin')->middleware('role:Administrator')->group(function () {
            Route::get('/users', [AdminController::class, 'users']);
            Route::get('/users/{id}', [AdminController::class, 'showUser'])->whereNumber('id');
            Route::put('/users/{id}', [AdminController::class, 'updateUser'])->whereNumber('id');
            Route::patch('/users/{id}', [AdminController::class, 'updateUser'])->whereNumber('id');

            Route::get('/tenants', [AdminController::class, 'tenants']);
            Route::post('/tenants', [AdminController::class, 'storeTenant']);
            Route::get('/tenants/{id}', [AdminController::class, 'showTenant'])->whereNumber('id');
            Route::put('/tenants/{id}', [AdminController::class, 'updateTenant'])->whereNumber('id');
            Route::patch('/tenants/{id}', [AdminController::class, 'updateTenant'])->whereNumber('id');
            Route::delete('/tenants/{id}', [AdminController::class, 'destroyTenant'])->whereNumber('id');
        });
    });
};

// Registrasi di /api/* dan /api/v1/*
$registerApiRoutes();
Route::prefix('v1')->group($registerApiRoutes);

<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\MenuController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| API routes are intended to be stateless and are normally assigned the
| /api prefix by the Laravel application bootstrap configuration.
| Business endpoints should be added when their controllers, validation,
| authorization rules, and database models are implemented.
|
*/

Route::get('/health', function () {
    return response()->json([
        'success' => true,
        'application' => 'LetsOrder.com',
        'message' => 'API is available.',
    ]);
});

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/menus', [MenuController::class, 'index']);

/*
|--------------------------------------------------------------------------
| Planned API groups
|--------------------------------------------------------------------------
|
| Keep these groups as implementation guidance. Do not uncomment routes
| until the corresponding controllers and middleware exist.
|
| Authentication:
| - POST /api/auth/register
| - POST /api/auth/login
| - POST /api/auth/logout
|
| Customer:
| - GET    /api/categories
| - GET    /api/menus
| - GET    /api/menus/{menu}
| - GET    /api/cart
| - POST   /api/cart/items
| - PATCH  /api/cart/items/{item}
| - DELETE /api/cart/items/{item}
| - POST   /api/orders
| - GET    /api/orders
| - GET    /api/orders/{order}
| - GET    /api/notifications
| - PATCH  /api/notifications/{notification}
|
| Vendor:
| - GET    /api/vendor/tenant
| - PATCH  /api/vendor/tenant
| - GET    /api/vendor/menus
| - POST   /api/vendor/menus
| - GET    /api/vendor/orders
| - GET    /api/vendor/orders/{order}
| - PATCH  /api/vendor/orders/{order}/status
|
| Administrator:
| - GET    /api/admin/users
| - PATCH  /api/admin/users/{user}
| - GET    /api/admin/tenants
| - PATCH  /api/admin/tenants/{tenant}
|
| Payment verification permissions and exact payment flow must be
| confirmed before implementing payment mutation endpoints.
| Payment is a simulation only; no real payment gateway is integrated.
|
*/

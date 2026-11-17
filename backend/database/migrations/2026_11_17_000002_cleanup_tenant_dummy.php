<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('tenants')) {
            return;
        }

        DB::transaction(function () {
            $dummyTenantQuery = DB::table('tenants')
                ->whereRaw("LOWER(TRIM(nama_tenant)) IN ('tenant dummy', 'kantin sejahtera', 'warung nusantara')")
                ->orWhereRaw("LOWER(nama_tenant) LIKE '%dummy%'");

            $dummyTenantIds = $dummyTenantQuery->pluck('id_tenant')->all();
            $dummyOwnerUserIds = !empty($dummyTenantIds)
                ? DB::table('tenants')->whereIn('id_tenant', $dummyTenantIds)->pluck('id_user')->filter()->unique()->values()->all()
                : [];

            $dummyNamedUserIds = Schema::hasTable('users')
                ? DB::table('users')
                    ->whereRaw("LOWER(username) LIKE '%dummy%' OR LOWER(email) LIKE '%dummy%' OR LOWER(nama) LIKE '%dummy%'")
                    ->orWhere(function ($q) {
                        $q->whereIn('username', ['admin', 'vendor01', 'vendor02', 'customer01'])
                            ->whereIn('email', [
                                'admin@upnvj.ac.id',
                                'sejahtera@upnvj.ac.id',
                                'nusantara@upnvj.ac.id',
                                'customer@upnvj.ac.id',
                            ]);
                    })
                    ->pluck('id_user')
                    ->all()
                : [];

            $dummyUserIds = array_values(array_unique(array_merge($dummyOwnerUserIds, $dummyNamedUserIds)));

            if (!empty($dummyUserIds)) {
                $extraTenantIds = DB::table('tenants')->whereIn('id_user', $dummyUserIds)->pluck('id_tenant')->all();
                $dummyTenantIds = array_values(array_unique(array_merge($dummyTenantIds, $extraTenantIds)));
            }

            if (empty($dummyTenantIds) && empty($dummyUserIds)) {
                return;
            }

            $dummyMenuIds = !empty($dummyTenantIds) && Schema::hasTable('menus')
                ? DB::table('menus')->whereIn('id_tenant', $dummyTenantIds)->pluck('id_menu')->all()
                : [];

            $orderIds = collect();
            if (Schema::hasTable('orders')) {
                if (!empty($dummyTenantIds)) {
                    $orderIds = $orderIds->merge(DB::table('orders')->whereIn('id_tenant', $dummyTenantIds)->pluck('id_pesanan'));
                }
                if (!empty($dummyUserIds)) {
                    $orderIds = $orderIds->merge(DB::table('orders')->whereIn('id_user', $dummyUserIds)->pluck('id_pesanan'));
                }
                if (!empty($dummyMenuIds) && Schema::hasTable('order_details')) {
                    $orderIds = $orderIds->merge(DB::table('order_details')->whereIn('id_menu', $dummyMenuIds)->pluck('id_pesanan'));
                }
            }
            $dummyOrderIds = $orderIds->unique()->values()->all();

            if (!empty($dummyOrderIds)) {
                if (Schema::hasTable('notifications')) {
                    DB::table('notifications')->whereIn('id_pesanan', $dummyOrderIds)->delete();
                }
                if (Schema::hasTable('status_histories')) {
                    DB::table('status_histories')->whereIn('id_pesanan', $dummyOrderIds)->delete();
                }
                if (Schema::hasTable('payments')) {
                    DB::table('payments')->whereIn('id_pesanan', $dummyOrderIds)->delete();
                }
                if (Schema::hasTable('reviews')) {
                    DB::table('reviews')->whereIn('id_pesanan', $dummyOrderIds)->delete();
                }
                if (Schema::hasTable('order_details')) {
                    DB::table('order_details')->whereIn('id_pesanan', $dummyOrderIds)->delete();
                }
                DB::table('orders')->whereIn('id_pesanan', $dummyOrderIds)->delete();
            }

            if (Schema::hasTable('reviews')) {
                if (!empty($dummyTenantIds)) {
                    DB::table('reviews')->whereIn('id_tenant', $dummyTenantIds)->delete();
                }
                if (!empty($dummyMenuIds)) {
                    DB::table('reviews')->whereIn('id_menu', $dummyMenuIds)->delete();
                }
                if (!empty($dummyUserIds)) {
                    DB::table('reviews')->whereIn('id_user', $dummyUserIds)->delete();
                }
            }

            if (!empty($dummyMenuIds)) {
                if (Schema::hasTable('cart_items')) {
                    DB::table('cart_items')->whereIn('id_menu', $dummyMenuIds)->delete();
                }
                DB::table('menus')->whereIn('id_menu', $dummyMenuIds)->delete();
            }

            if (!empty($dummyTenantIds) && Schema::hasTable('promos')) {
                DB::table('promos')->whereIn('id_tenant', $dummyTenantIds)->delete();
            }

            if (!empty($dummyTenantIds)) {
                DB::table('tenants')->whereIn('id_tenant', $dummyTenantIds)->delete();
            }

            if (!empty($dummyUserIds)) {
                if (Schema::hasTable('carts')) {
                    $cartIds = DB::table('carts')->whereIn('id_user', $dummyUserIds)->pluck('id_keranjang')->all();
                    if (!empty($cartIds) && Schema::hasTable('cart_items')) {
                        DB::table('cart_items')->whereIn('id_keranjang', $cartIds)->delete();
                    }
                    DB::table('carts')->whereIn('id_user', $dummyUserIds)->delete();
                }
                if (Schema::hasTable('notifications')) {
                    DB::table('notifications')->whereIn('id_user', $dummyUserIds)->delete();
                }
                if (Schema::hasTable('personal_access_tokens')) {
                    DB::table('personal_access_tokens')
                        ->where('tokenable_type', 'App\\Models\\User')
                        ->whereIn('tokenable_id', $dummyUserIds)
                        ->delete();
                }
                DB::table('users')->whereIn('id_user', $dummyUserIds)->delete();
            }
        });
    }

    public function down(): void
    {
        // One-way cleanup of dummy tenants and associated test accounts.
    }
};

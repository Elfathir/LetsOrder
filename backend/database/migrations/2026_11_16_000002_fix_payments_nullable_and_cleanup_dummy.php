<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('payments')) {
            Schema::table('payments', function (Blueprint $table) {
                $table->dateTime('waktu_bayar')->nullable()->change();
                $table->string('kode_qris', 255)->nullable()->change();
            });
        }

        if (Schema::hasTable('orders')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->text('catatan')->nullable()->change();
            });
        }

        if (Schema::hasTable('categories')) {
            $categoryRenameMap = [
                'Makanan' => 'Rice & Mains',
                'Camilan' => 'Snacks',
                'Minuman' => 'Drinks',
            ];
            foreach ($categoryRenameMap as $oldName => $newName) {
                $targetExists = DB::table('categories')->where('nama_kategori', $newName)->exists();
                if (!$targetExists) {
                    DB::table('categories')
                        ->where('nama_kategori', $oldName)
                        ->update(['nama_kategori' => $newName]);
                }
            }
        }

        DB::transaction(function () {
            $dummyUserIds = DB::table('users')
                ->where(function ($q) {
                    $q->whereIn('username', ['admin', 'vendor01', 'vendor02', 'customer01'])
                        ->whereIn('email', [
                            'admin@upnvj.ac.id',
                            'sejahtera@upnvj.ac.id',
                            'nusantara@upnvj.ac.id',
                            'customer@upnvj.ac.id',
                        ]);
                })
                ->pluck('id_user')
                ->all();

            $dummyTenantIds = DB::table('tenants')
                ->where(function ($q) use ($dummyUserIds) {
                    $q->whereIn('logo', ['tenant/kantin-sejahtera.png', 'tenant/warung-nusantara.png']);
                    if (!empty($dummyUserIds)) {
                        $q->orWhereIn('id_user', $dummyUserIds);
                    }
                })
                ->pluck('id_tenant')
                ->all();

            $dummyMenuIds = DB::table('menus')
                ->where(function ($q) use ($dummyTenantIds) {
                    $q->whereIn('gambar', [
                        'menu/ayam-geprek.png',
                        'menu/mie-ayam-bakso.png',
                        'menu/es-teh.png',
                        'menu/tahu-crispy.png',
                        'menu/nasi-goreng.png',
                        'menu/soto-ayam.png',
                        'menu/es-jeruk.png',
                        'menu/pisang-keju.png',
                    ]);
                    if (!empty($dummyTenantIds)) {
                        $q->orWhereIn('id_tenant', $dummyTenantIds);
                    }
                })
                ->pluck('id_menu')
                ->all();

            $dummyOrderIds = collect();
            if (!empty($dummyTenantIds)) {
                $dummyOrderIds = $dummyOrderIds->merge(
                    DB::table('orders')->whereIn('id_tenant', $dummyTenantIds)->pluck('id_pesanan')
                );
            }
            if (!empty($dummyUserIds)) {
                $dummyOrderIds = $dummyOrderIds->merge(
                    DB::table('orders')->whereIn('id_user', $dummyUserIds)->pluck('id_pesanan')
                );
            }
            if (!empty($dummyMenuIds)) {
                $dummyOrderIds = $dummyOrderIds->merge(
                    DB::table('order_details')->whereIn('id_menu', $dummyMenuIds)->pluck('id_pesanan')
                );
            }
            $dummyOrderIds = $dummyOrderIds->unique()->values()->all();

            if (!empty($dummyOrderIds)) {
                DB::table('notifications')->whereIn('id_pesanan', $dummyOrderIds)->delete();
                DB::table('status_histories')->whereIn('id_pesanan', $dummyOrderIds)->delete();
                DB::table('payments')->whereIn('id_pesanan', $dummyOrderIds)->delete();
                DB::table('order_details')->whereIn('id_pesanan', $dummyOrderIds)->delete();
                DB::table('orders')->whereIn('id_pesanan', $dummyOrderIds)->delete();
            }

            if (!empty($dummyMenuIds)) {
                DB::table('cart_items')->whereIn('id_menu', $dummyMenuIds)->delete();
                DB::table('menus')->whereIn('id_menu', $dummyMenuIds)->delete();
            }

            if (!empty($dummyUserIds)) {
                $dummyCartIds = DB::table('carts')->whereIn('id_user', $dummyUserIds)->pluck('id_keranjang')->all();
                if (!empty($dummyCartIds)) {
                    DB::table('cart_items')->whereIn('id_keranjang', $dummyCartIds)->delete();
                    DB::table('carts')->whereIn('id_keranjang', $dummyCartIds)->delete();
                }
                DB::table('notifications')->whereIn('id_user', $dummyUserIds)->delete();
            }

            if (!empty($dummyTenantIds)) {
                DB::table('tenants')->whereIn('id_tenant', $dummyTenantIds)->delete();
            }

            if (!empty($dummyUserIds)) {
                if (Schema::hasTable('personal_access_tokens')) {
                    DB::table('personal_access_tokens')
                        ->whereIn('tokenable_id', $dummyUserIds)
                        ->delete();
                }
                DB::table('users')->whereIn('id_user', $dummyUserIds)->delete();
            }
        });
    }

    public function down(): void
    {
        // One-way cleanup of legacy dummy seed rows and nullable constraint fix.
    }
};

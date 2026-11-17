<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('tenants')) {
            Schema::table('tenants', function (Blueprint $table) {
                if (!Schema::hasColumn('tenants', 'jam_buka')) {
                    $table->string('jam_buka', 10)->nullable()->default('07:00');
                }
                if (!Schema::hasColumn('tenants', 'jam_tutup')) {
                    $table->string('jam_tutup', 10)->nullable()->default('21:00');
                }
                if (!Schema::hasColumn('tenants', 'auto_schedule')) {
                    $table->boolean('auto_schedule')->default(false);
                }
            });
        }

        if (!Schema::hasTable('reviews')) {
            Schema::create('reviews', function (Blueprint $table) {
                $table->increments('id_review');
                $table->unsignedInteger('id_pesanan');
                $table->unsignedInteger('id_user');
                $table->unsignedInteger('id_tenant');
                $table->unsignedInteger('id_menu');
                $table->unsignedTinyInteger('rating');
                $table->text('komentar')->nullable();
                $table->dateTime('dibuat_pada')->nullable();

                $table->foreign('id_pesanan')->references('id_pesanan')->on('orders');
                $table->foreign('id_user')->references('id_user')->on('users');
                $table->foreign('id_tenant')->references('id_tenant')->on('tenants');
                $table->foreign('id_menu')->references('id_menu')->on('menus');
            });
        }

        if (!Schema::hasTable('promos')) {
            Schema::create('promos', function (Blueprint $table) {
                $table->increments('id_promo');
                $table->unsignedInteger('id_tenant')->nullable();
                $table->string('kode_promo', 32)->unique();
                $table->string('judul', 120);
                $table->string('tipe', 20)->default('fixed');
                $table->integer('diskon');
                $table->integer('minimal_belanja')->default(0);
                $table->boolean('aktif')->default(true);

                $table->foreign('id_tenant')->references('id_tenant')->on('tenants');
            });
        }

        // Remove any remaining seeded dummy tenants/menus by exact legacy seed names
        DB::transaction(function () {
            $dummyTenantIds = DB::table('tenants')
                ->whereIn('nama_tenant', ['Kantin Sejahtera', 'Warung Nusantara'])
                ->pluck('id_tenant')
                ->all();

            if (!empty($dummyTenantIds)) {
                $dummyMenuIds = DB::table('menus')
                    ->whereIn('id_tenant', $dummyTenantIds)
                    ->pluck('id_menu')
                    ->all();

                $dummyOrderIds = DB::table('orders')
                    ->whereIn('id_tenant', $dummyTenantIds)
                    ->pluck('id_pesanan')
                    ->all();

                if (!empty($dummyOrderIds)) {
                    DB::table('notifications')->whereIn('id_pesanan', $dummyOrderIds)->delete();
                    DB::table('status_histories')->whereIn('id_pesanan', $dummyOrderIds)->delete();
                    DB::table('payments')->whereIn('id_pesanan', $dummyOrderIds)->delete();
                    if (Schema::hasTable('reviews')) {
                        DB::table('reviews')->whereIn('id_pesanan', $dummyOrderIds)->delete();
                    }
                    DB::table('order_details')->whereIn('id_pesanan', $dummyOrderIds)->delete();
                    DB::table('orders')->whereIn('id_pesanan', $dummyOrderIds)->delete();
                }

                if (!empty($dummyMenuIds)) {
                    DB::table('cart_items')->whereIn('id_menu', $dummyMenuIds)->delete();
                    DB::table('menus')->whereIn('id_menu', $dummyMenuIds)->delete();
                }

                DB::table('tenants')->whereIn('id_tenant', $dummyTenantIds)->delete();
            }
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('promos');
        Schema::dropIfExists('reviews');
        if (Schema::hasTable('tenants')) {
            Schema::table('tenants', function (Blueprint $table) {
                $cols = array_filter([
                    Schema::hasColumn('tenants', 'jam_buka') ? 'jam_buka' : null,
                    Schema::hasColumn('tenants', 'jam_tutup') ? 'jam_tutup' : null,
                    Schema::hasColumn('tenants', 'auto_schedule') ? 'auto_schedule' : null,
                ]);
                if (!empty($cols)) {
                    $table->dropColumn($cols);
                }
            });
        }
    }
};

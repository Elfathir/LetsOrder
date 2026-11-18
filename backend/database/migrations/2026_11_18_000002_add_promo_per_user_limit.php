<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('promos') && !Schema::hasColumn('promos', 'batas_per_user')) {
            Schema::table('promos', function (Blueprint $table) {
                $table->unsignedInteger('batas_per_user')->default(1)->after('minimal_belanja');
            });
        }

        if (Schema::hasTable('orders') && !Schema::hasColumn('orders', 'promo_code')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->string('promo_code', 32)->nullable()->after('total_harga');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('promos') && Schema::hasColumn('promos', 'batas_per_user')) {
            Schema::table('promos', function (Blueprint $table) {
                $table->dropColumn('batas_per_user');
            });
        }

        if (Schema::hasTable('orders') && Schema::hasColumn('orders', 'promo_code')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->dropColumn('promo_code');
            });
        }
    }
};

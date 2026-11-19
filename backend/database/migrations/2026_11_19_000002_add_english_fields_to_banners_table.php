<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('banners')) {
            return;
        }

        Schema::table('banners', function (Blueprint $table) {
            if (!Schema::hasColumn('banners', 'tag_en')) {
                $table->string('tag_en', 80)->nullable()->after('tag');
            }
            if (!Schema::hasColumn('banners', 'judul_en')) {
                $table->string('judul_en', 160)->nullable()->after('judul');
            }
            if (!Schema::hasColumn('banners', 'deskripsi_en')) {
                $table->text('deskripsi_en')->nullable()->after('deskripsi');
            }
            if (!Schema::hasColumn('banners', 'cta_primary_en')) {
                $table->string('cta_primary_en', 60)->nullable()->after('cta_secondary');
            }
            if (!Schema::hasColumn('banners', 'cta_secondary_en')) {
                $table->string('cta_secondary_en', 60)->nullable()->after('cta_primary_en');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('banners')) {
            return;
        }

        Schema::table('banners', function (Blueprint $table) {
            foreach (['tag_en', 'judul_en', 'deskripsi_en', 'cta_primary_en', 'cta_secondary_en'] as $column) {
                if (Schema::hasColumn('banners', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};

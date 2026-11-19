<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('banners')) {
            Schema::create('banners', function (Blueprint $table) {
                $table->increments('id_banner');
                $table->string('tag', 80)->nullable();
                $table->string('judul', 160);
                $table->text('deskripsi')->nullable();
                $table->longText('gambar')->nullable();
                $table->string('cta_primary', 60)->nullable();
                $table->string('cta_secondary', 60)->nullable();
                $table->unsignedInteger('urutan')->default(1);
                $table->boolean('aktif')->default(true);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('banners');
    }
};

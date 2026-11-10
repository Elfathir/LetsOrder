<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('menus', function (Blueprint $table) {
            $table->increments('id_menu');
            $table->unsignedInteger('id_tenant');
            $table->unsignedInteger('id_kategori');
            $table->string('nama_menu', 100);
            $table->text('deskripsi');
            $table->string('gambar', 255);
            $table->integer('harga');
            $table->integer('estimasi_menit');
            $table->boolean('status_tersedia');

            $table->foreign('id_tenant')
                ->references('id_tenant')
                ->on('tenants');

            $table->foreign('id_kategori')
                ->references('id_kategori')
                ->on('categories');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menus');
    }
};

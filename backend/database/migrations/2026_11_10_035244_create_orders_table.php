<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->increments('id_pesanan');
            $table->unsignedInteger('id_user');
            $table->unsignedInteger('id_tenant');
            $table->string('nomor_antrean', 30);
            $table->string('status_pesanan', 30);
            $table->integer('total_harga');
            $table->text('catatan')->nullable();
            $table->dateTime('waktu_pesan');

            $table->foreign('id_user')
                ->references('id_user')
                ->on('users');

            $table->foreign('id_tenant')
                ->references('id_tenant')
                ->on('tenants');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
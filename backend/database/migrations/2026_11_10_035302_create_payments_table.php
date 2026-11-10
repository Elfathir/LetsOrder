<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->increments('id_pembayaran');
            $table->unsignedInteger('id_pesanan');
            $table->string('metode_pembayaran', 50);
            $table->string('kode_qris', 255)->nullable();
            $table->integer('total_bayar');
            $table->string('status_verifikasi', 30);
            $table->dateTime('batas_waktu');
            $table->dateTime('waktu_bayar')->nullable();

            $table->foreign('id_pesanan')
                ->references('id_pesanan')
                ->on('orders');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
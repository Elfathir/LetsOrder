<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('order_messages')) {
            return;
        }

        Schema::create('order_messages', function (Blueprint $table) {
            $table->increments('id_pesan');
            $table->unsignedInteger('id_pesanan');
            $table->unsignedInteger('id_pengirim');
            $table->string('peran_pengirim', 20);
            $table->string('nama_pengirim', 120);
            $table->text('teks')->nullable();
            $table->longText('gambar')->nullable();
            $table->dateTime('waktu');

            $table->index('id_pesanan');
            $table->foreign('id_pesanan')->references('id_pesanan')->on('orders')->cascadeOnDelete();
            $table->foreign('id_pengirim')->references('id_user')->on('users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_messages');
    }
};

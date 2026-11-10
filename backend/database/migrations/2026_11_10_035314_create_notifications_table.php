<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->increments('id_notifikasi');
            $table->unsignedInteger('id_user');
            $table->unsignedInteger('id_pesanan');
            $table->text('pesan');
            $table->boolean('status_baca');

            $table->foreign('id_user')
                ->references('id_user')
                ->on('users');

            $table->foreign('id_pesanan')
                ->references('id_pesanan')
                ->on('orders');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
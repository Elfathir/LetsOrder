<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('status_histories', function (Blueprint $table) {
            $table->increments('id_riwayat');
            $table->unsignedInteger('id_pesanan');
            $table->string('status', 30);
            $table->dateTime('waktu');

            $table->foreign('id_pesanan')
                ->references('id_pesanan')
                ->on('orders');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('status_histories');
    }
};
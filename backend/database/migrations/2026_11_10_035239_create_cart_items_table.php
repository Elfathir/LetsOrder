<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cart_items', function (Blueprint $table) {
            $table->increments('id_item_keranjang');
            $table->unsignedInteger('id_keranjang');
            $table->unsignedInteger('id_menu');
            $table->integer('jumlah');
            $table->text('catatan')->nullable();

            $table->foreign('id_keranjang')
                ->references('id_keranjang')
                ->on('carts');

            $table->foreign('id_menu')
                ->references('id_menu')
                ->on('menus');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cart_items');
    }
};

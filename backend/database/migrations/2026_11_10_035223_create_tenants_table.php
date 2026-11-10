<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->increments('id_tenant');
            $table->unsignedInteger('id_user');
            $table->string('nama_tenant', 100);
            $table->text('deskripsi');
            $table->string('logo', 255);
            $table->boolean('status_buka');

            $table->foreign('id_user')
                ->references('id_user')
                ->on('users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};

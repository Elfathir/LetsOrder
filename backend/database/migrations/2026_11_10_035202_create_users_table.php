<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->increments('id_user');
            $table->string('username', 50);
            $table->string('nama', 100);
            $table->string('email', 100);
            $table->string('password', 255);
            $table->string('peran', 30);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};

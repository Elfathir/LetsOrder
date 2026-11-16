<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('menus', function (Blueprint $table) {
            $table->longText('gambar')->nullable()->change();
        });

        Schema::table('tenants', function (Blueprint $table) {
            $table->longText('logo')->nullable()->change();
        });

        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'no_telp')) {
                $table->string('no_telp', 30)->nullable();
            }
            if (!Schema::hasColumn('users', 'jenis_kelamin')) {
                $table->string('jenis_kelamin', 20)->nullable();
            }
            if (!Schema::hasColumn('users', 'tanggal_lahir')) {
                $table->string('tanggal_lahir', 20)->nullable();
            }
            if (!Schema::hasColumn('users', 'avatar')) {
                $table->longText('avatar')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('menus', function (Blueprint $table) {
            $table->string('gambar', 255)->nullable()->change();
        });

        Schema::table('tenants', function (Blueprint $table) {
            $table->string('logo', 255)->nullable()->change();
        });

        Schema::table('users', function (Blueprint $table) {
            $cols = array_filter([
                Schema::hasColumn('users', 'no_telp') ? 'no_telp' : null,
                Schema::hasColumn('users', 'jenis_kelamin') ? 'jenis_kelamin' : null,
                Schema::hasColumn('users', 'tanggal_lahir') ? 'tanggal_lahir' : null,
                Schema::hasColumn('users', 'avatar') ? 'avatar' : null,
            ]);
            if (!empty($cols)) {
                $table->dropColumn($cols);
            }
        });
    }
};

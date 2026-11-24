<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** Tabel yang menyimpan foto yang bisa diatur posisinya. */
    private const TABLES = ['users', 'tenants', 'menus', 'banners'];

    public function up(): void
    {
        foreach (self::TABLES as $tableName) {
            if (!Schema::hasTable($tableName)) {
                continue;
            }

            Schema::table($tableName, function (Blueprint $table) {
                if (!Schema::hasColumn($table->getTable(), 'foto_x')) {
                    $table->decimal('foto_x', 5, 2)->default(50.00);
                }
                if (!Schema::hasColumn($table->getTable(), 'foto_y')) {
                    $table->decimal('foto_y', 5, 2)->default(50.00);
                }
                if (!Schema::hasColumn($table->getTable(), 'foto_zoom')) {
                    $table->decimal('foto_zoom', 4, 2)->default(1.00);
                }
            });
        }
    }

    public function down(): void
    {
        foreach (self::TABLES as $tableName) {
            if (!Schema::hasTable($tableName)) {
                continue;
            }

            $columns = array_values(array_filter([
                Schema::hasColumn($tableName, 'foto_x') ? 'foto_x' : null,
                Schema::hasColumn($tableName, 'foto_y') ? 'foto_y' : null,
                Schema::hasColumn($tableName, 'foto_zoom') ? 'foto_zoom' : null,
            ]));

            if (!empty($columns)) {
                Schema::table($tableName, function (Blueprint $table) use ($columns) {
                    $table->dropColumn($columns);
                });
            }
        }
    }
};

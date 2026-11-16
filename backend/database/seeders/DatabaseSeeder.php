<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Only seed master categories so tenants & menus start empty until uploaded by real users.
        $this->call([
            CategorySeeder::class,
        ]);
    }
}

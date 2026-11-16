<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Disabled: start with a clean user table (real accounts sign up via /api/auth/register).
     */
    public function run(): void
    {
        // Intentionally left empty so no dummy accounts are seeded.
    }
}

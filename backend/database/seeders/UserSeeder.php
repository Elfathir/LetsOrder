<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'username' => 'admin',
                'nama' => 'Administrator Kantin UPNVJ',
                'email' => 'admin@upnvj.ac.id',
                'password' => Hash::make('password123'),
                'peran' => 'Administrator',
            ],
            [
                'username' => 'vendor01',
                'nama' => 'Pengelola Kantin Sejahtera',
                'email' => 'sejahtera@upnvj.ac.id',
                'password' => Hash::make('password123'),
                'peran' => 'Vendor',
            ],
            [
                'username' => 'vendor02',
                'nama' => 'Pengelola Warung Nusantara',
                'email' => 'nusantara@upnvj.ac.id',
                'password' => Hash::make('password123'),
                'peran' => 'Vendor',
            ],
            [
                'username' => 'customer01',
                'nama' => 'Mahasiswa UPNVJ',
                'email' => 'customer@upnvj.ac.id',
                'password' => Hash::make('password123'),
                'peran' => 'Customer',
            ],
        ];

        foreach ($users as $user) {
            User::updateOrCreate(
                ['username' => $user['username']],
                $user
            );
        }
    }
}


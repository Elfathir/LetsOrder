<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use RuntimeException;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $username = trim((string) config('services.admin.username'));
        $email = strtolower(trim((string) config('services.admin.email')));
        $password = (string) config('services.admin.password');

        if ($username === '' || $email === '' || $password === '') {
            throw new RuntimeException(
                'ADMIN_USERNAME, ADMIN_EMAIL, dan ADMIN_PASSWORD wajib diisi.'
            );
        }

        $existingUsers = User::where('username', $username)
            ->orWhere('email', $email)
            ->get();

        if ($existingUsers->count() > 1) {
            throw new RuntimeException(
                'Username dan email Administrator terkait dengan akun berbeda.'
            );
        }

        if ($existingUsers->count() === 1) {
            $user = $existingUsers->first();

            if (
                $user->peran !== 'Administrator' ||
                $user->username !== $username ||
                strtolower($user->email) !== $email
            ) {
                throw new RuntimeException(
                    'Username atau email Administrator sudah digunakan akun lain.'
                );
            }

            $this->command?->info('Akun Administrator sudah tersedia.');

            return;
        }

        User::create([
            'username' => $username,
            'nama' => $username,
            'email' => $email,
            'password' => $password,
            'peran' => 'Administrator',
        ]);

        $this->command?->info('Akun Administrator berhasil dibuat.');
    }
}

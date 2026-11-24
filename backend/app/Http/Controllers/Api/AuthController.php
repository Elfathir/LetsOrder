<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\ImageValidator;
use App\Support\PhotoFocus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

use Illuminate\Support\Facades\Log;

use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Cek ketersediaan username dan email tanpa menulis ke database.
     */
    public function checkAvailability(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|string|max:50',
            'email' => 'required|email|max:100',
        ]);

        $username = strtolower(trim($validated['username']));
        $email = strtolower(trim($validated['email']));

        $exists = User::whereRaw('LOWER(username) = ?', [$username])
            ->orWhereRaw('LOWER(email) = ?', [$email])
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'Username atau email sudah terdaftar. Silakan gunakan yang lain atau login.',
            ], 422);
        }

        return response()->json([
            'success' => true,
            'available' => true,
        ]);
    }

    /**
     * Registrasi Customer.
     */
    public function register(Request $request)
    {
        $passwordRule = $request->has('password_confirmation')
            ? 'required|string|min:6|confirmed'
            : 'required|string|min:6';

        $validated = $request->validate([
            'username' => 'required|string|max:50|unique:users,username',
            'nama' => 'nullable|string|max:100',
            'email' => 'required|email|max:100|unique:users,email',
            'password' => $passwordRule,
            'peran' => 'nullable|string|in:Customer,Vendor',
        ]);

        $peran = $validated['peran'] ?? 'Customer';
        $nama = $validated['nama'] ?? $validated['username'];

        $user = User::create([
            'username' => $validated['username'],
            'nama' => $nama,
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'peran' => $peran,
        ]);

        if ($peran === 'Vendor') {
            $tenant = \App\Models\Tenant::create([
                'id_user' => $user->id_user,
                'nama_tenant' => $request->input('nama_tenant') ?: $nama,
                'deskripsi' => '',
                'logo' => '',
                'status_buka' => true,
            ]);
            $user->setRelation('tenant', $tenant);
        }

        $token = $this->issueApiToken($user);

        return response()->json([
            'success' => true,
            'message' => 'Registrasi berhasil.',
            'data' => [
                'access_token' => $token,
                'token' => $token,
                'token_type' => 'Bearer',
                'user' => $user,
            ],
        ], 201);
    }

    /**
     * Login menggunakan username atau email.
     */
    public function login(Request $request)
    {
        $loginIdentifier = $request->input('login')
            ?? $request->input('email')
            ?? $request->input('username');

        $request->merge(['login_identifier' => $loginIdentifier]);

        $validated = $request->validate([
            'login_identifier' => 'required|string',
            'password' => 'required|string',
        ], [
            'login_identifier.required' => 'Username atau email wajib diisi.',
        ]);

        $user = User::where('username', $validated['login_identifier'])
            ->orWhere('email', $validated['login_identifier'])
            ->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            Log::warning('security_event.auth_login_failed', [
                'identifier' => mb_substr($validated['login_identifier'], 0, 64),
                'ip' => $request->ip(),
            ]);

            throw ValidationException::withMessages([
                'login' => ['Username/email atau password tidak sesuai.'],
            ]);
        }

        $expectedRole = $request->input('peran');
        if ($expectedRole && $user->peran !== $expectedRole) {
            return response()->json([
                'success' => false,
                'message' => 'Akun ini terdaftar sebagai ' . ($user->peran === 'Vendor' ? 'Tenant' : 'Pengguna') . '.',
            ], 422);
        }

        if ($user->peran === 'Vendor') {
            $user->setRelation('tenant', \App\Models\Tenant::where('id_user', $user->id_user)->first());
        }

        $token = $this->issueApiToken($user);

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil.',
            'data' => [
                'access_token' => $token,
                'token' => $token,
                'token_type' => 'Bearer',
                'user' => $user,
            ],
        ], 200);
    }

    /**
     * Menampilkan informasi akun pengguna yang sedang login.
     */
    public function me(Request $request)
    {
        $user = $request->user();
        if ($user && $user->peran === 'Vendor') {
            $user->setRelation('tenant', \App\Models\Tenant::where('id_user', $user->id_user)->first());
        }
        return response()->json([
            'success' => true,
            'message' => 'Data pengguna berhasil diambil.',
            'data' => $user,
        ], 200);
    }


    /**
     * Meminta kode verifikasi reset password 6 digit (berlaku 15 menit).
     */
    public function forgotPassword(Request $request)
    {
        $identifier = trim((string) ($request->input('login') ?? $request->input('username') ?? $request->input('email')));
        if (!$identifier) {
            return response()->json([
                'success' => false,
                'message' => 'Masukkan username atau email akun Anda.',
            ], 422);
        }

        $user = User::where('username', $identifier)->orWhere('email', $identifier)->first();
        if ($user) {
            $code = (string) random_int(100000, 999999);
            Cache::put('password_reset:' . $user->id_user, [
                'hash' => hash('sha256', $code),
                'attempts' => 0,
            ], now()->addMinutes(15));

            Log::info('security_event.password_reset_requested', [
                'user_id' => $user->id_user,
                'ip' => $request->ip(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Jika akun terdaftar, kode verifikasi reset password 6 digit telah dikirimkan melalui kanal verifikasi server.',
        ], 200);
    }

    /**
     * Reset password akun dengan verifikasi reset_token dan pencabutan sesi lama.
     */
    public function resetPassword(Request $request)
    {
        $identifier = trim((string) ($request->input('login') ?? $request->input('username') ?? $request->input('email')));
        $resetCode = trim((string) ($request->input('reset_token') ?? $request->input('code') ?? ''));
        $newPassword = (string) ($request->input('new_password') ?? $request->input('password'));

        if (!$identifier || !$resetCode || strlen($newPassword) < 6) {
            return response()->json([
                'success' => false,
                'message' => 'Masukkan username/email, kode verifikasi reset 6 digit, dan password baru minimal 6 karakter.',
            ], 422);
        }

        $user = User::where('username', $identifier)->orWhere('email', $identifier)->first();
        $cacheKey = $user ? 'password_reset:' . $user->id_user : null;
        $record = $cacheKey ? Cache::get($cacheKey) : null;

        if (!$user || !$record || ($record['attempts'] ?? 0) >= 5) {
            if ($cacheKey) {
                Cache::forget($cacheKey);
            }
            Log::warning('security_event.password_reset_rejected', [
                'ip' => $request->ip(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Kode reset tidak valid atau sudah kedaluwarsa.',
            ], 422);
        }

        if (!hash_equals((string) $record['hash'], hash('sha256', $resetCode))) {
            $record['attempts'] = ($record['attempts'] ?? 0) + 1;
            Cache::put($cacheKey, $record, now()->addMinutes(15));
            Log::warning('security_event.password_reset_invalid_code', [
                'user_id' => $user->id_user,
                'attempts' => $record['attempts'],
                'ip' => $request->ip(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Kode verifikasi reset password tidak sesuai.',
            ], 422);
        }

        $user->password = Hash::make($newPassword);
        $user->save();
        $user->tokens()->delete();
        Cache::forget($cacheKey);
        Log::info('security_event.password_reset_completed', [
            'user_id' => $user->id_user,
            'ip' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password berhasil diperbarui! Silakan login dengan password baru Anda.',
        ], 200);
    }

    /**
     * Mengubah password untuk pengguna yang sedang login dengan verifikasi password lama.
     */
    public function updatePassword(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6',
        ]);

        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Password saat ini tidak sesuai.',
            ], 422);
        }

        $user->password = Hash::make($validated['new_password']);
        $user->save();
        $user->tokens()->delete();
        $newToken = $user->createToken('letsorder-api')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Password berhasil diubah.',
            'data' => [
                'access_token' => $newToken,
                'token' => $newToken,
            ],
        ], 200);
    }

    /**
     * Perbarui profil pengguna (memerlukan no_telp valid serta validasi keunikan email).
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $nextPhone = $request->has('no_telp') ? trim((string) $request->input('no_telp')) : ($user->no_telp ?? '');

        $validated = $request->validate([
            'nama' => 'sometimes|string|max:100',
            'email' => [
                'sometimes',
                'email',
                'max:100',
                Rule::unique('users', 'email')->ignore($user->id_user, 'id_user'),
            ],
            'no_telp' => 'nullable|string|max:30',
            'jenis_kelamin' => 'nullable|string|max:20',
            'tanggal_lahir' => 'nullable|string|max:20',
            'avatar' => ['nullable', 'string', ImageValidator::rule('foto profil')],
            'nama_tenant' => 'nullable|string|max:100',
            ...PhotoFocus::rules(),
        ]);

        $photoFocus = PhotoFocus::normalize($validated);

        if (isset($validated['email']) && strtolower(trim($validated['email'])) !== strtolower((string) $user->email)) {
            if (strlen(preg_replace('/\D/', '', (string) $nextPhone)) < 8) {
                return response()->json([
                    'success' => false,
                    'message' => 'Nomor telepon valid (minimal 8 digit) wajib ditambahkan terlebih dahulu sebelum mengubah email.',
                ], 422);
            }
            $user->email = strtolower(trim($validated['email']));
        }

        if (array_key_exists('nama', $validated)) {
            $user->nama = trim((string) $validated['nama']);
        }
        if (array_key_exists('no_telp', $validated)) {
            $user->no_telp = $nextPhone;
        }
        if (array_key_exists('jenis_kelamin', $validated)) {
            $user->jenis_kelamin = $validated['jenis_kelamin'];
        }
        if (array_key_exists('tanggal_lahir', $validated)) {
            $user->tanggal_lahir = $validated['tanggal_lahir'];
        }
        if (array_key_exists('avatar', $validated) && !MediaController::isMediaEndpointRef($validated['avatar'])) {
            $user->avatar = $validated['avatar'];
        }
        foreach ($photoFocus as $key => $value) {
            $user->{$key} = $value;
        }
        $user->save();

        if ($user->peran === 'Vendor') {
            $tenant = \App\Models\Tenant::where('id_user', $user->id_user)->first();
            if ($tenant) {
                $changed = false;
                if (!empty($validated['nama_tenant'])) {
                    $tenant->nama_tenant = trim((string) $validated['nama_tenant']);
                    $changed = true;
                }
                if (
                    !empty($validated['avatar']) &&
                    !MediaController::isMediaEndpointRef($validated['avatar']) &&
                    (!$tenant->logo || $tenant->logo === 'tenant/default.png')
                ) {
                    $tenant->logo = $validated['avatar'];
                    $changed = true;
                }
                foreach ($photoFocus as $key => $value) {
                    $tenant->{$key} = $value;
                    $changed = true;
                }
                if ($changed) {
                    $tenant->save();
                }
            }
            $user->setRelation('tenant', $tenant);
        }

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui.',
            'data' => [
                'user' => $user,
            ],
        ], 200);
    }


    private function issueApiToken(User $user): string
    {
        $days = max(1, (int) env('SESSION_INACTIVITY_DAYS', 5));

        return $user->createToken('letsorder-api', ['*'], now()->addDays($days))->plainTextToken;
    }

    /**
     * Hapus akun beserta seluruh data terkait.
     *
     * Aturan mengikuti backend Node: konfirmasi teks + password, Administrator
     * ditolak, dan tenant yang masih punya pesanan aktif tidak boleh dihapus.
     */
    public function deleteAccount(Request $request)
    {
        $user = $request->user();

        if (strtolower((string) $user->peran) === 'administrator') {
            return response()->json([
                'success' => false,
                'message' => 'Akun administrator tidak dapat dihapus dari halaman ini.',
            ], 403);
        }

        $validated = $request->validate([
            'confirm' => 'required|string|max:40',
            'password' => 'nullable|string',
        ]);

        $confirmText = preg_replace('/\s+/', ' ', strtoupper(trim((string) $validated['confirm'])));
        if (!in_array($confirmText, ['HAPUS AKUN', 'DELETE ACCOUNT'], true)) {
            return response()->json([
                'success' => false,
                'message' => 'Ketik "HAPUS AKUN" pada kolom konfirmasi untuk melanjutkan.',
            ], 422);
        }

        if (!Hash::check((string) ($validated['password'] ?? ''), $user->password)) {
            Log::warning('security_event.account_delete_failed', [
                'id_user' => $user->id_user,
                'ip' => $request->ip(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Password tidak sesuai. Akun Anda tidak dihapus.',
            ], 422);
        }

        $tenantIds = DB::table('tenants')
            ->where('id_user', $user->id_user)
            ->pluck('id_tenant')
            ->all();

        if (!empty($tenantIds)) {
            $hasActiveOrder = DB::table('orders')
                ->whereIn('id_tenant', $tenantIds)
                ->whereNotIn('status_pesanan', ['Selesai', 'Dibatalkan'])
                ->exists();

            if ($hasActiveOrder) {
                return response()->json([
                    'success' => false,
                    'message' => 'Akun tenant tidak dapat dihapus selama masih ada pesanan yang belum selesai. Selesaikan atau batalkan pesanan tersebut terlebih dahulu.',
                ], 409);
            }
        }

        DB::transaction(function () use ($user, $tenantIds, $request) {
            $tenantScope = !empty($tenantIds) ? $tenantIds : [0];

            $orderIds = DB::table('orders')
                ->where('id_user', $user->id_user)
                ->orWhereIn('id_tenant', $tenantScope)
                ->pluck('id_pesanan')
                ->all();

            if (!empty($orderIds)) {
                DB::table('order_messages')->whereIn('id_pesanan', $orderIds)->delete();
                DB::table('payments')->whereIn('id_pesanan', $orderIds)->delete();
                DB::table('status_histories')->whereIn('id_pesanan', $orderIds)->delete();
                DB::table('notifications')->whereIn('id_pesanan', $orderIds)->delete();
                DB::table('reviews')->whereIn('id_pesanan', $orderIds)->delete();
                DB::table('order_details')->whereIn('id_pesanan', $orderIds)->delete();
                DB::table('orders')->whereIn('id_pesanan', $orderIds)->delete();
            }

            DB::table('notifications')->where('id_user', $user->id_user)->delete();
            DB::table('reviews')->where('id_user', $user->id_user)->delete();
            DB::table('order_messages')->where('id_pengirim', $user->id_user)->delete();

            if (!empty($tenantIds)) {
                DB::table('reviews')->whereIn('id_tenant', $tenantIds)->delete();

                // Ulasan bisa menempel ke menu tenant ini walau barisnya bukan
                // milik tenant tersebut, jadi bersihkan lewat id_menu juga.
                $menuIds = DB::table('menus')
                    ->whereIn('id_tenant', $tenantIds)
                    ->pluck('id_menu')
                    ->all();
                if (!empty($menuIds)) {
                    DB::table('reviews')->whereIn('id_menu', $menuIds)->delete();
                }

                DB::table('promos')->whereIn('id_tenant', $tenantIds)->delete();
                DB::table('menus')->whereIn('id_tenant', $tenantIds)->delete();
                DB::table('tenants')->whereIn('id_tenant', $tenantIds)->delete();
            }

            $cartIds = DB::table('carts')->where('id_user', $user->id_user)->pluck('id_keranjang')->all();
            if (!empty($cartIds)) {
                DB::table('cart_items')->whereIn('id_keranjang', $cartIds)->delete();
                DB::table('carts')->whereIn('id_keranjang', $cartIds)->delete();
            }

            DB::table('personal_access_tokens')
                ->where('tokenable_type', User::class)
                ->where('tokenable_id', $user->id_user)
                ->delete();

            DB::table('users')->where('id_user', $user->id_user)->delete();

            Log::warning('security_event.account_deleted', [
                'id_user' => $user->id_user,
                'peran' => $user->peran,
                'ip' => $request->ip(),
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Akun Anda berhasil dihapus. Terima kasih telah menggunakan LetsOrder.',
            'data' => null,
        ], 200);
    }

    /**
     * Logout dan mencabut token yang sedang digunakan.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil.',
            'data' => null,
        ], 200);
    }
}

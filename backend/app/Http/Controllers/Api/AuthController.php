<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\ImageValidator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
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
                'deskripsi' => 'Tenant Kantin Kampus UPNVJ',
                'logo' => '',
                'status_buka' => true,
            ]);
            $user->setRelation('tenant', $tenant);
        }

        $token = $user->createToken('letsorder-api')->plainTextToken;

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

        $token = $user->createToken('letsorder-api')->plainTextToken;

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
     * Redirect langsung ke halaman Google OAuth 2.0.
     */
    public function googleRedirect(Request $request)
    {
        $peran = $request->query('peran') === 'Vendor' ? 'Vendor' : 'Customer';
        $origin = $this->validateFrontendOrigin($request->query('origin'));
        $clientId = env('GOOGLE_CLIENT_ID', '');
        $redirectUri = env('GOOGLE_REDIRECT_URI', url('/api/auth/google/callback'));

        if (!$clientId || !str_contains($clientId, '.apps.googleusercontent.com')) {
            return response()->json([
                'success' => false,
                'message' => 'GOOGLE_CLIENT_ID belum dikonfigurasi pada file .env backend.',
            ], 400);
        }

        $state = $this->signOAuthState([
            'peran' => $peran,
            'origin' => $origin,
        ]);

        $query = http_build_query([
            'client_id' => $clientId,
            'redirect_uri' => $redirectUri,
            'response_type' => 'code',
            'scope' => 'openid email profile',
            'access_type' => 'online',
            'prompt' => 'select_account',
            'state' => $state,
        ]);

        return redirect()->away('https://accounts.google.com/o/oauth2/v2/auth?' . $query);
    }

    /**
     * Callback resmi dari Google OAuth 2.0.
     */
    public function googleCallback(Request $request)
    {
        $state = $this->verifyOAuthState((string) $request->query('state', ''));
        $origin = $this->validateFrontendOrigin($state['origin'] ?? null);
        $peran = (($state['peran'] ?? 'Customer') === 'Vendor') ? 'Vendor' : 'Customer';

        if (!$state) {
            return redirect()->away($origin . '?google_error=' . urlencode('State OAuth Google tidak valid atau telah kedaluwarsa.'));
        }

        if ($request->query('error') || !$request->query('code')) {
            return redirect()->away($origin . '?google_error=' . urlencode($request->query('error', 'Login Google dibatalkan.')));
        }

        $tokenRes = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'code' => $request->query('code'),
            'client_id' => env('GOOGLE_CLIENT_ID'),
            'client_secret' => env('GOOGLE_CLIENT_SECRET'),
            'redirect_uri' => env('GOOGLE_REDIRECT_URI', url('/api/auth/google/callback')),
            'grant_type' => 'authorization_code',
        ]);

        $accessToken = $tokenRes->json('access_token');
        if (!$accessToken) {
            return redirect()->away($origin . '?google_error=' . urlencode('Gagal menukar kode OAuth Google.'));
        }

        $profile = Http::withToken($accessToken)->get('https://www.googleapis.com/oauth2/v3/userinfo')->json();
        $emailVerified = ($profile['email_verified'] ?? false) === true || ($profile['email_verified'] ?? '') === 'true';
        if (!$profile || empty($profile['email']) || !$emailVerified) {
            return redirect()->away($origin . '?google_error=' . urlencode('Akun Google belum terverifikasi.'));
        }

        $result = $this->upsertGoogleUser($profile, $peran);
        $exchangeCode = Str::random(48);
        Cache::put('google_exchange:' . $exchangeCode, $result, now()->addSeconds(60));

        return redirect()->away(
            $origin . '?google_auth_code=' . urlencode($exchangeCode)
        );
    }

    /**
     * Menukarkan kode sekali pakai Google callback menjadi token API.
     */
    public function exchangeGoogleCode(Request $request)
    {
        $code = trim((string) $request->input('code'));
        $payload = $code ? Cache::pull('google_exchange:' . $code) : null;

        if (!$payload) {
            return response()->json([
                'success' => false,
                'message' => 'Kode login Google tidak valid atau sudah digunakan.',
            ], 401);
        }

        return response()->json([
            'success' => true,
            'message' => 'Login dengan Google berhasil.',
            'data' => [
                'access_token' => $payload['token'],
                'token' => $payload['token'],
                'token_type' => 'Bearer',
                'user' => $payload['user'],
            ],
        ], 200);
    }

    /**
     * Verifikasi token Google OAuth dari frontend.
     */
    public function googleLogin(Request $request)
    {
        $expectedClientId = trim((string) env('GOOGLE_CLIENT_ID', ''));
        if (!$expectedClientId || !str_contains($expectedClientId, '.apps.googleusercontent.com')) {
            return response()->json([
                'success' => false,
                'message' => 'GOOGLE_CLIENT_ID belum dikonfigurasi pada server.',
            ], 503);
        }

        $peran = $request->input('peran') === 'Vendor' ? 'Vendor' : 'Customer';
        $profile = null;

        if ($request->filled('access_token')) {
            $tokenInfo = Http::get('https://www.googleapis.com/oauth2/v3/tokeninfo', [
                'access_token' => $request->input('access_token'),
            ]);
            if ($tokenInfo->successful() && $tokenInfo->json('aud') === $expectedClientId) {
                $res = Http::withToken($request->input('access_token'))
                    ->get('https://www.googleapis.com/oauth2/v3/userinfo');
                if ($res->successful()) {
                    $profile = $res->json();
                }
            }
        } elseif ($request->filled('credential') || $request->filled('id_token')) {
            $idToken = $request->input('credential') ?? $request->input('id_token');
            $res = Http::get('https://oauth2.googleapis.com/tokeninfo', ['id_token' => $idToken]);
            if ($res->successful() && $res->json('aud') === $expectedClientId) {
                $profile = $res->json();
            }
        }

        $emailVerified = ($profile['email_verified'] ?? false) === true || ($profile['email_verified'] ?? '') === 'true';
        if (!$profile || empty($profile['email']) || !$emailVerified) {
            return response()->json([
                'success' => false,
                'message' => 'Token Google OAuth tidak valid atau email belum terverifikasi.',
            ], 401);
        }

        $result = $this->upsertGoogleUser($profile, $peran);

        return response()->json([
            'success' => true,
            'message' => 'Login dengan Google berhasil.',
            'data' => [
                'access_token' => $result['token'],
                'token' => $result['token'],
                'token_type' => 'Bearer',
                'user' => $result['user'],
            ],
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
        ]);

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
        if (array_key_exists('avatar', $validated)) {
            $user->avatar = $validated['avatar'];
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
                if (!empty($validated['avatar']) && (!$tenant->logo || $tenant->logo === 'tenant/default.png')) {
                    $tenant->logo = $validated['avatar'];
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

    private function validateFrontendOrigin(?string $candidate): string
    {
        $defaultOrigin = rtrim((string) env('FRONTEND_URL', 'http://localhost:5173'), '/');
        $allowed = array_filter([
            $defaultOrigin,
            'http://localhost:5173',
            'http://127.0.0.1:5173',
        ]);
        if ($candidate) {
            $parts = parse_url($candidate);
            if (!empty($parts['scheme']) && !empty($parts['host'])) {
                $normalized = $parts['scheme'] . '://' . $parts['host'] . (!empty($parts['port']) ? ':' . $parts['port'] : '');
                if (in_array($normalized, $allowed, true)) {
                    return $normalized;
                }
            }
        }
        return $defaultOrigin;
    }

    private function signOAuthState(array $payload): string
    {
        $payload['nonce'] = Str::random(16);
        $payload['exp'] = now()->addMinutes(10)->timestamp;
        $encoded = rtrim(strtr(base64_encode(json_encode($payload)), '+/', '-_'), '=');
        $sig = rtrim(strtr(base64_encode(hash_hmac('sha256', $encoded, (string) config('app.key'), true)), '+/', '-_'), '=');
        return $encoded . '.' . $sig;
    }

    private function verifyOAuthState(string $state): ?array
    {
        if (!str_contains($state, '.')) {
            return null;
        }
        [$encoded, $sig] = explode('.', $state, 2);
        $expected = rtrim(strtr(base64_encode(hash_hmac('sha256', $encoded, (string) config('app.key'), true)), '+/', '-_'), '=');
        if (!hash_equals($expected, $sig)) {
            return null;
        }
        $decoded = json_decode(base64_decode(strtr($encoded, '-_', '+/')), true);
        if (!is_array($decoded) || empty($decoded['exp']) || now()->timestamp > (int) $decoded['exp']) {
            return null;
        }
        return $decoded;
    }

    private function upsertGoogleUser(array $profile, string $peran): array
    {
        $email = strtolower(trim((string) $profile['email']));
        $nama = trim((string) ($profile['name'] ?? explode('@', $email)[0]));
        $user = User::where('email', $email)->first();

        if (!$user) {
            $baseUsername = preg_replace('/[^a-zA-Z0-9_]/', '', explode('@', $email)[0]) ?: 'user';
            $user = User::create([
                'username' => $baseUsername . '_' . Str::lower(Str::random(4)),
                'nama' => $nama,
                'email' => $email,
                'password' => Hash::make(Str::random(24)),
                'peran' => $peran,
            ]);
        }

        if ($user->peran === 'Vendor' && !\App\Models\Tenant::where('id_user', $user->id_user)->exists()) {
            \App\Models\Tenant::create([
                'id_user' => $user->id_user,
                'nama_tenant' => $nama,
                'deskripsi' => 'Tenant Kantin Kampus',
                'logo' => '',
                'status_buka' => true,
            ]);
        }

        $token = $user->createToken('letsorder-api')->plainTextToken;
        return ['user' => $user, 'token' => $token];
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

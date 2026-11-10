<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Registrasi Customer.
     */
    public function register(Request $request)
    {
        $passwordRule = $request->has('password_confirmation')
            ? 'required|string|min:8|confirmed'
            : 'required|string|min:8';

        $validated = $request->validate([
            'username' => 'required|string|max:50|unique:users,username',
            'nama' => 'required|string|max:100',
            'email' => 'required|email|max:100|unique:users,email',
            'password' => $passwordRule,
        ]);

        $user = User::create([
            'username' => $validated['username'],
            'nama' => $validated['nama'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'peran' => 'Customer',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Registrasi berhasil.',
            'data' => $user,
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
            throw ValidationException::withMessages([
                'login' => ['Username/email atau password tidak sesuai.'],
            ]);
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
        return response()->json([
            'success' => true,
            'message' => 'Data pengguna berhasil diambil.',
            'data' => $request->user(),
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

<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Memeriksa apakah peran pengguna sesuai dengan yang diizinkan.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Pengguna belum terautentikasi.',
            ], 401);
        }

        $userRole = strtolower((string) $user->peran);
        $allowedRoles = array_map(fn (string $role) => strtolower(trim($role)), $roles);

        if (!in_array($userRole, $allowedRoles, true)) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak akses untuk fitur ini.',
            ], 403);
        }

        return $next($request);
    }
}


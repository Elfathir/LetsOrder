<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
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
            Log::warning('security_event.access_denied_role', [
                'user_id' => $user->id_user,
                'user_role' => $userRole,
                'allowed_roles' => $allowedRoles,
                'path' => $request->path(),
                'method' => $request->method(),
                'ip' => $request->ip(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak akses untuk fitur ini.',
            ], 403);
        }

        return $next($request);
    }
}


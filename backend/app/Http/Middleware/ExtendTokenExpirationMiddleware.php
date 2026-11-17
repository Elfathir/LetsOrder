<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

class ExtendTokenExpirationMiddleware
{
    /**
     * Perpanjang masa aktif Bearer token secara sliding apabila pengguna masih aktif membuka aplikasi.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $user = $request->user();
        $token = $user?->currentAccessToken();

        if ($token instanceof PersonalAccessToken && $token->expires_at !== null) {
            $days = max(1, (int) env('SESSION_INACTIVITY_DAYS', 5));
            $targetExpiry = now()->addDays($days);

            // Debounce write ke database agar hanya update paling sering tiap 5 menit
            if ($token->expires_at->lt($targetExpiry->copy()->subMinutes(5))) {
                $token->forceFill(['expires_at' => $targetExpiry])->saveQuietly();
            }
        }

        return $response;
    }
}

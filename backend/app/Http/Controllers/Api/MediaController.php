<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;

class MediaController extends Controller
{
    public static function previewSql(string $column, string $aliasPrefix, bool $excludeMenuDefault = false): string
    {
        $defaultGuard = $excludeMenuDefault
            ? " OR {$column} = 'menu/default.png'"
            : " OR {$column} = 'tenant/default.png'";

        return "CASE "
            . "WHEN {$column} IS NULL OR {$column} = ''{$defaultGuard} THEN '' "
            . "WHEN LOWER(SUBSTR({$column}, 1, 11)) = 'data:image/' THEN SUBSTR({$column}, 1, 80) "
            . "ELSE {$column} "
            . "END as {$aliasPrefix}_preview, "
            . "LENGTH(COALESCE({$column}, '')) as {$aliasPrefix}_len";
    }

    public static function compactMediaValue(string $type, int $id, ?string $preview, int|string|null $len = 0): string
    {
        $trimmed = trim((string) ($preview ?? ''));
        if ($trimmed === '' || $trimmed === 'menu/default.png' || $trimmed === 'tenant/default.png') {
            return '';
        }
        if (str_starts_with(strtolower($trimmed), 'data:image/')) {
            $version = substr(md5(((int) $len) . ':' . $trimmed), 0, 10);
            return "/api/media/{$type}/{$id}?v={$version}";
        }
        return $trimmed;
    }

    public static function isMediaEndpointRef(?string $value): bool
    {
        if (!is_string($value)) {
            return false;
        }
        $trimmed = trim($value);
        return (bool) preg_match('#^(?:https?://[^/]+)?/api/(?:v1/)?media/(?:tenant|menu|user)/\d+#i', $trimmed);
    }

    public function show(Request $request, string $type, int $id)
    {
        $raw = match ($type) {
            'menu' => Menu::where('id_menu', $id)->value('gambar'),
            'user' => User::where('id_user', $id)->value('avatar'),
            'tenant' => $this->resolveTenantImageRaw($id),
            default => null,
        };

        $trimmed = trim((string) ($raw ?? ''));
        if ($trimmed === '' || $trimmed === 'menu/default.png' || $trimmed === 'tenant/default.png') {
            return response('', 404);
        }

        if (preg_match('/^https?:\/\//i', $trimmed)) {
            return redirect()->away($trimmed);
        }

        if (preg_match('/^data:(image\/(?:png|jpeg|jpg|webp|gif));base64,(.+)$/is', $trimmed, $matches)) {
            $etag = '"' . md5($trimmed) . '"';
            $cacheHeaders = [
                'Cache-Control' => 'public, max-age=86400, stale-while-revalidate=604800',
                'ETag' => $etag,
                'Access-Control-Allow-Origin' => '*',
            ];

            if ($request->header('If-None-Match') === $etag) {
                return response('', 304, $cacheHeaders);
            }

            $binary = base64_decode(preg_replace('/\s+/', '', $matches[2]), true);
            if ($binary === false) {
                return response('', 404);
            }

            $mime = strtolower($matches[1]);
            if ($mime === 'image/jpg') {
                $mime = 'image/jpeg';
            }

            return response($binary, 200, array_merge($cacheHeaders, [
                'Content-Type' => $mime,
                'Content-Length' => (string) strlen($binary),
                'X-Content-Type-Options' => 'nosniff',
            ]));
        }

        return response('', 404);
    }

    private function resolveTenantImageRaw(int $tenantId): ?string
    {
        $tenant = Tenant::select('id_tenant', 'id_user', 'logo')->find($tenantId);
        if (!$tenant) {
            return null;
        }

        $logo = trim((string) ($tenant->logo ?? ''));
        if ($logo !== '' && $logo !== 'tenant/default.png') {
            return $logo;
        }

        if ($tenant->id_user) {
            $avatar = trim((string) (User::where('id_user', $tenant->id_user)->value('avatar') ?? ''));
            if ($avatar !== '') {
                return $avatar;
            }
        }

        $menuImg = Menu::where('id_tenant', $tenantId)
            ->whereNotNull('gambar')
            ->where('gambar', '!=', '')
            ->where('gambar', '!=', 'menu/default.png')
            ->orderBy('id_menu', 'asc')
            ->value('gambar');

        return $menuImg ? trim((string) $menuImg) : null;
    }
}

<?php

namespace App\Support;

use Closure;

class ImageValidator
{
    public const MAX_IMAGE_LENGTH = 5_000_000;

    public static function isSafe(?string $value): bool
    {
        if ($value === null) {
            return true;
        }

        $trimmed = trim($value);
        if ($trimmed === '') {
            return true;
        }

        if (strlen($trimmed) > self::MAX_IMAGE_LENGTH) {
            return false;
        }

        // Strict allowlist for raster base64 data URIs (blocks SVG/HTML XSS payloads)
        if (preg_match('/^data:image\/(png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+\/=\r\n]+$/i', $trimmed)) {
            return true;
        }

        if (str_starts_with(strtolower($trimmed), 'data:')) {
            return false;
        }

        // Single-leading-slash relative path (reject protocol-relative '//...')
        if (str_starts_with($trimmed, '/')) {
            return !str_starts_with($trimmed, '//');
        }

        // Bare relative storage paths without URI scheme (e.g., menu/item.png)
        if (!str_contains($trimmed, ':')) {
            return !preg_match('/[\r\n<>"\']/', $trimmed);
        }

        $parts = parse_url($trimmed);
        if (!$parts || empty($parts['scheme']) || empty($parts['host'])) {
            return false;
        }

        $scheme = strtolower($parts['scheme']);
        return $scheme === 'https' || $scheme === 'http';
    }

    public static function rule(string $fieldLabel = 'gambar'): Closure
    {
        return function (string $attribute, mixed $value, Closure $fail) use ($fieldLabel) {
            if (!is_string($value) && $value !== null) {
                $fail("Format {$fieldLabel} tidak valid.");
                return;
            }
            if (!self::isSafe($value)) {
                $fail("Format {$fieldLabel} harus berupa gambar PNG/JPEG/WEBP/GIF atau URL HTTP(S) yang valid.");
            }
        };
    }
}

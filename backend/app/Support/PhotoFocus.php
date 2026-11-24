<?php

namespace App\Support;

/**
 * Metadata posisi foto: foto asli disimpan utuh, yang disimpan hanya titik fokus
 * dan zoom. Frontend memakai nilai ini lewat CSS object-position + scale.
 */
class PhotoFocus
{
    public const DEFAULTS = [
        'foto_x' => 50.0,
        'foto_y' => 50.0,
        'foto_zoom' => 1.0,
    ];

    /** Aturan validasi siap pakai di $request->validate(). */
    public static function rules(): array
    {
        return [
            'foto_x' => 'sometimes|nullable|numeric|min:0|max:100',
            'foto_y' => 'sometimes|nullable|numeric|min:0|max:100',
            'foto_zoom' => 'sometimes|nullable|numeric|min:1|max:3',
        ];
    }

    /** Nilai default untuk baris yang baru dibuat. */
    public static function defaultsForCreate(): array
    {
        return self::DEFAULTS;
    }

    /** Hilangkan foto_* kosong lalu timpa dengan nilai yang sudah dibatasi. */
    public static function merge(array $validated): array
    {
        foreach (array_keys(self::DEFAULTS) as $key) {
            if (array_key_exists($key, $validated) && ($validated[$key] === null || $validated[$key] === '')) {
                unset($validated[$key]);
            }
        }

        return array_merge($validated, self::normalize($validated));
    }

    /** Hanya field yang dikirim klien, sudah dibatasi rentangnya. */
    public static function normalize(array $input): array
    {
        $out = [];

        foreach (['foto_x', 'foto_y'] as $key) {
            if (array_key_exists($key, $input) && $input[$key] !== null && $input[$key] !== '') {
                $out[$key] = round(min(100, max(0, (float) $input[$key])), 2);
            }
        }

        if (array_key_exists('foto_zoom', $input) && $input['foto_zoom'] !== null && $input['foto_zoom'] !== '') {
            $out['foto_zoom'] = round(min(3, max(1, (float) $input['foto_zoom'])), 2);
        }

        return $out;
    }
}

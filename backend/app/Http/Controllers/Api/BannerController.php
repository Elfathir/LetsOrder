<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

/**
 * Banner beranda customer. Data disimpan di tabel `banners` pada database
 * aplikasi (MySQL), sama seperti tabel pengguna dan tenant — bukan data contoh.
 */
class BannerController extends Controller
{
    /**
     * Pastikan tabel banner tersedia pada database yang sedang dipakai.
     */
    public static function ensureSchema(): bool
    {
        if (Schema::hasTable('banners')) {
            self::ensureEnglishColumns();

            return true;
        }

        try {
            Schema::create('banners', function (Blueprint $table) {
                $table->increments('id_banner');
                $table->string('tag', 80)->nullable();
                $table->string('judul', 160);
                $table->text('deskripsi')->nullable();
                $table->longText('gambar')->nullable();
                $table->string('cta_primary', 60)->nullable();
                $table->string('cta_secondary', 60)->nullable();
                $table->string('tag_en', 80)->nullable();
                $table->string('judul_en', 160)->nullable();
                $table->text('deskripsi_en')->nullable();
                $table->string('cta_primary_en', 60)->nullable();
                $table->string('cta_secondary_en', 60)->nullable();
                $table->unsignedInteger('urutan')->default(1);
                $table->boolean('aktif')->default(true);
            });
        } catch (\Throwable $e) {
            Log::warning('banners.ensure_schema_failed', ['error' => $e->getMessage()]);
        }

        return Schema::hasTable('banners');
    }

    /**
     * Kolom terjemahan Inggris ditambahkan otomatis agar instalasi lama tetap jalan.
     */
    private static function ensureEnglishColumns(): void
    {
        $columns = [
            'tag_en' => fn (Blueprint $table) => $table->string('tag_en', 80)->nullable(),
            'judul_en' => fn (Blueprint $table) => $table->string('judul_en', 160)->nullable(),
            'deskripsi_en' => fn (Blueprint $table) => $table->text('deskripsi_en')->nullable(),
            'cta_primary_en' => fn (Blueprint $table) => $table->string('cta_primary_en', 60)->nullable(),
            'cta_secondary_en' => fn (Blueprint $table) => $table->string('cta_secondary_en', 60)->nullable(),
        ];

        foreach ($columns as $name => $definition) {
            if (Schema::hasColumn('banners', $name)) {
                continue;
            }

            try {
                Schema::table('banners', function (Blueprint $table) use ($definition) {
                    $definition($table);
                });
            } catch (\Throwable $e) {
                Log::warning('banners.ensure_english_column_failed', ['column' => $name, 'error' => $e->getMessage()]);
            }
        }
    }

    private function sortedBanners(bool $onlyActive)
    {
        $query = Banner::query();
        if ($onlyActive) {
            $query->where('aktif', true);
        }

        return $query->orderBy('urutan')->orderBy('id_banner')->get();
    }

    private function imageRule(): \Closure
    {
        return function ($attribute, $value, $fail) {
            if (!preg_match('#^(https?://|/)#i', (string) $value)) {
                $fail('URL gambar banner harus diawali http(s):// atau /.');
            }
        };
    }

    /**
     * GET /api/banners — dipakai beranda customer.
     */
    public function index()
    {
        if (!self::ensureSchema()) {
            return response()->json(['success' => true, 'data' => []], 200);
        }

        return response()->json([
            'success' => true,
            'data' => $this->sortedBanners(true),
        ], 200);
    }

    /**
     * GET /api/admin/banners
     */
    public function adminIndex()
    {
        if (!self::ensureSchema()) {
            return response()->json([
                'success' => false,
                'message' => 'Tabel banner belum tersedia. Jalankan php artisan migrate terlebih dahulu.',
            ], 503);
        }

        return response()->json([
            'success' => true,
            'message' => 'Daftar banner berhasil diambil.',
            'data' => $this->sortedBanners(false),
        ], 200);
    }

    /**
     * POST /api/admin/banners
     */
    public function store(Request $request)
    {
        if (!self::ensureSchema()) {
            return response()->json([
                'success' => false,
                'message' => 'Tabel banner belum tersedia. Jalankan php artisan migrate terlebih dahulu.',
            ], 503);
        }

        $validated = $request->validate([
            'tag' => 'nullable|string|max:80',
            'judul' => 'required|string|min:2|max:160',
            'deskripsi' => 'nullable|string|max:500',
            'gambar' => ['required', 'string', 'max:2000', $this->imageRule()],
            'cta_primary' => 'nullable|string|max:60',
            'cta_secondary' => 'nullable|string|max:60',
            'tag_en' => 'nullable|string|max:80',
            'judul_en' => 'nullable|string|max:160',
            'deskripsi_en' => 'nullable|string|max:500',
            'cta_primary_en' => 'nullable|string|max:60',
            'cta_secondary_en' => 'nullable|string|max:60',
            'urutan' => 'nullable|integer|min:0',
            'aktif' => 'sometimes|boolean',
        ]);

        $banner = Banner::create([
            'tag' => $validated['tag'] ?? '',
            'judul' => $validated['judul'],
            'deskripsi' => $validated['deskripsi'] ?? '',
            'gambar' => $validated['gambar'],
            'cta_primary' => $validated['cta_primary'] ?? 'Pesan sekarang',
            'cta_secondary' => $validated['cta_secondary'] ?? 'Lihat kantin',
            'tag_en' => $validated['tag_en'] ?? '',
            'judul_en' => $validated['judul_en'] ?? '',
            'deskripsi_en' => $validated['deskripsi_en'] ?? '',
            'cta_primary_en' => $validated['cta_primary_en'] ?? '',
            'cta_secondary_en' => $validated['cta_secondary_en'] ?? '',
            'urutan' => (int) ($validated['urutan'] ?? 1),
            'aktif' => $validated['aktif'] ?? true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Banner berhasil dibuat.',
            'data' => $banner,
        ], 201);
    }

    /**
     * PATCH /api/admin/banners/{id}
     */
    public function update(Request $request, int $id)
    {
        if (!self::ensureSchema()) {
            return response()->json(['success' => false, 'message' => 'Tabel banner belum ada.'], 503);
        }

        $banner = Banner::find($id);
        if (!$banner) {
            return response()->json(['success' => false, 'message' => 'Banner tidak ditemukan.'], 404);
        }

        $validated = $request->validate([
            'tag' => 'sometimes|nullable|string|max:80',
            'judul' => 'sometimes|required|string|min:2|max:160',
            'deskripsi' => 'sometimes|nullable|string|max:500',
            'gambar' => ['sometimes', 'required', 'string', 'max:2000', $this->imageRule()],
            'cta_primary' => 'sometimes|nullable|string|max:60',
            'cta_secondary' => 'sometimes|nullable|string|max:60',
            'tag_en' => 'sometimes|nullable|string|max:80',
            'judul_en' => 'sometimes|nullable|string|max:160',
            'deskripsi_en' => 'sometimes|nullable|string|max:500',
            'cta_primary_en' => 'sometimes|nullable|string|max:60',
            'cta_secondary_en' => 'sometimes|nullable|string|max:60',
            'urutan' => 'sometimes|integer|min:0',
            'aktif' => 'sometimes|boolean',
        ]);

        $banner->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Banner berhasil diperbarui.',
            'data' => $banner,
        ], 200);
    }

    /**
     * DELETE /api/admin/banners/{id}
     */
    public function destroy(int $id)
    {
        if (!self::ensureSchema()) {
            return response()->json(['success' => false, 'message' => 'Tabel banner belum ada.'], 503);
        }

        $banner = Banner::find($id);
        if (!$banner) {
            return response()->json(['success' => false, 'message' => 'Banner tidak ditemukan.'], 404);
        }

        $banner->delete();

        return response()->json([
            'success' => true,
            'message' => 'Banner berhasil dihapus.',
        ], 200);
    }
}

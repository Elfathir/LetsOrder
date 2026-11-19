<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    use HasFactory;

    protected $table = 'banners';

    protected $primaryKey = 'id_banner';

    protected $keyType = 'int';

    public $incrementing = true;

    public $timestamps = false;

    protected $fillable = [
        'tag',
        'judul',
        'deskripsi',
        'gambar',
        'cta_primary',
        'cta_secondary',
        'tag_en',
        'judul_en',
        'deskripsi_en',
        'cta_primary_en',
        'cta_secondary_en',
        'urutan',
        'aktif',
    ];

    protected function casts(): array
    {
        return [
            'urutan' => 'integer',
            'aktif' => 'boolean',
        ];
    }
}

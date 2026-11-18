<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Promo extends Model
{
    use HasFactory;

    protected $table = 'promos';

    protected $primaryKey = 'id_promo';

    protected $keyType = 'int';

    public $incrementing = true;

    public $timestamps = false;

    protected $fillable = [
        'id_tenant',
        'kode_promo',
        'judul',
        'tipe',
        'diskon',
        'minimal_belanja',
        'batas_per_user',
        'aktif',
    ];

    protected function casts(): array
    {
        return [
            'diskon' => 'integer',
            'minimal_belanja' => 'integer',
            'batas_per_user' => 'integer',
            'aktif' => 'boolean',
        ];
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class, 'id_tenant', 'id_tenant');
    }
}

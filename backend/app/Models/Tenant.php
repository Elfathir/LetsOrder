<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tenant extends Model
{
    use HasFactory;

    protected $table = 'tenants';

    protected $primaryKey = 'id_tenant';

    protected $keyType = 'int';

    public $incrementing = true;

    public $timestamps = false;

    protected $fillable = [
        'id_user',
        'nama_tenant',
        'deskripsi',
        'logo',
        'status_buka',
    ];

    protected function casts(): array
    {
        return [
            'status_buka' => 'boolean',
        ];
    }

    /**
     * Relasi tenant dengan user pemiliknya.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'id_user',
            'id_user'
        );
    }

    /**
     * Relasi tenant dengan daftar menu.
     */
    public function menus(): HasMany
    {
        return $this->hasMany(
            Menu::class,
            'id_tenant',
            'id_tenant'
        );
    }

    /**
     * Relasi tenant dengan daftar pesanan.
     */
    public function orders(): HasMany
    {
        return $this->hasMany(
            Order::class,
            'id_tenant',
            'id_tenant'
        );
    }
}

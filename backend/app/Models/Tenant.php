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
        'jam_buka',
        'jam_tutup',
        'auto_schedule',
    ];

    protected function casts(): array
    {
        return [
            'status_buka' => 'boolean',
            'auto_schedule' => 'boolean',
        ];
    }

    public function isCurrentlyOpen(): bool
    {
        if (!$this->auto_schedule) {
            return (bool) $this->status_buka;
        }
        if ($this->status_buka === false) {
            return false;
        }
        $open = substr((string) ($this->jam_buka ?? '07:00'), 0, 5);
        $close = substr((string) ($this->jam_tutup ?? '21:00'), 0, 5);
        $now = now()->format('H:i');
        return $open <= $close
            ? ($now >= $open && $now < $close)
            : ($now >= $open || $now < $close);
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

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class, 'id_tenant', 'id_tenant');
    }

    public function promos(): HasMany
    {
        return $this->hasMany(Promo::class, 'id_tenant', 'id_tenant');
    }
}

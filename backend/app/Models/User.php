<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory;
    use HasApiTokens;

    protected $table = 'users';

    protected $primaryKey = 'id_user';

    protected $keyType = 'int';

    public $incrementing = true;

    public $timestamps = false;

    protected $fillable = [
        'username',
        'nama',
        'email',
        'password',
        'peran',
    ];

    protected $hidden = [
        'password',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    /**
     * Relasi user dengan tenant yang dimiliki.
     */
    public function tenants(): HasMany
    {
        return $this->hasMany(
            Tenant::class,
            'id_user',
            'id_user'
        );
    }

    /**
     * Relasi user dengan keranjang.
     */
    public function carts(): HasMany
    {
        return $this->hasMany(
            Cart::class,
            'id_user',
            'id_user'
        );
    }

    /**
     * Relasi user dengan pesanan.
     */
    public function orders(): HasMany
    {
        return $this->hasMany(
            Order::class,
            'id_user',
            'id_user'
        );
    }

    /**
     * Relasi user dengan notifikasi.
     */
    public function notifications(): HasMany
    {
        return $this->hasMany(
            Notification::class,
            'id_user',
            'id_user'
        );
    }
}

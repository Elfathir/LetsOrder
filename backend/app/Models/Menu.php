<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Menu extends Model
{
    use HasFactory;

    protected $table = 'menus';

    protected $primaryKey = 'id_menu';

    protected $keyType = 'int';

    public $incrementing = true;

    public $timestamps = false;

    protected $fillable = [
        'id_tenant',
        'id_kategori',
        'nama_menu',
        'deskripsi',
        'gambar',
        'harga',
        'estimasi_menit',
        'status_tersedia',
    ];

    protected function casts(): array
    {
        return [
            'harga' => 'integer',
            'estimasi_menit' => 'integer',
            'status_tersedia' => 'boolean',
        ];
    }

    /**
     * Relasi menu dengan tenant.
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(
            Tenant::class,
            'id_tenant',
            'id_tenant'
        );
    }

    /**
     * Relasi menu dengan kategori.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(
            Category::class,
            'id_kategori',
            'id_kategori'
        );
    }

    /**
     * Relasi menu dengan item keranjang.
     */
    public function cartItems(): HasMany
    {
        return $this->hasMany(
            CartItem::class,
            'id_menu',
            'id_menu'
        );
    }

    /**
     * Relasi menu dengan detail pesanan.
     */
    public function orderDetails(): HasMany
    {
        return $this->hasMany(
            OrderDetail::class,
            'id_menu',
            'id_menu'
        );
    }
}

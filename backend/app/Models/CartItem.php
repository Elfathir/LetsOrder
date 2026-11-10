<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartItem extends Model
{
    use HasFactory;

    protected $table = 'cart_items';

    protected $primaryKey = 'id_item_keranjang';

    protected $keyType = 'int';

    public $incrementing = true;

    public $timestamps = false;

    protected $fillable = [
        'id_keranjang',
        'id_menu',
        'jumlah',
        'catatan',
    ];

    protected function casts(): array
    {
        return [
            'jumlah' => 'integer',
        ];
    }

    /**
     * Relasi item keranjang dengan keranjangnya.
     */
    public function cart(): BelongsTo
    {
        return $this->belongsTo(
            Cart::class,
            'id_keranjang',
            'id_keranjang'
        );
    }

    /**
     * Relasi item keranjang dengan menu.
     */
    public function menu(): BelongsTo
    {
        return $this->belongsTo(
            Menu::class,
            'id_menu',
            'id_menu'
        );
    }
}

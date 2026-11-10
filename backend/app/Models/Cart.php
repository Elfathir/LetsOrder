<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cart extends Model
{
    use HasFactory;

    protected $table = 'carts';

    protected $primaryKey = 'id_keranjang';

    protected $keyType = 'int';

    public $incrementing = true;

    public $timestamps = false;

    protected $fillable = [
        'id_user',
    ];

    /**
     * Relasi keranjang dengan user pemiliknya.
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
     * Relasi keranjang dengan item-item di dalamnya.
     */
    public function cartItems(): HasMany
    {
        return $this->hasMany(
            CartItem::class,
            'id_keranjang',
            'id_keranjang'
        );
    }
}

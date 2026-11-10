<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderDetail extends Model
{
    use HasFactory;

    protected $table = 'order_details';

    protected $primaryKey = 'id_detail';

    protected $keyType = 'int';

    public $incrementing = true;

    public $timestamps = false;

    protected $fillable = [
        'id_pesanan',
        'id_menu',
        'jumlah',
        'subtotal',
    ];

    protected function casts(): array
    {
        return [
            'jumlah' => 'integer',
            'subtotal' => 'integer',
        ];
    }

    /**
     * Relasi detail pesanan dengan pesanan.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(
            Order::class,
            'id_pesanan',
            'id_pesanan'
        );
    }

    /**
     * Relasi detail pesanan dengan menu.
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

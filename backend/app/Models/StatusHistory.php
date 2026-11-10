<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StatusHistory extends Model
{
    use HasFactory;

    protected $table = 'status_histories';

    protected $primaryKey = 'id_riwayat';

    protected $keyType = 'int';

    public $incrementing = true;

    public $timestamps = false;

    protected $fillable = [
        'id_pesanan',
        'status',
        'waktu',
    ];

    protected function casts(): array
    {
        return [
            'waktu' => 'datetime',
        ];
    }

    /**
     * Relasi riwayat status dengan pesanan.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(
            Order::class,
            'id_pesanan',
            'id_pesanan'
        );
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    protected $table = 'payments';

    protected $primaryKey = 'id_pembayaran';

    protected $keyType = 'int';

    public $incrementing = true;

    public $timestamps = false;

    protected $fillable = [
        'id_pesanan',
        'metode_pembayaran',
        'kode_qris',
        'total_bayar',
        'status_verifikasi',
        'batas_waktu',
        'waktu_bayar',
    ];

    protected function casts(): array
    {
        return [
            'total_bayar' => 'integer',
            'batas_waktu' => 'datetime',
            'waktu_bayar' => 'datetime',
        ];
    }

    /**
     * Relasi pembayaran dengan pesanan.
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

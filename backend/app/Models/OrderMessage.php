<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderMessage extends Model
{
    protected $table = 'order_messages';

    protected $primaryKey = 'id_pesan';

    protected $keyType = 'int';

    public $incrementing = true;

    public $timestamps = false;

    protected $fillable = [
        'id_pesanan',
        'id_pengirim',
        'peran_pengirim',
        'nama_pengirim',
        'teks',
        'gambar',
        'waktu',
    ];

    protected function casts(): array
    {
        return [
            'id_pesan' => 'integer',
            'id_pesanan' => 'integer',
            'id_pengirim' => 'integer',
            'waktu' => 'datetime:Y-m-d H:i:s',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'id_pesanan', 'id_pesanan');
    }
}

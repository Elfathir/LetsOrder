<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    use HasFactory;

    protected $table = 'notifications';

    protected $primaryKey = 'id_notifikasi';

    protected $keyType = 'int';

    public $incrementing = true;

    public $timestamps = false;

    protected $fillable = [
        'id_user',
        'id_pesanan',
        'pesan',
        'status_baca',
    ];

    protected function casts(): array
    {
        return [
            'status_baca' => 'boolean',
        ];
    }

    /**
     * Relasi notifikasi dengan user penerima.
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
     * Relasi notifikasi dengan pesanan terkait.
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

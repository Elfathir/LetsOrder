<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $table = 'orders';

    protected $primaryKey = 'id_pesanan';

    protected $keyType = 'int';

    public $incrementing = true;

    public $timestamps = false;

    protected $fillable = [
        'id_user',
        'id_tenant',
        'nomor_antrean',
        'status_pesanan',
        'total_harga',
        'catatan',
        'waktu_pesan',
    ];

    protected function casts(): array
    {
        return [
            'total_harga' => 'integer',
            'waktu_pesan' => 'datetime',
        ];
    }

    /**
     * Relasi pesanan dengan customer.
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
     * Relasi pesanan dengan tenant.
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
     * Relasi pesanan dengan detail pesanan.
     */
    public function orderDetails(): HasMany
    {
        return $this->hasMany(
            OrderDetail::class,
            'id_pesanan',
            'id_pesanan'
        );
    }

    /**
     * Relasi pesanan dengan pembayaran.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(
            Payment::class,
            'id_pesanan',
            'id_pesanan'
        );
    }

    /**
     * Relasi pesanan dengan riwayat status.
     */
    public function statusHistories(): HasMany
    {
        return $this->hasMany(
            StatusHistory::class,
            'id_pesanan',
            'id_pesanan'
        );
    }

    /**
     * Relasi pesanan dengan notifikasi.
     */
    public function notifications(): HasMany
    {
        return $this->hasMany(
            Notification::class,
            'id_pesanan',
            'id_pesanan'
        );
    }
}

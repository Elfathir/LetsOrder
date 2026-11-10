<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasFactory;

    protected $table = 'categories';

    protected $primaryKey = 'id_kategori';

    protected $keyType = 'int';

    public $incrementing = true;

    public $timestamps = false;

    protected $fillable = [
        'nama_kategori',
        'icon',
    ];

    /**
     * Relasi kategori dengan daftar menu.
     */
    public function menus(): HasMany
    {
        return $this->hasMany(
            Menu::class,
            'id_kategori',
            'id_kategori'
        );
    }
}

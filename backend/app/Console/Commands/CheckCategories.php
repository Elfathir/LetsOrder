<?php

namespace App\Console\Commands;

use App\Models\Category;
use Illuminate\Console\Command;

class CheckCategories extends Command
{
    protected $signature = 'app:check-categories';

    protected $description = 'Memeriksa data kategori LetsOrder.com';

    public function handle(): int
    {
        $categories = Category::all();

        $this->info('Jumlah kategori: ' . $categories->count());

        if ($categories->isEmpty()) {
            $this->warn('Belum ada data kategori di database.');
            return self::SUCCESS;
        }

        $this->table(
            ['ID Kategori', 'Nama Kategori', 'Icon'],
            $categories->map(function ($category) {
                return [
                    $category->id_kategori,
                    $category->nama_kategori,
                    $category->icon,
                ];
            })->toArray()
        );

        return self::SUCCESS;
    }
}

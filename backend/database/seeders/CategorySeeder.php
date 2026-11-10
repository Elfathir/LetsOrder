<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'nama_kategori' => 'Makanan',
                'icon' => 'categories/bowl.png',
            ],
            [
                'nama_kategori' => 'Minuman',
                'icon' => 'categories/cup.png',
            ],
            [
                'nama_kategori' => 'Camilan',
                'icon' => 'categories/snack.png',
            ],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['nama_kategori' => $category['nama_kategori']],
                ['icon' => $category['icon']]
            );
        }
    }
}

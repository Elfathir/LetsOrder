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
                'nama_kategori' => 'Rice & Mains',
                'icon' => 'categories/bowl.png',
            ],
            [
                'nama_kategori' => 'Snacks',
                'icon' => 'categories/snack.png',
            ],
            [
                'nama_kategori' => 'Drinks',
                'icon' => 'categories/cup.png',
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

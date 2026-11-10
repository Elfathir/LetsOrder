<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Menu;
use App\Models\Tenant;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $makanan = Category::where('nama_kategori', 'Makanan')->first();
        $minuman = Category::where('nama_kategori', 'Minuman')->first();
        $camilan = Category::where('nama_kategori', 'Camilan')->first();

        $tenant1 = Tenant::where('nama_tenant', 'Kantin Sejahtera')->first()
            ?? Tenant::orderBy('id_tenant', 'asc')->first();

        $tenant2 = Tenant::where('nama_tenant', 'Warung Nusantara')->first()
            ?? $tenant1;

        if (!$tenant1 || !$makanan || !$minuman || !$camilan) {
            return;
        }

        $menus = [
            // Tenant 1: Kantin Sejahtera
            [
                'id_tenant' => $tenant1->id_tenant,
                'id_kategori' => $makanan->id_kategori,
                'nama_menu' => 'Nasi Ayam Geprek Sambal Bawang',
                'deskripsi' => 'Ayam crispy geprek dengan sambal bawang segar, nasi hangat, dan lalapan.',
                'gambar' => 'menu/ayam-geprek.png',
                'harga' => 18000,
                'estimasi_menit' => 8,
                'status_tersedia' => true,
            ],
            [
                'id_tenant' => $tenant1->id_tenant,
                'id_kategori' => $makanan->id_kategori,
                'nama_menu' => 'Mie Ayam Bakso Spesial',
                'deskripsi' => 'Mie ayam kenyal dengan topping ayam manis gurih dan dua bakso sapi.',
                'gambar' => 'menu/mie-ayam-bakso.png',
                'harga' => 16000,
                'estimasi_menit' => 7,
                'status_tersedia' => true,
            ],
            [
                'id_tenant' => $tenant1->id_tenant,
                'id_kategori' => $minuman->id_kategori,
                'nama_menu' => 'Es Teh Manis',
                'deskripsi' => 'Minuman teh melati dingin yang menyegarkan.',
                'gambar' => 'menu/es-teh.png',
                'harga' => 5000,
                'estimasi_menit' => 2,
                'status_tersedia' => true,
            ],
            [
                'id_tenant' => $tenant1->id_tenant,
                'id_kategori' => $camilan->id_kategori,
                'nama_menu' => 'Tahu Crispy Lada Garam',
                'deskripsi' => 'Tahu goreng renyah dengan taburan bawang putih dan cabai lada garam.',
                'gambar' => 'menu/tahu-crispy.png',
                'harga' => 10000,
                'estimasi_menit' => 5,
                'status_tersedia' => true,
            ],

            // Tenant 2: Warung Nusantara
            [
                'id_tenant' => $tenant2->id_tenant,
                'id_kategori' => $makanan->id_kategori,
                'nama_menu' => 'Nasi Goreng Kampung Telur Dadar',
                'deskripsi' => 'Nasi goreng bumbu rempah tradisional disajikan dengan telur dadar dan kerupuk.',
                'gambar' => 'menu/nasi-goreng.png',
                'harga' => 17000,
                'estimasi_menit' => 9,
                'status_tersedia' => true,
            ],
            [
                'id_tenant' => $tenant2->id_tenant,
                'id_kategori' => $makanan->id_kategori,
                'nama_menu' => 'Soto Ayam Lamongan + Nasi',
                'deskripsi' => 'Soto ayam kuah kuning gurih lengkap dengan koya, bihun, telur, dan nasi putih.',
                'gambar' => 'menu/soto-ayam.png',
                'harga' => 16000,
                'estimasi_menit' => 6,
                'status_tersedia' => true,
            ],
            [
                'id_tenant' => $tenant2->id_tenant,
                'id_kategori' => $minuman->id_kategori,
                'nama_menu' => 'Es Jeruk Peras Murni',
                'deskripsi' => 'Perasan jeruk segar pilihan dengan es batu.',
                'gambar' => 'menu/es-jeruk.png',
                'harga' => 7000,
                'estimasi_menit' => 3,
                'status_tersedia' => true,
            ],
            [
                'id_tenant' => $tenant2->id_tenant,
                'id_kategori' => $camilan->id_kategori,
                'nama_menu' => 'Pisang Goreng Keju Cokelat',
                'deskripsi' => 'Pisang kepok goreng hangat dengan parutan keju dan susu kental manis cokelat.',
                'gambar' => 'menu/pisang-keju.png',
                'harga' => 12000,
                'estimasi_menit' => 5,
                'status_tersedia' => true,
            ],
        ];

        foreach ($menus as $menuData) {
            Menu::updateOrCreate(
                [
                    'id_tenant' => $menuData['id_tenant'],
                    'nama_menu' => $menuData['nama_menu'],
                ],
                $menuData
            );
        }
    }
}


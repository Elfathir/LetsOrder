<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;

class TenantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $vendor1 = User::where('username', 'vendor01')->first()
            ?? User::where('peran', 'Vendor')->first();

        $vendor2 = User::where('username', 'vendor02')->first()
            ?? $vendor1;

        if (!$vendor1) {
            return;
        }

        $tenants = [
            [
                'id_user' => $vendor1->id_user,
                'nama_tenant' => 'Kantin Sejahtera',
                'deskripsi' => 'Menyediakan hidangan nasi, ayam penyet, mie ayam, dan minuman segar favorit mahasiswa UPNVJ.',
                'logo' => 'tenant/kantin-sejahtera.png',
                'status_buka' => true,
            ],
            [
                'id_user' => $vendor2->id_user,
                'nama_tenant' => 'Warung Nusantara',
                'deskripsi' => 'Aneka soto, nasi goreng spesial, camilan hangat, serta kopi dan teh dingin.',
                'logo' => 'tenant/warung-nusantara.png',
                'status_buka' => true,
            ],
        ];

        foreach ($tenants as $tenantData) {
            Tenant::updateOrCreate(
                ['nama_tenant' => $tenantData['nama_tenant']],
                $tenantData
            );
        }
    }
}


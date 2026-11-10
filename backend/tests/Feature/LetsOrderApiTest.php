<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Menu;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class LetsOrderApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $vendor1;
    protected User $vendor2;
    protected User $customer1;
    protected User $customer2;
    protected Category $catMakanan;
    protected Category $catMinuman;
    protected Tenant $tenant1;
    protected Tenant $tenant2;
    protected Menu $menuAvailable;
    protected Menu $menuUnavailable;
    protected Menu $menuTenant2;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::create([
            'username' => 'admin',
            'nama' => 'Admin UPNVJ',
            'email' => 'admin@upnvj.ac.id',
            'password' => Hash::make('password123'),
            'peran' => 'Administrator',
        ]);

        $this->vendor1 = User::create([
            'username' => 'vendor1',
            'nama' => 'Vendor Sejahtera',
            'email' => 'vendor1@upnvj.ac.id',
            'password' => Hash::make('password123'),
            'peran' => 'Vendor',
        ]);

        $this->vendor2 = User::create([
            'username' => 'vendor2',
            'nama' => 'Vendor Nusantara',
            'email' => 'vendor2@upnvj.ac.id',
            'password' => Hash::make('password123'),
            'peran' => 'Vendor',
        ]);

        $this->customer1 = User::create([
            'username' => 'customer1',
            'nama' => 'Customer Satu',
            'email' => 'customer1@upnvj.ac.id',
            'password' => Hash::make('password123'),
            'peran' => 'Customer',
        ]);

        $this->customer2 = User::create([
            'username' => 'customer2',
            'nama' => 'Customer Dua',
            'email' => 'customer2@upnvj.ac.id',
            'password' => Hash::make('password123'),
            'peran' => 'Customer',
        ]);

        $this->catMakanan = Category::create([
            'nama_kategori' => 'Makanan',
            'icon' => 'categories/bowl.png',
        ]);

        $this->catMinuman = Category::create([
            'nama_kategori' => 'Minuman',
            'icon' => 'categories/cup.png',
        ]);

        $this->tenant1 = Tenant::create([
            'id_user' => $this->vendor1->id_user,
            'nama_tenant' => 'Kantin Sejahtera',
            'deskripsi' => 'Tenant Makanan & Minuman',
            'logo' => 'tenant/logo1.png',
            'status_buka' => true,
        ]);

        $this->tenant2 = Tenant::create([
            'id_user' => $this->vendor2->id_user,
            'nama_tenant' => 'Warung Nusantara',
            'deskripsi' => 'Tenant Soto & Nasi Goreng',
            'logo' => 'tenant/logo2.png',
            'status_buka' => true,
        ]);

        $this->menuAvailable = Menu::create([
            'id_tenant' => $this->tenant1->id_tenant,
            'id_kategori' => $this->catMakanan->id_kategori,
            'nama_menu' => 'Ayam Geprek',
            'deskripsi' => 'Ayam geprek pedas',
            'gambar' => 'menu/ayam.png',
            'harga' => 15000,
            'estimasi_menit' => 7,
            'status_tersedia' => true,
        ]);

        $this->menuUnavailable = Menu::create([
            'id_tenant' => $this->tenant1->id_tenant,
            'id_kategori' => $this->catMinuman->id_kategori,
            'nama_menu' => 'Es Kopi Habis',
            'deskripsi' => 'Stok sedang kosong',
            'gambar' => 'menu/kopi.png',
            'harga' => 8000,
            'estimasi_menit' => 3,
            'status_tersedia' => false,
        ]);

        $this->menuTenant2 = Menu::create([
            'id_tenant' => $this->tenant2->id_tenant,
            'id_kategori' => $this->catMakanan->id_kategori,
            'nama_menu' => 'Soto Ayam',
            'deskripsi' => 'Soto ayam kuah bening',
            'gambar' => 'menu/soto.png',
            'harga' => 16000,
            'estimasi_menit' => 6,
            'status_tersedia' => true,
        ]);
    }

    public function test_menu_catalog_only_returns_available_menus_by_default(): void
    {
        $response = $this->getJson('/api/menus');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $data = $response->json('data');
        $this->assertCount(2, $data);

        $menuIds = array_column($data, 'id_menu');
        $this->assertContains($this->menuAvailable->id_menu, $menuIds);
        $this->assertNotContains($this->menuUnavailable->id_menu, $menuIds);
    }

    public function test_tenant_endpoints_return_tenants_and_menus(): void
    {
        $this->getJson('/api/tenants')
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->getJson("/api/tenants/{$this->tenant1->id_tenant}")
            ->assertStatus(200)
            ->assertJsonPath('data.nama_tenant', 'Kantin Sejahtera');

        $this->getJson("/api/tenants/{$this->tenant1->id_tenant}/menus")
            ->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_cart_enforces_single_tenant_rule_and_complete_order_payment_flow(): void
    {
        // 1. Tambah item dari Tenant 1 ke keranjang
        $this->actingAs($this->customer1, 'sanctum')
            ->postJson('/api/cart/items', [
                'id_menu' => $this->menuAvailable->id_menu,
                'jumlah' => 2,
                'catatan' => 'Sambal pisah',
            ])
            ->assertStatus(201)
            ->assertJsonPath('data.total_harga', 30000);

        // 2. Coba tambah item dari Tenant 2 (harus ditolak karena beda tenant)
        $this->actingAs($this->customer1, 'sanctum')
            ->postJson('/api/cart/items', [
                'id_menu' => $this->menuTenant2->id_menu,
                'jumlah' => 1,
            ])
            ->assertStatus(422);

        // 3. Buat pesanan dari keranjang
        $orderRes = $this->actingAs($this->customer1, 'sanctum')
            ->postJson('/api/orders', [
                'catatan' => 'Diambil jam 12 siang',
            ]);

        $orderRes->assertStatus(201)
            ->assertJsonPath('data.status_pesanan', 'Menunggu Pembayaran')
            ->assertJsonPath('data.total_harga', 30000);

        $orderId = $orderRes->json('data.id_pesanan');

        // 4. Buat pembayaran simulasi QRIS
        $payRes = $this->actingAs($this->customer1, 'sanctum')
            ->postJson("/api/orders/{$orderId}/payment", [
                'metode_pembayaran' => 'QRIS',
            ]);

        $payRes->assertStatus(201)
            ->assertJsonPath('data.status_verifikasi', 'Menunggu')
            ->assertJsonPath('data.total_bayar', 30000);

        $paymentId = $payRes->json('data.id_pembayaran');

        // 5. Verifikasi pembayaran simulasi -> status otomatis menjadi 'Sedang Diproses'
        $this->actingAs($this->customer1, 'sanctum')
            ->patchJson("/api/payments/{$paymentId}/verification", [
                'status_verifikasi' => 'Terverifikasi',
            ])
            ->assertStatus(200)
            ->assertJsonPath('data.status_verifikasi', 'Terverifikasi');

        $this->actingAs($this->customer1, 'sanctum')
            ->getJson("/api/orders/{$orderId}/status")
            ->assertStatus(200)
            ->assertJsonPath('data.status_pesanan', 'Sedang Diproses');

        // 6. Vendor 2 mencoba mengubah status pesanan milik Tenant 1 -> harus ditolak (403)
        $this->actingAs($this->vendor2, 'sanctum')
            ->patchJson("/api/vendor/orders/{$orderId}/status", [
                'status_pesanan' => 'Siap Diambil',
            ])
            ->assertStatus(403);

        // 7. Vendor 1 (pemilik Tenant 1) mengubah status menjadi 'Siap Diambil' lalu 'Selesai'
        $this->actingAs($this->vendor1, 'sanctum')
            ->patchJson("/api/vendor/orders/{$orderId}/status", [
                'status_pesanan' => 'Siap Diambil',
            ])
            ->assertStatus(200)
            ->assertJsonPath('data.status_pesanan', 'Siap Diambil');

        $this->actingAs($this->vendor1, 'sanctum')
            ->patchJson("/api/vendor/orders/{$orderId}/status", [
                'status_pesanan' => 'Selesai',
            ])
            ->assertStatus(200)
            ->assertJsonPath('data.status_pesanan', 'Selesai');

        // 8. Periksa riwayat status & notifikasi Customer 1
        $this->actingAs($this->customer1, 'sanctum')
            ->getJson("/api/orders/{$orderId}/status-history")
            ->assertStatus(200)
            ->assertJsonCount(4, 'data');

        $this->actingAs($this->customer1, 'sanctum')
            ->getJson('/api/notifications')
            ->assertStatus(200);

        // 9. Customer 2 tidak boleh mengakses pesanan Customer 1 (403)
        $this->actingAs($this->customer2, 'sanctum')
            ->getJson("/api/orders/{$orderId}")
            ->assertStatus(403);
    }
}


<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Menu;
use Illuminate\Http\Request;

class CartController extends Controller
{
    /**
     * Menampilkan isi keranjang milik Customer yang sedang login.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $cart = $this->getOrCreateCart($user->id_user);

        return response()->json([
            'success' => true,
            'message' => 'Keranjang berhasil diambil.',
            'data' => $this->formatCartPayload($cart),
        ], 200);
    }

    /**
     * Menambahkan item menu ke dalam keranjang Customer.
     * Menjaga aturan satu tenant dalam satu keranjang/transaksi (FR-19).
     */
    public function storeItem(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'id_menu' => 'required|integer|exists:menus,id_menu',
            'jumlah' => 'required|integer|min:1',
            'catatan' => 'nullable|string|max:500',
        ]);

        $menu = Menu::with('tenant')->find($validated['id_menu']);

        if (!$menu) {
            return response()->json([
                'success' => false,
                'message' => 'Menu tidak ditemukan.',
            ], 404);
        }

        if (!$menu->status_tersedia) {
            return response()->json([
                'success' => false,
                'message' => 'Menu sedang tidak tersedia dan tidak dapat ditambahkan ke keranjang.',
            ], 422);
        }

        if ($menu->tenant && !$menu->tenant->status_buka) {
            return response()->json([
                'success' => false,
                'message' => 'Tenant sedang tutup dan tidak dapat menerima pesanan.',
            ], 422);
        }

        $cart = $this->getOrCreateCart($user->id_user);
        $cart->load('cartItems.menu');

        // Periksa aturan satu tenant dalam satu keranjang (FR-19)
        $existingTenantIds = $cart->cartItems
            ->pluck('menu.id_tenant')
            ->filter()
            ->unique()
            ->values();

        if ($existingTenantIds->isNotEmpty() && !$existingTenantIds->contains($menu->id_tenant)) {
            return response()->json([
                'success' => false,
                'message' => 'Keranjang hanya dapat berisi menu dari satu tenant yang sama. Selesaikan pesanan atau kosongkan keranjang terlebih dahulu sebelum memilih menu dari tenant lain.',
            ], 422);
        }

        $existingItem = CartItem::where('id_keranjang', $cart->id_keranjang)
            ->where('id_menu', $menu->id_menu)
            ->first();

        if ($existingItem) {
            $newNotes = array_key_exists('catatan', $validated) && $validated['catatan'] !== null
                ? $validated['catatan']
                : $existingItem->catatan;

            $existingItem->update([
                'jumlah' => $existingItem->jumlah + (int) $validated['jumlah'],
                'catatan' => $newNotes ?? '',
            ]);
            $cartItem = $existingItem;
        } else {
            $cartItem = CartItem::create([
                'id_keranjang' => $cart->id_keranjang,
                'id_menu' => $menu->id_menu,
                'jumlah' => (int) $validated['jumlah'],
                'catatan' => $validated['catatan'] ?? '',
            ]);
        }

        $cart->refresh();

        return response()->json([
            'success' => true,
            'message' => 'Item berhasil ditambahkan ke keranjang.',
            'data' => $this->formatCartPayload($cart),
            'item' => $cartItem->load('menu'),
        ], 201);
    }

    /**
     * Mengubah jumlah atau catatan item pada keranjang Customer.
     */
    public function updateItem(Request $request, int $id)
    {
        $user = $request->user();

        $cartItem = CartItem::with(['cart', 'menu'])->find($id);

        if (!$cartItem) {
            return response()->json([
                'success' => false,
                'message' => 'Item keranjang tidak ditemukan.',
            ], 404);
        }

        if (!$cartItem->cart || (int) $cartItem->cart->id_user !== (int) $user->id_user) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak akses untuk mengubah item keranjang milik pengguna lain.',
            ], 403);
        }

        $validated = $request->validate([
            'jumlah' => 'sometimes|required|integer|min:1',
            'catatan' => 'nullable|string|max:500',
        ]);

        $updateData = [];
        if (array_key_exists('jumlah', $validated)) {
            $updateData['jumlah'] = (int) $validated['jumlah'];
        }
        if (array_key_exists('catatan', $validated)) {
            $updateData['catatan'] = $validated['catatan'] ?? '';
        }

        $cartItem->update($updateData);

        $cart = $cartItem->cart->refresh();

        return response()->json([
            'success' => true,
            'message' => 'Item keranjang berhasil diperbarui.',
            'data' => $this->formatCartPayload($cart),
        ], 200);
    }

    /**
     * Menghapus satu item dari keranjang Customer.
     */
    public function destroyItem(Request $request, int $id)
    {
        $user = $request->user();

        $cartItem = CartItem::with('cart')->find($id);

        if (!$cartItem) {
            return response()->json([
                'success' => false,
                'message' => 'Item keranjang tidak ditemukan.',
            ], 404);
        }

        if (!$cartItem->cart || (int) $cartItem->cart->id_user !== (int) $user->id_user) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak akses untuk menghapus item keranjang milik pengguna lain.',
            ], 403);
        }

        $cartItem->delete();

        return response()->json([
            'success' => true,
            'message' => 'Item berhasil dihapus.',
            'data' => null,
        ], 200);
    }

    /**
     * Mengosongkan seluruh item pada keranjang Customer.
     */
    public function clearCart(Request $request)
    {
        $user = $request->user();
        $cart = Cart::where('id_user', $user->id_user)->first();

        if ($cart) {
            $cart->cartItems()->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Keranjang berhasil dikosongkan.',
            'data' => null,
        ], 200);
    }

    /**
     * Mengambil atau membuat keranjang untuk id_user terkait.
     */
    private function getOrCreateCart(int $userId): Cart
    {
        return Cart::firstOrCreate(['id_user' => $userId]);
    }

    /**
     * Menyusun struktur response keranjang sesuai spesifikasi API.
     */
    private function formatCartPayload(Cart $cart): array
    {
        $cart->load(['cartItems.menu.tenant', 'cartItems.menu.category']);

        $totalHarga = 0;
        $totalItem = 0;
        $tenantInfo = null;

        $items = $cart->cartItems->map(function (CartItem $item) use (&$totalHarga, &$totalItem, &$tenantInfo) {
            $harga = $item->menu ? (int) $item->menu->harga : 0;
            $jumlah = (int) $item->jumlah;
            $subtotal = $harga * $jumlah;

            $totalHarga += $subtotal;
            $totalItem += $jumlah;

            if (!$tenantInfo && $item->menu && $item->menu->tenant) {
                $tenantInfo = $item->menu->tenant;
            }

            return [
                'id_item_keranjang' => $item->id_item_keranjang,
                'id_keranjang' => $item->id_keranjang,
                'id_menu' => $item->id_menu,
                'nama_menu' => $item->menu?->nama_menu,
                'harga' => $harga,
                'gambar' => $item->menu?->gambar,
                'estimasi_menit' => $item->menu?->estimasi_menit,
                'status_tersedia' => $item->menu?->status_tersedia,
                'id_tenant' => $item->menu?->id_tenant,
                'nama_tenant' => $item->menu?->tenant?->nama_tenant,
                'jumlah' => $jumlah,
                'catatan' => $item->catatan,
                'subtotal' => $subtotal,
                'menu' => $item->menu,
            ];
        })->values();

        return [
            'id_keranjang' => $cart->id_keranjang,
            'id_user' => $cart->id_user,
            'id_tenant' => $tenantInfo?->id_tenant,
            'tenant' => $tenantInfo,
            'items' => $items,
            'total_item' => $totalItem,
            'total_harga' => $totalHarga,
        ];
    }
}


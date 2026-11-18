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
        $compact = $request->boolean('compact_media', false);

        return response()->json([
            'success' => true,
            'message' => 'Keranjang berhasil diambil.',
            'data' => $this->cartPayloadForUser((int) $user->id_user, $compact),
        ], 200);
    }

    public function cartPayloadForUser(int $userId, bool $compact = false): array
    {
        $cart = $this->getOrCreateCart($userId);

        return $this->formatCartPayload($cart, $compact);
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
            'jumlah' => 'required|integer|min:1|max:100',
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

        if ($menu->tenant && !$menu->tenant->isCurrentlyOpen()) {
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
                'jumlah' => min(100, $existingItem->jumlah + (int) $validated['jumlah']),
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
            'jumlah' => 'sometimes|required|integer|min:1|max:100',
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
    private function formatCartPayload(Cart $cart, bool $compact = false): array
    {
        if ($compact) {
            $cart->load([
                'cartItems.menu' => fn ($q) => $q->select([
                    'id_menu',
                    'id_tenant',
                    'id_kategori',
                    'nama_menu',
                    'harga',
                    'estimasi_menit',
                    'status_tersedia',
                ])->selectRaw(MediaController::previewSql('gambar', 'gambar', true))
                    ->with([
                        'category',
                        'tenant' => fn ($tq) => $tq->select(['id_tenant', 'id_user', 'nama_tenant', 'status_buka'])
                            ->selectRaw(MediaController::previewSql('logo', 'logo', false)),
                    ]),
            ]);
        } else {
            $cart->load(['cartItems.menu.tenant', 'cartItems.menu.category']);
        }

        $totalHarga = 0;
        $totalItem = 0;
        $tenantInfo = null;

        $items = $cart->cartItems->map(function (CartItem $item) use (&$totalHarga, &$totalItem, &$tenantInfo, $compact) {
            $harga = $item->menu ? (int) $item->menu->harga : 0;
            $jumlah = (int) $item->jumlah;
            $subtotal = $harga * $jumlah;

            $totalHarga += $subtotal;
            $totalItem += $jumlah;

            if (!$tenantInfo && $item->menu && $item->menu->tenant) {
                $tArr = $item->menu->tenant->toArray();
                if ($compact) {
                    $tLogo = MediaController::compactMediaValue(
                        'tenant',
                        (int) $item->menu->tenant->id_tenant,
                        $tArr['logo_preview'] ?? '',
                        $tArr['logo_len'] ?? 0
                    );
                    $tArr['logo'] = $tLogo;
                    $tArr['gambar'] = $tLogo;
                    unset($tArr['logo_preview'], $tArr['logo_len']);
                }
                $tenantInfo = $tArr;
            }

            $menuPayload = $item->menu;
            $itemImg = $item->menu?->gambar;
            if ($compact && $item->menu) {
                $itemImg = MediaController::compactMediaValue(
                    'menu',
                    (int) $item->menu->id_menu,
                    $item->menu->gambar_preview ?? '',
                    $item->menu->gambar_len ?? 0
                );
                $menuArr = $item->menu->toArray();
                $menuArr['gambar'] = $itemImg;
                unset($menuArr['gambar_preview'], $menuArr['gambar_len']);
                if (isset($menuArr['tenant']) && is_array($menuArr['tenant'])) {
                    $tLogo = MediaController::compactMediaValue(
                        'tenant',
                        (int) ($menuArr['tenant']['id_tenant'] ?? 0),
                        $menuArr['tenant']['logo_preview'] ?? '',
                        $menuArr['tenant']['logo_len'] ?? 0
                    );
                    $menuArr['tenant']['logo'] = $tLogo;
                    $menuArr['tenant']['gambar'] = $tLogo;
                    unset($menuArr['tenant']['logo_preview'], $menuArr['tenant']['logo_len']);
                }
                $menuPayload = $menuArr;
            }

            return [
                'id_item_keranjang' => $item->id_item_keranjang,
                'id_keranjang' => $item->id_keranjang,
                'id_menu' => $item->id_menu,
                'nama_menu' => $item->menu?->nama_menu,
                'harga' => $harga,
                'gambar' => $itemImg,
                'estimasi_menit' => $item->menu?->estimasi_menit,
                'status_tersedia' => $item->menu?->status_tersedia,
                'id_tenant' => $item->menu?->id_tenant,
                'nama_tenant' => $item->menu?->tenant?->nama_tenant,
                'jumlah' => $jumlah,
                'catatan' => $item->catatan,
                'subtotal' => $subtotal,
                'menu' => $menuPayload,
            ];
        })->values();

        return [
            'id_keranjang' => $cart->id_keranjang,
            'id_user' => $cart->id_user,
            'id_tenant' => is_array($tenantInfo) ? ($tenantInfo['id_tenant'] ?? null) : $tenantInfo?->id_tenant,
            'tenant' => $tenantInfo,
            'items' => $items,
            'total_item' => $totalItem,
            'total_harga' => $totalHarga,
        ];
    }
}


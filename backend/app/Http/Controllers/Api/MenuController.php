<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Menu;

class MenuController extends Controller
{
    /**
     * Menampilkan seluruh menu yang tersedia.
     */
    public function index()
    {
        $menus = Menu::with(['tenant', 'category'])
            ->orderBy('id_menu', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar menu berhasil diambil.',
            'data' => $menus,
        ], 200);
    }
}
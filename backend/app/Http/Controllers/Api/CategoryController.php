<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;

class CategoryController extends Controller
{
    /**
     * Menampilkan seluruh kategori.
     */
    public function index()
    {
        $categories = Category::orderBy('id_kategori', 'asc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar kategori berhasil diambil.',
            'data' => $categories,
        ], 200);
    }
}

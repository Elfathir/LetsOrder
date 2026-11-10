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

    /**
     * Menampilkan detail kategori beserta menu yang tersedia.
     */
    public function show(int $id)
    {
        $category = Category::with([
            'menus' => function ($query) {
                $query->where('status_tersedia', true)
                    ->with('tenant')
                    ->orderBy('id_menu', 'asc');
            },
        ])->find($id);

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Kategori tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail kategori berhasil diambil.',
            'data' => $category,
        ], 200);
    }
}

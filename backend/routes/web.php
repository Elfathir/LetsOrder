<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'success' => true,
        'application' => 'LetsOrder.com',
        'message' => 'API is available.',
    ]);
});

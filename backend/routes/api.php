<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\admin\AuthController;
use App\Http\Controllers\admin\CategoryController;
use App\Http\Controllers\admin\BrandsController;
use App\Http\Controllers\admin\SizeController;
use App\Http\Controllers\admin\ProductController;
use App\Http\Controllers\admin\TempImageController;

/*
|--------------------------------------------------------------------------
| Public Routes (Storefront & Auth)
|--------------------------------------------------------------------------
*/
// Public catalog browsing
Route::get('products', [ProductController::class, 'index']);
Route::get('products/{id}', [ProductController::class, 'show']);
Route::get('categories', [CategoryController::class, 'index']);
Route::get('categories/{id}', [CategoryController::class, 'show']);
Route::get('brands', [BrandsController::class, 'index']);
Route::get('brands/{id}', [BrandsController::class, 'show']);
Route::get('sizes', [SizeController::class, 'index']);

// Authentication
Route::post('admin/login', [AuthController::class, 'authenticate']);
Route::post('login', [AuthController::class, 'login']);
Route::post('register', [AuthController::class, 'register']);

/*
|--------------------------------------------------------------------------
| Protected Routes (Authenticated Users / Admin)
|--------------------------------------------------------------------------
*/
Route::group(['middleware' => 'auth:sanctum'], function () {
    // Current user & logout
    Route::get('user', [AuthController::class, 'me']);
    Route::post('logout', [AuthController::class, 'logout']);

    // Admin category management
    Route::post('categories', [CategoryController::class, 'store']);
    Route::put('categories/{id}', [CategoryController::class, 'update']);
    Route::delete('categories/{id}', [CategoryController::class, 'destroy']);

    // Admin brand management
    Route::post('brands', [BrandsController::class, 'store']);
    Route::put('brands/{id}', [BrandsController::class, 'update']);
    Route::delete('brands/{id}', [BrandsController::class, 'destroy']);

    // Admin size management
    Route::post('sizes', [SizeController::class, 'store']);
    Route::delete('sizes/{id}', [SizeController::class, 'destroy']);

    // Admin product management
    Route::post('products', [ProductController::class, 'store']);
    Route::put('products/{id}', [ProductController::class, 'update']);
    Route::delete('products/{id}', [ProductController::class, 'destroy']);
    Route::delete('product-images/{id}', [ProductController::class, 'destroyImage']);

    // Image upload (temporary)
    Route::post('temp-images', [TempImageController::class, 'store']);
});
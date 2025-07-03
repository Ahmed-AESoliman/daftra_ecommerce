<?php

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Order\OrderController;
use App\Http\Controllers\Api\Product\ProductController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('public')->middleware(['throttle:60,1'])->group(function () {
    Route::prefix('products')->group(function () {
        Route::get('/', [ProductController::class, 'publicProducts']);
        Route::get('/{slug}', [ProductController::class, 'publicProductBySlug']);
    });

    Route::get('/categories', [ProductController::class, 'categories']);

    Route::post('/cart/validate-stock', [ProductController::class, 'validateCartStock'])
        ->middleware(['throttle:30,1']);

    Route::post('/orders', [OrderController::class, 'createOrder'])
        ->middleware(['throttle:10,1']);
});

Route::group(['prefix' => 'admin'], function () {
    Route::group(['middleware' => ['throttle:5,1']], function () {
        Route::prefix('auth')->group(function () {
            Route::post('/login', [AuthController::class, 'login']);
            Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
            Route::post('/resend', [AuthController::class, 'resend']);
            Route::post('/reset-password', [AuthController::class, 'resetPassword']);
            Route::post('/verify', [AuthController::class, 'verify']);
            Route::post('/resend-verify', [AuthController::class, 'resendVerify']);
        });
    });

    Route::group(['middleware' => 'auth:api', 'throttle:30,1'], function () {

        Route::prefix('auth')->group(function () {
            Route::get('/authenticated-user', [AuthController::class, 'getAuthenticatedUser']);
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::post('/update', [AuthController::class, 'update']);
            Route::put('/password', [AuthController::class, 'updatePassword']);
        });

        Route::prefix('products')->group(function () {
            Route::get('/categories', [ProductController::class, 'categories']);
            Route::post('/', [ProductController::class, 'store']);
            Route::post('/{product:slug}', [ProductController::class, 'update']);
            Route::delete('/{product:slug}', [ProductController::class, 'destroy']);
            Route::get('/', [ProductController::class, 'index']);
            Route::get('/{product:slug}', [ProductController::class, 'show']);
        });

        Route::prefix('orders')->group(function () {
            Route::get('/', [OrderController::class, 'index']);
            Route::get('/{order:order_number}', [OrderController::class, 'show']);
            Route::put('/{order:order_number}', [OrderController::class, 'update']);
            Route::delete('/{order:order_number}', [OrderController::class, 'destroy']);
        });
    });
});

<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\OrderController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('register', [AuthController::class, 'register']);

Route::post('login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->post('logout', [AuthController::class, 'logout']);

Route::middleware('auth:sanctum')->group(function () {
    // Tạo đơn hàng
    Route::post('orders', [OrderController::class, 'create']);

    // Lấy danh sách đơn hàng
    Route::get('orders', [OrderController::class, 'index']);

    // Khớp đơn hàng giữa người gửi và người vận chuyển
    Route::post('orders/match', [OrderController::class, 'matchOrder']);

    // Cập nhật trạng thái đơn hàng
    Route::put('orders/{order}', [OrderController::class, 'updateStatus']);
});

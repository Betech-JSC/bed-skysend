<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\UserController;

Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('logout', [AuthController::class, 'logout']);

    // Orders
    Route::post('orders', [OrderController::class, 'create']);
    Route::get('orders', [OrderController::class, 'index']);
    Route::get('orders/{order}', [OrderController::class, 'show']);
    Route::put('orders/{order}', [OrderController::class, 'updateStatus']);
    Route::delete('orders/{order}', [OrderController::class, 'cancel']);
    Route::post('orders/match', [OrderController::class, 'matchOrder']);

    // Notifications
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::put('notifications/{notification}', [NotificationController::class, 'markAsRead']);

    // Chat
    Route::get('chats/{order}', [ChatController::class, 'index']);
    Route::post('chats/{order}', [ChatController::class, 'sendMessage']);

    Route::get('user/profile', [UserController::class, 'show']);
    Route::put('user/profile', [UserController::class, 'update']);
    Route::post('user/change-password', [UserController::class, 'changePassword']);
    Route::post('user/upload-avatar', [UserController::class, 'uploadAvatar']);
    Route::post('user/assign-role', [UserController::class, 'assignRole']);
});

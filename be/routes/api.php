<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\RegionsController;
use App\Http\Controllers\Api\UserController;


Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);
Route::get('regions', [RegionsController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/chat/send', [ChatController::class, 'sendMessage']);
    Route::post('logout', [AuthController::class, 'logout']);
    // Orders
    Route::get('orders', [OrderController::class, 'index']);
    Route::post('orders/create', [OrderController::class, 'create']);
    Route::get('orders/{order}', [OrderController::class, 'show']);
    Route::put('orders/{order}', [OrderController::class, 'updateStatus']);
    Route::delete('orders/{orderId}/cancel', [OrderController::class, 'cancel']);
    Route::post('orders/match', [OrderController::class, 'matchOrder']);

    // Notifications
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::put('notifications/{notification}', [NotificationController::class, 'markAsRead']);

    Route::get('user/profile', [UserController::class, 'show']);
    Route::put('user/profile', [UserController::class, 'update']);
    Route::post('user/change-password', [UserController::class, 'changePassword']);
    Route::post('user/upload-avatar', [UserController::class, 'uploadAvatar']);
});

Route::controller(AuthController::class)->group(function () {
    Route::get('auth/{provider}/redirect', 'redirectToProvider'); // google / facebook
    Route::get('auth/{provider}/callback', 'handleProviderCallback');
});

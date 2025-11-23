<?php

use App\Http\Controllers\Api\AirportController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\FlightController;
use App\Http\Controllers\Api\FlightSearchController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\RegionsController;
use App\Http\Controllers\Api\RequestController;
use App\Http\Controllers\Api\UserController;

Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);
Route::get('regions', [RegionsController::class, 'index']);
Route::post('/users/save-token', [UserController::class, 'savePushToken']);

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/chat/send', [ChatController::class, 'sendMessage']);
    Route::post('logout', [AuthController::class, 'logout']);
    // Orders
    Route::get('orders', [OrderController::class, 'index']);
    Route::post('orders/create', [OrderController::class, 'create']);
    Route::get('orders/{order}/show', [OrderController::class, 'show']);
    Route::put('orders/{order}/status', [OrderController::class, 'updateStatus']);
    Route::delete('orders/{orderId}/cancel', [OrderController::class, 'cancel']);
    Route::post('orders/match', [OrderController::class, 'matchOrder']);
    Route::post('/orders/confirm-match', [OrderController::class, 'confirmMatch']);


    // Notifications
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::put('notifications/{notification}', [NotificationController::class, 'markAsRead']);

    Route::get('user/profile', [UserController::class, 'show']);
    Route::put('user/profile', [UserController::class, 'update']);
    Route::post('user/change-password', [UserController::class, 'changePassword']);
    Route::post('user/upload-avatar', [UserController::class, 'uploadAvatar']);

    // 1. Tìm kiếm Flight phù hợp (Filter Search cho Sender)
    Route::get('/flights/search', [FlightSearchController::class, 'index'])
        ->name('flights.search');

    Route::post('/flights/store', [FlightController::class, 'store'])
        ->name('flights.store');

    // 2. Gửi yêu cầu riêng cho 1 hành khách (Private Request)
    Route::post('private-requests/store', [RequestController::class, 'store']);

    // 3. (Bonus) Lấy danh sách yêu cầu riêng đã gửi
    Route::get('private-requests', [RequestController::class, 'index']);
});

Route::controller(AuthController::class)->group(function () {
    Route::get('auth/{provider}/redirect', 'redirectToProvider');
    Route::get('auth/{provider}/callback', 'handleProviderCallback');
});

// Lấy danh sách tất cả sân bay
Route::get('/airports', [AirportController::class, 'index']);

// Tìm kiếm sân bay theo từ khóa (code, name_vi, name_en, city_code)
Route::get('/airports/search', [AirportController::class, 'search']);

// Lấy chi tiết 1 sân bay theo code (IATA/ICAO)
Route::get('/airports/{code}', [AirportController::class, 'show']);

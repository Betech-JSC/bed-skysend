<?php

use App\Http\Controllers\Api\AirlineController;
use App\Http\Controllers\Api\AirportController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\FlightController;
use App\Http\Controllers\Api\FlightSearchController;
use App\Http\Controllers\Api\PaymentMethodController;
use App\Http\Controllers\Api\WalletController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\RegionsController;
use App\Http\Controllers\Api\RequestController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\AttachmentController;

Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);
Route::get('regions', [RegionsController::class, 'index']);
Route::post('/users/save-token', [UserController::class, 'savePushToken']);

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/chat/send', [ChatController::class, 'sendMessage']);
    Route::post('logout', [AuthController::class, 'logout']);

    // Orders
    Route::get('orders/getList', [OrderController::class, 'index']);
    Route::post('orders/store', [OrderController::class, 'store']);
    Route::get('orders/{id}/show', [OrderController::class, 'show']);
    Route::put('orders/{id}/status', [OrderController::class, 'updateStatus']);


    // Notifications
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::put('notifications/{notification}', [NotificationController::class, 'markAsRead']);

    Route::get('user/profile', [UserController::class, 'show']);
    Route::put('user/profile', [UserController::class, 'update']);
    Route::post('user/change-password', [UserController::class, 'changePassword']);
    Route::post('user/upload-avatar', [UserController::class, 'uploadAvatar']);

    // Ví điện tử
    Route::get('wallets/me', [WalletController::class, 'me']);
    Route::get('wallets/transactions', [WalletController::class, 'transactions']);
    Route::post('wallets/deposit', [WalletController::class, 'deposit']);
    Route::post('wallets/deposits/{uuid}/confirm', [WalletController::class, 'confirmDeposit']);
    Route::post('wallets/deposits/{uuid}/approve', [WalletController::class, 'approveDeposit']);

    // Tìm kiếm Flight phù hợp (Filter Search cho Sender)
    Route::get('/flights/search', [FlightSearchController::class, 'index'])
        ->name('flights.search');

    // Danh sách chuyến bay
    Route::get('/flights', [FlightController::class, 'index']);

    // Đăng chuyến bay
    Route::post('/flights/store', [FlightController::class, 'store'])
        ->name('flights.store');

    // Chi tiết chuyến bay
    Route::get('flights/{id}/show', [FlightController::class, 'show']);
    Route::put('flights/{id}/update', [FlightController::class, 'update']);

    // Hủy chuyến bay
    Route::delete('/flights/{id}/destroy', [FlightController::class, 'destroy'])
        ->name('flights.destroy');

    // Xác thực chuyến bay
    Route::post('/flights/{id}/verify', [FlightController::class, 'verify']);

    // Gửi yêu cầu riêng cho 1 hành khách (Private Request)
    Route::post('private-requests/sent', [RequestController::class, 'sent']);

    // Tạo request cho chuyến bay
    Route::post('private-requests/store', [RequestController::class, 'store']);

    // Hủy request
    Route::post('private-requests/{id}/cancel', [RequestController::class, 'cancel']);

    // Lấy danh sách yêu cầu riêng đã gửi
    Route::get('private-requests', [RequestController::class, 'index']);

    // Chi tiết requests
    Route::get('private-requests/{id}/show', [RequestController::class, 'show']);

    // Xác nhận request 
    Route::post('/requests/{id}/accept', [RequestController::class, 'accept']);
    Route::post('/requests/{id}/decline', [RequestController::class, 'decline']);

    // Danh sách requets đang chờ
    Route::get('/requests/listPendingRequests', [RequestController::class, 'listPendingRequests']);

    // Customer: danh sách yêu cầu ưu tiên/gấp
    Route::get('/customer/requests/priority', [RequestController::class, 'priorityForCustomer']);

    // Customer: danh sách yêu cầu phù hợp
    Route::get('/customer/requests/matching', [RequestController::class, 'matchingForCustomer']);
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

// Danh sách hãng hàng không nội địa
Route::get('/airlines', [AirlineController::class, 'index']);

// Tìm kiếm hãng hàng không
Route::get('/airlines/search', [AirlineController::class, 'search']);

// Chi tiết hãng hàng không theo mã IATA/ICAO
Route::get('/airlines/{code}', [AirlineController::class, 'show']);

// Phương thức thanh toán
Route::get('/payment-methods', [PaymentMethodController::class, 'index']);
Route::get('/payment-methods/{code}', [PaymentMethodController::class, 'show']);


// routes/api.php
Route::post('/upload', [AttachmentController::class, 'upload'])
    ->name('upload.file')
    ->middleware('auth:sanctum'); // hoặc 'auth:api'
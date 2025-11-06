<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\RegionsController;
use App\Http\Controllers\Api\UserController;
use Kreait\Firebase\Factory;

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
});

Route::controller(AuthController::class)->group(function () {
    Route::get('auth/{provider}/redirect', 'redirectToProvider'); // google / facebook
    Route::get('auth/{provider}/callback', 'handleProviderCallback');
});


Route::get('/test-firebase', function () {
    try {
        // Khởi tạo Firebase
        $firebase = (new Factory)
            ->withServiceAccount(base_path(config('services.firebase.credentials')))
            ->withDatabaseUri(config('services.firebase.database_url'));

        $database = $firebase->createDatabase();

        // Ghi dữ liệu test
        $ref = $database->getReference('test_connection')->set([
            'message' => 'Firebase connected successfully!',
            'connected_at' => now()->toDateTimeString(),
        ]);

        // Đọc lại dữ liệu vừa ghi
        $data = $database->getReference('test_connection')->getValue();

        return response()->json([
            'success' => true,
            'data' => $data,
            'status' => '✅ Connected successfully',
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => '❌ Firebase connection failed: ' . $e->getMessage(),
        ], 500);
    }
});

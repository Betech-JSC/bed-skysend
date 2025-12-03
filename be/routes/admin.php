<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\FlightController;
use App\Http\Controllers\Admin\OrderController;

// Admin Auth Routes (public)
Route::prefix('admin')->name('admin.')->group(function () {
    Route::middleware('guest:admin')->group(function () {
        Route::get('/login', [AuthController::class, 'showLoginForm'])->name('login');
        Route::post('/login', [AuthController::class, 'login']);
    });

    Route::middleware('auth:admin')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

        // Dashboard
        Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
        Route::get('/dashboard', [DashboardController::class, 'index']);

        // Users Management
        Route::prefix('users')->name('users.')->group(function () {
            Route::get('/', [UserController::class, 'index'])->name('index');
            Route::get('/{id}', [UserController::class, 'show'])->name('show');
            Route::put('/{id}', [UserController::class, 'update'])->name('update');
            Route::post('/{id}/ban', [UserController::class, 'ban'])->name('ban');
            Route::post('/{id}/unban', [UserController::class, 'unban'])->name('unban');
            Route::delete('/{id}', [UserController::class, 'destroy'])->name('destroy');
        });

        // Flights Management
        Route::prefix('flights')->name('flights.')->group(function () {
            Route::get('/', [FlightController::class, 'index'])->name('index');
            Route::get('/{id}', [FlightController::class, 'show'])->name('show');
            Route::post('/{id}/verify', [FlightController::class, 'verify'])->name('verify');
            Route::post('/{id}/reject', [FlightController::class, 'reject'])->name('reject');
            Route::post('/{id}/cancel', [FlightController::class, 'cancel'])->name('cancel');
        });

        // Orders Management
        Route::prefix('orders')->name('orders.')->group(function () {
            Route::get('/', [OrderController::class, 'index'])->name('index');
            Route::get('/{id}', [OrderController::class, 'show'])->name('show');
            Route::put('/{id}/status', [OrderController::class, 'updateStatus'])->name('updateStatus');
            Route::post('/{id}/cancel', [OrderController::class, 'cancel'])->name('cancel');
        });
    });
});

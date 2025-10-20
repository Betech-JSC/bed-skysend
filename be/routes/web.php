<?php

use App\Events\ChatMessage;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\ContactsController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ImagesController;
use App\Http\Controllers\OrganizationsController;
use App\Http\Controllers\ReportsController;
use App\Http\Controllers\UsersController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RegionsController;
use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// Auth

Route::get('login', [AuthenticatedSessionController::class, 'create'])
    ->name('login')
    ->middleware('guest');

Route::post('login', [AuthenticatedSessionController::class, 'store'])
    ->name('login.store')
    ->middleware('guest');

Route::delete('logout', [AuthenticatedSessionController::class, 'destroy'])
    ->name('logout');

// Dashboard

Route::get('/', [DashboardController::class, 'index'])
    ->name('dashboard')
    ->middleware('auth');

// Users

Route::resource('users', UsersController::class)
    ->middleware('auth');

Route::resource('organizations', OrganizationsController::class)
    ->middleware('auth');

Route::resource('contacts', ContactsController::class)
    ->middleware('auth');
// Reports

Route::get('reports', [ReportsController::class, 'index'])
    ->name('reports')
    ->middleware('auth');

// Images

Route::get('/img/{path}', [ImagesController::class, 'show'])
    ->where('path', '.*')
    ->name('image');

Route::get('/send', function () {
    event(new \App\Events\TestMessage('Hello from route!'));
    return 'sent';
});

Route::resource('regions', RegionsController::class)
    ->middleware('auth');

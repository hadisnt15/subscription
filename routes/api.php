<?php

use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\AdminPackageController;
use App\Http\Controllers\AdminPaymentController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PackageController;
use App\Http\Controllers\SubscriptionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class,'login']);

Route::get('/packages', [PackageController::class, 'index']);
Route::get('/packages/{package}', [PackageController::class, 'show']);

Route::middleware('auth:sanctum')->group(function() {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/subscription', [SubscriptionController::class, 'index']);
    Route::post('/subscription', [SubscriptionController::class, 'store']);
    Route::post('/subscription/{history}/payment', [SubscriptionController::class, 'uploadPayment']);

    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index']);

        Route::get('/payments', [AdminPaymentController::class,'index']);
        Route::get('/payments/{payment}/proof', [AdminPaymentController::class, 'showProof']);
        Route::post('/payments/{payment}/approve', [AdminPaymentController::class, 'approve']);
        Route::post('/payments/{payment}/reject', [AdminPaymentController::class, 'reject']);

        Route::get('/packages', [AdminPackageController::class, 'index']);
        Route::post('/packages', [AdminPackageController::class, 'store']);
        Route::put('/packages/{package}', [AdminPackageController::class, 'update']);
        Route::patch('/packages/{package}/toggle-status', [AdminPackageController::class, 'toggleStatus']);
    });
});
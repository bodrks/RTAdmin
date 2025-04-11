<?php

use App\Http\Controllers\HouseResidentController;
use App\Http\Controllers\HousesController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ResidentController;

Route::middleware('api')->group(function () {
    
    Route::get('/residents', [ResidentController::class, 'index']);
    Route::post('/residents', [ResidentController::class, 'store']);
    Route::put('/residents/{id}', [ResidentController::class, 'update']);
    Route::delete('/residents/{id}', [ResidentController::class, 'destroy']);
    Route::get('/available-residents/{houseId}', [ResidentController::class, 'getAvailableResidents']);
    Route::get('/residents-with-house', [ResidentController::class, 'withHouse']);
    Route::get('/resident-status/{id}', [ResidentController::class, 'getPaymentStatus']);

    Route::get('/houses', [HousesController::class, 'index']);
    Route::post('/houses', [HousesController::class, 'store']);
    Route::put('/houses/{id}', [HousesController::class, 'update']);
    Route::delete('/houses/{id}', [HousesController::class, 'destroy']);
    Route::get('/houses/{id}/history', [HousesController::class, 'history']);

    Route::post('assign-resident', [HouseResidentController::class, 'assign']);
    Route::put('/residents-leave/{houseId}', [HouseResidentController::class, 'leave']);

    Route::get('/payments', [PaymentController::class, 'index']);
    Route::post('/payments', [PaymentController::class, 'store']);
    Route::get('/payments/preview-tahunan', [PaymentController::class, 'previewTahunan']);

    Route::get('/report/monthly-summary', [ReportController::class, 'monthlySummary']);
    Route::get('/report/monthly-detail', [ReportController::class, 'monthlyDetail']);

});
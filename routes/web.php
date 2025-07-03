<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('app');
})->name('verification.verify');

Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');

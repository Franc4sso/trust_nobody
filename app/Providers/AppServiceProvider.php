<?php

namespace App\Providers;

use App\GameState;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Route::bind('game', fn ($value) => GameState::load() ?? abort(404));
    }
}

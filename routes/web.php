<?php

use App\Http\Controllers\GameController;
use App\Http\Controllers\NightController;
use App\Http\Controllers\SetupController;
use App\Http\Controllers\VoteController;
use Illuminate\Support\Facades\Route;

// Home
Route::get('/', [GameController::class, 'home'])->name('home');

// Setup
Route::post('/games', [SetupController::class, 'store'])->name('game.store');
Route::get('/games/{game}/setup/names', [SetupController::class, 'names'])->name('game.setup.names');
Route::post('/games/{game}/setup/names', [SetupController::class, 'storeNames'])->name('game.setup.names.store');
Route::get('/games/{game}/setup/roles', [SetupController::class, 'roleReveal'])->name('game.setup.roles');

// Game show (dispatcher)
Route::get('/games/{game}', [GameController::class, 'show'])->name('game.show');
Route::post('/games/{game}/advance', [GameController::class, 'advance'])->name('game.advance');

// N1
Route::get('/games/{game}/n1/intro', [VoteController::class, 'n1Intro'])->name('game.n1.intro');
Route::get('/games/{game}/n1/vote', [VoteController::class, 'n1Vote'])->name('game.n1.vote');
Route::post('/games/{game}/n1/vote', [VoteController::class, 'n1CastVote'])->name('game.n1.vote.cast');
Route::post('/games/{game}/n1/vote/all', [VoteController::class, 'n1CastAllVotes'])->name('game.n1.vote.all');

// Night
Route::get('/games/{game}/night', [NightController::class, 'show'])->name('game.night');
Route::post('/games/{game}/night/killer', [NightController::class, 'killerAction'])->name('game.night.killer');
Route::post('/games/{game}/night/guardian', [NightController::class, 'guardianAction'])->name('game.night.guardian');
Route::post('/games/{game}/night/analyst', [NightController::class, 'analystAction'])->name('game.night.analyst');

// Morning
Route::get('/games/{game}/morning', [GameController::class, 'morning'])->name('game.morning');

// Day
Route::get('/games/{game}/day', [GameController::class, 'day'])->name('game.day');

// Vote
Route::get('/games/{game}/vote', [VoteController::class, 'show'])->name('game.vote');
Route::post('/games/{game}/vote', [VoteController::class, 'castVote'])->name('game.vote.cast');
Route::post('/games/{game}/vote/all', [VoteController::class, 'castAllVotes'])->name('game.vote.all');

// Medium
Route::get('/games/{game}/medium', [VoteController::class, 'mediumReveal'])->name('game.medium');

// Analyst
Route::post('/games/{game}/analyst', [GameController::class, 'activateAnalyst'])->name('game.analyst');

// Game Over
Route::get('/games/{game}/over', [GameController::class, 'gameOver'])->name('game.over');

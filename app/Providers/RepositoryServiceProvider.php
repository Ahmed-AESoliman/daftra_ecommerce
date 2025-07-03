<?php

namespace App\Providers;

use App\Repositories\Contracts\Auth\BaseAuthRepositoryInterface;
use App\Repositories\Contracts\Order\OrderRepositoryInterface;
use App\Repositories\Contracts\Product\ProductRepositoryInterface;
use App\Repositories\Eloquent\Auth\AdminAuthRepository;
use App\Repositories\Eloquent\Order\OrderRepository;
use App\Repositories\Eloquent\Product\ProductRepository;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Bind authentication repository
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        $this->app->bind(BaseAuthRepositoryInterface::class, AdminAuthRepository::class);
        $this->app->bind(ProductRepositoryInterface::class, ProductRepository::class);
        $this->app->bind(OrderRepositoryInterface::class, OrderRepository::class);
    }
}

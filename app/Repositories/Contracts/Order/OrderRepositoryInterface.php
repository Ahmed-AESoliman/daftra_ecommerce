<?php

namespace App\Repositories\Contracts\Order;

use App\Http\Requests\Order\CreateOrderRequest;
use App\Repositories\Contracts\BaseRepositoryInterface;
use Illuminate\Http\JsonResponse;

interface OrderRepositoryInterface extends BaseRepositoryInterface
{
    public function createOrder(CreateOrderRequest $request): JsonResponse;
}

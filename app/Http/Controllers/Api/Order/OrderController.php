<?php

namespace App\Http\Controllers\Api\Order;

use App\Http\Controllers\Controller;
use App\Http\Requests\Order\CreateOrderRequest;
use App\Models\Order;
use App\Repositories\Contracts\Order\OrderRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    protected $orderRepository;

    public function __construct(OrderRepositoryInterface $orderRepository)
    {
        $this->orderRepository = $orderRepository;
    }

    public function index(Request $request): JsonResponse
    {
        return $this->orderRepository->index($request);
    }

    public function show(Order $order): JsonResponse
    {
        return $this->orderRepository->show($order);
    }

    public function update(Request $request, Order $order): JsonResponse
    {
        return $this->orderRepository->update($order, $request->all());
    }

    public function destroy(Order $order): JsonResponse
    {
        return $this->orderRepository->destroy($order);
    }

    /**
     * Create a new order with stock validation and reservation
     */
    public function createOrder(CreateOrderRequest $request): JsonResponse
    {
        return $this->orderRepository->createOrder($request);
    }
}
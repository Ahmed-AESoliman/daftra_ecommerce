<?php

namespace App\Repositories\Eloquent\Order;

use App\Http\Requests\Order\CreateOrderRequest;
use App\Http\Resources\Order\OrderIndexCollection;
use App\Http\Resources\Order\OrderResource;
use App\Http\Responses\ApiResponse;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Repositories\Contracts\Order\OrderRepositoryInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class OrderRepository implements OrderRepositoryInterface
{
    protected $model;

    public function __construct(Order $model)
    {
        $this->model = $model;
    }

    public function index($request): JsonResponse
    {
        try {
            $perPage = $request->get('per_page', 15);
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');

            $allowedSortFields = ['created_at', 'order_number', 'status', 'total_amount', 'updated_at'];
            if (!in_array($sortBy, $allowedSortFields)) {
                $sortBy = 'created_at';
            }

            $orders = $this->model->with([
                'orderItems' => function ($query) {
                    $query->with('product:id,name,slug,images');
                }
            ])
                ->applyFilters($request)
                ->orderBy($sortBy, $sortOrder)
                ->paginate($perPage);

            return ApiResponse::success(data: new OrderIndexCollection($orders));
        } catch (\Exception) {
            return ApiResponse::error('Error retrieving orders');
        }
    }

    public function store(array $data): JsonResponse
    {
        try {
            return ApiResponse::success(message: 'Order created successfully');
        } catch (\Exception) {
            return ApiResponse::error('Error creating Order');
        }
    }

    public function show(Model $model): JsonResponse
    {
        try {
            $model->load([
                'orderItems' => function ($query) {
                    $query->with([
                        'product' => function ($productQuery) {
                            $productQuery->select('id', 'name', 'slug', 'sku', 'price', 'sale_price', 'is_active', 'images');
                        }
                    ]);
                }
            ]);

            return ApiResponse::success(data: new OrderResource($model));
        } catch (\Exception) {
            return ApiResponse::error('Error retrieving Order details');
        }
    }

    public function update(Model $model, array $data): JsonResponse
    {
        try {
            // Only allow status updates
            if (!isset($data['status'])) {
                return ApiResponse::error('Only status updates are allowed', 422);
            }

            $allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
            $newStatus = $data['status'];

            if (!in_array($newStatus, $allowedStatuses)) {
                return ApiResponse::error('Invalid status provided', 422);
            }

            // Status transition rules
            $currentStatus = $model->status;
            $statusTransitions = [
                'pending' => ['processing', 'cancelled'],
                'processing' => ['shipped', 'cancelled'],
                'shipped' => ['delivered'],
                'delivered' => [],
                'cancelled' => [],
            ];

            if (!in_array($newStatus, $statusTransitions[$currentStatus] ?? [])) {
                return ApiResponse::error(
                    "Cannot change status from '{$currentStatus}' to '{$newStatus}'. Invalid status transition.",
                    422
                );
            }

            DB::transaction(function () use ($model, $newStatus) {
                $model->lockForUpdate();

                $updateData = ['status' => $newStatus];

                // Set timestamps based on status
                if ($newStatus === 'shipped') {
                    $updateData['shipped_at'] = now();
                } elseif ($newStatus === 'delivered') {
                    $updateData['delivered_at'] = now();
                    if (!$model->shipped_at) {
                        $updateData['shipped_at'] = now();
                    }
                }

                $model->update($updateData);
            });

            return ApiResponse::success(message: "Order status updated to '{$newStatus}' successfully");
        } catch (\Exception) {
            return ApiResponse::error('Error updating order status');
        }
    }

    public function destroy(Model $model): JsonResponse
    {
        try {
            $orderNumber = $model->order_number;
            $orderStatus = $model->status;
            $itemsCount = $model->orderItems()->count();

            if (in_array($orderStatus, ['shipped', 'delivered'])) {
                return ApiResponse::error(
                    'Cannot delete orders that have been shipped or delivered. Please cancel the order first.',
                    422
                );
            }

            DB::transaction(function () use ($model) {
                $model->lockForUpdate();
                $model->orderItems()->delete();
                $model->delete();
            });

            return ApiResponse::success(
                message: "Order {$orderNumber} has been successfully deleted along with {$itemsCount} order items."
            );
        } catch (\Exception) {
            return ApiResponse::error('Error deleting order');
        }
    }

    public function createOrder(CreateOrderRequest $request): JsonResponse
    {
        try {
            $requestData = $request->validated();
            $cartItems = $requestData['items'];
            $billingAddress = $requestData['billing_address'];
            $shippingAddress = $requestData['shipping_address'] ?? $billingAddress;
            $notes = $requestData['notes'] ?? '';

            $order = DB::transaction(function () use ($cartItems, $billingAddress, $shippingAddress, $notes) {
                $orderItems = [];
                $subtotal = 0;

                $productIds = collect($cartItems)->pluck('id')->toArray();
                $products = Product::whereIn('id', $productIds)
                    ->where('is_active', true)
                    ->where('in_stock', true)
                    ->lockForUpdate()
                    ->get()
                    ->keyBy('id');

                foreach ($cartItems as $item) {
                    $productId = $item['id'];
                    $requestedQuantity = $item['quantity'];
                    $product = $products->get($productId);

                    if (!$product) {
                        throw new \Exception("Product with ID {$productId} is not available");
                    }

                    if ($product->stock_quantity < $requestedQuantity) {
                        throw new \Exception("Insufficient stock for {$product->name}. Available: {$product->stock_quantity}, Requested: {$requestedQuantity}");
                    }

                    $price = $product->current_price;
                    $total = $price * $requestedQuantity;
                    
                    $orderItems[] = [
                        'product_id' => $productId,
                        'product_name' => $product->name,
                        'product_sku' => $product->sku ?? '',
                        'price' => $price,
                        'quantity' => $requestedQuantity,
                        'total' => $total,
                    ];

                    $subtotal += $total;
                    $product->decrement('stock_quantity', $requestedQuantity);
                    
                    if ($product->stock_quantity <= 0) {
                        $product->update(['in_stock' => false]);
                    }
                }

                $shippingAmount = 15.00;
                $taxRate = 0.08;
                $taxAmount = $subtotal * $taxRate;
                $totalAmount = $subtotal + $shippingAmount + $taxAmount;

                $order = Order::create([
                    'status' => 'pending',
                    'subtotal' => $subtotal,
                    'tax_amount' => $taxAmount,
                    'shipping_amount' => $shippingAmount,
                    'discount_amount' => 0,
                    'total_amount' => $totalAmount,
                    'currency' => 'USD',
                    'billing_address' => $billingAddress,
                    'shipping_address' => $shippingAddress,
                    'notes' => $notes,
                ]);

                foreach ($orderItems as $orderItemData) {
                    $orderItemData['order_id'] = $order->id;
                    OrderItem::create($orderItemData);
                }

                return $order;
            });

            $order->load('orderItems.product');
            return ApiResponse::success(data: new OrderResource($order), message: 'Order created successfully');

        } catch (\Exception $e) {
            if (str_contains($e->getMessage(), 'not available') || str_contains($e->getMessage(), 'Insufficient stock')) {
                return ApiResponse::error($e->getMessage(), 422);
            }
            return ApiResponse::error('Error creating order. Please try again.');
        }
    }
}

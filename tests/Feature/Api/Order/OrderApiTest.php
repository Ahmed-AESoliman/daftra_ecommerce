<?php

namespace Tests\Feature\Api\Order;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class OrderApiTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $user;
    protected $category;
    protected $product;

    const ORDERS_ENDPOINT = '/api/admin/orders';

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->category = Category::factory()->create();
        $this->product = Product::factory()->create([
            'category_id' => $this->category->id
        ]);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_can_list_orders_with_authentication()
    {
        // Arrange
        $this->actingAs($this->user, 'api');

        $orders = Order::factory()->count(3)->create();
        foreach ($orders as $order) {
            OrderItem::factory()->create([
                'order_id' => $order->id,
                'product_id' => $this->product->id
            ]);
        }

        // Act
        $response = $this->getJson(self::ORDERS_ENDPOINT);

        // Assert
        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'orders' => [
                        '*' => [
                            'id',
                            'order_number',
                            'status',
                            'status_label',
                            'total_amount',
                            'currency',
                            'formatted_total',
                            'customer_name',
                            'customer_email',
                            'items_count',
                            'total_quantity',
                            'is_shipped',
                            'is_delivered',
                            'is_cancelled',
                            'created_at',
                            'updated_at',
                            'created_at_human'
                        ]
                    ],
                    'pagination' => [
                        'currentPage',
                        'lastPage',
                        'perPage',
                        'total',
                        'hasMorePages',
                    ]
                ],
                'statusCode'
            ]);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_requires_authentication_to_list_orders()
    {
        // Arrange
        Order::factory()->count(3)->create();

        // Act
        $response = $this->getJson(self::ORDERS_ENDPOINT);

        // Assert
        $response->assertStatus(401);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_can_show_a_specific_order()
    {
        // Arrange
        $this->actingAs($this->user, 'api');

        $order = Order::factory()->create();
        OrderItem::factory()->count(2)->create([
            'order_id' => $order->id,
            'product_id' => $this->product->id
        ]);

        // Act
        $response = $this->getJson("/api/admin/orders/{$order->order_number}");

        // Assert
        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'order_number',
                    'status',
                    'status_label',
                    'subtotal',
                    'tax_amount',
                    'shipping_amount',
                    'discount_amount',
                    'total_amount',
                    'currency',
                    'formatted_total',
                    'billing_address',
                    'shipping_address',
                    'notes',
                    'is_shipped',
                    'is_delivered',
                    'is_cancelled',
                    'created_at',
                    'updated_at',
                    'shipped_at',
                    'delivered_at',
                    'order_items' => [
                        '*' => [
                            'id',
                            'product_id',
                            'product_name',
                            'product_sku',
                            'quantity',
                            'price',
                            'total',
                            'formatted_price',
                            'formatted_total'
                        ]
                    ],
                    'items_count',
                    'total_quantity'
                ],
                'statusCode'
            ])
            ->assertJson([
                'statusCode' => 200,
                'data' => [
                    'order_number' => $order->order_number,
                    'status' => $order->status
                ]
            ]);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_returns_404_for_non_existent_order()
    {
        // Arrange
        $this->actingAs($this->user, 'api');

        // Act
        $response = $this->getJson('/api/admin/orders/NON-EXISTENT-ORDER');

        // Assert
        $response->assertStatus(404);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_can_delete_a_pending_order()
    {
        // Arrange
        $this->actingAs($this->user, 'api');

        $order = Order::factory()->create([
            'status' => 'pending'
        ]);

        $orderItems = OrderItem::factory()->count(2)->create([
            'order_id' => $order->id,
            'product_id' => $this->product->id
        ]);

        // Act
        $response = $this->deleteJson("/api/admin/orders/{$order->order_number}");

        // Assert
        $response->assertStatus(200)
            ->assertJson([
                'statusCode' => 200
            ]);

        $this->assertDatabaseMissing('orders', [
            'id' => $order->id
        ]);

        $this->assertDatabaseMissing('order_items', [
            'order_id' => $order->id
        ]);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_cannot_delete_shipped_order()
    {
        // Arrange
        $this->actingAs($this->user, 'api');

        $order = Order::factory()->create([
            'status' => 'shipped'
        ]);

        // Act
        $response = $this->deleteJson("/api/admin/orders/{$order->order_number}");

        // Assert
        $response->assertStatus(422)
            ->assertJson([
                'statusCode' => 422
            ]);

        $this->assertDatabaseHas('orders', [
            'id' => $order->id
        ]);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_cannot_delete_delivered_order()
    {
        // Arrange
        $this->actingAs($this->user, 'api');

        $order = Order::factory()->create([
            'status' => 'delivered'
        ]);

        // Act
        $response = $this->deleteJson("/api/admin/orders/{$order->order_number}");

        // Assert
        $response->assertStatus(422)
            ->assertJson([
                'statusCode' => 422
            ]);

        $this->assertDatabaseHas('orders', [
            'id' => $order->id
        ]);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_can_filter_orders_by_status()
    {
        // Arrange
        $this->actingAs($this->user, 'api');

        Order::factory()->count(2)->create(['status' => 'pending']);
        Order::factory()->count(3)->create(['status' => 'processing']);

        // Act
        $response = $this->getJson('/api/admin/orders?status=pending');

        // Assert
        $response->assertStatus(200);
        $data = $response->json('data.orders');
        $this->assertCount(2, $data);

        foreach ($data as $order) {
            $this->assertEquals('pending', $order['status']);
        }
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_can_search_orders()
    {
        // Arrange
        $this->actingAs($this->user, 'api');

        $order1 = Order::factory()->create([
            'order_number' => 'ORD-SEARCH-001',
            'billing_address' => ['name' => 'John Doe', 'email' => 'john@example.com']
        ]);

        $order2 = Order::factory()->create([
            'order_number' => 'ORD-OTHER-002',
            'billing_address' => ['name' => 'Jane Smith', 'email' => 'jane@example.com']
        ]);

        // Act - Search by order number
        $response = $this->getJson('/api/admin/orders?search=SEARCH');

        // Assert
        $response->assertStatus(200);
        $data = $response->json('data.orders');
        $this->assertCount(1, $data);
        $this->assertEquals('ORD-SEARCH-001', $data[0]['order_number']);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_can_filter_orders_by_date_range()
    {
        // Arrange
        $this->actingAs($this->user, 'api');

        $oldOrder = Order::factory()->create([
            'created_at' => now()->subDays(10)
        ]);

        $recentOrder = Order::factory()->create([
            'created_at' => now()->subDays(2)
        ]);

        // Act
        $response = $this->getJson('/api/admin/orders?date_from=' . now()->subDays(5)->format('Y-m-d'));

        // Assert
        $response->assertStatus(200);
        $data = $response->json('data.orders');
        $this->assertCount(1, $data);
        $this->assertEquals($recentOrder->order_number, $data[0]['order_number']);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_can_filter_orders_by_amount_range()
    {
        // Arrange
        $this->actingAs($this->user, 'api');

        Order::factory()->create(['total_amount' => 50.00]);
        Order::factory()->create(['total_amount' => 150.00]);
        Order::factory()->create(['total_amount' => 250.00]);

        // Act
        $response = $this->getJson('/api/admin/orders?min_amount=100&max_amount=200');

        // Assert
        $response->assertStatus(200);
        $data = $response->json('data.orders');
        $this->assertCount(1, $data);
        $this->assertEquals(150.00, $data[0]['total_amount']);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_can_paginate_orders()
    {
        // Arrange
        $this->actingAs($this->user, 'api');

        Order::factory()->count(25)->create();

        // Act
        $response = $this->getJson('/api/admin/orders?per_page=10&page=2');

        // Assert
        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'orders',
                    'pagination' => [
                        'currentPage',
                        'lastPage',
                        'perPage',
                        'total',
                        'hasMorePages',
                    ]
                ]
            ]);

        $data = $response->json('data.pagination');
        $this->assertEquals(2, $data['currentPage']);
        $this->assertEquals(10, $data['perPage']);
        $this->assertEquals(25, $data['total']);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_can_sort_orders()
    {
        // Arrange
        $this->actingAs($this->user, 'api');

        $order1 = Order::factory()->create([
            'total_amount' => 100.00,
            'created_at' => now()->subDays(2)
        ]);

        $order2 = Order::factory()->create([
            'total_amount' => 200.00,
            'created_at' => now()->subDays(1)
        ]);

        // Act - Sort by total_amount ascending
        $response = $this->getJson('/api/admin/orders?sort_by=total_amount&sort_order=asc');

        // Assert
        $response->assertStatus(200);
        $data = $response->json('data.orders');
        $this->assertEquals(100.00, $data[0]['total_amount']);
        $this->assertEquals(200.00, $data[1]['total_amount']);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_can_update_order_status()
    {
        // Arrange
        $this->actingAs($this->user, 'api');
        $order = Order::factory()->pending()->create();

        // Act - Update from pending to processing
        $response = $this->putJson("/api/admin/orders/{$order->order_number}", [
            'status' => 'processing'
        ]);

        // Assert
        $response->assertStatus(200)
            ->assertJson([
                'message' => "Order status updated to 'processing' successfully"
            ]);

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'processing'
        ]);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_sets_shipped_at_when_status_updated_to_shipped()
    {
        // Arrange
        $this->actingAs($this->user, 'api');
        $order = Order::factory()->processing()->create();

        // Act
        $response = $this->putJson("/api/admin/orders/{$order->order_number}", [
            'status' => 'shipped'
        ]);

        // Assert
        $response->assertStatus(200);
        $order->refresh();
        $this->assertEquals('shipped', $order->status);
        $this->assertNotNull($order->shipped_at);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_sets_delivered_at_and_shipped_at_when_status_updated_to_delivered()
    {
        // Arrange
        $this->actingAs($this->user, 'api');
        $order = Order::factory()->shipped()->create();

        // Act
        $response = $this->putJson("/api/admin/orders/{$order->order_number}", [
            'status' => 'delivered'
        ]);

        // Assert
        $response->assertStatus(200);
        $order->refresh();
        $this->assertEquals('delivered', $order->status);
        $this->assertNotNull($order->delivered_at);
        $this->assertNotNull($order->shipped_at);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_cannot_update_to_invalid_status_transition()
    {
        // Arrange
        $this->actingAs($this->user, 'api');
        $order = Order::factory()->pending()->create();

        // Act - Try to go directly from pending to delivered
        $response = $this->putJson("/api/admin/orders/{$order->order_number}", [
            'status' => 'delivered'
        ]);

        // Assert
        $response->assertStatus(422)
            ->assertJson([
                'message' => "Cannot change status from 'pending' to 'delivered'. Invalid status transition."
            ]);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_requires_authentication_for_show_and_delete()
    {
        // Arrange
        $order = Order::factory()->create();

        // Act & Assert
        $this->getJson("/api/admin/orders/{$order->order_number}")
            ->assertStatus(401);

        $this->deleteJson("/api/admin/orders/{$order->order_number}")
            ->assertStatus(401);
    }
}

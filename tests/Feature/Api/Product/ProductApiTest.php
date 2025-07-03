<?php

namespace Tests\Feature\Api\Product;

use App\Models\Product;
use App\Models\User;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class ProductApiTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $user;
    protected $category;
    
    const PRODUCTS_ENDPOINT = '/api/admin/products';
    const ORIGINAL_NAME = 'Original Name';

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create test user for authentication
        $this->user = User::factory()->create();
        
        // Create test category
        $this->category = Category::factory()->create();
        
        // Clear cache before each test
        Cache::flush();
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_can_list_products_with_authentication()
    {
        // Arrange
        $this->actingAs($this->user, 'api');
        
        Product::factory()->count(3)->create([
            'category_id' => $this->category->id,
            'is_active' => true
        ]);

        // Act
        $response = $this->getJson(self::PRODUCTS_ENDPOINT);

        // Assert
        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        'products' => [
                            '*' => [
                                'id',
                                'name',
                                'sku',
                                'price',
                                'current_price',
                                'stock_quantity',
                                'in_stock',
                                'is_active',
                                'category'
                            ]
                        ],
                        'pagination' => [
                            'currentPage',
                            'lastPage',
                            'perPage',
                            'total',
                            'hasMorePages'
                        ]
                    ],
                    'statusCode',
                    'message',
                    'errorMessages'
                ]);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_requires_authentication_to_list_products()
    {
        // Arrange
        Product::factory()->count(3)->create([
            'category_id' => $this->category->id
        ]);

        // Act
        $response = $this->getJson(self::PRODUCTS_ENDPOINT);

        // Assert
        $response->assertStatus(401);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_can_show_a_specific_product()
    {
        // Arrange
        $this->actingAs($this->user, 'api');
        
        $product = Product::factory()->create([
            'category_id' => $this->category->id,
            'is_active' => true
        ]);

        // Act
        $response = $this->getJson("/api/admin/products/{$product->slug}");

        // Assert
        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        'id',
                        'slug',
                        'name',
                        'description',
                        'short_description',
                        'sku',
                        'price',
                        'sale_price',
                        'current_price',
                        'isOnSale',
                        'discount_percentage',
                        'stock_quantity',
                        'in_stock',
                        'is_active',
                        'featured_image',
                        'images',
                        'category' => [
                            'id',
                            'name'
                        ]
                    ],
                    'statusCode'
                ])
                ->assertJson([
                    'statusCode' => 200,
                    'data' => [
                        'slug' => $product->slug,
                        'name' => $product->name,
                        'sku' => $product->sku
                    ]
                ]);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_returns_404_for_non_existent_product()
    {
        // Arrange
        $this->actingAs($this->user, 'api');

        // Act
        $response = $this->getJson('/api/admin/products/non-existent-slug');

        // Assert
        $response->assertStatus(404);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_can_create_a_product_with_valid_data()
    {
        // Arrange
        $this->actingAs($this->user, 'api');
        
        $productData = [
            'name' => 'Test Product',
            'description' => 'This is a test product',
            'short_description' => 'Short desc',
            'sku' => 'TEST-001',
            'price' => 99.99,
            'sale_price' => 79.99,
            'stock_quantity' => 100,
            'in_stock' => true,
            'is_active' => true,
            'category_id' => $this->category->id
        ];

        // Act
        $response = $this->postJson(self::PRODUCTS_ENDPOINT, $productData);

        // Assert
        $response->assertStatus(200)
                ->assertJson([
                    'statusCode' => 200
                ]);

        $this->assertDatabaseHas('products', [
            'name' => 'Test Product',
            'slug' => 'test-product', // Auto-generated
            'sku' => 'TEST-001',
            'price' => 99.99
        ]);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_auto_generates_slug_when_creating_product()
    {
        // Arrange
        $this->actingAs($this->user, 'api');
        
        $productData = [
            'name' => 'Product With Spaces',
            'sku' => 'TEST-002',
            'price' => 50.00,
            'stock_quantity' => 10,
            'category_id' => $this->category->id
        ];

        // Act
        $response = $this->postJson(self::PRODUCTS_ENDPOINT, $productData);

        // Assert
        $response->assertStatus(200);
        $this->assertDatabaseHas('products', [
            'name' => 'Product With Spaces',
            'slug' => 'product-with-spaces'
        ]);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_cannot_create_product_with_invalid_data()
    {
        // Arrange
        $this->actingAs($this->user, 'api');
        
        $invalidData = [
            'name' => '', // Required field empty
            'price' => -10, // Invalid price
            'stock_quantity' => -5, // Invalid stock
            'category_id' => 999 // Non-existent category
        ];

        // Act
        $response = $this->postJson(self::PRODUCTS_ENDPOINT, $invalidData);

        // Assert
        $response->assertStatus(422)
                ->assertJsonStructure([
                    'statusCode',
                    'message',
                    'data',
                    'errorMessages' => [
                        'name',
                        'sku',
                        'price',
                        'stock_quantity',
                        'category_id'
                    ]
                ]);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_cannot_create_product_with_duplicate_sku()
    {
        // Arrange
        $this->actingAs($this->user, 'api');
        
        Product::factory()->create([
            'sku' => 'EXISTING-SKU',
            'category_id' => $this->category->id
        ]);

        $productData = [
            'name' => 'New Product',
            'sku' => 'EXISTING-SKU', // Duplicate SKU
            'price' => 50.00,
            'stock_quantity' => 10,
            'category_id' => $this->category->id
        ];

        // Act
        $response = $this->postJson(self::PRODUCTS_ENDPOINT, $productData);

        // Assert
        $response->assertStatus(422)
                ->assertJsonStructure([
                    'statusCode',
                    'message', 
                    'data',
                    'errorMessages' => [
                        'sku'
                    ]
                ]);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_can_update_a_product()
    {
        // Arrange
        $this->actingAs($this->user, 'api');
        
        $product = Product::factory()->create([
            'category_id' => $this->category->id
        ]);

        $updateData = [
            'name' => 'Updated Product Name',
            'price' => 149.99,
            'stock_quantity' => 50,
            'is_active' => false
        ];

        // Act
        $response = $this->postJson(self::PRODUCTS_ENDPOINT . "/{$product->slug}", $updateData);

        // Assert
        $response->assertStatus(200)
                ->assertJson([
                    'statusCode' => 200
                ]);

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'name' => 'Updated Product Name',
            'price' => 149.99,
            'stock_quantity' => 50,
            'is_active' => false
        ]);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_can_partial_update_a_product()
    {
        // Arrange
        $this->actingAs($this->user, 'api');
        
        $product = Product::factory()->create([
            'name' => self::ORIGINAL_NAME,
            'price' => 100.00,
            'category_id' => $this->category->id
        ]);

        $updateData = [
            'price' => 120.00 // Only update price
        ];

        // Act
        $response = $this->postJson(self::PRODUCTS_ENDPOINT . "/{$product->slug}", $updateData);

        // Assert
        $response->assertStatus(200);
        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'name' => self::ORIGINAL_NAME, // Unchanged
            'price' => 120.00 // Updated
        ]);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_can_delete_a_product()
    {
        // Arrange
        $this->actingAs($this->user, 'api');
        
        $product = Product::factory()->create([
            'category_id' => $this->category->id
        ]);

        // Act
        $response = $this->deleteJson(self::PRODUCTS_ENDPOINT . "/{$product->slug}");

        // Assert
        $response->assertStatus(200)
                ->assertJson([
                    'statusCode' => 200
                ]);

        $this->assertDatabaseMissing('products', [
            'id' => $product->id
        ]);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_requires_authentication_for_create_update_delete()
    {
        // Arrange
        $product = Product::factory()->create([
            'category_id' => $this->category->id
        ]);

        // Act & Assert - Test all protected routes without authentication
        $this->postJson(self::PRODUCTS_ENDPOINT, [])
             ->assertStatus(401);

        $this->postJson(self::PRODUCTS_ENDPOINT . "/{$product->slug}", [])
             ->assertStatus(401);

        $this->deleteJson(self::PRODUCTS_ENDPOINT . "/{$product->slug}")
             ->assertStatus(401);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_can_filter_products_by_category()
    {
        // Arrange
        $this->actingAs($this->user, 'api');
        
        $category1 = Category::factory()->create();
        $category2 = Category::factory()->create();
        
        Product::factory()->count(2)->create(['category_id' => $category1->id]);
        Product::factory()->count(3)->create(['category_id' => $category2->id]);

        // Act
        $response = $this->getJson("/api/admin/products?category_id={$category1->id}");

        // Assert
        $response->assertStatus(200);
        $data = $response->json('data.products');
        $this->assertCount(2, $data);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_can_search_products()
    {
        // Arrange
        $this->actingAs($this->user, 'api');
        
        Product::factory()->create([
            'name' => 'iPhone 14',
            'category_id' => $this->category->id
        ]);
        
        Product::factory()->create([
            'name' => 'Samsung Galaxy',
            'category_id' => $this->category->id
        ]);

        // Act
        $response = $this->getJson('/api/admin/products?search=iPhone');

        // Assert
        $response->assertStatus(200);
        $data = $response->json('data.products');
        $this->assertCount(1, $data);
        $this->assertEquals('iPhone 14', $data[0]['name']);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_can_paginate_products()
    {
        // Arrange
        $this->actingAs($this->user, 'api');
        
        Product::factory()->count(25)->create([
            'category_id' => $this->category->id
        ]);

        // Act
        $response = $this->getJson('/api/admin/products?per_page=10&page=2');

        // Assert
        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        'products',
                        'pagination' => [
                            'currentPage',
                            'perPage',
                            'total'
                        ]
                    ]
                ]);
        
        $data = $response->json('data.pagination');
        $this->assertEquals(2, $data['currentPage']);
        $this->assertEquals(10, $data['perPage']);
        $this->assertEquals(25, $data['total']);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_caches_product_listings()
    {
        // Arrange
        $this->actingAs($this->user, 'api');
        
        Product::factory()->count(5)->create([
            'category_id' => $this->category->id
        ]);

        // Act - First request
        $response1 = $this->getJson(self::PRODUCTS_ENDPOINT);
        
        // Act - Second request (should use cache)
        $response2 = $this->getJson(self::PRODUCTS_ENDPOINT);

        // Assert
        $response1->assertStatus(200);
        $response2->assertStatus(200);
        
        // Both responses should be identical (from cache)
        $this->assertEquals($response1->json(), $response2->json());
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_clears_cache_when_product_is_created()
    {
        // Arrange
        $this->actingAs($this->user, 'api');
        
        // Create initial product for cache
        Product::factory()->create([
            'category_id' => $this->category->id,
            'name' => 'Initial Product'
        ]);
        
        // First, populate cache
        $initialResponse = $this->getJson(self::PRODUCTS_ENDPOINT);
        $initialCount = count($initialResponse->json('data.products'));

        // Act - Create new product
        $productData = [
            'name' => 'Cache Test Product',
            'sku' => 'CACHE-001',
            'price' => 99.99,
            'stock_quantity' => 100,
            'category_id' => $this->category->id
        ];

        $response = $this->postJson(self::PRODUCTS_ENDPOINT, $productData);

        // Assert
        $response->assertStatus(200);
        
        // Verify the product was actually created
        $this->assertDatabaseHas('products', [
            'name' => 'Cache Test Product'
        ]);
        
        // Verify cache was cleared and listing still works
        $listResponse = $this->getJson(self::PRODUCTS_ENDPOINT);
        $this->assertEquals(200, $listResponse->status(), 'Cache clearing should not break the listing endpoint');
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_clears_cache_when_product_is_updated()
    {
        // Arrange
        $this->actingAs($this->user, 'api');
        
        $product = Product::factory()->create([
            'name' => self::ORIGINAL_NAME,
            'category_id' => $this->category->id
        ]);

        // Populate cache
        $this->getJson(self::PRODUCTS_ENDPOINT);

        // Act - Update product
        $updateData = ['name' => 'Updated Name'];
        $response = $this->postJson(self::PRODUCTS_ENDPOINT . "/{$product->slug}", $updateData);

        // Assert
        $response->assertStatus(200);
        
        // Verify the update was successful in database
        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'name' => 'Updated Name'
        ]);
        
        // Verify cache was cleared by making a fresh request
        $listResponse = $this->getJson(self::PRODUCTS_ENDPOINT);
        $this->assertEquals(200, $listResponse->status(), 'Cache clearing should not break the listing endpoint');
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_clears_cache_when_product_is_deleted()
    {
        // Arrange
        $this->actingAs($this->user, 'api');
        
        $product = Product::factory()->create([
            'name' => 'To Be Deleted',
            'category_id' => $this->category->id
        ]);

        // Populate cache
        $this->getJson(self::PRODUCTS_ENDPOINT);

        // Act - Delete product
        $response = $this->deleteJson(self::PRODUCTS_ENDPOINT . "/{$product->slug}");

        // Assert
        $response->assertStatus(200);
        
        // Verify the product was deleted from database
        $this->assertDatabaseMissing('products', [
            'id' => $product->id
        ]);
        
        // Verify cache was cleared by making a fresh request
        $listResponse = $this->getJson(self::PRODUCTS_ENDPOINT);
        $this->assertEquals(200, $listResponse->status(), 'Cache clearing should not break the listing endpoint');
    }
}
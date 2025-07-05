<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->words(3, true),
            'description' => $this->faker->paragraph,
            'short_description' => $this->faker->sentence,
            'sku' => strtoupper($this->faker->unique()->bothify('??##??')),
            'price' => $this->faker->randomFloat(2, 10, 1000),
            'sale_price' => $this->faker->optional(0.3)->randomFloat(2, 5, 900),
            'stock_quantity' => $this->faker->numberBetween(0, 100),
            'in_stock' => $this->faker->boolean(80),
            'is_active' => $this->faker->boolean(90),
            'image' => $this->faker->optional(0.7)->randomElement([
                'product1.jpg',
                'product2.jpg', 
                'product3.jpg',
                'product4.jpg'
            ]),
            'category_id' => Category::factory(),
        ];
    }
}
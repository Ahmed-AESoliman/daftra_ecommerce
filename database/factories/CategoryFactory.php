<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

class CategoryFactory extends Factory
{
    protected $model = Category::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->words(2, true),
            'slug' => $this->faker->slug,
            'is_active' => true,
            'sort_order' => $this->faker->numberBetween(1, 100),
            'parent_id' => null,
        ];
    }
}
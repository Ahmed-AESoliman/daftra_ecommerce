<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Category::create([
            'id' => 1,
            'name' => 'Casual',
            'slug' => 'casual',
            'is_active' => true,
            'sort_order' => 1,
        ]);
        Category::create([
            'id' => 2,
            'name' => 'Polo',
            'slug' => 'polo',
            'is_active' => true,
            'sort_order' => 2,
            'parent_id' => 1,
        ]);
        Category::create([
            'id' => 3,
            'name' => 'Jeans',
            'slug' => 'jeans',
            'is_active' => true,
            'sort_order' => 3,
            'parent_id' => 1,
        ]);
        Category::create([
            'id' => 4,
            'name' => 'T-shirts',
            'slug' => 't-shirts',
            'is_active' => true,
            'sort_order' => 4,
            'parent_id' => 1,
        ]);

        Category::create([
            'id' => 5,
            'name' => 'Semi Formal',
            'slug' => 'semi-formal',
            'is_active' => true,
            'sort_order' => 2,
        ]);
        Category::create([
            'name' => 'Blazer',
            'slug' => 'blazer',
            'is_active' => true,
            'sort_order' => 1,
            'parent_id' => 5,
        ]);
    }
}

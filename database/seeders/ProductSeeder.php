<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get categories
        $poloCategory = Category::where('slug', 'polo')->first();
        $jeansCategory = Category::where('slug', 'jeans')->first();
        $tshirtsCategory = Category::where('slug', 't-shirts')->first();
        $blazerCategory = Category::where('slug', 'blazer')->first();

        // T-Shirts
        Product::create([
            'name' => 'Classic Cotton T-Shirt',
            'slug' => 'classic-cotton-t-shirt',
            'description' => 'Comfortable 100% cotton t-shirt perfect for everyday wear. Available in multiple colors with a relaxed fit.',
            'short_description' => 'Classic cotton tee for everyday comfort',
            'sku' => 'TSH-001',
            'price' => 19.99,
            'sale_price' => 14.99,
            'stock_quantity' => 50,
            'in_stock' => true,
            'is_active' => true,
            'images' => ['productImages/t-shirt-1.jpg'],
            'category_id' => $tshirtsCategory->id,
        ]);

        Product::create([
            'name' => 'Premium Graphic T-Shirt',
            'slug' => 'premium-graphic-t-shirt',
            'description' => 'High-quality graphic t-shirt with unique design. Made from soft cotton blend for maximum comfort and durability.',
            'short_description' => 'Premium tee with unique graphic design',
            'sku' => 'TSH-002',
            'price' => 24.99,
            'stock_quantity' => 35,
            'in_stock' => true,
            'is_active' => true,
            'images' => ['productImages/t-shirt-2.jpg'],
            'category_id' => $tshirtsCategory->id,
        ]);

        // Polo Shirts
        Product::create([
            'name' => 'Classic Polo Shirt',
            'slug' => 'classic-polo-shirt',
            'description' => 'Timeless polo shirt made from breathable pique cotton. Features a classic collar and comfortable fit perfect for both casual and semi-formal occasions.',
            'short_description' => 'Classic pique cotton polo shirt',
            'sku' => 'POLO-001',
            'price' => 39.99,
            'sale_price' => 29.99,
            'stock_quantity' => 40,
            'in_stock' => true,
            'is_active' => true,
            'images' => ['productImages/polo.jpg'],
            'category_id' => $poloCategory->id,
        ]);

        Product::create([
            'name' => 'Performance Polo Shirt',
            'slug' => 'performance-polo-shirt',
            'description' => 'Athletic polo shirt with moisture-wicking technology. Perfect for sports and active lifestyles while maintaining a polished look.',
            'short_description' => 'Athletic polo with moisture-wicking fabric',
            'sku' => 'POLO-002',
            'price' => 49.99,
            'stock_quantity' => 25,
            'in_stock' => true,
            'is_active' => true,
            'images' => ['productImages/polo.jpg'],
            'category_id' => $poloCategory->id,
        ]);

        // Jeans
        Product::create([
            'name' => 'Slim Fit Jeans',
            'slug' => 'slim-fit-jeans',
            'description' => 'Modern slim fit jeans crafted from premium denim. Features a contemporary cut that flatters all body types with comfortable stretch.',
            'short_description' => 'Premium slim fit denim jeans',
            'sku' => 'JNS-001',
            'price' => 79.99,
            'sale_price' => 59.99,
            'stock_quantity' => 30,
            'in_stock' => true,
            'is_active' => true,
            'images' => ['productImages/jeans.jpg'],
            'category_id' => $jeansCategory->id,
        ]);

        Product::create([
            'name' => 'Classic Straight Jeans',
            'slug' => 'classic-straight-jeans',
            'description' => 'Traditional straight-cut jeans made from durable denim. A timeless style that never goes out of fashion.',
            'short_description' => 'Classic straight-cut denim jeans',
            'sku' => 'JNS-002',
            'price' => 69.99,
            'stock_quantity' => 45,
            'in_stock' => true,
            'is_active' => true,
            'images' => ['productImages/jeans.jpg'],
            'category_id' => $jeansCategory->id,
        ]);

        // Blazers
        Product::create([
            'name' => 'Classic Navy Blazer',
            'slug' => 'classic-navy-blazer',
            'description' => 'Elegant navy blazer perfect for business meetings and formal events. Tailored fit with quality construction and attention to detail.',
            'short_description' => 'Elegant navy blazer for formal occasions',
            'sku' => 'BLZ-001',
            'price' => 199.99,
            'sale_price' => 149.99,
            'stock_quantity' => 20,
            'in_stock' => true,
            'is_active' => true,
            'images' => ['productImages/blazer.jpeg'],
            'category_id' => $blazerCategory->id,
        ]);

        Product::create([
            'name' => 'Modern Casual Blazer',
            'slug' => 'modern-casual-blazer',
            'description' => 'Contemporary casual blazer that bridges the gap between formal and casual wear. Perfect for smart-casual events and modern workplaces.',
            'short_description' => 'Modern blazer for smart-casual style',
            'sku' => 'BLZ-002',
            'price' => 179.99,
            'stock_quantity' => 15,
            'in_stock' => true,
            'is_active' => true,
            'images' => ['productImages/blazer.jpeg'],
            'category_id' => $blazerCategory->id,
        ]);

        // Additional products for variety
        Product::create([
            'name' => 'Vintage Wash T-Shirt',
            'slug' => 'vintage-wash-t-shirt',
            'description' => 'Soft vintage-washed t-shirt with a lived-in feel. Perfect for creating that effortlessly cool look.',
            'short_description' => 'Vintage-washed tee with soft feel',
            'sku' => 'TSH-003',
            'price' => 22.99,
            'stock_quantity' => 60,
            'in_stock' => true,
            'is_active' => true,
            'images' => ['productImages/t-shirt-1.jpg'],
            'category_id' => $tshirtsCategory->id,
        ]);

        Product::create([
            'name' => 'Distressed Denim Jeans',
            'slug' => 'distressed-denim-jeans',
            'description' => 'Trendy distressed jeans with carefully crafted worn details. Perfect for casual outings and weekend wear.',
            'short_description' => 'Trendy distressed jeans with worn details',
            'sku' => 'JNS-003',
            'price' => 89.99,
            'stock_quantity' => 25,
            'in_stock' => true,
            'is_active' => true,
            'images' => ['productImages/jeans.jpg'],
            'category_id' => $jeansCategory->id,
        ]);

        // Some out of stock products for testing
        Product::create([
            'name' => 'Limited Edition Polo',
            'slug' => 'limited-edition-polo',
            'description' => 'Exclusive limited edition polo shirt with unique design elements. A collectors item for fashion enthusiasts.',
            'short_description' => 'Exclusive limited edition polo design',
            'sku' => 'POLO-LIMITED',
            'price' => 89.99,
            'stock_quantity' => 0,
            'in_stock' => false,
            'is_active' => true,
            'images' => ['productImages/polo.jpg'],
            'category_id' => $poloCategory->id,
        ]);

        // Inactive product for testing
        Product::create([
            'name' => 'Discontinued Blazer',
            'slug' => 'discontinued-blazer',
            'description' => 'Previously popular blazer design that has been discontinued. Limited stock available.',
            'short_description' => 'Discontinued blazer design',
            'sku' => 'BLZ-DISC',
            'price' => 99.99,
            'stock_quantity' => 5,
            'in_stock' => true,
            'is_active' => false,
            'images' => ['productImages/blazer.jpeg'],
            'category_id' => $blazerCategory->id,
        ]);
    }
}

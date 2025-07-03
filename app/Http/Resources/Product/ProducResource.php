<?php

namespace App\Http\Resources\Product;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProducResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'description' => $this->description,
            'short_description' => $this->short_description,
            'sku' => $this->sku,
            'price' => $this->price,
            'sale_price' => $this->sale_price,
            'current_price' => $this->current_price,
            'isOnSale' => $this->is_on_sale,
            'discount_percentage' => $this->discount_percentage,
            'stock_quantity' => $this->stock_quantity,
            'in_stock' => $this->in_stock,
            'is_active' => $this->is_active,
            'featured_image' => $this->featured_image,
            'images' => $this->images,
            'category' => [
                'id' => $this->category->id,
                'name' => $this->category->name,
            ],

        ];
    }
}

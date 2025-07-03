<?php

namespace App\Http\Resources\Product;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductIndexResource extends JsonResource
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
            'sku' => $this->sku,
            'price' => $this->price,
            'sale_price' => $this->sale_price,
            'current_price' => $this->current_price,
            'is_on_sale' => $this->is_on_sale,
            'discount_percentage' => $this->discount_percentage,
            'stock_quantity' => $this->stock_quantity,
            'in_stock' => $this->in_stock,
            'is_active' => $this->is_active,
            'featured_image' => $this->featured_image,
            'category' => $this->category?->name,
            'short_description' => $this->short_description,
            'featured_image' => $this->featured_image,

        ];
    }
}

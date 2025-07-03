<?php

namespace App\Http\Resources\Order;

use App\Http\Resources\Product\ProductResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'product_name' => $this->product_name,
            'product_sku' => $this->product_sku,
            'quantity' => $this->quantity,
            'price' => $this->price,
            'total' => $this->total,
            'formatted_price' => number_format($this->price, 2),
            'formatted_total' => number_format($this->total, 2),
            'product' => $this->whenLoaded('product', function () {
                return [
                    'id' => $this->product->id,
                    'name' => $this->product->name,
                    'slug' => $this->product->slug,
                    'sku' => $this->product->sku,
                    'featured_image' => $this->product->featured_image,
                    'current_price' => $this->product->current_price,
                    'is_active' => $this->product->is_active,
                ];
            }),
        ];
    }
}
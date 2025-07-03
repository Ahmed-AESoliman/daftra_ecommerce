<?php

namespace App\Http\Resources\Order;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
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
            'order_number' => $this->order_number,
            'status' => $this->status,
            'status_label' => ucfirst($this->status),
            
            // Financial information
            'subtotal' => $this->subtotal,
            'tax_amount' => $this->tax_amount,
            'shipping_amount' => $this->shipping_amount,
            'discount_amount' => $this->discount_amount,
            'total_amount' => $this->total_amount,
            'currency' => $this->currency,
            'formatted_total' => $this->formatted_total,
            
            // Address information
            'billing_address' => $this->billing_address,
            'shipping_address' => $this->shipping_address,
            
            // Additional information
            'notes' => $this->notes,
            
            // Status flags
            'is_shipped' => $this->is_shipped,
            'is_delivered' => $this->is_delivered,
            'is_cancelled' => $this->is_cancelled,
            
            // Timestamps
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'shipped_at' => $this->shipped_at,
            'delivered_at' => $this->delivered_at,
            
            'order_items' => OrderItemResource::collection($this->whenLoaded('orderItems')),
            
            // Order summary
            'items_count' => $this->whenLoaded('orderItems', function () {
                return $this->orderItems->count();
            }),
            'total_quantity' => $this->whenLoaded('orderItems', function () {
                return $this->orderItems->sum('quantity');
            }),
            
            // Human readable timestamps
            'created_at_human' => $this->created_at?->diffForHumans(),
            'updated_at_human' => $this->updated_at?->diffForHumans(),
            'shipped_at_human' => $this->shipped_at?->diffForHumans(),
            'delivered_at_human' => $this->delivered_at?->diffForHumans(),
        ];
    }
}

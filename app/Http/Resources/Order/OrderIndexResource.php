<?php

namespace App\Http\Resources\Order;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderIndexResource extends JsonResource
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
            'total_amount' => $this->total_amount,
            'currency' => $this->currency,
            'formatted_total' => $this->formatted_total,
            'status' => $this->status,
            'status_label' => ucfirst($this->status),
            'customer_name' => $this->billing_address['name'] ?? 'N/A',
            'customer_email' => $this->billing_address['email'] ?? 'N/A',
            'items_count' => $this->whenLoaded('orderItems', function () {
                return $this->orderItems->count();
            }),
            'total_quantity' => $this->whenLoaded('orderItems', function () {
                return $this->orderItems->sum('quantity');
            }),
            'is_shipped' => $this->is_shipped,
            'is_delivered' => $this->is_delivered,
            'is_cancelled' => $this->is_cancelled,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'created_at_human' => $this->created_at?->diffForHumans(),
        ];
    }
}

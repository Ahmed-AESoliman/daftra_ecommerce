<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class CreateOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'items' => 'required|array|min:1|max:50',
            'items.*.id' => 'required|integer|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1|max:100',

            'billing_address' => 'required|array',
            'billing_address.name' => 'required|string|min:2|max:255',
            'billing_address.email' => 'required|email|max:255',
            'billing_address.phone' => 'required|string|min:10|max:20',
            'billing_address.address' => 'required|string|min:5|max:500',
            'billing_address.city' => 'required|string|min:2|max:100',
            'billing_address.state' => 'required|string|min:2|max:100',
            'billing_address.zip' => 'required|string|min:3|max:20',
            'billing_address.country' => 'required|string|min:2|max:100',

            'shipping_address' => 'nullable|array',
            'shipping_address.name' => 'required_with:shipping_address|string|min:2|max:255',
            'shipping_address.email' => 'nullable|email|max:255',
            'shipping_address.phone' => 'nullable|string|min:10|max:20',
            'shipping_address.address' => 'required_with:shipping_address|string|min:5|max:500',
            'shipping_address.city' => 'required_with:shipping_address|string|min:2|max:100',
            'shipping_address.state' => 'required_with:shipping_address|string|min:2|max:100',
            'shipping_address.zip' => 'required_with:shipping_address|string|min:3|max:20',
            'shipping_address.country' => 'required_with:shipping_address|string|min:2|max:100',

            'notes' => 'nullable|string|max:1000',
        ];
    }
}
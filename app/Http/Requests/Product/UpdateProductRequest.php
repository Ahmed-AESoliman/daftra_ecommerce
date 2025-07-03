<?php

namespace App\Http\Requests\Product;

use App\Http\Responses\ApiResponse;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdateProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    protected function failedValidation(Validator $validator)
    {
        $errors = $validator->errors();

        throw new HttpResponseException(ApiResponse::error('Validation failed. Please check the form fields.', 422, $errors->toArray()));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $productId = $this->route()->parameter('product')->id;
        return [
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string',
            'sku' => 'sometimes|string|max:100|unique:products,sku,' . $productId,
            'price' => 'sometimes|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'stock_quantity' => 'sometimes|integer|min:0',
            'in_stock' => 'boolean',
            'is_active' => 'boolean',
            'image' => 'nullable|file|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'category_id' => 'sometimes|exists:categories,id'
        ];
    }
}

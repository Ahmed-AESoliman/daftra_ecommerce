<?php

namespace App\Http\Resources\Product;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class ProductIndexCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'products' => $this->collection,
            'pagination' => [
                'currentPage' => $this->currentPage(),
                'lastPage' => $this->lastPage(),
                'perPage' => $this->perPage(),
                'total' => $this->total(),
                'hasMorePages' => $this->hasMorePages(),
            ],
        ];
    }
}

<?php

namespace App\Http\Resources\Order;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class OrderIndexCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'orders' => $this->collection,
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

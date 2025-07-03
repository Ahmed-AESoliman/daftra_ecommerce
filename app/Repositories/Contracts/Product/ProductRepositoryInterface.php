<?php

namespace App\Repositories\Contracts\Product;

use App\Repositories\Contracts\BaseRepositoryInterface;
use Illuminate\Http\JsonResponse;

interface ProductRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Get categories grouped by parent and sorted for select options
     */
    public function getCategoriesForSelect(): JsonResponse;

    public function getPublicProducts($request): JsonResponse;

    public function getPublicProductBySlug(string $slug): JsonResponse;

    public function validateCartStock($request): JsonResponse;
}

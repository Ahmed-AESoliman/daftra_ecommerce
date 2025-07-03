<?php

namespace App\Http\Controllers\Api\Product;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\CreateProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Models\Product;
use App\Repositories\Contracts\Product\ProductRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    protected $productRepository;

    public function __construct(ProductRepositoryInterface $productRepository)
    {
        $this->productRepository = $productRepository;
    }

    /**
     * Display a listing of products
     */
    public function index(Request $request): JsonResponse
    {
        return $this->productRepository->index($request);
    }

    /**
     * Store a newly created product
     */
    public function store(CreateProductRequest $request): JsonResponse
    {
        return $this->productRepository->store($request->validated());
    }

    /**
     * Display the specified product
     */
    public function show(Product $product): JsonResponse
    {
        return $this->productRepository->show($product);
    }

    /**
     * Update the specified product
     */
    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        return $this->productRepository->update($product, $request->validated());
    }

    /**
     * Remove the specified product
     */
    public function destroy(Product $product): JsonResponse
    {
        return $this->productRepository->destroy($product);
    }

    /**
     * Get categories for select options
     */
    public function categories(): JsonResponse
    {
        return $this->productRepository->getCategoriesForSelect();
    }

    /**
     * Get public products list (no authentication required)
     */
    public function publicProducts(Request $request): JsonResponse
    {
        return $this->productRepository->getPublicProducts($request);
    }

    /**
     * Get public product by slug (no authentication required)
     */
    public function publicProductBySlug(string $slug): JsonResponse
    {
        return $this->productRepository->getPublicProductBySlug($slug);
    }

    /**
     * Validate cart items stock availability
     */
    public function validateCartStock(Request $request): JsonResponse
    {
        return $this->productRepository->validateCartStock($request);
    }
}
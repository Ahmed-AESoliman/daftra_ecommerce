<?php

namespace App\Repositories\Eloquent\Product;

use App\Helpers\CacheHelper;
use App\Http\Resources\Product\ProducResource;
use App\Http\Resources\Product\ProductIndexCollection;
use App\Http\Responses\ApiResponse;
use App\Models\Product;
use App\Models\Category;
use App\Repositories\Contracts\Product\ProductRepositoryInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProductRepository implements ProductRepositoryInterface
{
    protected $model;
    protected $cachePrefix = 'product_';
    private const CATEGORIES_CACHE_KEY = '*categories_select*';

    public function __construct(Product $model)
    {
        $this->model = $model;
    }

    /**
     * Get paginated list of products (index)
     */
    public function index($request): JsonResponse
    {
        try {
            $perPage = $request->get('per_page', 15);
            $page = $request->get('page', 1);

            // Build filters array for cache key
            $filters = array_filter([
                'category_id' => $request->get('category_id'),
                'status' => $request->get('status'),
                'search' => $request->get('search'),
                'min_price' => $request->get('min_price'),
                'max_price' => $request->get('max_price'),
            ]);

            $cacheKey = CacheHelper::key($this->cachePrefix . 'index', [
                'page' => $page,
                'per_page' => $perPage,
                'filters' => $filters
            ]);

            $products = CacheHelper::set($cacheKey, function () use ($perPage, $request) {
                return $this->model->with(['category'])
                    ->applyFilters($request)
                    ->orderBy('created_at', 'desc')
                    ->paginate($perPage);
            });

            return ApiResponse::success(data: new ProductIndexCollection($products));
        } catch (\Exception) {
            return ApiResponse::error('Error retrieving products');
        }
    }

    /**
     * Create a new product (store)
     */
    public function store(array $data): JsonResponse
    {
        try {
            // Handle image upload
            if (isset($data['image']) && $data['image']) {
                $data['image'] = $this->handleImageUpload($data['image']);
            }

            $product = $this->model->create($data);
            $product->load(['category']);

            // Clear relevant cache
            CacheHelper::clearListing($this->cachePrefix);
            CacheHelper::clear(self::CATEGORIES_CACHE_KEY);

            return ApiResponse::success(message: 'Product created successfully');
        } catch (\Exception) {
            return ApiResponse::error('Error creating product');
        }
    }

    /**
     * Get a specific product by model (show)
     */
    public function show(Model $model): JsonResponse
    {
        try {
            $cacheKey = CacheHelper::key($this->cachePrefix . 'show', ['id' => $model->id]);

            $product = CacheHelper::set($cacheKey, function () use ($model) {
                return $model->load(['category']);
            });

            return ApiResponse::success(data: new ProducResource($product));
        } catch (\Exception) {
            return ApiResponse::error('Error retrieving product');
        }
    }

    /**
     * Update a specific product (update)
     */
    public function update(Model $model, array $data): JsonResponse
    {
        try {
            // Handle image upload
            if (isset($data['image']) && $data['image']) {
                // Delete old image if replacing
                if ($model->image) {
                    $this->deleteImage($model->image);
                }
                $data['image'] = $this->handleImageUpload($data['image']);
            } elseif (isset($data['image']) && $data['image'] === null) {
                // Delete image if explicitly set to null
                if ($model->image) {
                    $this->deleteImage($model->image);
                }
                $data['image'] = null;
            } else {
                unset($data['image']);
            }
            
            DB::transaction(function () use ($model, $data) {
                $model->lockForUpdate();
                $model->update($data);
            });
            $model->load(['category']);

            // Clear specific product cache and index cache
            CacheHelper::clearItem($this->cachePrefix, $model->id);
            CacheHelper::clearListing($this->cachePrefix);
            CacheHelper::clear(self::CATEGORIES_CACHE_KEY);

            return ApiResponse::success(message: 'Product updated successfully');
        } catch (\Exception) {
            return ApiResponse::error('Error updating product');
        }
    }

    /**
     * Delete a specific product (destroy)
     */
    public function destroy(Model $model): JsonResponse
    {
        try {
            $productId = $model->id;

            // Delete associated image
            if ($model->image) {
                $this->deleteImage($model->image);
            }
            DB::transaction(function () use ($model) {
                $model->lockForUpdate();
                $model->delete();
            });

            // Clear specific product cache and index cache
            CacheHelper::clearItem($this->cachePrefix, $productId);
            CacheHelper::clearListing($this->cachePrefix);
            CacheHelper::clear(self::CATEGORIES_CACHE_KEY);

            return ApiResponse::success(message: 'Product deleted successfully');
        } catch (\Exception) {
            return ApiResponse::error('Error deleting product');
        }
    }

    /**
     * Handle single image upload
     */
    private function handleImageUpload($image): ?string
    {
        if ($image && $image->isValid()) {
            $path = $image->store('products', 'public');
            return Storage::url($path);
        }
        
        return null;
    }

    /**
     * Delete single image from storage
     */
    private function deleteImage(string $imageUrl): void
    {
        // Extract path from URL
        $path = str_replace('/storage/', '', parse_url($imageUrl, PHP_URL_PATH));
        Storage::disk('public')->delete($path);
    }

    /**
     * Get categories grouped by parent and sorted for select options
     */
    public function getCategoriesForSelect(): JsonResponse
    {
        try {
            $cacheKey = $this->cachePrefix . 'categories_select';

            $categories = CacheHelper::set($cacheKey, function () {
                // Get all active categories with their parent relationships
                $allCategories = Category::active()
                    ->with('parent')
                    ->orderBy('sort_order')
                    ->get();

                // Group categories by parent
                $grouped = collect();

                // First add parent categories (those with no parent_id)
                $parentCategories = $allCategories->whereNull('parent_id');
                foreach ($parentCategories as $parent) {
                    $grouped->push([
                        'id' => $parent->id,
                        'name' => $parent->name,
                        'value' => $parent->id,
                        'label' => $parent->name,
                        'slug' => $parent->slug,
                        'level' => 0
                    ]);

                    // Then add child categories under each parent
                    $children = $allCategories->where('parent_id', $parent->id);
                    foreach ($children as $child) {
                        $grouped->push([
                            'id' => $child->id,
                            'slug' => $child->slug,
                            'name' => $child->name,
                            'value' => $child->id,
                            'label' => $child->name,
                            'level' => 1
                        ]);
                    }
                }

                return $grouped->values();
            });

            return ApiResponse::success(data: $categories);
        } catch (\Exception) {
            return ApiResponse::error('Error retrieving categories');
        }
    }

    /**
     * Get public product list (no authentication required)
     */
    public function getPublicProducts($request): JsonResponse
    {
        try {
            $perPage = $request->get('per_page', 12);
            $page = $request->get('page', 1);

            // Build filters array for cache key
            $filters = array_filter([
                'category_id' => $request->get('category_id'),
                'search' => $request->get('search'),
                'min_price' => $request->get('min_price'),
                'max_price' => $request->get('max_price'),
                'sort_by' => $request->get('sort_by', 'name'),
            ]);

            $cacheKey = CacheHelper::key($this->cachePrefix . 'public_index', [
                'page' => $page,
                'per_page' => $perPage,
                'filters' => $filters
            ]);

            $products = CacheHelper::set($cacheKey, function () use ($perPage, $request) {
                $query = $this->model->with(['category'])
                    ->active()
                    ->where('stock_quantity', '>', 0)
                    ->applyFilters($request);

                // Apply sorting
                $sortBy = $request->get('sort_by', 'name');
                switch ($sortBy) {
                    case 'price':
                        $query->orderBy('price', 'asc');
                        break;
                    case 'price_desc':
                        $query->orderBy('price', 'desc');
                        break;
                    case 'created_at':
                        $query->orderBy('created_at', 'desc');
                        break;
                    default:
                        $query->orderBy('name', 'asc');
                        break;
                }

                return $query->paginate($perPage);
            });

            return ApiResponse::success(data: new ProductIndexCollection($products));
        } catch (\Exception) {
            return ApiResponse::error('Error retrieving products');
        }
    }

    /**
     * Get public product details by slug (no authentication required)
     */
    public function getPublicProductBySlug(string $slug): JsonResponse
    {
        try {
            $cacheKey = CacheHelper::key($this->cachePrefix . 'public_show', ['slug' => $slug]);

            $product = CacheHelper::set($cacheKey, function () use ($slug) {
                return $this->model->with(['category'])
                    ->where('slug', $slug)
                    ->where('is_active', true)
                    ->first();
            });

            if (!$product) {
                return ApiResponse::error('Product not found', 404);
            }

            return ApiResponse::success(data: new ProducResource($product));
        } catch (\Exception) {
            return ApiResponse::error('Error retrieving product');
        }
    }

    /**
     * Validate cart items stock availability
     */
    public function validateCartStock($request): JsonResponse
    {
        try {
            $cartItems = $request->input('items', []);
            $validationResults = [];
            $hasErrors = false;

            foreach ($cartItems as $item) {
                $productId = $item['id'];
                $requestedQuantity = $item['quantity'];

                $product = $this->model->find($productId);

                if (!$product) {
                    $validationResults[] = [
                        'id' => $productId,
                        'valid' => false,
                        'error' => 'Product not found',
                        'available_quantity' => 0,
                        'requested_quantity' => $requestedQuantity
                    ];
                    $hasErrors = true;
                    continue;
                }

                if (!$product->is_active || !$product->in_stock) {
                    $validationResults[] = [
                        'id' => $productId,
                        'valid' => false,
                        'error' => 'Product is no longer available',
                        'available_quantity' => 0,
                        'requested_quantity' => $requestedQuantity
                    ];
                    $hasErrors = true;
                    continue;
                }

                if ($product->stock_quantity < $requestedQuantity) {
                    $validationResults[] = [
                        'id' => $productId,
                        'valid' => false,
                        'error' => 'Insufficient stock',
                        'available_quantity' => $product->stock_quantity,
                        'requested_quantity' => $requestedQuantity
                    ];
                    $hasErrors = true;
                } else {
                    $validationResults[] = [
                        'id' => $productId,
                        'valid' => true,
                        'error' => null,
                        'available_quantity' => $product->stock_quantity,
                        'requested_quantity' => $requestedQuantity
                    ];
                }
            }

            return ApiResponse::success(
                data: [
                    'valid' => !$hasErrors,
                    'items' => $validationResults
                ],
                message: $hasErrors ? 'Some items have stock issues' : 'All items are available'
            );
        } catch (\Exception) {
            return ApiResponse::error('Error validating cart stock');
        }
    }
}

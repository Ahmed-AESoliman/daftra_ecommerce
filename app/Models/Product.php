<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'slug',
        'description',
        'short_description',
        'sku',
        'price',
        'sale_price',
        'stock_quantity',
        'in_stock',
        'is_active',
        'image',
        'category_id'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'stock_quantity' => 'integer',
        'in_stock' => 'boolean',
        'is_active' => 'boolean',
        'image' => 'string',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($product) {
            $product->slug = Str::slug($product->name);

            $originalSlug = $product->slug;
            $counter = 1;
            while (static::where('slug', $product->slug)->exists()) {
                $product->slug = $originalSlug . '-' . $counter;
                $counter++;
            }
        });
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeInStock($query)
    {
        return $query->where('in_stock', true);
    }

    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    public function scopeSearch($query, $searchTerm)
    {
        return $query->where(function ($q) use ($searchTerm) {
            $q->where('name', 'like', '%' . $searchTerm . '%')
                ->orWhere('description', 'like', '%' . $searchTerm . '%')
                ->orWhere('sku', 'like', '%' . $searchTerm . '%');
        });
    }

    public function scopePriceRange($query, $minPrice, $maxPrice = null)
    {
        if ($minPrice) {
            $query->where('price', '>=', $minPrice);
        }
        if ($maxPrice) {
            $query->where('price', '<=', $maxPrice);
        }
        return $query;
    }

    public function scopeApplyFilters($query, $request)
    {
        if ($request->has('category_id')) {
            $query->byCategory($request->category_id);
        }

        if ($request->has('search')) {
            $query->search($request->search);
        }

        if ($request->has('min_price') || $request->has('max_price')) {
            $query->priceRange($request->min_price, $request->max_price);
        }

        return $query;
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function getCurrentPriceAttribute()
    {
        return $this->sale_price ?? $this->price;
    }

    public function getIsOnSaleAttribute(): bool
    {
        return !is_null($this->sale_price) && $this->sale_price < $this->price;
    }

    public function getDiscountPercentageAttribute(): int
    {
        if (!$this->is_on_sale) {
            return 0;
        }

        return round((($this->price - $this->sale_price) / $this->price) * 100);
    }

    public function getImageUrlAttribute(): ?string
    {
        if (!$this->image) {
            return null;
        }
        
        $image = ltrim($this->image, '/');

        if (str_starts_with($image, 'storage/')) {
            return asset($image);
        }

        return asset('storage/' . $image);
    }

    public function getFeaturedImageAttribute(): ?string
    {
        return $this->image_url;
    }
}

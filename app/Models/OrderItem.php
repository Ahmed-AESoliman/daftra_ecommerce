<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    use HasFactory;
    protected $fillable = [
        'order_id',
        'product_id',
        'product_name',
        'product_sku',
        'price',
        'quantity',
        'total'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'total' => 'decimal:2',
        'quantity' => 'integer',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function getFormattedPriceAttribute(): string
    {
        return number_format($this->price, 2);
    }

    public function getFormattedTotalAttribute(): string
    {
        return number_format($this->total, 2);
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($orderItem) {
            if (empty($orderItem->total)) {
                $orderItem->total = $orderItem->price * $orderItem->quantity;
            }
        });

        static::updating(function ($orderItem) {
            $orderItem->total = $orderItem->price * $orderItem->quantity;
        });
    }
}

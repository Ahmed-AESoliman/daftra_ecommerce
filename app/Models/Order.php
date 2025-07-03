<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;
    protected $fillable = [
        'order_number',
        'status',
        'subtotal',
        'tax_amount',
        'shipping_amount',
        'discount_amount',
        'total_amount',
        'currency',
        'billing_address',
        'shipping_address',
        'notes',
        'shipped_at',
        'delivered_at'
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'shipping_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'billing_address' => 'array',
        'shipping_address' => 'array',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];


    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function scopeStatus($query, $status)
    {
        return $query->where('status', $status);
    }


    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeProcessing($query)
    {
        return $query->where('status', 'processing');
    }

    public function scopeShipped($query)
    {
        return $query->where('status', 'shipped');
    }

    public function scopeDelivered($query)
    {
        return $query->where('status', 'delivered');
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    public function getRouteKeyName(): string
    {
        return 'order_number';
    }

    public function getFormattedTotalAttribute(): string
    {
        return $this->currency . ' ' . number_format($this->total_amount, 2);
    }

    public function getIsShippedAttribute(): bool
    {
        return in_array($this->status, ['shipped', 'delivered']);
    }

    public function getIsDeliveredAttribute(): bool
    {
        return $this->status === 'delivered';
    }

    public function getIsCancelledAttribute(): bool
    {
        return $this->status === 'cancelled';
    }
    public function scopeApplyFilters($query, $request)
    {
        // Search filter
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhere('billing_address->name', 'like', "%{$search}%")
                  ->orWhere('billing_address->email', 'like', "%{$search}%")
                  ->orWhere('notes', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->has('status') && $request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Date range filters
        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Amount range filters
        if ($request->has('min_amount') && $request->min_amount) {
            $query->where('total_amount', '>=', $request->min_amount);
        }
        if ($request->has('max_amount') && $request->max_amount) {
            $query->where('total_amount', '<=', $request->max_amount);
        }

        return $query;
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($order) {
            if (empty($order->order_number)) {
                $order->order_number = 'ORD-' . strtoupper(uniqid());
            }
        });
    }
}

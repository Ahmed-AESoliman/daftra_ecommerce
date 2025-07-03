<?php

namespace Database\Factories;

use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        $subtotal = $this->faker->randomFloat(2, 50, 500);
        $taxAmount = $subtotal * 0.1;
        $shippingAmount = $this->faker->randomFloat(2, 5, 25);
        $discountAmount = $this->faker->randomFloat(2, 0, 50);
        $totalAmount = $subtotal + $taxAmount + $shippingAmount - $discountAmount;

        return [
            'order_number' => 'ORD-' . strtoupper($this->faker->unique()->bothify('??##??##')),
            'status' => $this->faker->randomElement(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'shipping_amount' => $shippingAmount,
            'discount_amount' => $discountAmount,
            'total_amount' => $totalAmount,
            'currency' => 'USD',
            'billing_address' => [
                'name' => $this->faker->name(),
                'email' => $this->faker->email(),
                'phone' => $this->faker->phoneNumber(),
                'address' => $this->faker->streetAddress(),
                'city' => $this->faker->city(),
                'state' => $this->faker->state(),
                'postal_code' => $this->faker->postcode(),
                'country' => $this->faker->country(),
            ],
            'shipping_address' => [
                'name' => $this->faker->name(),
                'address' => $this->faker->streetAddress(),
                'city' => $this->faker->city(),
                'state' => $this->faker->state(),
                'postal_code' => $this->faker->postcode(),
                'country' => $this->faker->country(),
            ],
            'notes' => $this->faker->optional()->sentence(),
            'shipped_at' => $this->faker->optional()->dateTimeBetween('-30 days', 'now'),
            'delivered_at' => $this->faker->optional()->dateTimeBetween('-15 days', 'now'),
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'shipped_at' => null,
            'delivered_at' => null,
        ]);
    }

    public function processing(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'processing',
            'shipped_at' => null,
            'delivered_at' => null,
        ]);
    }

    public function shipped(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'shipped',
            'shipped_at' => $this->faker->dateTimeBetween('-7 days', 'now'),
            'delivered_at' => null,
        ]);
    }

    public function delivered(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'delivered',
            'shipped_at' => $this->faker->dateTimeBetween('-14 days', '-7 days'),
            'delivered_at' => $this->faker->dateTimeBetween('-7 days', 'now'),
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
            'shipped_at' => null,
            'delivered_at' => null,
        ]);
    }
}
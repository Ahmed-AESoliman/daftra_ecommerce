<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use App\Models\Order;

class OrderCreatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $order;

    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Your Order Has Been Placed!')
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('Thank you for your order!')
            ->line('Order Number: ' . $this->order->order_number)
            ->line('Total: $' . $this->order->total_amount)
            ->action('View Order', url('/orders/' . $this->order->order_number))
            ->line('We appreciate your business!');
    }
}

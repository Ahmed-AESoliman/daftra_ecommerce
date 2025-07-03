<?php

namespace App\Listeners;

use App\Events\OrderCreated;
use App\Models\User;
use App\Notifications\OrderCreatedNotification;

class SendOrderCreatedMail
{
    public function handle(OrderCreated $event)
    {
        $order = $event->order;
        $user = User::first();
        if ($user) {
            $user->notify(new OrderCreatedNotification($order));
        }
    }
}

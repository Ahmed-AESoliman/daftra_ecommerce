<?php

namespace App\Notifications\User;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class UserResetPasswordNotification extends ResetPassword
{
    public string $customUrl;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $customUrl)
    {
        $this->customUrl = $customUrl;
    }

    /**
     * Build the mail representation of the notification.
     */
    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Reset Password Notification')
            ->line('You are receiving this email because we received a password reset request for your account.')
            ->action('Reset Password', url($this->customUrl))
            ->line('This password reset link will expire in 60 minutes.')
            ->line('If you did not request a password reset, no further action is required.');
    }
}

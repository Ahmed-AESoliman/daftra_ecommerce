<?php

namespace App\Jobs;

use App\Models\User;
use App\Notifications\User\UserResetPasswordNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ResetPasswordJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $email;
    public $broker;

    /**
     * Create a new job instance.
     */
    public function __construct(string $email, string $broker = 'users')
    {
        $this->email = $email;
        $this->broker = $broker;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            // Find user by email
            $user = User::where('email', $this->email)->first();
            
            if (!$user) {
                Log::info('Password reset attempted for non-existent email: ' . $this->email);
                return;
            }

            // Generate a password reset token
            $token = Password::broker($this->broker)->createToken($user);
            
            // Build custom frontend URL
            $frontendBaseUrl = config('app.frontend_url', 'http://localhost:3000');
            $customUrl = "{$frontendBaseUrl}/auth/reset-password?token={$token}&email={$this->email}";
            
            // Send custom notification
            $user->notify(new UserResetPasswordNotification($customUrl));

            Log::info('Password reset link sent successfully to: ' . $this->email);
        } catch (\Exception $e) {
            Log::error('Error in ResetPasswordJob: ' . $e->getMessage(), [
                'email' => $this->email,
                'broker' => $this->broker,
            ]);
            throw $e;
        }
    }
}
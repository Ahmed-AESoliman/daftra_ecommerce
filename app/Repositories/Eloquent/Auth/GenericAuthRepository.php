<?php

namespace App\Repositories\Eloquent\Auth;

use App\Http\Resources\IAM\AuthenticatedUserResource;
use App\Http\Responses\ApiResponse;
use App\Jobs\ResetPasswordJob;
use App\Repositories\Contracts\Auth\BaseAuthRepositoryInterface;
use Carbon\Carbon;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;

abstract class GenericAuthRepository extends BaseAuthRepository implements BaseAuthRepositoryInterface
{
    protected const ERROR_MESSAGE = 'An error occurred.';

    abstract protected function getLogContext(): string;
    abstract protected function getModelClass(): string;

    /**
     * Login User
     * @param $credentials
     * @return JsonResponse
     */
    public function login($credentials): JsonResponse
    {
        $modelClass = $this->getModelClass();
        $user = $modelClass::where('email', $credentials['email'])->first();

        // Check if user exists and credentials are valid
        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return ApiResponse::error('The provided credentials are incorrect.');
        }

        // Remove existing tokens
        $user->tokens()->delete();

        // Create new token
        $token = $user->createToken('access-token')->plainTextToken;

        return ApiResponse::success(new AuthenticatedUserResource($user, $token));
    }

    /**
     * Reset password
     * @param array $data
     * @param string $broker
     * @return JsonResponse
     */
    public function resetPassword($data, string $broker = 'users'): JsonResponse
    {
        try {
            $status = Password::broker($broker)->reset(
                $data,
                function ($user, $password) {
                    $user->forceFill([
                        'password' => Hash::make($password),
                        'email_verified_at' => Carbon::now()
                    ]);
                    $user->save();
                    event(new PasswordReset($user));
                }
            );

            if ($status == Password::PASSWORD_RESET) {
                return ApiResponse::success(message: 'Password has been reset successfully.');
            } else {
                return ApiResponse::error($status);
            }
        } catch (\Exception $e) {
            Log::error($this->getLogContext() . ' reset password: ' . $e->getMessage());
            return ApiResponse::error(self::ERROR_MESSAGE);
        }
    }

    /**
     * Resend password reset email
     * @param string $email
     * @param string $broker
     * @return JsonResponse
     */
    public function resend(string $email, string $broker = 'users'): JsonResponse
    {
        try {
            // Dispatch the password reset job
            dispatch(new ResetPasswordJob($email, $broker));

            return ApiResponse::success(message: 'Password reset email will be sent if the email exists in our system.');
        } catch (\Exception $e) {
            Log::error($this->getLogContext() . ' resend password reset: ' . $e->getMessage());
            return ApiResponse::error(self::ERROR_MESSAGE);
        }
    }

    /**
     * Verify email
     * @param array $data
     * @return JsonResponse
     */
    public function verify($data): JsonResponse
    {
        try {
            $modelClass = $this->getModelClass();
            $user = $modelClass::findOrFail($data['id']);

            // Check if the hash matches
            if (!hash_equals((string) $data['hash'], sha1($user->getEmailForVerification()))) {
                return ApiResponse::error('Invalid verification link.');
            }

            // Check if URL has expired
            if (Carbon::createFromTimestamp($data['expires'])->isPast()) {
                return ApiResponse::error('Verification link has expired.');
            }

            if ($user->hasVerifiedEmail()) {
                return ApiResponse::success(message: 'Email already verified.');
            }

            if ($user->markEmailAsVerified()) {
                event(new Verified($user));
            }

            // Set password if provided
            if (isset($data['password'])) {
                $user->update([
                    'password' => Hash::make($data['password']),
                ]);
            }

            return ApiResponse::success(message: 'Email verified successfully.');
        } catch (\Exception $e) {
            Log::error($this->getLogContext() . ' verify email: ' . $e->getMessage());
            return ApiResponse::error(self::ERROR_MESSAGE);
        }
    }

    /**
     * Resend verification email
     * @param array $data
     * @return JsonResponse
     */
    public function resendVerify($data): JsonResponse
    {
        try {
            $modelClass = $this->getModelClass();
            $user = $modelClass::where('email', $data['email'])->first();

            if (!$user) {
                return ApiResponse::success(message: 'If the email exists, a verification link has been sent.');
            }

            if ($user->hasVerifiedEmail()) {
                return ApiResponse::success(message: 'Email is already verified.');
            }

            // Send email verification notification
            $user->sendEmailVerificationNotification();

            return ApiResponse::success(message: 'Verification email has been sent.');
        } catch (\Exception $e) {
            Log::error($this->getLogContext() . ' resend verification email: ' . $e->getMessage());
            return ApiResponse::error(self::ERROR_MESSAGE);
        }
    }
}

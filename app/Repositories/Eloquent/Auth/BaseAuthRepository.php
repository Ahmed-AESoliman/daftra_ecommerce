<?php

namespace App\Repositories\Eloquent\Auth;

use App\Http\Resources\IAM\AuthenticatedUserResource;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class BaseAuthRepository
{
    /**
     * Retrieve Authenticated User Data
     * @return JsonResponse
     */
    public function getAuthenticatedUser(): JsonResponse
    {
        $user = Auth::user();

        if (!$user) {
            return ApiResponse::error('Unauthenticated');
        }

        return ApiResponse::success(new AuthenticatedUserResource($user, null));
    }

    /**
     * Update User Data
     * @param $data
     * @return JsonResponse
     */
    public function update($data): JsonResponse
    {
        try {
            $user = Auth::user();
            $user->update([
                'name' => $data['name'],
            ]);

            return ApiResponse::success(message: 'Your profile has been updated successfully.');
        } catch (\Exception $e) {
            Log::error('update Authenticated User: ' . $e->getMessage());
            return ApiResponse::error('An error occurred.');
        }
    }

    /**
     * Update User password
     * @param $data
     * @return JsonResponse
     */
    public function updatePassword($data): JsonResponse
    {
        try {
            $user = Auth::user();
            if (!Hash::check($data['currentPassword'], $user->password)) {
                return ApiResponse::error('Current password does not match.');
            }
            $user->update([
                'password' => Hash::make($data['password']),
            ]);
            return ApiResponse::success(message: 'Password updated successfully.');
        } catch (\Exception $e) {
            Log::error('update Authenticated User password: ' . $e->getMessage());
            return ApiResponse::error('An error occurred.');
        }
    }


    /**
     * Logout & Delete Token
     * @return JsonResponse
     */
    public function logout(): JsonResponse
    {
        $user = Auth::user();

        if ($user && $user->currentAccessToken()) {
            $user->currentAccessToken()->delete();
        }

        return ApiResponse::success(message: 'Successfully logged out');
    }
}

<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\UpdatePasswordRequest;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Http\Requests\CreatePasswordRequest;
use App\Http\Requests\ResendMailRequest;
use App\Repositories\Contracts\Auth\BaseAuthRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    /**
     * @var BaseAuthRepositoryInterface
     */
    private BaseAuthRepositoryInterface $authRepository;

    /**
     * AuthController constructor.
     * @param BaseAuthRepositoryInterface $authRepository
     */
    public function __construct(BaseAuthRepositoryInterface $authRepository)
    {
        $this->middleware(['auth:api'])->except(['login',  'resetPassword',  'resend', 'verify',  'resendVerify', 'forgotPassword']);
        $this->authRepository = $authRepository;
    }

    /**
     * User login
     * @param LoginRequest $request
     * @return JsonResponse
     */
    public function login(LoginRequest $request): JsonResponse
    {
        return $this->authRepository->login($request->validated());
    }


    /**
     * Get authenticated user
     * @return JsonResponse
     */
    public function getAuthenticatedUser(): JsonResponse
    {
        return $this->authRepository->getAuthenticatedUser();
    }


    /**
     * User logout
     */
    public function logout(): JsonResponse
    {
        return $this->authRepository->logout();
    }

    /**
     * Update user profile
     * @param UpdateProfileRequest $request
     * @return JsonResponse
     */
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        return $this->authRepository->update($request->validated());
    }


    /**
     * Update user password
     * @param UpdatePasswordRequest $request
     * @return JsonResponse
     */
    public function updatePassword(UpdatePasswordRequest $request): JsonResponse
    {
        return $this->authRepository->updatePassword($request->validated());
    }

    /**
     * Send password reset email
     * @param ResendMailRequest $request
     * @return JsonResponse
     */
    public function forgotPassword(ResendMailRequest $request): JsonResponse
    {
        return $this->authRepository->resend($request->input('email'), 'users');
    }

    /**
     * Resend password reset email
     * @param ResendMailRequest $request
     * @return JsonResponse
     */
    public function resend(ResendMailRequest $request): JsonResponse
    {
        return $this->authRepository->resend($request->input('email'), 'users');
    }

    /**
     * Reset password
     * @param CreatePasswordRequest $request
     * @return JsonResponse
     */
    public function resetPassword(CreatePasswordRequest $request): JsonResponse
    {
        return $this->authRepository->resetPassword($request->validated(), 'users');
    }

    /**
     * Verify email
     * @param CreatePasswordRequest $request
     * @return JsonResponse
     */
    public function verify(CreatePasswordRequest $request): JsonResponse
    {
        return $this->authRepository->verify($request->validated());
    }

    /**
     * Verify email (alias for backward compatibility)
     * @param CreatePasswordRequest $request
     * @return JsonResponse
     */
    public function verifyEmail(CreatePasswordRequest $request): JsonResponse
    {
        return $this->verify($request);
    }

    /**
     * Resend email verification
     * @param ResendMailRequest $request
     * @return JsonResponse
     */
    public function resendVerify(ResendMailRequest $request): JsonResponse
    {
        return $this->authRepository->resendVerify($request->validated());
    }
}

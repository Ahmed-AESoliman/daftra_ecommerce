<?php

namespace App\Repositories\Contracts\Auth;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

interface BaseAuthRepositoryInterface
{
    /**
     * login user
     * @param $credentials
     * @return JsonResponse
     */
    public function login($credentials): JsonResponse;

    /**
     * retrieve Authenticate dUser data
     * @return JsonResponse
     */
    public function getAuthenticatedUser(): JsonResponse;


    /**
     * update user data
     * @param $data
     * @return JsonResponse
     */

    public function update($data): JsonResponse;
    /**
     * Update User password
     * @param $data
     * @return JsonResponse
     */
    public function updatePassword($data): JsonResponse;

    /**
     * @param $request
     * @return JsonResponse
     */
    public function resetPassword($request): JsonResponse;
    /**
     * logout user
     * @return JsonResponse
     */
    public function logout(): JsonResponse;

    /**
     * @param string $email
     * @return JsonResponse
     */
    public function resend(string $email): JsonResponse;


    /**
     * verify Email
     * @param $request
     * @return JsonResponse
     */
    public function verify($request): JsonResponse;

    /**
     * resnd verify Email
     * @param Request $request
     * @return JsonResponse
     */
    public function resendVerify(Request $request): JsonResponse;
}

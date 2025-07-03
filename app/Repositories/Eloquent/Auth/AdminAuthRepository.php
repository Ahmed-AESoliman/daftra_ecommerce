<?php

namespace App\Repositories\Eloquent\Auth;

use App\Models\User;

class AdminAuthRepository extends GenericAuthRepository
{
    protected function getModelClass(): string
    {
        return User::class;
    }

    protected function getLogContext(): string
    {
        return 'api';
    }
}

<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;

interface BaseRepositoryInterface
{
    /**
     * Get paginated list of resources (index)
     */
    public function index($request): JsonResponse;

    /**
     * Create a new resource (store)
     */
    public function store(array $data): JsonResponse;

    /**
     * Get a specific resource by model (show)
     */
    public function show(Model $model): JsonResponse;

    /**
     * Update a specific resource (update)
     */
    public function update(Model $model, array $data): JsonResponse;

    /**
     * Delete a specific resource (destroy)
     */
    public function destroy(Model $model): JsonResponse;
}

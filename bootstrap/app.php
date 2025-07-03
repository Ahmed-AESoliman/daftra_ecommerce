<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Responses\ApiResponse;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\UnauthorizedException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance']);

        $middleware->web(append: [
            HandleAppearance::class,
        ]);

        $middleware->group('api', [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
            \Illuminate\Routing\Middleware\ThrottleRequests::class . ':api',
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (Throwable $e, Request $request) {
            if ($request->is('api/*')) {
                // Handle 404 Errors (Model Not Found or Route Not Found)
                if ($e instanceof ModelNotFoundException || $e instanceof NotFoundHttpException) {
                    return ApiResponse::error('Item not found.', 404);
                }
                // Handle 401 Unauthorized Errors
                if ($e instanceof AuthenticationException) {
                    return ApiResponse::error('Unauthorized', 401);
                }
                // $e instanceof ExceptionsUnauthorizedException ||
                if ($e instanceof UnauthorizedException ||  $e instanceof AccessDeniedHttpException) {
                    return ApiResponse::error('Unauthorized', 403);
                }
            }
        });
    })->create();

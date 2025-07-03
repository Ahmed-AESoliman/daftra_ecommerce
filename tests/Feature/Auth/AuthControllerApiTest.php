<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class AuthControllerApiTest extends TestCase
{
    use RefreshDatabase;

    private const TEST_EMAIL = 'test@example.com';
    private const TEST_PASSWORD = 'NewPassword123!';
    private const LOGIN_ENDPOINT = '/api/admin/auth/login';
    private const VERIFY_ENDPOINT = '/api/admin/auth/verify';
    private const RESEND_VERIFY_ENDPOINT = '/api/admin/auth/resend-verify';

    protected function setUp(): void
    {
        parent::setUp();
        Queue::fake();
    }

    /**
     * Test successful login API
     */
    public function test_user_can_login_via_api()
    {
        $user = User::factory()->create([
            'email' => self::TEST_EMAIL,
            'password' => Hash::make('password123')
        ]);

        $response = $this->postJson(self::LOGIN_ENDPOINT, [
            'email' => self::TEST_EMAIL,
            'password' => 'password123'
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'statusCode',
                'message',
                'errorMessages',
                'data' => [
                    'id',
                    'name',
                    'email',
                    'verified',
                    'accessToken'
                ]
            ]);

        $this->assertDatabaseHas('personal_access_tokens', [
            'tokenable_id' => $user->id,
            'tokenable_type' => User::class
        ]);
    }

    /**
     * Test login with invalid credentials
     */
    public function test_user_cannot_login_with_invalid_credentials()
    {
        $user = User::factory()->create([
            'email' => self::TEST_EMAIL,
            'password' => Hash::make('password123')
        ]);

        $response = $this->postJson(self::LOGIN_ENDPOINT, [
            'email' => self::TEST_EMAIL,
            'password' => 'wrongpassword'
        ]);

        $response->assertStatus(400)
            ->assertJson([
                'statusCode' => 400,
                'message' => 'The provided credentials are incorrect.'
            ]);
    }

    /**
     * Test login validation errors
     */
    public function test_login_validation_errors()
    {
        $response = $this->postJson(self::LOGIN_ENDPOINT, [
            'email' => 'invalid-email',
            'password' => ''
        ]);

        $response->assertStatus(422)
            ->assertJsonStructure([
                'statusCode',
                'message',
                'errorMessages' => [
                    'email',
                    'password'
                ]
            ]);
    }

    /**
     * Test user logout
     */
    public function test_user_can_logout()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/admin/auth/logout');

        $response->assertStatus(200)
            ->assertJson([
                'statusCode' => 200,
                'message' => 'Successfully logged out'
            ]);

        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id
        ]);
    }

    /**
     * Test get authenticated user
     */
    public function test_can_get_authenticated_user()
    {
        $user = User::factory()->create();
        $this->actingAs($user, 'api');

        $response = $this->getJson('/api/admin/auth/authenticated-user');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'statusCode',
                'message',
                'errorMessages',
                'data' => [
                    'id',
                    'name',
                    'email'
                ]
            ])
            ->assertJson([
                'statusCode' => 200,
                'data' => [
                    'id' => $user->id,
                    'email' => $user->email
                ]
            ]);
    }

    /**
     * Test update user profile
     */
    public function test_user_can_update_profile()
    {
        $user = User::factory()->create();
        $this->actingAs($user, 'api');

        $response = $this->postJson('/api/admin/auth/update', [
            'name' => 'Updated Name'
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'statusCode' => 200,
                'message' => 'Your profile has been updated successfully.'
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated Name'
        ]);
    }

    /**
     * Test update password
     */
    public function test_user_can_update_password()
    {
        $user = User::factory()->create([
            'password' => Hash::make('oldpassword')
        ]);
        $this->actingAs($user, 'api');

        $response = $this->putJson('/api/admin/auth/password', [
            'currentPassword' => 'oldpassword',
            'password' => self::TEST_PASSWORD,
            'password_confirmation' => self::TEST_PASSWORD
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'statusCode' => 200,
                'message' => 'Password updated successfully.'
            ]);

        $user->refresh();
        $this->assertTrue(Hash::check(self::TEST_PASSWORD, $user->password));
    }

    /**
     * Test forgot password
     */
    public function test_user_can_request_password_reset()
    {

        $response = $this->postJson('/api/admin/auth/forgot-password', [
            'email' => self::TEST_EMAIL
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'statusCode' => 200,
                'message' => 'Password reset email will be sent if the email exists in our system.'
            ]);
    }

    /**
     * Test resend password reset
     */
    public function test_user_can_resend_password_reset()
    {

        $response = $this->postJson('/api/admin/auth/resend', [
            'email' => self::TEST_EMAIL
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'statusCode' => 200,
                'message' => 'Password reset email will be sent if the email exists in our system.'
            ]);
    }

    /**
     * Test reset password with valid token
     */
    public function test_user_can_reset_password_with_valid_token()
    {
        $user = User::factory()->create(['email' => self::TEST_EMAIL]);
        $token = Password::createToken($user);

        $response = $this->postJson('/api/admin/auth/reset-password', [
            'email' => self::TEST_EMAIL,
            'password' => self::TEST_PASSWORD,
            'password_confirmation' => self::TEST_PASSWORD,
            'token' => $token
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'statusCode' => 200,
                'message' => 'Password has been reset successfully.'
            ]);

        $user->refresh();
        $this->assertTrue(Hash::check(self::TEST_PASSWORD, $user->password));
        $this->assertNotNull($user->email_verified_at);
    }

    /**
     * Test reset password with invalid token
     */
    public function test_user_cannot_reset_password_with_invalid_token()
    {
        $response = $this->postJson('/api/admin/auth/reset-password', [
            'email' => self::TEST_EMAIL,
            'password' => self::TEST_PASSWORD,
            'password_confirmation' => self::TEST_PASSWORD,
            'token' => 'invalid-token'
        ]);

        $response->assertStatus(400)
            ->assertJsonStructure([
                'statusCode',
                'message',
                'errorMessages'
            ]);
    }

    /**
     * Test email verification validation (endpoint requires token)
     */
    public function test_verify_endpoint_requires_token()
    {
        $response = $this->postJson(self::VERIFY_ENDPOINT, [
            'password' => self::TEST_PASSWORD,
            'password_confirmation' => self::TEST_PASSWORD
        ]);

        $response->assertStatus(422)
            ->assertJsonStructure([
                'statusCode',
                'message',
                'errorMessages' => [
                    'token'
                ]
            ]);
    }

    /**
     * Test resend verification email
     */
    public function test_user_can_resend_verification_email()
    {
        User::factory()->create([
            'email' => self::TEST_EMAIL,
            'email_verified_at' => null
        ]);

        $response = $this->postJson(self::RESEND_VERIFY_ENDPOINT, [
            'email' => self::TEST_EMAIL
        ]);
        $response->assertStatus(200)
            ->assertJson([
                'statusCode' => 200,
                'message' => 'Verification email has been sent.'
            ]);
    }

    /**
     * Test resend verification for already verified email
     */
    public function test_resend_verification_for_already_verified_email()
    {
        User::factory()->create([
            'email' => self::TEST_EMAIL,
            'email_verified_at' => now()
        ]);

        $response = $this->postJson(self::RESEND_VERIFY_ENDPOINT, [
            'email' => self::TEST_EMAIL
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'statusCode' => 200,
                'message' => 'Email is already verified.'
            ]);
    }

    /**
     * Test resend verification for non-existent email
     */
    public function test_resend_verification_for_non_existent_email()
    {
        $response = $this->postJson(self::RESEND_VERIFY_ENDPOINT, [
            'email' => 'nonexistent@example.com'
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'statusCode' => 200,
                'message' => 'If the email exists, a verification link has been sent.'
            ]);
    }

    /**
     * Test protected routes require authentication
     */
    public function test_protected_routes_require_authentication()
    {
        $protectedRoutes = [
            ['method' => 'get', 'uri' => '/api/admin/auth/authenticated-user'],
            ['method' => 'post', 'uri' => '/api/admin/auth/logout'],
            ['method' => 'post', 'uri' => '/api/admin/auth/update'],
            ['method' => 'put', 'uri' => '/api/admin/auth/password']
        ];

        foreach ($protectedRoutes as $route) {
            $response = $this->{$route['method'] . 'Json'}($route['uri']);
            $response->assertStatus(401);
        }
    }

    /**
     * Test rate limiting on auth routes
     */
    public function test_auth_routes_are_rate_limited()
    {
        User::factory()->create([
            'email' => self::TEST_EMAIL,
            'password' => Hash::make('password123')
        ]);

        // Make 6 requests (limit is 5 per minute)
        for ($i = 0; $i < 6; $i++) {
            $response = $this->postJson(self::LOGIN_ENDPOINT, [
                'email' => self::TEST_EMAIL,
                'password' => 'wrongpassword'
            ]);

            if ($i < 5) {
                $response->assertStatus(400); // Invalid credentials
            } else {
                $response->assertStatus(429); // Rate limited
            }
        }
    }
}

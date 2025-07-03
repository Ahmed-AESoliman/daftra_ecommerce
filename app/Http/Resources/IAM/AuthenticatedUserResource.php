<?php

namespace App\Http\Resources\IAM;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuthenticatedUserResource extends JsonResource
{

    public ?string $token;

    public function __construct($resource, $token)
    {
        parent::__construct($resource);
        $this->token = $token;
    }
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {

        $data = [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'verified' => $this->email_verified_at ? true : false,
        ];
        if ($this->token) {
            $data['accessToken'] = $this->token;
        }
        return $data;
    }
}

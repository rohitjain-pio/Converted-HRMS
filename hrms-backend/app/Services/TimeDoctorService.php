<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TimeDoctorService
{
    private $baseUrl;
    private $apiToken;
    private $companyId;

    public function __construct()
    {
        $this->baseUrl = config('services.timedoctor.base_url');
        $this->apiToken = config('services.timedoctor.api_token');
        $this->companyId = config('services.timedoctor.company_id');
    }

    /**
     * Validate if a Time Doctor user ID belongs to the given email
     * Legacy: TimeDoctorClient.IsTimeDoctorUserIdValid
     */
    public function isTimeDoctorUserIdValid(string $email, string $timeDoctorUserId): bool
    {
        if (empty($email) || empty($timeDoctorUserId)) {
            return false;
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiToken,
            ])->get($this->baseUrl . '/' . $timeDoctorUserId, [
                'company' => $this->companyId,
                'detail' => 'name',
            ]);

            if (!$response->successful()) {
                return false;
            }

            $data = $response->json();
            $userEmail = $data['data']['email'] ?? null;

            return $userEmail && strtolower($userEmail) === strtolower($email);
        } catch (\Exception $e) {
            Log::error('Time Doctor validation failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Get Time Doctor user ID by email
     * Legacy: TimeDoctorClient.GetTimeDoctorUserIdByEmail
     */
    public function getTimeDoctorUserIdByEmail(string $email): ?string
    {
        if (empty($email)) {
            return null;
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiToken,
            ])->get($this->baseUrl, [
                'company' => $this->companyId,
                'detail' => 'name',
                'include-archived-users' => 'false',
                'filter[email]' => $email,
            ]);

            if (!$response->successful()) {
                return null;
            }

            $data = $response->json();
            
            if (empty($data['data']) || count($data['data']) < 1) {
                return null;
            }

            $firstUser = $data['data'][0];
            $userEmail = $firstUser['email'] ?? null;
            $userId = $firstUser['id'] ?? null;

            if (!$userEmail || !$userId) {
                return null;
            }

            return strtolower($userEmail) === strtolower($email) ? $userId : null;
        } catch (\Exception $e) {
            Log::error('Time Doctor lookup failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Get Time Doctor user details by user ID
     */
    public function getTimeDoctorUserById(string $timeDoctorUserId): ?array
    {
        if (empty($timeDoctorUserId)) {
            return null;
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiToken,
            ])->get($this->baseUrl . '/' . $timeDoctorUserId, [
                'company' => $this->companyId,
                'detail' => 'name',
            ]);

            if (!$response->successful()) {
                return null;
            }

            return $response->json()['data'] ?? null;
        } catch (\Exception $e) {
            Log::error('Time Doctor get user failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Get active Time Doctor users for a company
     */
    public function getActiveUsers(): ?array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiToken,
            ])->get($this->baseUrl, [
                'company' => $this->companyId,
                'detail' => 'name',
                'include-archived-users' => 'false',
            ]);

            if (!$response->successful()) {
                return null;
            }

            return $response->json()['data'] ?? null;
        } catch (\Exception $e) {
            Log::error('Time Doctor get users failed: ' . $e->getMessage());
            return null;
        }
    }
}

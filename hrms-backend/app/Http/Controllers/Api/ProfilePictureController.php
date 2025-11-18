<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmployeeData;
use App\Services\AzureBlobService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

/**
 * Profile Picture Controller
 * Legacy: UserProfileController.UploadUserProfileImage, UpdateProfilePicture, RemoveProfilePicture
 * Handles employee profile picture upload, update, and removal operations
 */
class ProfilePictureController extends Controller
{
    protected $azureBlobService;

    public function __construct(AzureBlobService $azureBlobService)
    {
        $this->azureBlobService = $azureBlobService;
    }

    /**
     * Upload profile picture for new employee
     * Legacy: POST /api/UserProfile/UploadUserProfileImage
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function upload(Request $request): JsonResponse
    {
        try {
            // Validate request
            $validator = Validator::make($request->all(), [
                'employee_id' => 'required|integer|exists:employee_data,id',
                'file' => [
                    'required',
                    'file',
                    'mimes:jpeg,jpg,png,gif',
                    'max:' . (config('filesystems.user_profile_max_size', 1048576) / 1024) // Convert bytes to KB
                ]
            ], [
                'file.max' => 'The profile picture must not exceed 1MB.',
                'file.mimes' => 'The profile picture must be a file of type: jpeg, jpg, png, gif.'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'statusCode' => 400,
                    'message' => 'Validation failed',
                    'data' => null,
                    'errors' => $validator->errors()
                ], 400);
            }

            $employeeId = $request->input('employee_id');
            $file = $request->file('file');

            // Check if employee exists
            $employee = EmployeeData::find($employeeId);
            if (!$employee) {
                return response()->json([
                    'statusCode' => 404,
                    'message' => 'Employee not found',
                    'data' => null
                ], 404);
            }

            // Upload to Azure Blob Storage
            $fileName = $this->azureBlobService->uploadFile(
                $file,
                $employeeId,
                AzureBlobService::USER_DOCUMENT_CONTAINER
            );

            if (!$fileName) {
                return response()->json([
                    'statusCode' => 500,
                    'message' => 'Failed to upload file to Azure Blob Storage',
                    'data' => null
                ], 500);
            }

            // Update employee record
            $employee->file_name = $fileName;
            $employee->file_original_name = $file->getClientOriginalName();
            $employee->modified_by = auth()->user()?->personal_email ?? 'system';
            $employee->modified_on = now();
            $employee->save();

            return response()->json([
                'statusCode' => 200,
                'message' => 'Profile picture uploaded successfully',
                'data' => [
                    'file_name' => $fileName,
                    'file_original_name' => $file->getClientOriginalName(),
                    'file_url' => $this->azureBlobService->getFileSasUrl(
                        AzureBlobService::USER_DOCUMENT_CONTAINER,
                        $fileName
                    )
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('Profile picture upload failed: ' . $e->getMessage(), [
                'employee_id' => $request->input('employee_id'),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'statusCode' => 500,
                'message' => 'Failed to upload profile picture: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Update existing profile picture
     * Legacy: POST /api/UserProfile/UpdateProfilePicture
     * 
     * @param Request $request
     * @param int $id Employee ID
     * @return JsonResponse
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            // Validate request
            $validator = Validator::make($request->all(), [
                'file' => [
                    'required',
                    'file',
                    'mimes:jpeg,jpg,png,gif',
                    'max:' . (config('filesystems.user_profile_max_size', 1048576) / 1024)
                ]
            ], [
                'file.max' => 'The profile picture must not exceed 1MB.',
                'file.mimes' => 'The profile picture must be a file of type: jpeg, jpg, png, gif.'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'statusCode' => 400,
                    'message' => 'Validation failed',
                    'data' => null,
                    'errors' => $validator->errors()
                ], 400);
            }

            $file = $request->file('file');

            // Check if employee exists
            $employee = EmployeeData::find($id);
            if (!$employee) {
                return response()->json([
                    'statusCode' => 404,
                    'message' => 'Employee not found',
                    'data' => null
                ], 404);
            }

            // Delete old profile picture from Azure if exists
            if ($employee->file_name) {
                try {
                    $this->azureBlobService->deleteFile(
                        $employee->file_name,
                        AzureBlobService::USER_DOCUMENT_CONTAINER
                    );
                } catch (\Exception $e) {
                    Log::warning('Failed to delete old profile picture: ' . $e->getMessage());
                }
            }

            // Upload new profile picture to Azure Blob Storage
            $fileName = $this->azureBlobService->uploadFile(
                $file,
                $id,
                AzureBlobService::USER_DOCUMENT_CONTAINER
            );

            if (!$fileName) {
                return response()->json([
                    'statusCode' => 500,
                    'message' => 'Failed to upload file to Azure Blob Storage',
                    'data' => null
                ], 500);
            }

            // Update employee record
            $employee->file_name = $fileName;
            $employee->file_original_name = $file->getClientOriginalName();
            $employee->modified_by = auth()->user()?->personal_email ?? 'system';
            $employee->modified_on = now();
            $employee->save();

            return response()->json([
                'statusCode' => 200,
                'message' => 'Profile picture updated successfully',
                'data' => [
                    'file_name' => $fileName,
                    'file_original_name' => $file->getClientOriginalName(),
                    'file_url' => $this->azureBlobService->getFileSasUrl(
                        AzureBlobService::USER_DOCUMENT_CONTAINER,
                        $fileName
                    )
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('Profile picture update failed: ' . $e->getMessage(), [
                'employee_id' => $id,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'statusCode' => 500,
                'message' => 'Failed to update profile picture: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Remove profile picture
     * Legacy: GET /api/UserProfile/RemoveProfilePicture/{id}
     * 
     * @param int $id Employee ID
     * @return JsonResponse
     */
    public function remove(int $id): JsonResponse
    {
        try {
            // Check if employee exists
            $employee = EmployeeData::find($id);
            if (!$employee) {
                return response()->json([
                    'statusCode' => 404,
                    'message' => 'Employee not found',
                    'data' => null
                ], 404);
            }

            // Delete profile picture from Azure if exists
            if ($employee->file_name) {
                try {
                    $this->azureBlobService->deleteFile(
                        $employee->file_name,
                        AzureBlobService::USER_DOCUMENT_CONTAINER
                    );
                } catch (\Exception $e) {
                    Log::warning('Failed to delete profile picture from Azure: ' . $e->getMessage());
                }
            }

            // Update employee record
            $employee->file_name = null;
            $employee->file_original_name = null;
            $employee->modified_by = auth()->user()?->personal_email ?? 'system';
            $employee->modified_on = now();
            $employee->save();

            return response()->json([
                'statusCode' => 200,
                'message' => 'Profile picture removed successfully',
                'data' => null
            ], 200);

        } catch (\Exception $e) {
            Log::error('Profile picture removal failed: ' . $e->getMessage(), [
                'employee_id' => $id,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'statusCode' => 500,
                'message' => 'Failed to remove profile picture: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get profile picture URL with SAS token
     * 
     * @param int $id Employee ID
     * @return JsonResponse
     */
    public function getUrl(int $id): JsonResponse
    {
        try {
            $employee = EmployeeData::find($id);
            if (!$employee) {
                return response()->json([
                    'statusCode' => 404,
                    'message' => 'Employee not found',
                    'data' => null
                ], 404);
            }

            if (!$employee->file_name) {
                return response()->json([
                    'statusCode' => 404,
                    'message' => 'No profile picture found',
                    'data' => null
                ], 404);
            }

            $fileUrl = $this->azureBlobService->getFileSasUrl(
                AzureBlobService::USER_DOCUMENT_CONTAINER,
                $employee->file_name
            );

            if (!$fileUrl) {
                return response()->json([
                    'statusCode' => 404,
                    'message' => 'Failed to generate file URL',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'statusCode' => 200,
                'message' => 'Profile picture URL retrieved successfully',
                'data' => [
                    'file_name' => $employee->file_name,
                    'file_original_name' => $employee->file_original_name,
                    'file_url' => $fileUrl
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('Get profile picture URL failed: ' . $e->getMessage(), [
                'employee_id' => $id,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'statusCode' => 500,
                'message' => 'Failed to get profile picture URL: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserQualificationInfo;
use App\Models\UserCertificate;
use App\Models\Qualification;
use App\Models\University;
use App\Services\AzureBlobService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class QualificationController extends Controller
{
    protected $azureBlobService;

    public function __construct(AzureBlobService $azureBlobService)
    {
        $this->azureBlobService = $azureBlobService;
    }

    /**
     * Get all qualifications for an employee
     * Legacy: GET /api/UserProfile/GetUserQualifications
     */
    public function index(Request $request)
    {
        $employeeId = $request->input('employee_id');
        
        $qualifications = UserQualificationInfo::with(['qualification', 'university'])
            ->where('employee_id', $employeeId)
            ->where('is_deleted', 0)
            ->orderBy('year_to', 'desc')
            ->get()
            ->map(function ($qual) {
                return [
                    'id' => $qual->id,
                    'employee_id' => $qual->employee_id,
                    'qualification_id' => $qual->qualification_id,
                    'qualification_name' => $qual->qualification->qualification_name ?? '',
                    'university_id' => $qual->university_id,
                    'university_name' => $qual->university->university_name ?? '',
                    'degree_name' => $qual->degree_name,
                    'college_name' => $qual->college_name,
                    'aggregate_percentage' => $qual->aggregate_percentage,
                    'year_from' => $qual->year_from,
                    'year_to' => $qual->year_to,
                    'file_name' => $qual->file_name,
                    'file_original_name' => $qual->file_original_name,
                    'document_url' => $qual->file_name ? $this->azureBlobService->getFileSasUrl(
                        AzureBlobService::USER_DOCUMENT_CONTAINER,
                        $qual->file_name
                    ) : null,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $qualifications
        ]);
    }

    /**
     * Add new qualification
     * Legacy: POST /api/UserProfile/AddUserQualification
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|integer|exists:employee_data,id',
            'qualification_id' => 'required|integer|exists:qualification,id',
            'university_id' => 'nullable|integer|exists:university,id',
            'degree_name' => 'nullable|string|max:200',
            'college_name' => 'nullable|string|max:200',
            'aggregate_percentage' => 'nullable|string|max:10',
            'year_from' => 'nullable|integer|min:1950|max:' . (date('Y') + 10),
            'year_to' => 'nullable|integer|min:1950|max:' . (date('Y') + 10),
            'file' => 'nullable|file|max:10240', // 10MB max
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            $fileName = null;
            $fileOriginalName = null;

            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $fileName = $this->azureBlobService->uploadFile(
                    $file,
                    $request->employee_id,
                    AzureBlobService::USER_DOCUMENT_CONTAINER
                );

                if (!$fileName) {
                    throw new \Exception('Failed to upload file to Azure Blob Storage');
                }

                $fileOriginalName = $file->getClientOriginalName();
            }

            $qualification = UserQualificationInfo::create([
                'employee_id' => $request->employee_id,
                'qualification_id' => $request->qualification_id,
                'university_id' => $request->university_id,
                'degree_name' => $request->degree_name,
                'college_name' => $request->college_name,
                'aggregate_percentage' => $request->aggregate_percentage,
                'year_from' => $request->year_from,
                'year_to' => $request->year_to,
                'file_name' => $fileName,
                'file_original_name' => $fileOriginalName,
                'created_by' => auth()->user()->email ?? 'system',
                'created_on' => now(),
                'is_deleted' => 0
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Qualification added successfully',
                'data' => $qualification
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to add qualification: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update qualification
     * Legacy: PUT /api/UserProfile/UpdateUserQualification
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'university_id' => 'nullable|integer|exists:university,id',
            'degree_name' => 'nullable|string|max:200',
            'college_name' => 'nullable|string|max:200',
            'aggregate_percentage' => 'nullable|string|max:10',
            'year_from' => 'nullable|integer|min:1950|max:' . (date('Y') + 10),
            'year_to' => 'nullable|integer|min:1950|max:' . (date('Y') + 10),
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $qualification = UserQualificationInfo::find($id);
        if (!$qualification || $qualification->is_deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Qualification not found'
            ], 404);
        }

        $qualification->update([
            'university_id' => $request->university_id ?? $qualification->university_id,
            'degree_name' => $request->degree_name ?? $qualification->degree_name,
            'college_name' => $request->college_name ?? $qualification->college_name,
            'aggregate_percentage' => $request->aggregate_percentage ?? $qualification->aggregate_percentage,
            'year_from' => $request->year_from ?? $qualification->year_from,
            'year_to' => $request->year_to ?? $qualification->year_to,
            'modified_by' => auth()->user()->email ?? 'system',
            'modified_on' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Qualification updated successfully'
        ]);
    }

    /**
     * Delete qualification (soft delete)
     * Legacy: DELETE /api/UserProfile/DeleteUserQualification
     */
    public function destroy($id)
    {
        $qualification = UserQualificationInfo::find($id);
        if (!$qualification || $qualification->is_deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Qualification not found'
            ], 404);
        }

        $qualification->softDelete(auth()->user()->email ?? 'system');

        return response()->json([
            'success' => true,
            'message' => 'Qualification deleted successfully'
        ]);
    }

    /**
     * Get qualification master list
     * Legacy: GET /api/UserProfile/GetQualificationList
     */
    public function getQualifications()
    {
        $qualifications = Qualification::where('is_deleted', 0)
            ->orderBy('qualification_name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $qualifications
        ]);
    }

    /**
     * Get university master list
     * Legacy: GET /api/UserProfile/GetUniversityList
     */
    public function getUniversities()
    {
        $universities = University::where('is_deleted', 0)
            ->orderBy('university_name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $universities
        ]);
    }

    /**
     * Get all certificates for an employee
     * Legacy: GET /api/UserProfile/GetUserCertificates
     */
    public function getCertificates(Request $request)
    {
        $employeeId = $request->input('employee_id');
        
        $certificates = UserCertificate::where('employee_id', $employeeId)
            ->where('is_deleted', 0)
            ->orderBy('created_on', 'desc')
            ->get()
            ->map(function ($cert) {
                return [
                    'id' => $cert->id,
                    'employee_id' => $cert->employee_id,
                    'certificate_name' => $cert->certificate_name,
                    'certificate_expiry' => $cert->certificate_expiry,
                    'file_name' => $cert->file_name,
                    'file_original_name' => $cert->file_original_name,
                    'document_url' => $cert->file_name ? $this->azureBlobService->getFileSasUrl(
                        AzureBlobService::USER_DOCUMENT_CONTAINER,
                        $cert->file_name
                    ) : null,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $certificates
        ]);
    }

    /**
     * Add new certificate
     * Legacy: POST /api/UserProfile/AddUserCertificate
     */
    public function storeCertificate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|integer|exists:employee_data,id',
            'certificate_name' => 'required|string|max:200',
            'certificate_expiry' => 'nullable|date',
            'file' => 'required|file|max:10240',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            $file = $request->file('file');
            $fileName = $this->azureBlobService->uploadFile(
                $file,
                $request->employee_id,
                AzureBlobService::USER_DOCUMENT_CONTAINER
            );

            if (!$fileName) {
                throw new \Exception('Failed to upload file to Azure Blob Storage');
            }

            $certificate = UserCertificate::create([
                'employee_id' => $request->employee_id,
                'certificate_name' => $request->certificate_name,
                'certificate_expiry' => $request->certificate_expiry,
                'file_name' => $fileName,
                'file_original_name' => $file->getClientOriginalName(),
                'created_by' => auth()->user()->email ?? 'system',
                'created_on' => now(),
                'is_deleted' => 0
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Certificate added successfully',
                'data' => $certificate
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to add certificate: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete certificate (soft delete)
     * Legacy: DELETE /api/UserProfile/DeleteUserCertificate
     */
    public function destroyCertificate($id)
    {
        $certificate = UserCertificate::find($id);
        if (!$certificate || $certificate->is_deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Certificate not found'
            ], 404);
        }

        $certificate->softDelete(auth()->user()->email ?? 'system');

        return response()->json([
            'success' => true,
            'message' => 'Certificate deleted successfully'
        ]);
    }
}

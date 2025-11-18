<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserDocument;
use App\Models\DocumentType;
use App\Services\AzureBlobService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class DocumentController extends Controller
{
    protected $azureBlobService;

    public function __construct(AzureBlobService $azureBlobService)
    {
        $this->azureBlobService = $azureBlobService;
    }

    /**
     * Get all documents for an employee
     * Legacy: GET /api/UserProfile/GetUserDocuments
     */
    public function index(Request $request)
    {
        $employeeId = $request->input('employee_id');
        
        $documents = UserDocument::with(['documentType'])
            ->where('employee_id', $employeeId)
            ->where('is_deleted', 0)
            ->orderBy('created_on', 'desc')
            ->get()
            ->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'employee_id' => $doc->employee_id,
                    'document_type_id' => $doc->document_type_id,
                    'document_type' => $doc->documentType->document_name ?? '',
                    'document_no' => $doc->document_no,
                    'document_expiry' => $doc->document_expiry,
                    'file_name' => $doc->file_name,
                    'file_original_name' => $doc->file_original_name,
                    'location' => $doc->file_name ? $this->azureBlobService->getFileSasUrl(
                        AzureBlobService::USER_DOCUMENT_CONTAINER,
                        $doc->file_name
                    ) : null,
                    'id_proof_for' => $doc->documentType->id_proof_for ?? null,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $documents
        ]);
    }

    /**
     * Upload a new document
     * Legacy: POST /api/UserProfile/UploadUserDocument
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|integer|exists:employee_data,id',
            'document_type_id' => 'required|integer|exists:document_type,id',
            'document_no' => 'nullable|string|max:100',
            'document_expiry' => 'nullable|date',
            'file' => 'required|file|max:10240', // 10MB max
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
            
            // Upload to Azure Blob Storage
            $fileName = $this->azureBlobService->uploadFile(
                $file,
                $request->employee_id,
                AzureBlobService::USER_DOCUMENT_CONTAINER
            );

            if (!$fileName) {
                throw new \Exception('Failed to upload file to Azure Blob Storage');
            }

            $document = UserDocument::create([
                'employee_id' => $request->employee_id,
                'document_type_id' => $request->document_type_id,
                'document_no' => $request->document_no,
                'document_expiry' => $request->document_expiry,
                'file_name' => $fileName,
                'file_original_name' => $file->getClientOriginalName(),
                'created_by' => auth()->user()->email ?? 'system',
                'created_on' => now(),
                'is_deleted' => 0
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Document uploaded successfully',
                'data' => [
                    'id' => $document->id,
                    'file_name' => $fileName,
                    'location' => $this->azureBlobService->getFileSasUrl(
                        AzureBlobService::USER_DOCUMENT_CONTAINER,
                        $fileName
                    )
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload document: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update document details (not the file)
     * Legacy: PUT /api/UserProfile/UpdateUserDocument
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'document_no' => 'nullable|string|max:100',
            'document_expiry' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $document = UserDocument::find($id);
        if (!$document || $document->is_deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Document not found'
            ], 404);
        }

        $document->update([
            'document_no' => $request->document_no ?? $document->document_no,
            'document_expiry' => $request->document_expiry ?? $document->document_expiry,
            'modified_by' => auth()->user()->email ?? 'system',
            'modified_on' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Document updated successfully'
        ]);
    }

    /**
     * Delete a document (soft delete)
     * Legacy: DELETE /api/UserProfile/DeleteUserDocument
     */
    public function destroy($id)
    {
        $document = UserDocument::find($id);
        if (!$document || $document->is_deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Document not found'
            ], 404);
        }

        // Soft delete in database
        $document->softDelete(auth()->user()->email ?? 'system');

        // Optionally delete from Azure Blob Storage
        if ($document->file_name) {
            $this->azureBlobService->deleteFile(
                $document->file_name,
                AzureBlobService::USER_DOCUMENT_CONTAINER
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Document deleted successfully'
        ]);
    }

    /**
     * Download a document
     * Legacy: GET /api/UserProfile/DownloadUserDocument
     */
    public function download($id)
    {
        $document = UserDocument::find($id);
        if (!$document || $document->is_deleted || !$document->file_name) {
            return response()->json([
                'success' => false,
                'message' => 'Document not found'
            ], 404);
        }

        $fileContent = $this->azureBlobService->downloadFile(
            AzureBlobService::USER_DOCUMENT_CONTAINER,
            $document->file_name
        );

        if (!$fileContent) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to download file'
            ], 500);
        }

        return response($fileContent)
            ->header('Content-Type', 'application/octet-stream')
            ->header('Content-Disposition', 'attachment; filename="' . $document->file_original_name . '"');
    }

    /**
     * Get document types for dropdowns
     * Legacy: GET /api/UserProfile/GetDocumentTypes
     */
    public function getDocumentTypes(Request $request)
    {
        $idProofFor = $request->input('id_proof_for'); // 1=ID, 2=Address, 3=Educational, 4=Experience, 5=Other

        $query = DocumentType::where('is_deleted', 0);
        
        if ($idProofFor) {
            $query->where('id_proof_for', $idProofFor);
        }

        $documentTypes = $query->orderBy('document_name')->get();

        return response()->json([
            'success' => true,
            'data' => $documentTypes
        ]);
    }
}


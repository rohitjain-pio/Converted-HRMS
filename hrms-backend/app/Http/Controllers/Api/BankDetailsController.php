<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BankDetails;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * BankDetailsController - Manage employee bank accounts
 * Features #26-28: Bank Details Management with encryption
 */
class BankDetailsController extends Controller
{
    /**
     * Get employee bank details
     */
    public function index(Request $request): JsonResponse
    {
        $employeeId = $request->input('employee_id');
        $showFullAccount = $request->input('show_full', false);
        
        $bankDetails = BankDetails::where('employee_id', $employeeId)
            ->active()
            ->get();
        
        // Mask account numbers for non-HR roles
        $bankDetails->transform(function ($bank) use ($showFullAccount) {
            if (!$showFullAccount) {
                $bank->account_no = $bank->masked_account_no;
            }
            return $bank;
        });
        
        return response()->json([
            'success' => true,
            'data' => $bankDetails
        ]);
    }

    /**
     * Create bank details
     * Account number is automatically encrypted
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $bankDetails = BankDetails::create([
                'employee_id' => $request->input('employee_id'),
                'bank_name' => $request->input('bank_name'),
                'account_no' => $request->input('account_no'), // Auto-encrypted in model
                'branch_name' => $request->input('branch_name'),
                'ifsc_code' => $request->input('ifsc_code'),
                'is_active' => $request->input('is_active', 1),
                'created_by' => auth()->user()->email ?? 'system',
                'created_on' => now(),
                'is_deleted' => 0
            ]);
            
            // Return with masked account number
            $bankDetails->account_no = $bankDetails->masked_account_no;
            
            return response()->json([
                'success' => true,
                'message' => 'Bank details added successfully',
                'data' => $bankDetails
            ], 201);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add bank details: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update bank details
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $bankDetails = BankDetails::find($id);
            
            if (!$bankDetails) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bank details not found'
                ], 404);
            }
            
            $bankDetails->update([
                'bank_name' => $request->input('bank_name', $bankDetails->bank_name),
                'account_no' => $request->input('account_no', $bankDetails->account_no),
                'branch_name' => $request->input('branch_name', $bankDetails->branch_name),
                'ifsc_code' => $request->input('ifsc_code', $bankDetails->ifsc_code),
                'is_active' => $request->input('is_active', $bankDetails->is_active),
                'modified_by' => auth()->user()->email ?? 'system',
                'modifiedon' => now()
            ]);
            
            $bankDetails->account_no = $bankDetails->masked_account_no;
            
            return response()->json([
                'success' => true,
                'message' => 'Bank details updated successfully',
                'data' => $bankDetails
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update bank details: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete bank details (soft delete)
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $bankDetails = BankDetails::find($id);
            
            if (!$bankDetails) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bank details not found'
                ], 404);
            }
            
            $bankDetails->softDelete(auth()->user()->email ?? 'system');
            
            return response()->json([
                'success' => true,
                'message' => 'Bank details deleted successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete bank details: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Set bank account as active (for salary credit)
     */
    public function setActive(int $id): JsonResponse
    {
        try {
            $bankDetails = BankDetails::find($id);
            
            if (!$bankDetails) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bank details not found'
                ], 404);
            }
            
            // Deactivate all other accounts for this employee
            BankDetails::where('employee_id', $bankDetails->employee_id)
                ->where('id', '!=', $id)
                ->update(['is_active' => 0]);
            
            // Activate this account
            $bankDetails->update(['is_active' => 1]);
            
            return response()->json([
                'success' => true,
                'message' => 'Bank account set as active'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update status: ' . $e->getMessage()
            ], 500);
        }
    }
}

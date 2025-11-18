<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use App\Models\PermanentAddress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * AddressController - Manage employee addresses
 * Features #16-18: Current and Permanent Address Management
 */
class AddressController extends Controller
{
    /**
     * Get employee addresses
     */
    public function index(Request $request): JsonResponse
    {
        $employeeId = $request->input('employee_id');
        
        $currentAddress = Address::with(['city.state.country'])
            ->where('employee_id', $employeeId)
            ->where('address_type', 1)
            ->active()
            ->first();
        
        $permanentAddress = PermanentAddress::with(['city.state.country'])
            ->where('employee_id', $employeeId)
            ->active()
            ->first();
        
        return response()->json([
            'success' => true,
            'data' => [
                'current' => $currentAddress,
                'permanent' => $permanentAddress
            ]
        ]);
    }

    /**
     * Create or update current address
     */
    public function storeCurrentAddress(Request $request): JsonResponse
    {
        try {
            $employeeId = $request->input('employee_id');
            
            // Check if address exists
            $address = Address::where('employee_id', $employeeId)
                ->where('address_type', 1)
                ->first();
            
            $data = [
                'employee_id' => $employeeId,
                'line1' => $request->input('line1'),
                'line2' => $request->input('line2'),
                'city_id' => $request->input('city_id'),
                'state_id' => $request->input('state_id'),
                'country_id' => $request->input('country_id'),
                'pincode' => $request->input('pincode'),
                'address_type' => 1,
                'is_deleted' => 0
            ];
            
            if ($address) {
                $data['modified_by'] = auth()->user()->email ?? 'system';
                $data['modified_on'] = now();
                $address->update($data);
            } else {
                $data['created_by'] = auth()->user()->email ?? 'system';
                $data['created_on'] = now();
                $address = Address::create($data);
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Current address saved successfully',
                'data' => $address->load('city.state.country')
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to save address: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create or update permanent address
     */
    public function storePermanentAddress(Request $request): JsonResponse
    {
        try {
            $employeeId = $request->input('employee_id');
            
            $address = PermanentAddress::where('employee_id', $employeeId)->first();
            
            $data = [
                'employee_id' => $employeeId,
                'line1' => $request->input('line1'),
                'line2' => $request->input('line2'),
                'city_id' => $request->input('city_id'),
                'state_id' => $request->input('state_id'),
                'country_id' => $request->input('country_id'),
                'pincode' => $request->input('pincode'),
                'is_deleted' => 0
            ];
            
            if ($address) {
                $data['modified_by'] = auth()->user()->email ?? 'system';
                $data['modified_on'] = now();
                $address->update($data);
            } else {
                $data['created_by'] = auth()->user()->email ?? 'system';
                $data['created_on'] = now();
                $address = PermanentAddress::create($data);
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Permanent address saved successfully',
                'data' => $address->load('city.state.country')
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to save address: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Copy current address to permanent
     */
    public function copyCurrentToPermanent(Request $request): JsonResponse
    {
        try {
            $employeeId = $request->input('employee_id');
            
            $currentAddress = Address::where('employee_id', $employeeId)
                ->where('address_type', 1)
                ->active()
                ->first();
            
            if (!$currentAddress) {
                return response()->json([
                    'success' => false,
                    'message' => 'Current address not found'
                ], 404);
            }
            
            PermanentAddress::updateOrCreate(
                ['employee_id' => $employeeId],
                [
                    'line1' => $currentAddress->line1,
                    'line2' => $currentAddress->line2,
                    'city_id' => $currentAddress->city_id,
                    'state_id' => $currentAddress->state_id,
                    'country_id' => $currentAddress->country_id,
                    'pincode' => $currentAddress->pincode,
                    'created_by' => auth()->user()->email ?? 'system',
                    'created_on' => now(),
                    'is_deleted' => 0
                ]
            );
            
            return response()->json([
                'success' => true,
                'message' => 'Address copied successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to copy address: ' . $e->getMessage()
            ], 500);
        }
    }
}

<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Notice Period Configuration
    |--------------------------------------------------------------------------
    |
    | Notice period in days based on employee job type.
    | Maps exact values from legacy .NET configuration.
    |
    */
    'notice_periods' => [
        'probation' => 15,  // 15 days for probation employees
        'training' => 15,   // 15 days for training employees
        'confirmed' => 60,  // 60 days (2 months) for confirmed employees
    ],

    /*
    |--------------------------------------------------------------------------
    | Resignation Status Enums
    |--------------------------------------------------------------------------
    |
    | Status values for resignation workflow.
    | Exact mapping from legacy .NET ResignationStatus enum.
    |
    */
    'resignation_status' => [
        'pending' => 1,           // Pending Admin Approval
        'accepted' => 2,          // Accepted by Admin
        'rejected' => 3,          // Rejected by Admin
        'revoked' => 4,           // Withdrawn by Employee
        'completed' => 5,         // Exit Process Completed
    ],

    'resignation_status_labels' => [
        1 => 'Pending',
        2 => 'Accepted',
        3 => 'Rejected',
        4 => 'Revoked',
        5 => 'Completed',
    ],

    /*
    |--------------------------------------------------------------------------
    | Early Release Status Enums
    |--------------------------------------------------------------------------
    |
    | Status values for early release request workflow.
    | Exact mapping from legacy .NET EarlyReleaseStatus enum.
    |
    */
    'early_release_status' => [
        'pending' => 1,   // Pending Admin Approval
        'approved' => 2,  // Approved by Admin
        'rejected' => 3,  // Rejected by Admin
    ],

    'early_release_status_labels' => [
        1 => 'Pending',
        2 => 'Approved',
        3 => 'Rejected',
    ],

    /*
    |--------------------------------------------------------------------------
    | Knowledge Transfer (KT) Status Enums
    |--------------------------------------------------------------------------
    |
    | Status values for Knowledge Transfer completion.
    | Exact mapping from legacy .NET KTStatus enum.
    |
    */
    'kt_status' => [
        'pending' => 1,     // KT Not Started
        'in_progress' => 2, // KT In Progress
        'completed' => 3,   // KT Completed
    ],

    'kt_status_labels' => [
        1 => 'Pending',
        2 => 'In Progress',
        3 => 'Completed',
    ],

    /*
    |--------------------------------------------------------------------------
    | Asset Condition Enums
    |--------------------------------------------------------------------------
    |
    | Condition values for returned IT assets.
    | Must match AssetCondition table primary keys.
    |
    */
    'asset_condition' => [
        'good' => 1,
        'fair' => 2,
        'damaged' => 3,
        'lost' => 4,
    ],

    /*
    |--------------------------------------------------------------------------
    | Clearance Types
    |--------------------------------------------------------------------------
    |
    | Four-stage clearance workflow for exit management.
    |
    */
    'clearance_types' => [
        'hr' => 'HR Clearance',
        'department' => 'Department Clearance',
        'it' => 'IT Clearance',
        'accounts' => 'Accounts Clearance',
    ],

    /*
    |--------------------------------------------------------------------------
    | File Upload Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for clearance attachment uploads.
    |
    */
    'file_upload' => [
        'max_size' => 5120, // 5 MB in kilobytes
        'allowed_extensions' => ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'xlsx', 'xls'],
        'storage_path' => 'exit-management/attachments',
    ],
];

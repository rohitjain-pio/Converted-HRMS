<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserRoleMapping extends Model
{
    protected $table = 'user_role_mappings';
    public $timestamps = false;
    
    const CREATED_AT = 'created_on';
    const UPDATED_AT = 'modified_on';

    protected $fillable = [
        'role_id',
        'employee_id',
        'is_deleted',
        'created_by',
        'modified_by'
    ];

    protected $casts = [
        'is_deleted' => 'boolean',
    ];

    // Relationships
    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    public function employee()
    {
        return $this->belongsTo(EmployeeData::class, 'employee_id');
    }
}

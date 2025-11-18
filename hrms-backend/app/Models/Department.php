<?php

namespace App\Models;

class Department extends BaseModel
{
    protected $table = 'department';

    protected $fillable = [
        'department', 'created_by', 'created_on',
        'modified_by', 'modified_on', 'is_deleted'
    ];

    // Add accessor for backward compatibility
    public function getDepartmentNameAttribute()
    {
        return $this->department;
    }
}

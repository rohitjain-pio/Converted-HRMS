<?php

namespace App\Models;

class Designation extends BaseModel
{
    protected $table = 'designation';

    protected $fillable = [
        'designation', 'created_by', 'created_on',
        'modified_by', 'modified_on', 'is_deleted'
    ];

    // Add accessor for backward compatibility
    public function getDesignationNameAttribute()
    {
        return $this->designation;
    }
}

<?php

namespace App\Models;

class University extends BaseModel
{
    protected $table = 'university';

    protected $fillable = [
        'university_name', 'created_by', 'created_on',
        'modified_by', 'modified_on', 'is_deleted'
    ];
}

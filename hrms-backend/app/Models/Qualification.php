<?php

namespace App\Models;

class Qualification extends BaseModel
{
    protected $table = 'qualification';

    protected $fillable = [
        'qualification_name', 'created_by', 'created_on',
        'modified_by', 'modified_on', 'is_deleted'
    ];
}

<?php

namespace App\Models;

class Relationship extends BaseModel
{
    protected $table = 'relationship';

    protected $fillable = [
        'relationship_name', 'created_by', 'created_on',
        'modified_by', 'modified_on', 'is_deleted'
    ];
}

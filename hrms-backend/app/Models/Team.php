<?php

namespace App\Models;

class Team extends BaseModel
{
    protected $table = 'team';

    protected $fillable = [
        'team_name', 'created_by', 'created_on',
        'modified_by', 'modified_on', 'is_deleted'
    ];
}

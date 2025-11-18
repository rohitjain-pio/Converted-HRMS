<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $table = 'roles';
    public $timestamps = false;
    
    const CREATED_AT = 'created_on';
    const UPDATED_AT = 'modified_on';

    protected $fillable = [
        'name',
        'is_active',
        'created_by',
        'modified_by'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Relationships
    public function rolePermissions()
    {
        return $this->hasMany(RolePermission::class, 'role_id');
    }

    public function permissions()
    {
        return $this->belongsToMany(Permission::class, 'role_permissions', 'role_id', 'permission_id')
            ->wherePivot('is_active', true);
    }

    public function userRoleMappings()
    {
        return $this->hasMany(UserRoleMapping::class, 'role_id');
    }
}

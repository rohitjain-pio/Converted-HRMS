<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Menu extends Model
{
    protected $table = 'menus';
    protected $primaryKey = 'id';
    public $timestamps = false;

    const CREATED_AT = 'created_on';
    const UPDATED_AT = 'modified_on';

    protected $fillable = [
        'menu_name',
        'menu_path',
        'icon',
        'parent_menu_id',
        'display_order',
        'is_active',
        'created_by',
        'modified_by',
    ];

    protected $attributes = [
        'created_by' => 'system',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'display_order' => 'integer',
        'parent_menu_id' => 'integer',
    ];

    /**
     * Get parent menu
     */
    public function parent()
    {
        return $this->belongsTo(Menu::class, 'parent_menu_id');
    }

    /**
     * Get child menus (sub-menus)
     */
    public function children()
    {
        return $this->hasMany(Menu::class, 'parent_menu_id')
                    ->where('is_active', true)
                    ->orderBy('display_order');
    }

    /**
     * Get permissions associated with this menu
     */
    public function permissions()
    {
        return $this->belongsToMany(
            Permission::class,
            'menu_permissions',
            'menu_id',
            'permission_id'
        );
    }

    /**
     * Scope: Get only main menus (parent menus)
     */
    public function scopeMainMenus($query)
    {
        return $query->whereNull('parent_menu_id')
                     ->where('is_active', true)
                     ->orderBy('display_order');
    }
}

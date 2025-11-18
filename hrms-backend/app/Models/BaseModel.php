<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * BaseModel - Provides common functionality for all models
 * - Soft delete support via is_deleted
 * - Audit fields (created_by, created_on, modified_by, modified_on)
 * - Active scope
 */
abstract class BaseModel extends Model
{
    public $timestamps = false;

    protected $casts = [
        'created_on' => 'datetime',
        'modified_on' => 'datetime',
        'is_deleted' => 'boolean',
    ];

    /**
     * Scope to get only active (non-deleted) records
     */
    public function scopeActive($query)
    {
        return $query->where('is_deleted', 0);
    }

    /**
     * Soft delete the model
     */
    public function softDelete(string $deletedBy): bool
    {
        $this->is_deleted = 1;
        $this->modified_by = $deletedBy;
        $this->modified_on = now();
        return $this->save();
    }

    /**
     * Restore soft deleted model
     */
    public function restore(string $restoredBy): bool
    {
        $this->is_deleted = 0;
        $this->modified_by = $restoredBy;
        $this->modified_on = now();
        return $this->save();
    }
}

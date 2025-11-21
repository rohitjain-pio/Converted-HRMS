<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('role_permissions', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('role_id');  // Match roles table unsigned integer type
            $table->foreignId('permission_id')->constrained('permissions');
            $table->boolean('is_active')->default(true);
            $table->string('created_by', 250);
            $table->timestamp('created_on')->useCurrent();
            $table->string('modified_by', 250)->nullable();
            $table->timestamp('modified_on')->nullable()->useCurrentOnUpdate();
            
            $table->foreign('role_id')->references('id')->on('roles');
            $table->index(['role_id', 'permission_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('role_permissions');
    }
};

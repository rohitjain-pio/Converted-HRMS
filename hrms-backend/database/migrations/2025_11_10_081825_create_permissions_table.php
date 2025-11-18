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
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name', 250);
            $table->string('value', 250);
            $table->foreignId('module_id')->constrained('modules');
            $table->string('created_by', 250);
            $table->timestamp('created_on')->useCurrent();
            $table->string('modified_by', 250)->nullable();
            $table->timestamp('modified_on')->nullable()->useCurrentOnUpdate();
            $table->boolean('is_deleted')->default(false);
            
            $table->index(['module_id', 'is_deleted']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('permissions');
    }
};

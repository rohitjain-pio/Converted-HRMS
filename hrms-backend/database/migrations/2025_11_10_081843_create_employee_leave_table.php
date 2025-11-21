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
        Schema::create('employee_leave', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employee_data');
            $table->foreignId('leave_id')->constrained('leave_types');  // Changed to foreignId to match leave_types.id
            $table->decimal('opening_balance', 18, 2)->default(0);
            $table->date('leave_date');
            $table->boolean('is_active')->nullable()->default(true);
            $table->string('created_by', 100);
            $table->timestamp('created_on')->useCurrent();
            $table->string('modified_by', 100)->nullable();
            $table->timestamp('modified_on')->nullable()->useCurrentOnUpdate();
            $table->boolean('is_deleted')->default(false);
            
            $table->index(['employee_id', 'leave_id', 'is_deleted']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_leave');
    }
};

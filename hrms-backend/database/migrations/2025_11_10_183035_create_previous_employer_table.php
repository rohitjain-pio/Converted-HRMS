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
        Schema::create('previous_employer', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('employee_id')->nullable();
            $table->string('company_name', 200)->nullable();
            $table->string('designation', 100)->nullable();
            $table->date('employment_start_date')->nullable();
            $table->date('employment_end_date')->nullable();
            $table->string('duration', 50)->nullable()->comment('e.g., 2 years 3 months');
            $table->text('reason_for_leaving')->nullable();
            $table->string('manager_name', 100)->nullable();
            $table->string('manager_contact', 20)->nullable();
            $table->text('company_address')->nullable();
            $table->string('hr_name', 100)->nullable();
            $table->string('hr_contact', 20)->nullable();
            $table->string('created_by', 250)->nullable();
            $table->datetime('created_on')->nullable();
            $table->string('modified_by', 250)->nullable();
            $table->datetime('modified_on')->nullable();
            $table->boolean('is_deleted')->default(0);
            
            $table->foreign('employee_id')->references('id')->on('employee_data')->onDelete('cascade');
            
            $table->index('employee_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('previous_employer');
    }
};

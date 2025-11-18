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
        Schema::create('employment_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employee_data');
            $table->string('email', 100)->nullable();
            $table->date('joining_date')->nullable();
            $table->integer('team_id')->nullable();
            $table->string('team_name', 191)->nullable();
            $table->string('designation', 100)->nullable();
            $table->unsignedBigInteger('designation_id')->nullable();
            $table->unsignedBigInteger('reporting_manger_id')->nullable();
            $table->unsignedBigInteger('immediate_manager')->nullable();
            $table->string('reporting_manager_name', 250)->nullable();
            $table->string('reporting_manager_email', 100)->nullable();
            $table->tinyInteger('employment_status')->nullable();
            $table->integer('employee_status')->nullable();
            $table->integer('role_id')->nullable();
            $table->string('linked_in_url', 250)->nullable();
            $table->integer('department_id')->nullable();
            $table->string('department_name', 50)->nullable();
            $table->unsignedBigInteger('branch_id')->nullable();
            $table->tinyInteger('background_verificationstatus')->nullable();
            $table->boolean('criminal_verification')->nullable();
            $table->tinyInteger('total_experience_year')->nullable();
            $table->tinyInteger('total_experience_month')->nullable();
            $table->tinyInteger('relevant_experience_year')->nullable();
            $table->tinyInteger('relevant_experience_month')->nullable();
            $table->tinyInteger('job_type')->nullable();
            $table->date('confirmation_date')->nullable();
            $table->date('extended_confirmation_date')->nullable();
            $table->boolean('is_prob_extended')->nullable();
            $table->tinyInteger('prob_extended_weeks')->nullable();
            $table->boolean('is_confirmed')->nullable();
            $table->integer('probation_months')->nullable();
            $table->date('exit_date')->nullable();
            $table->boolean('is_manual_attendance')->default(false);
            $table->string('time_doctor_user_id', 20)->nullable();
            $table->boolean('is_reporting_manager')->nullable();
            $table->string('created_by', 250);
            $table->timestamp('created_on')->useCurrent();
            $table->string('modified_by', 250)->nullable();
            $table->timestamp('modified_on')->nullable()->useCurrentOnUpdate();
            $table->boolean('is_deleted')->nullable()->default(false);
            
            $table->foreign('reporting_manger_id')->references('id')->on('employee_data');
            $table->foreign('immediate_manager')->references('id')->on('employee_data');
            $table->index(['employee_id', 'email', 'is_deleted']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employment_details');
    }
};

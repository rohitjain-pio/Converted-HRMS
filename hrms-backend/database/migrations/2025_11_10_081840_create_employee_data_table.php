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
        Schema::create('employee_data', function (Blueprint $table) {
            $table->id();
            $table->string('first_name', 50);
            $table->string('middle_name', 50)->nullable();
            $table->string('last_name', 50);
            $table->string('father_name', 100)->nullable();
            $table->string('file_name', 100)->nullable();
            $table->string('file_original_name', 100)->nullable();
            $table->string('blood_group', 10)->nullable();
            $table->tinyInteger('gender')->nullable();
            $table->date('dob')->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('alternate_phone', 20)->nullable();
            $table->string('personal_email', 100)->nullable();
            $table->string('nationality', 50)->nullable();
            $table->string('interest', 250)->nullable();
            $table->tinyInteger('marital_status')->nullable();
            $table->string('emergency_contact_person', 100)->nullable();
            $table->string('emergency_contact_no', 20)->nullable();
            $table->string('pan_number', 100)->nullable();
            $table->string('adhar_number', 100)->nullable();
            $table->string('pf_number', 100)->nullable();
            $table->string('esi_no', 100)->nullable();
            $table->boolean('has_esi')->nullable();
            $table->boolean('has_pf')->nullable();
            $table->boolean('uan_no')->nullable();
            $table->string('passport_no', 100)->nullable();
            $table->dateTime('passport_expiry')->nullable();
            $table->dateTime('pf_date')->nullable();
            $table->string('employee_code', 20)->nullable()->unique();
            $table->tinyInteger('status')->nullable();
            $table->string('refresh_token', 100)->nullable();
            $table->dateTime('refresh_token_expiry_date')->nullable();
            $table->string('created_by', 250);
            $table->timestamp('created_on')->useCurrent();
            $table->string('modified_by', 250)->nullable();
            $table->timestamp('modified_on')->nullable()->useCurrentOnUpdate();
            $table->boolean('is_deleted')->default(false);
            
            $table->index(['employee_code', 'is_deleted']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_data');
    }
};

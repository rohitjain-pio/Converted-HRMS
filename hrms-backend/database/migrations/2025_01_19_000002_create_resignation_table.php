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
        Schema::create('resignation', function (Blueprint $table) {
            $table->integer('Id')->autoIncrement()->primary();
            $table->unsignedBigInteger('EmployeeId');
            $table->unsignedBigInteger('DepartmentID');
            $table->unsignedBigInteger('ReportingManagerId')->nullable();
            $table->date('LastWorkingDay')->nullable();
            $table->string('Reason', 500);
            $table->boolean('ExitDiscussion')->nullable();
            $table->tinyInteger('Status')->nullable();
            $table->string('Process', 50)->nullable();
            $table->unsignedBigInteger('ProcessedBy')->nullable();
            $table->datetime('ProcessedAt')->nullable();
            $table->string('SettlementStatus', 50)->nullable();
            $table->datetime('SettlementDate')->nullable();
            $table->boolean('IsActive')->nullable();
            $table->datetime('EarlyReleaseDate')->nullable();
            $table->boolean('IsEarlyRequestRelease')->nullable();
            $table->boolean('IsEarlyRequestApproved')->nullable();
            $table->tinyInteger('EarlyReleaseStatus')->nullable();
            $table->boolean('KTStatus')->nullable();
            $table->boolean('ExitInterviewStatus')->nullable();
            $table->boolean('ITDues')->nullable();
            $table->boolean('AccountNoDue')->nullable();
            $table->text('RejectResignationReason')->nullable();
            $table->text('RejectEarlyReleaseReason')->nullable();
            $table->datetime('CreatedOn');
            $table->string('CreatedBy', 100);
            $table->datetime('ModifiedOn')->nullable();
            $table->string('ModifiedBy', 100)->nullable();
            
            // Note: Foreign keys commented out because employee_data table uses MyISAM engine
            // In production, convert employee_data to InnoDB first: ALTER TABLE employee_data ENGINE=InnoDB;
            // $table->foreign('EmployeeId')->references('id')->on('employee_data')->onDelete('cascade');
            // $table->foreign('DepartmentID')->references('id')->on('department')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('resignation');
    }
};

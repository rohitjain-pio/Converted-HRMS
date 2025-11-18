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
        Schema::create('bank_details', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('employee_id')->nullable();
            $table->string('bank_name', 250)->nullable();
            $table->string('account_no', 100)->nullable()->comment('Store encrypted');
            $table->string('branch_name', 250)->nullable();
            $table->string('ifsc_code', 50)->nullable();
            $table->boolean('is_active')->default(1);
            $table->string('created_by', 250)->nullable();
            $table->datetime('created_on')->nullable();
            $table->string('modified_by', 250)->nullable();
            $table->datetime('modifiedon')->nullable();
            $table->boolean('is_deleted')->default(0);
            
            $table->foreign('employee_id')->references('id')->on('employee_data')->onDelete('cascade');
            
            $table->index('employee_id');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bank_details');
    }
};

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
        Schema::create('user_qualification_info', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('employee_id')->nullable();
            $table->unsignedBigInteger('qualification_id')->nullable();
            $table->unsignedBigInteger('university_id')->nullable();
            $table->string('degree_name', 200)->nullable();
            $table->string('college_name', 200)->nullable();
            $table->string('aggregate_percentage', 10)->nullable();
            $table->integer('year_from')->nullable();
            $table->integer('year_to')->nullable();
            $table->string('file_name', 255)->nullable();
            $table->string('file_original_name', 255)->nullable();
            $table->string('created_by', 250)->nullable();
            $table->datetime('created_on')->nullable();
            $table->string('modified_by', 250)->nullable();
            $table->datetime('modified_on')->nullable();
            $table->boolean('is_deleted')->default(0);
            
            $table->foreign('employee_id')->references('id')->on('employee_data')->onDelete('cascade');
            $table->foreign('qualification_id')->references('id')->on('qualification')->onDelete('set null');
            $table->foreign('university_id')->references('id')->on('university')->onDelete('set null');
            
            $table->index('employee_id');
            $table->index('qualification_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_qualification_info');
    }
};

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
        Schema::create('user_nominee_info', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('employee_id')->nullable();
            $table->string('nominee_name', 100)->nullable();
            $table->unsignedBigInteger('relationship_id')->nullable();
            $table->date('dob')->nullable();
            $table->string('contact_no', 20)->nullable();
            $table->text('address')->nullable();
            $table->decimal('percentage', 5, 2)->nullable()->comment('Must sum to 100% per employee');
            $table->tinyInteger('nominee_type')->nullable()->comment('1=Insurance, 2=PF, 3=Gratuity, 4=All');
            $table->boolean('is_nominee_minor')->default(0);
            $table->string('care_of', 100)->nullable()->comment('Guardian name if nominee is minor');
            $table->string('file_name', 255)->nullable()->comment('ID proof of nominee');
            $table->string('file_original_name', 255)->nullable();
            $table->string('created_by', 250)->nullable();
            $table->datetime('created_on')->nullable();
            $table->string('modified_by', 250)->nullable();
            $table->datetime('modified_on')->nullable();
            $table->boolean('is_deleted')->default(0);
            
            $table->foreign('employee_id')->references('id')->on('employee_data')->onDelete('cascade');
            $table->foreign('relationship_id')->references('id')->on('relationship')->onDelete('set null');
            
            $table->index('employee_id');
            $table->index('relationship_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_nominee_info');
    }
};

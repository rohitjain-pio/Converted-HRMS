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
        Schema::create('professional_reference', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('previous_employer_id')->nullable();
            $table->string('reference_name', 100)->nullable();
            $table->string('designation', 100)->nullable();
            $table->string('company_name', 200)->nullable();
            $table->string('contact_number', 20)->nullable();
            $table->string('email', 100)->nullable();
            $table->string('relationship_with_reference', 100)->nullable()->comment('Manager, Colleague, HR, Client');
            $table->tinyInteger('verification_status')->nullable()->comment('1=Pending, 2=InProgress, 3=Completed, 4=NotResponding');
            $table->datetime('verification_date')->nullable();
            $table->text('verification_notes')->nullable();
            $table->string('created_by', 250)->nullable();
            $table->datetime('created_on')->nullable();
            $table->string('modified_by', 250)->nullable();
            $table->datetime('modified_on')->nullable();
            $table->boolean('is_deleted')->default(0);
            
            $table->foreign('previous_employer_id')->references('id')->on('previous_employer')->onDelete('cascade');
            
            $table->index('previous_employer_id');
            $table->index('verification_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('professional_reference');
    }
};

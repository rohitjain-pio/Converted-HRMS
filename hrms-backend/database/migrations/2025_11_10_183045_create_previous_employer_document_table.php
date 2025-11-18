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
        Schema::create('previous_employer_document', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('previous_employer_id')->nullable();
            $table->unsignedBigInteger('document_type_id')->nullable();
            $table->string('file_name', 255)->nullable();
            $table->string('file_original_name', 255)->nullable();
            $table->string('created_by', 250)->nullable();
            $table->datetime('created_on')->nullable();
            $table->string('modified_by', 250)->nullable();
            $table->datetime('modified_on')->nullable();
            $table->boolean('is_deleted')->default(0);
            
            $table->foreign('previous_employer_id')->references('id')->on('previous_employer')->onDelete('cascade');
            $table->foreign('document_type_id')->references('id')->on('employer_document_type')->onDelete('set null');
            
            $table->index('previous_employer_id');
            $table->index('document_type_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('previous_employer_document');
    }
};

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
        Schema::create('employer_document_type', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('document_name', 100)->nullable();
            $table->tinyInteger('document_for')->nullable()->comment('1=Previous Employer, 2=Current Employer');
            $table->string('created_by', 250)->nullable();
            $table->datetime('created_on')->nullable();
            $table->string('modified_by', 250)->nullable();
            $table->datetime('modified_on')->nullable();
            $table->boolean('is_deleted')->default(0);
            
            $table->index('document_name');
            $table->index('document_for');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employer_document_type');
    }
};

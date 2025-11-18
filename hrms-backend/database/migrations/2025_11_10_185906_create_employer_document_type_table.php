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
            $table->string('doc_type_name', 100)->nullable();
            $table->string('doc_type_code', 20)->nullable();
            $table->string('created_by', 250)->nullable();
            $table->datetime('created_on')->nullable();
            $table->string('modified_by', 250)->nullable();
            $table->datetime('modified_on')->nullable();
            $table->boolean('is_deleted')->default(0);
            
            $table->index('doc_type_name');
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

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
        Schema::create('account_clearance', function (Blueprint $table) {
            $table->integer('Id')->autoIncrement()->primary();
            $table->integer('ResignationId');
            $table->boolean('FnFStatus')->nullable();
            $table->decimal('FnFAmount', 18, 2)->nullable();
            $table->boolean('IssueNoDueCertificate')->nullable();
            $table->text('Note')->nullable();
            $table->string('AccountAttachment', 255)->nullable();
            $table->string('FileOriginalName', 255)->nullable();
            $table->string('CreatedBy', 100);
            $table->datetime('CreatedOn');
            $table->string('ModifiedBy', 100)->nullable();
            $table->datetime('ModifiedOn')->nullable();
            
            // Foreign key
            $table->foreign('ResignationId')->references('Id')->on('resignation')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('account_clearance');
    }
};

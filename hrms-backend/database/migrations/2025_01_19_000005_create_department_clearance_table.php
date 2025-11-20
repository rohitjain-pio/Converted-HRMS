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
        Schema::create('department_clearance', function (Blueprint $table) {
            $table->bigInteger('Id')->autoIncrement()->primary();
            $table->integer('ResignationId');
            $table->tinyInteger('KTStatus')->nullable();
            $table->text('KTNotes');
            $table->text('Attachment');
            $table->string('KTUsers', 4000);
            $table->string('FileOriginalName', 255)->nullable();
            $table->string('CreatedBy', 250);
            $table->datetime('CreatedOn');
            $table->string('ModifiedBy', 250)->nullable();
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
        Schema::dropIfExists('department_clearance');
    }
};

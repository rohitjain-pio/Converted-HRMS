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
        Schema::create('resignation_history', function (Blueprint $table) {
            $table->bigInteger('Id')->autoIncrement()->primary();
            $table->integer('ResignationId')->nullable();
            $table->tinyInteger('ResignationStatus');
            $table->tinyInteger('EarlyReleaseStatus')->nullable();
            $table->datetime('CreatedOn');
            $table->string('CreatedBy', 100);
            
            // Foreign key
            $table->foreign('ResignationId')->references('Id')->on('resignation')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('resignation_history');
    }
};

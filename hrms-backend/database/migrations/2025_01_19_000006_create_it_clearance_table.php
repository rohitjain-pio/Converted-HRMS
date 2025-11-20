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
        Schema::create('it_clearance', function (Blueprint $table) {
            $table->integer('Id')->autoIncrement()->primary();
            $table->integer('ResignationId');
            $table->boolean('AccessRevoked')->default(0);
            $table->boolean('AssetReturned')->default(0);
            $table->integer('AssetCondition');
            $table->string('AttachmentUrl', 255)->nullable();
            $table->text('Note')->nullable();
            $table->boolean('ITClearanceCertification')->default(0);
            $table->string('FileOriginalName', 255)->nullable();
            $table->string('CreatedBy', 100);
            $table->datetime('CreatedOn')->useCurrent();
            $table->string('ModifiedBy', 100)->nullable();
            $table->datetime('ModifiedOn')->nullable();
            
            // Foreign keys
            $table->foreign('ResignationId')->references('Id')->on('resignation')->onDelete('cascade');
            $table->foreign('AssetCondition')->references('Id')->on('asset_condition')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('it_clearance');
    }
};

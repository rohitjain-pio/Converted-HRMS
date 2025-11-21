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
        Schema::create('city', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('state_id')->nullable();
            $table->unsignedBigInteger('country_id')->nullable();
            $table->string('city_name', 100)->nullable();
            $table->string('created_by', 250)->nullable();
            $table->datetime('created_on')->nullable();
            $table->string('modified_by', 250)->nullable();
            $table->datetime('modified_on')->nullable();
            $table->boolean('is_deleted')->default(0);
            
            $table->foreign('state_id')->references('id')->on('state')->onDelete('set null');
            $table->foreign('country_id')->references('id')->on('country')->onDelete('set null');
            $table->index(['state_id', 'country_id']);
            $table->index('city_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('city');
    }
};

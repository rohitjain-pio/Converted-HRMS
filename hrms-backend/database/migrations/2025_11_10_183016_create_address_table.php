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
        Schema::create('address', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('employee_id')->nullable();
            $table->string('line1', 250)->nullable();
            $table->string('line2', 250)->nullable();
            $table->unsignedBigInteger('city_id')->nullable();
            $table->unsignedBigInteger('country_id')->nullable();
            $table->unsignedBigInteger('state_id')->nullable();
            $table->tinyInteger('address_type')->nullable()->comment('1=Current, 2=Permanent');
            $table->string('pincode', 20)->nullable();
            $table->string('created_by', 250)->nullable();
            $table->datetime('created_on')->nullable();
            $table->string('modified_by', 250)->nullable();
            $table->datetime('modified_on')->nullable();
            $table->boolean('is_deleted')->default(0);
            
            $table->foreign('employee_id')->references('id')->on('employee_data')->onDelete('cascade');
            $table->foreign('city_id')->references('id')->on('city')->onDelete('set null');
            $table->foreign('country_id')->references('id')->on('country')->onDelete('set null');
            $table->foreign('state_id')->references('id')->on('state')->onDelete('set null');
            
            $table->index('employee_id');
            $table->index('address_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('address');
    }
};

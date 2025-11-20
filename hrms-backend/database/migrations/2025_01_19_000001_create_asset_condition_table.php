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
        Schema::create('asset_condition', function (Blueprint $table) {
            $table->integer('Id')->primary();
            $table->string('Status', 50);
            $table->string('CreatedBy', 255)->nullable();
            $table->datetime('CreatedOn')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asset_condition');
    }
};

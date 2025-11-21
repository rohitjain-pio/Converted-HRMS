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
        Schema::table('employee_data', function (Blueprint $table) {
            // Change uan_no from tinyint(1) to varchar(12) to store UAN number properly
            $table->string('uan_no', 12)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employee_data', function (Blueprint $table) {
            // Revert back to tinyint if needed (though this was the bug)
            $table->tinyInteger('uan_no')->nullable()->change();
        });
    }
};

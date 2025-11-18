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
        Schema::create('leave_types', function (Blueprint $table) {
            $table->id();
            $table->string('title', 50);
            $table->string('short_name', 10)->unique();
            $table->integer('order_no')->nullable();
            $table->string('created_by', 100);
            $table->timestamp('created_on')->useCurrent();
            $table->string('modified_by', 100)->nullable();
            $table->timestamp('modified_on')->nullable()->useCurrentOnUpdate();
            $table->boolean('is_deleted')->nullable()->default(false);
            
            $table->index(['short_name', 'is_deleted']);
        });

        // Insert default leave types
        DB::table('leave_types')->insert([
            [
                'title' => 'Casual Leave',
                'short_name' => 'CL',
                'order_no' => 1,
                'created_by' => 'system',
                'created_on' => now(),
                'is_deleted' => false
            ],
            [
                'title' => 'Privilege Leave',
                'short_name' => 'PL',
                'order_no' => 2,
                'created_by' => 'system',
                'created_on' => now(),
                'is_deleted' => false
            ],
            [
                'title' => 'Sick Leave',
                'short_name' => 'SL',
                'order_no' => 3,
                'created_by' => 'system',
                'created_on' => now(),
                'is_deleted' => false
            ],
            [
                'title' => 'Maternity Leave',
                'short_name' => 'ML',
                'order_no' => 4,
                'created_by' => 'system',
                'created_on' => now(),
                'is_deleted' => false
            ],
            [
                'title' => 'Paternity Leave',
                'short_name' => 'PTL',
                'order_no' => 5,
                'created_by' => 'system',
                'created_on' => now(),
                'is_deleted' => false
            ]
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leave_types');
    }
};

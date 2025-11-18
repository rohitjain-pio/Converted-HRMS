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
        Schema::create('menus', function (Blueprint $table) {
            $table->id();
            $table->string('menu_name', 100);
            $table->string('menu_path', 250)->nullable();
            $table->string('icon', 100)->nullable();
            $table->unsignedBigInteger('parent_menu_id')->nullable();
            $table->integer('display_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->string('created_by', 250);
            $table->timestamp('created_on')->useCurrent();
            $table->string('modified_by', 250)->nullable();
            $table->timestamp('modified_on')->nullable()->useCurrentOnUpdate();
            
            // Foreign key for hierarchical structure
            $table->foreign('parent_menu_id')
                  ->references('id')
                  ->on('menus')
                  ->onDelete('cascade');
            
            $table->index(['parent_menu_id']);
            $table->index(['is_active']);
            $table->index(['display_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menus');
    }
};

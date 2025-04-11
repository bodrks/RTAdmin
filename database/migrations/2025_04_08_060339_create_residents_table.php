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
        Schema::create('residents', function (Blueprint $table) {
            $table->id();
            $table->string('nama_lengkap');
            $table->text('foto_ktp')->nullable();
            $table->enum('status', ['Tetap', 'Kontrak']);
            $table->string('nomor_telepon')->nullable();
            $table->enum('status_pernikahan', ['Belum Menikah', 'Menikah', 'Cerai']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('residents');
    }
};

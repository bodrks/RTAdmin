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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('resident_id');
            $table->foreignId('house_id');
            $table->enum('jenis_iuran', ['Satpam', 'Kebersihan']);
            $table->enum('tipe_pembayaran', ['Bulanan', 'Tahunan']);
            $table->date('periode_awal'); 
            $table->date('periode_akhir');
            $table->integer('jumlah_bulan');
            $table->decimal('nominal', 10, 2);
            $table->date('tanggal_bayar');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payments extends Model
{
    protected $fillable = [
        'resident_id',
        'house_id',
        'jenis_iuran',
        'tipe_pembayaran',
        'periode_awal',
        'periode_akhir',
        'jumlah_bulan',
        'nominal',
        'tanggal_bayar',
    ];

    public function resident()
    {
        return $this->belongsTo(Residents::class);
    }

    public function house()
    {
        return $this->belongsTo(Houses::class);
    }
}

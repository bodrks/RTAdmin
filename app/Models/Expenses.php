<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Expenses extends Model
{
    protected $fillable = [
        'nama_pengeluaran',
        'keterangan',
        'nominal',
        'tanggal_pengeluaran',
    ];
}

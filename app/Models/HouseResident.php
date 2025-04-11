<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HouseResident extends Model
{
    protected $table = 'house_residents';
    protected $fillable = [
        'house_id',
        'resident_id',
        'tanggal_mulai',
        'tanggal_selesai',
    ];

    public function house()
    {
        return $this->belongsTo(Houses::class, 'house_id');
    }

    public function resident()
    {
        return $this->belongsTo(Residents::class, 'resident_id');
    }
}

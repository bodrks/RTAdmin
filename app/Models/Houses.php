<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Houses extends Model
{
    protected $fillable = [
        'nomor_rumah',
        'status_penghuni',
    ];

    public function currentResident()
    {
        return $this->hasOne(HouseResident::class, 'house_id')->whereNull('tanggal_selesai')->with('resident');
    }

    public function history()
    {
        return $this->hasMany(HouseResident::class);
    }
}

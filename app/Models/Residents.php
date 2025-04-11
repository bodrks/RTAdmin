<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Residents extends Model
{
    protected $fillable = [
        'nama_lengkap',
        'status',
        'nomor_telepon',
        'status_pernikahan',
        'foto_ktp',
    ];

    public function houses()
    {
        return $this->hasMany(HouseResident::class);
    }

    public function houseResidents()
    {
        return $this->hasMany(HouseResident::class, 'resident_id');
    }
}

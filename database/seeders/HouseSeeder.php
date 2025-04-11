<?php

namespace Database\Seeders;

use App\Models\Houses;
use App\Models\Residents;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class HouseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('house_residents')->truncate();
        DB::table('residents')->truncate();
        DB::table('houses')->truncate();

        for ($i = 1; $i <= 20; $i++) {
            $statusPenghuni = $i <= 15 ? 'Dihuni' : (rand(0, 1) ? 'Dihuni' : 'Tidak dihuni');

            $house = Houses::create([
                'nomor_rumah'      => "A$i",
                'status_penghuni'  => $statusPenghuni,
            ]);

            if ($statusPenghuni === 'Dihuni') {
                $resident = Residents::create([
                    'nama_lengkap'      => fake()->name(),
                    'nomor_telepon'     => fake()->phoneNumber(),
                    'status_pernikahan' => fake()->boolean() ? 'Menikah' : 'Belum Menikah',
                    'status'            => $i <= 15 ? 'Tetap' : 'Kontrak',
                    'foto_ktp'          => 'dummy.jpg',
                ]);

                // Assign ke table pivot house_residents
                DB::table('house_residents')->insert([
                    'house_id'      => $house->id,
                    'resident_id'   => $resident->id,
                    'tanggal_mulai' => now()->subMonths(rand(1, 24)),
                ]);
            }
        }
    }
}

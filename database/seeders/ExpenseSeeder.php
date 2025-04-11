<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ExpenseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $rutin = [];
        $tidakRutin = [
            ['nama_pengeluaran' => 'Perbaikan Jalan', 'tanggal' => '2025-02-10', 'nominal' => 2500000],
            ['nama_pengeluaran' => 'Perbaikan Pagar', 'tanggal' => '2025-05-20', 'nominal' => 1200000],
            ['nama_pengeluaran' => 'Pengaspalan', 'tanggal' => '2025-08-15', 'nominal' => 3000000],
            ['nama_pengeluaran' => 'Pengecatan Pos Satpam', 'tanggal' => '2025-10-10', 'nominal' => 900000],
        ];

        // Pengeluaran rutin: Gaji Satpam + Token Pos Satpam tiap bulan
        for ($month = 1; $month <= 12; $month++) {
            $tanggal = Carbon::createFromDate(2025, $month, 1)->format('Y-m-d');

            $rutin[] = [
                'nama_pengeluaran' => 'Gaji Satpam',
                'nominal' => 1500000,
                'tanggal_pengeluaran' => $tanggal,
                'created_at' => now(),
                'updated_at' => now(),
            ];

            $rutin[] = [
                'nama_pengeluaran' => 'Token Listrik Pos Satpam',
                'nominal' => 250000,
                'tanggal_pengeluaran' => $tanggal,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        $tidakRutinFormatted = collect($tidakRutin)->map(fn($item) => [
            'nama_pengeluaran' => $item['nama_pengeluaran'],
            'nominal' => $item['nominal'],
            'tanggal_pengeluaran' => $item['tanggal'],
            'created_at' => now(),
            'updated_at' => now(),
        ])->toArray();

        DB::table('expenses')->insert(array_merge($rutin, $tidakRutinFormatted));
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Expenses;
use App\Models\Payments;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ReportController extends Controller
{
    public function monthlySummary(Request $request)
    {
        $year = $request->input('year', now()->year);

        $pemasukan = Payments::selectRaw('MONTH(tanggal_bayar) as bulan, SUM(nominal) as total')
            ->whereYear('tanggal_bayar', $year)
            ->groupByRaw('MONTH(tanggal_bayar)')
            ->pluck('total', 'bulan');

        $pengeluaran = Expenses::selectRaw('MONTH(tanggal_pengeluaran) as bulan, SUM(nominal) as total')
            ->whereYear('tanggal_pengeluaran', $year)
            ->groupByRaw('MONTH(tanggal_pengeluaran)')
            ->pluck('total', 'bulan');

        $data = [];
        for ($i = 1; $i <= 12; $i++) {
            $masuk = $pemasukan[$i] ?? 0;
            $keluar = $pengeluaran[$i] ?? 0;
            $saldo = $masuk - $keluar;

            $data[] = [
                'bulan' => $i,
                'pemasukan' => $masuk,
                'pengeluaran' => $keluar,
                'saldo' => $saldo,
            ];
        }

        return response()->json($data);
    }

    public function monthlyDetail(Request $request)
    {
        $bulan = $request->bulan ?? now()->format('Y-m'); // format '2025-04'
        $date = Carbon::createFromFormat('Y-m', $bulan);

        $pemasukan = Payments::with(['resident'])->whereMonth('tanggal_bayar', $date->month)
            ->whereYear('tanggal_bayar', $date->year)
            ->get();

        $pengeluaran = Expenses::whereMonth('tanggal_pengeluaran', $date->month)
            ->whereYear('tanggal_pengeluaran', $date->year)
            ->get();

        return response()->json([
            'bulan'       => $bulan,
            'pemasukan'   => $pemasukan,
            'pengeluaran' => $pengeluaran,
            'total_pemasukan' => $pemasukan->sum('nominal'),
            'total_pengeluaran' => $pengeluaran->sum('nominal'),
            'saldo' => $pemasukan->sum('nominal') - $pengeluaran->sum('nominal'),
        ]);
    }
}

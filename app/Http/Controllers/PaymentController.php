<?php

namespace App\Http\Controllers;

use App\Models\Payments;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $payments = Payments::with(['resident', 'house'])
            ->get()
            ->groupBy('resident_id')
            ->map(function ($items) {
                $resident   = $items->first()->resident;
                $house      = $items->first()->house;
                $total      = $items->sum('nominal');

                return [
                    'resident_id'   => $resident->id,
                    'nama_lengkap'  => $resident->nama_lengkap,
                    'nomor_rumah'   => $house->nomor_rumah,
                    'total'         => $total,
                    'payments'      => $items,
                ];
            })->values();

        return response()->json($payments);
    }

    public function store(Request $request)
    {
        $request->validate([
            'resident_id'      => 'required|exists:residents,id',
            'house_id'         => 'required|exists:houses,id',
            'jenis_iuran'      => 'required|in:Satpam,Kebersihan',
            'tipe_pembayaran'  => 'required|in:Bulanan,Tahunan',
            'periode'          => 'required',
            'tanggal_bayar'    => 'required|date',
        ]);

        try {
            $tipe  = $request->tipe_pembayaran;
            $jenis = $request->jenis_iuran;

            if ($tipe === 'Bulanan') {
                $periode = Carbon::createFromFormat('Y-m', $request->periode)->startOfMonth();

                $exists = Payments::where('resident_id', $request->resident_id)
                    ->where('jenis_iuran', $jenis)
                    ->whereMonth('periode_awal', $periode->month)
                    ->whereYear('periode_awal', $periode->year)
                    ->exists();

                if ($exists) {
                    return response()->json([
                        'message' => "Sudah membayar iuran $jenis untuk bulan tersebut.",
                    ], 422);
                }

                $nominal = $jenis === 'Satpam' ? 100000 : 15000;

                $payment = Payments::create([
                    'resident_id'      => $request->resident_id,
                    'house_id'         => $request->house_id,
                    'jenis_iuran'      => $jenis,
                    'tipe_pembayaran'  => 'Bulanan',
                    'periode_awal'     => $periode,
                    'periode_akhir'    => $periode,
                    'jumlah_bulan'     => 1,
                    'nominal'          => $nominal,
                    'tanggal_bayar'    => Carbon::parse($request->tanggal_bayar),
                ]);

                return response()->json(['message' => 'Pembayaran bulanan berhasil.', 'data' => $payment]);
            }

            // Pembayaran Tahunan
            $tahun = (int) $request->periode;
            $startOfYear = Carbon::createFromDate($tahun, 1, 1);
            $endOfYear = Carbon::createFromDate($tahun, 12, 31);

            $existingPayments = Payments::where('resident_id', $request->resident_id)
                ->where('jenis_iuran', $jenis)
                ->where(function ($q) use ($startOfYear, $endOfYear) {
                    $q->whereBetween('periode_awal', [$startOfYear, $endOfYear])
                      ->orWhereBetween('periode_akhir', [$startOfYear, $endOfYear]);
                })
                ->get();

            $paidMonths = collect();
            foreach ($existingPayments as $payment) {
                $current = Carbon::parse($payment->periode_awal);
                $end = Carbon::parse($payment->periode_akhir);
                while ($current <= $end) {
                    $paidMonths->push($current->month);
                    $current->addMonth();
                }
            }
            $paidMonths = $paidMonths->unique();

            if ($paidMonths->count() >= 12) {
                return response()->json([
                    'message' => 'Tahun yang dimasukkan tidak valid karena sudah lunas semua bulan dalam tahun tersebut.'
                ], 422);
            }

            $startMonth = null;
            for ($i = 1; $i <= 12; $i++) {
                if (!$paidMonths->contains($i)) {
                    $startMonth = Carbon::createFromDate($tahun, $i, 1);
                    break;
                }
            }

            if (!$startMonth) {
                return response()->json([
                    'message' => 'Tidak ada bulan yang bisa dibayar di tahun ini.'
                ], 422);
            }

            $sisaBulan = 0;
            $bulanAwal = null;
            $bulanAkhir = null;

            for ($i = $startMonth->month; $i <= 12; $i++) {
                if (!$paidMonths->contains($i)) {
                    $sisaBulan++;
                    if (!$bulanAwal) {
                        $bulanAwal = Carbon::createFromDate($tahun, $i, 1);
                    }
                    $bulanAkhir = Carbon::createFromDate($tahun, $i, 1);
                }
            }

            $nominalPerBulan = $jenis === 'Kebersihan' ? 15000 : 100000;
            $total = $sisaBulan * $nominalPerBulan;

            $payment = Payments::create([
                'resident_id'       => $request->resident_id,
                'house_id'          => $request->house_id,
                'jenis_iuran'       => $jenis,
                'tipe_pembayaran'   => 'Tahunan',
                'periode_awal'      => $bulanAwal,
                'periode_akhir'     => $bulanAkhir,
                'jumlah_bulan'      => $sisaBulan,
                'nominal'           => $total,
                'tanggal_bayar'     => Carbon::parse($request->tanggal_bayar),
            ]);

            return response()->json([
                'message' => "Pembayaran tahunan berhasil untuk sisa $sisaBulan bulan.",
                'data'    => $payment,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat menyimpan pembayaran.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function previewTahunan(Request $request)
    {
        $resident_id = $request->resident_id;
        $tahun       = (int) $request->tahun;
        $jenis       = $request->jenis_iuran;

        $startOfYear = Carbon::createFromDate($tahun, 1, 1);
        $endOfYear   = Carbon::createFromDate($tahun, 12, 31);

        $payments = Payments::where('resident_id', $resident_id)
            ->where('jenis_iuran', $jenis)
            ->where(function ($q) use ($startOfYear, $endOfYear) {
                $q->whereBetween('periode_awal', [$startOfYear, $endOfYear])
                  ->orWhereBetween('periode_akhir', [$startOfYear, $endOfYear]);
            })
            ->get();

        $paidMonths = collect();

        foreach ($payments as $p) {
            $start  = Carbon::parse($p->periode_awal);
            $end    = Carbon::parse($p->periode_akhir);
            while ($start <= $end) {
                $paidMonths->push($start->month);
                $start->addMonth();
            } 
        }

        $paidMonths = $paidMonths->unique()->sort();

        if ($paidMonths->count() >= 12) {
            return response()->json([
                'message' => 'Tahun yang dimasukkan tidak valid karena sudah lunas semua bulan dalam tahun tersebut.'
            ], 422);
        }

        $startMonth = null;
        for ($i = 1; $i <= 12; $i++) {
            if (!$paidMonths->contains($i)) {
                $startMonth = Carbon::createFromDate($tahun, $i, 1);
                break;
            }
        }

        $sisaBulan = 0;
        $bulanAwal = null;
        $bulanAkhir = null;

        for ($i = $startMonth->month; $i <= 12; $i++) {
            if (!$paidMonths->contains($i)) {
                $sisaBulan++;
                if (!$bulanAwal) {
                    $bulanAwal = Carbon::createFromDate($tahun, $i, 1);
                }
                $bulanAkhir = Carbon::createFromDate($tahun, $i, 1);
            }
        }

        $nominalPerBulan = $jenis === 'Kebersihan' ? 15000 : 100000;
        $total = $sisaBulan * $nominalPerBulan;

        return response()->json([
            'periode_awal'  => $bulanAwal->format('Y-m'),
            'periode_akhir' => $bulanAkhir->format('Y-m'),
            'jumlah_bulan'  => $sisaBulan,
            'nominal'       => $total,
        ]);
    }
}

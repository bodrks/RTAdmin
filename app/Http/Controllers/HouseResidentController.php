<?php

namespace App\Http\Controllers;

use App\Models\HouseResident;
use Illuminate\Http\Request;

class HouseResidentController extends Controller
{
    public function assign(Request $request)
    {
        $request->validate([
            'house_id' => 'required|exists:houses,id',
            'resident_id' => 'required|exists:residents,id',
            'tanggal_mulai' => 'required|date',
        ]);

        $sameHouse = HouseResident::where('house_id', $request->house_id)
            ->where('resident_id', $request->resident_id)
            ->whereNull('tanggal_selesai')
            ->exists();
        if ($sameHouse) {
            return response()->json(['message' => 'Penghuni sudah ada di rumah ini'], 422);
        }
        $existing = HouseResident::where('resident_id', $request->resident_id)->whereNull('tanggal_selesai')->exists();

        if ($existing) {
            return response()->json(['message' => 'Penghuni masih aktif di rumah lain'], 422);
        }

        HouseResident::where('house_id', $request->house_id)
            ->whereNull('tanggal_selesai')
            ->update(['tanggal_selesai' => now()]);

        $assigned = HouseResident::create([
            'house_id' => $request->house_id,
            'resident_id' => $request->resident_id,
            'tanggal_mulai' => $request->tanggal_mulai,
        ]);

        return response()->json([
            'message' => 'Berhasil menetapkan penghuni',
            'assigned' => $assigned,
        ], 201);
    }

    public function leave($houseId)
    {
        $active = HouseResident::where('house_id', $houseId)
            ->whereNull('tanggal_selesai')
            ->latest('tanggal_mulai')
            ->first();

        if (!$active) {
            return response()->json(['message' => 'Tidak ada penghuni aktif di rumah ini'], 404);
        }

        try {
            $active->update(['tanggal_selesai' => now()]);

            return response()->json([
                'message' => 'Berhasil mengeluarkan penghuni',
                'resident' => $active,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal mengeluarkan penghuni'], 500);
        }
    }
}

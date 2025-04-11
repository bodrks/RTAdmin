<?php

namespace App\Http\Controllers;

use App\Models\Payments;
use Illuminate\Http\Request;
use App\Models\Resident;
use App\Models\Residents;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ResidentController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'nama_lengkap'      => 'required|string|max:255',
            'status'            => 'required|in:Tetap,Kontrak',
            'nomor_telepon'     => 'nullable|string|max:20',
            'status_pernikahan' => 'required|in:Menikah,Belum Menikah',
            'foto_ktp'          => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $fotoPath = null;

        if ($request->hasFile('foto_ktp')) {
            $fotoPath = $request->file('foto_ktp')->store('foto_ktp', 'public');
        }

        $resident = Residents::create([
            'nama_lengkap'      => $request->input('nama_lengkap'),
            'status'            => $request->input('status'),
            'nomor_telepon'     => $request->input('nomor_telepon'),
            'status_pernikahan' => $request->input('status_pernikahan'),
            'foto_ktp'          => $fotoPath,  
        ]);

        return response()->json([
            'message' => 'Resident created successfully',
            'resident' => $resident,
        ], 201);
    }

    public function index()
    {
        return Residents::select('id', 'nama_lengkap', 'status', 'nomor_telepon', 'status_pernikahan', 'foto_ktp')
            ->orderBy('created_at', 'asc')
            ->get();
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nama_lengkap'      => 'required|string|max:255',
            'status'            => 'required|in:Tetap,Kontrak',
            'nomor_telepon'     => 'nullable|string|max:20',
            'status_pernikahan' => 'required|in:Menikah,Belum Menikah',
            'foto_ktp'          => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $resident = Residents::findOrFail($id);
        $fotoPath = $resident->foto_ktp;
        if ($request->hasFile('foto_ktp')) {
            // Delete the old photo if it exists
            if ($fotoPath) {
                Storage::disk('public')->delete($fotoPath);
            }
            $fotoPath = $request->file('foto_ktp')->store('foto_ktp', 'public');
        }
        $resident->update([
            'nama_lengkap'      => $request->input('nama_lengkap'),
            'status'            => $request->input('status'),
            'nomor_telepon'     => $request->input('nomor_telepon'),
            'status_pernikahan' => $request->input('status_pernikahan'),
            'foto_ktp'          => $fotoPath,
        ]);
        return response()->json([
            'message' => 'Resident updated successfully',
            'resident' => $resident,
        ], 201);
    }

    public function destroy($id)
    {
        $resident = Residents::findOrFail($id);
        if ($resident->foto_ktp) {
            Storage::disk('public')->delete($resident->foto_ktp);
        }
        $resident->delete();
        return response()->json([
            'message' => 'Resident deleted successfully',
        ], 200);
    }

    public function getAvailableResidents($houseId)
    {
        $residents = Residents::whereDoesntHave('houseResidents', function ($query) use ($houseId) {
            $query->whereNull('tanggal_selesai')->where('house_id', '!=', $houseId);
        })->get();

        return response()->json($residents);
    }

    public function withHouse()
    {
        $residents = Residents::with(['houseResidents' => function ($q) {
            $q->whereNull('tanggal_selesai');
        }, 'houseResidents.house'])->get();

        return $residents->map(function ($r) {
            return [
                'id' => $r->id,
                'nama_lengkap' => $r->nama_lengkap,
                'house_id' => optional($r->houseResidents()->first())->house_id,
                'house' => optional($r->houseResidents()->first())->house,
            ];
        });
    }

    public function getPaymentStatus($residentId)
    {
        $resident = Residents::findOrFail($residentId);

        $start = now()->startOfYear();
        $end = now();

        $months = [];
        while ($start <= $end) {
            $months[] = $start->format('Y-m');
            $start->addMonth();
        }

        $paidMonths = Payments::where('resident_id', $residentId)
            ->pluck('bulan')
            ->map(fn($b) => \Carbon\Carbon::parse($b)->format('Y-m'))
            ->toArray();

        $unpaidMonths = array_diff($months, $paidMonths);

        return response()->json([
            'resident'  => $resident->nama_lengkap,
            'lunas'     => $paidMonths,
            'tunggakan' => array_values($unpaidMonths),
        ]);
    }
}

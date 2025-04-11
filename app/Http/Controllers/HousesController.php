<?php

namespace App\Http\Controllers;

use App\Models\HouseResident;
use App\Models\Houses;
use Illuminate\Http\Request;

class HousesController extends Controller
{
    public function index()
    {
        return Houses::with('currentResident.resident')
            ->orderBy('nomor_rumah', 'asc')
            ->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'nomor_rumah' => 'required|string|max:255',
            'status_penghuni' => 'required|in:Dihuni,Tidak dihuni',
        ]);

        $house = Houses::create([
            'nomor_rumah' => $request->input('nomor_rumah'),
            'status_penghuni' => $request->input('status_penghuni'),
        ]);

        return response()->json([
            'message' => 'House created successfully',
            'house' => $house,
        ], 201);
    }

    public function history($id)
    {
        $history = HouseResident::with('resident')
            ->where('house_id', $id)
            ->orderBy('tanggal_mulai', 'asc')
            ->get();

        return response()->json($history);
    }
}

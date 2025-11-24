<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Flight;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;

class FlightController extends Controller
{
    public function store(Request $request)
    {
        return DB::transaction(function () use ($request) {
            $flight = Flight::create([
                'uuid'           => Str::uuid(),
                'customer_id'    => auth()->id(),
                'from_airport'   => strtoupper($request->from_airport),
                'to_airport'     => strtoupper($request->to_airport),
                'flight_date'    => $request->flight_date,
                'airline'        => $request->airline,
                'flight_number'  => strtoupper($request->flight_number),
                'max_weight'     => $request->max_weight,
                'booked_weight'  => 0.00,
                'note'           => $request->note,
                'verified'       => false,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Đăng chuyến bay thành công!',
                'data'    => $flight,
            ], 201);
        });
    }

    public function show($id)
    {
        $flight = Flight::where('customer_id', Auth::id())
            ->where('id', $id)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data'    => $flight
        ]);
    }
}

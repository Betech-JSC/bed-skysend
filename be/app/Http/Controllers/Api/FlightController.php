<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFlightRequest;
use App\Jobs\ProcessBoardingPassVerification;
use App\Models\Flight;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class FlightController extends Controller
{
    public function store(StoreFlightRequest $request)
    {
        return 1;
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

            // Xử lý upload nhiều ảnh vé
            foreach ($request->file('boarding_passes') as $index => $file) {
                $path = $file->store("flights/{$flight->uuid}", 'public');
                $url = storage_url($path);

                $flight->attachments()->create([
                    'uuid'        => Str::uuid(),
                    'type'        => in_array($file->extension(), ['jpg', 'jpeg', 'png']) ? 'image' : 'document',
                    'file_name'   => $file->getClientOriginalName(),
                    'file_path'   => $path,
                    'url'         => $url,
                    'file_size'   => $file->getSize(),
                    'mime_type'   => $file->getMimeType(),
                    'order'       => $index,
                    'uploaded_by' => auth()->id(),
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Đăng chuyến bay thành công!',
                'data'    => $flight->load('attachments')
            ], 201);
        });
    }
}

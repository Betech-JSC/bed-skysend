<?php

namespace App\Services;

use App\Models\Flight;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class FlightTrackingService
{
    protected const OPENSKY_API_BASE = 'https://opensky-network.org/api';
    protected const CACHE_TTL = 60; // Cache for 60 seconds

    /**
     * Fetch flight data from OpenSky Network API
     * 
     * @param string $flightNumber Flight number (e.g., "VN1234")
     * @param string $date Flight date (Y-m-d format)
     * @return array|null Flight tracking data or null if not found
     */
    public function fetchFlightData(string $flightNumber, string $date): ?array
    {
        try {
            // OpenSky Network API requires callsign format
            // For commercial flights, callsign is usually the airline code + flight number
            // Example: VN1234 -> VNA1234 or VN1234
            $callsign = $this->normalizeCallsign($flightNumber);
            
            // Get all aircraft states
            $response = Http::timeout(10)->get(self::OPENSKY_API_BASE . '/states/all');
            
            if (!$response->successful()) {
                Log::warning('OpenSky API request failed', [
                    'status' => $response->status(),
                    'flight_number' => $flightNumber,
                ]);
                return null;
            }

            $states = $response->json('states');
            
            if (!$states || !is_array($states)) {
                Log::info('No flight states found in OpenSky response', [
                    'flight_number' => $flightNumber,
                ]);
                return null;
            }

            // Find matching flight by callsign
            foreach ($states as $state) {
                if (!$state || !is_array($state) || count($state) < 17) {
                    continue;
                }

                // OpenSky state array structure:
                // [0] = icao24, [1] = callsign, [2] = origin_country, [3] = time_position,
                // [4] = last_contact, [5] = longitude, [6] = latitude, [7] = baro_altitude,
                // [8] = on_ground, [9] = velocity, [10] = true_track, [11] = vertical_rate,
                // [12] = sensors, [13] = geo_altitude, [14] = squawk, [15] = spi, [16] = position_source
                
                $stateCallsign = trim($state[1] ?? '');
                
                if (empty($stateCallsign)) {
                    continue;
                }

                // Match callsign (case-insensitive, partial match)
                if (stripos($stateCallsign, $callsign) !== false || 
                    stripos($stateCallsign, $flightNumber) !== false) {
                    
                    return $this->parseStateData($state);
                }
            }

            Log::info('Flight not found in OpenSky data', [
                'flight_number' => $flightNumber,
                'callsign' => $callsign,
            ]);

            return null;

        } catch (\Exception $e) {
            Log::error('Error fetching flight data from OpenSky', [
                'flight_number' => $flightNumber,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Normalize flight number to callsign format
     * 
     * @param string $flightNumber
     * @return string
     */
    protected function normalizeCallsign(string $flightNumber): string
    {
        // Remove spaces and convert to uppercase
        $callsign = strtoupper(trim($flightNumber));
        
        // Common airline code mappings
        $airlineMappings = [
            'VN' => 'VNA', // Vietnam Airlines
            'VJ' => 'VJC', // Vietjet Air
            'QH' => 'BAV', // Bamboo Airways
            'BL' => 'PVT', // Pacific Airlines
        ];

        // Extract airline code (first 2 characters)
        $airlineCode = substr($callsign, 0, 2);
        
        if (isset($airlineMappings[$airlineCode])) {
            $callsign = $airlineMappings[$airlineCode] . substr($callsign, 2);
        }

        return $callsign;
    }

    /**
     * Parse OpenSky state array to structured data
     * 
     * @param array $state
     * @return array
     */
    protected function parseStateData(array $state): array
    {
        return [
            'icao24' => $state[0] ?? null,
            'callsign' => trim($state[1] ?? ''),
            'origin_country' => $state[2] ?? null,
            'latitude' => $state[6] ?? null,
            'longitude' => $state[5] ?? null,
            'baro_altitude' => $state[7] ?? null, // meters
            'geo_altitude' => $state[13] ?? null, // meters
            'velocity' => $state[9] ?? null, // m/s
            'heading' => $state[10] ?? null, // degrees
            'vertical_rate' => $state[11] ?? null, // m/s
            'on_ground' => $state[8] ?? false,
            'last_contact' => $state[4] ?? null,
            'time_position' => $state[3] ?? null,
        ];
    }

    /**
     * Update flight position in database
     * 
     * @param Flight $flight
     * @param array $positionData
     * @return bool
     */
    public function updateFlightPosition(Flight $flight, array $positionData): bool
    {
        try {
            $updateData = [
                'last_tracking_update_at' => now(),
            ];

            if (isset($positionData['latitude']) && $positionData['latitude'] !== null) {
                $updateData['current_latitude'] = $positionData['latitude'];
            }

            if (isset($positionData['longitude']) && $positionData['longitude'] !== null) {
                $updateData['current_longitude'] = $positionData['longitude'];
            }

            if (isset($positionData['baro_altitude']) || isset($positionData['geo_altitude'])) {
                // Convert meters to feet
                $altitudeMeters = $positionData['geo_altitude'] ?? $positionData['baro_altitude'] ?? null;
                if ($altitudeMeters !== null) {
                    $updateData['current_altitude'] = (int)($altitudeMeters * 3.28084); // meters to feet
                }
            }

            // Auto-update tracking_status based on position
            if (isset($positionData['on_ground'])) {
                if ($positionData['on_ground'] && $flight->tracking_status === 'in_flight') {
                    // Aircraft is on ground but was in flight - might be landing
                    if (!$flight->landed_at) {
                        $updateData['tracking_status'] = 'landed';
                        $updateData['landed_at'] = now();
                    }
                } elseif (!$positionData['on_ground'] && in_array($flight->tracking_status, ['scheduled', 'boarding', 'departed'])) {
                    // Aircraft is in the air
                    $updateData['tracking_status'] = 'in_flight';
                }
            }

            return $flight->update($updateData);

        } catch (\Exception $e) {
            Log::error('Error updating flight position', [
                'flight_id' => $flight->id,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Push tracking update to Firebase Realtime Database
     * 
     * @param Flight $flight
     * @param FirebaseService $firebaseService
     * @return bool
     */
    public function pushTrackingUpdateToFirebase(Flight $flight, FirebaseService $firebaseService): bool
    {
        try {
            if (!$flight->current_latitude || !$flight->current_longitude) {
                return false;
            }

            $trackingData = [
                'latitude' => (float)$flight->current_latitude,
                'longitude' => (float)$flight->current_longitude,
                'altitude' => $flight->current_altitude ? (int)$flight->current_altitude : null,
                'status' => $flight->tracking_status,
                'timestamp' => now()->timestamp,
                'last_updated' => $flight->last_tracking_update_at ? $flight->last_tracking_update_at->timestamp : now()->timestamp,
            ];

            // Calculate speed if we have velocity (convert m/s to km/h)
            // This would need to be passed from the position data
            // For now, we'll leave it null

            return $firebaseService->set("flight_tracking/{$flight->id}", $trackingData);

        } catch (\Exception $e) {
            Log::error('Error pushing tracking update to Firebase', [
                'flight_id' => $flight->id,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Get airport coordinates by IATA code
     * Common airports for Vietnam
     * 
     * @param string $iataCode
     * @return array|null [latitude, longitude]
     */
    public function getAirportCoordinates(string $iataCode): ?array
    {
        $airports = [
            'SGN' => [10.8188, 106.6520], // Ho Chi Minh City
            'HAN' => [21.2211, 105.8072], // Hanoi
            'DAD' => [16.0439, 108.1994], // Da Nang
            'HPH' => [20.8194, 106.7250], // Hai Phong
            'VCA' => [10.0850, 105.7119], // Can Tho
            'CXR' => [12.2275, 109.1922], // Nha Trang
            'PQC' => [10.2270, 103.9672], // Phu Quoc
            'DLI' => [11.7500, 108.3667], // Da Lat
            'HUI' => [16.4019, 107.7025], // Hue
        ];

        return $airports[strtoupper($iataCode)] ?? null;
    }
}



import api from '@/api/api';

export interface FlightTrackingData {
  flight: {
    id: number;
    flight_number: string;
    from_airport: string;
    to_airport: string;
    tracking_status: 'scheduled' | 'boarding' | 'departed' | 'in_flight' | 'landed' | 'arrived';
    departed_at?: string;
    landed_at?: string;
    estimated_arrival_at?: string;
  };
  current_position: {
    latitude: number | null;
    longitude: number | null;
    altitude: number | null;
  };
  airports: {
    from: {
      code: string;
      latitude: number | null;
      longitude: number | null;
    };
    to: {
      code: string;
      latitude: number | null;
      longitude: number | null;
    };
  };
  realtime_data: {
    latitude?: number;
    longitude?: number;
    baro_altitude?: number;
    geo_altitude?: number;
    velocity?: number;
    heading?: number;
    on_ground?: boolean;
  } | null;
  last_updated?: string;
}

/**
 * Fetch flight tracking data from backend
 * Backend will fetch from OpenSky Network API if needed
 */
export const fetchFlightTracking = async (flightId: number | string): Promise<FlightTrackingData | null> => {
  try {
    const response = await api.get(`/flights/${flightId}/tracking`);
    return response.data?.data || null;
  } catch (error: any) {
    console.error('Error fetching flight tracking:', error);
    return null;
  }
};

/**
 * Update flight tracking status (departed/landed)
 * Customer manually confirms when flight takes off or lands
 */
export const updateFlightTrackingStatus = async (
  flightId: number | string,
  status: 'departed' | 'landed'
): Promise<boolean> => {
  try {
    const response = await api.post(`/flights/${flightId}/update-tracking-status`, {
      status,
    });
    return response.data?.success || false;
  } catch (error: any) {
    console.error('Error updating flight tracking status:', error);
    return false;
  }
};



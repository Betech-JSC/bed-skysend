import { useState, useEffect, useRef } from 'react';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import { app } from '@/firebaseConfig';
import { fetchFlightTracking, FlightTrackingData } from '@/services/flightTrackingApi';

interface UseFlightTrackingOptions {
  flightId: number | string;
  autoFetch?: boolean; // Auto fetch from API on mount
  refreshInterval?: number; // Auto refresh interval in seconds (0 = disabled)
}

export function useFlightTracking({ 
  flightId, 
  autoFetch = true,
  refreshInterval = 0 
}: UseFlightTrackingOptions) {
  const [trackingData, setTrackingData] = useState<FlightTrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const db = getDatabase(app);
  const listenerRef = useRef<(() => void) | null>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch initial data from API
  useEffect(() => {
    if (!flightId || !autoFetch) {
      setLoading(false);
      return;
    }

    const loadTrackingData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchFlightTracking(flightId);
        if (data) {
          setTrackingData(data);
        }
      } catch (err: any) {
        console.error('Error loading flight tracking:', err);
        setError(err?.message || 'Không thể tải dữ liệu tracking');
      } finally {
        setLoading(false);
      }
    };

    loadTrackingData();
  }, [flightId, autoFetch]);

  // Listen to Firebase Realtime Database
  useEffect(() => {
    if (!flightId) {
      return;
    }

    const trackingRef = ref(db, `flight_tracking/${flightId}`);

    const unsubscribe = onValue(
      trackingRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          // Merge Firebase data with existing tracking data
          setTrackingData((prev) => {
            if (!prev) {
              // If no previous data, we need to fetch from API first
              return null;
            }

            return {
              ...prev,
              current_position: {
                latitude: data.latitude ?? prev.current_position.latitude,
                longitude: data.longitude ?? prev.current_position.longitude,
                altitude: data.altitude ?? prev.current_position.altitude,
              },
              flight: {
                ...prev.flight,
                tracking_status: data.status || prev.flight.tracking_status,
              },
              last_updated: data.last_updated 
                ? new Date(data.last_updated * 1000).toISOString() 
                : prev.last_updated,
            };
          });
        }
      },
      (err) => {
        console.error('Error listening to flight tracking:', err);
        setError('Lỗi kết nối realtime tracking');
      }
    );

    listenerRef.current = () => {
      off(trackingRef);
    };

    return () => {
      if (listenerRef.current) {
        listenerRef.current();
      }
    };
  }, [flightId, db]);

  // Auto refresh from API
  useEffect(() => {
    if (!flightId || refreshInterval <= 0) {
      return;
    }

    const interval = refreshInterval * 1000;
    refreshTimerRef.current = setInterval(async () => {
      try {
        const data = await fetchFlightTracking(flightId);
        if (data) {
          setTrackingData(data);
        }
      } catch (err) {
        console.error('Error refreshing flight tracking:', err);
      }
    }, interval);

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [flightId, refreshInterval]);

  // Manual refresh function
  const refresh = async () => {
    if (!flightId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await fetchFlightTracking(flightId);
      if (data) {
        setTrackingData(data);
      }
    } catch (err: any) {
      console.error('Error refreshing flight tracking:', err);
      setError(err?.message || 'Không thể làm mới dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  return {
    trackingData,
    loading,
    error,
    refresh,
  };
}



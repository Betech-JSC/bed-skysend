import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import api from "@/api/api";
import { useFocusEffect } from "expo-router";

/**
 * Hook để đếm số private-requests pending liên quan đến chuyến bay
 * - Cho customer: Đếm requests pending trên các chuyến bay của họ
 * - Cho sender: Đếm requests pending có thể match (không có flight_id)
 */
export function useNewFlightRequestsCount(): number {
    const user = useSelector((state: RootState) => state.user);
    const [count, setCount] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isMountedRef = useRef(true);

    const fetchCount = useCallback(async () => {
        if (!user?.id || !user?.token || !user?.role || !isMountedRef.current) {
            if (isMountedRef.current) {
                setCount(0);
            }
            return;
        }

        try {
            const response = await api.get('/private-requests?status=pending');
            let requestsData = [];

            if (response.data?.data) {
                // Handle paginated response
                if (response.data.data?.data) {
                    requestsData = response.data.data.data;
                } else if (Array.isArray(response.data.data)) {
                    requestsData = response.data.data;
                }
            } else if (Array.isArray(response.data)) {
                requestsData = response.data;
            }

            let filteredRequests: any[] = [];

            if (user.role === 'customer') {
                // Cho customer: Lấy danh sách chuyến bay của họ trước
                try {
                    const flightsResponse = await api.get('flights/');
                    let flightsData = [];

                    let data = flightsResponse.data;
                    // Xử lý response structure
                    if (data?.data) data = data.data;
                    if (data?.flights) data = data.flights;

                    if (Array.isArray(data)) {
                        flightsData = data;
                    }

                    const flightIds = flightsData.map((flight: any) => flight.id);

                    // Filter requests có flight_id thuộc về các chuyến bay của customer
                    filteredRequests = requestsData.filter((req: any) =>
                        req.flight_id && flightIds.includes(req.flight_id) && req.status === 'pending'
                    );
                } catch (flightErr: any) {
                    if (flightErr.response?.status !== 401 && isMountedRef.current) {
                        console.error("Error fetching flights for request count:", flightErr);
                    }
                    filteredRequests = [];
                }
            } else if (user.role === 'sender') {
                // Cho sender: Filter requests không có flight_id (chờ match)
                filteredRequests = requestsData.filter((req: any) =>
                    !req.flight_id && req.status === 'pending'
                );
            }

            if (isMountedRef.current) {
                setCount(filteredRequests.length);
            }
        } catch (err: any) {
            // Nếu là 401 (unauthorized), user đã logout - không cần xử lý
            if (err.response?.status === 401) {
                if (isMountedRef.current) {
                    setCount(0);
                }
                return;
            }
            // Log các lỗi khác nhưng không throw
            if (isMountedRef.current) {
                console.error("Error fetching new flight requests count:", err);
                setCount(0);
            }
        }
    }, [user?.id, user?.token, user?.role]);

    useEffect(() => {
        isMountedRef.current = true;
        fetchCount();

        // Setup polling mỗi 30 giây để cập nhật realtime
        intervalRef.current = setInterval(() => {
            if (isMountedRef.current) {
                fetchCount();
            }
        }, 30000);

        return () => {
            isMountedRef.current = false;
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [fetchCount]);

    // Refresh khi focus vào màn hình
    useFocusEffect(
        useCallback(() => {
            if (isMountedRef.current) {
                fetchCount();
            }
        }, [fetchCount])
    );

    return count;
}


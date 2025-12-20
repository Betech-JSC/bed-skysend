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
    const lastFetchRef = useRef<number>(0);
    const retryCountRef = useRef<number>(0);
    const cacheRef = useRef<{ data: number; timestamp: number } | null>(null);
    const CACHE_DURATION = 30000; // Cache 30 giây
    const MIN_FETCH_INTERVAL = 60000; // Tối thiểu 60 giây giữa các lần fetch

    const fetchCount = useCallback(async (force = false) => {
        if (!user?.id || !user?.token || !user?.role || !isMountedRef.current) {
            if (isMountedRef.current) {
                setCount(0);
            }
            return;
        }

        const now = Date.now();
        
        // Kiểm tra cache và rate limiting
        if (!force) {
            // Sử dụng cache nếu còn hiệu lực
            if (cacheRef.current && (now - cacheRef.current.timestamp) < CACHE_DURATION) {
                if (isMountedRef.current) {
                    setCount(cacheRef.current.data);
                }
                return;
            }

            // Rate limiting: không fetch quá thường xuyên
            if (lastFetchRef.current && (now - lastFetchRef.current) < MIN_FETCH_INTERVAL) {
                return;
            }
        }

        lastFetchRef.current = now;

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
                    
                    // Reset retry count khi thành công
                    retryCountRef.current = 0;
                } catch (flightErr: any) {
                    // Xử lý lỗi 429 với exponential backoff
                    if (flightErr.response?.status === 429) {
                        retryCountRef.current += 1;
                        const backoffDelay = Math.min(1000 * Math.pow(2, retryCountRef.current), 60000); // Max 60s
                        
                        console.warn(`Rate limited (429). Retrying in ${backoffDelay}ms...`);
                        
                        setTimeout(() => {
                            if (isMountedRef.current) {
                                fetchCount(true); // Force retry
                            }
                        }, backoffDelay);
                        
                        return; // Không update count, sẽ retry sau
                    }
                    
                    if (flightErr.response?.status !== 401 && isMountedRef.current) {
                        console.error("Error fetching flights for request count:", flightErr);
                    }
                    filteredRequests = [];
                    retryCountRef.current = 0;
                }
            } else if (user.role === 'sender') {
                // Cho sender: Filter requests không có flight_id (chờ match)
                filteredRequests = requestsData.filter((req: any) =>
                    !req.flight_id && req.status === 'pending'
                );
                retryCountRef.current = 0;
            }

            const newCount = filteredRequests.length;
            
            // Update cache
            cacheRef.current = {
                data: newCount,
                timestamp: now
            };

            if (isMountedRef.current) {
                setCount(newCount);
            }
        } catch (err: any) {
            // Xử lý lỗi 429 với exponential backoff
            if (err.response?.status === 429) {
                retryCountRef.current += 1;
                const backoffDelay = Math.min(1000 * Math.pow(2, retryCountRef.current), 60000); // Max 60s
                
                console.warn(`Rate limited (429). Retrying in ${backoffDelay}ms...`);
                
                setTimeout(() => {
                    if (isMountedRef.current) {
                        fetchCount(true); // Force retry
                    }
                }, backoffDelay);
                
                return; // Không update count, sẽ retry sau
            }
            
            // Nếu là 401 (unauthorized), user đã logout - không cần xử lý
            if (err.response?.status === 401) {
                if (isMountedRef.current) {
                    setCount(0);
                }
                retryCountRef.current = 0;
                return;
            }
            
            // Log các lỗi khác nhưng không throw
            if (isMountedRef.current) {
                console.error("Error fetching new flight requests count:", err);
                setCount(0);
            }
            retryCountRef.current = 0;
        }
    }, [user?.id, user?.token, user?.role]);

    useEffect(() => {
        isMountedRef.current = true;
        fetchCount();

        // Setup polling mỗi 60 giây (tăng từ 30s để giảm rate limiting)
        intervalRef.current = setInterval(() => {
            if (isMountedRef.current) {
                fetchCount();
            }
        }, 60000); // 60 giây thay vì 30 giây

        return () => {
            isMountedRef.current = false;
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [fetchCount]);

    // Refresh khi focus vào màn hình (với debounce)
    useFocusEffect(
        useCallback(() => {
            if (isMountedRef.current) {
                // Chỉ fetch nếu cache đã hết hạn
                const now = Date.now();
                if (!cacheRef.current || (now - cacheRef.current.timestamp) >= CACHE_DURATION) {
                    fetchCount();
                }
            }
        }, [fetchCount])
    );

    return count;
}


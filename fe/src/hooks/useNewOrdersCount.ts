import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import api from "@/api/api";
import { normalizeOrderStatus } from "../../app/utils/orderStatusUtils";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

/**
 * Hook để đếm số orders với status pending/chưa xử lý (new)
 * Orders với status 'pending' hoặc 'confirmed' được coi là "đơn mới"
 */
export function useNewOrdersCount(): number {
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
        if (!user?.id || !user?.token || !isMountedRef.current) {
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
            const response = await api.get("orders/getList");

            let ordersData = [];
            if (response.data?.success) {
                ordersData = response.data.data?.data || response.data.data || [];
            } else if (Array.isArray(response.data)) {
                ordersData = response.data;
            }

            // Filter orders với status 'new' (pending hoặc confirmed)
            const newOrders = ordersData.filter((order: any) => {
                const normalized = normalizeOrderStatus(order.status);
                return normalized === 'new';
            });

            const newCount = newOrders.length;
            
            // Update cache
            cacheRef.current = {
                data: newCount,
                timestamp: now
            };

            // Reset retry count khi thành công
            retryCountRef.current = 0;

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
                console.error("Error fetching new orders count:", err);
                setCount(0);
            }
            retryCountRef.current = 0;
        }
    }, [user?.id, user?.token]);

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


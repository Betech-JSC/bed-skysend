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

    const fetchCount = useCallback(async () => {
        if (!user?.id || !user?.token || !isMountedRef.current) {
            if (isMountedRef.current) {
                setCount(0);
            }
            return;
        }

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

            if (isMountedRef.current) {
                setCount(newOrders.length);
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
                console.error("Error fetching new orders count:", err);
                setCount(0);
            }
        }
    }, [user?.id, user?.token]);

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


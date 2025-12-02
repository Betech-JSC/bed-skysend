import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { getDatabase, ref, get, onValue } from "firebase/database";
import { app } from "@/firebaseConfig";
import api from "@/api/api";

/**
 * Hook để lấy tổng số tin nhắn chưa đọc từ tất cả các chat
 */
export function useUnreadChatCount() {
    const user = useSelector((state: RootState) => state.user);
    const [unreadCount, setUnreadCount] = useState(0);
    const db = getDatabase(app);
    const listenersRef = useRef<(() => void)[]>([]);
    const chatUnreadMapRef = useRef<Map<string, number>>(new Map());

    useEffect(() => {
        if (!user?.id) {
            setUnreadCount(0);
            return;
        }

        let isMounted = true;

        const fetchAndListenUnreadCount = async () => {

        };

        // Gọi function async
        fetchAndListenUnreadCount().catch((error) => {
            console.error("Error in fetchAndListenUnreadCount:", error);
            if (isMounted) {
                setUnreadCount(0);
            }
        });

        return () => {
            isMounted = false;
            // Cleanup listeners
            listenersRef.current.forEach((unsubscribe) => {
                try {
                    unsubscribe();
                } catch (err) {
                    // Ignore cleanup errors
                }
            });
            listenersRef.current = [];
            chatUnreadMapRef.current.clear();
        };
    }, [user?.id, db]);

    return unreadCount;
}


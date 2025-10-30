// hooks/useOrderMatch.ts
import { useEffect } from "react";
import { Alert } from "react-native";
import Echo from "laravel-echo";
import Pusher from "pusher-js/react-native";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useRouter } from "expo-router";

// Khởi tạo Laravel Echo
let echo: Echo | null = null;

export default function useOrderMatch() {
    const user = useSelector((state: RootState) => state.user);
    const router = useRouter();

    useEffect(() => {
        if (!user || !user.token) return;

        // Nếu chưa khởi tạo Echo, khởi tạo
        if (!echo) {
            echo = new Echo({
                broadcaster: "pusher",
                key: "reverb",       // Reverb không cần key thực sự
                wsHost: "127.0.0.1", // Trùng với REVERB_HOST trong .env
                wsPort: 9000,        // Trùng với REVERB_PORT trong .env
                forceTLS: false,
                disableStats: true,
                client: Pusher,
                auth: {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                },
            });
        }

        // Subscribe kênh private của user
        const channel = echo.private(`user.${user.id}`);

        // Listen sự kiện OrderMatched từ BE
        channel.listen("OrderMatched", (event: any) => {
            Alert.alert(
                "Đơn hàng đã match!",
                "Bạn đã tìm thấy đối tác. Chuyển đến chat để trao đổi."
            );

            // Tạo chatId dựa trên hai đơn
            const chatId = `${event.orderA.id}-${event.orderB.id}`;
            router.push(`/chat/${chatId}`);
        });

        // Cleanup khi unmount
        return () => {
            channel.stopListening("OrderMatched");
        };
    }, [user]);
}

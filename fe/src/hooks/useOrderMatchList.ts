import { useEffect } from "react";
import { Alert, Platform } from "react-native";
import { getDatabase, ref, onValue } from "firebase/database";
import { app } from "@/firebaseConfig";
import api from "@/api/api";

const db = getDatabase(app);

export function useOrderMatchList(orderIds: string[], onConfirm: (chatId: string) => void) {
    useEffect(() => {
        if (!orderIds || orderIds.length === 0) return;

        const unsubscribes = orderIds.map(orderId => {
            const matchRef = ref(db, `matches/${orderId}`);
            return onValue(matchRef, snapshot => {
                const data = snapshot.val();
                if (data?.status === "pending_confirmation") {
                    // Hiển thị alert với 2 button
                    const message = `Đơn ${orderId} đã được ghép với đơn ${data.matched_order_id}`;
                    if (Platform.OS === "web") {
                        if (window.confirm(`${message}\nXác nhận?`)) {
                            confirmMatch(orderId);
                        } else {
                            rejectMatch(orderId);
                        }
                    } else {
                        Alert.alert(
                            "Đơn hàng đã được ghép",
                            message,
                            [
                                { text: "Từ chối", onPress: () => rejectMatch(orderId), style: "cancel" },
                                { text: "Xác nhận", onPress: () => confirmMatch(orderId) }
                            ]
                        );
                    }
                }
            });
        });

        return () => unsubscribes.forEach(unsub => unsub());
    }, [orderIds]);

    const confirmMatch = async (orderId: string) => {
        const res = await api.post("/orders/confirm-match", { orderId, action: "confirm" });
        if (res.data.chat_id) {
            onConfirm(res.data.chat_id);
        }
    };

    const rejectMatch = async (orderId: string) => {
        await api.post("/orders/confirm-match", { orderId, action: "reject" });
    };
}

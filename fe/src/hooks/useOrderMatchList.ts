import { useEffect, useRef } from "react";
import { Alert } from "react-native";
import { getDatabase, ref, onValue } from "firebase/database";
import { app } from "@/firebaseConfig";
import api from "@/api/api";

const db = getDatabase(app);

interface MatchData {
    status: string;
    matched_order_id: string;
    chat_id?: string | null;
}

export function useOrderMatchList(
    orderIds: string[],
    onConfirm: (chatId: string) => void,
    onReject?: (orderId: string) => void
) {
    const shownMatchesRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (!orderIds || orderIds.length === 0) return;

        const unsubscribes = orderIds.map(orderId => {
            const matchRef = ref(db, `matches/${orderId}`);
            return onValue(matchRef, snapshot => {
                const data: MatchData = snapshot.val();

                if (
                    data?.status === "pending_confirmation" &&
                    !shownMatchesRef.current.has(orderId)
                ) {
                    shownMatchesRef.current.add(orderId);

                    const message = `Đơn ${orderId} đã được ghép với đơn ${data.matched_order_id}`;

                    const confirmMatch = async () => {
                        try {
                            const res = await api.post("/orders/confirm-match", { orderId, action: "confirm" });
                            if (res.data.chat_id) {
                                onConfirm(res.data.chat_id);
                            }
                        } catch (err) {
                            console.error("Error confirming match", err);
                        }
                    };

                    const rejectMatch = async () => {
                        try {
                            await api.post("/orders/confirm-match", { orderId, action: "reject" });
                            if (onReject) onReject(orderId);
                            // Backend sẽ tự động match lại order khác → Firebase node cập nhật
                            // Loại bỏ khỏi shownMatches để có thể show alert match mới
                            shownMatchesRef.current.delete(orderId);
                        } catch (err) {
                            console.error("Error rejecting match", err);
                        }
                    };

                    Alert.alert(
                        "Đơn hàng đã được ghép",
                        message,
                        [
                            { text: "Từ chối", onPress: rejectMatch, style: "cancel" },
                            { text: "Xác nhận", onPress: confirmMatch }
                        ]
                    );
                }
            });
        });

        return () => unsubscribes.forEach(unsub => unsub());
    }, [orderIds]);
}

import React, { useEffect, useState, useRef } from "react";
import { View, FlatList, TextInput, Button, Text, KeyboardAvoidingView, Platform } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import api from "@/api/api";
import Echo from "laravel-echo";
import { useLocalSearchParams } from "expo-router";
import Pusher from "pusher-js/react-native";
// import Pusher from "pusher-js";

let echo: Echo | null = null;

export default function Chat() {
    const user = useSelector((state: RootState) => state.user);
    const { chat_id, sender_id, receiver_id } = useLocalSearchParams<{ chat_id: string; sender_id: string; receiver_id: string }>();

    const [messages, setMessages] = useState<{ sender_id: number; text: string; created_at: string }[]>([]);
    const [text, setText] = useState("");
    const flatListRef = useRef<FlatList>(null);

    // Khởi tạo Laravel Echo nếu chưa có
    useEffect(() => {
        if (!user || !chat_id) return;

        if (!echo) {
            echo = new Echo({
                broadcaster: "pusher",
                key: "reverb",          // Reverb không cần key thật
                wsHost: "127.0.0.1",
                wsPort: 9000,
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

        const channel = echo.private(`chat.${chat_id}`);

        channel.listen("ChatMessageSent", (event: any) => {
            setMessages((prev) => [...prev, event.message]);
            flatListRef.current?.scrollToEnd({ animated: true });
        });

        return () => {
            channel.stopListening("ChatMessageSent");
        };
    }, [user, chat_id]);

    // Gửi message qua API
    const handleSend = async () => {
        if (!text.trim()) return;

        try {
            const response = await api.post("/chat/send", { chat_id: chat_id, text });
            setMessages((prev) => [...prev, response.data.message]);
            setText("");
            flatListRef.current?.scrollToEnd({ animated: true });
        } catch (err) {
            console.log("Error sending message:", err);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, padding: 10 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View
                        style={{
                            alignSelf: item.sender_id === user.id ? "flex-end" : "flex-start",
                            backgroundColor: item.sender_id === user.id ? "#0f62fe" : "#e0e0e0",
                            padding: 10,
                            borderRadius: 8,
                            marginVertical: 2,
                        }}
                    >
                        <Text style={{ color: item.sender_id === user.id ? "white" : "black" }}>{item.text}</Text>
                        <Text style={{ fontSize: 10, color: "#555", alignSelf: "flex-end" }}>
                            {new Date(item.created_at).toLocaleTimeString()}
                        </Text>
                    </View>
                )}
            />

            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 5 }}>
                <TextInput
                    style={{
                        flex: 1,
                        borderWidth: 1,
                        borderColor: "#ccc",
                        borderRadius: 8,
                        paddingHorizontal: 10,
                        paddingVertical: 8,
                    }}
                    placeholder="Type a message..."
                    value={text}
                    onChangeText={setText}
                />
                <Button title="Send" onPress={handleSend} />
            </View>
        </KeyboardAvoidingView>
    );
}

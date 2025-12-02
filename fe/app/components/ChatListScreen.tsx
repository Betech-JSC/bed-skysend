import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    Image,
    TextInput,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { getDatabase, ref, onValue, get, set } from "firebase/database";
import { app } from "@/firebaseConfig";
import api from "@/api/api";

interface ChatItem {
    chatId: string;
    otherUserId: string | number;
    otherUserName: string;
    otherUserAvatar: string;
    lastMessage: string;
    lastMessageTime: number;
    unreadCount: number;
    isOnline: boolean;
    isTyping: boolean;
    orderId?: number;
}

export default function ChatListScreen() {
    const router = useRouter();
    const user = useSelector((state: RootState) => state.user);
    const [chats, setChats] = useState<ChatItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const db = getDatabase(app);
    const listenersSetupRef = useRef<Set<string>>(new Set());
    const activeListenersRef = useRef<Map<string, (() => void)[]>>(new Map());

    // Update online status khi component mount
    useEffect(() => {
        if (!user?.id) return;

        const onlineRef = ref(db, `users/${user.id}/online`);
        const lastSeenRef = ref(db, `users/${user.id}/last_seen`);

        // Set online = true
        set(onlineRef, true);
        set(lastSeenRef, Date.now() / 1000);

        // Update last_seen mỗi 30 giây
        const interval = setInterval(() => {
            set(lastSeenRef, Date.now() / 1000);
        }, 30000);

        // Cleanup khi unmount
        return () => {
            set(onlineRef, false);
            clearInterval(interval);
        };
    }, [user?.id, db]);

    // Fetch orders để lấy chat_id
    const fetchChats = useCallback(async () => {
        try {
            setLoading(true);

            // Lấy orders từ API
            const response = await api.get("orders/getList");
            let ordersData = [];

            if (response.data?.success) {
                if (response.data.data?.data) {
                    ordersData = response.data.data.data;
                } else if (Array.isArray(response.data.data)) {
                    ordersData = response.data.data;
                }
            }

            // Lọc orders có chat_id
            const ordersWithChat = ordersData.filter((order: any) => order.chat_id);

            // Fetch thông tin chat từ Firebase
            const chatPromises = ordersWithChat.map(async (order: any) => {
                const chatId = order.chat_id;
                if (!chatId) return null;

                try {
                    // Lấy thông tin chat
                    const chatRef = ref(db, `chats/${chatId}`);
                    const chatSnap = await get(chatRef);
                    const chatData = chatSnap.val();

                    if (!chatData) return null;

                    // Tìm user đối phương
                    const usersList: any[] = Array.isArray(chatData.users)
                        ? chatData.users
                        : Object.keys(chatData.users || {});
                    const otherUserId = usersList.find((id: any) => String(id) !== String(user?.id));

                    if (!otherUserId) return null;

                    // Lấy thông tin user đối phương
                    const userRef = ref(db, `users/${otherUserId}`);
                    const userSnap = await get(userRef);
                    const otherUserData = userSnap.val() || {};

                    // Lấy tin nhắn cuối cùng (lấy tất cả rồi sort ở client để tránh cần index)
                    const messagesRef = ref(db, `chats/${chatId}/messages`);
                    const messagesSnap = await get(messagesRef);
                    const messagesData = messagesSnap.val() || {};

                    let lastMessage = "Chưa có tin nhắn";
                    let lastMessageTime = chatData.created_at || 0;

                    // Convert messages object thành array và sort theo timestamp
                    const messagesArray = Object.entries(messagesData).map(([key, val]: [string, any]) => ({
                        id: key,
                        ...val,
                    }));

                    if (messagesArray.length > 0) {
                        // Sort theo timestamp (tăng dần) và lấy message cuối
                        messagesArray.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
                        const lastMsg = messagesArray[messagesArray.length - 1];

                        if (lastMsg.image_url) {
                            lastMessage = "📷 Đã gửi ảnh";
                        } else if (lastMsg.file_url) {
                            lastMessage = `📎 ${lastMsg.file_name || 'File'}`;
                        } else if (lastMsg.text) {
                            lastMessage = lastMsg.text;
                        }
                        lastMessageTime = lastMsg.timestamp || lastMessageTime;
                    }

                    // Đếm unread (tin nhắn chưa đọc từ đối phương)
                    const allMessagesSnap = await get(messagesRef);
                    const allMessages = allMessagesSnap.val() || {};
                    let unreadCount = 0;
                    Object.values(allMessages).forEach((msg: any) => {
                        if (String(msg.sender_id) === String(otherUserId) && !msg.read) {
                            unreadCount++;
                        }
                    });

                    // Kiểm tra online status
                    const isOnline = otherUserData.online === true ||
                        (otherUserData.last_seen && (Date.now() / 1000 - otherUserData.last_seen) < 300); // 5 phút

                    // Kiểm tra typing status
                    const typingRef = ref(db, `chats/${chatId}/typing/${otherUserId}`);
                    const typingSnap = await get(typingRef);
                    const isTyping = typingSnap.val() === true;

                    return {
                        chatId,
                        otherUserId,
                        otherUserName: otherUserData.name || "Người dùng",
                        otherUserAvatar: otherUserData.avatar || "https://via.placeholder.com/56",
                        lastMessage,
                        lastMessageTime,
                        unreadCount,
                        isOnline,
                        isTyping,
                        orderId: order.id,
                    } as ChatItem;
                } catch (error) {
                    console.error(`Error fetching chat ${chatId}:`, error);
                    return null;
                }
            });

            const chatResults = await Promise.all(chatPromises);
            const validChats = chatResults.filter((chat): chat is ChatItem => chat !== null);

            // Sắp xếp theo thời gian tin nhắn cuối
            validChats.sort((a, b) => b.lastMessageTime - a.lastMessageTime);

            setChats(validChats);

            // Setup listeners sau khi fetch chats (chỉ setup cho chats mới)
            setupListenersForChats(validChats);
        } catch (error) {
            console.error("Error fetching chats:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user?.id, db]);

    // Setup listeners function - chỉ setup cho chats chưa có listeners
    const setupListenersForChats = useCallback((chatList: ChatItem[]) => {
        if (!user?.id || chatList.length === 0) return;

        const currentChatIds = new Set(chatList.map(c => c.chatId));

        // Cleanup listeners cho chats không còn tồn tại
        activeListenersRef.current.forEach((listeners, chatId) => {
            if (!currentChatIds.has(chatId)) {
                listeners.forEach((unsubscribe) => unsubscribe());
                activeListenersRef.current.delete(chatId);
                listenersSetupRef.current.delete(chatId);
            }
        });

        chatList.forEach((chat) => {
            // Chỉ setup listener nếu chưa setup
            if (listenersSetupRef.current.has(chat.chatId)) {
                return;
            }

            listenersSetupRef.current.add(chat.chatId);
            const listeners: (() => void)[] = [];

            // Listen typing status
            const typingRef = ref(db, `chats/${chat.chatId}/typing/${chat.otherUserId}`);
            const typingUnsubscribe = onValue(typingRef, (snapshot) => {
                const isTyping = snapshot.val() === true;
                setChats((prev) =>
                    prev.map((c) =>
                        c.chatId === chat.chatId ? { ...c, isTyping } : c
                    )
                );
            });
            listeners.push(typingUnsubscribe);

            // Listen online status
            const onlineRef = ref(db, `users/${chat.otherUserId}/online`);
            const onlineUnsubscribe = onValue(onlineRef, (snapshot) => {
                const isOnline = snapshot.val() === true;
                setChats((prev) =>
                    prev.map((c) =>
                        c.chatId === chat.chatId ? { ...c, isOnline } : c
                    )
                );
            });
            listeners.push(onlineUnsubscribe);

            // Listen last message (listen tất cả messages rồi sort ở client)
            const messagesRef = ref(db, `chats/${chat.chatId}/messages`);
            const messagesUnsubscribe = onValue(messagesRef, (snapshot) => {
                const messagesData = snapshot.val() || {};

                // Convert messages object thành array và sort theo timestamp
                const messagesArray = Object.entries(messagesData).map(([key, val]: [string, any]) => ({
                    id: key,
                    ...val,
                }));

                if (messagesArray.length > 0) {
                    // Sort theo timestamp (tăng dần) và lấy message cuối
                    messagesArray.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
                    const lastMsg = messagesArray[messagesArray.length - 1];

                    let lastMessage = "Chưa có tin nhắn";

                    if (lastMsg.image_url) {
                        lastMessage = "📷 Đã gửi ảnh";
                    } else if (lastMsg.file_url) {
                        lastMessage = `📎 ${lastMsg.file_name || 'File'}`;
                    } else if (lastMsg.text) {
                        lastMessage = lastMsg.text;
                    }

                    setChats((prev) =>
                        prev.map((c) =>
                            c.chatId === chat.chatId
                                ? {
                                    ...c,
                                    lastMessage,
                                    lastMessageTime: lastMsg.timestamp || c.lastMessageTime,
                                }
                                : c
                        )
                    );
                }
            });
            listeners.push(messagesUnsubscribe);

            // Store listeners
            activeListenersRef.current.set(chat.chatId, listeners);
        });
    }, [user?.id, db]);

    // Cleanup listeners khi component unmount
    useEffect(() => {
        return () => {
            // Cleanup tất cả listeners
            activeListenersRef.current.forEach((listeners) => {
                listeners.forEach((unsubscribe) => unsubscribe());
            });
            activeListenersRef.current.clear();
            listenersSetupRef.current.clear();
        };
    }, []);

    useEffect(() => {
        fetchChats();
    }, [fetchChats]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchChats();
    }, [fetchChats]);

    const formatTime = (timestamp: number) => {
        if (!timestamp) return "";
        const date = new Date(timestamp * 1000);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return "Vừa xong";
        if (minutes < 60) return `${minutes} phút`;
        if (hours < 24) return `${hours} giờ`;
        if (days < 7) return `${days} ngày`;
        return date.toLocaleDateString("vi-VN");
    };

    const filteredChats = chats.filter((chat) =>
        chat.otherUserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            {/* Top App Bar */}
            <View className="bg-background-light dark:bg-background-dark pt-4 pb-2">
                <View className="flex-row items-center justify-between px-4 pb-2">
                    <Text className="text-2xl font-bold text-[#111318] dark:text-white">
                        Trò chuyện
                    </Text>
                    <TouchableOpacity>
                        <MaterialIcons name="add-circle" size={36} color="#2563EB" />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View className="px-4">
                    <View className="flex-row items-center bg-white dark:bg-slate-800 rounded-xl shadow-sm h-14">
                        <MaterialIcons
                            name="search"
                            size={24}
                            color="#616e89"
                            style={{ marginLeft: 16 }}
                        />
                        <TextInput
                            placeholder="Tìm kiếm theo tên hoặc tin nhắn..."
                            placeholderTextColor="#616e89"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            className="flex-1 px-4 text-base text-[#111318] dark:text-white"
                        />
                    </View>
                </View>
            </View>

            {/* Chat List */}
            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#2563EB" />
                </View>
            ) : filteredChats.length === 0 ? (
                <View className="flex-1 justify-center items-center px-8">
                    <MaterialIcons name="chat-bubble-outline" size={80} color="#D1D5DB" />
                    <Text className="text-lg font-semibold text-[#111318] dark:text-white mt-4">
                        {searchQuery ? "Không tìm thấy" : "Chưa có cuộc trò chuyện nào"}
                    </Text>
                    <Text className="text-sm text-[#616e89] dark:text-gray-400 text-center mt-2">
                        {searchQuery
                            ? "Thử tìm kiếm với từ khóa khác"
                            : "Bắt đầu một cuộc hội thoại mới từ đơn hàng của bạn"}
                    </Text>
                </View>
            ) : (
                <ScrollView
                    className="flex-1"
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    <View className="px-4 pb-4 pt-2 gap-y-2">
                        {filteredChats.map((chat) => (
                            <TouchableOpacity
                                key={chat.chatId}
                                activeOpacity={0.7}
                                onPress={() => {
                                    router.push({
                                        pathname: "/chat/[chatId]",
                                        params: {
                                            chatId: chat.chatId,
                                            partnerName: chat.otherUserName,
                                            partnerAvatar: chat.otherUserAvatar,
                                        },
                                    });
                                }}
                                className="flex-row items-center bg-white dark:bg-slate-800 rounded-xl px-4 py-3 min-h-[88px] shadow-sm"
                            >
                                {/* Avatar với online indicator */}
                                <View className="relative mr-4">
                                    <Image
                                        source={{ uri: chat.otherUserAvatar }}
                                        className="w-14 h-14 rounded-full"
                                        resizeMode="cover"
                                    />
                                    {chat.isOnline && (
                                        <View className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-800" />
                                    )}
                                </View>

                                {/* Nội dung tin nhắn */}
                                <View className="flex-1 overflow-hidden">
                                    <View className="flex-row items-center justify-between">
                                        <Text
                                            className={`text-base font-bold text-[#111318] dark:text-white ${chat.unreadCount > 0 ? "font-extrabold" : ""
                                                }`}
                                            numberOfLines={1}
                                        >
                                            {chat.otherUserName}
                                        </Text>
                                    </View>
                                    <Text
                                        className={`text-sm mt-0.5 ${chat.unreadCount > 0
                                                ? "text-primary font-semibold"
                                                : "text-[#616e89] dark:text-gray-400"
                                            }`}
                                        numberOfLines={1}
                                    >
                                        {chat.isTyping ? (
                                            <Text className="italic text-primary">
                                                Đang soạn tin...
                                            </Text>
                                        ) : (
                                            chat.lastMessage
                                        )}
                                    </Text>
                                </View>

                                {/* Thời gian + badge */}
                                <View className="items-end ml-4">
                                    <Text className="text-xs text-[#616e89] dark:text-gray-400 mb-1">
                                        {formatTime(chat.lastMessageTime)}
                                    </Text>
                                    {chat.unreadCount > 0 && (
                                        <View className="w-6 h-6 rounded-full bg-primary justify-center items-center">
                                            <Text className="text-white text-xs font-bold">
                                                {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}


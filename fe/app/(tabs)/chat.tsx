import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { getDatabase, ref, onValue, get } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';
import { app } from '@/firebaseConfig';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useRouter } from 'expo-router';
interface ChatItem {
    chatId: string;
    otherUser: { id: number; name: string; avatar?: string; active?: boolean };
    lastMessage?: string;
    timestamp?: number;
}

export default function ChatListScreen() {
    const router = useRouter();

    const user = useSelector((state: RootState) => state.user);
    const [chats, setChats] = useState<ChatItem[]>([]);
    const db = getDatabase(app);

    useEffect(() => {
        const ordersRef = ref(db, 'orders');

        const unsubscribe = onValue(ordersRef, snapshot => {
            const data = snapshot.val() || {};
            const myOrders = Object.values<any>(data).filter(o => o.user_id === user.id);

            const chatPromises = myOrders.map(async (order: any) => {
                const chatId = order.chat_id;
                const chatRef = ref(db, `chats/${chatId}/messages`);
                const snapshot = await get(chatRef);
                const messages = snapshot.val() || {};
                const lastMsg = Object.values<any>(messages).sort((a, b) => b.timestamp - a.timestamp)[0];

                // Lấy user đối phương
                const otherOrder = Object.values<any>(data).find(o => o.chat_id === chatId && o.user_id !== user.id);
                const otherUserRef = ref(db, `users/${otherOrder?.user_id}`);
                const otherSnap = await get(otherUserRef);
                const otherUser = otherSnap.val() || {};

                return {
                    chatId,
                    otherUser: {
                        id: otherOrder?.user_id,
                        name: otherUser.name || `User ${otherOrder?.user_id}`,
                        avatar: otherUser.avatar,
                        active: otherUser.active,
                    },
                    lastMessage: lastMsg?.text,
                    timestamp: lastMsg?.timestamp,
                };
            });

            Promise.all(chatPromises).then(setChats);
        });

        return () => unsubscribe();
    }, [user.id]);

    const openChat = (chatId: string) => {
        router.push(`home/chat/${chatId}`);
    };

    return (
        <FlatList
            data={chats.sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0))}
            keyExtractor={(item) => item.chatId}
            renderItem={({ item }) => (
                <TouchableOpacity style={styles.item} onPress={() => openChat(item.chatId)}>
                    <Image
                        source={{ uri: item.otherUser.avatar || require('@assets/images/avatar.webp') }}
                        style={styles.avatar}
                    />
                    <View style={{ flex: 1 }}>
                        <View style={styles.row}>
                            <Text style={styles.name}>{item.otherUser.name}</Text>
                            <View
                                style={[
                                    styles.statusDot,
                                    { backgroundColor: item.otherUser.active ? '#4CAF50' : '#CCC' },
                                ]}
                            />
                        </View>
                        <Text style={styles.lastMessage} numberOfLines={1}>
                            {item.lastMessage || 'Bắt đầu cuộc trò chuyện...'}
                        </Text>
                    </View>
                </TouchableOpacity>
            )}
        />
    );
}

const styles = StyleSheet.create({
    item: {
        flexDirection: 'row',
        padding: 12,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
    },
    name: {
        fontWeight: '600',
        fontSize: 16,
    },
    lastMessage: {
        color: '#777',
        fontSize: 14,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginLeft: 6,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});

// app/components/ChatRoom.tsx
import React, { useEffect, useState } from 'react';
import {
    View,
    FlatList,
    TextInput,
    Button,
    Text,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
} from 'react-native';
import { getDatabase, ref, onValue, push, serverTimestamp, get } from 'firebase/database';
import { app } from '@/firebaseConfig';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface Message {
    id: string;
    sender_id: string;
    text: string;
    timestamp: number;
    to?: number;
}

interface ChatRoomProps {
    chatId: string;
}

export default function ChatRoom({ chatId }: ChatRoomProps) {
    const user = useSelector((state: RootState) => state.user);
    const [messages, setMessages] = useState<Message[]>([]);
    const [text, setText] = useState('');
    const [otherUserId, setOtherUserId] = useState<number | null>(null);

    const db = getDatabase(app);

    // Lấy user khác từ node chat
    useEffect(() => {
        const chatRef = ref(db, `chats/${chatId}`);
        get(chatRef).then(snapshot => {
            const chat = snapshot.val();
            console.log(chat?.users);

            if (chat?.users) {
                const other = chat.users.find((id: number) => id !== user.id);
                setOtherUserId(other ?? null);
            }
        });
    }, [chatId]);

    // Realtime listener
    useEffect(() => {
        const messagesRef = ref(db, `chats/${chatId}/messages`);
        const unsubscribe = onValue(messagesRef, snapshot => {
            const data = snapshot.val() || {};
            const arr: Message[] = Object.entries(data).map(([key, val]: [string, any]) => ({
                id: key,
                sender_id: val.sender_id,
                text: val.text,
                timestamp: val.timestamp,
                to: val.to,
            }));
            arr.sort((a, b) => a.timestamp - b.timestamp);
            setMessages(arr);
        });

        return () => unsubscribe();
    }, [chatId]);

    // Gửi tin nhắn
    const sendMessage = () => {

        if (!text.trim() || !otherUserId) return;

        const messagesRef = ref(db, `chats/${chatId}/messages`);
        push(messagesRef, {
            text,
            sender_id: user.id,
            to: otherUserId,
            timestamp: serverTimestamp(),
        });

        setText('');
    };

    // Render từng message
    const renderItem = ({ item }: { item: Message }) => {
        const isMe = item.sender_id === user.id;
        return (
            <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.otherMessage]}>
                <Text style={styles.messageText}>{item.text}</Text>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <FlatList
                data={messages}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 10 }}
            />
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={text}
                    onChangeText={setText}
                    placeholder="Nhập tin nhắn..."
                />
                <Button title="Send" onPress={sendMessage} />
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    messageContainer: {
        marginVertical: 4,
        padding: 8,
        borderRadius: 8,
        maxWidth: '80%',
    },
    myMessage: {
        backgroundColor: '#4caf50',
        alignSelf: 'flex-end',
    },
    otherMessage: {
        backgroundColor: '#e0e0e0',
        alignSelf: 'flex-start',
    },
    messageText: {
        color: '#000',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 8,
        borderTopWidth: 1,
        borderColor: '#ccc',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginRight: 8,
    },
});

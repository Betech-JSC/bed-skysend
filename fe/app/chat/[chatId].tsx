// app/home/chat/[chatId].tsx
import React from 'react';
import ChatRoom from 'app/components/ChatRoom';
import { Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function ChatPage() {
    const { chatId } = useLocalSearchParams<{ chatId: string }>();
    return <ChatRoom chatId={chatId} />;
}

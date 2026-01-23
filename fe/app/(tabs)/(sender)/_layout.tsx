// app/(sender)/_layout.tsx
import React from 'react';
import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { View, Text } from "react-native";
import { useUnreadChatCount } from "@/hooks/useUnreadChatCount";
import { useNewOrdersCount } from "@/hooks/useNewOrdersCount";
import { useNewFlightRequestsCount } from "@/hooks/useNewFlightRequestsCount";
import TabIconWithBadge from "@/components/TabIconWithBadge";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function ChatIconWithBadge({ color }: { color: string }) {
    const unreadCount = useUnreadChatCount();

    return (
        <View style={{ position: "relative" }}>
            <MaterialIcons name="chat" size={28} color={color} />
            {unreadCount > 0 && (
                <View
                    style={{
                        position: "absolute",
                        top: -6,
                        right: -6,
                        backgroundColor: "#EF4444",
                        borderRadius: 10,
                        minWidth: 20,
                        height: 20,
                        paddingHorizontal: 6,
                        justifyContent: "center",
                        alignItems: "center",
                        borderWidth: 2,
                        borderColor: "#FFFFFF",
                    }}
                >
                    <Text
                        style={{
                            color: "#FFFFFF",
                            fontSize: 11,
                            fontWeight: "bold",
                        }}
                    >
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </Text>
                </View>
            )}
        </View>
    );
}

export default function SenderLayout() {
    const insets = useSafeAreaInsets();
    const newOrdersCount = useNewOrdersCount();
    const newFlightRequestsCount = useNewFlightRequestsCount();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#2563EB",
                tabBarInactiveTintColor: "#6B7280",
                tabBarStyle: {
                    height: 49 + insets.bottom, // HIG standard: 49pt + safe area
                    paddingBottom: insets.bottom,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 10, // HIG caption2
                    marginTop: 4, // 4pt spacing from icon
                },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: "Trang chủ",
                    tabBarLabel: ({ focused }) => (
                        <View className="items-center">
                            <Text className={`text-xs ${focused ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                Trang chủ
                            </Text>
                            {focused && (
                                <View className="mt-1 h-0.5 w-8 bg-red-500 rounded-full" />
                            )}
                        </View>
                    ),
                    tabBarIcon: ({ color, focused }) => (
                        <TabIconWithBadge
                            iconName="home"
                            color={focused ? '#1F2937' : '#6B7280'}
                            badgeCount={newFlightRequestsCount}
                            size={focused ? 28 : 26}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="list_orders"
                options={{
                    title: "Đơn hàng",
                    tabBarLabel: ({ focused }) => (
                        <View className="items-center">
                            <Text className={`text-xs ${focused ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                Đơn hàng
                            </Text>
                            {focused && (
                                <View className="mt-1 h-0.5 w-8 bg-red-500 rounded-full" />
                            )}
                        </View>
                    ),
                    tabBarIcon: ({ color, focused }) => (
                        <TabIconWithBadge
                            iconName="work"
                            color={focused ? '#1F2937' : '#6B7280'}
                            badgeCount={newOrdersCount}
                            size={focused ? 28 : 26}
                        />
                    ),
                }}
            />
            <Tabs.Screen name="wallet" options={{
                href: null, // Ẩn tab khỏi tab bar
            }} />
            <Tabs.Screen name="create_request_waiting" options={{
                href: null, // Ẩn tab khỏi tab bar
            }} />
            <Tabs.Screen name="request_matches" options={{
                href: null, // Ẩn tab khỏi tab bar
            }} />
            <Tabs.Screen
                name="chat"
                options={{
                    title: "Chat",
                    tabBarLabel: ({ focused }) => (
                        <View className="items-center">
                            <Text className={`text-xs ${focused ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                Chat
                            </Text>
                            {focused && (
                                <View className="mt-1 h-0.5 w-8 bg-red-500 rounded-full" />
                            )}
                        </View>
                    ),
                    tabBarIcon: ({ color, focused }) => (
                        <ChatIconWithBadge color={focused ? '#1F2937' : '#6B7280'} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Tài khoản",
                    tabBarLabel: ({ focused }) => (
                        <View className="items-center">
                            <Text className={`text-xs ${focused ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                Tài khoản
                            </Text>
                            {focused && (
                                <View className="mt-1 h-0.5 w-8 bg-red-500 rounded-full" />
                            )}
                        </View>
                    ),
                    tabBarIcon: ({ color, focused }) => (
                        <MaterialIcons
                            name="person"
                            size={focused ? 28 : 26}
                            color={focused ? '#1F2937' : '#6B7280'}
                        />
                    ),
                }}
            />

        </Tabs>
    );
}
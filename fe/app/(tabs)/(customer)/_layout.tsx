// app/(customer)/_layout.tsx
import React from 'react';
import { Tabs, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { TouchableOpacity, View, Text } from 'react-native';
import { useUnreadChatCount } from '@/hooks/useUnreadChatCount';
import { useNewOrdersCount } from '@/hooks/useNewOrdersCount';
import { useNewFlightRequestsCount } from '@/hooks/useNewFlightRequestsCount';
import TabIconWithBadge from '@/components/TabIconWithBadge';
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

export default function CustomerLayout() {
    const insets = useSafeAreaInsets();
    const newOrdersCount = useNewOrdersCount();
    const newFlightRequestsCount = useNewFlightRequestsCount();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                title: undefined,
                tabBarActiveTintColor: '#2563EB',
                tabBarInactiveTintColor: '#6B7280',
                tabBarStyle: {
                    height: 49 + insets.bottom, // HIG standard: 49pt + safe area
                    paddingBottom: insets.bottom,
                    paddingTop: 8,
                    // Quan trọng: tạo khoảng trống giữa cho FAB
                    paddingHorizontal: 20,
                },
                tabBarLabelStyle: {
                    fontSize: 10, // HIG caption2
                    marginTop: 4, // 4pt spacing from icon
                },
                tabBarItemStyle: {
                    // Giúp các icon đều nhau, không bị lệch do FAB
                },
            }}
        >
            {/* Tab 1 */}
            <Tabs.Screen
                name="home_customer"
                options={{
                    title: undefined,
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
                    tabBarIcon: ({ focused }) => (
                        <MaterialIcons name="home" size={28} color={focused ? '#1F2937' : '#6B7280'} />
                    ),
                }}
            />

            {/* Tab 2 */}
            <Tabs.Screen
                name="flight-history-customer"
                options={{
                    title: undefined,
                    tabBarLabel: ({ focused }) => (
                        <View className="items-center">
                            <Text className={`text-xs ${focused ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                Chuyến bay
                            </Text>
                            {focused && (
                                <View className="mt-1 h-0.5 w-8 bg-red-500 rounded-full" />
                            )}
                        </View>
                    ),
                    tabBarIcon: ({ focused }) => (
                        <TabIconWithBadge
                            iconName="flight"
                            color={focused ? '#1F2937' : '#6B7280'}
                            badgeCount={newFlightRequestsCount}
                            size={28}
                        />
                    ),
                }}
            />

            {/* Tab 3 - Orders */}
            <Tabs.Screen
                name="list_orders_customer"
                options={{
                    title: undefined,
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
                    tabBarIcon: ({ focused }) => (
                        <TabIconWithBadge
                            iconName="inventory"
                            color={focused ? '#1F2937' : '#6B7280'}
                            badgeCount={newOrdersCount}
                            size={28}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="chat"
                options={{
                    title: undefined,
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
                    tabBarIcon: ({ focused }) => <ChatIconWithBadge color={focused ? '#1F2937' : '#6B7280'} />
                }}
            />

            {/* Tab 4 - Wallet đã bị ẩn */}
            <Tabs.Screen
                name="wallet"
                options={{
                    href: null, // Ẩn tab khỏi tab bar
                }}
            />

            {/* Tab 5 */}
            <Tabs.Screen
                name="profile"
                options={{
                    title: undefined,
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
                    tabBarIcon: ({ focused }) => (
                        <MaterialIcons name="person" size={28} color={focused ? '#1F2937' : '#6B7280'} />
                    ),
                }}
            />

            {/* FAB nổi - đặt ngoài Tabs.Screen, dùng tabBarStyle để chừa chỗ */}
            <Tabs.Screen
                name="index" // không quan trọng, chỉ để render
                options={{
                    tabBarButton: () => (
                        <TouchableOpacity
                            onPress={() => router.push('/(customer)/create_order')}
                            className="absolute bottom-8 left-1/2 -translate-x-1/2"
                            style={{ zIndex: 10 }}
                        >
                            <View className="h-16 w-16 items-center justify-center rounded-full bg-primary shadow-2xl border-4 border-white">
                                <MaterialIcons name="add" size={36} color="white" />
                            </View>
                        </TouchableOpacity>
                    ),
                }}
            />
        </Tabs>
    );
}
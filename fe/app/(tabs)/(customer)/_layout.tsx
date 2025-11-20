// app/(customer)/_layout.tsx
import { Tabs, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { TouchableOpacity, View, Text } from 'react-native';

export default function CustomerLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#2563EB',
                tabBarInactiveTintColor: '#6B7280',
                tabBarStyle: {
                    height: 70,
                    paddingBottom: 20,
                    paddingTop: 8,
                    // Quan trọng: tạo khoảng trống giữa cho FAB
                    paddingHorizontal: 20,
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
                    tabBarLabel: ({ focused }) => (
                        <Text className={`text-xs ${focused ? 'font-bold text-primary' : 'text-gray-500'}`}>
                            Trang chủ
                        </Text>
                    ),
                    tabBarIcon: ({ focused }) => (
                        <MaterialIcons name="home" size={28} color={focused ? '#2563EB' : '#6B7280'} />
                    ),
                }}
            />

            {/* Tab 2 */}
            <Tabs.Screen
                name="flight-history-customer"
                options={{
                    tabBarLabel: ({ focused }) => (
                        <Text className={`text-xs ${focused ? 'font-bold text-primary' : 'text-gray-500'}`}>
                            Chuyến bay
                        </Text>
                    ),
                    tabBarIcon: ({ focused }) => (
                        <MaterialIcons name="flight" size={28} color={focused ? '#2563EB' : '#6B7280'} />
                    ),
                }}
            />

            {/* Tab giữa: ẨN HOÀN TOÀN khỏi tab bar, chỉ dùng để render FAB */}
            <Tabs.Screen
                name="create_order"
                options={{
                    tabBarButton: () => null, // Ẩn tab thật sự
                }}
                listeners={{
                    tabPress: (e) => {
                        e.preventDefault(); // Chặn navigation mặc định
                        router.push('/(customer)/create_order');
                    },
                }}
            />

            {/* Tab 4 */}
            <Tabs.Screen
                name="wallet"
                options={{
                    tabBarLabel: ({ focused }) => (
                        <Text className={`text-xs ${focused ? 'font-bold text-primary' : 'text-gray-500'}`}>
                            Ví tiền
                        </Text>
                    ),
                    tabBarIcon: ({ focused }) => (
                        <MaterialIcons
                            name="account-balance-wallet"
                            size={28}
                            color={focused ? '#2563EB' : '#6B7280'}
                        />
                    ),
                }}
            />

            {/* Tab 5 */}
            <Tabs.Screen
                name="profile"
                options={{
                    tabBarLabel: ({ focused }) => (
                        <Text className={`text-xs ${focused ? 'font-bold text-primary' : 'text-gray-500'}`}>
                            Tài khoản
                        </Text>
                    ),
                    tabBarIcon: ({ focused }) => (
                        <MaterialIcons name="person" size={28} color={focused ? '#2563EB' : '#6B7280'} />
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
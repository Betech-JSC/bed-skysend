// app/(customer)/_layout.tsx
import { Tabs, router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { TouchableOpacity, View, Text } from "react-native";

export default function CustomerLayout() {
    return (
        <Tabs screenOptions={{ headerShown: false, tabBarShowLabel: false }}>
            <Tabs.Screen
                name="home_customer"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <View className="items-center">
                            <MaterialIcons name="home" size={28} color={focused ? "#2563EB" : "#6B7280"} />
                            <Text className={`text-xs mt-1 ${focused ? "text-primary font-bold" : "text-gray-500"}`}>Trang chủ</Text>
                        </View>
                    ),
                }}
            />

            <Tabs.Screen
                name="flight-history-customer"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <View className="items-center">
                            <MaterialIcons name="flight" size={28} color={focused ? "#2563EB" : "#6B7280"} />
                            <Text className={`text-xs mt-1 ${focused ? "text-primary font-bold" : "text-gray-500"}`}>Chuyến bay</Text>
                        </View>
                    ),
                }}
            />

            {/* Nút nổi giữa */}
            <Tabs.Screen
                name="create_order"
                options={{
                    tabBarButton: () => (
                        <TouchableOpacity
                            onPress={() => router.push("/(customer)/create_order")}
                            className="absolute -top-7"
                        >
                            <View className="w-16 h-16 rounded-full bg-primary shadow-2xl justify-center items-center border-4 border-white">
                                <MaterialIcons name="add" size={36} color="white" />
                            </View>
                        </TouchableOpacity>
                    ),
                }}
            />

            <Tabs.Screen
                name="wallet"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <View className="items-center">
                            <MaterialIcons name="account-balance-wallet" size={28} color={focused ? "#2563EB" : "#6B7280"} />
                            <Text className={`text-xs mt-1 ${focused ? "text-primary font-bold" : "text-gray-500"}`}>Ví tiền</Text>
                        </View>
                    ),
                }}
            />

            <Tabs.Screen
                name="profile"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <View className="items-center">
                            <MaterialIcons name="person" size={28} color={focused ? "#2563EB" : "#6B7280"} />
                            <Text className={`text-xs mt-1 ${focused ? "text-primary font-bold" : "text-gray-500"}`}>Tài khoản</Text>
                        </View>
                    ),
                }}
            />
        </Tabs>
    );
}
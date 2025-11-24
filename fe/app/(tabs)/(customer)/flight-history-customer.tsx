import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useColorScheme } from 'nativewind';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function FlightHistoryScreen() {
    const { colorScheme } = useColorScheme();

    const flights = [
        {
            id: 1,
            flightNumber: "VJ159",
            time: "15:30 - 28/10/2023",
            from: "SGN",
            to: "HAN",
            fromCity: "TP.HCM",
            toCity: "Hà Nội",
            requests: 5,
            status: "upcoming",
            verified: true,
        },
        {
            id: 2,
            flightNumber: "VN240",
            time: "08:45 - 22/10/2023",
            from: "SGN",
            to: "DAD",
            fromCity: "TP.HCM",
            toCity: "Đà Nẵng",
            requests: 2,
            status: "completed",
            verified: true,
        },
        {
            id: 3,
            flightNumber: "QH1421",
            time: "19:00 - 15/10/2023",
            from: "HPH",
            to: "SGN",
            fromCity: "Hải Phòng",
            toCity: "TP.HCM",
            requests: 0,
            status: "cancelled",
            verified: false,
        },
    ];

    const getStatusBadge = (status: string, verified: boolean) => {
        if (status === "upcoming")
            return (
                <View className="flex-row items-center gap-1.5 rounded-lg bg-blue-100 px-2.5 py-1 dark:bg-blue-900/50">
                    <MaterialIcons name="schedule" size={16} color="#2563EB" />
                    <Text className="text-xs font-medium text-blue-800 dark:text-blue-200">Sắp tới</Text>
                </View>
            );
        if (status === "completed")
            return (
                <View className="flex-row items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1 dark:bg-gray-700">
                    <MaterialIcons name="task-alt" size={16} color="#6B7280" />
                    <Text className="text-xs font-medium text-gray-700 dark:text-gray-200">Đã hoàn thành</Text>
                </View>
            );
        if (status === "cancelled")
            return (
                <View className="flex-row items-center gap-1.5 rounded-lg bg-red-100 px-2.5 py-1 dark:bg-red-900/50">
                    <MaterialIcons name="cancel" size={16} color="#DC2626" />
                    <Text className="text-xs font-medium text-red-800 dark:text-red-200">Đã hủy</Text>
                </View>
            );
    };

    return (
        <View className="flex-1 bg-background-light dark:bg-background-dark">
            <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

            {/* Header */}
            <View className="sticky top-0 z-10 flex-row items-center justify-between bg-background-light/80 px-4 py-4 backdrop-blur-sm dark:bg-background-dark/80">
                <View className="w-10" />
                <Text className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
                    Lịch sử Chuyến bay
                </Text>
                <TouchableOpacity className="p-2">
                    <MaterialIcons name="filter-list" size={28} color={colorScheme === 'dark' ? '#F5F7FB' : '#1F2937'} />
                </TouchableOpacity>
            </View>

            {/* List */}
            <ScrollView className="flex-1 px-4 pb-32">
                <View className="gap-4 py-2">
                    {flights.map((flight) => (
                        <TouchableOpacity key={flight.id} onPress={() => router.push('/detail-flight-customer')} >
                            <View className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
                                {/* Header */}
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center gap-3">
                                        <View className={`h-10 w-10 items-center justify-center rounded-full ${flight.status === 'upcoming' ? 'bg-blue-100 dark:bg-blue-900/50' :
                                            flight.status === 'completed' ? 'bg-gray-100 dark:bg-gray-700' :
                                                'bg-gray-100 dark:bg-gray-700'
                                            }`}>
                                            <MaterialIcons
                                                name={
                                                    flight.status === 'upcoming' ? 'flight-takeoff' :
                                                        flight.status === 'completed' ? 'flight-land' :
                                                            'no-transfer'
                                                }
                                                size={24}
                                                color="#2563EB"
                                            />
                                        </View>
                                        <View>
                                            <Text className="text-base font-bold text-text-primary-light dark:text-text-primary-dark">
                                                {flight.flightNumber}
                                            </Text>
                                            <Text className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                                                {flight.time}
                                            </Text>
                                        </View>
                                    </View>

                                    {flight.requests > 0 && (
                                        <View className="rounded-full bg-secondary px-3 py-2">
                                            <Text className="text-sm font-bold text-white">{flight.requests} Yêu cầu</Text>
                                        </View>
                                    )}
                                </View>

                                {/* Route */}
                                <View className="my-4 flex-row items-center justify-between">
                                    <View className="items-center">
                                        <Text className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
                                            {flight.from}
                                        </Text>
                                        <Text className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                                            {flight.fromCity}
                                        </Text>
                                    </View>

                                    <View className="flex-1 flex-row items-center px-4">
                                        <View className="flex-1 border-t border-gray-300 dark:border-gray-600" />
                                        <MaterialIcons name="flight" size={24} color="#9CA3AF" />
                                        <View className="flex-1 border-t border-gray-300 dark:border-gray-600" />
                                    </View>

                                    <View className="items-center">
                                        <Text className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
                                            {flight.to}
                                        </Text>
                                        <Text className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                                            {flight.toCity}
                                        </Text>
                                    </View>
                                </View>

                                {/* Badges */}
                                <View className="flex-row gap-2">
                                    {flight.verified && (
                                        <View className="flex-row items-center gap-1.5 rounded-lg bg-green-100 px-2.5 py-1 dark:bg-green-900/50">
                                            <MaterialIcons name="verified" size={16} color="#16A34A" />
                                            <Text className="text-xs font-medium text-green-800 dark:text-green-200">Đã xác thực</Text>
                                        </View>
                                    )}
                                    {!flight.verified && (
                                        <View className="flex-row items-center gap-1.5 rounded-lg bg-yellow-100 px-2.5 py-1 dark:bg-yellow-900/50">
                                            <MaterialIcons name="hourglass-empty" size={16} color="#D97706" />
                                            <Text className="text-xs font-medium text-yellow-800 dark:text-yellow-200">Chờ xác thực</Text>
                                        </View>
                                    )}
                                    {getStatusBadge(flight.status, flight.verified)}
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* FAB */}
            <View className="absolute bottom-6 right-6">
                <TouchableOpacity className="flex-row items-center gap-2 rounded-full bg-primary px-6 py-4 shadow-lg">
                    <MaterialIcons name="add" size={28} color="white" />
                    <Text className="text-base font-semibold text-white">Thêm chuyến bay</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
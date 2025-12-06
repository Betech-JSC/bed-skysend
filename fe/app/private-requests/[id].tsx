import React, { useEffect, useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import api from "@/api/api";

interface RequestDetail {
    id: number;
    uuid: string;
    sender_id: number;
    flight_id: number;
    reward: number;
    item_value: number;
    item_description: string;
    time_slot: string;
    note?: string;
    priority_level: string;
    status: string;
    expires_at: string;
    created_at: string;
    updated_at: string;
    flight?: {
        id: number;
        from_airport: string;
        to_airport: string;
        flight_number: string;
        flight_date: string;
        customer?: {
            id: number;
            name: string;
            avatar?: string;
            phone?: string;
        };
    };
    sender?: {
        id: number;
        name: string;
        avatar?: string;
        phone?: string;
    };
}

export default function PrivateRequestDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const user = useSelector((state: RootState) => state.user);
    const [loading, setLoading] = useState(true);
    const [request, setRequest] = useState<RequestDetail | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setError("Request ID không hợp lệ");
            setLoading(false);
            return;
        }

        fetchRequestDetail();
    }, [id]);

    const fetchRequestDetail = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get(`private-requests/${id}/show`);

            if (response.data?.success && response.data?.data) {
                // Transform data từ API để match với interface
                const apiData = response.data.data;
                const transformedData: RequestDetail = {
                    id: apiData.id,
                    uuid: apiData.uuid,
                    sender_id: apiData.sender?.id || 0,
                    flight_id: apiData.flight?.id || 0,
                    reward: apiData.reward || 0,
                    item_value: apiData.item?.value || 0,
                    item_description: apiData.item?.description || "",
                    time_slot: apiData.time_slot || "",
                    note: apiData.note,
                    priority_level: apiData.priority_level || "normal",
                    status: apiData.status || "pending",
                    expires_at: apiData.expires_at || "",
                    created_at: apiData.created_at || "",
                    updated_at: apiData.updated_at || "",
                    flight: apiData.flight ? {
                        id: apiData.flight.id,
                        from_airport: apiData.flight.from_airport,
                        to_airport: apiData.flight.to_airport,
                        flight_number: apiData.flight.flight_number,
                        flight_date: apiData.flight.flight_date,
                        customer: apiData.flight.customer,
                    } : undefined,
                    sender: apiData.sender,
                };
                setRequest(transformedData);
            } else {
                setError("Không thể tải thông tin yêu cầu");
            }
        } catch (err: any) {
            console.error("Error fetching request detail:", err);
            setError(
                err.response?.data?.message ||
                    "Không thể tải thông tin yêu cầu. Vui lòng thử lại."
            );
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const getStatusLabel = (status: string) => {
        const statusMap: Record<string, { label: string; color: string }> = {
            pending: { label: "Đang chờ", color: "#F59E0B" },
            accepted: { label: "Đã chấp nhận", color: "#10B981" },
            declined: { label: "Đã từ chối", color: "#EF4444" },
            expired: { label: "Đã hết hạn", color: "#6B7280" },
            confirmed: { label: "Đã xác nhận", color: "#2563EB" },
        };
        return statusMap[status] || { label: status, color: "#6B7280" };
    };

    const getPriorityLabel = (priority: string) => {
        const priorityMap: Record<string, { label: string; color: string }> = {
            urgent: { label: "Gấp", color: "#EF4444" },
            priority: { label: "Ưu tiên", color: "#F59E0B" },
            normal: { label: "Bình thường", color: "#6B7280" },
        };
        return priorityMap[priority] || { label: priority, color: "#6B7280" };
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#2563EB" />
                    <Text className="mt-4 text-text-secondary dark:text-gray-400">
                        Đang tải...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !request) {
        return (
            <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
                <View className="flex-row items-center justify-between px-4 pt-4 pb-3">
                    <TouchableOpacity onPress={() => router.back()}>
                        <MaterialIcons
                            name="arrow-back"
                            size={28}
                            color="#1F2937"
                        />
                    </TouchableOpacity>
                    <Text className="flex-1 text-center text-lg font-bold text-text-primary dark:text-white -ml-10">
                        Chi tiết yêu cầu
                    </Text>
                    <View className="w-10" />
                </View>
                <View className="flex-1 justify-center items-center px-8">
                    <MaterialIcons name="error-outline" size={64} color="#EF4444" />
                    <Text className="mt-4 text-lg font-bold text-text-primary dark:text-white text-center">
                        {error || "Không tìm thấy yêu cầu"}
                    </Text>
                    <TouchableOpacity
                        onPress={fetchRequestDetail}
                        className="mt-4 bg-primary px-6 py-3 rounded-lg"
                    >
                        <Text className="text-white font-bold">Thử lại</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const statusInfo = getStatusLabel(request.status);
    const priorityInfo = getPriorityLabel(request.priority_level);
    const flight = request.flight;
    const customer = flight?.customer;

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            {/* Top App Bar */}
            <View className="flex-row items-center justify-between px-4 pt-4 pb-3 bg-background-light dark:bg-background-dark sticky top-0 z-10">
                <TouchableOpacity onPress={() => router.back()}>
                    <MaterialIcons
                        name="arrow-back"
                        size={28}
                        color="#1F2937"
                        className="dark:text-white"
                    />
                </TouchableOpacity>

                <Text className="flex-1 text-center text-lg font-bold text-text-primary dark:text-white -ml-10">
                    Chi tiết yêu cầu
                </Text>

                <View className="w-10" />
            </View>

            <ScrollView className="flex-1 px-4 pb-32">
                <View className="gap-y-4">
                    {/* Status Card */}
                    <View className="flex-row items-center gap-4 rounded-xl bg-white dark:bg-slate-800 p-4 shadow-lg">
                        <View className="h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <MaterialIcons
                                name="task-alt"
                                size={32}
                                color={statusInfo.color}
                            />
                        </View>
                        <View className="flex-1">
                            <Text
                                className="text-base font-bold"
                                style={{ color: statusInfo.color }}
                            >
                                {statusInfo.label}
                            </Text>
                            <Text className="text-sm text-text-secondary dark:text-slate-400">
                                Trạng thái yêu cầu
                            </Text>
                        </View>
                        <View
                            className="px-3 py-1 rounded-full"
                            style={{ backgroundColor: `${priorityInfo.color}20` }}
                        >
                            <Text
                                className="text-xs font-bold"
                                style={{ color: priorityInfo.color }}
                            >
                                {priorityInfo.label}
                            </Text>
                        </View>
                    </View>

                    {/* Thông tin lộ trình */}
                    {flight && (
                        <View className="rounded-xl bg-white dark:bg-slate-800 p-4 shadow-lg">
                            <Text className="text-lg font-bold text-text-primary dark:text-white mb-3">
                                Thông tin chuyến bay
                            </Text>

                            {/* Từ */}
                            <View className="flex-row items-center gap-4 py-2">
                                <View className="h-10 w-10 items-center justify-center rounded-lg bg-background-light dark:bg-slate-700">
                                    <MaterialIcons
                                        name="flight-takeoff"
                                        size={24}
                                        color="#1E293B"
                                        className="dark:text-white"
                                    />
                                </View>
                                <Text className="flex-1 text-base font-medium text-text-primary dark:text-white">
                                    {flight.from_airport || "N/A"}
                                </Text>
                            </View>

                            {/* Đường nối chấm */}
                            <View className="items-center py-1">
                                <View className="h-6 w-0.5 border-l-2 border-dashed border-slate-300 dark:border-slate-600" />
                            </View>

                            {/* Đến */}
                            <View className="flex-row items-center gap-4 pb-3">
                                <View className="h-10 w-10 items-center justify-center rounded-lg bg-background-light dark:bg-slate-700">
                                    <MaterialIcons
                                        name="flight-land"
                                        size={24}
                                        color="#1E293B"
                                        className="dark:text-white"
                                    />
                                </View>
                                <Text className="flex-1 text-base font-medium text-text-primary dark:text-white">
                                    {flight.to_airport || "N/A"}
                                </Text>
                            </View>

                            <View className="h-px bg-slate-200 dark:bg-slate-700 my-3" />

                            {/* Thông tin chuyến bay */}
                            <View className="flex-row items-center gap-4 py-2">
                                <View className="h-10 w-10 items-center justify-center rounded-lg bg-background-light dark:bg-slate-700">
                                    <MaterialIcons
                                        name="flight"
                                        size={24}
                                        color="#1E293B"
                                        className="dark:text-white"
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-sm text-text-secondary dark:text-slate-400">
                                        Số hiệu chuyến bay
                                    </Text>
                                    <Text className="text-base font-medium text-text-primary dark:text-white">
                                        {flight.flight_number || "N/A"}
                                    </Text>
                                </View>
                            </View>

                            <View className="h-px bg-slate-200 dark:bg-slate-700 my-3" />

                            {/* Ngày giờ */}
                            <View className="flex-row items-center gap-4 py-2">
                                <View className="h-10 w-10 items-center justify-center rounded-lg bg-background-light dark:bg-slate-700">
                                    <MaterialIcons
                                        name="calendar-month"
                                        size={24}
                                        color="#1E293B"
                                        className="dark:text-white"
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-base font-medium text-text-primary dark:text-white">
                                        {flight.flight_date
                                            ? formatDate(flight.flight_date)
                                            : "N/A"}
                                    </Text>
                                    {request.time_slot && (
                                        <Text className="text-sm text-text-secondary dark:text-slate-400">
                                            {request.time_slot}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Chi tiết tài liệu */}
                    <View className="rounded-xl bg-white dark:bg-slate-800 p-4 shadow-lg">
                        <Text className="text-lg font-bold text-text-primary dark:text-white mb-3">
                            Chi tiết tài liệu
                        </Text>

                        {/* Mô tả */}
                        <View className="flex-row items-start gap-4 py-2">
                            <View className="h-10 w-10 items-center justify-center rounded-lg bg-background-light dark:bg-slate-700">
                                <MaterialIcons
                                    name="description"
                                    size={24}
                                    color="#1E293B"
                                    className="dark:text-white"
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-sm text-text-secondary dark:text-slate-400">
                                    Mô tả
                                </Text>
                                <Text className="text-base font-medium text-text-primary dark:text-white">
                                    {request.item_description || "N/A"}
                                </Text>
                            </View>
                        </View>

                        <View className="h-px bg-slate-200 dark:bg-slate-700 my-3" />

                        {/* Giá trị */}
                        <View className="flex-row items-center gap-4 py-2">
                            <View className="h-10 w-10 items-center justify-center rounded-lg bg-background-light dark:bg-slate-700">
                                <MaterialIcons
                                    name="payments"
                                    size={24}
                                    color="#1E293B"
                                    className="dark:text-white"
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-sm text-text-secondary dark:text-slate-400">
                                    Giá trị ước tính
                                </Text>
                                <Text className="text-base font-medium text-text-primary dark:text-white">
                                    {formatCurrency(request.item_value)}
                                </Text>
                            </View>
                        </View>

                        <View className="h-px bg-slate-200 dark:bg-slate-700 my-3" />

                        {/* Phí nhận được */}
                        <View className="flex-row items-center gap-4 py-2">
                            <View className="h-10 w-10 items-center justify-center rounded-lg bg-background-light dark:bg-slate-700">
                                <MaterialIcons
                                    name="local-shipping"
                                    size={24}
                                    color="#1E293B"
                                    className="dark:text-white"
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-sm text-text-secondary dark:text-slate-400">
                                    Phí bạn nhận được
                                </Text>
                                <Text className="text-lg font-bold text-primary">
                                    {formatCurrency(request.reward)}
                                </Text>
                            </View>
                        </View>

                        {request.note && (
                            <>
                                <View className="h-px bg-slate-200 dark:bg-slate-700 my-3" />
                                <View className="flex-row items-start gap-4 py-2">
                                    <View className="h-10 w-10 items-center justify-center rounded-lg bg-background-light dark:bg-slate-700">
                                        <MaterialIcons
                                            name="note"
                                            size={24}
                                            color="#1E293B"
                                            className="dark:text-white"
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-sm text-text-secondary dark:text-slate-400">
                                            Ghi chú
                                        </Text>
                                        <Text className="text-base font-medium text-text-primary dark:text-white">
                                            {request.note}
                                        </Text>
                                    </View>
                                </View>
                            </>
                        )}
                    </View>

                    {/* Thông tin hành khách */}
                    {customer && (
                        <View className="rounded-xl bg-white dark:bg-slate-800 p-4 shadow-lg">
                            <Text className="text-lg font-bold text-text-primary dark:text-white mb-4">
                                Thông tin hành khách
                            </Text>

                            <View className="flex-row items-center gap-4">
                                <Image
                                    source={{
                                        uri:
                                            customer.avatar ||
                                            "https://via.placeholder.com/56",
                                    }}
                                    className="h-14 w-14 rounded-full"
                                />
                                <View className="flex-1">
                                    <Text className="text-base font-bold text-text-primary dark:text-white">
                                        {customer.name || "N/A"}
                                    </Text>
                                    {customer.phone && (
                                        <Text className="text-sm text-text-secondary dark:text-slate-400 mt-1">
                                            📱 {customer.phone}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Thông tin hết hạn */}
                    {request.expires_at && (
                        <View className="rounded-xl bg-white dark:bg-slate-800 p-4 shadow-lg">
                            <View className="flex-row items-center gap-4">
                                <View className="h-10 w-10 items-center justify-center rounded-lg bg-background-light dark:bg-slate-700">
                                    <MaterialIcons
                                        name="schedule"
                                        size={24}
                                        color="#1E293B"
                                        className="dark:text-white"
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-sm text-text-secondary dark:text-slate-400">
                                        Hết hạn vào
                                    </Text>
                                    <Text className="text-base font-medium text-text-primary dark:text-white">
                                        {formatDate(request.expires_at)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}


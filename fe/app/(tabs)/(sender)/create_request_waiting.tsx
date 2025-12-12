import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    SafeAreaView,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import api from '@/api/api';

import CitySelectModal from 'app/components/CitySelectModal';
import BackButton from 'app/components/BackButton';
import DatePickerInput from 'app/components/DatePickerInput';
import ItemTypeSelect from 'app/components/ItemTypeSelect';
import CurrencyInput from 'app/components/CurrencyInput';
import { parseVND } from '@/utils/currencyFormatter';

const TIME_SLOTS = [
    { label: 'Sáng', value: 'morning' },
    { label: 'Chiều', value: 'afternoon' },
    { label: 'Tối', value: 'evening' },
    { label: 'Bất kỳ', value: 'any' },
];

const PRIORITY_LEVELS = [
    { label: 'Thường', value: 'normal' },
    { label: 'Ưu tiên', value: 'priority' },
    { label: 'Gấp', value: 'urgent' },
];

// Helper function để format ngày hiện tại thành yyyy-mm-dd
const getTodayDateString = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function CreateRequestWaitingScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const isDark = useColorScheme() === 'dark';
    const editId = params.editId as string | undefined;
    const isEditMode = !!editId;
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(isEditMode);
    const [formData, setFormData] = useState({
        from_airport: '',
        to_airport: '',
        desired_date: getTodayDateString(), // Mặc định là ngày hiện tại
        desired_time_slot: 'any',
        desired_weight: '',
        item_type: '',
        item_description: '',
        item_value: '',
        reward: '',
        note: '',
        priority_level: 'normal',
    });
    const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
    const [showPriorityModal, setShowPriorityModal] = useState(false);

    // Helper function để reset form về trạng thái ban đầu
    const resetForm = () => {
        setFormData({
            from_airport: '',
            to_airport: '',
            desired_date: getTodayDateString(),
            desired_time_slot: 'any',
            desired_weight: '',
            item_type: '',
            item_description: '',
            item_value: '',
            reward: '',
            note: '',
            priority_level: 'normal',
        });
    };

    // Load data nếu đang ở chế độ chỉnh sửa
    useEffect(() => {
        if (isEditMode && editId) {
            loadRequestData(parseInt(editId));
        } else {
            // Reset form khi không phải edit mode
            resetForm();
        }
    }, [editId]);

    const loadRequestData = async (requestId: number) => {
        try {
            setLoadingData(true);
            const response = await api.get(`/private-requests/${requestId}/show`);

            if (!response.data?.success) {
                throw new Error(response.data?.message || 'Không thể tải thông tin request');
            }

            const request = response.data?.data;

            if (request) {
                setFormData({
                    from_airport: request.from_airport || '',
                    to_airport: request.to_airport || '',
                    desired_date: request.desired_date || '',
                    desired_time_slot: request.desired_time_slot || 'any',
                    desired_weight: request.desired_weight ? request.desired_weight.toString() : '',
                    item_type: request.item_type || '',
                    item_description: request.item_description || '',
                    item_value: request.item_value ? Number(request.item_value).toLocaleString('vi-VN') : '',
                    reward: request.reward ? Number(request.reward).toLocaleString('vi-VN') : '',
                    note: request.note || '',
                    priority_level: request.priority_level || 'normal',
                });
            }
        } catch (error: any) {
            console.error('Error loading request data:', error);
            Alert.alert(
                'Lỗi',
                error.response?.data?.message || error.message || 'Không thể tải thông tin request'
            );
            router.back();
        } finally {
            setLoadingData(false);
        }
    };

    const handleSubmit = async () => {
        // Validation
        if (!formData.from_airport || !formData.to_airport) {
            Alert.alert('Lỗi', 'Vui lòng chọn sân bay đi và đến');
            return;
        }

        if (formData.from_airport === formData.to_airport) {
            Alert.alert('Lỗi', 'Sân bay đi và đến không được giống nhau');
            return;
        }

        if (!formData.desired_date) {
            Alert.alert('Lỗi', 'Vui lòng chọn ngày mong muốn');
            return;
        }

        if (!formData.item_type) {
            Alert.alert('Lỗi', 'Vui lòng chọn loại hàng hóa');
            return;
        }

        if (!formData.item_description.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập mô tả hàng hóa');
            return;
        }

        const itemValueNum = parseVND(formData.item_value);
        const rewardNum = parseVND(formData.reward);

        if (!itemValueNum || itemValueNum < 100000) {
            Alert.alert('Lỗi', 'Giá trị hàng hóa phải từ 100,000 VNĐ trở lên');
            return;
        }

        if (!rewardNum || rewardNum < 50000) {
            Alert.alert('Lỗi', 'Phần thưởng phải từ 50,000 VNĐ trở lên');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                from_airport: formData.from_airport,
                to_airport: formData.to_airport,
                desired_date: formData.desired_date,
                desired_time_slot: formData.desired_time_slot,
                desired_weight: formData.desired_weight ? parseFloat(formData.desired_weight) : null,
                item_type: formData.item_type,
                item_description: formData.item_description,
                item_value: itemValueNum,
                reward: rewardNum,
                note: formData.note || null,
                priority_level: formData.priority_level,
            };

            let response;
            if (isEditMode && editId) {
                response = await api.put(`/requests/${editId}/update-waiting`, payload);
            } else {
                response = await api.post('/requests/create-waiting', payload);
            }

            if (response.data.success) {
                // Reset form nếu không phải edit mode (tạo mới)
                if (!isEditMode) {
                    resetForm();
                }

                Alert.alert(
                    'Thành công',
                    response.data.message,
                    [
                        {
                            text: 'Xem matches',
                            onPress: () => {
                                const requestId = isEditMode ? editId : response.data.data.request.id;
                                router.push(`/request_matches/${requestId}`);
                            },
                        },
                        {
                            text: 'OK',
                            onPress: () => router.back(),
                        },
                    ]
                );
            }
        } catch (error: any) {
            Alert.alert(
                'Lỗi',
                error.response?.data?.message || `Không thể ${isEditMode ? 'cập nhật' : 'tạo'} request. Vui lòng thử lại.`
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: isEditMode ? 'Chỉnh sửa request' : 'Tạo request chờ match',
                    headerTitle: isEditMode ? 'Chỉnh sửa request' : 'Tạo request chờ match',
                }}
            />
            <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
                <View className="flex-row items-center justify-between px-4 pt-4 pb-3 bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-gray-700">
                    <BackButton className="bg-white dark:bg-gray-800 shadow-sm" />
                </View>

                <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
                    <Text className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                        Điền thông tin để hệ thống tự động tìm khách hàng phù hợp
                    </Text>

                    {/* From Airport */}
                    <View className="mb-4">
                        <Text className="mb-2 text-sm font-medium text-text-primary dark:text-white">
                            Sân bay đi *
                        </Text>
                        <CitySelectModal
                            placeholder="Chọn sân bay đi"
                            iconName="flight-takeoff"
                            value={formData.from_airport}
                            onValueChange={(value) => setFormData({ ...formData, from_airport: value })}
                        />
                    </View>

                    {/* To Airport */}
                    <View className="mb-4">
                        <Text className="mb-2 text-sm font-medium text-text-primary dark:text-white">
                            Sân bay đến *
                        </Text>
                        <CitySelectModal
                            placeholder="Chọn sân bay đến"
                            iconName="flight-land"
                            value={formData.to_airport}
                            onValueChange={(value) => setFormData({ ...formData, to_airport: value })}
                        />
                    </View>

                    {/* Desired Date */}
                    <View className="mb-4">
                        <Text className="mb-2 text-sm font-medium text-text-primary dark:text-white">
                            Ngày mong muốn *
                        </Text>
                        <DatePickerInput
                            value={formData.desired_date}
                            onValueChange={(date) => setFormData({ ...formData, desired_date: date })}
                            placeholder="Chọn ngày"
                            minimumDate={new Date()}
                        />
                    </View>

                    {/* Time Slot */}
                    <View className="mb-4">
                        <Text className="mb-2 text-sm font-medium text-text-primary dark:text-white">
                            Khung giờ
                        </Text>
                        <TouchableOpacity
                            onPress={() => setShowTimeSlotModal(true)}
                            className="h-14 flex-row items-center justify-between rounded-lg border border-gray-200 bg-background-light px-4 dark:border-gray-600 dark:bg-gray-700">
                            <Text className="text-text-primary dark:text-white">
                                {TIME_SLOTS.find((s) => s.value === formData.desired_time_slot)?.label || 'Bất kỳ'}
                            </Text>
                            <MaterialIcons name="arrow-drop-down" size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
                        </TouchableOpacity>
                    </View>

                    {/* Desired Weight */}
                    <View className="mb-4">
                        <Text className="mb-2 text-sm font-medium text-text-primary dark:text-white">
                            Khối lượng (kg)
                        </Text>
                        <TextInput
                            value={formData.desired_weight}
                            onChangeText={(text) => setFormData({ ...formData, desired_weight: text })}
                            placeholder="Ví dụ: 2.5"
                            keyboardType="decimal-pad"
                            className="h-14 rounded-lg border border-gray-200 bg-background-light px-4 text-text-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                    </View>

                    {/* Item Type */}
                    <View className="mb-4">
                        <Text className="mb-2 text-sm font-medium text-text-primary dark:text-white">
                            Loại hàng hóa *
                        </Text>
                        <ItemTypeSelect
                            placeholder="Chọn loại hàng hóa"
                            value={formData.item_type}
                            onValueChange={(value) => setFormData({ ...formData, item_type: value })}
                        />
                    </View>

                    {/* Item Description */}
                    <View className="mb-4">
                        <Text className="mb-2 text-sm font-medium text-text-primary dark:text-white">
                            Mô tả hàng hóa *
                        </Text>
                        <TextInput
                            value={formData.item_description}
                            onChangeText={(text) => setFormData({ ...formData, item_description: text })}
                            placeholder="Mô tả chi tiết về hàng hóa"
                            multiline
                            numberOfLines={4}
                            className="min-h-[100px] rounded-lg border border-gray-200 bg-background-light px-4 py-3 text-text-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Item Value */}
                    <View className="mb-4">
                        <CurrencyInput
                            label="Giá trị hàng hóa (VNĐ) *"
                            value={formData.item_value}
                            onChangeText={(text) => setFormData({ ...formData, item_value: text })}
                            placeholder="Ví dụ: 1,000,000"
                            showUnit={true}
                        />
                    </View>

                    {/* Reward */}
                    <View className="mb-4">
                        <CurrencyInput
                            label="Phần thưởng (VNĐ) *"
                            value={formData.reward}
                            onChangeText={(text) => setFormData({ ...formData, reward: text })}
                            placeholder="Ví dụ: 500,000"
                            showUnit={true}
                        />
                    </View>

                    {/* Priority Level */}
                    <View className="mb-4">
                        <Text className="mb-2 text-sm font-medium text-text-primary dark:text-white">
                            Mức độ ưu tiên
                        </Text>
                        <TouchableOpacity
                            onPress={() => setShowPriorityModal(true)}
                            className="h-14 flex-row items-center justify-between rounded-lg border border-gray-200 bg-background-light px-4 dark:border-gray-600 dark:bg-gray-700">
                            <Text className="text-text-primary dark:text-white">
                                {PRIORITY_LEVELS.find((p) => p.value === formData.priority_level)?.label || 'Thường'}
                            </Text>
                            <MaterialIcons name="arrow-drop-down" size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
                        </TouchableOpacity>
                    </View>

                    {/* Note */}
                    <View className="mb-4">
                        <Text className="mb-2 text-sm font-medium text-text-primary dark:text-white">
                            Ghi chú
                        </Text>
                        <TextInput
                            value={formData.note}
                            onChangeText={(text) => setFormData({ ...formData, note: text })}
                            placeholder="Ghi chú thêm (tùy chọn)"
                            multiline
                            numberOfLines={3}
                            className="min-h-[80px] rounded-lg border border-gray-200 bg-background-light px-4 py-3 text-text-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={loading}
                        className="mb-8 h-14 items-center justify-center rounded-lg bg-blue-600">
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text className="text-base font-semibold text-white">
                                {isEditMode ? 'Cập nhật request' : 'Tạo request'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>

                {/* Time Slot Modal */}
                {showTimeSlotModal && (
                    <View className="absolute inset-0 items-end justify-end bg-black/50">
                        <View className="w-full rounded-t-xl bg-white p-4 dark:bg-gray-800" style={{ maxHeight: '60%' }}>
                            <View className="mb-4 flex-row items-center justify-between">
                                <Text className="text-lg font-semibold text-text-primary dark:text-white">
                                    Chọn khung giờ
                                </Text>
                                <TouchableOpacity onPress={() => setShowTimeSlotModal(false)}>
                                    <Text className="text-blue-600">Đóng</Text>
                                </TouchableOpacity>
                            </View>
                            {TIME_SLOTS.map((slot) => (
                                <TouchableOpacity
                                    key={slot.value}
                                    onPress={() => {
                                        setFormData({ ...formData, desired_time_slot: slot.value });
                                        setShowTimeSlotModal(false);
                                    }}
                                    className="border-b border-gray-100 py-3 dark:border-gray-700">
                                    <Text className="text-base text-text-primary dark:text-white">{slot.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* Priority Modal */}
                {showPriorityModal && (
                    <View className="absolute inset-0 items-end justify-end bg-black/50">
                        <View className="w-full rounded-t-xl bg-white p-4 dark:bg-gray-800" style={{ maxHeight: '60%' }}>
                            <View className="mb-4 flex-row items-center justify-between">
                                <Text className="text-lg font-semibold text-text-primary dark:text-white">
                                    Chọn mức độ ưu tiên
                                </Text>
                                <TouchableOpacity onPress={() => setShowPriorityModal(false)}>
                                    <Text className="text-blue-600">Đóng</Text>
                                </TouchableOpacity>
                            </View>
                            {PRIORITY_LEVELS.map((priority) => (
                                <TouchableOpacity
                                    key={priority.value}
                                    onPress={() => {
                                        setFormData({ ...formData, priority_level: priority.value });
                                        setShowPriorityModal(false);
                                    }}
                                    className="border-b border-gray-100 py-3 dark:border-gray-700">
                                    <Text className="text-base text-text-primary dark:text-white">{priority.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}
            </SafeAreaView>
        </>

    );
}

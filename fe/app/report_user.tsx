import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import api from '@/api/api';
import BackButton from './components/BackButton';

const REPORT_REASONS = [
    {
        id: 'spam',
        label: 'Spam hoặc lừa đảo',
        icon: 'report-problem',
        description: 'Người dùng này đang spam hoặc có hành vi lừa đảo',
    },
    {
        id: 'inappropriate',
        label: 'Nội dung không phù hợp',
        icon: 'block',
        description: 'Người dùng có hành vi hoặc nội dung không phù hợp',
    },
    {
        id: 'harassment',
        label: 'Quấy rối hoặc đe dọa',
        icon: 'warning',
        description: 'Người dùng này đang quấy rối hoặc đe dọa',
    },
    {
        id: 'fake',
        label: 'Tài khoản giả mạo',
        icon: 'person-off',
        description: 'Tài khoản này có dấu hiệu giả mạo hoặc không hợp lệ',
    },
    {
        id: 'scam',
        label: 'Lừa đảo giao dịch',
        icon: 'money-off',
        description: 'Người dùng này có hành vi lừa đảo trong giao dịch',
    },
    {
        id: 'other',
        label: 'Lý do khác',
        icon: 'more-horiz',
        description: 'Vấn đề khác cần báo cáo',
    },
];

export default function ReportUserScreen() {
    const router = useRouter();
    const { userId, userName } = useLocalSearchParams<{
        userId: string;
        userName?: string;
    }>();

    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!selectedReason) {
            Alert.alert('Thiếu thông tin', 'Vui lòng chọn lý do báo cáo.');
            return;
        }

        if (!description.trim()) {
            Alert.alert('Thiếu thông tin', 'Vui lòng mô tả chi tiết vấn đề.');
            return;
        }

        if (description.trim().length < 10) {
            Alert.alert('Thông tin không đầy đủ', 'Vui lòng mô tả chi tiết ít nhất 10 ký tự.');
            return;
        }

        Alert.alert(
            'Xác nhận báo cáo',
            'Bạn có chắc chắn muốn báo cáo người dùng này? Chúng tôi sẽ xem xét và xử lý báo cáo của bạn.',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Gửi báo cáo',
                    style: 'destructive',
                    onPress: async () => {
                        await submitReport();
                    },
                },
            ]
        );
    };

    const submitReport = async () => {
        setLoading(true);

        try {
            const response = await api.post('reports/user', {
                reported_user_id: userId,
                reason: selectedReason,
                description: description.trim(),
            });

            if (response.data?.success || response.status === 200) {
                Alert.alert(
                    'Thành công',
                    'Báo cáo của bạn đã được gửi. Chúng tôi sẽ xem xét và xử lý trong thời gian sớm nhất. Cảm ơn bạn đã giúp cộng đồng an toàn hơn.',
                    [
                        {
                            text: 'OK',
                            onPress: () => router.back(),
                        },
                    ]
                );
            } else {
                throw new Error(response.data?.message || 'Gửi báo cáo thất bại');
            }
        } catch (error: any) {
            console.error('Report user error:', error);
            const errorMessage =
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                'Không thể gửi báo cáo. Vui lòng thử lại sau.';
            Alert.alert('Lỗi', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />
            <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
                {/* Header */}
                <View className="flex-row items-center justify-between px-4 pt-4 pb-3 bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-gray-700">
                    <BackButton className="bg-white dark:bg-gray-800 shadow-sm" />
                    <Text className="flex-1 text-center text-lg font-bold text-text-primary dark:text-white -ml-10">
                        Báo cáo người dùng
                    </Text>
                    <View className="w-10" />
                </View>

                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 32 }}
                >
                    <View className="px-4 pt-6">
                        {/* Info Card */}
                        <View className="mb-6 rounded-xl bg-blue-50 dark:bg-blue-900/20 p-4">
                            <View className="flex-row items-start gap-3">
                                <MaterialIcons name="info" size={24} color="#2563EB" />
                                <View className="flex-1">
                                    <Text className="mb-1 text-base font-semibold text-text-primary dark:text-white">
                                        Báo cáo người dùng: {userName || 'Người dùng'}
                                    </Text>
                                    <Text className="text-sm text-text-secondary dark:text-gray-400">
                                        Báo cáo của bạn sẽ được xem xét bởi đội ngũ hỗ trợ. Chúng tôi sẽ xử lý nghiêm túc mọi báo cáo để đảm bảo cộng đồng an toàn.
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Reason Selection */}
                        <Text className="mb-4 text-lg font-bold text-text-primary dark:text-white">
                            Chọn lý do báo cáo
                        </Text>

                        <View className="mb-6 gap-3">
                            {REPORT_REASONS.map((reason) => (
                                <TouchableOpacity
                                    key={reason.id}
                                    onPress={() => setSelectedReason(reason.id)}
                                    className={`rounded-xl border-2 p-4 ${selectedReason === reason.id
                                            ? 'border-primary bg-primary/10 dark:bg-primary/20'
                                            : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                                        }`}
                                >
                                    <View className="flex-row items-start gap-3">
                                        <View
                                            className={`h-10 w-10 items-center justify-center rounded-lg ${selectedReason === reason.id
                                                    ? 'bg-primary'
                                                    : 'bg-gray-100 dark:bg-gray-700'
                                                }`}
                                        >
                                            <MaterialIcons
                                                name={reason.icon as any}
                                                size={24}
                                                color={
                                                    selectedReason === reason.id
                                                        ? '#FFFFFF'
                                                        : '#6B7280'
                                                }
                                            />
                                        </View>
                                        <View className="flex-1">
                                            <Text
                                                className={`mb-1 text-base font-semibold ${selectedReason === reason.id
                                                        ? 'text-primary'
                                                        : 'text-text-primary dark:text-white'
                                                    }`}
                                            >
                                                {reason.label}
                                            </Text>
                                            <Text className="text-sm text-text-secondary dark:text-gray-400">
                                                {reason.description}
                                            </Text>
                                        </View>
                                        {selectedReason === reason.id && (
                                            <MaterialIcons
                                                name="check-circle"
                                                size={24}
                                                color="#2563EB"
                                            />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Description */}
                        <Text className="mb-2 text-lg font-bold text-text-primary dark:text-white">
                            Mô tả chi tiết
                        </Text>
                        <Text className="mb-3 text-sm text-text-secondary dark:text-gray-400">
                            Vui lòng mô tả chi tiết vấn đề để chúng tôi có thể xử lý tốt hơn (tối thiểu 10 ký tự)
                        </Text>

                        <TextInput
                            className="mb-6 min-h-[150px] rounded-xl border border-gray-300 bg-white p-4 text-base text-text-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            placeholder="Mô tả chi tiết vấn đề bạn gặp phải với người dùng này..."
                            placeholderTextColor="#9CA3AF"
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                            value={description}
                            onChangeText={setDescription}
                            editable={!loading}
                        />

                        {/* Submit Button */}
                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={loading || !selectedReason || description.trim().length < 10}
                            className={`mb-6 rounded-xl py-4 ${loading || !selectedReason || description.trim().length < 10
                                    ? 'bg-gray-400'
                                    : 'bg-red-600'
                                } shadow-lg`}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text className="text-center text-base font-bold text-white">
                                    Gửi báo cáo
                                </Text>
                            )}
                        </TouchableOpacity>

                        {/* Warning */}
                        <View className="rounded-xl bg-yellow-50 dark:bg-yellow-900/20 p-4">
                            <View className="flex-row items-start gap-3">
                                <MaterialIcons name="warning" size={20} color="#D97706" />
                                <View className="flex-1">
                                    <Text className="mb-1 text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                                        Lưu ý
                                    </Text>
                                    <Text className="text-xs text-yellow-700 dark:text-yellow-400">
                                        Báo cáo sai sự thật có thể dẫn đến việc tài khoản của bạn bị hạn chế. Vui lòng chỉ báo cáo khi có bằng chứng rõ ràng về hành vi vi phạm.
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </>
    );
}

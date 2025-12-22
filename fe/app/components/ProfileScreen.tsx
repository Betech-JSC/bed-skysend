// Shared Profile Screen Component for both Sender and Customer
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    Switch,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '@/reducers/userSlice';
import { RootState } from '@/store';
import api from '@/api/api';
import { API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { DEMO_AVATAR, getAvatarUrl } from '@/constants/avatars';
import { formatVND } from '@/utils/currencyFormatter';

interface UserProfile {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
    role: string;
    kyc_status?: 'pending' | 'verified' | 'rejected' | null;
}

interface RecentActivity {
    id: string | number;
    type: 'order' | 'request' | 'transaction';
    title: string;
    description: string;
    amount?: number;
    status?: string;
    createdAt: string;
    navigateTo?: string;
}

export default function ProfileScreen() {
    const router = useRouter();
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user);
    const role = user?.role || 'customer';
    const isSender = role === 'sender';

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [kycStatus, setKycStatus] = useState<string | null>(null);
    const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
    const [loadingActivities, setLoadingActivities] = useState(false);

    // Load user profile and KYC status
    useEffect(() => {
        loadUserProfile();
        // loadKycStatus();
        fetchRecentActivities();
    }, []);

    const loadUserProfile = async () => {
        try {
            setLoading(true);
            const response = await api.get('user/profile');
            if (response.data) {
                const userData = response.data.data?.user || response.data.data || response.data.user || response.data;

                // Xử lý avatar URL
                let avatarUrl = null;
                if (userData.avatar_url) {
                    avatarUrl = userData.avatar_url;
                } else if (userData.avatar) {
                    // Nếu là relative path, convert thành full URL
                    if (userData.avatar.startsWith('storage/') || userData.avatar.startsWith('avatars/')) {
                        const baseUrl = API_URL || 'http://localhost:8000';
                        avatarUrl = `${baseUrl}/storage/${userData.avatar.replace('storage/', '')}`;
                    } else if (userData.avatar.startsWith('http')) {
                        avatarUrl = userData.avatar;
                    }
                }

                setProfile({
                    id: userData.id || user?.id || '',
                    name: userData.name || user?.name || 'Người dùng',
                    email: userData.email || user?.email || '',
                    phone: userData.phone || user?.phone || 'Chưa có số điện thoại',
                    avatar: avatarUrl,
                    role: userData.role || user?.role || 'customer',
                    kyc_status: userData.kyc_status || null,
                });
            }
        } catch (error: any) {
            console.error('Error loading user profile:', error);
            // Fallback to Redux store data
            if (user) {
                setProfile({
                    id: user.id || '',
                    name: user.name || 'Người dùng',
                    email: user.email || '',
                    phone: user.phone || 'Chưa có số điện thoại',
                    avatar: (user as any).avatar || null,
                    role: user.role || 'customer',
                    kyc_status: null,
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const loadKycStatus = async () => {
        try {
            const response = await api.get('kyc/status');
            if (response.data?.success && response.data?.data) {
                setKycStatus(response.data.data.kyc_status);
            }
        } catch (error: any) {
            console.error('Error loading KYC status:', error);
        }
    };

    const toggleRole = async () => {
        if (!user) return;
        const newRole = isSender ? 'customer' : 'sender';

        try {
            const response = await api.post('user/switch-role', { role: newRole });

            if (response.data?.success) {
                // Cập nhật Redux store với role mới
                dispatch(setUser({ ...user, role: newRole }));

                // Cập nhật profile state
                if (profile) {
                    setProfile({ ...profile, role: newRole });
                }

                Alert.alert(
                    'Thành công',
                    `Đã chuyển sang vai trò ${newRole === 'sender' ? 'Người gửi' : 'Hành khách'}`,
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                // Reload app để cập nhật navigation tabs
                                router.replace(newRole === 'sender' ? '/(tabs)/(sender)/home' : '/(tabs)/(customer)/home_customer');
                            }
                        }
                    ]
                );
            } else {
                throw new Error(response.data?.message || 'Chuyển đổi vai trò thất bại');
            }
        } catch (error: any) {
            console.error('Error switching role:', error);
            Alert.alert(
                'Lỗi',
                error.response?.data?.message || error.message || 'Không thể chuyển đổi vai trò. Vui lòng thử lại.'
            );
        }
    };

    const logout = async () => {
        Alert.alert(
            'Xác nhận',
            'Bạn có chắc chắn muốn đăng xuất?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Đăng xuất',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.post('logout');
                            await AsyncStorage.removeItem('user');
                            Alert.alert('Đăng xuất thành công');
                            router.replace('/login');
                        } catch (error: any) {
                            Alert.alert('Lỗi', error.response?.data?.message || 'Đăng xuất thất bại');
                        }
                    },
                },
            ]
        );
    };

    const deleteAccount = async () => {
        Alert.alert(
            'Xác nhận xóa tài khoản',
            'Bạn có chắc chắn muốn xóa tài khoản vĩnh viễn?\n\nHành động này không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn.',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa tài khoản',
                    style: 'destructive',
                    onPress: async () => {
                        // Xác nhận lần 2
                        Alert.alert(
                            'Cảnh báo cuối cùng',
                            'Đây là lần xác nhận cuối cùng. Tài khoản của bạn sẽ bị xóa vĩnh viễn và không thể khôi phục.',
                            [
                                { text: 'Hủy', style: 'cancel' },
                                {
                                    text: 'Xác nhận xóa',
                                    style: 'destructive',
                                    onPress: async () => {
                                        try {
                                            setLoading(true);
                                            const response = await api.delete('user/account');

                                            if (response.data?.success) {
                                                // Xóa dữ liệu local và Redux state
                                                await AsyncStorage.removeItem('user');
                                                dispatch(setUser(null));

                                                Alert.alert(
                                                    'Thành công',
                                                    'Tài khoản của bạn đã được xóa vĩnh viễn.',
                                                    [
                                                        {
                                                            text: 'OK',
                                                            onPress: () => {
                                                                router.replace('/login');
                                                            }
                                                        }
                                                    ]
                                                );
                                            } else {
                                                throw new Error(response.data?.message || 'Xóa tài khoản thất bại');
                                            }
                                        } catch (error: any) {
                                            console.error('Error deleting account:', error);
                                            Alert.alert(
                                                'Lỗi',
                                                error.response?.data?.message || error.message || 'Không thể xóa tài khoản. Vui lòng thử lại.'
                                            );
                                        } finally {
                                            setLoading(false);
                                        }
                                    },
                                },
                            ]
                        );
                    },
                },
            ]
        );
    };

    const getAvatarUri = () => {
        return getAvatarUrl(profile?.avatar, API_URL);
    };

    // Format thời gian relative
    const formatRelativeTime = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            if (diffMins < 1) {
                return 'Vừa xong';
            } else if (diffMins < 60) {
                return `${diffMins} phút trước`;
            } else if (diffHours < 24) {
                return `${diffHours} giờ trước`;
            } else if (diffDays === 1) {
                return 'Hôm qua';
            } else if (diffDays < 7) {
                return `${diffDays} ngày trước`;
            } else {
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                return `${day}/${month}/${year}`;
            }
        } catch {
            return dateString;
        }
    };

    // Fetch recent activities
    const fetchRecentActivities = async () => {
        if (!user?.token) return;

        try {
            setLoadingActivities(true);
            const activities: RecentActivity[] = [];

            // Fetch orders
            try {
                const ordersResponse = await api.get('orders/getList', { params: { per_page: 5 } });
                let ordersData = [];
                if (ordersResponse.data?.success && ordersResponse.data?.data) {
                    if (ordersResponse.data.data?.data) {
                        ordersData = ordersResponse.data.data.data;
                    } else if (Array.isArray(ordersResponse.data.data)) {
                        ordersData = ordersResponse.data.data;
                    }
                }

                ordersData.forEach((order: any) => {
                    activities.push({
                        id: order.id || order.uuid,
                        type: 'order',
                        title: `Đơn hàng #${order.uuid || order.id}`,
                        description: order.flight
                            ? `${order.flight.from_airport} → ${order.flight.to_airport}`
                            : 'Đơn hàng',
                        amount: order.reward,
                        status: order.status,
                        createdAt: order.created_at || order.updated_at,
                        navigateTo: `/(tabs)/(sender)/list_orders`,
                    });
                });
            } catch (error) {
                console.error('Error fetching orders:', error);
            }

            // Fetch requests
            try {
                const requestsResponse = await api.get('private-requests', { params: { per_page: 5 } });
                let requestsData = [];
                if (requestsResponse.data?.data) {
                    if (requestsResponse.data.data?.data) {
                        requestsData = requestsResponse.data.data.data;
                    } else if (Array.isArray(requestsResponse.data.data)) {
                        requestsData = requestsResponse.data.data;
                    }
                } else if (Array.isArray(requestsResponse.data)) {
                    requestsData = requestsResponse.data;
                }

                requestsData.forEach((request: any) => {
                    const route = request.from_airport && request.to_airport
                        ? `${request.from_airport} → ${request.to_airport}`
                        : 'Request';

                    activities.push({
                        id: request.id || request.uuid,
                        type: 'request',
                        title: request.flight_id ? 'Request đã gửi' : 'Request chờ match',
                        description: route,
                        amount: request.reward,
                        status: request.status,
                        createdAt: request.created_at || request.updated_at,
                        navigateTo: request.flight_id
                            ? `/(tabs)/(sender)/list_orders`
                            : `/request_matches/${request.id}`,
                    });
                });
            } catch (error) {
                console.error('Error fetching requests:', error);
            }

            // Fetch transactions
            try {
                const transactionsResponse = await api.get('wallets/transactions', { params: { per_page: 5 } });
                let transactionsData = [];
                if (transactionsResponse.data?.success && transactionsResponse.data?.data) {
                    if (transactionsResponse.data.data?.data) {
                        transactionsData = transactionsResponse.data.data.data;
                    } else if (Array.isArray(transactionsResponse.data.data)) {
                        transactionsData = transactionsResponse.data.data;
                    }
                } else if (Array.isArray(transactionsResponse.data)) {
                    transactionsData = transactionsResponse.data;
                }

                transactionsData.forEach((transaction: any) => {
                    const isDeposit = transaction.type === 'deposit' || transaction.amount > 0;
                    activities.push({
                        id: transaction.id || transaction.uuid,
                        type: 'transaction',
                        title: isDeposit ? 'Nạp tiền' : 'Rút tiền',
                        description: transaction.description || transaction.note || 'Giao dịch ví',
                        amount: Math.abs(transaction.amount || 0),
                        status: transaction.status,
                        createdAt: transaction.created_at || transaction.updated_at,
                        navigateTo: undefined, // Có thể thêm màn hình wallet transactions sau
                    });
                });
            } catch (error) {
                console.error('Error fetching transactions:', error);
            }

            // Sort by createdAt (newest first)
            activities.sort((a, b) => {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return dateB - dateA;
            });

            // Limit to 10 most recent
            setRecentActivities(activities.slice(0, 10));
        } catch (error) {
            console.error('Error fetching recent activities:', error);
        } finally {
            setLoadingActivities(false);
        }
    };

    const getKycStatusBadge = () => {
        const status = kycStatus || profile?.kyc_status;

        switch (status) {
            case 'verified':
                return (
                    <View className="mt-3 flex-row items-center gap-2 rounded-full bg-green-100 px-3 py-1.5 dark:bg-green-900/40">
                        <MaterialIcons name="verified" size={18} color="#16A34A" />
                        <Text className="text-sm font-medium text-green-800 dark:text-green-300">
                            Đã xác minh danh tính
                        </Text>
                    </View>
                );
            case 'pending':
                return (
                    <View className="mt-3 flex-row items-center gap-2 rounded-full bg-yellow-100 px-3 py-1.5 dark:bg-yellow-900/40">
                        <MaterialIcons name="hourglass-empty" size={18} color="#D97706" />
                        <Text className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                            Đang chờ duyệt KYC
                        </Text>
                    </View>
                );
            case 'rejected':
                return (
                    <View className="mt-3 flex-row items-center gap-2 rounded-full bg-red-100 px-3 py-1.5 dark:bg-red-900/40">
                        <MaterialIcons name="cancel" size={18} color="#EF4444" />
                        <Text className="text-sm font-medium text-red-800 dark:text-red-300">
                            KYC bị từ chối
                        </Text>
                    </View>
                );
            default:
                return (
                    <View className="mt-3 flex-row items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 dark:bg-gray-800">
                        <MaterialIcons name="info" size={18} color="#6B7280" />
                        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Chưa xác minh danh tính
                        </Text>
                    </View>
                );
        }
    };

    if (loading) {
        return (
            <View className="flex-1 bg-background-light dark:bg-background-dark justify-center items-center">
                <ActivityIndicator size="large" color="#2563EB" />
                <Text className="mt-4 text-gray-600 dark:text-gray-400">Đang tải...</Text>
            </View>
        );
    }

    const displayProfile = profile || {
        id: user?.id || '',
        name: user?.name || 'Người dùng',
        email: user?.email || '',
        phone: user?.phone || 'Chưa có số điện thoại',
        avatar: null,
        role: user?.role || 'customer',
    };

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'Tài khoản',
                    headerTitle: 'Tài khoản',
                    headerTitleStyle: {
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: '#111318',
                    },
                }}
            />
            <View className="flex-1 bg-background-light dark:bg-background-dark">
                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Avatar + Info */}
                    <View className="items-center px-4 pt-8">
                        {/* Avatar temporarily hidden */}
                        {/* <View className="h-28 w-28 overflow-hidden rounded-full border-4 border-white shadow-xl">
                        <Image
                            source={{
                                uri: getAvatarUri(),
                            }}
                            className="h-full w-full"
                            resizeMode="cover"
                            defaultSource={require("@assets/images/avatar.webp")}
                        />
                    </View> */}

                        <Text className="mt-4 text-2xl font-bold text-text-primary dark:text-white">
                            {displayProfile.name}
                        </Text>
                        <Text className="mt-1 text-base text-text-secondary dark:text-slate-400">
                            {displayProfile.phone}
                        </Text>
                        {displayProfile.email && (
                            <Text className="mt-1 text-sm text-text-secondary dark:text-slate-400">
                                {displayProfile.email}
                            </Text>
                        )}

                        {/* Role Switch Button */}
                        <View className="mt-4 w-full max-w-xs">
                            <TouchableOpacity
                                onPress={toggleRole}
                                className="flex-row items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 shadow-lg active:opacity-90"
                            >
                                <MaterialIcons
                                    name={isSender ? "person" : "local-shipping"}
                                    size={20}
                                    color="#FFFFFF"
                                />
                                <Text className="text-base font-bold text-white">
                                    Chuyển sang {isSender ? 'Hành khách' : 'Người gửi'}
                                </Text>
                                <MaterialIcons name="swap-horiz" size={20} color="#FFFFFF" />
                            </TouchableOpacity>
                            <View className="mt-2 flex-row items-center justify-center gap-2">
                                <View className={`flex-row items-center gap-1 rounded-full px-3 py-1 ${isSender ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                    <MaterialIcons
                                        name="local-shipping"
                                        size={14}
                                        color={isSender ? "#2563EB" : "#6B7280"}
                                    />
                                    <Text className={`text-xs font-semibold ${isSender ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                        Người gửi
                                    </Text>
                                </View>
                                <View className={`flex-row items-center gap-1 rounded-full px-3 py-1 ${!isSender ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                    <MaterialIcons
                                        name="person"
                                        size={14}
                                        color={!isSender ? "#10B981" : "#6B7280"}
                                    />
                                    <Text className={`text-xs font-semibold ${!isSender ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                        Hành khách
                                    </Text>
                                </View>
                            </View>
                            <Text className="mt-2 text-center text-xs text-text-secondary dark:text-gray-400">
                                Vai trò hiện tại: <Text className="font-bold">{isSender ? 'Người gửi' : 'Hành khách'}</Text>
                            </Text>
                        </View>

                        {/* KYC Status Badge - Tạm thời ẩn */}
                        {/* {getKycStatusBadge()} */}
                    </View>

                    {/* Recent Activities Section */}
                    {recentActivities.length > 0 && (
                        <View className="mt-6 px-4">
                            <View className="mb-4 flex-row items-center justify-between">
                                <Text className="text-lg font-bold text-text-primary dark:text-white">
                                    Hoạt động gần đây
                                </Text>
                                <TouchableOpacity
                                    onPress={() => {
                                        if (isSender) {
                                            router.push('/(tabs)/(sender)/list_orders');
                                        } else {
                                            router.push('/(tabs)/(customer)/list_orders_customer');
                                        }
                                    }}>
                                    <Text className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                        Xem tất cả
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-slate-800/50">
                                {recentActivities.slice(0, 5).map((activity, index) => {
                                    const getIcon = () => {
                                        switch (activity.type) {
                                            case 'order':
                                                return { name: 'local-shipping' as const, color: '#2563EB' };
                                            case 'request':
                                                return { name: 'send' as const, color: '#F59E0B' };
                                            case 'transaction':
                                                const isDeposit = activity.amount && activity.amount > 0;
                                                return { name: 'account-balance-wallet' as const, color: isDeposit ? '#10B981' : '#EF4444' };
                                            default:
                                                return { name: 'info' as const, color: '#6B7280' };
                                        }
                                    };

                                    const getStatusBadge = () => {
                                        if (!activity.status) return null;

                                        const statusColors: { [key: string]: string } = {
                                            'pending': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                                            'completed': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                                            'cancelled': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                                            'accepted': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                                        };

                                        const statusLabels: { [key: string]: string } = {
                                            'pending': 'Đang chờ',
                                            'completed': 'Hoàn thành',
                                            'cancelled': 'Đã hủy',
                                            'accepted': 'Đã chấp nhận',
                                        };

                                        const colorClass = statusColors[activity.status] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
                                        const label = statusLabels[activity.status] || activity.status;

                                        return (
                                            <View className={`rounded-full px-2 py-0.5 ${colorClass}`}>
                                                <Text className="text-xs font-medium">{label}</Text>
                                            </View>
                                        );
                                    };

                                    const icon = getIcon();

                                    return (
                                        <TouchableOpacity
                                            key={`${activity.type}-${activity.id}-${index}`}
                                            onPress={() => {
                                                if (activity.navigateTo) {
                                                    router.push(activity.navigateTo as any);
                                                }
                                            }}
                                            className={`flex-row items-center justify-between px-4 py-3 ${index < recentActivities.slice(0, 5).length - 1 ? 'border-b border-gray-100 dark:border-slate-700' : ''}`}>
                                            <View className="flex-row items-center flex-1 gap-3">
                                                <View
                                                    className="h-10 w-10 items-center justify-center rounded-lg"
                                                    style={{ backgroundColor: `${icon.color}20` }}>
                                                    <MaterialIcons name={icon.name} size={20} color={icon.color} />
                                                </View>
                                                <View className="flex-1">
                                                    <Text className="text-sm font-semibold text-text-primary dark:text-white" numberOfLines={1}>
                                                        {activity.title}
                                                    </Text>
                                                    <Text className="mt-0.5 text-xs text-gray-600 dark:text-gray-400" numberOfLines={1}>
                                                        {activity.description}
                                                    </Text>
                                                    <View className="mt-1 flex-row items-center gap-2">
                                                        <Text className="text-xs text-gray-500 dark:text-gray-500">
                                                            {formatRelativeTime(activity.createdAt)}
                                                        </Text>
                                                        {activity.amount && (
                                                            <Text className="text-xs font-medium text-green-600 dark:text-green-400">
                                                                {formatVND(activity.amount)} VNĐ
                                                            </Text>
                                                        )}
                                                    </View>
                                                </View>
                                            </View>
                                            <View className="ml-2 items-end">
                                                {getStatusBadge()}
                                                {activity.navigateTo && (
                                                    <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" style={{ marginTop: 4 }} />
                                                )}
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    )}

                    {/* Empty state for activities */}
                    {!loadingActivities && recentActivities.length === 0 && (
                        <View className="mt-6 px-4">
                            <View className="items-center rounded-xl bg-white py-8 dark:bg-slate-800/50">
                                <MaterialIcons name="history" size={48} color="#9CA3AF" />
                                <Text className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                                    Chưa có hoạt động nào
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Menu List */}
                    <View className="mt-8 px-4 gap-y-4 pb-20">
                        {/* Group 1 - Tạm thời ẩn chức năng xác thực */}
                        {/* <View className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-slate-800/50">
                        <TouchableOpacity
                            onPress={() => router.push('/update_profile')}
                            className="flex-row items-center justify-between px-4 py-4"
                        >
                            <View className="flex-row items-center gap-4">
                                <View className="h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                    <MaterialIcons name="person" size={24} color="#2563EB" />
                                </View>
                                <Text className="text-base font-medium text-text-primary dark:text-white">
                                    Hồ sơ & Xác minh KYC
                                </Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color="#6B7280" />
                        </TouchableOpacity>

                        <View className="mx-4 border-t border-slate-100 dark:border-slate-700" />

                    </View> */}

                        {/* Group 2 */}
                        <View className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-slate-800/50">
                            <TouchableOpacity
                                onPress={() => router.push('/terms-and-conditions')}
                                className="flex-row items-center justify-between px-4 py-4"
                            >
                                <View className="flex-row items-center gap-4">
                                    <View className="h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                        <MaterialIcons name="gavel" size={24} color="#2563EB" />
                                    </View>
                                    <Text className="text-base font-medium text-text-primary dark:text-white">
                                        Hợp đồng & Điều khoản
                                    </Text>
                                </View>
                                <MaterialIcons name="chevron-right" size={24} color="#6B7280" />
                            </TouchableOpacity>

                            <View className="mx-4 border-t border-slate-100 dark:border-slate-700" />

                            <TouchableOpacity
                                onPress={() => router.push('/support-center')}
                                className="flex-row items-center justify-between px-4 py-4"
                            >
                                <View className="flex-row items-center gap-4">
                                    <View className="h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                        <Ionicons name="help-circle" size={24} color="#2563EB" />
                                    </View>
                                    <Text className="text-base font-medium text-text-primary dark:text-white">
                                        Trung tâm hỗ trợ
                                    </Text>
                                </View>
                                <MaterialIcons name="chevron-right" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        {/* Xóa tài khoản */}
                        <TouchableOpacity
                            onPress={deleteAccount}
                            disabled={loading}
                            className="flex-row items-center gap-4 rounded-xl bg-white px-4 py-4 shadow-sm dark:bg-slate-800/50"
                        >
                            <View className="h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-500/20">
                                <MaterialIcons name="delete-forever" size={24} color="#DC2626" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-base font-medium text-red-600 dark:text-red-400">
                                    Xóa tài khoản vĩnh viễn
                                </Text>
                                <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Hành động này không thể hoàn tác
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* Đăng xuất */}
                        <TouchableOpacity
                            onPress={logout}
                            className="flex-row items-center gap-4 rounded-xl bg-white px-4 py-4 shadow-sm dark:bg-slate-800/50"
                        >
                            <View className="h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-500/20">
                                <MaterialIcons name="logout" size={24} color="#EA580C" />
                            </View>
                            <Text className="text-base font-medium text-orange-600 dark:text-orange-400">
                                Đăng xuất
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </>
    );
}


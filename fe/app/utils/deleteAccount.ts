import { Alert } from 'react-native';
import { setUser } from '@/reducers/userSlice';
import api from '@/api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types for router and dispatch
type Router = {
    replace: (path: string) => void;
    push: (path: string) => void;
};

type Dispatch = (action: any) => void;

/**
 * Shared utility function for account deletion
 * Provides detailed information about what data will be deleted
 */
export const showDeleteAccountConfirmation = (
    onConfirm: () => Promise<void>
) => {
    const dataToBeDeleted = [
        '• Hồ sơ cá nhân (tên, email, số điện thoại, avatar)',
        '• Lịch sử đơn hàng và yêu cầu vận chuyển',
        '• Tất cả tin nhắn chat',
        '• Ví điện tử và lịch sử giao dịch',
        '• Dữ liệu xác minh KYC (nếu có)',
        '• Token đăng nhập và phiên làm việc',
    ];

    Alert.alert(
        'Xác nhận xóa tài khoản',
        `Bạn có chắc chắn muốn xóa tài khoản vĩnh viễn?\n\nKhi xóa tài khoản, tất cả dữ liệu sau sẽ bị xóa vĩnh viễn:\n\n${dataToBeDeleted.join('\n')}\n\n⚠️ Lưu ý: Hành động này không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn và không thể khôi phục.`,
        [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Tôi hiểu và muốn xóa',
                style: 'destructive',
                onPress: () => {
                    // Xác nhận lần 2
                    Alert.alert(
                        'Cảnh báo cuối cùng',
                        'Đây là lần xác nhận cuối cùng. Tài khoản của bạn sẽ bị xóa vĩnh viễn và không thể khôi phục.\n\nBạn có chắc chắn muốn tiếp tục?',
                        [
                            { text: 'Hủy', style: 'cancel' },
                            {
                                text: 'Xác nhận xóa vĩnh viễn',
                                style: 'destructive',
                                onPress: onConfirm,
                            },
                        ]
                    );
                },
            },
        ]
    );
};

/**
 * Execute account deletion
 */
export const executeDeleteAccount = async (
    router: Router,
    dispatch: Dispatch
): Promise<void> => {
    try {
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
                        },
                    },
                ]
            );
        } else {
            throw new Error(response.data?.message || 'Xóa tài khoản thất bại');
        }
    } catch (error: any) {
        console.error('Error deleting account:', error);
        Alert.alert(
            'Lỗi',
            error.response?.data?.message ||
                error.message ||
                'Không thể xóa tài khoản. Vui lòng thử lại.'
        );
        throw error;
    }
};


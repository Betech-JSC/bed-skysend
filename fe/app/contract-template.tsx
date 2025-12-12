import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';

export default function ContractTemplateScreen() {
    const router = useRouter();
    const isDark = useColorScheme() === 'dark';
    const [accepted, setAccepted] = useState(false);

    const handleAccept = () => {
        if (!accepted) {
            Alert.alert('Thông báo', 'Vui lòng đọc và chấp nhận hợp đồng trước khi tiếp tục.');
            return;
        }

        Alert.alert(
            'Đã chấp nhận',
            'Bạn đã chấp nhận hợp đồng mẫu. Quay lại màn hình trước để tiếp tục.',
            [
                {
                    text: 'OK',
                    onPress: () => router.back(),
                },
            ]
        );
    };

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'Hợp đồng mẫu',
                    headerTitle: 'Hợp đồng mẫu',
                    headerTitleStyle: {
                        fontSize: 18,
                        fontWeight: 'bold',
                    },
                }}
            />
            <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View className="mb-6 items-center">
                        <Text className="text-2xl font-bold text-text-primary dark:text-white mb-2">
                            HỢP ĐỒNG DỊCH VỤ GỬI HÀNG
                        </Text>
                        <Text className="text-base text-text-secondary dark:text-gray-400">
                            Giữa SkySend và Người sử dụng dịch vụ
                        </Text>
                    </View>

                    {/* Contract Content */}
                    <View className="gap-6">
                        {/* Điều 1 */}
                        <View>
                            <Text className="text-lg font-bold text-text-primary dark:text-white mb-2">
                                ĐIỀU 1: ĐỐI TƯỢNG VÀ PHẠM VI ÁP DỤNG
                            </Text>
                            <Text className="text-sm leading-6 text-text-secondary dark:text-gray-300">
                                1.1. Hợp đồng này được ký kết giữa Công ty SkySend (sau đây gọi là "SkySend") và người sử dụng dịch vụ (sau đây gọi là "Người dùng") thông qua nền tảng ứng dụng SkySend.
                                {'\n\n'}
                                1.2. Hợp đồng này điều chỉnh việc cung cấp và sử dụng dịch vụ gửi hàng qua hành khách đi máy bay, bao gồm việc kết nối giữa người gửi hàng (Sender) và hành khách (Customer).
                            </Text>
                        </View>

                        {/* Điều 2 */}
                        <View>
                            <Text className="text-lg font-bold text-text-primary dark:text-white mb-2">
                                ĐIỀU 2: QUYỀN VÀ NGHĨA VỤ CỦA NGƯỜI DÙNG
                            </Text>
                            <Text className="text-sm leading-6 text-text-secondary dark:text-gray-300">
                                2.1. Người dùng cam kết cung cấp thông tin chính xác, đầy đủ và trung thực khi đăng ký và sử dụng dịch vụ.
                                {'\n\n'}
                                2.2. Người gửi hàng (Sender) có trách nhiệm:
                                {'\n'}• Mô tả chính xác loại hàng hóa, giá trị và đặc tính của hàng hóa cần gửi.
                                {'\n'}• Đảm bảo hàng hóa không thuộc danh mục cấm vận chuyển theo quy định của pháp luật.
                                {'\n'}• Thanh toán đầy đủ phần thưởng và phí dịch vụ theo thỏa thuận.
                                {'\n\n'}
                                2.3. Hành khách (Customer) có trách nhiệm:
                                {'\n'}• Vận chuyển hàng hóa an toàn từ điểm đi đến điểm đến.
                                {'\n'}• Bảo quản hàng hóa trong suốt quá trình vận chuyển.
                                {'\n'}• Giao hàng đúng thời gian và địa điểm đã thỏa thuận.
                            </Text>
                        </View>

                        {/* Điều 3 */}
                        <View>
                            <Text className="text-lg font-bold text-text-primary dark:text-white mb-2">
                                ĐIỀU 3: QUYỀN VÀ NGHĨA VỤ CỦA SKYSEND
                            </Text>
                            <Text className="text-sm leading-6 text-text-secondary dark:text-gray-300">
                                3.1. SkySend có trách nhiệm:
                                {'\n'}• Cung cấp nền tảng kết nối giữa Sender và Customer.
                                {'\n'}• Xác minh thông tin người dùng và chuyến bay.
                                {'\n'}• Hỗ trợ giải quyết tranh chấp phát sinh.
                                {'\n'}• Bảo mật thông tin cá nhân của người dùng.
                                {'\n\n'}
                                3.2. SkySend không chịu trách nhiệm về:
                                {'\n'}• Tổn thất, hư hỏng hàng hóa do lỗi của Customer hoặc Sender.
                                {'\n'}• Hàng hóa bị cấm vận chuyển theo quy định pháp luật.
                                {'\n'}• Các sự kiện bất khả kháng.
                            </Text>
                        </View>

                        {/* Điều 4 */}
                        <View>
                            <Text className="text-lg font-bold text-text-primary dark:text-white mb-2">
                                ĐIỀU 4: THANH TOÁN VÀ PHÍ DỊCH VỤ
                            </Text>
                            <Text className="text-sm leading-6 text-text-secondary dark:text-gray-300">
                                4.1. Sender thanh toán phần thưởng cho Customer và phí dịch vụ cho SkySend thông qua hệ thống thanh toán của nền tảng.
                                {'\n\n'}
                                4.2. SkySend sẽ giữ tiền (escrow) cho đến khi đơn hàng được hoàn thành thành công.
                                {'\n\n'}
                                4.3. Trong trường hợp hủy đơn hàng, việc hoàn tiền sẽ được thực hiện theo chính sách của SkySend.
                            </Text>
                        </View>

                        {/* Điều 5 */}
                        <View>
                            <Text className="text-lg font-bold text-text-primary dark:text-white mb-2">
                                ĐIỀU 5: BẢO HIỂM VÀ TRÁCH NHIỆM
                            </Text>
                            <Text className="text-sm leading-6 text-text-secondary dark:text-gray-300">
                                5.1. SkySend khuyến nghị người dùng mua bảo hiểm cho hàng hóa có giá trị cao.
                                {'\n\n'}
                                5.2. Trách nhiệm bồi thường được xác định dựa trên giá trị hàng hóa đã khai báo và các điều khoản cụ thể trong từng đơn hàng.
                                {'\n\n'}
                                5.3. SkySend có quyền từ chối hoặc hủy đơn hàng nếu phát hiện vi phạm điều khoản hoặc pháp luật.
                            </Text>
                        </View>

                        {/* Điều 6 */}
                        <View>
                            <Text className="text-lg font-bold text-text-primary dark:text-white mb-2">
                                ĐIỀU 6: BẢO MẬT THÔNG TIN
                            </Text>
                            <Text className="text-sm leading-6 text-text-secondary dark:text-gray-300">
                                6.1. SkySend cam kết bảo mật thông tin cá nhân của người dùng theo quy định của pháp luật về bảo vệ dữ liệu cá nhân.
                                {'\n\n'}
                                6.2. Người dùng không được tiết lộ thông tin liên hệ trực tiếp cho bên kia ngoài kênh chính thức của SkySend.
                            </Text>
                        </View>

                        {/* Điều 7 */}
                        <View>
                            <Text className="text-lg font-bold text-text-primary dark:text-white mb-2">
                                ĐIỀU 7: GIẢI QUYẾT TRANH CHẤP
                            </Text>
                            <Text className="text-sm leading-6 text-text-secondary dark:text-gray-300">
                                7.1. Mọi tranh chấp phát sinh sẽ được ưu tiên giải quyết thông qua thương lượng giữa các bên.
                                {'\n\n'}
                                7.2. Nếu không thể thương lượng, tranh chấp sẽ được giải quyết tại Tòa án có thẩm quyền tại Việt Nam.
                            </Text>
                        </View>

                        {/* Điều 8 */}
                        <View>
                            <Text className="text-lg font-bold text-text-primary dark:text-white mb-2">
                                ĐIỀU 8: ĐIỀU KHOẢN CHUNG
                            </Text>
                            <Text className="text-sm leading-6 text-text-secondary dark:text-gray-300">
                                8.1. Hợp đồng này có hiệu lực từ thời điểm người dùng chấp nhận và sử dụng dịch vụ.
                                {'\n\n'}
                                8.2. SkySend có quyền cập nhật, sửa đổi các điều khoản và sẽ thông báo cho người dùng trước ít nhất 7 ngày.
                                {'\n\n'}
                                8.3. Việc tiếp tục sử dụng dịch vụ sau khi có thay đổi được coi là chấp nhận các điều khoản mới.
                            </Text>
                        </View>

                        {/* Footer */}
                        <View className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                            <Text className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                                Liên hệ hỗ trợ:
                            </Text>
                            <Text className="text-sm text-blue-700 dark:text-blue-300">
                                Email: support@skysend.com
                                {'\n'}Hotline: (+84) 0775600351
                            </Text>
                        </View>
                    </View>
                </ScrollView>

                {/* Accept Button - Sticky Footer */}
                <View className="absolute bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-2xl">
                    <TouchableOpacity
                        onPress={() => setAccepted(!accepted)}
                        className="mb-4 flex-row items-center gap-3"
                    >
                        <View className={`h-6 w-6 rounded border-2 items-center justify-center ${accepted ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-600 bg-transparent'}`}>
                            {accepted && <MaterialIcons name="check" size={18} color="white" />}
                        </View>
                        <Text className="flex-1 text-sm font-medium text-text-primary dark:text-white">
                            Tôi đã đọc và đồng ý với các điều khoản trong hợp đồng mẫu này
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleAccept}
                        className={`w-full rounded-lg py-4 ${accepted ? 'bg-primary' : 'bg-gray-400'} shadow-lg`}
                    >
                        <Text className="text-center text-base font-bold text-white">
                            Chấp nhận hợp đồng
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </>
    );
}

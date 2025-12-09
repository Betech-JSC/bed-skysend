import React from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, Linking } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import BackButton from './components/BackButton';

export default function TermsAndConditionsScreen() {
    const router = useRouter();
    const { colorScheme } = useColorScheme();

    const openLink = async (url: string) => {
        try {
            await Linking.openURL(url);
        } catch (err) {
            console.warn('Cannot open url', url, err);
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
                {/* Header with Back Button */}
                <View className="flex-row items-center justify-between px-4 pt-4 pb-3 bg-background-light dark:bg-background-dark">
                    <BackButton className="bg-white dark:bg-gray-800 shadow-sm" />
                    <Text className="flex-1 text-center text-lg font-bold text-text-primary dark:text-white -ml-10">
                        Hợp đồng & Điều khoản
                    </Text>
                    <View className="w-10" />
                </View>

                <ScrollView
                    contentContainerStyle={{ padding: 16 }}
                    showsVerticalScrollIndicator={false}
                    className="flex-1"
                >
                    <Text className="text-sm text-text-secondary dark:text-gray-400 mb-6">
                        Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
                    </Text>

                    <View className="mb-6">
                        <Text className="text-lg font-bold text-text-primary dark:text-white mb-3">
                            1. Điều khoản sử dụng dịch vụ
                        </Text>
                        <Text className="text-sm text-text-secondary dark:text-gray-300 leading-6 mb-2">
                            Bằng việc sử dụng ứng dụng Skysend, bạn đồng ý tuân thủ và bị ràng buộc bởi các điều khoản và điều kiện sau đây. Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, vui lòng không sử dụng dịch vụ của chúng tôi.
                        </Text>
                    </View>

                    <View className="mb-6">
                        <Text className="text-lg font-bold text-text-primary dark:text-white mb-3">
                            2. Định nghĩa
                        </Text>
                        <View className="pl-3">
                            <Text className="text-sm text-text-secondary dark:text-gray-300 leading-6 mb-2">
                                • <Text className="font-semibold">Người gửi (Sender):</Text> Người sử dụng dịch vụ để gửi hàng hóa, tài liệu hoặc đồ vật.
                            </Text>
                            <Text className="text-sm text-text-secondary dark:text-gray-300 leading-6 mb-2">
                                • <Text className="font-semibold">Người nhận (Customer):</Text> Người nhận hàng hóa, tài liệu hoặc đồ vật.
                            </Text>
                            <Text className="text-sm text-text-secondary dark:text-gray-300 leading-6 mb-2">
                                • <Text className="font-semibold">Hành khách (Passenger):</Text> Người có chuyến bay và có thể vận chuyển hàng hóa.
                            </Text>
                            <Text className="text-sm text-text-secondary dark:text-gray-300 leading-6 mb-2">
                                • <Text className="font-semibold">Đơn hàng (Order):</Text> Yêu cầu vận chuyển được tạo trên nền tảng Skysend.
                            </Text>
                        </View>
                    </View>

                    <View className="mb-6">
                        <Text className="text-lg font-bold text-text-primary dark:text-white mb-3">
                            3. Quyền và trách nhiệm của người dùng
                        </Text>
                        <View className="pl-3">
                            <Text className="text-sm text-text-secondary dark:text-gray-300 leading-6 mb-2">
                                • Cung cấp thông tin chính xác, đầy đủ và cập nhật khi đăng ký và sử dụng dịch vụ.
                            </Text>
                            <Text className="text-sm text-text-secondary dark:text-gray-300 leading-6 mb-2">
                                • Chịu trách nhiệm về tính hợp pháp của hàng hóa được gửi.
                            </Text>
                            <Text className="text-sm text-text-secondary dark:text-gray-300 leading-6 mb-2">
                                • Không được gửi các mặt hàng cấm như vũ khí, chất cấm, hàng hóa nguy hiểm.
                            </Text>
                            <Text className="text-sm text-text-secondary dark:text-gray-300 leading-6 mb-2">
                                • Thanh toán đầy đủ và đúng hạn các khoản phí dịch vụ.
                            </Text>
                            <Text className="text-sm text-text-secondary dark:text-gray-300 leading-6 mb-2">
                                • Bảo mật thông tin tài khoản và không chia sẻ với bên thứ ba.
                            </Text>
                        </View>
                    </View>

                    <View className="mb-6">
                        <Text className="text-lg font-bold text-text-primary dark:text-white mb-3">
                            4. Quyền và trách nhiệm của Skysend
                        </Text>
                        <View className="pl-3">
                            <Text className="text-sm text-text-secondary dark:text-gray-300 leading-6 mb-2">
                                • Cung cấp nền tảng kết nối giữa người gửi và hành khách.
                            </Text>
                            <Text className="text-sm text-text-secondary dark:text-gray-300 leading-6 mb-2">
                                • Đảm bảo tính bảo mật và an toàn của thông tin người dùng.
                            </Text>
                            <Text className="text-sm text-text-secondary dark:text-gray-300 leading-6 mb-2">
                                • Hỗ trợ giải quyết tranh chấp giữa các bên khi có yêu cầu.
                            </Text>
                            <Text className="text-sm text-text-secondary dark:text-gray-300 leading-6 mb-2">
                                • Có quyền từ chối hoặc chấm dứt dịch vụ đối với người dùng vi phạm điều khoản.
                            </Text>
                        </View>
                    </View>

                    <View className="mb-6">
                        <Text className="text-lg font-bold text-text-primary dark:text-white mb-3">
                            5. Thanh toán và phí dịch vụ
                        </Text>
                        <Text className="text-sm text-text-secondary dark:text-gray-300 leading-6 mb-2">
                            Phí dịch vụ được tính dựa trên khoảng cách, trọng lượng, kích thước và loại hàng hóa. Người dùng đồng ý thanh toán theo phương thức đã chọn trên ứng dụng. Skysend có quyền điều chỉnh phí dịch vụ và sẽ thông báo trước khi có thay đổi.
                        </Text>
                    </View>

                    <View className="mb-6">
                        <Text className="text-lg font-bold text-text-primary dark:text-white mb-3">
                            6. Bồi thường và giới hạn trách nhiệm
                        </Text>
                        <Text className="text-sm text-text-secondary dark:text-gray-300 leading-6 mb-2">
                            Skysend là nền tảng kết nối và không chịu trách nhiệm trực tiếp về việc vận chuyển hàng hóa. Trách nhiệm vận chuyển thuộc về hành khách. Trong trường hợp hàng hóa bị hư hỏng hoặc thất lạc, Skysend sẽ hỗ trợ giải quyết tranh chấp giữa các bên theo quy định hiện hành.
                        </Text>
                        <Text className="text-sm text-text-secondary dark:text-gray-300 leading-6 mb-2 mt-2">
                            Giá trị bồi thường tối đa không vượt quá giá trị hàng hóa được khai báo tại thời điểm tạo đơn hàng.
                        </Text>
                    </View>

                    <View className="mb-6">
                        <Text className="text-lg font-bold text-text-primary dark:text-white mb-3">
                            7. Hàng hóa cấm vận chuyển
                        </Text>
                        <View className="pl-3">
                            <Text className="text-sm text-text-secondary dark:text-gray-300 leading-6 mb-2">
                                • Vũ khí, đạn dược, chất nổ
                            </Text>
                            <Text className="text-sm text-text-secondary dark:text-gray-300 leading-6 mb-2">
                                • Chất ma túy, chất gây nghiện
                            </Text>
                            <Text className="text-sm text-text-secondary dark:text-gray-300 leading-6 mb-2">
                                • Hàng hóa dễ cháy nổ, chất độc hại
                            </Text>
                            <Text className="text-sm text-text-secondary dark:text-gray-300 leading-6 mb-2">
                                • Động vật sống (trừ trường hợp được phép)
                            </Text>
                            <Text className="text-sm text-text-secondary dark:text-gray-300 leading-6 mb-2">
                                • Tiền mặt, vàng, kim cương, đá quý
                            </Text>
                            <Text className="text-sm text-text-secondary dark:text-gray-300 leading-6 mb-2">
                                • Hàng hóa vi phạm pháp luật hoặc quy định của hãng hàng không
                            </Text>
                        </View>
                    </View>

                    <View className="mb-6">
                        <Text className="text-lg font-bold text-text-primary dark:text-white mb-3">
                            8. Bảo mật thông tin
                        </Text>
                        <Text className="text-sm text-text-secondary dark:text-gray-300 leading-6 mb-2">
                            Skysend cam kết bảo vệ thông tin cá nhân của người dùng theo Chính sách Bảo mật. Thông tin sẽ được mã hóa và chỉ được sử dụng cho mục đích cung cấp dịch vụ.
                        </Text>
                    </View>

                    <View className="mb-6">
                        <Text className="text-lg font-bold text-text-primary dark:text-white mb-3">
                            9. Chấm dứt dịch vụ
                        </Text>
                        <Text className="text-sm text-text-secondary dark:text-gray-300 leading-6 mb-2">
                            Skysend có quyền tạm ngưng hoặc chấm dứt tài khoản của người dùng nếu vi phạm điều khoản sử dụng, có hành vi gian lận, hoặc gây ảnh hưởng đến uy tín của nền tảng.
                        </Text>
                    </View>

                    <View className="mb-6">
                        <Text className="text-lg font-bold text-text-primary dark:text-white mb-3">
                            10. Giải quyết tranh chấp
                        </Text>
                        <Text className="text-sm text-text-secondary dark:text-gray-300 leading-6 mb-2">
                            Mọi tranh chấp phát sinh sẽ được ưu tiên giải quyết thông qua thương lượng. Nếu không đạt được thỏa thuận, tranh chấp sẽ được giải quyết tại Tòa án có thẩm quyền theo pháp luật Việt Nam.
                        </Text>
                    </View>

                    <View className="mb-6">
                        <Text className="text-lg font-bold text-text-primary dark:text-white mb-3">
                            11. Thay đổi điều khoản
                        </Text>
                        <Text className="text-sm text-text-secondary dark:text-gray-300 leading-6 mb-2">
                            Skysend có quyền cập nhật, sửa đổi các điều khoản này. Người dùng sẽ được thông báo về các thay đổi quan trọng. Việc tiếp tục sử dụng dịch vụ sau khi có thay đổi được coi là đồng ý với các điều khoản mới.
                        </Text>
                    </View>

                    <View className="mb-6">
                        <Text className="text-lg font-bold text-text-primary dark:text-white mb-3">
                            12. Liên hệ
                        </Text>
                        <Text className="text-sm text-text-secondary dark:text-gray-300 leading-6 mb-2">
                            Nếu bạn có câu hỏi về các điều khoản này, vui lòng liên hệ với chúng tôi:
                        </Text>
                        <TouchableOpacity
                            onPress={() => openLink('mailto:legal@skysend.app')}
                            className="mt-2"
                        >
                            <Text className="text-sm text-primary font-medium">
                                Email: legal@skysend.app
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => openLink('tel:+84190000000')}
                            className="mt-2"
                        >
                            <Text className="text-sm text-primary font-medium">
                                Hotline: 1900 0000
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </SafeAreaView>
        </>
    );
}

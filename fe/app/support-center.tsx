import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, TextInput, Alert, Linking } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import AccordionItem from './components/AccordionItem';
import BackButton from './components/BackButton';

type TabType = 'faq' | 'contact' | 'report';

export default function SupportCenterScreen() {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const [activeTab, setActiveTab] = useState<TabType>('faq');
    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });
    const [reportForm, setReportForm] = useState({
        orderId: '',
        issueType: '',
        description: '',
    });
    const [submitting, setSubmitting] = useState(false);

    const faqs = [
        {
            question: 'Làm thế nào để đặt đơn hàng?',
            answer: 'Bạn có thể đặt đơn hàng bằng cách: 1) Chọn điểm gửi và điểm nhận trên bản đồ, 2) Nhập thông tin hàng hóa (trọng lượng, kích thước, mô tả), 3) Chọn hành khách phù hợp từ danh sách, 4) Xác nhận và thanh toán.',
        },
        {
            question: 'Làm thế nào để tìm hành khách vận chuyển?',
            answer: 'Sau khi đăng chuyến bay của bạn, hệ thống sẽ tự động hiển thị các yêu cầu vận chuyển phù hợp. Bạn có thể xem thông tin người gửi, hàng hóa và chọn chấp nhận hoặc từ chối yêu cầu.',
        },
        {
            question: 'Phí dịch vụ được tính như thế nào?',
            answer: 'Phí dịch vụ được tính dựa trên: khoảng cách vận chuyển, trọng lượng hàng hóa, kích thước, loại hàng hóa và thời gian giao hàng. Bạn sẽ thấy chi phí chi tiết trước khi xác nhận đơn hàng.',
        },
        {
            question: 'Tôi có thể hủy đơn hàng không?',
            answer: 'Có, bạn có thể hủy đơn hàng trước khi hành khách chấp nhận. Sau khi được chấp nhận, việc hủy có thể phải chịu phí hủy theo quy định. Vui lòng liên hệ hỗ trợ để được hướng dẫn cụ thể.',
        },
        {
            question: 'Làm thế nào để theo dõi đơn hàng?',
            answer: 'Bạn có thể theo dõi đơn hàng trong mục "Đơn hàng" của ứng dụng. Hệ thống sẽ cập nhật trạng thái: Đã đặt, Đã chấp nhận, Đang vận chuyển, Đã giao hàng.',
        },
        {
            question: 'Nếu hàng hóa bị hư hỏng thì sao?',
            answer: 'Nếu hàng hóa bị hư hỏng trong quá trình vận chuyển, bạn có thể báo cáo vấn đề trong ứng dụng. Chúng tôi sẽ điều tra và hỗ trợ giải quyết theo quy định bồi thường. Vui lòng chụp ảnh minh chứng khi nhận hàng.',
        },
        {
            question: 'Tôi có thể thanh toán bằng cách nào?',
            answer: 'Hiện tại Skysend hỗ trợ thanh toán qua: Ví điện tử, Thẻ ngân hàng, Chuyển khoản. Bạn có thể cài đặt phương thức thanh toán trong phần Cài đặt.',
        },
        {
            question: 'Làm thế nào để trở thành hành khách vận chuyển?',
            answer: 'Để trở thành hành khách, bạn cần: 1) Đăng ký tài khoản và chọn vai trò "Hành khách", 2) Xác minh KYC (cung cấp CMND/CCCD), 3) Đăng chuyến bay của bạn, 4) Chấp nhận các yêu cầu vận chuyển phù hợp.',
        },
        {
            question: 'Skysend hoạt động ở đâu?',
            answer: 'Hiện tại Skysend hoạt động tại các sân bay và thành phố lớn ở Việt Nam. Chúng tôi đang mở rộng dịch vụ đến nhiều địa điểm hơn. Vui lòng kiểm tra trong ứng dụng để xem khu vực hoạt động.',
        },
        {
            question: 'Tôi có thể liên hệ hỗ trợ như thế nào?',
            answer: 'Bạn có thể liên hệ hỗ trợ qua: Email (support@skysend.app), Hotline ((+84) 0775600351), Chat trong ứng dụng, hoặc gửi yêu cầu hỗ trợ trong mục "Trung tâm hỗ trợ".',
        },
    ];

    const issueTypes = [
        'Hàng hóa bị hư hỏng',
        'Hàng hóa bị thất lạc',
        'Giao hàng chậm trễ',
        'Thông tin không chính xác',
        'Vấn đề thanh toán',
        'Hành vi không đúng mực',
        'Khác',
    ];

    const handleContactSubmit = async () => {
        if (!contactForm.name || !contactForm.email || !contactForm.message) {
            Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ thông tin bắt buộc.');
            return;
        }

        setSubmitting(true);
        try {
            // TODO: Gửi API request
            await new Promise(resolve => setTimeout(resolve, 1000));
            Alert.alert('Thành công', 'Yêu cầu hỗ trợ của bạn đã được gửi. Chúng tôi sẽ phản hồi trong vòng 24 giờ.');
            setContactForm({ name: '', email: '', phone: '', subject: '', message: '' });
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể gửi yêu cầu. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReportSubmit = async () => {
        if (!reportForm.orderId || !reportForm.issueType || !reportForm.description) {
            Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ thông tin báo cáo.');
            return;
        }

        setSubmitting(true);
        try {
            // TODO: Gửi API request
            await new Promise(resolve => setTimeout(resolve, 1000));
            Alert.alert('Thành công', 'Báo cáo của bạn đã được gửi. Chúng tôi sẽ xử lý và phản hồi sớm nhất.');
            setReportForm({ orderId: '', issueType: '', description: '' });
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể gửi báo cáo. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

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
                <View className="flex-row items-center justify-between px-4 pt-4 pb-3 bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-gray-700">
                    <BackButton className="bg-white dark:bg-gray-800 shadow-sm" />
                    <Text className="flex-1 text-center text-lg font-bold text-text-primary dark:text-white -ml-10">
                        Trung tâm hỗ trợ
                    </Text>
                    <View className="w-10" />
                </View>

                {/* Tabs */}
                <View className="flex-row bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <TouchableOpacity
                        onPress={() => setActiveTab('faq')}
                        className={`flex-1 py-4 items-center border-b-2 ${activeTab === 'faq' ? 'border-primary' : 'border-transparent'
                            }`}
                    >
                        <Text
                            className={`font-semibold ${activeTab === 'faq'
                                ? 'text-primary'
                                : 'text-gray-500 dark:text-gray-400'
                                }`}
                        >
                            FAQ
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTab('contact')}
                        className={`flex-1 py-4 items-center border-b-2 ${activeTab === 'contact' ? 'border-primary' : 'border-transparent'
                            }`}
                    >
                        <Text
                            className={`font-semibold ${activeTab === 'contact'
                                ? 'text-primary'
                                : 'text-gray-500 dark:text-gray-400'
                                }`}
                        >
                            Liên hệ
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTab('report')}
                        className={`flex-1 py-4 items-center border-b-2 ${activeTab === 'report' ? 'border-primary' : 'border-transparent'
                            }`}
                    >
                        <Text
                            className={`font-semibold ${activeTab === 'report'
                                ? 'text-primary'
                                : 'text-gray-500 dark:text-gray-400'
                                }`}
                        >
                            Báo cáo
                        </Text>
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    {activeTab === 'faq' && (
                        <View className="p-4">
                            <View className="mb-4">
                                <Text className="text-xl font-bold text-text-primary dark:text-white mb-2">
                                    Câu hỏi thường gặp
                                </Text>
                                <Text className="text-sm text-text-secondary dark:text-gray-400">
                                    Tìm câu trả lời cho các thắc mắc phổ biến
                                </Text>
                            </View>

                            <View className="mt-4">
                                {faqs.map((item, index) => (
                                    <AccordionItem
                                        key={index}
                                        question={item.question}
                                        answer={item.answer}
                                    />
                                ))}
                            </View>

                            <View className="mt-6 p-4 bg-primary/10 dark:bg-primary/20 rounded-xl">
                                <Text className="text-sm font-semibold text-text-primary dark:text-white mb-2">
                                    Không tìm thấy câu trả lời?
                                </Text>
                                <Text className="text-sm text-text-secondary dark:text-gray-400 mb-3">
                                    Liên hệ với chúng tôi để được hỗ trợ trực tiếp
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setActiveTab('contact')}
                                    className="bg-primary px-4 py-2 rounded-lg self-start"
                                >
                                    <Text className="text-white font-semibold">Liên hệ ngay</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {activeTab === 'contact' && (
                        <View className="p-4">
                            <View className="mb-6">
                                <Text className="text-xl font-bold text-text-primary dark:text-white mb-2">
                                    Liên hệ hỗ trợ
                                </Text>
                                <Text className="text-sm text-text-secondary dark:text-gray-400">
                                    Gửi yêu cầu hỗ trợ và chúng tôi sẽ phản hồi trong vòng 24 giờ
                                </Text>
                            </View>

                            {/* Quick Contact */}
                            <View className="mb-6 gap-3">
                                <TouchableOpacity
                                    onPress={() => openLink('mailto:support@skysend.app')}
                                    className="flex-row items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm"
                                >
                                    <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-3">
                                        <MaterialIcons name="email" size={24} color="#2563EB" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-sm text-text-secondary dark:text-gray-400">
                                            Email
                                        </Text>
                                        <Text className="text-base font-semibold text-text-primary dark:text-white">
                                            support@skysend.app
                                        </Text>
                                    </View>
                                    <MaterialIcons name="chevron-right" size={24} color="#6B7280" />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => openLink('tel:+84190000000')}
                                    className="flex-row items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm"
                                >
                                    <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-3">
                                        <MaterialIcons name="phone" size={24} color="#2563EB" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-sm text-text-secondary dark:text-gray-400">
                                            Hotline
                                        </Text>
                                        <Text className="text-base font-semibold text-text-primary dark:text-white">
                                            (+84) 0775600351
                                        </Text>
                                    </View>
                                    <MaterialIcons name="chevron-right" size={24} color="#6B7280" />
                                </TouchableOpacity>
                            </View>

                            {/* Contact Form */}
                            <View className="mb-4">
                                <Text className="text-base font-semibold text-text-primary dark:text-white mb-4">
                                    Gửi yêu cầu hỗ trợ
                                </Text>

                                <View className="mb-4">
                                    <Text className="text-sm font-medium text-text-secondary dark:text-gray-400 mb-2">
                                        Họ và tên <Text className="text-red-500">*</Text>
                                    </Text>
                                    <TextInput
                                        className="h-12 px-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-base text-text-primary dark:text-white"
                                        placeholder="Nhập họ và tên"
                                        placeholderTextColor="#9CA3AF"
                                        value={contactForm.name}
                                        onChangeText={(v) => setContactForm({ ...contactForm, name: v })}
                                    />
                                </View>

                                <View className="mb-4">
                                    <Text className="text-sm font-medium text-text-secondary dark:text-gray-400 mb-2">
                                        Email <Text className="text-red-500">*</Text>
                                    </Text>
                                    <TextInput
                                        className="h-12 px-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-base text-text-primary dark:text-white"
                                        placeholder="Nhập email"
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType="email-address"
                                        value={contactForm.email}
                                        onChangeText={(v) => setContactForm({ ...contactForm, email: v })}
                                    />
                                </View>

                                <View className="mb-4">
                                    <Text className="text-sm font-medium text-text-secondary dark:text-gray-400 mb-2">
                                        Số điện thoại
                                    </Text>
                                    <TextInput
                                        className="h-12 px-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-base text-text-primary dark:text-white"
                                        placeholder="Nhập số điện thoại"
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType="phone-pad"
                                        value={contactForm.phone}
                                        onChangeText={(v) => setContactForm({ ...contactForm, phone: v })}
                                    />
                                </View>

                                <View className="mb-4">
                                    <Text className="text-sm font-medium text-text-secondary dark:text-gray-400 mb-2">
                                        Chủ đề
                                    </Text>
                                    <TextInput
                                        className="h-12 px-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-base text-text-primary dark:text-white"
                                        placeholder="Nhập chủ đề"
                                        placeholderTextColor="#9CA3AF"
                                        value={contactForm.subject}
                                        onChangeText={(v) => setContactForm({ ...contactForm, subject: v })}
                                    />
                                </View>

                                <View className="mb-4">
                                    <Text className="text-sm font-medium text-text-secondary dark:text-gray-400 mb-2">
                                        Nội dung <Text className="text-red-500">*</Text>
                                    </Text>
                                    <TextInput
                                        className="min-h-[120px] px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-base text-text-primary dark:text-white"
                                        placeholder="Mô tả chi tiết vấn đề của bạn..."
                                        placeholderTextColor="#9CA3AF"
                                        multiline
                                        textAlignVertical="top"
                                        value={contactForm.message}
                                        onChangeText={(v) => setContactForm({ ...contactForm, message: v })}
                                    />
                                </View>

                                <TouchableOpacity
                                    onPress={handleContactSubmit}
                                    disabled={submitting}
                                    className={`bg-primary py-4 rounded-xl ${submitting ? 'opacity-70' : ''}`}
                                >
                                    <Text className="text-white text-center text-base font-semibold">
                                        {submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {activeTab === 'report' && (
                        <View className="p-4">
                            <View className="mb-6">
                                <Text className="text-xl font-bold text-text-primary dark:text-white mb-2">
                                    Báo cáo vấn đề
                                </Text>
                                <Text className="text-sm text-text-secondary dark:text-gray-400">
                                    Báo cáo các vấn đề liên quan đến đơn hàng hoặc dịch vụ
                                </Text>
                            </View>

                            <View className="mb-4">
                                <Text className="text-sm font-medium text-text-secondary dark:text-gray-400 mb-2">
                                    Mã đơn hàng <Text className="text-red-500">*</Text>
                                </Text>
                                <TextInput
                                    className="h-12 px-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-base text-text-primary dark:text-white"
                                    placeholder="Nhập mã đơn hàng"
                                    placeholderTextColor="#9CA3AF"
                                    value={reportForm.orderId}
                                    onChangeText={(v) => setReportForm({ ...reportForm, orderId: v })}
                                />
                            </View>

                            <View className="mb-4">
                                <Text className="text-sm font-medium text-text-secondary dark:text-gray-400 mb-2">
                                    Loại vấn đề <Text className="text-red-500">*</Text>
                                </Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {issueTypes.map((type) => (
                                        <TouchableOpacity
                                            key={type}
                                            onPress={() => setReportForm({ ...reportForm, issueType: type })}
                                            className={`px-4 py-2 rounded-full border ${reportForm.issueType === type
                                                ? 'bg-primary border-primary'
                                                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700'
                                                }`}
                                        >
                                            <Text
                                                className={`text-sm ${reportForm.issueType === type
                                                    ? 'text-white font-semibold'
                                                    : 'text-text-primary dark:text-white'
                                                    }`}
                                            >
                                                {type}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View className="mb-4">
                                <Text className="text-sm font-medium text-text-secondary dark:text-gray-400 mb-2">
                                    Mô tả chi tiết <Text className="text-red-500">*</Text>
                                </Text>
                                <TextInput
                                    className="min-h-[120px] px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-base text-text-primary dark:text-white"
                                    placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
                                    placeholderTextColor="#9CA3AF"
                                    multiline
                                    textAlignVertical="top"
                                    value={reportForm.description}
                                    onChangeText={(v) => setReportForm({ ...reportForm, description: v })}
                                />
                            </View>

                            <TouchableOpacity
                                onPress={handleReportSubmit}
                                disabled={submitting}
                                className={`bg-primary py-4 rounded-xl mb-4 ${submitting ? 'opacity-70' : ''}`}
                            >
                                <Text className="text-white text-center text-base font-semibold">
                                    {submitting ? 'Đang gửi...' : 'Gửi báo cáo'}
                                </Text>
                            </TouchableOpacity>

                            <View className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                                <View className="flex-row items-start gap-2">
                                    <MaterialIcons name="info" size={20} color="#D97706" />
                                    <View className="flex-1">
                                        <Text className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                                            Lưu ý
                                        </Text>
                                        <Text className="text-xs text-yellow-700 dark:text-yellow-300">
                                            Vui lòng cung cấp thông tin chính xác và đầy đủ để chúng tôi có thể xử lý báo cáo của bạn một cách nhanh chóng. Nếu có thể, hãy đính kèm hình ảnh minh chứng.
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}

                    <View style={{ height: 40 }} />
                </ScrollView>
            </SafeAreaView>
        </>
    );
}

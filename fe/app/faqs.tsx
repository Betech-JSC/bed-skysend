import React from 'react';
import { ScrollView, View, Text, StyleSheet, Image } from 'react-native';
import AccordionItem from './components/AccordionItem';

export default function FaqsScreen() {
    const faqs = [
        {
            question: 'Sky là gì?',
            answer:
                'Sky là ứng dụng kết nối người cần gửi hàng gấp với những người nhận hàng hộ qua máy bay. Bạn có thể gửi hàng hóa, tài liệu hoặc đồ quan trọng một cách nhanh chóng và an toàn.',
        },
        {
            question: 'Làm thế nào để đặt đơn hàng?',
            answer:
                'Chỉ cần nhập thông tin điểm gửi, điểm nhận, mô tả hàng hóa và xác nhận. Hệ thống sẽ tự động kết nối với người nhận phù hợp để vận chuyển hàng qua máy bay.',
        },
        {
            question: 'Tôi có thể theo dõi đơn hàng không?',
            answer:
                'Có! Bạn có thể theo dõi trạng thái đơn hàng và vị trí người nhận theo thời gian thực để biết hàng hóa đang được vận chuyển tới đâu.',
        },
        {
            question: 'Nếu hàng hóa bị hư hỏng hoặc thất lạc thì sao?',
            answer:
                'Sky cam kết hỗ trợ bồi thường theo quy định nếu hàng hóa bị hư hỏng hoặc thất lạc trong quá trình vận chuyển qua người nhận và máy bay.',
        },
        {
            question: 'Phí gửi hàng được tính như thế nào?',
            answer:
                'Phí gửi hàng được tính dựa trên khoảng cách, trọng lượng, loại hàng hóa và mức độ gấp của đơn hàng. Chi phí sẽ hiển thị trước khi bạn xác nhận đặt đơn.',
        },
        {
            question: 'Sky hoạt động ở khu vực nào?',
            answer:
                'Hiện tại Sky hoạt động tại các thành phố lớn như TP.HCM, Hà Nội và sẽ mở rộng thêm ở các địa phương khác trong thời gian tới.',
        },
    ];

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Câu hỏi thường gặp</Text>
                <Text style={styles.subtitle}>
                    Giải đáp các thắc mắc phổ biến của người dùng SkySend
                </Text>
            </View>

            <View style={{ marginTop: 10 }}>
                {faqs.map((item, index) => (
                    <AccordionItem
                        key={index}
                        question={item.question}
                        answer={item.answer}
                    />
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 16,
    },
    header: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#222',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginTop: 4,
    },
});

import React, { useState } from "react";
import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity, TextInput, Image, ScrollView, Pressable, Alert } from "react-native";
import api from "@/api/api";

function CreateOrder() {
    const router = useRouter();

    // State to hold form data
    const [formData, setFormData] = useState({
        role: "sender", // Assuming the user is the sender
        shipment_description: "",
        pickup_location: "",
        delivery_location: "",
        flight_number: "",
        flight_time: "",
        package_weight: "",
        package_dimensions: "",
        special_instructions: "",
        images: [] // assuming you'll handle images later
    });

    // Handle form input changes
    const handleInputChange = (name, value) => {
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    // Handle form submission
    const handleSubmit = async () => {
        try {
            const response = await api.post('orders/create', formData);

            if (response.status === 200) {
                Alert.alert('Tạo đơn thành công!', 'Đơn hàng của bạn đã được tạo.');
                router.push('/order_success'); // Navigate to success page
            } else {
                Alert.alert('Tạo đơn thất bại', response.data.message || 'Vui lòng thử lại.');
            }
        } catch (error) {
            console.log(error);
            Alert.alert("Lỗi mạng", "Không thể kết nối đến server. Vui lòng thử lại.");
        }
    };

    return (
        <>
            <View className="p-4 h-full">
                <ScrollView className="space-y-[12px]">
                    <View className="space-y-[12px] bg-white p-[12px] rounded-[12px]">
                        <Text className="text-lg text-[#0F172A] mb-2">Hành trình của bạn</Text>
                        {/* Pickup and Delivery Locations */}
                        <TextInput
                            className="p-4 border border-gray-300 rounded-[16px] text-lg w-full"
                            placeholder="Điểm khởi hành"
                            value={formData.pickup_location}
                            onChangeText={(text) => handleInputChange("pickup_location", text)}
                        />
                        <TextInput
                            className="p-4 border border-gray-300 rounded-[16px] text-lg w-full"
                            placeholder="Điểm đến"
                            value={formData.delivery_location}
                            onChangeText={(text) => handleInputChange("delivery_location", text)}
                        />
                    </View>

                    <View className="space-y-[12px] bg-white p-[12px] rounded-[12px]">
                        <Text className="text-lg text-[#0F172A] mb-2">Hàng hóa</Text>
                        <TextInput
                            className="p-4 border border-gray-300 rounded-[16px] text-lg w-full"
                            placeholder="Giá trị hàng hóa"
                            value={formData.shipment_description}
                            onChangeText={(text) => handleInputChange("shipment_description", text)}
                        />
                        <TextInput
                            className="p-4 border border-gray-300 rounded-[16px] text-lg w-full"
                            placeholder="Cân nặng ước tính"
                            value={formData.package_weight}
                            onChangeText={(text) => handleInputChange("package_weight", text)}
                        />
                    </View>
                </ScrollView>

                <View className="absolute inset-x-0 bottom-0 space-y-[16px] px-[20px] bg-white py-[40px]">
                    <View className="flex-row justify-between items-center">
                        <Text>Chi phí đơn hàng</Text>
                        <Text className="text-[#109283] font-medium">50.000 vnđ</Text>
                    </View>
                    <Pressable onPress={handleSubmit}>
                        <View className="bg-[#FFD700] rounded-[12px] py-[16px]">
                            <Text className="text-[#0F172A] font-semibold text-center">Tạo đơn</Text>
                        </View>
                    </Pressable>
                </View>
            </View>
        </>
    );
}

export default CreateOrder;

import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity, TextInput, Image, ScrollView, Pressable, Alert } from "react-native";
import { MaterialIcons } from '@expo/vector-icons'; // Icons
import DateTimePicker from '@react-native-community/datetimepicker'; // Date Picker
import { launchImageLibrary } from 'react-native-image-picker'; // Image Picker
import api from "@/api/api";
import AsyncStorage from '@react-native-async-storage/async-storage';

function CreateOrder() {
    const router = useRouter();

    // State to hold form data
    const [formData, setFormData] = useState({
        role: 'sender',
        shipment_description: "",
        pickup_location: "",
        delivery_location: "",
        flight_number: "",
        flight_time: new Date(),
        package_weight: "",
        package_dimensions: "",
        special_instructions: "",
        images: [],
    });

    // State to manage date picker visibility
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Use useEffect to fetch data from AsyncStorage when the component mounts
    useEffect(() => {
        const fetchRole = async () => {
            const role = await AsyncStorage.getItem('role');  // Get role from AsyncStorage
            if (role) {
                setFormData(prevData => ({
                    ...prevData,
                    role: role,  // Update the role in the state
                }));
            }
        };

        fetchRole();
    }, []);

    const handleInputChange = (name, value) => {
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    // Handle Date Picker change
    const handleDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || formData.flight_time;
        setShowDatePicker(false);
        setFormData({
            ...formData,
            flight_time: currentDate,
        });
    };

    // Handle image selection
    const handleImagePick = () => {
        launchImageLibrary({ mediaType: 'photo', quality: 1 }, (response) => {
            if (response.assets && response.assets.length > 0) {
                const selectedImage = response.assets[0];
                setFormData({
                    ...formData,
                    images: [...formData.images, selectedImage.uri], // Add image URI to state
                });
            }
        });
    };

    // Handle form submission
    const handleSubmit = async () => {
        try {
            const response = await api.post('orders/create', formData);

            if (response.status === 200) {
                Alert.alert('Tạo đơn thành công!', 'Đơn hàng của bạn đã được tạo.');
                router.push('/create_order_success'); // Navigate to success page
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
                        <Text className="text-lg text-[#0F172A] mb-2">Thời gian khởi hành</Text>
                        {/* Date Picker for Flight Time */}
                        <TouchableOpacity
                            onPress={() => setShowDatePicker(true)}
                            className="flex-row items-center justify-between bg-white border border-[#D0D5DD] p-3 rounded-xl w-full"
                        >
                            <Text className="ml-2 text-base text-gray-800">
                                {formData.flight_time.toLocaleString()}
                            </Text>
                            <MaterialIcons name="calendar-today" size={24} color="blue" />
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker
                                value={formData.flight_time}
                                mode="datetime"
                                display="default"
                                onChange={handleDateChange}
                            />
                        )}
                    </View>

                    <View className="space-y-[12px] bg-white p-[12px] rounded-[12px]">
                        <Text className="text-lg text-[#0F172A] mb-2">Hàng hóa</Text>
                        <View className="flex-row items-center space-x-[12px]">
                            <View className="flex-row items-center  border border-[#D0D5DD] space-x-[12px] py-[8px] px-[8px] rounded-[10px]">
                                <Image source={require("../../assets/images/box.webp")} className="w-[24px]" />
                                <Text>Hộp</Text>
                            </View>
                            <View className="flex-row items-center  border border-[#D0D5DD] space-x-[12px] py-[8px] px-[8px] rounded-[10px]">
                                <Image source={require("../../assets/images/document.webp")} className="w-[24px]" />
                                <Text>Tài liệu</Text>
                            </View>
                            <View className="flex-row items-center  border border-[#D0D5DD] space-x-[12px] py-[8px] px-[8px] rounded-[10px]">
                                <Image source={require("../../assets/images/orther.webp")} className="w-[24px]" />
                                <Text>Khác</Text>
                            </View>
                        </View>
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
                    {/* Image Upload Section */}
                    <View className="space-y-[12px] bg-white p-[12px] rounded-[12px]">
                        <View className="flex-row justify-center items-center py-[24px] border border-dashed border-[#D0D5DD] rounded-[12px]">
                            <View className="flex-col items-center justify-center space-y-[12px]">
                                <TouchableOpacity onPress={handleImagePick}>
                                    <Image source={require("../../assets/images/upload.webp")} className="w-[28px]" />
                                    <Text>Tải ảnh hàng hóa</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <Text>*Đăng 1–3 ảnh chụp thực tế của kiện hàng. Ảnh giúp tăng độ tin cậy và an toàn khi vận chuyển</Text>
                        <View>
                            <Text className="text-[#0F172A] font-semibold">Ảnh đã tải lên:</Text>
                            {formData.images.length > 0 && (
                                <View className=" flex-row space-x-2">
                                    {formData.images.map((image, index) => (
                                        <Image key={index} source={{ uri: image }} className="w-[100px] h-[100px] mt-2" />
                                    ))}
                                </View>
                            )}
                        </View>
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

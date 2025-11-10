import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity, TextInput, Image, ScrollView, Pressable, Alert } from "react-native";
import { MaterialIcons } from '@expo/vector-icons'; // Icons
import DateTimePicker from '@react-native-community/datetimepicker'; // Date Picker
import { launchImageLibrary } from 'react-native-image-picker'; // Image Picker
import api from "@/api/api";
import LocationForm from "../components/LocationForm";
import PackageSelector from "../components/PackageSelector";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

function CreateOrder() {
    const router = useRouter();

    const user = useSelector((state: RootState) => state.user);
    const role = user?.role;

    const [formData, setFormData] = useState({
        role: role,
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
                router.push({
                    pathname: '/create_order_success',
                    params: { order: response.data.data.order.id },
                }); // Navigate to success page
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
                <ScrollView className="gap-y-[12px]">
                    <View className="gap-y-[12px] bg-white p-[12px] rounded-[12px]">
                        <Text className="text-lg text-[#0F172A] mb-2">Hành trình của bạn</Text>
                        {/* Pickup and Delivery Locations */}
                        <LocationForm formData={formData} handleInputChange={handleInputChange} />
                    </View>

                    {/* <View className="gap-y-[12px] bg-white p-[12px] rounded-[12px]">
                        <Text className="text-lg text-[#0F172A] mb-2">Thời gian khởi hành</Text>
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
                    </View> */}

                    <View className="gap-y-[12px] bg-white p-[12px] rounded-[12px]">
                        <Text className="text-lg text-[#0F172A] mb-2">Hàng hóa</Text>
                        <PackageSelector formData={formData} handleInputChange={handleInputChange} />
                        <TextInput
                            className="p-4 border border-gray-300 rounded-[16px] text-lg w-full"
                            placeholder="Cân nặng ước tính (kg)"
                            keyboardType="numeric"
                            value={formData.package_weight}
                            onChangeText={(text) => {
                                const numericText = text.replace(/[^0-9.]/g, '');
                                handleInputChange("package_weight", numericText);
                            }}
                        />

                        <TextInput
                            className="p-4 border border-gray-300 rounded-[16px] text-lg w-full"
                            placeholder="Ghi chú"
                            value={formData.shipment_description}
                            onChangeText={(text) => handleInputChange("shipment_description", text)}
                            multiline={true}
                            numberOfLines={4}
                            textAlignVertical="top"
                            style={{ minHeight: 120 }}
                        />
                    </View>
                    {/* Image Upload Section */}
                    <View className="gap-y-[12px] bg-white p-[12px] rounded-[12px] pb-[80px]">
                        <View className="flex-row justify-center items-center py-[24px] border border-dashed border-[#D0D5DD] rounded-[12px]">
                            <View className="flex-col items-center justify-center ">
                                <TouchableOpacity onPress={handleImagePick} className="gap-y-[12px]">
                                    <View className="flex-row justify-center"><Image source={require("@assets/images/upload.webp")} className="w-[28px]" /></View>
                                    <Text>Tải ảnh hàng hóa</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <Text>*Đăng 1–3 ảnh chụp thực tế của kiện hàng. Ảnh giúp tăng độ tin cậy và an toàn khi vận chuyển</Text>
                        <View>
                            <Text className="text-[#0F172A] font-semibold">Ảnh đã tải lên:</Text>
                            {formData.images.length > 0 && (
                                <View className=" flex-row gap-x-2 justify-center items-center">
                                    {formData.images.map((image, index) => (
                                        <Image key={index} source={{ uri: image }} className="w-[100px] h-[100px] mt-2" />
                                    ))}
                                </View>
                            )}
                        </View>
                    </View>
                </ScrollView>

                <View className="absolute inset-x-0 bottom-0 px-[20px] bg-white pb-[20px]">
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

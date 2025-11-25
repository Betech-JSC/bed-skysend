// KycVerificationScreen.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StatusBar,
    Alert,
    Image,
} from 'react-native';
import { useColorScheme } from 'nativewind';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function KycVerificationScreen({ navigation }: any) {
    const { colorScheme } = useColorScheme();

    const [fullName, setFullName] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [dob, setDob] = useState('');
    const [frontImage, setFrontImage] = useState<string | null>(null);
    const [backImage, setBackImage] = useState<string | null>(null);

    const pickImage = async (side: 'front' | 'back') => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Quyền truy cập', 'Cần cấp quyền truy cập thư viện ảnh!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            allowsEditing: true,
            aspect: [3, 2],
        });

        if (!result.canceled && result.assets[0].uri) {
            if (side === 'front') setFrontImage(result.assets[0].uri);
            else setBackImage(result.assets[0].uri);
        }
    };

    const submitKyc = () => {
        if (!fullName || !idNumber || !dob || !frontImage || !backImage) {
            Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ và tải lên cả hai mặt CMND/CCCD');
            return;
        }
        Alert.alert('Thành công', 'Thông tin KYC đã được gửi đi xét duyệt!');
        navigation.goBack();
    };

    return (
        <SafeAreaView className="flex-1 bg-background-light">
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View className="flex-row items-center justify-between px-4 pt-4 pb-3 border-b border-gray-200">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="h-10 w-10 items-center justify-center rounded-full hover:bg-gray-200"
                >
                    <MaterialIcons name="arrow-back" size={28} color="#111318" />
                </TouchableOpacity>

                <Text className="flex-1 text-center text-lg font-bold text-[#111318] -ml-10">
                    Xác minh danh tính (KYC)
                </Text>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
                {/* Hướng dẫn */}
                <Text className="text-sm text-gray-600 text-center mt-2 px-2">
                    Vui lòng cung cấp thông tin chính xác để đảm bảo an toàn và tăng độ tin cậy. Thông tin của bạn sẽ được bảo mật.
                </Text>

                {/* Form thông tin cá nhân */}
                <View className="mt-6 space-y-5">
                    {/* Họ và tên */}
                    <View>
                        <Text className="text-base font-medium text-gray-800 mb-2">Họ và tên</Text>
                        <TextInput
                            value={fullName}
                            onChangeText={setFullName}
                            placeholder="Nhập họ và tên của bạn"
                            placeholderTextColor="#9CA3AF"
                            className="h-14 px-4 bg-white border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-primary/50 focus:border-primary"
                        />
                    </View>

                    {/* Số CMND/CCCD */}
                    <View>
                        <Text className="text-base font-medium text-gray-800 mb-2">Số CMND/CCCD</Text>
                        <TextInput
                            value={idNumber}
                            onChangeText={setIdNumber}
                            placeholder="Nhập số CMND/CCCD"
                            keyboardType="numeric"
                            placeholderTextColor="#9CA3AF"
                            className="h-14 px-4 bg-white border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-primary/50 focus:border-primary"
                        />
                    </View>

                    {/* Ngày sinh */}
                    <View>
                        <Text className="text-base font-medium text-gray-800 mb-2">Ngày sinh</Text>
                        <TextInput
                            value={dob}
                            onFocus={() => {
                                // Có thể dùng DateTimePicker ở đây
                                Alert.alert('Chọn ngày', 'Dùng DatePicker thực tế ở production');
                            }}
                            placeholder="dd/mm/yyyy"
                            placeholderTextColor="#9CA3AF"
                            className="h-14 px-4 bg-white border border-gray-300 rounded-xl text-base text-gray-500"
                            editable={false}
                        />
                    </View>
                </View>

                {/* Upload CMND/CCCD */}
                <View className="mt-8">
                    <Text className="text-base font-medium text-gray-800 mb-4">
                        Tải lên ảnh CMND/CCCD
                    </Text>

                    <View className="grid grid-cols-2 gap-4">
                        {/* Mặt trước */}
                        <TouchableOpacity
                            onPress={() => pickImage('front')}
                            className="bg-white border-2 border-dashed border-gray-300 rounded-xl aspect-[3/2] items-center justify-center p-4 hover:border-primary"
                        >
                            {frontImage ? (
                                <Image source={{ uri: frontImage }} className="w-full h-full rounded-lg" resizeMode="cover" />
                            ) : (
                                <>
                                    <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center mb-2">
                                        <MaterialIcons name="add-a-photo" size={36} color="#2563EB" />
                                    </View>
                                    <Text className="text-sm font-medium text-gray-800">Mặt trước</Text>
                                    <Text className="text-xs text-gray-500 mt-1">Nhấn để tải lên</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {/* Mặt sau */}
                        <TouchableOpacity
                            onPress={() => pickImage('back')}
                            className="bg-white border-2 border-dashed border-gray-300 rounded-xl aspect-[3/2] items-center justify-center p-4 hover:border-primary"
                        >
                            {backImage ? (
                                <Image source={{ uri: backImage }} className="w-full h-full rounded-lg" resizeMode="cover" />
                            ) : (
                                <>
                                    <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center mb-2">
                                        <MaterialIcons name="add-a-photo" size={36} color="#2563EB" />
                                    </View>
                                    <Text className="text-sm font-medium text-gray-800">Mặt sau</Text>
                                    <Text className="text-xs text-gray-500 mt-1">Nhấn để tải lên</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="h-32" />
            </ScrollView>

            {/* Sticky Footer Button */}
            dik      <View className="absolute bottom-0 left-0 right-0 bg-background-light p-4 pt-2 border-t border-gray-200">
                <TouchableOpacity
                    onPress={submitKyc}
                    className="h-14 w-full bg-primary rounded-xl items-center justify-center shadow-lg shadow-primary/30"
                >
                    <Text className="text-white text-base font-bold">Gửi xác minh</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
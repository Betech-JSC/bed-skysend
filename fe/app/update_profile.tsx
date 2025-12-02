import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    Alert,
    ScrollView,
    Image,
    ActivityIndicator,
    Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import api from "@/api/api";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { setUser } from "@/reducers/userSlice";

export default function ProfileUpdate() {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        password_confirmation: "",
    });

    const [avatar, setAvatar] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
                password: "",
                password_confirmation: "",
            });
            setAvatar(user.avatar || null);
        }
    }, [user]);

    const handleInputChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert("Quyền truy cập", "Vui lòng cấp quyền truy cập thư viện ảnh.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
        });

        if (!result.canceled && result.assets[0].uri) {
            setAvatar(result.assets[0].uri);
        }
    };

    const handleUpdate = async () => {
        const { name, email, phone, password, password_confirmation } = formData;

        if (!name || !email) {
            Alert.alert("Thiếu thông tin", "Vui lòng nhập đầy đủ họ tên và email.");
            return;
        }

        setLoading(true);

        try {
            const data = new FormData();
            data.append("name", name);
            data.append("email", email);
            data.append("phone", phone);
            if (password) {
                data.append("password", password);
                data.append("password_confirmation", password_confirmation);
            }

            // Xử lý avatar - chỉ upload nếu là ảnh mới (local URI)
            if (avatar && !avatar.startsWith("http") && !avatar.startsWith("https")) {
                // Lấy tên file từ URI
                const filename = avatar.split("/").pop() || `avatar_${Date.now()}.jpg`;
                // Xác định type từ extension
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image/jpeg`;
                
                // Tạo file object cho FormData (React Native)
                const fileUri = Platform.OS === 'android' ? avatar : avatar.replace('file://', '');
                data.append("avatar", {
                    uri: fileUri,
                    name: filename,
                    type: type,
                } as any);
            }

            const response = await api.put("user/profile", data, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (response.status === 200 && response.data?.user) {
                // Cập nhật user với avatar URL từ backend nếu có
                const updatedUser = {
                    ...response.data.user,
                    avatar: response.data.avatar_url || response.data.user.avatar || user.avatar,
                    token: user.token, // Giữ nguyên token
                };
                dispatch(setUser(updatedUser));
                
                // Cập nhật avatar local nếu có URL mới
                if (response.data.avatar_url) {
                    setAvatar(response.data.avatar_url);
                }
                
                Alert.alert("Thành công", "Cập nhật thông tin thành công!");
            } else {
                const message =
                    response.data?.message ||
                    Object.values(response.data?.errors || {}).join("\n") ||
                    "Vui lòng thử lại.";
                Alert.alert("Cập nhật thất bại", message);
            }
        } catch (error: any) {
            console.error("Error updating profile:", error);
            
            // Xử lý lỗi validation
            if (error.response?.status === 422 && error.response?.data?.errors) {
                const errors = error.response.data.errors;
                const errorMessages = Object.entries(errors)
                    .map(([field, messages]: [string, any]) => {
                        const fieldName = field === 'password_confirmation' ? 'Xác nhận mật khẩu' :
                                         field === 'name' ? 'Họ tên' :
                                         field === 'email' ? 'Email' :
                                         field === 'phone' ? 'Số điện thoại' :
                                         field === 'avatar' ? 'Ảnh đại diện' : field;
                        return `${fieldName}: ${Array.isArray(messages) ? messages.join(', ') : messages}`;
                    })
                    .join('\n');
                Alert.alert("Lỗi xác thực", errorMessages);
            } else if (error.response?.data?.message) {
                Alert.alert("Lỗi", error.response.data.message);
            } else if (error.message) {
                Alert.alert("Lỗi", error.message);
            } else {
                Alert.alert("Lỗi mạng", "Không thể kết nối đến server. Vui lòng thử lại.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView className="flex-1 bg-white px-5 py-6">
            <Text className="text-2xl font-bold mb-6">Cập nhật thông tin</Text>

            {/* Avatar */}
            <Pressable onPress={pickImage} className="mb-6 items-center">
                <Image
                    source={avatar ? { uri: avatar } : require("@assets/images/avatar.webp")}
                    className="w-24 h-24 rounded-full"
                />
                <Text className="text-blue-600 mt-2">Đổi ảnh đại diện</Text>
            </Pressable>

            {/* Họ tên */}
            <View className="mb-4">
                <Text className="mb-1">Họ và tên</Text>
                <TextInput
                    className="p-4 border border-gray-300 rounded-xl text-lg w-full"
                    placeholder="Nhập họ và tên"
                    value={formData.name}
                    onChangeText={(v) => handleInputChange("name", v)}
                />
            </View>

            {/* Email */}
            <View className="mb-4">
                <Text className="mb-1">Email</Text>
                <TextInput
                    className="p-4 border border-gray-300 rounded-xl text-lg w-full"
                    placeholder="Nhập email"
                    keyboardType="email-address"
                    value={formData.email}
                    onChangeText={(v) => handleInputChange("email", v)}
                />
            </View>

            {/* Số điện thoại */}
            <View className="mb-4">
                <Text className="mb-1">Số điện thoại</Text>
                <TextInput
                    className="p-4 border border-gray-300 rounded-xl text-lg w-full"
                    placeholder="Nhập số điện thoại"
                    keyboardType="phone-pad"
                    value={formData.phone}
                    onChangeText={(v) => handleInputChange("phone", v)}
                />
            </View>

            {/* Mật khẩu */}
            <View className="mb-4">
                <Text className="mb-1">Mật khẩu mới</Text>
                <TextInput
                    className="p-4 border border-gray-300 rounded-xl text-lg w-full"
                    placeholder="Nhập mật khẩu mới"
                    secureTextEntry
                    value={formData.password}
                    onChangeText={(v) => handleInputChange("password", v)}
                />
            </View>

            {/* Xác nhận mật khẩu */}
            <View className="mb-6">
                <Text className="mb-1">Xác nhận mật khẩu</Text>
                <TextInput
                    className="p-4 border border-gray-300 rounded-xl text-lg w-full"
                    placeholder="Nhập lại mật khẩu"
                    secureTextEntry
                    value={formData.password_confirmation}
                    onChangeText={(v) => handleInputChange("password_confirmation", v)}
                />
            </View>

            <Pressable
                onPress={handleUpdate}
                className={`bg-blue-600 w-full py-4 rounded-xl ${loading ? "opacity-70" : ""
                    }`}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text className="text-white text-center text-lg font-semibold">
                        Cập nhật
                    </Text>
                )}
            </Pressable>
        </ScrollView>
    );
}

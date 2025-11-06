import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, Alert, ScrollView, Image } from "react-native";
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

    const [avatar, setAvatar] = useState<string | null>(null); // local uri

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
                password: "",
                password_confirmation: "",
            });
            setAvatar(user.avatar_url || null);
        }
    }, [user]);

    const handleInputChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const pickImage = async () => {
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
            Alert.alert("Vui lòng điền đầy đủ thông tin");
            return;
        }

        try {
            const data = new FormData();
            data.append("name", name);
            data.append("email", email);
            data.append("phone", phone);
            if (password) {
                data.append("password", password);
                data.append("password_confirmation", password_confirmation);
            }

            if (avatar && !avatar.startsWith("http")) {
                const filename = avatar.split("/").pop()!;
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;

                data.append("avatar", {
                    uri: avatar,
                    name: filename,
                    type,
                } as any);
            }

            const response = await api.put("user/profile", data, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (response.status === 200) {
                dispatch(setUser(response.data.user));
                Alert.alert("Cập nhật thành công");
            } else {
                Alert.alert("Cập nhật thất bại", response.data.message || "Vui lòng thử lại");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Lỗi mạng", "Không thể kết nối server. Vui lòng thử lại.");
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

            {/* Name */}
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
                    value={formData.email}
                    keyboardType="email-address"
                    onChangeText={(v) => handleInputChange("email", v)}
                />
            </View>

            {/* Phone */}
            <View className="mb-4">
                <Text className="mb-1">Số điện thoại</Text>
                <TextInput
                    className="p-4 border border-gray-300 rounded-xl text-lg w-full"
                    placeholder="Nhập số điện thoại"
                    value={formData.phone}
                    keyboardType="phone-pad"
                    onChangeText={(v) => handleInputChange("phone", v)}
                />
            </View>

            {/* Password */}
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
                className="bg-blue-600 w-full py-4 rounded-xl"
            >
                <Text className="text-white text-center text-lg font-semibold">Cập nhật</Text>
            </Pressable>
        </ScrollView>
    );
}

// components/SocialMedia.tsx
import React from "react";
import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import * as Facebook from "expo-auth-session/providers/facebook";
import { useDispatch } from "react-redux";
import { setUser } from "@/reducers/userSlice";
import { router } from "expo-router";
import api from "@/api/api";
import * as Notifications from "expo-notifications";
import { getDatabase, ref, set } from "firebase/database";
import { app } from "@/firebaseConfig";

WebBrowser.maybeCompleteAuthSession();

const SocialMedia = () => {
    const dispatch = useDispatch();

    // === GOOGLE ===
    const [requestG, responseG, promptAsyncG] = Google.useAuthRequest({
        expoClientId: "YOUR_GOOGLE_EXPO_CLIENT_ID", // Thay bằng của bạn
        iosClientId: "YOUR_IOS_CLIENT_ID",
        androidClientId: "YOUR_ANDROID_CLIENT_ID",
    });

    // === FACEBOOK ===
    const [requestF, responseF, promptAsyncF] = Facebook.useAuthRequest({
        clientId: "1350395206233851", // App ID bạn vừa tạo
    });

    // === XỬ LÝ RESPONSE ===
    React.useEffect(() => {
        console.log("responseF đã thay đổi:", responseF);

        if (responseG?.type === "success") {
            handleSocialLogin("google", responseG.authentication?.accessToken);
        } else if (responseG?.type === "error") {
            Alert.alert("Google Error", responseG.error?.message);
        }

        if (responseF?.type === "success") {
            handleSocialLogin("facebook", responseF.authentication?.accessToken);
        } else if (responseF?.type === "cancel") {
            console.log("User cancelled Facebook login");
        } else if (responseF?.type === "error") {
            Alert.alert("Facebook Error", responseF.error?.message);
        }
    }, [responseG, responseF]);

    // === GỌI API LARAVEL ===
    const handleSocialLogin = async (provider: string, accessToken?: string) => {
        if (!accessToken) return;

        try {
            const res = await api.post(`/auth/${provider}/callback`, {
                access_token: accessToken,
            });

            if (res.data.status === "success") {
                const { user } = res.data.data;

                // Lưu push token vào Firebase
                const expoPushToken = (await Notifications.getExpoPushTokenAsync()).data;
                if (expoPushToken && user.id) {
                    const db = getDatabase(app);
                    await set(ref(db, `users/${user.id}/expo_push_token`), expoPushToken);
                }

                // Lưu vào Redux
                dispatch(setUser({ ...user, role: "sender" }));
                router.push("/home");
            }
        } catch (error: any) {
            Alert.alert("Lỗi", error.response?.data?.message || "Đăng nhập thất bại");
        }
    };

    const handleFacebookLogout = async () => {
        try {
            await WebBrowser.dismissAuthSession();
            Alert.alert("Đã đăng xuất Facebook");
        } catch (error) {
            console.log("Logout error:", error);
        }
    };
    return (
        <View className="gap-y-[16px]">
            <Text className="text-center">Hoặc tiếp tục với</Text>
            <View className="flex-row gap-x-[16px]">

                {/* GOOGLE */}
                <TouchableOpacity
                    disabled={!requestG}
                    onPress={() => promptAsyncG()}
                    className="flex-1 flex-row border border-[#F2F2F7] rounded-[12px] justify-center py-[12px]"
                >
                    <Image
                        source={require("@assets/images/social/google.webp")}
                        className="w-[24px] h-[24px]"
                    />
                </TouchableOpacity>

                {/* FACEBOOK */}
                <TouchableOpacity
                    disabled={!requestF}
                    onPress={() => promptAsyncF({ useProxy: true })}
                    className="flex-1 flex-row border border-[#F2F2F7] rounded-[12px] justify-center py-[12px]"
                >
                    <Image
                        source={require("@assets/images/social/fb.webp")}
                        className="w-[24px] h-[24px]"
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default SocialMedia;
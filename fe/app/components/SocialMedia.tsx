import React from "react";
import { View, Text, Image, TouchableOpacity, Linking } from "react-native";

const SocialMedia = () => {
    const handleSocialMediaLink = (url) => {
        Linking.openURL(url).catch((err) => console.error("Failed to open URL", err));
    };

    return (
        <View className="space-y-[16px]">
            <Text className="text-center">
                Hoặc tiếp tục với
            </Text>
            <View className="flex-row space-x-[16px]">
                {/* Instagram Button */}
                <TouchableOpacity
                    onPress={() => handleSocialMediaLink("https://www.instagram.com/")}
                    className="flex-1 flex-row border border-[#F2F2F7] rounded-[12px] justify-center py-[12px]"
                >
                    <Image
                        source={require("../../assets/images/social/google.webp")}
                        className="w-[24px] h-[24px]"
                    />
                </TouchableOpacity>

                {/* Facebook Button */}
                <TouchableOpacity
                    onPress={() => handleSocialMediaLink("https://www.facebook.com/")}
                    className="flex-1 flex-row border border-[#F2F2F7] rounded-[12px] justify-center py-[12px]"
                >
                    <Image
                        source={require("../../assets/images/social/fb.webp")}
                        className="w-[24px] h-[24px]"
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default SocialMedia;

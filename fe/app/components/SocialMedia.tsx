import React from "react";
import { View, Text, Image, TouchableOpacity, Linking } from "react-native";

const SocialMedia = () => {

    return (
        <View className="gap-y-[16px]">
            <Text className="text-center">
                Hoặc tiếp tục với
            </Text>
            <View className="flex-row gap-x-[16px]">
                {/* Google Button */}
                <TouchableOpacity
                    onPress={() => { }}
                    className="flex-1 flex-row border border-[#F2F2F7] rounded-[12px] justify-center py-[12px]"
                >
                    <Image
                        source={require("../../assets/images/social/google.webp")}
                        className="w-[24px] h-[24px]"
                    />
                </TouchableOpacity>

                {/* Facebook Button */}
                <TouchableOpacity
                    onPress={() => { }}
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

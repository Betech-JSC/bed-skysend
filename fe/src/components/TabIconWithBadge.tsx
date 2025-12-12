import React from "react";
import { View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface TabIconWithBadgeProps {
    iconName: string;
    color: string;
    badgeCount: number;
    size?: number;
}

/**
 * Component tái sử dụng để hiển thị icon với badge số đếm
 * Style tương tự ChatIconWithBadge hiện tại
 */
export default function TabIconWithBadge({ 
    iconName, 
    color, 
    badgeCount,
    size = 28 
}: TabIconWithBadgeProps) {
    return (
        <View style={{ position: "relative" }}>
            <MaterialIcons name={iconName as any} size={size} color={color} />
            {badgeCount > 0 && (
                <View
                    style={{
                        position: "absolute",
                        top: -6,
                        right: -6,
                        backgroundColor: "#EF4444",
                        borderRadius: 10,
                        minWidth: 20,
                        height: 20,
                        paddingHorizontal: 6,
                        justifyContent: "center",
                        alignItems: "center",
                        borderWidth: 2,
                        borderColor: "#FFFFFF",
                    }}
                >
                    <Text
                        style={{
                            color: "#FFFFFF",
                            fontSize: 11,
                            fontWeight: "bold",
                        }}
                    >
                        {badgeCount > 99 ? "99+" : badgeCount}
                    </Text>
                </View>
            )}
        </View>
    );
}


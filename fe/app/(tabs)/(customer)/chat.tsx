import React from "react";
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    Image,
    TextInput,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function ChatListScreen() {
    const chats = [
        {
            id: 1,
            name: "Tran Minh Anh",
            lastMessage: "Được bạn nhé, tôi sẽ đợi ở sảnh B...",
            time: "5 phút",
            unread: 2,
            isBold: true,
            avatar:
                "https://lh3.googleusercontent.com/aida-public/AB6AXuCt1uclnQVmRt4FpXFSBOmqwkd7L1z-v6wELp4awVZPFJvpgEMQxPwfI81Umsb1Ioxb-8x74MbwZwQBQx5BULoT206OeocHce63_UGWhTcJvyO1fbozdfC0OrBdgAOzmPd8-HoiOSZ9qsA0VuBkeqq9V3kRCrtRsvlkWLeQ8trYnuKqRCBjLQ3saRSJfc-1LxeUOPZ8gt5cjbqA_SU9KMzQhTRlXgzWWR9n_tHcDczWFQNsBgsN-Gk7_2fNPqRYhcISQtax1Wcc8gaC",
        },
        {
            id: 2,
            name: "Le Nguyen",
            lastMessage: "[Hình ảnh]",
            time: "14:20",
            unread: 0,
            avatar:
                "https://lh3.googleusercontent.com/aida-public/AB6AXuDXKbamYWyV7FGvOzBUhbPSs_viFhwCNRbUS6iPVCVmiJegHOcAMHFLsdlKdnsBJ25fKkijYZplbOUs2nX-6uSuK-EPiKW59EiTXghNPG_IXYLYQiGgGwKxhSLtijCYR2_eqr_-kgDhVve5UYhW6a-5n1vigmdL1PKot_KQJUebR1pv129DT0Vtz41tl4PehCF9aH7i60Z4E_GCbZL5QGd-gzpDEm5xnOKKO_0trH5w6okHtoUuJcfz6wrezYEYsHMC2uLTGu53s7Z1",
        },
        {
            id: 3,
            name: "Pham Gia Han",
            lastMessage: "Tuyệt vời! Cảm ơn bạn nhiều.",
            time: "Hôm qua",
            unread: 0,
            avatar:
                "https://lh3.googleusercontent.com/aida-public/AB6AXuDwSMTle8V2tQmpnE-Q9F4_WO0d0UjbKB-c_Ce-DNym79rWzope0tEAaW6SceBbUJd0xeSIoEvr3jCR46MYTUGpJuGbhaxf3KfxHz-1Aglod4gFszzcZwbkQHqNq1djiu0umfujn8p4h0SdebwKaNnylW3Rc9cThA3hjKqimty2VQ8E82Fbtq8NX5nqYFYZnt3Tpvl0Lc3ARCnKUQxpJHcbCAgte-gQFH1bwWBjsMXP6lnW3GotOk6M-QY03Ft0TUlPP7qo28sVWnl4",
        },
        {
            id: 4,
            name: "Vu Hoang",
            lastMessage: "Bạn đã gửi tài liệu đi chưa?",
            time: "23/04",
            unread: 0,
            avatar:
                "https://lh3.googleusercontent.com/aida-public/AB6AXuASc6DIXYDV6Q46HbvEHVjgSlYGJbbjEcCCr1po9ECeYP3fZqKSh2X0SgwQnrskQsxbDQ4YC1xUrIY_woai1sxUPpUzz3CxJ7gmZeeQgLlFBivKV5DNbRJa_RM74bU0uau3rf0P4aZgIki8vfuiyCNfwQGHKtcmVLn4xTDyBW-YFxK5E0GrajENbOBlZE0y2QHyuogYhHwZu4_i3ISSX2DM911SZeA2lpX-wD1Ewo7FXXkWMsfhioCNxMgAdUXmMlFzL08p-Yj5FV5C",
        },
    ];

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            {/* Top App Bar */}
            <View className="bg-background-light dark:bg-background-dark pt-4 pb-2">
                <View className="flex-row items-center justify-between px-4 pb-2">
                    <Text className="text-2xl font-bold text-[#111318] dark:text-white">
                        Trò chuyện
                    </Text>
                    <TouchableOpacity>
                        <MaterialIcons name="add-circle" size={36} color="#2563EB" />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View className="px-4">
                    <View className="flex-row items-center bg-white dark:bg-slate-800 rounded-xl shadow-sm h-14">
                        <MaterialIcons
                            name="search"
                            size={24}
                            color="#616e89"
                            className="ml-4"
                        />
                        <TextInput
                            placeholder="Tìm kiếm theo tên hoặc tin nhắn..."
                            placeholderTextColor="#616e89"
                            className="flex-1 px-4 text-base text-[#111318] dark:text-white"
                        />
                    </View>
                </View>
            </View>

            {/* Chat List */}
            <ScrollView className="flex-1">
                <View className="px-4 pb-4 pt-2 gap-y-2">
                    {chats.map((chat) => (
                        <TouchableOpacity
                            key={chat.id}
                            activeOpacity={0.7}
                            className="flex-row items-center bg-white dark:bg-slate-800 rounded-xl px-4 py-3 min-h-[88px] shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700"
                        >
                            {/* Avatar */}
                            <Image
                                source={{ uri: chat.avatar }}
                                className="w-14 h-14 rounded-full mr-4"
                                resizeMode="cover"
                            />

                            {/* Nội dung tin nhắn */}
                            <View className="flex-1 overflow-hidden">
                                <Text
                                    className={`text-base font-bold text-[#111318] dark:text-white ${chat.isBold ? "font-extrabold" : ""
                                        }`}
                                    numberOfLines={1}
                                >
                                    {chat.name}
                                </Text>
                                <Text
                                    className={`text-sm mt-0.5 ${chat.isBold
                                        ? "text-primary font-semibold"
                                        : "text-[#616e89] dark:text-gray-400"
                                        }`}
                                    numberOfLines={1}
                                >
                                    {chat.lastMessage}
                                </Text>
                            </View>

                            {/* Thời gian + badge */}
                            <View className="items-end ml-4">
                                <Text className="text-xs text-[#616e89] dark:text-gray-400 mb-1">
                                    {chat.time}
                                </Text>
                                {chat.unread > 0 && (
                                    <View className="w-6 h-6 rounded-full bg-secondary justify-center items-center">
                                        <Text className="text-white text-xs font-bold">
                                            {chat.unread}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Empty State (khi không có tin nhắn) */}
            {/* 
      <View className="flex-1 justify-center items-center px-8">
        <MaterialIcons name="chat-bubble" size={80} color="#D1D5DB" />
        <Text className="text-lg font-semibold text-[#111318] dark:text-white mt-4">
          Chưa có cuộc trò chuyện nào
        </Text>
        <Text className="text-sm text-[#616e89] dark:text-gray-400 text-center mt-2">
          Bắt đầu một cuộc hội thoại mới bằng cách nhấn vào biểu tượng dấu cộng ở góc trên.
        </Text>
      </View>
      */}
        </SafeAreaView>
    );
}
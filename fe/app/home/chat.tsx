// import React, { useState, useEffect } from 'react';
// import { View, Text, TextInput, TouchableOpacity, Image, FlatList } from 'react-native';
// import Echo from 'laravel-echo';

// import axios from 'axios';

// const echo = new Echo({
//     broadcaster: 'pusher',
//     key: 'TJi7BIOAbIjqup12ExC9UNcTUauhEWxc', // REVERB_APP_KEY
//     cluster: 'mt1',  // REVERB_APP_CLUSTER (hoặc cluster của bạn)
//     forceTLS: false,  // Tùy chọn nếu bạn không sử dụng TLS
//     wsHost: '127.0.0.1',  // REVERB_HOST
//     wsPort: 9000,  // REVERB_PORT
//     disableStats: true,  // Tắt thống kê (tùy chọn)
//     encrypted: false,  // Cài đặt mã hóa nếu cần
// });

// function Chat({ myId = 1, partnerId = 2 }) {
//     const [text, setText] = useState('');
//     const [messages, setMessages] = useState([]);

//     useEffect(() => {
//         const channel = echo.channel(`chat.${myId}.${partnerId}`);

//         channel.listen('.ChatMessage', (e) => {
//             setMessages((prevMessages) => [
//                 ...prevMessages,
//                 { from: e.from, text: e.text, timestamp: new Date().toLocaleTimeString() },
//             ]);
//         });

//         return () => {
//             channel.stopListening('.ChatMessage');
//         };
//     }, [myId, partnerId]);

//     function send() {
//         if (!text.trim()) return;

//         axios.post('http://localhost:8000/chat/send', {
//             from: myId,
//             to: partnerId,
//             text: text,
//         });

//         setMessages((prevMessages) => [
//             ...prevMessages,
//             { from: myId, text: text, timestamp: new Date().toLocaleTimeString() },
//         ]);

//         setText('');
//     }

//     return (
//         <View className="flex-1 bg-gray-100">
//             <View className="flex-1 p-4">
//                 <FlatList
//                     data={messages}
//                     renderItem={({ item }) => (
//                         <View
//                             className={`flex flex-row items-center mb-3 ${item.from === myId ? 'justify-end' : ''}`}>
//                             {item.from !== myId && (
//                                 <Image source={{ uri: 'https://via.placeholder.com/40' }} className="w-10 h-10 rounded-full" />
//                             )}
//                             <View className={`p-3 rounded-lg max-w-[70%] ${item.from === myId ? 'bg-blue-500 text-white' : 'bg-blue-100 text-gray-900'}`}>
//                                 <Text className={`${item.from === myId ? 'text-white' : 'text-gray-900'}`}>{item.text}</Text>
//                                 <Text className="text-xs text-right text-gray-500">{item.timestamp}</Text>
//                             </View>
//                             {item.from === myId && (
//                                 <Image source={{ uri: 'https://via.placeholder.com/40' }} className="w-10 h-10 rounded-full" />
//                             )}
//                         </View>
//                     )}
//                     keyExtractor={(item, index) => index.toString()}
//                 />
//             </View>

//             <View className="flex-row items-center p-4 border-t border-gray-300">
//                 <TextInput
//                     className="flex-1 p-3 border border-gray-300 rounded-full"
//                     placeholder="Type your message..."
//                     value={text}
//                     onChangeText={setText}
//                 />
//                 <TouchableOpacity className="ml-2" onPress={send}>
//                     <Text className="text-yellow-500 text-xl">➤</Text>
//                 </TouchableOpacity>
//             </View>
//         </View>
//     );
// };

// export default Chat;


import { View, Text } from 'react-native'
import React from 'react'

const chat = () => {
    return (
        <View>
            <Text>chat</Text>
        </View>
    )
}

export default chat
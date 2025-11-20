// app/(customer)/wallet.tsx
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function WalletScreen() {
    const router = useRouter();

    const transactions = [
        { type: 'income', title: 'Nạp tiền vào ví', date: '15/07/2024, 09:30', amount: '+ 2,000,000đ', icon: 'account_balance_wallet' },
        { type: 'expense', title: 'Thanh toán phí vận chuyển', date: '14/07/2024, 18:45', amount: '- 50,000đ', icon: 'receipt_long' },
        { type: 'income', title: 'Nhận tiền từ đơn #SKS123', date: '13/07/2024, 11:20', amount: '+ 300,000đ', icon: 'redeem' },
        { type: 'expense', title: 'Rút tiền về tài khoản', date: '12/07/2024, 15:00', amount: '- 1,000,000đ', icon: 'credit_card' },
    ];

    return (
        <View className="flex-1 bg-[#F5F7FB] dark:bg-[#111621]">
            {/* Top App Bar */}
            <View className="flex-row items-center justify-between px-4 pt-4 pb-2 sticky top-0 z-10 bg-[#F5F7FB] dark:bg-[#111621]">
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <Text className="text-3xl text-[#1F2937] dark:text-white">arrow_back</Text>
                </TouchableOpacity>
                <Text className="text-lg font-bold text-[#1F2937] dark:text-white">Ví tiền</Text>
                <View className="w-10" />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Balance Card */}
                <View className="px-4 pt-4">
                    <View className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
                        <Text className="text-base text-[#6B7280] dark:text-slate-300 text-center">
                            Số dư khả dụng
                        </Text>
                        <Text className="text-4xl font-bold text-[#1F2937] dark:text-white text-center mt-2">
                            1,250,000đ
                        </Text>
                    </View>
                </View>

                {/* Action Buttons */}
                <View className="grid grid-cols-2 gap-4 px-4 mt-6">
                    <TouchableOpacity className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 items-center">
                        <View className="w-12 h-12 rounded-full bg-[#2563EB]/10 items-center justify-center">
                            <MaterialIcons name="add" size={28} color="#2563EB" />
                        </View>
                        <Text className="mt-3 font-bold text-[#1F2937] dark:text-white">Nạp tiền</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 items-center">
                        <View className="w-12 h-12 rounded-full bg-[#2563EB]/10 items-center justify-center">
                            <MaterialIcons name="remove" size={28} color="#2563EB" />
                        </View>
                        <Text className="mt-3 font-bold text-[#1F2937] dark:text-white">Rút tiền</Text>
                    </TouchableOpacity>
                </View>

                {/* Transaction History Header */}
                <Text className="px-4 mt-8 text-lg font-bold text-[#1F2937] dark:text-white">
                    Lịch sử giao dịch
                </Text>

                {/* Transaction List */}
                <View className="px-4 pt-2 pb-8">
                    {transactions.map((tx, idx) => (
                        <View
                            key={idx}
                            className="flex-row items-center bg-white dark:bg-slate-800 rounded-lg p-4 mb-3 shadow-sm"
                        >
                            <View
                                className={`w-11 h-11 rounded-full items-center justify-center ${tx.type === 'income' ? 'bg-[#10B981]/10' : 'bg-[#EF4444]/10'
                                    }`}
                            >
                                <Text
                                    className={`text-2xl ${tx.type === 'income' ? 'text-[#10B981]' : 'text-[#EF4444]'
                                        }`}
                                >
                                    {tx.icon === 'account_balance_wallet' && 'account_balance_wallet'}
                                    {tx.icon === 'receipt_long' && 'receipt_long'}
                                    {tx.icon === 'redeem' && 'redeem'}
                                    {tx.icon === 'credit_card' && 'credit_card'}
                                </Text>
                            </View>

                            <View className="flex-1 ml-4">
                                <Text className="font-bold text-[#1F2937] dark:text-white">
                                    {tx.title}
                                </Text>
                                <Text className="text-sm text-[#6B7280] dark:text-slate-400">
                                    {tx.date}
                                </Text>
                            </View>

                            <Text
                                className={`font-bold ${tx.type === 'income' ? 'text-[#10B981]' : 'text-[#EF4444]'
                                    }`}
                            >
                                {tx.amount}
                            </Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}
import React, { useEffect, useState } from 'react';
import { View, useColorScheme, Text, Modal, FlatList, Pressable, TouchableOpacity, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const CitySelectModal = ({
  placeholder,
  iconName,
}: {
  placeholder: string;
  iconName: 'flight-takeoff' | 'flight-land';
}) => {
  const isDark = useColorScheme() === 'dark';
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);
  const [cities, setCities] = useState<{ label: string; value: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  let selectedLabel = cities.find((c) => c.value === value)?.label ?? '';
  if (!value && loading) selectedLabel = 'Đang tải...';
  if (!value && error) selectedLabel = `Lỗi: ${error}`;

  useEffect(() => {
    let mounted = true;

    const fetchAirports = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('http://localhost:8000/api/airports');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // Kiểm tra response có đúng format: { status, message, data: [...] }
        if (data.status === 'success' && Array.isArray(data.data)) {
          const mapped = data.data
            .map((airport: any) => ({
              label: airport.display_vi || airport.name_vi || '',
              value: airport.code || airport.city_code || '',
            }))
            .filter((item: any) => item.value && item.label);

          if (mounted && mapped.length > 0) {
            setCities(mapped);
          } else {
            setCities('Không có dữ liệu');
          }
        } else {
          // Nếu API trả về format khác, dùng fallback
          setCities('Không có dữ liệu');
        }
      } catch (err: any) {
        setError(err?.message || 'Không thể tải danh sách');
        setCities('Không có dữ liệu');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAirports();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <View className="relative">
      <MaterialIcons
        name={iconName}
        size={20}
        color={isDark ? '#9ca3af' : '#6b7280'}
        style={{ position: 'absolute', left: 12, top: 17, zIndex: 10 }}
      />

      <Pressable onPress={() => setOpen(true)}>
        <View
          className={`h-14 border bg-background-light pl-10 pr-4 dark:bg-gray-700 ${
            isDark ? 'border-gray-600' : 'border-gray-200'
          } justify-center rounded-lg`}
        >
          <Text style={{ color: isDark ? '#e5e7eb' : '#1f2937' }}>{selectedLabel || placeholder}</Text>
        </View>
      </Pressable>

      <Modal visible={open} animationType="slide" transparent={Platform.OS === 'ios'} onRequestClose={() => setOpen(false)}>
        <View className="flex-1 justify-end">
          <View className="bg-white dark:bg-gray-800 rounded-t-xl p-4" style={{ maxHeight: '60%' }}>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-base font-semibold text-text-primary dark:text-white">Chọn thành phố</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Text className="text-primary">Đóng</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={cities}
              keyExtractor={(item) => item.value}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setValue(item.value);
                    setOpen(false);
                  }}
                  className="py-3 border-b border-gray-100 dark:border-gray-700"
                >
                  <Text className="text-base text-text-primary dark:text-white">{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CitySelectModal;

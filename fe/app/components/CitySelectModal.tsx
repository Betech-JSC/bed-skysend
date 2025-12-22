// CitySelectModal.tsx
import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  useColorScheme,
  Text,
  Modal,
  FlatList,
  Pressable,
  TouchableOpacity,
  Platform,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import api from '@/api/api';

interface CitySelectModalProps {
  placeholder: string;
  iconName: 'flight-takeoff' | 'flight-land';
  value?: string;
  onValueChange?: (value: string, label: string) => void;
}

const CitySelectModal = ({
  placeholder,
  iconName,
  value: externalValue,
  onValueChange,
}: CitySelectModalProps) => {
  const isDark = useColorScheme() === 'dark';
  const [value, setValue] = useState(externalValue || '');
  const [open, setOpen] = useState(false);
  const [cities, setCities] = useState<{ label: string; value: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  let selectedLabel = cities.find((c) => c.value === value)?.label ?? '';
  if (!value && loading) selectedLabel = 'Đang tải...';
  if (!value && error) selectedLabel = `Lỗi: ${error}`;

  useEffect(() => {
    let mounted = true;

    const fetchAirports = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/airports');
        const data = response.data;

        // Xử lý các format response khác nhau
        let airportsData = [];
        if (data.status === 'success' && Array.isArray(data.data)) {
          airportsData = data.data;
        } else if (Array.isArray(data.data)) {
          airportsData = data.data;
        } else if (Array.isArray(data)) {
          airportsData = data;
        }

        if (mounted && airportsData.length > 0) {
          const mapped = airportsData
            .map((airport: any) => ({
              label: airport.display_vi || airport.name_vi || airport.name || '',
              value: airport.code || airport.city_code || airport.airport_code || '',
              // Thêm các field để search
              code: airport.code || airport.city_code || airport.airport_code || '',
              name_vi: airport.name_vi || airport.name || '',
              name_en: airport.name_en || '',
              city_code: airport.city_code || '',
            }))
            .filter((item: any) => item.value && item.label);

          if (mounted && mapped.length > 0) {
            setCities(mapped);
          } else if (mounted) {
            setError('Không tìm thấy dữ liệu sân bay');
          }
        } else if (mounted) {
          setError('Không có dữ liệu sân bay');
        }
      } catch (err: any) {
        console.error('Error fetching airports:', err);
        const errorMessage =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          'Không thể tải danh sách sân bay';
        if (mounted) {
          setError(errorMessage);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAirports();

    return () => {
      mounted = false;
    };
  }, []);

  // Sync external value
  useEffect(() => {
    if (externalValue !== undefined) {
      setValue(externalValue);
    }
  }, [externalValue]);

  const handleSelect = (itemValue: string) => {
    setValue(itemValue);
    const selectedCity = cities.find((c) => c.value === itemValue);
    if (onValueChange && selectedCity) {
      onValueChange(itemValue, selectedCity.label);
    }
    setOpen(false);
    setSearchQuery(''); // Reset search khi đóng
  };

  // Filter cities based on search query
  const filteredCities = useMemo(() => {
    if (!searchQuery.trim()) {
      return cities;
    }
    
    const query = searchQuery.toLowerCase().trim();
    return cities.filter((city: any) => {
      // Search theo code (VD: SGN, HAN)
      if (city.code?.toLowerCase().includes(query)) {
        return true;
      }
      // Search theo city_code (mã thành phố)
      if (city.city_code?.toLowerCase().includes(query)) {
        return true;
      }
      // Search theo label (tên hiển thị - đã bao gồm tên sân bay + code)
      if (city.label?.toLowerCase().includes(query)) {
        return true;
      }
      // Search theo name_vi (tên tiếng Việt)
      if (city.name_vi?.toLowerCase().includes(query)) {
        return true;
      }
      // Search theo name_en (tên tiếng Anh)
      if (city.name_en?.toLowerCase().includes(query)) {
        return true;
      }
      return false;
    });
  }, [cities, searchQuery]);

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
          className={`h-14 border bg-background-light pl-10 pr-4 dark:bg-gray-700 ${isDark ? 'border-gray-600' : 'border-gray-200'
            } justify-center rounded-lg`}>
          <Text
            style={{
              color: selectedLabel
                ? (isDark ? '#e5e7eb' : '#1f2937')
                : (isDark ? '#4B5563' : '#D1D5DB') // Mờ hơn khi chưa chọn
            }}>
            {selectedLabel || placeholder}
          </Text>
        </View>
      </Pressable>

      <Modal
        visible={open}
        animationType="slide"
        transparent={Platform.OS === 'ios'}
        onRequestClose={() => setOpen(false)}>
        <View className="flex-1 justify-end">
          <View className="rounded-t-xl bg-white p-4 dark:bg-gray-800" style={{ maxHeight: '60%' }}>
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-text-primary text-base font-semibold dark:text-white">
                Chọn sân bay
              </Text>
              <TouchableOpacity onPress={() => {
                setOpen(false);
                setSearchQuery('');
              }}>
                <Text className="text-primary">Đóng</Text>
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View className="mb-3">
              <View className="flex-row items-center border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-700">
                <MaterialIcons name="search" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                <TextInput
                  placeholder="Tìm kiếm theo tên sân bay, mã sân bay hoặc thành phố..."
                  placeholderTextColor={isDark ? '#9ca3af' : '#9ca3af'}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  className="flex-1 ml-2 text-text-primary dark:text-white"
                  style={{ color: isDark ? '#e5e7eb' : '#1f2937' }}
                  autoFocus={false}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <MaterialIcons name="clear" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <FlatList
              data={filteredCities}
              keyExtractor={(item) => item.value}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <View className="py-8 items-center">
                  <MaterialIcons name="search-off" size={48} color={isDark ? '#6b7280' : '#9ca3af'} />
                  <Text className="mt-2 text-gray-500 dark:text-gray-400">
                    {searchQuery.trim() ? `Không tìm thấy kết quả cho "${searchQuery}"` : 'Không có dữ liệu'}
                  </Text>
                </View>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelect(item.value)}
                  className={`border-b border-gray-100 py-3 dark:border-gray-700 ${item.value === value ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                  <Text className="text-text-primary text-base font-medium dark:text-white">
                    {item.label}
                  </Text>
                  {item.name_en && item.name_en !== item.name_vi && (
                    <Text className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                      {item.name_en}
                    </Text>
                  )}
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

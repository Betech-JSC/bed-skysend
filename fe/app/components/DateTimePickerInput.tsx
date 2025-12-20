import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';

interface DateTimePickerInputProps {
  value: Date | null;
  onValueChange: (date: Date) => void;
  placeholder?: string;
  label?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  disabled?: boolean;
}

const DateTimePickerInput: React.FC<DateTimePickerInputProps> = ({
  value,
  onValueChange,
  placeholder = 'Chọn ngày và giờ',
  label,
  minimumDate,
  maximumDate,
  disabled = false,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(value || new Date());

  const selectedDate = value || new Date();

  // Format date to display
  const formatDateTime = (date: Date): string => {
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = days[date.getDay()];
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${dayName}, ${day}/${month}/${year} ${hours}:${minutes}`;
  };

  // Handle date change
  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (event.type === 'dismissed') {
      setShowDatePicker(false);
      return;
    }

    if (selectedDate) {
      // Preserve time from current selection
      const newDate = new Date(selectedDate);
      if (value) {
        newDate.setHours(value.getHours());
        newDate.setMinutes(value.getMinutes());
      }
      setTempDate(newDate);
      if (Platform.OS === 'ios') {
        // On iOS, show time picker after date
        setShowTimePicker(true);
      } else {
        // On Android, show time picker immediately
        setShowTimePicker(true);
      }
    }
  };

  // Handle time change
  const onTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }

    if (event.type === 'dismissed') {
      setShowTimePicker(false);
      return;
    }

    if (selectedTime) {
      // Combine date and time
      const finalDate = new Date(tempDate);
      finalDate.setHours(selectedTime.getHours());
      finalDate.setMinutes(selectedTime.getMinutes());
      onValueChange(finalDate);
      setShowTimePicker(false);
    }
  };

  // Handle press for iOS (need confirm button)
  const handleConfirmIOS = () => {
    if (showDatePicker) {
      setShowDatePicker(false);
      setShowTimePicker(true);
    } else if (showTimePicker) {
      onValueChange(tempDate);
      setShowTimePicker(false);
    }
  };

  const handleCancelIOS = () => {
    setShowDatePicker(false);
    setShowTimePicker(false);
  };

  return (
    <View className="w-full">
      {label && (
        <Text className="text-text-primary pb-2 text-sm font-medium dark:text-gray-300">
          {label} <Text className="text-red-500">*</Text>
        </Text>
      )}

      <TouchableOpacity
        onPress={() => !disabled && setShowDatePicker(true)}
        disabled={disabled}
        className="relative w-full"
        activeOpacity={0.7}>
        <MaterialIcons
          name="access-time"
          size={20}
          color={disabled ? '#d1d5db' : '#6b7280'}
          style={{ position: 'absolute', left: 12, top: 17, zIndex: 10 }}
        />
        <View
          className={`h-14 w-full rounded-lg border pl-10 pr-4 ${disabled
            ? 'border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800'
            : 'border-gray-200 bg-background-light dark:border-gray-600 dark:bg-gray-700'
            }`}
          style={{ justifyContent: 'center' }}>
          <Text
            className={`text-base ${value
              ? 'text-text-primary dark:text-white'
              : 'text-gray-400 dark:text-gray-500'
              } ${disabled ? 'opacity-50' : ''}`}
            style={{
              opacity: value ? 1 : 0.6
            }}>
            {value ? formatDateTime(value) : placeholder}
          </Text>
        </View>
      </TouchableOpacity>

      {showDatePicker && (
        <>
          {Platform.OS === 'ios' ? (
            // iOS Modal Style
            <View className="absolute bottom-0 left-0 right-0 z-50 rounded-t-xl bg-white dark:bg-gray-800">
              <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                <TouchableOpacity onPress={handleCancelIOS}>
                  <Text className="text-base text-red-500">Hủy</Text>
                </TouchableOpacity>
                <Text className="text-base font-semibold text-text-primary dark:text-white">
                  Chọn ngày
                </Text>
                <TouchableOpacity onPress={handleConfirmIOS}>
                  <Text className="text-base font-semibold text-primary">Tiếp</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={onDateChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                textColor={Platform.OS === 'ios' ? undefined : '#000000'}
              />
            </View>
          ) : (
            // Android Default Picker
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="default"
              onChange={onDateChange}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
            />
          )}
        </>
      )}

      {showTimePicker && (
        <>
          {Platform.OS === 'ios' ? (
            // iOS Modal Style
            <View className="absolute bottom-0 left-0 right-0 z-50 rounded-t-xl bg-white dark:bg-gray-800">
              <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                <TouchableOpacity onPress={handleCancelIOS}>
                  <Text className="text-base text-red-500">Hủy</Text>
                </TouchableOpacity>
                <Text className="text-base font-semibold text-text-primary dark:text-white">
                  Chọn giờ
                </Text>
                <TouchableOpacity onPress={handleConfirmIOS}>
                  <Text className="text-base font-semibold text-primary">Xong</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="time"
                display="spinner"
                onChange={onTimeChange}
                textColor={Platform.OS === 'ios' ? undefined : '#000000'}
              />
            </View>
          ) : (
            // Android Default Picker
            <DateTimePicker
              value={tempDate}
              mode="time"
              display="default"
              onChange={onTimeChange}
            />
          )}
        </>
      )}
    </View>
  );
};

export default DateTimePickerInput;


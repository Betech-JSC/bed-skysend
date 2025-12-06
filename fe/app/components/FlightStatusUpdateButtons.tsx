import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { updateFlightTrackingStatus } from '@/services/flightTrackingApi';

interface FlightStatusUpdateButtonsProps {
  flightId: number | string;
  currentStatus: 'scheduled' | 'boarding' | 'departed' | 'in_flight' | 'landed' | 'arrived';
  onStatusUpdated?: () => void;
  isCustomer?: boolean; // Only customer can update status
}

export default function FlightStatusUpdateButtons({
  flightId,
  currentStatus,
  onStatusUpdated,
  isCustomer = false,
}: FlightStatusUpdateButtonsProps) {
  const [loading, setLoading] = useState(false);

  if (!isCustomer) {
    return null; // Only show for customer
  }

  const handleUpdateStatus = async (newStatus: 'departed' | 'landed') => {
    const statusLabels = {
      departed: 'cất cánh',
      landed: 'hạ cánh',
    };

    const confirmMessage = newStatus === 'departed'
      ? 'Bạn có chắc chắn chuyến bay đã cất cánh?'
      : 'Bạn có chắc chắn chuyến bay đã hạ cánh?';

    Alert.alert(
      `Xác nhận ${statusLabels[newStatus]}`,
      confirmMessage,
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xác nhận',
          onPress: async () => {
            try {
              setLoading(true);
              const success = await updateFlightTrackingStatus(flightId, newStatus);
              
              if (success) {
                Alert.alert(
                  'Thành công',
                  `Đã xác nhận chuyến bay ${statusLabels[newStatus]}`,
                  [{ text: 'OK' }]
                );
                onStatusUpdated?.();
              } else {
                Alert.alert(
                  'Lỗi',
                  'Không thể cập nhật trạng thái. Vui lòng thử lại.',
                  [{ text: 'OK' }]
                );
              }
            } catch (error) {
              console.error('Error updating flight status:', error);
              Alert.alert(
                'Lỗi',
                'Đã xảy ra lỗi khi cập nhật trạng thái.',
                [{ text: 'OK' }]
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Show "Xác nhận cất cánh" button when status is scheduled or boarding
  const canConfirmDeparture = currentStatus === 'scheduled' || currentStatus === 'boarding';
  
  // Show "Xác nhận hạ cánh" button when status is in_flight
  const canConfirmLanding = currentStatus === 'in_flight';

  if (!canConfirmDeparture && !canConfirmLanding) {
    return null; // No buttons to show
  }

  return (
    <View className="mt-4 space-y-3">
      {canConfirmDeparture && (
        <TouchableOpacity
          onPress={() => handleUpdateStatus('departed')}
          disabled={loading}
          className="flex-row items-center justify-center bg-blue-500 rounded-lg px-4 py-3"
          style={{ opacity: loading ? 0.6 : 1 }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <MaterialIcons name="flight-takeoff" size={20} color="#fff" />
              <Text className="ml-2 text-white font-semibold text-base">
                Xác nhận cất cánh
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {canConfirmLanding && (
        <TouchableOpacity
          onPress={() => handleUpdateStatus('landed')}
          disabled={loading}
          className="flex-row items-center justify-center bg-green-500 rounded-lg px-4 py-3"
          style={{ opacity: loading ? 0.6 : 1 }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <MaterialIcons name="flight-land" size={20} color="#fff" />
              <Text className="ml-2 text-white font-semibold text-base">
                Xác nhận hạ cánh
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}



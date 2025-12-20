import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import api from '@/api/api';

interface PhotoItem {
    url: string;
    uploaded_at?: string;
}

interface OrderPhotoUploadProps {
    orderId: string;
    type: 'pickup' | 'delivery';
    onSuccess?: () => void;
    currentPhotos?: PhotoItem[] | string[] | null;
}

const OrderPhotoUpload: React.FC<OrderPhotoUploadProps> = ({
    orderId,
    type,
    onSuccess,
    currentPhotos,
}) => {
    const [uploading, setUploading] = useState(false);
    const [photos, setPhotos] = useState<PhotoItem[]>(() => {
        if (!currentPhotos) return [];
        // Normalize photos: convert string array to PhotoItem array
        return currentPhotos.map((photo) => {
            if (typeof photo === 'string') {
                return { url: photo };
            }
            return photo;
        });
    });

    const pickImage = async () => {
        try {
            // Request permissions
            const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();

            if (libraryStatus !== 'granted' && cameraStatus !== 'granted') {
                Alert.alert(
                    'Cần quyền truy cập',
                    'Vui lòng cấp quyền truy cập camera và thư viện ảnh để chụp ảnh.'
                );
                return;
            }

            // Show options
            Alert.alert(
                'Chọn ảnh',
                'Bạn muốn chụp ảnh mới hay chọn từ thư viện?',
                [
                    {
                        text: 'Hủy',
                        style: 'cancel',
                    },
                    {
                        text: 'Chụp ảnh',
                        onPress: async () => {
                            // if (cameraStatus !== 'granted') {
                            //     Alert.alert('Lỗi', 'Không có quyền truy cập camera');
                            //     return;
                            // }
                            const result = await ImagePicker.launchCameraAsync({
                                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                                allowsEditing: true,
                                aspect: [4, 3],
                                quality: 0.8,
                            });

                            if (!result.canceled && result.assets[0]) {
                                await uploadPhoto(result.assets[0].uri);
                            }
                        },
                    },
                    {
                        text: 'Chọn từ thư viện',
                        onPress: async () => {
                            // if (libraryStatus !== 'granted') {
                            //     Alert.alert('Lỗi', 'Không có quyền truy cập thư viện ảnh');
                            //     return;
                            // }
                            const result = await ImagePicker.launchImageLibraryAsync({
                                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                                allowsEditing: true,
                                aspect: [4, 3],
                                quality: 0.8,
                            });

                            if (!result.canceled && result.assets[0]) {
                                await uploadPhoto(result.assets[0].uri);
                            }
                        },
                    },
                ]
            );
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Lỗi', 'Không thể mở camera/thư viện ảnh');
        }
    };

    const uploadPhoto = async (uri: string) => {
        try {
            setUploading(true);

            // Create FormData
            const formData = new FormData();
            const filename = uri.split('/').pop() || 'photo.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const mimeType = match ? `image/${match[1]}` : 'image/jpeg';

            formData.append('photo', {
                uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
                type: mimeType,
                name: filename,
            } as any);

            // Determine endpoint based on photo type
            const endpoint = type === 'pickup'
                ? `orders/${orderId}/upload-pickup-photo`
                : `orders/${orderId}/upload-delivery-photo`;

            console.log('📸 Uploading photo to:', endpoint, 'Order ID:', orderId);

            const response = await api.post(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data?.success) {
                // Update photos list from server response
                const updatedPhotos = response.data?.data?.pickup_photos || response.data?.data?.delivery_photos || [];
                setPhotos(updatedPhotos);
                Alert.alert('Thành công', response.data.message || 'Đã chụp ảnh thành công');
                onSuccess?.();
            } else {
                throw new Error(response.data?.message || 'Upload failed');
            }
        } catch (error: any) {
            console.error('Error uploading photo:', error);
            Alert.alert(
                'Lỗi',
                error.response?.data?.message || error.message || 'Không thể upload ảnh. Vui lòng thử lại.'
            );
        } finally {
            setUploading(false);
        }
    };

    const deletePhoto = async (photoUrl: string) => {
        Alert.alert(
            'Xác nhận xóa',
            'Bạn có chắc chắn muốn xóa ảnh này?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const endpoint = type === 'pickup'
                                ? `orders/${orderId}/delete-pickup-photo`
                                : `orders/${orderId}/delete-delivery-photo`;

                            const response = await api.delete(endpoint, {
                                data: { photo_url: photoUrl }
                            });

                            if (response.data?.success) {
                                const updatedPhotos = response.data?.data?.pickup_photos || response.data?.data?.delivery_photos || [];
                                setPhotos(updatedPhotos);
                                Alert.alert('Thành công', 'Đã xóa ảnh thành công');
                                onSuccess?.();
                            } else {
                                throw new Error(response.data?.message || 'Delete failed');
                            }
                        } catch (error: any) {
                            console.error('Error deleting photo:', error);
                            Alert.alert(
                                'Lỗi',
                                error.response?.data?.message || error.message || 'Không thể xóa ảnh. Vui lòng thử lại.'
                            );
                        }
                    }
                }
            ]
        );
    };

    const getLabel = () => {
        return type === 'pickup' ? 'Chụp ảnh giao hàng' : 'Chụp ảnh nhận hàng';
    };

    const getDescription = () => {
        return type === 'pickup'
            ? 'Chụp ảnh khi bạn giao hàng cho hành khách'
            : 'Chụp ảnh khi bạn nhận hàng từ hành khách';
    };

    return (
        <View className="rounded-xl bg-white dark:bg-gray-800 p-4 shadow-sm">
            <Text className="text-base font-bold text-text-primary dark:text-white mb-2">
                {getLabel()}
            </Text>
            <Text className="text-sm text-text-secondary dark:text-gray-400 mb-4">
                {getDescription()}
            </Text>

            {/* Danh sách ảnh đã upload */}
            {photos.length > 0 && (
                <View className="mb-4">
                    <Text className="text-sm font-semibold text-text-primary dark:text-white mb-2">
                        Ảnh đã chụp ({photos.length})
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                        {photos.map((photo, index) => {
                            const photoUrl = typeof photo === 'string' ? photo : photo.url;
                            return (
                                <View key={index} className="relative">
                                    <Image
                                        source={{ uri: photoUrl }}
                                        className="w-24 h-24 rounded-lg"
                                        resizeMode="cover"
                                    />
                                    <TouchableOpacity
                                        onPress={() => deletePhoto(photoUrl)}
                                        className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
                                        activeOpacity={0.7}
                                    >
                                        <MaterialIcons name="close" size={16} color="#FFFFFF" />
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </View>
                </View>
            )}

            <TouchableOpacity
                onPress={pickImage}
                disabled={uploading}
                className={`flex-row items-center justify-center gap-2 rounded-lg px-4 py-3 ${uploading
                    ? 'bg-gray-300 dark:bg-gray-600'
                    : 'bg-primary dark:bg-blue-600'
                    }`}
                activeOpacity={0.7}
            >
                {uploading ? (
                    <>
                        <ActivityIndicator size="small" color="#FFFFFF" />
                        <Text className="text-white font-semibold">Đang upload...</Text>
                    </>
                ) : (
                    <>
                        <MaterialIcons name="camera-alt" size={20} color="#FFFFFF" />
                        <Text className="text-white font-semibold">
                            {getLabel()}
                        </Text>
                    </>
                )}
            </TouchableOpacity>
        </View>
    );
};

export default OrderPhotoUpload;


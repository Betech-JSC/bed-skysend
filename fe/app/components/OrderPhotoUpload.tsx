import React, { useState, useEffect } from 'react';
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
    const [uploadingIndexes, setUploadingIndexes] = useState<Set<number>>(new Set());
    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
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
    const maxImages = 10; // Maximum number of photos allowed

    // Update photos when currentPhotos prop changes
    useEffect(() => {
        if (currentPhotos) {
            const normalizedPhotos = currentPhotos.map((photo) => {
                if (typeof photo === 'string') {
                    return { url: photo };
                }
                return photo;
            });
            setPhotos(normalizedPhotos);
        } else {
            setPhotos([]);
        }
    }, [currentPhotos]);

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

            // Check max images limit
            if (photos.length >= maxImages) {
                Alert.alert('Thông báo', `Bạn chỉ có thể upload tối đa ${maxImages} ảnh.`);
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
                            await captureMultiplePhotos();
                        },
                    },
                    {
                        text: 'Chọn từ thư viện',
                        onPress: async () => {
                            const result = await ImagePicker.launchImageLibraryAsync({
                                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                                allowsEditing: false,
                                quality: 0.8,
                                allowsMultipleSelection: true,
                                selectionLimit: maxImages - photos.length,
                            });

                            if (!result.canceled && result.assets && result.assets.length > 0) {
                                await uploadMultiplePhotos(result.assets.map(asset => asset.uri));
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

    const captureMultiplePhotos = async () => {
        let continueCapturing = true;
        let capturedUris: string[] = [];

        while (continueCapturing && photos.length + capturedUris.length < maxImages) {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                capturedUris.push(result.assets[0].uri);

                // Ask if user wants to capture more
                if (photos.length + capturedUris.length < maxImages) {
                    await new Promise<void>((resolve) => {
                        Alert.alert(
                            'Chụp thêm ảnh?',
                            `Bạn đã chụp ${capturedUris.length} ảnh. Bạn có muốn chụp thêm không?`,
                            [
                                {
                                    text: 'Hoàn tất',
                                    onPress: () => {
                                        continueCapturing = false;
                                        resolve();
                                    },
                                },
                                {
                                    text: 'Chụp thêm',
                                    onPress: () => resolve(),
                                },
                            ]
                        );
                    });
                } else {
                    continueCapturing = false;
                }
            } else {
                continueCapturing = false;
            }
        }

        if (capturedUris.length > 0) {
            await uploadMultiplePhotos(capturedUris);
        }
    };

    const uploadMultiplePhotos = async (uris: string[]) => {
        if (uris.length === 0) return;

        setUploading(true);
        setUploadProgress({ current: 0, total: uris.length });

        const successfullyUploaded: PhotoItem[] = [];
        const failedUploads: number[] = [];

        // Determine endpoint based on photo type
        const endpoint = type === 'pickup'
            ? `orders/${orderId}/upload-pickup-photo`
            : `orders/${orderId}/upload-delivery-photo`;

        for (let i = 0; i < uris.length; i++) {
            const uri = uris[i];
            const currentIndex = photos.length + successfullyUploaded.length;

            try {
                setUploadingIndexes((prev) => new Set([...Array.from(prev), currentIndex]));
                setUploadProgress({ current: i + 1, total: uris.length });

                // Create FormData
                const formData = new FormData();
                const filename = uri.split('/').pop() || `photo_${Date.now()}.jpg`;

                // Determine MIME type from extension
                let mimeType = 'image/jpeg'; // default
                const extension = filename.split('.').pop()?.toLowerCase();
                const mimeMap: { [key: string]: string } = {
                    'jpg': 'image/jpeg',
                    'jpeg': 'image/jpeg',
                    'png': 'image/png',
                    'gif': 'image/gif',
                    'webp': 'image/webp',
                };
                if (extension && mimeMap[extension]) {
                    mimeType = mimeMap[extension];
                }

                formData.append('photo', {
                    uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
                    type: mimeType,
                    name: filename,
                } as any);

                console.log(`📤 Uploading photo ${i + 1}/${uris.length} to:`, endpoint);

                const response = await api.post(endpoint, formData, {
                    // Don't set Content-Type header, let Axios set it with boundary
                });

                if (response.data?.success) {
                    // Get updated photos list from server response
                    const updatedPhotos = response.data?.data?.pickup_photos || response.data?.data?.delivery_photos || [];

                    // Extract the newly uploaded photo (last one in the array)
                    if (updatedPhotos.length > 0) {
                        const newPhoto = updatedPhotos[updatedPhotos.length - 1];
                        successfullyUploaded.push(typeof newPhoto === 'string' ? { url: newPhoto } : newPhoto);
                        setPhotos(updatedPhotos.map((p: any) => typeof p === 'string' ? { url: p } : p));
                    }
                } else {
                    throw new Error(response.data?.message || 'Upload failed');
                }
            } catch (error: any) {
                console.error(`Error uploading photo ${i + 1}:`, error);
                failedUploads.push(i + 1);
            } finally {
                setUploadingIndexes((prev) => {
                    const newIndexes = new Set(prev);
                    newIndexes.delete(currentIndex);
                    return newIndexes;
                });
            }
        }

        setUploading(false);
        setUploadProgress({ current: 0, total: 0 });

        // Show result message
        if (successfullyUploaded.length > 0 && failedUploads.length === 0) {
            Alert.alert(
                'Thành công',
                `Đã upload ${successfullyUploaded.length} ảnh thành công`
            );
            onSuccess?.();
        } else if (successfullyUploaded.length > 0 && failedUploads.length > 0) {
            Alert.alert(
                'Cảnh báo',
                `Đã upload ${successfullyUploaded.length} ảnh thành công, ${failedUploads.length} ảnh thất bại`
            );
            onSuccess?.();
        } else if (failedUploads.length > 0) {
            Alert.alert(
                'Lỗi',
                `Không thể upload ${failedUploads.length} ảnh. Vui lòng thử lại.`
            );
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
                                setPhotos(updatedPhotos.map((p: any) => typeof p === 'string' ? { url: p } : p));
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

    const removeAllPhotos = async () => {
        Alert.alert(
            'Xác nhận xóa',
            `Bạn có chắc chắn muốn xóa tất cả ${photos.length} ảnh?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa tất cả',
                    style: 'destructive',
                    onPress: async () => {
                        // Delete all photos one by one
                        for (const photo of photos) {
                            const photoUrl = typeof photo === 'string' ? photo : photo.url;
                            await deletePhoto(photoUrl);
                        }
                    },
                },
            ]
        );
    };

    return (
        <View className="w-full">
            <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-sm font-medium text-text-primary dark:text-white">
                    {getLabel()} {photos.length > 0 && `(${photos.length}/${maxImages})`}
                </Text>
                <View className="flex-row gap-2">
                    {photos.length > 0 && (
                        <TouchableOpacity
                            onPress={removeAllPhotos}
                            disabled={uploading}
                            className="flex-row items-center gap-1 rounded-lg bg-red-100 px-3 py-1.5 dark:bg-red-900/30"
                        >
                            <MaterialIcons name="delete-outline" size={16} color="#DC2626" />
                            <Text className="text-xs font-semibold text-red-600 dark:text-red-400">Xóa tất cả</Text>
                        </TouchableOpacity>
                    )}
                    {photos.length < maxImages && (
                        <TouchableOpacity
                            onPress={pickImage}
                            disabled={uploading}
                            className="flex-row items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5"
                        >
                            <MaterialIcons name="add-photo-alternate" size={18} color="#2563EB" />
                            <Text className="text-xs font-semibold text-primary">Thêm ảnh</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {photos.length === 0 ? (
                <TouchableOpacity
                    onPress={pickImage}
                    disabled={uploading}
                    className="h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800"
                >
                    <MaterialIcons name="add-photo-alternate" size={32} color="#9CA3AF" />
                    <Text className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {getDescription()}
                    </Text>
                    <Text className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                        Tối đa {maxImages} ảnh
                    </Text>
                </TouchableOpacity>
            ) : (
                <View className="w-full">
                    <View className="flex-row flex-wrap gap-3">
                        {photos.map((photo, index) => {
                            const photoUrl = typeof photo === 'string' ? photo : photo.url;
                            const isUploading = uploadingIndexes.has(index);
                            return (
                                <View key={index} className="relative" style={{ width: '30%' }}>
                                    <Image
                                        source={{ uri: photoUrl }}
                                        className="h-32 w-full rounded-lg"
                                        resizeMode="cover"
                                    />
                                    {isUploading && (
                                        <View className="absolute inset-0 items-center justify-center rounded-lg bg-black/50">
                                            <ActivityIndicator size="small" color="#FFFFFF" />
                                        </View>
                                    )}
                                    <TouchableOpacity
                                        onPress={() => deletePhoto(photoUrl)}
                                        disabled={isUploading}
                                        className="absolute -right-2 -top-2 h-7 w-7 items-center justify-center rounded-full bg-red-500 shadow-lg"
                                        activeOpacity={0.7}
                                    >
                                        <MaterialIcons name="close" size={18} color="#FFFFFF" />
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                        {photos.length < maxImages && (
                            <TouchableOpacity
                                onPress={pickImage}
                                disabled={uploading}
                                className="h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800"
                                style={{ width: '30%' }}
                            >
                                <MaterialIcons name="add" size={28} color="#9CA3AF" />
                                <Text className="mt-1 text-xs text-gray-400">Thêm</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}

            {uploading && (
                <View className="mt-3 flex-row items-center justify-center gap-2 rounded-lg bg-blue-50 p-2 dark:bg-blue-900/20">
                    <ActivityIndicator size="small" color="#2563EB" />
                    <Text className="text-xs text-gray-600 dark:text-gray-300">
                        {uploadProgress.total > 0
                            ? `Đang upload ${uploadProgress.current}/${uploadProgress.total} ảnh...`
                            : 'Đang xử lý...'}
                    </Text>
                </View>
            )}
        </View>
    );
};

export default OrderPhotoUpload;


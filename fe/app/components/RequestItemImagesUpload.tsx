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
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import api from '@/api/api';

interface RequestItemImagesUploadProps {
    images: string[];
    onImagesChange: (images: string[]) => void;
    maxImages?: number;
    title?: string; // Custom title, nếu không có sẽ tự động detect theo role
    role?: 'sender' | 'customer'; // Role để tự động set title
    // Custom upload handler - nếu có thì dùng thay vì upload mặc định
    customUploadHandler?: (uri: string) => Promise<string>;
    // Custom delete handler - nếu có thì dùng thay vì chỉ xóa local
    customDeleteHandler?: (imageUrl: string) => Promise<void>;
    // Callback khi upload thành công (dùng cho order photos để refresh data)
    onUploadSuccess?: () => void;
}

const RequestItemImagesUpload: React.FC<RequestItemImagesUploadProps> = ({
    images,
    onImagesChange,
    maxImages = 10,
    title,
    role,
    customUploadHandler,
    customDeleteHandler,
    onUploadSuccess,
}) => {
    const [uploading, setUploading] = useState(false);
    const [uploadingIndexes, setUploadingIndexes] = useState<Set<number>>(new Set());
    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

    // Get role from Redux store if not provided
    const reduxUser = useSelector((state: RootState) => state.user);
    const userRole = role || reduxUser?.role || 'sender';

    // Determine title based on role
    const displayTitle = title || (userRole === 'customer' ? 'Ảnh vé máy bay' : 'Ảnh kiện hàng');

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
            if (images.length >= maxImages) {
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
                                selectionLimit: maxImages - images.length,
                            });

                            if (!result.canceled && result.assets && result.assets.length > 0) {
                                await uploadMultipleImages(result.assets.map(asset => asset.uri));
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

        while (continueCapturing && images.length + capturedUris.length < maxImages) {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                capturedUris.push(result.assets[0].uri);

                // Ask if user wants to capture more
                if (images.length + capturedUris.length < maxImages) {
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
            await uploadMultipleImages(capturedUris);
        }
    };

    const uploadMultipleImages = async (uris: string[]) => {
        if (uris.length === 0) return;

        setUploading(true);
        setUploadProgress({ current: 0, total: uris.length });

        const uploadedUrls: string[] = [];
        const failedUploads: number[] = [];

        for (let i = 0; i < uris.length; i++) {
            const uri = uris[i];
            const currentIndex = images.length + uploadedUrls.length;

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

                // Format file object for React Native FormData
                const fileObject = {
                    uri: uri,
                    type: mimeType,
                    name: filename,
                } as any;

                formData.append('files[0]', fileObject);

                console.log(`📤 Uploading image ${i + 1}/${uris.length}:`, {
                    filename,
                    mimeType,
                    uri: uri.substring(0, 50) + '...',
                });

                // Use custom upload handler if provided, otherwise use default upload endpoint
                let fileUrl: string | null = null;

                if (customUploadHandler) {
                    // Use custom upload handler (for order photos)
                    fileUrl = await customUploadHandler(uri);
                } else {
                    // Default upload endpoint (for request/flight images)
                    const response = await api.post('upload', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });

                    // API returns: { success: true, data: [{ file_url: '...' }] }
                    if (response.data?.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
                        fileUrl = response.data.data[0].file_url;
                    } else if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                        // Fallback: direct array response
                        fileUrl = response.data[0].file_url;
                    }

                    if (!fileUrl) {
                        console.error('Upload response structure:', JSON.stringify(response.data, null, 2));
                        throw new Error('Upload failed - no file URL returned');
                    }
                }

                if (fileUrl) {
                    uploadedUrls.push(fileUrl);
                }
            } catch (error: any) {
                console.error(`Error uploading image ${i + 1}:`, error);
                console.error('Error details:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status,
                });
                failedUploads.push(i + 1);
            } finally {
                setUploadingIndexes((prev) => {
                    const newIndexes = new Set(prev);
                    newIndexes.delete(currentIndex);
                    return newIndexes;
                });
            }
        }

        // Update images with all successfully uploaded URLs
        if (uploadedUrls.length > 0) {
            if (customUploadHandler) {
                // When using custom upload handler, don't update local state
                // Instead, call onUploadSuccess to refresh data from server
                if (onUploadSuccess) {
                    onUploadSuccess();
                }
            } else {
                // Default behavior: update local state
                const newImages = [...images, ...uploadedUrls];
                onImagesChange(newImages);
            }
        }

        setUploading(false);
        setUploadProgress({ current: 0, total: 0 });

        // Show result message
        if (failedUploads.length > 0) {
            const errorDetails = failedUploads.length === 1
                ? `Ảnh số ${failedUploads[0]} không thể upload.`
                : `${failedUploads.length} ảnh không thể upload (ảnh số: ${failedUploads.join(', ')}).`;

            Alert.alert(
                'Cảnh báo',
                `Đã upload thành công ${uploadedUrls.length}/${uris.length} ảnh.\n\n${errorDetails}\n\nVui lòng kiểm tra kết nối mạng và thử lại.`
            );
        } else if (uploadedUrls.length > 0) {
            // Success message only if multiple images
            if (uploadedUrls.length > 1) {
                Alert.alert('Thành công', `Đã upload thành công ${uploadedUrls.length} ảnh.`);
            }
        }
    };

    const removeImage = async (index: number) => {
        const imageToRemove = images[index];

        // If custom delete handler is provided, use it (for order photos)
        if (customDeleteHandler && imageToRemove) {
            try {
                await customDeleteHandler(imageToRemove);
                // After successful delete, update local state
                const newImages = images.filter((_, i) => i !== index);
                onImagesChange(newImages);
                // Call onUploadSuccess to refresh data
                if (onUploadSuccess) {
                    onUploadSuccess();
                }
            } catch (error: any) {
                console.error('Error deleting image:', error);
                Alert.alert(
                    'Lỗi',
                    error.message || 'Không thể xóa ảnh. Vui lòng thử lại.'
                );
            }
        } else {
            // Default behavior: just remove from local state
            const newImages = images.filter((_, i) => i !== index);
            onImagesChange(newImages);
        }
    };

    const removeAllImages = async () => {
        Alert.alert(
            'Xác nhận xóa',
            `Bạn có chắc chắn muốn xóa tất cả ${images.length} ảnh?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa tất cả',
                    style: 'destructive',
                    onPress: async () => {
                        // If custom delete handler is provided, delete all one by one
                        if (customDeleteHandler) {
                            try {
                                for (const imageUrl of images) {
                                    await customDeleteHandler(imageUrl);
                                }
                                onImagesChange([]);
                                if (onUploadSuccess) {
                                    onUploadSuccess();
                                }
                            } catch (error: any) {
                                console.error('Error deleting all images:', error);
                                Alert.alert(
                                    'Lỗi',
                                    error.message || 'Không thể xóa tất cả ảnh. Vui lòng thử lại.'
                                );
                            }
                        } else {
                            // Default behavior: just clear local state
                            onImagesChange([]);
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
                    {displayTitle} {images.length > 0 && `(${images.length}/${maxImages})`}
                </Text>
                <View className="flex-row gap-2">
                    {images.length > 0 && (
                        <TouchableOpacity
                            onPress={removeAllImages}
                            disabled={uploading}
                            className="flex-row items-center gap-1 rounded-lg bg-red-100 px-3 py-1.5 dark:bg-red-900/30"
                        >
                            <MaterialIcons name="delete-outline" size={16} color="#DC2626" />
                            <Text className="text-xs font-semibold text-red-600 dark:text-red-400">Xóa tất cả</Text>
                        </TouchableOpacity>
                    )}
                    {images.length < maxImages && (
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

            {images.length === 0 ? (
                <TouchableOpacity
                    onPress={pickImage}
                    disabled={uploading}
                    className="h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800"
                >
                    <MaterialIcons name="add-photo-alternate" size={32} color="#9CA3AF" />
                    <Text className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Chụp hoặc chọn {userRole === 'customer' ? 'ảnh vé máy bay' : 'ảnh kiện hàng'}
                    </Text>
                    <Text className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                        Tối đa {maxImages} ảnh
                    </Text>
                </TouchableOpacity>
            ) : (
                <View className="w-full">
                    <View className="flex-row flex-wrap gap-3">
                        {images.map((imageUri, index) => (
                            <View key={index} className="relative" style={{ width: '30%' }}>
                                <Image
                                    source={{ uri: imageUri }}
                                    className="h-32 w-full rounded-lg"
                                    resizeMode="cover"
                                />
                                {uploadingIndexes.has(index) && (
                                    <View className="absolute inset-0 items-center justify-center rounded-lg bg-black/50">
                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                    </View>
                                )}
                                <TouchableOpacity
                                    onPress={() => removeImage(index)}
                                    disabled={uploadingIndexes.has(index)}
                                    className="absolute -right-2 -top-2 h-7 w-7 items-center justify-center rounded-full bg-red-500 shadow-lg"
                                    activeOpacity={0.7}
                                >
                                    <MaterialIcons name="close" size={18} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>
                        ))}
                        {images.length < maxImages && (
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

export default RequestItemImagesUpload;


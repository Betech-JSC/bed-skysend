import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { GoogleMaps, AppleMaps } from 'expo-maps';
import { MaterialIcons } from '@expo/vector-icons';
import { FlightTrackingData } from '@/services/flightTrackingApi';

interface FlightTrackingMapProps {
    trackingData: FlightTrackingData | null;
    loading?: boolean;
    height?: number;
}

export default function FlightTrackingMap({
    trackingData,
    loading = false,
    height = 300,
}: FlightTrackingMapProps) {
    // Calculate camera position to show both airports and current position
    const cameraPosition = useMemo(() => {
        if (!trackingData) {
            return {
                coordinates: {
                    latitude: 10.8231, // Default to Ho Chi Minh City
                    longitude: 106.6297,
                },
                zoom: 5,
            };
        }

        const { airports, current_position } = trackingData;
        const points: Array<{ lat: number; lng: number }> = [];

        // Add airport coordinates
        if (airports.from.latitude && airports.from.longitude) {
            points.push({ lat: airports.from.latitude, lng: airports.from.longitude });
        }
        if (airports.to.latitude && airports.to.longitude) {
            points.push({ lat: airports.to.latitude, lng: airports.to.longitude });
        }
        if (current_position.latitude && current_position.longitude) {
            points.push({ lat: current_position.latitude, lng: current_position.longitude });
        }

        if (points.length === 0) {
            return {
                coordinates: {
                    latitude: 10.8231,
                    longitude: 106.6297,
                },
                zoom: 5,
            };
        }

        // Calculate bounds
        const lats = points.map(p => p.lat);
        const lngs = points.map(p => p.lng);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);

        // Calculate center and zoom
        const centerLat = (minLat + maxLat) / 2;
        const centerLng = (minLng + maxLng) / 2;

        // Estimate zoom level based on bounds
        const latDiff = maxLat - minLat;
        const lngDiff = maxLng - minLng;
        const maxDiff = Math.max(latDiff, lngDiff);
        let zoom = 10;
        if (maxDiff > 10) zoom = 5;
        else if (maxDiff > 5) zoom = 6;
        else if (maxDiff > 2) zoom = 7;
        else if (maxDiff > 1) zoom = 8;
        else if (maxDiff > 0.5) zoom = 9;
        else zoom = 10;

        return {
            coordinates: {
                latitude: centerLat,
                longitude: centerLng,
            },
            zoom,
        };
    }, [trackingData]);

    // Create markers array
    const markers = useMemo(() => {
        if (!trackingData) return [];

        const { airports, current_position, flight } = trackingData;
        const markersArray: any[] = [];

        // Departure airport marker
        if (airports.from.latitude && airports.from.longitude) {
            markersArray.push({
                id: 'departure',
                coordinates: {
                    latitude: airports.from.latitude,
                    longitude: airports.from.longitude,
                },
                title: `Sân bay đi: ${airports.from.code}`,
                snippet: flight.from_airport,
            });
        }

        // Current position marker (if in flight)
        if (current_position.latitude &&
            current_position.longitude &&
            flight.tracking_status === 'in_flight') {
            markersArray.push({
                id: 'current',
                coordinates: {
                    latitude: current_position.latitude,
                    longitude: current_position.longitude,
                },
                title: 'Vị trí hiện tại',
                snippet: `Độ cao: ${current_position.altitude ? `${Math.round(current_position.altitude)} ft` : 'N/A'}`,
            });
        }

        // Arrival airport marker
        if (airports.to.latitude && airports.to.longitude) {
            markersArray.push({
                id: 'arrival',
                coordinates: {
                    latitude: airports.to.latitude,
                    longitude: airports.to.longitude,
                },
                title: `Sân bay đến: ${airports.to.code}`,
                snippet: flight.to_airport,
            });
        }

        return markersArray;
    }, [trackingData]);

    // Create polyline coordinates
    const polylines = useMemo(() => {
        if (!trackingData) return [];

        const { airports, current_position } = trackingData;
        const coordinates: Array<{ latitude: number; longitude: number }> = [];

        // Start from departure airport
        if (airports.from.latitude && airports.from.longitude) {
            coordinates.push({
                latitude: airports.from.latitude,
                longitude: airports.from.longitude,
            });
        }

        // Add current position if available
        if (current_position.latitude && current_position.longitude) {
            coordinates.push({
                latitude: current_position.latitude,
                longitude: current_position.longitude,
            });
        }

        // End at arrival airport
        if (airports.to.latitude && airports.to.longitude) {
            coordinates.push({
                latitude: airports.to.latitude,
                longitude: airports.to.longitude,
            });
        }

        if (coordinates.length >= 2) {
            return [{
                id: 'flight-path',
                coordinates,
                color: '#2563EB',
                width: 3,
            }];
        }

        return [];
    }, [trackingData]);

    if (loading) {
        return (
            <View style={[styles.container, { height }]} className="items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                <ActivityIndicator size="large" color="#2563EB" />
                <Text className="mt-2 text-gray-600 dark:text-gray-400">Đang tải bản đồ...</Text>
            </View>
        );
    }

    if (!trackingData) {
        return (
            <View style={[styles.container, { height }]} className="items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                <MaterialIcons name="map" size={48} color="#9CA3AF" />
                <Text className="mt-2 text-gray-600 dark:text-gray-400">Không có dữ liệu tracking</Text>
            </View>
        );
    }

    const { flight, current_position } = trackingData;

    // Use GoogleMaps on Android, AppleMaps on iOS
    const MapComponent = Platform.OS === 'android' ? GoogleMaps.View : AppleMaps.View;

    return (
        <View style={[styles.container, { height }]} className="rounded-lg overflow-hidden">
            <MapComponent
                style={styles.map}
                cameraPosition={cameraPosition}
                markers={markers}
                polylines={polylines}
            />

            {/* Status info overlay */}
            <View className="absolute bottom-4 left-4 right-4 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg">
                <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                        <Text className="text-xs text-gray-500 dark:text-gray-400">Trạng thái</Text>
                        <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                            {getStatusLabel(flight.tracking_status)}
                        </Text>
                    </View>
                    {current_position.altitude && (
                        <View className="ml-4">
                            <Text className="text-xs text-gray-500 dark:text-gray-400">Độ cao</Text>
                            <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                                {Math.round(current_position.altitude)} ft
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
}

function getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
        scheduled: 'Đã lên lịch',
        boarding: 'Đang lên máy bay',
        departed: 'Đã cất cánh',
        in_flight: 'Đang bay',
        landed: 'Đã hạ cánh',
        arrived: 'Đã đến nơi',
    };
    return labels[status] || status;
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#f3f4f6',
    },
    map: {
        width: '100%',
        height: '100%',
    },
});


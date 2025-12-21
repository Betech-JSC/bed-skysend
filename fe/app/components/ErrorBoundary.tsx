import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console (không hiển thị trên màn hình nhờ LogBox)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Nếu có custom fallback, sử dụng nó
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <View className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center px-6">
          <View className="items-center">
            <MaterialIcons name="error-outline" size={64} color="#EF4444" />
            <Text className="mt-4 text-xl font-bold text-text-dark-gray dark:text-white text-center">
              Đã xảy ra lỗi
            </Text>
            <Text className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
              Ứng dụng gặp sự cố không mong muốn. Vui lòng thử lại.
            </Text>
            
            {__DEV__ && this.state.error && (
              <ScrollView className="mt-4 max-h-48 w-full bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                <Text className="text-xs text-gray-700 dark:text-gray-300 font-mono">
                  {this.state.error.toString()}
                </Text>
                {this.state.errorInfo && (
                  <Text className="mt-2 text-xs text-gray-600 dark:text-gray-400 font-mono">
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </ScrollView>
            )}

            <TouchableOpacity
              onPress={this.handleReset}
              className="mt-6 bg-primary px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-bold">Thử lại</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}


/**
 * Shared utilities for order and request status management
 * Centralizes status normalization, labeling, and mapping logic
 */

// Order status types (normalized)
export type OrderStatusType = 'new' | 'in_transit' | 'completed' | 'cancelled';

// Request status types
export type RequestStatusType = 'pending' | 'accepted' | 'declined' | 'confirmed' | 'expired' | 'cancelled';

// Backend status types
export type BackendOrderStatus =
  | 'pending'
  | 'confirmed'
  | 'picked_up'
  | 'in_transit'
  | 'arrived'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export interface StatusLabel {
  label: string;
  color: string;
  icon?: string;
}

/**
 * Normalize backend order status to simplified frontend status
 * Maps: pending/confirmed -> new, picked_up/in_transit/arrived/delivered -> in_transit
 */
export const normalizeOrderStatus = (status: string): OrderStatusType => {
  // Đơn mới: pending, confirmed
  if (status === 'pending' || status === 'confirmed') {
    return 'new';
  }
  // Đang vận chuyển: picked_up, in_transit, arrived, delivered
  if (status === 'picked_up' || status === 'in_transit' || status === 'arrived' || status === 'delivered') {
    return 'in_transit';
  }
  // Hoàn thành và Đã hủy giữ nguyên
  if (status === 'completed' || status === 'cancelled') {
    return status;
  }
  return status as OrderStatusType;
};

/**
 * Get status label and styling for orders
 */
export const getOrderStatusLabel = (status: string): StatusLabel => {
  const normalizedStatus = normalizeOrderStatus(status);

  const statusMap: Record<OrderStatusType, StatusLabel> = {
    'new': {
      label: 'Đơn mới',
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      icon: 'new-releases'
    },
    'in_transit': {
      label: 'Đang vận chuyển',
      color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
      icon: 'local-shipping'
    },
    'completed': {
      label: 'Hoàn thành',
      color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
      icon: 'check-circle'
    },
    'cancelled': {
      label: 'Đã hủy',
      color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
      icon: 'cancel'
    },
  };

  return statusMap[normalizedStatus] || {
    label: status,
    color: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400'
  };
};

/**
 * Get status label and styling for requests
 */
export const getRequestStatusLabel = (status: string): StatusLabel => {
  const statusMap: Record<string, StatusLabel> = {
    'pending': {
      label: 'Chờ xác nhận',
      color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
      icon: 'schedule'
    },
    'accepted': {
      label: 'Đã chấp nhận',
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      icon: 'check-circle'
    },
    'declined': {
      label: 'Đã từ chối',
      color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
      icon: 'cancel'
    },
    'confirmed': {
      label: 'Đã xác nhận',
      color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
      icon: 'verified'
    },
    'expired': {
      label: 'Hết hạn',
      color: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400',
      icon: 'schedule'
    },
    'cancelled': {
      label: 'Đã hủy',
      color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
      icon: 'cancel'
    },
  };

  return statusMap[status] || {
    label: status,
    color: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400'
  };
};

/**
 * Get next available status in the order flow (for customer updates)
 * Flow: new -> in_transit -> completed
 */
export const getNextOrderStatus = (currentStatus: string): OrderStatusType | null => {
  const normalized = normalizeOrderStatus(currentStatus);
  const statusFlow: Record<OrderStatusType, OrderStatusType | null> = {
    'new': 'in_transit',           // Đơn mới -> Đang vận chuyển
    'in_transit': 'completed',     // Đang vận chuyển -> Hoàn thành
    'completed': null,              // Đã hoàn thành -> không có next
    'cancelled': null,              // Đã hủy -> không có next
  };
  return statusFlow[normalized] || null;
};

/**
 * Map frontend normalized status to backend status for API calls
 * Used when customer updates order status
 */
export const mapToBackendStatus = (frontendStatus: OrderStatusType, currentBackendStatus: string): BackendOrderStatus => {
  if (frontendStatus === 'in_transit') {
    // Từ 'new' (confirmed/pending) -> 'in_transit': gửi 'picked_up' (bước đầu)
    if (currentBackendStatus === 'confirmed' || currentBackendStatus === 'pending') {
      return 'picked_up';
    }
    // Nếu đã ở trong flow vận chuyển, chuyển sang bước tiếp theo
    if (currentBackendStatus === 'picked_up') {
      return 'in_transit';
    }
    if (currentBackendStatus === 'in_transit') {
      return 'arrived';
    }
    if (currentBackendStatus === 'arrived') {
      return 'delivered';
    }
    // Default fallback
    return 'picked_up';
  }
  if (frontendStatus === 'completed') {
    // Có thể complete từ bất kỳ trạng thái nào trong flow vận chuyển (picked_up, in_transit, arrived, delivered)
    if (currentBackendStatus === 'delivered') {
      return 'completed';
    }
    if (currentBackendStatus === 'arrived') {
      return 'completed';
    }
    if (currentBackendStatus === 'in_transit') {
      return 'completed';
    }
    if (currentBackendStatus === 'picked_up') {
      return 'completed';
    }
    // Nếu là confirmed/pending, vẫn có thể complete (trường hợp đặc biệt)
    if (currentBackendStatus === 'confirmed' || currentBackendStatus === 'pending') {
      return 'completed';
    }
    // Fallback
    return 'completed';
  }
  return frontendStatus as BackendOrderStatus;
};

/**
 * Order filter tabs configuration
 */
export const ORDER_FILTER_TABS = [
  { label: 'Tất cả', status: '' as const },
  { label: 'Đơn mới', status: 'new' as const },
  { label: 'Đang vận chuyển', status: 'in_transit' as const },
  { label: 'Hoàn thành', status: 'completed' as const },
  { label: 'Đã hủy', status: 'cancelled' as const },
] as const;

/**
 * Request filter tabs configuration
 */
export const REQUEST_FILTER_TABS = [
  { label: 'Tất cả', status: '' as const },
  { label: 'Chờ xác nhận', status: 'pending' as const },
  { label: 'Đã chấp nhận', status: 'accepted' as const },
  { label: 'Đã xác nhận', status: 'confirmed' as const },
  { label: 'Đã từ chối', status: 'declined' as const },
  { label: 'Hết hạn', status: 'expired' as const },
  { label: 'Đã hủy', status: 'cancelled' as const },
] as const;

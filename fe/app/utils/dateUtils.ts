/**
 * Utility functions for date formatting
 * Fixes timezone issues when parsing date strings
 */

/**
 * Parse a date string and return a Date object in local timezone
 * Handles both date-only strings (YYYY-MM-DD) and datetime strings
 */
export function parseDate(dateString: string | null | undefined): Date | null {
    if (!dateString) return null;

    try {
        // Remove any whitespace
        const cleanDateString = dateString.trim();

        // If it's a date-only string (YYYY-MM-DD), parse it as local date
        // This ensures the date is interpreted in local timezone, not UTC
        if (/^\d{4}-\d{2}-\d{2}$/.test(cleanDateString)) {
            const [year, month, day] = cleanDateString.split('-').map(Number);
            // Create date in local timezone (month is 0-indexed)
            const localDate = new Date(year, month - 1, day);
            // Verify the date is valid
            if (localDate.getFullYear() === year &&
                localDate.getMonth() === month - 1 &&
                localDate.getDate() === day) {
                return localDate;
            }
        }

        // If it's a datetime string with time but no timezone (YYYY-MM-DD HH:MM:SS or YYYY-MM-DDTHH:MM:SS)
        // Parse as local time
        if (/^\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}/.test(cleanDateString)) {
            // Check if it has timezone info
            if (!cleanDateString.includes('Z') &&
                !cleanDateString.includes('+') &&
                !cleanDateString.match(/-\d{2}:\d{2}$/)) {
                // No timezone info, parse as local
                const dateTimeMatch = cleanDateString.match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2}))?/);
                if (dateTimeMatch) {
                    const [, year, month, day, hour, minute, second] = dateTimeMatch.map(Number);
                    const localDate = new Date(year, month - 1, day, hour || 0, minute || 0, second || 0);
                    return localDate;
                }
            }
        }

        // Try parsing normally (for ISO strings with timezone)
        const date = new Date(cleanDateString);

        // If parsing resulted in invalid date, try manual parsing
        if (isNaN(date.getTime())) {
            // Try to extract date parts manually
            const dateMatch = cleanDateString.match(/(\d{4})-(\d{2})-(\d{2})/);
            if (dateMatch) {
                const [, year, month, day] = dateMatch.map(Number);
                return new Date(year, month - 1, day);
            }
            return null;
        }

        // If the parsed date seems wrong (timezone shift), try to correct it
        // This handles cases where backend sends "2025-12-20" but browser interprets as UTC
        if (cleanDateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month, day] = cleanDateString.split('-').map(Number);
            // If the date components don't match, it was likely parsed as UTC
            if (date.getUTCFullYear() === year &&
                date.getUTCMonth() === month - 1 &&
                date.getUTCDate() === day &&
                (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day)) {
                // It was parsed as UTC, convert to local
                return new Date(year, month - 1, day);
            }
        }

        return date;
    } catch (error) {
        console.error('Error parsing date:', dateString, error);
        return null;
    }
}

/**
 * Format date to Vietnamese format: "Thứ X, DD/MM/YYYY"
 */
export function formatDate(dateString: string | null | undefined): string {
    const date = parseDate(dateString);
    if (!date || isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateString);
        return 'Không xác định';
    }

    // Verify the date is valid
    if (date.getFullYear() < 1900 || date.getFullYear() > 2100) {
        console.warn('Date out of valid range:', dateString, date);
        return 'Không xác định';
    }

    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const dayName = days[dayOfWeek];
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    // Debug log to verify
    if (__DEV__) {
        console.log('Formatting date:', {
            input: dateString,
            parsed: date.toISOString(),
            local: date.toLocaleString('vi-VN'),
            dayOfWeek,
            dayName,
            formatted: `${dayName}, ${day}/${month}/${year}`
        });
    }

    return `${dayName}, ${day}/${month}/${year}`;
}

/**
 * Format time to HH:MM format
 */
export function formatTime(dateString: string | null | undefined): string {
    const date = parseDate(dateString);
    if (!date || isNaN(date.getTime())) return '--:--';

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${hours}:${minutes}`;
}

/**
 * Format date and time: "Thứ X, DD/MM/YYYY HH:MM"
 */
export function formatDateTime(dateString: string | null | undefined): string {
    const date = parseDate(dateString);
    if (!date || isNaN(date.getTime())) return 'Không xác định';

    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = days[date.getDay()];
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${dayName}, ${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Format date only: "DD/MM/YYYY"
 */
export function formatDateOnly(dateString: string | null | undefined): string {
    const date = parseDate(dateString);
    if (!date || isNaN(date.getTime())) return 'Không xác định';

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}

/**
 * Format relative time (e.g., "2 giờ trước", "Hôm qua")
 */
export function formatRelativeTime(dateString: string | null | undefined): string {
    const date = parseDate(dateString);
    if (!date || isNaN(date.getTime())) return 'Không xác định';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
        return 'Vừa xong';
    } else if (diffMins < 60) {
        return `${diffMins} phút trước`;
    } else if (diffHours < 24) {
        return `${diffHours} giờ trước`;
    } else if (diffDays === 1) {
        return 'Hôm qua';
    } else if (diffDays < 7) {
        return `${diffDays} ngày trước`;
    } else {
        return formatDateOnly(dateString);
    }
}


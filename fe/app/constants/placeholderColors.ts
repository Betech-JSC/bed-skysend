/**
 * Placeholder colors cho TextInput
 * - Mờ khi input trống và không focus
 * - Rõ hơn khi input có focus
 */
export const PLACEHOLDER_COLORS = {
    // Mờ khi không focus (chưa nhập)
    dim: {
        light: '#D1D5DB', // Gray-300
        dark: '#4B5563',  // Gray-500
    },
    // Rõ hơn khi có focus
    focused: {
        light: '#6B7280', // Gray-500
        dark: '#9CA3AF',  // Gray-400
    },
    // Default (giữ nguyên cho backward compatibility)
    default: {
        light: '#9CA3AF', // Gray-400
        dark: '#9CA3AF',  // Gray-400
    },
} as const;

/**
 * Lấy placeholder color dựa trên theme và focus state
 */
export const getPlaceholderColor = (
    isDark: boolean,
    isFocused: boolean = false
): string => {
    if (isFocused) {
        return isDark ? PLACEHOLDER_COLORS.focused.dark : PLACEHOLDER_COLORS.focused.light;
    }
    return isDark ? PLACEHOLDER_COLORS.dim.dark : PLACEHOLDER_COLORS.dim.light;
};


/**
 * Format số tiền thành chuỗi VND với dấu phẩy ngăn cách
 * @param value - Giá trị số hoặc chuỗi số
 * @returns Chuỗi đã format (ví dụ: "1,000,000")
 */
export function formatVND(value: string | number | null | undefined): string {
    if (!value && value !== 0) return '';

    // Chuyển thành số
    const numValue = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;

    if (isNaN(numValue)) return '';

    // Format với dấu phẩy ngăn cách hàng nghìn
    return numValue.toLocaleString('vi-VN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
}

/**
 * Parse chuỗi VND đã format về số
 * @param formattedValue - Chuỗi đã format (ví dụ: "1,000,000")
 * @returns Số nguyên
 */
export function parseVND(formattedValue: string): number {
    if (!formattedValue) return 0;

    // Loại bỏ tất cả ký tự không phải số
    const cleaned = formattedValue.replace(/[^\d]/g, '');

    return cleaned ? parseInt(cleaned, 10) : 0;
}

/**
 * Format số tiền thành chuỗi VND với đơn vị
 * @param value - Giá trị số
 * @returns Chuỗi đã format (ví dụ: "1,000,000 VNĐ")
 */
export function formatVNDWithUnit(value: number | null | undefined): string {
    if (!value && value !== 0) return '0 VNĐ';
    return `${formatVND(value)} VNĐ`;
}

/**
 * Hook để format giá trị khi nhập vào TextInput
 * Tự động format khi người dùng nhập
 */
export function useCurrencyInput(initialValue: string = '') {
    const formatInput = (text: string): string => {
        // Loại bỏ tất cả ký tự không phải số
        const numbersOnly = text.replace(/[^\d]/g, '');

        if (!numbersOnly) return '';

        // Parse và format lại
        const numValue = parseInt(numbersOnly, 10);
        if (isNaN(numValue)) return '';

        return formatVND(numValue);
    };

    return { formatInput };
}

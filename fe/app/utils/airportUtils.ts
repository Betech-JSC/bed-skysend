import { airportCities } from '../constants/airportCities';

/**
 * Lấy mã sân bay kèm tên thành phố
 * @param code Mã sân bay (ví dụ: 'SGN')
 * @returns Format: "SGN - TP.HCM" hoặc chỉ "SGN" nếu không tìm thấy
 */
export function getAirportWithCity(code: string | null | undefined): string {
    if (!code) {
        return 'Chưa có';
    }
    
    const upperCode = code.toUpperCase().trim();
    const city = airportCities[upperCode];
    
    if (city) {
        return `${upperCode} - ${city}`;
    }
    
    return upperCode;
}


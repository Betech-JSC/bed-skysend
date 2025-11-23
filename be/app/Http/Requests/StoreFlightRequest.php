<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFlightRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'from_airport'      => 'required|size:3|different:to_airport',
            'to_airport'        => 'required|size:3',
            'flight_date'       => 'required|date|after_or_equal:today',
            'airline'           => 'required|string|max:100',
            'flight_number'     => 'required|string|max:10|regex:/^[A-Z]{1,2}[0-9]{1,4}$/i',
            'max_weight'        => 'required|numeric|min:1|max:20',
            'note'              => 'nullable|string|max:500',
            'boarding_passes.*' => 'required|file|mimes:jpeg,jpg,png,pdf|max:10240',
            'boarding_passes'   => 'required|array|min:1|max:5',
        ];
    }

    public function messages(): array
    {
        return [
            'boarding_passes.required' => 'Vui lòng tải lên ít nhất 1 ảnh vé máy bay.',
            'boarding_passes.max'      => 'Chỉ được tải tối đa 5 ảnh.',
            'flight_number.regex'      => 'Mã chuyến bay không hợp lệ (VD: VN1234, VJ789, QH123)',
            'from_airport.different'   => 'Sân bay đi và đến phải khác nhau.',
        ];
    }
}

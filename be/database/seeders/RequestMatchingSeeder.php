<?php

namespace Database\Seeders;

use App\Models\Flight;
use App\Models\Request;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class RequestMatchingSeeder extends Seeder
{
    /**
     * Seed data mẫu để test chức năng Request chờ match
     */
    public function run(): void
    {
        // 1. Tạo các Customers với Flights đã verified
        $customers = [];
        $flights = [];

        // Customer 1: Hà Nội -> TP.HCM
        $customer1 = User::create([
            'name' => 'Nguyễn Văn A',
            'email' => 'customer1@example.com',
            'phone' => '0912345678',
            'password' => Hash::make('password'),
            'role' => 'customer',
        ]);
        $customers[] = $customer1;

        $flight1 = Flight::create([
            'uuid' => 'FL' . strtoupper(Str::random(8)),
            'customer_id' => $customer1->id,
            'from_airport' => 'HAN',
            'to_airport' => 'SGN',
            'flight_date' => now()->addDays(3),
            'airline' => 'Vietnam Airlines',
            'flight_number' => 'VN123',
            'verified' => true,
            'verified_at' => now(),
            'max_weight' => 20.00,
            'booked_weight' => 5.00, // Còn 15kg trống
            'status' => 'confirmed',
        ]);
        $flights[] = $flight1;

        // Customer 2: Hà Nội -> Đà Nẵng
        $customer2 = User::create([
            'name' => 'Trần Thị B',
            'email' => 'customer2@example.com',
            'phone' => '0923456789',
            'password' => Hash::make('password'),
            'role' => 'customer',
        ]);
        $customers[] = $customer2;

        $flight2 = Flight::create([
            'uuid' => 'FL' . strtoupper(Str::random(8)),
            'customer_id' => $customer2->id,
            'from_airport' => 'HAN',
            'to_airport' => 'DAD',
            'flight_date' => now()->addDays(5),
            'airline' => 'VietJet Air',
            'flight_number' => 'VJ456',
            'verified' => true,
            'verified_at' => now(),
            'max_weight' => 15.00,
            'booked_weight' => 2.00, // Còn 13kg trống
            'status' => 'confirmed',
        ]);
        $flights[] = $flight2;

        // Customer 3: TP.HCM -> Hà Nội
        $customer3 = User::create([
            'name' => 'Lê Văn C',
            'email' => 'customer3@example.com',
            'phone' => '0934567890',
            'password' => Hash::make('password'),
            'role' => 'customer',
        ]);
        $customers[] = $customer3;

        $flight3 = Flight::create([
            'uuid' => 'FL' . strtoupper(Str::random(8)),
            'customer_id' => $customer3->id,
            'from_airport' => 'SGN',
            'to_airport' => 'HAN',
            'flight_date' => now()->addDays(7),
            'airline' => 'Bamboo Airways',
            'flight_number' => 'QH789',
            'verified' => true,
            'verified_at' => now(),
            'max_weight' => 25.00,
            'booked_weight' => 10.00, // Còn 15kg trống
            'status' => 'confirmed',
        ]);
        $flights[] = $flight3;

        // Customer 4: Đà Nẵng -> TP.HCM
        $customer4 = User::create([
            'name' => 'Phạm Thị D',
            'email' => 'customer4@example.com',
            'phone' => '0945678901',
            'password' => Hash::make('password'),
            'role' => 'customer',
        ]);
        $customers[] = $customer4;

        $flight4 = Flight::create([
            'uuid' => 'FL' . strtoupper(Str::random(8)),
            'customer_id' => $customer4->id,
            'from_airport' => 'DAD',
            'to_airport' => 'SGN',
            'flight_date' => now()->addDays(4),
            'airline' => 'Vietnam Airlines',
            'flight_number' => 'VN321',
            'verified' => true,
            'verified_at' => now(),
            'max_weight' => 18.00,
            'booked_weight' => 0.00, // Còn 18kg trống
            'status' => 'confirmed',
        ]);
        $flights[] = $flight4;

        // 2. Tạo các Senders
        $sender1 = User::create([
            'name' => 'Nguyễn Gửi Hàng 1',
            'email' => 'sender1@example.com',
            'phone' => '0956789012',
            'password' => Hash::make('password'),
            'role' => 'sender',
        ]);

        $sender2 = User::create([
            'name' => 'Trần Gửi Hàng 2',
            'email' => 'sender2@example.com',
            'phone' => '0967890123',
            'password' => Hash::make('password'),
            'role' => 'sender',
        ]);

        // 3. Tạo Requests - Một số chờ match, một số đã gửi

        // Request 1: Chờ match - HAN -> SGN (sẽ match với flight1)
        Request::create([
            'uuid' => Request::generateRequestUuid(),
            'sender_id' => $sender1->id,
            'flight_id' => null, // Chưa có flight, đang chờ match
            'from_airport' => 'HAN',
            'to_airport' => 'SGN',
            'desired_date' => now()->addDays(3),
            'desired_time_slot' => 'morning',
            'desired_weight' => 2.5,
            'item_type' => 'document',
            'item_description' => 'Hồ sơ công chứng cần gửi gấp',
            'item_value' => 5000000,
            'reward' => 500000,
            'status' => 'pending',
            'priority_level' => 'urgent',
            'expires_at' => now()->addHours(12),
        ]);

        // Request 2: Chờ match - HAN -> DAD (sẽ match với flight2)
        Request::create([
            'uuid' => Request::generateRequestUuid(),
            'sender_id' => $sender1->id,
            'flight_id' => null,
            'from_airport' => 'HAN',
            'to_airport' => 'DAD',
            'desired_date' => now()->addDays(5),
            'desired_time_slot' => 'afternoon',
            'desired_weight' => 1.5,
            'item_type' => 'package',
            'item_description' => 'Quà tặng sinh nhật',
            'item_value' => 2000000,
            'reward' => 300000,
            'status' => 'pending',
            'priority_level' => 'normal',
            'expires_at' => now()->addHours(48),
        ]);

        // Request 3: Chờ match - SGN -> HAN (sẽ match với flight3)
        Request::create([
            'uuid' => Request::generateRequestUuid(),
            'sender_id' => $sender2->id,
            'flight_id' => null,
            'from_airport' => 'SGN',
            'to_airport' => 'HAN',
            'desired_date' => now()->addDays(7),
            'desired_time_slot' => 'evening',
            'desired_weight' => 3.0,
            'item_type' => 'contract',
            'item_description' => 'Hợp đồng cần ký gấp',
            'item_value' => 10000000,
            'reward' => 800000,
            'status' => 'pending',
            'priority_level' => 'priority',
            'expires_at' => now()->addHours(24),
        ]);

        // Request 4: Đã gửi - Đã có flight_id (đã match và gửi)
        Request::create([
            'uuid' => Request::generateRequestUuid(),
            'sender_id' => $sender2->id,
            'flight_id' => $flight4->id, // Đã gửi tới flight4
            'from_airport' => 'DAD',
            'to_airport' => 'SGN',
            'desired_date' => now()->addDays(4),
            'desired_time_slot' => 'any',
            'desired_weight' => 2.0,
            'item_type' => 'gift',
            'item_description' => 'Quà tặng đã gửi',
            'item_value' => 3000000,
            'reward' => 400000,
            'status' => 'pending', // Đang chờ customer accept
            'priority_level' => 'normal',
            'expires_at' => now()->addHours(48),
        ]);

        // Request 5: Chờ match - DAD -> SGN (sẽ match với flight4)
        Request::create([
            'uuid' => Request::generateRequestUuid(),
            'sender_id' => $sender1->id,
            'flight_id' => null,
            'from_airport' => 'DAD',
            'to_airport' => 'SGN',
            'desired_date' => now()->addDays(4),
            'desired_time_slot' => 'morning',
            'desired_weight' => 1.0,
            'item_type' => 'document',
            'item_description' => 'Tài liệu cần gửi',
            'item_value' => 1500000,
            'reward' => 250000,
            'status' => 'pending',
            'priority_level' => 'normal',
            'expires_at' => now()->addHours(48),
        ]);

        $this->command->info('✅ Đã tạo dữ liệu mẫu cho Request Matching:');
        $this->command->info('   - ' . count($customers) . ' customers với ' . count($flights) . ' flights đã verified');
        $this->command->info('   - 2 senders');
        $this->command->info('   - 5 requests (3 chờ match, 1 đã gửi, 1 chờ match)');
        $this->command->info('');
        $this->command->info('📧 Thông tin đăng nhập:');
        $this->command->info('   Sender 1: sender1@example.com / password');
        $this->command->info('   Sender 2: sender2@example.com / password');
        $this->command->info('   Customer 1: customer1@example.com / password');
        $this->command->info('   Customer 2: customer2@example.com / password');
    }
}

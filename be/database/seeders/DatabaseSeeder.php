<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'first_name' => 'admin',
            'last_name'  => 'admin',
            'name'       => 'admin',
            'email'      => 'admin@gmail.com',
            'password'   => Hash::make('admin123'), // đừng lưu mật khẩu dạng plain text!
            'owner'      => true,
        ]);

        User::factory()->create([
            'first_name' => 'toan',
            'last_name'  => 'toan',
            'name'       => 'toan',
            'email'      => 'toan@gmail.com',
            'password'   => Hash::make('toan123'),
            'owner'      => true,
        ]);

        $this->call([
            AirportSeeder::class,
        ]);
    }
}

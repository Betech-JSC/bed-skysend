<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'first_name' => 'admin',
            'last_name' => 'admin',
            'name' => 'admin',
            'email' => 'admin@gmail.com',
            'password' => 'admin@gmail.com',
            'owner' => true,
        ]);

        $this->call([
            RegionSeeder::class,
        ]);
    }
}

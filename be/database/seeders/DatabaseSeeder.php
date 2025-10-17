<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\Contact;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $account = Account::create(['name' => 'Acme Corporation']);

        User::factory()->create([
            'account_id' => $account->id,
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'admin@gmail.com',
            'password' => 'admin@gmail.com',
            'owner' => true,
        ]);

        User::factory(5)->create(['account_id' => $account->id]);

        $this->call([
            RegionSeeder::class,
        ]);
    }
}

<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admins = [
            [
                'email' => 'admin@gmail.com',
                'name' => 'admin',
                'password' => Hash::make('adminpassword'),
                'is_admin' => true
            ],
            [
                'email' => 'admin2@gmail.com',
                'name' => 'admin2',
                'password' => Hash::make('adminpassword'),
                'is_admin' => true
            ],
        ];

        foreach ($admins as $admin) {
            User::updateOrCreate(['email' => $admin['email']], $admin);
        }
    }
}

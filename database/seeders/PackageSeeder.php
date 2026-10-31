<?php

namespace Database\Seeders;

use App\Models\Package;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PackageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $packages = [
            [
                'name' => 'Standard',
                'description' => 'Standard Subscription Package',
                'duration' => 7,
                'price' => 10000,
                'is_active' => true,
            ],
            [
                'name' => 'Premium',
                'description' => 'Premium Subscription Package',
                'duration' => 14,
                'price' => 50000,
                'is_active' => true,
            ],
            [
                'name' => 'Ultra Premium',
                'description' => 'Ultra Premium Subscription Package',
                'duration' => 30,
                'price' => 100000,
                'is_active' => true,
            ],  
        ];

        foreach ($packages as $package) {
            Package::updateOrCreate(['name' => $package['name']], $package);
        }
    }
}

<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\Payment;
use App\Models\User;

class AdminDashboardController extends Controller
{
    public function index()
    {
        return response()->json([
            'data' => [
                'total_packages' => Package::count(),
                'waiting_payments' => Payment::where('status', 'waiting_for_verification')->count(),
                'total_members' => User::where('is_admin', false)->count(),
            ]
        ]);
    }
}
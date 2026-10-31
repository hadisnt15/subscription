<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Package;
// use Illuminate\Http\Request;

class PackageController extends Controller
{
    public function index()
    {
        $packages = Package::where('is_active', true)->select('id', 'name', 'description', 'price', 'duration')->orderBy('price')->get();
        return response()->json(['data' => $packages]);
    }

    public function show(Package $package)
    {
        if (!$package->is_active) {
            return response()->json(['message' => 'Subscription Package Not Available'], 404);
        }

        return response()->json([
            'data' => $package->only(['id', 'name', 'description', 'price', 'duration'])
        ]);
    }
}

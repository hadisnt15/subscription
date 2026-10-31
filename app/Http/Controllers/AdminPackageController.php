<?php

namespace App\Http\Controllers;

use App\Models\Package;
use Illuminate\Http\Request;

class AdminPackageController extends Controller
{
    public function index()
    {
        $packages = Package::orderByDesc('created_at')->get();

        return response()->json([
            'message' => 'Package collected.',
            'data' => $packages
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required','string','max:255'],
            'description' => ['nullable','string'],
            'duration' => ['required','integer','min:1'],
            'price' => ['required','numeric','min:0'],
            'is_active' => ['boolean'],
        ]);

        $validated['is_active'] = $validated['is_active'] ?? true;

        $package = Package::create($validated);

        return response()->json([
            'message' => 'Package created.',
            'data' => $package,
        ], 201);
    }

    public function update(Request $request, Package $package)
    {
        $validated = $request->validate([
            'name' => ['sometimes','required','string','max:255'],
            'description' => ['sometimes','nullable','string'],
            'duration' => ['sometimes','required','integer','min:1'],
            'price' => ['sometimes','required','numeric','min:0'],
            'is_active' => ['sometimes','boolean']
        ]);

        $package->update($validated);

        return response()->json([
            'message' => 'Package updated.',
            'data' => $package->fresh(),
        ]);
    }

    public function toggleStatus(Package $package)
    {
        $package->update(['is_active' => !$package->is_active]);

        return response()->json([
            'message' => 'Package status updated.',
            'data' => $package,
        ]);
    }
}

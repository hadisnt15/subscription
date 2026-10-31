<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\Subscription;
use App\Models\SubscriptionHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class SubscriptionController extends Controller
{
    public function index(Request $request)
    {
        $subscription = $request->user()->subscription()->with([
            'subscriptionHistories' => function($query) {
                $query->with('payments')->latest();
            }
        ])->first();

        if (!$subscription) {
            return response()->json([
                'data' => null,
                'active_subscription' => null,
            ]);
        }

        $activeSubscription = $subscription->subscriptionHistories()->with('package')->where('status', 'active')->whereDate('end_date', '>=', today())->orderByDesc('end_date')->first();

        return response()->json([
            'data' => $subscription,
            'active_subscription' => $activeSubscription,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'package_id' => ['required', 'integer', 'exists:packages,id'],
        ]);

        $package = Package::where('is_active', true)->find($validated['package_id']);

        if (!$package) {
            return response()->json(['message' => 'Subscription Package Not Available'], 422);
        }

        $user = $request->user();
        $history = DB::transaction(function() use ($user, $package) {
            $subscription = Subscription::firstOrCreate(['user_id' => $user->id]);

            // jika ada subscription package pending
            $pendingSubscription = $subscription->subscriptionHistories()->whereIn('status', ['pending', 'waiting_for_verification'])->exists();
            if ($pendingSubscription) {
                return null;
            }

            return $subscription->subscriptionHistories()->create([
                'package_id' => $package->id,
                'package_name' => $package->name,
                'price' => $package->price,
                'duration' => $package->duration,
                'status' => 'pending',
                'start_date' => null,
                'end_date' => null
            ]);
        });

        if (!$history) {
            return response()->json(['message', 'Complete Your Approval Subscription First'], 422);
        }

        return response()->json([
            'message' => 'Subscription Package Created. Please, upload your payment proof.',
            'data' => $history->load('package'),
        ], 201);
    }

    public function uploadPayment(Request $request, SubscriptionHistory $history)
    {
        $validated = $request->validate([
            'payment_proof' => [ 'required', 'file', 'mimes:jpg,jpeg,png', 'max:1024'],
        ]);

        $user = $request->user();

        abort_unless($history->subscription()->where('user_id', $user->id)->exists(), 404, 'Subscription History Not Found.');

        if (! in_array($history->status, ['pending', 'rejected',], true)) {
            return response()->json(['message' => 'This Subscription History Cannot Receive Payment.'], 422);
        }

        $path = Storage::disk('local')->putFile('payment-proofs', $validated['payment_proof']);

        if (! $path) {
            return response()->json(['message' => 'Bukti pembayaran gagal disimpan.'], 500);
        }

        try {
            $payment = DB::transaction(function () use ($history, $user, $path) {
            $lockedHistory = SubscriptionHistory::whereKey($history->id)->lockForUpdate()->firstOrFail();
                if (! in_array($lockedHistory->status, ['pending', 'rejected'], true)) {
                    throw new \RuntimeException('Subscription History Cannot Receive Payment Anymore.');
                }

                $payment = $lockedHistory->payments()->create([
                    'paid_by' => $user->id,
                    'amount' => $lockedHistory->price,
                    'status' => 'waiting_for_verification',
                    'payment_proof' => $path,
                    'payment_date' => now(),
                ]);

                $lockedHistory->update(['status' => 'waiting_for_verification']);
                return $payment;
            });
        } catch (\RuntimeException $exception) {
            Storage::disk('local')->delete($path);
            return response()->json(['message' => $exception->getMessage()], 422);
        } catch (\Throwable $exception) {
            Storage::disk('local')->delete($path);
            throw $exception;
        }

        return response()->json([
            'message' => 'Payment Proof Uploaded. Please wait for verification.',
            'data' => $payment,
        ], 201);
    }

}

<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\SubscriptionHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class AdminPaymentController extends Controller
{
    public function index()
    {
        $payment = Payment::with([
            'paidBy:id,name,email',
            'subscriptionHistory:id,subscription_id,package_id,package_name,price,duration,status',
            'subscriptionHistory.package:id,name'
        ])
        ->where('status', 'waiting_for_verification')->latest()->paginate(1);

        return response()->json([
            'message' => 'Pending payment collected.',
            'data' => $payment->items(),
            'pagination' => [
                'current_page' => $payment->currentPage(),
                'last_page' => $payment->lastPage(),
                'per_page' => $payment->perPage(),
                'total' => $payment->total(),
            ]
        ]);
    }

    public function approve($id)
    {
        $payment = DB::transaction(function () use ($id) {
            $payment = Payment::with('subscriptionHistory')->lockForUpdate()->findOrFail($id);

            if ($payment->status !== 'waiting_for_verification') {
                return null;
            }

            $history = $payment->subscriptionHistory;

            $lastActiveHistory = SubscriptionHistory::where('subscription_id', $history->subscription_id)->where('status', 'active')->whereNotNull('end_date')->orderByDesc('end_date')->lockForUpdate()->first();

            $today = Carbon::today();

            if ($lastActiveHistory && Carbon::parse($lastActiveHistory->end_date)->gte($today)) {
                $startDate = Carbon::parse($lastActiveHistory->end_date)->addDay();
            } else {
                $startDate = $today;
            }

            $endDate = $startDate->copy()->addDays($history->duration - 1);

            $payment->update([
                'status' => 'approved',
                'verified_by' => auth()->id()
            ]);

            // throw new \Exception('TEST TRANSACTION ROLLBACK');

            $history->update([
                'status' => 'active',
                'start_date' => $startDate,
                'end_date' => $endDate
            ]);

            return $payment;
        });

        if (!$payment) {
            return response()->json(['message' => 'Payment has processed'], 422);
        }

        return response()->json([
            'message' => 'Payment Approved and Subscription Package Activated',
            'data' => $payment->load('subscriptionHistory'),
        ]);
    }

    public function reject(Request $request, $id)
    {
        $validated = $request->validate([
            'note' => ['required', 'string', 'max:1000']
        ]);

        $payment = DB::transaction(function () use ($id, $validated) {
            $payment = Payment::with('subscriptionHistory')->lockForUpdate()->findOrFail($id);

            if ($payment->status !== 'waiting_for_verification') {
                return null;
            }

            $history = $payment->subscriptionHistory;

            $payment->update([
                'status' => 'rejected',
                'verified_by' => auth()->id(),
                'note' => $validated['note']
            ]);

            $history->update(['status' => 'rejected']);

            return $payment;
        });

        if (!$payment) {
            return response()->json(['message' => 'Payment has processed'], 422);
        }

        return response()->json([
            'message' => 'Payment Rejected',
            'data' => $payment->load('subscriptionHistory'),
        ]);
    }

    public function showProof(Payment $payment)
    {
        $path = $payment->payment_proof;

        if (!$path || !Storage::disk('local')->exists($path)) {
            return response()->json([
                'message' => 'Payment Proof Not Found.',
            ], 404);
        }

        $mimeType = Storage::disk('local')->mimeType($path);

        if (!in_array($mimeType, ['image/jpeg', 'image/png'])) {
            return response()->json(['message' => 'Format file invalid.',], 415);
        }

        return Storage::disk('local')->response($path, basename($path), ['Content-Type' => $mimeType], 'inline');
    }
}

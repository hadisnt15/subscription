<?php

namespace App\Models;

use App\Models\SubscriptionHistory;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'subscription_history_id', 'paid_by', 'verified_by', 'amount', 'status', 'payment_proof', 'payment_date', 'note'
    ];

    protected function casts()
    {
        return [
            'amount' => 'decimal:2',
            'payment_date' => 'date',
        ];
    }

    public function subscriptionHistory()
    {
        return $this->belongsTo(SubscriptionHistory::class, 'subscription_history_id');
    }

    public function paidBy()
    {
        return $this->belongsTo(User::class, 'paid_by');
    }

    public function verifiedBy()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}

<?php

namespace App\Models;

use App\Models\Package;
use App\Models\Payment;
use App\Models\Subscription;
use Illuminate\Database\Eloquent\Model;

class SubscriptionHistory extends Model
{
    protected $fillable = [
        'subscription_id', 'package_id', 'status', 'start_date', 'end_date', 'package_name', 'price', 'duration'
    ];

    protected function casts()
    {
        return [
            'price' => 'decimal:2',
            'duration' => 'integer',
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }
    
    public function subscription()
    {
        return $this->belongsTo(Subscription::class, 'subscription_id');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'subscription_history_id');
    }

    public function package()
    {
        return $this->belongsTo(Package::class, 'package_id');
    }
}

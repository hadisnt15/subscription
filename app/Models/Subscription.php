<?php

namespace App\Models;

use App\Models\SubscriptionHistory;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    protected $fillable = ['user_id'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function subscriptionHistories()
    {
        return $this->hasMany(SubscriptionHistory::class, 'subscription_id');
    }
}

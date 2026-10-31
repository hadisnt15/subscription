<?php

namespace App\Models;

use App\Models\SubscriptionHistory;
use Illuminate\Database\Eloquent\Model;

class Package extends Model
{
    protected $fillable = [
        'name', 'description', 'duration', 'price', 'is_active'
    ];

    protected function cast()
    {
        return [
            'duration' => 'integer',
            'price' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function subscriptionHistories()
    {
        return $this->hasMany(SubscriptionHistory::class, 'package_id');
    }
}

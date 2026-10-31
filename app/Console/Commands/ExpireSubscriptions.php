<?php

namespace App\Console\Commands;

use App\Models\SubscriptionHistory;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

#[Signature('app:expire-subscriptions')]
#[Description('Update expired subscriptions')]
class ExpireSubscriptions extends Command
{  
    public function handle()
    {
        $updated = SubscriptionHistory::where('status', 'active')->whereDate('end_date', '<', Carbon::today())->update(['status' => 'expired']);
        $this->info("{$updated} subscriptions expired.");

        return self::SUCCESS;
    }
}

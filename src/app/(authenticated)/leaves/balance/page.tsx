'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { leavesApi } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const leaveTypeLabels: Record<string, string> = {
  SICK: 'Sick Leave',
  CASUAL: 'Casual Leave',
  ANNUAL: 'Annual Leave',
};

const leaveTypeIcons: Record<string, string> = {
  SICK: '🏥',
  CASUAL: '☕',
  ANNUAL: '🏖️',
};

const barColors: Record<string, string> = {
  SICK: 'leave-bar-sick',
  CASUAL: 'leave-bar-casual',
  ANNUAL: 'leave-bar-annual',
};

export default function LeaveBalancePage() {
  const [balances, setBalances] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await leavesApi.getBalance();
        const data = res.data?.data || res.data?.body || res.data;
        setBalances(data || {});
      } catch (error) {
        toast.error('Failed to fetch leave balance');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchBalance();
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Leave Balance</h1>
        <p className="page-subtitle">View your available leave balance for the current year</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-2">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
          <p>Loading your balances...</p>
        </div>
      ) : Object.keys(balances || {}).length === 0 ? (
        <div className="text-center py-20 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
          No leave balance data available
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {Object.entries(balances).map(([type, item]: [string, any]) => {
            const { total = 0, used = 0 } = item;
            const remaining = total - used;
            const percentage = total > 0 ? (used / total) * 100 : 0;
            return (
              <Card key={type} className="leave-balance-card-item">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{leaveTypeIcons[type] || '📝'}</span>
                      <h3 className="font-semibold">{leaveTypeLabels[type] || type}</h3>
                    </div>
                  </div>

                  <div className="text-center mb-4">
                    <p className="text-4xl font-bold text-primary">{remaining}</p>
                    <p className="text-sm text-muted-foreground">days remaining</p>
                  </div>

                  <div className="leave-bar-track mb-3">
                    <div className={`leave-bar-fill ${barColors[type] || 'bg-primary/20'}`} style={{ width: `${percentage}%` }} />
                  </div>

                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Used: {used} days</span>
                    <span>Total: {total} days</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

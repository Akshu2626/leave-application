'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LeaveBalanceCardProps {
  balances: Record<string, { total: number; used: number; remaining: number }>;
}

const leaveTypeColors: Record<string, string> = {
  SICK: 'leave-bar-sick',
  CASUAL: 'leave-bar-casual',
  ANNUAL: 'leave-bar-annual',
};

const leaveTypeLabels: Record<string, string> = {
  SICK: 'Sick Leave',
  CASUAL: 'Casual Leave',
  ANNUAL: 'Annual Leave',
};

export function LeaveBalanceCard({ balances }: LeaveBalanceCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Leave Balance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(balances).map(([type, { total, used, remaining }]) => {
          const percentage = total > 0 ? (used / total) * 100 : 0;
          return (
            <div key={type}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium">{leaveTypeLabels[type] || type}</span>
                <span className="text-muted-foreground">
                  {remaining}/{total} days
                </span>
              </div>
              <div className="leave-bar-track">
                <div
                  className={`leave-bar-fill ${leaveTypeColors[type] || ''}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

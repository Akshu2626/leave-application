'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarCheck, Loader2 } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { leavesApi } from '@/lib/api';

const leaveTypeColors: Record<string, string> = {
  SICK: 'border-l-red-400',
  CASUAL: 'border-l-blue-400',
  ANNUAL: 'border-l-emerald-400',
};

export default function LeaveCalendarPage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const res = await leavesApi.getAll();
      const data = res.data?.data || res.data?.body || res.data || [];
      setLeaves(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch team leaves:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const approvedOrPendingLeaves = leaves.filter(
    (l) => l.status === 'APPROVED' || l.status === 'PENDING'
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Team Leave Calendar</h1>
        <p className="page-subtitle">Overview of your team&apos;s upcoming and past leaves</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Upcoming leaves */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CalendarCheck size={18} /> Upcoming Leaves
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Loading calendar...</p>
              </div>
            ) : approvedOrPendingLeaves.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming leaves</p>
            ) : (
              <div className="space-y-3">
                {approvedOrPendingLeaves.map((leave) => (
                  <div key={leave._id} className={`leave-calendar-item border-l-4 ${leaveTypeColors[leave.leaveType] || ''}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{leave.userName || (leave.userId && leave.userId.firstName)}</p>
                        <p className="text-xs text-muted-foreground">
                          {leave.leaveType} · {leave.workingDays} days
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(leave.fromDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – {new Date(leave.toDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                      <Badge variant="outline" className={leave.status === 'APPROVED' ? 'bg-emerald-500/15 text-emerald-600' : 'bg-amber-500/15 text-amber-600'}>
                        {leave.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legend */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <span className="text-sm">Sick Leave</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-400" />
                <span className="text-sm">Casual Leave</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-sm">Annual Leave</span>
              </div>
              <hr className="my-3" />
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-amber-500/15 text-amber-600 text-xs">PENDING</Badge>
                <span className="text-sm text-muted-foreground">Awaiting approval</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-emerald-500/15 text-emerald-600 text-xs">APPROVED</Badge>
                <span className="text-sm text-muted-foreground">Confirmed leave</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

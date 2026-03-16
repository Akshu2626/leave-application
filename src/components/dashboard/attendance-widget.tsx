'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, LogIn, LogOut, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { attendanceApi } from '@/lib/api';

export function AttendanceWidget() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [record, setRecord] = useState<any>(null);

  const fetchTodayRecord = useCallback(async () => {
    try {
      const res = await attendanceApi.getMyAttendance();
      console.log('Attendance Record Response:', res.data);

      const responseBody = res.data;
      const data = responseBody?.data || responseBody?.body || responseBody;

      // Normalize data to an array
      let recordsArray: any[] = [];
      if (Array.isArray(data)) {
        recordsArray = data;
      } else if (data && Array.isArray(data.records)) {
        recordsArray = data.records;
      } else if (data && typeof data === 'object') {
        // Fallback for single object response
        recordsArray = [data];
      }

      // Use local date string (YYYY-MM-DD) to avoid UTC timezone offset issues
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const today = `${year}-${month}-${day}`;

      const todayRecord = recordsArray.find((r: any) => {
        // Try to extract date from the record. Assuming 'createdAt' or 'date' is a valid ISO string.
        if (!r) return false;
        let rDate = '';
        if (r.date) {
          rDate = r.date.split('T')[0];
        } else if (r.createdAt) {
          // Convert to local date string to safely match
          const d = new Date(r.createdAt);
          if (!isNaN(d.getTime())) {
            rDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          }
        }
        return rDate === today;
      });

      setRecord(todayRecord || null);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodayRecord();
  }, [fetchTodayRecord]);

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      await attendanceApi.checkIn();
      toast.success('Successfully checked in');
      await fetchTodayRecord();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to check in');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      await attendanceApi.checkOut();
      toast.success('Successfully checked out');
      await fetchTodayRecord();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to check out');
    } finally {
      setActionLoading(false);
    }
  };

  // Helper to extract checkIn and checkOut from record using various possible keys
  const getTimes = () => {
    if (!record) return { checkIn: null, checkOut: null };

    // Support nested records array structure if present
    const base = record.records && record.records[0] ? record.records[0] : record;

    return {
      checkIn: base.checkIn || base.checkInTime || base.checkinTime || base.check_in,
      checkOut: base.checkOut || base.checkOutTime || base.checkoutTime || base.check_out,
    };
  };

  const { checkIn, checkOut } = getTimes();

  const formatTime = (timeValue?: any) => {
    if (!timeValue) return '--:--';

    // If it's already a time string like "09:30 AM", return it
    if (typeof timeValue === 'string' && timeValue.match(/^\d{1,2}:\d{2}/)) {
      return timeValue;
    }

    try {
      const date = new Date(timeValue);
      if (isNaN(date.getTime())) return timeValue;
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return timeValue;
    }
  };

  const getStatusBadge = () => {
    if (loading) return <Loader2 className="animate-spin h-4 w-4 text-muted-foreground" />;
    if (checkOut) return <Badge variant="secondary">Completed</Badge>;
    if (checkIn) return <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-200 dark:border-emerald-800">Working</Badge>;
    return <Badge variant="outline">Not checked in</Badge>;
  };

  return (
    <Card className="attendance-widget">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="attendance-widget-icon">
              <Clock size={20} />
            </div>
            <h3 className="font-semibold"> Today&apos;s Attendance</h3>
          </div>
          {getStatusBadge()}
        </div>

        <div className="attendance-times">
          <div className="attendance-time-block">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Check In</span>
            <span className="text-lg font-bold">{formatTime(checkIn)}</span>
          </div>
          <div className="attendance-time-divider" />
          <div className="attendance-time-block">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Check Out</span>
            <span className="text-lg font-bold">{formatTime(checkOut)}</span>
          </div>
        </div>

        {loading ? (
          <div className="h-10 mt-4 flex items-center justify-center">
            <Loader2 className="animate-spin h-5 w-5 text-muted-foreground" />
          </div>
        ) : !checkIn ? (
          <Button onClick={handleCheckIn} className="w-full mt-4 attendance-btn-checkin" disabled={actionLoading}>
            {actionLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <LogIn size={18} className="mr-2" />}
            Check In
          </Button>
        ) : !checkOut ? (
          <Button onClick={handleCheckOut} variant="outline" className="w-full mt-4 attendance-btn-checkout" disabled={actionLoading}>
            {actionLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <LogOut size={18} className="mr-2" />}
            Check Out
          </Button>
        ) : (
          <div className="text-center mt-4 text-sm text-muted-foreground">
            ✅ Attendance completed for today
          </div>
        )}
      </CardContent>
    </Card>
  );
}

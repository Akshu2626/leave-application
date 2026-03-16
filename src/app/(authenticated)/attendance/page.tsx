'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { attendanceApi } from '@/lib/api';
import { AttendanceStatus } from '@/types';
import { Clock, Filter, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const statusStyles: Record<string, string> = {
  PRESENT: 'bg-emerald-500/15 text-emerald-600 border-emerald-200 dark:border-emerald-800',
  ABSENT: 'bg-red-500/15 text-red-600 border-red-200 dark:border-red-800',
  LATE: 'bg-amber-500/15 text-amber-600 border-amber-200 dark:border-amber-800',
  HALF_DAY: 'bg-orange-500/15 text-orange-600 border-orange-200 dark:border-orange-800',
  ON_LEAVE: 'bg-blue-500/15 text-blue-600 border-blue-200 dark:border-blue-800',
  HOLIDAY: 'bg-purple-500/15 text-purple-600 border-purple-200 dark:border-purple-800',
};

export default function AttendancePage() {
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState<any[]>([]);
  const perPage = 10;

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const res = await attendanceApi.getMyAttendance();
      // Supporting both direct array and nested structure
      const data = res.data?.data || res.data?.body || res.data;
      const records = Array.isArray(data) ? data : (data?.records || []);
      setAttendance(records);
    } catch (error) {
      console.error('Fetch attendance error:', error);
      toast.error('Failed to fetch attendance history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const filtered = statusFilter === 'ALL'
    ? attendance
    : attendance.filter((a) => a.status === statusFilter);

  const totalPages = Math.ceil(filtered.length / perPage) || 1;
  const pageData = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Attendance History</h1>
        <p className="page-subtitle">View your attendance records and status</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock size={18} /> My Attendance
            </CardTitle>
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-muted-foreground" />
              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  if (v) {
                    setStatusFilter(v as AttendanceStatus | 'ALL');
                    setPage(1);
                  }
                }}
              >
                <SelectTrigger className="w-[150px] h-9">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="PRESENT">Present</SelectItem>
                  <SelectItem value="ABSENT">Absent</SelectItem>
                  <SelectItem value="LATE">Late</SelectItem>
                  <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                  <SelectItem value="HOLIDAY">Holiday</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="animate-spin h-6 w-6 text-primary" />
                        <span>Loading attendance...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : pageData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                      No attendance records found
                    </TableCell>
                  </TableRow>
                ) : (
                  pageData.map((record) => (
                    <TableRow key={record._id || record.date}>
                      <TableCell className="font-medium">
                        {new Date(record.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </TableCell>
                      <TableCell>
                        {record.checkIn || record.checkInTime || record.checkinTime
                          ? new Date(record.checkIn || record.checkInTime || record.checkinTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                          : '—'}
                      </TableCell>
                      <TableCell>
                        {record.checkOut || record.checkOutTime || record.checkoutTime
                          ? new Date(record.checkOut || record.checkOutTime || record.checkoutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusStyles[record.status] || ''}>
                          {(record.status || 'ABSENT').replace('_', ' ')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft size={16} />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

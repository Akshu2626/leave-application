'use client'

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { attendanceApi } from '@/lib/api';
import { Users, Filter, Loader2 } from 'lucide-react';

const statusStyles: Record<string, string> = {
  PRESENT: 'bg-emerald-500/15 text-emerald-600 border-emerald-200 dark:border-emerald-800',
  ABSENT: 'bg-red-500/15 text-red-600 border-red-200 dark:border-red-800',
  LATE: 'bg-amber-500/15 text-amber-600 border-amber-200 dark:border-amber-800',
  ON_LEAVE: 'bg-blue-500/15 text-blue-600 border-blue-200 dark:border-blue-800',
};

export default function TeamAttendancePage() {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeamAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const res = await attendanceApi.getTeamAttendance();
      const data = res.data?.data || res.data?.body || res.data;
      const records = Array.isArray(data) ? data : (data?.records || []);
      setAttendance(records);
    } catch (error) {
      console.error('Failed to fetch team attendance:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeamAttendance();
  }, [fetchTeamAttendance]);

  const filtered = statusFilter === 'ALL'
    ? attendance
    : attendance.filter((t) => t.status === statusFilter);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Team Attendance</h1>
        <p className="page-subtitle">View your team&apos;s attendance for today</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Users size={18} /> Today&apos;s Team Status
            </CardTitle>
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-muted-foreground" />
              <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="PRESENT">Present</SelectItem>
                  <SelectItem value="ABSENT">Absent</SelectItem>
                  <SelectItem value="LATE">Late</SelectItem>
                  <SelectItem value="ON_LEAVE">On Leave</SelectItem>
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
                  <TableHead>Employee</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="animate-spin h-6 w-6 text-primary" />
                        <span>Loading team attendance...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                      No team attendance records found for today.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((record: any) => (
                    <TableRow key={record._id || record.id || Math.random()}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="team-avatar-sm">
                            {(record.userName || record.user?.firstName || 'U').split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <span className="font-medium">{record.userName || record.user?.firstName || record.user?.email || record.userEmail || 'Unknown User'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {record.checkIn || record.checkInTime || record.checkinTime
                          ? new Date(record.checkIn || record.checkInTime || record.checkinTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusStyles[record.status || 'ABSENT'] || ''}>
                          {(record.status || 'ABSENT').replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{record.ipAddress || '—'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

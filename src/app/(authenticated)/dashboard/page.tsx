'use client'

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { leavesApi, attendanceApi, notificationsApi, usersApi } from '@/lib/api';
import { StatCard } from '@/components/dashboard/stat-card';
import { AttendanceWidget } from '@/components/dashboard/attendance-widget';
import { LeaveBalanceCard } from '@/components/dashboard/leave-balance-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  XCircle,
  Clock,
  CalendarDays,
  Users,
  AlertTriangle,
  TrendingUp,
  FileText,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const role = user?.role ?? 'EMPLOYEE';

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          Good {getGreeting()}, {user?.name} 👋
        </h1>
        <p className="page-subtitle">
          Here&apos;s your {role === 'EMPLOYEE' ? 'attendance' : 'team'} overview for today
        </p>
      </div>

      {/* Employee Dashboard */}
      {role === 'EMPLOYEE' && <EmployeeDashboard />}

      {/* Manager Dashboard */}
      {role === 'MANAGER' && <ManagerDashboard />}

      {/* Admin Dashboard */}
      {role === 'SUPER_ADMIN' && <AdminDashboard />}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

function EmployeeDashboard() {
  const [balances, setBalances] = useState<any>(null);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [summary, setSummary] = useState({ present: 0, absent: 0, late: 0, onLeave: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [balanceRes, leavesRes, summaryRes, notifsRes] = await Promise.all([
        leavesApi.getBalance(),
        leavesApi.getMyLeaves(),
        attendanceApi.getSummary({
          startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
          endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
        }),
        notificationsApi.getAll().catch(() => ({ data: [] })) // Graceful fail for notifications
      ]);

      const balanceData = balanceRes.data?.data || balanceRes.data?.body || balanceRes.data;
      setBalances(balanceData || {});

      const leavesData = leavesRes.data?.data || leavesRes.data?.body || leavesRes.data;
      setLeaves(leavesData || []);

      const summaryData = summaryRes.data?.data || summaryRes.data?.body || summaryRes.data;
      setSummary({
        present: summaryData?.present || 0,
        absent: summaryData?.absent || 0,
        late: summaryData?.late || 0,
        onLeave: summaryData?.onLeave || summaryData?.on_leave || 0,
      });

      const notifsData = notifsRes.data?.data || notifsRes.data?.body || notifsRes.data || [];
      setNotifications(Array.isArray(notifsData) ? notifsData : []);
    } catch (error) {
      console.error('Fetch dashboard data error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const pendingLeaves = leaves.filter((l) => l.status === 'PENDING');
  const recentNotifs = notifications.slice(0, 3);

  return (
    <>
      {/* Stat Cards */}
      <div className="stats-grid">
        <StatCard label="Present Days" value={summary.present} icon={<CheckCircle size={20} />} variant="success" trend="This month" />
        <StatCard label="Absent Days" value={summary.absent} icon={<XCircle size={20} />} variant="danger" />
        <StatCard label="Late Days" value={summary.late} icon={<AlertTriangle size={20} />} variant="warning" />
        <StatCard label="On Leave" value={summary.onLeave} icon={<CalendarDays size={20} />} variant="info" />
      </div>

      {/* Main content grid */}
      <div className="dashboard-grid">
        <div className="dashboard-col-main">
          <AttendanceWidget />
          {loading ? (
            <Card className="h-48 flex items-center justify-center">
              <Loader2 className="animate-spin h-6 w-6 text-muted-foreground mr-2" />
              <span className="text-sm text-muted-foreground">Loading balances...</span>
            </Card>
          ) : (
            <LeaveBalanceCard balances={balances || {}} />
          )}
        </div>
        <div className="dashboard-col-side">
          {/* Pending Leaves */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center justify-between">
                Pending Leaves
                <Badge variant="secondary">{pendingLeaves.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="animate-spin h-5 w-5 text-muted-foreground mr-2" />
                  <span className="text-sm text-muted-foreground">Loading...</span>
                </div>
              ) : pendingLeaves.length === 0 ? (
                <p className="text-sm text-muted-foreground">No pending leave requests</p>
              ) : (
                <div className="space-y-3">
                  {pendingLeaves.map((l: any) => (
                    <div key={l._id} className="leave-item">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium">{l.leaveType} Leave</p>
                          <p className="text-xs text-muted-foreground">{l.workingDays} days · {l.reason}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">Pending</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Link href="/leaves/my-requests" className="text-xs text-primary font-medium mt-3 inline-block hover:underline">
                View all requests →
              </Link>
            </CardContent>
          </Card>

          {/* Recent Notifications */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentNotifs.map((n) => (
                  <div key={n._id} className="notif-compact">
                    <p className="text-sm leading-snug">{n.message}</p>
                    <p className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
              <Link href="/notifications" className="text-xs text-primary font-medium mt-3 inline-block hover:underline">
                View all →
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function ManagerDashboard() {
  const [teamToday, setTeamToday] = useState<any[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);
  const [balances, setBalances] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [teamRes, leavesRes, balanceRes] = await Promise.all([
        attendanceApi.getTeamAttendance(),
        leavesApi.getPending(),
        leavesApi.getBalance()
      ]);

      const teamData = teamRes.data?.data || teamRes.data?.body || teamRes.data;
      setTeamToday(Array.isArray(teamData) ? teamData : (teamData?.records || []));

      const leavesData = leavesRes.data?.data || leavesRes.data?.body || leavesRes.data;
      setPendingLeaves(Array.isArray(leavesData) ? leavesData : (leavesData?.records || []));

      const balanceData = balanceRes.data?.data || balanceRes.data?.body || balanceRes.data;
      setBalances(balanceData || {});
    } catch (error) {
      console.error('Fetch manager dashboard data error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const presentCount = teamToday.filter((t: any) => t.status === 'PRESENT').length;
  const absentCount = teamToday.filter((t: any) => t.status === 'ABSENT').length;
  const lateCount = teamToday.filter((t: any) => t.status === 'LATE').length;

  return (
    <>
      <div className="stats-grid">
        <StatCard label="Team Present" value={presentCount} icon={<CheckCircle size={20} />} variant="success" trend="Today" />
        <StatCard label="Team Absent" value={absentCount} icon={<XCircle size={20} />} variant="danger" />
        <StatCard label="Late Arrivals" value={lateCount} icon={<AlertTriangle size={20} />} variant="warning" />
        <StatCard label="Pending Leaves" value={pendingLeaves.length} icon={<FileText size={20} />} variant="info" />
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-col-main">
          {/* Team Attendance Today */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Users size={18} /> Team Attendance Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-6 text-muted-foreground"><Loader2 className="animate-spin h-5 w-5" /></div>
              ) : teamToday.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No team members checked in yet.</p>
              ) : (
                <div className="space-y-3">
                  {teamToday.map((t: any) => (
                    <div key={t._id || t.id} className="team-member-row">
                      <div className="flex items-center gap-3">
                        <div className="team-avatar">
                          {(t.userName || t.user?.name || t.user?.firstName || 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {t.userName || 
                             t.user?.name || 
                             (t.user?.firstName ? `${t.user.firstName} ${t.user.lastName || ''}` : null) ||
                             t.user?.email || 
                             t.userEmail || 
                             'Unknown'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t.checkIn || t.checkInTime || t.checkinTime ? `In at ${new Date(t.checkIn || t.checkInTime || t.checkinTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}` : 'Not checked in'}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={t.status || 'ABSENT'} />
                    </div>
                  ))}
                </div>
              )}
              <Link href="/team/attendance" className="text-xs text-primary font-medium mt-3 inline-block hover:underline">
                View full team →
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="dashboard-col-side">
          {/* Pending Leave Requests */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center justify-between">
                Pending Leave Requests
                <Badge variant="destructive">{pendingLeaves.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-6 text-muted-foreground"><Loader2 className="animate-spin h-5 w-5" /></div>
              ) : pendingLeaves.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No pending requests.</p>
              ) : (
                <div className="space-y-3">
                  {pendingLeaves.slice(0, 5).map((l: any) => (
                    <div key={l._id || l.id} className="leave-item">
                      <p className="text-sm font-medium">
                        {l.userName || 
                         l.user?.name || 
                         (l.user?.firstName ? `${l.user.firstName} ${l.user.lastName || ''}` : null) ||
                         l.user?.email || 
                         l.userEmail || 
                         'Unknown'}
                      </p>
                      <p className="text-xs text-muted-foreground">{l.leaveType} · {l.workingDays} days</p>
                    </div>
                  ))}
                </div>
              )}
              <Link href="/leaves/pending" className="text-xs text-primary font-medium mt-3 inline-block hover:underline">
                Review all →
              </Link>
            </CardContent>
          </Card>

          <LeaveBalanceCard balances={balances || {}} />
        </div>
      </div>
    </>
  );
}

function AdminDashboard() {
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch pending leaves and users concurrently
      const [leavesRes, usersRes] = await Promise.all([
        leavesApi.getPending(),
        usersApi.getAll()
      ]);

      const leavesData = leavesRes.data?.data || leavesRes.data?.body || leavesRes.data;
      setPendingLeaves(Array.isArray(leavesData) ? leavesData : (leavesData?.records || []));

      const usersData = usersRes.data?.data || usersRes.data?.body || usersRes.data || [];
      setTotalEmployees(Array.isArray(usersData) ? usersData.length : 0);
    } catch (error) {
      console.error('Fetch admin dashboard data error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      <div className="stats-grid">
        <StatCard label="Total Employees" value={totalEmployees} icon={<Users size={20} />} variant="info" />
        <StatCard label="Present Today" value={3} icon={<CheckCircle size={20} />} variant="success" />
        <StatCard label="Pending Leaves" value={pendingLeaves.length} icon={<FileText size={20} />} variant="warning" />
        <StatCard label="Avg Attendance" value="87%" icon={<TrendingUp size={20} />} variant="default" trend="This month" />
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-col-main">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Department Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Engineering', present: 8, total: 10, percentage: 80 },
                  { name: 'Design', present: 4, total: 5, percentage: 80 },
                  { name: 'Marketing', present: 6, total: 7, percentage: 86 },
                ].map((dept) => (
                  <div key={dept.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{dept.name}</span>
                      <span className="text-muted-foreground">{dept.present}/{dept.total} present</span>
                    </div>
                    <div className="leave-bar-track">
                      <div className="leave-bar-fill leave-bar-casual" style={{ width: `${dept.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="dashboard-col-side">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center justify-between">
                Pending Requests
                <Badge variant="destructive">{pendingLeaves.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-6 text-muted-foreground"><Loader2 className="animate-spin h-5 w-5" /></div>
              ) : pendingLeaves.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No pending requests.</p>
              ) : (
                <div className="space-y-3">
                  {pendingLeaves.slice(0, 5).map((l: any) => (
                    <div key={l._id || l.id} className="leave-item">
                      <p className="text-sm font-medium">
                        {l.userName || 
                         l.user?.name || 
                         (l.user?.firstName ? `${l.user.firstName} ${l.user.lastName || ''}` : null) ||
                         l.user?.email || 
                         l.userEmail || 
                         'Unknown'}
                      </p>
                      <p className="text-xs text-muted-foreground">{l.leaveType} · {l.workingDays} days</p>
                    </div>
                  ))}
                </div>
              )}
              <Link href="/leaves/pending" className="text-xs text-primary font-medium mt-3 inline-block hover:underline">
                Review all →
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PRESENT: 'bg-emerald-500/15 text-emerald-600 border-emerald-200 dark:border-emerald-800',
    ABSENT: 'bg-red-500/15 text-red-600 border-red-200 dark:border-red-800',
    LATE: 'bg-amber-500/15 text-amber-600 border-amber-200 dark:border-amber-800',
    HALF_DAY: 'bg-orange-500/15 text-orange-600 border-orange-200 dark:border-orange-800',
    ON_LEAVE: 'bg-blue-500/15 text-blue-600 border-blue-200 dark:border-blue-800',
    HOLIDAY: 'bg-purple-500/15 text-purple-600 border-purple-200 dark:border-purple-800',
  };
  return <Badge className={styles[status] || ''} variant="outline">{status.replace('_', ' ')}</Badge>;
}

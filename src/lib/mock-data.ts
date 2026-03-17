import {
  User,
  AttendanceRecord,
  LeaveRequest,
  Notification,
  Holiday,
  LeavePolicy,
  Department,
  AttendanceSummary,
} from '@/types';

// ---- Mock Users ----
export const mockUsers: User[] = [
  {
    _id: 'u1',
    name: 'Akshu Kumar',
    email: 'akshu@company.com',
    role: 'EMPLOYEE',
    departmentId: 'd1',
    managerId: 'u2',
    leaveBalances: { SICK: 8, CASUAL: 10, ANNUAL: 12 },
    isActive: true,
    createdAt: '2025-01-15T10:00:00Z',
  },
  {
    _id: 'u2',
    name: 'Rahul Sharma',
    email: 'rahul@company.com',
    role: 'MANAGER',
    departmentId: 'd1',
    managerId: 'u3',
    leaveBalances: { SICK: 10, CASUAL: 10, ANNUAL: 15 },
    isActive: true,
    createdAt: '2024-06-01T10:00:00Z',
  },
  {
    _id: 'u3',
    name: 'Priya Verma',
    email: 'priya@company.com',
    role: 'SUPER_ADMIN',
    departmentId: 'd1',
    leaveBalances: { SICK: 10, CASUAL: 10, ANNUAL: 15 },
    isActive: true,
    createdAt: '2024-01-01T10:00:00Z',
  },
  {
    _id: 'u4',
    name: 'Sneha Patel',
    email: 'sneha@company.com',
    role: 'EMPLOYEE',
    departmentId: 'd1',
    managerId: 'u2',
    leaveBalances: { SICK: 6, CASUAL: 8, ANNUAL: 10 },
    isActive: true,
    createdAt: '2025-03-01T10:00:00Z',
  },
  {
    _id: 'u5',
    name: 'Amit Singh',
    email: 'amit@company.com',
    role: 'EMPLOYEE',
    departmentId: 'd2',
    managerId: 'u2',
    leaveBalances: { SICK: 9, CASUAL: 7, ANNUAL: 11 },
    isActive: true,
    createdAt: '2025-02-10T10:00:00Z',
  },
];

// ---- Mock Departments ----
export const mockDepartments: Department[] = [
  { _id: 'd1', name: 'Engineering', managerId: 'u2', createdAt: '2024-01-01T10:00:00Z' },
  { _id: 'd2', name: 'Design', managerId: 'u2', createdAt: '2024-01-01T10:00:00Z' },
  { _id: 'd3', name: 'Marketing', managerId: 'u3', createdAt: '2024-01-01T10:00:00Z' },
];

// ---- Helpers ----
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

function dateISO(daysBack: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysBack);
  return d.toISOString();
}

// ---- Mock Attendance ----
export const mockAttendance: AttendanceRecord[] = Array.from({ length: 20 }, (_, i) => ({
  _id: `att${i + 1}`,
  userId: 'u1',
  date: daysAgo(i),
  checkIn: i === 0 ? undefined : `${daysAgo(i)}T09:${String(Math.floor(Math.random() * 30)).padStart(2, '0')}:00Z`,
  checkOut: i === 0 ? undefined : `${daysAgo(i)}T18:${String(Math.floor(Math.random() * 30)).padStart(2, '0')}:00Z`,
  status: i === 0 ? 'ABSENT' : i % 7 === 0 ? 'HOLIDAY' : i % 5 === 0 ? 'LATE' : i % 6 === 0 ? 'ON_LEAVE' : 'PRESENT',
  ipAddress: '192.168.1.10',
  createdAt: dateISO(i),
}));

// ---- Mock Team Attendance (for manager view) ----
export const mockTeamAttendance: (AttendanceRecord & { userName: string })[] = [
  { _id: 'ta1', userId: 'u1', date: daysAgo(0), checkIn: `${daysAgo(0)}T09:05:00Z`, status: 'PRESENT', userName: 'Akshu Kumar', ipAddress: '192.168.1.10', createdAt: dateISO(0) },
  { _id: 'ta2', userId: 'u4', date: daysAgo(0), status: 'ABSENT', userName: 'Sneha Patel', createdAt: dateISO(0) },
  { _id: 'ta3', userId: 'u5', date: daysAgo(0), checkIn: `${daysAgo(0)}T09:45:00Z`, status: 'LATE', userName: 'Amit Singh', ipAddress: '192.168.1.12', createdAt: dateISO(0) },
];

// ---- Mock Leave Requests ----
export const mockLeaves: LeaveRequest[] = [
  {
    _id: 'l1', userId: 'u1', userName: 'Akshu Kumar', managerId: 'u2', leaveType: 'CASUAL',
    fromDate: daysAgo(-3), toDate: daysAgo(-5), workingDays: 3, reason: 'Family function',
    status: 'PENDING', appliedOn: dateISO(1),
  },
  {
    _id: 'l2', userId: 'u1', userName: 'Akshu Kumar', managerId: 'u2', leaveType: 'SICK',
    fromDate: daysAgo(10), toDate: daysAgo(8), workingDays: 2, reason: 'Fever and cold',
    status: 'APPROVED', managerComment: 'Get well soon!', appliedOn: dateISO(12),
  },
  {
    _id: 'l3', userId: 'u4', userName: 'Sneha Patel', managerId: 'u2', leaveType: 'ANNUAL',
    fromDate: daysAgo(-7), toDate: daysAgo(-10), workingDays: 3, reason: 'Vacation trip',
    status: 'PENDING', appliedOn: dateISO(2),
  },
  {
    _id: 'l4', userId: 'u5', userName: 'Amit Singh', managerId: 'u2', leaveType: 'SICK',
    fromDate: daysAgo(5), toDate: daysAgo(4), workingDays: 2, reason: 'Medical checkup',
    status: 'DECLINED', managerComment: 'Please reschedule', appliedOn: dateISO(7),
  },
  {
    _id: 'l5', userId: 'u1', userName: 'Akshu Kumar', managerId: 'u2', leaveType: 'ANNUAL',
    fromDate: daysAgo(20), toDate: daysAgo(18), workingDays: 2, reason: 'Personal work',
    status: 'CANCELLED', appliedOn: dateISO(22),
  },
];

// ---- Mock Leave Balance ----
export const mockLeaveBalance: Record<string, { total: number; used: number; remaining: number }> = {
  SICK: { total: 10, used: 2, remaining: 8 },
  CASUAL: { total: 10, used: 0, remaining: 10 },
  ANNUAL: { total: 12, used: 2, remaining: 10 },
};

// ---- Mock Attendance Summary ----
export const mockAttendanceSummary: AttendanceSummary = {
  present: 16,
  absent: 1,
  late: 2,
  halfDay: 0,
  onLeave: 2,
  holidays: 2,
  totalWorkingDays: 23,
};

// ---- Mock Notifications ----
export const mockNotifications: Notification[] = [
  { _id: 'n1', userId: 'u1', message: 'Your leave request for Casual Leave (Mar 16-18) has been approved.', type: 'LEAVE_APPROVED', isRead: false, relatedLeaveId: 'l2', createdAt: dateISO(0) },
  { _id: 'n2', userId: 'u1', message: 'Your sick leave (Mar 3-4) was declined. Comment: Please reschedule.', type: 'LEAVE_DECLINED', isRead: false, relatedLeaveId: 'l4', createdAt: dateISO(1) },
  { _id: 'n3', userId: 'u2', message: 'Akshu Kumar has applied for Casual Leave (Mar 16-18).', type: 'LEAVE_APPLIED', isRead: true, relatedLeaveId: 'l1', createdAt: dateISO(1) },
  { _id: 'n4', userId: 'u2', message: 'Sneha Patel has applied for Annual Leave (Mar 22-25).', type: 'LEAVE_APPLIED', isRead: false, relatedLeaveId: 'l3', createdAt: dateISO(0) },
  { _id: 'n5', userId: 'u1', message: 'You cancelled your Annual Leave request (Feb 21-22).', type: 'LEAVE_CANCELLED', isRead: true, relatedLeaveId: 'l5', createdAt: dateISO(5) },
];

// ---- Mock Holidays ----
export const mockHolidays: Holiday[] = [
  { _id: 'h1', name: 'Republic Day', date: '2026-01-26', isRecurring: true, createdAt: '2024-01-01T10:00:00Z' },
  { _id: 'h2', name: 'Holi', date: '2026-03-17', isRecurring: false, createdAt: '2024-01-01T10:00:00Z' },
  { _id: 'h3', name: 'Independence Day', date: '2026-08-15', isRecurring: true, createdAt: '2024-01-01T10:00:00Z' },
  { _id: 'h4', name: 'Diwali', date: '2026-10-20', isRecurring: false, createdAt: '2024-01-01T10:00:00Z' },
  { _id: 'h5', name: 'Christmas', date: '2026-12-25', isRecurring: true, createdAt: '2024-01-01T10:00:00Z' },
];

// ---- Mock Leave Policies ----
export const mockLeavePolicies: LeavePolicy[] = [
  { _id: 'lp1', leaveType: 'SICK', annualQuota: 10, applicableRoles: ['EMPLOYEE', 'MANAGER'], createdAt: '2024-01-01T10:00:00Z' },
  { _id: 'lp2', leaveType: 'CASUAL', annualQuota: 10, applicableRoles: ['EMPLOYEE', 'MANAGER'], createdAt: '2024-01-01T10:00:00Z' },
  { _id: 'lp3', leaveType: 'ANNUAL', annualQuota: 12, applicableRoles: ['EMPLOYEE', 'MANAGER', 'SUPER_ADMIN'], createdAt: '2024-01-01T10:00:00Z' },
];

// ============================================
// Attendance Management System — TypeScript Types
// ============================================

// --- Enums ---
export type UserRole = 'SUPER_ADMIN' | 'MANAGER' | 'EMPLOYEE';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'ON_LEAVE' | 'HOLIDAY';

export type LeaveType = 'SICK' | 'CASUAL' | 'ANNUAL';

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'CANCELLED';

export type NotificationType = 'LEAVE_APPLIED' | 'LEAVE_APPROVED' | 'LEAVE_DECLINED' | 'LEAVE_CANCELLED';

// --- Models ---

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId?: string;
  managerId?: string;
  leaveBalances: Record<LeaveType, number>;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Department {
  _id: string;
  name: string;
  managerId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AttendanceRecord {
  _id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  checkIn?: string;
  checkOut?: string;
  status: AttendanceStatus;
  ipAddress?: string;
  isManualOverride?: boolean;
  overrideReason?: string;
  createdAt: string;
}

export interface LeaveRequest {
  _id: string;
  userId: string;
  userName?: string;
  managerId: string;
  leaveType: LeaveType;
  fromDate: string;
  toDate: string;
  workingDays: number;
  reason: string;
  documentUrl?: string;
  status: LeaveStatus;
  managerComment?: string;
  appliedOn: string;
  updatedAt?: string;
}

export interface LeavePolicy {
  _id: string;
  leaveType: string;
  annualQuota: number;
  applicableRoles: UserRole[];
  createdAt: string;
}

export interface Holiday {
  _id: string;
  name: string;
  date: string;
  isRecurring: boolean;
  createdAt: string;
}

export interface Notification {
  _id: string;
  userId: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  relatedLeaveId?: string;
  createdAt: string;
}

// --- API Payloads ---

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface LeaveApplicationPayload {
  leaveType: LeaveType;
  fromDate: string;
  toDate: string;
  reason: string;
  documentUrl?: string;
}

export interface AttendanceSummary {
  present: number;
  absent: number;
  late: number;
  halfDay: number;
  onLeave: number;
  holidays: number;
  totalWorkingDays: number;
}

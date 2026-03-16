'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Clock,
  CalendarDays,
  FileText,
  Users,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CalendarCheck,
  UserCog,
  TreePalm,
  CalendarHeart,
} from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
  { label: 'Attendance', href: '/attendance', icon: <Clock size={20} /> },
  { label: 'Apply Leave', href: '/leaves/apply', icon: <CalendarDays size={20} /> },
  { label: 'My Requests', href: '/leaves/my-requests', icon: <FileText size={20} /> },
  { label: 'Leave Balance', href: '/leaves/balance', icon: <TreePalm size={20} /> },
  { label: 'Pending Leaves', href: '/leaves/pending', icon: <ClipboardList size={20} />, roles: ['MANAGER', 'SUPER_ADMIN'] },
  { label: 'Team Attendance', href: '/team/attendance', icon: <Users size={20} />, roles: ['MANAGER', 'SUPER_ADMIN'] },
  { label: 'Leave Calendar', href: '/team/leave-calendar', icon: <CalendarCheck size={20} />, roles: ['MANAGER', 'SUPER_ADMIN'] },
  { label: 'Reports', href: '/attendance/report', icon: <FileText size={20} />, roles: ['SUPER_ADMIN'] },
  { label: 'Notifications', href: '/notifications', icon: <Bell size={20} /> },
];

const settingsItems: NavItem[] = [
  { label: 'Profile', href: '/settings/profile', icon: <Settings size={20} /> },
  { label: 'Users', href: '/settings/users', icon: <UserCog size={20} />, roles: ['SUPER_ADMIN'] },
  { label: 'Holidays', href: '/settings/holidays', icon: <CalendarHeart size={20} />, roles: ['SUPER_ADMIN'] },
  { label: 'Leave Policy', href: '/settings/leave-policy', icon: <ClipboardList size={20} />, roles: ['SUPER_ADMIN'] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const role = user?.role ?? 'EMPLOYEE';

  const filteredNav = navItems.filter((item) => !item.roles || item.roles.includes(role));
  const filteredSettings = settingsItems.filter((item) => !item.roles || item.roles.includes(role));

  const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : 'U';

  return (
    <aside className={cn('sidebar', collapsed && 'sidebar-collapsed')}>
      {/* Logo */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Clock size={22} strokeWidth={2.5} />
          </div>
          {!collapsed && <span className="sidebar-logo-text">AttendEase</span>}
        </div>
        <button
          className="sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-nav-section">
          {!collapsed && <p className="sidebar-section-label">Main</p>}
          {filteredNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn('sidebar-link', pathname === item.href && 'sidebar-link-active')}
              title={collapsed ? item.label : undefined}
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </div>

        <Separator className="my-2 opacity-50" />

        <div className="sidebar-nav-section">
          {!collapsed && <p className="sidebar-section-label">Settings</p>}
          {filteredSettings.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn('sidebar-link', pathname === item.href && 'sidebar-link-active')}
              title={collapsed ? item.label : undefined}
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </div>
      </nav>

      {/* User footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="sidebar-user-info">
              <p className="sidebar-user-name">{user?.firstName ? `${user.firstName} ${user.lastName}` : (user?.email || 'Unknown User')}</p>
              <p className="sidebar-user-role">{role}</p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={async () => {
            await logout();
            window.location.href = '/login';
          }}
          className="sidebar-logout"
          title="Sign out"
        >
          <LogOut size={18} />
        </Button>
      </div>
    </aside>
  );
}

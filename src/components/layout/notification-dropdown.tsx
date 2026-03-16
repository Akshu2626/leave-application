'use client';

import { useNotificationStore } from '@/stores/notification-store';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface NotificationDropdownProps {
  onClose: () => void;
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const { notifications, markRead, markAllRead, unreadCount } = useNotificationStore();
  const recent = notifications.slice(0, 5);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'LEAVE_APPROVED': return 'notif-type-approved';
      case 'LEAVE_DECLINED': return 'notif-type-declined';
      case 'LEAVE_APPLIED': return 'notif-type-applied';
      case 'LEAVE_CANCELLED': return 'notif-type-cancelled';
      default: return '';
    }
  };

  return (
    <div className="notif-dropdown">
      <div className="notif-dropdown-header">
        <h3 className="font-semibold text-sm">Notifications</h3>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={markAllRead}>
            <CheckCheck size={14} className="mr-1" /> Mark all read
          </Button>
        )}
      </div>
      <div className="notif-dropdown-list">
        {recent.length === 0 ? (
          <div className="notif-empty">
            <Bell size={24} className="text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No notifications</p>
          </div>
        ) : (
          recent.map((n) => (
            <div
              key={n._id}
              className={`notif-item ${!n.isRead ? 'notif-item-unread' : ''}`}
              onClick={() => !n.isRead && markRead(n._id)}
            >
              <div className={`notif-type-dot ${getTypeColor(n.type)}`} />
              <div className="notif-item-content">
                <p className="text-sm leading-snug">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </p>
              </div>
              {!n.isRead && (
                <button className="notif-mark-btn" title="Mark as read">
                  <Check size={14} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
      <div className="notif-dropdown-footer">
        <Link href="/notifications" className="text-xs font-medium text-primary hover:underline" onClick={onClose}>
          View all notifications →
        </Link>
      </div>
    </div>
  );
}

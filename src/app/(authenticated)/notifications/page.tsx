'use client';

import { useNotificationStore } from '@/stores/notification-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const typeStyles: Record<string, string> = {
  LEAVE_APPROVED: 'notif-type-approved',
  LEAVE_DECLINED: 'notif-type-declined',
  LEAVE_APPLIED: 'notif-type-applied',
  LEAVE_CANCELLED: 'notif-type-cancelled',
};

const typeLabels: Record<string, string> = {
  LEAVE_APPROVED: 'Approved',
  LEAVE_DECLINED: 'Declined',
  LEAVE_APPLIED: 'New Request',
  LEAVE_CANCELLED: 'Cancelled',
};

export default function NotificationsPage() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotificationStore();

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Notifications</h1>
            <p className="page-subtitle">Stay updated with your leave and attendance activity</p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <CheckCheck size={16} className="mr-2" /> Mark all as read
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {notifications.length === 0 ? (
            <div className="empty-state py-16">
              <Bell size={48} className="text-muted-foreground" />
              <p className="text-lg font-medium mt-3">No notifications</p>
              <p className="text-sm text-muted-foreground">You&apos;re all caught up!</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((n) => (
                <div
                  key={n._id}
                  className={`notif-page-item ${!n.isRead ? 'notif-page-item-unread' : ''}`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`notif-type-dot mt-1.5 ${typeStyles[n.type]}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Badge variant="outline" className="text-xs h-5">{typeLabels[n.type]}</Badge>
                        {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary" />}
                      </div>
                      <p className="text-sm leading-snug">{n.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  {!n.isRead && (
                    <Button variant="ghost" size="sm" className="shrink-0 h-8" onClick={() => markRead(n._id)}>
                      <Check size={14} className="mr-1" /> Read
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

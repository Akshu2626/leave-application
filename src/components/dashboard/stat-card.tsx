'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const variantStyles = {
  default: 'stat-card-default',
  success: 'stat-card-success',
  warning: 'stat-card-warning',
  danger: 'stat-card-danger',
  info: 'stat-card-info',
};

export function StatCard({ label, value, icon, trend, variant = 'default', className }: StatCardProps) {
  return (
    <div className={cn('stat-card', variantStyles[variant], className)}>
      <div className="stat-card-header">
        <div className="stat-card-icon">{icon}</div>
        {trend && <span className="stat-card-trend">{trend}</span>}
      </div>
      <div className="stat-card-body">
        <p className="stat-card-value">{value}</p>
        <p className="stat-card-label">{label}</p>
      </div>
    </div>
  );
}

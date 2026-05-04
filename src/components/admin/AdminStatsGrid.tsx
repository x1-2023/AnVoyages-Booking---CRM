import { ReactNode } from 'react';

interface AdminStatsGridProps {
  children: ReactNode;
  className?: string;
}

export default function AdminStatsGrid({ children, className }: AdminStatsGridProps) {
  return <div className={className ?? 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'}>{children}</div>;
}

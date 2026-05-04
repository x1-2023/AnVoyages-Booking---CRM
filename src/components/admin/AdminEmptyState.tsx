import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface AdminEmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export default function AdminEmptyState({ icon, title, description, action }: AdminEmptyStateProps) {
  return (
    <Card className="rounded-3xl border-dashed bg-card/80 shadow-sm">
      <CardContent className="flex flex-col items-center gap-4 p-8 text-center md:p-10">
        {icon && <div className="rounded-2xl bg-primary/10 p-4 text-primary">{icon}</div>}
        <div className="space-y-2">
          <h3 className="font-body text-lg font-semibold text-foreground">{title}</h3>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        {action}
      </CardContent>
    </Card>
  );
}

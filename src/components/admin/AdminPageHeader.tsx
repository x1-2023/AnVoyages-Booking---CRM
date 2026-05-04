import { ReactNode } from 'react';

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export default function AdminPageHeader({ title, description, actions }: AdminPageHeaderProps) {
  return (
    <div className="overflow-hidden rounded-3xl border bg-card/90 p-4 shadow-sm backdrop-blur sm:p-5 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1.5">
          <h1 className="truncate font-body text-2xl font-bold tracking-tight text-foreground md:text-3xl">{title}</h1>
          {description && <p className="max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

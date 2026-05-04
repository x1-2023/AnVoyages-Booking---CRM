import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  to: string;
  label: string;
  tone?: 'light' | 'default';
  className?: string;
}

export default function BackButton({ to, label, tone = 'default', className }: BackButtonProps) {
  return (
    <Button
      asChild
      variant={tone === 'light' ? 'glass' : 'outline'}
      size="sm"
      className={cn(
        'rounded-full px-4 shadow-sm backdrop-blur-md',
        tone === 'light'
          ? 'border-white/35 bg-white/15 text-white hover:bg-white/25 hover:text-white'
          : 'border-border bg-background/90 text-foreground hover:bg-primary hover:text-primary-foreground',
        className,
      )}
    >
      <Link to={to} aria-label={label}>
        <ArrowLeft className="h-4 w-4" />
        {label}
      </Link>
    </Button>
  );
}

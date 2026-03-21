import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface AdminPageShellProps {
  title: string;
  description: string;
  children: ReactNode;
  backTo?: string;
  backLabel?: string;
}

export function AdminPageShell({
  title,
  description,
  children,
  backTo = '/admin',
  backLabel = 'Retour au hub admin',
}: AdminPageShellProps) {
  return (
    <div className="flex flex-col h-full pb-28 overflow-y-auto">
      <div className="px-4 pt-4 pb-3 space-y-3">
        <Button asChild variant="outline" size="sm" className="gap-2 w-fit">
          <Link to={backTo}>
            <ArrowLeft className="w-4 h-4" />
            {backLabel}
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-display font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
      <div className="px-4 space-y-4">{children}</div>
    </div>
  );
}

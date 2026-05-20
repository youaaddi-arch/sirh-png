import { cn } from '@/lib/cn';

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn('card', className)}>{children}</div>;
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('p-5 border-b border-slate-100', className)}>{children}</div>;
}

export function CardTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return <h2 className={cn('font-semibold text-slate-900', className)}>{children}</h2>;
}

export function CardBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('p-5', className)}>{children}</div>;
}

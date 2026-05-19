import { cn } from '@/lib/cn';

type Variant = 'gray' | 'blue' | 'green' | 'red' | 'amber' | 'purple' | 'pink';
const cls: Record<Variant, string> = {
  gray: 'bg-slate-100 text-slate-700',
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-emerald-100 text-emerald-700',
  red: 'bg-red-100 text-red-700',
  amber: 'bg-amber-100 text-amber-700',
  purple: 'bg-purple-100 text-purple-700',
  pink: 'bg-pink-100 text-pink-700',
};

export function Badge({ variant = 'gray', children }: { variant?: Variant; children: React.ReactNode }) {
  return <span className={cn('badge', cls[variant])}>{children}</span>;
}

import { cn } from '@/lib/cn';
import { forwardRef } from 'react';

interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
  className?: string;
}

export const Input = forwardRef<HTMLInputElement, FieldProps & React.InputHTMLAttributes<HTMLInputElement>>(
  ({ label, hint, error, className, ...props }, ref) => (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      <input ref={ref} {...props} className={cn('input', error && 'border-red-400 focus:ring-red-500')} />
      {hint && !error && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  ),
);
Input.displayName = 'Input';

export const Select = forwardRef<HTMLSelectElement, FieldProps & React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ label, hint, error, className, children, ...props }, ref) => (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      <select ref={ref} {...props} className={cn('input', error && 'border-red-400')}>{children}</select>
      {hint && !error && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  ),
);
Select.displayName = 'Select';

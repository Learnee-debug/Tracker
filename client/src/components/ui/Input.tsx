import { cn } from '@/lib/utils';
import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';

const BASE_INPUT =
  'w-full bg-bg-3 border border-border rounded-md px-3 py-2 text-text text-[13px] outline-none ' +
  'placeholder:text-text-faint transition-colors duration-100 ' +
  'focus:border-border-3 focus:bg-bg-3 ' +
  'hover:border-border-2';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  sublabel?: string;
  error?: string;
  action?: ReactNode;
}

export function Input({ label, sublabel, error, action, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-[6px]">
      {(label || action) && (
        <div className="flex items-center justify-between">
          <label className="text-[12px] text-text font-medium">{label}</label>
          {action && <div className="text-[11px] text-text-sub">{action}</div>}
        </div>
      )}
      {sublabel && <p className="text-[11px] text-text-sub -mt-1">{sublabel}</p>}
      <input
        className={cn(BASE_INPUT, 'font-mono text-[12px]', error && 'border-red', className)}
        {...props}
      />
      {error && <span className="text-[11px] text-red">{error}</span>}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  sublabel?: string;
}

export function Textarea({ label, sublabel, className, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-[6px]">
      {label && <label className="text-[12px] text-text font-medium">{label}</label>}
      {sublabel && <p className="text-[11px] text-text-sub -mt-1">{sublabel}</p>}
      <textarea
        className={cn(BASE_INPUT, 'min-h-[72px]', className)}
        {...props}
      />
    </div>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-[6px]">
      {label && <label className="text-[12px] text-text font-medium">{label}</label>}
      <select
        className={cn(BASE_INPUT, 'font-mono text-[12px] cursor-pointer', className)}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

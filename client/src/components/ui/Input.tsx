import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-[11px] text-text-muted font-mono tracking-[.06em]">
          {label}
        </label>
      )}
      <input
        className={cn(
          'bg-bg-3 border border-border rounded px-[9px] py-[5px] text-text outline-none',
          'font-mono text-[11px]',
          'focus:border-border-2',
          'placeholder:text-text-sub',
          error && 'border-red',
          className
        )}
        {...props}
      />
      {error && (
        <span className="text-[11px] text-red">{error}</span>
      )}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  sublabel?: string;
}

export function Textarea({ label, sublabel, className, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <span className="text-[12px] text-text font-medium">{label}</span>
      )}
      {sublabel && (
        <span className="text-[11px] text-text-muted">{sublabel}</span>
      )}
      <textarea
        className={cn(
          'w-full bg-bg-3 border border-border rounded px-[10px] py-[7px] text-text outline-none resize-y',
          'focus:border-border-2',
          className
        )}
        {...props}
      />
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <span className="text-[12px] text-text font-medium">{label}</span>
      )}
      <select
        className={cn(
          'bg-bg-3 border border-border rounded px-[10px] py-[6px] text-text outline-none',
          'focus:border-border-2',
          className
        )}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

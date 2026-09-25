import type { ReactNode } from "react";

interface SelectFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  children: ReactNode;
}

export function SelectField({ label, value, onChange, children }: SelectFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 text-sm text-white outline-none transition hover:border-slate-600 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
      >
        {children}
      </select>
    </label>
  );
}

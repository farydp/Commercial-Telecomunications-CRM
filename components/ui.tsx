import { cn } from "@/lib/utils";

export function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="space-y-6">{children}</div>;
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn("rounded-[28px] border border-white/60 bg-white/85 p-5 shadow-card", className)}>{children}</section>;
}

export function Field({
  label,
  name,
  defaultValue,
  placeholder,
  type = "text",
  hint,
  required = false
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
  type?: string;
  hint?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-ink/65">{label}</span>
      <input
        type={type}
        name={name}
        required={required}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal"
      />
      {hint ? <span className="mt-2 block text-xs text-ink/50">{hint}</span> : null}
    </label>
  );
}

export function Textarea({
  label,
  name,
  defaultValue,
  placeholder,
  rows = 4,
  hint,
  required = false
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
  rows?: number;
  hint?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-ink/65">{label}</span>
      <textarea
        name={name}
        required={required}
        defaultValue={defaultValue ?? ""}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal"
      />
      {hint ? <span className="mt-2 block text-xs text-ink/50">{hint}</span> : null}
    </label>
  );
}

export function Select({
  label,
  name,
  defaultValue,
  options,
  hint
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  options: readonly string[];
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-ink/65">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue ?? ""}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal"
      >
        <option value="">Sin definir</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {hint ? <span className="mt-2 block text-xs text-ink/50">{hint}</span> : null}
    </label>
  );
}

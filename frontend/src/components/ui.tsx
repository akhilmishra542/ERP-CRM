import { ButtonHTMLAttributes, ReactNode } from "react";

// ---------- Badge ----------
const badgeStyles: Record<string, string> = {
  LEAD: "bg-amber/10 text-amber border border-amber/30",
  ACTIVE: "bg-brand-100 text-brand-700 border border-brand-400/30",
  INACTIVE: "bg-black/5 text-ink/50 border border-black/10",
  DRAFT: "bg-amber/10 text-amber border border-amber/30",
  CONFIRMED: "bg-brand-100 text-brand-700 border border-brand-400/30",
  CANCELLED: "bg-rust/10 text-rust border border-rust/30",
  IN: "bg-brand-100 text-brand-700 border border-brand-400/30",
  OUT: "bg-rust/10 text-rust border border-rust/30",
  RETAIL: "bg-black/5 text-ink/60 border border-black/10",
  WHOLESALE: "bg-brand-100 text-brand-700 border border-brand-400/30",
  DISTRIBUTOR: "bg-amber/10 text-amber border border-amber/30",
};

export function Badge({ children }: { children: string }) {
  const cls = badgeStyles[children] || "bg-black/5 text-ink/60 border border-black/10";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-semibold uppercase tracking-wide ${cls}`}
    >
      {children}
    </span>
  );
}

// ---------- Button ----------
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
}

export function Button({ variant = "primary", size = "md", className = "", ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center gap-2 rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2.5 text-sm";
  const variants: Record<string, string> = {
    primary: "bg-brand-600 text-white hover:bg-brand-700",
    secondary: "bg-white text-ink border border-black/15 hover:bg-black/5",
    danger: "bg-rust text-white hover:bg-rust/90",
    ghost: "text-ink/60 hover:text-ink hover:bg-black/5",
  };
  return <button className={`${base} ${sizes} ${variants[variant]} ${className}`} {...props} />;
}

// ---------- Card ----------
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-lg border border-black/10 ${className}`}>{children}</div>
  );
}

// ---------- EmptyState ----------
export function EmptyState({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="text-center py-16 px-6">
      <div className="font-display text-lg text-ink/70 mb-1">{title}</div>
      {subtitle && <div className="text-sm text-ink/40 mb-5">{subtitle}</div>}
      {action}
    </div>
  );
}

// ---------- Spinner ----------
export function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// ---------- PageHeader ----------
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-ink/50 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ---------- Input ----------
export function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  const { label, className = "", ...rest } = props;
  return (
    <label className="block">
      {label && <span className="block text-xs font-medium text-ink/60 mb-1.5">{label}</span>}
      <input
        className={`w-full px-3 py-2 rounded border border-black/15 bg-white text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-colors ${className}`}
        {...rest}
      />
    </label>
  );
}

export function Select(
  props: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; children: ReactNode }
) {
  const { label, className = "", children, ...rest } = props;
  return (
    <label className="block">
      {label && <span className="block text-xs font-medium text-ink/60 mb-1.5">{label}</span>}
      <select
        className={`w-full px-3 py-2 rounded border border-black/15 bg-white text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-colors ${className}`}
        {...rest}
      >
        {children}
      </select>
    </label>
  );
}

export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }
) {
  const { label, className = "", ...rest } = props;
  return (
    <label className="block">
      {label && <span className="block text-xs font-medium text-ink/60 mb-1.5">{label}</span>}
      <textarea
        className={`w-full px-3 py-2 rounded border border-black/15 bg-white text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-colors ${className}`}
        {...rest}
      />
    </label>
  );
}

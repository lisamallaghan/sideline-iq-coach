import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "default" | "positive" | "negative" | "accent";
  icon?: ReactNode;
  className?: string;
}

export function StatCard({ label, value, hint, tone = "default", icon, className }: Props) {
  const containerTone =
    tone === "accent"
      ? "bg-gradient-primary text-primary-foreground border-transparent"
      : "bg-card text-card-foreground";
  const valueTone = {
    default: "text-foreground",
    positive: "text-success",
    negative: "text-destructive",
    accent: "text-primary-foreground",
  }[tone];
  return (
    <div className={cn("rounded-2xl border border-border p-4 shadow-elegant", containerTone, className)}>
      <div className="flex items-center justify-between gap-2">
        <p
          className={cn(
            "text-[11px] font-semibold uppercase tracking-[0.14em]",
            tone === "accent" ? "text-white/70" : "text-muted-foreground",
          )}
        >
          {label}
        </p>
        {icon}
      </div>
      <p className={cn("mt-2 text-3xl font-bold tabular-nums", valueTone)}>{value}</p>
      {hint ? (
        <p className={cn("mt-1 text-xs", tone === "accent" ? "text-white/70" : "text-muted-foreground")}>{hint}</p>
      ) : null}
    </div>
  );
}
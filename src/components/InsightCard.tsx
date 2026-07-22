import type { ReactNode } from "react";
import { Lightbulb, TrendingUp, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  tone: "positive" | "warning" | "insight";
  title: string;
  body: ReactNode;
}

const iconMap = { positive: TrendingUp, warning: AlertTriangle, insight: Lightbulb } as const;

const badgeTone = {
  positive: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/20 text-warning-foreground border-warning/40",
  insight: "bg-accent-soft text-accent-foreground border-accent/30",
} as const;

const iconTone = {
  positive: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  insight: "bg-accent text-accent-foreground",
} as const;

export function InsightCard({ tone, title, body }: Props) {
  const Icon = iconMap[tone];
  return (
    <div className="flex gap-3 rounded-2xl border border-border bg-card p-4 shadow-elegant">
      <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", iconTone[tone])}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
      <span
        className={cn(
          "h-fit rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
          badgeTone[tone],
        )}
      >
        {tone === "insight" ? "Insight" : tone === "positive" ? "Trend" : "Watch"}
      </span>
    </div>
  );
}
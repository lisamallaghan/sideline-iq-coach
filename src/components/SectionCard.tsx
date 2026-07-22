import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  description?: string;
  icon: ReactNode;
  to?: string;
  onClick?: () => void;
  variant?: "default" | "primary";
  right?: ReactNode;
}

export function SectionCard({ title, description, icon, to, onClick, variant = "default", right }: Props) {
  const inner = (
    <div
      className={cn(
        "flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition active:scale-[0.99]",
        variant === "primary"
          ? "border-transparent bg-gradient-primary text-primary-foreground shadow-premium"
          : "border-border bg-card text-card-foreground shadow-elegant hover:border-accent/40",
      )}
    >
      <div
        className={cn(
          "grid h-12 w-12 shrink-0 place-items-center rounded-xl",
          variant === "primary" ? "bg-white/15 text-white" : "bg-accent/12 text-accent",
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{title}</p>
        {description ? (
          <p
            className={cn(
              "mt-0.5 text-xs",
              variant === "primary" ? "text-white/75" : "text-muted-foreground",
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {right ?? (
        <ChevronRight
          className={cn("h-5 w-5", variant === "primary" ? "text-white/70" : "text-muted-foreground")}
        />
      )}
    </div>
  );
  if (to) return <Link to={to}>{inner}</Link>;
  return (
    <button type="button" onClick={onClick} className="block w-full">
      {inner}
    </button>
  );
}
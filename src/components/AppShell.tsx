import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { BottomNav } from "./BottomNav";

interface Props {
  title?: string;
  subtitle?: string;
  back?: string;
  right?: ReactNode;
  children: ReactNode;
  hideNav?: boolean;
  variant?: "default" | "dark";
  contentClassName?: string;
}

export function AppShell({
  title,
  subtitle,
  back,
  right,
  children,
  hideNav,
  variant = "default",
  contentClassName,
}: Props) {
  const dark = variant === "dark";
  return (
    <div
      className={cn(
        "mx-auto flex min-h-screen max-w-md flex-col",
        dark ? "bg-primary text-primary-foreground" : "bg-background text-foreground",
      )}
    >
      {(title || back || right) && (
        <header
          className={cn(
            "sticky top-0 z-30 flex items-center gap-3 px-4 py-4 backdrop-blur-xl",
            dark ? "border-b border-white/10 bg-primary/90" : "border-b border-border bg-background/85",
          )}
        >
          {back ? (
            <Link
              to={back}
              className={cn(
                "grid h-10 w-10 shrink-0 place-items-center rounded-full transition",
                dark ? "bg-white/10 hover:bg-white/20" : "bg-secondary hover:bg-secondary/70",
              )}
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
          ) : null}
          <div className="min-w-0 flex-1">
            {subtitle ? (
              <p
                className={cn(
                  "truncate text-[11px] font-medium uppercase tracking-[0.14em]",
                  dark ? "text-white/60" : "text-muted-foreground",
                )}
              >
                {subtitle}
              </p>
            ) : null}
            {title ? <h1 className="truncate text-xl font-semibold">{title}</h1> : null}
          </div>
          {right ? <div className="shrink-0">{right}</div> : null}
        </header>
      )}
      <main className={cn("flex-1", hideNav ? "pb-6" : "safe-bottom", contentClassName)}>
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
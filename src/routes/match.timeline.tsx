import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useMatch } from "@/lib/match-store";
import { EVENT_MAP } from "@/data/events";
import { MOCK_PLAYERS } from "@/data/players";
import { cn } from "@/lib/utils";
import { Crosshair, Shield, Send, Target, AlertTriangle, XOctagon, Sparkles } from "lucide-react";

export const Route = createFileRoute("/match/timeline")({
  head: () => ({
    meta: [
      { title: "Timeline · Sideline IQ" },
      { name: "description", content: "Every match event, in order — captured live from the sideline." },
    ],
  }),
  component: Timeline,
});

const CAT_ICON = {
  possession: Target,
  passing: Send,
  shooting: Crosshair,
  defence: Shield,
  discipline: AlertTriangle,
  errors: XOctagon,
  positive: Sparkles,
} as const;

function Timeline() {
  const { match } = useMatch();
  const events = [...(match?.events ?? [])].reverse();

  return (
    <AppShell title="Timeline" subtitle="Live Feed" back="/match/live" contentClassName="px-4 py-4">
      {events.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
          No events yet. Tap a player on the Live screen to record your first event.
        </div>
      ) : (
        <ol className="relative space-y-2 border-l border-border pl-4">
          {events.map((e) => {
            const def = EVENT_MAP[e.type];
            const player = MOCK_PLAYERS.find((p) => p.id === e.playerId);
            const Icon = CAT_ICON[e.category];
            const tone =
              def?.tone === "positive"
                ? "bg-success/10 text-success border-success/25"
                : def?.tone === "negative"
                  ? "bg-destructive/10 text-destructive border-destructive/25"
                  : "bg-accent/10 text-accent border-accent/25";
            return (
              <li key={e.id} className="relative">
                <span
                  className={cn(
                    "absolute -left-[26px] top-3 grid h-6 w-6 place-items-center rounded-full border-2 border-background",
                    tone,
                  )}
                >
                  <Icon className="h-3 w-3" />
                </span>
                <div className="rounded-2xl border border-border bg-card p-3 shadow-elegant">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground">{def?.label ?? e.type}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {e.team === "opp"
                          ? "Opposition"
                          : player
                            ? `#${player.number} ${player.name}`
                            : "—"}
                      </p>
                    </div>
                    <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[11px] font-semibold tabular-nums text-secondary-foreground">
                      {e.minute}'
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </AppShell>
  );
}
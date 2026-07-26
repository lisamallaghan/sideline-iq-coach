import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useMatch } from "@/lib/match-store";
import { EVENT_MAP } from "@/data/events";

import { cn } from "@/lib/utils";
import { Crosshair, Shield, Send, Target, AlertTriangle, XOctagon, Sparkles, ArrowRightLeft, Users, Pencil, Trash2 } from "lucide-react";
import { formatClock } from "@/lib/format";
import { ScorerAttributionSheet } from "@/components/ScorerAttributionSheet";
import { toast } from "sonner";

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

type FilterId = "all" | "scores" | "turnovers" | "possession" | "substitutions" | "cards";
const FILTERS: Array<{ id: FilterId; label: string }> = [
  { id: "all", label: "All" },
  { id: "scores", label: "Scores" },
  { id: "turnovers", label: "Turnovers" },
  { id: "possession", label: "Possession" },
  { id: "substitutions", label: "Subs" },
  { id: "cards", label: "Cards" },
];

function Timeline() {
  const { match, roster, teamName, possessionPeriods, substitutions, updateEvent, deleteEvent } = useMatch();
  const [filter, setFilter] = useState<FilterId>("all");
  const [editId, setEditId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const events = match?.events ?? [];
  type Item =
    | { kind: "event"; id: string; ts: number; data: (typeof events)[number] }
    | { kind: "possession"; id: string; ts: number; owner: "us" | "opp" | "out"; minute: number }
    | { kind: "substitution"; id: string; ts: number; offId: string; onId: string; minute: number };
  const allItems: Item[] = [
    ...events.map((e) => ({ kind: "event" as const, id: e.id, ts: e.timestamp, data: e })),
    ...possessionPeriods.map((p) => ({
      kind: "possession" as const,
      id: p.id,
      ts: p.startMs,
      owner: p.owner,
      minute: p.startMinute,
    })),
    ...substitutions.map((s) => ({
      kind: "substitution" as const,
      id: s.id,
      ts: s.timestamp,
      offId: s.offId,
      onId: s.onId,
      minute: s.minute,
    })),
  ].sort((a, b) => b.ts - a.ts);

  const items = allItems.filter((it) => {
    if (filter === "all") return true;
    if (filter === "possession") return it.kind === "possession";
    if (filter === "substitutions") return it.kind === "substitution";
    if (it.kind !== "event") return false;
    const t = it.data.type;
    if (filter === "scores") return t === "goal" || t === "two_pointer" || t === "point";
    if (filter === "turnovers")
      return (
        t === "turnover_won" ||
        t === "turnover_lost" ||
        t === "tackle" ||
        t === "interception" ||
        t === "hand_pass_lost" ||
        t === "kick_pass_lost"
      );
    if (filter === "cards") return t === "yellow_card" || t === "red_card";
    return false;
  });

  return (
    <AppShell title="Timeline" subtitle="Live Feed" back="/match/live" contentClassName="px-4 py-4">
      <div className="mb-3 -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              "whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition",
              filter === f.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
          No events match this filter yet.
        </div>
      ) : (
        <ol className="relative space-y-2 border-l border-border pl-4">
          {items.map((it) => {
            if (it.kind === "possession") {
              const label =
                it.owner === "us" ? teamName : it.owner === "opp" ? "Opposition" : "Out of Play";
              const dot =
                it.owner === "us"
                  ? "bg-accent/15 text-accent border-accent/25"
                  : it.owner === "opp"
                    ? "bg-sky-500/10 text-sky-600 border-sky-500/25"
                    : "bg-muted text-muted-foreground border-border";
              return (
                <li key={it.id} className="relative">
                  <span
                    className={cn(
                      "absolute -left-[26px] top-3 grid h-6 w-6 place-items-center rounded-full border-2 border-background",
                      dot,
                    )}
                  >
                    <ArrowRightLeft className="h-3 w-3" />
                  </span>
                  <div className="rounded-2xl border border-dashed border-border bg-card/60 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">Possession → {label}</p>
                      <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[11px] font-semibold tabular-nums text-secondary-foreground">
                        {formatClock(Math.max(0, it.ts - (match?.startedAt ?? it.ts)) / 1000 | 0)}
                      </span>
                    </div>
                  </div>
                </li>
              );
            }
            if (it.kind === "substitution") {
              const off = roster.find((p) => p.id === it.offId);
              const on = roster.find((p) => p.id === it.onId);
              return (
                <li key={it.id} className="relative">
                  <span className="absolute -left-[26px] top-3 grid h-6 w-6 place-items-center rounded-full border-2 border-background bg-accent/15 text-accent border-accent/25">
                    <Users className="h-3 w-3" />
                  </span>
                  <div className="rounded-2xl border border-border bg-card p-3 shadow-elegant">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground">Substitution</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {on ? `#${on.number} ${on.name}` : "—"} for {off ? `#${off.number} ${off.name}` : "—"}
                        </p>
                      </div>
                      <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[11px] font-semibold tabular-nums text-secondary-foreground">
                        {it.minute}'
                      </span>
                    </div>
                  </div>
                </li>
              );
            }
            const e = it.data;
            const def = EVENT_MAP[e.type];
            const player = roster.find((p) => p.id === e.playerId);
            const Icon = CAT_ICON[e.category];
            const tone =
              def?.tone === "positive"
                ? "bg-success/10 text-success border-success/25"
                : def?.tone === "negative"
                  ? "bg-destructive/10 text-destructive border-destructive/25"
                  : "bg-accent/10 text-accent border-accent/25";
            const isScore = e.team === "us" && (def?.score ?? 0) > 0;
            const isAttributable = Boolean(def?.attributable) && e.team === "us";
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
                            : isScore
                              ? "Unattributed"
                              : "Team"}
                      </p>
                    </div>
                    <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[11px] font-semibold tabular-nums text-secondary-foreground">
                      {e.minute}'
                    </span>
                  </div>
                  {isAttributable ? (
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditLabel(def?.label ?? "");
                          setEditId(e.id);
                        }}
                        className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-secondary px-2 text-[11px] font-bold uppercase tracking-wider text-secondary-foreground"
                      >
                        <Pencil className="h-3 w-3" /> {player ? "Change player" : "Assign player"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const snapshot = e;
                          deleteEvent(e.id);
                          toast("Event deleted", {
                            duration: 5000,
                            action: {
                              label: "Undo",
                              onClick: () => {
                                // Re-add via updateEvent-like path is not possible; simplest is to inform.
                                // Restore by pushing back through a fresh addEvent isn't available here without id.
                                // Instead, we surface an informative toast — users can re-record.
                                toast("Undo not available — re-record the score");
                                void snapshot;
                              },
                            },
                          });
                        }}
                        className="inline-flex h-8 items-center gap-1 rounded-lg border border-destructive/30 bg-destructive/5 px-2 text-[11px] font-bold uppercase tracking-wider text-destructive"
                      >
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <ScorerAttributionSheet
        open={editId !== null}
        onOpenChange={(o) => { if (!o) setEditId(null); }}
        title="Assign scorer"
        scoreLabel={editLabel}
        onAssign={(playerId) => {
          if (editId) {
            updateEvent(editId, { playerId });
            const p = roster.find((x) => x.id === playerId);
            toast.success(`${editLabel} · #${p?.number} ${p?.name.split(" ")[0] ?? ""}`.trim());
          }
          setEditId(null);
        }}
        onSkip={() => setEditId(null)}
        autoDismissMs={15000}
      />
    </AppShell>
  );
}
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PlayerEventSheet } from "@/components/PlayerEventSheet";
import { useMatch, formatScore } from "@/lib/match-store";
import { MOCK_PLAYERS } from "@/data/players";
import type { Player, Position } from "@/types";
import { formatClock } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { BarChart3, Flag, Pause, Play, Undo2, Users, Wind } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export const Route = createFileRoute("/match/live")({
  head: () => ({
    meta: [
      { title: "Live Match · Sideline IQ" },
      { name: "description", content: "Record events in three taps. Formation view, live scoreboard and instant undo." },
    ],
  }),
  component: LiveMatch,
});

const LINES: Array<{ label: string; positions: Position[] }> = [
  { label: "Goalkeeper", positions: ["GK"] },
  { label: "Full Back Line", positions: ["FB", "CB"] },
  { label: "Half Back Line", positions: ["HB"] },
  { label: "Midfield", positions: ["MF"] },
  { label: "Half Forward Line", positions: ["HF"] },
  { label: "Full Forward Line", positions: ["CF", "FF"] },
];

function LiveMatch() {
  const navigate = useNavigate();
  const {
    match,
    elapsedSec,
    ourScore,
    theirScore,
    addEvent,
    undoLast,
    finishMatch,
    startMatch,
    currentHalf,
    toggleHalf,
    possessionOwner,
    setPossession,
  } = useMatch();
  const [selected, setSelected] = useState<Player | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(false);

  if (!match) return null;

  const startingPlayers = match.startingXV
    .map((id) => MOCK_PLAYERS.find((p) => p.id === id))
    .filter((p): p is Player => Boolean(p));
  const benchPlayers = match.bench
    .map((id) => MOCK_PLAYERS.find((p) => p.id === id))
    .filter((p): p is Player => Boolean(p));

  const handlePlayerTap = (p: Player) => {
    setSelected(p);
    setSheetOpen(true);
  };

  const handleFinish = () => {
    setPossession("out", "match_finished");
    finishMatch();
    navigate({ to: "/match/summary" });
  };

  const isLive = match.status === "live";

  return (
    <div className="mx-auto min-h-screen max-w-md bg-background text-foreground">
      {/* Fixed scoreboard */}
      <header className="sticky top-0 z-30 bg-primary text-primary-foreground shadow-elegant">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={toggleHalf}
              className="rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest"
            >
              H{currentHalf}
            </button>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/60">
              <Wind className="h-3.5 w-3.5" />
              <span>Wind —</span>
            </div>
            <span className={cn(
              "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest",
              isLive ? "bg-accent text-accent-foreground" : "bg-white/15 text-white/80",
            )}>
              {isLive ? "Live" : match.status}
            </span>
          </div>

          <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <div className="min-w-0 text-left">
              <p className="truncate text-[10px] font-semibold uppercase tracking-widest text-white/60">Ardboe</p>
              <p className="mt-0.5 text-4xl font-black tabular-nums leading-none">{formatScore(ourScore)}</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="font-mono text-2xl font-bold tabular-nums">{formatClock(elapsedSec)}</p>
              <button
                type="button"
                onClick={() => (isLive ? undefined : startMatch())}
                className="mt-1 flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-white/80"
              >
                {isLive ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                {isLive ? "Running" : "Start"}
              </button>
            </div>
            <div className="min-w-0 text-right">
              <p className="truncate text-[10px] font-semibold uppercase tracking-widest text-white/60">
                {match.opposition || "Opposition"}
              </p>
              <p className="mt-0.5 text-4xl font-black tabular-nums leading-none">{formatScore(theirScore)}</p>
            </div>
          </div>

          {/* Action row */}
          <div className="mt-3 grid grid-cols-4 gap-1.5">
            <ActionButton onClick={() => navigate({ to: "/match/dashboard" })} icon={BarChart3} label="Stats" />
            <ActionButton
              onClick={() => {
                undoLast();
                toast("Last event removed");
              }}
              icon={Undo2}
              label="Undo"
            />
            <ActionButton onClick={() => setSubOpen(true)} icon={Users} label="Sub" />
            <ActionButton onClick={handleFinish} icon={Flag} label="Finish" accent />
          </div>
        </div>

        {/* Possession segmented control */}
        <div className="px-4 pb-3">
          <div className="grid grid-cols-3 gap-1 rounded-full bg-white/10 p-1">
            {(
              [
                { id: "us" as const, label: "Ardboe", dot: "bg-accent" },
                { id: "out" as const, label: "Out of Play", dot: "bg-white/60" },
                { id: "opp" as const, label: "Opposition", dot: "bg-sky-400" },
              ]
            ).map((opt) => {
              const active = possessionOwner === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPossession(opt.id)}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-full py-2 text-[11px] font-bold uppercase tracking-wider transition",
                    active ? "bg-white text-primary shadow-elegant" : "text-white/70",
                  )}
                >
                  <span className={cn("h-2 w-2 rounded-full", opt.dot)} />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Player groups */}
      <main className="px-3 pb-24 pt-3 space-y-4">
        {LINES.map((line) => {
          const players = startingPlayers.filter((p) => line.positions.includes(p.position));
          if (players.length === 0) return null;
          return (
            <section key={line.label}>
              <div className="mb-1.5 flex items-center gap-2 px-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  {line.label}
                </p>
                <span className="h-px flex-1 bg-border" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {players.map((p) => (
                  <PlayerCard key={p.id} player={p} onClick={() => handlePlayerTap(p)} />
                ))}
              </div>
            </section>
          );
        })}

        {benchPlayers.length > 0 && (
          <section>
            <div className="mb-1.5 flex items-center gap-2 px-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Bench
              </p>
              <span className="h-px flex-1 bg-border" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {benchPlayers.map((p) => (
                <PlayerCard key={p.id} player={p} onClick={() => handlePlayerTap(p)} bench />
              ))}
            </div>
          </section>
        )}
      </main>

      <PlayerEventSheet
        player={selected}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onRecord={(playerId, category, type) => addEvent({ playerId, category, type })}
      />

      <Sheet open={subOpen} onOpenChange={setSubOpen}>
        <SheetContent side="bottom" className="max-h-[70vh] rounded-t-3xl border-none p-0">
          <SheetHeader className="border-b border-border px-5 pb-4 pt-5">
            <SheetTitle className="text-left text-lg font-semibold">Substitution</SheetTitle>
            <p className="text-left text-xs text-muted-foreground">
              Substitutions can be logged in the next update.
            </p>
          </SheetHeader>
          <div className="px-5 py-6 text-sm text-muted-foreground">
            Tap a bench player, then choose who they replace. Coming soon.
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function ActionButton({
  onClick,
  icon: Icon,
  label,
  accent,
}: {
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-11 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition active:scale-95",
        accent
          ? "bg-accent text-accent-foreground"
          : "bg-white/10 text-white hover:bg-white/20",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function PlayerCard({
  player,
  onClick,
  bench,
}: {
  player: Player;
  onClick: () => void;
  bench?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-[74px] flex-col items-start justify-between rounded-2xl border p-2.5 text-left shadow-elegant transition active:scale-[0.97]",
        bench
          ? "border-dashed border-border bg-card"
          : "border-border bg-card hover:border-accent/50",
      )}
    >
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
        {player.number}
      </span>
      <span className="w-full truncate text-[12px] font-semibold leading-tight text-foreground">
        {player.name.split(" ")[0]}
        <span className="block truncate text-[10px] font-normal text-muted-foreground">
          {player.name.split(" ").slice(1).join(" ")}
        </span>
      </span>
    </button>
  );
}
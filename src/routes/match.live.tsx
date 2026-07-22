import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PlayerChip } from "@/components/PlayerChip";
import { PlayerEventSheet } from "@/components/PlayerEventSheet";
import { useMatch, formatScore } from "@/lib/match-store";
import { MOCK_PLAYERS } from "@/data/players";
import type { Player, Position } from "@/types";
import { formatClock } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { BarChart3, Flag, Home as HomeIcon, ListOrdered, Pause, Play, Undo2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/match/live")({
  head: () => ({
    meta: [
      { title: "Live Match · Sideline IQ" },
      { name: "description", content: "Record events in three taps. Formation view, live scoreboard and instant undo." },
    ],
  }),
  component: LiveMatch,
});

const FORMATION: Array<{ line: string; positions: Position[] }> = [
  { line: "Full Forwards", positions: ["FF", "CF", "FF"] },
  { line: "Half Forwards", positions: ["HF", "HF", "HF"] },
  { line: "Midfield", positions: ["MF", "MF"] },
  { line: "Half Backs", positions: ["HB", "HB", "HB"] },
  { line: "Full Backs", positions: ["FB", "FB", "FB"] },
  { line: "Goalkeeper", positions: ["GK"] },
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
  } = useMatch();
  const [selected, setSelected] = useState<Player | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  if (!match) return null;

  const startingPlayers = match.startingXV
    .map((id) => MOCK_PLAYERS.find((p) => p.id === id))
    .filter((p): p is Player => Boolean(p));
  const benchPlayers = match.bench
    .map((id) => MOCK_PLAYERS.find((p) => p.id === id))
    .filter((p): p is Player => Boolean(p));

  const positionGroups: Record<Position, Player[]> = {
    GK: [], FB: [], CB: [], HB: [], MF: [], HF: [], CF: [], FF: [],
  };
  startingPlayers.forEach((p) => {
    positionGroups[p.position].push(p);
  });

  const handlePlayerTap = (p: Player) => {
    setSelected(p);
    setSheetOpen(true);
  };

  const handleFinish = () => {
    finishMatch();
    navigate({ to: "/match/summary" });
  };

  const isLive = match.status === "live";

  return (
    <div className="mx-auto min-h-screen max-w-md bg-primary text-primary-foreground safe-bottom">
      {/* Scoreboard */}
      <section className="relative overflow-hidden bg-gradient-hero px-4 pb-4 pt-5">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative flex items-center justify-between">
          <Link to="/" className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">
            Sideline IQ
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleHalf}
              className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white"
            >
              H{currentHalf}
            </button>
            <span className="rounded-full bg-accent px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-accent-foreground">
              {isLive ? "Live" : match.status}
            </span>
          </div>
        </div>

        <div className="relative mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="min-w-0 text-left">
            <p className="truncate text-[11px] font-semibold uppercase tracking-widest text-white/60">
              {match.homeAway === "home" ? "Home" : "Away"}
            </p>
            <p className="mt-0.5 truncate text-sm font-semibold text-white">Our team</p>
            <p className="mt-2 text-5xl font-black tabular-nums leading-none text-white">
              {formatScore(ourScore)}
            </p>
          </div>
          <div className="flex flex-col items-center">
            <p className="font-mono text-3xl font-bold tabular-nums text-white">
              {formatClock(elapsedSec)}
            </p>
            <button
              type="button"
              onClick={() => (isLive ? undefined : startMatch())}
              className="mt-1 flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/80"
            >
              {isLive ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              {isLive ? "Running" : "Start"}
            </button>
          </div>
          <div className="min-w-0 text-right">
            <p className="truncate text-[11px] font-semibold uppercase tracking-widest text-white/60">
              {match.homeAway === "home" ? "Away" : "Home"}
            </p>
            <p className="mt-0.5 truncate text-sm font-semibold text-white">{match.opposition}</p>
            <p className="mt-2 text-5xl font-black tabular-nums leading-none text-white">
              {formatScore(theirScore)}
            </p>
          </div>
        </div>

        <div className="relative mt-4 flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              undoLast();
              toast("Last event removed");
            }}
            className="h-10 flex-1 rounded-xl border border-white/15 bg-white/10 text-white hover:bg-white/20 hover:text-white"
          >
            <Undo2 className="mr-1.5 h-4 w-4" /> Undo
          </Button>
          <Link
            to="/match/dashboard"
            className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/10 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            <BarChart3 className="h-4 w-4" /> Dashboard
          </Link>
          <Button
            type="button"
            onClick={handleFinish}
            className="h-10 flex-1 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Flag className="mr-1.5 h-4 w-4" /> Finish
          </Button>
        </div>
      </section>

      {/* Opposition quick record */}
      <section className="px-4 pt-4">
        <button
          type="button"
          onClick={() => {
            addEvent({ playerId: "opp", category: "shooting", type: "point", team: "opp" });
            toast("Opposition point");
          }}
          className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 backdrop-blur-md"
        >
          <span>Tap to log opposition score</span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">
            +1 pt
          </span>
        </button>
      </section>

      {/* Formation */}
      <section className="px-4 py-5">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">
              Formation
            </p>
            <p className="text-[11px] text-white/50">Tap a player to record</p>
          </div>
          <div className="space-y-4">
            {FORMATION.map((line) => {
              const players = line.positions
                .map((pos, idx) => positionGroups[pos]?.[idx])
                .filter(Boolean) as Player[];
              if (players.length === 0) return null;
              return (
                <div key={line.line} className="flex items-center justify-center gap-3">
                  {players.map((p) => (
                    <PlayerChip
                      key={p.id}
                      player={p}
                      tone="light"
                      onClick={() => handlePlayerTap(p)}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bench */}
      {benchPlayers.length > 0 && (
        <section className="px-4 pb-6">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">
            Bench
          </p>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {benchPlayers.map((p) => (
              <div key={p.id} className="shrink-0">
                <PlayerChip player={p} tone="light" size="sm" onClick={() => handlePlayerTap(p)} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Bottom nav (custom for dark scoreboard) */}
      <LiveNav />

      <PlayerEventSheet
        player={selected}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onRecord={(playerId, category, type) => addEvent({ playerId, category, type })}
      />
    </div>
  );
}

function LiveNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-primary/95 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {[
          { to: "/match/live", label: "Live", icon: Play },
          { to: "/match/timeline", label: "Timeline", icon: ListOrdered },
          { to: "/match/dashboard", label: "Stats", icon: BarChart3 },
          { to: "/", label: "Home", icon: HomeIcon },
        ].map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              className="flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium uppercase tracking-wide text-white/70 [&.active]:text-accent"
              activeProps={{ className: "text-accent" }}
              activeOptions={{ exact: true }}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
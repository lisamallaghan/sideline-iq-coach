import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PlayerEventSheet } from "@/components/PlayerEventSheet";
import { ScorerAttributionSheet } from "@/components/ScorerAttributionSheet";
import { useMatch, formatScore } from "@/lib/match-store";
import type { EventType, Player, Position } from "@/types";
import { formatClock } from "@/lib/format";
import { BarChart3, Flag, Pause, Play, Undo2, Users, Wind, Layers, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { EVENT_MAP } from "@/data/events";
import { EventCentre } from "@/components/EventCentre";
import { KickoutSheet } from "@/components/KickoutSheet";
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
    activeStartingXV,
    activeBench,
    involvement,
    performSubstitution,
    lastEvent,
    lastAddedId,
    updateEvent,
    deleteEvent,
    pendingEvents,
    recentPlayerIds,
    setRecordingMode,
    roster,
    teamName,
  } = useMatch();
  const [selected, setSelected] = useState<Player | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(false);
  const [subOff, setSubOff] = useState<string | null>(null);
  const [flash, setFlash] = useState<{ playerId: string; tone: "positive" | "negative" | "neutral"; key: number } | null>(null);
  const [attrOpen, setAttrOpen] = useState(false);
  const [attrEventId, setAttrEventId] = useState<string | null>(null);
  const [attrLabel, setAttrLabel] = useState<string>("");
  const [pendingOpen, setPendingOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [confirmChip, setConfirmChip] = useState<{ label: string; tone: "positive" | "negative" | "neutral"; key: number } | null>(null);
  const [kickoutOpen, setKickoutOpen] = useState(false);

  if (!match) return null;
  const mode: "coach" | "lineup" = match.recordingMode ?? "coach";

  const startingPlayers = activeStartingXV
    .map((id) => roster.find((p) => p.id === id))
    .filter((p): p is Player => Boolean(p));
  const benchPlayers = activeBench
    .map((id) => roster.find((p) => p.id === id))
    .filter((p): p is Player => Boolean(p));
  const recentPlayers = recentPlayerIds
    .map((id) => roster.find((p) => p.id === id))
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

  // Flash the player card of the last recorded event briefly.
  useEffect(() => {
    if (!lastEvent || !lastEvent.playerId) return;
    const tone = EVENT_MAP[lastEvent.type]?.tone ?? "neutral";
    const key = Date.now();
    setFlash({ playerId: lastEvent.playerId, tone, key });
    const t = setTimeout(() => setFlash((f) => (f && f.key === key ? null : f)), 800);
    return () => clearTimeout(t);
  }, [lastEvent?.id]);

  // Universal event trigger for Coach Mode.
  // Records instantly, then opens attribution sheet only if the event is
  // attributable AND belongs to our team.
  const fireEvent = (type: EventType, team: "us" | "opp", label: string, note?: string) => {
    const def = EVENT_MAP[type];
    const category = def?.category ?? "possession";
    addEvent({ category, type, team, note });
    const displayLabel = team === "opp" && !label.toLowerCase().startsWith("opp") ? `Opp ${label}` : label;
    toast.success(`✓ ${displayLabel} recorded`, {
      duration: 5000,
      action: { label: "Undo (5)", onClick: () => undoLast() },
    });
    // Confirmation chip
    const key = Date.now();
    const tone = def?.tone ?? "neutral";
    setConfirmChip({ label: displayLabel, tone, key });
    setTimeout(() => setConfirmChip((c) => (c && c.key === key ? null : c)), 900);
    // Open attribution only for our attributable events
    if (team === "us" && def?.attributable) {
      setTimeout(() => {
        setAttrLabel(label);
        setAttrOpen(true);
      }, 0);
    }
  };

  // Track the id of the score awaiting attribution.
  useEffect(() => {
    if (attrOpen && lastAddedId) setAttrEventId(lastAddedId);
  }, [attrOpen, lastAddedId]);

  const openSub = () => {
    setSubOff(null);
    setSubOpen(true);
  };

  const handleSubPick = (id: string) => {
    if (!subOff) {
      setSubOff(id);
      return;
    }
    performSubstitution(subOff, id);
    const off = roster.find((p) => p.id === subOff);
    const on = roster.find((p) => p.id === id);
    toast.success(
      `Sub · #${on?.number} ${on?.name.split(" ")[0]} for #${off?.number} ${off?.name.split(" ")[0]}`,
    );
    setSubOpen(false);
    setSubOff(null);
  };

  const startingPlayerList = startingPlayers;

  const assignNow = (playerId: string) => {
    if (attrEventId) {
      updateEvent(attrEventId, { playerId });
      const p = roster.find((x) => x.id === playerId);
      toast.success(`${attrLabel} · #${p?.number} ${p?.name.split(" ")[0] ?? ""}`.trim());
    }
    setAttrOpen(false);
    setAttrEventId(null);
  };

  const skipAttribution = () => {
    setAttrOpen(false);
    setAttrEventId(null);
  };

  const submitCoachNote = () => {
    const text = noteText.trim();
    addEvent({ category: "errors", type: "coach_note", team: "us", note: text || undefined });
    toast.success("✓ Note saved", {
      duration: 5000,
      action: { label: "Undo (5)", onClick: () => undoLast() },
    });
    setNoteText("");
    setNoteOpen(false);
  };

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
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setRecordingMode(mode === "coach" ? "lineup" : "coach")}
                className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white/80"
                title="Switch recording mode"
              >
                <Layers className="h-3 w-3" />
                {mode === "coach" ? "Coach" : "Line-up"}
              </button>
              <span className={cn(
                "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest",
                isLive ? "bg-accent text-accent-foreground" : "bg-white/15 text-white/80",
              )}>
                {isLive ? "Live" : match.status}
              </span>
            </div>
          </div>

          <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <div className="min-w-0 text-left">
              <p className="truncate text-[10px] font-semibold uppercase tracking-widest text-white/60">{teamName}</p>
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

          {pendingEvents.length > 0 && (
            <div className="mt-2 flex justify-center">
              <button
                type="button"
                onClick={() => setPendingOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-[11px] font-black uppercase tracking-widest text-accent-foreground shadow-elegant active:scale-95"
              >
                <ClipboardList className="h-3.5 w-3.5" />
                Pending ({pendingEvents.length})
              </button>
            </div>
          )}

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
            <ActionButton onClick={openSub} icon={Users} label="Sub" />
            <ActionButton onClick={handleFinish} icon={Flag} label="Finish" accent />
          </div>
        </div>

        {/* Possession segmented control */}
        <div className="px-4 pb-3">
          <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-black/20 p-1">
            {(
              [
                { id: "us" as const, label: "OURS", activeCls: "bg-accent text-accent-foreground ring-2 ring-accent" },
                { id: "out" as const, label: "DEAD", activeCls: "bg-slate-200 text-primary ring-2 ring-slate-200" },
                { id: "opp" as const, label: "THEM", activeCls: "bg-sky-500 text-white ring-2 ring-sky-400" },
              ]
            ).map((opt) => {
              const active = possessionOwner === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPossession(opt.id)}
                  className={cn(
                    "flex items-center justify-center rounded-xl py-3 text-sm font-black uppercase tracking-widest transition",
                    active ? `${opt.activeCls} shadow-elegant scale-[1.02]` : "bg-white/5 text-white/60",
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Body — Coach Mode or Line-up Mode */}
      {confirmChip && (
        <div
          key={confirmChip.key}
          className={cn(
            "pointer-events-none fixed left-1/2 top-[62%] z-40 -translate-x-1/2 rounded-full px-4 py-2 text-sm font-black uppercase tracking-wider shadow-glow-accent",
            confirmChip.tone === "positive"
              ? "bg-success text-white"
              : confirmChip.tone === "negative"
                ? "bg-destructive text-white"
                : "bg-primary text-primary-foreground",
          )}
        >
          ✓ {confirmChip.label}
        </div>
      )}

      {mode === "coach" ? (
        <EventCentre
          onFire={fireEvent}
          onKickout={() => setKickoutOpen(true)}
          onSubstitution={openSub}
          onCoachNote={() => setNoteOpen(true)}
          teamName={teamName}
          oppositionName={match.opposition || "Opposition"}
        />
      ) : (
      <main className="px-3 pb-24 pt-3 space-y-3">
        {LINES.map((line) => {
          const players = startingPlayers.filter((p) => line.positions.includes(p.position));
          if (players.length === 0) return null;
          return (
            <section key={line.label}>
              <div className="mb-1 flex items-center gap-2 px-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  {line.label}
                </p>
                <span className="h-px flex-1 bg-border" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {players.map((p) => (
                  <PlayerCard
                    key={p.id}
                    player={p}
                    onClick={() => handlePlayerTap(p)}
                    count={involvement[p.id] ?? 0}
                    flashTone={flash?.playerId === p.id ? flash.tone : null}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {benchPlayers.length > 0 && (
          <section>
            <div className="mb-1 flex items-center gap-2 px-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Bench
              </p>
              <span className="h-px flex-1 bg-border" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {benchPlayers.map((p) => (
                <PlayerCard
                  key={p.id}
                  player={p}
                  onClick={() => handlePlayerTap(p)}
                  bench
                  count={involvement[p.id] ?? 0}
                  flashTone={flash?.playerId === p.id ? flash.tone : null}
                />
              ))}
            </div>
          </section>
        )}
      </main>
      )}

      <PlayerEventSheet
        player={selected}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onRecord={(playerId, category, type) => {
          addEvent({ playerId, category, type });
          const label = EVENT_MAP[type]?.label ?? type;
          toast.success(`✓ ${label} recorded`, {
            duration: 5000,
            action: { label: "Undo (5)", onClick: () => undoLast() },
          });
        }}
      />

      <ScorerAttributionSheet
        open={attrOpen}
        onOpenChange={(o) => { if (!o) skipAttribution(); }}
        title="Who was involved?"
        scoreLabel={attrLabel}
        players={startingPlayerList}
        recentPlayers={recentPlayers}
        onAssign={assignNow}
        onSkip={skipAttribution}
      />

      <Sheet open={pendingOpen} onOpenChange={setPendingOpen}>
        <SheetContent side="bottom" className="max-h-[80vh] rounded-t-3xl border-none p-0">
          <SheetHeader className="border-b border-border px-5 pb-4 pt-5">
            <SheetTitle className="text-left text-lg font-semibold">
              Pending attributions
            </SheetTitle>
            <p className="text-left text-xs text-muted-foreground">
              {pendingEvents.length === 0
                ? "Everything is attributed."
                : "Assign a player to each unattributed event."}
            </p>
          </SheetHeader>
          <div className="max-h-[70vh] overflow-y-auto px-4 pb-8 pt-3">
            {pendingEvents.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
                Nothing pending.
              </p>
            ) : (
              <ul className="space-y-2">
                {pendingEvents.map((e) => (
                  <li
                    key={e.id}
                    className="rounded-2xl border border-border bg-card p-3 shadow-elegant"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {EVENT_MAP[e.type]?.label ?? e.type}
                        </p>
                        <p className="text-xs text-muted-foreground">{e.minute}'</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setAttrEventId(e.id);
                            setAttrLabel(EVENT_MAP[e.type]?.label ?? "");
                            setPendingOpen(false);
                            setAttrOpen(true);
                          }}
                          className="h-9 rounded-xl bg-primary px-3 text-xs font-bold uppercase tracking-wider text-primary-foreground"
                        >
                          Assign player
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            deleteEvent(e.id);
                            toast("Event removed");
                          }}
                          className="h-9 rounded-xl border border-border bg-secondary px-3 text-xs font-bold uppercase tracking-wider text-secondary-foreground"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={noteOpen} onOpenChange={setNoteOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl border-none p-0">
          <SheetHeader className="border-b border-border px-5 pb-4 pt-5">
            <SheetTitle className="text-left text-lg font-semibold">Coach note</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-3 px-4 pb-6 pt-3">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Quick reminder for later…"
              rows={3}
              className="w-full rounded-2xl border border-border bg-card p-3 text-sm text-foreground focus:border-accent focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setNoteText(""); setNoteOpen(false); }}
                className="h-12 flex-1 rounded-2xl border border-border bg-secondary text-sm font-bold uppercase tracking-wider text-secondary-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitCoachNote}
                className="h-12 flex-1 rounded-2xl bg-accent text-sm font-black uppercase tracking-wider text-accent-foreground"
              >
                Save note
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={subOpen} onOpenChange={(o) => { setSubOpen(o); if (!o) setSubOff(null); }}>
        <SheetContent side="bottom" className="max-h-[80vh] rounded-t-3xl border-none p-0">
          <SheetHeader className="border-b border-border px-5 pb-4 pt-5">
            <SheetTitle className="text-left text-lg font-semibold">
              {subOff ? "Player On" : "Player Off"}
            </SheetTitle>
            <p className="text-left text-xs text-muted-foreground">
              {subOff
                ? `Choose a bench player to come on for #${roster.find((p) => p.id === subOff)?.number}.`
                : "Choose the player coming off."}
            </p>
          </SheetHeader>
          <div className="overflow-y-auto px-4 pb-8 pt-3">
            <div className="grid grid-cols-3 gap-2">
              {(subOff ? benchPlayers : startingPlayers).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSubPick(p.id)}
                  className="flex h-[74px] flex-col items-start justify-between rounded-2xl border border-border bg-card p-2.5 text-left shadow-elegant active:scale-[0.97]"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                    {p.number}
                  </span>
                  <span className="w-full truncate text-[12px] font-semibold leading-tight text-foreground">
                    {p.name.split(" ")[0]}
                    <span className="block truncate text-[10px] font-normal text-muted-foreground">
                      {p.position}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <KickoutSheet open={kickoutOpen} onOpenChange={setKickoutOpen} onRecord={fireEvent} />
    </div>
  );
}

function QuickScoreButton({
  onClick,
  label,
  tone,
}: {
  onClick: () => void;
  label: string;
  tone: "ours" | "ours-strong" | "them" | "them-strong";
}) {
  const cls = {
    "ours-strong": "bg-accent text-accent-foreground",
    ours: "bg-accent/85 text-accent-foreground",
    "them-strong": "bg-sky-500 text-white",
    them: "bg-sky-500/80 text-white",
  }[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-12 items-center justify-center rounded-xl text-xs font-black uppercase tracking-wider shadow-elegant transition active:scale-95",
        cls,
      )}
    >
      {label}
    </button>
  );
}

function ActionButton({
  onClick,
  icon: Icon,
  label,
  accent,
  badge,
}: {
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  accent?: boolean;
  badge?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex h-10 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition active:scale-95",
        accent
          ? "bg-accent text-accent-foreground"
          : "bg-white/10 text-white hover:bg-white/20",
      )}
    >
      {badge ? (
        <span className="absolute -right-1 -top-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-accent px-1 text-[9px] font-black text-accent-foreground">
          {badge}
        </span>
      ) : null}
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function PlayerCard({
  player,
  onClick,
  bench,
  count,
  flashTone,
}: {
  player: Player;
  onClick: () => void;
  bench?: boolean;
  count: number;
  flashTone: "positive" | "negative" | "neutral" | null;
}) {
  const flashCls =
    flashTone === "positive"
      ? "ring-2 ring-success bg-success/10"
      : flashTone === "negative"
        ? "ring-2 ring-destructive bg-destructive/10"
        : flashTone === "neutral"
          ? "ring-2 ring-accent bg-accent/10"
          : "";
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex h-[88px] flex-col items-center justify-center rounded-2xl border p-2 text-center shadow-elegant transition duration-200 active:scale-[0.97]",
        bench
          ? "border-dashed border-border bg-card"
          : "border-border bg-card hover:border-accent/50",
        flashCls,
      )}
    >
      <span className="font-black tabular-nums leading-none text-primary text-[34px]">
        {player.number}
      </span>
      <span className="mt-1 w-full truncate text-[11px] font-semibold leading-tight text-muted-foreground">
        {player.name.split(" ")[0]}
      </span>
      {count > 0 && (
        <span
          key={count}
          className={cn(
            "absolute right-1.5 top-1.5 min-w-[20px] rounded-full bg-primary px-1.5 py-0.5 text-center text-[10px] font-black tabular-nums text-primary-foreground",
            flashTone ? "animate-in zoom-in-50 duration-500" : "",
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
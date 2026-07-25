import { useEffect, useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { MOCK_PLAYERS } from "@/data/players";
import type { Player } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  scoreLabel?: string;
  players?: Player[];
  recentPlayers?: Player[];
  onAssign: (playerId: string) => void;
  onSkip: () => void;
  autoDismissMs?: number;
}

export function ScorerAttributionSheet({
  open,
  onOpenChange,
  title = "Who scored?",
  scoreLabel,
  players,
  recentPlayers,
  onAssign,
  onSkip,
  autoDismissMs = 6000,
}: Props) {
  const [num, setNum] = useState("");
  const list = useMemo(
    () => players ?? MOCK_PLAYERS,
    [players],
  );

  useEffect(() => {
    if (!open) setNum("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      onSkip();
    }, autoDismissMs);
    return () => clearTimeout(t);
  }, [open, autoDismissMs, onSkip]);

  // Auto-select on valid jersey number match.
  useEffect(() => {
    if (!open || !num) return;
    const n = Number(num);
    if (!Number.isFinite(n)) return;
    const match = list.find((p) => p.number === n);
    // Only auto-assign when the typed digits uniquely identify a player
    // (no other player starts with these digits).
    if (match) {
      const ambiguous = list.some(
        (p) => p.id !== match.id && String(p.number).startsWith(num),
      );
      if (!ambiguous) {
        onAssign(match.id);
      }
    }
  }, [num, open, list, onAssign]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[80vh] rounded-t-3xl border-none p-0">
        <SheetHeader className="border-b border-border px-5 pb-4 pt-5">
          <SheetTitle className="text-left text-lg font-semibold">{title}</SheetTitle>
          {scoreLabel ? (
            <p className="text-left text-xs text-muted-foreground">{scoreLabel} · optional</p>
          ) : null}
        </SheetHeader>
        <div className="flex flex-col gap-3 px-4 pb-6 pt-3">
          <div className="flex items-center gap-2">
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              autoFocus={false}
              value={num}
              onChange={(e) => setNum(e.target.value.replace(/\D/g, "").slice(0, 2))}
              placeholder="#"
              className="h-14 w-24 rounded-2xl border border-border bg-card text-center font-mono text-3xl font-bold tabular-nums text-foreground shadow-elegant focus:border-accent focus:outline-none"
            />
            <button
              type="button"
              onClick={onSkip}
              className="h-14 flex-1 rounded-2xl border border-border bg-secondary text-sm font-bold uppercase tracking-wider text-secondary-foreground active:scale-[0.98]"
            >
              Skip for now
            </button>
          </div>
          {recentPlayers && recentPlayers.length > 0 ? (
            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Recent
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {recentPlayers.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onAssign(p.id)}
                    className="flex shrink-0 items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-bold text-foreground active:scale-95"
                  >
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-[11px] font-black text-primary-foreground">
                      {p.number}
                    </span>
                    {p.name.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <div className="max-h-[45vh] overflow-y-auto">
            <ul className="grid grid-cols-3 gap-2">
              {list.map((p) => {
                const matched = num !== "" && p.number === Number(num);
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => onAssign(p.id)}
                      className={cn(
                        "flex h-[74px] w-full flex-col items-start justify-between rounded-2xl border p-2.5 text-left shadow-elegant active:scale-[0.97]",
                        matched
                          ? "border-accent bg-accent/10"
                          : "border-border bg-card",
                      )}
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
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { EventType } from "@/types";

type Distance = "short" | "medium" | "long";
type Catch = "clean" | "break";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecord: (type: EventType, team: "us" | "opp", label: string, note?: string) => void;
}

const OUTCOMES: Array<{
  key: string;
  line1: string;
  line2: string;
  team: "us" | "opp";
  tone: "positive" | "negative";
  /** clean/break variants where relevant */
  type: EventType;
  breakType?: EventType;
  label: string;
}> = [
  {
    key: "ours_won",
    line1: "Our kickout",
    line2: "Won",
    team: "us",
    tone: "positive",
    type: "kickout_won_clean",
    breakType: "kickout_won_break",
    label: "Our kickout won",
  },
  {
    key: "ours_lost",
    line1: "Our kickout",
    line2: "Lost",
    team: "us",
    tone: "negative",
    type: "kickout_lost",
    label: "Our kickout lost",
  },
  {
    key: "theirs_won_us",
    line1: "Their kickout",
    line2: "We won it",
    team: "us",
    tone: "positive",
    type: "opp_kickout_stolen",
    label: "Their kickout won by us",
  },
  {
    key: "theirs_won_them",
    line1: "Their kickout",
    line2: "They won it",
    team: "opp",
    tone: "negative",
    type: "opp_kickout_won",
    label: "Their kickout won by them",
  },
];

export function KickoutSheet({ open, onOpenChange, onRecord }: Props) {
  const [distance, setDistance] = useState<Distance | null>(null);
  const [catchType, setCatchType] = useState<Catch | null>(null);

  useEffect(() => {
    if (!open) {
      setDistance(null);
      setCatchType(null);
    }
  }, [open]);

  const fire = (o: (typeof OUTCOMES)[number]) => {
    const type = catchType === "break" && o.breakType ? o.breakType : o.type;
    const detail = [distance, catchType].filter(Boolean).join(" · ");
    onRecord(type, o.team, o.label, detail || undefined);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl border-none p-0">
        <SheetHeader className="border-b border-border px-5 pb-3 pt-4">
          <SheetTitle className="text-left text-lg font-semibold">Kickout</SheetTitle>
          <p className="text-left text-xs text-muted-foreground">
            Tap an outcome to save. Detail below is optional.
          </p>
        </SheetHeader>

        <div className="px-4 pb-6 pt-3">
          <div className="grid grid-cols-2 gap-2">
            {OUTCOMES.map((o) => (
              <button
                key={o.key}
                type="button"
                onClick={() => fire(o)}
                className={cn(
                  "flex h-[74px] flex-col items-center justify-center gap-0.5 rounded-2xl px-2 text-center shadow-elegant transition active:scale-[0.96]",
                  o.tone === "positive"
                    ? "border border-success/30 bg-success/15 text-success"
                    : "border border-destructive/30 bg-destructive/10 text-destructive",
                )}
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] opacity-80">
                  {o.line1}
                </span>
                <span className="text-base font-black uppercase leading-tight tracking-wide">
                  {o.line2}
                </span>
              </button>
            ))}
          </div>

          <p className="mb-1.5 mt-4 px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            Optional detail
          </p>
          <div className="flex flex-wrap gap-2">
            {(["short", "medium", "long"] as Distance[]).map((d) => (
              <Chip key={d} active={distance === d} onClick={() => setDistance(distance === d ? null : d)}>
                {d}
              </Chip>
            ))}
            <span className="w-full" />
            {(["clean", "break"] as Catch[]).map((c) => (
              <Chip key={c} active={catchType === c} onClick={() => setCatchType(catchType === c ? null : c)}>
                {c === "clean" ? "Clean catch" : "Break won"}
              </Chip>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-10 rounded-full border px-4 text-xs font-bold uppercase tracking-widest capitalize transition active:scale-95",
        active
          ? "border-accent bg-accent text-accent-foreground"
          : "border-border bg-card text-muted-foreground",
      )}
    >
      {children}
    </button>
  );
}

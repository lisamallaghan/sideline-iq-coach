import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { EVENT_MAP } from "@/data/events";
import type { EventType } from "@/types";
import { MoreHorizontal, Users, StickyNote } from "lucide-react";

export interface EventTrigger {
  type: EventType;
  team: "us" | "opp";
  label: string;
  tone: "positive" | "negative" | "neutral" | "brand";
}

interface Props {
  onFire: (type: EventType, team: "us" | "opp", label: string) => void;
  onSubstitution: () => void;
  onCoachNote: () => void;
}

const PRIMARY: EventTrigger[][] = [
  [
    { type: "goal", team: "us", label: "+ Goal", tone: "brand" },
    { type: "two_pointer", team: "us", label: "+ 2 Pt", tone: "brand" },
    { type: "point", team: "us", label: "+ Point", tone: "brand" },
  ],
  [
    { type: "goal", team: "opp", label: "Opp Goal", tone: "negative" },
    { type: "two_pointer", team: "opp", label: "Opp 2 Pt", tone: "negative" },
    { type: "point", team: "opp", label: "Opp Point", tone: "negative" },
  ],
];

const POSSESSION: EventTrigger[] = [
  { type: "kickout_won_clean", team: "us", label: "Our KO ✓", tone: "positive" },
  { type: "kickout_lost", team: "us", label: "Our KO ✗", tone: "negative" },
  { type: "opp_kickout_stolen", team: "us", label: "Their KO ✓", tone: "positive" },
  { type: "opp_kickout_won", team: "opp", label: "Their KO ✗", tone: "negative" },
  { type: "turnover_won", team: "us", label: "Won TO", tone: "positive" },
  { type: "turnover_lost", team: "us", label: "Lost TO", tone: "negative" },
];

const MISC: EventTrigger[] = [
  { type: "wide", team: "us", label: "Wide", tone: "negative" },
  { type: "dropped_short", team: "us", label: "Dropped Short", tone: "negative" },
  { type: "won_free", team: "us", label: "Foul Won", tone: "positive" },
  { type: "foul_conceded", team: "us", label: "Foul Conceded", tone: "negative" },
];

const MORE: EventTrigger[] = [
  { type: "block", team: "us", label: "Block", tone: "positive" },
  { type: "interception", team: "us", label: "Interception", tone: "positive" },
  { type: "tackle", team: "us", label: "Great Tackle", tone: "positive" },
  { type: "scorable_free_conceded", team: "us", label: "Scorable Free Conceded", tone: "negative" },
  { type: "yellow_card", team: "us", label: "Yellow Card", tone: "negative" },
  { type: "red_card", team: "us", label: "Red Card", tone: "negative" },
  { type: "injury", team: "us", label: "Injury", tone: "neutral" },
];

function toneCls(tone: EventTrigger["tone"]) {
  switch (tone) {
    case "brand":
      return "bg-accent text-accent-foreground";
    case "positive":
      return "bg-success/15 text-success border border-success/30";
    case "negative":
      return "bg-destructive/10 text-destructive border border-destructive/30";
    default:
      return "bg-card text-foreground border border-border";
  }
}

function EventButton({
  t,
  onFire,
  size = "md",
}: {
  t: EventTrigger;
  onFire: Props["onFire"];
  size?: "lg" | "md" | "sm";
}) {
  const h = size === "lg" ? "h-16" : size === "sm" ? "h-11" : "h-14";
  return (
    <button
      type="button"
      onClick={() => onFire(t.type, t.team, t.label)}
      className={cn(
        "flex w-full items-center justify-center rounded-2xl text-sm font-black uppercase tracking-wider shadow-elegant transition active:scale-[0.96]",
        h,
        toneCls(t.tone),
      )}
    >
      {t.label}
    </button>
  );
}

export function EventCentre({ onFire, onSubstitution, onCoachNote }: Props) {
  const [moreOpen, setMoreOpen] = useState(false);
  return (
    <div className="space-y-3 px-3 pt-3 pb-24">
      <section>
        <p className="mb-1.5 px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          Our Score
        </p>
        <div className="grid grid-cols-3 gap-2">
          {PRIMARY[0].map((t) => (
            <EventButton key={t.label} t={t} onFire={onFire} size="lg" />
          ))}
        </div>
      </section>

      <section>
        <p className="mb-1.5 px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          Opposition
        </p>
        <div className="grid grid-cols-3 gap-2">
          {PRIMARY[1].map((t) => (
            <EventButton key={t.label} t={t} onFire={onFire} size="md" />
          ))}
        </div>
      </section>

      <section>
        <p className="mb-1.5 px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          Possession
        </p>
        <div className="grid grid-cols-2 gap-2">
          {POSSESSION.map((t) => (
            <EventButton key={t.label} t={t} onFire={onFire} size="md" />
          ))}
        </div>
      </section>

      <section>
        <p className="mb-1.5 px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          Shooting & Discipline
        </p>
        <div className="grid grid-cols-2 gap-2">
          {MISC.map((t) => (
            <EventButton key={t.label} t={t} onFire={onFire} size="md" />
          ))}
        </div>
      </section>

      <div className="grid grid-cols-3 gap-2 pt-1">
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-border bg-card text-sm font-black uppercase tracking-wider shadow-elegant active:scale-[0.96]"
        >
          <MoreHorizontal className="h-4 w-4" /> More
        </button>
        <button
          type="button"
          onClick={onSubstitution}
          className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-border bg-card text-sm font-black uppercase tracking-wider shadow-elegant active:scale-[0.96]"
        >
          <Users className="h-4 w-4" /> Sub
        </button>
        <button
          type="button"
          onClick={onCoachNote}
          className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-border bg-card text-sm font-black uppercase tracking-wider shadow-elegant active:scale-[0.96]"
        >
          <StickyNote className="h-4 w-4" /> Note
        </button>
      </div>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="max-h-[80vh] rounded-t-3xl border-none p-0">
          <SheetHeader className="border-b border-border px-5 pb-4 pt-5">
            <SheetTitle className="text-left text-lg font-semibold">More events</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-2 gap-2 px-4 pb-8 pt-3">
            {MORE.map((t) => (
              <button
                key={t.label}
                type="button"
                onClick={() => {
                  onFire(t.type, t.team, t.label);
                  setMoreOpen(false);
                }}
                className={cn(
                  "flex h-16 items-center justify-center rounded-2xl text-sm font-black uppercase tracking-wider shadow-elegant transition active:scale-[0.96]",
                  toneCls(t.tone),
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export function categoryFor(type: EventType) {
  return EVENT_MAP[type]?.category ?? "possession";
}
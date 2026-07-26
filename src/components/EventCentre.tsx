import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { EVENT_MAP } from "@/data/events";
import type { EventType } from "@/types";
import { MoreHorizontal, Users, StickyNote, ArrowUpFromLine } from "lucide-react";

export interface EventTrigger {
  type: EventType;
  team: "us" | "opp";
  label: string;
  tone: "positive" | "negative" | "neutral" | "brand";
}

interface Props {
  onFire: (type: EventType, team: "us" | "opp", label: string) => void;
  onKickout: () => void;
  onSubstitution: () => void;
  onCoachNote: () => void;
  teamName?: string;
  oppositionName?: string;
}

/** Highest-frequency scoring actions — always visible. */
const OURS: EventTrigger[] = [
  { type: "goal", team: "us", label: "Goal", tone: "brand" },
  { type: "two_pointer", team: "us", label: "2 Pt", tone: "brand" },
  { type: "point", team: "us", label: "Point", tone: "brand" },
];

const THEIRS: EventTrigger[] = [
  { type: "goal", team: "opp", label: "Goal", tone: "negative" },
  { type: "two_pointer", team: "opp", label: "2 Pt", tone: "negative" },
  { type: "point", team: "opp", label: "Point", tone: "negative" },
];

/** Turnovers happen constantly — full words, no abbreviations. */
const TURNOVERS: EventTrigger[] = [
  { type: "turnover_won", team: "us", label: "Turnover Won", tone: "positive" },
  { type: "turnover_lost", team: "us", label: "Turnover Lost", tone: "negative" },
];

/** Frequent enough to stay on screen. */
const SHOOTING: EventTrigger[] = [
  { type: "wide", team: "us", label: "Wide", tone: "negative" },
  { type: "dropped_short", team: "us", label: "Dropped Short", tone: "negative" },
  { type: "won_free", team: "us", label: "Free Won", tone: "positive" },
  { type: "foul_conceded", team: "us", label: "Foul Conceded", tone: "negative" },
];

/** Everything rarer than roughly once a half lives behind More. */
const MORE: EventTrigger[] = [
  { type: "block", team: "us", label: "Block", tone: "positive" },
  { type: "interception", team: "us", label: "Interception", tone: "positive" },
  { type: "tackle", team: "us", label: "Great Tackle", tone: "positive" },
  { type: "saved", team: "us", label: "Shot Saved", tone: "negative" },
  { type: "kick_pass_lost", team: "us", label: "Kick Pass Lost", tone: "negative" },
  { type: "hand_pass_lost", team: "us", label: "Hand Pass Lost", tone: "negative" },
  { type: "dropped_ball", team: "us", label: "Dropped Ball", tone: "negative" },
  { type: "overcarried", team: "us", label: "Overcarried", tone: "negative" },
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
  className,
  textCls = "text-[13px]",
}: {
  t: EventTrigger;
  onFire: Props["onFire"];
  className?: string;
  textCls?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onFire(t.type, t.team, t.label)}
      className={cn(
        "flex w-full items-center justify-center rounded-2xl px-1.5 text-center font-black uppercase leading-tight tracking-wide shadow-elegant transition active:scale-[0.96]",
        textCls,
        toneCls(t.tone),
        className,
      )}
    >
      {t.label}
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1 px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
      {children}
    </p>
  );
}

export function EventCentre({
  onFire,
  onKickout,
  onSubstitution,
  onCoachNote,
  teamName = "Ours",
  oppositionName = "Opposition",
}: Props) {
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <div className="space-y-2.5 px-3 pt-2.5 pb-24">
      <section>
        <SectionLabel>{teamName} score</SectionLabel>
        <div className="grid grid-cols-3 gap-2">
          {OURS.map((t) => (
            <EventButton key={t.label} t={t} onFire={onFire} className="h-[60px] text-base" />
          ))}
        </div>
      </section>

      <section>
        <SectionLabel>{oppositionName} score</SectionLabel>
        <div className="grid grid-cols-3 gap-2">
          {THEIRS.map((t) => (
            <EventButton key={t.label} t={t} onFire={onFire} className="h-11" />
          ))}
        </div>
      </section>

      <section>
        <SectionLabel>Possession</SectionLabel>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={onKickout}
            className="flex h-12 items-center justify-center gap-1.5 rounded-2xl border border-border bg-card text-[13px] font-black uppercase tracking-wide text-foreground shadow-elegant active:scale-[0.96]"
          >
            <ArrowUpFromLine className="h-4 w-4 shrink-0" /> Kickout
          </button>
          {TURNOVERS.map((t) => (
            <EventButton key={t.label} t={t} onFire={onFire} className="h-12" textCls="text-[11px]" />
          ))}
        </div>
      </section>

      <section>
        <SectionLabel>Shooting &amp; discipline</SectionLabel>
        <div className="grid grid-cols-4 gap-2">
          {SHOOTING.map((t) => (
            <EventButton key={t.label} t={t} onFire={onFire} className="h-12" textCls="text-[10px]" />
          ))}
        </div>
      </section>

      <div className="grid grid-cols-3 gap-2 pt-0.5">
        <UtilityButton onClick={() => setMoreOpen(true)} icon={MoreHorizontal} label="More" />
        <UtilityButton onClick={onSubstitution} icon={Users} label="Sub" />
        <UtilityButton onClick={onCoachNote} icon={StickyNote} label="Note" />
      </div>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="max-h-[82vh] rounded-t-3xl border-none p-0">
          <SheetHeader className="border-b border-border px-5 pb-3 pt-4">
            <SheetTitle className="text-left text-lg font-semibold">More events</SheetTitle>
          </SheetHeader>
          <div className="grid max-h-[70vh] grid-cols-2 gap-2 overflow-y-auto px-4 pb-8 pt-3">
            {MORE.map((t) => (
              <button
                key={t.label}
                type="button"
                onClick={() => {
                  onFire(t.type, t.team, t.label);
                  setMoreOpen(false);
                }}
                className={cn(
                  "flex h-14 items-center justify-center rounded-2xl px-2 text-center text-[13px] font-black uppercase leading-tight tracking-wide shadow-elegant transition active:scale-[0.96]",
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

function UtilityButton({
  onClick,
  icon: Icon,
  label,
}: {
  onClick: () => void;
  icon: typeof Users;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 items-center justify-center gap-1.5 rounded-2xl border border-border bg-card text-xs font-black uppercase tracking-wider text-foreground shadow-elegant active:scale-[0.96]"
    >
      <Icon className="h-4 w-4 shrink-0" /> {label}
    </button>
  );
}

export function categoryFor(type: EventType) {
  return EVENT_MAP[type]?.category ?? "possession";
}

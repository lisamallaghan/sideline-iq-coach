import type { EventCategory, EventType } from "@/types";

export interface EventDef {
  type: EventType;
  label: string;
  category: EventCategory;
  score?: number;
  tone: "positive" | "negative" | "neutral";
  /** If true, recording this event opens the attribution sheet. */
  attributable?: boolean;
}

export interface CategoryDef {
  id: EventCategory;
  label: string;
  tone: "positive" | "negative" | "neutral";
  icon: string;
  events: EventDef[];
}

export const EVENT_CATEGORIES: CategoryDef[] = [
  {
    id: "possession",
    label: "Possession",
    tone: "neutral",
    icon: "Target",
    events: [
      { type: "kickout_won_clean", label: "Our Kickout Won", category: "possession", tone: "positive", attributable: true },
      { type: "kickout_won_break", label: "Our Kickout Won (Break)", category: "possession", tone: "positive", attributable: true },
      { type: "kickout_lost", label: "Our Kickout Lost", category: "possession", tone: "negative", attributable: true },
      { type: "opp_kickout_won", label: "Opp Kickout Won", category: "possession", tone: "negative" },
      { type: "opp_kickout_stolen", label: "Opp Kickout Won by Us", category: "possession", tone: "positive", attributable: true },
      { type: "turnover_won", label: "Turnover Won", category: "possession", tone: "positive", attributable: true },
      { type: "turnover_lost", label: "Turnover Lost", category: "possession", tone: "negative", attributable: true },
    ],
  },
  {
    id: "passing",
    label: "Passing",
    tone: "neutral",
    icon: "Send",
    events: [
      { type: "kick_pass_lost", label: "Kick Pass Lost", category: "passing", tone: "negative", attributable: true },
      { type: "hand_pass_lost", label: "Hand Pass Lost", category: "passing", tone: "negative", attributable: true },
    ],
  },
  {
    id: "shooting",
    label: "Shooting",
    tone: "positive",
    icon: "Crosshair",
    events: [
      { type: "goal", label: "Goal", category: "shooting", tone: "positive", score: 3, attributable: true },
      { type: "two_pointer", label: "Two Pointer", category: "shooting", tone: "positive", score: 2, attributable: true },
      { type: "point", label: "Point", category: "shooting", tone: "positive", score: 1, attributable: true },
      { type: "wide", label: "Wide", category: "shooting", tone: "negative", attributable: true },
      { type: "dropped_short", label: "Dropped Short", category: "shooting", tone: "negative", attributable: true },
      { type: "saved", label: "Saved", category: "shooting", tone: "negative", attributable: true },
      { type: "blocked", label: "Blocked", category: "shooting", tone: "negative", attributable: true },
    ],
  },
  {
    id: "defence",
    label: "Defence",
    tone: "positive",
    icon: "Shield",
    events: [
      { type: "block", label: "Block", category: "defence", tone: "positive", attributable: true },
      { type: "tackle", label: "Great Tackle", category: "defence", tone: "positive", attributable: true },
      { type: "interception", label: "Interception", category: "defence", tone: "positive", attributable: true },
    ],
  },
  {
    id: "discipline",
    label: "Discipline",
    tone: "negative",
    icon: "AlertTriangle",
    events: [
      { type: "foul_conceded", label: "Foul Conceded", category: "discipline", tone: "negative", attributable: true },
      { type: "scorable_free_conceded", label: "Scorable Free Conceded", category: "discipline", tone: "negative", attributable: true },
      { type: "yellow_card", label: "Yellow Card", category: "discipline", tone: "negative", attributable: true },
      { type: "red_card", label: "Red Card", category: "discipline", tone: "negative", attributable: true },
    ],
  },
  {
    id: "errors",
    label: "Errors",
    tone: "negative",
    icon: "XOctagon",
    events: [
      { type: "dropped_ball", label: "Dropped Ball", category: "errors", tone: "negative", attributable: true },
      { type: "overcarried", label: "Overcarried", category: "errors", tone: "negative", attributable: true },
      { type: "poor_decision", label: "Poor Decision", category: "errors", tone: "negative", attributable: true },
      { type: "solo_into_traffic", label: "Solo Into Traffic", category: "errors", tone: "negative", attributable: true },
      { type: "injury", label: "Injury", category: "errors", tone: "neutral", attributable: true },
      { type: "coach_note", label: "Coach Note", category: "errors", tone: "neutral" },
    ],
  },
  {
    id: "positive",
    label: "Positive",
    tone: "positive",
    icon: "Sparkles",
    events: [
      { type: "assist", label: "Assist", category: "positive", tone: "positive", attributable: true },
      { type: "won_free", label: "Foul Won", category: "positive", tone: "positive", attributable: true },
    ],
  },
];

export const EVENT_MAP: Record<EventType, EventDef> = EVENT_CATEGORIES
  .flatMap((c) => c.events)
  .reduce((acc, e) => {
    acc[e.type] = e;
    return acc;
  }, {} as Record<EventType, EventDef>);
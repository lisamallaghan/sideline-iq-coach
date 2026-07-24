import type { EventCategory, EventType } from "@/types";

export interface EventDef {
  type: EventType;
  label: string;
  category: EventCategory;
  score?: number;
  tone: "positive" | "negative" | "neutral";
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
      { type: "kickout_won_clean", label: "Kickout Won (Clean)", category: "possession", tone: "positive" },
      { type: "kickout_won_break", label: "Kickout Won (Break)", category: "possession", tone: "positive" },
      { type: "opp_kickout_won", label: "Opposition Kickout Won", category: "possession", tone: "negative" },
      { type: "turnover_won", label: "Turnover Won", category: "possession", tone: "positive" },
      { type: "turnover_lost", label: "Turnover Lost", category: "possession", tone: "negative" },
    ],
  },
  {
    id: "passing",
    label: "Passing",
    tone: "neutral",
    icon: "Send",
    events: [
      { type: "kick_pass_lost", label: "Kick Pass Lost", category: "passing", tone: "negative" },
      { type: "hand_pass_lost", label: "Hand Pass Lost", category: "passing", tone: "negative" },
    ],
  },
  {
    id: "shooting",
    label: "Shooting",
    tone: "positive",
    icon: "Crosshair",
    events: [
      { type: "goal", label: "Goal", category: "shooting", tone: "positive", score: 3 },
      { type: "two_pointer", label: "Two Pointer", category: "shooting", tone: "positive", score: 2 },
      { type: "point", label: "Point", category: "shooting", tone: "positive", score: 1 },
      { type: "wide", label: "Wide", category: "shooting", tone: "negative" },
      { type: "dropped_short", label: "Dropped Short", category: "shooting", tone: "negative" },
      { type: "saved", label: "Saved", category: "shooting", tone: "negative" },
      { type: "blocked", label: "Blocked", category: "shooting", tone: "negative" },
    ],
  },
  {
    id: "defence",
    label: "Defence",
    tone: "positive",
    icon: "Shield",
    events: [
      { type: "block", label: "Block", category: "defence", tone: "positive" },
      { type: "tackle", label: "Tackle", category: "defence", tone: "positive" },
      { type: "interception", label: "Interception", category: "defence", tone: "positive" },
    ],
  },
  {
    id: "discipline",
    label: "Discipline",
    tone: "negative",
    icon: "AlertTriangle",
    events: [
      { type: "foul_conceded", label: "Foul Conceded", category: "discipline", tone: "negative" },
      { type: "scorable_free_conceded", label: "Scorable Free Conceded", category: "discipline", tone: "negative" },
      { type: "yellow_card", label: "Yellow Card", category: "discipline", tone: "negative" },
      { type: "red_card", label: "Red Card", category: "discipline", tone: "negative" },
    ],
  },
  {
    id: "errors",
    label: "Errors",
    tone: "negative",
    icon: "XOctagon",
    events: [
      { type: "dropped_ball", label: "Dropped Ball", category: "errors", tone: "negative" },
      { type: "overcarried", label: "Overcarried", category: "errors", tone: "negative" },
      { type: "poor_decision", label: "Poor Decision", category: "errors", tone: "negative" },
      { type: "solo_into_traffic", label: "Solo Into Traffic", category: "errors", tone: "negative" },
    ],
  },
  {
    id: "positive",
    label: "Positive",
    tone: "positive",
    icon: "Sparkles",
    events: [
      { type: "assist", label: "Assist", category: "positive", tone: "positive" },
      { type: "won_free", label: "Won Free", category: "positive", tone: "positive" },
    ],
  },
];

export const EVENT_MAP: Record<EventType, EventDef> = EVENT_CATEGORIES
  .flatMap((c) => c.events)
  .reduce((acc, e) => {
    acc[e.type] = e;
    return acc;
  }, {} as Record<EventType, EventDef>);
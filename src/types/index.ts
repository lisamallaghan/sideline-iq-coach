export type Position =
  | "GK"
  | "FB"
  | "CB"
  | "HB"
  | "MF"
  | "HF"
  | "CF"
  | "FF";

export interface Player {
  id: string;
  name: string;
  number: number;
  position: Position;
  isCaptain?: boolean;
}

export type EventCategory =
  | "possession"
  | "passing"
  | "shooting"
  | "defence"
  | "discipline"
  | "errors"
  | "positive";

export type EventType =
  // possession
  | "kickout_won_clean"
  | "kickout_won_break"
  | "opp_kickout_won"
  | "turnover_won"
  | "turnover_lost"
  // passing
  | "kick_pass_lost"
  | "hand_pass_lost"
  // shooting
  | "goal"
  | "point"
  | "wide"
  | "dropped_short"
  | "saved"
  | "blocked"
  // defence
  | "block"
  | "tackle"
  | "interception"
  // discipline
  | "foul_conceded"
  | "scorable_free_conceded"
  | "yellow_card"
  | "red_card"
  // errors
  | "dropped_ball"
  | "overcarried"
  | "poor_decision"
  | "solo_into_traffic"
  // positive
  | "assist"
  | "won_free";

export interface MatchEvent {
  id: string;
  playerId: string;
  category: EventCategory;
  type: EventType;
  minute: number;
  half: 1 | 2;
  timestamp: number;
  team: "us" | "opp";
}

export interface MatchSetup {
  competition: string;
  opposition: string;
  venue: string;
  date: string;
  homeAway: "home" | "away";
  duration: number; // minutes per half
  startingXV: string[]; // player ids
  bench: string[];
}

export interface Match extends MatchSetup {
  id: string;
  events: MatchEvent[];
  startedAt?: number;
  finishedAt?: number;
  status: "setup" | "live" | "finished";
}

export type PossessionOwner = "us" | "opp" | "out";

export interface PossessionPeriod {
  id: string;
  owner: PossessionOwner;
  startMs: number;
  endMs?: number;
  startMinute: number;
  endMinute?: number;
  endReason?: string;
}
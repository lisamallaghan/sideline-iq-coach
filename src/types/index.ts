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
  | "kickout_lost"
  | "opp_kickout_stolen"
  | "turnover_won"
  | "turnover_lost"
  // passing
  | "kick_pass_lost"
  | "hand_pass_lost"
  // shooting
  | "goal"
  | "point"
  | "two_pointer"
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
  | "injury"
  | "coach_note"
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
  note?: string;
}

export interface MatchSetup {
  teamName: string;
  competition: string;
  opposition: string;
  venue: string;
  date: string;
  homeAway: "home" | "away";
  duration: number; // minutes per half
  startingXV: string[]; // player ids
  bench: string[];
  recordingMode?: "coach" | "lineup";
  /** Editable squad for this match. Falls back to the default squad. */
  roster?: Player[];
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

export interface Substitution {
  id: string;
  offId: string;
  onId: string;
  minute: number;
  half: 1 | 2;
  timestamp: number;
}
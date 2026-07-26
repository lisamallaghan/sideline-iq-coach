import type { Match } from "@/types";
import { BENCH, STARTING_XV } from "./players";

export const PREVIOUS_MATCHES: Match[] = [
  {
    id: "m-prev-1",
    competition: "Leinster Senior Championship",
    opposition: "St. Brigid's",
    venue: "Parnell Park",
    date: "2026-07-11",
    homeAway: "home",
    duration: 30,
    startingXV: STARTING_XV,
    bench: BENCH,
    status: "finished",
    startedAt: Date.now() - 11 * 86400000,
    finishedAt: Date.now() - 11 * 86400000 + 60 * 60000,
    events: [],
  },
  {
    id: "m-prev-2",
    competition: "League Div 1",
    opposition: "Kilmacud Crokes",
    venue: "Silver Park",
    date: "2026-07-04",
    homeAway: "away",
    duration: 30,
    startingXV: STARTING_XV,
    bench: BENCH,
    status: "finished",
    startedAt: Date.now() - 18 * 86400000,
    finishedAt: Date.now() - 18 * 86400000 + 60 * 60000,
    events: [],
  },
  {
    id: "m-prev-3",
    competition: "League Div 1",
    opposition: "Foxrock-Cabinteely",
    venue: "Home",
    date: "2026-06-27",
    homeAway: "home",
    duration: 30,
    startingXV: STARTING_XV,
    bench: BENCH,
    status: "finished",
    startedAt: Date.now() - 25 * 86400000,
    finishedAt: Date.now() - 25 * 86400000 + 60 * 60000,
    events: [],
  },
];

export const PREVIOUS_MATCH_SUMMARIES = [
  { id: "m-prev-1", us: "2-11", them: "1-09", result: "W" as const },
  { id: "m-prev-2", us: "1-08", them: "1-10", result: "L" as const },
  { id: "m-prev-3", us: "3-12", them: "0-08", result: "W" as const },
];

export const UPCOMING_FIXTURE = {
  teamName: "Ardboe",
  competition: "Leinster Senior Championship",
  opposition: "Ballyboden St. Enda's",
  venue: "Parnell Park",
  date: "2026-07-29",
  time: "19:30",
  homeAway: "home" as const,
};
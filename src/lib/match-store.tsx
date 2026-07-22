import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Match, MatchEvent, MatchSetup } from "@/types";
import { BENCH, STARTING_XV } from "@/data/players";
import { EVENT_MAP } from "@/data/events";

interface MatchStore {
  match: Match | null;
  createMatch: (setup: MatchSetup) => void;
  startMatch: () => void;
  finishMatch: () => void;
  clearMatch: () => void;
  addEvent: (input: { playerId: string; category: MatchEvent["category"]; type: MatchEvent["type"]; team?: "us" | "opp" }) => void;
  undoLast: () => void;
  elapsedSec: number;
  currentMinute: number;
  currentHalf: 1 | 2;
  ourScore: { goals: number; points: number };
  theirScore: { goals: number; points: number };
  toggleHalf: () => void;
}

const MatchCtx = createContext<MatchStore | null>(null);

const DEFAULT_SETUP: MatchSetup = {
  competition: "Leinster Senior Championship",
  opposition: "Ballyboden St. Enda's",
  venue: "Parnell Park",
  date: new Date().toISOString().slice(0, 10),
  homeAway: "home",
  duration: 30,
  startingXV: STARTING_XV,
  bench: BENCH,
};

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

export function MatchProvider({ children }: { children: ReactNode }) {
  const [match, setMatch] = useState<Match | null>(() => ({
    ...DEFAULT_SETUP,
    id: newId(),
    events: [],
    status: "setup",
  }));
  const [elapsedSec, setElapsedSec] = useState(0);
  const [half, setHalf] = useState<1 | 2>(1);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (match?.status !== "live") return;
    const id = setInterval(() => {
      if (startRef.current) {
        setElapsedSec(Math.floor((Date.now() - startRef.current) / 1000));
      }
    }, 1000);
    return () => clearInterval(id);
  }, [match?.status]);

  const createMatch = useCallback((setup: MatchSetup) => {
    setMatch({ ...setup, id: newId(), events: [], status: "setup" });
    setElapsedSec(0);
    setHalf(1);
    startRef.current = null;
  }, []);

  const startMatch = useCallback(() => {
    startRef.current = Date.now();
    setElapsedSec(0);
    setMatch((m) => (m ? { ...m, status: "live", startedAt: Date.now() } : m));
  }, []);

  const finishMatch = useCallback(() => {
    setMatch((m) => (m ? { ...m, status: "finished", finishedAt: Date.now() } : m));
  }, []);

  const clearMatch = useCallback(() => {
    setMatch({ ...DEFAULT_SETUP, id: newId(), events: [], status: "setup" });
    setElapsedSec(0);
    setHalf(1);
    startRef.current = null;
  }, []);

  const currentMinute =
    Math.min(match?.duration ?? 30, Math.floor(elapsedSec / 60)) +
    (half === 2 ? (match?.duration ?? 30) : 0);

  const addEvent: MatchStore["addEvent"] = useCallback(
    (input) => {
      setMatch((m) => {
        if (!m) return m;
        const ev: MatchEvent = {
          id: newId(),
          playerId: input.playerId,
          category: input.category,
          type: input.type,
          minute: currentMinute,
          half,
          timestamp: Date.now(),
          team: input.team ?? "us",
        };
        return { ...m, events: [...m.events, ev] };
      });
    },
    [currentMinute, half],
  );

  const undoLast = useCallback(() => {
    setMatch((m) => (m ? { ...m, events: m.events.slice(0, -1) } : m));
  }, []);

  const toggleHalf = useCallback(() => setHalf((h) => (h === 1 ? 2 : 1)), []);

  const ourScore = useMemo(() => tallyScore(match?.events ?? [], "us"), [match?.events]);
  const theirScore = useMemo(() => tallyScore(match?.events ?? [], "opp"), [match?.events]);

  const value: MatchStore = {
    match,
    createMatch,
    startMatch,
    finishMatch,
    clearMatch,
    addEvent,
    undoLast,
    elapsedSec,
    currentMinute,
    currentHalf: half,
    ourScore,
    theirScore,
    toggleHalf,
  };

  return <MatchCtx.Provider value={value}>{children}</MatchCtx.Provider>;
}

function tallyScore(events: MatchEvent[], team: "us" | "opp") {
  let goals = 0;
  let points = 0;
  for (const e of events) {
    if (e.team !== team) continue;
    const def = EVENT_MAP[e.type];
    if (def?.score === 3) goals += 1;
    else if (def?.score === 1) points += 1;
  }
  return { goals, points };
}

export function useMatch() {
  const ctx = useContext(MatchCtx);
  if (!ctx) throw new Error("useMatch must be used inside MatchProvider");
  return ctx;
}

export function formatScore(s: { goals: number; points: number }) {
  return `${s.goals}-${String(s.points).padStart(2, "0")}`;
}

export function scoreTotal(s: { goals: number; points: number }) {
  return s.goals * 3 + s.points;
}
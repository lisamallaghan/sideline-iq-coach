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
import type { Match, MatchEvent, MatchSetup, Substitution } from "@/types";
import type { PossessionOwner, PossessionPeriod } from "@/types";
import { BENCH, STARTING_XV } from "@/data/players";
import { EVENT_MAP } from "@/data/events";

interface MatchStore {
  match: Match | null;
  createMatch: (setup: MatchSetup) => void;
  startMatch: () => void;
  finishMatch: () => void;
  clearMatch: () => void;
  addEvent: (input: { playerId?: string; category: MatchEvent["category"]; type: MatchEvent["type"]; team?: "us" | "opp"; note?: string }) => void;
  undoLast: () => void;
  lastAddedId: string | null;
  updateEvent: (id: string, patch: Partial<Pick<MatchEvent, "playerId" | "type" | "category">>) => void;
  deleteEvent: (id: string) => void;
  pendingScoreEvents: MatchEvent[];
  pendingEvents: MatchEvent[];
  lastEvent: MatchEvent | null;
  substitutions: Substitution[];
  performSubstitution: (offId: string, onId: string) => void;
  activeStartingXV: string[];
  activeBench: string[];
  involvement: Record<string, number>;
  recentPlayerIds: string[];
  setRecordingMode: (m: "coach" | "lineup") => void;
  elapsedSec: number;
  currentMinute: number;
  currentHalf: 1 | 2;
  ourScore: TeamScore;
  theirScore: TeamScore;
  toggleHalf: () => void;
  possessionOwner: PossessionOwner;
  possessionPeriods: PossessionPeriod[];
  setPossession: (owner: PossessionOwner, reason?: string) => void;
  possessionStats: {
    usMs: number;
    oppMs: number;
    outMs: number;
    inPlayMs: number;
    totalMs: number;
    usPct: number;
    oppPct: number;
  };
}

export interface TeamScore {
  goals: number;
  twoPointers: number;
  points: number;
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
  recordingMode: "coach",
};

const MODE_STORAGE_KEY = "sideline-iq.recording-mode";
function readSavedMode(): "coach" | "lineup" {
  if (typeof window === "undefined") return "coach";
  const v = window.localStorage.getItem(MODE_STORAGE_KEY);
  return v === "lineup" ? "lineup" : "coach";
}
function saveMode(m: "coach" | "lineup") {
  if (typeof window !== "undefined") window.localStorage.setItem(MODE_STORAGE_KEY, m);
}

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

export function MatchProvider({ children }: { children: ReactNode }) {
  const [match, setMatch] = useState<Match | null>(() => ({
    ...DEFAULT_SETUP,
    recordingMode: readSavedMode(),
    id: newId(),
    events: [],
    status: "setup",
  }));
  const [elapsedSec, setElapsedSec] = useState(0);
  const [half, setHalf] = useState<1 | 2>(1);
  const startRef = useRef<number | null>(null);
  const [possessionPeriods, setPossessionPeriods] = useState<PossessionPeriod[]>([]);
  const [possessionOwner, setPossessionOwner] = useState<PossessionOwner>("out");
  const [nowTick, setNowTick] = useState(0);
  const [substitutions, setSubstitutions] = useState<Substitution[]>([]);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);

  useEffect(() => {
    if (match?.status !== "live") return;
    const id = setInterval(() => {
      if (startRef.current) {
        setElapsedSec(Math.floor((Date.now() - startRef.current) / 1000));
      }
      setNowTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [match?.status]);

  const createMatch = useCallback((setup: MatchSetup) => {
    if (setup.recordingMode) saveMode(setup.recordingMode);
    setMatch({ ...setup, id: newId(), events: [], status: "setup" });
    setElapsedSec(0);
    setHalf(1);
    startRef.current = null;
    setPossessionPeriods([]);
    setPossessionOwner("out");
    setSubstitutions([]);
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
    setMatch({ ...DEFAULT_SETUP, recordingMode: readSavedMode(), id: newId(), events: [], status: "setup" });
    setElapsedSec(0);
    setHalf(1);
    startRef.current = null;
    setPossessionPeriods([]);
    setPossessionOwner("out");
    setSubstitutions([]);
  }, []);

  const setRecordingMode = useCallback((m: "coach" | "lineup") => {
    saveMode(m);
    setMatch((prev) => (prev ? { ...prev, recordingMode: m } : prev));
  }, []);

  const currentMinute =
    Math.min(match?.duration ?? 30, Math.floor(elapsedSec / 60)) +
    (half === 2 ? (match?.duration ?? 30) : 0);

  const setPossession = useCallback(
    (owner: PossessionOwner, reason?: string) => {
      const now = Date.now();
      setPossessionPeriods((prev) => {
        if (prev.length && prev[prev.length - 1].owner === owner && !prev[prev.length - 1].endMs) {
          return prev;
        }
        const closed = prev.map((p, i) =>
          i === prev.length - 1 && !p.endMs
            ? { ...p, endMs: now, endMinute: currentMinute, endReason: reason }
            : p,
        );
        return [
          ...closed,
          {
            id: newId(),
            owner,
            startMs: now,
            startMinute: currentMinute,
          },
        ];
      });
      setPossessionOwner(owner);
    },
    [currentMinute],
  );

  const addEvent: MatchStore["addEvent"] = useCallback(
    (input) => {
      const id = newId();
      setMatch((m) => {
        if (!m) return m;
        const ev: MatchEvent = {
          id,
          playerId: input.playerId ?? "",
          category: input.category,
          type: input.type,
          minute: currentMinute,
          half,
          timestamp: Date.now(),
          team: input.team ?? "us",
          note: input.note,
        };
        return { ...m, events: [...m.events, ev] };
      });
      setLastAddedId(id);
    },
    [currentMinute, half],
  );

  const undoLast = useCallback(() => {
    setMatch((m) => (m ? { ...m, events: m.events.slice(0, -1) } : m));
  }, []);

  const updateEvent = useCallback((id: string, patch: Partial<Pick<MatchEvent, "playerId" | "type" | "category">>) => {
    setMatch((m) =>
      m ? { ...m, events: m.events.map((e) => (e.id === id ? { ...e, ...patch } : e)) } : m,
    );
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setMatch((m) => (m ? { ...m, events: m.events.filter((e) => e.id !== id) } : m));
  }, []);

  const performSubstitution = useCallback(
    (offId: string, onId: string) => {
      setSubstitutions((prev) => [
        ...prev,
        {
          id: newId(),
          offId,
          onId,
          minute: currentMinute,
          half,
          timestamp: Date.now(),
        },
      ]);
    },
    [currentMinute, half],
  );

  const toggleHalf = useCallback(() => setHalf((h) => (h === 1 ? 2 : 1)), []);

  const ourScore = useMemo(() => tallyScore(match?.events ?? [], "us"), [match?.events]);
  const theirScore = useMemo(() => tallyScore(match?.events ?? [], "opp"), [match?.events]);

  const pendingScoreEvents = useMemo(
    () =>
      (match?.events ?? []).filter(
        (e) => e.team === "us" && !e.playerId && (EVENT_MAP[e.type]?.score ?? 0) > 0,
      ),
    [match?.events],
  );

  const pendingEvents = useMemo(
    () =>
      (match?.events ?? []).filter(
        (e) => e.team === "us" && !e.playerId && EVENT_MAP[e.type]?.attributable,
      ),
    [match?.events],
  );

  const recentPlayerIds = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    const evs = match?.events ?? [];
    for (let i = evs.length - 1; i >= 0 && out.length < 6; i--) {
      const pid = evs[i].playerId;
      if (!pid || seen.has(pid)) continue;
      seen.add(pid);
      out.push(pid);
    }
    return out;
  }, [match?.events]);

  const { activeStartingXV, activeBench } = useMemo(() => {
    const start = [...(match?.startingXV ?? [])];
    const bench = [...(match?.bench ?? [])];
    for (const s of substitutions) {
      const offIdx = start.indexOf(s.offId);
      const onIdx = bench.indexOf(s.onId);
      if (offIdx !== -1 && onIdx !== -1) {
        start[offIdx] = s.onId;
        bench[onIdx] = s.offId;
      }
    }
    return { activeStartingXV: start, activeBench: bench };
  }, [match?.startingXV, match?.bench, substitutions]);

  const involvement = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const e of match?.events ?? []) {
      if (!e.playerId) continue;
      acc[e.playerId] = (acc[e.playerId] ?? 0) + 1;
    }
    return acc;
  }, [match?.events]);

  const lastEvent = match?.events.length ? match.events[match.events.length - 1] : null;

  const possessionStats = useMemo(() => {
    const now = Date.now();
    void nowTick;
    let usMs = 0;
    let oppMs = 0;
    let outMs = 0;
    for (const p of possessionPeriods) {
      const end = p.endMs ?? now;
      const d = Math.max(0, end - p.startMs);
      if (p.owner === "us") usMs += d;
      else if (p.owner === "opp") oppMs += d;
      else outMs += d;
    }
    const inPlayMs = usMs + oppMs;
    const totalMs = inPlayMs + outMs;
    const usPct = inPlayMs ? Math.round((usMs / inPlayMs) * 100) : 0;
    const oppPct = inPlayMs ? 100 - usPct : 0;
    return { usMs, oppMs, outMs, inPlayMs, totalMs, usPct, oppPct };
  }, [possessionPeriods, nowTick]);

  const value: MatchStore = {
    match,
    createMatch,
    startMatch,
    finishMatch,
    clearMatch,
    addEvent,
    undoLast,
    lastAddedId,
    updateEvent,
    deleteEvent,
    pendingScoreEvents,
    pendingEvents,
    lastEvent,
    substitutions,
    performSubstitution,
    activeStartingXV,
    activeBench,
    involvement,
    recentPlayerIds,
    setRecordingMode,
    elapsedSec,
    currentMinute,
    currentHalf: half,
    ourScore,
    theirScore,
    toggleHalf,
    possessionOwner,
    possessionPeriods,
    setPossession,
    possessionStats,
  };

  return <MatchCtx.Provider value={value}>{children}</MatchCtx.Provider>;
}

function tallyScore(events: MatchEvent[], team: "us" | "opp"): TeamScore {
  let goals = 0;
  let twoPointers = 0;
  let points = 0;
  for (const e of events) {
    if (e.team !== team) continue;
    const def = EVENT_MAP[e.type];
    if (def?.score === 3) goals += 1;
    else if (def?.score === 2) twoPointers += 1;
    else if (def?.score === 1) points += 1;
  }
  return { goals, twoPointers, points };
}

export function useMatch() {
  const ctx = useContext(MatchCtx);
  if (!ctx) throw new Error("useMatch must be used inside MatchProvider");
  return ctx;
}

export function formatScore(s: TeamScore) {
  const total = s.twoPointers * 2 + s.points;
  return `${s.goals}-${String(total).padStart(2, "0")}`;
}

export function scoreTotal(s: TeamScore) {
  return s.goals * 3 + s.twoPointers * 2 + s.points;
}
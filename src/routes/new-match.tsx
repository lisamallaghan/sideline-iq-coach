import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useMatch } from "@/lib/match-store";
import { MOCK_PLAYERS, STARTING_XV, BENCH } from "@/data/players";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronRight, MapPin, Trophy, Users2 } from "lucide-react";

export const Route = createFileRoute("/new-match")({
  head: () => ({
    meta: [
      { title: "New Match · Sideline IQ" },
      { name: "description", content: "Set up a new match — competition, opposition, venue and starting XV." },
    ],
  }),
  component: NewMatch,
});

function NewMatch() {
  const navigate = useNavigate();
  const { match, createMatch, startMatch } = useMatch();

  const [competition, setCompetition] = useState(match?.competition ?? "");
  const [opposition, setOpposition] = useState(match?.opposition ?? "");
  const [venue, setVenue] = useState(match?.venue ?? "");
  const [date, setDate] = useState(match?.date ?? new Date().toISOString().slice(0, 10));
  const [homeAway, setHomeAway] = useState<"home" | "away">(match?.homeAway ?? "home");
  const [duration, setDuration] = useState<number>(match?.duration ?? 30);
  const [starting, setStarting] = useState<string[]>(match?.startingXV ?? STARTING_XV);
  const [bench, setBench] = useState<string[]>(match?.bench ?? BENCH);

  const togglePlayer = (id: string) => {
    if (starting.includes(id)) {
      setStarting(starting.filter((p) => p !== id));
      setBench([...bench, id]);
    } else if (bench.includes(id)) {
      setBench(bench.filter((p) => p !== id));
      setStarting([...starting, id]);
    } else {
      setBench([...bench, id]);
    }
  };

  const submit = () => {
    createMatch({
      competition: competition || "Friendly",
      opposition: opposition || "TBC",
      venue: venue || "Home",
      date,
      homeAway,
      duration,
      startingXV: starting.slice(0, 15),
      bench,
    });
    startMatch();
    navigate({ to: "/match/live" });
  };

  const canStart = starting.length >= 1 && opposition.trim().length > 0;

  return (
    <AppShell title="New Match" subtitle="Setup" back="/" contentClassName="px-4 py-4">
      <div className="space-y-6">
        <section className="space-y-3">
          <div className="grid grid-cols-1 gap-3">
            <div>
              <Label htmlFor="competition" className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                <Trophy className="mr-1 inline h-3.5 w-3.5" /> Competition
              </Label>
              <Input id="competition" value={competition} onChange={(e) => setCompetition(e.target.value)} placeholder="Leinster Senior Championship" className="h-12 rounded-xl" />
            </div>
            <div>
              <Label htmlFor="opposition" className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Opposition
              </Label>
              <Input id="opposition" value={opposition} onChange={(e) => setOpposition(e.target.value)} placeholder="Ballyboden St. Enda's" className="h-12 rounded-xl" />
            </div>
            <div>
              <Label htmlFor="venue" className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                <MapPin className="mr-1 inline h-3.5 w-3.5" /> Venue
              </Label>
              <Input id="venue" value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Parnell Park" className="h-12 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="date" className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Date
                </Label>
                <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-12 rounded-xl" />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Duration (per half)
                </Label>
                <div className="flex gap-1 rounded-xl bg-secondary p-1">
                  {[25, 30, 35].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d)}
                      className={cn(
                        "flex-1 rounded-lg py-2 text-sm font-semibold transition",
                        duration === d ? "bg-card text-foreground shadow-elegant" : "text-muted-foreground",
                      )}
                    >
                      {d}'
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Home / Away
              </Label>
              <div className="flex gap-1 rounded-xl bg-secondary p-1">
                {(["home", "away"] as const).map((ha) => (
                  <button
                    key={ha}
                    type="button"
                    onClick={() => setHomeAway(ha)}
                    className={cn(
                      "flex-1 rounded-lg py-2 text-sm font-semibold capitalize transition",
                      homeAway === ha ? "bg-card text-foreground shadow-elegant" : "text-muted-foreground",
                    )}
                  >
                    {ha}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <Users2 className="mr-1 inline h-3.5 w-3.5" /> Starting XV
            </h2>
            <span className="text-xs font-semibold text-accent">{starting.length} selected</span>
          </div>
          <div className="rounded-2xl border border-border bg-card p-2 shadow-elegant">
            <ul className="divide-y divide-border">
              {MOCK_PLAYERS.map((p) => {
                const inStart = starting.includes(p.id);
                const inBench = bench.includes(p.id);
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => togglePlayer(p.id)}
                      className="flex w-full items-center gap-3 p-3 text-left transition active:bg-secondary"
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                        {p.number}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {p.name}
                          {p.isCaptain ? <span className="ml-1 text-[10px] font-bold text-accent">(C)</span> : null}
                        </p>
                        <p className="text-xs text-muted-foreground">{p.position}</p>
                      </div>
                      <span
                        className={cn(
                          "rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-widest",
                          inStart
                            ? "bg-success/15 text-success"
                            : inBench
                              ? "bg-warning/20 text-warning-foreground"
                              : "bg-secondary text-muted-foreground",
                        )}
                      >
                        {inStart ? "Start" : inBench ? "Bench" : "Out"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </div>

      <div
        className="sticky bottom-0 -mx-4 mt-6 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-xl"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}
      >
        <Button
          type="button"
          onClick={submit}
          disabled={!canStart}
          className="h-14 w-full rounded-2xl bg-accent text-base font-bold text-accent-foreground shadow-glow-accent hover:bg-accent/90 disabled:opacity-50"
        >
          Start match <ChevronRight className="ml-1 h-5 w-5" />
        </Button>
      </div>
    </AppShell>
  );
}
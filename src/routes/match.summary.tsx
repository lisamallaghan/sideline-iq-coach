import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { useMatch, formatScore, scoreTotal } from "@/lib/match-store";
import { EVENT_MAP } from "@/data/events";
import { MOCK_PLAYERS } from "@/data/players";
import { Button } from "@/components/ui/button";
import { ListOrdered, Share2, Trophy } from "lucide-react";

export const Route = createFileRoute("/match/summary")({
  head: () => ({
    meta: [
      { title: "Match Summary · Sideline IQ" },
      { name: "description", content: "Final score, team stats and player performances." },
    ],
  }),
  component: Summary,
});

function Summary() {
  const { match, ourScore, theirScore } = useMatch();
  const events = match?.events ?? [];

  const won = scoreTotal(ourScore) > scoreTotal(theirScore);
  const drew = scoreTotal(ourScore) === scoreTotal(theirScore);

  const playerStats = MOCK_PLAYERS.map((p) => {
    const own = events.filter((e) => e.playerId === p.id);
    const scoreEvents = own.filter((e) => EVENT_MAP[e.type]?.score);
    const goals = scoreEvents.filter((e) => EVENT_MAP[e.type]?.score === 3).length;
    const twoPointers = scoreEvents.filter((e) => EVENT_MAP[e.type]?.score === 2).length;
    const points = scoreEvents.filter((e) => EVENT_MAP[e.type]?.score === 1).length;
    const totalScore = goals * 3 + twoPointers * 2 + points;
    return { player: p, total: own.length, goals, twoPointers, points, totalScore };
  })
    .filter((s) => s.total > 0)
    .sort((a, b) => b.totalScore - a.totalScore || b.total - a.total);

  const topScorer = playerStats.find((s) => s.totalScore > 0);

  return (
    <AppShell title="Match Summary" subtitle="Full Time" back="/" contentClassName="px-4 py-4 space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-hero p-6 text-primary-foreground shadow-premium">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/25 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-accent" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">
              {won ? "Victory" : drew ? "Draw" : "Full Time"}
            </p>
          </div>
          <p className="mt-2 truncate text-sm font-semibold text-white/80">
            vs {match?.opposition ?? "—"}
          </p>
          <div className="mt-3 flex items-end gap-3">
            <p className="text-5xl font-black tabular-nums">{formatScore(ourScore)}</p>
            <p className="mb-1 text-2xl font-semibold text-white/60">–</p>
            <p className="text-5xl font-black tabular-nums text-white/80">
              {formatScore(theirScore)}
            </p>
          </div>
          <p className="mt-2 text-xs text-white/60">
            {match?.competition} · {match?.venue}
          </p>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Team statistics
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Goals" value={ourScore.goals} />
          <StatCard label="Two Pointers" value={ourScore.twoPointers} />
          <StatCard label="Points" value={ourScore.points} />
        </div>
        <div className="mt-3 rounded-2xl border border-border bg-card p-4 shadow-elegant">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Total</p>
          <p className="mt-1 text-3xl font-black tabular-nums text-foreground">{formatScore(ourScore)}</p>
          {topScorer ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Highest scorer: <span className="font-semibold text-foreground">{topScorer.player.name.split(" ")[0]}</span>
              {" "}({topScorer.goals}-{String(topScorer.twoPointers * 2 + topScorer.points).padStart(2, "0")})
            </p>
          ) : null}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <StatCard label="Total events" value={events.length} />
          <StatCard
            label="Shots"
            value={events.filter((e) => e.category === "shooting" && e.team === "us").length}
          />
          <StatCard
            label="Turnovers Won"
            value={events.filter((e) => e.type === "turnover_won").length}
            tone="positive"
          />
          <StatCard
            label="Turnovers Lost"
            value={events.filter((e) => e.type === "turnover_lost").length}
            tone="negative"
          />
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Player statistics
        </h2>
        {playerStats.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
            No player events were recorded in this match.
          </p>
        ) : (
          <ul className="space-y-2">
            {playerStats.map(({ player, total, goals, twoPointers, points, totalScore }) => (
              <li
                key={player.id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-elegant"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {player.number}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{player.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {player.position} · {total} events
                  </p>
                </div>
                {totalScore > 0 ? (
                  <span className="rounded-full bg-accent/12 px-2 py-1 text-xs font-bold text-accent">
                    {goals}-{String(twoPointers * 2 + points).padStart(2, "0")}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex gap-2">
        <Button asChild variant="outline" className="h-12 flex-1 rounded-xl">
          <Link to="/match/timeline">
            <ListOrdered className="mr-2 h-4 w-4" /> Timeline
          </Link>
        </Button>
        <Button className="h-12 flex-1 rounded-xl bg-primary text-primary-foreground">
          <Share2 className="mr-2 h-4 w-4" /> Share
        </Button>
      </div>
    </AppShell>
  );
}
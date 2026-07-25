import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { InsightCard } from "@/components/InsightCard";
import { useMatch } from "@/lib/match-store";
import { EVENT_MAP } from "@/data/events";
import { MOCK_PLAYERS } from "@/data/players";
import { TrendingUp, TrendingDown, Settings2 } from "lucide-react";
import { formatDuration } from "@/lib/format";
import { buildCoachFeed } from "@/lib/coach-feed";

export const Route = createFileRoute("/match/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · Sideline IQ" },
      { name: "description", content: "Live match analytics — kickout %, turnovers, shot conversion and coach insights." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { match, possessionStats, currentMinute, ourScore } = useMatch();
  const events = match?.events ?? [];

  const shots = events.filter((e) => e.category === "shooting" && e.team === "us");
  const scores = shots.filter((e) => EVENT_MAP[e.type]?.score);
  const conv = shots.length ? Math.round((scores.length / shots.length) * 100) : 0;

  const kickouts = events.filter((e) => e.type === "kickout_won_clean" || e.type === "kickout_won_break" || e.type === "opp_kickout_won");
  const ourKickouts = kickouts.filter((e) => e.type !== "opp_kickout_won").length;
  const koPct = kickouts.length ? Math.round((ourKickouts / kickouts.length) * 100) : 0;

  const turnoversWon = events.filter((e) => e.type === "turnover_won" || e.type === "tackle" || e.type === "interception").length;
  const turnoversLost = events.filter((e) => e.type === "turnover_lost" || e.type === "hand_pass_lost" || e.type === "kick_pass_lost").length;

  const { usPct, oppPct, inPlayMs, outMs, usMs, oppMs } = possessionStats;
  const feed = buildCoachFeed(events, { currentMinute, usPct, oppPct, koPct, conv });

  // Highest scorer
  const perPlayer = new Map<string, { goals: number; twoPointers: number; points: number; total: number }>();
  for (const e of events) {
    if (e.team !== "us" || !e.playerId) continue;
    const s = EVENT_MAP[e.type]?.score;
    if (!s) continue;
    const cur = perPlayer.get(e.playerId) ?? { goals: 0, twoPointers: 0, points: 0, total: 0 };
    if (s === 3) cur.goals += 1;
    else if (s === 2) cur.twoPointers += 1;
    else if (s === 1) cur.points += 1;
    cur.total += s;
    perPlayer.set(e.playerId, cur);
  }
  const topEntry = [...perPlayer.entries()].sort((a, b) => b[1].total - a[1].total)[0];
  const topPlayer = topEntry ? MOCK_PLAYERS.find((p) => p.id === topEntry[0]) : null;

  return (
    <AppShell title="Dashboard" subtitle="Match Insights" back="/match/live" contentClassName="px-4 py-4 space-y-5">
      <div className="flex justify-end">
        <Link
          to="/new-match"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-foreground shadow-elegant"
        >
          <Settings2 className="h-3.5 w-3.5" /> Edit match
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Goals" value={ourScore.goals} />
        <StatCard label="Two Pointers" value={ourScore.twoPointers} />
        <StatCard label="Points" value={ourScore.points} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Possession" value={`${usPct}%`} hint={`Opp ${oppPct}%`} />
        <StatCard label="Kickout Success" value={`${koPct}%`} hint={`${ourKickouts}/${kickouts.length || 0} won`} />
        <StatCard label="Turnovers Won" value={turnoversWon} tone="positive" icon={<TrendingUp className="h-4 w-4 text-success" />} />
        <StatCard label="Turnovers Lost" value={turnoversLost} tone="negative" icon={<TrendingDown className="h-4 w-4 text-destructive" />} />
        <StatCard label="Shot Conversion" value={`${conv}%`} hint={`${scores.length}/${shots.length || 0} shots`} className="col-span-2" />
        <StatCard
          label="Highest Scorer"
          value={topPlayer ? `#${topPlayer.number}` : "—"}
          hint={topPlayer && topEntry
            ? `${topPlayer.name.split(" ")[0]} · ${topEntry[1].goals}-${String(topEntry[1].twoPointers * 2 + topEntry[1].points).padStart(2, "0")}`
            : "No scores yet"}
          className="col-span-2"
        />
      </div>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Possession
        </h2>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-elegant">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Ardboe</p>
              <p className="text-3xl font-bold tabular-nums text-accent">{usPct}%</p>
              <p className="text-[11px] text-muted-foreground">{formatDuration(usMs)}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Opposition</p>
              <p className="text-3xl font-bold tabular-nums text-foreground">{oppPct}%</p>
              <p className="text-[11px] text-muted-foreground">{formatDuration(oppMs)}</p>
            </div>
          </div>
          <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-muted">
            <div className="bg-accent" style={{ width: `${usPct}%` }} />
            <div className="bg-primary" style={{ width: `${oppPct}%` }} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl bg-secondary/60 p-2">
              <p className="text-muted-foreground">Ball in Play</p>
              <p className="font-semibold tabular-nums text-foreground">{formatDuration(inPlayMs)}</p>
            </div>
            <div className="rounded-xl bg-secondary/60 p-2">
              <p className="text-muted-foreground">Out of Play</p>
              <p className="font-semibold tabular-nums text-foreground">{formatDuration(outMs)}</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Coach Feed
        </h2>
        <div className="space-y-2">
          {feed.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border bg-card p-4 text-center text-sm text-muted-foreground">
              No alerts yet — the coach feed updates as the match unfolds.
            </p>
          ) : (
            feed.map((item) => (
              <InsightCard key={item.id} tone={item.tone} title={item.title} body={item.body} />
            ))
          )}
        </div>
      </section>

      {events.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
          Record events on the Live screen to see your dashboard update in real time.
        </p>
      ) : null}
    </AppShell>
  );
}
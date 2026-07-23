import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { InsightCard } from "@/components/InsightCard";
import { useMatch } from "@/lib/match-store";
import { EVENT_MAP } from "@/data/events";
import { TrendingUp, TrendingDown } from "lucide-react";
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
  const { match, possessionStats, currentMinute } = useMatch();
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

  return (
    <AppShell title="Dashboard" subtitle="Match Insights" back="/match/live" contentClassName="px-4 py-4 space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Possession" value={`${usPct}%`} hint={`Opp ${oppPct}%`} />
        <StatCard label="Kickout Success" value={`${koPct}%`} hint={`${ourKickouts}/${kickouts.length || 0} won`} />
        <StatCard label="Turnovers Won" value={turnoversWon} tone="positive" icon={<TrendingUp className="h-4 w-4 text-success" />} />
        <StatCard label="Turnovers Lost" value={turnoversLost} tone="negative" icon={<TrendingDown className="h-4 w-4 text-destructive" />} />
        <StatCard label="Shot Conversion" value={`${conv}%`} hint={`${scores.length}/${shots.length || 0} shots`} className="col-span-2" />
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
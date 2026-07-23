import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { InsightCard } from "@/components/InsightCard";
import { useMatch, formatScore } from "@/lib/match-store";
import { EVENT_MAP } from "@/data/events";
import { Activity, TrendingUp, TrendingDown } from "lucide-react";
import { formatDuration } from "@/lib/format";

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
  const { match, ourScore, theirScore, possessionStats } = useMatch();
  const events = match?.events ?? [];

  const shots = events.filter((e) => e.category === "shooting" && e.team === "us");
  const scores = shots.filter((e) => EVENT_MAP[e.type]?.score);
  const wides = shots.filter((e) => e.type === "wide" || e.type === "dropped_short");
  const conv = shots.length ? Math.round((scores.length / shots.length) * 100) : 0;

  const kickouts = events.filter((e) => e.type === "kickout_won_clean" || e.type === "kickout_won_break" || e.type === "opp_kickout_won");
  const ourKickouts = kickouts.filter((e) => e.type !== "opp_kickout_won").length;
  const koPct = kickouts.length ? Math.round((ourKickouts / kickouts.length) * 100) : 0;

  const turnoversWon = events.filter((e) => e.type === "turnover_won" || e.type === "tackle" || e.type === "interception").length;
  const turnoversLost = events.filter((e) => e.type === "turnover_lost" || e.type === "hand_pass_lost" || e.type === "kick_pass_lost").length;

  const momentum = turnoversWon - turnoversLost + scores.length;
  const momentumLabel = momentum >= 3 ? "Strong" : momentum >= 0 ? "Even" : "Under pressure";

  const { usPct, oppPct, inPlayMs, outMs, usMs, oppMs } = possessionStats;

  return (
    <AppShell title="Dashboard" subtitle="Match Insights" back="/match/live" contentClassName="px-4 py-4 space-y-6">
      <StatCard
        label="Score"
        value={
          <span>
            {formatScore(ourScore)}
            <span className="mx-2 text-muted-foreground">vs</span>
            {formatScore(theirScore)}
          </span>
        }
        hint={match?.opposition ? `vs ${match.opposition}` : undefined}
        tone="accent"
      />

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Kickout %" value={`${koPct}%`} hint={`${ourKickouts}/${kickouts.length || 0} won`} />
        <StatCard label="Shot Conv." value={`${conv}%`} hint={`${scores.length}/${shots.length || 0} shots`} />
        <StatCard label="Turnovers Won" value={turnoversWon} tone="positive" icon={<TrendingUp className="h-4 w-4 text-success" />} />
        <StatCard label="Turnovers Lost" value={turnoversLost} tone="negative" icon={<TrendingDown className="h-4 w-4 text-destructive" />} />
        <StatCard label="Wides" value={wides.length} hint="Shots off target" />
        <StatCard label="Momentum" value={momentumLabel} icon={<Activity className="h-4 w-4 text-accent" />} />
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
          Coach Insights
        </h2>
        <div className="space-y-2">
          <InsightCard
            tone="positive"
            title="Winning own kickouts"
            body={`Retention at ${koPct}% on your own restarts. Keep varying the target to stop them reading it.`}
          />
          <InsightCard
            tone="warning"
            title="Midfield battle is tight"
            body="Breaking ball 50/50 around the middle third. A runner off the shoulder could tip it in your favour."
          />
          <InsightCard
            tone={usPct >= 50 ? "positive" : "warning"}
            title={usPct >= 50 ? "Controlling possession" : "Opposition dominating possession"}
            body={`Ardboe ${usPct}% · Opposition ${oppPct}%. ${
              usPct >= 50 ? "Keep the tempo and force them to chase." : "Slow the ball down and pick your moments."
            }`}
          />
          <InsightCard
            tone={conv >= 55 ? "positive" : conv >= 35 ? "insight" : "warning"}
            title={conv >= 55 ? "Shot conversion is strong" : "Shot conversion needs work"}
            body={`Converting ${conv}% of ${shots.length || 0} shots. ${
              wides.length >= 3 ? `${wides.length} shots off target — check shot selection.` : "Keep taking the right shots."
            }`}
          />
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
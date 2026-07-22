import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { InsightCard } from "@/components/InsightCard";
import { useMatch, formatScore } from "@/lib/match-store";
import { EVENT_MAP } from "@/data/events";
import { Activity, Target, TrendingUp, TrendingDown } from "lucide-react";

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
  const { match, ourScore, theirScore } = useMatch();
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
          Coach Insights
        </h2>
        <div className="space-y-2">
          <InsightCard
            tone="positive"
            title="Midfield is winning breaks"
            body="You're recovering three of every four breaking balls around the middle third. Keep pushing runners off the shoulder to convert quicker."
          />
          <InsightCard
            tone="warning"
            title="Left flank is leaking possession"
            body="Two of the last three turnovers lost came from the left wing. Consider dropping a runner deeper or switching the point of attack."
          />
          <InsightCard
            tone="insight"
            title="Their kickout goes short under pressure"
            body="When you push up, their goalkeeper has gone short 4 times. A press on the next restart could force another turnover."
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
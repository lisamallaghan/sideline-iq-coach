import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  CalendarClock,
  ChevronRight,
  History,
  Plus,
  Settings as SettingsIcon,
  Trophy,
  Users,
  Whistle,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SectionCard } from "@/components/SectionCard";
import { PREVIOUS_MATCHES, PREVIOUS_MATCH_SUMMARIES, UPCOMING_FIXTURE } from "@/data/matches";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/")({
  component: Home,
});

const SEASON_STATS = [
  { label: "Played", value: "9" },
  { label: "Won", value: "7" },
  { label: "Scoring Avg", value: "2-13" },
  { label: "Conv. %", value: "62%" },
];

function Home() {
  return (
    <AppShell
      contentClassName="px-4 pt-2"
      right={
        <Link
          to="/settings"
          className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-secondary-foreground"
          aria-label="Settings"
        >
          <SettingsIcon className="h-5 w-5" />
        </Link>
      }
      title="Sideline IQ"
      subtitle="Coach smarter. Win more."
    >
      <section className="mt-2">
        <Link
          to="/new-match"
          className="relative flex items-center gap-4 overflow-hidden rounded-3xl bg-gradient-hero p-5 text-primary-foreground shadow-premium"
        >
          <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-accent/25 blur-3xl" />
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-accent text-accent-foreground shadow-glow-accent">
            <Plus className="h-7 w-7" strokeWidth={2.5} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">
              Match day
            </p>
            <p className="text-lg font-semibold">Start a new match</p>
            <p className="mt-0.5 text-xs text-white/70">
              Setup lineup and go live in under a minute
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-white/80" />
        </Link>
      </section>

      <section className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Next Fixture
          </h2>
        </div>
        <article className="rounded-2xl border border-border bg-card p-4 shadow-elegant">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/12 text-accent">
              <CalendarClock className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-accent">
                {UPCOMING_FIXTURE.competition}
              </p>
              <p className="mt-1 truncate text-base font-semibold text-foreground">
                vs {UPCOMING_FIXTURE.opposition}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatDate(UPCOMING_FIXTURE.date)} · {UPCOMING_FIXTURE.time} ·{" "}
                {UPCOMING_FIXTURE.venue}
              </p>
            </div>
            <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
              {UPCOMING_FIXTURE.homeAway}
            </span>
          </div>
        </article>
      </section>

      <section className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Season Statistics
          </h2>
          <Link to="/match/dashboard" className="text-xs font-semibold text-accent">
            View
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-2 rounded-2xl border border-border bg-card p-4 shadow-elegant">
          {SEASON_STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-xl font-bold tabular-nums text-foreground">{s.value}</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 space-y-2">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Quick actions
        </h2>
        <SectionCard
          to="/players"
          title="Squad"
          description="20 registered players"
          icon={<Users className="h-6 w-6" />}
        />
        <SectionCard
          to="/match/dashboard"
          title="Season insights"
          description="Trends, form and coaching notes"
          icon={<BarChart3 className="h-6 w-6" />}
        />
      </section>

      <section className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Previous Matches
          </h2>
          <Link to="/match/timeline" className="text-xs font-semibold text-accent">
            All
          </Link>
        </div>
        <ul className="space-y-2">
          {PREVIOUS_MATCHES.map((m) => {
            const summary = PREVIOUS_MATCH_SUMMARIES.find((s) => s.id === m.id)!;
            const won = summary.result === "W";
            return (
              <li key={m.id}>
                <Link
                  to="/match/summary"
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-elegant"
                >
                  <div
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-sm font-bold ${
                      won ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {summary.result}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      vs {m.opposition}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {formatDate(m.date)} · {m.competition}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold tabular-nums text-foreground">
                      {summary.us}
                    </p>
                    <p className="text-xs tabular-nums text-muted-foreground">{summary.them}</p>
                  </div>
                  <ChevronRight className="ml-1 h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="h-4" />
    </AppShell>
  );
}

import type { MatchEvent } from "@/types";
import { EVENT_MAP } from "@/data/events";

export interface CoachFeedItem {
  id: string;
  tone: "positive" | "warning" | "insight";
  title: string;
  body: string;
}

interface Ctx {
  currentMinute: number;
  usPct: number;
  oppPct: number;
  koPct: number;
  conv: number;
}

export function buildCoachFeed(events: MatchEvent[], ctx: Ctx): CoachFeedItem[] {
  const feed: CoachFeedItem[] = [];

  // Rule: lost last three own kickouts
  const ownKickouts = events.filter(
    (e) => e.type === "kickout_won_clean" || e.type === "kickout_won_break" || e.type === "opp_kickout_won",
  );
  const lastThreeOwn = ownKickouts.slice(-3);
  if (lastThreeOwn.length === 3 && lastThreeOwn.every((e) => e.type === "opp_kickout_won")) {
    feed.push({
      id: "kickouts-lost",
      tone: "warning",
      title: "Lost last three kickouts",
      body: "Opposition are reading your restarts — vary the target or go long.",
    });
  }

  // Rule: 3 wides in last 10 minutes
  const recentWides = events.filter(
    (e) =>
      e.team === "us" &&
      (e.type === "wide" || e.type === "dropped_short") &&
      e.minute >= ctx.currentMinute - 10,
  );
  if (recentWides.length >= 3) {
    feed.push({
      id: "wides-recent",
      tone: "warning",
      title: `${recentWides.length} wides in the last 10 minutes`,
      body: "Review shot selection — take the extra pass when a better option is on.",
    });
  }

  // Rule: 4 consecutive attacks without a shot (approx: 4 turnovers won or kickouts won with no shot after)
  const attackMarkers = events.filter(
    (e) =>
      e.team === "us" &&
      (e.type === "turnover_won" ||
        e.type === "kickout_won_clean" ||
        e.type === "kickout_won_break"),
  );
  let streak = 0;
  for (const attack of attackMarkers.slice(-6)) {
    const shotAfter = events.find(
      (e) => e.timestamp > attack.timestamp && e.team === "us" && e.category === "shooting",
    );
    if (!shotAfter) streak += 1;
    else streak = 0;
  }
  if (streak >= 4) {
    feed.push({
      id: "no-shots",
      tone: "warning",
      title: "Four attacks without a shot",
      body: "Work the ball into scoring positions — a shot is better than a turnover.",
    });
  }

  // Rule: opposition winning midfield (kickout %)
  if (ownKickouts.length >= 4 && ctx.koPct < 40) {
    feed.push({
      id: "midfield-losing",
      tone: "warning",
      title: "Opposition winning midfield",
      body: `Kickout retention at ${ctx.koPct}%. Try a different target or a short restart.`,
    });
  }

  // Rule: shot conversion improving (compare last 5 shots vs prior)
  const shots = events.filter((e) => e.team === "us" && e.category === "shooting");
  if (shots.length >= 8) {
    const last5 = shots.slice(-5);
    const prior = shots.slice(0, -5);
    const last5Conv = last5.filter((e) => EVENT_MAP[e.type]?.score).length / last5.length;
    const priorConv = prior.filter((e) => EVENT_MAP[e.type]?.score).length / prior.length;
    if (last5Conv - priorConv >= 0.2) {
      feed.push({
        id: "conv-up",
        tone: "positive",
        title: "Shot conversion improving",
        body: `Last 5 shots at ${Math.round(last5Conv * 100)}% — keep taking the same shots.`,
      });
    }
  }

  // Rule: controlling / losing possession
  if (ctx.usPct >= 60) {
    feed.push({
      id: "poss-strong",
      tone: "positive",
      title: "Controlling possession",
      body: `Ardboe ${ctx.usPct}% · Opposition ${ctx.oppPct}%. Keep the tempo high.`,
    });
  } else if (ctx.oppPct >= 60) {
    feed.push({
      id: "poss-weak",
      tone: "warning",
      title: "Opposition dominating possession",
      body: `Ardboe ${ctx.usPct}% · Opposition ${ctx.oppPct}%. Press higher and force mistakes.`,
    });
  }

  return feed;
}
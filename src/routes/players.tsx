import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";

import { Input } from "@/components/ui/input";
import { useMatch } from "@/lib/match-store";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/players")({
  head: () => ({
    meta: [
      { title: "Squad · Sideline IQ" },
      { name: "description", content: "Your panel — names, numbers, preferred positions and season stats." },
    ],
  }),
  component: Players,
});

const POSITION_LABEL: Record<string, string> = {
  GK: "Goalkeeper",
  FB: "Full Back",
  CB: "Corner Back",
  HB: "Half Back",
  MF: "Midfield",
  HF: "Half Forward",
  CF: "Centre Forward",
  FF: "Full Forward",
};

function Players() {
  const { roster } = useMatch();
  const [q, setQ] = useState("");
  const filtered = roster.filter(
    (p) => p.name.toLowerCase().includes(q.toLowerCase()) || String(p.number).includes(q),
  );

  return (
    <AppShell title="Squad" subtitle="Panel · 20 players" back="/" contentClassName="px-4 py-4">
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name or number"
          className="h-12 rounded-xl pl-9"
        />
      </div>
      <ul className="space-y-2">
        {filtered.map((p) => (
          <li
            key={p.id}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-elegant"
          >
            <span
              className={cn(
                "grid h-12 w-12 shrink-0 place-items-center rounded-full text-base font-bold",
                p.isCaptain
                  ? "bg-accent text-accent-foreground shadow-glow-accent"
                  : "bg-primary text-primary-foreground",
              )}
            >
              {p.number}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {p.name}
                {p.isCaptain ? (
                  <span className="ml-1 text-[10px] font-bold text-accent">(C)</span>
                ) : null}
              </p>
              <p className="text-xs text-muted-foreground">{POSITION_LABEL[p.position]}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold tabular-nums text-foreground">
                {["0-05", "1-02", "0-11", "0-00", "0-01", "0-00", "2-08", "0-04"][p.number % 8]}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                season
              </p>
            </div>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
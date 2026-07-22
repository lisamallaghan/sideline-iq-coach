import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { SectionCard } from "@/components/SectionCard";
import { useMatch } from "@/lib/match-store";
import {
  Bell,
  Cloud,
  Download,
  HelpCircle,
  Info,
  RefreshCw,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · Sideline IQ" },
      { name: "description", content: "Preferences, sync and account for Sideline IQ." },
    ],
  }),
  component: Settings,
});

function Settings() {
  const { clearMatch } = useMatch();
  return (
    <AppShell title="Settings" subtitle="Preferences" back="/" contentClassName="px-4 py-4 space-y-4">
      <section className="rounded-2xl border border-border bg-card p-4 shadow-elegant">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Coach
        </p>
        <p className="mt-1 text-lg font-semibold text-foreground">Grassroots Coach</p>
        <p className="text-xs text-muted-foreground">Sideline IQ · Free plan</p>
      </section>

      <section className="space-y-2">
        <SectionCard
          title="Notifications"
          description="Match reminders and insights"
          icon={<Bell className="h-6 w-6" />}
          onClick={() => toast("Notifications coming soon")}
        />
        <SectionCard
          title="Cloud sync"
          description="Back up matches to your account"
          icon={<Cloud className="h-6 w-6" />}
          onClick={() => toast("Sync will unlock when accounts are enabled")}
        />
        <SectionCard
          title="Export data"
          description="Download this season as CSV"
          icon={<Download className="h-6 w-6" />}
          onClick={() => toast("Export coming soon")}
        />
        <SectionCard
          title="Privacy"
          description="How your data is handled"
          icon={<Shield className="h-6 w-6" />}
          onClick={() => toast("Privacy details coming soon")}
        />
        <SectionCard
          title="Help & feedback"
          description="Talk to the Sideline IQ team"
          icon={<HelpCircle className="h-6 w-6" />}
          onClick={() => toast("We'd love your feedback")}
        />
        <SectionCard
          title="About"
          description="Version 1.0 · Built for coaches"
          icon={<Info className="h-6 w-6" />}
          onClick={() => toast("Sideline IQ — Coach smarter. Win more.")}
        />
      </section>

      <button
        type="button"
        onClick={() => {
          clearMatch();
          toast.success("Current match cleared");
        }}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 py-3 text-sm font-semibold text-destructive"
      >
        <RefreshCw className="h-4 w-4" /> Reset current match
      </button>
    </AppShell>
  );
}
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { EVENT_CATEGORIES } from "@/data/events";
import type { EventCategory, EventType, Player } from "@/types";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  ArrowLeft,
  Target,
  Send,
  Crosshair,
  Shield,
  AlertTriangle,
  XOctagon,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

const ICONS = { Target, Send, Crosshair, Shield, AlertTriangle, XOctagon, Sparkles } as const;

interface Props {
  player: Player | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecord: (playerId: string, category: EventCategory, type: EventType) => void;
}

export function PlayerEventSheet({ player, open, onOpenChange, onRecord }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | null>(null);

  const handleOpenChange = (o: boolean) => {
    if (!o) setSelectedCategory(null);
    onOpenChange(o);
  };

  const category = EVENT_CATEGORIES.find((c) => c.id === selectedCategory);

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="max-h-[85vh] rounded-t-3xl border-none p-0">
        {player ? (
          <div className="flex flex-col">
            <SheetHeader className="border-b border-border px-5 pb-4 pt-5">
              <div className="flex items-center gap-3">
                {selectedCategory ? (
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(null)}
                    className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-secondary-foreground"
                    aria-label="Back to categories"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                ) : (
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                    {player.number}
                  </span>
                )}
                <div className="min-w-0 flex-1 text-left">
                  <SheetTitle className="truncate text-left text-lg font-semibold">
                    {player.name}
                  </SheetTitle>
                  <p className="text-xs text-muted-foreground">
                    #{player.number} · {player.position}
                    {selectedCategory && category ? ` · ${category.label}` : ""}
                  </p>
                </div>
              </div>
            </SheetHeader>

            <div className="overflow-y-auto px-4 pb-8 pt-3">
              {!selectedCategory ? (
                <ul className="grid grid-cols-1 gap-2">
                  {EVENT_CATEGORIES.map((c) => {
                    const Icon = ICONS[c.icon as keyof typeof ICONS];
                    const toneClasses =
                      c.tone === "positive"
                        ? "bg-success/10 text-success"
                        : c.tone === "negative"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-accent/15 text-accent";
                    return (
                      <li key={c.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedCategory(c.id)}
                          className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left active:scale-[0.99]"
                        >
                          <span
                            className={cn(
                              "grid h-11 w-11 place-items-center rounded-xl",
                              toneClasses,
                            )}
                          >
                            <Icon className="h-5 w-5" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-foreground">{c.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {c.events.length} events
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <ul className="grid grid-cols-2 gap-2">
                  {category?.events.map((e) => (
                    <li key={e.type}>
                      <button
                        type="button"
                        onClick={() => {
                          onRecord(player.id, e.category, e.type);
                          toast.success(
                            `${e.label} · #${player.number} ${player.name.split(" ")[0]}`,
                          );
                          handleOpenChange(false);
                        }}
                        className={cn(
                          "h-20 w-full rounded-2xl border p-3 text-left text-sm font-semibold transition active:scale-[0.98]",
                          e.tone === "positive"
                            ? "border-success/25 bg-success/10 text-success"
                            : e.tone === "negative"
                              ? "border-destructive/25 bg-destructive/5 text-destructive"
                              : "border-border bg-card text-foreground",
                        )}
                      >
                        {e.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
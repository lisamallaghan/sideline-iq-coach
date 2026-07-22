import type { Player } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  player: Player;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  active?: boolean;
  tone?: "light" | "dark";
  compact?: boolean;
}

export function PlayerChip({ player, onClick, size = "md", active, tone = "dark", compact }: Props) {
  const sizes = {
    sm: "h-11 w-11 text-sm",
    md: "h-14 w-14 text-base",
    lg: "h-16 w-16 text-lg",
  } as const;
  const isLight = tone === "light";
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-w-0 flex-col items-center gap-1.5 focus:outline-none"
    >
      <span
        className={cn(
          "grid shrink-0 place-items-center rounded-full font-bold shadow-elegant ring-2 transition active:scale-95",
          sizes[size],
          isLight
            ? "bg-white text-primary ring-white/60"
            : "bg-primary text-primary-foreground ring-primary-glow/60",
          active && "ring-accent shadow-glow-accent",
        )}
      >
        {player.number}
      </span>
      {!compact && (
        <span
          className={cn(
            "max-w-[72px] truncate text-[11px] font-medium leading-tight",
            isLight ? "text-white/85" : "text-foreground/80",
          )}
        >
          {player.name.split(" ")[0]}
        </span>
      )}
    </button>
  );
}
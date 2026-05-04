import { Monitor, Moon, Sun } from "lucide-react";
import { Button, cn } from "@futuremod/ui";
import type { ColorSchemeMode } from "./color-scheme";
import { useTheme } from "./ThemeProvider";

const MODES: { value: ColorSchemeMode; label: string; icon: typeof Sun }[] = [
  { value: "dark", label: "Dark", icon: Moon },
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "System", icon: Monitor },
];

/**
 * Cycles Dark → Light → System. Tooltip-style title shows next mode for clarity.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { mode, setMode } = useTheme();
  const idx = Math.max(0, MODES.findIndex((m) => m.value === mode));
  const next = MODES[(idx + 1) % MODES.length]!;
  const CurrentIcon = MODES[idx]?.icon ?? Moon;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className={cn("shrink-0 text-muted-foreground", className)}
      aria-label={`Theme: ${MODES[idx]?.label ?? "Dark"}. Press for ${next.label}.`}
      title={`Theme: ${MODES[idx]?.label} · Next: ${next.label}`}
      onClick={() => setMode(next.value)}
    >
      <CurrentIcon className="size-4" aria-hidden />
    </Button>
  );
}

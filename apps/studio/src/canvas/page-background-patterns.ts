import type { CSSProperties } from "react";

/** Presets using only `repeating-linear-gradient` (plus theme base), tuned to stay subtle. */
export type PagePatternId =
  | "none"
  | "diagonal-hairline"
  | "horizontal-rules"
  | "vertical-rules"
  | "grid"
  | "dense-grid"
  | "cross-diagonal"
  | "journal";

export const PAGE_PATTERN_FIELD_OPTIONS: { value: PagePatternId; label: string }[] = [
  { value: "none", label: "None (theme solid)" },
  { value: "diagonal-hairline", label: "Fine diagonal lines" },
  { value: "horizontal-rules", label: "Horizontal rules" },
  { value: "vertical-rules", label: "Vertical rules" },
  { value: "grid", label: "Square grid" },
  { value: "dense-grid", label: "Fine square grid" },
  { value: "cross-diagonal", label: "Diagonal weave" },
  { value: "journal", label: "Journal (ruled paper + margin)" },
];

function normalizeHex(input: string | undefined, fallback: string): string {
  const s = (input ?? "").trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(s)) return s;
  if (/^[0-9A-Fa-f]{6}$/.test(s)) return `#${s}`;
  return fallback;
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const n = parseInt(h, 16);
  if (Number.isNaN(n) || h.length !== 6) {
    return `rgba(100, 116, 139, ${alpha})`;
  }
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Tailwind classes used by Puck page root — keep in sync with `puck-config` width/padding options. */
const TW_MAX_WIDTH: Record<string, string> = {
  "max-w-sm": "24rem",
  "max-w-2xl": "42rem",
  "max-w-4xl": "56rem",
  "max-w-full": "100%",
};

const TW_PADDING_X: Record<string, string> = {
  "px-4": "1rem",
  "px-6": "1.5rem",
  "px-10": "2.5rem",
};

export type PageRootLayout = {
  maxWidthClass: string;
  paddingXClass: string;
};

function resolveRootLayout(layout?: PageRootLayout): { W: string; pad: string } {
  const mw = layout?.maxWidthClass ?? "max-w-2xl";
  const px = layout?.paddingXClass ?? "px-6";
  return {
    W: TW_MAX_WIDTH[mw] ?? "42rem",
    pad: TW_PADDING_X[px] ?? "1.5rem",
  };
}

/** Single-pixel vertical rule at x = calc(positionExpr). `positionExpr` is the body inside `calc(...)`. */
function verticalHairline(positionExpr: string, color: string): string {
  return [
    `linear-gradient(90deg,`,
    `transparent 0px,`,
    `transparent calc(${positionExpr} - 1px),`,
    `${color} calc(${positionExpr} - 1px),`,
    `${color} calc(${positionExpr}),`,
    `transparent calc(${positionExpr}))`,
  ].join(" ");
}

/**
 * Full-page surface behind Puck content. Uses theme `--background` as base so dark/light stay coherent.
 */
export function buildPageRootSurfaceStyle(
  pattern: PagePatternId | string | undefined,
  colorA: string | undefined,
  colorB: string | undefined,
  layout?: PageRootLayout
): CSSProperties {
  const a = normalizeHex(colorA, "#64748b");
  const b = normalizeHex(colorB, "#94a3b8");
  const A = (opacity: number) => hexToRgba(a, opacity);
  const B = (opacity: number) => hexToRgba(b, opacity);

  const base: CSSProperties = {
    backgroundColor: "hsl(var(--background))",
  };

  const id = (pattern ?? "none") as PagePatternId;

  switch (id) {
    case "none":
      return base;
    case "diagonal-hairline":
      return {
        ...base,
        backgroundImage: `repeating-linear-gradient(135deg, ${A(0.075)} 0px, ${A(0.075)} 1px, transparent 1px, transparent 16px)`,
      };
    case "horizontal-rules":
      return {
        ...base,
        backgroundImage: `repeating-linear-gradient(0deg, ${A(0.085)} 0px, ${A(0.085)} 1px, transparent 1px, transparent 20px)`,
      };
    case "vertical-rules":
      return {
        ...base,
        backgroundImage: `repeating-linear-gradient(90deg, ${B(0.085)} 0px, ${B(0.085)} 1px, transparent 1px, transparent 20px)`,
      };
    case "grid":
      return {
        ...base,
        backgroundImage: [
          `repeating-linear-gradient(0deg, ${A(0.065)} 0px, ${A(0.065)} 1px, transparent 1px, transparent 24px)`,
          `repeating-linear-gradient(90deg, ${B(0.065)} 0px, ${B(0.065)} 1px, transparent 1px, transparent 24px)`,
        ].join(", "),
      };
    case "dense-grid":
      return {
        ...base,
        backgroundImage: [
          `repeating-linear-gradient(0deg, ${A(0.07)} 0px, ${A(0.07)} 1px, transparent 1px, transparent 12px)`,
          `repeating-linear-gradient(90deg, ${B(0.07)} 0px, ${B(0.07)} 1px, transparent 1px, transparent 12px)`,
        ].join(", "),
      };
    case "cross-diagonal":
      return {
        ...base,
        backgroundImage: [
          `repeating-linear-gradient(45deg, ${A(0.055)} 0px, ${A(0.055)} 1px, transparent 1px, transparent 22px)`,
          `repeating-linear-gradient(-45deg, ${B(0.055)} 0px, ${B(0.055)} 1px, transparent 1px, transparent 22px)`,
        ].join(", "),
      };
    case "journal": {
      const { W, pad } = resolveRootLayout(layout);
      // Centered column edges + padded content band (matches Puck root inner wrapper).
      const boxL = `(100vw - min(100vw, ${W})) / 2`;
      const boxR = `(100vw - min(100vw, ${W})) / 2 + min(100vw, ${W})`;
      const innerL = `(100vw - min(100vw, ${W})) / 2 + ${pad} - 10px`;
      const innerR = `(100vw - min(100vw, ${W})) / 2 + min(100vw, ${W}) - ${pad} + 10px`;
      // Just outside the writing band — faint bracket ticks.
      const bracketL = `(100vw - min(100vw, ${W})) / 2 + ${pad} - 10px`;
      const bracketR = `(100vw - min(100vw, ${W})) / 2 + min(100vw, ${W}) - ${pad} + 10px`;

      const rule = A(0.26);
      const wash = A(0.06);
      // Top-to-bottom order = front-most first: accents over faded brackets over rules over wash.
      return {
        ...base,
        backgroundImage: [
          verticalHairline(innerR, B(0.36)),
          verticalHairline(innerL, A(0.3)),
          verticalHairline(bracketR, B(0.14)),
          verticalHairline(bracketL, A(0.14)),
          verticalHairline(boxR, B(0.1)),
          verticalHairline(boxL, B(0.12)),
          `repeating-linear-gradient(to bottom, ${rule} 0px, ${rule} 1px, transparent 1px, transparent 28px)`,
          `linear-gradient(180deg, ${wash} 0%, transparent 42%)`,
        ].join(", "),
      };
    }
    default:
      return base;
  }
}

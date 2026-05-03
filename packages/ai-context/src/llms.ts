import { items } from "./registry.js";
import type { RegistryItem } from "./types.js";

function renderPropTable(props: RegistryItem["props"]): string {
  if (!props.length) return "";
  const rows = props.map(
    (p) =>
      `| \`${p.name}\` | \`${p.type}\` | ${p.default ?? "-"} | ${p.required ? "yes" : "no"} | ${p.description} |`
  );
  return [
    "| prop | type | default | required | description |",
    "|------|------|---------|----------|-------------|",
    ...rows,
  ].join("\n");
}

/** Compact index — one line per component. Use as system-prompt context. */
export function generateLlmsTxt(): string {
  const lines = [
    "# @futuremod/ui",
    "Tailwind + shadcn component library. Dark/light theme. Cyan primary, red accent. Geist font.",
    "",
    "## Components",
    ...items.map((item) => `- **${item.title}** (\`${item.name}\`): ${item.description} — \`${item.import}\``),
    "",
    "## Usage",
    "1. Install: `pnpm add @futuremod/ui`",
    "2. Import globals: `import '@futuremod/ui/styles'`",
    "3. Use components directly — all props are typed.",
  ];
  return lines.join("\n");
}

/** Full docs — prop tables + examples. Use when building new pages. */
export function generateLlmsFullTxt(): string {
  const sections = items.map((item) => {
    const variantLine = item.variants?.length
      ? `**Variants:** ${item.variants.map((v) => `\`${v}\``).join(", ")}`
      : "";
    return [
      `## ${item.title}`,
      `> ${item.description}`,
      ``,
      `\`\`\`ts`,
      item.import,
      `\`\`\``,
      "",
      ...(item.props.length ? ["### Props", renderPropTable(item.props), ""] : []),
      ...(variantLine ? [variantLine, ""] : []),
      "### Example",
      "```tsx",
      item.example,
      "```",
    ].join("\n");
  });

  return [
    "# @futuremod/ui — Full Component Reference",
    "",
    "**Design system:** Cyan primary · Red accent · Geist font · Dark/light · Glassmorphic surfaces",
    "**Tailwind config:** extend CSS vars from `@futuremod/ui/styles`",
    "",
    ...sections,
  ].join("\n\n");
}
# FutureMod

> AI-native React component library. Tailwind + shadcn registry pattern. Cyan primary · Red accent · Geist font · Dark/light mode · Glassmorphic surfaces.

## Packages

- [@futuremod/ui](packages/ui) — React components
- [@futuremod/ai-context](packages/ai-context) — Registry metadata, llms.txt generator
- [@futuremod/mcp-server](packages/mcp-server) — MCP server for AI agents

## Quick start

```bash
pnpm add @futuremod/ui
import '@futuremod/ui/styles';
import { Button, Card, DashboardShell } from '@futuremod/ui';
```

## MCP

```json
{
  "mcpServers": {
    "futuremod": { "command": "npx", "args": ["@futuremod/mcp-server"] }
  }
}
```

## Components

- Button, Card, Badge, Input, Select, Textarea, Avatar, Spinner
- Table, StatCard, Alert, Tabs, FormField, Label, Separator, Skeleton
- PageLayout, Sidebar, Header, DashboardShell, EmptyState

## Design Tokens

| Token       | Light              | Dark               |
|-------------|--------------------|--------------------|
| Primary (cyan) | hsl(189 94% 36%) | hsl(189 94% 46%) |
| Accent (red)  | hsl(0 84% 60%)   | hsl(0 84% 62%)   |
| Background   | hsl(0 0% 98%)    | hsl(220 14% 6%)  |
| Radius       | 10px              | 10px              |
#!/usr/bin/env node
/**
 * Futuremod MCP Server
 *
 * Exposes the @futuremod/ui registry as MCP tools so AI agents can
 * query components by name, search by capability, and get full specs
 * without token-bloating the system prompt.
 *
 * Protocol: JSON-RPC 2.0 over stdio (MCP spec v0.1)
 *
 * Tools:
 *   list_components     — index of all components (name + description)
 *   get_component       — full spec for a single component
 *   search_components   — fuzzy search by keyword
 *   get_llms_txt        — compact context string for system prompts
 *   get_llms_full_txt   — full reference for page-building tasks
 */

import { registry, items, getItem, generateLlmsTxt, generateLlmsFullTxt } from "@futuremod/ai-context";

// ── MCP types (minimal, no external dependency) ───────────────

interface McpRequest {
  jsonrpc: "2.0";
  id: number | string;
  method: string;
  params?: Record<string, unknown>;
}

interface McpResponse {
  jsonrpc: "2.0";
  id: number | string | null;
  result?: unknown;
  error?: { code: number; message: string };
}

interface McpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

// ── Tool definitions ──────────────────────────────────────────

const tools: McpTool[] = [
  {
    name: "list_components",
    description: "List all available components with name and description.",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "get_component",
    description: "Get full spec (props, variants, example) for a component by name.",
    inputSchema: {
      type: "object",
      properties: { name: { type: "string", description: "Component name e.g. 'button'" } },
      required: ["name"],
    },
  },
  {
    name: "search_components",
    description: "Search components by keyword (name, description, or type).",
    inputSchema: {
      type: "object",
      properties: { query: { type: "string", description: "Search keyword" } },
      required: ["query"],
    },
  },
  {
    name: "get_llms_txt",
    description: "Compact component index — use as system-prompt context.",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "get_llms_full_txt",
    description: "Full component reference with prop tables and examples.",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
];

// ── Handlers ──────────────────────────────────────────────────

function handleTool(name: string, params: Record<string, unknown>): unknown {
  switch (name) {
    case "list_components":
      return { components: registry.items };

    case "get_component": {
      const item = getItem(params.name as string);
      if (!item) return { error: `Component '${params.name}' not found.` };
      return item;
    }

    case "search_components": {
      const q = (params.query as string).toLowerCase();
      const results = items.filter(
        (item) =>
          item.name.includes(q) ||
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.type.includes(q)
      );
      return { components: results.map(({ name, type, title, description }) => ({ name, type, title, description })) };
    }

    case "get_llms_txt":
      return { text: generateLlmsTxt() };

    case "get_llms_full_txt":
      return { text: generateLlmsFullTxt() };

    default:
      throw { code: -32601, message: `Unknown tool: ${name}` };
  }
}

// ── JSON-RPC stdio loop ───────────────────────────────────────

function send(response: McpResponse) {
  process.stdout.write(JSON.stringify(response) + "\n");
}

let buffer = "";

process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk: string) => {
  buffer += chunk;
  const lines = buffer.split("\n");
  buffer = lines.pop() ?? "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let req: McpRequest;
    try {
      req = JSON.parse(trimmed) as McpRequest;
    } catch {
      send({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } });
      continue;
    }

    if (req.method === "initialize") {
      send({
        jsonrpc: "2.0",
        id: req.id,
        result: {
          protocolVersion: "2024-11-05",
          serverInfo: { name: "futuremod", version: "0.1.0" },
          capabilities: { tools: {} },
        },
      });
      continue;
    }

    if (req.method === "tools/list") {
      send({ jsonrpc: "2.0", id: req.id, result: { tools } });
      continue;
    }

    if (req.method === "tools/call") {
      const { name, arguments: args = {} } = req.params as { name: string; arguments?: Record<string, unknown> };
      try {
        const result = handleTool(name, args);
        send({ jsonrpc: "2.0", id: req.id, result: { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] } });
      } catch (err: unknown) {
        const e = err as { code: number; message: string };
        send({ jsonrpc: "2.0", id: req.id, error: { code: e.code ?? -32603, message: e.message ?? "Internal error" } });
      }
      continue;
    }

    send({ jsonrpc: "2.0", id: req.id, error: { code: -32601, message: "Method not found" } });
  }
});

process.stdin.on("end", () => process.exit(0));
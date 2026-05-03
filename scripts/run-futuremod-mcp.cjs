#!/usr/bin/env node
/**
 * Cursor MCP launcher: ensures @futuremod/mcp-server is built, then runs it with stdio
 * forwarded (required for MCP over stdin/stdout).
 */
const { execFileSync, spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const dist = path.join(root, "packages", "mcp-server", "dist", "server.js");

if (!fs.existsSync(dist)) {
  execFileSync("pnpm", ["--filter", "@futuremod/mcp-server", "build"], {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });
}

const child = spawn(process.execPath, [dist], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.exitCode = 1;
    return;
  }
  process.exit(code ?? 1);
});

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Render } from "@measured/puck";
import "@measured/puck/puck.css";
import { DataStudioProvider } from "./data/DataStudioContext";
import { puckConfig } from "./canvas/puck-config";
import { isStandaloneProjectHost } from "./lib/host-mode";
import { AppRoutes } from "./routes/AppRoutes";
import { StandaloneStudioApp } from "./StandaloneStudioApp";
import "./index.css";

declare global {
  interface Window {
    // The worker injects this as a JS object literal (not a JSON string),
    // so it is already parsed by the time this script runs — no JSON.parse needed.
    __PAGE_DATA__?: unknown;
  }
}

const root = createRoot(document.getElementById("root")!);

if (window.__PAGE_DATA__) {
  // ── View mode: render a published page ──────────────────────────────────
  // The worker injected __PAGE_DATA__ as a raw JS value via script tag, so
  // it is already an object — calling JSON.parse on it would stringify to
  // "[object Object]" and fail.
  const data = window.__PAGE_DATA__;
  root.render(
    <StrictMode>
      <DataStudioProvider>
        <Render config={puckConfig} data={data} />
      </DataStudioProvider>
    </StrictMode>
  );
} else if (isStandaloneProjectHost(window.location.hostname)) {
  // ── Legacy: direct Puck editor on customer project subdomain (no KV data) ─
  root.render(
    <StrictMode>
      <DataStudioProvider>
        <StandaloneStudioApp />
      </DataStudioProvider>
    </StrictMode>
  );
} else {
  // ── Dashboard: login → projects → editor / preview (BrowserRouter tree) ───
  root.render(
    <StrictMode>
      <AppRoutes />
    </StrictMode>
  );
}

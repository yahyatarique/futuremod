import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Render } from "@measured/puck";
import "@measured/puck/puck.css";
import { DataStudioProvider } from "./data/DataStudioContext";
import { puckConfig } from "./canvas/puck-config";
import App from "./App";
import "./index.css";

declare global {
  interface Window {
    __PAGE_DATA__?: string;
  }
}

const root = createRoot(document.getElementById("root")!);

if (window.__PAGE_DATA__) {
  // ── View mode: render a published page ──────────────────────────────────
  // The worker injected __PAGE_DATA__ because this request came from a
  // project subdomain. Render the Puck layout without the editor chrome.
  const data = JSON.parse(window.__PAGE_DATA__);
  root.render(
    <StrictMode>
      <DataStudioProvider>
        <Render config={puckConfig} data={data} />
      </DataStudioProvider>
    </StrictMode>
  );
} else {
  // ── Edit mode: full studio editor ───────────────────────────────────────
  root.render(
    <StrictMode>
      <DataStudioProvider>
        <App />
      </DataStudioProvider>
    </StrictMode>
  );
}

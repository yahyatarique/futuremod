import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { DataStudioProvider } from "./data/DataStudioContext";
import App from "./App";
import "./index.css";
import "tldraw/tldraw.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DataStudioProvider>
      <App />
    </DataStudioProvider>
  </StrictMode>
);

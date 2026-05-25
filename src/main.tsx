// src/main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// ⬇ GLOBAL LOADER CONTEXT + COMPONENT
import { LoadingProvider } from "../src/context/LoadingContext";
import GlobalLoader from "../src/component/GlobalLoader/GlobalLoader";
import { installFetchContext } from "./utils/installFetchContext";

// Global Styles
import "./global.css";

installFetchContext();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LoadingProvider>
      {/* Loader always mounted globally */}
      <GlobalLoader />

      {/* Main App */}
      <App />
    </LoadingProvider>
  </React.StrictMode>
);

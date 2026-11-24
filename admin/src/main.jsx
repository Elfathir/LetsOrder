import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { applyDocumentTheme, installThemeTokens, readStoredTheme } from "./utils/theme.js";
import "./index.css";

installThemeTokens();
applyDocumentTheme(readStoredTheme());

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

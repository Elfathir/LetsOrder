import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { applyDocumentTheme, readStoredTheme } from "./utils/theme.js";
import "./index.css";

applyDocumentTheme(readStoredTheme());

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

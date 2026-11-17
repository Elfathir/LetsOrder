import React from "react";
import ReactDOM from "react-dom/client";
import App, { applyDocumentTheme } from "./App.jsx";
import "./index.css";

try {
  const savedTheme = localStorage.getItem("letsorder_theme");
  applyDocumentTheme(savedTheme === "dark" ? "dark" : "light");
} catch {
  applyDocumentTheme("light");
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

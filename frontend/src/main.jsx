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

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error?.message || "Unexpected interface error",
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            backgroundColor: "var(--bg-auth-page, #FAF6F2)",
            color: "var(--maroon, #522A28)",
            fontFamily: "var(--font-main, system-ui, sans-serif)",
            textAlign: "center",
            gap: 14,
          }}
        >
          <h2 style={{ fontSize: 22, fontWeight: 900 }}>Terjadi gangguan tampilan</h2>
          <p style={{ fontSize: 14, maxWidth: 420, color: "var(--text-muted, #8A7875)" }}>
            Muat ulang halaman untuk memulihkan tampilan aplikasi.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              padding: "12px 24px",
              borderRadius: 999,
              border: "none",
              backgroundColor: "var(--orange, #F8A34B)",
              color: "#522A28",
              fontSize: 14,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Muat Ulang Halaman
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </React.StrictMode>
);

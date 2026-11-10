import { useEffect, useState } from "react";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api"
).replace(/\/$/, "");

export default function App() {
  const [apiStatus, setApiStatus] = useState("checking");

  useEffect(() => {
    const controller = new AbortController();

    async function checkApi() {
      try {
        const response = await fetch(`${API_BASE_URL}/health`, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        setApiStatus("connected");
      } catch (error) {
        if (error.name !== "AbortError") {
          setApiStatus("unavailable");
        }
      }
    }

    checkApi();
    return () => controller.abort();
  }, []);

  const statusText = {
    checking: "Memeriksa koneksi backend...",
    connected: "Backend dapat diakses",
    unavailable: "Backend belum dapat dihubungi",
  }[apiStatus];

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <a href="/" style={styles.brand} aria-label="LetsOrder.com beranda">
          LetsOrder<span style={styles.brandAccent}>.com</span>
        </a>
        <span style={styles.tag}>Kantin UPNVJ</span>
      </header>

      <section style={styles.hero}>
        <p style={styles.eyebrow}>PEMESANAN MAKANAN DIGITAL</p>
        <h1 style={styles.title}>
          Pesan lebih awal,
          <br />
          ambil tanpa antre panjang.
        </h1>
        <p style={styles.description}>
          LetsOrder.com membantu Customer memesan makanan dan minuman dari
          tenant kantin, memantau status pesanan, lalu mengambilnya langsung
          di tenant.
        </p>

        <div style={styles.notice}>
          <strong>Self-pickup</strong>
          <span>
            Pesanan diambil langsung di tenant menggunakan nomor antrean.
          </span>
        </div>

        <div style={styles.status} role="status" aria-live="polite">
          <span
            style={{
              ...styles.statusDot,
              background:
                apiStatus === "connected"
                  ? "#15803d"
                  : apiStatus === "unavailable"
                    ? "#b45309"
                    : "#64748b",
            }}
          />
          {statusText}
        </div>
      </section>

      <section style={styles.features} aria-label="Alur penggunaan">
        <article style={styles.card}>
          <span style={styles.number}>01</span>
          <h2>Lihat menu</h2>
          <p>Jelajahi kategori dan menu dari tenant yang tersedia.</p>
        </article>
        <article style={styles.card}>
          <span style={styles.number}>02</span>
          <h2>Buat pesanan</h2>
          <p>Pilih menu, periksa keranjang, lalu buat pesanan.</p>
        </article>
        <article style={styles.card}>
          <span style={styles.number}>03</span>
          <h2>Ambil pesanan</h2>
          <p>Pantau status dan gunakan nomor antrean saat mengambil pesanan.</p>
        </article>
      </section>

      <footer style={styles.footer}>
        <p>
          Pembayaran QRIS/dompet digital pada proyek ini hanya berupa simulasi,
          bukan transaksi pembayaran nyata.
        </p>
        <small>© {new Date().getFullYear()} LetsOrder.com</small>
      </footer>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "0 7vw 48px",
    color: "#172033",
    background: "#f7f8fc",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  header: {
    minHeight: 76,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid #e5e7eb",
  },
  brand: {
    color: "#172033",
    fontSize: 23,
    fontWeight: 800,
    letterSpacing: "-1px",
    textDecoration: "none",
  },
  brandAccent: { color: "#2563eb" },
  tag: {
    color: "#475569",
    background: "#e9eefb",
    padding: "7px 12px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 600,
  },
  hero: { maxWidth: 760, padding: "76px 0 48px" },
  eyebrow: {
    color: "#2563eb",
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: "1.8px",
  },
  title: {
    margin: "16px 0",
    fontSize: "clamp(38px, 6vw, 64px)",
    lineHeight: 1.08,
    letterSpacing: "-2.5px",
  },
  description: {
    maxWidth: 650,
    color: "#526078",
    fontSize: 17,
    lineHeight: 1.8,
  },
  notice: {
    display: "grid",
    gap: 5,
    maxWidth: 540,
    marginTop: 28,
    padding: 18,
    background: "#ffffff",
    border: "1px solid #e5eaf3",
    borderRadius: 14,
    lineHeight: 1.6,
  },
  status: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    marginTop: 24,
    color: "#475569",
    fontSize: 14,
  },
  statusDot: { width: 9, height: 9, borderRadius: "50%" },
  features: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: 16,
  },
  card: {
    padding: 22,
    background: "#ffffff",
    border: "1px solid #e5eaf3",
    borderRadius: 16,
  },
  number: { color: "#2563eb", fontSize: 13, fontWeight: 800 },
  footer: {
    marginTop: 48,
    paddingTop: 20,
    borderTop: "1px solid #e5e7eb",
    color: "#64748b",
    fontSize: 13,
    lineHeight: 1.7,
  },
};

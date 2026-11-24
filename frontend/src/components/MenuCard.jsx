import { Clock, Heart, Plus, Star, Store, TrendingUp } from "lucide-react";
import { LAYOUT } from "../utils/layout.js";
import { formatRupiah } from "../utils/format.js";
import { SafeImage } from "../utils/media.jsx";

// Kartu menu katalog customer. Dipakai di beranda ("Menu populer") dan di
// halaman "Semua menu", supaya tampilannya persis sama di kedua tempat.
export default function MenuCard({
  item,
  lang = "ID",
  isOpen = true,
  isFavorite = false,
  tenantOpenTime = "07:00",
  showSoldCount = false,
  onOpenDetail,
  onToggleFavorite,
  onOpenTenant,
}) {
  const isEn = lang === "EN";
  const soldCount = Number(item.sold_total ?? item.sold_today ?? 0);

  return (
    <div
      className="card-hover img-zoom-parent"
      style={{
        borderRadius: "var(--radius-lg)",
        backgroundColor: "var(--bg-card)",
        border: isOpen ? "1px solid var(--border-light)" : "1px solid #FCA5A5",
        overflow: "hidden",
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        onClick={onOpenDetail}
        style={{
          position: "relative",
          height: 190,
          backgroundColor: "var(--bg-warm-img)",
          cursor: "pointer",
          overflow: "hidden",
        }}
      >
        <SafeImage
          src={item.gambar}
          alt={item.nama_menu}
          className="img-zoom-child"
          focusX={item.foto_x}
          focusY={item.foto_y}
          zoom={item.foto_zoom}
          style={{ filter: isOpen ? "none" : "grayscale(0.28) brightness(0.9)" }}
          iconSize={36}
        />
        {!isOpen && (
          <div
            style={{
              position: "absolute",
              bottom: 10,
              left: 10,
              padding: "4px 10px",
              borderRadius: "var(--radius-pill)",
              backgroundColor: "rgba(220, 38, 38, 0.94)",
              color: "#FFFFFF",
              fontSize: 11,
              fontWeight: 800,
              ...LAYOUT.inlineRow,
              gap: 5,
              boxShadow: "0 2px 8px rgba(220, 38, 38, 0.35)",
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#FFFFFF" }} />
            <span>
              {isEn ? `Tenant Closed · Opens ${tenantOpenTime}` : `Tenant Tutup · Buka ${tenantOpenTime}`}
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleFavorite?.();
          }}
          aria-label={isEn ? "Toggle favorite" : "Tandai favorit"}
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            width: 30,
            height: 30,
            borderRadius: "50%",
            border: "none",
            backgroundColor: "var(--bg-overlay-glass)",
            ...LAYOUT.center,
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
          }}
        >
          <Heart
            size={14}
            color={isFavorite ? "#C84336" : "var(--maroon)"}
            fill={isFavorite ? "#C84336" : "none"}
          />
        </button>
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            padding: "4px 8px",
            borderRadius: "var(--radius-pill)",
            backgroundColor: "var(--bg-card)",
            ...LAYOUT.row,
            gap: 4,
            fontSize: 12,
            fontWeight: 700,
            color: "var(--maroon)",
            boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
          }}
        >
          <Star size={12} fill="#F8A34B" color="#F8A34B" />
          <span>{item.rating || (isEn ? "New" : "Baru")}</span>
        </div>
      </div>
      <div
        style={{
          padding: "16px 18px",
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          justifyContent: "space-between",
        }}
      >
        <div>
          <h3
            onClick={onOpenDetail}
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: "var(--maroon)",
              marginBottom: 4,
              cursor: "pointer",
            }}
          >
            {item.nama_menu}
          </h3>
          <div
            style={{
              ...LAYOUT.row,
              gap: 6,
              fontSize: 12,
              color: "var(--text-muted)",
              marginBottom: 14,
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onOpenTenant?.();
              }}
              style={{
                border: "none",
                background: "transparent",
                padding: 0,
                margin: 0,
                fontSize: 12,
                fontWeight: 700,
                color: "var(--maroon)",
                cursor: "pointer",
                ...LAYOUT.inlineRow,
                gap: 4,
                textDecoration: "underline",
                textUnderlineOffset: 2,
              }}
              title={isEn ? `Go to ${item.tenant_name}` : `Ke menu ${item.tenant_name}`}
            >
              <Store size={12} color="var(--orange-dark)" />
              <span>{item.tenant_name}</span>
            </button>
            {!isOpen && (
              <span
                style={{
                  padding: "1px 6px",
                  borderRadius: 999,
                  backgroundColor: "#FEE2E2",
                  color: "#B91C1C",
                  fontSize: 10.5,
                  fontWeight: 800,
                }}
              >
                {isEn ? "Closed" : "Tutup"}
              </span>
            )}
            <span>·</span>
            <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <Clock size={12} />
              {item.estimasi_menit} min
            </span>
            {showSoldCount && (
              <>
                <span>·</span>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    fontWeight: 700,
                    color: "var(--orange-tag)",
                  }}
                >
                  <TrendingUp size={12} />
                  {soldCount} {isEn ? "sold" : "terjual"}
                </span>
              </>
            )}
          </div>
        </div>
        <div
          style={{
            ...LAYOUT.between,
            paddingTop: 10,
            borderTop: "1px solid var(--border-light)",
          }}
        >
          <div
            className="tabular"
            style={{ fontSize: 17, fontWeight: 800, color: "var(--maroon)" }}
          >
            {formatRupiah(item.harga)}
          </div>
          <button
            onClick={onOpenDetail}
            className="btn-interactive"
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "none",
              backgroundColor: isOpen ? "var(--orange)" : "#9CA3AF",
              color: "#FFFFFF",
              ...LAYOUT.center,
              cursor: "pointer",
              boxShadow: isOpen ? "0 3px 8px rgba(248, 163, 75, 0.4)" : "none",
            }}
            title={isEn ? "View menu & add" : "Lihat menu & pesan"}
          >
            <Plus size={18} strokeWidth={2.6} />
          </button>
        </div>
      </div>
    </div>
  );
}

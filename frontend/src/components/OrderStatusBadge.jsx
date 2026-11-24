import { LAYOUT } from "../utils/layout.js";
import {
  isCancelledStatus,
  isCompletedStatus,
  isInProgressStatus,
  isReadyStatus,
  statusLabel,
} from "../utils/orderStatus.js";

// Badge status pesanan. Ada dua palet karena riwayat tenant dan riwayat
// customer memang dirancang berbeda; `variant` menjaga perbedaan itu tetap
// persis seperti sebelumnya.
const TONES = {
  customer: (status) => {
    if (isCompletedStatus(status)) {
      return { backgroundColor: "var(--maroon)", color: "#FFFFFF" };
    }
    if (isCancelledStatus(status)) {
      return {
        backgroundColor: "var(--status-cancelled-bg)",
        color: "var(--text-muted)",
      };
    }
    if (isReadyStatus(status)) {
      return { backgroundColor: "var(--orange)", color: "var(--maroon)" };
    }
    return {
      backgroundColor: "var(--status-preparing-bg)",
      color: "var(--status-preparing-text)",
    };
  },
  tenant: (status) => {
    if (isCompletedStatus(status)) {
      return {
        backgroundColor: "var(--btn-solid-bg)",
        color: "var(--btn-solid-text)",
      };
    }
    if (isInProgressStatus(status)) {
      return { backgroundColor: "var(--bg-cream)", color: "var(--maroon)" };
    }
    return {
      backgroundColor: "var(--status-cancelled-bg)",
      color: "var(--text-muted)",
    };
  },
};

const VARIANTS = {
  customer: { padding: "5px 14px", showDot: true },
  tenant: { padding: "5px 12px", showDot: false },
};

export default function OrderStatusBadge({ status, lang = "ID", variant = "customer" }) {
  const tone = (TONES[variant] || TONES.customer)(status);
  const config = VARIANTS[variant] || VARIANTS.customer;

  return (
    <span
      style={{
        ...LAYOUT.inlineRow,
        gap: 6,
        padding: config.padding,
        borderRadius: "var(--radius-pill)",
        fontSize: 12,
        fontWeight: 700,
        ...tone,
      }}
    >
      {config.showDot && <span>●</span>}
      <span>{statusLabel(status, lang)}</span>
    </span>
  );
}

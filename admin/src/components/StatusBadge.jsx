import { STATUS_LABEL, statusTone } from "../utils/format.js";
import { useI18n } from "../i18n.jsx";

export default function StatusBadge({ status, label }) {
  const { t } = useI18n();
  const tone = statusTone(status);
  const text = label || STATUS_LABEL[status] || status || "—";
  return <span className={`admin-badge-status tone-${tone}`}>{t(text)}</span>;
}

const statusConfig: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  active:       { label: "Active",       bg: "#dcfce7", color: "#16a34a", dot: "#16a34a" },
  pending:      { label: "Pending",      bg: "#fef9c3", color: "#ca8a04", dot: "#ca8a04" },
  in_progress:  { label: "In Progress",  bg: "#dbeafe", color: "#2563eb", dot: "#2563eb" },
  "under-review":{ label: "Under Review",bg: "#fef9c3", color: "#ca8a04", dot: "#ca8a04" },
  resolved:     { label: "Resolved",     bg: "#dcfce7", color: "#16a34a", dot: "#16a34a" },
  closed:       { label: "Closed",       bg: "#f1f5f9", color: "#64748b", dot: "#94a3b8" },
  rejected:     { label: "Rejected",     bg: "#fee2e2", color: "#dc2626", dot: "#dc2626" },
};

export function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? { label: status, bg: "#f1f5f9", color: "#64748b", dot: "#94a3b8" };
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "5px",
      padding: "4px 10px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: 700,
      background: cfg.bg,
      color: cfg.color,
      border: `1px solid ${cfg.dot}40`,
      whiteSpace: "nowrap",
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: "50%",
        background: cfg.dot, flexShrink: 0,
        display: "inline-block",
      }} />
      {cfg.label}
    </span>
  );
}

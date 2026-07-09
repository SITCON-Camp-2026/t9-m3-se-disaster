export function ProgressBar({
  value,
  max = 100,
  label,
}: {
  value: number;
  max?: number;
  label?: string;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ width: 320 }}>
      <div
        style={{
          height: 10,
          background: "#e6eef8",
          borderRadius: 6,
          overflow: "hidden",
        }}
        aria-hidden
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: "#245d9d",
            transition: "width 200ms ease",
          }}
        />
      </div>
      <div style={{ marginTop: 6, fontSize: "0.85rem", color: "#5f6b7a" }}>
        {label ?? `${pct}% 已協助 (${value}/${max})`}
      </div>
    </div>
  );
}

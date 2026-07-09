import { labelForStatus } from "./status-labels";

export function StatusBadge({ status }: { status: string }) {
  const needsAttention = status === "unverified" || status === "needs_review";
  const title = needsAttention
    ? `${labelForStatus(status)}（需要人工確認）`
    : labelForStatus(status);

  return (
    <span
      className={`status-badge status-${status}`}
      title={title}
      aria-label={labelForStatus(status)}
    >
      {labelForStatus(status)}
    </span>
  );
}

import { RecordCard } from "../../components/RecordCard";
import { StatusBadge } from "../../components/StatusBadge";
import { ProgressBar } from "../../components/ProgressBar";
import { Phase0JudgementCard } from "./Phase0JudgementCard";
import { createPhase0Judgement } from "./phase0-heuristics";
import type { Phase0MessyRecord } from "./phase0-types";
import { useMemo, useState } from "react";
import { labelForSource } from "../../components/source-labels";

export function Phase0Workbench({
  records,
  selectedRecordId,
  onSelect,
  onUpdateRecords,
}: {
  records: Phase0MessyRecord[];
  selectedRecordId: string;
  onSelect: (recordId: string) => void;
  onUpdateRecords?: (records: Phase0MessyRecord[]) => void;
}) {
  const selectedRecord =
    records.find((record) => record.id === selectedRecordId) ?? records[0];
  const safetyBoundary = createPhase0Judgement(selectedRecord);
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [userRole, setUserRole] = useState<"resident" | "volunteer">(
    "volunteer",
  );

  const sources = useMemo(() => {
    const set = new Set(records.map((r) => r.sourceType));
    return ["all", ...Array.from(set)];
  }, [records]);

  const visibleRecords =
    sourceFilter === "all"
      ? records
      : records.filter((r) => r.sourceType === sourceFilter);

  const fulfilledCount = records.filter(
    (r) => r.verificationStatus === "fulfilled",
  ).length;

  function handleReportAssisted(recordId: string) {
    if (!onUpdateRecords) return;
    const next = records.map((r) =>
      r.id === recordId ? { ...r, verificationStatus: "fulfilled" } : r,
    );
    onUpdateRecords(next);
  }

  function handleToggleWash(recordId: string) {
    if (!onUpdateRecords) return;
    const next = records.map((r) =>
      r.id === recordId ? { ...r, canWash: !r.canWash } : r,
    );
    onUpdateRecords(next);
  }

  function handleMarkArrived(recordId: string, count: number) {
    if (!onUpdateRecords) return;
    const next = records.map((r) =>
      r.id === recordId
        ? {
            ...r,
            arrived: (r.arrivedCount ?? 0) + count > 0,
            arrivedCount: (r.arrivedCount ?? 0) + count,
          }
        : r,
    );
    onUpdateRecords(next);
  }

  function handleAddAttachment(recordId: string, file: File) {
    if (!onUpdateRecords) return;
    const url = URL.createObjectURL(file);
    const attachment = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: file.name,
      url,
      mimeType: file.type,
    };
    const next = records.map((r) =>
      r.id === recordId
        ? { ...r, attachments: [...(r.attachments ?? []), attachment] }
        : r,
    );
    onUpdateRecords(next);
  }

  function handleRemoveAttachment(recordId: string, attachmentId: string) {
    if (!onUpdateRecords) return;
    const next = records.map((r) =>
      r.id === recordId
        ? {
            ...r,
            attachments: (r.attachments ?? []).filter(
              (a) => a.id !== attachmentId,
            ),
          }
        : r,
    );
    onUpdateRecords(next);
  }

  function handleAddReport(
    recordId: string,
    report: {
      text?: string;
      attachmentId?: string;
      address?: string;
      type: "text" | "media";
      reporterRole?: "resident" | "volunteer";
    },
  ) {
    if (!onUpdateRecords) return;
    const r = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: report.type,
      text: report.text,
      attachmentId: report.attachmentId,
      address: report.address,
      createdAt: new Date().toISOString(),
      reporterRole: report.reporterRole ?? userRole,
    };
    const next = records.map((rec) =>
      rec.id === recordId
        ? { ...rec, reports: [...(rec.reports ?? []), r] }
        : rec,
    );
    onUpdateRecords(next);
  }

  function exportRecords() {
    const data = JSON.stringify(records, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `phase0-records-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function handleSaveNote(recordId: string, text: string) {
    if (!onUpdateRecords) return;
    const next = records.map((r) =>
      r.id === recordId ? { ...r, note: text } : r,
    );
    onUpdateRecords(next);
  }

  function handleSaveToolSuggestion(recordId: string, text: string) {
    if (!onUpdateRecords) return;
    const next = records.map((r) =>
      r.id === recordId ? { ...r, toolSuggestion: text } : r,
    );
    onUpdateRecords(next);
  }

  return (
    <div className="workbench">
      <div className="workbench__intro">
        <p className="eyebrow">整理工作台</p>
        <div className="workbench__intro-grid">
          <div className="workbench__intro-heading">
            <h2>
              第一階段的成功不是分類正確，而是把為什麼現在還不能判斷說清楚。
            </h2>
            <ProgressBar value={fulfilledCount} max={records.length} />
          </div>

          <div className="workbench__intro-actions">
            <label className="workbench__intro-role">
              我是：
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as any)}
              >
                <option value="volunteer">救災志工（提供幫助）</option>
                <option value="resident">受災戶（需要幫忙）</option>
              </select>
            </label>
            <button type="button" onClick={exportRecords}>
              下載紀錄 (JSON)
            </button>
          </div>
        </div>
        <p>
          這裡先只標示安全邊界，真正的候選判斷要由小組和 coding agent
          補上；這不是 runtime LLM 分析，也不是正式資料模型。
        </p>
      </div>

      <div className="workbench__layout">
        <aside className="workbench__queue" aria-label="選擇原始資訊">
          <label className="workbench__filter-label">
            來源：
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
            >
              {sources.map((s) => (
                <option key={s} value={s}>
                  {s === "all" ? "全部來源" : labelForSource(s)}
                </option>
              ))}
            </select>
          </label>

          {visibleRecords.map((record) => (
            <button
              className={record.id === selectedRecord.id ? "active" : ""}
              key={record.id}
              type="button"
              onClick={() => onSelect(record.id)}
            >
              <div className="record-list-item__header">
                <span>{record.id}</span>
                <span className="source-label">
                  {labelForSource(record.sourceType)}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  marginTop: 8,
                }}
              >
                <StatusBadge status={record.verificationStatus} />
                {record.arrived ? (
                  <span className="arrival-label">已到達</span>
                ) : null}
              </div>
              <div style={{ marginTop: 8 }}>
                {record.verificationStatus !== "fulfilled" ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReportAssisted(record.id);
                    }}
                  >
                    回報已協助
                  </button>
                ) : (
                  <small>已回報：已協助</small>
                )}
              </div>
            </button>
          ))}
        </aside>

        <div className="workbench__main">
          <RecordCard
            record={selectedRecord}
            judgement={safetyBoundary}
            currentUserRole={userRole}
            onReport={handleReportAssisted}
            onToggleWash={handleToggleWash}
            onMarkArrived={(count) =>
              handleMarkArrived(selectedRecord.id, count)
            }
            onAddAttachment={(file) =>
              handleAddAttachment(selectedRecord.id, file)
            }
            onRemoveAttachment={(id) =>
              handleRemoveAttachment(selectedRecord.id, id)
            }
            onSaveNote={(text) => handleSaveNote(selectedRecord.id, text)}
            onSaveToolSuggestion={(text) =>
              handleSaveToolSuggestion(selectedRecord.id, text)
            }
            onAddReport={(r) => handleAddReport(selectedRecord.id, r)}
          />

          <Phase0JudgementCard
            judgement={safetyBoundary}
            record={selectedRecord}
          />
        </div>

        <aside className="workbench__checklist">
          <h3>第一階段完成檢查</h3>
          <ul>
            <li>Starter 已載入 {records.length} 筆原始資訊</li>
            <li>請 agent 加上建立、編輯、刪除或重設整理草稿</li>
            <li>至少讓 6 筆原始資訊被嘗試整理成可編輯草稿</li>
            <li>至少挑 2 個候選判斷由人類質疑或修正</li>
            <li>
              把資料品質問題寫進 observations，並記錄 agent 哪裡不能直接相信
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}

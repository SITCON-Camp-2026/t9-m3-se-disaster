import { SourceLabel } from "./SourceLabel";
import { StatusBadge } from "./StatusBadge";
import { formatDateTime } from "../lib/date";
import { useEffect, useState } from "react";

type RecordLike = {
  id: string;
  title?: string;
  name?: string;
  rawText?: string;
  description?: string;
  sourceType: string;
  verificationStatus: string;
  updatedAt: string;
  canWash?: boolean;
  arrivedCount?: number;
  attachments?: { id: string; name: string; url: string; mimeType?: string }[];
  note?: string;
  toolSuggestion?: string;
  reports?: Array<{ address?: string; reporterRole?: "resident" | "volunteer" }>;
};

type RecordCardProps = {
  record: RecordLike;
  judgement?: { neededPeople?: number };
  onReport?: (id: string) => void;
  onToggleWash?: (id: string) => void;
  onMarkArrived?: (count: number) => void;
  onAddAttachment?: (file: File) => void;
  onRemoveAttachment?: (id: string) => void;
  onSaveNote?: (text: string) => void;
  onSaveToolSuggestion?: (text: string) => void;
  onAddReport?: (r: { text?: string; attachmentId?: string; address?: string; type: "text" | "media"; reporterRole?: "resident" | "volunteer" }) => void;
  currentUserRole?: "resident" | "volunteer";
};

export function RecordCard({ record, judgement, onReport, onToggleWash, onMarkArrived, onAddAttachment, onRemoveAttachment, onSaveNote, onSaveToolSuggestion, onAddReport, currentUserRole }: RecordCardProps) {
  const title = record.title ?? record.name ?? record.id;
  const description = record.rawText ?? record.description;
  const residentReport = record.reports?.find(
    (report) => report.reporterRole === "resident" && report.address,
  );
  const residentAddress = residentReport?.address ?? "";
  const [note, setNote] = useState<string>(record.note ?? "");

  useEffect(() => {
    setNote(record.note ?? "");
  }, [record.id, record.note]);

  const [reportText, setReportText] = useState("");
  const [reportAddress, setReportAddress] = useState("");
  const [selectedAttachmentId, setSelectedAttachmentId] = useState<string | undefined>(undefined);
  const [toolSuggestion, setToolSuggestion] = useState<string>(record.toolSuggestion ?? "");

  useEffect(() => {
    setSelectedAttachmentId(undefined);
    setReportText("");
    setReportAddress("");
    setToolSuggestion(record.toolSuggestion ?? "");
  }, [record.id, record.toolSuggestion]);

  return (
    <article className="record-card">
      <div className="record-card__header">
        <h3>{title}</h3>
        <StatusBadge status={record.verificationStatus} />
      </div>
      <div className="record-card__meta">
        <SourceLabel sourceType={record.sourceType} />
        <span>更新：{formatDateTime(record.updatedAt)}</span>
      </div>
      {residentReport ? (
        <div className="address-map-banner">
          <div className="address-map-banner__info">
            <strong>受災戶地址</strong>
            <span>{residentReport.address}</span>
          </div>
          <div className="address-map-banner__iframe">
            <iframe
              title="Resident address map"
              src={`https://www.openstreetmap.org/export/embed.html?query=${encodeURIComponent(
                residentAddress,
              )}`}
            />
          </div>
        </div>
      ) : null}
      {description ? <p>{description}</p> : null}
      <div className="record-card__actions">
        <div>
          {record.verificationStatus !== "fulfilled" ? (
            <button type="button" onClick={() => onReport?.(record.id)}>
              在此回報：已協助
            </button>
          ) : (
            <small>已回報：已協助</small>
          )}
        </div>

        <div>
          {record.canWash ? (
            <button type="button" onClick={() => onToggleWash?.(record.id)}>
              取消：可清洗地點
            </button>
          ) : (
            <button type="button" onClick={() => onToggleWash?.(record.id)}>
              標記為：可清洗地點
            </button>
          )}
        </div>

        <div>
          <button
            type="button"
            className="record-card__arrival-button"
            onClick={() => onMarkArrived?.(1)}
            disabled={record.arrivedCount !== undefined && judgement?.neededPeople !== undefined && record.arrivedCount >= judgement.neededPeople}
          >
            增加 1 人到達
          </button>
        </div>
      </div>
      <div className="record-card__arrival-status">
        {record.arrivedCount !== undefined && judgement?.neededPeople ? (
          <span className={record.arrivedCount >= judgement.neededPeople ? "arrival-full" : "arrival-progress"}>
            {record.arrivedCount >= judgement.neededPeople
              ? "人數已滿"
              : `已到達 ${record.arrivedCount} 人，還差 ${judgement.neededPeople - record.arrivedCount} 人`}
          </span>
        ) : null}
      </div>
      <section className="record-card__section">
        <label className="record-card__form-field">
          上傳現場影音（僅供審核，前端暫存）：
          <input
            type="file"
            accept="video/*,audio/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onAddAttachment?.(f);
              if (e.target) e.currentTarget.value = "";
            }}
          />
        </label>

        <div className="record-card__attachment-list">
          {(record.attachments ?? []).map((a) => (
            <div key={a.id} className="record-card__attachment-item">
              {a.mimeType?.startsWith("video") ? (
                <video src={a.url} controls className="record-card__media-preview" />
              ) : (
                <audio src={a.url} controls className="record-card__media-preview" />
              )}
              <div>
                <small>{a.name}</small>
                <button type="button" onClick={() => onRemoveAttachment?.(a.id)} className="record-card__attachment-remove">刪除</button>
              </div>
            </div>
          ))}
        </div>
      </section>

          <div style={{ marginTop: 12 }}>
          {currentUserRole === 'resident' ? (
            <div>
              <h4>受災戶：請求幫忙（地址可轉地圖）</h4>
              <textarea value={reportText} onChange={(e) => setReportText(e.target.value)} placeholder="描述需要幫忙的內容（最多50字建議）" style={{ width: '100%', minHeight: 60 }} />
              <div className="record-card__form-field">
                <label>
                  住址（可轉地圖）：
                  <input
                    type="text"
                    value={reportAddress}
                    onChange={(e) => setReportAddress(e.target.value)}
                    placeholder="輸入大致地址，例如光復車站後方"
                  />
                </label>
              </div>
              <div className="record-card__button-row">
                <button type="button" onClick={() => { onAddReport?.({ text: reportText || undefined, address: reportAddress || undefined, type: 'text', reporterRole: 'resident' }); setReportText(''); setReportAddress(''); }}>提交需求</button>
              </div>
            </div>
          ) : (
            <div>
              <h4>救災志工：提供幫助回報</h4>
              <textarea value={reportText} onChange={(e) => setReportText(e.target.value)} placeholder="簡短描述你已協助的部份（選填）" style={{ width: '100%', minHeight: 60 }} />
              <div className="record-card__form-field">
                <label>
                  可選的上傳附件（先上傳到上方附件清單，再於此選擇）：
                  <select value={selectedAttachmentId ?? ''} onChange={(e) => setSelectedAttachmentId(e.target.value || undefined)}>
                    <option value="">（不附檔案）</option>
                    {(record.attachments ?? []).map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="record-card__button-row">
                <button type="button" onClick={() => { onAddReport?.({ text: reportText || undefined, attachmentId: selectedAttachmentId, type: selectedAttachmentId ? 'media' : 'text', reporterRole: 'volunteer' }); setReportText(''); setSelectedAttachmentId(undefined); }}>提交回報</button>
              </div>
            </div>
          )}
        </div>

        <section className="record-card__section record-card__note-section">
          <label className="record-card__form-field">
            簡短備註（最多50字）：
            <input
              type="text"
              value={note}
              maxLength={50}
              onChange={(e) => setNote(e.target.value)}
              placeholder="輸入最多50字的備註..."
            />
          </label>
          <div className="record-card__note-actions">
            <small>{50 - note.length} 字可用</small>
            <button type="button" onClick={() => onSaveNote?.(note)}>儲存備註</button>
          </div>
        </section>

        <section className="record-card__section record-card__note-section">
          <label className="record-card__form-field">
            近期工具取得建議：
            <input
              type="text"
              value={toolSuggestion}
              maxLength={100}
              onChange={(e) => setToolSuggestion(e.target.value)}
              placeholder="若救災人員沒有工具，這裡寫最近可以取得的地方..."
            />
          </label>
          <div className="record-card__note-actions">
            <small>{100 - toolSuggestion.length} 字可用</small>
            <button type="button" onClick={() => onSaveToolSuggestion?.(toolSuggestion)}>儲存建議</button>
          </div>
        </section>
    </article>
  );
}

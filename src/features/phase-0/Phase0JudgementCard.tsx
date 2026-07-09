import { StatusBadge } from "../../components/StatusBadge";
import type { Phase0JudgementDraft, Phase0MessyRecord } from "./phase0-types";

const kindLabels: Record<Phase0JudgementDraft["possibleKind"], string> = {
  help_request_candidate: "求助候選",
  site_status_candidate: "地點狀態候選",
  task_candidate: "任務候選",
  assignment_candidate: "人員指派候選",
  announcement_candidate: "公告候選",
  unknown: "候選類型待判斷",
};

const confidenceLabels: Record<Phase0JudgementDraft["confidence"], string> = {
  low: "低",
  medium: "中",
  high: "高",
};

const nextStepLabels: Record<
  Phase0JudgementDraft["suggestedNextStep"],
  string
> = {
  keep_raw: "先保留原始資訊",
  ask_for_more_info: "補問來源或現場資訊",
  send_to_human_review: "交給人工確認",
  create_candidate_report: "建立候選通報",
  create_site_update_suggestion: "建立地點更新建議",
  do_not_use_yet: "暫時不要使用",
};

export function Phase0JudgementCard({
  judgement,
  record,
}: {
  judgement: Phase0JudgementDraft;
  record: Phase0MessyRecord;
}) {
  const residentReport = record.reports?.find(
    (report) => report.reporterRole === "resident" && report.address,
  );

  return (
    <article className="judgement-card">
      <div className="judgement-card__header">
        <div>
          <p className="eyebrow">Starter 安全預設</p>
          <h3>尚未建立整理草稿</h3>
        </div>
        <StatusBadge status={record.verificationStatus} />
      </div>

      <p>
        這張卡只保留保守的安全邊界，不是 agent 對這筆資料的整理答案。請讓 coding
        agent 實作可建立、編輯與刪除的整理草稿。
      </p>

      <dl className="judgement-summary">
        <div>
          <dt>候選類型</dt>
          <dd>{kindLabels[judgement.possibleKind]}</dd>
        </div>
        <div>
          <dt>信心程度</dt>
          <dd>{confidenceLabels[judgement.confidence]}</dd>
        </div>
        <div>
          <dt>下一步</dt>
          <dd>{nextStepLabels[judgement.suggestedNextStep]}</dd>
        </div>
      </dl>

      {record.canWash ? (
        <div style={{ marginTop: 12 }}>
          <strong>資源提示：</strong>此地點已被標註為「可清洗身體」
        </div>
      ) : null}
      {residentReport ? (
        <div style={{ marginTop: 12 }}>
          <strong>地點：</strong>
          {residentReport.address}
          <div style={{ marginTop: 8 }}>
            <iframe
              title="Address map"
              src={`https://www.openstreetmap.org/export/embed.html?query=${encodeURIComponent(
                residentReport.address,
              )}`}
              style={{ width: "100%", minHeight: 240, border: "1px solid #dbe4ef", borderRadius: 8 }}
            />
          </div>
          <div style={{ marginTop: 6 }}>
            <a
              href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(
                residentReport.address,
              )}`}
              target="_blank"
              rel="noreferrer"
            >
              在地圖中開啟
            </a>
          </div>
        </div>
      ) : null}

      <div style={{ marginTop: 12 }}>
        <strong>估計需要人數：</strong>
        {/* @ts-ignore */}
        {judgement.neededPeople} 人（由回報與原文自動估算，需人工確認）
      </div>

      <p>
        能否直接行動：
        <strong>
          {judgement.unsafeToActDirectly ? "不可直接行動" : "仍需確認情境"}
        </strong>
      </p>

      <section>
        <h4>目前只有安全預設</h4>
        <ul>
          {judgement.evidence.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section>
        <h4>目前卡住的地方</h4>
        <ul>
          {judgement.blockers.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </article>
  );
}

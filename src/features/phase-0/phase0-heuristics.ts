import type { Phase0JudgementDraft, Phase0MessyRecord } from "./phase0-types";

// ponytail: this is a safety-boundary scaffold, not an answer engine.
export function createPhase0Judgement(
  record: Phase0MessyRecord,
): Phase0JudgementDraft {
  const isVerified = record.verificationStatus === "verified";

  // Simple heuristic to estimate needed people from raw text or reports.
  let neededPeople = 6;
  const numReports = (record.reports ?? []).length;

  // try to find digits in rawText
  const m = record.rawText.match(/\d+/);
  if (m) {
    neededPeople = parseInt(m[0], 10);
  } else if (/十幾|十多|幾十/.test(record.rawText)) {
    neededPeople = 12;
  } else if (/需要.*人/.test(record.rawText)) {
    neededPeople = 6;
  }

  // reduce estimate based on number of reports (on-site confirmations)
  neededPeople = Math.max(0, neededPeople - Math.floor(numReports / 2));

  const evidence = ["尚未建立整理草稿：請由小組從原文標出判斷依據。"];
  if (numReports > 0) evidence.unshift(`${numReports} 則現場回報可供參考`);

  const blockers = isVerified
    ? ["仍需確認這筆資訊適合進入哪個後續流程。"]
    : ["目前不是已確認資訊，不能直接行動或當成事實發布。"];

  const suggestedNextStep = isVerified
    ? "keep_raw"
    : numReports > 0
      ? "ask_for_more_info"
      : "send_to_human_review";

  return {
    messyRecordId: record.id,
    possibleKind: "unknown",
    confidence: numReports > 0 ? "medium" : "low",
    evidence,
    blockers,
    suggestedNextStep,
    unsafeToActDirectly: !isVerified,
    humanReviewNote:
      numReports > 0
        ? "有現場回報，請人工審核附檔與文字以決定需人數"
        : undefined,
    neededPeople,
  };
}

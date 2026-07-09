// Phase 0 only. This is not the formal data contract.
export type Phase0PossibleKind =
  | "help_request_candidate"
  | "site_status_candidate"
  | "task_candidate"
  | "assignment_candidate"
  | "announcement_candidate"
  | "unknown";

export type Phase0Confidence = "low" | "medium" | "high";

export type Phase0SuggestedNextStep =
  | "keep_raw"
  | "ask_for_more_info"
  | "send_to_human_review"
  | "create_candidate_report"
  | "create_site_update_suggestion"
  | "do_not_use_yet";

export type Phase0MessyRecord = {
  id: string;
  rawText: string;
  sourceType: string;
  verificationStatus: string;
  updatedAt: string;
  canWash?: boolean;
  arrived?: boolean;
  arrivedCount?: number;
  attachments?: {
    id: string;
    name: string;
    url: string;
    mimeType?: string;
  }[];
  note?: string;
  toolSuggestion?: string;
  reports?: Array<{
    id: string;
    type: "text" | "media";
    text?: string;
    attachmentId?: string;
    address?: string;
    reporterRole?: "resident" | "volunteer";
    createdAt?: string;
  }>;
};

export type Phase0JudgementDraft = {
  messyRecordId: string;
  possibleKind: Phase0PossibleKind;
  confidence: Phase0Confidence;
  evidence: string[];
  blockers: string[];
  suggestedNextStep: Phase0SuggestedNextStep;
  unsafeToActDirectly: boolean;
  humanReviewNote?: string;
  neededPeople?: number;
};

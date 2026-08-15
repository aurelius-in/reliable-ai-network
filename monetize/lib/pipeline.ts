import type { PipelineStage } from "@/types";

export const PIPELINE_ASSET_TYPE = "pipeline_board";

export const PIPELINE_STAGES: {
  id: PipelineStage;
  label: string;
}[] = [
  { id: "identified", label: "Identified" },
  { id: "drafted", label: "Drafted" },
  { id: "sent", label: "Sent" },
  { id: "replied", label: "Replied" },
  { id: "meeting", label: "Meeting" },
  { id: "won", label: "Won" },
  { id: "lost", label: "Lost" },
];

export const PIPELINE_CHANNELS = [
  { value: "LinkedIn", label: "LinkedIn" },
  { value: "Email", label: "Email" },
  { value: "X", label: "X" },
  { value: "Warm intro", label: "Warm intro" },
  { value: "Other", label: "Other" },
];

export function newContactId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `c_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

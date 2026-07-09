export const sourceLabels: Record<string, string> = {
  social_post: "社群貼文",
  volunteer_update: "志工更新",
  field_report: "現場回報",
  official_notice: "官方公告",
  phone_call: "來電",
};

export function labelForSource(source: string): string {
  return sourceLabels[source] ?? source;
}

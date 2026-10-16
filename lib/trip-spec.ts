const fields = ["source", "destination", "groupSize", "budget", "tripDuration", "interests", "tripStyle", "travelPace"] as const;
export function tripSpecification(value: unknown): Record<string, string> {
  if (value === undefined) return {};
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid trip details");
  const result: Record<string, string> = {};
  for (const key of fields) {
    const raw = (value as Record<string, unknown>)[key];
    if (raw === undefined || raw === null || raw === "") continue;
    if (typeof raw !== "string" && !(key === "tripDuration" && typeof raw === "number")) throw new Error("Invalid trip details");
    const text = String(raw).trim();
    if (text.length > 500 || (key === "tripDuration" && (!/^\d+$/.test(text) || Number(text) < 1 || Number(text) > 30))) throw new Error("Invalid trip details");
    if (text) result[key] = text;
  }
  return result;
}

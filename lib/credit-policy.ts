export const CREDIT_REFILL_MS = 86_400_000;
export function availableCredits(record: { remaining: number; capacity: number; updatedAt: number }, capacity: number, now: number) {
  const elapsed = Math.max(0, Math.floor((now - record.updatedAt) / CREDIT_REFILL_MS));
  const remaining = Math.min(capacity, Math.max(0, record.remaining + Math.max(0, capacity - record.capacity) + elapsed));
  return { remaining, capacity, updatedAt: remaining === capacity ? now : record.updatedAt + elapsed * CREDIT_REFILL_MS };
}

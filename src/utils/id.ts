/**
 * Simple unique ID generator (no external dependency needed).
 * Uses crypto.randomUUID when available, fallback to timestamp + random.
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function isFilled(v: unknown): boolean {
  if (v === null || v === undefined) return false;
  if (typeof v === 'string') return v.trim().length > 0;
  if (typeof v === 'number') return v > 0;
  if (Array.isArray(v)) return v.length > 0;
  return true;
}

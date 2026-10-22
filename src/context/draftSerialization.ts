import type { AuditedBusiness, AccountNote } from '../types';

/** Local draft interchange only. This does not certify a rule or submit a return. */
export const AUDITED_DRAFT_VERSION = 'NBR-ERETURN-2026-V2';

const BUSINESS_TYPES = new Set([
  'Trading', 'Service', 'Bank and Finance', 'Insurance', 'Manufacturing and Trading',
]);
const BUSINESS_STRINGS = ['id', 'businessName', 'registrationNo', 'auditorFirmName', 'auditYear'] as const;
const BUSINESS_AMOUNTS = [
  'turnoverCurrent', 'turnoverPrevious', 'grossProfitCurrent', 'grossProfitPrevious',
  'netProfitCurrent', 'netProfitPrevious', 'totalAssetsCurrent', 'totalAssetsPrevious',
  'totalLiabilitiesCurrent', 'totalLiabilitiesPrevious',
] as const;
const NOTE_STRINGS = ['id', 'noteNumber', 'title', 'description'] as const;
const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const isFiniteAmount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

/**
 * Returns null for malformed data (reject import before state mutation).
 * Legacy V1 exports lacked this field; restore an empty list rather than
 * silently carrying unrelated in-memory audited businesses into the import.
 */
export function parseAuditedBusinessesDraft(payload: unknown): AuditedBusiness[] | null {
  if (!isRecord(payload)) return null;
  if (payload.version !== undefined &&
      payload.version !== 'NBR-ERETURN-2026-V1' &&
      payload.version !== AUDITED_DRAFT_VERSION) return null;
  if (!Object.prototype.hasOwnProperty.call(payload, 'auditedBusinesses')) {
    return payload.version === AUDITED_DRAFT_VERSION ? null : [];
  }
  const businesses = payload.auditedBusinesses;
  if (!Array.isArray(businesses)) return null;
  const businessIds = new Set<string>();
  for (const business of businesses) {
    if (!isRecord(business)) return null;
    if (!BUSINESS_STRINGS.every((field) => typeof business[field] === 'string')) return null;
    if (typeof business.id !== 'string' || !business.id || businessIds.has(business.id)) return null;
    businessIds.add(business.id);
    if (!BUSINESS_TYPES.has(business.businessType as string)) return null;
    if (!BUSINESS_AMOUNTS.every((field) => isFiniteAmount(business[field]))) return null;
    if (!Array.isArray(business.notes)) return null;
    const noteIds = new Set<string>();
    for (const note of business.notes) {
      if (!isRecord(note)) return null;
      if (!NOTE_STRINGS.every((field) => typeof note[field] === 'string')) return null;
      if (typeof note.id !== 'string' || !note.id || noteIds.has(note.id)) return null;
      noteIds.add(note.id);
      if (note.level !== 1 && note.level !== 2 && note.level !== 3) return null;
      if (note.parentId !== undefined && typeof note.parentId !== 'string') return null;
      if (!isFiniteAmount(note.currentYearAmount) || !isFiniteAmount(note.previousYearAmount)) return null;
    }
    // Imported notes must form a valid three-level tree within this business.
    // Reject orphaned and structurally invalid notes before any state mutation.
    const notesById = new Map(business.notes.map((note) => [note.id, note]));
    for (const note of business.notes) {
      if (note.level === 1) {
        if (note.parentId !== undefined) return null;
      } else {
        if (typeof note.parentId !== 'string' || !note.parentId) return null;
        const parent = notesById.get(note.parentId);
        if (!parent || parent.level !== note.level - 1) return null;
      }
    }
  }
  return businesses as AuditedBusiness[];
}

/**
 * Remove a note and every descendant, including grandchildren when a level-1
 * note is deleted. Never mutate the input; this is local draft/UI state only.
 */
export function removeAccountNoteAndDescendants(notes: AccountNote[], noteId: string): AccountNote[] {
  const removedIds = new Set<string>([noteId]);
  let foundDescendant = true;
  while (foundDescendant) {
    foundDescendant = false;
    for (const note of notes) {
      if (note.parentId && removedIds.has(note.parentId) && !removedIds.has(note.id)) {
        removedIds.add(note.id);
        foundDescendant = true;
      }
    }
  }
  return notes.filter((note) => !removedIds.has(note.id));
}

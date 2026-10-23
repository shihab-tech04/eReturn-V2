/** Sobaike FilterChip compatibility layer.
 * Reporting-sector taxonomy and its CSS --sec-* category colors do not apply
 * to income-tax categories. The shared FilterChip is only used without a
 * section prop, retaining the identical source UI and generic state styling.
 * This is presentation-only and must never drive tax applicability.
 */
export type SectionKey = string;
export const SECTIONS: Readonly<Record<SectionKey, never>> = Object.freeze({});

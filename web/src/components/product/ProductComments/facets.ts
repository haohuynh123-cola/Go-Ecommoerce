/**
 * Parse the optional facet-rating prefix written by ReviewModal back into
 * structured pills. The on-the-wire format is:
 *
 *   "[Hiệu năng: 4/5 · Thời lượng pin: 2/5]\n\nactual review text"
 *
 * If the comment has no prefix, returns the original body unchanged with an
 * empty facets array. The parser is intentionally tolerant — anything that
 * fails to match the exact shape is treated as plain text.
 */

export interface FacetTag {
  /** Facet display label, e.g. "Hiệu năng". */
  label: string;
  /** Stars chosen for the facet, 1–5. */
  value: number;
}

export interface ParsedComment {
  facets: FacetTag[];
  body: string;
}

const PREFIX_RE = /^\[([^\]\n]+)\]\n\n([\s\S]*)$/;
const FACET_RE = /^(.+?):\s*([1-5])\/5$/;

export function parseCommentFacets(raw: string): ParsedComment {
  const match = raw.match(PREFIX_RE);
  if (!match) return { facets: [], body: raw };

  const [, tagBlock, body] = match;
  const facets: FacetTag[] = [];

  for (const part of tagBlock.split('·')) {
    const trimmed = part.trim();
    const facetMatch = trimmed.match(FACET_RE);
    if (!facetMatch) {
      // Unexpected prefix shape — bail and treat the whole thing as plain text.
      return { facets: [], body: raw };
    }
    facets.push({ label: facetMatch[1].trim(), value: Number(facetMatch[2]) });
  }

  return { facets, body };
}

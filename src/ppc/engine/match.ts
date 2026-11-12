// Forgiving keyword matching for the recall drills: what you type counts when it carries the
// keyword's meaning words (stop words dropped, light stemming, a typo or two allowed per word).

const STOP = new Set(
  'a an the of to in on for and or by with from as at is are be being been it its this that these those their his her our your any all each per via into than then so such not no only also very more most which who whom what when where why how should shall will would can may must do does did done has have had there here about against between through during before after above below up down out off over under again further once same other own some few both nor too just don s t if whether while because but etc e g i'.split(
    ' ',
  ),
)

/** lower case, unify dashes/quotes, drop punctuation */
export function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/[–—−]/g, '-')
    .replace(/&/g, ' and ')
    .replace(/'s\b/g, '')
    .replace(/[^a-z0-9%ঀ-৿]+/g, ' ')
    .trim()
}

/** crude stemmer: enough to make "tenders"/"tendering"/"tendered" meet */
export function stem(w: string): string {
  if (w.length <= 3) return w
  for (const suf of ['ational', 'ization', 'isation', 'ations', 'ation', 'ments', 'ment', 'ness', 'ings', 'ing', 'ies', 'ied', 'ed', 'es', 'ly', 's']) {
    if (w.endsWith(suf) && w.length - suf.length >= 3) {
      const base = w.slice(0, -suf.length)
      return suf === 'ies' || suf === 'ied' ? base + 'y' : base
    }
  }
  return w
}

/** meaningful words of a phrase, stemmed */
export function words(s: string): string[] {
  return norm(s)
    .split(' ')
    .filter((w) => w && !STOP.has(w))
    .map(stem)
}

function lev(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]
    let best = i
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
      best = Math.min(best, cur[j])
    }
    if (best > max) return max + 1
    prev = cur
  }
  return prev[b.length]
}

/** two words are the same word, allowing typos on longer words and prefixes of 5+ letters */
export function sameWord(a: string, b: string): boolean {
  if (a === b) return true
  const n = Math.min(a.length, b.length)
  if (n >= 5 && (a.startsWith(b) || b.startsWith(a))) return true
  const tol = n >= 8 ? 2 : n >= 5 ? 1 : 0
  return tol > 0 && lev(a, b, tol) <= tol
}

/**
 * How well `typed` covers the phrase `key` (0..1): the share of the key's meaning words found in
 * what was typed. A one-word key needs that word; an abbreviation typed for a multi-word key counts
 * when it spells the initials (DBB = design bid build).
 */
export function coverage(typed: string, key: string): number {
  const kw = words(key)
  const tw = words(typed)
  if (!kw.length) return norm(typed) === norm(key) ? 1 : 0
  if (!tw.length) return 0
  const initials = kw.map((w) => w[0]).join('')
  if (tw.length === 1 && kw.length >= 2 && tw[0] === initials) return 1
  let hit = 0
  for (const k of kw) if (tw.some((t) => sameWord(t, k))) hit++
  return hit / kw.length
}

export interface MatchTarget {
  k: string
  alt?: string[]
}

/** best coverage of `typed` over a point's keyword and its alternatives */
export function score(typed: string, p: MatchTarget): number {
  let best = coverage(typed, p.k)
  for (const a of p.alt ?? []) best = Math.max(best, coverage(typed, a))
  return best
}

/** a point counts as recalled at this coverage (half the words of a long phrase, all of a 1-word one) */
export function passes(typed: string, p: MatchTarget): boolean {
  const all = [p.k, ...(p.alt ?? [])]
  return all.some((k) => {
    const n = words(k).length
    const need = n <= 1 ? 1 : n === 2 ? 0.5 : 0.5
    return coverage(typed, k) >= need - 1e-9
  })
}

/**
 * Match one typed line to the best not-yet-found point. Returns the point index or -1.
 * Ties go to the earlier point, so a list in order fills in order.
 */
export function matchLine(typed: string, points: MatchTarget[], found: Set<number>): number {
  let best = -1
  let bestScore = 0
  points.forEach((p, i) => {
    if (found.has(i) || !passes(typed, p)) return
    const s = score(typed, p)
    if (s > bestScore + 1e-9) {
      best = i
      bestScore = s
    }
  })
  return best
}

/** split a free-text answer into the lines / clauses a student would write as separate points */
export function splitAnswer(text: string): string[] {
  return text
    .split(/\n|;|•|(?:^|\s)\d+[.)]\s|(?:^|\s)\(?[ivx]+\)\s|,(?=\s*[A-Za-z])/m)
    .map((s) => s.trim())
    .filter((s) => s.length > 1)
}

/** which keywords of an answer appear anywhere in a written answer (sliding window over its words) */
export function keysFound(text: string, keys: string[]): boolean[] {
  const tw = words(text)
  return keys.map((key) => {
    const kw = words(key)
    if (!kw.length) return norm(text).includes(norm(key))
    const need = kw.length <= 1 ? 1 : Math.ceil(kw.length * 0.6)
    // the key's words must appear close together (within a window 3× the key's length)
    const win = Math.max(4, kw.length * 3)
    for (let i = 0; i < Math.max(1, tw.length); i++) {
      const slice = tw.slice(i, i + win)
      let hit = 0
      for (const k of kw) if (slice.some((t) => sameWord(t, k))) hit++
      if (hit >= need) return true
    }
    return false
  })
}

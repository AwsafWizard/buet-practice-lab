// Angles the way a field book writes them: degrees–minutes–seconds, whole-circle and reduced bearings.

export const RAD = Math.PI / 180

/** wrap to [0, 360) */
export const norm360 = (a: number) => ((a % 360) + 360) % 360

/**
 * Read an angle typed in the field: `123.5`, `123 30`, `123 30 15`, `123°30'15"`, `123-30-15`, `123d30m`.
 * A leading '-' makes it negative. Returns NaN when nothing readable is there.
 */
export function parseDMS(s: string | number | undefined | null): number {
  if (typeof s === 'number') return s
  if (s == null) return NaN
  const t = String(s).trim()
  if (!t) return NaN
  const neg = /^-/.test(t)
  const parts = t
    .replace(/^[-+]/, '')
    .split(/[^0-9.]+/)
    .filter(Boolean)
    .map(Number)
  if (!parts.length || parts.some((x) => !isFinite(x))) return NaN
  const [d, m = 0, sec = 0] = parts
  const v = d + m / 60 + sec / 3600
  return neg ? -v : v
}

/** 123.5083 → 123°30′30″ (seconds rounded to `secDp` places; 59.99″ carries) */
export function fmtDMS(a: number, secDp = 0, withSeconds = true): string {
  if (!isFinite(a)) return '—'
  const f = 10 ** secDp
  let total = withSeconds ? Math.round(Math.abs(a) * 3600 * f) / f : Math.round(Math.abs(a) * 60) * 60
  const d = Math.floor(total / 3600 + 1e-9)
  total -= d * 3600
  const m = Math.floor(total / 60 + 1e-9)
  const s = Math.max(0, total - m * 60)
  const sTxt = secDp ? s.toFixed(secDp).padStart(3 + secDp, '0') : String(Math.round(s)).padStart(2, '0')
  return `${a < 0 && total + d > 0 ? '−' : ''}${d}°${String(m).padStart(2, '0')}′${withSeconds ? sTxt + '″' : ''}`
}

/** minutes (deflection tables): 135.4′ → 2°15′24″ */
export const fmtMin = (min: number, secDp = 0) => fmtDMS(min / 60, secDp)

/** whole-circle bearing → reduced (quadrantal) bearing, e.g. 215.5 → S 35°30′ W */
export function reducedBearing(wcb: number): { ns: 'N' | 'S'; ew: 'E' | 'W'; angle: number; text: string } {
  const b = norm360(wcb)
  let ns: 'N' | 'S', ew: 'E' | 'W', angle: number
  if (b <= 90) [ns, ew, angle] = ['N', 'E', b]
  else if (b <= 180) [ns, ew, angle] = ['S', 'E', 180 - b]
  else if (b <= 270) [ns, ew, angle] = ['S', 'W', b - 180]
  else [ns, ew, angle] = ['N', 'W', 360 - b]
  return { ns, ew, angle, text: `${ns} ${fmtDMS(angle)} ${ew}` }
}

/** reduced bearing → whole-circle bearing */
export function wcbOf(ns: 'N' | 'S', angle: number, ew: 'E' | 'W'): number {
  if (ns === 'N' && ew === 'E') return angle
  if (ns === 'S' && ew === 'E') return 180 - angle
  if (ns === 'S' && ew === 'W') return 180 + angle
  return norm360(360 - angle)
}

export const backBearing = (wcb: number) => norm360(wcb + 180)

/** whole-circle bearing of the line from (e1,n1) to (e2,n2), coordinates as (east, north) */
export const bearingOf = (de: number, dn: number) => norm360(Math.atan2(de, dn) / RAD)

/** latitude (+N) and departure (+E) of a line */
export const latDep = (len: number, wcb: number) => ({ lat: len * Math.cos(wcb * RAD), dep: len * Math.sin(wcb * RAD) })

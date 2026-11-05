// Compaction charts: γd–w plot with ZAV and S-lines, peaks, field points and the spec window; theory sketches.

import type { ReactNode } from 'react'
import { fmt } from '../../../components/DiagramView'
import { gdAtS, modelCurve, shiftForEnergy, type Pt } from '../../engine/compaction'

export type GUnit = 'kN' | 't' | 'pcf'
export const GWU: Record<GUnit, number> = { kN: 9.81, t: 1, pcf: 62.4 }
export const UNIT_LABEL: Record<GUnit, string> = { kN: 'kN/m³', t: 't/m³', pcf: 'lb/ft³' }

export interface Series {
  pts: Pt[]
  curve: Pt[]
  color: string
  label: string
  peak?: { omc: number; mdd: number }
  faint?: boolean
}

export interface FieldPt {
  w: number
  gd: number
  label: string
  pass?: boolean
}

export function CompactionChart({
  series,
  Gs,
  unit,
  sLines = [0.8, 0.9],
  field = [],
  spec,
  height = 300,
}: {
  series: Series[]
  Gs: number
  unit: GUnit
  sLines?: number[]
  field?: FieldPt[]
  spec?: { lo: number; hi: number; gdMin: number }
  height?: number
}) {
  const gw = GWU[unit]
  const all = [...series.flatMap((s) => s.pts), ...field]
  const wLo = Math.max(0, Math.min(...all.map((p) => p.w)) - 0.02)
  const wHi = Math.max(...all.map((p) => p.w)) + 0.02
  const gLo = Math.min(...all.map((p) => p.gd)) * 0.975
  const gHi = Math.max(...all.map((p) => p.gd), ...series.map((s) => s.peak?.mdd ?? 0)) * 1.04
  const W = 640
  const H = height
  const L = 52
  const R = 16
  const T = 14
  const B = 36
  const X = (w: number) => L + ((w - wLo) / (wHi - wLo)) * (W - L - R)
  const Y = (g: number) => H - B - ((g - gLo) / (gHi - gLo)) * (H - T - B)
  const n = 60
  const ws = Array.from({ length: n + 1 }, (_, k) => wLo + ((wHi - wLo) * k) / n)
  const sPath = (S: number) =>
    ws
      .map((w) => [w, gdAtS(w, Gs, S, gw)] as const)
      .filter(([, g]) => g >= gLo && g <= gHi)
      .map(([w, g], i) => `${i ? 'L' : 'M'}${X(w).toFixed(1)},${Y(g).toFixed(1)}`)
      .join('')
  const ticksW = Array.from({ length: 30 }, (_, k) => k * 0.02).filter((w) => w >= wLo && w <= wHi)
  const step = unit === 'pcf' ? 2 : unit === 't' ? 0.05 : 0.5
  const ticksG: number[] = []
  for (let g = Math.ceil(gLo / step) * step; g <= gHi; g += step) ticksG.push(+g.toFixed(3))
  const dg = unit === 't' ? 3 : 2
  const zLabelW = ws.filter((w) => gdAtS(w, Gs, 1, gw) <= gHi * 0.995 && gdAtS(w, Gs, 1, gw) >= gLo)[0]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="compaction curves">
      {ticksG.map((g) => (
        <g key={g}>
          <line x1={L} y1={Y(g)} x2={W - R} y2={Y(g)} stroke="var(--c-line)" strokeWidth={0.6} />
          <text x={L - 5} y={Y(g) + 3} fontSize={9.5} textAnchor="end" fill="var(--c-mute)">
            {fmt(g, dg)}
          </text>
        </g>
      ))}
      {ticksW.map((w) => (
        <g key={w}>
          <line x1={X(w)} y1={T} x2={X(w)} y2={H - B} stroke="var(--c-line)" strokeWidth={0.6} />
          <text x={X(w)} y={H - B + 13} fontSize={9.5} textAnchor="middle" fill="var(--c-mute)">
            {Math.round(w * 100)}
          </text>
        </g>
      ))}
      <text x={(L + W - R) / 2} y={H - 6} fontSize={10.5} textAnchor="middle" fill="var(--c-mute)">
        moulding water content w (%)
      </text>
      <text x={12} y={(T + H - B) / 2} fontSize={10.5} textAnchor="middle" fill="var(--c-mute)" transform={`rotate(-90 12 ${(T + H - B) / 2})`}>
        γd ({UNIT_LABEL[unit]})
      </text>
      {spec && (
        <rect x={X(Math.max(wLo, spec.lo))} y={Y(gHi)} width={Math.max(0, X(Math.min(wHi, spec.hi)) - X(Math.max(wLo, spec.lo)))} height={Math.max(0, Y(spec.gdMin) - Y(gHi))} fill="var(--c-good)" opacity={0.1} stroke="var(--c-good)" strokeDasharray="4 3" />
      )}
      {spec && (
        <text x={X(Math.max(wLo, spec.lo)) + 4} y={Y(spec.gdMin) - 4} fontSize={9.5} fill="var(--c-good)">
          spec window (γd ≥ {fmt(spec.gdMin, dg)})
        </text>
      )}
      <path d={sPath(1)} fill="none" stroke="var(--c-water)" strokeWidth={1.6} />
      {zLabelW !== undefined && (
        <text x={X(zLabelW) + 6} y={Y(gdAtS(zLabelW, Gs, 1, gw)) + 4} fontSize={9.5} fill="var(--c-water)">
          ZAV (S = 100 %)
        </text>
      )}
      {sLines.map((S) => (
        <g key={S}>
          <path d={sPath(S)} fill="none" stroke="var(--c-water)" strokeWidth={0.9} strokeDasharray="3 3" opacity={0.7} />
        </g>
      ))}
      {series.map((s, k) => (
        <g key={k} opacity={s.faint ? 0.45 : 1}>
          <path d={s.curve.map((p, i) => `${i ? 'L' : 'M'}${X(p.w).toFixed(1)},${Y(p.gd).toFixed(1)}`).join('')} fill="none" stroke={s.color} strokeWidth={2} strokeDasharray={s.faint ? '6 4' : undefined} />
          {s.pts.map((p, i) => (
            <circle key={i} cx={X(p.w)} cy={Y(p.gd)} r={3.6} fill="var(--c-bg)" stroke={s.color} strokeWidth={1.8} />
          ))}
          {s.peak && (
            <g>
              <line x1={X(s.peak.omc)} y1={Y(s.peak.mdd)} x2={X(s.peak.omc)} y2={H - B} stroke={s.color} strokeDasharray="2 3" />
              <line x1={L} y1={Y(s.peak.mdd)} x2={X(s.peak.omc)} y2={Y(s.peak.mdd)} stroke={s.color} strokeDasharray="2 3" />
              <circle cx={X(s.peak.omc)} cy={Y(s.peak.mdd)} r={4} fill={s.color} />
              <text x={X(s.peak.omc) + 6} y={Y(s.peak.mdd) - 6} fontSize={10.5} fontWeight={700} fill={s.color}>
                {s.label}: {fmt(s.peak.mdd, dg + 1)} at {fmt(s.peak.omc * 100, 1)} %
              </text>
            </g>
          )}
        </g>
      ))}
      {field.map((p, i) => (
        <g key={i}>
          <path d={`M${X(p.w) - 5},${Y(p.gd) - 5}L${X(p.w) + 5},${Y(p.gd) + 5}M${X(p.w) - 5},${Y(p.gd) + 5}L${X(p.w) + 5},${Y(p.gd) - 5}`} stroke={p.pass === undefined ? 'var(--c-ink)' : p.pass ? 'var(--c-good)' : 'var(--c-bad)'} strokeWidth={2.2} />
          <text x={X(p.w) + 7} y={Y(p.gd) + 4} fontSize={10} fill="var(--c-ink)">
            {p.label}
          </text>
        </g>
      ))}
      {sLines.length > 0 && (
        <text x={W - R - 2} y={T + 10} fontSize={9} textAnchor="end" fill="var(--c-water)">
          dashed: S = {sLines.map((s) => `${Math.round(s * 100)} %`).join(', ')}
        </text>
      )}
    </svg>
  )
}

// ---------------------------------------------------------------- theory sketches (qualitative, drawn from the model)
function mini(W: number, H: number, children: ReactNode, label: string) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[460px]" role="img" aria-label={label}>
      {children}
    </svg>
  )
}

/** four curve shapes by soil type (Das Fig 4.5) with their ZAV lines */
export function SoilTypeCurves() {
  const W = 460
  const H = 220
  const X = (w: number) => 40 + ((w - 0.04) / 0.3) * (W - 60)
  const Y = (g: number) => H - 30 - ((g - 13) / 7) * (H - 50)
  const path = (f: (w: number) => number, a = 0.04, b = 0.34) =>
    Array.from({ length: 61 }, (_, k) => a + ((b - a) * k) / 60)
      .map((w, i) => `${i ? 'L' : 'M'}${X(w).toFixed(1)},${Y(f(w)).toFixed(1)}`)
      .join('')
  const bell = (w: number) => modelCurve({ omc: 0.16, mdd: 17.6 }, 2.7, w)
  const onehalf = (w: number) => (w < 0.08 ? 16.3 - 18 * (w - 0.04) : w < 0.14 ? 15.6 + 22 * (w - 0.08) - 60 * (w - 0.08) ** 2 : Math.min(16.7 + 8 * (w - 0.14) - 120 * (w - 0.14) ** 2, gdAtS(w, 2.65, 0.97)))
  const dbl = (w: number) => 15.2 + 0.6 * Math.sin((w - 0.04) * 33) + 6 * (w - 0.04) - 30 * (w - 0.12) ** 2
  const odd = (w: number) => 14.6 + 1.3 * Math.exp(-(((w - 0.26) / 0.05) ** 2)) - 3 * (w - 0.26) ** 2
  return mini(
    W,
    H,
    <>
      <line x1={40} y1={H - 30} x2={W - 10} y2={H - 30} stroke="var(--c-line)" />
      <line x1={40} y1={10} x2={40} y2={H - 30} stroke="var(--c-line)" />
      <text x={W - 12} y={H - 14} fontSize={10} textAnchor="end" fill="var(--c-mute)">
        w →
      </text>
      <text x={10} y={18} fontSize={10} fill="var(--c-mute)">
        γd
      </text>
      <path d={path((w) => gdAtS(w, 2.7, 1))} fill="none" stroke="var(--c-water)" strokeWidth={1.3} />
      <text x={X(0.2)} y={Y(gdAtS(0.2, 2.7, 1)) - 5} fontSize={9.5} fill="var(--c-water)">
        ZAV
      </text>
      <path d={path(bell)} fill="none" stroke="var(--c-accent)" strokeWidth={2} />
      <text x={X(0.16)} y={Y(17.6) - 6} fontSize={9.5} textAnchor="middle" fill="var(--c-accent)">
        A bell-shaped (30 {'<'} LL {'<'} 70)
      </text>
      <path d={path(onehalf, 0.04, 0.2)} fill="none" stroke="var(--c-load)" strokeWidth={2} />
      <text x={X(0.05)} y={Y(16.3) - 6} fontSize={9.5} fill="var(--c-load)">
        B 1½ peaks (sand, LL {'<'} 30)
      </text>
      <path d={path(dbl, 0.04, 0.22)} fill="none" stroke="var(--c-good)" strokeWidth={2} />
      <text x={X(0.13)} y={Y(15.6) + 16} fontSize={9.5} fill="var(--c-good)">
        C double peak
      </text>
      <path d={path(odd, 0.14, 0.34)} fill="none" stroke="var(--c-accent2)" strokeWidth={2} />
      <text x={X(0.27)} y={Y(15.9) - 6} fontSize={9.5} fill="var(--c-accent2)">
        D odd (LL {'>'} 70)
      </text>
    </>,
    'compaction curves for four soil types',
  )
}

/** energy effect: Standard and Modified with the line of optimums */
export function EnergyCurves() {
  const W = 460
  const H = 220
  const Gs = 2.68
  const std = { omc: 0.16, mdd: 17.2 }
  const mod = shiftForEnergy(std, Gs, 4.55)
  const low = shiftForEnergy(std, Gs, 0.4)
  const X = (w: number) => 40 + ((w - 0.06) / 0.22) * (W - 60)
  const Y = (g: number) => H - 30 - ((g - 14.5) / 5.5) * (H - 50)
  const path = (f: (w: number) => number) =>
    Array.from({ length: 61 }, (_, k) => 0.06 + (0.22 * k) / 60)
      .map((w, i) => `${i ? 'L' : 'M'}${X(w).toFixed(1)},${Y(Math.max(14.5, f(w))).toFixed(1)}`)
      .join('')
  const S = shiftForEnergy(std, Gs, 1).S
  return mini(
    W,
    H,
    <>
      <line x1={40} y1={H - 30} x2={W - 10} y2={H - 30} stroke="var(--c-line)" />
      <line x1={40} y1={10} x2={40} y2={H - 30} stroke="var(--c-line)" />
      <text x={W - 12} y={H - 14} fontSize={10} textAnchor="end" fill="var(--c-mute)">
        w →
      </text>
      <text x={10} y={18} fontSize={10} fill="var(--c-mute)">
        γd
      </text>
      <path d={path((w) => gdAtS(w, Gs, 1))} fill="none" stroke="var(--c-water)" strokeWidth={1.3} />
      <path d={path((w) => gdAtS(w, Gs, S))} fill="none" stroke="var(--c-water)" strokeWidth={1} strokeDasharray="4 3" />
      <text x={X(0.235)} y={Y(gdAtS(0.235, Gs, 1)) - 4} fontSize={9.5} fill="var(--c-water)">
        ZAV
      </text>
      <text x={X(0.07)} y={Y(gdAtS(0.075, Gs, S)) + 14} fontSize={9.5} fill="var(--c-water)">
        line of optimums
      </text>
      {[
        { p: low, c: 'var(--c-mute)', t: 'low energy' },
        { p: std, c: 'var(--c-accent)', t: 'Standard' },
        { p: mod, c: 'var(--c-load)', t: 'Modified (4.55×)' },
      ].map(({ p, c, t }) => (
        <g key={t}>
          <path d={path((w) => modelCurve(p, Gs, w))} fill="none" stroke={c} strokeWidth={2} />
          <circle cx={X(p.omc)} cy={Y(p.mdd)} r={3.5} fill={c} />
          <text x={X(p.omc) + 6} y={Y(p.mdd) - 5} fontSize={9.5} fill={c}>
            {t}
          </text>
        </g>
      ))}
    </>,
    'compaction curves for three energies',
  )
}

/** sand-cone apparatus on the base plate over the hole */
export function SandConeFig() {
  return mini(
    380,
    210,
    <>
      <rect x={0} y={150} width={380} height={60} fill="var(--c-soil)" opacity={0.5} />
      <path d="M150,150 C150,190 230,190 230,150Z" fill="var(--c-bg)" stroke="var(--c-ink)" />
      <path d="M152,152 C155,184 225,184 228,152Z" fill="var(--c-load)" opacity={0.35} />
      <text x={240} y={186} fontSize={10} fill="var(--c-ink)">
        hole filled with Ottawa sand (W6)
      </text>
      <rect x={110} y={142} width={160} height={8} fill="var(--c-mute)" />
      <text x={275} y={150} fontSize={10} fill="var(--c-mute)">
        base plate
      </text>
      <path d="M160,142L190,105L190,95L220,95L220,105L250,142Z" fill="var(--c-load)" opacity={0.3} stroke="var(--c-ink)" />
      <text x={255} y={125} fontSize={10} fill="var(--c-ink)">
        cone (Wcone = W1 − W2)
      </text>
      <rect x={196} y={86} width={18} height={9} fill="var(--c-ink)" />
      <text x={220} y={93} fontSize={10} fill="var(--c-ink)">
        valve
      </text>
      <path d="M170,86 C165,30 245,30 240,86Z" fill="var(--c-load)" opacity={0.25} stroke="var(--c-ink)" />
      <text x={248} y={55} fontSize={10} fill="var(--c-ink)">
        jar + sand: W3 before, W5 after
      </text>
      <text x={8} y={20} fontSize={10.5} fill="var(--c-ink)">
        W6 = W3 − W5 − Wcone
      </text>
      <text x={8} y={36} fontSize={10.5} fill="var(--c-ink)">
        V = W6 / γsand,  γd = Wdry / V
      </text>
    </>,
    'sand cone apparatus',
  )
}

/** dry side flocculated, wet side dispersed */
export function StructureFig() {
  const parts = (x0: number, disp: boolean) =>
    Array.from({ length: 14 }, (_, k) => {
      const cx = x0 + 15 + (k % 4) * 22 + (k % 2) * 5
      const cy = 30 + Math.floor(k / 4) * 20
      const ang = disp ? 8 * Math.sin(k) : (k * 53) % 180
      return <line key={k} x1={cx - 9} y1={cy} x2={cx + 9} y2={cy} stroke="var(--c-ink)" strokeWidth={2.4} transform={`rotate(${ang} ${cx} ${cy})`} />
    })
  return mini(
    300,
    130,
    <>
      {parts(10, false)}
      {parts(170, true)}
      <text x={60} y={124} fontSize={10.5} textAnchor="middle" fill="var(--c-ink)">
        dry of OMC: flocculated
      </text>
      <text x={225} y={124} fontSize={10.5} textAnchor="middle" fill="var(--c-ink)">
        wet of OMC: dispersed
      </text>
    </>,
    'structure of compacted clay',
  )
}

// Bond & detailing sketches: standard cut-off figure, hook geometry, ACI cut-off rules, and the live lab sketches.

import { fmt } from '../../../components/DiagramView'
import { tipAxes } from '../../../components/PointTip'
import { momentAt, type CutoffOut, type Diagram } from '../../engine/bond'

const INK = 'var(--c-ink)'
const MUTE = 'var(--c-mute)'
const ACC = 'var(--c-accent)'
const BAD = 'var(--c-bad)'
const GOOD = 'var(--c-good)'
const LINE = 'var(--c-line)'
const PANEL = 'var(--c-panel2)'

/** 6.667 ft → 6'-8" */
export function ftIn(ft: number) {
  if (!Number.isFinite(ft)) return '—'
  let i = Math.round(ft * 12)
  const f = Math.floor(i / 12)
  i -= f * 12
  return `${f}'-${i}"`
}

function Arrow({ id, color = MUTE }: { id: string; color?: string }) {
  return (
    <marker id={id} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill={color} />
    </marker>
  )
}

/** horizontal dimension line with a label */
function DimH({ x1, x2, y, label, color = MUTE, mk, above = true, size = 10 }: { x1: number; x2: number; y: number; label: string; color?: string; mk: string; above?: boolean; size?: number }) {
  if (!Number.isFinite(x1) || !Number.isFinite(x2)) return null
  return (
    <g>
      <line x1={x1} x2={x2} y1={y} y2={y} stroke={color} strokeWidth={1} markerStart={`url(#${mk})`} markerEnd={`url(#${mk})`} />
      <line x1={x1} x2={x1} y1={y - 4} y2={y + 4} stroke={color} strokeWidth={0.8} />
      <line x1={x2} x2={x2} y1={y - 4} y2={y + 4} stroke={color} strokeWidth={0.8} />
      <text x={(x1 + x2) / 2} y={above ? y - 4 : y + 12} fontSize={size} textAnchor="middle" fill={color} className="num">
        {label}
      </text>
    </g>
  )
}

function Hatch({ id }: { id: string }) {
  return (
    <pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="6" stroke={MUTE} strokeWidth={1} />
    </pattern>
  )
}

// ---------------------------------------------------------------- Fig. 5.20 / 6.21 standard cut-off and bend points
export function StdCutoffFig({ L1, L2, mode = 'both' }: { L1?: number; L2?: number; mode?: 'straight' | 'bent' | 'both' }) {
  const lab = (frac: string, L: number | undefined, k: number, s: '1' | '2') => (L ? `L${s}/${frac} = ${ftIn(L / k)}` : `L${s}/${frac}`)
  const W = 250
  const xA = 40
  const xB1 = xA + W
  const xB2 = xB1 + 24
  const xC1 = xB2 + W
  const xC2 = xC1 + 24
  const xEnd = xC2 + 26
  const panel = (kind: 'straight' | 'bent', oy: number) => {
    const yT = oy + 40
    const yB = oy + 80
    const top = yT + 6
    const bot = yB - 6
    const bot2 = yB - 11
    const mk = 'scA' + kind
    return (
      <g key={kind}>
        {/* exterior support (spandrel/wall) and columns */}
        <rect x={xA - 14} y={oy + 8} width={14} height={110} fill="url(#scH)" stroke={MUTE} />
        <rect x={xB1} y={oy + 8} width={24} height={110} fill={PANEL} stroke={MUTE} />
        <rect x={xC1} y={oy + 8} width={24} height={110} fill={PANEL} stroke={MUTE} />
        <rect x={xA} y={yT} width={xEnd - xA} height={yB - yT} fill="none" stroke={INK} strokeWidth={1.2} />
        <path d={`M${xEnd} ${yT - 4} l6 12 l-8 8 l6 12 l-6 12`} fill="none" stroke={MUTE} />
        {kind === 'straight' ? (
          <>
            {/* top bars */}
            <path d={`M${xA + W / 4} ${top} H${xA - 8} V${top + 22}`} fill="none" stroke={BAD} strokeWidth={2.2} />
            <line x1={xB1 - W / 3} x2={xB2 + W / 3} y1={top} y2={top} stroke={BAD} strokeWidth={2.2} />
            <line x1={xC1 - W / 3} x2={xEnd} y1={top} y2={top} stroke={BAD} strokeWidth={2.2} />
            {/* bottom: half run 6 in into supports, half stop L/8 from faces */}
            <line x1={xA - 8} x2={xB1 + 8} y1={bot} y2={bot} stroke={ACC} strokeWidth={2.2} />
            <line x1={xB2 - 8} x2={xC1 + 8} y1={bot} y2={bot} stroke={ACC} strokeWidth={2.2} />
            <line x1={xA + W / 8} x2={xB1 - W / 8} y1={bot2} y2={bot2} stroke={ACC} strokeWidth={2.2} strokeDasharray="7 3" />
            <line x1={xB2 + W / 8} x2={xC1 - W / 8} y1={bot2} y2={bot2} stroke={ACC} strokeWidth={2.2} strokeDasharray="7 3" />
            <DimH x1={xA} x2={xA + W / 4} y={oy + 26} label={lab('4', L1, 4, '1')} mk={mk} />
            <DimH x1={xB1 - W / 3} x2={xB1} y={oy + 26} label={lab('3', L1, 3, '1')} mk={mk} />
            <DimH x1={xB2} x2={xB2 + W / 3} y={oy + 26} label={lab('3', L2 ?? L1, 3, L2 ? '2' : '1')} mk={mk} />
            <DimH x1={xC1 - W / 3} x2={xC1} y={oy + 26} label={lab('3', L2 ?? L1, 3, L2 ? '2' : '1')} mk={mk} />
            <DimH x1={xB1 - W / 8} x2={xB1} y={yB + 14} label={lab('8', L1, 8, '1')} mk={mk} above={false} />
            <DimH x1={xB2} x2={xB2 + W / 8} y={yB + 14} label={lab('8', L2 ?? L1, 8, L2 ? '2' : '1')} mk={mk} above={false} />
            <DimH x1={xA} x2={xA + W / 8} y={yB + 14} label={lab('8', L1, 8, '1')} mk={mk} above={false} />
            <text x={xA - 10} y={yB + 30} fontSize={9.5} fill={ACC}>
              6″ into support
            </text>
          </>
        ) : (
          <>
            <line x1={xB1 - W / 3} x2={xB2 + W / 3} y1={top} y2={top} stroke={BAD} strokeWidth={2.2} />
            <line x1={xC1 - W / 3} x2={xEnd} y1={top} y2={top} stroke={BAD} strokeWidth={2.2} />
            {/* bent bar of span 1: up at L/7 at the exterior end, up at L/4 at B, over B */}
            <path d={`M${xA - 8} ${top + 20} V${top + 2} H${xA + W / 7} L${xA + W / 7 + 16} ${bot2} H${xB1 - W / 4 - 16} L${xB1 - W / 4} ${top + 3} H${xB2 + W / 3 - 20}`} fill="none" stroke={GOOD} strokeWidth={2.2} />
            {/* bent bar of span 2 */}
            <path d={`M${xB1 - W / 3 + 20} ${top + 6} H${xB2 + W / 4} L${xB2 + W / 4 + 16} ${bot2} H${xC1 - W / 4 - 16} L${xC1 - W / 4} ${top + 3} H${xEnd}`} fill="none" stroke={GOOD} strokeWidth={2.2} strokeDasharray="7 3" />
            <line x1={xA - 8} x2={xB1 + 8} y1={bot} y2={bot} stroke={ACC} strokeWidth={2.2} />
            <line x1={xB2 - 8} x2={xC1 + 8} y1={bot} y2={bot} stroke={ACC} strokeWidth={2.2} />
            <DimH x1={xB1 - W / 3} x2={xB1} y={oy + 26} label={lab('3', L1, 3, '1')} mk={mk} />
            <DimH x1={xB2} x2={xB2 + W / 3} y={oy + 26} label={lab('3', L2 ?? L1, 3, L2 ? '2' : '1')} mk={mk} />
            <DimH x1={xC1 - W / 3} x2={xC1} y={oy + 26} label={lab('3', L2 ?? L1, 3, L2 ? '2' : '1')} mk={mk} />
            <DimH x1={xA} x2={xA + W / 7} y={yB + 14} label={lab('7', L1, 7, '1')} mk={mk} above={false} />
            <DimH x1={xB1 - W / 4} x2={xB1} y={yB + 14} label={lab('4', L1, 4, '1')} mk={mk} above={false} />
            <DimH x1={xB2} x2={xB2 + W / 4} y={yB + 14} label={lab('4', L2 ?? L1, 4, L2 ? '2' : '1')} mk={mk} above={false} />
            <DimH x1={xC1 - W / 4} x2={xC1} y={yB + 14} label={lab('4', L2 ?? L1, 4, L2 ? '2' : '1')} mk={mk} above={false} />
          </>
        )}
        <DimH x1={xA} x2={xB1} y={oy + 130} label={L1 ? `L1 = ${ftIn(L1)} (clear)` : 'L1 (clear span)'} mk={mk} above={false} />
        <DimH x1={xB2} x2={xC1} y={oy + 130} label={L2 || L1 ? `L2 = ${ftIn(L2 ?? L1!)} (clear)` : 'L2 (clear span)'} mk={mk} above={false} />
        <text x={xA} y={oy + 4} fontSize={11} fontWeight={700} fill={INK}>
          {kind === 'straight' ? '(a) Straight bars' : '(b) Bent (cranked) bars'}
        </text>
      </g>
    )
  }
  const panels = mode === 'both' ? (['straight', 'bent'] as const) : [mode]
  const H = panels.length * 160 + 10
  return (
    <svg viewBox={`0 0 ${xEnd + 20} ${H}`} className="w-full h-auto">
      <defs>
        <Arrow id="scAstraight" />
        <Arrow id="scAbent" />
        <Hatch id="scH" />
      </defs>
      {panels.map((k, i) => panel(k, 12 + i * 160))}
      <g fontSize={9.5}>
        <line x1={xA} x2={xA + 22} y1={H - 6} y2={H - 6} stroke={BAD} strokeWidth={2.2} />
        <text x={xA + 26} y={H - 3} fill={MUTE}>
          top (−) bars
        </text>
        <line x1={xA + 100} x2={xA + 122} y1={H - 6} y2={H - 6} stroke={ACC} strokeWidth={2.2} />
        <text x={xA + 126} y={H - 3} fill={MUTE}>
          bottom (+) bars (dashed = 50 % cut)
        </text>
        {mode !== 'straight' && (
          <>
            <line x1={xA + 310} x2={xA + 332} y1={H - 6} y2={H - 6} stroke={GOOD} strokeWidth={2.2} />
            <text x={xA + 336} y={H - 3} fill={MUTE}>
              bent bars
            </text>
          </>
        )}
      </g>
    </svg>
  )
}

// ---------------------------------------------------------------- standard hooks (ACI 25.3)
export function HookFig({ db, no, ldh }: { db?: number; no?: number; ldh?: number } = {}) {
  const num = db !== undefined && no !== undefined
  const Dk = no === undefined ? null : no <= 8 ? 6 : no <= 11 ? 8 : 10
  const D = num && Dk ? `${Dk}db = ${fmt(Dk * db!, 2)} in` : '6db (#3–8) · 8db (#9–11) · 10db (#14, 18)'
  const t90 = num ? `12db = ${fmt(12 * db!, 2)} in` : '12db'
  const t180 = num ? `4db ≥ 2½ in = ${fmt(Math.max(4 * db!, 2.5), 2)} in` : '4db ≥ 2½ in'
  const r = 22
  return (
    <svg viewBox="0 0 640 250" className="w-full h-auto">
      <defs>
        <Arrow id="hkA" />
      </defs>
      {/* 90° hook */}
      <text x={20} y={18} fontSize={11.5} fontWeight={700} fill={INK}>
        90° standard hook
      </text>
      <line x1={50} x2={50} y1={30} y2={210} stroke={MUTE} strokeDasharray="4 3" />
      <text x={46} y={222} fontSize={9.5} fill={MUTE} textAnchor="middle">
        critical section
      </text>
      <path d={`M50 60 H220 A${r} ${r} 0 0 1 ${220 + r} ${60 + r} V200`} fill="none" stroke={BAD} strokeWidth={7} strokeLinecap="butt" />
      <DimH x1={50} x2={220 + r + 3.5} y={40} label={ldh ? `ldh = ${fmt(ldh, 1)} in` : 'ldh (to the outside of the hook)'} mk="hkA" />
      <line x1={220 + r + 18} x2={220 + r + 18} y1={60 + r} y2={200} stroke={MUTE} markerStart="url(#hkA)" markerEnd="url(#hkA)" />
      <text x={220 + r + 24} y={150} fontSize={10} fill={MUTE}>
        {t90}
      </text>
      <text x={220 + r + 24} y={164} fontSize={9.5} fill={MUTE}>
        extension
      </text>
      <text x={180} y={102} fontSize={9.5} fill={ACC} textAnchor="end">
        inside bend dia. D
      </text>
      <text x={180} y={115} fontSize={9.5} fill={ACC} textAnchor="end">
        {num ? D : '6db / 8db / 10db'}
      </text>
      <circle cx={220} cy={60 + r} r={r - 3.5} fill="none" stroke={ACC} strokeDasharray="3 2" />
      {/* 180° hook */}
      <text x={350} y={18} fontSize={11.5} fontWeight={700} fill={INK}>
        180° standard hook
      </text>
      <line x1={370} x2={370} y1={30} y2={210} stroke={MUTE} strokeDasharray="4 3" />
      <path d={`M370 70 H560 A${r + 6} ${r + 6} 0 0 1 560 ${70 + 2 * (r + 6)} H505`} fill="none" stroke={BAD} strokeWidth={7} />
      <DimH x1={370} x2={560 + r + 6 + 3.5} y={50} label={ldh ? `ldh = ${fmt(ldh, 1)} in` : 'ldh'} mk="hkA" />
      <DimH x1={505} x2={560} y={70 + 2 * (r + 6) + 20} label={t180} mk="hkA" above={false} />
      <text x={400} y={200} fontSize={9.5} fill={MUTE}>
        bend D as for the 90° hook; extension parallel to the bar
      </text>
      <text x={20} y={240} fontSize={9.5} fill={MUTE}>
        {num ? `D = ${D}. ` : `D = ${D}. `}ldh ≥ max(8db, 6 in). Stirrup/tie hooks: 90° 6db ≥ 3 in (#3–5) or 12db (#6–8); 135° 6db ≥ 3 in.
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------- ACI cut-off requirements (Fig. 5.19, half span)
export function CutoffRulesFig() {
  const X0 = 60
  const W = 520
  const base = 120
  const par = (x: number) => 4 * (x / W) * (1 - x / W) // 0..1 at midspan at x = W/2
  const pts = Array.from({ length: 41 }, (_, k) => {
    const x = (k / 40) * W
    return `${X0 + x},${base - 85 * par(x)}`
  }).join(' ')
  const cap = 0.62
  // where par = cap
  const xt = (W / 2) * (1 - Math.sqrt(1 - cap))
  return (
    <svg viewBox="0 0 640 250" className="w-full h-auto">
      <defs>
        <Arrow id="crA" />
      </defs>
      <line x1={X0} x2={X0 + W} y1={base} y2={base} stroke={MUTE} />
      <polyline points={pts} fill="color-mix(in oklab, var(--c-accent) 12%, transparent)" stroke={ACC} strokeWidth={1.6} />
      <line x1={X0} x2={X0 + W} y1={base - 85 * cap} y2={base - 85 * cap} stroke={BAD} strokeDasharray="5 3" />
      <text x={X0 + W - 4} y={base - 85 * cap - 4} fontSize={9.5} fill={BAD} textAnchor="end">
        φMn of the continuing bars
      </text>
      <text x={X0 + W / 2} y={base - 92} fontSize={9.5} fill={ACC} textAnchor="middle">
        Mu (factored moment diagram)
      </text>
      <line x1={X0 + xt} x2={X0 + xt} y1={base - 85 * cap} y2={225} stroke={MUTE} strokeDasharray="2 2" />
      <text x={X0 + xt + 3} y={base + 12} fontSize={9.5} fill={INK}>
        theoretical cut-off point
      </text>
      {/* bars */}
      <rect x={X0 - 30} y={150} width={30} height={60} fill="url(#crH)" stroke={MUTE} />
      <line x1={X0 - 12} x2={X0 + W} y1={200} y2={200} stroke={ACC} strokeWidth={3} />
      <line x1={X0 + xt - 40} x2={X0 + W} y1={190} y2={190} stroke={BAD} strokeWidth={3} />
      <DimH x1={X0 + xt - 40} x2={X0 + xt} y={172} label="d or 12db" mk="crA" size={9.5} />
      <DimH x1={X0 + xt - 40} x2={X0 + W / 2} y={160} label="≥ ld from the point of max stress (cut bars)" mk="crA" size={9.5} />
      <DimH x1={X0 - 12} x2={X0 + xt} y={222} label="≥ ld for the continuing bars (past the cut-off point)" mk="crA" above={false} size={9.5} />
      <text x={X0 - 28} y={146} fontSize={9.5} fill={MUTE}>
        support
      </text>
      <text x={X0 + 4} y={214} fontSize={9.5} fill={ACC}>
        ≥ ⅓ of +As (¼ continuous) 6″ into support
      </text>
      <line x1={X0 + W / 2} x2={X0 + W / 2} y1={20} y2={225} stroke={LINE} strokeDasharray="4 3" />
      <text x={X0 + W / 2 + 3} y={30} fontSize={9.5} fill={MUTE}>
        ℄ (max moment)
      </text>
      <defs>
        <Hatch id="crH" />
      </defs>
    </svg>
  )
}

// ---------------------------------------------------------------- variable-depth cantilever (curtailment)
export function TaperCantFig() {
  return (
    <svg viewBox="0 0 640 230" className="w-full h-auto">
      <defs>
        <Arrow id="tcA" />
        <Hatch id="tcH" />
      </defs>
      <rect x={30} y={20} width={50} height={170} fill="url(#tcH)" stroke={MUTE} />
      <path d={`M80 50 H580 V110 L80 160 Z`} fill={PANEL} stroke={INK} />
      <path d={`M60 140 V58 H574`} fill="none" stroke={BAD} strokeWidth={2.6} />
      <path d={`M54 140 V64 H330`} fill="none" stroke={BAD} strokeWidth={2.6} strokeDasharray="7 3" />
      <line x1={575} x2={575} y1={10} y2={45} stroke={ACC} strokeWidth={2} markerEnd="url(#tcA)" />
      <text x={583} y={24} fontSize={10.5} fill={ACC}>
        P
      </text>
      {/* moment line (linear) and capacity with varying d */}
      <line x1={80} x2={580} y1={215} y2={215} stroke={MUTE} />
      <path d="M80 175 L580 215" fill="none" stroke={ACC} strokeWidth={1.6} />
      <path d="M80 190 L580 205" fill="none" stroke={BAD} strokeDasharray="5 3" />
      <text x={300} y={228} fontSize={9.5} fill={MUTE} textAnchor="middle">
        M = P·x (linear) vs φMn of the continuing 50 % (falls as d falls)
      </text>
      <line x1={270} x2={270} y1={50} y2={215} stroke={MUTE} strokeDasharray="2 2" />
      <text x={274} y={102} fontSize={9.5} fill={INK}>
        theoretical cut
      </text>
      <DimH x1={270} x2={330} y={40} label="d or 12db (d at that section)" mk="tcA" size={9} />
      <text x={90} y={78} fontSize={9.5} fill={MUTE}>
        cut bars hooked into the column (ldh) and ≥ ld from the face
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------- bond cracks
export function BondCrackFig() {
  return (
    <svg viewBox="0 0 640 170" className="w-full h-auto">
      <rect x={30} y={30} width={360} height={80} fill={PANEL} stroke={INK} />
      <line x1={30} x2={390} y1={96} y2={96} stroke={BAD} strokeWidth={3} />
      {[60, 110, 160, 210].map((x) => (
        <path key={x} d={`M${x} 110 l3 -18 l-2 -14`} fill="none" stroke={INK} strokeWidth={1} />
      ))}
      <path d="M30 96 L390 96" stroke={ACC} strokeWidth={1} strokeDasharray="3 3" transform="translate(0 6)" />
      <text x={210} y={128} fontSize={9.5} fill={ACC} textAnchor="middle">
        splitting crack along the bar (side / bottom face) — bond crack
      </text>
      <text x={210} y={22} fontSize={10.5} fontWeight={700} fill={INK} textAnchor="middle">
        Elevation
      </text>
      <rect x={450} y={30} width={140} height={100} fill={PANEL} stroke={INK} />
      {[480, 520, 560].map((x) => (
        <circle key={x} cx={x} cy={110} r={6} fill={BAD} />
      ))}
      <path d="M474 110 H486 M514 110 H526 M554 110 H566" stroke={INK} />
      <path d="M480 116 V130 M520 116 V130 M560 116 V130" stroke={ACC} strokeWidth={1.2} />
      <path d="M450 110 H474 M566 110 H590" stroke={ACC} strokeWidth={1.2} />
      <text x={520} y={150} fontSize={9.5} fill={MUTE} textAnchor="middle">
        horizontal plane (small spacing) or
      </text>
      <text x={520} y={162} fontSize={9.5} fill={MUTE} textAnchor="middle">
        vertical cracks through the cover
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------- lab: beam cross-section
export function SectionSketch({ b, h, cover, ds, db, n, top, governs }: { b: number; h: number; cover: number; ds: number; db: number; n: number; top: boolean; governs: 'spacing' | 'side' | 'face' }) {
  const S = Math.min(220 / b, 170 / h)
  const W = b * S
  const H = h * S
  const x0 = 60
  const y0 = 20
  const cS = cover + ds + db / 2
  const yBar = top ? y0 + cS * S : y0 + H - cS * S
  const xs = n > 1 ? Array.from({ length: n }, (_, k) => x0 + (cS + (k * (b - 2 * cS)) / (n - 1)) * S) : [x0 + W / 2]
  const e = (cover + ds / 2) * S
  return (
    <svg viewBox={`0 0 ${W + 140} ${H + 50}`} className="w-full h-auto max-w-sm">
      <defs>
        <Arrow id="ssA" />
      </defs>
      <rect x={x0} y={y0} width={W} height={H} fill={PANEL} stroke={INK} strokeWidth={1.4} />
      {ds > 0 && <rect x={x0 + e} y={y0 + e} width={W - 2 * e} height={H - 2 * e} rx={4} fill="none" stroke={MUTE} strokeWidth={Math.max(1, ds * S)} />}
      {xs.map((x, k) => (
        <circle key={k} cx={x} cy={yBar} r={(db * S) / 2} fill={BAD} />
      ))}
      {governs === 'spacing' && n > 1 ? (
        <line x1={x0} x2={x0 + W} y1={yBar} y2={yBar} stroke={ACC} strokeDasharray="5 3" />
      ) : (
        <line x1={xs[0]} x2={xs[0]} y1={top ? y0 : yBar} y2={top ? yBar : y0 + H} stroke={ACC} strokeDasharray="5 3" />
      )}
      {n > 1 && <DimH x1={xs[0] + (db * S) / 2} x2={xs[1] - (db * S) / 2} y={top ? yBar + 18 : yBar - 14} label="clear s" mk="ssA" size={9} />}
      <DimH x1={x0} x2={x0 + W} y={y0 + H + 14} label={`b = ${fmt(b)} in`} mk="ssA" above={false} size={10} />
      <text x={x0 + W + 8} y={y0 + 12} fontSize={9.5} fill={MUTE}>
        h = {fmt(h)} in
      </text>
      <text x={x0 + W + 8} y={y0 + 26} fontSize={9.5} fill={MUTE}>
        {n} bars, {top ? 'top' : 'bottom'}
      </text>
      <text x={x0 + W + 8} y={y0 + 40} fontSize={9.5} fill={ACC}>
        splitting plane:
      </text>
      <text x={x0 + W + 8} y={y0 + 53} fontSize={9.5} fill={ACC}>
        {governs === 'spacing' ? 'horizontal (½ spacing)' : governs === 'side' ? 'vertical (side cover)' : 'vertical (top/bottom cover)'}
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------- lab: anchorage into a column
export function AnchorSketch({ colDepth, backCover, req, kind, db, ok, tail }: { colDepth: number; backCover: number; req: number; kind: 'straight' | 'hook'; db: number; ok: boolean; tail?: number }) {
  const S = Math.min(300 / Math.max(colDepth, 1), 10)
  const cw = colDepth * S
  const x0 = 40
  const xFace = x0 + cw
  const yBeamT = 50
  const yBar = yBeamT + 14
  const reqPx = req * S
  const over = xFace - reqPx < x0
  const xEnd = Math.max(xFace - reqPx, 6)
  const tailPx = Math.min((tail ?? 12 * db) * S, 140)
  const col = ok ? GOOD : BAD
  return (
    <svg viewBox={`0 0 ${xFace + 230} 250`} className="w-full h-auto">
      <defs>
        <Arrow id="anA" />
        <Arrow id="anB" color={col} />
      </defs>
      <rect x={x0} y={10} width={cw} height={230} fill={PANEL} stroke={INK} />
      <rect x={xFace} y={yBeamT} width={210} height={60} fill={PANEL} stroke={INK} />
      <line x1={xFace} x2={xFace} y1={yBeamT} y2={yBeamT + 60} stroke={PANEL} strokeWidth={2} />
      <line x1={x0 + backCover * S} x2={x0 + backCover * S} y1={10} y2={240} stroke={MUTE} strokeDasharray="3 3" />
      {kind === 'hook' ? (
        <path d={`M${xFace + 200} ${yBar} H${xEnd + 10} A10 10 0 0 0 ${xEnd} ${yBar + 10} V${yBar + 10 + tailPx}`} fill="none" stroke={col} strokeWidth={3.5} />
      ) : (
        <line x1={xFace + 200} x2={xEnd} y1={yBar} y2={yBar} stroke={col} strokeWidth={3.5} />
      )}
      <DimH x1={x0 + backCover * S} x2={xFace} y={30} label={`available = ${fmt(colDepth)} − ${fmt(backCover)} = ${fmt(colDepth - backCover, 2)} in`} mk="anA" size={9.5} />
      <DimH x1={xEnd} x2={xFace} y={yBeamT + 82} label={`${kind === 'hook' ? 'ldh' : 'ld'} = ${fmt(req, 1)} in`} mk="anB" color={col} above={false} size={10} />
      <text x={xFace + 6} y={yBeamT + 50} fontSize={9.5} fill={MUTE}>
        column face (critical section)
      </text>
      <text x={xFace + 10} y={yBeamT - 6} fontSize={10} fill={col} fontWeight={700}>
        {ok ? '✓ fits' : '✗ does not fit'}
      </text>
      {over && (
        <text x={x0 + 4} y={226} fontSize={9.5} fill={BAD}>
          needs {fmt(req - colDepth, 1)} in more than the whole column depth
        </text>
      )}
    </svg>
  )
}

// ---------------------------------------------------------------- lab: lap splice
export function LapSketch({ lst, label }: { lst: number; label: string }) {
  return (
    <svg viewBox="0 0 560 90" className="w-full h-auto max-w-xl">
      <defs>
        <Arrow id="lpA" />
      </defs>
      <line x1={20} x2={360} y1={40} y2={40} stroke={BAD} strokeWidth={3.5} />
      <line x1={200} x2={540} y1={47} y2={47} stroke={ACC} strokeWidth={3.5} />
      <DimH x1={200} x2={360} y={72} label={`${label} = ${fmt(lst, 1)} in`} mk="lpA" above={false} size={10.5} />
      <text x={20} y={30} fontSize={9.5} fill={MUTE}>
        bar 1
      </text>
      <text x={540} y={65} fontSize={9.5} fill={MUTE} textAnchor="end">
        bar 2
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------- lab: compression dowel
export function DowelSketch({ ldc }: { ldc: number }) {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-auto max-w-xs">
      <defs>
        <Arrow id="dwA" />
      </defs>
      <rect x={110} y={10} width={80} height={110} fill={PANEL} stroke={INK} />
      <rect x={30} y={120} width={240} height={70} fill={PANEL} stroke={INK} />
      <line x1={130} x2={130} y1={20} y2={170} stroke={BAD} strokeWidth={3.5} />
      <line x1={170} x2={170} y1={20} y2={170} stroke={BAD} strokeWidth={3.5} />
      <line x1={210} x2={210} y1={120} y2={170} stroke={MUTE} markerStart="url(#dwA)" markerEnd="url(#dwA)" />
      <text x={216} y={150} fontSize={10} fill={MUTE}>
        ldc = {fmt(ldc, 1)} in
      </text>
      <text x={150} y={8} fontSize={9.5} fill={MUTE} textAnchor="middle">
        column bars in compression
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------- lab: cut-off on a moment diagram
export function CutoffSketch({ dg, r, nTotal, nCut, ldIn }: { dg: Diagram; r: CutoffOut; nTotal: number; nCut: number; ldIn: number }) {
  const W = 540
  const x0 = 50
  const L = dg.L
  const X = (x: number) => x0 + (Math.max(0, Math.min(L, x)) / L) * W
  const yT = 30
  const yB = 62
  const base = 150
  const Mmax = Math.max(r.Mmax, r.all.phiMn, 1e-6)
  const sc = 70 / Mmax
  const N = 80
  const pts = Array.from({ length: N + 1 }, (_, k) => {
    const x = (k / N) * L
    const m = momentAt(dg, x)
    return `${X(x)},${base + Math.max(-40, m * sc)}`
  }).join(' ')
  const topBars = dg.kind !== 'ss'
  const yBar = topBars ? yT + 6 : yB - 6
  const yCut = topBars ? yT + 11 : yB - 11
  const contEnd = dg.kind === 'cant' ? L : dg.kind === 'cont' ? (r.ip ?? 0) + (r.ipExt ?? 0) / 12 : L
  return (
    <svg viewBox={`0 0 ${x0 + W + 40} 250`} className="w-full h-auto">
      <defs>
        <Arrow id="coA" />
        <Hatch id="coH" />
      </defs>
      {/* supports */}
      {dg.kind === 'ss' ? (
        <>
          <path d={`M${x0} ${yB} l-8 12 h16 z`} fill="none" stroke={INK} />
          <path d={`M${x0 + W} ${yB} l-8 12 h16 z`} fill="none" stroke={INK} />
        </>
      ) : (
        <rect x={x0 - 24} y={yT - 18} width={24} height={yB - yT + 36} fill="url(#coH)" stroke={MUTE} />
      )}
      {dg.kind === 'cont' && <rect x={x0 + W} y={yT - 18} width={20} height={yB - yT + 36} fill="url(#coH)" stroke={MUTE} />}
      <rect x={x0} y={yT} width={W} height={yB - yT} fill={PANEL} stroke={INK} />
      {/* continuing bars */}
      {dg.kind === 'ss' ? (
        <line x1={x0 - 6} x2={x0 + W + 6} y1={yBar} y2={yBar} stroke={ACC} strokeWidth={2.6} />
      ) : (
        <path d={`M${x0 - 14} ${yBar + 16} V${yBar} H${X(contEnd)}`} fill="none" stroke={ACC} strokeWidth={2.6} />
      )}
      {/* cut bars */}
      {nCut > 0 &&
        (dg.kind === 'ss' ? (
          <line x1={X(r.xCut)} x2={X(L - r.xCut)} y1={yCut} y2={yCut} stroke={BAD} strokeWidth={2.6} />
        ) : (
          <path d={`M${x0 - 18} ${yCut + 14} V${yCut} H${X(r.xCut)}`} fill="none" stroke={BAD} strokeWidth={2.6} />
        ))}
      {/* moment diagram */}
      <g {...tipAxes({ X, Y: (m) => base + m * sc, xAt: [0, L], yAt: [0, Mmax], x: 'x', xUnit: ' ft', y: 'M', yUnit: ' k-ft' })}>
        <line x1={x0} x2={x0 + W} y1={base} y2={base} stroke={MUTE} />
        <polyline points={pts} fill="none" stroke={ACC} strokeWidth={1.6} data-name="Mu" />
        <line x1={x0} x2={x0 + W} y1={base + r.all.phiMn * sc} y2={base + r.all.phiMn * sc} stroke={MUTE} strokeDasharray="4 3" data-curve data-name={`φMn ${nTotal} bars`} />
        <line x1={x0} x2={x0 + W} y1={base + r.remain.phiMn * sc} y2={base + r.remain.phiMn * sc} stroke={BAD} strokeDasharray="5 3" data-curve data-name={`φMn ${nTotal - nCut} bars`} />
      </g>
      <text x={x0 + W + 4} y={base + r.all.phiMn * sc + 3} fontSize={9} fill={MUTE}>
        φMn {nTotal}
      </text>
      <text x={x0 + W + 4} y={base + r.remain.phiMn * sc + 3} fontSize={9} fill={BAD}>
        φMn {nTotal - nCut}
      </text>
      {/* theoretical / actual cut */}
      <line x1={X(r.xTheo)} x2={X(r.xTheo)} y1={yT} y2={base + r.remain.phiMn * sc} stroke={MUTE} strokeDasharray="2 2" />
      <line x1={X(r.xCut)} x2={X(r.xCut)} y1={yT - 10} y2={yB + 10} stroke={BAD} />
      <text x={X(r.xTheo) + 3} y={yB + 22} fontSize={9.5} fill={MUTE}>
        theoretical {fmt(r.xTheo, 2)} ft
      </text>
      <text x={X(r.xCut) + 3} y={yT - 12} fontSize={9.5} fill={BAD} fontWeight={700}>
        cut at {fmt(r.xCut, 2)} ft ({ftIn(r.xCut)})
      </text>
      {dg.kind === 'cont' && r.ip !== undefined && Number.isFinite(r.ip) && (
        <>
          <line x1={X(r.ip)} x2={X(r.ip)} y1={base - 8} y2={base + 8} stroke={INK} />
          <text x={X(r.ip) + 3} y={base - 10} fontSize={9} fill={INK}>
            IP {fmt(r.ip, 2)} ft
          </text>
        </>
      )}
      <text x={x0} y={240} fontSize={9.5} fill={MUTE}>
        {dg.kind === 'ss' ? 'Mu (sagging) drawn below the axis' : 'Mu (hogging) drawn below the axis; distances from the support face'} · ld = {fmt(ldIn, 1)} in · extension max(d, 12db) = {fmt(r.ext, 1)} in
      </text>
      <DimH x1={x0} x2={x0 + W} y={yB + 36} label={`L = ${fmt(L, 2)} ft`} mk="coA" above={false} size={9.5} />
    </svg>
  )
}

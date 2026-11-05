// Soil structure sketches (AJK sir's Topic 4A), deposit tree and geological cycle (outside the slides).
import type { ReactNode } from 'react'
import { rng } from '../../../labs/common'

export type StructKind = 'dense' | 'loose' | 'honeycomb' | 'collapsed' | 'clay' | 'flocculated' | 'dispersed' | 'skeleton' | 'matrix'

export const STRUCT_LABEL: Record<StructKind, string> = {
  dense: 'Single grained (dense)',
  loose: 'Single grained (loose)',
  honeycomb: 'Honeycomb',
  collapsed: 'Honeycomb after vibration',
  clay: 'Clay particle (charges)',
  flocculated: 'Flocculated',
  dispersed: 'Dispersed',
  skeleton: 'Coarse-grained skeleton',
  matrix: 'Cohesive matrix',
}

const W = 160
const H = 112
const SOIL = 'color-mix(in oklab, var(--c-soil) 75%, transparent)'
const grain = (x: number, y: number, r: number, k: string | number) => <circle key={k} cx={x} cy={y} r={r} fill={SOIL} stroke="var(--c-ink)" strokeWidth={0.8} />
const plate = (x: number, y: number, len: number, ang: number, k: string | number, col = 'var(--c-accent)') => {
  const dx = (Math.cos(ang) * len) / 2
  const dy = (Math.sin(ang) * len) / 2
  return <line key={k} x1={x - dx} y1={y - dy} x2={x + dx} y2={y + dy} stroke={col} strokeWidth={3} strokeLinecap="round" />
}

function body(kind: StructKind): ReactNode[] {
  const out: ReactNode[] = []
  const r = rng(kind.length * 97 + 11)
  if (kind === 'dense') {
    const R = 9
    for (let row = 0; row * R * 1.73 < H + R; row++) for (let i = 0; i * 2 * R < W + R; i++) out.push(grain(i * 2 * R + (row % 2 ? R : 0) + 4, row * R * 1.73 + 8, R - 0.4, `${row}-${i}`))
  } else if (kind === 'loose') {
    const R = 9
    for (let row = 0; row * 2.4 * R < H; row++) for (let i = 0; i * 2.4 * R < W; i++) if (r() > 0.18) out.push(grain(i * 2.4 * R + 10 + (r() - 0.5) * 4, row * 2.4 * R + 10 + (r() - 0.5) * 4, R - 0.4, `${row}-${i}`))
  } else if (kind === 'honeycomb') {
    const R = 3.2
    for (let a = 0; a < 3; a++)
      for (let b = 0; b < 2; b++) {
        const cx = 28 + a * 52
        const cy = 30 + b * 52
        for (let t = 0; t < 12; t++) {
          const th = (t / 12) * Math.PI * 2
          out.push(grain(cx + 22 * Math.cos(th), cy + 22 * Math.sin(th), R, `${a}${b}${t}`))
        }
      }
  } else if (kind === 'collapsed') {
    const R = 3.2
    for (let row = 0; row * R * 1.73 < 60; row++) for (let i = 0; i * 2 * R < W; i++) out.push(grain(i * 2 * R + (row % 2 ? R : 0) + 4, H - 6 - row * R * 1.73, R - 0.2, `${row}-${i}`))
    out.push(
      <text key="t" x={W / 2} y={18} textAnchor="middle" fontSize={10} fill="var(--c-mute)">
        settled, small voids
      </text>,
    )
  } else if (kind === 'clay') {
    out.push(<rect key="p" x={20} y={46} width={120} height={18} rx={3} fill="color-mix(in oklab, var(--c-accent) 25%, transparent)" stroke="var(--c-accent)" />)
    for (let i = 0; i < 7; i++) {
      out.push(
        <text key={'a' + i} x={30 + i * 17} y={42} fontSize={13} fill="var(--c-bad)" textAnchor="middle">
          −
        </text>,
        <text key={'b' + i} x={30 + i * 17} y={78} fontSize={13} fill="var(--c-bad)" textAnchor="middle">
          −
        </text>,
      )
    }
    out.push(
      <text key="l" x={12} y={60} fontSize={13} fill="var(--c-good)" textAnchor="middle">
        +
      </text>,
      <text key="r" x={148} y={60} fontSize={13} fill="var(--c-good)" textAnchor="middle">
        +
      </text>,
      <text key="c" x={W / 2} y={100} fontSize={9.5} fill="var(--c-mute)" textAnchor="middle">
        − faces, + edges; surface force ≫ gravity
      </text>,
    )
  } else if (kind === 'flocculated') {
    for (let i = 0; i < 16; i++) {
      const x = 16 + (i % 4) * 38 + (r() - 0.5) * 8
      const y = 16 + Math.floor(i / 4) * 26 + (r() - 0.5) * 6
      const a = r() * Math.PI
      out.push(plate(x, y, 26, a, i))
      // a second plate touching the first edge-to-face
      out.push(plate(x + Math.cos(a) * 13 + Math.cos(a + Math.PI / 2) * 8, y + Math.sin(a) * 13 + Math.sin(a + Math.PI / 2) * 8, 16, a + Math.PI / 2, 'e' + i))
    }
  } else if (kind === 'dispersed') {
    for (let row = 0; row < 9; row++) for (let i = 0; i < 4; i++) out.push(plate(22 + i * 38 + (row % 2 ? 14 : 0) + (r() - 0.5) * 4, 10 + row * 11.5, 30, (r() - 0.5) * 0.12, `${row}-${i}`))
  } else if (kind === 'skeleton') {
    const R = 15
    for (let row = 0; row < 4; row++) for (let i = 0; i < 6; i++) out.push(grain(i * 2 * R + (row % 2 ? R : 0) + 2, row * R * 1.73 + 12, R - 0.5, `${row}-${i}`))
    for (let i = 0; i < 30; i++) out.push(plate(r() * W, r() * H, 5, r() * Math.PI, 'f' + i, 'var(--c-accent2)'))
  } else {
    for (let i = 0; i < 120; i++) out.push(plate(r() * W, r() * H, 7, r() * Math.PI, 'f' + i, 'var(--c-accent2)'))
    ;[
      [35, 35],
      [110, 30],
      [70, 80],
      [135, 88],
    ].forEach(([x, y], i) => out.push(grain(x, y, 15, 'g' + i)))
  }
  return out
}

export function StructSketch({ kind, w = 220, label = true }: { kind: StructKind; w?: number; label?: boolean }) {
  return (
    <svg viewBox={`0 0 ${W} ${H + (label ? 16 : 0)}`} style={{ width: '100%', maxWidth: w }}>
      <defs>
        <clipPath id={`clip-${kind}`}>
          <rect x={0} y={0} width={W} height={H} rx={6} />
        </clipPath>
      </defs>
      <rect x={0} y={0} width={W} height={H} rx={6} fill="var(--c-panel)" stroke="var(--c-line)" />
      <g clipPath={`url(#clip-${kind})`}>{body(kind)}</g>
      {kind === 'honeycomb' && (
        <text x={W / 2} y={H - 4} textAnchor="middle" fontSize={9} fill="var(--c-mute)">
          arches of silt grains, large voids
        </text>
      )}
      {label && (
        <text x={W / 2} y={H + 12} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="var(--c-ink)">
          {STRUCT_LABEL[kind]}
        </text>
      )}
    </svg>
  )
}

/** classification of soil deposits by origin (line diagram) */
export function DepositTree({ w = 620 }: { w?: number }) {
  const box = (x: number, y: number, t: string, sub?: string, hot?: boolean) => (
    <g key={t}>
      <rect x={x - 52} y={y - 14} width={104} height={sub ? 34 : 26} rx={6} fill={hot ? 'color-mix(in oklab, var(--c-accent) 14%, var(--c-panel))' : 'var(--c-panel)'} stroke="var(--c-ink)" strokeWidth={0.9} />
      <text x={x} y={y + 2} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="var(--c-ink)">
        {t}
      </text>
      {sub && (
        <text x={x} y={y + 14} textAnchor="middle" fontSize={8.5} fill="var(--c-mute)">
          {sub}
        </text>
      )}
    </g>
  )
  const kids: [string, string][] = [
    ['Alluvial', 'rivers'],
    ['Lacustrine', 'lakes'],
    ['Marine', 'sea'],
    ['Glacial', 'ice: till, outwash'],
    ['Aeolian', 'wind: loess, dunes'],
    ['Colluvial', 'gravity: talus'],
  ]
  return (
    <svg viewBox="0 0 640 210" style={{ width: '100%', maxWidth: w }}>
      {box(320, 20, 'Soil deposits', undefined, true)}
      <path d="M320 34 V48 M110 48 H540 M110 48 V62 M320 48 V62 M540 48 V62" stroke="var(--c-ink)" fill="none" />
      {box(110, 76, 'Residual', 'weathered in place')}
      {box(320, 76, 'Transported', 'moved by an agent', true)}
      {box(540, 76, 'Organic (cumulose)', 'peat, muck')}
      <path d={`M320 96 V112 M${55} 112 H${585} ${kids.map((_, i) => `M${55 + i * 106} 112 V128`).join(' ')}`} stroke="var(--c-ink)" fill="none" />
      {kids.map(([t, s], i) => box(55 + i * 106, 142, t, s))}
      <text x={320} y={200} textAnchor="middle" fontSize={9.5} fill="var(--c-mute)">
        Not on AJK sir's Topic 4 slides (asked 2008-09, 2009-10, 2011-12, 2012-13)
      </text>
    </svg>
  )
}

/** the geological cycle (2007-08 Q1(e)) */
export function GeoCycle({ w = 420 }: { w?: number }) {
  const nodes: [string, number, number][] = [
    ['Rock (igneous / sedimentary / metamorphic)', 220, 24],
    ['Weathering', 375, 100],
    ['Soil (residual / transported)', 310, 190],
    ['Deposition → rock (cementation)', 120, 190],
    ['Uplift', 55, 100],
  ]
  return (
    <svg viewBox="0 0 440 220" style={{ width: '100%', maxWidth: w }}>
      <defs>
        <marker id="geo-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--c-accent)" />
        </marker>
      </defs>
      {nodes.map(([t, x, y], i) => {
        const [, x2, y2] = nodes[(i + 1) % nodes.length]
        const k = 0.28
        return <line key={'l' + i} x1={x + (x2 - x) * k} y1={y + (y2 - y) * k} x2={x + (x2 - x) * (1 - k)} y2={y + (y2 - y) * (1 - k)} stroke="var(--c-accent)" strokeWidth={1.6} markerEnd="url(#geo-arr)" />
      })}
      {nodes.map(([t, x, y]) => (
        <text key={t} x={x} y={y} textAnchor="middle" fontSize={10} fontWeight={600} fill="var(--c-ink)">
          {t}
        </text>
      ))}
      <text x={220} y={112} textAnchor="middle" fontSize={9.5} fill="var(--c-mute)">
        transportation by water, wind, ice, gravity
      </text>
    </svg>
  )
}

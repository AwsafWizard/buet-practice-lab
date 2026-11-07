// Classification figures: semi-log grading curve with D10/D30/D60 and the system boundaries; USCS decision path;
// AASHTO left-to-right elimination table; three grading shapes.
import type { ReactNode } from 'react'
import { Md } from '../../../components/ui'
import { AASHTO_GROUPS, type AashtoOut, type GradPt, type UscsOut } from '../../engine/classify'
import { nf } from '../../engine/phase'
import { tipAxes } from '../../../components/PointTip'

const MUTE = { fill: 'var(--c-mute)', fontSize: 10 } as const

/** grain size decreasing to the right on a log axis (Das style), % finer up */
export function GradingCurve({ curves, D, bounds = true, w = 560 }: { curves: { pts: GradPt[]; color?: string; label?: string }[]; D?: { D10: number; D30: number; D60: number }; bounds?: boolean; w?: number }) {
  const all = curves.flatMap((c) => c.pts).filter((p) => p.d > 0)
  const dHi = 10 ** Math.ceil(Math.log10(Math.max(10, ...all.map((p) => p.d)) + 1e-9))
  const dLo = 10 ** Math.floor(Math.log10(Math.min(0.05, ...all.map((p) => p.d)) - 1e-12))
  const ml = 40,
    mt = 14,
    W = 500,
    H = 230
  const L = (d: number) => Math.log10(d)
  const X = (d: number) => ml + ((L(dHi) - L(d)) / (L(dHi) - L(dLo))) * W
  const Y = (p: number) => mt + H - (p / 100) * H
  const decades: number[] = []
  for (let e = Math.round(L(dLo)); e <= Math.round(L(dHi)); e++) decades.push(e)
  const minor = decades.flatMap((e) => [2, 3, 4, 5, 6, 7, 8, 9].map((m) => m * 10 ** e)).filter((d) => d < dHi && d > dLo)
  const band = (a: number, b: number, t: string, y: number) =>
    a > dLo && b < dHi ? (
      <g key={t + y}>
        <line x1={X(a)} x2={X(a)} y1={mt} y2={mt + H} stroke="var(--c-accent2)" strokeDasharray="5 3" strokeWidth={0.9} opacity={0.7} />
        <text x={X(a) + 3} y={y} fontSize={9} fill="var(--c-accent2)">
          {t}
        </text>
      </g>
    ) : null
  return (
    <svg viewBox="0 0 560 284" style={{ width: '100%', maxWidth: w }} {...tipAxes({ X, Y, xLog: true, x: 'D', xUnit: ' mm', y: '% finer' })}>
      {minor.map((d) => (
        <line key={d} x1={X(d)} x2={X(d)} y1={mt} y2={mt + H} stroke="var(--c-line)" strokeWidth={0.4} />
      ))}
      {decades.map((e) => (
        <g key={e}>
          <line x1={X(10 ** e)} x2={X(10 ** e)} y1={mt} y2={mt + H} stroke="var(--c-line)" strokeWidth={1} />
          <text x={X(10 ** e)} y={mt + H + 13} textAnchor="middle" {...MUTE}>
            {10 ** e >= 1 ? 10 ** e : (10 ** e).toFixed(-e)}
          </text>
        </g>
      ))}
      {Array.from({ length: 11 }, (_, i) => i * 10).map((p) => (
        <g key={p}>
          <line x1={ml} x2={ml + W} y1={Y(p)} y2={Y(p)} stroke="var(--c-line)" strokeWidth={p % 50 ? 0.5 : 0.9} />
          <text x={ml - 4} y={Y(p) + 3} textAnchor="end" {...MUTE}>
            {p}
          </text>
        </g>
      ))}
      {bounds && (
        <>
          {band(4.75, 0, 'No. 4 (4.75): USCS gravel | sand', mt + 10)}
          {band(2.0, 0, 'No. 10 (2.0): AASHTO', mt + 22)}
          {band(0.425, 0, 'No. 40', mt + 34)}
          {band(0.075, 0, 'No. 200 (0.075): fines', mt + 10)}
        </>
      )}
      {D &&
        ([
          ['D60', 60, D.D60],
          ['D30', 30, D.D30],
          ['D10', 10, D.D10],
        ] as const).map(([t, p, d]) =>
          Number.isFinite(d) && d > dLo && d < dHi ? (
            <g key={t}>
              <line x1={ml} x2={X(d)} y1={Y(p)} y2={Y(p)} stroke="var(--c-load)" strokeDasharray="3 3" />
              <line x1={X(d)} x2={X(d)} y1={Y(p)} y2={mt + H} stroke="var(--c-load)" strokeDasharray="3 3" />
              <text x={X(d) + 3} y={mt + H - 4 - (p / 100) * 30} fontSize={10} fontWeight={700} fill="var(--c-load)">
                {t} = {nf(d, 3)}
              </text>
            </g>
          ) : null,
        )}
      {curves.map((c, k) => {
        const s = [...c.pts].filter((p) => p.d > 0 && Number.isFinite(p.pf)).sort((a, b) => b.d - a.d)
        const col = c.color ?? 'var(--c-accent)'
        return (
          <g key={k} data-name={c.label}>
            <polyline points={s.map((p) => `${X(p.d).toFixed(1)},${Y(p.pf).toFixed(1)}`).join(' ')} fill="none" stroke={col} strokeWidth={2} />
            {s.map((p, i) => (
              <circle key={i} cx={X(p.d)} cy={Y(p.pf)} r={3.2} fill="var(--c-panel)" stroke={col} strokeWidth={1.5} data-tip={`${c.label ? c.label + ': ' : ''}D = ${nf(p.d, 3)} mm, ${nf(p.pf, 4)} % finer`} />
            ))}
            {c.label && s.length > 0 && (
              <text x={X(s[Math.floor(s.length / 2)].d) + 5} y={Y(s[Math.floor(s.length / 2)].pf) - 6} fontSize={11} fontWeight={700} fill={col}>
                {c.label}
              </text>
            )}
          </g>
        )
      })}
      <text x={ml + W / 2} y={280} textAnchor="middle" fontSize={11} fill="var(--c-ink)">
        Particle size (mm, log scale)
      </text>
      <text x={12} y={mt + H / 2} textAnchor="middle" transform={`rotate(-90 12 ${mt + H / 2})`} fontSize={11} fill="var(--c-ink)">
        Percent finer
      </text>
    </svg>
  )
}

/** the USCS decision path as chips: each level shows the branches, the taken one lit */
export function UscsPath({ u }: { u: UscsOut }) {
  const levels: { title: string; opts: string[]; on: string }[] = []
  levels.push({ title: 'F200', opts: ['≥ 50 %: fine-grained', '< 50 %: coarse-grained', 'peat'], on: u.kind === 'fine' ? '≥ 50 %: fine-grained' : u.kind === 'coarse' ? '< 50 %: coarse-grained' : 'peat' })
  if (u.kind === 'coarse') {
    const G = u.symbol[0] === 'G'
    levels.push({ title: 'coarse fraction', opts: ['more gravel: G', 'sand ≥ gravel: S'], on: G ? 'more gravel: G' : 'sand ≥ gravel: S' })
    const band = u.fines < 5 ? '< 5 %: clean' : u.fines <= 12 ? '5–12 %: dual symbol' : '> 12 %: with fines'
    levels.push({ title: 'fines', opts: ['< 5 %: clean', '5–12 %: dual symbol', '> 12 %: with fines'], on: band })
    if (u.fines <= 12) levels.push({ title: 'grading (Cu, Cc)', opts: ['W', 'P'], on: u.symbol[1] })
    if (u.fines >= 5) {
      const hatched = u.fines > 12 && /C-[GS]M$/.test(u.symbol)
      levels.push({ title: 'fines on the chart', opts: ['M', 'C', 'C-M (hatched)'], on: hatched ? 'C-M (hatched)' : u.symbol.endsWith('M') ? 'M' : 'C' })
    }
  } else if (u.kind === 'fine') {
    const org = u.symbol[0] === 'O'
    levels.push({ title: 'organic?', opts: ['inorganic', 'organic (ratio < 0.75)'], on: org ? 'organic (ratio < 0.75)' : 'inorganic' })
    levels.push({ title: 'LL', opts: ['< 50: L', '≥ 50: H'], on: u.symbol.includes('H') ? '≥ 50: H' : '< 50: L' })
    if (!org) levels.push({ title: 'A-line', opts: ['above: C', 'hatched: CL-ML', 'below: M'], on: u.symbol === 'CL-ML' ? 'hatched: CL-ML' : u.symbol[0] === 'C' ? 'above: C' : 'below: M' })
  }
  return (
    <div className="space-y-1.5">
      {levels.map((l) => (
        <div key={l.title} className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-faint w-28 shrink-0">{l.title}</span>
          {l.opts.map((o) => (
            <span key={o} className={'chip ' + (o === l.on ? '!border-load text-load font-bold' : 'opacity-50')}>
              {o}
            </span>
          ))}
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-1.5 text-sm">
        <span className="text-faint w-28 shrink-0 text-xs">result</span>
        <span className="chip !border-load text-load font-bold">{u.symbol}</span>
        <span className="font-semibold">{u.name}</span>
      </div>
    </div>
  )
}

/** AASHTO Table 5.1 as a left-to-right elimination grid */
export function AashtoGrid({ a }: { a: AashtoOut }) {
  const keys = ['P10', 'P40', 'P200', 'LL', 'PI'] as const
  const lab: Record<string, string> = { P10: 'No. 10', P40: 'No. 40', P200: 'No. 200', LL: 'LL', PI: 'PI' }
  const sym = (p: boolean | null | undefined) => (p === undefined ? '' : p === null ? '?' : p ? '✓' : '✗')
  return (
    <div className="overflow-x-auto">
      <table className="tbl w-auto text-xs">
        <thead>
          <tr>
            <th></th>
            {AASHTO_GROUPS.map((g, i) => (
              <th key={g.id} className={i === a.idx ? '!text-load' : ''}>
                {g.id}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {keys.map((k) => (
            <tr key={k}>
              <td className="txt">{lab[k]}</td>
              {a.checks.map((c, i) => {
                const cc = c.checks.find((x) => x.crit.k === k)
                const crossed = (a.part === 'granular' && i >= 7) || (a.part === 'silt-clay' && i < 7)
                return (
                  <td key={c.group.id} className={(i === a.idx ? 'hl ' : '') + (crossed ? 'opacity-35 line-through' : '')} title={cc?.text}>
                    {cc ? (
                      <span>
                        <span className="text-faint">{cc.crit.np ? 'NP' : cc.crit.max !== undefined ? `≤${cc.crit.max}` : `≥${cc.crit.min}`}</span> <b className={cc.pass ? 'text-good' : cc.pass === false ? 'text-bad' : ''}>{sym(cc.pass)}</b>
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-[11px] text-faint mt-1">Part {a.part === 'granular' ? '2 (silt-clay)' : '1 (granular)'} crossed out. First column (left to right) with every limit ✓ is the group.</div>
    </div>
  )
}

/** the three grading shapes of slides 26–27 */
export function GradingShapes() {
  const I = [
    { d: 2, pf: 100 },
    { d: 0.6, pf: 98 },
    { d: 0.4, pf: 85 },
    { d: 0.3, pf: 40 },
    { d: 0.2, pf: 6 },
    { d: 0.1, pf: 0 },
  ]
  const II = [
    { d: 20, pf: 100 },
    { d: 5, pf: 80 },
    { d: 1, pf: 55 },
    { d: 0.2, pf: 30 },
    { d: 0.05, pf: 12 },
    { d: 0.01, pf: 2 },
  ]
  const III = [
    { d: 10, pf: 100 },
    { d: 4, pf: 75 },
    { d: 2, pf: 55 },
    { d: 0.6, pf: 52 },
    { d: 0.2, pf: 48 },
    { d: 0.08, pf: 20 },
    { d: 0.03, pf: 2 },
  ]
  return (
    <GradingCurve
      bounds={false}
      curves={[
        { pts: I, color: 'var(--c-load)', label: 'I poorly (uniform)' },
        { pts: II, color: 'var(--c-accent)', label: 'II well graded' },
        { pts: III, color: 'var(--c-accent2)', label: 'III gap graded' },
      ]}
      w={520}
    />
  )
}

export function Note({ children }: { children: ReactNode }) {
  return <div className="text-xs text-faint">{children}</div>
}
export const md = (s: string) => <Md className="text-sm">{s}</Md>

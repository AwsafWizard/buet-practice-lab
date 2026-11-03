// Two-way slab bar-spacing simulator: set the middle-strip and column-strip spacings both ways and watch
// the panel's bar mesh redraw; middle strips are checked for strength and 2h, column strips for the
// 1.5 × middle-strip rule, As,min and 2h.
import { useMemo, useState } from 'react'
import { Reveal, Tex } from '../../../components/ui'
import { pick, randInt, rng, Slider } from '../../../labs/common'
import { BARS, r3 } from '../../engine/materials'
import { tsAs, tsRatio } from '../../engine/oneway'
import { barPositions, evalColumn, evalSpacing, smaxOf, type ColEval, type SpEval } from '../../engine/spacing'
import { twoWay, type EdgeName, type Edges, type TwoWayInput } from '../../engine/twoway'
import { f, FY_OPTS, Num, Pick, useMark } from '../oneway/kit'
import { AsCurve, BarSeg, CheckList, SimBox, VerdictBadge } from '../oneway/spacingKit'

const RED = 'var(--c-bad)'
const BLUE = '#3b82f6'
const E = (s: string): Edges => ({ top: s.includes('t'), right: s.includes('r'), bottom: s.includes('b'), left: s.includes('l') })

interface Sim {
  lx: number
  ly: number
  h: number
  fy: number
  asA: number
  asB: number
  corners: [EdgeName, EdgeName][]
  bar: number
  sA: number
  sAc: number
  sB: number
  sBc: number
  src: string
}

function fromPanel(p: TwoWayInput, src: string): Sim {
  const r = twoWay(p)
  return {
    lx: p.lx,
    ly: p.ly,
    h: r.h,
    fy: p.fy,
    asA: r3(r.st.aPos.AsD),
    asB: r3(r.st.bPos.AsD),
    corners: r.corner.corners,
    bar: 3,
    sA: 14,
    sAc: 18,
    sB: 14,
    sBc: 18,
    src: `${src}: case ${r.case}, m = ${f(r.m, 3)}, h = ${f(r.h, 2)} in → +Ma = ${f(r.M.aPos, 2)}, +Mb = ${f(r.M.bPos, 2)} k-ft/ft (As below already ≥ As,min; long-way d = h − 1.5 in).`,
  }
}

const START = fromPanel({ lx: 25, ly: 20, edges: E('bl'), ll: 60, ff: 25, pw: 40, fc: 3000, fy: 60000 }, 'Corner panel 25 ft × 20 ft (clear), LL 60, FF 25, PW 40 psf, 3/60')

const EDGE_SETS = ['bl', 'br', 'tl', 'tr', 'tblr', 'tbl', 'tbr', 'lrt', 'lrb', 't', 'l', 'tb', 'lr', '']
function randomSim(seed: number): Sim {
  const r = rng(seed)
  const la = randInt(r, 14, 24, 1)
  const lb = Math.min(Math.floor(la * 1.9), la + randInt(r, 0, 8, 1))
  const land = r() < 0.6
  const fy = pick(r, [60000, 60000, 60000, 40000])
  const fc = pick(r, [3000, 3000, 3500, 4000])
  const edges = pick(r, EDGE_SETS)
  const p: TwoWayInput = { lx: land ? lb : la, ly: land ? la : lb, edges: E(edges), ll: pick(r, [40, 60, 80, 100]), ff: pick(r, [25, 30, 35]), pw: pick(r, [0, 40, 50, 60]), fc, fy }
  const cont = (['top', 'right', 'bottom', 'left'] as EdgeName[]).filter((e) => p.edges[e]).join(', ') || 'none'
  return fromPanel(p, `${p.lx} × ${p.ly} ft panel (clear), continuous edges: ${cont}; LL ${p.ll}, FF ${p.ff}${p.pw ? `, PW ${p.pw}` : ''} psf, ${fc / 1000}/${fy / 1000}`)
}

// ---------------------------------------------------------------- plan with the bar mesh
function MeshPlan({ m, la, lb }: { m: Sim; la: number; lb: number }) {
  const W = 560
  const sc = Math.min((W - 110) / m.lx, 320 / m.ly)
  const w = m.lx * sc
  const h = m.ly * sc
  const H = h + 74
  const x0 = (W - w) / 2 + 10
  const y0 = 28
  const px = sc / 12 // px per inch
  const horizLong = m.lx >= m.ly
  // vertical bars run along y: short-way when the long side is horizontal
  const vert = horizLong ? { mid: m.sA, col: m.sAc, col_: RED, name: 'short-way' } : { mid: m.sB, col: m.sBc, col_: BLUE, name: 'long-way' }
  const horz = horizLong ? { mid: m.sB, col: m.sBc, col_: BLUE, name: 'long-way' } : { mid: m.sA, col: m.sAc, col_: RED, name: 'short-way' }
  const spread = (len: number, sMid: number, sCol: number) => {
    const L = len * 12
    const q = L / 4
    return [...barPositions(q, sCol), ...barPositions(L / 2, sMid).map((x) => x + q), ...barPositions(q, sCol).map((x) => x + 3 * q)]
  }
  const vx = spread(m.lx, vert.mid, vert.col)
  const hy = spread(m.ly, horz.mid, horz.col)
  const zone = (lb / 5) * sc
  const count = (len: number, s: number) => Math.ceil((len * 12) / s)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto max-w-2xl mx-auto block">
      <rect x={x0} y={y0} width={w} height={h} fill="var(--c-conc)" stroke="var(--c-ink)" strokeWidth={1.2} />
      {/* middle strips shaded */}
      <rect x={x0 + w / 4} y={y0} width={w / 2} height={h} fill="var(--c-accent)" fillOpacity={0.06} />
      <rect x={x0} y={y0 + h / 4} width={w} height={h / 2} fill="var(--c-accent)" fillOpacity={0.06} />
      {m.corners.map(([v, hz]) => (
        <rect key={v + hz} x={hz === 'left' ? x0 : x0 + w - zone} y={v === 'top' ? y0 : y0 + h - zone} width={zone} height={zone} fill="#ec4899" fillOpacity={0.18} stroke="#ec4899" strokeDasharray="3 2" />
      ))}
      {vx.map((x, i) => (
        <line key={'v' + i} x1={x0 + x * px} x2={x0 + x * px} y1={y0 + 2} y2={y0 + h - 2} stroke={vert.col_} strokeWidth={1} strokeOpacity={0.75} />
      ))}
      {hy.map((y, i) => (
        <line key={'h' + i} x1={x0 + 2} x2={x0 + w - 2} y1={y0 + y * px} y2={y0 + y * px} stroke={horz.col_} strokeWidth={1} strokeOpacity={0.75} />
      ))}
      <g stroke="var(--c-ink)" strokeOpacity={0.55} strokeDasharray="6 4" strokeWidth={1.1}>
        <line x1={x0 + w / 4} x2={x0 + w / 4} y1={y0 - 26} y2={y0 + h} />
        <line x1={x0 + (3 * w) / 4} x2={x0 + (3 * w) / 4} y1={y0 - 26} y2={y0 + h} />
        <line x1={x0 - 26} x2={x0 + w} y1={y0 + h / 4} y2={y0 + h / 4} />
        <line x1={x0 - 26} x2={x0 + w} y1={y0 + (3 * h) / 4} y2={y0 + (3 * h) / 4} />
      </g>
      {/* strip labels for the vertical bars (top) */}
      {[
        [x0 + w / 8, `col · @${f(vert.col, 2)}″`],
        [x0 + w / 2, `middle strip · @${f(vert.mid, 2)}″ (${count(m.lx / 2, vert.mid)} bars)`],
        [x0 + (7 * w) / 8, `col · @${f(vert.col, 2)}″`],
      ].map(([x, t], i) => (
        <text key={i} x={x as number} y={y0 - 10} fontSize={10.5} textAnchor="middle" fill={vert.col_} fontWeight={600} className="num">
          {t}
        </text>
      ))}
      {/* strip labels for the horizontal bars (left, rotated) */}
      {[
        [y0 + h / 8, `col · @${f(horz.col, 2)}″`],
        [y0 + h / 2, `middle · @${f(horz.mid, 2)}″ (${count(m.ly / 2, horz.mid)})`],
        [y0 + (7 * h) / 8, `col · @${f(horz.col, 2)}″`],
      ].map(([y, t], i) => (
        <text key={i} x={x0 - 10} y={y as number} fontSize={10.5} textAnchor="middle" fill={horz.col_} fontWeight={600} className="num" transform={`rotate(-90 ${x0 - 10} ${y})`}>
          {t}
        </text>
      ))}
      <text x={x0 + w / 2} y={y0 + h + 18} fontSize={11} textAnchor="middle" fill="var(--c-mute)" className="num">
        {f(m.lx, 2)} ft{horizLong ? ' = lb (long)' : ' = la (short)'} · strips at the ¼ points
      </text>
      <text x={W - 6} y={H - 8} fontSize={9.5} textAnchor="end" fill="var(--c-faint)">
        red = short-way bars (bottom layer) · blue = long-way (on top of them) · pink = corner steel {f(lb / 5, 2)}′ × {f(lb / 5, 2)}′ · la = {f(la, 2)}′
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------- one direction's two boxes
function Direction({ name, color, need, mid, col, bar, sMid, sCol, onMid, onCol, onPick, h, AsMin }: { name: string; color: string; need: number; mid: SpEval; col: ColEval; bar: number; sMid: number; sCol: number; onMid: (s: number) => void; onCol: (s: number) => void; onPick: (b: number, s: number) => void; h: number; AsMin: number }) {
  return (
    <div className="space-y-3">
      <SimBox title={<span style={{ color }}>{name} · middle strip</span>} sub={`need max(As+, As,min) = ${f(need, 3)} in²/ft · s_max = min(2h, 18) = ${f(mid.smax, 2)} in`}>
        <Slider label="Middle-strip s" value={sMid} min={2} max={20} step={0.5} unit=" in" onChange={onMid} />
        <div className="rounded-lg bg-bg/60 border border-line p-1">
          <AsCurve need={need} smax={mid.smax} bar={bar} s={sMid} onPick={onPick} />
        </div>
        <div className="text-sm num">
          As provided = {BARS[bar].A} × 12 / {f(sMid, 2)} = <b>{f(mid.prov, 3)}</b> in²/ft
        </div>
        <CheckList checks={mid.checks} />
        <VerdictBadge v={mid.verdict} over={mid.over} hint={mid.verdict === 'ok' ? `class pick for #${bar}: ${f(mid.best, 2)} in` : mid.verdict === 'fail' ? `#${bar} works up to ${f(mid.best, 2)} in` : bar !== mid.classBar ? `the class would use #${mid.classBar}` : undefined} />
      </SimBox>
      <SimBox title={<span style={{ color }}>{name} · column strips</span>} sub={`moments drop to ⅔ → 1.5 × ${f(sMid, 2)} = ${f(col.s15, 2)} in; As,min ${f(AsMin, 3)} → ${f(col.sMin, 2)} in; 2h = ${f(2 * h, 2)} in`}>
        <Slider label="Column-strip s" value={sCol} min={2} max={24} step={0.5} unit=" in" onChange={onCol} />
        <CheckList checks={col.checks} />
        <VerdictBadge v={col.verdict} hint={col.verdict !== 'best' ? `class: min of the three, rounded down = ${f(col.best, 2)} in` : undefined} />
      </SimBox>
    </div>
  )
}

export function TwoWaySpacingSim() {
  const [m, setM] = useState<Sim>(START)
  const set = (o: Partial<Sim>) => setM({ ...m, ...o })
  const la = Math.min(m.lx, m.ly)
  const lb = Math.max(m.lx, m.ly)
  const AsMin = tsAs(m.fy, m.h)
  const needA = Math.max(m.asA, AsMin)
  const needB = Math.max(m.asB, AsMin)
  const smax = smaxOf('twoway', m.h)
  const ev = useMemo(() => {
    const a = evalSpacing({ bar: m.bar, s: m.sA, need: needA, smax })
    const b = evalSpacing({ bar: m.bar, s: m.sB, need: needB, smax })
    return {
      a,
      b,
      ac: evalColumn({ bar: m.bar, sMid: m.sA, s: m.sAc, AsMin, h: m.h }),
      bc: evalColumn({ bar: m.bar, sMid: m.sB, s: m.sBc, AsMin, h: m.h }),
    }
  }, [m, needA, needB, smax, AsMin])
  useMark('m-asft', { s: m.sA })
  const verdicts = [ev.a, ev.ac, ev.b, ev.bc].map((x) => x.verdict)
  const snap = () => {
    const bar = Math.max(ev.a.classBar, ev.b.classBar)
    const a = evalSpacing({ bar, s: 12, need: needA, smax }).best
    const b = evalSpacing({ bar, s: 12, need: needB, smax }).best
    set({ bar, sA: a, sB: b, sAc: evalColumn({ bar, sMid: a, s: 12, AsMin, h: m.h }).best, sBc: evalColumn({ bar, sMid: b, s: 12, AsMin, h: m.h }).best })
  }
  const cornerFrom = needB > needA ? 'long' : 'short'
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button className="btn" onClick={() => setM(randomSim(Math.floor(Math.random() * 1e9)))}>
          🎲 Random panel
        </button>
        <button className="text-sm text-accent underline" onClick={() => setM(START)}>
          Corner panel 25 × 20
        </button>
        <button className="text-sm text-mute underline" onClick={snap}>
          Snap to the class answer
        </button>
        <span className="ml-auto text-sm num">
          {verdicts.filter((v) => v === 'best').length}🎯 · {verdicts.filter((v) => v === 'ok').length}✓ · {verdicts.filter((v) => v === 'fail').length}✗
        </span>
      </div>
      <div className="rounded-xl border border-line bg-panel2/50 p-3 text-sm leading-relaxed">{m.src} Set the four spacings so every check passes, then tighten them to the class answer.</div>
      <div className="grid grid-cols-2 cq-md:grid-cols-4 cq-lg:grid-cols-7 gap-2">
        <Num label="Span drawn across" value={m.lx} onChange={(v) => set({ lx: Math.max(4, v) })} step={0.5} unit="ft" />
        <Num label="Span drawn down" value={m.ly} onChange={(v) => set({ ly: Math.max(4, v) })} step={0.5} unit="ft" />
        <Num label="h" value={m.h} onChange={(v) => set({ h: Math.max(3, v) })} step={0.5} unit="in" />
        <Pick label="fy" value={m.fy} onChange={(v) => set({ fy: v })} options={FY_OPTS} />
        <Num label="As short-way (+)" value={m.asA} onChange={(v) => set({ asA: Math.max(0.01, v) })} step={0.005} unit="in²/ft" />
        <Num label="As long-way (+)" value={m.asB} onChange={(v) => set({ asB: Math.max(0.01, v) })} step={0.005} unit="in²/ft" />
        <div className="text-sm">
          <div className="text-xs text-mute">As,min = {tsRatio(m.fy)} × 12h</div>
          <div className="num font-semibold mt-1.5">{f(AsMin, 3)} in²/ft</div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-mute">Bar (both ways)</span>
        <BarSeg value={m.bar} onChange={(b) => set({ bar: b })} />
        {lb / la >= 2 && <span className="text-bad text-xs font-semibold">lb/la = {f(lb / la, 2)} ≥ 2 — this panel is really one-way</span>}
      </div>
      <div className="rounded-xl bg-bg/60 border border-line p-2">
        <MeshPlan m={m} la={la} lb={lb} />
      </div>
      <div className="grid cq-lg:grid-cols-2 gap-3 items-start">
        <Direction name="Short way (span la)" color={RED} need={needA} mid={ev.a} col={ev.ac} bar={m.bar} sMid={m.sA} sCol={m.sAc} onMid={(s) => set({ sA: s })} onCol={(s) => set({ sAc: s })} onPick={(bar, s) => set({ bar, sA: s })} h={m.h} AsMin={AsMin} />
        <Direction name="Long way (span lb)" color={BLUE} need={needB} mid={ev.b} col={ev.bc} bar={m.bar} sMid={m.sB} sCol={m.sBc} onMid={(s) => set({ sB: s })} onCol={(s) => set({ sBc: s })} onPick={(bar, s) => set({ bar, sB: s })} h={m.h} AsMin={AsMin} />
      </div>
      <div className="text-sm text-mute">
        Corner steel ({m.corners.length ? `${m.corners.length} discontinuous corner${m.corners.length > 1 ? 's' : ''}` : 'none here — no corner has two discontinuous edges'}): top and bottom, both ways, over lb/5 = {f(lb / 5, 2)} ft, at the spacing of the larger positive steel ({cornerFrom}-way middle strip: #{m.bar} @ {f(cornerFrom === 'long' ? m.sB : m.sA, 2)} in).
      </div>
      <Reveal title="Class answer, worked">
        <div className="space-y-2 text-sm">
          {(
            [
              ['Short way', needA, ev.a, m.sA],
              ['Long way', needB, ev.b, m.sB],
            ] as [string, number, SpEval, number][]
          ).map(([nm, need, e]) => {
            const c = evalColumn({ bar: m.bar, sMid: e.best, s: 12, AsMin, h: m.h })
            return (
              <div key={nm}>
                <b>{nm}</b> (#{m.bar}): middle <Tex>{`s = \\frac{${BARS[m.bar].A}\\times12}{${f(need, 3)}} = ${f(e.raw, 2)};\\ \\min(2h, 18) = ${f(e.smax, 2)}\\Rightarrow\\mathbf{${f(e.best, 2)}\\text{ in}}`}</Tex>; column <Tex>{`\\min(1.5\\times${f(e.best, 2)},\\ ${f(c.sMin, 2)},\\ ${f(c.smax, 2)}) \\Rightarrow\\mathbf{${f(c.best, 2)}\\text{ in}}`}</Tex>
              </div>
            )
          })}
          <div className="text-mute">The column-strip moment is about ⅔ of the middle-strip one, so the class spaces column-strip bars at 1.5× — but never with less than As,min ({f(AsMin, 3)} in²/ft) or wider than 2h.</div>
        </div>
      </Reveal>
    </div>
  )
}

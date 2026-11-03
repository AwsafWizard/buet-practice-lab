// One-way slab bar-spacing simulator: pick the bar and spacing for the bottom bars, the extra top bars
// over the support and the T&S bars; the sections redraw live and every rule is checked as you go.
import { useMemo, useState } from 'react'
import { Reveal, Seg, Tex } from '../../../components/ui'
import { pick, randInt, rng, Slider } from '../../../labs/common'
import { BARS, r3 } from '../../engine/materials'
import { oneWayCoef, tsAs, tsRatio, type EndSupport, type OneWayCoefInput } from '../../engine/oneway'
import { barPositions, evalSpacing, evalTop, smaxOf } from '../../engine/spacing'
import { f, FY_OPTS, Num, Pick, useMark } from './kit'
import { AsCurve, BarSeg, CheckList, SimBox, VerdictBadge } from './spacingKit'

interface Sim {
  h: number
  fy: number
  asPos: number
  asNeg: number
  bar: number
  s: number
  n: number
  sTs: number
  src: string
}

function fromSlab(p: OneWayCoefInput, src: string): Omit<Sim, 'bar' | 's' | 'n' | 'sTs'> {
  const r = oneWayCoef(p)
  const pos = r.sections.find((x) => x.id === 'p0')!
  const neg = r.supports.reduce((m, x) => (x.sec.AsD > m.sec.AsD ? x : m), r.supports[0])
  return { h: r.h, fy: p.fy, asPos: r3(pos.AsD), asNeg: r3(neg.sec.AsD), src: `${src} — end span +Mu = ${f(pos.Mu, 2)} k-ft/ft, ${neg.sec.label.replace(' (−)', '').toLowerCase()} −Mu = ${f(neg.sec.Mu, 2)} k-ft/ft (As already ≥ As,min).` }
}

const EX: OneWayCoefInput = { spans: [15, 15], ends: ['spandrel', 'spandrel'], ll: 100, fc: 4000, fy: 60000, h: 6.5, bar: 3 }
const START: Sim = { ...fromSlab(EX, 'Lecture Ex 12.1: 2 × 15 ft clear, LL 100 psf, 4/60, h = 6.5 in'), bar: 3, s: 12, n: 0, sTs: 15 }

function randomSim(seed: number): Sim {
  const r = rng(seed)
  const n = pick(r, [2, 2, 3, 4])
  const span = randInt(r, 10, 17, 0.5)
  const end = pick(r, ['spandrel', 'spandrel', 'column', 'unrestrained'] as EndSupport[])
  const fy = pick(r, [60000, 60000, 60000, 40000])
  const fc = pick(r, [3000, 3500, 4000])
  const p: OneWayCoefInput = { spans: Array(n).fill(span), ends: [end, end], ll: pick(r, [40, 60, 80, 100, 120]), ff: pick(r, [0, 25, 30]), pw: pick(r, [0, 30, 50]), fc, fy }
  const loads = [`LL ${p.ll}`, p.ff ? `FF ${p.ff}` : '', p.pw ? `PW ${p.pw}` : ''].filter(Boolean).join(', ')
  return { ...fromSlab(p, `${n} spans × ${span} ft clear, ends on ${end === 'unrestrained' ? 'brick walls' : end === 'column' ? 'columns' : 'spandrel beams'}, ${loads} psf, ${fc / 1000}/${fy / 1000}`), bar: 3, s: 12, n: 0, sTs: 15 }
}

// ---------------------------------------------------------------- section across a 36-in width
const WI = 30
const EXTRA = '#06b6d4'
function StripSection({ h, bar, s, mode, n, sTs }: { h: number; bar: number; s: number; mode: 'span' | 'support'; n: number; sTs: number }) {
  const VW = 440
  const ml = 44
  const mr = 12
  const k = (VW - ml - mr) / WI
  const top = 40
  const H = top + h * k + 10
  const X = (x: number) => ml + x * k
  const Y = (y: number) => top + y * k
  const db = BARS[bar].d
  const rr = Math.max(3.4, (db / 2) * k)
  const cover = 0.75
  const yBot = h - cover - db / 2
  const yTop = cover + db / 2
  const xs = barPositions(WI, s)
  const bottom = mode === 'span' ? xs : xs.filter((_, i) => i % 2 === 0)
  const cranked = mode === 'span' ? [] : xs.filter((_, i) => i % 2 === 1)
  const extras = mode === 'span' ? [] : cranked.flatMap((xc) => Array.from({ length: n }, (_, j) => xc + ((j + 1) * 2 * s) / (n + 1))).filter((x) => x < WI - 0.2)
  // also extras left of the first cranked bar, so the pattern repeats from the edge
  if (mode === 'support' && cranked.length) for (let j = 1; j <= n; j++) {
    const x = cranked[0] - ((n + 1 - j) * 2 * s) / (n + 1)
    if (x > 0.2) extras.push(x)
  }
  // dimension between the first two bars that start inside the 1-ft strip (or the first pair)
  const dimSet = mode === 'span' ? xs : cranked
  const pitch = mode === 'span' ? s : 2 * s
  const fits = dimSet.filter((x) => x + pitch <= WI + 1e-9)
  const d0 = fits.find((x) => x >= 12 - 1e-9) ?? fits[fits.length - 1]
  const d1 = d0 !== undefined ? d0 + pitch : undefined
  const tsDb = BARS[3].d
  const tsY = mode === 'span' ? yBot - db / 2 - tsDb / 2 : yTop + db / 2 + tsDb / 2
  const perFt = 12 / pitch
  return (
    <div>
    <svg viewBox={`0 0 ${VW} ${H}`} className="w-full h-auto">
      {/* 1-ft design strip */}
      <rect x={X(12)} y={top - 6} width={12 * k} height={h * k + 12} fill="var(--c-accent)" fillOpacity={0.09} stroke="var(--c-accent)" strokeOpacity={0.5} strokeDasharray="4 3" />
      <rect x={X(0)} y={Y(0)} width={WI * k} height={h * k} fill="var(--c-conc)" stroke="var(--c-ink)" strokeWidth={1} />
      {/* T&S bars run along the section (perpendicular to the main bars), sitting on them */}
      {mode === 'span' && <line x1={X(0.3)} x2={X(WI - 0.3)} y1={Y(tsY)} y2={Y(tsY)} stroke="var(--c-mute)" strokeWidth={Math.max(1.5, tsDb * k)} strokeLinecap="round" />}
      {bottom.map((x, i) => (
        <circle key={'b' + i} cx={X(x)} cy={Y(yBot)} r={rr} fill="var(--c-steel)" />
      ))}
      {cranked.map((x, i) => (
        <circle key={'c' + i} cx={X(x)} cy={Y(yTop)} r={rr} fill="var(--c-steel)" stroke="var(--c-accent)" strokeWidth={1.6} />
      ))}
      {extras.map((x, i) => (
        <circle key={'e' + i} cx={X(x)} cy={Y(yTop)} r={rr} fill={EXTRA} />
      ))}
      {/* pitch dimension above the slab */}
      {d0 !== undefined && d1 !== undefined && d1 <= WI && (
        <g stroke="var(--c-ink)" strokeWidth={1}>
          <line x1={X(d0)} x2={X(d1)} y1={top - 16} y2={top - 16} />
          <line x1={X(d0)} x2={X(d0)} y1={top - 21} y2={top - 11} />
          <line x1={X(d1)} x2={X(d1)} y1={top - 21} y2={top - 11} />
          <text x={(X(d0) + X(d1)) / 2} y={top - 21} fontSize={11} textAnchor="middle" fill="var(--c-ink)" stroke="none" className="num" fontWeight={600}>
            {mode === 'span' ? `s = ${f(s, 2)}″` : `2s = ${f(2 * s, 2)}″`}
          </text>
        </g>
      )}
      <text x={X(12) + 3} y={top - 30} fontSize={10} fill="var(--c-accent)" fontWeight={600}>
        1-ft strip
      </text>
      <text x={ml - 6} y={Y(h / 2) + 4} fontSize={11} textAnchor="end" fill="var(--c-mute)" className="num">
        h {f(h, 2)}″
      </text>
    </svg>
      <div className="px-1 text-xs text-mute leading-snug">
        {mode === 'span' ? (
          <>
            <b>Midspan</b>: #{bar} @ {f(s, 2)}″ bottom ({f(perFt, 2)} per ft) · grey line = T&S #3 @ {f(sTs, 2)}″ lying on them · cover ¾″, d = h − 1 = {f(h - 1, 2)}″ · clear gap {f(s - db, 2)}″
          </>
        ) : (
          <>
            <b>Over the support</b>: alternate bottom bars cranked up (<span className="text-accent font-semibold">ringed</span>) + {n} extra top bar{n === 1 ? '' : 's'} (<span style={{ color: EXTRA }} className="font-semibold">cyan</span>) in each 2s → {1 + n} top bar{n ? 's' : ''} per {f(2 * s, 2)}″ · the other bottom bars run on at {f(2 * s, 2)}″
          </>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- simulator
export function OneWaySpacingSim() {
  const [m, setM] = useState<Sim>(START)
  const set = (o: Partial<Sim>) => setM({ ...m, ...o })
  const AsMin = tsAs(m.fy, m.h)
  const needPos = Math.max(m.asPos, AsMin)
  const needNeg = Math.max(m.asNeg, AsMin)
  const bot = useMemo(() => evalSpacing({ bar: m.bar, s: m.s, need: needPos, smax: smaxOf('oneway', m.h) }), [m.bar, m.s, needPos, m.h])
  const top = useMemo(() => evalTop({ bar: m.bar, s: m.s, n: m.n, need: needNeg }), [m.bar, m.s, m.n, needNeg])
  const ts = useMemo(() => evalSpacing({ bar: 3, s: m.sTs, need: AsMin, smax: smaxOf('ts', m.h), strengthLabel: 'As ≥ T&S steel' }), [m.sTs, AsMin, m.h])
  const topBest = useMemo(() => evalTop({ bar: m.bar, s: bot.best, n: 0, need: needNeg }), [m.bar, bot.best, needNeg])
  useMark('m-asft', { s: m.s })
  useMark('sl-ts', { fy: m.fy })
  const score = [bot, top, ts].map((x) => x.verdict)
  const snap = () => {
    const b = bot.classBar
    const e = evalSpacing({ bar: b, s: 12, need: needPos, smax: smaxOf('oneway', m.h) })
    set({ bar: b, s: e.best, n: evalTop({ bar: b, s: e.best, n: 0, need: needNeg }).classN, sTs: ts.best })
  }
  const botHint = bot.verdict === 'ok' ? `class pick for #${m.bar}: ${f(bot.best, 2)} in` : bot.verdict === 'best' && m.bar !== bot.classBar ? `the class would use #${bot.classBar} for this steel` : bot.verdict === 'fail' ? `#${m.bar} works up to ${f(bot.best, 2)} in` : undefined
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button className="btn" onClick={() => setM(randomSim(Math.floor(Math.random() * 1e9)))}>
          🎲 Random slab
        </button>
        <button className="text-sm text-accent underline" onClick={() => setM(START)}>
          Lecture Ex 12.1
        </button>
        <button className="text-sm text-mute underline" onClick={snap}>
          Snap to the class answer
        </button>
        <span className="ml-auto text-sm num">
          {score.filter((v) => v === 'best').length}🎯 · {score.filter((v) => v === 'ok').length}✓ · {score.filter((v) => v === 'fail').length}✗
        </span>
      </div>
      <div className="rounded-xl border border-line bg-panel2/50 p-3 text-sm leading-relaxed">{m.src} Choose the bars and spacings so every check passes — then get them down to the class answer.</div>
      <div className="grid grid-cols-2 cq-md:grid-cols-5 gap-2">
        <Num label="h" value={m.h} onChange={(v) => set({ h: Math.max(3, v) })} step={0.5} unit="in" />
        <Pick label="fy" value={m.fy} onChange={(v) => set({ fy: v })} options={FY_OPTS} />
        <Num label="As+ needed (midspan)" value={m.asPos} onChange={(v) => set({ asPos: Math.max(0.01, v) })} step={0.005} unit="in²/ft" />
        <Num label="As− needed (support)" value={m.asNeg} onChange={(v) => set({ asNeg: Math.max(0.01, v) })} step={0.005} unit="in²/ft" />
        <div className="text-sm">
          <div className="text-xs text-mute">As,min = {tsRatio(m.fy)} × 12 × h</div>
          <div className="num font-semibold mt-1.5">{f(AsMin, 3)} in²/ft</div>
        </div>
      </div>

      <div className="grid cq-lg:grid-cols-2 gap-3 items-start">
        <SimBox title="1 · Bottom bars (midspan)" sub={`s_max = min(3h, 18) = ${f(bot.smax, 2)} in · need max(As+, As,min) = ${f(needPos, 3)}`}>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-mute">Bar</span>
            <BarSeg value={m.bar} onChange={(b) => set({ bar: b })} />
          </div>
          <Slider label="Spacing s" value={m.s} min={2} max={20} step={0.5} unit=" in" onChange={(v) => set({ s: v })} />
          <div className="rounded-lg bg-bg/60 border border-line p-1">
            <AsCurve need={needPos} smax={bot.smax} bar={m.bar} s={m.s} onPick={(b, s) => set({ bar: b, s })} />
          </div>
          <div className="text-sm num">
            As provided = {BARS[m.bar].A} × 12 / {f(m.s, 2)} = <b>{f(bot.prov, 3)}</b> in²/ft
          </div>
          <CheckList checks={bot.checks} />
          <VerdictBadge v={bot.verdict} over={bot.over} hint={botHint} />
        </SimBox>
        <div className="space-y-3">
          <div className="rounded-xl bg-bg/60 border border-line p-2">
            <StripSection h={m.h} bar={m.bar} s={m.s} mode="span" n={m.n} sTs={m.sTs} />
          </div>
          <SimBox title="3 · Temperature & shrinkage bars (#3, ⊥ main)" sub={`As = ${tsRatio(m.fy)} × 12 × ${f(m.h, 2)} = ${f(AsMin, 3)} in²/ft · s_max = min(5h, 18) = ${f(ts.smax, 2)} in`}>
            <Slider label="T&S spacing" value={m.sTs} min={3} max={20} step={0.5} unit=" in" onChange={(v) => set({ sTs: v })} />
            <CheckList checks={ts.checks.filter((c) => c.key !== 'prac')} />
            <VerdictBadge v={ts.verdict} over={ts.over} hint={ts.verdict !== 'best' ? `#3 works up to ${f(ts.best, 2)} in` : undefined} />
          </SimBox>
        </div>
      </div>

      <div className="grid cq-lg:grid-cols-2 gap-3 items-start">
        <SimBox title="2 · Top bars over the support" sub={`Alternate bottom bars cranked: one #${m.bar} reaches the top in every 2s = ${f(2 * m.s, 2)} in; add extra top bars for the rest of As− = ${f(needNeg, 3)} in²/ft`}>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-mute">Extra bars per 2s</span>
            <Seg value={String(m.n)} onChange={(v) => set({ n: +v })} items={[0, 1, 2, 3, 4].map((v) => ({ v: String(v), label: String(v) }))} />
          </div>
          <div className="text-sm num">
            Top As = (1 + {m.n}) × {BARS[m.bar].A} × 12 / {f(2 * m.s, 2)} = <b>{f(top.prov, 3)}</b> in²/ft
          </div>
          <CheckList checks={top.checks} />
          <VerdictBadge v={top.verdict} over={top.over} hint={top.verdict === 'ok' ? `the class adds ${top.classN} extra (need ${f(top.nRaw, 2)} bars)` : top.verdict === 'fail' ? `need ${f(top.nRaw, 2)} extra bars → ${top.classN}` : undefined} />
          <div className="text-xs text-faint">Widen the bottom spacing and the cranked bars thin out at the top too — the two choices are linked.</div>
        </SimBox>
        <div className="rounded-xl bg-bg/60 border border-line p-2">
          <StripSection h={m.h} bar={m.bar} s={m.s} mode="support" n={m.n} sTs={m.sTs} />
        </div>
      </div>

      <Reveal title="Class answer, worked">
        <div className="space-y-2 text-sm">
          <div>
            <b>Bottom</b> (#{m.bar}): <Tex>{`s = \\frac{${BARS[m.bar].A}\\times12}{${f(needPos, 3)}} = ${f(bot.raw, 2)}\\text{ in};\\ s_{max} = \\min(3\\times${f(m.h, 2)}, 18) = ${f(bot.smax, 2)}\\ \\Rightarrow\\ \\mathbf{${f(bot.best, 2)}\\text{ in}}`}</Tex>
            {m.bar !== bot.classBar && <span className="text-mute"> — the class's own pick here is #{bot.classBar} (#3 unless it needs s below 4.5 in).</span>}
          </div>
          <div>
            <b>Top</b> (bottom @ {f(bot.best, 2)} in, alternate cranked): in <Tex>{`2s = ${f(2 * bot.best, 2)}`}</Tex> in need <Tex>{`${f(needNeg, 3)}\\times\\frac{${f(2 * bot.best, 2)}}{12} = ${f((needNeg * 2 * bot.best) / 12, 3)}`}</Tex>; cranked bar gives {BARS[m.bar].A} → extra <Tex>{`${f(topBest.nRaw, 2)}\\text{ bars}\\Rightarrow\\mathbf{${topBest.classN}}`}</Tex> (round up unless only ≤ 0.1 bar over).
          </div>
          <div>
            <b>T&S</b>: <Tex>{`A_s = ${tsRatio(m.fy)}\\times12\\times${f(m.h, 2)} = ${f(AsMin, 3)};\\ s = \\frac{0.11\\times12}{${f(AsMin, 3)}} = ${f(ts.raw, 2)};\\ \\min(5h, 18) = ${f(ts.smax, 2)}\\Rightarrow\\mathbf{\\#3 @ ${f(ts.best, 2)}\\text{ in}}`}</Tex>
          </div>
        </div>
      </Reveal>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { fmt } from '../../components/DiagramView'
import { Answer, Callout, Md, Section, Seg, Step, Steps, Tex } from '../../components/ui'
import { ildAt, type ILD } from '../../engine/ild'
import { absoluteMaxMoment, offsets, place, ssMomentILD, ssShearILD, trainExtremes, trainLength, type Train } from '../../engine/moving'
import { AbsMaxSolution, PlacementView, TrainOnILD, TrainTable } from '../../kit/solutions'
import { pick, randInt, rng, Slider, TopicFrequency, useSeed } from '../../labs/common'
import type { PYQ } from '../../pyq/types'
import type { TopicModule } from '../modules'

type Q = 'moment' | 'shear' | 'reaction' | 'absmax'

function ildFor(q: Q, L: number, a: number): ILD {
  if (q === 'moment') return ssMomentILD(L, a)
  if (q === 'shear') return ssShearILD(L, a)
  return { pts: [{ x: 0, y: 1 }, { x: L, y: 0 }], xmin: 0, xmax: L }
}

/** response vs position of wheel 1 */
function ResponseCurve({ ild, t, o, s, best }: { ild: ILD; t: Train; o: 1 | -1; s: number; best?: number }) {
  const len = trainLength(t)
  const lo = ild.xmin - 2,
    hi = ild.xmax + len + 2
  const pts: { s: number; v: number }[] = []
  const N = 500
  for (let i = 0; i <= N; i++) {
    const ss = o > 0 ? lo + ((hi - lo) * i) / N : ild.xmin - len - 2 + ((ild.xmax - ild.xmin + len + 4) * i) / N
    pts.push({ s: ss, v: place(ild, t, ss, o, 1).value })
  }
  const vmax = Math.max(1e-6, ...pts.map((p) => Math.abs(p.v)))
  const W = 820,
    H = 150,
    pad = 50
  const s0 = pts[0].s,
    s1 = pts[pts.length - 1].s
  const X = (x: number) => pad + ((x - s0) / (s1 - s0)) * (W - 2 * pad)
  const Y = (v: number) => H / 2 - (v / vmax) * (H / 2 - 16)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <text x={8} y={14} fontSize={11.5} fill="var(--c-mute)" fontWeight={700}>
        Response vs position of wheel 1 — every peak is a wheel sitting on the critical point
      </text>
      <line x1={pad} x2={W - pad} y1={Y(0)} y2={Y(0)} stroke="var(--c-faint)" />
      <path d={pts.map((p, i) => `${i ? 'L' : 'M'}${X(p.s)},${Y(p.v)}`).join(' ')} fill="none" stroke="var(--c-accent)" strokeWidth={2} />
      <line x1={X(s)} x2={X(s)} y1={10} y2={H - 6} stroke="var(--c-load)" strokeDasharray="3 3" />
      {best !== undefined && <line x1={pad} x2={W - pad} y1={Y(best)} y2={Y(best)} stroke="var(--c-good)" strokeDasharray="5 4" />}
    </svg>
  )
}

function Playground({ fixed }: { fixed?: { t: Train; L: number; a: number; q: Q } }) {
  const { seed, next } = useSeed(13)
  const g = useMemo(() => {
    if (fixed) return fixed
    const r = rng(seed)
    const n = randInt(r, 3, 6)
    const P = Array.from({ length: n }, () => randInt(r, 5, 40, 5))
    const gaps = Array.from({ length: n - 1 }, () => randInt(r, 4, 15))
    const L = pick(r, [40, 50, 60, 72, 80, 90, 100])
    const a = pick(r, [L / 4, L / 3, L / 2, 20, 25])
    const q = pick(r, ['moment', 'shear', 'reaction', 'absmax'] as Q[])
    return { t: { P, gaps }, L, a, q }
  }, [seed, fixed])
  const ild = useMemo(() => ildFor(g.q === 'absmax' ? 'moment' : g.q, g.L, g.q === 'absmax' ? g.L / 2 : g.a), [g])
  const [s, setS] = useState(g.L / 2)
  const [o, setO] = useState<1 | -1>(1)
  const pl = place(ild, g.t, s, o, 1)
  const truth = useMemo(() => (g.q === 'absmax' ? absoluteMaxMoment(g.L, g.t).M : trainExtremes(ild, g.t).max.value), [g, ild])
  const [best, setBest] = useState(0)
  const cur = pl.value
  useEffect(() => {
    if (cur > best) setBest(cur)
  }, [cur, best])
  const len = trainLength(g.t)
  const qLabel = g.q === 'moment' ? `moment at x = ${fmt(g.a)} ft` : g.q === 'shear' ? `shear at x = ${fmt(g.a)} ft` : g.q === 'reaction' ? 'left reaction R_A' : 'absolute maximum moment (anywhere)'
  return (
    <div className="space-y-2">
      {!fixed && (
        <div className="flex items-center gap-2">
          <div className="font-bold">
            Span {g.L} ft — find the max <span className="text-accent">{qLabel}</span>
          </div>
          <button
            className="btn ml-auto"
            onClick={() => {
              next()
              setBest(0)
            }}
          >
            ↻ New train
          </button>
        </div>
      )}
      <TrainTable t={g.t} />
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Slider label="Wheel 1 at x" value={+s.toFixed(1)} min={o > 0 ? -2 : -len - 2} max={o > 0 ? g.L + len + 2 : g.L + 2} step={0.1} onChange={setS} unit="′" />
        </div>
        <Seg value={o === 1 ? 'r' : 'l'} onChange={(v) => setO(v === 'r' ? 1 : -1)} items={[{ v: 'r', label: 'wheel 1 leads →' }, { v: 'l', label: '← reversed' }]} />
      </div>
      <div className="rounded-xl bg-bg/60 border border-line p-2">
        <PlacementView pl={pl} ild={ild} span={[0, g.L]} section={g.q === 'moment' || g.q === 'shear' ? g.a : undefined} title={g.q === 'absmax' ? 'Move the train — the max moment under any wheel is shown below' : `Current ${qLabel}: ${fmt(cur)}`} />
        {g.q !== 'absmax' && <ResponseCurve ild={ild} t={g.t} o={o} s={s} best={fixed ? truth : best} />}
        {!fixed && g.q !== 'absmax' && <div className="text-xs text-mute px-2">Best you have found so far: <b className="num text-ink">{fmt(best)}</b> (green dashed line)</div>}
        {g.q === 'absmax' && <AbsMaxLive L={g.L} t={g.t} s={s} o={o} />}
      </div>
      {!fixed && (
        <div className="rounded-xl border border-line p-3">
          <Answer key={seed} id={`wheel:play:${seed}`} label={`Your max ${g.q === 'shear' ? 'shear (k)' : g.q === 'reaction' ? 'reaction (k)' : 'moment (k-ft)'}`} value={truth} />
          <details className="mt-1">
            <summary className="text-accent cursor-pointer text-sm">show the worked solution</summary>
            <div className="mt-2">{g.q === 'absmax' ? <AbsMaxSolution L={g.L} t={g.t} /> : <TrainOnILD ild={ild} t={g.t} span={[0, g.L]} section={g.q === 'reaction' ? undefined : g.a} peak={{ x: g.q === 'reaction' ? 0 : g.a, side: 1 }} what={qLabel} />}</div>
          </details>
        </div>
      )}
    </div>
  )
}

function AbsMaxLive({ L, t, s, o }: { L: number; t: Train; s: number; o: 1 | -1 }) {
  const d = offsets(t)
  const xs = d.map((dk) => s - o * dk)
  const on = xs.map((x) => x >= 0 && x <= L)
  let W = 0,
    Wm = 0
  xs.forEach((x, i) => {
    if (on[i]) {
      W += t.P[i]
      Wm += t.P[i] * x
    }
  })
  const RA = (W * L - Wm) / L
  const Ms = xs.map((x, k) => {
    if (!on[k]) return null
    let M = RA * x
    xs.forEach((xi, i) => {
      if (on[i] && xi < x) M -= t.P[i] * (x - xi)
    })
    return M
  })
  const best = Math.max(0, ...Ms.map((m) => m ?? 0))
  return (
    <div className="text-sm px-2 pb-1">
      Moments under the wheels on the span:{' '}
      {Ms.map((m, k) => (m === null ? null : <span key={k} className={'num mr-2 ' + (m === best ? 'text-good font-bold' : '')}>{`#${k + 1}: ${fmt(m)}`}</span>))}
    </div>
  )
}

function Overview() {
  return (
    <div>
      <Section title="Series of moving concentrated loads" right={<div className="w-72 hidden md:block"><TopicFrequency topic="wheel" /></div>}>
        <Md>{`A train of wheel loads (fixed spacing) crosses a span. The response under the train is Σ Pᵢ·yᵢ (ILD ordinates under the wheels). Because the ILD is piecewise straight, the maximum always occurs with **some wheel at a corner of the ILD** — at the section for shear/moment, over the support for a reaction.

The art is finding *which* wheel without trying all of them.`}</Md>
      </Section>
      <Section title="Criteria (simply supported span L, section at a from the left)">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="font-bold">Max moment at a section</div>
            <Md>{`Move the train so a wheel crosses the section. Critical when the **average load to the left of the section ≈ the average load on the whole span**:`}</Md>
            <Tex block>{`\\frac{W_L}{a} \\gtrless \\frac{W}{L}\\quad\\text{(switches sign as the critical wheel crosses)}`}</Tex>
          </div>
          <div>
            <div className="font-bold">Max shear at a section</div>
            <Md>{`Start with the leading wheel just right of the section. Moving the next wheel up to the section (a distance d) changes the shear by`}</Md>
            <Tex block>{`\\Delta V = \\frac{W\\,d}{L} - P_{\\text{passed}}`}</Tex>
            <Md>{`(W = load on the span after the move). Keep moving while ΔV > 0.`}</Md>
          </div>
          <div>
            <div className="font-bold">Max end reaction</div>
            <Md>{`Same idea with the ILD of R: $\\Delta R = W d/L - P_{\\text{leaving}}$.`}</Md>
          </div>
          <div>
            <div className="font-bold">Absolute maximum moment</div>
            <Md>{`Occurs under a wheel close to the resultant R of the loads on the span, when **the centreline of the span bisects the distance between that wheel and R**. Then $M = \\frac{R}{L}\\left(\\frac{L}{2}-\\frac{e}{2}\\right)^2 - M_{left}$. Try the wheels on both sides of R.`}</Md>
          </div>
        </div>
        <Callout kind="exam">Every single paper has at least one wheel-load question: shear at L/4 or L/3, moment at L/4 or a given point, absolute max moment, max reaction on a pier between two spans, max force in a truss member (combine with the truss ILD).</Callout>
      </Section>
    </div>
  )
}

function Approach() {
  return (
    <div>
      <Section title="Recipe for max moment at a section">
        <Steps>
          <Step n={1} title="Draw the ILD">Triangle, peak a(L − a)/L at the section.</Step>
          <Step n={2} title="Guess the critical wheel">A heavy wheel in the middle of the group, with the group's centre roughly over the section.</Step>
          <Step n={3} title="Criterion check">Compare W_L/a with W/L with the wheel just left and just right of the section.</Step>
          <Step n={4} title="Compute M = Σ P·y">Ordinates by similar triangles. Check the neighbour wheel too if close.</Step>
        </Steps>
      </Section>
      <Section title="Try it: drag the train" sub="Moment at the quarter point of an 80 ft span (BUET favourite)">
        <Playground fixed={{ t: { P: [10, 20, 20, 20, 15, 15], gaps: [8, 6, 6, 12, 6] }, L: 80, a: 20, q: 'moment' }} />
      </Section>
      <Section title="Absolute maximum moment — the resultant rule">
        <AbsMaxSolution L={60} t={{ P: [10, 20, 20], gaps: [12, 4] }} />
        <p className="text-xs text-faint mt-2">That is Jan-2021 Q5 — the 10-12-20-4-20 train on a 60 ft span.</p>
      </Section>
    </div>
  )
}

function Lab() {
  return (
    <div>
      <Section title="Find the maximum" sub="Random train, span and question. Drag the train to hunt the peak, then enter your answer.">
        <Playground />
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------- own problems
const T1: Train = { P: [12, 24, 24, 24, 18, 18], gaps: [10, 6, 6, 12, 6] }
const T2: Train = { P: [8, 16, 16, 30, 30], gaps: [9, 5, 14, 5] }
const ownW = (id: string, level: PYQ['level'], title: string, text: string, q: Q, t: Train, L: number, a: number): PYQ => {
  const ild = ildFor(q, L, a)
  return {
    id: `own-wheel-${id}`,
    paper: 'own',
    level,
    sec: 'B',
    no: id,
    marks: 0,
    topics: ['wheel'],
    title,
    text,
    pages: [],
    checks: () => [{ key: 'v', label: q === 'shear' ? 'Max positive shear (k)' : q === 'reaction' ? 'Max reaction (k)' : 'Max moment (k-ft)', value: q === 'absmax' ? absoluteMaxMoment(L, t).M : trainExtremes(ild, t).max.value }],
    solution: () => (q === 'absmax' ? <AbsMaxSolution L={L} t={t} /> : <TrainOnILD ild={ild} t={t} span={[0, L]} section={q === 'reaction' ? undefined : a} peak={{ x: q === 'reaction' ? 0 : a, side: 1 }} what={title} />),
  }
}
const problems: PYQ[] = [
  ownW('1', 'warm-up', 'Max shear at the quarter point', 'Train: 12, 24, 24, 24, 18, 18 k at spacings 10, 6, 6, 12, 6 ft. Simply supported span 80 ft. Find the max shear at 20 ft from the left support.', 'shear', T1, 80, 20),
  ownW('2', 'exam', 'Max moment at the one-third point', 'Same train on a 90 ft span: max moment at the one-third point.', 'moment', T1, 90, 30),
  ownW('3', 'exam', 'Absolute maximum moment', 'Train: 8, 16, 16, 30, 30 k at spacings 9, 5, 14, 5 ft on a 60 ft span. Find the absolute maximum moment.', 'absmax', T2, 60, 30),
  ownW('4', 'challenge', 'Max end reaction', 'Same train on a 50 ft span: maximum reaction at the left support.', 'reaction', T2, 50, 0),
]

void ildAt
const mod: TopicModule = { Overview, Approach, Lab, problems }
export default mod

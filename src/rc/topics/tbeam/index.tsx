import { useEffect, useState } from 'react'
import { Answer, Callout, Choice, Md, Reveal, Section, Seg, Step, Steps, Tex } from '../../../components/ui'
import { hashKey } from '../../../labs/CheckTable'
import { pick, rng } from '../../../labs/common'
import { RcFrequency } from '../../components/Frequency'
import { reviewDoubly } from '../../engine/doubly'
import { BARS } from '../../engine/materials'
import { ACI_COEFS, aciMoment, designRect, designT, effectiveWidth, floorLoads, reviewRect, reviewT, wsdTDesign, type BeffIn, type FlangeKind, type FlangeRule, type TDesignIn, type TIn } from '../../engine/tbeam'
import { markUsed } from '../../reference/pane'
import type { RcQ, RcTheoryItem, RcTopicModule } from '../../types'
import { Badge, BarsSel, f, FC_OPTS, Flow, FY_OPTS, newSeed, Num, ProblemBox, Sel, zoneLabel } from '../doubly/kit'
import { ReviewSolution } from '../doubly/solve'
import { BeffSolution, FloorSolution, RectDesignSolution, RectReviewSolution, TDesignSolution, TReviewSolution, TSketch, WsdSolution } from './solve'

const TOPIC = 'rc-tbeam'

function useMark(id: string, v: Record<string, number | string>) {
  const key = JSON.stringify(v)
  useEffect(() => {
    markUsed(id, JSON.parse(key))
  }, [id, key])
}

// ---------------------------------------------------------------- overview
function Overview() {
  return (
    <div>
      <Section title="T- and L-beams" sub="Beam cast with the slab: the slab is the compression flange at midspan" right={<div className="w-72 hidden cq-md:block"><RcFrequency topic={TOPIC} /></div>}>
        <div className="grid cq-md:grid-cols-2 gap-4">
          <Md>{`**What is asked** (about one 15–25 mark question per paper): a floor cross-section (slab on webs, span, c/c spacing, bw, d) and
- (a) **midspan, +M**: find beff, then φMn of given bars or As for a given Mu; check εt and As,min. Usually a ≤ hf (rectangular with b = beff); a true T (a > hf) when the slab is only 3 in (2023-24, 2015-16, 2014-15, 2013-14, 2012-13, 2010-11).
- (b) **support, −M**: 6 bars in two rows inside the slab; the flange is in tension, so it is a **rectangle bw × d** (2023-24 Q4(b), 2021-22 Q7(b), Jan 2021 Q5).
- Older papers: floor loads (slab + web + finishes + LL) → Mu, and the **same beam by WSD** with the printed k, j, z box (2006-07, 2005-06, 2004-05, 2007-08).`}</Md>
          <div>
            <Tex block>{`b_{eff} = \\min(16h_f + b_w,\\ L/4\\ [+b_w],\\ \\text{c/c})`}</Tex>
            <Tex block>{`a = \\frac{A_sf_y}{0.85f'_cb_{eff}} \\le h_f\\ \\Rightarrow\\ \\text{rectangular}`}</Tex>
            <Tex block>{`A_{sf} = \\frac{0.85f'_c(b_{eff} - b_w)h_f}{f_y},\\ a = \\frac{(A_s - A_{sf})f_y}{0.85f'_cb_w}`}</Tex>
            <Tex block>{`M_n = A_{sf}f_y\\left(d - \\tfrac{h_f}{2}\\right) + (A_s - A_{sf})f_y\\left(d - \\tfrac a2\\right)`}</Tex>
          </div>
        </div>
        <Callout kind="exam">2021-22 Q7 and Jan 2021 Q4–Q5 used identical figures (30 ft span, 12′-6″ c/c, 6 in slab, 3 #9 at midspan, 6 #7 at the support); only f′c changed. 2017-18 Q3(a) asked the same section with As = 6 and 9 in² to show both branches.</Callout>
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------- approach
function Approach() {
  // class T-beam floor problem (A deck pp. 155–162)
  const wD = 3.24,
    wL = 0.459,
    L = 24
  const wu = 1.2 * wD + 1.6 * wL
  const Mpos = aciMoment(wu, L, 1 / 14)
  const Mneg = aciMoment(wu, L, 1 / 9)
  const bIn: BeffIn = { kind: 'interior', L, bw: 12, hf: 6.5, cc: 240 }
  const bOut = effectiveWidth(bIn)
  const dIn: TDesignIn = { Mu: Mpos, beff: bOut.b, bw: 12, hf: 6.5, d: 20, dt: 20, fc: 4, fy: 60 }
  const dOut = designT(dIn)
  const prov = reviewT({ beff: bOut.b, bw: 12, hf: 6.5, d: 20, dt: 20, As: 3 * BARS[8].A, fc: 4, fy: 60 })
  const sDes = designRect(Mneg, 12, 20, 21.5, 4, 60)
  const sRev = reviewRect(12, 20, 21.5, 5 * BARS[8].A, 4, 60)
  // Nilson Ex 3.15 (true T)
  const nIn: TDesignIn = { Mu: 6400 / 12, beff: 47, bw: 11, hf: 3, d: 20, fc: 3, fy: 60 }
  const nOut = designT(nIn)
  return (
    <div>
      <Section title="Recipe">
        <div className="grid cq-lg:grid-cols-2 gap-6">
          <div>
            <div className="font-bold mb-2">Midspan (+M): flange in compression</div>
            <Steps>
              <Step n={1} title="beff = least of the rules (T or L)" />
              <Step n={2} title="Review: a = As fy / 0.85f′c beff; a ≤ hf → rectangle beff × d" />
              <Step n={3} title="a > hf → Asf, Mn1 = Asf fy(d − hf/2); a from (As − Asf) with bw; Mn2" />
              <Step n={4} title="c = a/β1, εt at dt → φ; φMn = φ(Mn1 + Mn2)" />
              <Step n={5} title="Design: trial a = hf → As → a with beff; a > hf → T design (φMn1 from Asf, rest by the web)" />
              <Step n={6} title="As ≥ As,min (with bw), εt ≥ 0.005" />
            </Steps>
          </div>
          <div>
            <div className="font-bold mb-2">Support (−M) and loads</div>
            <Steps>
              <Step n={1} title="Flange in tension → rectangle bw × d (bars in the slab, two rows: d to centroid, dt to the far row)" />
              <Step n={2} title="Singly review/design; εt < 0.004 → bottom bars as A′s (doubly)" />
              <Step n={3} title="Loads: slab hf/12·0.15·s, web bw(h − hf)/144·0.15, SDL·s, LL·s" />
              <Step n={4} title="wu = 1.2D + 1.6L; Mu = wu ℓ²/8 (simple) or ACI coefficients (1/14, 1/16, −1/9, −1/10, −1/11)" />
            </Steps>
          </div>
        </div>
      </Section>
      <Section title="Which case am I in?">
        <Flow
          start="Which section? Moment sign decides where the compression is."
          nodes={[
            { q: 'Positive moment (midspan)?', yes: 'Slab is in compression → T-beam with beff.', no: 'Negative (support): slab cracks in tension → rectangle bw × d, compression at the bottom of the web.' },
            { q: 'a = As fy / 0.85f′c beff ≤ hf? (design: Mu ≤ φ·0.85f′c beff hf(d − hf/2))', yes: 'Rectangular beam of width beff (Graph A.1 / R usable).', no: 'True T: Asf balances the overhangs, the rest works with the web.' },
            { q: 'εt ≥ 0.005?', yes: 'φ = 0.9', no: 'transition φ; εt < 0.004 not allowed → compression steel / bigger web' },
          ]}
        />
        <Callout kind="trap">
          <ul>
            <li>Using bw in a = As fy/0.85f′c b at midspan (use beff), or beff at the support (use bw).</li>
            <li>beff: L is the beam span (not the slab span); "c/c" is the beam spacing. The 15th-ed deck and the class floor problem use L/4 + bw; the old slides print L/4. State which.</li>
            <li>In a true T, a comes from (As − Asf) and bw, not from As.</li>
            <li>As,min uses bw, not beff.</li>
            <li>Web self-weight: only the part below the slab, bw(h − hf).</li>
          </ul>
        </Callout>
      </Section>
      <Section title="Class floor problem: continuous T-beam, midspan and interior support" sub="wD = 3.24 k/ft, wL = 0.459 k/ft (from the slab), span 24 ft, 6.5 in slab, bw = 12 in, h = 24 in, d = 20 in, f′c = 4 ksi, fy = 60 ksi">
        <Tex block>{`w_u = 1.2(3.24) + 1.6(0.459) = ${f(wu, 3)}\\text{ k/ft},\\quad +M_u = \\frac{w_u\\ell^2}{14} = ${f(Mpos, 1)}\\text{ k-ft},\\quad -M_u = \\frac{w_u\\ell^2}{9} = ${f(Mneg, 1)}\\text{ k-ft}`}</Tex>
        <BeffSolution inp={bIn} out={bOut} />
        <div className="rounded-xl bg-bg/60 border border-line p-2 my-2">
          <TSketch beff={bOut.b} bw={12} hf={6.5} d={20} dt={20} a={prov.a} c={prov.c} nBars={3} />
        </div>
        <TDesignSolution inp={dIn} r={dOut} />
        <p className="text-sm">
          Provide 3 #8 ({f(3 * BARS[8].A, 2)} in²): a = {f(prov.a, 3)} in, c = {f(prov.c, 3)} in, εt = {f(prov.epsT, 4)} ≫ 0.005, φMn = {f(prov.phiMn, 1)} k-ft ≥ {f(Mpos, 1)} ✓
        </p>
        <div className="font-bold mt-3 text-sm">Interior support (−M): rectangle 12 × 20, dt = 21.5 (two rows)</div>
        <RectDesignSolution Mu={Mneg} b={12} d={20} dt={21.5} fy={60} r={sDes} />
        <p className="text-sm">
          Provide 5 #8 ({f(5 * BARS[8].A, 2)} in²): a = {f(sRev.a, 3)}, c = {f(sRev.c, 3)}, εt = {f(sRev.epsT, 5)}, φ = {f(sRev.phi, 2)}, φMn = {f(sRev.phiMn, 1)} k-ft ✓ (class: a = 5.81, c = 6.83, εt = 0.00644)
        </p>
      </Section>
      <Section title="True T: Nilson Ex 3.15 / 4.15" sub="3 in slab, beams 47 in c/c, span 24 ft, bw = 11, d = 20, Mu = 6400 in-k, f′c = 3, fy = 60 — book: As = 6.45 in²">
        <TDesignSolution inp={nIn} r={nOut} />
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------- lab
type Mode = 'review' | 'design' | 'support' | 'wsd'
interface G {
  kind: FlangeKind
  rule: FlangeRule
  L: number
  ccFt: number
  hf: number
  bw: number
  h: number
  d: number
  dt: number
  fc: number
  fy: number
  nB: number
  bar: number
  Mu: number
  muSrc: 'direct' | 'loads'
  sdl: number
  ll: number
  coef: string
  supMode: 'review' | 'design'
  nC: number
  cBar: number
  dp: number
  n: number
  fsAllow: number
}

const START: G = { kind: 'interior', rule: 'aci14', L: 30, ccFt: 12.5, hf: 6, bw: 12, h: 26.5, d: 24, dt: 24, fc: 4, fy: 60, nB: 3, bar: 9, Mu: 500, muSrc: 'direct', sdl: 50, ll: 100, coef: 'p14', supMode: 'review', nC: 0, cBar: 8, dp: 2.5, n: 9, fsAllow: 24 }

function gen(mode: Mode, seed: number): G {
  const r = rng(seed)
  if (mode === 'support') {
    const d = pick(r, [20, 21, 22, 24])
    return { ...START, hf: pick(r, [5, 6]), bw: 12, d, dt: d + 1.5, h: d + 3, nB: 6, bar: pick(r, [7, 8, 9]), fc: pick(r, [3, 4, 5]), fy: 60, supMode: 'review', nC: 0 }
  }
  if (mode === 'wsd') {
    const hf = 4
    const web = pick(r, [20, 22, 24])
    const h = hf + web
    return { ...START, kind: 'interior', rule: 'aci08', L: pick(r, [24, 25, 28]), ccFt: pick(r, [7, 9, 10, 12]), hf, bw: 12, h, d: h - 4, dt: h - 4, fc: 3, fy: 60, muSrc: 'loads', sdl: pick(r, [60, 75, 90]), ll: pick(r, [80, 100, 100]), coef: 'ss', n: 9, fsAllow: 24 }
  }
  const hf = pick(r, [3, 3, 4, 5, 6])
  const ccFt = pick(r, [4, 50 / 12, 7, 10, 12.5])
  const bw = pick(r, [10, 12, 12, 14])
  const d = pick(r, [20, 21, 22, 24, 24, 26])
  const nB = pick(r, [3, 4, 6])
  const g: G = { ...START, kind: 'interior', rule: 'aci14', L: pick(r, [24, 25, 28, 30]), ccFt, hf, bw, d, dt: nB > 4 ? d + 1.5 : d, h: d + (nB > 4 ? 4 : 2.5), nB, bar: pick(r, [8, 9, 10]), fc: pick(r, [3, 4, 5]), fy: 60, muSrc: 'direct' }
  if (mode === 'design') {
    const beff = effectiveWidth({ kind: 'interior', L: g.L, bw, hf, cc: ccFt * 12 }).b
    const cap = (0.9 * 0.85 * g.fc * beff * hf * (d - hf / 2)) / 12
    g.Mu = Math.round((cap * (0.6 + r() * 0.7)) / 10) * 10
  }
  return g
}

function Lab() {
  const [mode, setMode] = useState<Mode>('review')
  const [g, setG] = useState<G>(START)
  const [gen1, setGen1] = useState(false)
  const set = (o: Partial<G>) => {
    setG({ ...g, ...o })
    setGen1(false)
  }
  const bIn: BeffIn = { kind: g.kind, L: g.L, bw: g.bw, hf: g.hf, cc: g.ccFt * 12, rule: g.rule }
  const bOut = effectiveWidth(bIn)
  const beff = bOut.b
  const As = g.nB * BARS[g.bar].A
  const want = mode === 'support' ? -1 : 1
  const coefRow = ACI_COEFS.find((c) => c.key === g.coef && c.sign === want) ?? ACI_COEFS.find((c) => c.sign === want)!
  const fl = floorLoads({ hf: g.hf, spacing: g.ccFt, bw: g.bw, h: g.h, sdl: g.sdl, ll: g.ll })
  const MuLoads = aciMoment(fl.wu, g.L, coefRow.v)
  const Mservice = aciMoment(fl.wD + fl.wL, g.L, coefRow.v)
  const Mu = g.muSrc === 'loads' ? MuLoads : g.Mu
  const key = hashKey(JSON.stringify([mode, g]))
  const id = (k: string) => `${TOPIC}:lab:${mode}:${key}:${k}`
  useMark('f-beff', { kind: g.kind, gov: bOut.governs, b: beff })

  // results per mode
  const tIn: TIn = { beff, bw: g.bw, hf: g.hf, d: g.d, dt: g.dt, As, fc: g.fc, fy: g.fy }
  const tRev = reviewT(tIn)
  const dIn: TDesignIn = { Mu, beff, bw: g.bw, hf: g.hf, d: g.d, dt: g.dt, fc: g.fc, fy: g.fy }
  const tDes = designT(dIn)
  const sRev = reviewRect(g.bw, g.d, g.dt, As, g.fc, g.fy)
  const sDes = designRect(Mu, g.bw, g.d, g.dt, g.fc, g.fy)
  const sDoubly = g.nC > 0 ? reviewDoubly({ b: g.bw, d: g.d, dt: g.dt, dp: g.dp, As, Asp: g.nC * BARS[g.cBar].A, fc: g.fc, fy: g.fy }) : null
  const Mw = g.muSrc === 'loads' ? Mservice : g.Mu
  const fcAllow = 0.45 * g.fc
  const wsd = wsdTDesign({ M: Mw, beff, hf: g.hf, d: g.d, n: g.n, fcAllow, fsAllow: g.fsAllow })
  const rectMid = mode === 'review' ? tRev.rect : tDes.rect
  const rhoG = mode === 'review' ? As / (beff * g.d) : tDes.As / (beff * g.d)
  useMark('f-graphA1', rectMid ? { fc: g.fc, fy: g.fy, rho: rhoG, R: (mode === 'review' ? tRev.Mn : (Mu * 12) / 0.9) * 1000 / (beff * g.d * g.d) } : { fc: g.fc, fy: g.fy })
  useMark('f-wsdT', { k: wsd.sec.k, z: wsd.sec.z, jd: wsd.sec.jd, rect: wsd.sec.rect ? 1 : 0 })

  const sketch =
    mode === 'support' ? (
      <TSketch beff={beff} bw={g.bw} hf={g.hf} d={g.d} dt={g.dt} a={g.supMode === 'review' ? sRev.a : sDes.a} c={g.supMode === 'review' ? sRev.c : sDes.c} nBars={g.supMode === 'review' ? g.nB : Math.max(2, Math.ceil(sDes.As / BARS[g.bar].A))} support />
    ) : mode === 'design' ? (
      <TSketch beff={beff} bw={g.bw} hf={g.hf} d={g.d} dt={g.dt} a={tDes.a} c={tDes.c} nBars={Math.max(2, Math.ceil(tDes.As / BARS[g.bar].A))} />
    ) : mode === 'wsd' ? (
      <TSketch beff={beff} bw={g.bw} hf={g.hf} d={g.d} dt={g.dt} a={Math.min(wsd.sec.kd, g.d)} c={wsd.sec.kd} nBars={Math.max(2, Math.ceil(wsd.As / BARS[g.bar].A))} />
    ) : (
      <TSketch beff={beff} bw={g.bw} hf={g.hf} d={g.d} dt={g.dt} a={tRev.a} c={tRev.c} nBars={g.nB} />
    )

  const problemText = () => {
    if (mode === 'support')
      return `The section of the continuous T-beam at the interior support has ${g.nB} No. ${g.bar} top bars in two rows inside the ${g.hf} in slab (d = ${g.d} in, dt = ${g.dt} in), bw = ${g.bw} in. f′c = ${g.fc} ksi, fy = ${g.fy} ksi. Find the nominal and design negative moment capacity; check εt and minimum reinforcement.`
    if (mode === 'wsd')
      return `A ${g.hf} in slab is supported on simply supported beams at ${f(g.ccFt, 2)} ft c/c spanning ${g.L} ft. Webs are ${g.bw} in wide and ${g.h - g.hf} in deep below the slab; d = ${g.d} in. Floor finish + partitions = ${g.sdl} psf in addition to self-weight; live load ${g.ll} psf. f′c = ${g.fc} ksi, fy = ${g.fy} ksi, fc = ${f(fcAllow, 3)} ksi, fs = ${g.fsAllow} ksi, n = ${g.n}. Find beff and design a typical interior beam by WSD.`
    const base = `A ${g.hf} in slab is cast monolithically with continuous T-beams of ${g.L} ft span at ${f(g.ccFt * 12, 1)} in on centres; bw = ${g.bw} in, d = ${g.d} in${g.dt !== g.d ? `, dt = ${g.dt} in` : ''}. f′c = ${g.fc} ksi, fy = ${g.fy} ksi.`
    return mode === 'review' ? `${base} The midspan section has ${g.nB} No. ${g.bar} bars. Find the nominal and design positive moment capacity and check εt.` : `${base} Determine the tensile reinforcement at midspan for Mu = ${f(Mu, 0)} kip-ft; check As,min and εt.`
  }

  return (
    <div>
      <Section
        title="T-beam lab"
        sub="Midspan review/design, support section, or the old WSD design. Code pane: beff, Graph A.1 and the WSD box highlight what you used."
        right={
          <Seg
            value={mode}
            onChange={(m) => {
              setMode(m)
              setGen1(false)
              if (m === 'support') setG({ ...g, nB: 6, bar: 7, dt: g.d + 1.5 })
              if (m === 'wsd') setG({ ...g, muSrc: 'loads', coef: 'ss' })
            }}
            items={[
              { v: 'review', label: 'Review +M' },
              { v: 'design', label: 'Design +M' },
              { v: 'support', label: 'Support −M' },
              { v: 'wsd', label: 'WSD' },
            ]}
          />
        }
      >
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 items-center">
            <button
              className="btn"
              onClick={() => {
                setG(gen(mode, newSeed()))
                setGen1(true)
              }}
            >
              🎲 Exam-style problem
            </button>
            {mode === 'wsd' && <span className="text-xs text-faint">older papers (pre-2013): WSD, solve as asked</span>}
          </div>
          {gen1 && <ProblemBox>{problemText()}</ProblemBox>}
          <div className="grid grid-cols-2 cq-md:grid-cols-4 cq-lg:grid-cols-6 gap-2">
            <Sel label="Beam" value={g.kind} options={['interior', 'edge'] as FlangeKind[]} onChange={(v) => set({ kind: v })} fmtOpt={(v) => (v === 'interior' ? 'interior T' : 'edge L')} />
            <Sel label="beff rule" value={g.rule} options={['aci14', 'aci08'] as FlangeRule[]} onChange={(v) => set({ rule: v })} fmtOpt={(v) => (v === 'aci14' ? 'L/4 + bw (15th ed)' : 'L/4 (old slides)')} />
            <Num label="Span L" unit="ft" value={g.L} onChange={(v) => set({ L: v })} step={1} />
            <Num label="c/c spacing" unit="ft" value={+g.ccFt.toFixed(3)} onChange={(v) => set({ ccFt: v })} step={0.5} />
            <Num label="hf (slab)" unit="in" value={g.hf} onChange={(v) => set({ hf: v })} />
            <Num label="bw" unit="in" value={g.bw} onChange={(v) => set({ bw: v })} step={1} />
            <Num label="d" unit="in" value={g.d} onChange={(v) => set({ d: v })} />
            <Num label="dt" unit="in" value={g.dt} onChange={(v) => set({ dt: v })} />
            <Sel label="f′c (ksi)" value={g.fc} options={FC_OPTS} onChange={(v) => set({ fc: v })} />
            <Sel label="fy (ksi)" value={g.fy} options={FY_OPTS} onChange={(v) => set({ fy: v })} />
            {(mode === 'review' || (mode === 'support' && g.supMode === 'review')) && <BarsSel label={mode === 'support' ? 'Top bars' : 'Bottom bars'} n={g.nB} no={g.bar} onN={(v) => set({ nB: v })} onNo={(v) => set({ bar: v })} />}
            {(mode === 'design' || mode === 'wsd' || (mode === 'support' && g.supMode === 'design')) && (
              <>
                <Sel label="Moment from" value={g.muSrc} options={['direct', 'loads'] as ('direct' | 'loads')[]} onChange={(v) => set({ muSrc: v })} fmtOpt={(v) => (v === 'direct' ? 'given M' : 'floor loads')} />
                {g.muSrc === 'direct' && <Num label={mode === 'wsd' ? 'Service M' : 'Mu'} unit="k-ft" value={g.Mu} onChange={(v) => set({ Mu: v })} step={10} />}
              </>
            )}
            {mode === 'support' && (
              <div className="flex flex-col gap-1 text-sm">
                <span className="text-xs text-mute">Task</span>
                <Seg size="xs" value={g.supMode} onChange={(v) => set({ supMode: v })} items={[{ v: 'review', label: 'review bars' }, { v: 'design', label: 'design As' }]} />
              </div>
            )}
            {mode === 'support' && g.supMode === 'review' && <BarsSel label="Bottom bars as A′s (optional)" n={g.nC} no={g.cBar} onN={(v) => set({ nC: v })} onNo={(v) => set({ cBar: v })} nOpts={[0, 2, 3, 4]} />}
            {mode === 'wsd' && (
              <>
                <Num label="n" value={g.n} onChange={(v) => set({ n: v })} step={1} />
                <Sel label="fs allow (ksi)" value={g.fsAllow} options={[20, 24]} onChange={(v) => set({ fsAllow: v })} />
              </>
            )}
          </div>
          {g.muSrc === 'loads' && (mode === 'design' || mode === 'wsd' || (mode === 'support' && g.supMode === 'design')) && (
            <div className="grid grid-cols-2 cq-md:grid-cols-4 gap-2">
              <Num label="h (overall)" unit="in" value={g.h} onChange={(v) => set({ h: v })} />
              <Num label="SDL (FF + PW)" unit="psf" value={g.sdl} onChange={(v) => set({ sdl: v })} step={5} />
              <Num label="LL" unit="psf" value={g.ll} onChange={(v) => set({ ll: v })} step={10} />
              <Sel label="Moment coefficient" value={coefRow.key} options={ACI_COEFS.filter((c) => (mode === 'support' ? c.sign < 0 : c.sign > 0)).map((c) => c.key)} onChange={(v) => set({ coef: v })} fmtOpt={(k) => ACI_COEFS.find((c) => c.key === k)!.label} />
            </div>
          )}
          <div className="rounded-xl bg-bg/60 border border-line p-2">{sketch}</div>
          <div key={key} className="rounded-xl border border-line p-3 space-y-0.5">
            <div className="text-xs font-bold uppercase tracking-wider text-faint">Your checkpoints</div>
            {mode !== 'support' && <Answer id={id('beff')} label="beff" value={beff} unit="in" compact />}
            {g.muSrc === 'loads' && mode !== 'review' && !(mode === 'support' && g.supMode === 'review') && (
              <>
                <Answer id={id('wu')} label={mode === 'wsd' ? 'w (service)' : 'wu'} value={mode === 'wsd' ? fl.wD + fl.wL : fl.wu} unit="k/ft" compact />
                <Answer id={id('mu')} label={mode === 'wsd' ? 'M (service)' : mode === 'support' ? '−Mu' : 'Mu'} value={mode === 'wsd' ? Mservice : MuLoads} unit="k-ft" compact />
              </>
            )}
            {mode === 'review' && (
              <>
                <Choice id={id('case')} label="a vs hf" options={[{ v: 'r', label: 'a ≤ hf (rectangular)' }, { v: 't', label: 'a > hf (true T)' }]} answer={tRev.rect ? 'r' : 't'} />
                {!tRev.rect && <Answer id={id('asf')} label="Asf" value={tRev.Asf} unit="in²" compact />}
                <Answer id={id('a')} label="a" value={tRev.a} unit="in" compact />
                <Answer id={id('mn')} label="Mn" value={tRev.Mn / 12} unit="k-ft" compact />
                <Answer id={id('et')} label="εt" value={tRev.epsT} tol={0.03} compact />
                <Answer id={id('pmn')} label="φMn" value={tRev.phiMn} unit="k-ft" compact />
              </>
            )}
            {mode === 'design' && (
              <>
                <Choice id={id('case')} label="Design case" options={[{ v: 'r', label: 'rectangular (beff)' }, { v: 't', label: 'true T' }]} answer={tDes.rect ? 'r' : 't'} />
                {!tDes.rect && (
                  <>
                    <Answer id={id('asf')} label="Asf" value={tDes.Asf} unit="in²" compact />
                    <Answer id={id('pm1')} label="φMn1 (flange)" value={tDes.phiMn1} unit="k-ft" compact />
                  </>
                )}
                <Answer id={id('as')} label="As required" value={tDes.As} unit="in²" compact />
                <Answer id={id('et')} label="εt" value={tDes.epsT} tol={0.03} compact />
              </>
            )}
            {mode === 'support' && g.supMode === 'review' && (
              <>
                <Answer id={id('a')} label="a (on bw)" value={sRev.a} unit="in" compact />
                <Answer id={id('et')} label="εt" value={sRev.epsT} tol={0.03} compact />
                <Answer id={id('phi')} label="φ" value={sRev.phi} tol={0.01} compact />
                <Answer id={id('pmn')} label="φMn (−)" value={sRev.phiMn} unit="k-ft" compact />
                <Answer id={id('asmin')} label="As,min" value={sRev.AsMin} unit="in²" compact />
              </>
            )}
            {mode === 'support' && g.supMode === 'design' && (
              <>
                <Answer id={id('as')} label="As required (top)" value={sDes.As} unit="in²" compact />
                <Answer id={id('et')} label="εt" value={sDes.epsT} tol={0.03} compact />
              </>
            )}
            {mode === 'wsd' && (
              <>
                <Answer id={id('k')} label="k (final)" value={wsd.sec.k} tol={0.02} compact />
                <Answer id={id('jd')} label="jd" value={wsd.sec.jd} unit="in" compact />
                <Answer id={id('as')} label="As (WSD)" value={wsd.As} unit="in²" compact />
                <Answer id={id('fc')} label="fc under M" value={wsd.fcAct} unit="ksi" compact />
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            {mode === 'review' && <Badge okv={tRev.zone === 'tension'} yes="tension-controlled" no={zoneLabel(tRev.zone)} />}
            {mode === 'design' && <Badge okv={!tDes.tooHeavy && tDes.possible} yes={`As = ${f(tDes.As, 2)} in² → e.g. ${Math.ceil(tDes.As / BARS[g.bar].A)} #${g.bar}`} no="web too small (εt < 0.004)" />}
            {mode === 'support' && <Badge okv={(g.supMode === 'review' ? sRev.epsT : sDes.epsT) >= 0.004} yes="εt ≥ 0.004" no="εt < 0.004: doubly needed" />}
            {mode === 'wsd' && <Badge okv={wsd.concreteOk} yes="concrete stress OK" no="fc > allowable" />}
          </div>
          <Reveal id={id('sol')} title="Full solution">
            <div className="space-y-3">
              {g.muSrc === 'loads' && mode !== 'review' && !(mode === 'support' && g.supMode === 'review') && (
                <FloorSolution p={{ hf: g.hf, spacing: g.ccFt, bw: g.bw, h: g.h, sdl: g.sdl, ll: g.ll }} o={fl} L={g.L} coefLabel={mode === 'wsd' ? `\\text{(service } w_D + w_L = ${f(fl.wD + fl.wL, 3)})\\ ${f(coefRow.v, 4)}` : f(coefRow.v, 4)} coef={coefRow.v} Mu={mode === 'wsd' ? Mservice : MuLoads} />
              )}
              {mode !== 'support' && <BeffSolution inp={bIn} out={bOut} />}
              {mode === 'review' && <TReviewSolution inp={tIn} r={tRev} />}
              {mode === 'design' && <TDesignSolution inp={dIn} r={tDes} />}
              {mode === 'support' && g.supMode === 'review' && <RectReviewSolution b={g.bw} d={g.d} dt={g.dt} As={As} fc={g.fc} fy={g.fy} r={sRev} />}
              {mode === 'support' && g.supMode === 'design' && <RectDesignSolution Mu={Mu} b={g.bw} d={g.d} dt={g.dt} fy={g.fy} r={sDes} />}
              {mode === 'support' && sDoubly && g.supMode === 'review' && (
                <div>
                  <div className="font-semibold text-sm mt-2">With the bottom bars as compression steel (doubly, d′ = {f(g.dp)} in):</div>
                  <ReviewSolution inp={{ b: g.bw, d: g.d, dt: g.dt, dp: g.dp, As, Asp: g.nC * BARS[g.cBar].A, fc: g.fc, fy: g.fy }} r={sDoubly} compact />
                </div>
              )}
              {mode === 'wsd' && <WsdSolution M={Mw} beff={beff} hf={g.hf} d={g.d} n={g.n} fcAllow={fcAllow} fsAllow={g.fsAllow} r={wsd} />}
            </div>
          </Reveal>
        </div>
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------- theory
const theory: RcTheoryItem[] = [
  {
    id: 'tt-beff',
    topic: TOPIC,
    q: 'State the ACI provisions for the effective flange width of T-beams and L-beams. Why must the flange width be limited?',
    seen: ['2008-09', '2007-08'],
    a: `**ACI (318-14 Table 6.3.2.1; 318-08 §8.12)** — L = beam span, hf = slab thickness, sw = clear distance to the next web:
- **Interior T (slab both sides)**: overhang each side ≤ 8hf, ≤ sw/2, ≤ L/8 → $b_{eff} = \\min(16h_f + b_w,\\ b_w + L/4,\\ \\text{c/c spacing})$ (older code: $b \\le L/4$).
- **Edge / L-beam (slab one side)**: overhang ≤ 6hf, ≤ sw/2, ≤ L/12 → $b_{eff} = \\min(b_w + 6h_f,\\ b_w + L/12,\\ b_w + s_w/2)$.
- **Isolated T** (flange only to add compression area): $h_f \\ge b_w/2$ and $b \\le 4b_w$.

**Why limited — shear lag.** The flange compression is delivered from the web through in-plane shear in the slab. The slab deforms in shear, so the longitudinal stress is highest over the web and falls off with distance from it. The real non-uniform stress is replaced by a uniform stress over an equivalent width beff that gives the same total force. The decay depends on the span (short spans → less effective width), the slab thickness (thin slabs are flexible in shear and can buckle) and the spacing (a slab panel cannot be counted by two beams). Using the full width would overestimate the strength and stiffness.`,
    Fig: () => (
      <svg viewBox="0 0 360 110" className="w-full max-w-sm h-auto">
        <rect x={10} y={30} width={340} height={12} fill="var(--c-panel2)" stroke="var(--c-mute)" />
        <rect x={165} y={42} width={30} height={50} fill="var(--c-panel2)" stroke="var(--c-mute)" />
        <path d="M10,28 C90,26 140,6 180,4 C220,6 270,26 350,28" fill="none" stroke="var(--c-bad)" strokeWidth={2} />
        <rect x={115} y={4} width={130} height={24} fill="var(--c-accent)" fillOpacity={0.2} stroke="var(--c-accent)" strokeDasharray="3 2" />
        <text x={180} y={104} fontSize={10} textAnchor="middle" fill="var(--c-mute)">
          actual flange stress (red) vs uniform stress over beff (blue)
        </text>
      </svg>
    ),
  },
  {
    id: 'tt-web',
    topic: TOPIC,
    q: 'What points should be considered when choosing the web proportions (bw and d) of a T-beam?',
    seen: ['2007-08'],
    a: `- **Negative moment at the supports governs**: there the flange is in tension and the section is a rectangle bw × d, so bw and d must give $\\varepsilon_t \\ge 0.004$ (preferably 0.005) for −Mu (or allow compression steel from the bottom bars). At midspan the wide flange gives plenty of compression area, so +M rarely controls the web size.
- **Shear**: $V_u \\le \\phi(V_c + V_{s,max})$ with $V_c = 2\\lambda\\sqrt{f'_c}b_wd$ and $V_s \\le 8\\sqrt{f'_c}b_wd$ — only the web resists shear.
- **Bar placement**: bw must fit the bottom bars in one or two layers with cover (1.5 in), stirrups and clear spacing ≥ max(1 in, db); bars from the slab-beam junction and column bars must pass.
- **Deflection / minimum depth** (ACI Table 9.3.1.1: L/16 simple, L/18.5 one end continuous, L/21 both ends continuous) and architectural headroom.
- **Economy and formwork**: standard widths (10, 12, 14 in), bw ≈ 0.4–0.6 of the depth below the slab; same depth along a floor to reuse forms.
- **Torsion** (spandrel L-beams) and fire rating/cover also need adequate width.`,
  },
  {
    id: 'tt-support',
    topic: TOPIC,
    q: 'Why is a continuous T-beam designed as a rectangular beam at the supports?',
    seen: [],
    a: `- Over an interior support the moment is negative: the **top** fibres (the slab) are in tension and the **bottom** of the web is in compression.
- Concrete in tension is assumed cracked and carries nothing, so the flange does not help; the compression zone is the bottom of the web, width bw.
- Hence the support section is a rectangle bw × d with the top bars (placed within beff in the slab) as tension steel; with high −M the bottom bars continuing into the support can be counted as compression steel (doubly reinforced).
- Conversely an **inverted (upstand) beam** or a cantilever with the slab at the bottom acts as a T-beam under negative moment, because there the slab is on the compression side.`,
  },
  {
    id: 'tt-cases',
    topic: TOPIC,
    q: 'When does a flanged section behave as a rectangular beam and when as a true T-beam?',
    seen: [],
    a: `- Compute the stress-block depth assuming the whole compression zone is in the flange: $a = A_sf_y/(0.85f'_cb_{eff})$.
- **a ≤ hf**: the neutral area of compression is a rectangle of width beff; the concrete below the flange is in tension anyway, so the section is analysed as a **rectangular beam of width beff** (Graph A.1 / R tables apply with b = beff).
- **a > hf**: compression extends into the web; the compressed area is T-shaped. Split it: $C_f = 0.85f'_c(b_{eff} - b_w)h_f$ balanced by $A_{sf} = C_f/f_y$, and the web part $C_w = 0.85f'_cb_wa$ balanced by $A_s - A_{sf}$.
- In design the test is $M_u \\le \\phi\\,0.85f'_cb_{eff}h_f(d - h_f/2)$. True T sections occur with thin slabs (3 in) and large Mu; they also have lower εt, so check ductility.`,
  },
]

// ---------------------------------------------------------------- own problems
const P1: TIn & { L: number; cc: number } = { L: 28, cc: 120, beff: 0, bw: 12, hf: 5, d: 22, dt: 22, As: 4 * BARS[9].A, fc: 4, fy: 60 }
const P2 = { L: 28, cc: 50, bw: 12, hf: 3, d: 22, dt: 23.5, Mu: 600, fc: 3, fy: 60 }
const P3 = { L: 25, spacing: 10, hf: 4, bw: 12, h: 24, d: 20, sdl: 75, ll: 100, fc: 3, fy: 60 }
const P4 = { bw: 12, d: 21, dt: 22.5, As: 6 * BARS[8].A, fc: 4, fy: 60 }

const beffP1 = () => effectiveWidth({ kind: 'interior', L: P1.L, bw: P1.bw, hf: P1.hf, cc: P1.cc })
const beffP2 = () => effectiveWidth({ kind: 'interior', L: P2.L, bw: P2.bw, hf: P2.hf, cc: P2.cc })

const problems: RcQ[] = [
  {
    id: 'rc-own-tbeam-1',
    paper: 'own',
    level: 'warm-up',
    sec: 'A',
    no: '1',
    marks: 15,
    topics: [TOPIC],
    title: 'Midspan review (rectangular behaviour)',
    text: 'A 5 in slab is cast with continuous T-beams spanning 28 ft at 10 ft centres; bw = 12 in, d = 22 in. Midspan steel: 4 No. 9. f′c = 4 ksi, fy = 60 ksi. Find beff, the nominal and design positive moment capacity, and εt.',
    pages: [],
    checks: () => {
      const b = beffP1().b
      const r = reviewT({ ...P1, beff: b })
      return [
        { key: 'beff', label: 'beff', value: b, unit: 'in' },
        { key: 'a', label: 'a', value: r.a, unit: 'in' },
        { key: 'pmn', label: 'φMn', value: r.phiMn, unit: 'k-ft' },
      ]
    },
    solution: () => {
      const bo = beffP1()
      const inp = { ...P1, beff: bo.b }
      return (
        <div className="space-y-2">
          <BeffSolution inp={{ kind: 'interior', L: P1.L, bw: P1.bw, hf: P1.hf, cc: P1.cc }} out={bo} />
          <TReviewSolution inp={inp} r={reviewT(inp)} />
        </div>
      )
    },
  },
  {
    id: 'rc-own-tbeam-2',
    paper: 'own',
    level: 'exam',
    sec: 'A',
    no: '2',
    marks: 17,
    topics: [TOPIC],
    title: 'Midspan design with a thin slab (true T)',
    text: 'A 3 in slab on continuous T-beams of 28 ft span at 50 in centres. The web is set by the support moment: bw = 12 in, d = 22 in (two layers, dt = 23.5 in). f′c = 3 ksi, fy = 60 ksi. Find the tensile steel at midspan for Mu = 600 kip-ft; check As,min and εt.',
    pages: [],
    checks: () => {
      const b = beffP2().b
      const r = designT({ ...P2, beff: b })
      return [
        { key: 'beff', label: 'beff', value: b, unit: 'in' },
        { key: 'asf', label: 'Asf', value: r.Asf, unit: 'in²' },
        { key: 'as', label: 'As', value: r.As, unit: 'in²' },
      ]
    },
    solution: () => {
      const bo = beffP2()
      const inp = { ...P2, beff: bo.b }
      return (
        <div className="space-y-2">
          <BeffSolution inp={{ kind: 'interior', L: P2.L, bw: P2.bw, hf: P2.hf, cc: P2.cc }} out={bo} />
          <TDesignSolution inp={inp} r={designT(inp)} />
        </div>
      )
    },
  },
  {
    id: 'rc-own-tbeam-3',
    paper: 'own',
    level: 'exam',
    sec: 'A',
    no: '3',
    marks: 30,
    topics: [TOPIC],
    title: 'Floor T-beam from loads, USD and WSD',
    flag: 'WSD part: older-paper method (2006-07 Q3, 2005-06 Q2).',
    text: 'A 4 in slab rests on simply supported beams 25 ft long at 10 ft centres; webs 12 in wide, 20 in below the slab (h = 24 in), d = 20 in. Floor finish + partitions 75 psf in addition to self-weight; live load 100 psf. f′c = 3 ksi, fy = 60 ksi. (i) beff (old rule b ≤ L/4 as in the paper); (ii) As by USD; (iii) As by WSD with fc = 1.35 ksi, fs = 24 ksi, n = 9.',
    pages: [],
    checks: () => {
      const b = effectiveWidth({ kind: 'interior', L: P3.L, bw: P3.bw, hf: P3.hf, cc: P3.spacing * 12, rule: 'aci08' }).b
      const fl = floorLoads(P3)
      const Mu = aciMoment(fl.wu, P3.L, 1 / 8)
      const u = designT({ Mu, beff: b, bw: P3.bw, hf: P3.hf, d: P3.d, fc: P3.fc, fy: P3.fy })
      const w = wsdTDesign({ M: aciMoment(fl.wD + fl.wL, P3.L, 1 / 8), beff: b, hf: P3.hf, d: P3.d, n: 9, fcAllow: 1.35, fsAllow: 24 })
      return [
        { key: 'beff', label: 'beff', value: b, unit: 'in' },
        { key: 'mu', label: 'Mu', value: Mu, unit: 'k-ft' },
        { key: 'as', label: 'As (USD)', value: u.As, unit: 'in²' },
        { key: 'asw', label: 'As (WSD)', value: w.As, unit: 'in²' },
      ]
    },
    solution: () => {
      const bIn: BeffIn = { kind: 'interior', L: P3.L, bw: P3.bw, hf: P3.hf, cc: P3.spacing * 12, rule: 'aci08' }
      const bo = effectiveWidth(bIn)
      const fl = floorLoads(P3)
      const Mu = aciMoment(fl.wu, P3.L, 1 / 8)
      const Ms = aciMoment(fl.wD + fl.wL, P3.L, 1 / 8)
      const dIn = { Mu, beff: bo.b, bw: P3.bw, hf: P3.hf, d: P3.d, fc: P3.fc, fy: P3.fy }
      return (
        <div className="space-y-2">
          <BeffSolution inp={bIn} out={bo} />
          <FloorSolution p={P3} o={fl} L={P3.L} coefLabel="\tfrac18" coef={1 / 8} Mu={Mu} />
          <TDesignSolution inp={dIn} r={designT(dIn)} />
          <WsdSolution M={Ms} beff={bo.b} hf={P3.hf} d={P3.d} n={9} fcAllow={1.35} fsAllow={24} r={wsdTDesign({ M: Ms, beff: bo.b, hf: P3.hf, d: P3.d, n: 9, fcAllow: 1.35, fsAllow: 24 })} />
        </div>
      )
    },
  },
  {
    id: 'rc-own-tbeam-4',
    paper: 'own',
    level: 'exam',
    sec: 'A',
    no: '4',
    marks: 18,
    topics: [TOPIC],
    title: 'Support section (−M), two rows in the slab',
    text: 'At the interior support of a continuous T-beam floor, 6 No. 8 top bars sit in two rows inside the slab: d = 21 in, dt = 22.5 in, bw = 12 in. f′c = 4 ksi, fy = 60 ksi. Find the nominal and design negative moment capacity; check εt and As,min.',
    pages: [],
    checks: () => {
      const r = reviewRect(P4.bw, P4.d, P4.dt, P4.As, P4.fc, P4.fy)
      return [
        { key: 'a', label: 'a', value: r.a, unit: 'in' },
        { key: 'et', label: 'εt', value: r.epsT, tol: 0.03 },
        { key: 'pmn', label: 'φMn', value: r.phiMn, unit: 'k-ft' },
      ]
    },
    solution: () => <RectReviewSolution b={P4.bw} d={P4.d} dt={P4.dt} As={P4.As} fc={P4.fc} fy={P4.fy} r={reviewRect(P4.bw, P4.d, P4.dt, P4.As, P4.fc, P4.fy)} />,
  },
]

const mod: RcTopicModule = { Overview, Approach, Lab, problems, theory }
export default mod

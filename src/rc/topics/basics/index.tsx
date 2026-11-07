// CE 315 — Basics, loads & safety: USD vs WSD, uncertainty, load factors and φ, cover, floor systems,
// serviceability, material curves. Lab = a small "loads & φ" calculator.

import { useState } from 'react'
import { fmt } from '../../../components/DiagramView'
import { GhostPts } from '../../../components/PointTip'
import { Answer, Callout, Choice, Md, Reveal, Section, Seg, Step, Steps } from '../../../components/ui'
import { hashKey } from '../../../labs/CheckTable'
import { pick, randInt, rng, Slider } from '../../../labs/common'
import { RcFrequency } from '../../components/Frequency'
import { Ec, phiFlex } from '../../engine/materials'
import { beamLoads, concreteStress, SUPPORT_LABEL, ZONE_LABEL, zoneOf, type Support } from '../../engine/singly'
import type { RcQ, RcTheoryItem, RcTopicModule } from '../../types'
import { Checks, Num, Prompt, Sel, useMark } from '../elastic/inputs'
import { SolSteps } from '../elastic/ui'
import { PhiChart } from '../singly/charts'
import { PickSection } from '../../components/PickDrill'
import { BASICS_PICKS } from './picks'

const T = 'rc-basics'

// ---------------------------------------------------------------- loads lab
interface LP {
  src: 'line' | 'floor'
  span: number
  support: Support
  b: number
  h: number
  sdl: number
  ll: number
  // floor → beam
  slab: number // in
  ff: number // psf
  pw: number // psf partitions
  llpsf: number
  trib: number // ft
  old: boolean
}
const LDEF: LP = { src: 'line', span: 25, support: 'ss', b: 12, h: 25, sdl: 1, ll: 2, slab: 5, ff: 25, pw: 50, llpsf: 60, trib: 12, old: false }

/** floor area loads → beam line loads (k/ft): slab self-weight + FF + PW = SDL, LL × tributary width */
export function floorToBeam(p: Pick<LP, 'slab' | 'ff' | 'pw' | 'llpsf' | 'trib'>) {
  const slabPsf = (p.slab / 12) * 150
  const D = ((slabPsf + p.ff + p.pw) * p.trib) / 1000
  const L = (p.llpsf * p.trib) / 1000
  return { slabPsf, D, L }
}

function randomLP(seed: number): LP {
  const r = rng(seed)
  const floor = r() < 0.5
  return {
    ...LDEF,
    src: floor ? 'floor' : 'line',
    span: randInt(r, 14, 28),
    support: pick(r, ['ss', 'ss', 'cant', 'fixed'] as Support[]),
    b: pick(r, [10, 12, 14]),
    h: randInt(r, 18, 30),
    sdl: pick(r, [0.8, 1, 1.2, 1.5]),
    ll: pick(r, [1, 1.5, 2, 2.5]),
    slab: pick(r, [4.5, 5, 5.5, 6]),
    ff: pick(r, [20, 25, 30]),
    pw: pick(r, [0, 40, 50]),
    llpsf: pick(r, [40, 60, 80, 100]),
    trib: pick(r, [10, 12, 14, 15]),
    old: r() < 0.2,
  }
}

function LoadsLab() {
  const [p, setP] = useState<LP>(LDEF)
  const [random, setRandom] = useState(false)
  const set = (o: Partial<LP>) => setP({ ...p, ...o })
  const fl = floorToBeam(p)
  const sdl = p.src === 'floor' ? fl.D : p.sdl
  const ll = p.src === 'floor' ? fl.L : p.ll
  const loads = beamLoads({ span: p.span, support: p.support, b: p.b, h: p.h, sdl, ll, fD: p.old ? 1.4 : 1.2, fL: p.old ? 1.7 : 1.6 })
  const key = hashKey(JSON.stringify(p))
  const id = (k: string) => `${T}:lab:${key}:${k}`
  useMark('m-loads', { old: p.old ? 1 : 0 })
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <Seg value={p.src} onChange={(src) => set({ src })} items={[{ v: 'line', label: 'Line loads on the beam' }, { v: 'floor', label: 'From floor loads (psf)' }]} />
        <button
          className="btn"
          onClick={() => {
            setP(randomLP(Math.floor(Math.random() * 1e9)))
            setRandom(true)
          }}
        >
          🎲 Random beam
        </button>
        {random && (
          <button className="text-sm text-accent underline" onClick={() => setRandom(false)}>
            edit the inputs
          </button>
        )}
      </div>
      {random ? (
        <Prompt>
          A {SUPPORT_LABEL[p.support]} beam, {p.b} in × {p.h} in, span {p.span} ft,{' '}
          {p.src === 'floor'
            ? `supports a ${p.slab} in slab over a tributary width of ${p.trib} ft with floor finish ${p.ff} psf${p.pw ? `, partition walls ${p.pw} psf` : ''} and live load ${p.llpsf} psf.`
            : `carries a superimposed dead load of ${p.sdl} k/ft and a live load of ${p.ll} k/ft (service), plus its self-weight.`}{' '}
          Using {p.old ? '1.4D + 1.7L (old ACI)' : 'ACI/BNBC load factors'}, find the factored load and the design moment.
        </Prompt>
      ) : (
        <div className="grid grid-cols-2 cq-md:grid-cols-5 gap-2">
          <Num label="Span" unit="ft" value={p.span} onChange={(span) => set({ span })} />
          <Sel label="Support" value={p.support} options={(['ss', 'cant', 'fixed'] as Support[]).map((v) => ({ v, label: SUPPORT_LABEL[v] }))} onChange={(support) => set({ support })} />
          <Num label="b" unit="in" value={p.b} onChange={(b) => set({ b })} />
          <Num label="h" unit="in" value={p.h} onChange={(h) => set({ h })} />
          <Sel label="Factors" value={p.old ? 1 : 0} options={[{ v: 0, label: '1.2D + 1.6L' }, { v: 1, label: '1.4D + 1.7L (old)' }]} onChange={(v) => set({ old: !!v })} />
          {p.src === 'line' ? (
            <>
              <Num label="SDL (excl. self-wt)" unit="k/ft" step={0.1} value={p.sdl} onChange={(sdl) => set({ sdl })} />
              <Num label="LL" unit="k/ft" step={0.1} value={p.ll} onChange={(ll) => set({ ll })} />
            </>
          ) : (
            <>
              <Num label="Slab t" unit="in" step={0.5} value={p.slab} onChange={(slab) => set({ slab })} />
              <Num label="Floor finish" unit="psf" value={p.ff} onChange={(ff) => set({ ff })} />
              <Num label="Partitions" unit="psf" value={p.pw} onChange={(pw) => set({ pw })} />
              <Num label="LL" unit="psf" value={p.llpsf} onChange={(llpsf) => set({ llpsf })} />
              <Num label="Tributary width" unit="ft" value={p.trib} onChange={(trib) => set({ trib })} />
            </>
          )}
        </div>
      )}
      <Checks key={key}>
        {p.src === 'floor' && <Answer id={id('d')} label="Dead load from floor" value={fl.D} unit="k/ft" compact />}
        <Answer id={id('sw')} label="Beam self-weight" value={loads.sw} unit="k/ft" compact />
        <Answer id={id('wu')} label="w_u" value={loads.wu} unit="k/ft" compact />
        <Choice id={id('gov')} label="Governing combination" options={[{ v: 'a', label: p.old ? '1.4D + 1.7L' : '1.2D + 1.6L' }, { v: 'b', label: '1.4D' }]} answer={!p.old && 1.4 * loads.wD > 1.2 * loads.wD + 1.6 * loads.wL ? 'b' : 'a'} />
        <Answer id={id('mu')} label={p.support === 'fixed' ? 'M_u at support' : 'M_u'} value={p.support === 'fixed' ? loads.MuNeg : loads.Mu} unit="k-ft" compact />
        <Answer id={id('vu')} label="V_u at support (centre)" value={loads.Vu} unit="k" compact />
      </Checks>
      <Reveal title="Solution">
        {p.src === 'floor' && (
          <Md>{`Floor → beam: slab $= \\tfrac{${p.slab}}{12}(150) = ${fmt(fl.slabPsf, 1)}$ psf; $D = (${fmt(fl.slabPsf, 1)} + ${p.ff} + ${p.pw})(${p.trib})/1000 = ${fmt(fl.D, 3)}$ k/ft; $L = ${p.llpsf}(${p.trib})/1000 = ${fmt(fl.L, 3)}$ k/ft.`}</Md>
        )}
        <SolSteps steps={loads.steps} />
        <div className="text-sm text-mute">
          V_u = {fmt(loads.Vu, 2)} k at the support centre line (shear design then takes V_u at d from the face).
        </div>
      </Reveal>
    </div>
  )
}

function PhiLab() {
  const [e, setE] = useState(0.0042)
  const phi = phiFlex(e)
  useMark('m-phi', { epsT: e, row: e >= 0.005 ? 0 : e > 0.00207 ? 3 : 1 })
  return (
    <div className="grid cq-lg:grid-cols-[1.2fr_1fr] gap-4 items-start">
      <PhiChart epsT={e} label="ε_t" />
      <div className="space-y-2 text-sm">
        <Slider label="ε_t" value={e} min={0.001} max={0.008} step={0.0001} onChange={setE} />
        <div className="num">
          φ = <b>{fmt(phi, 3)}</b> · {ZONE_LABEL[zoneOf(e)]}
        </div>
        <table className="tbl w-auto text-xs">
          <tbody>
            <tr>
              <td className="txt">Flexure, tension-controlled</td>
              <td>0.90</td>
            </tr>
            <tr>
              <td className="txt">Shear, torsion</td>
              <td>0.75</td>
            </tr>
            <tr>
              <td className="txt">Compression-controlled tied / spiral</td>
              <td>0.65 / 0.75</td>
            </tr>
            <tr>
              <td className="txt">Bearing</td>
              <td>0.65</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- pages
function Overview() {
  return (
    <div>
      <Section title="What this topic is" right={<div className="w-72 hidden cq-md:block"><RcFrequency topic={T} /></div>}>
        <Md>{`The ideas behind every design: why concrete needs steel, how the **strength design method (USD)** builds in safety (load factors × service loads ≤ φ × nominal strength), how it differs from **working stress design (WSD)**, and the practical rules — cover, bar spacing, floor systems, serviceability.

**How it is asked:** almost only as theory, 5–9 marks a part, and it repeats word for word:
- Sources of uncertainty and how USD ensures safety — 2023-24, 2021-22, 2020-21, 2017-18, 2015-16, 2012-13, 2010-11.
- Why load factors differ for DL and LL; why φ differs — 6 papers.
- Concrete cover (why, values) — 8 papers; floor systems in Bangladesh — 4 papers; serviceability — 4 papers.
- Stress–strain curves of concrete / steel with design parameters; crack types.

The only numbers: self-weight and $w_u = 1.2D + 1.6L$ → $M_u$, the first step of every beam and slab design (Lab).`}</Md>
      </Section>
      <Section title="Key numbers">
        <div className="grid cq-md:grid-cols-3 gap-3 text-sm">
          <Md>{`**Safety (USD)**
$$\\phi R_n \\ge \\sum \\gamma_i Q_i$$
$1.2D + 1.6L$ (≥ 1.4D); old: $1.4D + 1.7L$.
φ: 0.90 flexure (tension-controlled), 0.75 shear/torsion, 0.65 tied columns.`}</Md>
          <Md>{`**WSD**
Service loads, elastic analysis, allowable stresses $0.45f'_c$ and 20/24 ksi (≈ ½f′c, ½f_y). One overall factor of safety on stresses.`}</Md>
          <Md>{`**Detailing**
Clear cover: beams/columns 1.5 in, slabs ¾ in, exposed 1.5–2 in, cast against earth 3 in. Bar clear spacing ≥ max(1 in, d_b). Concrete 150 pcf.`}</Md>
        </div>
      </Section>
    </div>
  )
}

function Approach() {
  const ex = beamLoads({ span: 25, support: 'ss', b: 12, h: 25, sdl: 1, ll: 2 })
  return (
    <div>
      <Section title="Recipe — loads to a design moment">
        <Steps>
          <Step n={1} title="Self-weight">w_sw = (b × h / 144) × 0.150 k/ft (h ≈ L/16 to L/12 if not given; slab: t/12 × 150 psf).</Step>
          <Step n={2} title="Dead and live per foot">D = SDL + self-weight (floor: psf × tributary width), L = LL × tributary width.</Step>
          <Step n={3} title="Factor">w_u = max(1.2D + 1.6L, 1.4D). Old paper or "1.4/1.7" printed → 1.4D + 1.7L, φ = 0.9 / 0.85.</Step>
          <Step n={4} title="Moment and shear">SS: w_uL²/8, w_uL/2. Cantilever: w_uL²/2, w_uL. Fixed: −w_uL²/12, +w_uL²/24. Point loads by statics.</Step>
          <Step n={5} title="Design">M_u ≤ φM_n (flexure), V_u ≤ φV_n (shear).</Step>
        </Steps>
      </Section>
      <Section title="Which method / combination?">
        <div className="grid cq-md:grid-cols-3 gap-3 text-sm">
          <div className="rounded-xl border border-line p-3">
            <b className="text-accent">"USD" or nothing said</b>
            <Md>{`1.2D + 1.6L, φ from εt. This is every paper since 2013.`}</Md>
          </div>
          <div className="rounded-xl border border-line p-3">
            <b className="text-load">"All loads are factored"</b>
            <Md>{`Use the printed loads directly: $w_u = DL + LL$. Do not factor again (2021-22 Q4(a), 2020-21 Q6(a)).`}</Md>
          </div>
          <div className="rounded-xl border border-line p-3">
            <b className="text-bad">"WSD" / service stresses</b>
            <Md>{`No load factors. Elastic cracked section with allowables (Elastic & WSD topic).`}</Md>
          </div>
        </div>
      </Section>
      <Section title="Common traps">
        <Callout kind="trap">Leaving out the self-weight when the question says "in addition to self-weight".</Callout>
        <Callout kind="trap">psf × width gives lb/ft: divide by 1000 for k/ft.</Callout>
        <Callout kind="trap">1.4D can govern when L is small (L {'<'} 0.125D).</Callout>
        <Callout kind="trap">Theory answers without numbers lose marks: quote the actual factors (1.2, 1.6, 0.9, 0.75, 0.65) and cover values.</Callout>
      </Section>
      <Section title="Example — 2023-24 Q3(a) loads" sub="SS 25 ft, 12 × 25 in, SDL 1.0 k/ft + self-weight, LL 2.0 k/ft">
        <SolSteps steps={ex.steps} />
      </Section>
    </div>
  )
}

function Lab() {
  return (
    <div>
      <PickSection topic="rc-basics" skills={BASICS_PICKS} />
      <Section title="Loads → w_u → M_u" sub="The first step of every beam design. Line loads or floor loads over a tributary width.">
        <LoadsLab />
      </Section>
      <Section title="φ vs net tensile strain" sub="Slide ε_t and watch the section move between compression-controlled, transition and tension-controlled.">
        <PhiLab />
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------- figures
function ConcreteCurves() {
  const W = 420,
    H = 220,
    L = 40,
    B = 30
  const X = (e: number) => L + (e / 0.0035) * (W - L - 10)
  const Y = (f: number) => H - B - (f / 8.5) * (H - B - 10)
  const fcs = [3000, 4000, 6000, 8000]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto max-w-md">
      <line x1={L} x2={W - 10} y1={Y(0)} y2={Y(0)} stroke="var(--c-mute)" />
      <line x1={L} x2={L} y1={Y(0)} y2={10} stroke="var(--c-mute)" />
      {[0.001, 0.002, 0.003].map((e) => (
        <text key={e} x={X(e)} y={H - B + 13} fontSize={9.5} textAnchor="middle" className="num" fill="var(--c-mute)">
          {e}
        </text>
      ))}
      {[2, 4, 6, 8].map((f) => (
        <text key={f} x={L - 4} y={Y(f) + 3} fontSize={9.5} textAnchor="end" className="num" fill="var(--c-mute)">
          {f}
        </text>
      ))}
      <text x={(L + W) / 2} y={H - 3} fontSize={10} textAnchor="middle" fill="var(--c-mute)">
        strain ε_c
      </text>
      <text x={8} y={20} fontSize={10} fill="var(--c-mute)">
        f_c (ksi)
      </text>
      <line x1={X(0.003)} x2={X(0.003)} y1={Y(0)} y2={10} stroke="var(--c-bad)" strokeDasharray="4 3" />
      <text x={X(0.003) + 3} y={18} fontSize={9.5} fill="var(--c-bad)">
        ε_u = 0.003
      </text>
      {fcs.map((fc, i) => {
        const pts = Array.from({ length: 70 }, (_, k) => (0.0034 * k) / 69)
        const d = pts.map((e, k) => `${k ? 'L' : 'M'}${X(e)},${Y(concreteStress(e, fc))}`).join(' ')
        const e0 = (2 * fc) / Ec(fc)
        return (
          <g key={fc}>
            <path d={d} fill="none" stroke={['var(--c-good)', 'var(--c-accent)', 'var(--c-load)', 'var(--c-bad)'][i]} strokeWidth={2} />
            <circle cx={X(e0)} cy={Y(fc / 1000)} r={2.5} fill="var(--c-ink)" data-tip={`f′c = ${fc / 1000} ksi reached at ε0 = ${e0.toFixed(5)}`} />
            <GhostPts pts={pts.map((e) => ({ x: X(e), y: Y(concreteStress(e, fc)), tip: `f′c ${fc / 1000} ksi: ε = ${e.toFixed(5)}, fc = ${fmt(concreteStress(e, fc), 3)} ksi` }))} />
            <text x={X(e0) + 4} y={Y(fc / 1000) - 4} fontSize={9.5} fill="var(--c-ink)">
              f′c = {fc / 1000} ksi
            </text>
          </g>
        )
      })}
      <text x={X(0.0001)} y={Y(7.6)} fontSize={9} fill="var(--c-mute)">
        dots: peak at ε₀ ≈ 2f′c/E_c (≈ 0.002)
      </text>
    </svg>
  )
}

function SteelCurves() {
  const W = 420,
    H = 200,
    L = 40,
    B = 30
  const X = (e: number) => L + (e < 0.02 ? (e / 0.02) * 150 : 150 + ((e - 0.02) / 0.13) * (W - L - 170))
  const Y = (f: number) => H - B - (f / 110) * (H - B - 10)
  const curve = (fy: number, fu: number, esh: number) =>
    `M${X(0)},${Y(0)} L${X(fy / 29000)},${Y(fy)} L${X(esh)},${Y(fy)} Q${X(0.06)},${Y(fu * 1.02)} ${X(0.09)},${Y(fu)} L${X(0.14)},${Y(fu * 0.9)}`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto max-w-md">
      <line x1={L} x2={W - 10} y1={Y(0)} y2={Y(0)} stroke="var(--c-mute)" />
      <line x1={L} x2={L} y1={Y(0)} y2={10} stroke="var(--c-mute)" />
      <path d={curve(60, 90, 0.008)} fill="none" stroke="var(--c-accent)" strokeWidth={2} />
      <path d={curve(40, 70, 0.015)} fill="none" stroke="var(--c-good)" strokeWidth={2} />
      <path d={`M${X(0)},${Y(0)} L${X(60 / 29000)},${Y(60)} L${X(0.14)},${Y(60)}`} fill="none" stroke="var(--c-ink)" strokeDasharray="5 3" />
      <text x={X(0.1)} y={Y(92)} fontSize={9.5} fill="var(--c-accent)">
        Grade 60: f_y 60, f_u 90 ksi
      </text>
      <text x={X(0.1)} y={Y(66)} fontSize={9.5} fill="var(--c-good)">
        Grade 40
      </text>
      <text x={X(0.03)} y={Y(52)} fontSize={9.5} fill="var(--c-ink)">
        design: elastic–perfectly plastic, E_s = 29,000 ksi
      </text>
      <text x={X(0.0021)} y={Y(0) + 13} fontSize={9.5} textAnchor="middle" fill="var(--c-mute)">
        ε_y
      </text>
      <text x={(L + W) / 2} y={H - 3} fontSize={10} textAnchor="middle" fill="var(--c-mute)">
        strain (scale broken at 0.02)
      </text>
    </svg>
  )
}

const MatFig = () => (
  <div className="space-y-2">
    <ConcreteCurves />
    <SteelCurves />
  </div>
)

// ---------------------------------------------------------------- theory
const theory: RcTheoryItem[] = [
  {
    id: 'tb-uncert',
    topic: T,
    q: 'What are the sources of uncertainty in the analysis, design and construction of RC structures? How does the Strength Design (USD) method take care of them and ensure safety?',
    seen: ['2023-24', '2021-22', '2020-21', '2017-18', '2015-16', '2012-13', '2010-11'],
    a: `**Sources of uncertainty**
1. **Loads:** actual loads differ from the code values (live load varies with use and time; dead load from dimensions and densities; wind/earthquake are random); changes of occupancy; load distribution assumed in analysis.
2. **Analysis:** idealised supports, linear-elastic assumptions, simplified moment coefficients — the real internal forces differ.
3. **Material strengths:** f′c varies batch to batch and with curing and compaction; in-place strength differs from cylinder strength; fy varies.
4. **Dimensions / workmanship:** member sizes, bar placement (d, cover) and bar spacing deviate from the drawings.
5. **Design equations:** simplified strength formulas (stress block etc.) are approximate.
6. Consequences of failure differ (ductile vs brittle, importance of the member).

**How USD ensures safety** — design strength ≥ required strength:
$$\\phi R_n \\ \\ge\\ U = \\sum\\gamma_iQ_i$$
- **Load factors (overload):** service loads are multiplied by factors > 1 that reflect their variability: 1.2D + 1.6L (1.4D). Live load gets the larger factor because it is less predictable.
- **Strength reduction factor φ < 1 (understrength):** nominal strength is reduced for material/dimension variations, equation inaccuracy, and the ductility and importance of the member: 0.90 flexure (tension-controlled), 0.75 shear/torsion, 0.65 compression-controlled tied, 0.75 spiral.
- Together the probability of failure is made acceptably small; plus code minimums (ρmin, ρmax/εt ≥ 0.004 for ductile failure, cover, detailing) and serviceability checks at service load.`,
  },
  {
    id: 'tb-usdwsd',
    topic: T,
    q: 'Explain the differences between the USD and WSD methods of design, with emphasis on how safety is ensured in each.',
    seen: ['2021-22'],
    a: `- **Loads:** WSD uses **service (actual) loads**; USD uses **factored loads** 1.2D + 1.6L.
- **Stresses / behaviour:** WSD assumes linear-elastic behaviour (cracked transformed section) and keeps stresses below **allowable stresses** ($f_c = 0.45f'_c$, $f_s$ = 20–24 ksi ≈ ½f_y). USD considers the **ultimate (inelastic) stage**: concrete at εu = 0.003 with the 0.85f′c block, steel at f_y.
- **Safety in WSD:** a single factor of safety applied to the **material strengths** (allowable = strength / FS). All loads treated alike, so a load that is uncertain (LL) gets the same margin as a well-known one (DL). The real margin against collapse is unknown.
- **Safety in USD:** two separate partial factors — **load factors** on each load according to its uncertainty, and **φ** on the strength according to the type of member and failure mode. The margin against collapse is known and more uniform.
- **Other points:** USD uses the actual strength reserve (economy, especially with high DL); it needs separate serviceability checks (deflection, cracking) at service loads, which WSD covers inherently. WSD is still used for service-stress checks, water tanks, and in old papers.`,
  },
  {
    id: 'tb-lf',
    topic: T,
    q: 'Why are the load factors for dead load and live load different in the USD method?',
    seen: ['2014-15', '2011-12', '2008-09', '2006-07', '2004-05'],
    a: `- A load factor reflects how **uncertain** a load is (how likely it is to be exceeded) and how accurately it can be estimated.
- **Dead load** (self-weight, finishes, partitions) comes from dimensions and unit weights: it is known fairly accurately and does not change much in the life of the structure → small factor, **1.2** (1.4 when D acts alone).
- **Live load** (occupants, furniture, stored goods) is variable in magnitude, position and time, can be changed by a change of use, and occasional overloads are likely; code values are only statistical estimates → larger factor, **1.6** (older ACI 1.7).
- So the overall safety margin follows the uncertainty of each load: a structure carrying mostly dead load is not penalised, one carrying mostly live load gets more margin. (Wind/earthquake have their own factors, 1.0 with strength-level values.)`,
  },
  {
    id: 'tb-phi',
    topic: T,
    q: 'Why is the strength reduction factor φ used in strength design, and why is it different for different cases? Give the ACI values.',
    seen: ['2014-15', '2006-07', '2004-05', '2002-03'],
    a: `**Why φ:** the actual strength may be less than the computed nominal strength $R_n$ because of (1) variations in material strengths (f′c, fy), (2) variations in dimensions and bar placement, (3) approximations in the design equations; it also reflects (4) the **ductility** of the failure mode and (5) the **importance** of the member to the structure.

**Why it differs:** members that fail in a ductile, predictable way with warning, and whose strength depends mainly on the well-controlled steel, get a high φ; brittle failures governed by concrete, or members whose failure is critical (columns), get a lower φ.

**ACI 318 / BNBC 2020 values:**
- Flexure, tension-controlled (εt ≥ 0.005): **0.90**
- Shear and torsion: **0.75**
- Compression-controlled, tied: **0.65**; spiral: **0.75** (spiral confinement gives ductility)
- Transition: interpolated, $0.483 + 83.3\\varepsilon_t$ (tied, Grade 60)
- Bearing on concrete: **0.65**; plain concrete: 0.60
(Old ACI ≤ 1999: flexure 0.9, shear 0.85, tied 0.70.)`,
  },
  {
    id: 'tb-cover',
    topic: T,
    q: 'Why must a minimum concrete cover be maintained over reinforcement (concrete protection)? Give the ACI/BNBC cover requirements for beams and slabs.',
    seen: ['2020-21', '2016-17', '2015-16', '2014-15', '2012-13', '2011-12', '2006-07', '2005-06'],
    a: `**Reasons for minimum cover**
1. **Corrosion protection:** the alkaline concrete keeps steel passive; enough dense cover delays carbonation and chloride penetration reaching the bars.
2. **Fire protection:** concrete insulates the steel so it does not lose strength (steel loses ~50 % at ~600 °C) during the required fire rating.
3. **Bond:** the bar needs concrete around it to develop its stress; thin cover causes splitting cracks along the bar.
4. Protection against weathering, abrasion and moisture; tolerance for placing bars.

**Specified clear cover (ACI 318 Table 20.6.1.3.1, BNBC):**
- Cast against and permanently exposed to earth: **3 in**
- Exposed to earth or weather: #6–#18 **2 in**; #5 and smaller **1½ in**
- Not exposed — slabs, walls, joists: #11 and smaller **¾ in** (#14, #18: 1½ in)
- Not exposed — beams and columns (to stirrups/ties): **1½ in**
Sketch: beam with 1.5 in to the stirrup, slab with ¾ in to the bottom bars. With #3 stirrups and #8 bars, d ≈ h − 2.5 in.`,
  },
  {
    id: 'tb-spacing',
    topic: T,
    q: 'Give reasons for the minimum bar spacing requirements in the ACI code.',
    seen: ['2006-07'],
    a: `**Rule (ACI 25.2):** clear distance between parallel bars in a layer ≥ the largest of **1 in, d_b, and 4/3 × max aggregate size**; bars in two or more layers: upper bars directly above the lower ones with ≥ **1 in** clear between layers; columns: ≥ 1.5 in, 1.5d_b.

**Reasons:**
1. Concrete (with the largest aggregate) must flow between the bars and around them without honeycombing — good compaction.
2. Each bar needs a ring of concrete around it to develop **bond**; bars too close cause splitting along the plane of the bars.
3. Room for vibrators and placing.
4. Avoids congestion that makes the section weak in shear transfer and difficult to inspect.`,
  },
  {
    id: 'tb-floor',
    topic: T,
    q: 'Describe, with neat sketches, five RC floor systems commonly used in Bangladesh.',
    seen: ['2021-22', '2017-18', '2013-14', '2012-13'],
    a: `1. **One-way slab on beams** (long/short ≥ 2): slab spans in the short direction onto parallel beams that frame into girders/columns. Sketch: long rectangular panels, main bars across. Common in corridors, verandas, stair landings.
2. **Two-way slab on beams** (beam-supported, ratio < 2): slab panels supported on beams on all four sides, bending in both directions. The most common floor in Bangladeshi residential/office buildings (spans 12–25 ft, h 5–6 in).
3. **Flat plate:** slab of uniform thickness supported directly on columns, no beams or drops. Clean ceiling, low storey height, easy formwork; light loads, spans ≤ 25 ft; punching shear at columns is critical. Used in apartments.
4. **Flat slab:** flat plate thickened at the columns by **drop panels** and/or **column capitals** to resist punching shear and negative moment; heavier loads (parking, warehouses, markets).
5. **Ribbed (joist) slab / waffle slab:** thin top slab (2–4 in) on closely spaced ribs (one-way joists) or ribs both ways (waffle, two-way); light, long spans with less concrete; used in auditoriums, shopping malls.
(Also: band-beam slab; slab on grade.) Sketch each in plan and section.`,
  },
  {
    id: 'tb-service',
    topic: T,
    q: 'What is meant by "serviceability" in RC design? Why is a minimum slab thickness essential?',
    seen: ['2021-22', '2016-17', '2015-16', '2013-14', '2008-09'],
    a: `**Serviceability** = satisfactory performance of the structure under **service (unfactored) loads** during its life, as opposed to safety against collapse (strength limit state). The serviceability limit states are:
- **Deflection:** excessive deflection cracks partitions and finishes, causes ponding, misaligns doors/windows and alarms occupants (ACI limits L/180 – L/480).
- **Cracking:** crack widths must stay small (hairline) for appearance and to protect steel from corrosion — controlled by bar distribution, cover, and limiting f_s.
- **Vibration:** floors must be stiff enough not to vibrate noticeably.
- Also durability, fatigue, fire resistance.
In USD, members are designed for strength, then checked at service load (elastic, cracked section).

**Minimum slab thickness:** deflection grows with $(L/h)^3$; ACI Tables 7.3.1.1 / 9.3.1.1 give minimum h (one-way slab: L/20 SS, L/24 one end continuous, L/28 both continuous, L/10 cantilever; beams L/16, L/18.5, L/21, L/8) so that deflections need not be computed. It also gives enough depth for cover, fire resistance and punching shear.`,
  },
  {
    id: 'tb-cracks',
    topic: T,
    q: 'Show with neat sketches these cracks in beams and slabs: shear (diagonal tension) cracks, shrinkage cracks, flexural cracks, and bond cracks.',
    seen: ['2014-15', '2011-12'],
    a: `- **Flexural cracks:** vertical cracks starting at the tension face in the region of maximum moment (midspan bottom of a simply supported beam, top over supports), getting narrower toward the neutral axis. Cause: tension > modulus of rupture.
- **Shear / diagonal tension cracks:** inclined ≈ 45° near the supports where shear is high. Web-shear cracks start at mid-depth in thin webs; flexure-shear cracks start as flexural cracks and turn inclined toward the load. Controlled by stirrups.
- **Shrinkage cracks:** fine, randomly oriented (map) cracks in slabs, or regularly spaced cracks across a restrained member; also at re-entrant corners. Cause: restrained drying shrinkage/temperature. Controlled by T&S steel.
- **Bond (splitting) cracks:** longitudinal cracks along the bars on the bottom/side faces, near the supports or at splices, where the bar stress changes fast and cover/spacing is small.
Sketch a simply supported beam elevation showing vertical cracks at midspan, inclined cracks near supports, splitting cracks along the bars at the ends, and a slab plan with map cracking.`,
  },
  {
    id: 'tb-curves',
    topic: T,
    q: 'Draw the stress–strain curves of concrete in compression (for different strengths) and of reinforcing steel in tension, and mark the design parameters.',
    seen: ['2014-15', '2013-14', '2004-05'],
    a: `**Concrete (compression):** rises almost linearly to about $0.5f'_c$ (elastic range, initial modulus $E_c = 57000\\sqrt{f'_c}$ psi), then curves to the peak $f'_c$ at $\\varepsilon_0 \\approx 0.002$, then a descending branch to crushing at $\\varepsilon_u \\approx 0.003$–0.004. Higher-strength concrete: steeper and more linear rise, peak at slightly larger strain, steeper and shorter descending branch (more brittle). **Design parameters:** $f'_c$ (28-day cylinder strength), $E_c$ (secant at 0.45f′c), $\\varepsilon_u = 0.003$, the equivalent block $0.85f'_c$ over $\\beta_1c$; tension: $f_r = 7.5\\sqrt{f'_c}$.

**Steel (tension):** linear elastic with $E_s$ = 29,000 ksi up to the yield point $f_y$ ($\\varepsilon_y = f_y/E_s$ = 0.00207 for Grade 60), a yield plateau, strain hardening up to the ultimate strength $f_u$ (≈ 90 ksi for Grade 60), then necking and fracture at large strain (≈ 0.1+). **Design parameters:** $f_y$ and $E_s$; design curve is elastic–perfectly plastic ($f_s = E_s\\varepsilon_s \\le f_y$).

**Why f_y and not f_u in USD:** beyond yield the strains (and hence cracks and deflections) are enormous, strain hardening is unreliable and not present in all steels; yielding is the useful limit and gives the ductile warning. Using $f_u$ would mean designing for a state of uselessly large deformation.`,
    Fig: MatFig,
  },
  {
    id: 'tb-fy',
    topic: T,
    q: 'Why does USD use the yield strength, and not the ultimate strength, of reinforcing steel?',
    seen: ['2007-08'],
    a: `- After yielding the steel strain grows very fast with no increase in stress (yield plateau); the strains needed to reach $f_u$ (5–10 %) would mean huge cracks and deflections — the member is unusable long before $f_u$.
- Strain hardening begins at very different strains for different bars and is not guaranteed; $f_y$ is the reliable specified property (ASTM minimum).
- The flexural theory assumes $f_s = f_y$ at the yielded steel while the concrete reaches 0.003; at that strain (≈ 0.004–0.01) the steel is still on the plateau.
- Using $f_y$ keeps the ductile, under-reinforced failure mode and an extra hidden reserve.`,
  },
  {
    id: 'tb-biaxial',
    topic: T,
    q: 'Show a typical biaxial failure surface (envelope) for normal-density concrete and identify its regions. Use it to explain why cylinders and cubes give different strengths and failure modes.',
    seen: ['2013-14'],
    a: `**Envelope** (Kupfer et al.), axes $\\sigma_1/f'_c$ and $\\sigma_2/f'_c$:
- **Compression–compression** (3rd quadrant): strength increases with lateral compression, up to about **1.25f′c** at $\\sigma_2/\\sigma_1 \\approx 0.5$ and ≈ 1.16f′c for equal biaxial compression.
- **Compression–tension** (2nd/4th quadrants): a small lateral tension sharply reduces the compressive strength (almost linear drop).
- **Tension–tension** (1st quadrant): strength ≈ uniaxial tensile strength (≈ 0.1f′c), nearly independent of the other stress.

**Cylinder vs cube:** both are loaded through steel platens whose friction restrains the concrete's lateral expansion near the ends, inducing lateral compression. In a **cube** (h/b = 1) this confined zone covers the whole specimen, so it fails in the compression–compression region at a higher stress (≈ 1.2–1.25 × cylinder) with a double-pyramid (hour-glass) failure. In a **cylinder** (h/d = 2) the middle part is free of restraint and nearly uniaxial, so it fails close to $f'_c$ on the uniaxial point, with a shear-cone or splitting failure. On the envelope: cylinder point at $(\\sigma_1, \\sigma_2) \\approx (-f'_c, 0)$; cube point further out in the compression–compression quadrant.`,
  },
  {
    id: 'tb-failure',
    topic: T,
    q: 'Describe briefly the factors affecting (causes of) failure in concrete structures.',
    seen: ['2012-13'],
    a: `1. **Design errors:** wrong loads or load paths, analysis mistakes, inadequate detailing (anchorage, laps, stirrups, joints), ignoring lateral loads.
2. **Construction faults:** poor materials (low f′c, impure water, wrong mix), poor compaction (honeycombing) and curing, insufficient cover, misplaced bars, early removal of formwork, using shuttering beyond capacity.
3. **Overloading / change of use:** loads beyond design (extra storeys, storage), impact, unexpected live loads.
4. **Environmental deterioration:** corrosion of reinforcement (carbonation, chlorides — salty areas of Bangladesh), sulphate attack, freeze–thaw, fire.
5. **Foundation problems:** differential settlement, soil liquefaction, scour.
6. **Natural hazards:** earthquake, wind/cyclone, flood.
7. Lack of maintenance and inspection.
Good practice: proper design to code, quality control, adequate cover and detailing, inspection and maintenance.`,
  },
  {
    id: 'tb-sketch',
    topic: T,
    q: 'Neatly sketch, with details, a reinforced concrete beam section (e.g. 18 in × 40 in with bars in layers and 4-legged #3 stirrups; or a T-section with tension and compression bars).',
    seen: ['2004-05'],
    a: `Checklist for a full-mark section sketch:
- Draw to a rough scale; dimension b, h (and b_f, h_f for a T) in inches.
- Stirrup with **1.5 in clear cover** all round, 135° hooks; for 4 legs show two overlapping closed stirrups or a closed stirrup plus cross-ties.
- Bars inside the stirrup corners first; a bar at every stirrup corner; label each group ("7 #8", "3 #6").
- **Clear spacing** ≥ max(1 in, d_b) in a layer — if the bars do not fit, put them in two (or three) layers with **1 in clear** between layers, upper bars directly above lower ones (spacer bars).
- Show d to the steel centroid and d_t to the lowest layer; compression bars at d′ ≈ 2.5 in.
- For a T-section, slab bars in the flange and the effective flange width noted.`,
  },
]

// ---------------------------------------------------------------- problems
const problems: RcQ[] = [
  {
    id: 'rc-own-bs-1',
    paper: 'own',
    level: 'warm-up',
    sec: 'A',
    no: '1',
    marks: 0,
    topics: [T],
    title: 'Interior beam from floor loads',
    text: 'A 22 ft simply supported interior beam (12 in × 22 in) supports a 5 in slab with a tributary width of 12 ft. Floor finish 25 psf, partitions 50 psf, live load 60 psf. Find D, L (k/ft, including the beam self-weight), w_u and M_u.',
    pages: [],
    given: [{ label: 'Load combinations', ref: 'm-loads' }],
    checks: () => {
      const f = floorToBeam({ slab: 5, ff: 25, pw: 50, llpsf: 60, trib: 12 })
      const L = beamLoads({ span: 22, support: 'ss', b: 12, h: 22, sdl: f.D, ll: f.L })
      return [
        { key: 'D', label: 'D total', value: L.wD, unit: 'k/ft' },
        { key: 'wu', label: 'w_u', value: L.wu, unit: 'k/ft' },
        { key: 'mu', label: 'M_u', value: L.Mu, unit: 'k-ft' },
      ]
    },
    solution: () => {
      const f = floorToBeam({ slab: 5, ff: 25, pw: 50, llpsf: 60, trib: 12 })
      const L = beamLoads({ span: 22, support: 'ss', b: 12, h: 22, sdl: f.D, ll: f.L })
      return (
        <div>
          <Md>{`Slab = 5/12 × 150 = ${fmt(f.slabPsf, 1)} psf; floor dead load = (${fmt(f.slabPsf, 1)} + 25 + 50) × 12 / 1000 = ${fmt(f.D, 3)} k/ft; L = 60 × 12 / 1000 = ${fmt(f.L, 3)} k/ft.`}</Md>
          <SolSteps steps={L.steps} />
        </div>
      )
    },
  },
  {
    id: 'rc-own-bs-2',
    paper: 'own',
    level: 'exam',
    sec: 'A',
    no: '2',
    marks: 0,
    topics: [T],
    title: 'Old vs new load factors on a cantilever',
    text: 'An 8 ft cantilever, 12 in × 20 in, carries SDL 0.8 k/ft and LL 0.6 k/ft plus self-weight. Find M_u at the support with 1.2D + 1.6L and with the old 1.4D + 1.7L. How much larger is the old value?',
    pages: [],
    flag: 'compares old ACI factors',
    checks: () => {
      const a = beamLoads({ span: 8, support: 'cant', b: 12, h: 20, sdl: 0.8, ll: 0.6 })
      const b = beamLoads({ span: 8, support: 'cant', b: 12, h: 20, sdl: 0.8, ll: 0.6, fD: 1.4, fL: 1.7 })
      return [
        { key: 'm1', label: 'M_u (1.2D + 1.6L)', value: a.Mu, unit: 'k-ft' },
        { key: 'm2', label: 'M_u (1.4D + 1.7L)', value: b.Mu, unit: 'k-ft' },
      ]
    },
    solution: () => {
      const a = beamLoads({ span: 8, support: 'cant', b: 12, h: 20, sdl: 0.8, ll: 0.6 })
      const b = beamLoads({ span: 8, support: 'cant', b: 12, h: 20, sdl: 0.8, ll: 0.6, fD: 1.4, fL: 1.7 })
      return (
        <div>
          <SolSteps steps={a.steps} />
          <SolSteps steps={b.steps.slice(1)} start={a.steps.length + 1} />
          <p className="text-sm">
            Old/new = {fmt(b.Mu / a.Mu, 3)}: the old factors were paired with smaller φ for shear (0.85) and larger for columns (0.70), so neither set is "safer" on its own.
          </p>
        </div>
      )
    },
  },
]

const mod: RcTopicModule = { Overview, Approach, Lab, problems, theory }
export default mod

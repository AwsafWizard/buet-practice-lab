import { useEffect, useState } from 'react'
import { fmt } from '../../../components/DiagramView'
import { Answer, Callout, Choice, Md, Reveal, Section, Seg, Step, Steps, Tex } from '../../../components/ui'
import { hashKey } from '../../../labs/CheckTable'
import { pick, randInt, rng } from '../../../labs/common'
import { NumIn } from '../../../reference/common'
import { RcFrequency } from '../../components/Frequency'
import { spandrelTorque, threshold, torsionCheck, torsionSection, TOR_SHAPES, type SpandrelIn, type TorSectionIn, type TorsionKind, type TorShape } from '../../engine/torsion'
import { markUsed } from '../../reference/pane'
import type { RcQ, RcTopicModule } from '../../types'
import { TORSION_THEORY } from './theory'
import { PickSection } from '../../components/PickDrill'
import { TORSION_PICKS } from './picks'

const f2 = (v: number) => fmt(v, 2)

// ---------------------------------------------------------------- section sketch
export function TorSectionFig({ s }: { s: TorSectionIn }) {
  const sec = torsionSection(s)
  const W = 360,
    H = 200
  const hf = s.hf ?? 0
  const sides = sec.sides
  const avail = Math.min(s.overhang ?? 4 * hf + 12, 4 * Math.max(hf, 1) * 3)
  const totW = s.bw + (s.shape === 'box' || s.shape === 'rect' ? 0 : sides * Math.max(avail, sec.ohEff))
  const sc = Math.min((W - 40) / Math.max(totW, 1), (H - 40) / Math.max(s.h, 1))
  const cx = W / 2
  const top = 20
  const flangeTop = s.shape === 'invL' || s.shape === 'invT' ? top + (s.h - hf) * sc : top
  const webX = s.shape === 'L' || s.shape === 'invL' ? cx - ((s.bw + avail) * sc) / 2 : cx - (s.bw * sc) / 2
  const rect = (x: number, y: number, w: number, h: number, p: object) => <rect x={x} y={y} width={w} height={h} {...p} />
  const fl = (dir: 1 | -1, key: string) => {
    const x0 = dir === 1 ? webX + s.bw * sc : webX
    const xa = dir === 1 ? x0 : x0 - avail * sc
    const xe = dir === 1 ? x0 : x0 - sec.ohEff * sc
    return (
      <g key={key}>
        {rect(xa, flangeTop, avail * sc, hf * sc, { fill: 'var(--c-panel2)', stroke: 'var(--c-line)', strokeDasharray: '3 3' })}
        {rect(xe, flangeTop, sec.ohEff * sc, hf * sc, { fill: sec.useFlange ? 'var(--c-accent)' : 'var(--c-panel2)', fillOpacity: sec.useFlange ? 0.35 : 1, stroke: 'var(--c-ink)' })}
        <text x={xe + (dir * sec.ohEff * sc) / 2} y={flangeTop - 4} fontSize={10} textAnchor="middle" fill="var(--c-mute)" className="num">
          {f2(sec.ohEff)}″ counted
        </text>
      </g>
    )
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto max-w-sm">
      {s.shape === 'box' ? (
        <g>
          {rect(cx - (s.bw * sc) / 2, top, s.bw * sc, s.h * sc, { fill: 'var(--c-accent)', fillOpacity: 0.35, stroke: 'var(--c-ink)' })}
          {rect(cx - (s.bw * sc) / 2 + (s.tw ?? 5) * sc, top + (s.tf ?? s.tw ?? 5) * sc, (s.bw - 2 * (s.tw ?? 5)) * sc, (s.h - 2 * (s.tf ?? s.tw ?? 5)) * sc, { fill: 'var(--c-bg)', stroke: 'var(--c-ink)' })}
        </g>
      ) : (
        <g>
          {s.shape !== 'rect' && (s.shape === 'T' || s.shape === 'invT' ? [fl(-1, 'a'), fl(1, 'b')] : [fl(1, 'b')])}
          {rect(webX, top, s.bw * sc, s.h * sc, { fill: 'var(--c-accent)', fillOpacity: 0.35, stroke: 'var(--c-ink)' })}
        </g>
      )}
      <text x={8} y={H - 6} fontSize={10} fill="var(--c-faint)" className="num">
        Acp = {f2(sec.Acp)} in² · pcp = {f2(sec.pcp)} in{sec.hollow ? ` · Ag = ${f2(sec.Ag)} in²` : ''}
        {sec.sides ? (sec.useFlange ? ' · flanges help' : ' · flanges ignored (lower Acp²/pcp)') : ''}
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------- overview
function Overview() {
  return (
    <div>
      <Section title="Torsion in RC beams (theory + threshold check)" right={<div className="w-72 hidden cq-md:block"><RcFrequency topic="rc-torsion" /></div>}>
        <div className="grid cq-md:grid-cols-2 gap-4">
          <div>
            <Tex block>{`T_{cr} = 4\\lambda\\sqrt{f'_c}\\,\\frac{A_{cp}^2}{p_{cp}}\\quad(\\text{in-lb})`}</Tex>
            <Tex block>{`T_{th} = \\tfrac14T_{cr} = \\lambda\\sqrt{f'_c}\\frac{A_{cp}^2}{p_{cp}},\\quad \\text{neglect if } T_u \\le \\phi T_{th}\\ (\\phi = 0.75)`}</Tex>
            <Tex block>{`\\text{flange overhang} = \\min(h_w,\\ 4h_f)\\ \\text{each side}`}</Tex>
          </div>
          <Md>{`- **Primary (equilibrium) torsion**: no other load path, so it must be designed for (cantilever slab on a beam, canopy).
- **Secondary (compatibility) torsion**: from continuity. It cracks, redistributes, and may be neglected or reduced (spandrel beam twisted by a continuous slab).
- After cracking, torsion needs **closed stirrups + longitudinal bars**. The design equations are **not in this course** (class note: "no math, only theoretical question"). Numerical work stops at Acp, pcp, Tcr, Tth and the neglect check.`}</Md>
        </div>
        <Callout kind="exam">Torsion appears only as theory in the papers: "differentiate equilibrium and compatibility torsion" (2023-24 Q5(b), 5 marks; 2020-21 Q4(c), 6 marks). The Jan 2026 slides end with a threshold-check example (28 ft L-beam), so a short Tcr / φTth check is the most a numerical part can ask.</Callout>
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------- approach
const EX: SpandrelIn = { L: 28, bw: 12, h: 24, hf: 6, overhang: 5.5, slabLL: 50, lineLL: 900, d: 21.5 }

function Approach() {
  const sp = spandrelTorque(EX)
  const sec = torsionSection({ shape: 'L', bw: 12, h: 24, hf: 6, overhang: 66 })
  const th = threshold(sec, { fc: 5000 })
  const c = torsionCheck(sp.Tud, th)
  return (
    <div>
      <Section title="Recipe: can torsion be neglected?">
        <Steps>
          <Step n={1} title="Sketch the section; split the loads">Loads on the beam centreline (web self-weight, line loads, slab over the web) vs off-centre loads (the overhang).</Step>
          <Step n={2} title="Factor (1.2D + 1.6L); eccentricity e = bw/2 + overhang/2" />
          <Step n={3} title="wu = centreline + overhang; tu = overhang load × e" />
          <Step n={4} title="Face values Vu = wuL/2, Tu = tuL/2; scale by (L/2 − d)/(L/2) for the value at d" />
          <Step n={5} title="Acp, pcp with the counted overhang min(hw, 4hf); use flanges only if they raise Acp²/pcp" />
          <Step n={6} title="φTth = 0.75λ√f′c Acp²/pcp ÷ 12 000 (ft-k); axial or hollow forms if needed" />
          <Step n={7} title="Tu,d ≤ φTth → neglect; else torsion steel needed — say whether equilibrium or compatibility torsion" />
        </Steps>
      </Section>
      <Section title="Neglect torsion or not?">
        <svg viewBox="0 0 640 170" className="w-full h-auto max-w-2xl">
          {[
            { x: 10, t: 'Is the torque needed for equilibrium?', s: '(cantilever slab, canopy, eccentric load with no other path)' },
            { x: 330, t: 'Compatibility (spandrel + continuous slab)', s: 'may be reduced to φTcr (ACI 22.7.3.2, beyond slides)' },
          ].map((b) => (
            <g key={b.x}>
              <rect x={b.x} y={10} width={300} height={50} rx={8} fill="var(--c-panel2)" stroke="var(--c-line)" />
              <text x={b.x + 150} y={31} fontSize={12} textAnchor="middle" fill="var(--c-ink)" fontWeight={700}>
                {b.t}
              </text>
              <text x={b.x + 150} y={48} fontSize={10} textAnchor="middle" fill="var(--c-mute)">
                {b.s}
              </text>
            </g>
          ))}
          <rect x={10} y={100} width={620} height={56} rx={8} fill="var(--c-accent)" fillOpacity={0.1} stroke="var(--c-accent)" />
          <text x={320} y={122} fontSize={12.5} textAnchor="middle" fill="var(--c-ink)" fontWeight={700}>
            Either way: compute Tu at d and φTth = 0.75λ√f′c Acp²/pcp
          </text>
          <text x={320} y={142} fontSize={11} textAnchor="middle" fill="var(--c-mute)">
            Tu ≤ φTth → neglect torsion · Tu {'>'} φTth → torsion reinforcement (closed stirrups + longitudinal bars)
          </text>
          <line x1={160} x2={160} y1={60} y2={100} stroke="var(--c-mute)" />
          <line x1={480} x2={480} y1={60} y2={100} stroke="var(--c-mute)" />
        </svg>
        <Callout kind="trap">
          <Md>{`- Measure e from the **beam centreline** to the centroid of the overhang load, not from the web face.
- Slab load directly over the web is **not** eccentric.
- Count only min(hw, 4hf) of the flange (18 in of the 66 in slab in the example).
- Tth is **¼ Tcr**: do not put the 4 into Tth. Convert in-lb ÷ 12 000 to ft-k.
- Hollow section: Ag (concrete only) in the numerator, but pcp is still the **outside** perimeter.`}</Md>
        </Callout>
      </Section>
      <Section title="Lecture example (Nilson Ex 7.1, Jan 2026 slides pp 13–14)" sub="28 ft span L-beam, web 12 × 24 in, 6 in slab cantilevering 5′-6″ beyond the web face, LL 900 lb/ft on the beam + 50 psf on the slab, d = 21.5 in, f′c = 5000 psi">
        <div className="grid cq-md:grid-cols-[1fr_1.4fr] gap-4 text-sm">
          <TorSectionFig s={{ shape: 'L', bw: 12, h: 24, hf: 6, overhang: 66 }} />
          <div className="space-y-1">
            <Tex block>{`\\text{overhang: } 1.2(${f2(sp.ecc.D)}) + 1.6(${f2(sp.ecc.L)}) = ${f2(sp.ecc.u)}\\ \\text{lb/ft at } e = ${f2(sp.e)}\\ \\text{ft}`}</Tex>
            <Tex block>{`\\text{centreline: } 1.2(${f2(sp.cl.D)}) + 1.6(${f2(sp.cl.L)}) = ${f2(sp.cl.u)}\\ \\text{lb/ft}`}</Tex>
            <Tex block>{`w_u = ${f2(sp.wu)}\\ \\text{lb/ft},\\quad t_u = ${f2(sp.ecc.u)}\\times${f2(sp.e)} = ${f2(sp.tu)}\\ \\text{ft-lb/ft}`}</Tex>
            <Tex block>{`V_u = ${f2(sp.VuFace)}\\ \\text{k},\\ T_u = ${f2(sp.TuFace)}\\ \\text{ft-k (face)};\\quad \\times ${fmt(sp.ratio, 4)}:\\ V_{u,d} = ${f2(sp.Vud)}\\ \\text{k},\\ T_{u,d} = ${f2(sp.Tud)}\\ \\text{ft-k}`}</Tex>
            <Tex block>{`h_w = ${f2(sec.hw)},\\ 4h_f = 24 \\Rightarrow ${f2(sec.ohEff)}\\ \\text{in};\\ A_{cp} = ${f2(sec.Acp)}\\ \\text{in}^2,\\ p_{cp} = ${f2(sec.pcp)}\\ \\text{in}`}</Tex>
            <Tex block>{`\\frac{A_{cp}^2}{p_{cp}} = ${f2(sec.withFlange.ratio)}\\ (\\text{web only } ${f2(sec.web.ratio)}) \\Rightarrow \\text{use flange}`}</Tex>
            <Tex block>{`\\phi T_{th} = 0.75\\sqrt{5000}\\,(${f2(sec.ratio)})/12000 = ${f2(th.phiTth)}\\ \\text{ft-k};\\quad T_{cr} = ${f2(th.Tcr)}\\ \\text{ft-k}`}</Tex>
            <p>
              <b>
                T<sub>u,d</sub> = {f2(sp.Tud)} {c.neglect ? '≤' : '>'} φT<sub>th</sub> = {f2(th.phiTth)} ft-k → torsion {c.neglect ? 'may be neglected' : 'can NOT be neglected'}.
              </b>{' '}
              It is equilibrium torsion (the cantilever slab has no other support), so the full Tu must be designed for. Tu is above even Tcr: the beam will crack in torsion.
            </p>
            <p className="text-xs text-faint">The handnote prints the web-only ratio as 288²/96 = 864; the web perimeter is 2(12 + 24) = 72 in, so it is 1152. The conclusion (use the flange) is unchanged.</p>
          </div>
        </div>
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------- lab
interface TLab {
  shape: TorShape
  bw: number
  h: number
  hf: number
  overhang: number
  tw: number
  fc: number
  lambda: number
  axial: 'none' | 'comp' | 'tens' | 'pre'
  Nu: number
  fpc: number
  src: 'given' | 'spandrel'
  Tu: number
  sp: { L: number; overhangFt: number; slabLL: number; lineLL: number; slabSDL: number; d: number }
  kind: TorsionKind
  story?: string
}
const TDEF: TLab = { shape: 'L', bw: 12, h: 24, hf: 6, overhang: 66, tw: 5, fc: 5000, lambda: 1, axial: 'none', Nu: 0, fpc: 0, src: 'spandrel', Tu: 10, sp: { L: 28, overhangFt: 5.5, slabLL: 50, lineLL: 900, slabSDL: 0, d: 21.5 }, kind: 'equilibrium' }

function randomT(seed: number): TLab {
  const r = rng(seed)
  const t = pick(r, ['spandrel', 'spandrel', 'rect', 'T', 'box', 'axial'])
  const fc = pick(r, [3000, 4000, 4000, 5000])
  if (t === 'spandrel') {
    const bw = pick(r, [12, 14])
    const h = randInt(r, 20, 28, 2)
    const hf = pick(r, [5, 6])
    const oh = randInt(r, 3, 6, 0.5)
    const L = randInt(r, 20, 30, 2)
    return { ...TDEF, shape: 'L', bw, h, hf, overhang: oh * 12, fc, src: 'spandrel', kind: 'equilibrium', sp: { L, overhangFt: oh, slabLL: pick(r, [40, 50, 60, 80]), lineLL: randInt(r, 0, 1000, 100), slabSDL: pick(r, [0, 20, 25]), d: h - 2.5 }, story: `L-beam, ${L} ft clear span, slab cantilevers ${oh} ft beyond the web face. Check whether torsion can be neglected.` }
  }
  if (t === 'box') return { ...TDEF, shape: 'box', bw: randInt(r, 24, 36, 6), h: randInt(r, 30, 48, 6), tw: pick(r, [5, 6]), fc, src: 'given', Tu: randInt(r, 8, 30), axial: 'none', story: 'Hollow box girder: find φTth and decide.' }
  if (t === 'T') return { ...TDEF, shape: 'T', bw: pick(r, [12, 14]), h: randInt(r, 24, 30, 2), hf: pick(r, [4, 5, 6]), overhang: 60, fc, src: 'given', Tu: randInt(r, 5, 15), axial: 'none', kind: 'compatibility', story: 'Interior T-beam twisted by unequal slab spans (compatibility torsion).' }
  if (t === 'axial') return { ...TDEF, shape: 'rect', bw: 12, h: randInt(r, 18, 24, 2), fc, src: 'given', Tu: randInt(r, 3, 8), axial: pick(r, ['comp', 'tens']), Nu: randInt(r, 30, 120, 10), story: 'Rectangular member with axial load: find φTth with the axial-load form.' }
  return { ...TDEF, shape: 'rect', bw: pick(r, [10, 12, 14]), h: randInt(r, 18, 26, 2), fc, src: 'given', Tu: randInt(r, 2, 8), axial: 'none', story: 'Rectangular beam: Tcr, Tth, φTth, neglect?' }
}

function TorsionLab() {
  const [p, setP] = useState<TLab>(TDEF)
  const set = (o: Partial<TLab>) => setP({ ...p, ...o, story: undefined })
  const setSp = (o: Partial<TLab['sp']>) => setP({ ...p, sp: { ...p.sp, ...o }, overhang: o.overhangFt !== undefined ? o.overhangFt * 12 : p.overhang, story: undefined })
  const spandrel = p.src === 'spandrel'
  const secIn: TorSectionIn = spandrel ? { shape: 'L', bw: p.bw, h: p.h, hf: p.hf, overhang: p.sp.overhangFt * 12 } : { shape: p.shape, bw: p.bw, h: p.h, hf: p.hf, overhang: p.overhang, tw: p.tw }
  const nums = [p.bw, p.h, p.hf, p.overhang, p.tw, p.fc, p.Nu, p.fpc, p.Tu, ...Object.values(p.sp)]
  const valid = nums.every(Number.isFinite) && p.bw > 0 && p.h > 0 && p.fc > 0
  const sec = valid ? torsionSection(secIn) : null
  const th = sec ? threshold(sec, { fc: p.fc, lambda: p.lambda, Nu: p.axial === 'comp' ? p.Nu : p.axial === 'tens' ? -p.Nu : 0, fpc: p.axial === 'pre' ? p.fpc : 0 }) : null
  const sp = valid && spandrel ? spandrelTorque({ L: p.sp.L, bw: p.bw, h: p.h, hf: p.hf, overhang: p.sp.overhangFt, slabLL: p.sp.slabLL, lineLL: p.sp.lineLL, slabSDL: p.sp.slabSDL, d: p.sp.d }) : null
  const Tu = sp ? sp.Tud : p.Tu
  const chk = th ? torsionCheck(Tu, th, spandrel ? 'equilibrium' : p.kind) : null
  useEffect(() => {
    if (th) markUsed('s-tth', { case: th.case })
  })
  const key = hashKey(JSON.stringify(p))
  const id = (k: string) => `rc-torsion:lab:${key}:${k}`
  return (
    <div className="space-y-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <button className="btn" onClick={() => setP(randomT(Math.floor(Math.random() * 1e9)))}>
          🎲 Random problem
        </button>
        <button className="text-accent underline" onClick={() => setP(TDEF)}>
          reset (lecture L-beam)
        </button>
        <Seg value={p.src} onChange={(v) => set({ src: v })} items={[{ v: 'spandrel', label: 'Tu from eccentric slab load' }, { v: 'given', label: 'Tu given' }]} />
      </div>
      {p.story && <div className="rounded-xl border border-line bg-panel2/50 p-3">{p.story}</div>}
      <div className="flex flex-wrap gap-x-4 gap-y-2 items-center">
        {!spandrel && (
          <label className="inline-flex items-center gap-1.5 text-xs">
            <span className="text-mute">shape</span>
            <select className="field !py-0.5 !text-xs" value={p.shape} onChange={(e) => set({ shape: e.target.value as TorShape })}>
              {TOR_SHAPES.map((s) => (
                <option key={s.v} value={s.v}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        )}
        <NumIn label={secIn.shape === 'box' ? 'outer b' : 'b_w'} value={p.bw} onChange={(v) => set({ bw: v })} step={1} unit="in" w="w-14" />
        <NumIn label="h (total)" value={p.h} onChange={(v) => set({ h: v })} step={1} unit="in" w="w-14" />
        {secIn.shape === 'box' ? (
          <NumIn label="wall t" value={p.tw} onChange={(v) => set({ tw: v })} step={0.5} unit="in" w="w-14" />
        ) : (
          secIn.shape !== 'rect' && (
            <>
              <NumIn label="h_f" value={p.hf} onChange={(v) => set({ hf: v })} step={0.5} unit="in" w="w-14" />
              {!spandrel && <NumIn label="slab beyond web face" value={p.overhang} onChange={(v) => set({ overhang: v })} step={6} unit="in" w="w-16" />}
            </>
          )
        )}
        <NumIn label="f′c" value={p.fc} onChange={(v) => set({ fc: v })} step={500} unit="psi" />
        <label className="inline-flex items-center gap-1.5 text-xs">
          <span className="text-mute">λ</span>
          <select className="field !py-0.5 !text-xs" value={p.lambda} onChange={(e) => set({ lambda: +e.target.value })}>
            <option value={1}>1.0 normal</option>
            <option value={0.85}>0.85 sand-LW</option>
            <option value={0.75}>0.75 all-LW</option>
          </select>
        </label>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-2 items-center">
        <Seg size="xs" value={p.axial} onChange={(v) => set({ axial: v })} items={[{ v: 'none', label: 'no axial' }, { v: 'comp', label: 'axial comp.' }, { v: 'tens', label: 'axial tension' }, { v: 'pre', label: 'prestressed' }]} />
        {(p.axial === 'comp' || p.axial === 'tens') && <NumIn label="N_u" value={p.Nu} onChange={(v) => set({ Nu: Math.abs(v) })} step={10} unit="k" w="w-16" />}
        {p.axial === 'pre' && <NumIn label="f_pc" value={p.fpc} onChange={(v) => set({ fpc: v })} step={50} unit="psi" w="w-16" />}
        {!spandrel && (
          <>
            <NumIn label="T_u (at d)" value={p.Tu} onChange={(v) => set({ Tu: v })} step={0.5} unit="ft-k" w="w-16" />
            <Seg size="xs" value={p.kind} onChange={(v) => set({ kind: v })} items={[{ v: 'equilibrium', label: 'equilibrium' }, { v: 'compatibility', label: 'compatibility' }]} />
          </>
        )}
      </div>
      {spandrel && (
        <div className="flex flex-wrap gap-x-4 gap-y-2 items-center">
          <NumIn label="clear span L" value={p.sp.L} onChange={(v) => setSp({ L: v })} step={1} unit="ft" w="w-14" />
          <NumIn label="slab beyond web face" value={p.sp.overhangFt} onChange={(v) => setSp({ overhangFt: v })} step={0.5} unit="ft" w="w-14" />
          <NumIn label="slab LL" value={p.sp.slabLL} onChange={(v) => setSp({ slabLL: v })} step={10} unit="psf" w="w-14" />
          <NumIn label="slab SDL" value={p.sp.slabSDL} onChange={(v) => setSp({ slabSDL: v })} step={5} unit="psf" w="w-14" />
          <NumIn label="LL on beam" value={p.sp.lineLL} onChange={(v) => setSp({ lineLL: v })} step={100} unit="lb/ft" w="w-16" />
          <NumIn label="d" value={p.sp.d} onChange={(v) => setSp({ d: v })} step={0.5} unit="in" w="w-14" />
        </div>
      )}
      {!sec || !th || !chk ? (
        <div className="text-bad">Fill every input.</div>
      ) : (
        <>
          <div className="grid cq-lg:grid-cols-2 gap-4">
            <div key={key} className="rounded-xl border border-line p-3 space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-faint">Checkpoints</div>
              {sp && (
                <>
                  <Answer id={id('ecc')} label="overhang load (factored)" value={sp.ecc.u} unit="lb/ft" compact />
                  <Answer id={id('e')} label="eccentricity e" value={sp.e} unit="ft" compact />
                  <Answer id={id('tu')} label="t_u" value={sp.tu} unit="ft-lb/ft" compact />
                  <Answer id={id('tf')} label="Tu at the face" value={sp.TuFace} unit="ft-k" compact />
                  <Answer id={id('td')} label="Tu at d" value={sp.Tud} unit="ft-k" compact />
                </>
              )}
              {sec.sides > 0 && <Answer id={id('oh')} label="overhang counted" value={sec.ohEff} unit="in" compact />}
              {sec.sides > 0 && <Choice id={id('fl')} label="Use the flange?" options={[{ v: 'y', label: 'yes' }, { v: 'n', label: 'no, web only' }]} answer={sec.useFlange ? 'y' : 'n'} />}
              <Answer id={id('acp')} label="A_cp" value={sec.Acp} unit="in²" compact />
              {sec.hollow && <Answer id={id('ag')} label="A_g" value={sec.Ag} unit="in²" compact />}
              <Answer id={id('pcp')} label="p_cp" value={sec.pcp} unit="in" compact />
              <Answer id={id('tcr')} label="T_cr" value={th.Tcr} unit="ft-k" compact />
              <Answer id={id('pth')} label="φT_th" value={th.phiTth} unit="ft-k" compact />
              <Choice id={id('neg')} label="Neglect torsion?" options={[{ v: 'y', label: 'yes' }, { v: 'n', label: 'no' }]} answer={chk.neglect ? 'y' : 'n'} />
            </div>
            <div className="rounded-xl border border-line bg-bg/60 p-2 grid place-items-center">
              <TorSectionFig s={secIn} />
            </div>
          </div>
          <Reveal id={id('sol')} title="Full solution">
            <div className="space-y-1">
              {sp && (
                <>
                  <Tex block>{`\\text{overhang (eccentric): } D = ${f2(sp.ecc.D)},\\ L = ${f2(sp.ecc.L)}\\ \\text{lb/ft} \\Rightarrow 1.2D + 1.6L = ${f2(sp.ecc.u)}\\ \\text{lb/ft},\\ e = \\tfrac{b_w}{2} + \\tfrac{\\text{overhang}}{2} = ${f2(sp.e)}\\ \\text{ft}`}</Tex>
                  <Tex block>{`\\text{centreline: web } ${f2(sp.cl.web)} + \\ldots:\\ 1.2(${f2(sp.cl.D)}) + 1.6(${f2(sp.cl.L)}) = ${f2(sp.cl.u)}\\ \\text{lb/ft};\\ w_u = ${f2(sp.wu)},\\ t_u = ${f2(sp.tu)}\\ \\text{ft-lb/ft}`}</Tex>
                  <Tex block>{`T_{u,face} = t_uL/2 = ${f2(sp.TuFace)}\\ \\text{ft-k},\\ T_{u,d} = ${f2(sp.TuFace)}\\times${fmt(sp.ratio, 4)} = ${f2(sp.Tud)}\\ \\text{ft-k}\\ \\ (V_{u,d} = ${f2(sp.Vud)}\\ \\text{k})`}</Tex>
                </>
              )}
              {sec.sides > 0 && (
                <Tex block>{`h_w = ${f2(sec.hw)},\\ 4h_f = ${f2(4 * (secIn.hf ?? 0))}${Number.isFinite(secIn.overhang ?? Infinity) ? `,\\ \\text{slab} = ${f2(secIn.overhang!)}` : ''} \\Rightarrow ${f2(sec.ohEff)}\\ \\text{in};\\ \\frac{A_{cp}^2}{p_{cp}} = \\frac{${f2(sec.withFlange.Acp)}^2}{${f2(sec.withFlange.pcp)}} = ${f2(sec.withFlange.ratio)}\\ \\text{vs web } \\frac{${f2(sec.web.Acp)}^2}{${f2(sec.web.pcp)}} = ${f2(sec.web.ratio)}`}</Tex>
              )}
              <Tex block>{`${sec.hollow ? `A_g^2/p_{cp} = ${f2(sec.Ag)}^2/${f2(sec.pcp)}` : `A_{cp}^2/p_{cp} = ${f2(sec.Acp)}^2/${f2(sec.pcp)}`} = ${f2(sec.ratio)}\\ \\text{in}^3${th.factor !== 1 ? `,\\ \\text{factor } ${fmt(th.factor, 4)}` : ''}`}</Tex>
              <Tex block>{`T_{th} = ${p.lambda}\\times${f2(th.sqrtFc)}\\times${f2(sec.ratio)}${th.factor !== 1 ? `\\times${fmt(th.factor, 4)}` : ''}/12000 = ${f2(th.Tth)}\\ \\text{ft-k};\\ \\phi T_{th} = ${f2(th.phiTth)}\\ \\text{ft-k};\\ T_{cr} = ${f2(th.Tcr)}\\ \\text{ft-k}`}</Tex>
              <p>
                <b>
                  T<sub>u</sub> = {f2(chk.Tu)} {chk.neglect ? '≤' : '>'} φT<sub>th</sub> = {f2(th.phiTth)} ft-k → {chk.neglect ? 'torsion may be neglected.' : 'torsion must be considered (closed stirrups + longitudinal bars).'}
                </b>{' '}
                {!chk.neglect && chk.kind === 'compatibility' && (chk.reduced ? `Compatibility torsion: design torque may be reduced to φTcr = ${f2(th.phiTcr)} ft-k (ACI 22.7.3.2, beyond the slides).` : 'Compatibility torsion, but Tu is already below φTcr: design for Tu.')}
                {!chk.neglect && chk.kind === 'equilibrium' && 'Equilibrium torsion: design for the full Tu.'}
              </p>
            </div>
          </Reveal>
        </>
      )}
    </div>
  )
}

function Lab() {
  return (
    <>
    <PickSection topic="rc-torsion" skills={TORSION_PICKS} />
    <Section title="Threshold-torsion lab" sub="Section shape, flange rule, Tcr, φTth and the neglect decision. Torsion design itself is not in the syllabus.">
      <TorsionLab />
    </Section>
    </>
  )
}

// ---------------------------------------------------------------- problems
const tq = (o: { id: string; level: RcQ['level']; title: string; text: string; sec: TorSectionIn; fc: number; Nu?: number; Tu: number }): RcQ => ({
  id: `rc-own-torsion-${o.id}`,
  paper: 'own',
  level: o.level,
  sec: 'B',
  no: o.id,
  marks: 0,
  topics: ['rc-torsion'],
  title: o.title,
  text: o.text,
  pages: [],
  checks: () => {
    const s = torsionSection(o.sec)
    const th = threshold(s, { fc: o.fc, Nu: o.Nu })
    return [
      { key: 'acp', label: s.hollow ? 'A_g' : 'A_cp (used)', value: s.hollow ? s.Ag : s.Acp, unit: 'in²' },
      { key: 'pcp', label: 'p_cp', value: s.pcp, unit: 'in' },
      { key: 'pth', label: 'φT_th', value: th.phiTth, unit: 'ft-k' },
    ]
  },
  solution: () => {
    const s = torsionSection(o.sec)
    const th = threshold(s, { fc: o.fc, Nu: o.Nu })
    const c = torsionCheck(o.Tu, th)
    return (
      <div className="text-sm space-y-1">
        <TorSectionFig s={o.sec} />
        {s.sides > 0 && <p>Overhang counted = min(hw = {f2(s.hw)}, 4hf = {f2(4 * (o.sec.hf ?? 0))}) = {f2(s.ohEff)} in; with flange Acp²/pcp = {f2(s.withFlange.ratio)}, web only {f2(s.web.ratio)} → {s.useFlange ? 'use the flange' : 'ignore the flange'}.</p>}
        <Tex block>{`A_{cp} = ${f2(s.Acp)},\\ ${s.hollow ? `A_g = ${f2(s.Ag)},\\ ` : ''}p_{cp} = ${f2(s.pcp)}\\ \\Rightarrow\\ ${f2(s.ratio)}\\ \\text{in}^3${th.factor !== 1 ? `,\\ \\sqrt{1 + N_u/(4A_g\\lambda\\sqrt{f'_c})} = ${fmt(th.factor, 4)}` : ''}`}</Tex>
        <Tex block>{`T_{th} = ${f2(th.Tth)}\\ \\text{ft-k},\\ \\phi T_{th} = ${f2(th.phiTth)}\\ \\text{ft-k},\\ T_{cr} = ${f2(th.Tcr)}\\ \\text{ft-k}`}</Tex>
        <p>
          <b>
            Tu = {f2(o.Tu)} {c.neglect ? '≤' : '>'} φTth → {c.neglect ? 'neglect torsion' : 'torsion must be considered'}.
          </b>
        </p>
      </div>
    )
  },
})

const problems: RcQ[] = [
  tq({ id: '1', level: 'warm-up', title: 'Rectangular beam threshold', text: 'b = 14 in, h = 24 in, f′c = 4000 psi, normal weight, Tu = 4 ft-k at d. Find Acp, pcp, φTth. Can torsion be neglected?', sec: { shape: 'rect', bw: 14, h: 24 }, fc: 4000, Tu: 4 }),
  tq({ id: '2', level: 'exam', title: 'Spandrel L-beam: does the flange count?', text: 'L-beam: web 12 in × 26 in total depth, slab 5 in thick extending 6 ft beyond the web face, f′c = 3000 psi, Tu = 5 ft-k (compatibility torsion). Find the counted overhang, Acp, pcp, φTth and decide.', sec: { shape: 'L', bw: 12, h: 26, hf: 5, overhang: 72 }, fc: 3000, Tu: 5 }),
  tq({ id: '3', level: 'challenge', title: 'Box girder vs solid, with axial compression', text: 'Hollow box 30 × 42 in outside, 6 in walls, f′c = 5000 psi, factored axial compression 200 k, Tu = 30 ft-k. Find Ag, pcp, φTth (axial form) and decide.', sec: { shape: 'box', bw: 30, h: 42, tw: 6 }, fc: 5000, Nu: 200, Tu: 30 }),
]

const mod: RcTopicModule = { Overview, Approach, Lab, problems, theory: TORSION_THEORY }
export default mod

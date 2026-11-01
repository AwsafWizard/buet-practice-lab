// rc-bond Lab: straight ld, hooks, compression, splices, anchorage fit, bar cut-off — every input selectable or 🎲.

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { fmt } from '../../../components/DiagramView'
import { Answer, Callout, Choice, Md, Reveal, Section, Seg, Tex } from '../../../components/ui'
import { hashKey } from '../../../labs/CheckTable'
import { pick, randInt, rng, useSeed } from '../../../labs/common'
import { NumIn } from '../../../reference/common'
import {
  bar, beamBarGeometry, columnAnchorage, compressionLap, cutoff, hookFactors, hookGeometry, ktr, ldcCalc, ldGeneral, ldhCalc, ldSimplified, MM_BAR_IDS, psiFactors,
  simpleCoefTex, simplifiedCase, spliceClass, standardCutoffs, tensionLap, tieAreaCheck, upIn, US_BAR_IDS, type Diagram,
} from '../../engine/bond'
import { wu as wuOf } from '../../engine/materials'
import { markUsed } from '../../reference/pane'
import { AnchorSketch, CutoffSketch, DowelSketch, ftIn, HookFig, LapSketch, SectionSketch } from './figs'

const f = (v: number, d = 2) => fmt(v, d)
const FCS = [2500, 3000, 3500, 4000, 4500, 5000, 6000]
const FYS = [40000, 50000, 55000, 60000, 72500, 75000]

// ---------------------------------------------------------------- input widgets
function Sel<T extends string | number>({ label, value, options, onChange }: { label: ReactNode; value: T; options: (T | [T, string])[]; onChange: (v: T) => void }) {
  const opts = options.map((o) => (Array.isArray(o) ? o : ([o, String(o)] as [T, string])))
  return (
    <label className="inline-flex items-center gap-1.5 text-xs">
      <span className="text-mute">{label}</span>
      <select
        className="field !py-0.5 !px-1.5 !text-xs"
        value={String(value)}
        onChange={(e) => {
          const o = opts.find(([v]) => String(v) === e.target.value)
          if (o) onChange(o[0])
        }}
      >
        {opts.map(([v, l]) => (
          <option key={String(v)} value={String(v)}>
            {l}
          </option>
        ))}
      </select>
    </label>
  )
}
const barOpts = (sys: 'us' | 'mm', ids?: string[]): [string, string][] => (ids ?? (sys === 'us' ? US_BAR_IDS : MM_BAR_IDS)).map((b) => [b, b.startsWith('#') ? `No. ${b.slice(1)}` : b.replace('mm', ' mm')])
function BarSel({ label = 'Bar', value, onChange, only }: { label?: string; value: string; onChange: (v: string) => void; only?: 'us' }) {
  const sys = value.startsWith('#') ? 'us' : 'mm'
  return (
    <span className="inline-flex items-center gap-1.5">
      {!only && <Seg size="xs" value={sys} onChange={(s) => onChange(s === 'us' ? '#8' : '25mm')} items={[{ v: 'us', label: '#' }, { v: 'mm', label: 'mm' }]} />}
      <Sel label={label} value={value} options={barOpts(sys)} onChange={onChange} />
    </span>
  )
}
const Tog = ({ label, v, set }: { label: ReactNode; v: boolean; set: (b: boolean) => void }) => (
  <label className="inline-flex items-center gap-1 text-xs">
    <input type="checkbox" checked={v} onChange={(e) => set(e.target.checked)} />
    <span className="text-mute">{label}</span>
  </label>
)
const N = ({ label, v, set, step = 0.5, unit, w }: { label: ReactNode; v: number; set: (n: number) => void; step?: number; unit?: string; w?: string }) => <NumIn label={label} value={v} onChange={set} step={step} unit={unit} w={w ?? 'w-16'} />
const FcSel = ({ v, set }: { v: number; set: (n: number) => void }) => <Sel label="f′c" value={v} options={FCS.map((x) => [x, `${x} psi`] as [number, string])} onChange={set} />
const FySel = ({ v, set }: { v: number; set: (n: number) => void }) => <Sel label="fy" value={v} options={FYS.map((x) => [x, `${x / 1000} ksi`] as [number, string])} onChange={set} />
const Inputs = ({ children }: { children: ReactNode }) => <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-line bg-panel2/40 p-3">{children}</div>
const Checks = ({ children }: { children: ReactNode }) => (
  <div className="rounded-xl border border-line p-3 space-y-0.5 text-sm">
    <div className="text-xs font-bold uppercase tracking-wider text-faint">Your checkpoints</div>
    {children}
  </div>
)
const T = ({ children }: { children: string }) => <Tex block>{children}</Tex>
const fin = (v: number, fb: number) => (Number.isFinite(v) && v > 0 ? v : fb)

/** mark code-pane rows after render (never during render) */
function useMark(id: string, v: Record<string, number | string> | null) {
  const key = JSON.stringify(v)
  useEffect(() => {
    if (v) markUsed(id, v)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, key])
}

// ================================================================ 1. straight bar ld
interface LdS {
  bar: string
  n: number
  b: number
  h: number
  cover: number
  st: string
  s: number
  stMin: boolean
  fc: number
  fy: number
  top: boolean
  epoxy: boolean
  lw: boolean
  asReq: number
  asProv: number
}
const LD0: LdS = { bar: '#8', n: 3, b: 12, h: 20, cover: 1.5, st: '#3', s: 6, stMin: true, fc: 3000, fy: 60000, top: false, epoxy: false, lw: false, asReq: 2.1, asProv: 2.37 }
function randLd(seed: number): LdS {
  const r = rng(seed)
  const id = pick(r, ['#5', '#6', '#7', '#8', '#9', '#10', '20mm', '25mm', '16mm'])
  const br = bar(id)
  const n = randInt(r, 2, 4)
  const As = n * br.Ab
  return {
    bar: id, n, b: randInt(r, 10, 16), h: randInt(r, 18, 28, 2), cover: 1.5, st: pick(r, ['#3', '#3', '#4', 'none']), s: randInt(r, 4, 10), stMin: r() < 0.8,
    fc: pick(r, [3000, 3500, 4000, 4000, 5000]), fy: pick(r, [60000, 60000, 60000, 40000]), top: r() < 0.5, epoxy: r() < 0.2, lw: r() < 0.1,
    asReq: Math.round(As * (0.8 + 0.2 * r()) * 100) / 100, asProv: Math.round(As * 100) / 100,
  }
}
function LdMode({ st: S, set }: { st: LdS; set: (p: Partial<LdS>) => void }) {
  const br = bar(S.bar)
  const ds = S.st === 'none' ? 0 : bar(S.st).db
  const n = Math.max(1, Math.round(fin(S.n, 2)))
  const geo = beamBarGeometry({ b: fin(S.b, 12), cover: fin(S.cover, 1.5), ds, db: br.db, n })
  const cs = simplifiedCase({ db: br.db, clearSpacing: geo.clearSpacing, clearCover: geo.clearCover, stirrupsMin: S.stMin && S.st !== 'none' })
  const psi = psiFactors({ db: br.db, small: br.small, top: S.top, epoxy: S.epoxy, clearCover: geo.clearCover, clearSpacing: geo.clearSpacing, lightweight: S.lw })
  const excess = Math.min(1, fin(S.asReq, 1) / fin(S.asProv, 1))
  const simp = ldSimplified({ db: br.db, small: br.small, fc: S.fc, fy: S.fy, met: cs.met, psiT: psi.psiT, psiE: psi.psiE, lambda: psi.lambda, excess })
  const Atr = S.st === 'none' ? 0 : geo.legs * bar(S.st).Ab
  const K = ktr(Atr, fin(S.s, 6), n)
  const gen = ldGeneral({ db: br.db, fc: S.fc, fy: S.fy, psiT: psi.psiT, psiE: psi.psiE, psiS: psi.psiS, lambda: psi.lambda, cb: geo.cb, Ktr: K, excess })
  const a10 = !S.epoxy && !S.lw && [4000, 5000, 6000].includes(S.fc) && [40000, 50000, 60000].includes(S.fy)
  useMark('b-ld', { row: cs.met ? 'met' : 'other', col: br.small ? 'small' : 'large' })
  useMark('b-psi', { t: psi.psiT, e: psi.psiE, s: psi.psiS, l: psi.lambda, cap: psi.capped ? 1 : 0 })
  useMark('b-a10', a10 ? { fy: S.fy / 1000, top: S.top ? 1 : 0, met: cs.met ? 1 : 0 } : null)
  const key = hashKey(JSON.stringify(S))
  const id = (k: string) => `rc-bond:lab:ld:${key}:${k}`
  const sf = f(simp.sqrtFc, 2)
  return (
    <div className="space-y-3">
      <Inputs>
        <BarSel value={S.bar} onChange={(v) => set({ bar: v })} />
        <N label="bars in layer" v={S.n} set={(v) => set({ n: v })} step={1} w="w-12" />
        <N label="b" v={S.b} set={(v) => set({ b: v })} step={1} unit="in" />
        <N label="h" v={S.h} set={(v) => set({ h: v })} step={1} unit="in" />
        <N label="clear cover to stirrup" v={S.cover} set={(v) => set({ cover: v })} step={0.25} unit="in" />
        <Sel label="stirrups" value={S.st} options={[['none', 'none'], ['#3', 'No. 3'], ['#4', 'No. 4']]} onChange={(v) => set({ st: v })} />
        {S.st !== 'none' && <N label="largest s within ld" v={S.s} set={(v) => set({ s: v })} step={0.5} unit="in" />}
        {S.st !== 'none' && <Tog label="≥ code-minimum stirrups" v={S.stMin} set={(v) => set({ stMin: v })} />}
        <FcSel v={S.fc} set={(v) => set({ fc: v })} />
        <FySel v={S.fy} set={(v) => set({ fy: v })} />
        <Tog label="top bar (> 12 in concrete below)" v={S.top} set={(v) => set({ top: v })} />
        <Tog label="epoxy" v={S.epoxy} set={(v) => set({ epoxy: v })} />
        <Tog label="lightweight" v={S.lw} set={(v) => set({ lw: v })} />
        <N label="As,req" v={S.asReq} set={(v) => set({ asReq: v })} step={0.05} unit="in²" />
        <N label="As,prov" v={S.asProv} set={(v) => set({ asProv: v })} step={0.05} unit="in²" />
      </Inputs>
      <div key={key} className="grid cq-lg:grid-cols-2 gap-4">
        <Checks>
          <Answer id={id('cs')} label="clear spacing" value={geo.clearSpacing} unit="in" compact />
          <Answer id={id('cc')} label="clear cover (smaller)" value={geo.clearCover} unit="in" compact />
          <Choice id={id('row')} label="Table 6.1 row" options={[{ v: 'met', label: 'first row' }, { v: 'other', label: 'other cases' }]} answer={cs.met ? 'met' : 'other'} />
          <Answer id={id('pt')} label="ψt" value={psi.psiT} compact />
          <Answer id={id('pe')} label="ψe" value={psi.psiE} compact />
          <Answer id={id('pte')} label="ψt·ψe used" value={psi.psiTE} compact />
          <Answer id={id('r')} label="ld/db (simplified)" value={simp.ratio} compact />
          <Answer id={id('ls')} label="ld simplified (final)" value={simp.final} unit="in" compact />
          <Answer id={id('cb')} label="cb" value={geo.cb} unit="in" compact />
          <Answer id={id('k')} label="Ktr" value={K} compact abs={0.02} />
          <Answer id={id('cf')} label="(cb+Ktr)/db used" value={gen.confUsed} compact />
          <Answer id={id('lg')} label="ld Eq. 6.4 (final)" value={gen.final} unit="in" compact />
        </Checks>
        <div className="rounded-xl bg-bg/60 border border-line p-2">
          <SectionSketch b={fin(S.b, 12)} h={fin(S.h, 20)} cover={fin(S.cover, 1.5)} ds={ds} db={br.db} n={n} top={S.top} governs={geo.governs} />
        </div>
      </div>
      {geo.clearSpacing < 1 && <Callout kind="trap">Clear spacing {f(geo.clearSpacing)} in is below the 1 in / db minimum — the bars do not fit in one layer.</Callout>}
      <Reveal id={id('sol')} title="Full solution">
        <div className="space-y-2 text-sm">
          <p>
            {br.label}: db = {f(br.db, 3)} in, Ab = {f(br.Ab, 3)} in²{br.mm ? ` (treated as No. ${br.no} for the size split)` : ''}; √f′c = {sf} psi.
          </p>
          <b>Geometry</b>
          <T>{`s_{c/c} = \\frac{${f(S.b)} - 2(${f(S.cover)} + ${f(ds, 3)} + ${f(br.db / 2, 3)})}{${n} - 1} = ${f(geo.spacingCC, 3)}\\text{ in},\\quad s_{clear} = ${f(geo.clearSpacing, 3)}\\text{ in} = ${f(geo.clearSpacing / br.db)}\\,d_b`}</T>
          <p>Clear cover = {f(geo.clearCover, 3)} in = {f(geo.clearCover / br.db)} db. {cs.why}.</p>
          <b>Factors</b>
          <p>
            ψt = {psi.psiT} ({S.top ? 'top bar' : 'not a top bar'}); {psi.eNote}; ψt·ψe = {f(psi.psiTEraw, 3)}
            {psi.capped ? ' > 1.7 → use 1.7' : ' ≤ 1.7'}; λ = {psi.lambda}; ψs = {psi.psiS} (Eq. 6.4 only).
          </p>
          <b>(a) Simplified (Table 6.1)</b>
          <T>{`\\frac{\\ell_d}{d_b} = ${simpleCoefTex(br.small, cs.met)}\\cdot\\frac{${S.fy}\\times ${f(psi.psiTE, 3)}}{${psi.lambda}\\times ${sf}} = ${f(simp.ratio, 1)}\\;\\Rightarrow\\;\\ell_d = ${f(simp.ratio, 1)}\\times ${f(br.db, 3)} = ${f(simp.ld0, 1)}\\text{ in}`}</T>
          <T>{`\\times\\frac{A_{s,req}}{A_{s,prov}} = ${f(simp.ld0, 1)}\\times ${f(excess, 3)} = ${f(simp.ld, 1)}\\text{ in} \\;\\ge 12 \\;\\Rightarrow\\; \\textbf{${upIn(simp.final)} in}`}</T>
          <b>(b) General (Eq. 6.4)</b>
          <p>
            Centre to side = {f(geo.cSide, 3)} in, centre to {S.top ? 'top' : 'bottom'} = {f(geo.cFace, 3)} in, half spacing = {f(geo.halfSpacing, 3)} in → cb = {f(geo.cb, 3)} in (
            {geo.governs === 'spacing' ? 'half-spacing governs: horizontal splitting plane, all stirrup legs count' : 'cover governs: vertical plane, one leg counts'}).
          </p>
          <T>{`K_{tr} = \\frac{40A_{tr}}{sn} = \\frac{40\\times ${f(Atr, 3)}}{${f(S.s)}\\times ${n}} = ${f(K, 3)};\\quad \\frac{c_b + K_{tr}}{d_b} = \\frac{${f(geo.cb, 3)} + ${f(K, 3)}}{${f(br.db, 3)}} = ${f(gen.conf, 3)}${gen.capped ? ' > 2.5 \\Rightarrow 2.5' : ' \\le 2.5'}`}</T>
          <T>{`\\frac{\\ell_d}{d_b} = \\frac{3}{40}\\cdot\\frac{${S.fy}}{${psi.lambda}\\times ${sf}}\\cdot\\frac{${f(psi.psiTE, 3)}\\times ${psi.psiS}}{${f(gen.confUsed, 3)}} = ${f(gen.ratio, 1)}\\;\\Rightarrow\\;\\ell_d = ${f(gen.ld0, 1)}\\times ${f(excess, 3)} = ${f(gen.ld, 1)}\\text{ in} \\Rightarrow \\textbf{${upIn(gen.final)} in}`}</T>
          <p className="text-mute">The simplified rows assume (cb + Ktr)/db = 1.5 (first row) or 1.0 (other cases); here it is {f(gen.confUsed)}, so Eq. 6.4 {gen.final < simp.final ? `saves ${f(simp.final - gen.final, 1)} in` : 'gives no saving'}.</p>
        </div>
      </Reveal>
    </div>
  )
}

// ================================================================ 2. hooks
interface HkS {
  bar: string
  fc: number
  fy: number
  epoxy: boolean
  lw: boolean
  hook: 90 | 180
  side: number
  tail: number
  conf: boolean
  disc: boolean
  asReq: number
  asProv: number
}
const HK0: HkS = { bar: '#11', fc: 4000, fy: 60000, epoxy: false, lw: false, hook: 90, side: 4.9, tail: 2, conf: false, disc: false, asReq: 2.9, asProv: 3.12 }
function randHk(seed: number): HkS {
  const r = rng(seed)
  const id = pick(r, ['#6', '#7', '#8', '#9', '#10', '#11', '20mm', '25mm'])
  return {
    bar: id, fc: pick(r, [3000, 4000, 4000, 5000]), fy: 60000, epoxy: r() < 0.15, lw: false, hook: r() < 0.8 ? 90 : 180, side: pick(r, [2, 2.5, 3, 4]), tail: pick(r, [1.5, 2, 2]),
    conf: r() < 0.3, disc: false, asReq: 1, asProv: pick(r, [1, 1, 1.1, 1.2]),
  }
}
function HookMode({ st: S, set }: { st: HkS; set: (p: Partial<HkS>) => void }) {
  const br = bar(S.bar)
  const fa = hookFactors({ no: br.no, epoxy: S.epoxy, lightweight: S.lw, hook: S.hook, sideCover: S.side, tailCover: S.tail, confined: S.conf, discontinuousSmallCover: S.disc })
  const excess = Math.min(1, fin(S.asReq, 1) / fin(S.asProv, 1))
  const r = ldhCalc({ db: br.db, fc: S.fc, fy: S.fy, psiE: fa.psiE, psiC: fa.psiC, psiR: fa.psiR, lambda: fa.lambda, excess })
  const g = hookGeometry(br.no, br.db, S.hook)
  useMark('b-hook', { e: fa.psiE, c: fa.psiC, r: fa.psiR, no: br.no })
  const key = hashKey(JSON.stringify(S))
  const id = (k: string) => `rc-bond:lab:hook:${key}:${k}`
  return (
    <div className="space-y-3">
      <Inputs>
        <BarSel value={S.bar} onChange={(v) => set({ bar: v })} />
        <FcSel v={S.fc} set={(v) => set({ fc: v })} />
        <FySel v={S.fy} set={(v) => set({ fy: v })} />
        <Seg size="xs" value={String(S.hook) as '90' | '180'} onChange={(v) => set({ hook: +v as 90 })} items={[{ v: '90', label: '90° hook' }, { v: '180', label: '180° hook' }]} />
        <N label="side cover" v={S.side} set={(v) => set({ side: v })} step={0.25} unit="in" />
        {S.hook === 90 && <N label="tail cover" v={S.tail} set={(v) => set({ tail: v })} step={0.25} unit="in" />}
        <Tog label="ties at ≤ 3db along hook" v={S.conf} set={(v) => set({ conf: v })} />
        <Tog label="discontinuous end, side & top cover < 2.5 in" v={S.disc} set={(v) => set({ disc: v })} />
        <Tog label="epoxy" v={S.epoxy} set={(v) => set({ epoxy: v })} />
        <Tog label="lightweight" v={S.lw} set={(v) => set({ lw: v })} />
        <N label="As,req" v={S.asReq} set={(v) => set({ asReq: v })} step={0.05} unit="in²" />
        <N label="As,prov" v={S.asProv} set={(v) => set({ asProv: v })} step={0.05} unit="in²" />
      </Inputs>
      <div key={key} className="grid cq-lg:grid-cols-2 gap-4">
        <Checks>
          <Answer id={id('pe')} label="ψe" value={fa.psiE} compact />
          <Answer id={id('pc')} label="ψc" value={fa.psiC} compact />
          <Answer id={id('pr')} label="ψr" value={fa.psiR} compact />
          <Answer id={id('basic')} label="fy ψe db/(50λ√f′c)" value={r.basic} unit="in" compact />
          <Answer id={id('ld')} label="× ψc ψr × As ratio" value={r.ld} unit="in" compact />
          <Answer id={id('min')} label="max(8db, 6 in)" value={r.min} unit="in" compact />
          <Answer id={id('fin')} label="ldh (final)" value={r.final} unit="in" compact />
          <Answer id={id('D')} label="inside bend dia. D" value={g.D} unit="in" compact />
          <Answer id={id('t')} label="extension" value={g.tail} unit="in" compact />
        </Checks>
        <div className="rounded-xl bg-bg/60 border border-line p-2">
          <HookFig db={br.db} no={br.no} ldh={r.final} />
        </div>
      </div>
      <Reveal id={id('sol')} title="Full solution">
        <div className="space-y-2 text-sm">
          <p>
            {br.label}: db = {f(br.db, 3)} in; √f′c = {f(Math.min(Math.sqrt(S.fc), 100))} psi. ψe = {fa.psiE} ({S.epoxy ? 'epoxy' : 'uncoated'}); {fa.cNote}; {fa.rNote}; λ = {fa.lambda}.
          </p>
          <T>{`\\ell_{dh} = \\frac{f_y\\psi_e\\psi_c\\psi_r}{50\\lambda\\sqrt{f'_c}}d_b = \\frac{${S.fy}\\times ${fa.psiE}\\times ${fa.psiC}\\times ${fa.psiR}}{50\\times ${fa.lambda}\\times ${f(Math.min(Math.sqrt(S.fc), 100))}}\\times ${f(br.db, 3)} = ${f(r.ld0, 2)}\\text{ in}`}</T>
          <T>{`\\times ${f(excess, 3)} = ${f(r.ld, 2)}\\text{ in};\\quad \\min = \\max(8\\times ${f(br.db, 3)},\\ 6) = ${f(r.min, 2)}\\text{ in} \\Rightarrow \\ell_{dh} = \\textbf{${upIn(r.final)} in}`}</T>
          <p>
            Hook: {S.hook}°, inside bend diameter {g.Dk}db = {f(g.D, 2)} in, extension {g.tailText} = {f(g.tail, 2)} in. ldh is measured from the critical section to the outside of the hook.
          </p>
        </div>
      </Reveal>
    </div>
  )
}

// ================================================================ 3. compression
interface CpS {
  bar: string
  fc: number
  fy: number
  lw: boolean
  conf: boolean
  asReq: number
  asProv: number
}
const CP0: CpS = { bar: '#9', fc: 3000, fy: 60000, lw: false, conf: true, asReq: 0.85, asProv: 1 }
function randCp(seed: number): CpS {
  const r = rng(seed)
  return { bar: pick(r, ['#6', '#7', '#8', '#9', '#10', '#11', '20mm', '25mm']), fc: pick(r, [3000, 4000, 5000]), fy: pick(r, [40000, 60000, 60000]), lw: false, conf: r() < 0.5, asReq: pick(r, [0.8, 0.85, 0.9, 1]), asProv: 1 }
}
function LdcMode({ st: S, set }: { st: CpS; set: (p: Partial<CpS>) => void }) {
  const br = bar(S.bar)
  const excess = Math.min(1, fin(S.asReq, 1) / fin(S.asProv, 1))
  const r = ldcCalc({ db: br.db, fc: S.fc, fy: S.fy, lambda: S.lw ? 0.75 : 1, confined: S.conf, excess })
  useMark('b-ldc', { r: r.psiR })
  useMark('b-a11', !br.mm && [3000, 4000, 5000, 6000].includes(S.fc) && [40000, 50000, 60000].includes(S.fy) && !S.lw ? { no: br.no, fy: S.fy / 1000 } : null)
  const key = hashKey(JSON.stringify(S))
  const id = (k: string) => `rc-bond:lab:ldc:${key}:${k}`
  const sf = f(Math.min(Math.sqrt(S.fc), 100))
  return (
    <div className="space-y-3">
      <Inputs>
        <BarSel value={S.bar} onChange={(v) => set({ bar: v })} />
        <FcSel v={S.fc} set={(v) => set({ fc: v })} />
        <FySel v={S.fy} set={(v) => set({ fy: v })} />
        <Tog label="spiral or No. 4 ties at ≤ 4 in" v={S.conf} set={(v) => set({ conf: v })} />
        <Tog label="lightweight" v={S.lw} set={(v) => set({ lw: v })} />
        <N label="As,req" v={S.asReq} set={(v) => set({ asReq: v })} step={0.05} unit="in²" />
        <N label="As,prov" v={S.asProv} set={(v) => set({ asProv: v })} step={0.05} unit="in²" />
      </Inputs>
      <div key={key} className="grid cq-lg:grid-cols-2 gap-4">
        <Checks>
          <Answer id={id('a')} label="fy db/(50λ√f′c)" value={r.a} unit="in" compact />
          <Answer id={id('b')} label="0.0003 fy db" value={r.b} unit="in" compact />
          <Answer id={id('basic')} label="basic ldc" value={r.basic} unit="in" compact />
          <Answer id={id('fin')} label="ldc (final)" value={r.final} unit="in" compact />
        </Checks>
        <div className="rounded-xl bg-bg/60 border border-line p-2 flex justify-center">
          <DowelSketch ldc={r.final} />
        </div>
      </div>
      <Reveal id={id('sol')} title="Full solution">
        <div className="space-y-2 text-sm">
          <T>{`\\frac{f_yd_b}{50\\lambda\\sqrt{f'_c}} = \\frac{${S.fy}\\times ${f(br.db, 3)}}{50\\times ${S.lw ? 0.75 : 1}\\times ${sf}} = ${f(r.a, 2)}\\text{ in};\\quad 0.0003f_yd_b = ${f(r.b, 2)}\\text{ in}`}</T>
          <T>{`\\ell_{dc} = ${f(r.basic, 2)}\\times ${r.psiR}\\times ${f(excess, 3)} = ${f(r.ld, 2)}\\text{ in} \\;(\\ge 8) \\Rightarrow \\textbf{${upIn(r.final)} in}`}</T>
          <p className="text-mute">{S.conf ? 'ψr = 0.75: spiral or No. 4 ties at ≤ 4 in.' : 'No confinement credit (ties not at ≤ 4 in).'} Excess-steel factor applies to development (not to splices).</p>
        </div>
      </Reveal>
    </div>
  )
}

// ================================================================ 4. splices
interface SpS {
  kind: 'tension' | 'compression'
  bar: string
  fc: number
  fy: number
  top: boolean
  epoxy: boolean
  lw: boolean
  met: boolean
  ratio: number
  pct: number
  below: string
  h: number
  s: number
  tie: string
  spiral: boolean
}
const SP0: SpS = { kind: 'tension', bar: '#7', fc: 4000, fy: 60000, top: false, epoxy: false, lw: false, met: true, ratio: 1.33, pct: 100, below: '#11', h: 21, s: 16, tie: '#4', spiral: false }
function randSp(seed: number): SpS {
  const r = rng(seed)
  const kind = r() < 0.6 ? 'tension' : 'compression'
  const above = pick(r, ['#7', '#8', '#9', '#10'])
  return {
    ...SP0, kind, bar: above, fc: pick(r, [2500, 3000, 4000, 5000]), fy: pick(r, [60000, 60000, 75000]), top: r() < 0.4, ratio: pick(r, [1.2, 1.5, 2, 2.2, 2.5]), pct: pick(r, [50, 100]),
    below: pick(r, [above, above, '#10', '#11']), h: randInt(r, 14, 24), s: pick(r, [10, 12, 14, 16]), tie: pick(r, ['#3', '#4']), spiral: r() < 0.25,
  }
}
function SpliceMode({ st: S, set }: { st: SpS; set: (p: Partial<SpS>) => void }) {
  const br = bar(S.bar)
  const key = hashKey(JSON.stringify(S))
  const id = (k: string) => `rc-bond:lab:sp:${key}:${k}`
  const psi = psiFactors({ db: br.db, small: br.small, top: S.top, epoxy: S.epoxy, lightweight: S.lw })
  const ld = ldSimplified({ db: br.db, small: br.small, fc: S.fc, fy: S.fy, met: S.met, psiT: psi.psiT, psiE: psi.psiE, lambda: psi.lambda })
  const cls = spliceClass(fin(S.ratio, 1), S.pct)
  const lap = tensionLap(ld.ld, cls.cls)
  const bb = bar(S.below)
  const larger = bb.db > br.db ? bb : null
  const ties = tieAreaCheck(fin(S.h, 12), fin(S.s, 12), 2 * bar(S.tie).Ab)
  const cl = compressionLap({ db: br.db, fy: S.fy, fc: S.fc, lambda: S.lw ? 0.75 : 1, dbLarge: larger?.db, tiedOK: !S.spiral && ties.ok, spiral: S.spiral })
  useMark('b-splice', S.kind === 'tension' ? { cls: cls.cls, ratio2: S.ratio >= 2 ? 1 : 0 } : { comp: 1 })
  return (
    <div className="space-y-3">
      <Inputs>
        <Seg size="xs" value={S.kind} onChange={(v) => set({ kind: v })} items={[{ v: 'tension', label: 'tension lap' }, { v: 'compression', label: 'compression (column) lap' }]} />
        <BarSel label={S.kind === 'compression' ? 'bar from above' : 'bar'} value={S.bar} onChange={(v) => set({ bar: v })} only="us" />
        <FcSel v={S.fc} set={(v) => set({ fc: v })} />
        <FySel v={S.fy} set={(v) => set({ fy: v })} />
        {S.kind === 'tension' ? (
          <>
            <Tog label="top bar" v={S.top} set={(v) => set({ top: v })} />
            <Tog label="epoxy" v={S.epoxy} set={(v) => set({ epoxy: v })} />
            <Tog label="Table 6.1 first row met" v={S.met} set={(v) => set({ met: v })} />
            <N label="As,prov/As,req at splice" v={S.ratio} set={(v) => set({ ratio: v })} step={0.1} w="w-14" />
            <Sel label="% of bars spliced within lap" value={S.pct} options={[[25, '25 %'], [50, '50 %'], [100, '100 %']]} onChange={(v) => set({ pct: v })} />
          </>
        ) : (
          <>
            <BarSel label="bar from below" value={S.below} onChange={(v) => set({ below: v })} only="us" />
            <Tog label="spiral column" v={S.spiral} set={(v) => set({ spiral: v })} />
            {!S.spiral && (
              <>
                <N label="column h (larger side)" v={S.h} set={(v) => set({ h: v })} step={1} unit="in" />
                <Sel label="ties (2 legs)" value={S.tie} options={[['#3', 'No. 3'], ['#4', 'No. 4']]} onChange={(v) => set({ tie: v })} />
                <N label="tie spacing" v={S.s} set={(v) => set({ s: v })} step={1} unit="in" />
              </>
            )}
          </>
        )}
        <Tog label="lightweight" v={S.lw} set={(v) => set({ lw: v })} />
      </Inputs>
      <div key={key} className="grid cq-lg:grid-cols-2 gap-4">
        {S.kind === 'tension' ? (
          <Checks>
            <Answer id={id('ld')} label="ld (no excess factor)" value={ld.ld} unit="in" compact />
            <Choice id={id('cls')} label="splice class" options={[{ v: 'A', label: 'Class A' }, { v: 'B', label: 'Class B' }]} answer={cls.cls} />
            <Answer id={id('lst')} label="lap length lst" value={lap.final} unit="in" compact />
          </Checks>
        ) : (
          <Checks>
            <Answer id={id('lsc')} label={`lsc of ${br.label} (incl. ⅓ if f′c < 3000)`} value={cl.lsc0} unit="in" compact />
            {larger && <Answer id={id('ldc')} label={`ldc of ${larger.label}`} value={cl.ldcLarge} unit="in" compact />}
            {!S.spiral && <Answer id={id('tie')} label="tie area needed 0.0015hs" value={ties.req} unit="in²" compact />}
            <Answer id={id('fac')} label="reduction factor" value={cl.factor} compact />
            <Answer id={id('fin')} label="lap length" value={cl.final} unit="in" compact />
          </Checks>
        )}
        <div className="rounded-xl bg-bg/60 border border-line p-2">
          <LapSketch lst={S.kind === 'tension' ? lap.final : cl.final} label={S.kind === 'tension' ? `Class ${cls.cls} lap` : 'compression lap'} />
        </div>
      </div>
      <Reveal id={id('sol')} title="Full solution">
        {S.kind === 'tension' ? (
          <div className="space-y-2 text-sm">
            <p>ld by Table 6.1 with all ψ factors (ψt = {psi.psiT}, ψe = {psi.psiE}, λ = {psi.lambda}) but WITHOUT As,req/As,prov:</p>
            <T>{`\\ell_d = ${simpleCoefTex(br.small, S.met)}\\cdot\\frac{${S.fy}\\times ${f(psi.psiTE, 3)}}{${psi.lambda}\\times ${f(ld.sqrtFc)}}\\times ${f(br.db, 3)} = ${f(ld.ld, 1)}\\text{ in}`}</T>
            <p>{cls.why}.</p>
            <T>{`\\ell_{st} = ${lap.k}\\times ${f(ld.ld, 1)} = ${f(lap.lst, 1)}\\text{ in}\\;(\\ge 12) \\Rightarrow \\textbf{${upIn(lap.final)} in}`}</T>
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <T>{`\\ell_{sc} = ${cl.formula} = ${f(cl.base, 2)}\\text{ in}${cl.low ? `\\;\\times\\tfrac43 = ${f(cl.lsc0, 2)}\\text{ in (f'_c < 3000)}` : ''}`}</T>
            {larger && <T>{`\\ell_{dc}(${larger.label}) = \\max\\left(\\frac{f_yd_b}{50\\sqrt{f'_c}},\\,0.0003f_yd_b\\right) = ${f(cl.ldcLarge, 2)}\\text{ in}`}</T>}
            {!S.spiral && (
              <p>
                Tie check: 0.0015 h s = 0.0015 × {f(S.h)} × {f(S.s)} = {f(ties.req, 3)} in² vs 2 × {f(bar(S.tie).Ab)} = {f(ties.prov, 2)} in² → {ties.ok ? '× 0.83 allowed' : `0.83 not allowed (ties would need s ≤ ${f(ties.sMax, 1)} in)`}.
              </p>
            )}
            <T>{`\\text{lap} = \\max(${f(cl.lsc0, 2)}\\times ${cl.factor},\\;12${larger ? `,\\;${f(cl.ldcLarge, 2)}` : ''}) = \\textbf{${f(cl.final, 1)} in}`}</T>
            <p className="text-mute">Different sizes: larger of ldc of the LARGER bar and lsc of the SMALLER bar.</p>
          </div>
        )}
      </Reveal>
    </div>
  )
}

// ================================================================ 5. anchorage in the column
interface FtS {
  bar: string
  fc: number
  fy: number
  top: boolean
  met: boolean
  col: number
  back: number
  side: number
  tail: number
  conf: boolean
  asReq: number
  asProv: number
}
const FT0: FtS = { bar: '#9', fc: 4000, fy: 60000, top: true, met: true, col: 18, back: 2.5, side: 2.5, tail: 2, conf: false, asReq: 1, asProv: 1 }
function randFt(seed: number): FtS {
  const r = rng(seed)
  return { ...FT0, bar: pick(r, ['#7', '#8', '#9', '#10', '20mm', '25mm']), fc: pick(r, [3000, 4000, 5000]), col: randInt(r, 14, 24), back: pick(r, [2, 2, 2.5]), side: pick(r, [2, 2.5, 3]), conf: r() < 0.3, asReq: pick(r, [0.85, 0.9, 1]) }
}
function FitMode({ st: S, set }: { st: FtS; set: (p: Partial<FtS>) => void }) {
  const br = bar(S.bar)
  const excess = Math.min(1, fin(S.asReq, 1) / fin(S.asProv, 1))
  const ld = ldSimplified({ db: br.db, small: br.small, fc: S.fc, fy: S.fy, met: S.met, psiT: S.top ? 1.3 : 1, excess })
  const fa = hookFactors({ no: br.no, sideCover: S.side, tailCover: S.tail, confined: S.conf })
  const h = ldhCalc({ db: br.db, fc: S.fc, fy: S.fy, psiC: fa.psiC, psiR: fa.psiR, excess })
  const g = hookGeometry(br.no, br.db, 90)
  const a = columnAnchorage({ colDepth: fin(S.col, 18), backCover: fin(S.back, 2), ldStraight: ld.final, ldh: h.final })
  useMark('b-hook', { e: 1, c: fa.psiC, r: fa.psiR, no: br.no })
  useMark('b-ld', { row: S.met ? 'met' : 'other', col: br.small ? 'small' : 'large' })
  const key = hashKey(JSON.stringify(S))
  const id = (k: string) => `rc-bond:lab:fit:${key}:${k}`
  const yn = [{ v: 'yes', label: 'fits' }, { v: 'no', label: 'does not fit' }]
  return (
    <div className="space-y-3">
      <Inputs>
        <BarSel value={S.bar} onChange={(v) => set({ bar: v })} />
        <FcSel v={S.fc} set={(v) => set({ fc: v })} />
        <FySel v={S.fy} set={(v) => set({ fy: v })} />
        <Tog label="top bars (ψt = 1.3)" v={S.top} set={(v) => set({ top: v })} />
        <Tog label="Table 6.1 first row" v={S.met} set={(v) => set({ met: v })} />
        <N label="column depth (along beam)" v={S.col} set={(v) => set({ col: v })} step={1} unit="in" />
        <N label="clear cover at back face" v={S.back} set={(v) => set({ back: v })} step={0.5} unit="in" />
        <N label="side cover of hook" v={S.side} set={(v) => set({ side: v })} step={0.25} unit="in" />
        <N label="tail cover" v={S.tail} set={(v) => set({ tail: v })} step={0.25} unit="in" />
        <Tog label="column ties at ≤ 3db" v={S.conf} set={(v) => set({ conf: v })} />
        <N label="As,req" v={S.asReq} set={(v) => set({ asReq: v })} step={0.05} unit="in²" />
        <N label="As,prov" v={S.asProv} set={(v) => set({ asProv: v })} step={0.05} unit="in²" />
      </Inputs>
      <div key={key} className="grid cq-lg:grid-cols-2 gap-4">
        <Checks>
          <Answer id={id('av')} label="available length" value={a.available} unit="in" compact />
          <Answer id={id('ld')} label="straight ld" value={ld.final} unit="in" compact />
          <Choice id={id('sok')} label="straight bar" options={yn} answer={a.straightOK ? 'yes' : 'no'} />
          <Answer id={id('ldh')} label="ldh (90° hook)" value={h.final} unit="in" compact />
          <Choice id={id('hok')} label="hooked bar" options={yn} answer={a.hookOK ? 'yes' : 'no'} />
          <Answer id={id('min')} label="min column depth for the hook" value={a.minColumn} unit="in" compact />
        </Checks>
        <div className="rounded-xl bg-bg/60 border border-line p-2">
          <AnchorSketch colDepth={fin(S.col, 18)} backCover={fin(S.back, 2)} req={a.straightOK ? ld.final : h.final} kind={a.straightOK ? 'straight' : 'hook'} db={br.db} ok={a.straightOK || a.hookOK} tail={g.tail} />
        </div>
      </div>
      <Reveal id={id('sol')} title="Full solution">
        <div className="space-y-2 text-sm">
          <p>Available = column depth − clear cover at the far face = {f(S.col)} − {f(S.back)} = {f(a.available, 2)} in (the column face is the critical section).</p>
          <T>{`\\ell_d = ${simpleCoefTex(br.small, S.met)}\\cdot\\frac{${S.fy}\\times ${S.top ? 1.3 : 1}}{${f(ld.sqrtFc)}}\\times ${f(br.db, 3)}\\times ${f(excess, 3)} = ${f(ld.final, 1)}\\text{ in} ${a.straightOK ? '\\le' : '>'} ${f(a.available, 2)}`}</T>
          <p>{a.straightOK ? 'A straight bar fits.' : 'A straight bar does not fit → use a standard hook.'} Hook factors: {fa.cNote}; {fa.rNote}.</p>
          <T>{`\\ell_{dh} = \\frac{${S.fy}\\times ${fa.psiC}\\times ${fa.psiR}}{50\\times ${f(ld.sqrtFc)}}\\times ${f(br.db, 3)}\\times ${f(excess, 3)} = ${f(h.ld, 2)}\\text{ in};\\ \\ge ${f(h.min, 2)} \\Rightarrow ${f(h.final, 2)}\\text{ in} ${a.hookOK ? '\\le' : '>'} ${f(a.available, 2)}`}</T>
          <p>
            {a.hookOK ? 'The hook fits — place it at the far side of the column.' : `The hook does not fit: needs a column at least ${f(a.minColumn, 1)} in deep, or ties at ≤ 3db (ψr = 0.8), smaller bars, or headed bars.`} Hook details: inside bend diameter {g.Dk}db = {f(g.D, 2)} in, tail 12db = {f(g.tail, 2)} in.
          </p>
        </div>
      </Reveal>
    </div>
  )
}

// ================================================================ 6. cut-off
interface CoS {
  kind: 'ss' | 'cant' | 'cont'
  L: number
  b: number
  h: number
  DL: number
  LL: number
  sw: boolean
  P: number
  cl: number
  cr: number
  fc: number
  fy: number
  bar: string
  n: number
  nCut: number
  met: boolean
  embed: number
}
const CO0: CoS = { kind: 'ss', L: 20, b: 12, h: 20, DL: 1.5, LL: 2.0, sw: true, P: 0, cl: 11, cr: 11, fc: 4000, fy: 60000, bar: '#8', n: 3, nCut: 1, met: true, embed: 6 }
function coDerived(S: CoS) {
  const br = bar(S.bar)
  const h = fin(S.h, 20)
  const d = h - 2.5
  const swt = S.sw ? ((fin(S.b, 12) * h) / 144) * 0.15 : 0
  const w = wuOf(S.DL + swt, S.LL)
  const P = 1.6 * (S.P || 0)
  const L = fin(S.L, 20)
  const dg: Diagram = S.kind === 'ss' ? { kind: 'ss', L, wu: w } : S.kind === 'cant' ? { kind: 'cant', L, wu: w, P } : { kind: 'cont', L, wu: w, cl: fin(S.cl, 11), cr: fin(S.cr, 11) }
  const top = S.kind !== 'ss'
  const psiT = top && d > 12 ? 1.3 : 1
  const ldR = ldSimplified({ db: br.db, small: br.small, fc: S.fc, fy: S.fy, met: S.met, psiT })
  const n = Math.max(2, Math.round(fin(S.n, 3)))
  const nCut = Math.max(0, Math.min(n - 1, Math.round(S.nCut)))
  const r = cutoff({ dg, b: fin(S.b, 12), d, fc: S.fc, fy: S.fy, bar: br, nTotal: n, nCut, ld: ldR.final, endEmbed: S.kind === 'cant' ? 2 : fin(S.embed, 6) })
  return { br, d, swt, w, P, dg, psiT, ldR, r, n, nCut }
}
function randCo(seed: number): CoS {
  const r = rng(seed)
  const kind = pick(r, ['ss', 'cant', 'cant', 'cont'] as const)
  const S: CoS = {
    ...CO0, kind, L: kind === 'ss' ? randInt(r, 18, 26) : kind === 'cant' ? randInt(r, 6, 12) : randInt(r, 20, 28), b: pick(r, [10, 12, 12, 14]), h: randInt(r, 18, 24),
    DL: pick(r, [1, 1.2, 1.5]), LL: pick(r, [0.8, 1, 1.5, 2]), P: kind === 'cant' ? pick(r, [0, 0, 3, 5]) : 0, cl: pick(r, [11, 10]), cr: pick(r, [11, 11, 16]),
    fc: pick(r, [3000, 4000, 4000]), bar: pick(r, ['#7', '#8', '#9']), n: pick(r, [3, 3, 4]), nCut: 1,
  }
  for (let k = 0; k < 20; k++) {
    const x = coDerived(S)
    if (x.r.adequate && x.r.remain.phiMn < x.r.Mmax) break
    if (!x.r.adequate) S.h += 2
    else S.LL += 0.5
  }
  return S
}
function CutoffMode({ st: S, set }: { st: CoS; set: (p: Partial<CoS>) => void }) {
  const { br, d, swt, w, P, dg, psiT, ldR, r, n, nCut } = useMemo(() => coDerived(S), [S])
  useMark('b-cutoff', S.kind === 'cont' ? { L: fin(S.L, 20) } : { kind: S.kind })
  useMark('b-ld', { row: S.met ? 'met' : 'other', col: br.small ? 'small' : 'large' })
  const key = hashKey(JSON.stringify(S))
  const id = (k: string) => `rc-bond:lab:cut:${key}:${k}`
  const sc = standardCutoffs(fin(S.L, 20))
  const what = S.kind === 'ss' ? 'bottom' : 'top'
  return (
    <div className="space-y-3">
      <Inputs>
        <Seg size="xs" value={S.kind} onChange={(v) => set({ kind: v })} items={[{ v: 'ss', label: 'simply supported' }, { v: 'cant', label: 'cantilever' }, { v: 'cont', label: 'continuous (−M at support)' }]} />
        <N label={S.kind === 'ss' ? 'span' : S.kind === 'cant' ? 'length from face' : 'clear span ln'} v={S.L} set={(v) => set({ L: v })} step={1} unit="ft" />
        <N label="b" v={S.b} set={(v) => set({ b: v })} step={1} unit="in" />
        <N label="h (d = h − 2.5)" v={S.h} set={(v) => set({ h: v })} step={1} unit="in" />
        <N label="service DL" v={S.DL} set={(v) => set({ DL: v })} step={0.1} unit="k/ft" />
        <N label="service LL" v={S.LL} set={(v) => set({ LL: v })} step={0.1} unit="k/ft" />
        <Tog label="+ self-weight" v={S.sw} set={(v) => set({ sw: v })} />
        {S.kind === 'cant' && <N label="tip LL point load" v={S.P} set={(v) => set({ P: v })} step={1} unit="k" />}
        {S.kind === 'cont' && (
          <>
            <Sel label="−M left: wu ln²/" value={S.cl} options={[9, 10, 11, 12, 16, 24]} onChange={(v) => set({ cl: v })} />
            <Sel label="−M right: wu ln²/" value={S.cr} options={[9, 10, 11, 12, 16, 24]} onChange={(v) => set({ cr: v })} />
          </>
        )}
        <FcSel v={S.fc} set={(v) => set({ fc: v })} />
        <FySel v={S.fy} set={(v) => set({ fy: v })} />
        <BarSel value={S.bar} onChange={(v) => set({ bar: v })} only="us" />
        <N label={`${what} bars`} v={S.n} set={(v) => set({ n: v })} step={1} w="w-12" />
        <N label="bars cut" v={S.nCut} set={(v) => set({ nCut: v })} step={1} w="w-12" />
        <Tog label="Table 6.1 first row" v={S.met} set={(v) => set({ met: v })} />
        {S.kind === 'ss' && <N label="embed past support face" v={S.embed} set={(v) => set({ embed: v })} step={1} unit="in" />}
      </Inputs>
      {!r.adequate && <Callout kind="trap">φMn with all {n} bars = {f(r.all.phiMn, 1)} k-ft is below Mu,max = {f(r.Mmax, 1)} k-ft: the section is inadequate. Deepen it or add bars.</Callout>}
      {r.remain.phiMn >= r.Mmax && <Callout kind="note">The {n - nCut} continuing bars alone carry Mu,max — the cut bars are not needed by strength anywhere.</Callout>}
      <div key={key} className="space-y-3">
        <div className="rounded-xl bg-bg/60 border border-line p-2">
          <CutoffSketch dg={dg} r={r} nTotal={n} nCut={nCut} ldIn={ldR.final} />
        </div>
        <div className="grid cq-lg:grid-cols-2 gap-4">
          <Checks>
            <Answer id={id('wu')} label="wu" value={w} unit="k/ft" compact />
            <Answer id={id('M')} label="Mu,max" value={r.Mmax} unit="k-ft" compact />
            <Answer id={id('pa')} label={`φMn (${n} bars)`} value={r.all.phiMn} unit="k-ft" compact />
            <Answer id={id('pr')} label={`φMn (${n - nCut} bars)`} value={r.remain.phiMn} unit="k-ft" compact />
            <Answer id={id('xt')} label="theoretical cut-off (from face)" value={r.xTheo} unit="ft" compact />
            <Answer id={id('ext')} label="max(d, 12db)" value={r.ext} unit="in" compact />
            <Answer id={id('ld')} label={`ld of the ${what} bars`} value={ldR.final} unit="in" compact />
            <Answer id={id('xc')} label="actual cut point (from face)" value={r.xCut} unit="ft" compact />
            <Answer id={id('av')} label="length for continuing bars" value={r.availCont} unit="in" compact />
            <Choice id={id('cok')} label="continuing bars develop?" options={[{ v: 'yes', label: 'yes' }, { v: 'no', label: 'no' }]} answer={r.contOK ? 'yes' : 'no'} />
          </Checks>
          <div className="text-sm space-y-1">
            <Md>{`**Where the numbers come from**
- d = ${f(d)} in; ${S.sw ? `self-weight ${f(swt, 3)} k/ft; ` : ''}wu = 1.2D + 1.6L = ${f(w, 3)} k/ft${S.kind === 'cant' && P ? `; Pu = 1.6 × ${f(S.P)} = ${f(P)} k` : ''}.
- ${what === 'top' ? `Top bars, ${f(d)} in of concrete below → ψt = ${psiT}.` : 'Bottom bars → ψt = 1.0.'} ld = ${f(ldR.final, 1)} in (bars fully stressed: no excess factor).
- ${S.kind === 'cont' ? `Standard Fig. 5.20 for comparison: top bars L/3 = ${ftIn(sc.topInterior)} from an interior face (L/4 = ${ftIn(sc.topExterior)} at the exterior end).` : S.kind === 'ss' ? `Fig. 5.20 rule of thumb: half the bottom bars stop L/8 = ${ftIn(sc.bottomCut)} from the faces.` : 'Cut bars also need full anchorage into the column (straight or hooked) — use the anchorage mode.'}`}</Md>
          </div>
        </div>
      </div>
      <Reveal id={id('sol')} title="Full solution">
        <div className="space-y-2 text-sm">
          <b>1. Moments</b>
          {S.kind === 'ss' && <T>{`M_u(x) = \\frac{w_u x(L - x)}{2},\\quad M_{u,max} = \\frac{w_uL^2}{8} = \\frac{${f(w, 3)}\\times ${f(S.L)}^2}{8} = ${f(r.Mmax, 1)}\\text{ k-ft}`}</T>}
          {S.kind === 'cant' && <T>{`M_u(x) = \\frac{w_u(L - x)^2}{2} + P_u(L - x),\\quad M_{u,max} = \\frac{${f(w, 3)}\\times ${f(S.L)}^2}{2} + ${f(P)}\\times ${f(S.L)} = ${f(r.Mmax, 1)}\\text{ k-ft}`}</T>}
          {S.kind === 'cont' && (
            <T>{`M_l = \\frac{w_u l_n^2}{${S.cl}} = ${f(r.Mmax, 1)},\\; M_r = \\frac{w_u l_n^2}{${S.cr}};\\; M_u(x) = M_l - \\left(\\frac{w_ul_n}{2} + \\frac{M_l - M_r}{l_n}\\right)x + \\frac{w_ux^2}{2}\\ (\\text{hogging} +)`}</T>
          )}
          <b>2. Capacity of the bars</b>
          <T>{`a = \\frac{A_sf_y}{0.85f'_cb}:\\quad ${n}\\ \\text{bars: } a = ${f(r.all.a, 2)}\\text{ in},\\ \\varepsilon_t = ${f(r.all.epsT, 4)},\\ \\phi M_n = ${f(r.all.phi, 3)}\\times ${f(r.all.Mn, 1)} = ${f(r.all.phiMn, 1)}\\text{ k-ft}`}</T>
          <T>{`${n - nCut}\\ \\text{bars: } a = ${f(r.remain.a, 2)}\\text{ in},\\ \\phi M_n = ${f(r.remain.phi, 3)}\\times ${f(r.remain.Mn, 1)} = ${f(r.remain.phiMn, 1)}\\text{ k-ft}`}</T>
          <b>3. Theoretical cut-off point</b>
          <p>
            Solve Mu(x) = {f(r.remain.phiMn, 1)} k-ft → x = {f(r.xTheo, 3)} ft from the {S.kind === 'ss' ? 'support' : 'support face'}
            {S.kind === 'ss' ? ` (and symmetrically ${f(fin(S.L, 20) - r.xTheo, 3)} ft)` : ''}.
          </p>
          <b>4. Extension and development</b>
          <p>
            Extension = max(d, 12db) = max({f(d)}, {f(12 * br.db, 2)}) = {f(r.ext, 2)} in → {S.kind === 'ss' ? `cut at ${f(r.xTheo, 3)} − ${f(r.ext / 12, 3)} = ${f(r.xExt, 3)} ft` : `cut at ${f(r.xTheo, 3)} + ${f(r.ext / 12, 3)} = ${f(r.xExt, 3)} ft`}.
          </p>
          <p>
            Cut bars must also extend ld = {f(ldR.final, 1)} in from their point of maximum stress ({S.kind === 'ss' ? 'midspan' : 'the support face'}): available with the extension rule = {f(r.availCut, 1)} in
            {r.ldGoverns ? ` < ld → ld governs; cut at ${f(r.xCut, 3)} ft` : ' ≥ ld OK'}. <b>Cut at {f(r.xCut, 2)} ft ({ftIn(r.xCut)}) from the {S.kind === 'ss' ? 'support' : 'face'}</b>
            {S.kind === 'ss' ? `; cut-bar length = ${f(fin(S.L, 20) - 2 * r.xCut, 2)} ft` : ''}.
          </p>
          <p>
            Continuing bars: {S.kind === 'ss' ? `from the theoretical point to the bar end = ${f(r.xTheo * 12, 1)} + ${f(S.embed)} (into the support)` : S.kind === 'cant' ? `from the theoretical point to the free end (less 2 in cover) = (${f(S.L)} − ${f(r.xTheo, 3)}) × 12 − 2` : `from the theoretical point to the inflection point + max(d, 12db, ln/16) = (${f(r.ip ?? NaN, 3)} − ${f(r.xTheo, 3)}) × 12 + ${f(r.ipExt ?? NaN, 1)}`} = {f(r.availCont, 1)} in {r.contOK ? '≥' : '<'} ld = {f(ldR.final, 1)} in →{' '}
            {r.contOK ? 'OK.' : S.kind === 'cant' ? 'NOT OK: hook the continuing bars at the free end, or use smaller bars.' : 'NOT OK: extend the continuing bars (or use smaller bars).'}
          </p>
          {S.kind === 'ss' && r.ssCheck && (
            <p>
              Positive steel: {n - nCut} of {n} bars ({f(r.fracRemain * 100, 0)} %) run into the support {r.fracOK ? '≥ ⅓ OK' : '< ⅓ — NOT allowed'}. Simple-support check ld ≤ 1.3Mn/Vu + la = 1.3 × {f(r.ssCheck.Mn, 1)} × 12 / {f(r.ssCheck.Vu, 1)} + {f(r.ssCheck.la)} = {f(r.ssCheck.limit, 1)} in{' '}
              {r.ssCheck.ok ? '≥ ld OK' : '< ld — use smaller bars or hook'}.
            </p>
          )}
          {S.kind === 'cont' && <p>Negative steel: {n - nCut} of {n} bars continue ({r.fracOK ? '≥ ⅓ OK' : '< ⅓ — NOT allowed'}) past the inflection point by max(d, 12db, ln/16) = {f(r.ipExt ?? NaN, 1)} in.</p>}
          <p className="text-mute">The cut is in a tension zone: ACI requires Vu ≤ ⅔φVn there, or extra stirrups, or the continuing bars giving twice the required area with Vu ≤ ¾φVn.</p>
        </div>
      </Reveal>
    </div>
  )
}

// ================================================================ wrapper
type Mode = 'ld' | 'hook' | 'ldc' | 'splice' | 'fit' | 'cutoff'
const MODES: { v: Mode; label: string; sub: string }[] = [
  { v: 'ld', label: 'Straight ld', sub: 'Table 6.1 and Eq. 6.4 side by side, with the cross-section and splitting plane.' },
  { v: 'hook', label: 'Hook ldh', sub: 'ψe, ψc, ψr, minimums and the standard hook dimensions.' },
  { v: 'ldc', label: 'Compression ldc', sub: 'Larger of the two expressions, confinement and excess steel.' },
  { v: 'splice', label: 'Lap splice', sub: 'Class A or B in tension; compression lap with mixed sizes and tie check.' },
  { v: 'fit', label: 'Hook in column?', sub: 'Does a straight bar or a hook fit in column depth − cover? Minimum column depth.' },
  { v: 'cutoff', label: 'Cut-off', sub: 'Moment diagram, φMn of the remaining bars, theoretical point, d/12db, ld checks.' },
]

export function BondLab() {
  const [mode, setMode] = useState<Mode>('ld')
  const { seed, next } = useSeed(7)
  const [ld, setLd] = useState(LD0)
  const [hk, setHk] = useState(HK0)
  const [cp, setCp] = useState(CP0)
  const [sp, setSp] = useState(SP0)
  const [ft, setFt] = useState(FT0)
  const [co, setCo] = useState(CO0)
  const roll = () => {
    next()
    const s = seed * 7919 + Math.floor(Math.random() * 100000)
    if (mode === 'ld') setLd(randLd(s))
    if (mode === 'hook') setHk(randHk(s))
    if (mode === 'ldc') setCp(randCp(s))
    if (mode === 'splice') setSp(randSp(s))
    if (mode === 'fit') setFt(randFt(s))
    if (mode === 'cutoff') setCo(randCo(s))
  }
  const m = MODES.find((x) => x.v === mode)!
  return (
    <Section
      title="Bond & detailing calculator"
      sub={m.sub}
      right={
        <button className="btn !py-1 !px-3" onClick={roll} title="random exam-style problem">
          🎲 random
        </button>
      }
    >
      <div className="mb-3 flex flex-wrap gap-1">
        {MODES.map((x) => (
          <button key={x.v} className={'btn !py-1 !px-2.5 !text-xs ' + (mode === x.v ? '!border-accent text-accent' : '')} onClick={() => setMode(x.v)}>
            {x.label}
          </button>
        ))}
      </div>
      {mode === 'ld' && <LdMode st={ld} set={(p) => setLd({ ...ld, ...p })} />}
      {mode === 'hook' && <HookMode st={hk} set={(p) => setHk({ ...hk, ...p })} />}
      {mode === 'ldc' && <LdcMode st={cp} set={(p) => setCp({ ...cp, ...p })} />}
      {mode === 'splice' && <SpliceMode st={sp} set={(p) => setSp({ ...sp, ...p })} />}
      {mode === 'fit' && <FitMode st={ft} set={(p) => setFt({ ...ft, ...p })} />}
      {mode === 'cutoff' && <CutoffMode st={co} set={(p) => setCo({ ...co, ...p })} />}
    </Section>
  )
}

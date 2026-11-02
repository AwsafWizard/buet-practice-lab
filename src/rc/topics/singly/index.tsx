// CE 315 — Singly reinforced rectangular beams by USD: review (φMn), design As, design b × d, ρ limits, φ–εt.

import { useState } from 'react'
import { fmt } from '../../../components/DiagramView'
import { Answer, Callout, Choice, Md, Reveal, Section, Seg, Step, Steps, Tex } from '../../../components/ui'
import { hashKey } from '../../../labs/CheckTable'
import { pick, randInt, rng, Slider } from '../../../labs/common'
import { RcFrequency } from '../../components/Frequency'
import { BARS, phiFlex } from '../../engine/materials'
import { barOptions, beamLoads, designAs, designSection, limits, pickBars, review, rhoForEpsT, SUPPORT_LABEL, ZONE_LABEL, type SteelLayer, type Support } from '../../engine/singly'
import type { RcQ, RcTheoryItem, RcTopicModule } from '../../types'
import { BAR_OPTS, Checks, COUNT_OPTS, FC_OPTS, FY_OPTS, Num, Prompt, Sel, useMark } from '../elastic/inputs'
import { SectionSketch, SolSteps } from '../elastic/ui'
import { PhiChart, StrainLimits } from './charts'
import { makeSinglyDesign, S_FAMILIES } from './design'
import { DesignProblems } from './DesignProblems'
import { PickSection } from '../../components/PickDrill'
import { SINGLY_PICKS } from './picks'

const T = 'rc-singly'

// ---------------------------------------------------------------- review
interface RP {
  b: number
  h: number
  fc: number
  fy: number
  n1: number
  bar1: number
  n2: number // 0 = one row
  bar2: number
  dt: number
  gap: number
}

export function rpLayers(p: RP): SteelLayer[] {
  const L: SteelLayer[] = [{ As: p.n1 * BARS[p.bar1].A, d: p.dt }]
  if (p.n2 > 0) L.push({ As: p.n2 * BARS[p.bar2].A, d: p.dt - p.gap })
  return L
}

const RDEF: RP = { b: 14, h: 28, fc: 5, fy: 60, n1: 4, bar1: 9, n2: 4, bar2: 9, dt: 25.5, gap: 3 }

function randomRP(seed: number): RP {
  const r = rng(seed)
  const fc = pick(r, [3, 4, 4, 5, 6])
  const b = pick(r, [10, 12, 12, 14, 16])
  const h = randInt(r, 18, 30)
  const bar = pick(r, [7, 8, 9, 10])
  const two = r() < 0.45
  const dt = h - 2.5
  const d = two ? dt - 1.5 : dt
  const L = limits(fc * 1000, 60000)
  const rho = L.rhoMax * pick(r, [0.45, 0.6, 0.75, 0.88, 0.95, 1.0])
  const n = Math.max(2, Math.round((rho * b * d) / BARS[bar].A))
  if (two) {
    const n1 = Math.ceil(n / 2)
    return { b, h, fc, fy: 60, n1, bar1: bar, n2: Math.max(1, n - n1), bar2: bar, dt, gap: 3 }
  }
  return { b, h, fc, fy: 60, n1: Math.min(n, 6), bar1: bar, n2: 0, bar2: bar, dt, gap: 3 }
}

function ReviewLab() {
  const [p, setP] = useState<RP>(RDEF)
  const [random, setRandom] = useState(false)
  const set = (o: Partial<RP>) => setP({ ...p, ...o })
  const layers = rpLayers(p)
  const r = review({ b: p.b, fc: p.fc * 1000, fy: p.fy * 1000, layers })
  const key = hashKey(JSON.stringify(p))
  const id = (k: string) => `${T}:lab:rv:${key}:${k}`
  useMark('m-phi', { epsT: r.epsT, row: r.zone === 'tension' ? 0 : r.zone === 'transition' ? 3 : 1 })
  useMark('f-rho', { fc: p.fc * 1000, fy: p.fy * 1000 })
  useMark('f-block', { b1: r.b1 })
  useMark('m-bars', { bar: p.bar1 })
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <button
          className="btn"
          onClick={() => {
            setP(randomRP(Math.floor(Math.random() * 1e9)))
            setRandom(true)
          }}
        >
          🎲 Exam-style review
        </button>
        {random && (
          <button className="text-sm text-accent underline" onClick={() => setRandom(false)}>
            edit the inputs
          </button>
        )}
      </div>
      {random ? (
        <Prompt>
          A rectangular beam b = {p.b} in, h = {p.h} in is reinforced with {p.n2 ? `${p.n1 + p.n2} No. ${p.bar1} bars in two rows (d = ${fmt(r.d, 2)} in, d_t = ${fmt(r.dt, 2)} in)` : `${p.n1} No. ${p.bar1} bars in one row (d = ${fmt(r.d, 2)} in)`}. f′c = {p.fc} ksi, fy = {p.fy} ksi. Determine the nominal flexural strength M_n and the maximum moment φM_n that can be used in design according to the ACI code. Is the beam tension-controlled? Check the ACI limits.
        </Prompt>
      ) : (
        <div className="grid grid-cols-2 cq-md:grid-cols-5 gap-2">
          <Num label="b" unit="in" value={p.b} onChange={(b) => set({ b })} />
          <Num label="h" unit="in" value={p.h} onChange={(h) => set({ h, dt: h - 2.5 })} />
          <Num label="d_t (lowest row)" unit="in" step={0.5} value={p.dt} onChange={(dt) => set({ dt })} />
          <Sel label="f′c" value={p.fc} options={FC_OPTS} onChange={(fc) => set({ fc })} />
          <Sel label="fy" value={p.fy} options={FY_OPTS} onChange={(fy) => set({ fy })} />
          <Sel label="Row 1 bars" value={p.n1} options={COUNT_OPTS} onChange={(n1) => set({ n1 })} />
          <Sel label="size" value={p.bar1} options={BAR_OPTS} onChange={(bar1) => set({ bar1, bar2: bar1 })} />
          <Sel label="Row 2 bars" value={p.n2} options={[{ v: 0, label: 'none' }, ...COUNT_OPTS]} onChange={(n2) => set({ n2 })} />
          {p.n2 > 0 && <Sel label="size" value={p.bar2} options={BAR_OPTS} onChange={(bar2) => set({ bar2 })} />}
          {p.n2 > 0 && <Num label="row spacing (c/c)" unit="in" step={0.5} value={p.gap} onChange={(gap) => set({ gap })} />}
        </div>
      )}
      <div className="grid cq-lg:grid-cols-2 gap-4">
        <Checks key={key}>
          <Answer id={id('a')} label="a" value={r.a} unit="in" compact />
          <Answer id={id('c')} label="c" value={r.c} unit="in" compact />
          <Answer id={id('et')} label="ε_t" value={r.epsT} compact />
          <Choice id={id('z')} label="Section is" options={[{ v: 'tension', label: 'Tension-ctrl' }, { v: 'transition', label: 'Transition' }, { v: 'compression', label: 'Compression-ctrl' }]} answer={r.zone} />
          <Answer id={id('phi')} label="φ" value={r.phi} compact tol={0.005} />
          <Answer id={id('mn')} label="M_n" value={r.Mn} unit="k-ft" compact />
          <Answer id={id('pmn')} label="φM_n" value={r.phiMn} unit="k-ft" compact />
          <Choice id={id('ok')} label="ε_t ≥ 0.004 and A_s ≥ A_s,min?" options={[{ v: 'y', label: 'Both OK' }, { v: 'n', label: 'Fails a limit' }]} answer={r.maxOk && r.minOk ? 'y' : 'n'} />
        </Checks>
        <div className="space-y-2">
          <div className="rounded-xl bg-bg/60 border border-line p-2 grid cq-md:grid-cols-[1fr_1.6fr] gap-2 items-center">
            <SectionSketch b={p.b} h={p.h} rows={layers.map((l, i) => ({ d: l.d, n: i ? p.n2 : p.n1, db: BARS[i ? p.bar2 : p.bar1].d }))} na={r.c} cracked tag={`c = ${fmt(r.c, 2)}″`} height={170} />
            <PhiChart epsT={r.epsT} fy={p.fy * 1000} />
          </div>
          <div className="text-xs text-mute">
            ρ = {fmt(r.rho, 4)} vs ρ_0.005 = {fmt(r.lim.rho005, 4)}, ρ_max = {fmt(r.lim.rhoMax, 4)}, ρ_b = {fmt(r.lim.rhoB, 4)} · steel {r.yields ? 'yields' : 'does NOT yield (over-reinforced)'} · {ZONE_LABEL[r.zone]}
          </div>
        </div>
      </div>
      <Reveal id={`${T}:lab:rv:sol`} title="Full solution">
        <SolSteps steps={r.steps} />
      </Reveal>
    </div>
  )
}

// ---------------------------------------------------------------- design
interface DP {
  mode: 'fixed' | 'rho'
  span: number
  support: Support
  b: number
  h: number
  sdl: number
  ll: number
  P: number // midspan / tip point load (dead, service unless factored)
  factored: boolean
  sw: boolean
  fc: number
  fy: number
  layers: 1 | 2
  rhoK: number // fraction of ρmax (0 = ρ0.005)
}
const DDEF: DP = { mode: 'fixed', span: 25, support: 'ss', b: 12, h: 25, sdl: 1, ll: 2, P: 0, factored: false, sw: true, fc: 4, fy: 60, layers: 1, rhoK: 0 }

function randomDP(seed: number, mode: DP['mode']): DP {
  const r = rng(seed)
  if (mode === 'fixed') {
    const [b, h] = pick(r, [[12, 24], [12, 25], [14, 26], [14, 28], [12, 30]] as [number, number][])
    return { ...DDEF, mode, span: randInt(r, 18, 26), support: pick(r, ['ss', 'ss', 'ss', 'cant', 'fixed'] as Support[]), b, h, sdl: pick(r, [1, 1.2, 1.5]), ll: pick(r, [1.5, 2, 2.5]), P: 0, fc: pick(r, [3, 4, 4, 5]), layers: 1 }
  }
  return { ...DDEF, mode, span: pick(r, [24, 30, 32, 36]), support: 'ss', b: 12, h: 30, sdl: pick(r, [2, 2.4, 2.5]), ll: pick(r, [1.2, 1.5, 1.6]), P: pick(r, [0, 30, 40, 50]), factored: true, sw: false, fc: pick(r, [3, 3.5, 4]), rhoK: pick(r, [0.5, 0.6, 0.7]) }
}

function DesignLab() {
  const [p, setP] = useState<DP>(DDEF)
  const [random, setRandom] = useState(false)
  const set = (o: Partial<DP>) => setP({ ...p, ...o })
  const fc = p.fc * 1000,
    fy = p.fy * 1000
  const pointX = p.support === 'cant' ? p.span : p.span / 2
  const loads = beamLoads({ span: p.span, support: p.support, b: p.sw ? p.b : undefined, h: p.sw ? p.h : undefined, sdl: p.sdl, ll: p.ll, points: p.P ? [{ D: p.P, L: 0, x: pointX }] : [], factored: p.factored })
  const L = limits(fc, fy)
  const key = hashKey(JSON.stringify(p))
  const id = (k: string) => `${T}:lab:ds:${key}:${k}`
  const cov = p.layers === 2 ? 3.5 : 2.5
  // fixed section
  const d = p.h - cov
  const dt = p.layers === 2 ? d + 1 : d
  const des = designAs(loads.Mu, p.b, d, fc, fy, dt)
  // chosen ρ
  const rho = p.rhoK ? p.rhoK * L.rhoMax : L.rho005
  const sec = designSection(loads.Mu, fc, fy, rho, { b: p.b, layers: p.layers })
  const AsReq = p.mode === 'fixed' ? des.As : sec.As
  const bars = Number.isFinite(AsReq) ? pickBars(AsReq, p.b) : undefined
  const opts = Number.isFinite(AsReq) ? barOptions(AsReq, p.b) : []
  const dChk = p.mode === 'fixed' ? d : sec.dAct
  const chk = bars ? review({ b: p.b, fc, fy, layers: bars.layers === 2 ? [{ As: bars.As / 2, d: dChk + 1.5 }, { As: bars.As / 2, d: dChk - 1.5 }] : [{ As: bars.As, d: dChk }] }) : undefined
  useMark('m-loads', { old: p.factored ? 'factored' : 0 })
  useMark('f-rho', { fc, fy })
  useMark('m-cover', { beam: 1 })
  useMark('m-bars', { bar: bars ? String(bars.bar) : '' })
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <Seg value={p.mode} onChange={(mode) => set({ mode, ...(mode === 'rho' ? { rhoK: p.rhoK || 0.6 } : {}) })} items={[{ v: 'fixed', label: 'Section fixed → A_s' }, { v: 'rho', label: 'Choose ρ → b × d, A_s' }]} />
        <button
          className="btn"
          onClick={() => {
            setP(randomDP(Math.floor(Math.random() * 1e9), p.mode))
            setRandom(true)
          }}
        >
          🎲 Exam-style design
        </button>
        {random && (
          <button className="text-sm text-accent underline" onClick={() => setRandom(false)}>
            edit the inputs
          </button>
        )}
      </div>
      {random ? (
        <Prompt>
          {p.mode === 'fixed' ? (
            <>
              A {SUPPORT_LABEL[p.support]} beam of span {p.span} ft carries a service live load of {p.ll} kip/ft and a superimposed dead load of {p.sdl} kip/ft in addition to its self-weight. For architectural reasons the section is limited to {p.b} in × {p.h} in. f′c = {p.fc} ksi, fy = {p.fy} ksi. Design the beam for flexure by USD and check the minimum and maximum reinforcement.
            </>
          ) : (
            <>
              Design a singly reinforced simply supported beam of span {p.span} ft for a uniform load DL = {p.sdl} k/ft, LL = {p.ll} k/ft{p.P ? ` and a ${p.P} kip point load at midspan` : ''}. All loads are factored; DL includes self-weight. f′c = {p.fc * 1000} psi, fy = {p.fy * 1000} psi, b = {p.b} in, ρ = {p.rhoK} ρ_max. Find d, h and A_s and select bars.
            </>
          )}
        </Prompt>
      ) : (
        <div className="grid grid-cols-2 cq-md:grid-cols-5 gap-2">
          <Num label="Span" unit="ft" value={p.span} onChange={(span) => set({ span })} />
          <Sel label="Support" value={p.support} options={(['ss', 'cant', 'fixed'] as Support[]).map((v) => ({ v, label: SUPPORT_LABEL[v] }))} onChange={(support) => set({ support })} />
          <Num label="b" unit="in" value={p.b} onChange={(b) => set({ b })} />
          {p.mode === 'fixed' && <Num label="h" unit="in" value={p.h} onChange={(h) => set({ h })} />}
          <Sel label="Bar rows" value={p.layers} options={[{ v: 1, label: 'one (d = h − 2.5)' }, { v: 2, label: 'two (d = h − 3.5)' }]} onChange={(layers) => set({ layers })} />
          <Num label="SDL (excl. self-wt)" unit="k/ft" step={0.1} value={p.sdl} onChange={(sdl) => set({ sdl })} />
          <Num label="LL" unit="k/ft" step={0.1} value={p.ll} onChange={(ll) => set({ ll })} />
          <Num label={p.support === 'cant' ? 'Tip load P (dead)' : 'Midspan P (dead)'} unit="k" value={p.P} onChange={(P) => set({ P })} />
          <Sel label="Loads are" value={p.factored ? 1 : 0} options={[{ v: 0, label: 'service (1.2D + 1.6L)' }, { v: 1, label: 'already factored' }]} onChange={(v) => set({ factored: !!v })} />
          <Sel label="Self-weight" value={p.sw ? 1 : 0} options={[{ v: 1, label: 'add from b × h' }, { v: 0, label: 'included in DL' }]} onChange={(v) => set({ sw: !!v })} />
          <Sel label="f′c" value={p.fc} options={FC_OPTS} onChange={(fc) => set({ fc })} />
          <Sel label="fy" value={p.fy} options={FY_OPTS} onChange={(fy) => set({ fy })} />
          {p.mode === 'rho' && <Sel label="ρ" value={p.rhoK} options={[{ v: 0, label: 'ρ_0.005' }, ...[0.5, 0.6, 0.7, 0.75, 0.9].map((v) => ({ v, label: `${v} ρ_max` }))]} onChange={(rhoK) => set({ rhoK })} />}
        </div>
      )}
      <div className="grid cq-lg:grid-cols-2 gap-4">
        <Checks key={key}>
          {loads.sw > 0 && <Answer id={id('sw')} label="self-weight" value={loads.sw} unit="k/ft" compact />}
          <Answer id={id('wu')} label="w_u" value={loads.wu} unit="k/ft" compact />
          <Answer id={id('mu')} label={p.support === 'fixed' ? 'M_u (max of ±)' : 'M_u'} value={loads.Mu} unit="k-ft" compact />
          {p.mode === 'fixed' ? (
            <>
              <Answer id={id('rn')} label="R_n" value={des.Rn} unit="psi" compact />
              {Number.isFinite(des.rho) && <Answer id={id('rho')} label="ρ required" value={des.rho} compact />}
              <Choice id={id('cs')} label="Singly enough?" options={[{ v: 'y', label: 'Yes' }, { v: 'n', label: 'No — needs A′s' }]} answer={des.needsComp ? 'n' : 'y'} />
              {!des.needsComp && <Answer id={id('as')} label="A_s required" value={des.As} unit="in²" compact />}
            </>
          ) : (
            <>
              <Answer id={id('rho2')} label="ρ" value={rho} compact />
              <Answer id={id('R')} label="R = ρfy(1 − 0.59ρfy/f′c)" value={sec.Rn} unit="ksi" compact />
              <Answer id={id('d')} label="d required" value={sec.d} unit="in" compact />
              <Answer id={id('as2')} label="A_s = ρbd" value={sec.As} unit="in²" compact />
            </>
          )}
          {chk && !(p.mode === 'fixed' && des.needsComp) && <Answer id={id('pmn')} label={`φM_n with ${bars!.n} #${bars!.bar}`} value={chk.phiMn} unit="k-ft" compact />}
        </Checks>
        <div className="space-y-2">
          {bars && !(p.mode === 'fixed' && des.needsComp) && (
            <div className="rounded-xl bg-bg/60 border border-line p-2">
              <SectionSketch
                b={p.b}
                h={p.mode === 'fixed' ? p.h : sec.h}
                flipTension={p.support === 'cant'}
                rows={bars.layers === 2 ? [{ d: dChk + 1.5, n: Math.ceil(bars.n / 2), db: bars.db }, { d: dChk - 1.5, n: Math.floor(bars.n / 2), db: bars.db }] : [{ d: dChk, n: bars.n, db: bars.db }]}
                tag={`${bars.n} #${bars.bar} = ${fmt(bars.As, 2)} in²`}
                height={170}
              />
            </div>
          )}
          {opts.length > 0 && (
            <table className="tbl w-auto text-xs">
              <thead>
                <tr>
                  <th>Bars</th>
                  <th>A_s</th>
                  <th>b_min (1 row)</th>
                  <th>Fits</th>
                </tr>
              </thead>
              <tbody>
                {opts.map((o) => (
                  <tr key={String(o.bar)} className={bars && o.bar === bars.bar ? 'hl' : undefined}>
                    <td>
                      {o.n} #{o.bar}
                    </td>
                    <td>{fmt(o.As, 2)}</td>
                    <td>{fmt(o.bmin, 2)}</td>
                    <td className="txt">{o.layers === 1 ? 'one row' : o.layers === 2 ? 'two rows' : 'no'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {chk && <PhiChart epsT={chk.epsT} fy={fy} label="chosen bars" />}
        </div>
      </div>
      <Reveal id={`${T}:lab:ds:sol`} title="Full solution">
        <div className="space-y-3">
          <div className="font-semibold text-sm">Loads</div>
          <SolSteps steps={loads.steps} />
          <div className="font-semibold text-sm">{p.mode === 'fixed' ? `Steel for d = h − ${cov} = ${fmt(d)} in` : 'Section and steel'}</div>
          <SolSteps steps={p.mode === 'fixed' ? des.steps : sec.steps} />
          {p.mode === 'fixed' && !des.needsComp && (
            <div className="text-xs text-mute">
              Handnote iteration on a (start a = 0.2d): {des.iter.map((it) => `a = ${fmt(it.a, 2)} → A_s = ${fmt(it.As, 3)}`).join(' → ')}
            </div>
          )}
          {p.mode === 'rho' && (
            <>
              <div className="font-semibold text-sm">Refine A_s for the actual d = {fmt(sec.dAct)} in</div>
              <SolSteps steps={designAs(loads.Mu, p.b, sec.dAct, fc, fy).steps} />
            </>
          )}
          {chk && bars && (
            <>
              <div className="font-semibold text-sm">
                Check with {bars.n} #{bars.bar} ({bars.layers === 2 ? 'two rows' : 'one row'}, b_min = {fmt(bars.bmin, 2)} in for one row)
              </div>
              <SolSteps steps={chk.steps} />
              <p className="text-sm">
                φM_n = {fmt(chk.phiMn, 1)} k-ft {chk.phiMn >= loads.Mu ? '≥' : '<'} M_u = {fmt(loads.Mu, 1)} k-ft {chk.phiMn >= loads.Mu ? '✓' : '✗ — choose more steel'}
              </p>
            </>
          )}
        </div>
      </Reveal>
    </div>
  )
}

// ---------------------------------------------------------------- ρ limits
function LimitsLab() {
  const [fc, setFc] = useState(4)
  const [fy, setFy] = useState(60)
  const [et, setEt] = useState(0.0045)
  const L = limits(fc * 1000, fy * 1000)
  const key = `${fc}-${fy}`
  const id = (k: string) => `${T}:lab:lim:${key}:${k}`
  useMark('f-rho', { fc: fc * 1000, fy: fy * 1000 })
  const rhoE = rhoForEpsT(fc * 1000, fy * 1000, et)
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-end">
        <Sel label="f′c" value={fc} options={[...FC_OPTS, { v: 7, label: '7 ksi' }, { v: 7.5, label: '7.5 ksi' }]} onChange={setFc} />
        <Sel label="fy" value={fy} options={FY_OPTS} onChange={setFy} />
        <button
          className="btn"
          onClick={() => {
            const r = rng(Math.floor(Math.random() * 1e9))
            setFc(pick(r, [3, 3.5, 4, 5, 6, 7]))
            setFy(pick(r, [40, 60, 60, 60, 72.5]))
          }}
        >
          🎲 New f′c / fy
        </button>
      </div>
      <div className="grid cq-lg:grid-cols-2 gap-4">
        <Checks key={key}>
          <Answer id={id('b1')} label="β₁" value={L.b1} compact tol={0.002} />
          <Answer id={id('rb')} label="ρ_b" value={L.rhoB} compact />
          <Answer id={id('rmax')} label="ρ_max = ρ_0.004" value={L.rhoMax} compact />
          <Answer id={id('r5')} label="ρ_0.005" value={L.rho005} compact />
          <Answer id={id('rmin')} label="ρ_min" value={L.rhoMin} compact />
        </Checks>
        <div className="space-y-2">
          <Slider label="ε_t" value={et} min={0.001} max={0.008} step={0.0001} onChange={setEt} />
          <div className="text-sm num">
            ρ(ε_t) = {fmt(rhoE, 5)} · φ = {fmt(phiFlex(et, fy * 1000), 3)} · {ZONE_LABEL[et >= 0.005 ? 'tension' : et > (fy * 1000) / 29e6 ? 'transition' : 'compression']}
          </div>
          <PhiChart epsT={et} fy={fy * 1000} label="ε_t" />
        </div>
      </div>
      <Reveal title="Solution">
        <SolSteps steps={L.steps} />
      </Reveal>
    </div>
  )
}

// ---------------------------------------------------------------- pages
function Overview() {
  return (
    <div>
      <Section title="What this topic is" right={<div className="w-72 hidden cq-md:block"><RcFrequency topic={T} /></div>}>
        <Md>{`Strength (USD) analysis and design of a rectangular beam with tension steel only. The Whitney block $0.85f'_c \\times a$ balances $A_sf_y$; the net tensile strain $\\varepsilon_t$ at the extreme bar decides φ; $\\rho_{min}$ and $\\rho_{max}$ (εt ≥ 0.004) bound the steel.

**How it is asked** (≈ 30–40 marks a paper with theory):
- **Review** φMn of a given section, often two rows (d and dt given) landing in the **transition zone** (2020-21 Q4(b), 2017-18 Q4(a), 2015-16 Q4(b), 2012-13 Q3(c)); part (iv) of the elastic template: Mn and strains at failure.
- **ρb, ρ0.004, ρ0.005, ρmin** for f′c = 4, fy = 60 (2023-24 Q2(b) = 2020-21 Q2(b)).
- **Design a fixed architectural section** under service SDL + LL + self-weight on a 22–25 ft span (2023-24 Q3(a), 2021-22 Q8(b), 2020-21 Q4(a)).
- **Design with b = 12 in and ρ = 0.6ρmax** for factored loads (find d, h, As) (2021-22 Q4(a), 2020-21 Q6(a), 2017-18 Q6(a)).
- Theory: ρmin purpose, ρmax ↔ εt = 0.004 and φ–εt, under/over-reinforced, tension vs compression controlled.`}</Md>
      </Section>
      <Section title="Formulas in brief">
        <div className="grid cq-md:grid-cols-2 gap-4">
          <div>
            <Tex block>{`a = \\frac{A_sf_y}{0.85f'_cb},\\ c = \\frac{a}{\\beta_1},\\ \\varepsilon_t = 0.003\\frac{d_t - c}{c}`}</Tex>
            <Tex block>{`M_n = A_sf_y\\left(d - \\tfrac a2\\right),\\quad \\phi = 0.483 + 83.3\\varepsilon_t\\ (\\text{transition})`}</Tex>
            <Tex block>{`\\rho = 0.85\\beta_1\\frac{f'_c}{f_y}\\frac{0.003}{0.003 + \\varepsilon_t}`}</Tex>
          </div>
          <div>
            <Tex block>{`R_n = \\frac{M_u}{\\phi bd^2},\\ \\rho = \\frac{0.85f'_c}{f_y}\\left(1 - \\sqrt{1 - \\frac{2R_n}{0.85f'_c}}\\right)`}</Tex>
            <Tex block>{`bd^2 = \\frac{M_u}{\\phi\\rho f_y(1 - 0.59\\rho f_y/f'_c)}`}</Tex>
            <Tex block>{`A_{s,min} = \\frac{\\max(3\\sqrt{f'_c}, 200)}{f_y}b_wd`}</Tex>
          </div>
        </div>
      </Section>
    </div>
  )
}

function Approach() {
  const ex45 = review({ b: 12, fc: 4000, fy: 60000, layers: [{ As: 4, d: 17.5 }] })
  const L46 = beamLoads({ span: 15, support: 'ss', sdl: 1.27, ll: 2.15 })
  const s46 = designSection(L46.Mu, 4000, 60000, limits(4000, 60000).rho005, { b: 10 })
  const d46 = designAs(L46.Mu, 10, 15.5, 4000, 60000)
  return (
    <div>
      <Section title="Recipe — review (find φMn)">
        <Steps>
          <Step n={1} title="Steel and depths">A_s, d = centroid of the bars, d_t = depth of the lowest row, ρ = A_s/bd.</Step>
          <Step n={2} title="Assume the steel yields">a = A_s f_y/(0.85 f′c b), c = a/β₁.</Step>
          <Step n={3} title="Strain check">ε_t = 0.003(d_t − c)/c. ε_t ≥ 0.005 → φ = 0.9; between ε_y and 0.005 → φ = 0.483 + 83.3ε_t; ≤ ε_y → 0.65 and the steel did not yield (solve the quadratic for c).</Step>
          <Step n={4} title="Moment">M_n = A_s f_y (d − a/2); φM_n. Divide in-k by 12 for k-ft.</Step>
          <Step n={5} title="Code limits">A_s ≥ A_s,min; ε_t ≥ 0.004 (ρ ≤ ρ_max).</Step>
        </Steps>
      </Section>
      <Section title="Recipe — design">
        <Steps>
          <Step n={1} title="Loads">Self-weight = b h/144 × 0.150 k/ft; w_u = 1.2D + 1.6L (≥ 1.4D); M_u = w_uL²/8 (SS), w_uL²/2 (cantilever), w_uL²/12 and /24 (fixed).</Step>
          <Step n={2} title="Section fixed">d = h − 2.5 (one row) → R_n = M_u/φbd² with φ = 0.9 → ρ → A_s = ρbd. If 2R_n {'>'} 0.85f′c or ρ {'>'} ρ_max → doubly.</Step>
          <Step n={3} title="Section free">Pick ρ (ρ_0.005 for the smallest section, ≈ 0.5–0.6ρ_max for economy) → bd² → b, d → h = d + 2.5 rounded up → redo A_s with the actual d.</Step>
          <Step n={4} title="Bars">Choose bars ≥ A_s; check they fit in b (cover 1.5, #3 stirrup, clear ≥ max(1 in, d_b)); else two rows (d = h − 3.5).</Step>
          <Step n={5} title="Check">Recompute a, c, ε_t with the bars provided; φM_n ≥ M_u; A_s ≥ A_s,min.</Step>
        </Steps>
      </Section>
      <Section title="Which case am I in?">
        <div className="grid cq-md:grid-cols-[1.2fr_1fr] gap-4 items-center">
          <PhiChart />
          <div className="space-y-2 text-sm">
            <div className="rounded-lg border border-line p-2">
              <b className="text-good">ε_t ≥ 0.005</b> (c/d_t ≤ 0.375, ρ ≤ ρ_0.005): tension-controlled, φ = 0.90.
            </div>
            <div className="rounded-lg border border-line p-2">
              <b className="text-load">0.004 ≤ ε_t {'<'} 0.005</b> (ρ_0.005 {'<'} ρ ≤ ρ_max): transition, φ = 0.483 + 83.3ε_t — allowed for beams.
            </div>
            <div className="rounded-lg border border-line p-2">
              <b className="text-bad">ε_t {'<'} 0.004</b> (ρ {'>'} ρ_max): not allowed for a beam → add compression steel. Below ε_y the steel does not even yield.
            </div>
            <StrainLimits />
          </div>
        </div>
      </Section>
      <Section title="Common traps">
        <Callout kind="trap">Using d (centroid) for ε_t with two rows. ε_t is at d_t, the lowest row; M_n uses d.</Callout>
        <Callout kind="trap">Forgetting the self-weight, or adding it twice when the figure says "DL includes self-weight" / "all loads factored".</Callout>
        <Callout kind="trap">β₁ = 0.85 for f′c above 4 ksi — it drops 0.05 per ksi (0.80 at 5, 0.75 at 6).</Callout>
        <Callout kind="trap">Stopping at the required A_s. Choose real bars, check the fit, and recheck φM_n with the provided steel.</Callout>
        <Callout kind="trap">ρ_max is at ε_t = 0.004 (ACI 318-08 on), not 0.75ρ_b as in old papers (0.75ρ_b ≈ 0.0214 for 4/60). Say which you use for a pre-2008 paper.</Callout>
      </Section>
      <Section title="Nilson Ex 4.5 — review in the transition zone" sub="b = 12 in, d = 17.5 in, 4 #9, f′c = 4 ksi, fy = 60 ksi">
        <SolSteps steps={ex45.steps} />
        <div className="text-sm text-mute mt-1">Book: a = 5.88, c = 6.92, ε_t = 0.00458, φ = 0.87, φM_n = 3040 in-k (the engine keeps φ unrounded).</div>
      </Section>
      <Section title="Nilson Ex 4.6 — design b, d and A_s" sub="SS 15 ft, DL 1.27 k/ft (incl. self-weight), LL 2.15 k/ft, ρ = ρ_0.005, b = 10 in">
        <SolSteps steps={[...L46.steps, ...s46.steps]} />
        <div className="font-semibold text-sm mt-3">With b = 10, h = 18 (d = 15.5 in):</div>
        <SolSteps steps={d46.steps} start={L46.steps.length + s46.steps.length + 1} />
        <div className="text-sm text-mute mt-1">Book: bd² = 2040 in³, d = 14.3 in, A_s = 2.59 in² (2 #10); with h = 18, A_s ≈ 2.31 in² by iteration.</div>
      </Section>
    </div>
  )
}

function Lab() {
  const [mode, setMode] = useState<'review' | 'design' | 'limits'>('review')
  return (
    <div>
      <PickSection topic="rc-singly" skills={SINGLY_PICKS} />
      <Section title="Design problems" sub="Paper-style design from the beam and its loads: self-weight, w_u, M_u, d, A_s, bars, ε_t check. 🎲 for a new one; full solution at the bottom.">
        <DesignProblems topic={T} families={S_FAMILIES} make={makeSinglyDesign} />
      </Section>
      <Section title="Singly reinforced beam lab" sub="Review a section, design for M_u, or drill the ρ limits. φ–ε_t chart shows where your beam sits.">
        <div className="mb-3">
          <Seg value={mode} onChange={setMode} items={[{ v: 'review', label: 'Review φM_n' }, { v: 'design', label: 'Design' }, { v: 'limits', label: 'ρ limits & φ' }]} />
        </div>
        {mode === 'review' && <ReviewLab />}
        {mode === 'design' && <DesignLab />}
        {mode === 'limits' && <LimitsLab />}
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------- theory
const PhiFig = () => (
  <div className="space-y-2">
    <PhiChart />
    <StrainLimits />
  </div>
)

const theory: RcTheoryItem[] = [
  {
    id: 'ts-min',
    topic: T,
    q: 'What is the purpose of providing a minimum amount of flexural steel in beams? Give the ACI/BNBC provisions for the minimum reinforcement (rectangular and T-beams).',
    seen: ['2017-18', '2016-17', '2015-16', '2014-15', '2012-13', '2010-11', '2008-09', '2007-08', '2006-07'],
    a: `**Purpose.** If a beam has very little steel, its strength as a reinforced section ($M_n$) can be less than the cracking moment of the plain concrete section ($M_{cr}$). When the beam cracks, the concrete's tension is suddenly transferred to the steel, which cannot carry it: the steel yields and may even fracture at once — a **sudden, brittle failure without warning**. A minimum steel makes $M_n > M_{cr}$ comfortably, so cracking is followed by ductile behaviour. It also controls crack width and covers shrinkage/temperature effects and unexpected loads.

**ACI 318 (9.6.1.2) / BNBC 2020:**
$$A_{s,min} = \\frac{3\\sqrt{f'_c}}{f_y}b_wd \\ \\ge\\ \\frac{200}{f_y}b_wd\\quad(\\text{psi})$$
- The second term governs for $f'_c < 4440$ psi. For f′c = 4000, fy = 60,000: $\\rho_{min} = 200/60000 = 0.00333$.
- **T-beams:** with the flange in compression use $b_w$. For a statically determinate T-beam with the **flange in tension** (e.g. cantilever), older ACI used the smaller of $6\\sqrt{f'_c}b_wd/f_y$ and $3\\sqrt{f'_c}b_fd/f_y$; ACI 318-14 uses $b_w$ replaced by the smaller of $2b_w$ and $b_f$.
- Not required if the provided $A_s$ is at least 1/3 more than required by analysis (9.6.1.3).
- Slabs and footings: minimum = temperature & shrinkage steel (0.0018bh for Grade 60).`,
  },
  {
    id: 'ts-max',
    topic: T,
    q: 'How is a minimum net tensile strain εt = 0.004 at failure ensured by not exceeding the maximum reinforcement ratio? Justify choosing φ from εt and show how φ varies with εt (ACI/BNBC).',
    seen: ['2021-22', '2017-18', '2015-16', '2012-13', '2010-11', '2008-09', '2006-07'],
    a: `**ρ ↔ εt.** At failure $\\varepsilon_u = 0.003$ at the top. From the strain diagram $c = \\dfrac{0.003}{0.003 + \\varepsilon_t}d_t$, and from $C = T$ (steel yielded): $0.85f'_c\\beta_1cb = \\rho bdf_y$. Hence
$$\\rho = 0.85\\beta_1\\frac{f'_c}{f_y}\\,\\frac{0.003}{0.003 + \\varepsilon_t}.$$
More steel → deeper c → smaller εt. Setting $\\varepsilon_t = 0.004$ gives $\\rho_{max}$ (0.0206 for 4/60); any $\\rho \\le \\rho_{max}$ automatically gives $\\varepsilon_t \\ge 0.004$, i.e. the steel strain at failure is about twice yield — enough cracking and deflection to warn. (ACI 9.3.3.1: beams with $P_u < 0.1f'_cA_g$ must have $\\varepsilon_t \\ge 0.004$.) $c/d_t \\le 0.429$ is the same limit.

**Why φ from εt.** εt measures **ductility**: a large εt means the steel yields well before crushing (warning, redistribution), a small εt means a sudden concrete failure. It also captures the importance and variability of the member. Basing φ on εt (not on member type) rewards ductile sections and works for beams, columns and anything in between with one rule.

**Variation (Grade 60):**
- $\\varepsilon_t \\ge 0.005$ ($c/d_t \\le 0.375$): **tension-controlled**, φ = 0.90.
- $\\varepsilon_y (0.002) < \\varepsilon_t < 0.005$: **transition**, $\\phi = 0.65 + 0.25\\dfrac{\\varepsilon_t - 0.002}{0.003} \\approx 0.483 + 83.3\\varepsilon_t$ (spiral: 0.75 → 0.90).
- $\\varepsilon_t \\le \\varepsilon_y$ ($c/d_t \\ge 0.6$): **compression-controlled**, φ = 0.65 (tied), 0.75 (spiral).
Sketch: φ (0.65 flat, rising line, 0.90 flat) vs εt with marks at 0.002, 0.004, 0.005.`,
    Fig: PhiFig,
  },
  {
    id: 'ts-underover',
    topic: T,
    q: 'Explain under-reinforced, balanced and over-reinforced sections. Which one is preferable, and why is the usual practice to use under-reinforced sections?',
    seen: ['2015-16', '2014-15', '2013-14', '2011-12', '2010-11', '2007-08', '2006-07', '2005-06', '2002-03'],
    a: `- **Balanced section** ($\\rho = \\rho_b$): the steel reaches yield ($\\varepsilon_y$) at the same instant the concrete reaches $\\varepsilon_u = 0.003$. $\\rho_b = 0.85\\beta_1\\dfrac{f'_c}{f_y}\\dfrac{0.003}{0.003 + \\varepsilon_y}$ (0.0285 for 4/60).
- **Under-reinforced** ($\\rho < \\rho_b$): the steel yields first ($\\varepsilon_t > \\varepsilon_y$). After yielding the beam keeps its moment while cracks widen and deflection grows a lot; failure is finally by crushing of concrete (the "secondary compression failure"). **Ductile, gives warning.**
- **Over-reinforced** ($\\rho > \\rho_b$): the concrete crushes before the steel yields ($\\varepsilon_t < \\varepsilon_y$). Failure is sudden and explosive, with little deflection or cracking warning; the strong steel is not fully used.

**Preferable: under-reinforced**, because (Nilson): (1) ductile failure with warning; (2) moment redistribution in continuous members; (3) concrete strength is more variable than steel, and a steel-governed failure is more predictable; (4) more economical (steel fully used, less congestion); (5) ACI requires it: $\\varepsilon_t \\ge 0.004$ ($\\rho \\le \\rho_{max} \\approx 0.72\\rho_b$), and φ = 0.9 only for $\\varepsilon_t \\ge 0.005$.`,
  },
  {
    id: 'ts-tc',
    topic: T,
    q: 'Distinguish between tension-controlled and compression-controlled beams (sections).',
    seen: ['2016-17'],
    a: `- **Definition:** εt ≥ 0.005 at nominal strength (c/dt ≤ 0.375) vs εt ≤ εy = 0.002 for Grade 60 (c/dt ≥ 0.600).
- **Behaviour:** steel yields long before concrete crushes — large deflection and wide cracks (ductile) vs concrete crushes while steel is still elastic — sudden (brittle).
- **φ:** 0.90 vs 0.65 tied / 0.75 spiral. Between them is the **transition zone** with φ interpolated (0.483 + 83.3εt).
- **Typical members:** lightly reinforced beams and slabs vs columns with high axial load, over-reinforced beams.
- Beams must have εt ≥ 0.004, so a compression-controlled beam is not permitted; fix by adding compression steel or enlarging the section.`,
  },
  {
    id: 'ts-epst',
    topic: T,
    q: 'Explain why εt decreases when the moment capacity is increased by adding tension steel at constant d. What minimum εt does ACI/BNBC require?',
    seen: ['Jan 2021'],
    a: `- More $A_s$ → larger tension $T = A_sf_y$ → equilibrium needs a larger compression $C = 0.85f'_c ab$ → with b fixed the block depth **a and c increase** (N.A. moves down).
- With εu = 0.003 fixed at the top, $\\varepsilon_t = 0.003(d_t - c)/c$ falls as c grows. So $M_n = A_sf_y(d - a/2)$ rises (but with a shrinking lever arm) while ductility falls: εt 0.005 → 0.004 → εy as ρ goes ρ_0.005 → ρ_max → ρ_b.
- Lower εt also lowers φ in the transition zone, so the design strength rises less than $M_n$ does.
- **ACI 318 / BNBC 2020:** for beams (non-prestressed flexural members with $P_u < 0.1f'_cA_g$) **εt ≥ 0.004**; for φ = 0.9, εt ≥ 0.005. To gain capacity beyond this at constant d, add compression steel.`,
  },
  {
    id: 'ts-rhob',
    topic: T,
    q: 'Derive the expression for the balanced steel ratio ρb with the appropriate stress and strain diagrams.',
    seen: ['2013-14'],
    a: `**Strain diagram (balanced):** εu = 0.003 at the top, εy = fy/Es at the steel. Similar triangles:
$$\\frac{c_b}{d} = \\frac{\\varepsilon_u}{\\varepsilon_u + \\varepsilon_y} = \\frac{0.003}{0.003 + f_y/E_s} \\ \\ (= \\tfrac{87}{87 + f_y}\\text{ in ksi}).$$
**Stress diagram:** Whitney block $0.85f'_c$ over $a_b = \\beta_1c_b$: $C = 0.85f'_c\\beta_1c_bb$; steel just yielding: $T = A_{sb}f_y = \\rho_bbdf_y$.

**Equilibrium** C = T:
$$\\rho_b bdf_y = 0.85f'_c\\beta_1 b\\,\\frac{0.003}{0.003 + \\varepsilon_y}d \\ \\Rightarrow\\ \\rho_b = 0.85\\beta_1\\frac{f'_c}{f_y}\\,\\frac{\\varepsilon_u}{\\varepsilon_u + \\varepsilon_y}$$
For f′c = 4000 psi, fy = 60,000 psi: β1 = 0.85, εy = 0.00207, ρb = 0.85(0.85)(4/60)(0.003/0.00507) = **0.0285**.`,
  },
  {
    id: 'ts-sd',
    topic: T,
    q: 'Explain singly reinforced and doubly reinforced beams (and classify a given beam as under/over-reinforced and singly/doubly).',
    seen: ['2013-14', '2007-08', '2002-03'],
    a: `- **Singly reinforced:** steel only on the tension side; the concrete above the N.A. carries all the compression. Capacity is limited by ρ ≤ ρ_max (εt ≥ 0.004).
- **Doubly reinforced:** steel on both the tension and the compression side ($A'_s$). Used when the section size is limited (architecture/headroom) and M_u exceeds the singly capacity, to reduce long-term deflection (creep), to increase ductility (raises εt, permits more A_s), at supports of continuous beams where bottom bars continue, and to hold stirrups. ρ limit becomes $\\bar\\rho_b = \\rho_b + \\rho'f'_s/f_y$.
- **Classifying a beam:** compute ρ = A_s/bd and compare with ρ_b (or compute εt): ρ < ρ_b (εt > εy) → under-reinforced; no top bars → singly. E.g. 2013-14 Fig. 4: ρ = 0.0139 < ρ_b = 0.0285 → under-reinforced, singly reinforced.`,
  },
  {
    id: 'ts-scf',
    topic: T,
    q: 'Explain briefly "secondary compression failure" in a beam.',
    seen: ['2006-07'],
    a: `- The flexural failure mode of an **under-reinforced** beam. The steel yields first (primary tension yielding). At constant $T = A_sf_y$, further rotation makes the cracks widen and travel upward, so the compression zone gets **smaller** and the neutral axis rises.
- The concrete strain at the top rises rapidly until it reaches about 0.003 and the reduced compression zone **crushes** — a "secondary" compression failure, coming after large deflection. It is ductile and gives warning, unlike the primary compression failure of an over-reinforced beam (crushing before yield).
- Nominal strength: $M_n = A_sf_y(d - a/2)$.`,
  },
  {
    id: 'ts-assume',
    topic: T,
    q: 'Write the fundamental assumptions of reinforced concrete flexure theory.',
    seen: ['2004-05'],
    a: `1. Plane sections before bending remain plane after bending — strain varies linearly with distance from the N.A. (strain compatibility).
2. Perfect bond: the strain in the steel equals the strain in the surrounding concrete (no slip).
3. The tensile strength of concrete is neglected in strength (cracked) calculations.
4. Concrete fails when the extreme compression strain reaches εu = 0.003.
5. Steel is elastic–perfectly plastic: $f_s = E_s\\varepsilon_s \\le f_y$, $E_s$ = 29,000 ksi.
6. The concrete compressive stress–strain relation is known (parabola); it may be replaced by the equivalent rectangular block $0.85f'_c$ over $a = \\beta_1c$.
7. Equilibrium: internal forces balance the external ones (C = T, M = C × lever arm).
For elastic (service) analysis also: stresses proportional to strains, and steel replaced by n × its area (transformed section).`,
  },
]

// ---------------------------------------------------------------- own problems
const problems: RcQ[] = [
  {
    id: 'rc-own-sg-1',
    paper: 'own',
    level: 'warm-up',
    sec: 'A',
    no: '1',
    marks: 0,
    topics: [T],
    title: 'ρ limits for f′c = 5 ksi, fy = 60 ksi',
    text: 'Find β₁, ρ_b, ρ_max (εt = 0.004), ρ_0.005 and ρ_min for f′c = 5000 psi and fy = 60,000 psi.',
    pages: [],
    given: [{ label: 'ρ limits', ref: 'f-rho' }],
    checks: () => {
      const L = limits(5000, 60000)
      return [
        { key: 'rb', label: 'ρ_b', value: L.rhoB },
        { key: 'rm', label: 'ρ_max', value: L.rhoMax },
        { key: 'r5', label: 'ρ_0.005', value: L.rho005 },
        { key: 'rn', label: 'ρ_min', value: L.rhoMin },
      ]
    },
    solution: () => <SolSteps steps={limits(5000, 60000).steps} />,
  },
  {
    id: 'rc-own-sg-2',
    paper: 'own',
    level: 'exam',
    sec: 'A',
    no: '2',
    marks: 0,
    topics: [T],
    title: 'Two-row review in the transition zone',
    text: 'b = 12 in, h = 26 in, eight #8 bars in two rows of four (d_t = 23.5 in, d = 22 in). f′c = 4 ksi, fy = 60 ksi. Find M_n and φM_n. Is the section permitted for a beam?',
    pages: [],
    given: [{ label: 'φ chart', ref: 'm-phi' }, { label: 'ρ limits', ref: 'f-rho' }],
    checks: () => {
      const r = review({ b: 12, fc: 4000, fy: 60000, layers: [{ As: 3.16, d: 23.5 }, { As: 3.16, d: 20.5 }] })
      return [
        { key: 'c', label: 'c', value: r.c, unit: 'in' },
        { key: 'et', label: 'ε_t', value: r.epsT },
        { key: 'phi', label: 'φ', value: r.phi, tol: 0.005 },
        { key: 'pmn', label: 'φM_n', value: r.phiMn, unit: 'k-ft' },
      ]
    },
    solution: () => <SolSteps steps={review({ b: 12, fc: 4000, fy: 60000, layers: [{ As: 3.16, d: 23.5 }, { As: 3.16, d: 20.5 }] }).steps} />,
  },
  {
    id: 'rc-own-sg-3',
    paper: 'own',
    level: 'exam',
    sec: 'A',
    no: '3',
    marks: 0,
    topics: [T],
    title: 'Fixed 14 × 26 section, 24 ft simple span',
    text: 'Service LL = 1.8 k/ft and superimposed DL = 1.2 k/ft (plus self-weight), simple span 24 ft, section 14 in × 26 in, f′c = 4 ksi, fy = 60 ksi. Design the flexural steel (one row), select bars and check the limits.',
    pages: [],
    given: [{ label: 'Load combinations', ref: 'm-loads' }, { label: 'Bars', ref: 'm-bars' }, { label: 'Cover & fit', ref: 'm-cover' }],
    checks: () => {
      const L = beamLoads({ span: 24, support: 'ss', b: 14, h: 26, sdl: 1.2, ll: 1.8 })
      const d = designAs(L.Mu, 14, 23.5, 4000, 60000)
      return [
        { key: 'wu', label: 'w_u', value: L.wu, unit: 'k/ft' },
        { key: 'mu', label: 'M_u', value: L.Mu, unit: 'k-ft' },
        { key: 'as', label: 'A_s required', value: d.As, unit: 'in²' },
      ]
    },
    solution: () => {
      const L = beamLoads({ span: 24, support: 'ss', b: 14, h: 26, sdl: 1.2, ll: 1.8 })
      const d = designAs(L.Mu, 14, 23.5, 4000, 60000)
      const b = pickBars(d.As, 14)
      const r = review({ b: 14, fc: 4000, fy: 60000, layers: [{ As: b.As, d: 23.5 }] })
      return (
        <div>
          <SolSteps steps={[...L.steps, ...d.steps]} />
          <p className="text-sm my-2">
            Use {b.n} #{b.bar} (A_s = {fmt(b.As, 2)} in², b_min = {fmt(b.bmin, 2)} in ≤ 14 in). Check:
          </p>
          <SolSteps steps={r.steps} />
        </div>
      )
    },
  },
  {
    id: 'rc-own-sg-4',
    paper: 'own',
    level: 'challenge',
    sec: 'B',
    no: '4',
    marks: 0,
    topics: [T],
    title: 'b = 12 in, ρ = 0.6ρmax, factored loads with a midspan point load',
    text: 'A 30 ft simply supported beam carries factored UDL 3.6 k/ft (incl. self-weight) and a factored 40 k point load at midspan. f′c = 3.5 ksi, fy = 60 ksi, b = 12 in, ρ = 0.6ρ_max. Find d, h (one row of bars if possible, else two) and A_s.',
    pages: [],
    checks: () => {
      const L = beamLoads({ span: 30, support: 'ss', sdl: 3.6, ll: 0, points: [{ D: 40, L: 0, x: 15 }], factored: true })
      const s = designSection(L.Mu, 3500, 60000, 0.6 * limits(3500, 60000).rhoMax, { b: 12 })
      return [
        { key: 'mu', label: 'M_u', value: L.Mu, unit: 'k-ft' },
        { key: 'd', label: 'd required', value: s.d, unit: 'in' },
        { key: 'as', label: 'A_s = ρbd', value: s.As, unit: 'in²' },
      ]
    },
    solution: () => {
      const L = beamLoads({ span: 30, support: 'ss', sdl: 3.6, ll: 0, points: [{ D: 40, L: 0, x: 15 }], factored: true })
      const s = designSection(L.Mu, 3500, 60000, 0.6 * limits(3500, 60000).rhoMax, { b: 12, layers: 2 })
      const b = pickBars(s.As, 12)
      return (
        <div>
          <SolSteps steps={[...limits(3500, 60000).steps.slice(0, 3), ...L.steps, ...s.steps]} />
          <p className="text-sm mt-2">
            A_s = {fmt(s.As, 2)} in² → {b.n} #{b.bar} ({b.layers === 2 ? 'two rows: use d = h − 3.5' : 'one row'}). Re-check φM_n with the provided bars in the Lab (Design → Choose ρ).
          </p>
        </div>
      )
    },
  },
]

const mod: RcTopicModule = { Overview, Approach, Lab, problems, theory }
export default mod

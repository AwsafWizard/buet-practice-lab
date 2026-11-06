// One lab per load type (point, line, strip, embankment, circle, rectangle): inputs, the formula with numbers,
// the influence value, σz against depth, checkpoints; the chart-pane table highlights what was used.
import { useEffect, useState, type ReactNode } from 'react'
import { fmt } from '../../../components/DiagramView'
import { Answer, Md, Seg, Tex } from '../../../components/ui'
import { hashKey } from '../../../labs/CheckTable'
import { NumIn } from '../../../reference/common'
import {
  annulusCentre,
  boussinesq,
  circleAt,
  circleCentre,
  embankmentAt,
  embankmentBlocks,
  embQ,
  Irect,
  KB,
  lineEnd,
  lineFinite,
  lineInfinite,
  maxOnVertical,
  rectI,
  stripAngles,
  stripAt,
  triStripAt,
  twoToOneCircle,
  twoToOneRect,
  twoToOneStrip,
  westergaard,
  type Embankment,
} from '../../engine/stressdist'
import { markUsed, openSmRef } from '../../reference/pane'
import { DepthChart, EmbFig } from './figs'

const f2 = (v: number) => fmt(v, 2)
const f3 = (v: number) => fmt(v, 3)
const f4 = (v: number) => fmt(v, 4)
const R = String.raw

type Kind = 'point' | 'line' | 'strip' | 'emb' | 'circle' | 'rect'
const KINDS: { v: Kind; label: string }[] = [
  { v: 'point', label: 'Point' },
  { v: 'line', label: 'Line' },
  { v: 'strip', label: 'Strip' },
  { v: 'emb', label: 'Embankment' },
  { v: 'circle', label: 'Circle' },
  { v: 'rect', label: 'Rectangle' },
]

function Frame({ inputs, work, chart, checks, refId }: { inputs: ReactNode; work: ReactNode; chart: ReactNode; checks: ReactNode; refId: string }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">{inputs}</div>
      <div className="grid cq-lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          {chart}
        </div>
        <div className="space-y-2 text-sm">
          <div className="rounded-xl border border-line p-3 space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-faint">Checkpoints</div>
            {checks}
            <button className="text-xs text-accent underline" onClick={() => openSmRef(refId)}>
              chart pane ↗
            </button>
          </div>
          <div className="rounded-xl bg-panel2/50 border border-line p-3">{work}</div>
        </div>
      </div>
    </div>
  )
}

function PointLab() {
  const [o, setO] = useState({ Q1: 300, r1: 0, Q2: 300, r2: 5, z: 8.5, two: true })
  const set = (k: keyof typeof o) => (v: number) => setO({ ...o, [k]: v })
  const s1 = boussinesq(o.Q1, o.r1, o.z)
  const s2 = o.two ? boussinesq(o.Q2, o.r2, o.z) : 0
  const ok = [o.Q1, o.r1, o.z].every(Number.isFinite) && o.z > 0 && (!o.two || [o.Q2, o.r2].every(Number.isFinite))
  const m = maxOnVertical(o.Q1, Math.max(o.r1, 1e-6))
  useEffect(() => markUsed('d-kb', { rz: +(o.r2 / o.z).toFixed(3) }))
  const id = (k: string) => `sm-stress:lab:point:${hashKey(JSON.stringify(o))}:${k}`
  return (
    <Frame
      refId="d-kb"
      inputs={
        <>
          <NumIn label="Q1" value={o.Q1} onChange={set('Q1')} step={50} unit="kN" w="w-16" />
          <NumIn label="r1" value={o.r1} onChange={set('r1')} step={0.5} unit="m" w="w-14" />
          <label className="inline-flex items-center gap-1 text-xs">
            <input type="checkbox" checked={o.two} onChange={(e) => setO({ ...o, two: e.target.checked })} /> second load
          </label>
          {o.two && (
            <>
              <NumIn label="Q2" value={o.Q2} onChange={set('Q2')} step={50} unit="kN" w="w-16" />
              <NumIn label="r2" value={o.r2} onChange={set('r2')} step={0.5} unit="m" w="w-14" />
            </>
          )}
          <NumIn label="z" value={o.z} onChange={set('z')} step={0.5} unit="m" w="w-14" />
        </>
      }
      chart={ok && <DepthChart zMax={Math.max(2 * o.z, 4)} mark={{ z: o.z, v: s1 + s2 }} curves={[{ f: (z) => boussinesq(o.Q1, o.r1, z) + (o.two ? boussinesq(o.Q2, o.r2, z) : 0), label: 'Boussinesq (sum)' }, { f: (z) => westergaard(o.Q1, o.r1, z) + (o.two ? westergaard(o.Q2, o.r2, z) : 0), label: 'Westergaard', dash: true }]} />}
      checks={
        ok && (
          <>
            <Answer id={id('k1')} label={`KB at r/z = ${f3(o.r1 / o.z)}`} value={KB(o.r1 / o.z)} digits={4} abs={0.002} compact />
            <Answer id={id('s1')} label="σz from Q1" value={s1} unit="kPa" compact />
            {o.two && <Answer id={id('s2')} label="σz from Q2" value={s2} unit="kPa" compact />}
            {o.two && <Answer id={id('s')} label="total σz" value={s1 + s2} unit="kPa" compact />}
            {o.r1 > 0 && <Answer id={id('mx')} label={`max σz on the line r = ${f2(o.r1)} (Q1 alone)`} value={m.sigma} unit="kPa" compact />}
          </>
        )
      }
      work={
        ok && (
          <Md>{R`$\sigma_z = K_B\frac{Q}{z^2}$, $K_B = \frac{3/2\pi}{[1+(r/z)^2]^{5/2}}$: Q1 → $${f4(KB(o.r1 / o.z))}(${o.Q1})/${f2(o.z)}^2 = ${f3(s1)}$${o.two ? R`; Q2 (r/z = ${f3(o.r2 / o.z)}) → $${f4(KB(o.r2 / o.z))}(${o.Q2})/${f2(o.z)}^2 = ${f3(s2)}$; sum **${f3(s1 + s2)} kPa**` : ''}.${o.r1 > 0 ? R` On the vertical at r = ${f2(o.r1)} m the maximum is at z = r/0.8165 = ${f2(m.z)} m: $0.0888Q/r^2 = ${f3(m.sigma)}$ kPa.` : ''} Westergaard gives ${f3(westergaard(o.Q1, o.r1, o.z) + (o.two ? westergaard(o.Q2, o.r2, o.z) : 0))} kPa.`}</Md>
        )
      }
    />
  )
}

function LineLab() {
  const [o, setO] = useState({ q: 100, x: 0, z: 3, L: 6, finite: true })
  const set = (k: keyof typeof o) => (v: number) => setO({ ...o, [k]: v })
  const ok = [o.q, o.x, o.z, o.L].every(Number.isFinite) && o.z > 0 && o.L > 0
  const s = o.finite ? lineFinite(o.q, o.x, 0, o.L, o.z) : lineInfinite(o.q, o.x, o.z)
  const id = (k: string) => `sm-stress:lab:line:${hashKey(JSON.stringify(o))}:${k}`
  return (
    <Frame
      refId="d-line"
      inputs={
        <>
          <NumIn label="q′" value={o.q} onChange={set('q')} step={10} unit="kN/m" w="w-16" />
          <Seg size="xs" value={o.finite ? 'f' : 'i'} onChange={(v) => setO({ ...o, finite: v === 'f' })} items={[{ v: 'i', label: 'infinite' }, { v: 'f', label: 'finite, ends above the point' }]} />
          {o.finite && <NumIn label="L" value={o.L} onChange={set('L')} step={1} unit="m" w="w-14" />}
          <NumIn label="x (offset)" value={o.x} onChange={set('x')} step={0.5} unit="m" w="w-14" />
          <NumIn label="z" value={o.z} onChange={set('z')} step={0.5} unit="m" w="w-14" />
        </>
      }
      chart={ok && <DepthChart zMax={Math.max(3 * o.z, 4)} mark={{ z: o.z, v: s }} curves={[{ f: (z) => (o.finite ? lineFinite(o.q, o.x, 0, o.L, z) : lineInfinite(o.q, o.x, z)), label: o.finite ? 'finite line' : 'infinite line' }, { f: (z) => lineInfinite(o.q, o.x, z), label: 'infinite (reference)', dash: true }]} />}
      checks={ok && <Answer id={id('s')} label="σz" value={s} unit="kPa" compact />}
      work={
        ok && (
          <Md>{o.finite
            ? (o.x === 0 ? R`Below one end: $\sigma_z = \frac{q'L(3z^2+2L^2)}{2\pi z(z^2+L^2)^{3/2}} = \frac{${o.q}(${o.L})(${f2(3 * o.z * o.z + 2 * o.L * o.L)})}{2\pi(${o.z})(${f2(o.z * o.z + o.L * o.L)})^{1.5}} = ${f3(lineEnd(o.q, o.L, o.z))}$ kPa — half the infinite value ${f3(lineInfinite(o.q, 0, o.z) / 2)} as L → ∞. Walls crossing at the point: add the segments ending there.` : R`Offset x: integrate Boussinesq along the segment, $\sigma_z = \frac{q'z^3}{2\pi}\left[\frac{y(2y^2+3a^2)}{a^4(a^2+y^2)^{3/2}}\right]_0^L$, $a^2 = x^2+z^2$ → **${f3(s)} kPa**.`)
            : R`$\sigma_z = \frac{2q'z^3}{\pi(x^2+z^2)^2} = \frac{2(${o.q})(${o.z})^3}{\pi(${f2(o.x * o.x + o.z * o.z)})^2} = ${f3(s)}$ kPa.`}</Md>
        )
      }
    />
  )
}

function StripLab() {
  const [o, setO] = useState({ q: 100, B: 3, x: 0, z: 3, tri: false })
  const set = (k: keyof typeof o) => (v: number) => setO({ ...o, [k]: v })
  const ok = [o.q, o.B, o.x, o.z].every(Number.isFinite) && o.z > 0 && o.B > 0
  const f = (z: number) => (o.tri ? triStripAt(o.q, o.B, o.x, z) : stripAt(o.q, o.B, o.x, z))
  const s = f(o.z)
  const a = stripAngles(o.B, o.x, o.z)
  useEffect(() => markUsed('d-strip', { zB: +(o.z / o.B).toFixed(2) }))
  const id = (k: string) => `sm-stress:lab:strip:${hashKey(JSON.stringify(o))}:${k}`
  return (
    <Frame
      refId="d-strip"
      inputs={
        <>
          <Seg size="xs" value={o.tri ? 't' : 'u'} onChange={(v) => setO({ ...o, tri: v === 't' })} items={[{ v: 'u', label: 'uniform' }, { v: 't', label: 'triangular 0 → q' }]} />
          <NumIn label="q" value={o.q} onChange={set('q')} step={10} unit="kPa" w="w-16" />
          <NumIn label="B" value={o.B} onChange={set('B')} step={0.5} unit="m" w="w-14" />
          <NumIn label={o.tri ? 'x from the zero edge' : 'x from the centre'} value={o.x} onChange={set('x')} step={0.5} unit="m" w="w-14" />
          <NumIn label="z" value={o.z} onChange={set('z')} step={0.5} unit="m" w="w-14" />
        </>
      }
      chart={ok && <DepthChart zMax={Math.max(4 * o.B, 2 * o.z)} mark={{ z: o.z, v: s }} curves={[{ f, label: o.tri ? 'triangular strip' : 'uniform strip' }, { f: (z) => twoToOneStrip(o.q * o.B * (o.tri ? 0.5 : 1), o.B, z), label: '2:1 (average)', dash: true }]} />}
      checks={
        ok && (
          <>
            {!o.tri && <Answer id={id('a')} label="α (rad)" value={a.alpha} digits={4} abs={0.002} compact />}
            <Answer id={id('s')} label="σz" value={s} unit="kPa" compact />
          </>
        )
      }
      work={
        ok && (
          <Md>{o.tri ? R`Triangular strip (integral of line loads $q(r)\,dr$ with $q(r) = qr/B$): σz/q = ${f4(s / o.q)} → **${f3(s)} kPa**. Peak under the high edge.` : R`$\alpha = ${f4(a.alpha)}$ rad, $\delta = ${f4(a.delta)}$ rad: $\sigma_z = \frac{q}{\pi}[\alpha + \sin\alpha\cos(\alpha+2\delta)] = ${f4(s / o.q)}q$ = **${f3(s)} kPa**.`}</Md>
        )
      }
    />
  )
}

function EmbLab() {
  const [e, setE] = useState<Embankment>({ c: 8, h: 5, gamma: 19, aL: 10, aR: 25 })
  const [x, setX] = useState(10)
  const [z, setZ] = useState(2)
  const setK = (k: keyof Embankment) => (v: number) => setE({ ...e, [k]: v })
  const ok = Object.values(e).every((v) => Number.isFinite(v) && v >= 0) && e.h > 0 && z > 0 && Number.isFinite(x)
  const s = embankmentAt(e, x, z)
  const bl = embankmentBlocks(e, x, z)
  useEffect(() => {
    if (bl) markUsed('d-osterberg', { ab: bl.blocks.map((b) => `${b.az.toFixed(3)},${b.bz.toFixed(3)}`).join(';') })
  })
  const id = (k: string) => `sm-stress:lab:emb:${hashKey(JSON.stringify({ e, x, z }))}:${k}`
  return (
    <Frame
      refId="d-osterberg"
      inputs={
        <>
          <NumIn label="crest" value={e.c} onChange={setK('c')} step={1} unit="m" w="w-14" />
          <NumIn label="H" value={e.h} onChange={setK('h')} step={0.5} unit="m" w="w-14" />
          <NumIn label="γ" value={e.gamma} onChange={setK('gamma')} step={0.5} w="w-14" />
          <NumIn label="left slope (horiz.)" value={e.aL} onChange={setK('aL')} step={1} unit="m" w="w-14" />
          <NumIn label="right slope" value={e.aR} onChange={setK('aR')} step={1} unit="m" w="w-14" />
          <NumIn label="point x from the left toe" value={x} onChange={setX} step={0.5} unit="m" w="w-14" />
          <NumIn label="z" value={z} onChange={setZ} step={0.5} unit="m" w="w-14" />
          <button className="btn !py-0.5 !px-2 !text-xs" onClick={() => (setE({ c: 8, h: 5, gamma: 19, aL: 10, aR: 25 }), setX(14), setZ(3))}>
            Jan 2021 point B
          </button>
          <button className="btn !py-0.5 !px-2 !text-xs" onClick={() => (setE({ c: 30, h: 1, gamma: 4, aL: 20, aR: 20 }), setX(35), setZ(21))}>
            2017-18 Q8(c) (ft, ksf)
          </button>
        </>
      }
      chart={
        ok && (
          <>
            <EmbFig e={e} pts={[{ x, z, label: 'P' }]} />
            <DepthChart zMax={Math.max(2 * z, e.c + e.aL + e.aR) / 2} mark={{ z, v: s }} curves={[{ f: (zz) => embankmentAt(e, x, zz), label: 'σz below P' }]} />
          </>
        )
      }
      checks={
        ok && (
          <>
            {bl?.blocks.map((b) => <Answer key={b.side} id={id(b.side)} label={`Iz, ${b.side} block (a/z ${f3(b.az)}, b/z ${f3(b.bz)})`} value={b.I} digits={4} abs={0.002} compact />)}
            <Answer id={id('s')} label="σz" value={s} unit="kPa" compact />
          </>
        )
      }
      work={
        ok &&
        (bl ? (
          <Md>{R`q = γH = ${f2(embQ(e))} kPa. Split at the vertical through P: ${bl.blocks.map((b) => R`${b.side} block a = ${f2(b.a)}, b = ${f2(b.b)}: $I_z = \frac1\pi\left[\frac{a+b}{a}\tan^{-1}\frac{a+b}{z} - \frac ba\tan^{-1}\frac bz\right] = ${f4(b.I)}$`).join('; ')}. σz = q ΣIz = ${f2(embQ(e))}(${f4(bl.I)}) = **${f2(bl.sigma)} kPa**.`}</Md>
        ) : (
          <Md>{R`P is not under the crest, so the two-block split does not apply directly. Exact superposition of the ramp and flat parts (integrating the line-load formula across the section): **${f3(s)} kPa**. On the chart you would add the full-section blocks and subtract the missing wedge.`}</Md>
        ))
      }
    />
  )
}

function CircleLab() {
  const [o, setO] = useState({ q: 200, R: 4, r: 0, z: 4, R1: 0 })
  const set = (k: keyof typeof o) => (v: number) => setO({ ...o, [k]: v })
  const ok = [o.q, o.R, o.r, o.z, o.R1].every(Number.isFinite) && o.R > 0 && o.z > 0 && o.R1 >= 0 && o.R1 < o.R
  const f = (z: number) => (o.r === 0 ? (o.R1 > 0 ? annulusCentre(o.q, o.R1, o.R, z) : circleCentre(o.q, o.R, z)) : circleAt(o.q, o.R, o.r, z, 30, 60) - (o.R1 > 0 ? circleAt(o.q, o.R1, o.r, z, 30, 60) : 0))
  const s = f(o.z)
  useEffect(() => markUsed('d-circle', { zR: +(o.z / o.R).toFixed(2) }))
  const id = (k: string) => `sm-stress:lab:circle:${hashKey(JSON.stringify(o))}:${k}`
  return (
    <Frame
      refId="d-circle"
      inputs={
        <>
          <NumIn label="q" value={o.q} onChange={set('q')} step={10} unit="kPa" w="w-16" />
          <NumIn label="R" value={o.R} onChange={set('R')} step={0.5} unit="m" w="w-14" />
          <NumIn label="hole R1 (annulus)" value={o.R1} onChange={set('R1')} step={0.5} unit="m" w="w-14" />
          <NumIn label="r from centre" value={o.r} onChange={set('r')} step={0.5} unit="m" w="w-14" />
          <NumIn label="z" value={o.z} onChange={set('z')} step={0.5} unit="m" w="w-14" />
        </>
      }
      chart={ok && <DepthChart zMax={Math.max(4 * o.R, 2 * o.z)} mark={{ z: o.z, v: s }} curves={[{ f, label: 'Boussinesq' }, { f: (z) => twoToOneCircle(o.q * Math.PI * (o.R ** 2 - o.R1 ** 2), 2 * o.R, z), label: '2:1', dash: true }]} />}
      checks={ok && <Answer id={id('s')} label="σz" value={s} unit="kPa" compact />}
      work={ok && <Md>{o.r === 0 ? R`$\sigma_z = q\{1 - [1+(R/z)^2]^{-3/2}\}$${o.R1 > 0 ? ' for R minus the same for R1' : ''}: **${f3(s)} kPa** (σz/q = ${f4(s / o.q)}). 2007-08 Q2(a): 200 kPa, R = z = 4 m → 129.3 kPa.` : R`Off the centre (r = ${f2(o.r)} m): no closed form taught — Newmark chart, or numerical integration here: **${f3(s)} kPa**.`}</Md>}
    />
  )
}

function RectLab() {
  const [o, setO] = useState({ q: 200, B: 4, L: 6, x: 2, y: 3, z: 6 })
  const set = (k: keyof typeof o) => (v: number) => setO({ ...o, [k]: v })
  const ok = [o.q, o.B, o.L, o.x, o.y, o.z].every(Number.isFinite) && o.B > 0 && o.L > 0 && o.z > 0
  const rect = { x1: 0, y1: 0, x2: o.B, y2: o.L }
  const f = (z: number) => o.q * rectI(rect, o.x, o.y, z)
  const s = f(o.z)
  const centre = Math.abs(o.x - o.B / 2) < 1e-9 && Math.abs(o.y - o.L / 2) < 1e-9
  const corner = (o.x === 0 || o.x === o.B) && (o.y === 0 || o.y === o.L)
  useEffect(() => markUsed('d-fadum', { mn: centre ? `${(o.B / 2 / o.z).toFixed(3)},${(o.L / 2 / o.z).toFixed(3)}` : `${(o.B / o.z).toFixed(3)},${(o.L / o.z).toFixed(3)}` }))
  useEffect(() => markUsed('d-steinbrenner', { zb: +(o.z / (centre ? Math.min(o.B, o.L) / 2 : Math.min(o.B, o.L))).toFixed(3), lb: +(Math.max(o.B, o.L) / Math.min(o.B, o.L)).toFixed(3) }))
  const id = (k: string) => `sm-stress:lab:rect:${hashKey(JSON.stringify(o))}:${k}`
  return (
    <Frame
      refId="d-fadum"
      inputs={
        <>
          <NumIn label="q" value={o.q} onChange={set('q')} step={10} unit="kPa" w="w-16" />
          <NumIn label="B" value={o.B} onChange={set('B')} step={0.5} unit="m" w="w-14" />
          <NumIn label="L" value={o.L} onChange={set('L')} step={0.5} unit="m" w="w-14" />
          <NumIn label="point x" value={o.x} onChange={set('x')} step={0.5} unit="m" w="w-14" />
          <NumIn label="point y" value={o.y} onChange={set('y')} step={0.5} unit="m" w="w-14" />
          <NumIn label="z" value={o.z} onChange={set('z')} step={0.5} unit="m" w="w-14" />
          <button className="btn !py-0.5 !px-2 !text-xs" onClick={() => setO({ ...o, x: o.B / 2, y: o.L / 2 })}>
            centre
          </button>
          <button className="btn !py-0.5 !px-2 !text-xs" onClick={() => setO({ ...o, x: 0, y: 0 })}>
            corner
          </button>
        </>
      }
      chart={ok && <DepthChart zMax={Math.max(3 * Math.max(o.B, o.L), 2 * o.z)} mark={{ z: o.z, v: s }} curves={[{ f, label: 'Boussinesq (Fadum)' }, ...(centre ? [{ f: (z: number) => twoToOneRect(o.q * o.B * o.L, o.B, o.L, z), label: '2:1', dash: true }] : [])]} />}
      checks={
        ok && (
          <>
            {centre && <Answer id={id('i')} label={`I(m = ${f3(o.B / 2 / o.z)}, n = ${f3(o.L / 2 / o.z)}) per quarter`} value={Irect(o.B / 2 / o.z, o.L / 2 / o.z)} digits={4} abs={0.002} compact />}
            {corner && <Answer id={id('i')} label={`I(m = ${f3(o.B / o.z)}, n = ${f3(o.L / o.z)})`} value={Irect(o.B / o.z, o.L / o.z)} digits={4} abs={0.002} compact />}
            <Answer id={id('s')} label="σz" value={s} unit="kPa" compact />
            {centre && <Answer id={id('21')} label="2:1 average" value={twoToOneRect(o.q * o.B * o.L, o.B, o.L, o.z)} unit="kPa" compact />}
          </>
        )
      }
      work={
        ok && (
          <Md>{centre ? R`Centre: four ${f2(o.B / 2)} × ${f2(o.L / 2)} rectangles with a corner at the point: m = ${f3(o.B / 2 / o.z)}, n = ${f3(o.L / 2 / o.z)}, I = ${f4(Irect(o.B / 2 / o.z, o.L / 2 / o.z))}; σz = 4qI = **${f3(s)} kPa** (Steinbrenner: z/b = ${f2(o.z / (Math.min(o.B, o.L) / 2))}, l/b = ${f2(Math.max(o.B, o.L) / Math.min(o.B, o.L))}). 2:1 gives ${f3(twoToOneRect(o.q * o.B * o.L, o.B, o.L, o.z))} kPa.` : R`Superposition of rectangles with a corner at the point (+ loaded, − fictitious): ΣI = ${f4(s / o.q)} → **${f3(s)} kPa**. Use the Fadum builder below to see the pieces.`}</Md>
        )
      }
    />
  )
}

export function LoadLab() {
  const [k, setK] = useState<Kind>('point')
  return (
    <div className="space-y-3">
      <div className="max-w-full overflow-x-auto">
        <Seg value={k} onChange={setK} items={KINDS} />
      </div>
      {k === 'point' ? <PointLab /> : k === 'line' ? <LineLab /> : k === 'strip' ? <StripLab /> : k === 'emb' ? <EmbLab /> : k === 'circle' ? <CircleLab /> : <RectLab />}
      <div className="text-xs text-faint">
        <Tex>{R`\sigma_z`}</Tex> from elastic (Boussinesq) theory: homogeneous, isotropic, elastic, semi-infinite, weightless soil; flexible load. Expect 20–30 % scatter against field measurements.
      </div>
    </div>
  )
}

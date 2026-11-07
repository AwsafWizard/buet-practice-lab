// Chart pane, stress distribution (d-) items: Boussinesq KB, Fadum, Newmark, Osterberg, Steinbrenner, strips, circle, 2:1,
// line loads, contact pressure. Every chart is drawn from its formula (SJMY sir Lectures 21–25).
import { useState } from 'react'
import { fmt } from '../../components/DiagramView'
import { Md } from '../../components/ui'
import { Lookup, NumIn, ok, RT } from '../../reference/common'
import {
  boussinesq,
  circleAt,
  circleCentre,
  Irect,
  KB,
  KW,
  lineEnd,
  lineInfinite,
  maxOnVertical,
  NEWMARK_RZ,
  osterberg,
  piBranch,
  rzForRatio,
  stripAt,
  triStripAt,
  twoToOneCircle,
  twoToOneRect,
  twoToOneStrip,
  westergaard,
} from '../engine/stressdist'
import { Chart, Legend, pathOf, SERIES } from '../topics/consol/plot'
import { NewmarkChart } from '../topics/stress/newmark'
import { useUsed, type SmRefItem } from './pane'

const f2 = (v: number) => fmt(v, 2)
const f3 = (v: number) => fmt(v, 3)
const f4 = (v: number) => fmt(v, 4)
const R = String.raw
const num = (v: unknown) => (typeof v === 'number' ? v : undefined)

// ---------------------------------------------------------------- d-kb
const RZS = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.8165, 0.9, 1, 1.2, 1.4, 1.6, 1.8, 2, 2.5, 3]
function KbBody() {
  const used = useUsed('d-kb')
  const [Q, setQ] = useState(300)
  const [r, setR] = useState(5)
  const [z, setZ] = useState(8.5)
  const urz = num(used?.rz)
  const m = maxOnVertical(Q, r)
  return (
    <>
      <Md>{R`$$\sigma_z = \frac{3Q}{2\pi z^2}\frac{1}{[1+(r/z)^2]^{5/2}} = K_B\frac{Q}{z^2},\qquad \text{Westergaard }(\mu = 0):\ \sigma_z = \frac{Q}{\pi z^2}\frac{1}{[1+2(r/z)^2]^{3/2}} = K_W\frac{Q}{z^2}$$
On a vertical line at radius r the maximum is at $r/z = \sqrt{2/3} = 0.8165$ (β = 39°14′ from the load axis): $\sigma_{z,max} = 0.0888\,Q/r^2$.`}</Md>
      <RT head={['r/z', 'KB', 'KW']} rows={RZS.map((v) => [String(v), f4(KB(v)), f4(KW(v))])} hl={(i) => urz !== undefined && Math.abs(RZS[i] - urz) < 0.05} cap="KW ≈ ⅔KB for r/z below 0.8; the two agree beyond r/z ≈ 1.5 (Lecture 25)." />
      <Lookup result={[Q, r, z].every(ok) && z > 0 ? <span>r/z = {f3(r / z)}, KB = {f4(KB(r / z))} → σz = <b>{f3(boussinesq(Q, r, z))}</b> kPa (Westergaard {f3(westergaard(Q, r, z))}) · max on r = {f2(r)}: <b>{f3(m.sigma)}</b> at z = {f2(m.z)} m</span> : '—'}>
        <NumIn label="Q" value={Q} onChange={setQ} step={10} unit="kN" w="w-16" />
        <NumIn label="r" value={r} onChange={setR} step={0.5} unit="m" w="w-14" />
        <NumIn label="z" value={z} onChange={setZ} step={0.5} unit="m" w="w-14" />
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- d-fadum
const MS = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.2, 1.4, 1.6, 1.8, 2, 2.5, 3, Infinity]
const NSX = Array.from({ length: 101 }, (_, i) => 10 ** (-2 + (i / 100) * 3))
export function FadumChart({ pts, w = 380 }: { pts?: [number, number][]; w?: number }) {
  return (
    <Chart w={w} h={270} x={{ min: 0.01, max: 10, log: true, label: 'n = L/z (log)' }} y={{ min: 0, max: 0.26, ticks: [0, 0.05, 0.1, 0.15, 0.2, 0.25], label: 'I' }} label="Fadum chart">
      {(s) => (
        <>
          {MS.map((m, i) => (
            <path key={i} d={pathOf(NSX.map((n) => [n, Irect(m === Infinity ? 1e6 : m, n)]), s)} fill="none" stroke={i % 2 ? 'var(--c-accent)' : 'var(--c-ink)'} strokeWidth={0.9} opacity={0.85} data-name={`m = ${m === Infinity ? '∞' : m}`} />
          ))}
          {MS.filter((m) => m > 0).map((m, i) => (
            <text key={i} x={s.R - 2} y={s.Y(Irect(m === Infinity ? 1e6 : m, 10)) - 1} fontSize={7} textAnchor="end" fill="var(--c-mute)">
              {m === Infinity ? '∞' : m}
            </text>
          ))}
          {pts?.map(([m, n], i) => (
            <circle key={i} cx={s.X(Math.min(10, Math.max(0.01, n)))} cy={s.Y(Irect(m, n))} r={3.5} fill={SERIES[(i + 1) % SERIES.length]} stroke="var(--c-bg)" data-tip={`m = ${f3(m)}, n = ${f3(n)} → I = ${f4(Irect(m, n))}`} />
          ))}
        </>
      )}
    </Chart>
  )
}
function FadumBody() {
  const used = useUsed('d-fadum')
  const [m, setM] = useState(0.6)
  const [n, setN] = useState(1.2)
  const pts = typeof used?.mn === 'string' && used.mn ? used.mn.split(';').map((p) => p.split(',').map(Number) as [number, number]) : undefined
  return (
    <>
      <Md>{R`Below a **corner** of a B × L rectangle: $\sigma_z = qI(m,n)$, $m = B/z$, $n = L/z$ (interchangeable),
$$I = \frac{1}{4\pi}\left[\frac{2mn\sqrt{m^2+n^2+1}}{m^2+n^2+1+m^2n^2}\cdot\frac{m^2+n^2+2}{m^2+n^2+1} + \tan^{-1}\frac{2mn\sqrt{m^2+n^2+1}}{m^2+n^2+1-m^2n^2}\right]$$
add π to the tan⁻¹ when $m^2n^2 > m^2+n^2+1$. Any other point: **superposition** of rectangles that each have a corner at the point (+ loaded, − fictitious). I → 0.25 as m, n → ∞.`}</Md>
      <FadumChart pts={pts} />
      <div className="text-[10px] text-faint">Curves m = 0.1 … 3.0 and ∞, as printed with 2020-21 (Fig. 3) and 2021-22 (p67).</div>
      <RT
        head={['m \\ n', '0.2', '0.4', '0.6', '0.8', '1.0', '1.5', '2.0', '3.0', '∞']}
        rows={[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1, 1.5, 2, 3].map((mm) => [String(mm), ...[0.2, 0.4, 0.6, 0.8, 1, 1.5, 2, 3, 1e6].map((nn) => f4(Irect(mm, nn)))])}
        hl={(i) => !!pts?.some(([a]) => Math.abs(a - [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1, 1.5, 2, 3][i]) < 0.051)}
      />
      {pts && <div className="text-[11px] text-faint mt-1">Lab points: {pts.map(([a, b]) => `(${f2(a)}, ${f2(b)})`).join(' ')}</div>}
      <Lookup result={ok(m) && ok(n) && m >= 0 && n >= 0 ? <span>I({f3(m)}, {f3(n)}) = <b>{f4(Irect(m, n))}</b>{piBranch(m, n) ? ' (+π branch used)' : ''}</span> : '—'}>
        <NumIn label="m = B/z" value={m} onChange={setM} step={0.1} w="w-14" />
        <NumIn label="n = L/z" value={n} onChange={setN} step={0.1} w="w-14" />
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- d-newmark
function NewmarkBody() {
  const [s, setS] = useState(0.5)
  return (
    <>
      <NewmarkChart size={340} showRadii />
      <Md className="text-xs">{R`From the circle formula: $R/z = \sqrt{(1-\sigma_z/q)^{-2/3} - 1}$. Each ring adds 0.1q; 20 sectors → each mesh = **0.005q**. **Use:** draw the plan to the scale **AB = z**, put the point at the centre, count meshes N (with fractions), $\sigma_z = I_f\,N\,q = 0.005Nq$. A new depth = a new plan scale (the chart itself is unchanged).`}</Md>
      <RT head={['σz/q', ...NEWMARK_RZ.map((_, i) => String((i + 1) / 10))]} rows={[['R/z', ...NEWMARK_RZ.map((v) => f3(v))]]} cap="σz/q = 1 → R/z = ∞ (the 10th ring runs to infinity). If AB = 3 cm the radii are 0.81, 1.20, 1.55, 1.91, 2.30, 2.75, 3.33, 4.16, 5.72 cm." />
      <Lookup result={ok(s) && s > 0 && s < 1 ? <span>R/z = <b>{f4(rzForRatio(s))}</b></span> : '0 < σz/q < 1'}>
        <NumIn label="σz/q" value={s} onChange={setS} step={0.05} w="w-14" />
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- d-osterberg
const BZ = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.2, 1.4, 1.6, 1.8, 2, 3, Infinity]
const AZ = Array.from({ length: 101 }, (_, i) => 10 ** (-2 + (i / 100) * 3))
function OsterbergBody() {
  const used = useUsed('d-osterberg')
  const [a, setA] = useState(10)
  const [b, setB] = useState(4)
  const [z, setZ] = useState(3)
  const pts = typeof used?.ab === 'string' && used.ab ? used.ab.split(';').map((p) => p.split(',').map(Number) as [number, number]) : []
  return (
    <>
      <Md>{R`Half embankment (flat top b, slope a, point under the inner edge of the slope at depth z): $\sigma_z = I_z q$, $q = \gamma H$,
$$I_z = \frac{1}{\pi}\left[\frac{a+b}{a}(\alpha_1+\alpha_2) - \frac{b}{a}\alpha_2\right],\quad \alpha_1+\alpha_2 = \tan^{-1}\frac{a+b}{z},\ \alpha_2 = \tan^{-1}\frac{b}{z}$$
Symmetric embankment, point under the centre: $2I_z$. Unsymmetric or off-centre: split at the vertical through the point and add the two blocks (Jan 2021 Q4(b)).`}</Md>
      <Chart w={380} h={260} x={{ min: 0.01, max: 10, log: true, label: 'a/z (log)' }} y={{ min: 0, max: 0.5, ticks: [0, 0.1, 0.2, 0.3, 0.4, 0.5], label: 'Iz' }} label="Osterberg chart">
        {(s) => (
          <>
            {BZ.map((bz, i) => (
              <path key={i} d={pathOf(AZ.map((az) => [az, osterberg(az, bz === Infinity ? 1e6 : bz, 1)]), s)} fill="none" stroke={i % 2 ? 'var(--c-accent)' : 'var(--c-ink)'} strokeWidth={0.9} data-name={`b/z = ${bz === Infinity ? '∞' : bz}`} />
            ))}
            {BZ.map((bz, i) => (
              <text key={'t' + i} x={s.L + 3} y={s.Y(osterberg(0.01, bz === Infinity ? 1e6 : bz, 1)) - 1} fontSize={7} fill="var(--c-mute)">
                {bz === Infinity ? '∞' : bz}
              </text>
            ))}
            {pts.map(([az, bz], i) => (
              <circle key={i} cx={s.X(Math.min(10, Math.max(0.01, az)))} cy={s.Y(osterberg(az, bz, 1))} r={3.5} fill={SERIES[(i + 1) % SERIES.length]} data-tip={`a/z = ${f3(az)}, b/z = ${f3(bz)} → I = ${f4(osterberg(az, bz, 1))}`} />
            ))}
          </>
        )}
      </Chart>
      <div className="text-[10px] text-faint">Curves b/z = 0 … 3.0 and ∞ (as printed with Jan 2021, Fig. 3).</div>
      <Lookup result={[a, b, z].every(ok) && z > 0 && a >= 0 && b >= 0 ? <span>a/z = {f3(a / z)}, b/z = {f3(b / z)} → Iz = <b>{f4(osterberg(a, b, z))}</b></span> : '—'}>
        <NumIn label="a" value={a} onChange={setA} step={1} unit="m" w="w-14" />
        <NumIn label="b" value={b} onChange={setB} step={1} unit="m" w="w-14" />
        <NumIn label="z" value={z} onChange={setZ} step={0.5} unit="m" w="w-14" />
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- d-steinbrenner
const LB = [1, 2, 5, 10, Infinity]
const ZB = Array.from({ length: 141 }, (_, i) => (i / 140) * 7)
function SteinBody() {
  const used = useUsed('d-steinbrenner')
  const [zb, setZb] = useState(3)
  const [lb, setLb] = useState(1.5)
  const u = used && num(used.zb) !== undefined ? ([num(used.zb)!, num(used.lb)!] as [number, number]) : null
  return (
    <>
      <Md>{R`Steinbrenner's form of the same corner factor: $I$ against $z/b$ for curves of $l/b$ (b = shorter side). Same as Fadum with $m = b/z = 1/(z/b)$, $n = l/z = (l/b)/(z/b)$.`}</Md>
      <Chart w={300} h={300} xTop x={{ min: 0, max: 0.25, ticks: [0, 0.05, 0.1, 0.15, 0.2, 0.25], label: 'I = σz/q' }} y={{ min: 0, max: 7, flip: true, ticks: [0, 1, 2, 3, 4, 5, 6, 7], label: 'z/b' }} label="Steinbrenner chart">
        {(s) => (
          <>
            {LB.map((l, i) => (
              <path key={i} d={pathOf(ZB.map((v) => [v === 0 ? 0.25 : Irect(1 / v, (l === Infinity ? 1e6 : l) / v), v]), s)} fill="none" stroke={SERIES[i]} strokeWidth={1.4} data-name={`L/B = ${l === Infinity ? '∞' : l}`} />
            ))}
            {u && <circle cx={s.X(Irect(1 / u[0], u[1] / u[0]))} cy={s.Y(u[0])} r={4} fill="var(--c-load)" data-tip={`z/b = ${f3(u[0])} → I = ${f4(Irect(1 / u[0], u[1] / u[0]))}`} />}
          </>
        )}
      </Chart>
      <Legend items={LB.map((l, i) => ({ c: SERIES[i], t: `l/b = ${l === Infinity ? '∞' : l}` }))} />
      <div className="text-[10px] text-faint">Printed with 2023-24 Q8(b) (Fig. 4): there is no l/b = 1.5 curve — read between 1 and 2 (formula: I(z/b = 3, l/b = 1.5) = 0.0612).</div>
      <Lookup result={ok(zb) && ok(lb) && zb > 0 && lb >= 1 ? <span>m = {f3(1 / zb)}, n = {f3(lb / zb)} → I = <b>{f4(Irect(1 / zb, lb / zb))}</b></span> : 'z/b > 0, l/b ≥ 1'}>
        <NumIn label="z/b" value={zb} onChange={setZb} step={0.5} w="w-14" />
        <NumIn label="l/b" value={lb} onChange={setLb} step={0.5} w="w-14" />
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- d-strip
const XB = [0, 0.25, 0.5, 0.75, 1, 1.5, 2]
const ZBs = [0.25, 0.5, 1, 1.5, 2, 3, 4, 5, 6]
function StripBody() {
  const used = useUsed('d-strip')
  const [B, setB] = useState(3)
  const [x, setX] = useState(0)
  const [z, setZ] = useState(3)
  const uz = num(used?.zB)
  return (
    <>
      <Md>{R`**Uniform strip** (width B, angles at the point: α subtended, δ to the near edge from the vertical): $\sigma_z = \dfrac{q}{\pi}[\alpha + \sin\alpha\cos(\alpha+2\delta)]$; centre line $\dfrac{q}{\pi}(\alpha + \sin\alpha)$.
**Triangular strip** (0 → q over B, x from the zero edge): $\sigma_z = \dfrac{q}{\pi}\left[\dfrac{x}{B}\alpha - \dfrac12\sin2\delta\right]$ (Das; angles as in his figure). Both come from integrating the line load $2q'z^3/[\pi(x^2+z^2)^2]$.`}</Md>
      <RT head={['z/B', ...XB.map((v) => `x/B = ${v}`)]} rows={ZBs.map((zz) => [String(zz), ...XB.map((xx) => f3(stripAt(1, 1, xx, zz)))])} hl={(i) => uz !== undefined && Math.abs(ZBs[i] - uz) < 0.13} cap="Uniform strip, σz/q (x from the centre line)." />
      <div className="mt-2" />
      <RT head={['z/B', ...[0, 0.25, 0.5, 0.75, 1, 1.25, 1.5].map((v) => `x/B = ${v}`)]} rows={ZBs.slice(0, 7).map((zz) => [String(zz), ...[0, 0.25, 0.5, 0.75, 1, 1.25, 1.5].map((xx) => f3(triStripAt(1, 1, xx, zz)))])} cap="Triangular strip, σz/q (x from the zero-load edge; the peak q is at x/B = 1)." />
      <Lookup result={[B, x, z].every(ok) && B > 0 && z > 0 ? <span>uniform σz/q = <b>{f4(stripAt(1, B, x, z))}</b> · triangular (x from the zero edge) σz/q = <b>{f4(triStripAt(1, B, x, z))}</b></span> : '—'}>
        <NumIn label="B" value={B} onChange={setB} step={0.5} unit="m" w="w-14" />
        <NumIn label="x" value={x} onChange={setX} step={0.5} unit="m" w="w-14" />
        <NumIn label="z" value={z} onChange={setZ} step={0.5} unit="m" w="w-14" />
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- d-circle
const ZR = [0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]
function CircleBody() {
  const used = useUsed('d-circle')
  const [Rr, setR] = useState(4)
  const [z, setZ] = useState(4)
  const [r, setr] = useState(0)
  const uzr = num(used?.zR)
  return (
    <>
      <Md>{R`Below the centre of a uniformly loaded circle (radius R): $\sigma_z = q\left\{1 - \left[\dfrac{1}{1+(R/z)^2}\right]^{3/2}\right\}$ (integrating the point load over rings). Annulus R1 … R2: difference of two circles. Off the centre: Newmark chart or the table (computed here numerically).`}</Md>
      <RT head={['z/R', 'centre', 'r/R = 0.5', 'r/R = 1 (edge)', 'r/R = 1.5', 'r/R = 2']} rows={ZR.map((v) => [String(v), f3(circleCentre(1, 1, v)), f3(circleAt(1, 1, 0.5, v, 30, 60)), f3(circleAt(1, 1, 1, v, 30, 60)), f3(circleAt(1, 1, 1.5, v, 30, 60)), f3(circleAt(1, 1, 2, v, 30, 60))])} hl={(i) => uzr !== undefined && Math.abs(ZR[i] - uzr) < 0.13} cap="σz/q. The edge value at shallow depth tends to 0.5." />
      <Lookup result={[Rr, z, r].every(ok) && Rr > 0 && z > 0 && r >= 0 ? <span>σz/q = <b>{f4(r === 0 ? circleCentre(1, Rr, z) : circleAt(1, Rr, r, z))}</b></span> : '—'}>
        <NumIn label="R" value={Rr} onChange={setR} step={0.5} unit="m" w="w-14" />
        <NumIn label="z" value={z} onChange={setZ} step={0.5} unit="m" w="w-14" />
        <NumIn label="r from centre" value={r} onChange={setr} step={0.5} unit="m" w="w-14" />
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- d-21
function TwoOneBody() {
  const [Q, setQ] = useState(250)
  const [B, setB] = useState(2)
  const [L, setL] = useState(3)
  const [z, setZ] = useState(3)
  return (
    <>
      <Md>{R`The load spreads at **2 (vertical) : 1 (horizontal)** from the edges of the base; the pressure is taken uniform on each plane (frustum of a pyramid or cone).
$$\text{rectangle: }\sigma_z = \frac{Q}{(B+z)(L+z)},\quad \text{circle: }\frac{Q}{\pi(D+z)^2/4},\quad \text{strip: }\frac{Q}{B+z}\ (Q\text{ per m})$$
z from the **base of the footing**. Gives the **average** stress on the plane (lower than Boussinesq under the centre, higher near the edges); good to roughly z = B … 3B. "1H:2V spread" in the circular-raft papers is the same: $\Delta p = qD^2/(D+z)^2$.`}</Md>
      <Lookup result={[Q, B, L, z].every(ok) && z >= 0 ? <span>rectangle <b>{f3(twoToOneRect(Q, B, L, z))}</b> · circle (D = B) {f3(twoToOneCircle(Q, B, z))} · strip (Q per m) {f3(twoToOneStrip(Q, B, z))} kPa</span> : '—'}>
        <NumIn label="Q" value={Q} onChange={setQ} step={10} unit="kN" w="w-16" />
        <NumIn label="B" value={B} onChange={setB} step={0.5} unit="m" w="w-14" />
        <NumIn label="L" value={L} onChange={setL} step={0.5} unit="m" w="w-14" />
        <NumIn label="z" value={z} onChange={setZ} step={0.5} unit="m" w="w-14" />
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- d-line
function LineBody() {
  const [q, setQ] = useState(100)
  const [L, setL] = useState(6)
  const [x, setX] = useState(0)
  const [z, setZ] = useState(3)
  return (
    <>
      <Md>{R`**Infinite line load** q′ (kN/m) at horizontal distance x: $\sigma_z = \dfrac{2q'z^3}{\pi(x^2+z^2)^2}$ (below it: $2q'/\pi z$).
**Finite line load**, length L, point at depth z below **one end**: $\sigma_z = \dfrac{q'L(3z^2+2L^2)}{2\pi z(z^2+L^2)^{3/2}}$ (→ $q'/\pi z$, half the infinite value, as L → ∞). Walls crossing at a point: add the segments that end there (2012-13 Q12(c)).`}</Md>
      <Lookup result={[q, L, x, z].every(ok) && z > 0 ? <span>infinite: <b>{f3(lineInfinite(q, x, z))}</b> kPa · finite, below one end: <b>{f3(lineEnd(q, L, z))}</b> kPa</span> : '—'}>
        <NumIn label="q′" value={q} onChange={setQ} step={10} unit="kN/m" w="w-16" />
        <NumIn label="L" value={L} onChange={setL} step={1} unit="m" w="w-14" />
        <NumIn label="x" value={x} onChange={setX} step={0.5} unit="m" w="w-14" />
        <NumIn label="z" value={z} onChange={setZ} step={0.5} unit="m" w="w-14" />
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- d-contact
export function ContactFig() {
  const W = 360
  const panel = (x0: number, title: string, shape: (x: number) => number, settle: (x: number) => number) => {
    const xs = Array.from({ length: 41 }, (_, i) => -1 + i / 20)
    const sx = (v: number) => x0 + 80 + v * 60
    return (
      <g>
        <text x={x0 + 80} y={12} fontSize={9} textAnchor="middle" fill="var(--c-ink)">
          {title}
        </text>
        <rect x={sx(-1)} y={20} width={120} height={8} fill="var(--c-mute)" opacity={0.5} />
        <path d={'M' + xs.map((v) => `${sx(v).toFixed(1)},${(30 + settle(v) * 14).toFixed(1)}`).join(' L')} fill="none" stroke="var(--c-water)" strokeWidth={1.2} strokeDasharray="3 2" />
        <path d={`M${sx(-1)},50 ` + xs.map((v) => `L${sx(v).toFixed(1)},${(50 + shape(v) * 26).toFixed(1)}`).join(' ') + ` L${sx(1)},50 Z`} fill="var(--c-load)" fillOpacity={0.2} stroke="var(--c-load)" />
      </g>
    )
  }
  return (
    <svg viewBox={`0 0 ${W} 200`} className="w-full" role="img" aria-label="contact pressure sketches">
      <g>
        {panel(0, 'Rigid on clay', (v) => Math.min(1.5, 0.45 / Math.sqrt(Math.max(0.02, 1 - v * v))), () => 0.6)}
        {panel(180, 'Rigid on sand', (v) => 1.1 * (1 - v * v), () => 0.6)}
      </g>
      <g transform="translate(0,100)">
        {panel(0, 'Flexible on clay', () => 0.7, (v) => 0.3 + 0.7 * (1 - v * v))}
        {panel(180, 'Flexible on sand', () => 0.7, (v) => 0.3 + 0.7 * v * v)}
      </g>
    </svg>
  )
}
function ContactBody() {
  return (
    <>
      <ContactFig />
      <Legend items={[{ c: 'var(--c-load)', t: 'contact pressure' }, { c: 'var(--c-water)', t: 'settled base', dash: true }]} />
      <Md className="text-xs">{R`**Contact pressure** = pressure between the base of the foundation and the soil. Depends on the flexural rigidity of the footing, the soil type and its elastic properties, the load intensity, the size and the depth of embedment.
- **Flexible** footing, uniform load: contact pressure **uniform** on both soils; settlement **dish-shaped** on clay (max at the centre), **inverted dish** on sand (edges settle more — little confinement there).
- **Rigid** footing: settlement **uniform**; contact pressure on **clay** is minimum at the centre and very high at the edges; on **sand** it is **parabolic**, zero at the edges and maximum at the centre (the peak grows with the load).
- Real footings lie between; design assumes a uniform contact pressure and the factor of safety covers the difference.`}</Md>
    </>
  )
}

// ---------------------------------------------------------------- st-stress
function StepsBody() {
  return (
    <Md>{R`**Vertical stress at a point**
1. Which load? Point (Boussinesq KB), line, strip / triangle, embankment (Osterberg), circle, rectangle (Fadum / Steinbrenner), irregular (Newmark), or approximate (2:1).
2. z from the **loaded surface** (footing base) to the point.
3. Rectangles: split into rectangles that each have a **corner** at the point; outside points → add and subtract fictitious rectangles; m = B/z, n = L/z, σz = qΣ(±I).
4. Embankment: split at the vertical through the point; a/z, b/z for each block; symmetric centre → 2I.
5. Newmark: plan drawn to AB = z, point at the centre, count N, σz = 0.005Nq.
6. Several loads: add the contributions (superposition).`}</Md>
  )
}

export const SD_ITEMS: SmRefItem[] = [
  { id: 'd-kb', group: 'sd', title: 'Boussinesq KB (and Westergaard KW) table', tag: 'Lectures 21, 25', exam: true, keywords: 'point load boussinesq westergaard influence factor 0.4775 0.8165 39 0.0888', Body: KbBody },
  { id: 'd-fadum', group: 'sd', title: "Fadum's chart I(m, n) — rectangle corner", tag: 'printed 2020-21, 2021-22', exam: true, keywords: 'rectangle corner newmark influence coefficient m n superposition fadum', Body: FadumBody },
  { id: 'd-newmark', group: 'sd', title: "Newmark's influence chart (0.005, 200 meshes)", tag: 'printed 2021-22, 2023-24', exam: true, keywords: 'newmark chart mesh influence value 0.005 AB circles 0.270 1.908', Body: NewmarkBody },
  { id: 'd-osterberg', group: 'sd', title: "Osterberg's embankment chart", tag: 'printed Jan 2021', exam: true, keywords: 'embankment osterberg a/z b/z trapezoidal Iz', Body: OsterbergBody },
  { id: 'd-steinbrenner', group: 'sd', title: "Steinbrenner's chart (I vs z/b)", tag: 'printed 2023-24', exam: true, keywords: 'steinbrenner rectangle corner z/b l/b', Body: SteinBody },
  { id: 'd-strip', group: 'sd', title: 'Strip and triangular-strip tables', tag: 'Das Table 10.x, Lecture 22–23', keywords: 'strip load triangular strip alpha delta infinite length', Body: StripBody },
  { id: 'd-circle', group: 'sd', title: 'Uniformly loaded circle (below the centre and off it)', tag: 'Lecture 22', keywords: 'circular footing raft tank circle annulus', Body: CircleBody },
  { id: 'd-21', group: 'sd', title: '2:1 load dispersion', tag: 'Lecture 24', keywords: 'two to one dispersion approximate 2V 1H frustum', Body: TwoOneBody },
  { id: 'd-line', group: 'sd', title: 'Line loads: infinite and finite', tag: 'Lecture 21; 2012-13', keywords: 'line load wall finite end', Body: LineBody },
  { id: 'd-contact', group: 'sd', title: 'Contact pressure: rigid and flexible, sand and clay', tag: 'Lecture 25', keywords: 'contact pressure rigid flexible footing sand clay settlement profile', Body: ContactBody },
  { id: 'st-stress', group: 'steps', title: 'Steps: vertical stress below a loaded area', keywords: 'stress distribution steps checklist superposition', Body: StepsBody },
]

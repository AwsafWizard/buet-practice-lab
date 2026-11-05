// Chart pane, consolidation (k-) items: Tv–U, Cc / Cs correlations, cv fitting, Barron's chart, settlement formulas.
// Every chart is drawn from its formula (SJMY sir Lectures 15–20, Question Bank formula sheet).
import { useState } from 'react'
import { fmt } from '../../components/DiagramView'
import { Md } from '../../components/ui'
import { Lookup, NumIn, ok, RT } from '../../reference/common'
import {
  CC_CORRELATIONS,
  cvCasagrande,
  cvTaylor,
  deFromSpacing,
  Fn,
  genDial,
  secondary,
  settlePrimary,
  tvApprox,
  tvFromTable,
  tvFromU,
  TV_TABLE,
  uApprox,
  uFromTv,
  urBarron,
  type DrainPattern,
} from '../engine/consolidation'
import { Chart, Legend, pathOf, SERIES } from '../topics/consol/plot'
import { useUsed, type SmRefItem } from './pane'

const f2 = (v: number) => fmt(v, 2)
const f3 = (v: number) => fmt(v, 3)
const f4 = (v: number) => fmt(v, 4)
const R = String.raw

// ---------------------------------------------------------------- k-tvu
const TVS = Array.from({ length: 121 }, (_, i) => 10 ** (-3 + (i / 120) * 3.4))
export function TvUChart({ U, w = 360 }: { U?: number; w?: number }) {
  return (
    <Chart w={w} h={240} x={{ min: 0.001, max: 2.5, log: true, label: 'Time factor Tv (log scale)' }} y={{ min: 0, max: 100, flip: true, label: 'U (%)', ticks: [0, 20, 40, 60, 80, 100] }} label="Tv versus U curve">
      {(s) => (
        <>
          <path d={pathOf(TVS.map((t) => [t, 100 * uFromTv(t)]), s)} fill="none" stroke="var(--c-accent)" strokeWidth={1.8} />
          <path d={pathOf(TVS.filter((t) => t < 0.3).map((t) => [t, uApprox(t)]), s)} fill="none" stroke="var(--c-load)" strokeWidth={1} strokeDasharray="4 3" />
          {TV_TABLE.slice(1).map(([u, t]) => (
            <circle key={u} cx={s.X(t)} cy={s.Y(u)} r={2.4} fill="var(--c-ink)" />
          ))}
          {U !== undefined && U > 0 && U < 100 && (
            <g>
              <line x1={s.L} x2={s.X(tvFromU(U / 100))} y1={s.Y(U)} y2={s.Y(U)} stroke="var(--c-load)" strokeDasharray="3 2" />
              <line x1={s.X(tvFromU(U / 100))} x2={s.X(tvFromU(U / 100))} y1={s.Y(U)} y2={s.B} stroke="var(--c-load)" strokeDasharray="3 2" />
              <circle cx={s.X(tvFromU(U / 100))} cy={s.Y(U)} r={3.5} fill="var(--c-load)" />
            </g>
          )}
        </>
      )}
    </Chart>
  )
}
function TvuBody() {
  const used = useUsed('k-tvu')
  const uUsed = typeof used?.U === 'number' ? used.U : undefined
  const [U, setU] = useState(60)
  const [Tv, setTv] = useState(0.3)
  const nearRow = uUsed === undefined ? -1 : Math.round(uUsed / 10)
  return (
    <>
      <Md>{R`$$U = 1 - \sum_{m=0}^{\infty}\frac{2}{M^2}e^{-M^2T_v},\quad M = \tfrac{(2m+1)\pi}{2},\qquad T_v = \frac{c_vt}{d^2},\ d = H/2\ \text{(two-way)},\ H\ \text{(one-way)}$$
$$U<60\%:\ T_v = \frac{\pi}{4}U^2\qquad U\ge 60\%:\ T_v = 1.781 - 0.933\log(100-U\%)$$`}</Md>
      <TvUChart U={uUsed} />
      <Legend items={[{ c: 'var(--c-accent)', t: 'exact series' }, { c: 'var(--c-load)', t: '(π/4)U² (U < 60 %)', dash: true }, { c: 'var(--c-ink)', t: 'printed table' }]} />
      <RT
        head={['U %', 'Tv (printed)', 'Tv exact', 'Tv approx.']}
        rows={[...TV_TABLE.slice(1), [100, Infinity] as [number, number]].map(([u, t]) => [String(u), Number.isFinite(t) ? String(t) : '∞', u < 100 ? f4(tvFromU(u / 100)) : '∞', u < 100 ? f4(tvApprox(u)) : '∞'])}
        hl={(i) => i + 1 === nearRow}
        cap="As printed with 2021-22 Q1(b) and 2023-24 Q7(b). Between rows the handnote interpolates linearly (Tv(75) = 0.485, Tv(65) = 0.345); the formulas give 0.477 and 0.340 — say which you used."
      />
      {uUsed !== undefined && <div className="text-[11px] text-faint mt-1">Lab: U = {f2(uUsed)} %</div>}
      <Lookup
        result={
          ok(U) && U > 0 && U < 100 && ok(Tv) && Tv > 0 ? (
            <span>
              U = {f2(U)} % → Tv = <b>{f4(tvFromU(U / 100))}</b> (formula {f4(tvApprox(U))}, table {f4(tvFromTable(U))}) · Tv = {f3(Tv)} → U = <b>{f2(100 * uFromTv(Tv))} %</b> (formula {f2(uApprox(Tv))} %)
            </span>
          ) : (
            '0 < U < 100, Tv > 0'
          )
        }
      >
        <NumIn label="U" value={U} onChange={setU} step={5} unit="%" w="w-14" />
        <NumIn label="Tv" value={Tv} onChange={setTv} step={0.05} w="w-16" />
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- k-cc
function CcBody() {
  const used = useUsed('k-cc')
  const [LL, setLL] = useState(45)
  const [e0, setE0] = useState(1.0)
  const [w, setW] = useState(40)
  const val = (c: (typeof CC_CORRELATIONS)[number]) => c.f(c.on === 'LL' ? LL : c.on === 'e0' ? e0 : w)
  return (
    <>
      <RT
        head={['Cc =', 'For (Das Table 11.6)', 'Lookup']}
        rows={CC_CORRELATIONS.map((c) => [c.formula, c.who, ok(val(c)) ? f3(val(c)) : '—'])}
        hl={(i) => !!used && used.key === CC_CORRELATIONS[i].key}
        cap="The handnote and papers use Cc = 0.009(LL − 10) (undisturbed) and 0.007(LL − 10) (remoulded). Typical Cc: 0.2–0.5 for clays, above 1 for organic soils."
      />
      <Md className="text-xs mt-2">{R`- **Swell / recompression index:** $C_s \approx C_c/5$ to $C_c/10$ when not given (the handnote takes **Cc/6** in 2020-21 Q3(a) and shows Cc/10 as the check). Nagaraj & Murty: $C_s = 0.0463(LL/100)G_s$. From a test: slope of the unload (or reload) branch, $C_s = \Delta e/\log(p_1/p_2)$.
- **Cc from a test:** slope of the straight virgin part, $C_c = (e_1 - e_2)/\log(p_2/p_1)$.
- $a_v = \Delta e/\Delta p$ (m²/kN), $m_v = a_v/(1 + e_0)$; both fall as the stress rises. Constrained modulus $E_v = 1/m_v$.
- **e0** of a saturated clay = $wG_s$.`}</Md>
      <Lookup result={ok(LL) && ok(e0) && ok(w) ? <span>0.009(LL − 10) = <b>{f3(0.009 * (LL - 10))}</b> · Cs ≈ {f3((0.009 * (LL - 10)) / 5)}–{f3((0.009 * (LL - 10)) / 10)} (Cc/6 = {f3((0.009 * (LL - 10)) / 6)})</span> : '—'}>
        <NumIn label="LL" value={LL} onChange={setLL} step={1} w="w-14" />
        <NumIn label="e0" value={e0} onChange={setE0} step={0.05} w="w-14" />
        <NumIn label="wN" value={w} onChange={setW} step={1} unit="%" w="w-14" />
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- k-fit
const DEMO = genDial({ cv: 0.5, d: 10, di: 0.05, dp: 1.2, ds: 0.05 })
function FitBody() {
  const used = useUsed('k-fit')
  const [d, setD] = useState(10)
  const [t90, setT90] = useState(170)
  const [t50, setT50] = useState(40)
  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <Chart w={200} h={150} pad={{ l: 30, r: 6, t: 8, b: 26 }} x={{ min: 0, max: 40, label: '√t (√min)', ticks: [0, 10, 20, 30, 40] }} y={{ min: 0, max: 1.5, flip: true, ticks: [0, 0.5, 1, 1.5] }} label="square-root-of-time plot">
          {(s) => <path d={pathOf(DEMO.map((q) => [Math.sqrt(q.t), q.d]), s)} fill="none" stroke="var(--c-accent)" strokeWidth={1.6} />}
        </Chart>
        <Chart w={200} h={150} pad={{ l: 30, r: 6, t: 8, b: 26 }} x={{ min: 0.1, max: 3000, log: true, label: 't (min, log)', minor: false }} y={{ min: 0, max: 1.5, flip: true, ticks: [0, 0.5, 1, 1.5] }} label="log-time plot">
          {(s) => <path d={pathOf(DEMO.map((q) => [q.t, q.d]), s)} fill="none" stroke="var(--c-accent)" strokeWidth={1.6} />}
        </Chart>
      </div>
      <Md className="text-xs">{R`**Taylor (√t):** plot dial reading vs √t → extend the initial straight line back to √t = 0: **d0** → draw a second line from d0 with abscissae **1.15×** those of the first → it cuts the curve at **√t90** → $c_v = 0.848\,d^2/t_{90}$. (Why 1.15: the early straight line U = 1.128√Tv would reach U = 90 % at √Tv = 0.798; the true curve reaches it at √0.848 = 0.921, and 0.921/0.798 = 1.15.)

**Casagrande (log t):** plot dial reading vs log t → **d0**: pick t1 and 4t1 on the early (parabolic) part; d0 = d(t1) − [d(4t1) − d(t1)] → **d100**: intersect the tangent at the steepest part with the secondary straight line → **d50 = (d0 + d100)/2** → t50 → $c_v = 0.197\,d^2/t_{50}$. The final slope also gives **Cα**.

**d** = half the specimen thickness for double drainage (specimen thickness at that increment). Compare (2023-24 Q6(a)): log t needs long readings (> 24 h) but gives d100 and Cα; √t is quick, works when the S-shape is missing (silty clays), usually gives the **larger** cv; lab cv is usually lower than field cv.`}</Md>
      <Lookup result={[d, t90, t50].every(ok) && t90 > 0 && t50 > 0 ? <span>Taylor cv = <b>{fmt(cvTaylor(d, t90), 4)}</b> · Casagrande cv = <b>{fmt(cvCasagrande(d, t50), 4)}</b> (d² units per t unit)</span> : '—'}>
        <NumIn label="d" value={d} onChange={setD} step={1} unit="mm" w="w-14" />
        <NumIn label="t90" value={t90} onChange={setT90} step={5} unit="min" w="w-16" />
        <NumIn label="t50" value={t50} onChange={setT50} step={5} unit="min" w="w-16" />
      </Lookup>
      {used && <div className="text-[11px] text-faint mt-1">Lab: {Object.entries(used).map(([k, v]) => `${k} = ${typeof v === 'number' ? fmt(v, 3) : v}`).join(', ')}</div>}
    </>
  )
}

// ---------------------------------------------------------------- k-barron
const NS = [5, 10, 15, 20, 25, 40, 100]
const TRS = Array.from({ length: 81 }, (_, i) => 10 ** (-3 + (i / 80) * 3.3))
export function BarronChart({ n, Tr, w = 360 }: { n?: number; Tr?: number; w?: number }) {
  return (
    <Chart w={w} h={240} x={{ min: 0.001, max: 2, log: true, label: 'Tr = cvr t / de² (log)' }} y={{ min: 0, max: 100, flip: true, label: 'Ur (%)', ticks: [0, 20, 40, 60, 80, 100] }} label="Barron chart">
      {(s) => (
        <>
          {NS.map((k, i) => (
            <path key={k} d={pathOf(TRS.map((t) => [t, 100 * urBarron(t, k)]), s)} fill="none" stroke={SERIES[i % SERIES.length]} strokeWidth={1.2} />
          ))}
          {n !== undefined && n > 1 && <path d={pathOf(TRS.map((t) => [t, 100 * urBarron(t, n)]), s)} fill="none" stroke="var(--c-ink)" strokeWidth={2} strokeDasharray="5 3" />}
          {n !== undefined && Tr !== undefined && n > 1 && Tr > 0 && <circle cx={s.X(Tr)} cy={s.Y(100 * urBarron(Tr, n))} r={4} fill="var(--c-load)" />}
        </>
      )}
    </Chart>
  )
}
function BarronBody() {
  const used = useUsed('k-barron')
  const [sp, setSp] = useState(3)
  const [pat, setPat] = useState<DrainPattern>('square')
  const [rw, setRw] = useState(0.15)
  const [Tr, setTr] = useState(0.154)
  const de = deFromSpacing(sp, pat)
  const n = de / 2 / rw
  const un = typeof used?.n === 'number' ? used.n : undefined
  const ut = typeof used?.Tr === 'number' ? used.Tr : undefined
  return (
    <>
      <Md>{R`Equal strain, no smear: $U_r = 1 - \exp\!\left[\dfrac{-8T_r}{F(n)}\right]$, $F(n) = \dfrac{n^2}{n^2-1}\ln n - \dfrac{3n^2-1}{4n^2}$, $n = r_e/r_w$, $T_r = c_{vr}t/d_e^2$, $d_e = 1.05s$ (triangular) or $1.128s$ (square). Combined: $U = 1 - (1-U_v)(1-U_r)$.`}</Md>
      <BarronChart n={un ?? n} Tr={ut ?? Tr} />
      <Legend items={NS.map((k, i) => ({ c: SERIES[i % SERIES.length], t: `n = ${k}` }))} />
      <div className="text-[11px] leading-snug text-load mt-1">SJMY's Lecture 20 slide labels de = 0.525s (triangular) and 0.564s (square): those are re = de/2. Use de = 1.05s / 1.128s in Tr = cvr t/de².</div>
      <RT head={['n', 'F(n)', 'Tr for Ur = 50 %', 'Tr for Ur = 90 %']} rows={NS.map((k) => [String(k), f3(Fn(k)), f3((Math.LN2 * Fn(k)) / 8), f3((Math.log(10) * Fn(k)) / 8)])} hl={(i) => un !== undefined && Math.abs(NS[i] - un) / un < 0.25} />
      <Lookup result={[sp, rw, Tr].every(ok) && n > 1 && Tr > 0 ? <span>de = {f3(de)} m, re = {f3(de / 2)} m, n = <b>{f2(n)}</b>, F(n) = {f3(Fn(n))} → Ur = <b>{f2(100 * urBarron(Tr, n))} %</b></span> : '—'}>
        <NumIn label="s" value={sp} onChange={setSp} step={0.25} unit="m" w="w-14" />
        <select className="field !py-0.5 !text-xs" value={pat} onChange={(e) => setPat(e.target.value as DrainPattern)}>
          <option value="square">square</option>
          <option value="triangular">triangular</option>
        </select>
        <NumIn label="rw" value={rw} onChange={setRw} step={0.025} unit="m" w="w-16" />
        <NumIn label="Tr" value={Tr} onChange={setTr} step={0.02} w="w-16" />
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- k-settle
function SettleBody() {
  const used = useUsed('k-settle')
  const [o, setO] = useState({ Cc: 0.36, Cs: 0.06, H: 6, e0: 0.95, p0: 101.6, dp: 72, pc: 150 })
  const set = (k: keyof typeof o) => (v: number) => setO({ ...o, [k]: v })
  const r = [o.Cc, o.Cs, o.H, o.e0, o.p0, o.dp].every(ok) && o.p0 > 0 ? settlePrimary({ ...o, pc: ok(o.pc) && o.pc > 0 ? o.pc : null }) : null
  const [sec, setSec] = useState({ Ca: 0.02, ep: 0.76, H: 8.5, t1: 1.5, t2: 6.5 })
  const ss = secondary(sec)
  return (
    <>
      <Md>{R`$$S = \frac{\Delta e\,H}{1+e_0} = m_v\,\Delta p\,H,\qquad OCR = p_c'/p_0'$$
- **NC:** $S = \dfrac{C_cH}{1+e_0}\log\dfrac{p_0'+\Delta p}{p_0'}$
- **OC, $p_0' + \Delta p \le p_c'$:** $S = \dfrac{C_sH}{1+e_0}\log\dfrac{p_0'+\Delta p}{p_0'}$
- **OC, $p_0' + \Delta p > p_c'$:** $S = \dfrac{C_sH}{1+e_0}\log\dfrac{p_c'}{p_0'} + \dfrac{C_cH}{1+e_0}\log\dfrac{p_0'+\Delta p}{p_c'}$ (SJMY: strictly $1+e_c$ in the second term; most books and the handnote keep $1+e_0$).
- $p_0'$ at **mid-depth** of each clay layer (or sub-layers for thick layers); $\Delta p$ at mid-depth or **Simpson** $(\Delta p_t + 4\Delta p_m + \Delta p_b)/6$ under a footing; wide fill: $\Delta p = \gamma h$ everywhere.
- From an e–p table: e0 at $p_0'$ and e1 at $p_0'+\Delta p$ by **log interpolation**, $S = (e_0 - e_1)H/(1+e_0)$.
- **Secondary:** $C_\alpha = \Delta e/\log(t_2/t_1)$, $C_\alpha' = C_\alpha/(1+e_p)$, $S_s = C_\alpha' H\log(t_2/t_1)$, $e_p$ = void ratio at the end of primary.`}</Md>
      <Lookup
        result={
          r ? (
            <span>
              {r.branch === 'nc' ? 'NC' : r.branch === 'recomp' ? 'OC, stays below pc′ (Cs only)' : 'OC, crosses pc′ (Cs then Cc)'} · p0′ + Δp = {f2(r.p1)} · S = <b>{fmt(r.S * 1000, 1)} mm</b>
              {r.terms.length > 1 && ` (${fmt(r.terms[0].S * 1000, 1)} + ${fmt(r.terms[1].S * 1000, 1)})`}
            </span>
          ) : (
            '—'
          )
        }
      >
        {(['Cc', 'Cs', 'H', 'e0', 'p0', 'dp', 'pc'] as const).map((k) => (
          <NumIn key={k} label={k === 'p0' ? 'p0′' : k === 'dp' ? 'Δp' : k === 'pc' ? 'pc′ (0 = NC)' : k} value={o[k]} onChange={set(k)} step={k === 'Cc' || k === 'Cs' || k === 'e0' ? 0.01 : 1} w="w-14" />
        ))}
      </Lookup>
      <Lookup result={ok(ss.S) ? <span>Cα′ = {fmt(ss.Cap, 5)} · Ss = <b>{fmt(ss.S, 4)}</b> (units of H)</span> : '—'}>
        {(['Ca', 'ep', 'H', 't1', 't2'] as const).map((k) => (
          <NumIn key={k} label={k === 'Ca' ? 'Cα' : k === 'ep' ? 'ep' : k} value={sec[k]} onChange={(v) => setSec({ ...sec, [k]: v })} step={k === 'Ca' ? 0.005 : 0.1} w="w-14" />
        ))}
      </Lookup>
      {used && <div className="text-[11px] text-faint mt-1">Lab: {String(used.branch ?? '')}</div>}
    </>
  )
}

// ---------------------------------------------------------------- st-consol
function StepsBody() {
  return (
    <Md>{R`**Settlement of a clay layer**
1. Sketch the profile: layers, WT, the load (fill or footing at its depth).
2. Clay data: e0 = wGs, γsat = (Gs + e0)γw/(1 + e0), Cc = 0.009(LL − 10), Cs (given / loop / Cc/5–Cc/10).
3. p0′ at the mid-depth of each clay layer (γ′ below the WT).
4. Δp: wide fill = γh; footing = 2:1 or Boussinesq / Fadum / circle formula — at the middle, or Simpson's average.
5. NC or OC? Compare p0′ with pc′ (OCR), then whether p0′ + Δp crosses pc′.
6. S by the right formula (or Δe from the e–p table); add the layers.

**Time rate**
1. d = H/2 (sand both sides) or H (impervious one side).
2. cv: given, from √t / log t, or k/(mvγw).
3. Time for S_t: U = S_t/S → Tv (table / formula) → t = Tv d²/cv.
4. S at time t: Tv = cvt/d² → U → S_t = U S.
5. Same soil, same U: t₂ = t₁(d₂/d₁)²(cv₁/cv₂).`}</Md>
  )
}

export const CON_ITEMS: SmRefItem[] = [
  { id: 'k-tvu', group: 'con', title: 'Tv–U table and curve', tag: 'printed with 2021-22, 2023-24', exam: true, keywords: 'time factor degree of consolidation table 0.197 0.848 pi/4 1.781 0.933', Body: TvuBody },
  { id: 'k-cc', group: 'con', title: 'Cc and Cs correlations, av, mv', tag: 'Das Table 11.6', keywords: 'compression index swell index skempton liquid limit 0.009 0.007 Nishida av mv', Body: CcBody },
  { id: 'k-fit', group: 'con', title: 'cv by √t (Taylor) and log t (Casagrande)', tag: 'Lecture 19', keywords: 'coefficient of consolidation t90 t50 0.848 0.197 1.15 d0 d100', Body: FitBody },
  { id: 'k-barron', group: 'con', title: "Barron's chart: Ur vs Tr (sand drains)", tag: 'Lecture 20; printed 2012-13', exam: true, keywords: 'sand drain radial consolidation equal strain de 1.128 1.05 n re rw Tr Ur', Body: BarronBody },
  { id: 'k-settle', group: 'con', title: 'Settlement formulas (NC, OC both branches, secondary)', tag: 'formula sheet', keywords: 'primary consolidation settlement NC OC pc OCR Simpson secondary C alpha', Body: SettleBody },
  { id: 'st-consol', group: 'steps', title: 'Steps: consolidation settlement and time', keywords: 'consolidation settlement steps checklist time rate', Body: StepsBody },
]

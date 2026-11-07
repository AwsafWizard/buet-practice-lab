// Practice problem on a lecture topic never asked in the 13 past papers: sand drains — free strain vs equal strain, the
// smear zone (concept), and the equal-strain solution with and without smear (SJMY sir, Lecture 20; Das ASM pp. 319–327).
import { fmt } from '../../../components/DiagramView'
import { Md } from '../../../components/ui'
import { combinedU, mSmear, sandDrain, trForUr, urSmear } from '../../engine/consolidation'
import { BarronChart } from '../../reference/con'
import type { SmQ } from '../../types'

const NOT_ASKED = 'Not asked in any past paper (2007-08 → 2023-24) but taught in the lectures — a fresh question this year could come from here.'
const f2 = (v: number) => fmt(v, 2)
const f3 = (v: number) => fmt(v, 3)
const f4 = (v: number) => fmt(v, 4)

const D = { H: 10, cv: 2.5, s: 2.5, rw: 0.15, rs: 0.3, khks: 3, t: 0.5 }
const run = () => {
  const r = sandDrain({ s: D.s, pattern: 'triangular', rw: D.rw, cv: D.cv, t: D.t, dv: D.H / 2 })
  const S = D.rs / D.rw
  const m = mSmear(r.n, S, D.khks)
  const urs = urSmear(r.Tr, r.n, S, D.khks)
  // time for Ur = 90 %: Tr = −ln(0.1)·m/8 (no smear: m = F(n))
  const t90 = (trForUr(0.9, r.n) * r.de * r.de) / D.cv
  const t90s = ((-Math.log(0.1) * m) / 8) * ((r.de * r.de) / D.cv)
  return { r, S, m, urs, Us: combinedU(r.Uv, urs), t90, t90s }
}

/** plan of one drain: well rw, smear zone to rs, zone of influence re; and the two surcharge idealisations */
function DrainFigs() {
  const cx = 95
  const cy = 95
  const k = 55 // px per m
  const { r } = run()
  return (
    <svg viewBox="0 0 470 200" style={{ width: 470, maxWidth: '100%' }} role="img" aria-label="sand drain plan and strain cases">
      <circle cx={cx} cy={cy} r={r.re * k} fill="var(--c-soil)" opacity={0.3} stroke="var(--c-mute)" strokeDasharray="4 3" />
      <circle cx={cx} cy={cy} r={D.rs * k} fill="var(--c-load)" opacity={0.3} />
      <circle cx={cx} cy={cy} r={D.rw * k} fill="var(--c-water)" opacity={0.6} />
      <line x1={cx} y1={cy} x2={cx + r.re * k} y2={cy} stroke="var(--c-ink)" strokeWidth={0.8} />
      <text x={cx + r.re * k - 2} y={cy - 4} fontSize={9.5} textAnchor="end" fill="var(--c-ink)">
        re = {f3(r.re)} m
      </text>
      <text x={cx} y={cy + D.rs * k + 12} fontSize={9.5} textAnchor="middle" fill="var(--c-load)">
        smear zone rs = {D.rs} m
      </text>
      <text x={cx} y={cy + 4} fontSize={8.5} textAnchor="middle" fill="var(--c-ink)">
        rw
      </text>
      <text x={cx} y={190} fontSize={9.5} textAnchor="middle" fill="var(--c-mute)">
        plan: one drain's zone of influence
      </text>
      {/* free strain: flexible fill, uniform pressure, dished surface */}
      <g transform="translate(200,20)">
        <text x={60} y={0} fontSize={10} textAnchor="middle" fill="var(--c-ink)">
          Free strain (flexible load)
        </text>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <line key={i} x1={10 + i * 17} y1={12} x2={10 + i * 17} y2={30} stroke="var(--c-load)" />
        ))}
        <path d="M 6 36 Q 60 62 114 36" fill="none" stroke="var(--c-ink)" strokeWidth={1.5} />
        <rect x={6} y={36} width={6} height={110} fill="var(--c-water)" opacity={0.6} />
        <rect x={108} y={36} width={6} height={110} fill="var(--c-water)" opacity={0.6} />
        <text x={60} y={80} fontSize={9} textAnchor="middle" fill="var(--c-mute)">
          uniform σ,
        </text>
        <text x={60} y={92} fontSize={9} textAnchor="middle" fill="var(--c-mute)">
          uneven settlement
        </text>
      </g>
      {/* equal strain: rigid load, flat surface, non-uniform pressure */}
      <g transform="translate(335,20)">
        <text x={60} y={0} fontSize={10} textAnchor="middle" fill="var(--c-ink)">
          Equal strain (rigid load)
        </text>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => {
          const h = 8 + 14 * Math.abs(i - 3) / 3
          return <line key={i} x1={10 + i * 17} y1={30 - h} x2={10 + i * 17} y2={30} stroke="var(--c-load)" />
        })}
        <line x1={6} y1={44} x2={114} y2={44} stroke="var(--c-ink)" strokeWidth={1.5} />
        <rect x={6} y={44} width={6} height={102} fill="var(--c-water)" opacity={0.6} />
        <rect x={108} y={44} width={6} height={102} fill="var(--c-water)" opacity={0.6} />
        <text x={60} y={80} fontSize={9} textAnchor="middle" fill="var(--c-mute)">
          equal settlement,
        </text>
        <text x={60} y={92} fontSize={9} textAnchor="middle" fill="var(--c-mute)">
          uneven σ
        </text>
      </g>
    </svg>
  )
}

export const CONSOL_NEW: SmQ[] = [
  {
    id: 'sm-own-consol-new1',
    paper: 'own',
    level: 'challenge',
    sec: 'B',
    no: 'N1',
    marks: 0,
    topics: ['sm-consol'],
    title: 'Sand drains: free vs equal strain, and the effect of smear · not asked yet',
    text: `*${NOT_ASKED}*

(a) Distinguish between the free-strain and equal-strain solutions for radial consolidation towards a sand drain. What is the smear zone, how is it formed, and how does it affect the rate of consolidation?

(b) A ${D.H} m thick soft clay lies between two sand layers and is to be preloaded by a wide fill. Sand drains ${D.rw * 200} cm in diameter are installed in a triangular pattern at ${D.s} m centres. cv = ch = ${D.cv} m²/year. Using the equal-strain solution, find the average degree of consolidation 6 months after loading (i) ignoring smear and (ii) allowing for a smear zone of radius ${D.rs} m in which the horizontal permeability is 1/${D.khks} of the undisturbed value.

(c) How long does radial drainage alone take to reach 90 % in each case?`,
    pages: [],
    figure: () => <DrainFigs />,
    checks: () => {
      const x = run()
      return [
        { key: 'n', label: 'n = re/rw', value: x.r.n },
        { key: 'tr', label: 'Tr', value: x.r.Tr },
        { key: 'ur', label: 'Ur, no smear', value: x.r.Ur * 100, unit: '%' },
        { key: 'm', label: 'm (with smear)', value: x.m },
        { key: 'urs', label: 'Ur, with smear', value: x.urs * 100, unit: '%' },
        { key: 'u', label: 'U (combined), no smear', value: x.r.U * 100, unit: '%' },
        { key: 'us', label: 'U (combined), with smear', value: x.Us * 100, unit: '%' },
        { key: 't90s', label: 'time for Ur = 90 % with smear', value: x.t90s, unit: 'yr' },
      ]
    },
    solution: () => {
      const x = run()
      const r = x.r
      return (
        <div className="space-y-2 text-sm">
          <Md>{`**(a) Free strain vs equal strain** (SJMY sir, Lecture 20).
- **Free strain:** the surcharge is **flexible**, so the surface load stays uniform; because the clay near the drain consolidates first, the surface settles **unevenly** (dishes between the drains). Barron's solution involves Bessel functions — used through a chart or table.
- **Equal strain:** the surcharge is **rigid**, so every point of the surface settles **equally**; the stress on the clay is then **not uniform**. The solution is in closed form: $U_r = 1 - \\exp(-8T_r/F(n))$, $F(n) = \\dfrac{n^2}{n^2-1}\\ln n - \\dfrac{3n^2-1}{4n^2}$.
- For the usual n (above about 5) the two give nearly the same $U_r$, so the simpler equal-strain form is used.
- **Smear zone:** driving and withdrawing the casing (or mandrel) remoulds and drags the clay around the hole, destroying its horizontal fabric and seams. The disturbed ring (radius $r_s$, typically 1.5–3 $r_w$) has a lower horizontal permeability $k_s$ than the undisturbed clay ($k_h$), so the water must pass a "skin" of low k before it reaches the drain. Radial consolidation is **slower**: $F(n)$ is replaced by a larger $m$.`}</Md>
          <DrainFigs />
          <Md>{`**(b) Geometry.** Triangular pattern: $d_e = 1.05s = 1.05 \\times ${D.s} = ${f3(r.de)}$ m, $r_e = ${f4(r.re)}$ m (SJMY's slide writes 0.525s — that is $r_e$). $n = r_e/r_w = ${f4(r.re)}/${D.rw} = ${f2(r.n)}$.

**Vertical drainage** (two-way, $d = ${f2(D.H / 2)}$ m): $T_v = \\dfrac{${D.cv} \\times ${D.t}}{${f2(D.H / 2)}^2} = ${f4(r.Tv)}$ → $U_v = ${f2(r.Uv * 100)}$ % (exact series; $\\sqrt{4T_v/\\pi}$ gives the same below 60 %).

**Radial:** $T_r = \\dfrac{c_{vr}t}{d_e^2} = \\dfrac{${D.cv} \\times ${D.t}}{${f3(r.de)}^2} = ${f4(r.Tr)}$.

(i) **No smear:** $F(n) = ${f4(r.F)}$, $U_r = 1 - e^{-8(${f4(r.Tr)})/${f4(r.F)}} = ${f2(r.Ur * 100)}$ %; $U = 1 - (1 - ${f3(r.Uv)})(1 - ${f3(r.Ur)}) = $ **${f2(r.U * 100)} %**.`}</Md>
          <BarronChart n={r.n} Tr={r.Tr} w={380} />
          <Md>{`(ii) **With smear:** $S = r_s/r_w = ${D.rs}/${D.rw} = ${f2(x.S)}$, $k_h/k_s = ${D.khks}$:
$$m = \\frac{n^2}{n^2 - S^2}\\ln\\frac{n}{S} - \\frac34 + \\frac{S^2}{4n^2} + \\frac{k_h}{k_s}\\,\\frac{n^2 - S^2}{n^2}\\ln S = ${f4(x.m)}$$
(with S = 1 it reduces to F(n)). $U_r = 1 - e^{-8(${f4(r.Tr)})/${f4(x.m)}} = ${f2(x.urs * 100)}$ %; $U = 1 - (1 - ${f3(r.Uv)})(1 - ${f3(x.urs)}) = $ **${f2(x.Us * 100)} %**.

Smear cuts the progress at 6 months from ${f2(r.U * 100)} % to ${f2(x.Us * 100)} %: m is ${f2(x.m / r.F)} times F(n), and most of the increase is the last ($k_h/k_s$) term.`}</Md>
          <Md>{`**(c) Time for Ur = 90 %:** $T_r = -\\ln(0.1)\\,F/8$, $t = T_rd_e^2/c_{vr}$: no smear ${f2(x.t90)} years; with smear ${f2(x.t90s)} years (${f2(x.t90s / x.t90)} times longer). Remedies: use a mandrel of smaller cross-section, jetted or augered drains, or prefabricated (wick) drains, and space the drains closer to make up for the smear.`}</Md>
        </div>
      )
    },
    notes: [NOT_ASKED, 'SJMY sir, Lecture 20 (sand / wick drains: free strain, equal strain, equal strain with smear — Das, Advanced Soil Mechanics pp. 319–327). Past papers asked the no-smear Barron calculation only. Free-strain Ur needs Bessel functions (chart only), so it is described, not computed.'],
  },
]

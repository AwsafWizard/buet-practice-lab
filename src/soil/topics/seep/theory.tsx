import { useMemo } from 'react'
import { tipAxes } from '../../../components/PointTip'
import { netLines, sheetPile, solveNet } from '../../engine/flownet'
import type { SmTheoryItem } from '../../types'
import { QuickFigure, Q_DEFAULT } from './HeaveLab'
import { NetView } from './NetView'

const T = 'sm-seep' as const

// ---------------------------------------------------------------- sketches
// Effective stress: soil element cut by a wavy plane a–a through grain contacts
const EF = { x0: 34, x1: 334, y0: 46, y1: 206 }
const EF_C = [
  { x: 62, y: 128, ru: 18, rl: 17 },
  { x: 112, y: 118, ru: 17, rl: 19 },
  { x: 162, y: 130, ru: 19, rl: 16 },
  { x: 212, y: 119, ru: 16, rl: 18 },
  { x: 262, y: 129, ru: 18, rl: 17 },
  { x: 308, y: 120, ru: 17, rl: 18 },
]
function efPlaneY(x: number) {
  const pts = [{ x: EF.x0 - 14, y: 124 }, ...EF_C, { x: EF.x1 + 14, y: 125 }]
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1]
    if (x <= b.x || i === pts.length - 2) {
      const t = Math.min(1, Math.max(0, (x - a.x) / (b.x - a.x)))
      return a.y + ((b.y - a.y) * (1 - Math.cos(Math.PI * t))) / 2
    }
  }
  return 124
}
function efGrains() {
  const g: { x: number; y: number; r: number }[] = []
  for (const c of EF_C) g.push({ x: c.x, y: c.y - c.ru, r: c.ru }, { x: c.x, y: c.y + c.rl, r: c.rl })
  let s = 7
  const rnd = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646
  for (let k = 0; k < 2500 && g.length < 70; k++) {
    const r = 9 + rnd() * 9
    const x = EF.x0 - 8 + rnd() * (EF.x1 - EF.x0 + 16)
    const y = EF.y0 - 8 + rnd() * (EF.y1 - EF.y0 + 16)
    if (g.some((o) => Math.hypot(o.x - x, o.y - y) < o.r + r + 2.5)) continue
    let near = false
    for (let px = x - r - 3; px <= x + r + 3; px += 2) if (Math.hypot(px - x, efPlaneY(px) - y) < r + 3) near = true
    if (!near) g.push({ x, y, r })
  }
  return g
}

function EffStressFig() {
  const grains = useMemo(efGrains, [])
  const plane = useMemo(() => {
    let d = ''
    for (let x = EF.x0 - 14; x <= EF.x1 + 14; x += 2) d += (d ? 'L' : 'M') + x + ',' + efPlaneY(x).toFixed(1)
    return d
  }, [])
  const arrow = (x1: number, y1: number, x2: number, y2: number, col: string, w = 1.6) => {
    const a = Math.atan2(y2 - y1, x2 - x1)
    const h = 5.5
    return (
      <g stroke={col} strokeWidth={w} fill="none" strokeLinecap="round">
        <path d={`M${x1},${y1}L${x2},${y2}`} />
        <path d={`M${x2 - h * Math.cos(a - 0.45)},${y2 - h * Math.sin(a - 0.45)}L${x2},${y2}L${x2 - h * Math.cos(a + 0.45)},${y2 - h * Math.sin(a + 0.45)}`} />
      </g>
    )
  }
  const tilt = [-0.35, 0.25, -0.15, 0.4, -0.3, 0.2]
  const sub = ['₁', '₂', '₃', '₄', '₅', 'ₙ']
  return (
    <div>
      <svg viewBox="0 0 400 250" className="w-full max-w-[500px]">
        <defs>
          <clipPath id="ef-clip">
            <rect x={EF.x0} y={EF.y0} width={EF.x1 - EF.x0} height={EF.y1 - EF.y0} />
          </clipPath>
        </defs>
        {/* total load on the element */}
        {[54, 94, 134, 174, 214, 254, 294].map((x) => (
          <g key={x}>{arrow(x, 14, x, EF.y0 - 3, 'var(--c-ink)', 1.3)}</g>
        ))}
        <path d={`M${EF.x0},14L${EF.x1},14`} stroke="var(--c-ink)" strokeWidth={1.3} />
        <text x={EF.x1 + 8} y={22} fontSize={11} fill="var(--c-ink)">
          σ (total)
        </text>
        {/* element: pore water + grains */}
        <g clipPath="url(#ef-clip)">
          <rect x={EF.x0} y={EF.y0} width={EF.x1 - EF.x0} height={EF.y1 - EF.y0} fill="var(--c-water)" opacity={0.22} />
          {grains.map((o, i) => (
            <circle key={i} cx={o.x} cy={o.y} r={o.r} fill="var(--c-soil)" stroke="var(--c-ink)" strokeOpacity={0.45} strokeWidth={0.8} />
          ))}
        </g>
        <rect x={EF.x0} y={EF.y0} width={EF.x1 - EF.x0} height={EF.y1 - EF.y0} fill="none" stroke="var(--c-ink)" />
        {/* wavy plane a–a */}
        <path d={plane} fill="none" stroke="var(--c-accent)" strokeWidth={2} strokeDasharray="6 3" />
        <text x={EF.x0 - 24} y={128} fontSize={12} fontWeight={700} fill="var(--c-accent)">
          a
        </text>
        <text x={EF.x1 + 18} y={129} fontSize={12} fontWeight={700} fill="var(--c-accent)">
          a
        </text>
        {/* pore water pressure on the plane between contacts */}
        {EF_C.slice(0, -1).map((c, i) => {
          const x = (c.x + EF_C[i + 1].x) / 2
          const y = efPlaneY(x)
          return <g key={x}>{arrow(x, y + 15, x, y + 1.5, 'var(--c-water)', 1.8)}</g>
        })}
        <text x={137} y={efPlaneY(137) + 27} fontSize={11} fontWeight={700} textAnchor="middle" fill="var(--c-water)">
          u
        </text>
        {/* contact forces from the grains below */}
        {EF_C.map((c, i) => {
          const L = 30
          const tx = c.x - L * Math.sin(tilt[i])
          const ty = c.y + L * Math.cos(tilt[i])
          return (
            <g key={c.x}>
              {arrow(tx, ty, c.x, c.y + 1, 'var(--c-load)', 2)}
              <circle cx={c.x} cy={c.y} r={2.6} fill="var(--c-load)" />
              <text x={tx + (tilt[i] > 0 ? -4 : 4)} y={ty + 11} fontSize={10.5} fontWeight={700} textAnchor="middle" fill="var(--c-load)">
                {'P' + sub[i]}
              </text>
            </g>
          )
        })}
        {/* area */}
        <path d={`M${EF.x0},${EF.y1 + 14}L${EF.x1},${EF.y1 + 14}M${EF.x0},${EF.y1 + 9}l0,10M${EF.x1},${EF.y1 + 9}l0,10`} stroke="var(--c-mute)" />
        <text x={(EF.x0 + EF.x1) / 2} y={EF.y1 + 32} fontSize={10.5} textAnchor="middle" fill="var(--c-mute)">
          gross area A; grain-to-grain contact area aₛ (dots) is tiny
        </text>
      </svg>
      <p className="text-xs text-mute">
        Plane a–a winds through the grain contacts (dots) and the pore water, never through a grain. The contact forces P₁ … Pₙ act on a tiny area aₛ; their vertical parts add up to σ′A. The water presses on the rest of the plane, A − aₛ. Vertical equilibrium: σA = ΣPᵥ + u(A − aₛ), so σ = σ′ + u(1 − aₛ/A) ≈ σ′ + u.
      </p>
    </div>
  )
}

function NetFig() {
  const sol = useMemo(() => solveNet(sheetPile({ T: 10, s: 5, hU: 5, hD: 1.5 }), 'live'), [])
  const net = useMemo(() => netLines(sol, 4), [sol])
  return (
    <div>
      <NetView sol={sol} net={net} kind="pile" dims={false} />
      <p className="text-xs text-mute">Solved net for 2023-24 Q6(c): 4 channels, 8 drops. Flow lines (solid) cross equipotentials (dashed) at right angles and make curvilinear squares; the pile and the impermeable base are flow lines, the two beds are equipotentials.</p>
    </div>
  )
}

function QuickFig() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <QuickFigure s={Q_DEFAULT} zf={0} />
      <p className="text-xs text-mute max-w-[16rem]">Upward flow under head h through a layer L. When hγw ≥ Lγ′ (i ≥ icr) the grains carry no load: the sand boils.</p>
    </div>
  )
}

function ColumnFig() {
  // two soil columns: upward and downward seepage, with standpipes
  const col = (x0: number, up: boolean) => (
    <g>
      <rect x={x0} y={90} width={70} height={90} fill="var(--c-soil)" opacity={0.55} stroke="var(--c-ink)" />
      <rect x={x0} y={60} width={70} height={30} fill="var(--c-water)" opacity={0.18} stroke="var(--c-ink)" />
      <line x1={x0 - 6} y1={60} x2={x0 + 76} y2={60} stroke="var(--c-water)" />
      <path d={`M${x0 + 35},200L${x0 - 20},200L${x0 - 20},${up ? 25 : 100}`} fill="none" stroke="var(--c-ink)" />
      <rect x={x0 - 24} y={up ? 25 : 100} width={8} height={up ? 175 : 100} fill="var(--c-water)" opacity={0.45} />
      <line x1={x0 - 30} y1={up ? 25 : 100} x2={x0 - 6} y2={up ? 25 : 100} stroke="var(--c-water)" />
      <text x={x0 - 34} y={up ? 45 : 85} fontSize={10} textAnchor="end" fill="var(--c-mute)">
        h
      </text>
      {[0.25, 0.5, 0.75].map((t) => (
        <path key={t} d={up ? `M${x0 + 70 * t},170l0,-22m-4,6l4,-6l4,6` : `M${x0 + 70 * t},100l0,22m-4,-6l4,6l4,-6`} stroke="var(--c-water)" strokeWidth={1.5} fill="none" />
      ))}
      <text x={x0 + 35} y={215} fontSize={11} textAnchor="middle" fill="var(--c-ink)">
        {up ? "σ′ = zγ′ − izγw" : "σ′ = zγ′ + izγw"}
      </text>
      <text x={x0 + 35} y={14} fontSize={11} textAnchor="middle" fontWeight={700} fill="var(--c-ink)">
        {up ? 'upward flow' : 'downward flow'}
      </text>
    </g>
  )
  return (
    <svg viewBox="0 0 330 225" className="w-full max-w-[380px]">
      {col(70, true)}
      {col(230, false)}
    </svg>
  )
}

function LaplaceFig() {
  return (
    <svg viewBox="0 0 300 190" className="w-full max-w-[320px]">
      <rect x={100} y={50} width={100} height={90} fill="var(--c-soil)" opacity={0.45} stroke="var(--c-ink)" />
      <text x={150} y={150 + 14} fontSize={10} textAnchor="middle" fill="var(--c-mute)">
        dx
      </text>
      <text x={210} y={98} fontSize={10} fill="var(--c-mute)">
        dz
      </text>
      <path d="M50,95L96,95M90,90L96,95L90,100" stroke="var(--c-water)" strokeWidth={1.6} fill="none" />
      <text x={20} y={88} fontSize={10.5} fill="var(--c-ink)">
        vx·dz
      </text>
      <path d="M204,95L250,95M244,90L250,95L244,100" stroke="var(--c-water)" strokeWidth={1.6} fill="none" />
      <text x={226} y={86} fontSize={10.5} fill="var(--c-ink)">
        (vx + ∂vx/∂x·dx)dz
      </text>
      <path d="M150,182L150,144M145,150L150,144L155,150" stroke="var(--c-water)" strokeWidth={1.6} fill="none" />
      <text x={158} y={180} fontSize={10.5} fill="var(--c-ink)">
        vz·dx
      </text>
      <path d="M150,46L150,8M145,14L150,8L155,14" stroke="var(--c-water)" strokeWidth={1.6} fill="none" />
      <text x={158} y={20} fontSize={10.5} fill="var(--c-ink)">
        (vz + ∂vz/∂z·dz)dx
      </text>
    </svg>
  )
}

function PipingFig() {
  return (
    <svg viewBox="0 0 420 180" className="w-full max-w-[460px]">
      <rect x={0} y={60} width={420} height={110} fill="var(--c-soil)" opacity={0.4} />
      <rect x={0} y={25} width={150} height={35} fill="var(--c-water)" opacity={0.18} />
      <rect x={270} y={50} width={150} height={10} fill="var(--c-water)" opacity={0.18} />
      <path d="M150,60L150,20L180,20L270,52L270,60Z" fill="var(--c-conc)" stroke="var(--c-ink)" />
      <path d="M60,60 C 90,150 330,150 360,60" fill="none" stroke="var(--c-water)" strokeWidth={1.5} />
      <path d="M120,60 C 140,110 280,110 300,60" fill="none" stroke="var(--c-water)" strokeWidth={1.5} />
      {/* pipe eroding backwards from the exit */}
      <path d="M285,60 C 270,72 240,76 215,72" fill="none" stroke="var(--c-bad)" strokeWidth={5} strokeLinecap="round" opacity={0.75} />
      <path d="M215,72 C 200,70 190,68 182,66" fill="none" stroke="var(--c-bad)" strokeWidth={2.5} strokeDasharray="4 3" />
      <text x={288} y={45} fontSize={10.5} fill="var(--c-bad)">
        exit: i_e → i_cr, grains wash out
      </text>
      <text x={150} y={95} fontSize={10.5} fill="var(--c-bad)">
        ← pipe grows upstream
      </text>
      {[290, 300, 310].map((x) => (
        <circle key={x} cx={x} cy={56 - (x - 290) / 4} r={2} fill="var(--c-bad)" />
      ))}
    </svg>
  )
}

function FilterFig() {
  // grain-size chart: % finer vs log D; base curve a, filter limits b, c
  const X = (d: number) => 30 + ((Math.log10(d) + 3) / 4) * 360
  const Y = (p: number) => 160 - p * 1.4
  const curve = (D50: number, s: number) =>
    Array.from({ length: 41 }, (_, k) => {
      const p = k / 40
      const d = D50 * Math.pow(10, s * (p - 0.5) * 2.2)
      return `${k ? 'L' : 'M'}${X(d).toFixed(1)},${Y(p * 100).toFixed(1)}`
    }).join('')
  const dAt = (D50: number, s: number, p: number) => D50 * Math.pow(10, s * (p - 0.5) * 2.2)
  const a = 0.03
  const sa = 0.6
  const pts = [
    { d: dAt(a, sa, 0.15), l: 'D15(B)' },
    { d: dAt(a, sa, 0.85), l: 'D85(B)' },
  ]
  return (
    <svg viewBox="0 0 420 200" className="w-full max-w-[460px]" {...tipAxes({ X, Y, xLog: true, x: 'D', xUnit: ' mm', y: '% finer' })}>
      <line x1={30} y1={160} x2={400} y2={160} stroke="var(--c-line)" />
      <line x1={30} y1={20} x2={30} y2={160} stroke="var(--c-line)" />
      {[0.001, 0.01, 0.1, 1, 10].map((d) => (
        <text key={d} x={X(d)} y={174} fontSize={9} textAnchor="middle" fill="var(--c-mute)">
          {d}
        </text>
      ))}
      <text x={215} y={190} fontSize={9.5} textAnchor="middle" fill="var(--c-mute)">
        grain size D (mm, log)
      </text>
      <text x={6} y={18} fontSize={9.5} fill="var(--c-mute)">
        % finer
      </text>
      <path d={curve(a, sa)} fill="none" stroke="var(--c-ink)" strokeWidth={1.8} data-name="a (base)" />
      <path d={curve(a * 4 * 1.2, sa)} fill="none" stroke="var(--c-accent)" strokeWidth={1.4} strokeDasharray="5 3" data-name="b" />
      <path d={curve(a * 4 * 6, sa)} fill="none" stroke="var(--c-accent)" strokeWidth={1.4} strokeDasharray="5 3" data-name="c" />
      {pts.map((p) => (
        <g key={p.l}>
          <circle cx={X(p.d)} cy={Y(p.l === 'D15(B)' ? 15 : 85)} r={3} fill="var(--c-ink)" data-tip={`${p.l} = ${p.d} mm`} />
          <circle cx={X(4 * p.d)} cy={Y(15)} r={3} fill="var(--c-load)" data-tip={`4${p.l} = ${+(4 * p.d).toPrecision(3)} mm`} />
          <text x={X(4 * p.d) + 4} y={Y(15) + 12} fontSize={9} fill="var(--c-load)">
            4{p.l}
          </text>
        </g>
      ))}
      <text x={X(dAt(a, sa, 0.7)) - 6} y={Y(70)} fontSize={10} textAnchor="end" fill="var(--c-ink)">
        a: base soil
      </text>
      <text x={X(dAt(a * 30, sa, 0.75)) + 6} y={Y(75)} fontSize={10} fill="var(--c-accent)">
        b, c: filter limits
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------- items
export const SEEP_THEORY: SmTheoryItem[] = [
  {
    id: 't-eff-principle',
    topic: T,
    q: 'What is the principle of effective stress? Describe pore water pressure, effective stress and seepage pressure. Discuss the role of effective stress in geotechnical problems.',
    seen: ['2016-17', '2015-16', '2009-10'],
    a: `**Principle (Terzaghi):** the total normal stress on a plane through a saturated soil is shared between the water in the pores and the grain skeleton:
$$\\sigma = \\sigma' + u\\qquad\\Rightarrow\\qquad \\sigma' = \\sigma - u$$
and **only σ′ controls compression, deformation and shear strength**. A change in u alone (σ constant) changes σ′ and so causes settlement or loss of strength.

**Derivation sketch (Lecture 10):** a wavy plane a–a through grain contacts; contact forces $P_1 … P_n$, contact area $a_s$. $\\sigma A = \\sum P_v + u(A - a_s)$ → $\\sigma = \\sigma' + u(1 - a_s/A) \\approx \\sigma' + u$ since $a_s/A$ is tiny.

- **Pore water pressure u** (neutral stress): pressure of the water in the voids, equal in all directions; hydrostatic $z_w\\gamma_w$ with no flow, plus or minus an excess from seepage or loading; negative (suction) in the capillary zone.
- **Effective stress σ′**: force carried grain to grain through the contacts per unit gross area.
- **Seepage pressure** $p_s = iz\\gamma_w = h\\gamma_w$: the pressure the flowing water hands to the skeleton by viscous drag, acting along the flow.

**Role:**
- Shear strength $\\tau_f = c' + \\sigma'\\tan\\phi'$ (bearing capacity, slopes, walls).
- Consolidation: settlement happens as u dissipates and σ′ grows; lowering the WT raises σ′ and causes settlement (Dhaka, Mexico City).
- Quick sand, piping and heave: upward seepage drives σ′ → 0.
- Excavation base heave over artesian layers; liquefaction (u rises in an earthquake); slope failures after rain (u up, σ′ down).`,
    Fig: EffStressFig,
  },
  {
    id: 't-seep-pressure',
    topic: T,
    q: "Define 'seepage pressure'. Show how it increases or decreases the effective stress. Give examples.",
    seen: ['2010-11', '2007-08', '2011-12'],
    a: `**Seepage pressure** $p_s = iz\\gamma_w = h\\gamma_w$: when water flows it loses head h by friction on the grains, and that lost energy appears as a drag on the skeleton in the direction of flow (seepage force per unit volume $i\\gamma_w$).

Soil column, saturated, water $H_1$ above it, point C at depth z (sketch: three standpipes):
- **No flow:** $\\sigma = H_1\\gamma_w + z\\gamma_{sat}$, $u = (H_1 + z)\\gamma_w$ → $\\sigma' = z\\gamma'$.
- **Upward flow** (head h extra at the bottom, $i = h/L$): u at C is larger by $iz\\gamma_w$ → $\\sigma' = z\\gamma' - iz\\gamma_w$ (**decrease**).
- **Downward flow**: u smaller by $iz\\gamma_w$ → $\\sigma' = z\\gamma' + iz\\gamma_w$ (**increase**).

**Examples.**
- Downward (σ′ up): upstream side of a sheet pile or dam; pond and canal beds recharging the ground; pumping from an aquifer below a clay (the clay consolidates, ground settles).
- Upward (σ′ down): downstream side of sheet piles, weirs and dams; base of excavations and cofferdams over an artesian sand; river banks after rapid drawdown. If i reaches icr, σ′ = 0: quick sand, boiling, piping, heave.`,
    Fig: ColumnFig,
  },
  {
    id: 't-seep-force',
    topic: T,
    q: 'Prove that the seepage force per unit volume equals the product of hydraulic gradient and unit weight of water.',
    seen: ['2009-10'],
    a: `Soil column of cross-section A and height z, upward flow with head loss h over it ($i = h/z$).
1. No flow: effective force on the base $P'_1 = z\\gamma'A$.
2. Upward flow: $\\sigma' = z\\gamma' - iz\\gamma_w$, so $P'_2 = (z\\gamma' - iz\\gamma_w)A$.
3. The reduction is carried by the water dragging on the grains: $P'_1 - P'_2 = iz\\gamma_wA$ = seepage force on the volume $zA$.
4. Per unit volume: $$j = \\frac{iz\\gamma_wA}{zA} = i\\gamma_w\\quad\\blacksquare$$
Downward flow gives the same magnitude acting downward ($P'_3 - P'_1 = iz\\gamma_wA$). In an isotropic soil the seepage force per unit volume is $i\\gamma_w$ **along the flow lines** for flow in any direction, so a flow net gives it at any point.`,
  },
  {
    id: 't-icr',
    topic: T,
    q: "Define 'hydraulic gradient' and 'critical hydraulic gradient'. Derive an expression for the critical hydraulic gradient in terms of the effective unit weight of soil and the unit weight of water. (Short note: critical hydraulic gradient.)",
    seen: ['2023-24', '2021-22', '2007-08'],
    a: `- **Hydraulic gradient** $i = \\Delta h/L$: total-head loss per unit length of flow path (dimensionless).
- **Critical hydraulic gradient** $i_{cr}$: the upward gradient at which σ′ becomes zero (quick condition).

**Derivation.** Upward flow through a soil column of height z with head loss h; water level above the soil at $H_1$.
- At the bottom: $\\sigma = H_1\\gamma_w + z\\gamma_{sat}$, $u = (H_1 + z + h)\\gamma_w$.
- $\\sigma' = z(\\gamma_{sat} - \\gamma_w) - h\\gamma_w = z\\gamma' - iz\\gamma_w$.
- Set σ′ = 0: $$i_{cr} = \\frac{\\gamma'}{\\gamma_w} = \\frac{G_s - 1}{1 + e}$$ using $\\gamma' = (G_s - 1)\\gamma_w/(1 + e)$ from the phase diagram.

Typical $i_{cr} \\approx 0.9$–$1.1$ (≈ 1). Example: e = 0.80, Gs = 2.68 → icr = 1.68/1.80 = 0.93 (2007-08 Q7(c)).

**Significance:** at $i \\ge i_{cr}$ a cohesionless soil has zero strength, boils and is carried away (quick sand, piping, heave). Designs keep the exit gradient at $i_{cr}/FS$ with FS ≈ 3–4.`,
  },
  {
    id: 't-quick',
    topic: T,
    q: 'What is the quick sand phenomenon? In which types of soil and under what situations may it occur?',
    seen: ['2008-09'],
    a: `**Quick sand is a condition, not a kind of sand.** When water flows **upward** with $i \\ge i_{cr}$ ($h\\gamma_w \\ge z\\gamma'$), σ′ = 0. A cohesionless soil then has no shear strength ($\\tau = \\sigma'\\tan\\phi = 0$), behaves like a heavy liquid (pressure equal in all directions), cannot carry any load and its grains are lifted: **boiling**.

**Conditions:** flow upward; σ′ = 0 ⇔ i ≥ icr ⇔ hγw ≥ zγ′.

**Soils:** fine sands, silty sands and coarse silts.
- Cohesionless, so nothing but friction holds them (clays resist with cohesion).
- Fine enough that the large gradient can be sustained without huge flows (gravels are too permeable to build up icr).

**Situations:**
- Downstream of sheet piles, weirs and dams; bottoms of cofferdams and excavations dewatered above an artesian aquifer.
- River banks during rapid drawdown; springs.
- Naturally very loose saturated deposits (beaches); earthquake liquefaction is the same zero-σ′ state caused by rising u.

**Prevention:** lengthen the flow path (deeper sheet piles), relieve the head (wells), or load the surface with a filter / weighting blanket.`,
    Fig: QuickFig,
  },
  {
    id: 't-laplace',
    topic: T,
    q: 'Derive the Laplace equation of continuity for two-dimensional flow in a fully saturated soil. Give its graphical and mathematical interpretations (physical meaning of each term).',
    seen: ['2016-17', '2008-09'],
    a: `**Assumptions:** Darcy's law valid (laminar flow); soil fully saturated; soil and water incompressible (no volume change); steady flow; homogeneous soil with constant $k_x$, $k_z$.

**Element** dx × dz, unit thickness (sketch):
1. Inflow: $v_x\\,dz + v_z\\,dx$.
2. Outflow: $\\left(v_x + \\frac{\\partial v_x}{\\partial x}dx\\right)dz + \\left(v_z + \\frac{\\partial v_z}{\\partial z}dz\\right)dx$.
3. Continuity (inflow = outflow): $$\\frac{\\partial v_x}{\\partial x} + \\frac{\\partial v_z}{\\partial z} = 0$$
4. Darcy: $v_x = -k_x\\frac{\\partial h}{\\partial x}$, $v_z = -k_z\\frac{\\partial h}{\\partial z}$ →
$$k_x\\frac{\\partial^2 h}{\\partial x^2} + k_z\\frac{\\partial^2 h}{\\partial z^2} = 0;\\qquad k_x = k_z:\\ \\frac{\\partial^2 h}{\\partial x^2} + \\frac{\\partial^2 h}{\\partial z^2} = 0$$

**Mathematical meaning:** $\\partial^2h/\\partial x^2 = \\partial i_x/\\partial x$ is the rate of change of the gradient in x (similarly z); their sum is zero, i.e. what enters an element in one direction leaves in the other. h(x, z) is a harmonic function; its solution is two orthogonal families, the potential function φ (= kh) and the stream function ψ.

**Graphical meaning:** the φ = constant lines (equipotentials) and ψ = constant lines (flow lines) cross at right angles and form the **flow net**: a graphical solution for the given boundary conditions. Anisotropic soil: scale x by $\\sqrt{k_z/k_x}$ and the equation becomes Laplace again (transformed section).`,
    Fig: LaplaceFig,
  },
  {
    id: 't-flownet-props',
    topic: T,
    q: 'State the basic properties of a flow net. Briefly discuss its utility.',
    seen: ['2020-21', '2012-13'],
    a: `**Properties (Lecture 12):**
1. Flow lines and equipotential lines intersect at **right angles**.
2. Two flow lines (or two equipotentials) **never cross**.
3. In homogeneous soil the lines are smooth curves (elliptic or parabolic).
4. The **same discharge Δq** passes through every flow channel.
5. The **head drop** between any two adjacent equipotentials is the same, $\\Delta h = H/N_d$.
6. The net depends **only on the boundary conditions**, not on k or H.
7. Each field is a **curvilinear square** (a circle can be inscribed, b/l = 1).
8. Impermeable boundaries are flow lines; submerged permeable surfaces are equipotentials.
9. Piezometers placed anywhere on one equipotential show the same water level.

**Utility:**
- Seepage loss $q = kHN_f/N_d$ (water loss, drainage and pumping design).
- Head and pore pressure at any point ($h_P = H - n\\Delta h$).
- Uplift pressure and force under dams and weirs (floor thickness, FS = W/U).
- Exit gradient and FS against piping (Harza); heave (Terzaghi prism).
- Seepage forces for slope / wall stability; comparing cut-off and floor layouts at the design stage.`,
    Fig: NetFig,
  },
  {
    id: 't-equal-q',
    topic: T,
    q: 'What is a flow net and what are its uses in civil engineering practice? Why is the quantity of seepage between two successive flow lines equal?',
    seen: ['2007-08'],
    a: `**Flow net:** the graphical solution of the Laplace equation: a network of flow lines and equipotential lines crossing at right angles, forming curvilinear squares. Uses as in the previous card (q, pore pressure, uplift, exit gradient, piping and heave safety, comparing designs).

**Equal Δq per channel:**
- Take one field of a channel: width b, length l, head drop $\\Delta h$ across it.
- Darcy: $\\Delta q = k\\,\\frac{\\Delta h}{l}\\,b$.
- The net is drawn with **squares** (b = l) and **equal drops** ($\\Delta h = H/N_d$ everywhere), so $\\Delta q = k\\Delta h = kH/N_d$ is the same in every field.
- No water crosses a flow line, so the flow in a channel is constant along it; every channel therefore carries the same $\\Delta q$, and $q = N_f\\Delta q = kHN_f/N_d$.
- (A rectangular net also works if every field has the same b/l = n: then $q = kHnN_f/N_d$.)`,
  },
  {
    id: 't-piping',
    topic: T,
    q: 'Describe the mechanism of piping in hydraulic structures. How can the factor of safety against piping (subsurface erosion) be increased?',
    seen: ['2017-18', '2007-08', '2008-09'],
    a: `**Mechanism:**
1. Seepage under the structure comes up at the downstream side; the gradient is highest at the exit (next to the toe or pile).
2. Where $i_e$ approaches $i_{cr}$, σ′ → 0 and the grains at the exit are lifted and washed out (boiling).
3. A small cavity forms; the flow path shortens, so the gradient at its head rises further.
4. Erosion progresses **backward (upstream)** as a pipe-like channel that enlarges.
5. When it reaches the upstream side the flow concentrates, the foundation is undermined and the structure collapses. Fine sands and silts are most prone.

**Check:** Harza $FS = i_{cr}/i_e$ (want 3–4 or more); Terzaghi heave prism $FS = D\\gamma'/(h_a\\gamma_w)$ (4–5).

**Remedies:**
- **Lengthen the flow path** (lower $i_e$): upstream impervious apron or clay blanket, longer floor, sheet-pile cut-offs, especially a deep **downstream** cut-off.
- **Inverted (graded) filter / weighting blanket** downstream: its weight resists the seepage force and it stops fines moving.
- **Drains and relief wells** to bleed off the uplift.
- Grouting or clay blankets to reduce k.`,
    Fig: PipingFig,
  },
  {
    id: 't-filter',
    topic: T,
    q: 'Why is a filter used on the downstream side of an earth dam / hydraulic structure? How would you design a filter? What is a graded filter, and when and where is it used?',
    seen: ['2017-18', '2011-12'],
    a: `**Purpose:** let the seepage water out freely (relieving the pore pressure, keeping the phreatic line inside an earth dam) while holding back the soil grains, so piping and toe erosion cannot start. Its weight also counters the upward seepage force.

**Design (Terzaghi criteria):**
- Piping (retention): $D_{15(F)}/D_{85(B)} < 4$–$5$.
- Permeability: $D_{15(F)}/D_{15(B)} > 4$–$5$.
- Grading curve of the filter roughly parallel to the base soil's, between the curves drawn through $4D_{15(B)}$ and $4D_{85(B)}$ (sketch: curve a = base soil, limits b and c).
- Also $D_{50(F)}/D_{50(B)} < 25$, fines (< 0.075 mm) ≤ 5 %, well graded so it does not segregate.
- **Thickness:** its submerged weight must make $FS = (W' + W_f)/U$ adequate.

**Graded (inverted) filter:** several layers, each a filter for the layer below, with grain size increasing in the direction of flow (fine sand → coarse sand → gravel). Used where the base soil is much finer than the drainage material: under weir and barrage floors, at dam toes and chimney drains, behind retaining walls, around relief wells.`,
    Fig: FilterFig,
  },
  {
    id: 't-submerged',
    topic: T,
    q: 'Prove that the effective stress at a point in a submerged saturated soil is independent of the height of water above the soil.',
    seen: ['2012-13'],
    a: `Water of height $H_1$ above the soil surface, point at depth z in the soil, no flow:
$$\\sigma = H_1\\gamma_w + z\\gamma_{sat},\\qquad u = (H_1 + z)\\gamma_w$$
$$\\sigma' = \\sigma - u = z(\\gamma_{sat} - \\gamma_w) = z\\gamma'\\qquad (H_1 \\text{ cancels})\\ \\blacksquare$$
Raising the water adds $\\Delta H_1\\gamma_w$ equally to σ and u, so σ′ does not change: a sea bed does not consolidate under deep water, and filling a reservoir does not compress its bed (seepage aside).`,
  },
  {
    id: 't-spillway',
    topic: T,
    q: 'You are to design the foundation of a spillway. Write down the steps of analysis from seepage considerations. Mention the quantities you will determine and their significance.',
    seen: ['Jan 2021'],
    a: `1. **Site data:** layers, depth to the impermeable stratum, $k_x$, $k_z$, Gs, e, grading (for filters).
2. **Hydraulics:** maximum headwater and minimum tail water (H); trial floor length and cut-off depths.
3. **Flow net** (transformed section if anisotropic) or Khosla / Lane methods.
4. **Seepage discharge** $q = kHN_f/N_d$: water loss, drainage and pumping during construction.
5. **Uplift** under the floor from the head at each equipotential: floor thickness / weight for $W/U \\ge 1.5$.
6. **Exit gradient** at the downstream end: $FS = i_{cr}/i_e \\ge 3$–$4$ against piping.
7. **Heave** at downstream cut-offs (Terzaghi D × D/2 prism, FS 4–5).
8. **Seepage forces / pore pressures** at critical points: stability of the downstream bed, walls and slopes.
9. **If inadequate:** lengthen the floor or add an upstream apron, deepen the cut-offs (downstream one for the exit gradient), add an inverted filter and drains or relief wells; redraw the net and recheck.`,
  },
]

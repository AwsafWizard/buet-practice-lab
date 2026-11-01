// Two-way slab theory bank (slab-2way theory parts in papers P1–P4 + the recurring handnote/slide questions).
import type { RcTheoryItem } from '../../types'

const T = 'rc-twoway' as const

function CornerFig() {
  const panel = (ox: number, title: string, opt: 1 | 2) => (
    <g>
      <text x={ox} y={14} fontSize={11} fill="var(--c-mute)" fontWeight={700}>
        {title}
      </text>
      <rect x={ox} y={24} width={210} height={150} fill="var(--c-panel2)" stroke="var(--c-ink)" />
      {/* exterior corner top-left: both edges discontinuous; interior edges hatched */}
      {Array.from({ length: 14 }, (_, i) => (
        <line key={'h' + i} x1={ox + 210} y1={30 + i * 10} x2={ox + 218} y2={26 + i * 10} stroke="var(--c-accent)" />
      ))}
      {Array.from({ length: 20 }, (_, i) => (
        <line key={'v' + i} x1={ox + 5 + i * 10} y1={174} x2={ox + 1 + i * 10} y2={182} stroke="var(--c-accent)" />
      ))}
      <rect x={ox} y={24} width={60} height={60} fill="#ec4899" fillOpacity={0.18} stroke="#ec4899" strokeDasharray="3 2" />
      {opt === 1 ? (
        <>
          {[0, 1, 2, 3].map((k) => (
            <line key={'t' + k} x1={ox + 4 + k * 12} y1={24 + 4} x2={ox + 4} y2={24 + 4 + k * 12} stroke="var(--c-bad)" strokeWidth={1.5} transform={`translate(${k * 4},${k * 4})`} />
          ))}
          {[0, 1, 2, 3].map((k) => (
            <line key={'b' + k} x1={ox + 8 + k * 12} y1={28 + k * 12} x2={ox + 40 + k * 4} y2={60 + k * 4} stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="4 2" />
          ))}
        </>
      ) : (
        <>
          {[0, 1, 2, 3, 4].map((k) => (
            <line key={'x' + k} x1={ox + 2} x2={ox + 58} y1={30 + k * 12} y2={30 + k * 12} stroke="var(--c-bad)" strokeWidth={1.5} />
          ))}
          {[0, 1, 2, 3, 4].map((k) => (
            <line key={'y' + k} x1={ox + 6 + k * 12} x2={ox + 6 + k * 12} y1={26} y2={82} stroke="var(--c-bad)" strokeWidth={1.5} strokeDasharray="4 2" />
          ))}
        </>
      )}
      <text x={ox + 66} y={58} fontSize={9.5} fill="#ec4899">
        l/5 × l/5
      </text>
      <path d={`M${ox + 30},${24 + 110} l40,-40`} stroke="var(--c-load)" strokeWidth={1.2} fill="none" />
      <text x={ox + 72} y={130} fontSize={9.5} fill="var(--c-load)">
        {opt === 1 ? 'top: bars ∥ diagonal; bottom: ⊥ diagonal' : 'bands ∥ edges, top AND bottom, both ways'}
      </text>
    </g>
  )
  return (
    <svg viewBox="0 0 470 200" className="w-full h-auto max-w-xl">
      {panel(10, 'Option 1 — diagonal', 1)}
      {panel(250, 'Option 2 — bands (class)', 2)}
    </svg>
  )
}

function StripsFig() {
  return (
    <svg viewBox="0 0 480 190" className="w-full h-auto max-w-xl">
      <rect x={30} y={30} width={240} height={130} fill="var(--c-panel2)" stroke="var(--c-ink)" />
      <rect x={135} y={30} width={30} height={130} fill="var(--c-bad)" fillOpacity={0.2} stroke="var(--c-bad)" />
      <rect x={30} y={80} width={240} height={30} fill="#3b82f6" fillOpacity={0.2} stroke="#3b82f6" />
      <text x={150} y={24} fontSize={10} textAnchor="middle" fill="var(--c-bad)">
        strip a (short span la)
      </text>
      <text x={276} y={99} fontSize={10} fill="#3b82f6">
        strip b (lb)
      </text>
      <text x={300} y={40} fontSize={11} fill="var(--c-ink)">
        same centre deflection:
      </text>
      <text x={300} y={60} fontSize={11} fill="var(--c-ink)">
        5q_a l_a⁴/384EI = 5q_b l_b⁴/384EI
      </text>
      <text x={300} y={80} fontSize={11} fill="var(--c-accent)" fontWeight={700}>
        q_a/q_b = (l_b/l_a)⁴
      </text>
      <text x={300} y={110} fontSize={10.5} fill="var(--c-mute)">
        lb/la = 1 → 50 % short way
      </text>
      <text x={300} y={126} fontSize={10.5} fill="var(--c-mute)">
        1.5 → 84 % · 2 → 94 %
      </text>
      <text x={300} y={142} fontSize={10.5} fill="var(--c-mute)">
        ≥ 2: treat as one-way
      </text>
    </svg>
  )
}

function ColStripFig() {
  return (
    <svg viewBox="0 0 480 170" className="w-full h-auto max-w-xl">
      <rect x={30} y={30} width={280} height={110} fill="var(--c-panel2)" stroke="var(--c-ink)" />
      <rect x={30} y={30} width={70} height={110} fill="var(--c-mute)" fillOpacity={0.15} />
      <rect x={240} y={30} width={70} height={110} fill="var(--c-mute)" fillOpacity={0.15} />
      <text x={65} y={152} fontSize={10} textAnchor="middle" fill="var(--c-mute)">
        column strip l/4
      </text>
      <text x={170} y={152} fontSize={10} textAnchor="middle" fill="var(--c-ink)">
        middle strip l/2
      </text>
      <text x={275} y={152} fontSize={10} textAnchor="middle" fill="var(--c-mute)">
        column strip l/4
      </text>
      <path d="M30,110 L100,70 L240,70 L310,110" fill="none" stroke="var(--c-accent)" strokeWidth={2} />
      <text x={170} y={64} fontSize={10} textAnchor="middle" fill="var(--c-accent)">
        M (middle strip, from tables)
      </text>
      <text x={34} y={124} fontSize={9.5} fill="var(--c-accent)">
        ⅓M
      </text>
      <text x={330} y={70} fontSize={10.5} fill="var(--c-ink)">
        average over the column
      </text>
      <text x={330} y={86} fontSize={10.5} fill="var(--c-ink)">
        strip ≈ ⅔ M →
      </text>
      <text x={330} y={102} fontSize={10.5} fill="var(--c-accent)" fontWeight={700}>
        spacing 1.5 s (≤ 2h, ≥ As,min)
      </text>
    </svg>
  )
}

export const TWOWAY_THEORY: RcTheoryItem[] = [
  {
    id: 'corner',
    topic: T,
    q: 'Discuss (with a sketch) the special reinforcement provided at the exterior corners of a two-way slab system.',
    seen: ['2023-24', '2020-21', '2017-18'],
    a: `**Why.** At an exterior corner two discontinuous edges meet. Under load the corner of a slab supported on beams/walls that offer little restraint tends to **lift up** (curl) off the support; when it is held down (by the beams, columns or walls above) **twisting moments** develop. These produce
- **top** cracks perpendicular to the diagonal near the corner (negative principal moment), and
- **bottom** cracks along the diagonal (positive principal moment).

**ACI requirement (8.7.3 / Nilson 13.7)** — at exterior corners of slabs supported on edge walls or stiff beams (α > 1):
- Provide reinforcement at **both top and bottom**.
- Over a distance **l/5** in each direction from the corner, l = the **longer clear span** of the corner panel.
- Area in each direction (each face) = that required for the **maximum positive moment** per ft in the panel.
- Arrangement either **Option 1**: top bars parallel to the diagonal, bottom bars perpendicular to it; or **Option 2** (used in class): bands of bars **parallel to the two edges**, in both directions, top and bottom.

**Example (class corner panel 20 × 25 ft)**: max +ve steel 0.179 in²/ft → #3 @ 7 in c/c, top and bottom, both ways, over 25/5 = 5 ft × 5 ft at the exterior corner.`,
    Fig: CornerFig,
  },
  {
    id: '1way-2way',
    topic: T,
    q: 'Distinguish between one-way and two-way slab behaviour. When is an edge-supported slab designed as one-way?',
    seen: [],
    a: `- **One-way**: supported on two opposite sides (or on four sides with long/short ≥ 2). It bends into a **cylindrical** surface, load goes to the long supports, main steel in the short direction only + T&S steel the other way. Designed as a 1-ft beam strip.
- **Two-way**: supported on all four sides with $l_b/l_a < 2$. It bends into a **dish** shape with curvature in both directions; load goes to all four supports; main steel in **both** directions (short-way bars in the lower layer, larger d).
- Proof by crossing strips: equal centre deflection of the two strips gives $q_a/q_b = (l_b/l_a)^4$: square panel 50/50; $l_b/l_a = 1.5$ → 84 % short way; 2 → 94 %. So for ratio ≥ 2 the long direction carries almost nothing → design as **one-way** (slides: 30 × 12.5 ft → 2.4 → one-way).
- Two-way moments are much smaller than $wl^2/8$ of the strips because of plate (torsional) action and redistribution, so the coefficient tables are used.`,
    Fig: StripsFig,
  },
  {
    id: 'smaller',
    topic: T,
    q: 'Why are the moment coefficients of a two-way slab much smaller than wl²/8?',
    seen: [],
    a: `For a square simply supported panel:
1. **Load sharing**: each crossing strip carries only half the load → $M = (q/2)l^2/8 = 0.0625ql^2$.
2. **Plate (torsional) action**: neighbouring strips are not free — the outer strips deflect less than the centre strip and, by twisting, support it, reducing the moment by ≈ 25 % → elastic plate value ≈ $0.048ql^2$.
3. **Inelastic redistribution**: the slab is highly indeterminate; when steel yields at the most stressed places, moment shifts to less stressed regions, another ≈ 25 % → $0.036ql^2$ — exactly the Case 1, m = 1.0 coefficient of Tables 12.4/12.5.

So the tables already include load sharing, plate action and redistribution; moments also vary across the panel (full in the middle strip, smaller in the column strips).`,
  },
  {
    id: 'dl-ll',
    topic: T,
    q: 'Why are dead-load and live-load positive moments taken from separate tables (12.4 and 12.5), while negative moments use the total load (Table 12.3)?',
    seen: [],
    a: `- **Dead load** acts on every panel at the same time, so the neighbouring panels restrain the rotation of the common edges — the panel behaves as if its continuous edges were nearly fixed → **smaller** positive coefficients (Table 12.4).
- **Live load** may be on this panel while the neighbours are empty (checkerboard pattern); the continuous edges then rotate more, behaving only partially fixed → **larger** positive coefficients (Table 12.5, which assumes about half fixity). Hence $M_{pos} = C_{dl}w_Dl^2 + C_{ll}w_Ll^2$, computed separately and added.
- **Maximum negative moment** at a continuous edge occurs when the panels on **both** sides are loaded — i.e. everything loaded — so Table 12.3 is used with the **total** factored load $w_u = 1.2D + 1.6L$.
- At a **discontinuous** edge the negative moment is taken as **⅓ of the positive moment** in that direction (some restraint from the edge beam/wall).`,
  },
  {
    id: 'strips',
    topic: T,
    q: 'What are middle strips and column strips in the moment coefficient method? How is the column-strip reinforcement determined?',
    seen: [],
    a: `- Each direction of a panel is divided into a **middle strip** = central half of the panel width, and two **column strips** = the outer quarters (width l/4 each).
- The tabulated coefficients give the moment per ft in the **middle strip**: $M_a = C_aw l_a^2$, $M_b = C_bw l_b^2$ ($l_a$ short clear span, $m = l_a/l_b$).
- In a column strip the moment drops from the full middle-strip value at its inner edge to **⅓** of it at the support line — average ≈ **⅔**. So the column-strip steel is ⅔ of the middle-strip steel: in practice spacing = **1.5 × middle-strip spacing**, but **≤ 2h** and **not less than As,min** (0.0018bh). Column-strip top steel at a continuous edge = ⅔ × middle-strip top steel (≥ As,min).
- Bars are placed: short-direction bars in the lower layer (d = h − 1), long-direction on top (d ≈ h − 1.5). Alternate bottom bars are cranked to the top at the edges with extra top bars as needed; bend points l/4 (continuous) and l/7 (discontinuous), top bars l/3 beyond the face.`,
    Fig: ColStripFig,
  },
  {
    id: 'spacing-2h',
    topic: T,
    q: 'State the minimum steel, maximum spacing and placement rules for two-way slabs.',
    seen: ['2017-18'],
    a: `- Minimum steel each way = T&S ratio: 0.0018bh (Gr 60), 0.0020bh (Gr 40/50) — so temperature steel is automatically satisfied.
- Maximum spacing at critical sections **2h** (≤ 18 in); elsewhere 3h/18 in.
- Short-direction bars below (larger moment gets the larger d); long-direction bars on top, d smaller by one bar diameter (class: ½ in).
- Clear cover ¾ in; spacing rounded down to ½ in; bars usually #3/#4.
- Exterior corners: corner steel top and bottom over l/5 (longer span).`,
  },
  {
    id: 'hmin-2way',
    topic: T,
    q: 'How is the minimum thickness of a two-way slab supported on beams found? What are αm and β?',
    seen: [],
    a: `- Slides ("new formula", αm > 2.0, Nilson eq. 13.8b): $h = \\dfrac{l_n(0.8 + f_y/200{,}000)}{36 + 9\\beta} \\ge 3.5$ in.
  - $l_n$ = clear span in the **long** direction (in), $\\beta$ = long/short clear span ratio.
  - $\\alpha_m$ = average of $\\alpha_f = E_{cb}I_b/(E_{cs}I_s)$ of the beams on the panel edges (beam as a T-section, slab width = panel width).
- Old method: $h = \\text{perimeter}/180 \\ge 3.5$ in.
- Purpose: deflection control without calculation (serviceability), like the one-way table. Higher $f_y$ → thicker slab.
- Example: 20 × 25 ft clear, Grade 60 → $h = 300(1.1)/(36 + 11.25) = 6.98$ → 7 in (perimeter/180 = 6.0 in).`,
  },
  {
    id: 'mcm',
    topic: T,
    q: 'What is the moment coefficient method? State its applicability and how the panel case is chosen.',
    seen: [],
    a: `- Introduced in the **1963 ACI Code** (Method 3), dropped from ACI in 1977 but still in BNBC; Nilson Tables 12.3–12.6.
- Applies to two-way slabs supported on all four edges by **walls or stiff beams** (beam depth ≳ 3h, αm > 2), uniformly loaded.
- $M_a = C_awl_a^2$, $M_b = C_bwl_b^2$ for the middle strip; $l_a \\le l_b$ clear spans, $m = l_a/l_b$ (0.5–1.0, interpolate).
- **Case** 1–9 from the continuous (hatched) edges: 1 none; 2 all; 3 both short; 4 one long + one short (corner panel); 5 both long; 6 one long; 7 one short; 8 three continuous with one long discontinuous; 9 three continuous with one short discontinuous. Quick picks: interior panel → 2, corner → 4, edge panel → 8 or 9, panel on brick walls all round → 1.
- Table 12.6 gives the share $W_a$ of the load carried in the short direction → shear and loads on the supporting beams: long beam $W_aW/2l_b$, short beam $W_bW/2l_a$ per ft.`,
  },
]

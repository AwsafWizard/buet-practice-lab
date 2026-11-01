// One-way slab theory bank (every slab-1way theory part in papers P1–P4, merged) with model answers.
import type { RcTheoryItem } from '../../types'

const T = 'rc-oneway' as const

function TsFig() {
  return (
    <svg viewBox="0 0 520 200" className="w-full h-auto max-w-xl">
      <text x={10} y={14} fontSize={11} fill="var(--c-mute)" fontWeight={700}>
        Plan of a one-way slab (supports along the long edges)
      </text>
      <rect x={40} y={30} width={300} height={140} fill="var(--c-panel2)" stroke="var(--c-ink)" />
      <rect x={30} y={22} width={320} height={8} fill="var(--c-mute)" fillOpacity={0.4} />
      <rect x={30} y={170} width={320} height={8} fill="var(--c-mute)" fillOpacity={0.4} />
      {Array.from({ length: 14 }, (_, i) => (
        <line key={'m' + i} x1={52 + i * 21} x2={52 + i * 21} y1={32} y2={168} stroke="var(--c-bad)" strokeWidth={1.6} />
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <line key={'t' + i} x1={42} x2={338} y1={45 + i * 22} y2={45 + i * 22} stroke="#3b82f6" strokeWidth={1.2} strokeDasharray="6 2" />
      ))}
      <text x={350} y={60} fontSize={10.5} fill="var(--c-bad)">
        main bars (span direction)
      </text>
      <text x={350} y={76} fontSize={10.5} fill="var(--c-bad)">
        s ≤ 3h, 18 in
      </text>
      <text x={350} y={110} fontSize={10.5} fill="#3b82f6">
        T&S / distribution bars ⊥
      </text>
      <text x={350} y={126} fontSize={10.5} fill="#3b82f6">
        0.0018bh (Gr 60), s ≤ 5h, 18 in
      </text>
      <path d="M120,60 l12,18 l-6,20 l14,16 M240,140 l10,-14 l-4,-18" fill="none" stroke="var(--c-load)" strokeWidth={1.2} />
      <text x={350} y={160} fontSize={10.5} fill="var(--c-load)">
        shrinkage cracks if unreinforced
      </text>
    </svg>
  )
}

function HminFig() {
  const rows: [string, string, string][] = [
    ['Simply supported', 'l/20', 'ss'],
    ['One end continuous', 'l/24', 'one'],
    ['Both ends continuous', 'l/28', 'both'],
    ['Cantilever', 'l/10', 'cant'],
  ]
  return (
    <svg viewBox="0 0 520 170" className="w-full h-auto max-w-xl">
      {rows.map(([name, rule, k], i) => {
        const y = 22 + i * 38
        return (
          <g key={k}>
            <line x1={40} x2={k === 'cant' ? 170 : 240} y1={y} y2={y} stroke="var(--c-ink)" strokeWidth={3} />
            {k === 'cant' ? (
              <rect x={30} y={y - 12} width={10} height={24} fill="url(#hatchH)" stroke="var(--c-mute)" />
            ) : (
              <>
                <path d={`M40,${y + 2} l-6,10 h12 z`} fill="none" stroke="var(--c-mute)" />
                <path d={`M240,${y + 2} l-6,10 h12 z`} fill="none" stroke="var(--c-mute)" />
                {(k === 'one' || k === 'both') && <line x1={240} x2={262} y1={y} y2={y} stroke="var(--c-ink)" strokeWidth={3} strokeDasharray="4 3" />}
                {k === 'both' && <line x1={18} x2={40} y1={y} y2={y} stroke="var(--c-ink)" strokeWidth={3} strokeDasharray="4 3" />}
              </>
            )}
            <text x={290} y={y + 4} fontSize={11} fill="var(--c-ink)">
              {name}
            </text>
            <text x={450} y={y + 4} fontSize={12} fill="var(--c-accent)" fontWeight={700}>
              {rule}
            </text>
          </g>
        )
      })}
      <defs>
        <pattern id="hatchH" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="5" stroke="var(--c-mute)" />
        </pattern>
      </defs>
    </svg>
  )
}

function CrankFig() {
  return (
    <svg viewBox="0 0 560 150" className="w-full h-auto max-w-xl">
      <rect x={20} y={50} width={520} height={22} fill="var(--c-panel2)" stroke="var(--c-ink)" />
      {[20, 280, 530].map((x, i) => (
        <rect key={i} x={i === 0 ? 10 : i === 2 ? 530 : 270} y={72} width={20} height={30} fill="var(--c-panel2)" stroke="var(--c-mute)" />
      ))}
      <line x1={22} x2={538} y1={68} y2={68} stroke="#3b82f6" strokeWidth={1.8} />
      <path d="M22,62 L22,54 L58,54 L68,66 L205,66 L215,54 L360,54 L370,66" fill="none" stroke="var(--c-bad)" strokeWidth={1.8} />
      <line x1={195} x2={365} y1={57} y2={57} stroke="var(--c-good)" strokeWidth={2.4} />
      <text x={40} y={44} fontSize={10} fill="var(--c-bad)">
        ln/7
      </text>
      <text x={210} y={44} fontSize={10} fill="var(--c-bad)">
        ln/4
      </text>
      <text x={280} y={44} fontSize={10} fill="var(--c-good)" textAnchor="middle">
        extra top: ln/3 each side of the face
      </text>
      <text x={20} y={124} fontSize={10.5} fill="var(--c-mute)">
        blue = straight bottom bar · red = alternate bar cranked up over the support · green = extra top bars
      </text>
      <text x={20} y={140} fontSize={10.5} fill="var(--c-mute)">
        one cranked bar per 2s width reaches the top: extra = As,top × 2s/12 − Ab
      </text>
    </svg>
  )
}

function PatternFig() {
  const row = (y: number, label: string, cant: boolean, span: boolean) => (
    <g>
      <text x={10} y={y + 4} fontSize={10.5} fill="var(--c-ink)">
        {label}
      </text>
      <line x1={190} x2={510} y1={y + 18} y2={y + 18} stroke="var(--c-ink)" strokeWidth={2.5} />
      <path d={`M250,${y + 20} l-5,8 h10 z M450,${y + 20} l-5,8 h10 z`} fill="none" stroke="var(--c-mute)" />
      {cant && <rect x={190} y={y} width={60} height={14} fill="var(--c-load)" fillOpacity={0.35} />}
      {cant && <rect x={450} y={y} width={60} height={14} fill="var(--c-load)" fillOpacity={0.35} />}
      {span && <rect x={250} y={y} width={200} height={14} fill="var(--c-load)" fillOpacity={0.35} />}
    </g>
  )
  return (
    <svg viewBox="0 0 520 150" className="w-full h-auto max-w-xl">
      {row(10, 'max −M (support), uplift', true, false)}
      {row(56, 'max +M (span)', false, true)}
      {row(102, 'full load (max reactions)', true, true)}
    </svg>
  )
}

export const ONEWAY_THEORY: RcTheoryItem[] = [
  {
    id: 'ts-steel',
    topic: T,
    q: 'What is temperature & shrinkage reinforcement? Why and how is it provided in a one-way slab? Give the ACI/BNBC ratios and spacing limits.',
    seen: ['2023-24', '2021-22', '2020-21', 'Jan 2021', '2017-18', '2016-17', '2015-16', '2013-14', '2012-13', '2011-12', '2010-11', '2009-10', '2008-09', '2007-08', '2006-07', '2005-06', '2002-03'],
    a: `**Why.** Concrete shrinks as it dries and expands/contracts with temperature. A slab is restrained by its beams, walls and the rest of the frame, so these volume changes cannot happen freely: restrained shrinkage and temperature drop produce **tensile stresses**, and because concrete is weak in tension it cracks (irregular map cracks, often at ≈ 120° to each other). In a one-way slab the **main bars run in the span direction only**; nothing controls cracking in the perpendicular direction. Temperature & shrinkage (T&S) steel is therefore placed **perpendicular to the main bars**. It also
- distributes concentrated loads sideways to more main bars (hence "distribution bars"),
- holds the main bars in position during concreting (a mat),
- keeps any cracks that do form fine and closely spaced (better durability, appearance, water-tightness).

**How (ACI 24.4.3 / BNBC)** — area on the **gross** section $b \\times h$:
- Grade 40 or 50 deformed bars: $A_s = 0.0020\\,bh$
- Grade 60 deformed bars or welded wire fabric: $A_s = 0.0018\\,bh$
- $f_y > 60$ ksi: $0.0018 \\times 60{,}000/f_y \\ge 0.0014$
- Spacing $\\le 5h$ and $\\le 18$ in. Small bars (#3) at close spacing are better than large bars far apart (more bond surface → finer cracks).
- The same ratio is the **minimum flexural steel** of a slab (main-bar spacing ≤ 3h, 18 in).
- Placed just above the bottom main bars in the span (and under the top bars over cantilevers / supports).

**Example**: h = 6 in, Grade 60 → $A_s = 0.0018 \\times 12 \\times 6 = 0.130$ in²/ft → #3: $s = 0.11 \\times 12/0.130 = 10.2$ → **#3 @ 10 in c/c** (≤ 5h = 30, ≤ 18 in).`,
    Fig: TsFig,
  },
  {
    id: 'hmin',
    topic: T,
    q: 'Write the ACI minimum thickness of one-way slabs for different support conditions. Why is a minimum thickness required even when flexure and shear do not need it?',
    seen: ['2023-24', '2006-07', '2005-06'],
    a: `**ACI Table 7.3.1.1** (non-prestressed one-way slabs, normal-weight concrete, $f_y = 60$ ksi, not supporting partitions likely to be damaged by deflection):

- simply supported l/20; one end continuous l/24; both ends continuous l/28; cantilever l/10
- For $f_y \\ne 60$ ksi multiply by $(0.4 + f_y/100{,}000)$; lightweight concrete (90–115 pcf) by $(1.65 - 0.005w_c) \\ge 1.09$.
- (Beams: l/16, l/18.5, l/21, l/8. Two-way slabs on stiff beams: $h = l_n(0.8 + f_y/200{,}000)/(36 + 9\\beta) \\ge 3.5$ in.)
- Class practice: round up (h > 6 in → next ½ in), clear cover ¾ in, d ≈ h − 1 in.

**Why it is needed.** Slabs are thin, so strength alone usually allows a very shallow section with a high steel ratio. Such a slab is **flexible**: short-term deflection is large and **creep and shrinkage** keep increasing it for years (long-term deflection can be 2–3 × the immediate one). Excessive deflection
- cracks partitions, plaster and finishes (limit ≈ span/480–500 for the incremental deflection after partitions are built),
- is visible and alarming (≈ span/250 total), causes ponding on roofs and doors/windows jamming,
- gives annoying **vibration**.

Respecting the minimum thickness keeps the stiffness high enough that ACI does **not** require a deflection calculation — it is a **serviceability** requirement, not a strength one. Higher-grade steel means less steel, lower stiffness and more deflection, hence the $f_y$ factor.`,
    Fig: HminFig,
  },
  {
    id: 'minmax-steel',
    topic: T,
    q: 'What are the ACI minimum reinforcement and maximum bar spacing for one-way and two-way slabs? What is the maximum permissible steel and why are these limits needed?',
    seen: ['2017-18', '2004-05'],
    a: `**Minimum flexural steel in slabs** = the T&S ratio on the gross section: $0.0020bh$ (Gr 40/50), $0.0018bh$ (Gr 60). (Beams use $A_{s,min} = 3\\sqrt{f'_c}\\,b_wd/f_y \\ge 200b_wd/f_y$ instead.) It goes in the tension face.

**Maximum spacing**
- One-way slab main bars: $\\le 3h$ and $\\le 18$ in.
- One-way slab T&S bars: $\\le 5h$ and $\\le 18$ in.
- Two-way slab at critical sections: $\\le 2h$ (and ≤ 18 in); elsewhere T&S rules.

**Maximum steel**: the section must be **tension-controlled**, $\\varepsilon_t \\ge 0.005$ ($\\rho \\le \\rho_{0.005} = 0.85\\beta_1\\frac{f'_c}{f_y}\\frac{0.003}{0.008}$) so that $\\phi = 0.9$; ACI's absolute limit for flexural members is $\\varepsilon_t \\ge 0.004$. Slabs normally use ρ ≈ 0.4–0.8 %, far below this.

**Why**
- *Minimum steel*: prevents a sudden brittle failure when the slab cracks (the steel must carry the cracking moment) and controls temperature/shrinkage cracking.
- *Maximum spacing*: bars far apart leave wide cracks between them and cannot spread concentrated loads; 2h in two-way slabs because moments vary across the panel and the slab is thin.
- *Maximum steel*: guarantees ductile behaviour — steel yields, large deflection and cracking warn before crushing.`,
  },
  {
    id: 'cranked',
    topic: T,
    q: 'Why are alternate bars cranked (bent up) in slabs? What are "extra top" bars? Show the usual bend and cut-off points for approximately equal spans.',
    seen: [],
    a: `- Positive moment needs steel at the **bottom** near midspan; negative moment needs steel at the **top** over the supports. Bottom steel is not needed over its whole length near the supports, so **every alternate bottom bar is cranked (bent up at ≈ 45°)** to become top steel over the support. One set of bars thus serves both moments — economical, and the bars are well anchored.
- The other half stays straight at the bottom and runs into the support (≥ 6 in) for positive-moment anchorage and integrity.
- At a support only **one cranked bar arrives in each 2s width** (from each side, the class counts one). If the top steel required is more, the shortfall is added as straight **extra top bars** between the cranked bars: $n = \\dfrac{A_{s,top}\\,(2s)/12 - A_b}{A_b}$ (rounded up, except when only a hair above a whole number). Equivalent spacing form: $A_{s,extra} = A_{s,top} - \\tfrac12(A_b\\,12/s)$ per ft → $s_{extra} = A_b\\,12/A_{s,extra}$.
- Usual points (equal spans, UDL, Nilson Fig. 6.21 / 12.4): cranked bars bend up at **ln/7** from a discontinuous (unrestrained) end and **ln/4** from a continuous support; top bars extend **ln/3** beyond the support face; up to 50 % of the bottom bars may stop at ln/8 from the support.
- **Straight-bar alternative**: straight bottom bars, separate straight top bars over the supports at their own spacing (easier to fix, a little more steel). Two sets at $s_1$ and $s_2$ act like one at $1/s = 1/s_1 + 1/s_2$.`,
    Fig: CrankFig,
  },
  {
    id: 'aci-coef',
    topic: T,
    q: 'When may the ACI moment coefficients be used for continuous one-way slabs? Why can they not be used for a slab with a cantilever?',
    seen: [],
    a: `ACI 6.5 approximate analysis: $M_u = C w_u l_n^2$, $V_u = C_v w_u l_n/2$, allowed when
- there are **two or more spans**,
- spans are approximately equal — the larger of two adjacent spans ≤ **1.2 ×** the smaller,
- loads are **uniformly distributed**,
- unfactored $L \\le 3D$,
- members are prismatic.

$l_n$ = clear span; for negative moment at an interior support the **average** of the two adjacent clear spans. The coefficients already contain the effect of live-load patterns (alternate spans loaded) and some redistribution.

A slab with a **cantilever** violates these assumptions: the overhang moment depends only on the load on the overhang (statically determinate) and the cantilever **relieves** the span. Moments must be found by statics with live-load patterns — LL on the cantilever for max −M, LL on the span only for max +M, DL-only span with loaded cantilevers for uplift / negative span moment.`,
  },
  {
    id: 'll-pattern',
    topic: T,
    q: 'For a one-way slab with cantilever(s), explain how live load is placed to get the critical design moments.',
    seen: [],
    a: `Dead load is permanent (factor 1.2 on every part); live load may occupy **any portion**, so each critical moment has its own pattern (factored LL 1.6L only where it hurts):
1. **Maximum negative moment** at the support: LL on the **cantilever** — $-M_u = w_ua^2/2$ (a = length from the face). The span load does not affect it (cantilever is determinate).
2. **Maximum positive moment** in the span: LL on the **span only**, cantilevers with 1.2D only (the cantilever moment relieves the span): $+M_u = w_uL^2/8 - 1.2w_Da^2/2$ (two equal overhangs) or $R^2/2w_u$ with $R = w_uL/2 - M/L$ (one overhang).
3. **Uplift / reversal**: 1.2D on the span, full $w_u$ on the cantilever(s). If the span moment turns **negative** top steel must run through the whole span; if the far reaction is negative the slab must be anchored.
4. Full load everywhere gives the largest reactions (beam / wall design).`,
    Fig: PatternFig,
  },
  {
    id: 'strip',
    topic: T,
    q: 'What is a one-way slab and why is it designed as a 1-ft wide strip?',
    seen: [],
    a: `- A slab supported on **two opposite sides** only, or on four sides with **long/short ≥ 2**, bends essentially in one direction (cylindrical surface) — almost all load goes to the long supports: with $l_b/l_a = 2$ the short strip carries $(l_b/l_a)^4/(1 + (l_b/l_a)^4) = 94$ %.
- Every 1-ft strip across the span behaves the same, so the slab is designed as a **rectangular beam b = 12 in**, depth h: $w_u$ in k/ft per ft, $M_u$ in k-ft/ft, $A_s$ in in²/ft → bar spacing $s = 12A_b/A_s$.
- The perpendicular direction needs only **T&S (distribution) steel**.
- Shear is rarely critical ($\\phi V_c = 0.75 \\cdot 2\\sqrt{f'_c}\\cdot 12d$ is large compared with $V_u$); stirrups are not used in slabs.`,
  },
  {
    id: 'cover',
    topic: T,
    q: 'State the clear cover and spacing requirements for slab reinforcement.',
    seen: [],
    a: `- Clear cover ¾ in for slabs not exposed to weather or in contact with ground (1½ in exposed #5 and smaller, 3 in cast against earth) → $d \\approx h - 1$ in for #3/#4 bars.
- Main bars: $s \\le 3h$ and 18 in (one-way), $\\le 2h$ at critical sections (two-way). T&S: $\\le 5h$, 18 in.
- Clear spacing ≥ $d_b$, 1 in and 4/3 × max aggregate; practical minimum ≈ 4–4.5 in (use a bigger bar if #3 needs less).
- Spacing rounded **down** to ½ in; h rounded **up** (½ in above 6 in, ¼ in otherwise).`,
  },
]

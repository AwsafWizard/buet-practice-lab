// Every CE 104 formula and table on one page (class conventions first).
import { Md } from '../../components/ui'

const S: { title: string; md: string }[] = [
  {
    title: 'Chain & tape',
    md: `- Engineer’s chain 100 ft = 100 links (1 link = 1 ft); Gunter’s chain 66 ft = 100 links (0.66 ft); metric chains 20 m / 30 m. Tag every 10 ft (round brass tag at the middle).
- Chainage “a+b” = a chains + b ft: **1+20 = 120 ft**. One arrow per full chain.
- True length = measured × $L'/L$ · true area = measured × $(L'/L)^2$ ($L'$ = actual chain length, $L$ = nominal).
- Slope: $D = \\sqrt{L^2 - h^2}$, correction $\\approx h^2/2L$ (always −); or $D = L\\cos\\theta$.
- Well-conditioned triangle: every angle **30°–120°** (best near 60°). At least one side > one chain.
- Foot of the perpendicular: 3-4-5 tape triangle, swing method (mid-point of the two cuts), optical square (two mirrors at 45° → 90°).`,
  },
  {
    title: 'Bearings',
    md: `| WCB in | Reduced bearing |
|---|---|
| 0°–90° | N θ E |
| 90°–180° | S (180° − θ) E |
| 180°–270° | S (θ − 180°) W |
| 270°–360° | N (360° − θ) W |

- Back bearing = fore bearing ± 180°. FB − BB ≠ 180° ⇒ local attraction at one end.
- Included angle at B = bearing of BA − bearing of BC (clockwise from BC to BA). Deflection = 180° − included angle.
- Magnetic declination = angle between true and magnetic north: true bearing = magnetic ± declination (E +, W −).`,
  },
  {
    title: 'Levelling',
    md: `- Rise & fall: previous reading − this reading = **+ rise / − fall**; RL = previous RL + rise − fall.
- HI method: HI = RL + BS; RL = HI − IS (or FS); new HI after a change point = RL(CP) + BS.
- **Check:** $\\Sigma BS - \\Sigma FS = \\Sigma \\text{Rise} - \\Sigma \\text{Fall} = \\text{Last RL} - \\text{First RL}$.
- HI check: $\\Sigma(\\text{HI} \\times \\text{no. of IS + FS from it}) - \\Sigma IS - \\Sigma FS = \\Sigma \\text{RL except the first}$.
- Curvature $c = 0.0785\\,d^2$ (m, d in km, −); refraction $= c/7$ (+); combined $0.0673\\,d^2$ (−). Keep sights ≤ ≈ 70 m.
- Allowable misclosure (ordinary levelling) ≈ $\\pm 0.025\\sqrt{K}$ m, K in km.
- Strip this year: 100 m × 6 m, CL readings every 10 m, cross readings every 20 m at 1.5 m both sides (Ch 0, 20 … 100), ≥ 2 set-ups.`,
  },
  {
    title: 'Contouring (grid)',
    md: `- 50 m square, 5 m grid, two level stations; contour interval chosen so **≥ 7 contour lines** cross the plot.
- Interpolation along a grid line: $x = \\dfrac{L - z_1}{z_2 - z_1} \\times a$ (a = grid spacing).
- Contours never cross (except overhangs), close on themselves, are closely spaced on steep ground; V pointing uphill = valley, downhill = ridge.`,
  },
  {
    title: 'Closed traverse',
    md: `- Σ interior angles = $(n - 2)\\,180°$ (exterior: $(n + 2)\\,180°$). Correction per angle = −error / n (class allows ≤ 1°).
- Bearing of the next line = back bearing of the previous ± included angle (− going clockwise round the figure, + anticlockwise).
- Latitude $= l\\cos\\theta$ (+N), departure $= l\\sin\\theta$ (+E).
- Closing error $e = \\sqrt{(\\Sigma L)^2 + (\\Sigma D)^2}$, direction $\\tan^{-1}(\\Sigma D/\\Sigma L)$; precision = 1 in perimeter / e.
- Bowditch: $C_L = -\\Sigma L \\cdot l/\\Sigma l$, $C_D = -\\Sigma D \\cdot l/\\Sigma l$. Transit: $C_L = -\\Sigma L\\,|L|/\\Sigma|L|$.
- Area by coordinates $A = \\tfrac12|\\Sigma(E_i N_{i+1} - E_{i+1} N_i)|$; by DMD $A = \\tfrac12|\\Sigma \\text{DMD} \\times \\text{lat}|$.
- **1 acre = 43 560 ft² = 4046.86 m² = 100 decimals.**`,
  },
  {
    title: 'Stadia tacheometry',
    md: `- Level sight: $D = Ks + C$ (s = upper − lower). Two shots: $K = \\dfrac{D_2 - D_1}{s_2 - s_1}$, $C = D_1 - Ks_1$. Class result: K = 100, C = 0.
- Inclined sight, staff vertical: $D = Ks\\cos^2\\theta + C\\cos\\theta$, $V = \\tfrac12 Ks\\sin 2\\theta + C\\sin\\theta$.
- RL of staff station = RL(instrument stn) + h(instrument) ± V − middle hair reading.`,
  },
  {
    title: 'Height & distance',
    md: `- Tower, stations in line (far θ₁, near θ₂, a apart): $H = h_1 + (a + x)\\tan\\theta_1 = h_2 + x\\tan\\theta_2 \\Rightarrow x = \\dfrac{h_2 - h_1 - a\\tan\\theta_1}{\\tan\\theta_1 - \\tan\\theta_2}$. Same level: $x = \\dfrac{a\\tan\\theta_1}{\\tan\\theta_2 - \\tan\\theta_1}$.
- Base AB, target foot C: $\\angle ACB = 180° - \\angle BAC - \\angle ABC$; $AC = \\dfrac{AB\\sin\\angle ABC}{\\sin\\angle ACB}$; height $CF = AC\\tan\\angle CAF$.
- Ground distance between feet: $CD^2 = AC^2 + AD^2 - 2\\,AC\\,AD\\cos\\angle CAD$; aerial $FG = \\sqrt{CD^2 + (CF - DG)^2}$.
- Space triangle: $s = (a+b+c)/2$, $A = \\sqrt{s(s-a)(s-b)(s-c)}$.`,
  },
  {
    title: 'Curve setting (class sheet)',
    md: `- $v^2/(gR)$ = centrifugal ratio (given as h/b) ⇒ $R = v^2/(g\\times\\text{ratio})$, nearest 5 ft. 1 mph = 1.4667 ft/s; g = 32.2 ft/s².
- Super-elevation $h = bv^2/(gR)$ (= ratio × b); transition $L_t = hN$ (1 in N).
- Spiral angle $S_a = \\dfrac{L_t}{2\\pi R}\\times 180°$; shift $S = L_t^2/24R$; tangent length $L = (R+S)\\tan\\dfrac{\\Delta}{2} + \\dfrac{L_t}{2}$; circular $L_c = \\dfrac{\\pi R}{180}(\\Delta - 2S_a)$.
- Chainages: A = PI − L, B = A + Lₜ, C = B + L꜀, D = C + Lₜ.
- Transition deflection $\\delta = \\dfrac{1800\\,l^2}{\\pi R L_t}$ minutes (l from A); circular chord angle $= 1718.9\\,c/R$ minutes (cumulative).
- Checks: last transition peg = $S_a/3$; cumulative at mid-curve = $(\\Delta - 2S_a)/4$; apex distance $E = R(\\sec\\frac{\\Delta}{2} - 1)$; offset at end of transition $= L_t^2/6R = 4S$.
- Simple curve: $T = R\\tan\\frac{\\Delta}{2}$, $l = \\pi R\\Delta/180$, long chord $2R\\sin\\frac{\\Delta}{2}$, mid-ordinate $R(1 - \\cos\\frac{\\Delta}{2})$.`,
  },
  {
    title: 'House setting & route',
    md: `- Centre-line method: pegs on the wall centre lines, ropes at ± half the trench width; footing pits ± half the footing size about each column centre.
- Square corners: 3-4-5 (or 6-8-10) and **equal diagonals** $d = \\sqrt{a^2 + b^2}$.
- Route this year: 150 m in 3 × 50 m straights, two 3.5 m lanes, ROW 10 m (± 5 m); plan 1:500, profile 1:500 H / 1:100 V, cross-sections above the profile.
- Deflection at an IP = change of bearing between the straights (R if clockwise).`,
  },
]

export default function SvFormulas() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold">Formula sheet</h1>
        <p className="text-mute text-sm mt-1">Everything the field works and the quizzes use, in the class’s own form.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {S.map((s) => (
          <section key={s.title} className="card p-4">
            <h2 className="font-bold mb-2 text-accent">{s.title}</h2>
            <Md>{s.md}</Md>
          </section>
        ))}
      </div>
    </div>
  )
}

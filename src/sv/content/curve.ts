// CE 104: Curve setting (transition + circular): question bank, viva cards and Learn notes.
// Worked data (curve-setting sheet, 18-batch): Δ 29.33°, 32 mph, h/b 0.15, b 9 ft, 1 in 50, peg 10 ft, PI 1662 ft.
import type { SvCard, SvLearn, SvQuestion, SvTopicContent } from '../types'

const TOPIC = 'sv-curve' as const
let qn = 0
let vn = 0

const mcq = (lvl: 1 | 2 | 3, q: string, right: string, wrong: [string, string, string], pos: 0 | 1 | 2 | 3, why: string, src: string): SvQuestion => {
  const opts = [...wrong]
  opts.splice(pos, 0, right)
  return { id: `q-curve-${++qn}`, topic: TOPIC, kind: 'mcq', q, opts, a: pos, why, src, lvl }
}
const tf = (lvl: 1 | 2 | 3, q: string, a: boolean, why: string, src: string): SvQuestion => ({ id: `q-curve-${++qn}`, topic: TOPIC, kind: 'tf', q, a, why, src, lvl })
const blank = (lvl: 1 | 2 | 3, q: string, a: string[], why: string, src: string): SvQuestion => ({ id: `q-curve-${++qn}`, topic: TOPIC, kind: 'blank', q, a, why, src, lvl })
const card = (front: string, back: string, src?: string): SvCard => ({ id: `v-curve-${++vn}`, topic: TOPIC, front, back, src })

const questions: SvQuestion[] = [
  // ---- MCQ (25)
  mcq(1, `The centrifugal ratio on the curve-setting sheet is written as`, `v²/(gR), equal to h/b`, [`v/(gR)`, `gR/v²`, `v²R/g`], 0, `Centrifugal ratio = v²/(gR); the sheet gives it as h/b, so the radius follows from R = v²/(g × ratio).`, `class notes (Quiz p17)`),
  mcq(2, `On the sheet the radius of the circular curve is calculated as`, `R = v² / (g × centrifugal ratio), rounded to the nearest 5 ft`, [`R = g v² / ratio`, `R = v / (g × ratio), rounded up to 10 ft`, `R = ratio × v² / g, not rounded`], 1, `Centrifugal ratio v²/(gR) = h/b, so R = v²/(g × ratio). The sheet rounds R to 5 ft.`, `lecture sheet p27`),
  mcq(2, `A design speed of 32 mph in ft/s is`, `46.93 ft/s`, [`21.8 ft/s`, `32.00 ft/s`, `68.9 ft/s`], 2, `1 mph = 5280/3600 = 1.4667 ft/s, so 32 mph = 46.93 ft/s.`, `lecture sheet p27`),
  mcq(3, `v = 46.93 ft/s, centrifugal ratio 0.15, g = 32.2 ft/s². The radius R, rounded to the nearest 5 ft, is`, `455 ft`, [`456 ft`, `460 ft`, `450 ft`], 3, `R = 46.93²/(32.2 × 0.15) = 2202.7/4.83 = 456.05 ft, and 456.05 rounds to 455 ft (the nearest multiple of 5).`, `18-batch report`),
  mcq(2, `Road width b = 9 ft and h/b = 0.15. The super-elevation h is`, `1.35 ft`, [`0.15 ft`, `13.5 ft`, `0.0167 ft`], 1, `h = ratio × b = 0.15 × 9 = 1.35 ft (16.2 in).`, `lecture sheet p27`),
  mcq(2, `Super-elevation h = 1.35 ft is run out at 1 in 50. The transition length Lₜ is`, `67.5 ft`, [`27 ft`, `6.75 ft`, `135 ft`], 0, `Lₜ = h N = 1.35 × 50 = 67.5 ft. "1 in 50" means 50 ft of length for 1 ft of rise.`, `class notes (Quiz p17)`),
  mcq(3, `Lₜ = 67.5 ft and R = 455 ft. The spiral angle Sₐ is`, `4.25°`, [`8.50°`, `2.12°`, `0.0742°`], 1, `Sₐ = Lₜ/(2R) = 67.5/910 = 0.07418 rad = 4.25°.`, `class notes (Quiz p17)`),
  mcq(3, `Lₜ = 67.5 ft and R = 455 ft. The shift S = Lₜ²/(24R) is`, `0.42 ft`, [`0.84 ft`, `4.17 ft`, `0.0042 ft`], 2, `S = 67.5²/(24 × 455) = 4556.25/10 920 = 0.417 ft ≈ 0.42 ft.`, `lecture sheet p27`),
  mcq(3, `Δ = 29.33°, R = 455 ft, S = 0.417 ft, Lₜ = 67.5 ft. The tangent length from the PI to the start of the transition is`, `152.9 ft`, [`127.5 ft`, `119.2 ft`, `185.7 ft`], 3, `T = (R + S) tan(Δ/2) + Lₜ/2 = 455.417 × tan 14.665° + 33.75 = 119.18 + 33.75 = 152.9 ft.`, `lecture sheet p27`),
  mcq(3, `Δ = 29.33°, Sₐ = 4.25°, R = 455 ft. The length of the circular curve Lc = πR(Δ − 2Sₐ)/180 is`, `165.4 ft`, [`233.0 ft`, `82.7 ft`, `208.3 ft`], 0, `Δ − 2Sₐ = 20.83°; Lc = π × 455 × 20.83/180 = 165.4 ft.`, `lecture sheet p27`),
  mcq(2, `PI chainage 1662 ft, tangent length 152.9 ft. The chainage of the start of the transition A is`, `1509.1 ft`, [`1814.9 ft`, `1576.6 ft`, `1662.0 ft`], 1, `A = PI − T = 1662 − 152.9 = 1509.1 ft.`, `lecture sheet p27`),
  mcq(2, `A = 1509.1 ft and Lₜ = 67.5 ft. The chainage of the start of the circular curve B is`, `1576.6 ft`, [`1442.1 ft`, `1741.9 ft`, `1659.3 ft`], 2, `B = A + Lₜ = 1509.1 + 67.5 = 1576.6 ft.`, `lecture sheet p27`),
  mcq(3, `Deflection angle of a transition peg is 1800 l²/(π R Lₜ) minutes. With R = 455 ft, Lₜ = 67.5 ft and l = 20 ft the deflection is`, `7.46′`, [`1.87′`, `3.73′`, `14.9′`], 3, `1800 × 400/(π × 455 × 67.5) = 720 000/96 487 = 7.46′.`, `18-batch report`),
  mcq(2, `For transition pegs, if the distance l from the start of the transition doubles, the deflection angle`, `becomes four times`, [`doubles`, `becomes half`, `stays the same`], 0, `δ ∝ l², so doubling l multiplies δ by 4 (1.87′ at 10 ft, 7.46′ at 20 ft).`, `class notes (Quiz p17)`),
  mcq(3, `Sₐ = 4.25°. The calculation check says the deflection at the last peg of the transition curve equals`, `Sₐ/3 = 1°25′`, [`Sₐ/2 = 2°07′`, `Sₐ = 4°15′`, `Sₐ/4 = 1°04′`], 1, `Deflection at the end of the spiral is Sₐ/3 = 1.417° = 1°25′. The table gives 1800 × 67.5²/(π × 455 × 67.5) = 85.0′, the same.`, `class notes (Quiz p18)`),
  mcq(3, `Circular curve chord of 10 ft, R = 455 ft. The deflection for that chord is 1718.9 c/R =`, `37.8′`, [`18.9′`, `75.6′`, `3.78′`], 2, `1718.9 × 10/455 = 37.78′ ≈ 37.8′. For 12.7 ft it is 48.0′.`, `18-batch report`),
  mcq(3, `The check for the circular table (set to the mid-point) is that the cumulative deflection at the last peg equals`, `¼(Δ − 2Sₐ) ≈ 5°12′`, [`½(Δ − 2Sₐ) ≈ 10°25′`, `(Δ − 2Sₐ) ≈ 20°50′`, `Sₐ/3 ≈ 1°25′`], 0, `The whole arc subtends (Δ − 2Sₐ)/2 at B from the tangent; the half arc to the mid-point gives half of that, ¼(Δ − 2Sₐ) = 5.21° = 5°12′.`, `class notes (Quiz p18)`),
  mcq(2, `Peg interval 10 ft, Lₜ = 67.5 ft. The sheet says "add undivided length with the last cord". The transition chords are`, `10, 10, 10, 10, 10, 17.5`, [`10, 10, 10, 10, 10, 10, 7.5`, `7.5, 10, 10, 10, 10, 10, 10`, `10, 10, 10, 10, 27.5`], 1, `Six full 10 ft intervals would make 60 ft; the odd 7.5 ft is not a separate chord but is added to the last one: 17.5 ft. Cumulative l = 10, 20, 30, 40, 50, 67.5.`, `lecture sheet p27`),
  mcq(2, `How many peg stations (rows) does the transition table have for Lₜ = 67.5 ft and 10 ft pegs?`, `6`, [`7`, `5`, `8`], 3, `Chords 10, 10, 10, 10, 10, 17.5: six pegs.`, `lecture sheet p27`),
  mcq(3, `Half the circular curve is 82.7 ft with 10 ft pegs. The chords are`, `seven of 10 ft and a last chord of 12.7 ft`, [`eight of 10 ft and a last chord of 2.7 ft`, `eight of 10.3 ft`, `six of 10 ft and a last chord of 22.7 ft`], 0, `82.7 = 70 + 12.7: the odd 2.7 ft joins the 8th chord, giving 7 × 10 and 12.7 (8 pegs).`, `18-batch report`),
  mcq(3, `The field check "apex distance E = R(sec Δ/2 − 1)" for R = 455 ft and Δ = 29.33° gives`, `15.3 ft`, [`13.4 ft`, `7.7 ft`, `30.6 ft`], 1, `sec 14.665° = 1.0337, so E = 455 × 0.0337 = 15.3 ft. (A 2022 sheet shows 13.42, which does not agree with the formula.)`, `class notes (Quiz p18)`),
  mcq(3, `The field check "offset = 4S" at the end of the transition (S = 0.417 ft) is`, `about 1.67 ft`, [`about 0.42 ft`, `about 4.2 ft`, `about 0.10 ft`], 2, `The offset from the tangent at the end of the transition is Lₜ²/(6R) = 4S = 1.67 ft (1.68 using S = 0.42).`, `lecture sheet p27`),
  mcq(3, `h = 1.35 ft is reached at the end of Lₜ = 67.5 ft. The super-elevation at the peg 30 ft from the start is`, `0.60 ft`, [`0.45 ft`, `1.35 ft`, `0.30 ft`], 3, `Super-elevation grows linearly: h × l/Lₜ = 1.35 × 30/67.5 = 0.60 ft.`, `class notes (Theory p10)`),
  mcq(2, `On the ground the super-elevation is attained with respect to`, `the inner edge, kept at ground level while the outer edge is raised (no crown)`, [`the outer edge, kept at ground level`, `the centre line, raised on both edges`, `the ground level 1 ft below the inner edge`], 1, `The sheet asks for it "w.r.t. the inner edge of the pavement assuming there is no crown". The outer edge rises by h × l/Lₜ.`, `lecture sheet p27`),
  mcq(2, `The common tangent at the end of the transition meets the original first tangent at a distance from the start of the transition equal to`, `⅔ Lₜ`, [`½ Lₜ`, `⅓ Lₜ`, `Lₜ`], 0, `Shown on the sheet as "2/3 Lₜ from starting pt": 67.5 ft gives 45 ft.`, `lecture sheet p25`),

  // ---- blank (9)
  blank(2, `The spiral angle in radians is Sₐ = Lₜ/(___ R).`, [`2`], `Sₐ = Lₜ/(2R) radians, or Lₜ/(2πR) × 180 degrees.`, `class notes (Quiz p17)`),
  blank(3, `Lₜ = 60 ft and R = 400 ft. The shift S = Lₜ²/(24R) = ___ ft.`, [`0.375`], `3600/9600 = 0.375 ft.`, `textbook`),
  blank(3, `h = 1.8 ft and the super-elevation is run out at 1 in 40. Lₜ = ___ ft.`, [`72`], `Lₜ = h N = 1.8 × 40 = 72 ft.`, `class notes (Quiz p17)`),
  blank(3, `v = 60 ft/s, ratio 1/4, g = 32.2 ft/s². R = v²/(g × ratio) = 447.2 ft, which rounds to the nearest 5 ft as ___ ft.`, [`445`], `447.2 is 2.2 above 445 and 2.8 below 450, so it rounds to 445 ft.`, `lecture sheet p27`),
  blank(2, `The circular-curve deflection (in minutes) for a chord c is ___ × c/R.`, [`1718.9`], `δ = (c/2R) radians = 1718.9 c/R minutes.`, `class notes (Quiz p17)`),
  blank(2, `The deflection at the last peg of the transition curve equals Sₐ divided by ___.`, [`3`], `Check: deflection at the end of the spiral = Sₐ/3.`, `class notes (Quiz p18)`),
  blank(2, `The apex distance is E = R (sec(Δ/2) − ___).`, [`1`], `E = R(sec Δ/2 − 1), the distance from the PI to the curve.`, `class notes (Quiz p18)`),
  blank(3, `PI at 1662 ft, T = 152.9, Lₜ = 67.5, Lc = 165.4. The chainage of the end of the transition D is ___ ft (to one decimal).`, [`1809.5`], `A = 1509.1, B = 1576.6, C = B + Lc = 1742.0, D = C + Lₜ = 1809.5 ft.`, `lecture sheet p27`),
  blank(1, `"1 in 50" for the run-out of super-elevation means 1 ft of rise in ___ ft of length.`, [`50`], `The rate of attaining super-elevation is 1 in N, here N = 50, so Lₜ = h × 50.`, `class notes (Quiz p17)`),

  // ---- true / false (11)
  tf(1, `Super-elevation is attained gradually along the transition curve.`, true, `It grows from zero at A to h at B (the start of the circular curve), so the ramp is Lₜ long.`, `class notes (Theory p10)`),
  tf(2, `The odd length at the end of a transition or circular table is added to the last chord.`, true, `Footnote on the sheet: "Add undivided length with the last cord".`, `lecture sheet p27`),
  tf(2, `The circular part of the curve is set with the theodolite at the start of the transition, A.`, false, `The transition is set from A; the circular part is set from B, with deflection angles measured from the common tangent.`, `lecture sheet p26`),
  tf(2, `The deflection angle of a transition peg is proportional to the square of its distance from the start of the transition.`, true, `δ = 1800 l²/(π R Lₜ) minutes.`, `class notes (Quiz p17)`),
  tf(2, `The shift is the distance by which the circular arc is moved inwards from the original tangent to make room for the transition.`, true, `S = Lₜ²/(24R); the shifted circle and the straight are joined by the spiral.`, `class notes (Theory p7)`),
  tf(1, `The field work sets the curve up to the mid-point of the circular curve.`, true, `Task on the sheet: "Set the curve in the field up to the mid point of the circular curve using one theodolite method."`, `lecture sheet p27`),
  tf(1, `On the sheet the radius R is rounded to the nearest 5 ft.`, true, `The calculated 456.05 ft becomes 455 ft.`, `lecture sheet p27`),
  tf(3, `At the mid-point of the circular curve the cumulative deflection from the common tangent is ¼(Δ − 2Sₐ).`, true, `The whole arc of angle Δ − 2Sₐ subtends half of it at the tangent point; the mid-point is half the arc, so a quarter.`, `class notes (Quiz p18)`),
  tf(2, `For a longer transition at the same radius the spiral angle Sₐ is larger.`, true, `Sₐ = Lₜ/(2R) grows with Lₜ.`, `textbook`),
  tf(1, `Bamboo sticks and a rope are used to show the super-elevation on the ground.`, true, `Stick tops follow the raised outer edge while the inner edge stays at ground level.`, `field work details 2026`),
  tf(2, `On the ground the inner edge is raised and the outer edge stays at ground level.`, false, `The outer edge is raised w.r.t. the inner edge, which is kept at ground level (no crown).`, `lecture sheet p27`),
]

const cards: SvCard[] = [
  card(`What is shift?`, `The distance by which the circular curve is moved inward from its original position, so the transition can be inserted. S = Lₜ²/(24R). Here S = 67.5² / (24 × 455) = 0.42 ft.`, `class notes (Theory p7)`),
  card(`What is a transition curve and why do we use it?`, `A curve of changing radius between the straight and the circular curve. It lets the centrifugal force and the super-elevation build up gradually, so the vehicle enters the curve smoothly.`),
  card(`What is super-elevation and how much is it here?`, `Raising the outer edge of the road over the inner edge, to balance the centrifugal force. h = b v²/(gR) = ratio × b = 0.15 × 9 = 1.35 ft.`),
  card(`How did you get the radius?`, `The sheet gives the centrifugal ratio as h/b = 0.15. Since v²/(gR) is that ratio, R = v²/(g × 0.15) with v in ft/s. That gave 456.05, rounded to 455 ft.`, `lecture sheet p27`),
  card(`How do you get the length of the transition?`, `From the rate of attaining super-elevation, 1 in N. Lₜ = h × N = 1.35 × 50 = 67.5 ft.`, `class notes (Quiz p17)`),
  card(`What is the spiral angle?`, `The angle between the first tangent and the common tangent at the end of the transition. Sₐ = Lₜ/(2R) radians. Here it is 4.25°.`, `class notes (Quiz p17)`),
  card(`Why do you add the odd length to the last chord and not take a short chord at the end?`, `That is the rule on the sheet's footnote. Every peg keeps the full interval except the last, which is a little longer, so there is no tiny extra chord at the end.`, `lecture sheet p27`),
  card(`How do you set out the transition curve?`, `Theodolite at A with 0° on the tangent. For each peg turn its deflection angle 1800 l²/(π R Lₜ) minutes and measure the length l from A along that line. The last deflection must be Sₐ/3.`, `lecture sheet p26`),
  card(`How do you set out the circular curve?`, `Move the theodolite to B, the start of the circular curve. Orient on the common tangent and set deflection angles 1718.9 c/R minutes, cumulative, with the chords measured from successive pegs.`, `lecture sheet p26`),
  card(`Why do we set only up to the mid-point of the circular curve?`, `The curve is symmetrical. The other half is set the same way from D, the end of the second transition, so the work is limited to half the curve plus one transition.`, `lecture sheet p27`),
  card(`What are the calculation checks?`, `The deflection at the last peg of the transition must equal Sₐ/3. The cumulative deflection at the last peg of the half circular curve must equal ¼(Δ − 2Sₐ).`, `class notes (Quiz p18)`),
  card(`What are the field checks?`, `The apex distance E = R(sec Δ/2 − 1), measured from the PI to the curve. And the offset 4S from the tangent at the end of the transition.`, `class notes (Quiz p18)`),
  card(`What are points A, B, C and D?`, `A: start of the transition. B: end of the transition and start of the circular curve. C: end of the circular curve. D: end of the second transition. Chainages: A = PI − T, B = A + Lₜ, C = B + Lc, D = C + Lₜ.`, `lecture sheet p25`),
  card(`Why does the tangent length contain Lₜ/2?`, `Because the shifted circle sits S inside the original, the tangent to it is T = (R + S) tan(Δ/2) measured to its tangent point, and the spiral starts about Lₜ/2 before that point. So T = (R + S) tan(Δ/2) + Lₜ/2.`, `textbook`),
  card(`How is super-elevation shown on the ground?`, `With bamboo sticks and rope. The inner edge stays at ground level. The outer edge is raised in proportion to the distance, h × l/Lₜ at each peg, up to h at B and constant on the circular part.`, `field work details 2026`),
  card(`What does 1 in 50 mean?`, `The outer edge rises 1 ft in every 50 ft of length along the transition. For a super-elevation of 1.35 ft the transition therefore needs 67.5 ft.`, `class notes (Quiz p17)`),
  card(`Where does the formula 1718.9 c/R come from?`, `The deflection angle for a chord is half the angle at the centre: c/(2R) radians. Converted to minutes this is 1718.9 c/R.`),
  card(`Why does the deflection of the transition go with the square of l?`, `The spiral's radius changes in proportion to l, so it bends more and more. The deflection from the tangent grows as l², given by 1800 l²/(π R Lₜ) minutes.`),
]

export const content: SvTopicContent = { questions, cards }

export const learn: SvLearn = {
  notes: [
    {
      title: `The curve and its elements`,
      md: `A **combined curve** = transition (spiral) + circular + transition, joining two straights that meet at the **PI** with deflection angle $\\Delta$ ($D_a$).
- **A**: start of transition. **B**: end of transition = start of circular curve. **C**: end of circular curve. **D**: end of the second transition.
- **R**: radius of the circular curve. **$L_t$**: transition length. **$L_c$**: circular length. **$S_a$**: spiral angle. **S**: shift (circle moved inwards).
- **T**: tangent length from PI to A. **E**: apex distance (PI to the curve).
- The common tangent at B meets the first tangent at $\\tfrac23L_t$ from A.
- Super-elevation $h$ grows linearly along the transition: $h\\,l/L_t$ at distance $l$ from A, and stays $h$ on the circular curve. It is attained **w.r.t. the inner edge** (no crown).`,
    },
    {
      title: `Calculation, in the order of the sheet`,
      md: `Given on the sheet: $\\Delta$, $v$ (mph), centrifugal ratio $h/b$, $b$, gradient 1 in $N$, peg interval, PI chainage, bearing of 1st tangent, $g=32.2$.
1. $v$ in ft/s: $v=\\text{mph}\\times5280/3600=1.4667\\times\\text{mph}$
2. $R=\\dfrac{v^2}{g\\times\\text{ratio}}$, rounded to the **nearest 5 ft**
3. $h=\\text{ratio}\\times b=\\dfrac{b v^2}{gR}$
4. $L_t=hN$
5. $S_a=\\dfrac{L_t}{2R}\\ \\text{rad}=\\dfrac{L_t}{2\\pi R}\\times180^\\circ$
6. $L_c=\\dfrac{\\pi R}{180}(\\Delta-2S_a)$
7. $S=\\dfrac{L_t^2}{24R}$
8. $T=(R+S)\\tan\\dfrac{\\Delta}{2}+\\dfrac{L_t}{2}$
9. Chainages: $A=\\text{PI}-T$, $B=A+L_t$, $C=B+L_c$, $D=C+L_t$ (and mid-curve $=B+L_c/2$).`,
    },
    {
      title: `Worked example (the sheet's data)`,
      md: `$\\Delta=29.33^\\circ$, $v=32$ mph, $h/b=0.15$, $b=9$ ft, 1 in 50, pegs 10 ft, PI 1662 ft.
| Quantity | Working | Result |
|---|---|---|
| $v$ | 32 × 1.4667 | 46.93 ft/s |
| $R$ | 46.93² / (32.2 × 0.15) = 456.05 | **455 ft** |
| $h$ | 0.15 × 9 | 1.35 ft |
| $L_t$ | 1.35 × 50 | 67.5 ft |
| $S_a$ | 67.5 / (2 × 455) rad | 4.25° |
| $L_c$ | π × 455 × (29.33 − 8.50)/180 | 165.4 ft |
| $S$ | 67.5² / (24 × 455) | 0.42 ft |
| $T$ | 455.42 tan 14.665° + 33.75 | 152.9 ft |
| A / B | 1662 − 152.9 / + 67.5 | 1509.1 / 1576.6 |
| mid / C / D | B + 82.7 / B + 165.4 / C + 67.5 | 1659.3 / 1742.0 / 1809.5 |`,
    },
    {
      title: `Deflection tables and the checks`,
      md: `**Transition (theodolite at A, 0° on the tangent):** $\\delta=\\dfrac{1800\\,l^2}{\\pi R L_t}$ minutes, $l$ = distance from A.
Chords 10, 10, 10, 10, 10, **17.5** (odd 7.5 ft added to the **last** chord):
| Peg | l (ft) | δ (min) | Super-elevation (ft) |
|---|---|---|---|
| 1 | 10 | 1.87 (sheet 1.90) | 0.20 |
| 2 | 20 | 7.46 | 0.40 |
| 3 | 30 | 16.79 | 0.60 |
| 4 | 40 | 29.85 | 0.80 |
| 5 | 50 | 46.64 | 1.00 |
| 6 | 67.5 | 85.0 = 1°25′ | 1.35 |
**Check:** last δ $=S_a/3=1^\\circ25'$.

**Half circular curve (theodolite at B):** chord deflection $=1718.9\\,c/R$ minutes, **cumulative**. $L_c/2=82.7$ ft: seven chords of 10 ft (37.8′ each) and a last chord of 12.7 ft (48.0′).
Cumulative: 37.8′, 1°15.6′, 1°53.4′, 2°31.2′, 3°09.0′, 3°46.8′, 4°24.6′, **5°12.6′**.
**Check:** last cumulative $=\\tfrac14(\\Delta-2S_a)=5.2^\\circ$.

**Field checks:** apex distance $E=R(\\sec\\tfrac{\\Delta}{2}-1)=15.3$ ft; offset at the end of the transition $=4S=1.67$ ft.`,
    },
    {
      title: `Setting out and super-elevation on the ground`,
      md: `- **Transition:** theodolite at A, 0° on the first tangent. Turn each deflection and measure the length l from A along that line, as in the table (cords are measured from the first peg station). The last peg is B.
- **Circular curve:** theodolite at B. Orient on the common tangent (textbook: back-sight A, plunge, then turn $\\tfrac23S_a$ towards the curve), set the cumulative deflections, measure chords from successive pegs, up to the mid-point.
- **Super-elevation:** the inner edge stays at ground level; at each transition peg raise the **outer edge** by $h\\,l/L_t$ (0.2 ft per 10 ft peg here). Fix bamboo sticks and tie the rope at that height. From B onwards the outer rope stays at $h=1.35$ ft.
- Road width $b=9$ ft: stick positions 4.5 ft either side of the centre line.`,
    },
  ],
  steps: [
    `Collect the supplied data: Δ, speed, ratio, width, gradient, peg interval, PI chainage and bearing of the first tangent.`,
    `Calculate on A4 (individual): R, h, Lₜ, Sₐ, Lc, S, T and the chainages A, B, C, D, in the sheet's order.`,
    `Prepare the two tables: transition deflections (with super-elevations at each peg) and half circular deflections (cumulative). Add the odd length to the last chord.`,
    `Write the checks: Sₐ/3 for the transition, ¼(Δ − 2Sₐ) for the circular half, apex distance E and the 4S offset.`,
    `In the field mark the PI and the first tangent line from the given bearing; measure T from the PI to peg A and drive a peg.`,
    `Set the theodolite at A, 0° on the tangent. Turn the deflection of peg 1, measure its length from A along the line, drive the peg. Repeat for pegs 2 to 6 (the last at B).`,
    `Check the last transition peg against the calculated position of B (offset 4S from the tangent is a field check).`,
    `Move the theodolite to B. Orient on the common tangent and set out the circular pegs by the cumulative deflections, to the mid-point.`,
    `Fix bamboo sticks at each peg across the road, 4.5 ft either side of the centre line. Raise the outer edge by h × l/Lₜ with the rope, keeping the inner edge at ground.`,
    `Call the teacher for the group verification of the layout.`,
  ],
  submit: [
    `Individual: **detailed calculation on A4 paper** with all formulas, the two deflection tables, the checks and the chainages.`,
    `Group: **verification of the layout in the field** by the teacher.`,
    `Show the checks for both curves: Sₐ/3 and ¼(Δ − 2Sₐ), and the field checks E and 4S.`,
    `Units in feet; name, roll, group, date on the sheet.`,
  ],
  traps: [
    `Not rounding R to the nearest 5 ft (the sheet does), which changes everything after it.`,
    `Using h = b v²/(gR) with the rounded R instead of ratio × b, giving 1.353 instead of 1.35 ft.`,
    `Adding the odd length as a separate short chord instead of adding it to the last chord.`,
    `Forgetting that the circular deflections are cumulative, and the transition ones are not.`,
    `Wrong check on the circular curve: it is ¼(Δ − 2Sₐ) for half the arc, not ½.`,
    `Forgetting to add Lₜ/2 to the tangent length.`,
    `Using degrees instead of radians in Sₐ = Lₜ/(2R), or the formula with π twice.`,
    `Raising the inner edge instead of the outer edge for the super-elevation.`,
  ],
  carry: [
    `Theodolite and tripod, tape, ranging rods, bamboo sticks, rope`,
    `Pegs and mallet, plumb bob, ruler for sticks, hand level or level and staff`,
    `A4 calculation sheet with the tables, calculator, field book`,
  ],
}

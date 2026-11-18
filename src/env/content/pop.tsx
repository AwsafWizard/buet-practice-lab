// ev-pop — population forecasting: methods, formulas, which suits which city (Snigdha ma'am L2 p9–12 + class notes).
// Worked numbers (arithmetic, geometric, least-squares…) live in engine/population.ts.
import type { FC } from 'react'
import type { EvAnswer, EvCard, EvList, EvTopicContent } from '../types'

const T = 'ev-pop' as const
const ink = 'var(--c-ink)'
const mute = 'var(--c-mute)'
const accent = 'var(--c-accent)'
const water = 'var(--c-water)'
const bad = 'var(--c-bad)'
const good = 'var(--c-good)'

const Tx = ({ x, y, t, a = 'middle', b, c = ink, s = 12 }: { x: number; y: number; t: string; a?: 'start' | 'middle' | 'end'; b?: boolean; c?: string; s?: number }) => (
  <text x={x} y={y} textAnchor={a} fontSize={s} fontWeight={b ? 700 : 400} fill={c}>
    {t}
  </text>
)

/** S-shaped logistic curve with the three stages, and the comparative-graphical idea */
const LogisticFig: FC = () => (
  <svg viewBox="0 0 640 290" width="100%" role="img" aria-label="Logistic (S) curve of population growth with early, middle and final stages">
    <line x1={60} y1={240} x2={620} y2={240} stroke={ink} strokeWidth={1.5} />
    <line x1={60} y1={240} x2={60} y2={20} stroke={ink} strokeWidth={1.5} />
    <Tx x={340} y={272} t="Time" c={mute} />
    <Tx x={66} y={14} t="Population" c={mute} a="start" />
    <line x1={60} y1={52} x2={620} y2={52} stroke={bad} strokeDasharray="6 4" />
    <Tx x={615} y={44} a="end" t="saturation population P_S" c={bad} s={11} />
    <path d="M60,232 C170,228 230,215 290,150 C340,92 390,62 470,55 C530,52 580,52 620,52" fill="none" stroke={accent} strokeWidth={3} />
    <path d="M60,232 C140,230 200,225 250,200" fill="none" stroke={good} strokeWidth={4} opacity={0.6} />
    <path d="M250,200 L350,100" fill="none" stroke={water} strokeWidth={4} opacity={0.6} />
    <path d="M400,66 C440,56 500,52 560,52" fill="none" stroke={bad} strokeWidth={4} opacity={0.6} />
    <Tx x={150} y={218} t="Early: geometric growth" s={11} c={good} />
    <Tx x={150} y={234} t="dP/dt ∝ P" s={11} c={good} a="middle" />
    <Tx x={382} y={150} t="Middle: arithmetic" s={11} c={water} a="start" />
    <Tx x={382} y={166} t="dP/dt = constant" s={11} c={water} a="start" />
    <Tx x={470} y={92} t="Final: decreasing growth" s={11} c={bad} a="start" />
    <Tx x={470} y={108} t="dP/dt ∝ (P_S − P)" s={11} c={bad} a="start" />
  </svg>
)

const lists: EvList[] = [
  {
    id: 'l-pop-factors',
    topic: T,
    title: 'Factors changing the population of a city',
    points: [
      { k: 'Births', alt: ['birth rate', 'increase due to births'], d: 'increase' },
      { k: 'Deaths', alt: ['death rate', 'decrease due to deaths'], d: 'decrease' },
      { k: 'Migration', alt: ['in-migration', 'out-migration', 'immigration'], d: 'increase or decrease' },
    ],
    seen: [],
    src: 'SN L2 p9',
  },
  {
    id: 'l-pop-methods',
    topic: T,
    title: 'Methods of population forecasting',
    ask: 'Name the common methods of population forecasting.',
    points: [
      { k: 'Arithmetic progression method', alt: ['arithmetic increase', 'uniform growth rate method', 'arithmetic method'], d: 'constant rate of increase, dP/dt = K' },
      { k: 'Constant percentage method', alt: ['uniform percentage growth rate', 'uniform percentage method', 'exponential method'], d: 'rate proportional to population, ln P linear' },
      { k: 'Geometric progression method', alt: ['geometric increase', 'empirical method', 'geometric method'], d: 'constant percentage growth per decade: P = Pp (1+r)^n' },
      { k: 'Decreasing rate of growth method', alt: ['decreasing growth rate method', 'decreasing growth rate'], d: 'town approaching saturation' },
      { k: 'Incremental increase method', alt: ['incremental increase', 'change in increase rate method', 'varying increment method'], d: 'increase itself changes by a mean amount each decade' },
      { k: 'Least squares parabola method', alt: ['least square parabola', 'least square method', 'parabolic method'], d: 'fits Y = a + bx + cx² to all the census data' },
      { k: 'Graphical extension method', alt: ['graphical extension', 'curvilinear method', 'graphical method'], d: 'extend the curve by eye' },
      { k: 'Comparative graphical method', alt: ['graphical comparison', 'graphical comparison method', 'comparative method'], d: 'follow similar cities' },
      { k: 'Ratio method', alt: ['ratio and correlation', 'ratio'], d: 'local-to-national population ratio' },
      { k: 'Logistic curve method', alt: ['logistic curve', 'logistic', 'S-curve'], d: 'S-shaped growth to a saturation population' },
    ],
    hook: 'Plain: three ARITHMETIC-type (arithmetic, %, geometric), two DECREASING-type (decreasing rate, incremental), one fit (parabola), then four graph / ratio / S-curve methods.',
    seen: ['2010-11', '2021-22', '2023-24'],
    src: 'SN L2 p9–12; incremental increase and least squares from the papers and Delwar sir note (the CE22 slide does not list them)',
    note: 'The slide has eight methods; the papers also name incremental increase and least squares parabola, taught only in her class notes / maths.',
  },
  {
    id: 'l-pop-short',
    topic: T,
    title: 'Short term population methods (1–10 years)',
    points: [
      { k: 'Arithmetic progression', alt: ['arithmetic method'] },
      { k: 'Constant percentage method', alt: ['uniform percentage'] },
      { k: 'Geometric progression', alt: ['geometric method'] },
      { k: 'Decreasing rate of growth', alt: ['decreasing growth rate'] },
      { k: 'Graphical extension or curvilinear method', alt: ['graphical extension', 'curvilinear'] },
    ],
    seen: ['2021-22', '2023-24'],
    src: 'SN L2 p9',
  },
  {
    id: 'l-pop-long',
    topic: T,
    title: 'Long term population methods (10–50 years)',
    points: [
      { k: 'Comparative graphical method', alt: ['graphical comparison'] },
      { k: 'Ratio method' },
      { k: 'Logistic curve method', alt: ['logistic curve', 'logistic'] },
    ],
    seen: ['2021-22', '2023-24'],
    src: 'SN L2 p9',
  },
  {
    id: 'l-pop-logistic',
    topic: T,
    title: 'Stages of the logistic (S) curve',
    points: [
      { k: 'Early stage: geometric growth', alt: ['early', 'exponential growth', 'dP/dt proportional to P'], d: 'fast, nearly exponential' },
      { k: 'Middle stage: arithmetic growth', alt: ['middle', 'constant rate'], d: 'dP/dt constant as space and resources fill' },
      { k: 'Final stage: decreasing growth to saturation', alt: ['final', 'saturation', 'carrying capacity'], d: 'growth stops at the saturation population P_S' },
    ],
    ordered: true,
    seen: [],
    src: 'SN L2 p12',
  },
]

const cards: EvCard[] = [
  { id: 'c-pop-arith', topic: T, front: 'Arithmetic method: formula and when to use it.', back: '$P_t = P_2 + K(T-T_2)$ with $K=\\dfrac{P_2-P_1}{T_2-T_1}$ (constant rate of increase). Suitable for large, old, established cities with considerable development; for small, average or new cities it gives a lower result than actual.', seen: ['2021-22', '2023-24'], src: 'SN L2 p9' },
  { id: 'c-pop-const-pct', topic: T, front: 'Constant (uniform) percentage method: formula and use.', back: '$\\ln P_t=\\ln P_2+K(T-T_2)$, $K=\\dfrac{\\ln P_2-\\ln P_1}{T_2-T_1}$: growth rate proportional to population. Use with caution: too large for rapidly growing cities over a short time; fits cities with unlimited scope of expansion.', src: 'SN L2 p10' },
  { id: 'c-pop-geo', topic: T, front: 'Geometric progression (empirical) method: formula and use.', back: '$P_f=P_p(1+r)^n$, $r=\\sqrt[n]{P_{\\text{later}}/P_{\\text{earlier}}}-1$ (first and last data, "skip the middle"). Most widely used (Hardenberg); gives higher estimates: use for a new industrial town at the start of development, for a few decades only.', seen: ['2007-08', '2015-16', '2016-17'], src: 'SN L2 p10; class note C#4' },
  { id: 'c-pop-decr', topic: T, front: 'Decreasing rate of growth method: formula and use.', back: '$P_n=P_{n-1}+\\dfrac{(r_{n-1}-s)}{100}P_{n-1}$ with $r$ the growth rate (%) of the previous decade and $s$ the average decrease in rate. For a town reaching saturation. Compute decade by decade from the last census; treat a rise as a negative decrease.', src: 'SN L2 p10–11; class note C#4' },
  { id: 'c-pop-incr', topic: T, front: 'Incremental increase method (change in increase rate): formula.', back: '$P_n=P_0+n\\bar x+\\dfrac{n(n+1)}{2}\\bar y$, with $\\bar x$ the mean increase per decade and $\\bar y$ the mean of the changes in the increases. Textbook method asked as "change in increase rate" in 2015-16 and 2016-17.', seen: ['2015-16', '2016-17'], src: 'textbook; not in this term’s slides' },
  { id: 'c-pop-lsq', topic: T, front: 'Least squares parabola method: curve and normal equations.', back: '$Y=a+bx+cx^2$, x = number of decades from the middle year. Normal equations: $\\sum y=Na+c\\sum x^2$, $\\sum xy=b\\sum x^2$, $\\sum x^2y=a\\sum x^2+c\\sum x^4$ (odd sums vanish with x centred on the middle census).', seen: ['2011-12', '2012-13', '2017-18', '2022-23'], src: 'Delwar sir note; not worked in the CE22 slides' },
  { id: 'c-pop-ratio', topic: T, front: 'Ratio method: steps.', back: 'Take the local and national populations of the last 4–5 censuses, compute the ratios, extend the ratio–time graph to the design year, and multiply by the expected national population. Example: 78,855 / 640,054 = 0.1232; 2020 national 773,854 gives 95,338.', src: 'SN L2 p11–12' },
  { id: 'c-pop-comp', topic: T, front: 'Comparative graphical method: idea and use.', back: 'Pick cities with similar conditions, assume the city will develop as they did, and shift each similar city’s curve so its population matches the city at the present point. Precise and reliable if statistics of similar cities exist; a logical background for a new area.', seen: ['2021-22'], src: 'SN L2 p11' },
  { id: 'c-pop-logistic', topic: T, front: 'Logistic curve method.', back: 'S-shaped growth to a saturation population $P_S$ (carrying capacity): early stage fast, nearly exponential; middle stage slows (arithmetic); final stage growth stops. $P=\\dfrac{P_S}{1+e^{a+bt}}$. Used when no extraordinary influence changes growth.', src: 'SN L2 p12; equation textbook' },
  { id: 'c-pop-graph', topic: T, front: 'Graphical extension method.', back: 'Plot population against time and extend the curve by eye to the design year. Very approximate; use along with other methods.', src: 'SN L2 p11' },
  { id: 'c-pop-short-long', topic: T, front: 'Which methods are short term and which long term?', back: 'Short term (1–10 years): arithmetic, constant percentage, geometric, decreasing rate, graphical extension. Long term (10–50 years): comparative graphical, ratio, logistic.', seen: ['2023-24'], src: 'SN L2 p9' },
  { id: 'c-pop-hint', topic: T, front: 'Class data set (72, 79, 89, 97, 120 thousand, 1980–2020): forecast 2030 and 2040.', back: 'Arithmetic (K = 1.2 thousand/yr): 132,000 and 144,000. Constant percentage (K = 0.01277): 136,346 and 154,918. Geometric (r = 0.01285): 136,342 and 154,912.', src: 'SN L2 p9–10' },
  { id: 'c-pop-ratio-n', topic: T, front: 'In the geometric method, what are n and r?', back: '$r$ is the yearly growth rate, $n$ is the number of years from the present (last census) to the forecast year. Class tip: skip the middle data and take $r$ from the first and last census over the whole interval.', src: 'class note C#4' },
  { id: 'c-pop-project-when', topic: T, front: 'When should population projections be made?', back: 'Once the needs of the service are known and the objectives fixed, once stakeholder requirements are identified, and when adequate raw data on existing flows and demands are available. The present population comes from the latest census.', src: 'SN L2 p9' },
]

const answers: EvAnswer[] = [
  {
    id: 'a-pop-methods',
    topic: T,
    q: 'State the methods of population forecasting and where each is applicable (type of city).',
    seen: ['2010-11', '2021-22', '2023-24'],
    a: String.raw`### Factors that change a city’s population
**Births** (increase), **deaths** (decrease) and **migration** (either). The present population comes from the last census.

### Methods and applicability
| Method | Idea / formula | Applicable to |
|---|---|---|
| **Arithmetic progression** | constant rate, $P_t=P_2+K(T-T_2)$ | large, old, established cities (low result for small or new cities) |
| **Constant percentage** | $\ln P$ linear, rate $\propto P$ | cities with unlimited scope of expansion; too high for fast short-term growth |
| **Geometric progression** (empirical) | $P_f=P_p(1+r)^n$ | a **new industrial town** at the start of development, only a few decades |
| **Decreasing rate of growth** | $P_n=P_{n-1}+\frac{r_{n-1}-s}{100}P_{n-1}$ | a town **approaching saturation** |
| **Incremental increase** | mean increase plus mean change in increase | cities growing steadily with a varying increment |
| **Least squares parabola** | $Y=a+bx+cx^2$ fitted to all data | a city with a long, reliable census record |
| **Graphical extension** (curvilinear) | extend the curve by eye | rough check with other methods |
| **Comparative graphical** | follow similar cities | a city or **new area** with similar developed cities |
| **Ratio** | local / national ratio extended | a city or district whose national forecast is known |
| **Logistic curve** | S-curve to saturation $P_S$ | a city with limited space and economic opportunity, long term |

Short term (1–10 yr): arithmetic, constant percentage, geometric, decreasing rate, graphical extension. Long term (10–50 yr): comparative graphical, ratio, logistic.`,
    keys: ['Births', 'Arithmetic progression', 'Constant percentage', 'Geometric progression', 'Decreasing rate of growth', 'Incremental increase', 'Least squares parabola', 'Graphical extension', 'Comparative graphical', 'Ratio', 'Logistic curve', 'saturation'],
    lists: ['l-pop-methods', 'l-pop-short', 'l-pop-long', 'l-pop-factors'],
    src: 'SN L2 p9–12; incremental increase and least squares from the papers / Delwar sir note',
    Fig: LogisticFig,
  },
  {
    id: 'a-pop-best',
    topic: T,
    q: 'Which population forecasting method is best, and why (a general city, and a newly built area such as Uttara 3rd phase)?',
    seen: ['2010-11', '2021-22'],
    a: String.raw`### Choosing the method
No single method is best for every city: it depends on the stage of growth and the data available. Use two or three and compare; check the answer against the land available.

### A newly built area (Uttara 3rd phase)
1. There is **no long census record**, so arithmetic, parabola and incremental methods have nothing to fit.
2. The best choice is the **comparative graphical method**: choose **similar developed areas** (for example Uttara phases 1 and 2, Gulshan, Dhanmondi), shift their growth curves to the present point and read the future: it has a **logical background** and is reliable if their statistics exist.
3. The **geometric** method may be used for the first few decades because a new area grows fast at the beginning, but it **over-estimates** later.
4. The **logistic** curve gives the long-term limit, because the plots and land are finite: growth must **saturate**.
5. Check with the **ratio** method against the Dhaka forecast.

### A general city
The **logistic** curve (or the least squares / graphical comparison) is best for a **long period** because real growth is S-shaped with a saturation population, while the arithmetic and geometric methods are for short periods.`,
    keys: ['comparative graphical', 'similar', 'no long census record', 'geometric', 'over-estimates', 'logistic', 'saturate', 'ratio'],
    lists: ['l-pop-methods', 'l-pop-logistic'],
    src: 'SN L2 p10–12 (suitability of each method); the choice and reasons for Uttara are our reading of those rules',
    Fig: LogisticFig,
  },
]

export default { lists, cards, answers } satisfies EvTopicContent

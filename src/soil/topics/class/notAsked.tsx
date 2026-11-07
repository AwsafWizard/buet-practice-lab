// Practice problem on a lecture topic never asked in the 13 past papers: USDA textural classification with the gravel correction.
import { Md } from '../../../components/ui'
import { usda } from '../../engine/classify'
import { nf } from '../../engine/phase'
import { UsdaTriangle } from '../../reference/idx'
import type { SmQ } from '../../types'

const NOT_ASKED = 'Not asked in any past paper (2007-08 → 2023-24) but taught in the lectures — a fresh question this year could come from here.'

const SOILS = [
  { n: 'P', gravel: 18, sand: 30, silt: 32, clay: 20 },
  { n: 'Q', gravel: 0, sand: 62, silt: 22, clay: 16 },
  { n: 'R', gravel: 25, sand: 9, silt: 39, clay: 27 },
]
const run = () => SOILS.map((s) => ({ s, u: usda(s) }))

export const CLASS_NEW: SmQ[] = [
  {
    id: 'sm-own-class-new1',
    paper: 'own',
    level: 'exam',
    sec: 'A',
    no: 'N1',
    marks: 0,
    topics: ['sm-class'],
    title: 'USDA textural classification with the gravel correction · not asked yet',
    text: `*${NOT_ASKED}*

Classify the following soils by the USDA textural classification system (Das Fig. 5.1). Show the modified percentages where needed and mark each soil on the triangle.

- Soil P: gravel 18 %, sand 30 %, silt 32 %, clay 20 %
- Soil Q: gravel 0 %, sand 62 %, silt 22 %, clay 16 %
- Soil R: gravel 25 %, sand 9 %, silt 39 %, clay 27 %

Why can the raw percentages of P and R not be entered in the triangle directly?`,
    pages: [],
    checks: () => {
      const r = run()
      return [
        { key: 'psand', label: 'P: modified % sand', value: r[0].u.sand, unit: '%', hint: r[0].u.name },
        { key: 'pclay', label: 'P: modified % clay', value: r[0].u.clay, unit: '%' },
        { key: 'rsilt', label: 'R: modified % silt', value: r[2].u.silt, unit: '%', hint: r[2].u.name },
        { key: 'rclay', label: 'R: modified % clay', value: r[2].u.clay, unit: '%' },
      ]
    },
    solution: () => {
      const r = run()
      return (
        <div className="space-y-3 text-sm">
          <Md>{`**Why correct?** The triangle has only three corners (sand, silt, clay) and its percentages must add to 100. USDA takes gravel (> 2 mm) out first and rescales the rest (slide 6):
$$\\text{modified } \\% = \\% \\times \\frac{100}{100 - \\%\\text{gravel}}$$
A large gravel content is then shown by the prefix **gravelly** (Das: "added … because of the large percentage of gravel"; the slides give no threshold — 10 % or more is used here).`}</Md>
          {r.map(({ s, u }) => (
            <div key={s.n} className="grid cq-md:grid-cols-[1fr_auto] gap-3 items-start">
              <Md>{`**Soil ${s.n}.** ${s.gravel > 0 ? `Factor $100/(100 - ${s.gravel}) = ${nf(100 / (100 - s.gravel), 4)}$: sand $${s.sand} \\to ${nf(u.sand, 3)}$ %, silt $${s.silt} \\to ${nf(u.silt, 3)}$ %, clay $${s.clay} \\to ${nf(u.clay, 3)}$ % (sum 100).` : `No gravel, so the percentages go straight in: sand ${s.sand}, silt ${s.silt}, clay ${s.clay} %.`} Enter the triangle on the clay line ${nf(u.clay, 3)} % and the sand line ${nf(u.sand, 3)} % → zone **${u.cls}**. ${u.gravelly ? `With ${s.gravel} % gravel: **${u.name}**.` : `**${u.name}**.`}`}</Md>
              <UsdaTriangle pt={{ sand: u.sand, silt: u.silt, clay: u.clay, label: s.n }} w={260} />
            </div>
          ))}
          <Md>{`**Answer:** P — ${r[0].u.name}; Q — ${r[1].u.name}; R — ${r[2].u.name}. Entering P or R raw would use percentages summing to ${100 - SOILS[0].gravel} % and ${100 - SOILS[2].gravel} %, so the three lines would not meet at one point.`}</Md>
        </div>
      )
    },
    notes: [NOT_ASKED, 'USDA is in AJK sir\'s Topic 3 slides 2–7 (lecturer\'s soils A, B and Das Example 5.1). Chart pane: c-usda.'],
  },
]

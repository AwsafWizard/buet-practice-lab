// Render tests for the new figs of Tanvir sir's block (ta-chem, ta-cw, ta-ix, ta-coag, ta-soft).
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Md } from '../../components/ui'
import { alkalinityFromBicarbonate, alkalinityTitration, hardness } from '../engine/chem'
import { chickWatson } from '../engine/chlorine'
import { splitTreatment, treat, waterFromIons } from '../engine/soften'
import { alkSpeciesMd, TitrationFig, titrationMd } from './ta-chem'
import { AlkBudgetFig } from './ta-coag'
import { ChickWatsonWork } from './ta-cw'
import { BypassFig } from './ta-ix'
import { doseTableMd, FAC, hardnessTableMd, ionTableMd, massTableMd } from './ta-soft'

const BAD = /NaN|undefined|Infinity|katex-error/
const ok = (html: string) => expect(html).not.toMatch(BAD)

describe('ta-chem', () => {
  it('alkalinity species table matches the engine total (2020-21 Q8(b))', () => {
    const a = alkalinityFromBicarbonate({ hco3mgL: 105, pH: 10.3, pK2: 10.3, th: 310 })
    const md = alkSpeciesMd(a, 105, 10.3)
    expect(md).toContain(a.total.toFixed(1))
    ok(renderToString(<Md>{md}</Md>))
  })
  it('titration bar and table render, P below and above M/2', () => {
    for (const [M, P] of [[30, 8], [24, 3], [20, 9]]) {
      const t = alkalinityTitration({ vol: 100, M, P, pH: 10 })
      ok(renderToString(<TitrationFig M={M} P={P} mlOH={t.mlOH} mlCO3={t.mlCO3} mlHCO3={t.mlHCO3} />))
      ok(renderToString(<Md>{titrationMd(t, 100, M)}</Md>))
    }
  })
})

describe('ta-cw', () => {
  it('Chick–Watson work renders and reports the engine k', () => {
    const data = [0, 2, 4, 6, 8].map((t) => ({ t, N: Math.round(6152 * Math.exp(-0.2 * 1.8 * t)) }))
    const html = renderToString(<ChickWatsonWork C={1.8} data={data} />)
    ok(html)
    expect(html).toContain(chickWatson({ C: 1.8, data }).k.toFixed(3))
  })
})

describe('ta-ix and ta-coag', () => {
  it('bypass flow sheet renders with and without a flow', () => {
    ok(renderToString(<BypassFig Hraw={260} Hdes={90} X={90 / 260} Q={1500} qUnit="L/d" />))
    ok(renderToString(<BypassFig Hraw={438.6} Hdes={120} X={120 / 438.6} />))
  })
  it('alkalinity budget renders when short and when enough', () => {
    ok(renderToString(<AlkBudgetFig have={20} use={30} />))
    ok(renderToString(<AlkBudgetFig have={60} use={30} />))
  })
})

describe('ta-soft', () => {
  const w = waterFromIons({ co2: 5.5, ca: 87, mg: 18, na: 24, cl: 65, so4: 68, alkCaCO3: 182 })
  it('conversion, hardness, dose and mass tables render', () => {
    const md = [
      ionTableMd([{ name: 'Ca²⁺', mgL: 87, fac: FAC.ca, eqw: '20', cc: w.ca }]),
      hardnessTableMd(hardness(w)),
      doseTableMd([{ label: 'complete', t: treat(w, { mode: 'complete' }) }]),
      doseTableMd([{ label: 'selective', t: treat(w, { mode: 'selective', excess: 20 }) }]),
      massTableMd(200, 80, [0.87, 0.97]),
    ].join('\n\n')
    ok(renderToString(<Md>{md}</Md>))
  })
  it('two-stage dose table shows both stage totals', () => {
    const s = splitTreatment(w, { mgFinal: 30, thMax: 120 })
    const md = doseTableMd([
      { label: '1st', t: s.first },
      { label: '2nd', t: s.second },
    ])
    expect(md).toContain(`**${s.first.lime.toFixed(1)}**`)
    expect(md).toContain(`**${s.second.lime.toFixed(1)}**`)
  })
})

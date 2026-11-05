// Soil structure, clay mineralogy and origin of soils (AJK sir's Topic 4A/4B; origin from older papers).
import { useMemo, useState } from 'react'
import { Callout, Choice, Md, Section, Step, Steps } from '../../../components/ui'
import { pick, rng, useSeed } from '../../../labs/common'
import { SmFrequency } from '../../components/Frequency'
import { PickSection } from '../../components/PickDrill'
import { MineralStack, SheetUnits, type MineralKind } from '../../reference/idx'
import type { SmQ, SmTopicModule } from '../../types'
import { DepositTree, GeoCycle, STRUCT_LABEL, StructSketch, type StructKind } from './figs'
import { STRUCT_PICKS } from './picks'
import { STRUCT_THEORY } from './theory'

const CARDS: { k: StructKind; soil: string; text: string }[] = [
  { k: 'dense', soil: 'gravel, sand', text: 'Grains settle one by one under gravity, each touching its neighbours. ↓ voids, ↓ e, ↓ permeability, ↑ shear strength, ↓ compressibility.' },
  { k: 'loose', soil: 'gravel, sand', text: 'Same deposition, large voids: ↑ e, ↑ permeability. **Unstable** — shaking densifies it.' },
  { k: 'honeycomb', soil: 'silt', text: 'Arches of fine grains around large voids. Takes static load by **bridge action**.' },
  { k: 'collapsed', soil: 'silt', text: 'Vibration breaks the arches: the loose soil collapses to a dense one with small voids (sudden settlement).' },
  { k: 'clay', soil: 'clay', text: 'Flaky plate: − charges on the faces, + on the edges; large surface area — surface force ≫ gravity.' },
  { k: 'flocculated', soil: 'clay', text: 'Edge-to-face contacts, random, large voids, high e. **Less sensitive to vibration.**' },
  { k: 'dispersed', soil: 'clay', text: 'Face-to-face, parallel plates, low e. **Remoulding** turns flocculated into dispersed.' },
  { k: 'skeleton', soil: 'coarse > fine', text: 'Coarse grains form a framework, fines fill the voids. Stable, less compressible, takes heavy loads.' },
  { k: 'matrix', soil: 'fine > coarse', text: 'No direct contact of coarse grains; behaves like a clay.' },
]

// ---------------------------------------------------------------- overview
function Overview() {
  return (
    <div>
      <Section title="Soil structure and mineralogy (Topic 4)" right={<div className="w-72 hidden cq-md:block"><SmFrequency topic="sm-struct" /></div>}>
        <Md>{`AJK sir's Topic 4 is entirely qualitative — cartoons and definitions, no formulas.
- **4A Structures:** single grained (dense / loose), honeycomb, flocculated, dispersed, coarse-grained skeleton, cohesive matrix.
- **4B Mineralogy:** quartz and feldspar (inert) vs clay minerals (charged); silica (S) and gibbsite (G) sheets, brucite, isomorphous substitution; kaolinite (1:1, H-bond, 7 Å), illite (2:1, K⁺, 10 Å), montmorillonite (2:1, van der Waals, swells).
- **Origin of soils** (residual / transported deposits, geological cycle, Bangladesh soils, history) is **not** on the slides but appears in the older papers — model answers are in the Theory tab.`}</Md>
        <Callout kind="exam">
          About 11 parts in 8 papers, all theory with sketches. **Structure types with sketches** is the favourite (2015-16 Q8(a), 2017-18 Q2(a), 2021-22 Q6(a) with flocculated vs dispersed, 2023-24 Q1(c) short notes incl. swelling of kaolinite, montmorillonite and illite — 16 marks). The 2007-08 to 2012-13 papers asked about deposits by origin, transported soils, the geological cycle, and (2011-12) Bangladesh soils, history and scope of geotechnical engineering.
        </Callout>
      </Section>
      <Section title="The structures at a glance">
        <div className="grid grid-cols-2 cq-md:grid-cols-3 cq-lg:grid-cols-5 gap-3">
          {CARDS.map((c) => (
            <div key={c.k} className="rounded-xl border border-line p-2">
              <StructSketch kind={c.k} />
              <div className="text-[11px] text-faint">{c.soil}</div>
              <Md className="text-xs">{c.text}</Md>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Clay minerals">
        <div className="grid cq-md:grid-cols-[1fr_2fr] gap-3 items-start">
          <SheetUnits />
          <div className="grid grid-cols-3 gap-1">
            {(['kaolinite', 'illite', 'montmorillonite'] as MineralKind[]).map((m) => (
              <MineralStack key={m} kind={m} />
            ))}
          </div>
        </div>
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------- approach
function Approach() {
  return (
    <div>
      <Section title="How to write a full-mark structure answer">
        <Steps>
          <Step n={1} title="Define">Structure = arrangement of particles + inter-particle forces (fabric = arrangement only).</Step>
          <Step n={2} title="Split by soil">Coarse (gravity dominates): single grained, honeycomb. Clay (surface forces dominate): flocculated, dispersed. Mixed: skeleton, matrix.</Step>
          <Step n={3} title="Sketch each one">A box with circles (sand), small circles in arches (silt), plates edge-to-face / parallel (clay). Label voids.</Step>
          <Step n={4} title="Properties with arrows">e, permeability, strength, compressibility, sensitivity to vibration — the slides use ↑/↓ arrows.</Step>
          <Step n={5} title="One practical line">Loose sand and honeycomb collapse under vibration; remoulding turns flocculated into dispersed; montmorillonite swells.</Step>
        </Steps>
        <Callout kind="trap">
          <Md>{`- Calling honeycomb a clay structure — it is for **silts** (fine grains, gravity still settles them).
- Dispersed is not "loose": it has the **lower** void ratio.
- Kaolinite is 1:1 (7 Å); illite and montmorillonite are both 2:1 (10 Å) — the **bond** decides swelling (H-bond, K⁺, van der Waals).
- "Clay-sized" ≠ clay mineral: rock flour below 2 µm is not plastic.`}</Md>
        </Callout>
      </Section>
      <Section title="Origin of soils (older papers)">
        <div className="grid cq-lg:grid-cols-2 gap-3 items-start">
          <DepositTree />
          <GeoCycle />
        </div>
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------- lab: matching drill
type MQ = { id: string; sketch: React.ReactNode; options: string[]; answer: string; note: string }
const MIN_FACTS: { m: MineralKind; t: string }[] = [
  { m: 'kaolinite', t: 'least active; H-bonded 1:1 units' },
  { m: 'illite', t: 'K⁺ ions between 2:1 units; intermediate' },
  { m: 'montmorillonite', t: 'water enters between 2:1 units; swells most' },
]
function makeMatch(seed: number): MQ[] {
  const r = rng(seed * 31 + 5)
  const kinds: StructKind[] = ['dense', 'loose', 'honeycomb', 'flocculated', 'dispersed', 'skeleton', 'matrix']
  const order = [...kinds].sort(() => r() - 0.5).slice(0, 4)
  const opts = kinds.map((k) => STRUCT_LABEL[k])
  const qs: MQ[] = order.map((k) => ({ id: `s-${k}`, sketch: <StructSketch kind={k} label={false} w={210} />, options: opts, answer: STRUCT_LABEL[k], note: CARDS.find((c) => c.k === k)!.text }))
  const m = pick(r, MIN_FACTS)
  qs.push({ id: `m-${m.m}`, sketch: <MineralStack kind={m.m} swell={1.2} w={200} />, options: ['Kaolinite', 'Illite', 'Montmorillonite'], answer: m.m[0].toUpperCase() + m.m.slice(1), note: m.t })
  return qs.sort(() => r() - 0.5)
}

function MatchLab() {
  const { seed, next } = useSeed(3)
  const qs = useMemo(() => makeMatch(seed), [seed])
  const [shown, setShown] = useState<Record<string, boolean>>({})
  return (
    <Section title="Name the sketch" sub="Each sketch is one of the slide structures or a clay mineral, with its label hidden (for the mineral, read the sheet stacking and what sits in the gap). Pick a name, then read why." right={<button className="btn !py-1 !px-3" onClick={next}>🎲 New set</button>}>
      <div className="grid cq-md:grid-cols-2 cq-lg:grid-cols-3 gap-3">
        {qs.map((q) => (
          <div key={`${seed}-${q.id}`} className="rounded-xl border border-line p-2 space-y-1">
            <div className="rounded-lg bg-bg/60 p-1">{q.id.startsWith('m-') ? <div className="[&_text]:hidden">{q.sketch}</div> : q.sketch}</div>
            <Choice id={`sm-struct:lab:match:${q.id}`} label="" options={q.options.map((o) => ({ v: o, label: o }))} answer={q.answer} />
            <button className="text-xs text-accent underline" onClick={() => setShown({ ...shown, [`${seed}-${q.id}`]: !shown[`${seed}-${q.id}`] })}>
              {shown[`${seed}-${q.id}`] ? 'hide note' : 'why?'}
            </button>
            {shown[`${seed}-${q.id}`] && <Md className="text-xs">{`**${q.answer}:** ${q.note}`}</Md>}
          </div>
        ))}
      </div>
    </Section>
  )
}

function SwellCard() {
  const [w, setW] = useState(0.4)
  return (
    <Section title="Wet the clays" sub="Slide the water content up: only montmorillonite takes water between its units (weak van der Waals bonds); illite's K⁺ and kaolinite's H-bonds keep it out.">
      <input type="range" min={0} max={2} step={0.05} value={w} onChange={(e) => setW(+e.target.value)} className="w-full accent-[var(--c-water)]" />
      <div className="grid grid-cols-3 gap-2">
        <MineralStack kind="kaolinite" />
        <MineralStack kind="illite" />
        <MineralStack kind="montmorillonite" swell={w} />
      </div>
    </Section>
  )
}

// ---------------------------------------------------------------- practice (theory) problems
const theoryQ = (id: string, title: string, text: string, i: number): SmQ => {
  const t = STRUCT_THEORY[i]
  const Fig = t.Fig
  return {
    id: `sm-own-struct-${id}`,
    paper: 'own',
    level: 'exam',
    sec: 'A',
    no: id,
    marks: 0,
    topics: ['sm-struct'],
    title,
    text,
    pages: [],
    theory: true,
    solution: () => (
      <div className="space-y-2">
        <Md className="text-sm">{t.a}</Md>
        {Fig && <Fig />}
      </div>
    ),
  }
}
const problems: SmQ[] = [
  theoryQ('1', 'Short notes with sketches (2023-24 style)', 'Write short notes, with sketches, on (i) single-grained structure, (ii) honeycomb structure, (iii) dispersed structure of soil.', 0),
  theoryQ('2', 'Flocculated vs dispersed', 'Sketch a flocculated and a dispersed clay and list at least six differences between them.', 1),
  theoryQ('3', 'Why does montmorillonite swell?', 'Explain, with sketches of the sheet stacking, why montmorillonite swells far more than kaolinite and illite.', 2),
]

const mod: SmTopicModule = {
  Overview,
  Approach,
  Lab: () => (
    <div className="space-y-6">
      <MatchLab />
      <SwellCard />
      <PickSection topic="sm-struct" skills={STRUCT_PICKS} />
    </div>
  ),
  problems,
  theory: STRUCT_THEORY,
}
export default mod

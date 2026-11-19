// Markdown builders for worked lime–soda softening (shared by the softening lab and the past-paper solutions):
// ion → as-CaCO3 conversion with each multiplication, the hardness split, the lime / soda dose term by term
// (one column per stage for split treatment), and doses → chemical masses.
import { TO_CACO3, type HardnessOut } from '../engine/chem'
import { masses, type Treat } from '../engine/soften'

const f = (v: number, d = 1) => v.toFixed(d)

/** factor = 50 / equivalent weight */
export const FAC = { co2: TO_CACO3.co2, ca: TO_CACO3.ca, mg: TO_CACO3.mg, na: TO_CACO3.na, cl: TO_CACO3.cl, so4: TO_CACO3.so4, hco3: TO_CACO3.hco3 }

/** one row per constituent: mg/L × factor = mg/L as CaCO3 (the value shown is the engine's `cc`) */
export function ionTableMd(rows: { name: string; mgL: number; fac: number; eqw?: string; cc: number }[], foot = '') {
  return [
    `| constituent | mg/L (as the ion) | × 50/eq. wt | mg/L as CaCO₃ |`,
    `|---|---|---|---|`,
    ...rows.map((r) => `| ${r.name} | ${+r.mgL.toFixed(2)} | ${r.eqw ? `50/${r.eqw} = ` : ''}${r.fac} | ${+r.mgL.toFixed(2)} × ${r.fac} = **${f(r.cc)}** |`),
    foot,
  ]
    .filter(Boolean)
    .join('\n')
}

/** TH, CH, NCH and the Ca / Mg parts of the NCH, as a table with the rule used in each row */
export function hardnessTableMd(h: HardnessOut) {
  const over = h.th > h.alk
  return [
    `| quantity | rule | mg/L as CaCO₃ |`,
    `|---|---|---|`,
    `| total hardness TH | Ca + Mg = ${f(h.caH)} + ${f(h.mgH)} | **${f(h.th)}** |`,
    over
      ? `| carbonate hardness CH | TH > alkalinity (${f(h.alk)}), so CH = alkalinity | **${f(h.ch)}** |`
      : `| carbonate hardness CH | TH ≤ alkalinity (${f(h.alk)}), so CH = TH | **${f(h.ch)}** |`,
    over ? `| non-carbonate hardness NCH | TH − alk = ${f(h.th)} − ${f(h.alk)} | **${f(h.nch)}** |` : `| non-carbonate hardness NCH | none: every Ca and Mg is matched by HCO₃⁻ | **0** |`,
    over ? `| Ca part of the NCH | Ca − alk = ${f(h.caH)} − ${f(h.alk)} (0 if negative) | ${f(h.caNch)} |` : '',
    over ? `| Mg part of the NCH | NCH − Ca part = ${f(h.nch)} − ${f(h.caNch)} | ${f(h.mgNch)} |` : '',
  ]
    .filter(Boolean)
    .join('\n')
}

/** lime and soda term by term (each row names what that term is for); with two stages (split treatment) one column each */
export function doseTableMd(stages: { label: string; t: Treat }[]) {
  const col = (fn: (t: Treat) => string) => stages.map((s) => fn(s.t)).join(' | ')
  const anyMg = stages.some((s) => s.t.mode === 'complete')
  const anyExc = stages.some((s) => s.t.excess > 0)
  const one = stages.length === 1 ? stages[0].t.mode : null
  return [
    `| lime / soda term (what it does) | ${stages.map((s) => s.label).join(' | ')} |`,
    `|---|${stages.map(() => '---').join('|')}|`,
    `| lime for CO₂ (neutralises the free CO₂) | ${col((t) => f(t.limeParts.co2))} |`,
    `| lime for the alkalinity (carbonate hardness → CaCO₃↓) | ${col((t) => f(t.limeParts.alk))} |`,
    anyMg ? `| lime for Mg (Mg → Mg(OH)₂↓) | ${col((t) => (t.mode === 'complete' ? f(t.limeParts.mg) : '0 (Mg left)'))} |` : '',
    anyExc ? `| excess lime (pH about 11) | ${col((t) => f(t.excess, 0))} |` : '',
    `| **lime L** (sum) | ${col((t) => `**${f(t.lime)}**`)} |`,
    `| **soda ash S** (${one === 'selective' ? 'none: the Ca-NCH is left' : one === 'complete' ? 'S = NCH: CO₃²⁻ for the hardness with no HCO₃⁻' : 'NCH, complete stage only'}) | ${col((t) => `**${f(t.soda)}**`)} |`,
    `| finished hardness (${one === 'complete' ? 'Ca 30 + Mg 10' : one === 'selective' ? 'Ca-NCH + 30 + Mg' : 'complete: 30 + 10'}) | ${col((t) => f(t.final.th))} |`,
  ]
    .filter(Boolean)
    .join('\n')
}

/** doses as CaCO3 → mg/L of CaO, Ca(OH)2 and Na2CO3 (× MW/100, ÷ purity) */
export function massTableMd(lime: number, soda: number, pu?: [number, number]) {
  const pl = pu?.[0] ?? 1
  const ps = pu?.[1] ?? 1
  const dv = (p: number) => (p < 1 ? ` ÷ ${p}` : '')
  const m = masses(lime, soda, pl, ps)
  return [
    `| chemical | as CaCO₃ | × MW/100 ${pu ? '÷ purity' : ''} | mg/L of chemical |`,
    `|---|---|---|---|`,
    `| quicklime CaO | ${f(lime)} | × 56/100${dv(pl)} | **${f(m.CaO)}** |`,
    `| (or hydrated lime Ca(OH)₂) | ${f(lime)} | × 74/100${dv(pl)} | ${f(m.CaOH2)} |`,
    `| soda ash Na₂CO₃ | ${f(soda)} | × 106/100${dv(ps)} | **${f(m.Na2CO3)}** |`,
  ].join('\n')
}

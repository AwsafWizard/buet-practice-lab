// Worked mass-curve (supply-side) table for a rainwater tank, the way it is written in the exam: the harvest per mm of rain,
// one row per month with the arithmetic in the cells and the running totals, then how the storage is read off it.
// When the roof gives more than the demand, the running dry-spell shortfall is tabulated too (that is what the engine's
// sequent-peak `tank` is), so the student can see where the number comes from.
import { fmt } from '../../components/DiagramView'
import { Md } from '../../components/ui'
import type { SupplySide } from '../engine/rwh'

const f2 = (v: number) => fmt(v, 2)

/** m³ of harvest per mm of rain on the catchment */
export const harvestFactor = (area: number, C: number) => (area * C) / 1000

/** the running shortfall in table order, second pass (carried in from the end of the first year), as the engine sizes the tank */
export function shortfallRun(s: SupplySide) {
  let sh = 0
  s.rows.forEach((r) => {
    sh = Math.max(0, sh + s.demandUsed - r.harvest)
  })
  const carry = sh
  const rows = s.rows.map((r) => {
    const prev = sh
    sh = Math.max(0, sh + s.demandUsed - r.harvest)
    return { month: r.month, prev, val: sh }
  })
  const max = Math.max(0, ...rows.map((r) => r.val))
  return { carry, rows, max }
}

export function massTableMd(s: SupplySide, area: number, C: number) {
  const k = harvestFactor(area, C)
  const mi = s.rows.findIndex((r) => r.month === s.maxDiffMonth)
  const rows = s.rows
    .map((r, i) => {
      const b = (x: string) => (i === mi ? `**${x}**` : x)
      return `| ${b(r.month)} | ${fmt(r.rain, 1)} | ${fmt(r.rain, 1)} × ${fmt(k, 4)} = ${f2(r.harvest)} | ${i ? `${f2(s.rows[i - 1].cumHarvest)} + ${f2(r.harvest)} = ` : ''}**${f2(r.cumHarvest)}** | ${f2(r.demand)} | **${f2(r.cumDemand)}** | ${f2(r.cumHarvest)} − ${f2(r.cumDemand)} = ${b(f2(r.diff))} |`
    })
    .join('\n')
  return `| month | rain (mm) | harvest (m³) = rain × ${fmt(k, 4)} | cum. harvest (m³) | demand (m³) | cum. demand (m³) | difference (m³) |\n|---|---|---|---|---|---|---|\n${rows}`
}

/** the harvest-per-mm line, the mass-curve table and the reading of the storage */
export function MassWork({ s, area, C }: { s: SupplySide; area: number; C: number }) {
  const k = harvestFactor(area, C)
  const sameAsDiff = Math.abs(s.tank - s.maxDiff) <= 0.01
  const run = shortfallRun(s)
  const intro = `Harvest per mm of rain: $k = \\dfrac{A\\,C}{1000} = \\dfrac{${fmt(area, 2)} \\times ${C}}{1000} = ${fmt(k, 4)}$ m³ per mm, so each month's harvest is its rain × ${fmt(k, 4)}. The table starts in **${s.rows[0].month}**, the month after the cumulative balance is lowest (end of the dry spell), so the tank is empty at the start.`
  const read = sameAsDiff
    ? `The difference column is the water in the tank at the end of each month. Its largest value is the storage: **${f2(s.maxDiff)} m³ in ${s.maxDiffMonth}** (bold row).${s.supplyGoverns ? ` It comes back to 0 at the end of the year because the demand was set equal to the year's harvest.` : ''}`
    : `Here the roof gives more than is used, so the difference only grows (the extra spills over the top). What the tank must carry is the **dry-spell shortfall**: go through the months again, add the demand and take off the harvest, never below 0 (a full tank cannot store more).`
  const shortTable = sameAsDiff
    ? ''
    : `| month | shortfall at month end (m³) = max(0, previous + ${f2(s.demandUsed)} − harvest) |\n|---|---|\n${run.rows
        .map((r, i) => `| ${r.month} | max(0, ${f2(r.prev)} + ${f2(s.demandUsed)} − ${f2(s.rows[i].harvest)}) = ${Math.abs(r.val - run.max) < 1e-9 && r.val > 0 ? `**${f2(r.val)}**` : f2(r.val)} |`)
        .join('\n')}\n\n${run.carry > 0 ? `(The first row starts from the ${f2(run.carry)} m³ still owed at the end of the year before.) ` : ''}The largest shortfall is the storage: **${f2(s.tank)} m³**.`
  return (
    <div className="space-y-2">
      <Md>{intro}</Md>
      <Md>{massTableMd(s, area, C)}</Md>
      <Md>{read}</Md>
      {shortTable && <Md>{shortTable}</Md>}
    </div>
  )
}

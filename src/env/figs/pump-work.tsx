// Layout pieces for worked solutions (given → assumptions → numbered steps → boxed result) and the pumping-main solver.
// Used by the numbers map (pyq/rm-math.tsx) and by the Pump lab's revealed solutions.
import type { ReactNode } from 'react'
import { fmt } from '../../components/DiagramView'
import { Md, Step, Steps, Tex } from '../../components/ui'
import { G_FPS, G_SI, GAL_L, FT3_L, design, powerFps, powerGpm, powerSI, type DesignOut, type PowerOut } from '../engine/pump'
import { PumpProfile, type ProfileProps } from './pump-profile'

/** number with sensible digits for a worked solution: 4 significant figures, no exponent */
export function sg(v: number, s = 4): string {
  if (!Number.isFinite(v)) return '—'
  if (v === 0) return '0'
  const a = Math.abs(v)
  if (a >= 10 ** s) return String(Math.round(v))
  const dec = Math.max(0, s - 1 - Math.floor(Math.log10(a)))
  return v.toFixed(Math.min(dec, 6)).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '')
}

export const T = ({ children }: { children: string }) => <Tex block>{children}</Tex>

export function Block({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <div className="mb-3">
      <div className="text-xs font-bold uppercase tracking-wider text-faint mb-1">{title}</div>
      <div className="text-sm">{children}</div>
    </div>
  )
}
export const Bullets = ({ items }: { items: string[] }) => <Md>{items.map((x) => '- ' + x).join('\n')}</Md>

export function Boxed({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border-2 border-accent/60 bg-accent/10 px-4 py-2.5 font-bold text-sm leading-relaxed">{children}</div>
}

export function Sheet({ given, assume, children, after, answer, notes }: { given: string[]; assume?: string[]; children: ReactNode; after?: ReactNode; answer: ReactNode; notes?: string[] }) {
  return (
    <div className="space-y-1">
      <Block title="Given">
        <Bullets items={given} />
      </Block>
      {assume && assume.length > 0 && (
        <Block title="Assumptions the paper invites">
          <Bullets items={assume} />
        </Block>
      )}
      <Block title="Working">
        <Steps>{children}</Steps>
      </Block>
      {after}
      <Boxed>{answer}</Boxed>
      {notes && notes.length > 0 && (
        <div className="text-xs text-mute pt-1">
          <Bullets items={notes} />
        </div>
      )}
    </div>
  )
}

// ------------------------------------------------------------------ pumping main
export interface PCase {
  given: string[]
  assume?: string[]
  sys: 'si' | 'fps'
  /** how the discharge is found (TeX lines) */
  qTex: string[]
  /** m3/s (si) or cfs (fps) */
  Q: number
  /** gallons per minute (her British gallon), needed for the gpm power route */
  gpm?: number
  v?: number
  d?: number
  f: number
  L: number
  /** how L is made up (TeX lines), shown before the friction step */
  lTex?: string[]
  hs: number
  /** how the static head is read off the levels (TeX lines) */
  hsTex: string[]
  sumK?: number
  eta: number
  etaMotor?: number
  power: 'si' | 'fps' | 'gpm'
  /** gamma for SI (kN/m3), default 9.81 */
  gamma?: number
  velocityHead?: boolean
  fig?: Pick<ProfileProps, 'sourceWL' | 'pumpCL' | 'deliveryWL' | 'tankBase' | 'ground' | 'sourceBottom' | 'sourceName' | 'tankName' | 'submerged'>
  /** other readings of the paper, solved with the same engine: label + changed fields */
  alts?: { label: string; patch: Partial<PCase> }[]
  /** commercial diameter to mention (same units as d) */
  dStd?: number
  notes?: string[]
}
export interface PRes {
  des: DesignOut
  pw: PowerOut
}
export function solvePump(c: PCase): PRes {
  const des = design({ system: c.sys, Q: c.Q, v: c.v, d: c.d, f: c.f, L: c.L, hs: c.hs, sumK: c.sumK, velocityHead: c.velocityHead })
  let pw: PowerOut
  if (c.power === 'si') pw = powerSI(c.Q, des.H, c.eta, { etaMotor: c.etaMotor, gamma: c.gamma })
  else if (c.power === 'gpm') pw = powerGpm(des.H, c.gpm ?? 0, c.eta, { etaMotor: c.etaMotor })
  else pw = powerFps(c.Q, des.H, c.eta, { etaMotor: c.etaMotor })
  return { des, pw }
}
export const mk = (c: PCase, patch: Partial<PCase>): PCase => ({ ...c, ...patch })

/** one-line final answer from the engine result */
export function pumpFinal(c: PCase): string {
  const { des, pw } = solvePump(c)
  const si = c.sys === 'si'
  const parts: string[] = []
  parts.push(si ? `Q = ${sg(c.Q, 4)} m³/s (${sg(c.Q * 1000, 4)} L/s)` : c.gpm ? `Q = ${sg(c.gpm, 4)} gpm = ${sg(c.Q, 4)} cfs` : `Q = ${sg(c.Q, 4)} cfs`)
  parts.push(si ? `d = ${sg(des.pipe.d * 1000, 3)} mm` : `d = ${sg(des.pipe.d, 3)} ft`)
  parts.push(si ? `v = ${sg(des.pipe.v, 3)} m/s` : `v = ${sg(des.pipe.v, 3)} ft/s`)
  parts.push(`H = ${sg(des.H, 4)} ${si ? 'm' : 'ft'}`)
  if (si) parts.push(`water power ${sg(pw.waterKW, 4)} kW`, `pump input ${sg(pw.inputKW, 4)} kW (${sg(pw.inputHp, 3)} hp)`)
  else parts.push(`water power ${sg(pw.waterHp, 4)} hp`, `input power ${sg(pw.inputHp, 4)} hp`)
  if (pw.motorKW != null) parts.push(`motor ${sg(pw.motorKW, 4)} kW (${sg(pw.motorHp!, 3)} hp)`)
  return parts.join('; ')
}

export function PumpWork({ c, extra }: { c: PCase; extra?: ReactNode }) {
  const { des, pw } = solvePump(c)
  const si = c.sys === 'si'
  const u = si ? { len: 'm', Q: 'm^3/s', v: 'm/s', g: G_SI } : { len: 'ft', Q: 'ft^3/s', v: 'ft/s', g: G_FPS }
  const uText = (s: string) => String.raw`\text{ ${s}}`
  let n = 0
  const S = () => ++n
  const eff = Math.round(c.eta * 1000) / 10
  const withVh = c.velocityHead !== false
  return (
    <Sheet
      given={c.given}
      assume={c.assume}
      notes={c.notes}
      after={
        <div className="space-y-3 mb-3">
      {c.fig && (
        <div className="rounded-xl border border-line p-2 bg-panel2/30">
          <PumpProfile unit={si ? 'm' : 'ft'} hf={des.hf} hv={des.hv} hm={des.hm} {...c.fig} />
        </div>
      )}
      {c.alts && c.alts.length > 0 && (
        <div className="rounded-lg border border-line px-3 py-2 text-xs text-mute">
          <div className="font-bold mb-1">Other readings of the question, same method</div>
          <ul className="list-disc pl-5 space-y-0.5">
            {c.alts.map((a, i) => {
              const r = solvePump(mk(c, a.patch))
              return (
                <li key={i}>
                  {a.label}: H = {fmt(r.des.H, 2)} {si ? 'm' : 'ft'}, {si ? `input ${fmt(r.pw.inputKW, 1)} kW (${fmt(r.pw.inputHp, 0)} hp)` : `input ${fmt(r.pw.inputHp, 1)} hp`}
                </li>
              )
            })}
          </ul>
        </div>
      )}
      {extra}
        </div>
      }
      answer={
        <>
          {pumpFinal(c)}
          {c.dStd != null && <div className="font-normal text-xs mt-1">Provide the next commercial size, {c.dStd} {si ? 'mm' : 'ft'}, and check the head again.</div>}
        </>
      }
    >
      <Step n={S()} title="Discharge">
        {c.qTex.map((t, i) => (
          <T key={i}>{t}</T>
        ))}
      </Step>
      <Step n={S()} title={c.d != null ? 'Velocity in the given pipe' : 'Pipe size from the velocity'}>
        {c.d != null ? (
          <>
            <T>{String.raw`A = \frac{\pi d^2}{4} = \frac{\pi (${sg(c.d, 4)})^2}{4} = ${sg(des.pipe.A, 4)}${uText(u.len)}^2`}</T>
            <T>{String.raw`v = \frac{Q}{A} = \frac{${sg(c.Q, 4)}}{${sg(des.pipe.A, 4)}} = ${sg(des.pipe.v, 4)}${uText(u.v)}`}</T>
          </>
        ) : (
          <>
            <T>{String.raw`A = \frac{Q}{v} = \frac{${sg(c.Q, 4)}}{${sg(c.v ?? 0, 4)}} = ${sg(des.pipe.A, 4)}${uText(u.len)}^2`}</T>
            <T>{String.raw`d = \sqrt{\frac{4A}{\pi}} = \sqrt{\frac{4 \times ${sg(des.pipe.A, 4)}}{\pi}} = ${sg(des.pipe.d, 4)}${uText(u.len)}${si ? String.raw`\;(${sg(des.pipe.d * 1000, 4)}\text{ mm})` : ''}`}</T>
          </>
        )}
      </Step>
      <Step n={S()} title="Static head from the levels">
        {c.hsTex.map((t, i) => (
          <T key={i}>{t}</T>
        ))}
      </Step>
      <Step n={S()} title="Friction head (Darcy, f used as given)">
        {c.lTex?.map((t, i) => <T key={i}>{t}</T>)}
        <T>{String.raw`h_f = \frac{f L v^2}{2 g d} = \frac{${sg(c.f, 3)} \times ${sg(c.L, 5)} \times ${sg(des.pipe.v, 4)}^2}{2 \times ${u.g} \times ${sg(des.pipe.d, 4)}} = ${sg(des.hf, 4)}${uText(u.len)}`}</T>
      </Step>
      <Step n={S()} title={withVh ? (c.sumK ? 'Velocity head and minor losses' : 'Velocity head') : 'Minor losses'}>
        {withVh && <T>{String.raw`h_v = \frac{v^2}{2g} = \frac{${sg(des.pipe.v, 4)}^2}{2 \times ${u.g}} = ${sg(des.hv, 4)}${uText(u.len)}`}</T>}
        {c.sumK ? <T>{String.raw`h_m = \sum K \frac{v^2}{2g} = ${sg(c.sumK, 4)} \times ${sg(des.hv || (des.pipe.v ** 2) / (2 * u.g), 4)} = ${sg(des.hm, 4)}${uText(u.len)}`}</T> : null}
      </Step>
      <Step n={S()} title="Total head the pump must give">
        <T>{String.raw`H = h_s + h_f${withVh ? ' + h_v' : ''}${c.sumK ? ' + h_m' : ''} = ${sg(des.hs, 4)} + ${sg(des.hf, 4)}${withVh ? ` + ${sg(des.hv, 4)}` : ''}${c.sumK ? ` + ${sg(des.hm, 4)}` : ''} = ${sg(des.H, 4)}${uText(u.len)}`}</T>
      </Step>
      <Step n={S()} title="Water power and input power">
        {c.power === 'si' && (
          <>
            <T>{String.raw`P_w = \gamma Q H = ${c.gamma ?? 9.81} \times ${sg(c.Q, 4)} \times ${sg(des.H, 4)} = ${sg(pw.waterKW, 4)}\text{ kW} = ${sg(pw.waterHp, 4)}\text{ hp}`}</T>
            <T>{String.raw`P_{in} = \frac{P_w}{\eta} = \frac{${sg(pw.waterKW, 4)}}{${sg(c.eta, 3)}} = ${sg(pw.inputKW, 4)}\text{ kW} = ${sg(pw.inputHp, 4)}\text{ hp}`}</T>
          </>
        )}
        {c.power === 'fps' && (
          <>
            <T>{String.raw`P_w = \frac{\gamma Q H}{550} = \frac{62.4 \times ${sg(c.Q, 4)} \times ${sg(des.H, 4)}}{550} = ${sg(pw.waterHp, 4)}\text{ hp}`}</T>
            <T>{String.raw`P_{in} = \frac{P_w}{\eta} = \frac{${sg(pw.waterHp, 4)}}{${sg(c.eta, 3)}} = ${sg(pw.inputHp, 4)}\text{ hp}`}</T>
          </>
        )}
        {c.power === 'gpm' && (
          <>
            <T>{String.raw`P_w = \frac{H Q_{gpm}}{3960} = \frac{${sg(des.H, 4)} \times ${sg(c.gpm ?? 0, 5)}}{3960} = ${sg(pw.waterHp, 4)}\text{ hp}`}</T>
            <T>{String.raw`BHP = \frac{P_w}{\eta} = \frac{${sg(pw.waterHp, 4)}}{${sg(c.eta, 3)}} = ${sg(pw.inputHp, 4)}\text{ hp}`}</T>
          </>
        )}
        {pw.motorKW != null && <T>{String.raw`P_{motor} = \frac{P_{in}}{\eta_m} = \frac{${sg(pw.inputKW, 4)}}{${sg(c.etaMotor ?? 1, 3)}} = ${sg(pw.motorKW, 4)}\text{ kW} = ${sg(pw.motorHp!, 4)}\text{ hp}`}</T>}
        <div className="text-xs text-mute">Pump efficiency {eff} %.</div>
      </Step>
    </Sheet>
  )
}

export { GAL_L, FT3_L }

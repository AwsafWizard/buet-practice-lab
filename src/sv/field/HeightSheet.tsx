// Height & distance with a theodolite, entered the way the lecture sheet's tables ask for it (pp 015–024):
//  • aerial distance FG: ∠CAD, ∠BAD, ∠CAF, ∠DAG at A; ∠ABC, ∠CBD at B; base AB;
//  • space triangle FGH: the same plus ∠DAE, ∠BAE, ∠EAH at A and ∠DBE at B (∠BAD = ∠BAE + ∠DAE);
//  • inaccessible tower.
import { useContext, useMemo, type ReactNode } from 'react'
import { Seg } from '../../components/ui'
import { fmtDMS, parseDMS } from '../engine/angle'
import { aerialFG, spaceFGH, towerHeight } from '../engine/height'
import { Field, fx, has, n, ReadOnly, type Row } from './Grid'
import { PlanFrame, Station } from './plots'

type Mode = 'aerial' | 'triangle' | 'tower'
type AngKey = 'CAD' | 'BAD' | 'DAE' | 'BAE' | 'CAF' | 'DAG' | 'EAH' | 'ABC' | 'CBD' | 'DBE'

export interface HeightData {
  mode: Mode
  // tower
  a: string
  th1: string
  th2: string
  h1: string
  h2: string
  // aerial distance / space triangle
  AB: string
  hi: string
  zenith: boolean
  ang: Partial<Record<AngKey, string>>
  /** sheets saved before Nov 28 kept one row per point; read once into `ang` */
  targets?: Row[]
}

export const heightBlank = (): HeightData => ({ mode: 'aerial', a: '', th1: '', th2: '', h1: '', h2: '', AB: '', hi: '', zenith: false, ang: {} })

/** Nafim's 2022 space triangle (AB = 30 m, instrument 1.345 m, zenith readings at A) in the manual's angles */
export const heightSample = (): HeightData => ({
  mode: 'aerial',
  a: '10',
  th1: '28 30',
  th2: '35 10',
  h1: '1.50',
  h2: '1.45',
  AB: '30',
  hi: '1.345',
  zenith: true,
  ang: { CAD: '26 47 10', BAD: '53 28 40', DAE: '55 48 50', BAE: '-2 20 10', CAF: '80 38 10', DAG: '75 24 40', EAH: '84 34 50', ABC: '92 05 46', CBD: '29 28 14', DBE: '61 28 30' },
})

const dmsText = (a: number) => {
  const t = fmtDMS(a).replace('−', '-')
  return t.replace(/[°′]/g, ' ').replace('″', '')
}

/** fill in anything an older sheet is missing; the old per-point rows become the manual's angles */
function normalise(d: HeightData): HeightData {
  const out: HeightData = { ...heightBlank(), ...d, ang: { ...(d.ang ?? {}) } }
  if ((d.mode as string) === 'space') out.mode = 'triangle'
  if (!d.ang && d.targets?.length) {
    const [f, g, h] = d.targets
    const A = (r?: Row) => parseDMS(r?.atA)
    const B = (r?: Row) => parseDMS(r?.atB)
    const put = (k: AngKey, v: number) => isFinite(v) && (out.ang[k] = dmsText(v))
    put('CAD', A(f) - A(g))
    put('BAD', A(g))
    put('ABC', B(f))
    put('CBD', B(g) - B(f))
    put('DAE', A(g) - A(h))
    put('BAE', A(h))
    put('DBE', B(h) - B(g))
    if (f?.vA) out.ang.CAF = f.vA
    if (g?.vA) out.ang.DAG = g.vA
    if (h?.vA) out.ang.EAH = h.vA
  }
  return out
}

export function HeightSheet({ data: raw, set }: { data: HeightData; set: (d: HeightData) => void }) {
  const data = useMemo(() => normalise(raw), [raw])
  return (
    <div className="space-y-5">
      <Seg<Mode>
        value={data.mode}
        onChange={(mode) => set({ ...data, mode })}
        items={[
          { v: 'aerial', label: 'Aerial distance FG' },
          { v: 'triangle', label: 'Space triangle FGH' },
          { v: 'tower', label: 'Inaccessible tower' },
        ]}
      />
      {data.mode === 'tower' ? <Tower data={data} set={set} /> : <Manual data={data} set={set} three={data.mode === 'triangle'} />}
    </div>
  )
}

function Tower({ data, set }: { data: HeightData; set: (d: HeightData) => void }) {
  const ok = [data.a, data.h1, data.h2].every(has) && isFinite(parseDMS(data.th1)) && isFinite(parseDMS(data.th2))
  const r = ok ? towerHeight({ a: n(data.a), th1: parseDMS(data.th1), th2: parseDMS(data.th2), h1: n(data.h1), h2: n(data.h2) }) : null
  return (
    <div className="space-y-4">
      <p className="text-xs text-mute">
        Both instrument stations in line with the tower, the far one (θ₁) a metres behind the near one (θ₂). h₁, h₂ = height of the line of sight at each station above a common datum (e.g. RL of the BM + staff reading on it). Lecture sheet: H = h₁ + (a + x) tanθ₁ = h₂ + x tanθ₂.
      </p>
      <div className="flex flex-wrap gap-4 items-end">
        <Field label="a — distance between stations" value={data.a} onChange={(v) => set({ ...data, a: v })} w="6rem" />
        <Field label="θ₁ — elevation from the far station" type="dms" value={data.th1} onChange={(v) => set({ ...data, th1: v })} w="7rem" />
        <Field label="θ₂ — elevation from the near station" type="dms" value={data.th2} onChange={(v) => set({ ...data, th2: v })} w="7rem" />
        <Field label="h₁ — line of sight at far station" value={data.h1} onChange={(v) => set({ ...data, h1: v })} w="6rem" />
        <Field label="h₂ — line of sight at near station" value={data.h2} onChange={(v) => set({ ...data, h2: v })} w="6rem" />
      </div>
      {r && (
        <div className="card p-4 text-sm space-y-1">
          <div>
            tanθ₁ = {r.t1.toFixed(5)}, tanθ₂ = {r.t2.toFixed(5)}
          </div>
          <div>
            x = (h₂ − h₁ − a tanθ₁) / (tanθ₁ − tanθ₂) = ({data.h2} − {data.h1} − {data.a} × {r.t1.toFixed(5)}) / ({r.t1.toFixed(5)} − {r.t2.toFixed(5)}) = <b className="num">{fx(r.x, 3)}</b>
          </div>
          <div>
            H = h₂ + x tanθ₂ = <b className="num text-accent">{fx(r.H, 3)}</b> · check H = h₁ + (a + x) tanθ₁ = <span className="num">{fx(r.Hcheck, 3)}</span>
          </div>
          {r.x < 0 && <div className="text-bad">⚠ x came out negative: θ₁ must be the smaller angle (far station).</div>}
        </div>
      )}
    </div>
  )
}

// ── the manual's angle table ────────────────────────────────────────────────────────────────

const ROWS: Record<'aerial' | 'triangle', { st: 'A' | 'B'; k: AngKey; type: 'horizontal' | 'vertical' }[]> = {
  aerial: [
    { st: 'A', k: 'CAD', type: 'horizontal' },
    { st: 'A', k: 'BAD', type: 'horizontal' },
    { st: 'A', k: 'CAF', type: 'vertical' },
    { st: 'A', k: 'DAG', type: 'vertical' },
    { st: 'B', k: 'ABC', type: 'horizontal' },
    { st: 'B', k: 'CBD', type: 'horizontal' },
  ],
  triangle: [
    { st: 'A', k: 'CAD', type: 'horizontal' },
    { st: 'A', k: 'DAE', type: 'horizontal' },
    { st: 'A', k: 'BAE', type: 'horizontal' },
    { st: 'A', k: 'CAF', type: 'vertical' },
    { st: 'A', k: 'DAG', type: 'vertical' },
    { st: 'A', k: 'EAH', type: 'vertical' },
    { st: 'B', k: 'ABC', type: 'horizontal' },
    { st: 'B', k: 'CBD', type: 'horizontal' },
    { st: 'B', k: 'DBE', type: 'horizontal' },
  ],
}

function AngleTable({ data, set, three }: { data: HeightData; set: (d: HeightData) => void; three: boolean }) {
  const ro = useContext(ReadOnly)
  const rows = ROWS[three ? 'triangle' : 'aerial']
  const nA = rows.filter((r) => r.st === 'A').length
  const put = (k: AngKey, v: string) => set({ ...data, ang: { ...data.ang, [k]: v } })
  const vLabel = data.zenith ? 'vertical (zenith)' : 'vertical'
  return (
    <table className="text-sm border-collapse w-full max-w-lg">
      <thead>
        <tr className="text-xs text-mute">
          <th className="border border-line px-2 py-1 text-left font-semibold">Theodolite station</th>
          <th className="border border-line px-2 py-1 text-left font-semibold" colSpan={2}>
            Angle measured
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => {
          const v = data.ang[r.k] ?? ''
          const bad = v.trim() !== '' && !isFinite(parseDMS(v))
          return (
            <tr key={r.k}>
              {(i === 0 || i === nA) && (
                <td className="border border-line px-2 py-1 text-center font-bold align-middle" rowSpan={r.st === 'A' ? nA : rows.length - nA}>
                  {r.st}
                </td>
              )}
              <td className="border border-line px-2 py-1 whitespace-nowrap">
                <span className="num font-semibold">∠{r.k}</span> ={' '}
                {ro ? (
                  <span className="num">{v ? fmtDMS(parseDMS(v)) : '—'}</span>
                ) : (
                  <input className={'field ml-1 ' + (bad ? '!border-bad' : '')} style={{ width: '7.5rem' }} value={v} placeholder="° ′ ″" inputMode="text" autoComplete="off" spellCheck={false} onChange={(e) => put(r.k, e.target.value)} />
                )}
              </td>
              <td className={'border border-line px-2 py-1 text-xs whitespace-nowrap ' + (r.type === 'vertical' ? 'text-accent' : 'text-mute')}>{r.type === 'vertical' ? vLabel : 'horizontal'}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function Manual({ data, set, three }: { data: HeightData; set: (d: HeightData) => void; three: boolean }) {
  const AB = n(data.AB)
  const hi = has(data.hi) ? n(data.hi) : 0
  const g = (k: AngKey) => parseDMS(data.ang[k])
  const vert = (k: AngKey) => (data.zenith ? 90 - g(k) : g(k))
  const keys = ROWS[three ? 'triangle' : 'aerial'].map((r) => r.k)
  const ready = AB > 0 && keys.every((k) => isFinite(g(k)))
  const base = { CAD: g('CAD'), CAF: vert('CAF'), DAG: vert('DAG'), ABC: g('ABC'), CBD: g('CBD') }
  const fg = ready && !three ? aerialFG(AB, { ...base, BAD: g('BAD') }) : null
  const tri = ready && three ? spaceFGH(AB, { ...base, DAE: g('DAE'), BAE: g('BAE'), EAH: vert('EAH'), DBE: g('DBE') }) : null
  const r = tri ?? fg
  const missing = keys.filter((k) => !isFinite(g(k)))
  const d = (a: number) => fmtDMS(a)
  const m = (v: number) => fx(v, 3)

  return (
    <div className="space-y-4">
      <p className="text-xs text-mute">
        {three
          ? 'Space triangle FGH (lecture sheet pp 019–024): three poles or roof corners with tops F, G, H above ground points C, D, E. Theodolite at A, then at B; base AB taped. Read the angles between neighbouring lines, as in the figure.'
          : 'Aerial distance FG (lecture sheet pp 015–018): tops F and G above ground points C and D. Theodolite at A, then at B; base AB taped. Read the angles between neighbouring lines, as in the figure.'}{' '}
        A point on the far side of a line gets a negative angle{three ? ' (Nafim’s ∠BAE = −2°20′10″)' : ''}.
      </p>

      <div className="grid xl:grid-cols-2 gap-4 items-start">
        <div className="space-y-3">
          <AngleTable data={data} set={set} three={three} />
          <div className="flex flex-wrap gap-4 items-end">
            <Field label="AB — distance between A and B (m)" value={data.AB} onChange={(v) => set({ ...data, AB: v })} w="6rem" />
            <Field label="Height of instrument (m)" value={data.hi} onChange={(v) => set({ ...data, hi: v })} w="6rem" hint="added to get heights above ground" />
          </div>
          <label className="flex flex-col gap-0.5 text-xs">
            <span className="text-mute font-semibold">Vertical readings are</span>
            <Seg<'z' | 'e'> value={data.zenith ? 'z' : 'e'} onChange={(v) => set({ ...data, zenith: v === 'z' })} items={[{ v: 'e', label: 'elevation angles' }, { v: 'z', label: 'zenith (90° = level)' }]} />
          </label>
        </div>
        <ManualFig three={three} r={r} AB={AB} hi={hi} />
      </div>

      {!ready && <div className="text-xs text-faint">{AB > 0 ? `Still to fill: ${missing.map((k) => '∠' + k).join(', ')}` : 'Fill in AB and the angles to see the working.'}</div>}

      {r && (
        <div className="card p-4 text-sm space-y-3">
          <div className="font-bold">Working (as the lecture sheet sets it out)</div>
          {data.zenith && (
            <Step t="Vertical angles from the zenith readings">
              ∠CAF = 90° − {d(g('CAF'))} = <b>{d(vert('CAF'))}</b> · ∠DAG = 90° − {d(g('DAG'))} = <b>{d(vert('DAG'))}</b>
              {three && (
                <>
                  {' '}
                  · ∠EAH = 90° − {d(g('EAH'))} = <b>{d(vert('EAH'))}</b>
                </>
              )}
            </Step>
          )}
          <Step t="ΔABC horizontal triangle">
            ∠BAC = ∠BAD + ∠CAD = {three ? `(∠BAE + ∠DAE) + ∠CAD = (${d(g('BAE'))} + ${d(g('DAE'))}) + ${d(g('CAD'))}` : `${d(g('BAD'))} + ${d(g('CAD'))}`} = <b>{d(r.BAC)}</b>
            <br />
            ∠ACB = 180° − ∠ABC − ∠BAC = 180° − {d(g('ABC'))} − {d(r.BAC)} = <b>{d(r.ACB)}</b>
            <br />
            AC = AB/sin∠ACB × sin∠ABC = {data.AB}/sin {d(r.ACB)} × sin {d(g('ABC'))} = <b>{m(r.AC)}</b> m
            <br />
            BC = AB/sin∠ACB × sin∠BAC = <b>{m(r.BC)}</b> m
          </Step>
          <Step t="ΔACF vertical triangle">
            CF = AC tan∠CAF = {m(r.AC)} × tan {d(vert('CAF'))} = <b>{m(r.CF)}</b> m
          </Step>
          <Step t="ΔABD horizontal triangle">
            {three && (
              <>
                ∠BAD = ∠BAE + ∠DAE = <b>{d(tri!.BAD)}</b> ·{' '}
              </>
            )}
            ∠ABD = ∠ABC + ∠CBD = {d(g('ABC'))} + {d(g('CBD'))} = <b>{d(r.ABD)}</b>
            <br />
            ∠ADB = 180° − ∠ABD − ∠BAD = <b>{d(r.ADB)}</b>
            <br />
            AD = AB/sin∠ADB × sin∠ABD = <b>{m(r.AD)}</b> m · BD = AB/sin∠ADB × sin∠BAD = <b>{m(r.BD)}</b> m
          </Step>
          <Step t="ΔADG vertical triangle">
            DG = AD tan∠DAG = {m(r.AD)} × tan {d(vert('DAG'))} = <b>{m(r.DG)}</b> m
          </Step>
          {tri && (
            <>
              <Step t="ΔABE horizontal triangle">
                ∠ABE = ∠ABC + ∠CBD + ∠DBE = <b>{d(tri.ABE)}</b> · ∠AEB = 180° − ∠ABE − ∠BAE = <b>{d(tri.AEB)}</b>
                <br />
                AE = AB/sin∠AEB × sin∠ABE = <b>{m(tri.AE)}</b> m · BE = AB/sin∠AEB × sin∠BAE = <b>{m(tri.BE)}</b> m
              </Step>
              <Step t="ΔAEH vertical triangle">
                EH = AE tan∠EAH = {m(tri.AE)} × tan {d(vert('EAH'))} = <b>{m(tri.EH)}</b> m
              </Step>
            </>
          )}
          <Step t="ΔACD horizontal triangle">
            CD = √(AC² + AD² − 2·AC·AD·cos∠CAD) = <b>{m(r.CD)}</b> m · check from ΔBCD: √(BC² + BD² − 2·BC·BD·cos∠CBD) = <span className={Math.abs(r.CD - r.CDb) < 0.01 * Math.max(1, r.CD) ? 'text-good' : 'text-bad'}>{m(r.CDb)}</span> m
          </Step>
          {tri && (
            <>
              <Step t="ΔADE horizontal triangle">
                DE = √(AD² + AE² − 2·AD·AE·cos∠DAE) = <b>{m(tri.DE)}</b> m · check from ΔBDE: <span className={Math.abs(tri.DE - tri.DEb) < 0.01 * Math.max(1, tri.DE) ? 'text-good' : 'text-bad'}>{m(tri.DEb)}</span> m
              </Step>
              <Step t="ΔACE horizontal triangle">
                ∠CAE = ∠CAD + ∠DAE = {d(tri.CAE)} · CE = √(AC² + AE² − 2·AC·AE·cos∠CAE) = <b>{m(tri.CE)}</b> m · check from ΔBCE (∠CBE = {d(tri.CBE)}): <span className={Math.abs(tri.CE - tri.CEb) < 0.01 * Math.max(1, tri.CE) ? 'text-good' : 'text-bad'}>{m(tri.CEb)}</span> m
              </Step>
            </>
          )}
          {!tri ? (
            <Step t="Aerial distance">
              E is on the taller pole at the other top’s level, so EG = CD and EF = |CF − DG|: FG = √(EG² + EF²) = √(CD² + (CF − DG)²) = √({fx(r.CD, 3)}² + ({fx(r.CF, 3)} − {fx(r.DG, 3)})²) = <b className="text-accent text-base">{m(r.FG)} m</b>
            </Step>
          ) : (
            <Step t="Sides of the space triangle and its area">
              a = FG = √(CD² + (DG − CF)²) = <b>{m(tri.FG)}</b> m
              <br />b = GH = √(DE² + (DG − EH)²) = <b>{m(tri.GH)}</b> m
              <br />c = FH = √(CE² + (CF − EH)²) = <b>{m(tri.FH)}</b> m
              <br />s = (a + b + c)/2 = {m(tri.s)} m · Area ΔFGH = √(s(s − a)(s − b)(s − c)) = <b className="text-accent text-base">{fx(tri.area, 2)} m²</b>
            </Step>
          )}
          {hi > 0 && (
            <div className="text-xs text-mute">
              Heights above the ground at A (+ {hi} m instrument): F {fx(r.CF + hi, 2)} m · G {fx(r.DG + hi, 2)} m{tri && ` · H ${fx(tri.EH + hi, 2)} m`}
            </div>
          )}
        </div>
      )}

      {r && <PlanToScale AB={AB} r={r} three={three} g={g} />}
    </div>
  )
}

function Step({ t, children }: { t: string; children: ReactNode }) {
  return (
    <div className="space-y-0.5">
      <div className="font-semibold">{t}</div>
      <div className="num text-xs leading-relaxed">{children}</div>
    </div>
  )
}

// ── the manual's figure, labelled with this sheet's numbers ─────────────────────────────────

type Sol = ReturnType<typeof aerialFG> & Partial<ReturnType<typeof spaceFGH>>

/** pole heights in px: tallest 150, others in proportion (never under 60 so the letters fit) */
function poleHeights(hs: number[], fallback: number[]) {
  const ok = hs.every((h) => isFinite(h) && h > 0)
  const v = ok ? hs : fallback
  const mx = Math.max(...v)
  return v.map((h) => Math.max(60, (150 * h) / mx))
}

function ManualFig({ three, r, AB, hi }: { three: boolean; r: Sol | null; AB: number; hi: number }) {
  const ink = 'var(--c-ink)'
  const acc = 'var(--c-accent)'
  const mute = 'var(--c-mute)'
  const L = (x: number, y: number, t: string, o: { a?: 'start' | 'middle' | 'end'; c?: string; s?: number; w?: number } = {}) => (
    <text x={x} y={y} textAnchor={o.a ?? 'middle'} fontSize={o.s ?? 13} fontWeight={o.w ?? 700} fill={o.c ?? ink}>
      {t}
    </text>
  )
  const val = (v: number | undefined) => (v != null && isFinite(v) ? fx(v, 2) + ' m' : '')
  const pole = (x: number, y: number, h: number) => (
    <g>
      <rect x={x - 2.5} y={y - h} width="5" height={h + 14} fill="var(--c-panel2)" stroke={ink} strokeWidth="1" />
      <rect x={x - 12} y={y + 14} width="24" height="4" fill={ink} opacity="0.7" />
    </g>
  )
  /** horizontal from the shorter top to the taller pole, with the manual's letter */
  const level = (p: { x: number; top: number; h: number }, q: { x: number; top: number; h: number }, letter: string) => {
    const [tall, short] = p.h >= q.h ? [p, q] : [q, p]
    return (
      <g>
        <line x1={short.x} y1={short.top} x2={tall.x} y2={short.top} stroke={mute} strokeDasharray="2 3" />
        <circle cx={tall.x} cy={short.top} r="2" fill={ink} />
        {L(tall.x + (tall.x < short.x ? -10 : 10), short.top + 4, letter, { a: tall.x < short.x ? 'end' : 'start', s: 12 })}
      </g>
    )
  }
  const dash = '7 3 2 3'

  if (!three) {
    const A = { x: 200, y: 330 },
      B = { x: 450, y: 338 },
      C = { x: 100, y: 222 },
      D = { x: 545, y: 226 }
    const [hF, hG] = poleHeights([r?.CF ?? NaN, r?.DG ?? NaN], [1.6, 1])
    const F = { x: C.x, top: C.y - hF, h: hF },
      G = { x: D.x, top: D.y - hG, h: hG }
    return (
      <figure className="space-y-1">
        <svg viewBox="0 0 640 380" className="w-full h-auto rounded-xl border border-line bg-bg" role="img" aria-label="Aerial distance figure from the lecture sheet">
          <path d={`M${A.x} ${A.y} L${B.x} ${B.y} L${D.x} ${D.y} L${C.x} ${C.y} Z`} fill={acc} fillOpacity="0.14" stroke={ink} strokeWidth="1.4" />
          <line x1={A.x} y1={A.y} x2={D.x} y2={D.y} stroke={mute} strokeWidth="0.9" />
          <line x1={B.x} y1={B.y} x2={C.x} y2={C.y} stroke={mute} strokeWidth="0.9" />
          {pole(C.x, C.y, hF)}
          {pole(D.x, D.y, hG)}
          {level(F, G, 'E')}
          <line x1={A.x} y1={A.y} x2={F.x} y2={F.top} stroke={mute} strokeDasharray={dash} />
          <line x1={A.x} y1={A.y} x2={G.x} y2={G.top} stroke={mute} strokeDasharray={dash} />
          <line x1={F.x} y1={F.top} x2={G.x} y2={G.top} stroke={acc} strokeWidth="2.4" />
          {L(F.x - 10, F.top + 4, 'F', { a: 'end' })}
          {L(G.x + 10, G.top + 4, 'G', { a: 'start' })}
          {L(C.x - 10, C.y + 4, 'C', { a: 'end' })}
          {L(D.x + 10, D.y + 4, 'D', { a: 'start' })}
          {L(A.x - 6, A.y + 18, 'A', { a: 'end' })}
          {L(B.x + 6, B.y + 18, 'B', { a: 'start' })}
          <line x1={A.x} y1={A.y + 26} x2={B.x} y2={B.y + 26} stroke={ink} strokeWidth="0.9" markerStart="url(#hArr)" markerEnd="url(#hArr)" />
          {L((A.x + B.x) / 2, (A.y + B.y) / 2 + 42, AB > 0 ? `AB = ${AB} m` : 'AB', { w: 600, s: 12 })}
          {r && (
            <g>
              {L(C.x - 10, C.y - 20, `CF ${val(r.CF)}`, { a: 'end', s: 11, w: 500, c: mute })}
              {L(D.x + 10, D.y - 20, `DG ${val(r.DG)}`, { a: 'start', s: 11, w: 500, c: mute })}
              {L((C.x + D.x) / 2, (C.y + D.y) / 2 - 6, `CD = ${val(r.CD)}`, { s: 11, w: 500, c: mute })}
              {L((F.x + G.x) / 2, (F.top + G.top) / 2 - 10, `FG = ${val(r.FG)}`, { s: 13, c: acc })}
            </g>
          )}
          <defs>
            <marker id="hArr" viewBox="0 0 8 8" refX="4" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0 L8 4 L0 8 Z" fill={ink} />
            </marker>
          </defs>
        </svg>
        <figcaption className="text-[11px] text-faint">Lecture sheet’s figure (p 016), not to scale. Dash-dot: lines of sight from A; E is on the taller pole at the other top’s level{hi > 0 ? '; heights are above A’s line of sight' : ''}.</figcaption>
      </figure>
    )
  }

  const A = { x: 215, y: 340 },
    B = { x: 445, y: 340 },
    C = { x: 105, y: 248 },
    D = { x: 330, y: 212 },
    E = { x: 548, y: 270 }
  const [hF, hG, hH] = poleHeights([r?.CF ?? NaN, r?.DG ?? NaN, r?.EH ?? NaN], [1.35, 1.75, 1])
  const F = { x: C.x, top: C.y - hF, h: hF },
    G = { x: D.x, top: D.y - hG, h: hG },
    H = { x: E.x, top: E.y - hH, h: hH }
  return (
    <figure className="space-y-1">
      <svg viewBox="0 0 640 390" className="w-full h-auto rounded-xl border border-line bg-bg" role="img" aria-label="Space triangle figure from the lecture sheet">
        <path d={`M${A.x} ${A.y} L${B.x} ${B.y} L${E.x} ${E.y} L${D.x} ${D.y} L${C.x} ${C.y} Z`} fill={acc} fillOpacity="0.14" stroke={ink} strokeWidth="1.4" />
        {[
          [A, D],
          [A, E],
          [B, C],
          [B, D],
          [C, E],
        ].map(([p, q], i) => (
          <line key={i} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={mute} strokeWidth="0.8" />
        ))}
        {pole(C.x, C.y, hF)}
        {pole(D.x, D.y, hG)}
        {pole(E.x, E.y, hH)}
        <path d={`M${F.x} ${F.top} L${G.x} ${G.top} L${H.x} ${H.top} Z`} fill={acc} fillOpacity="0.3" stroke={acc} strokeWidth="2.2" />
        {level(F, H, 'I')}
        {level(F, G, 'J')}
        {level(G, H, 'K')}
        {[F, G, H].map((p, i) => (
          <line key={i} x1={A.x} y1={A.y} x2={p.x} y2={p.top} stroke={mute} strokeDasharray={dash} />
        ))}
        {L(F.x - 10, F.top + 4, 'F', { a: 'end' })}
        {L(G.x, G.top - 8, 'G')}
        {L(H.x + 10, H.top + 4, 'H', { a: 'start' })}
        {L(C.x - 10, C.y + 4, 'C', { a: 'end' })}
        {L(D.x + 9, D.y + 14, 'D', { a: 'start' })}
        {L(E.x + 10, E.y + 4, 'E', { a: 'start' })}
        {L(A.x - 6, A.y + 18, 'A', { a: 'end' })}
        {L(B.x + 6, B.y + 18, 'B', { a: 'start' })}
        <line x1={A.x} y1={A.y + 26} x2={B.x} y2={B.y + 26} stroke={ink} strokeWidth="0.9" markerStart="url(#tArr)" markerEnd="url(#tArr)" />
        {L((A.x + B.x) / 2, A.y + 42, AB > 0 ? `AB = ${AB} m` : 'AB', { w: 600, s: 12 })}
        {r && (
          <g>
            {L((F.x + G.x) / 2 - 6, (F.top + G.top) / 2 - 8, `FG ${val(r.FG)}`, { a: 'end', s: 11, c: acc })}
            {L((G.x + H.x) / 2 + 6, (G.top + H.top) / 2 - 8, `GH ${val(r.GH)}`, { a: 'start', s: 11, c: acc })}
            {L(F.x - 10, F.top + 18, `CF ${val(r.CF)}`, { a: 'end', s: 11, w: 500, c: mute })}
            {L(H.x + 10, H.top + 18, `EH ${val(r.EH)}`, { a: 'start', s: 11, w: 500, c: mute })}
            {L(G.x + 10, G.top + 4, `DG ${val(r.DG)}`, { a: 'start', s: 11, w: 500, c: mute })}
            {r.area != null && L(320, 24, `FH ${val(r.FH)} · area FGH = ${fx(r.area, 2)} m²`, { s: 12, c: acc })}
          </g>
        )}
        <defs>
          <marker id="tArr" viewBox="0 0 8 8" refX="4" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L8 4 L0 8 Z" fill={ink} />
          </marker>
        </defs>
      </svg>
      <figcaption className="text-[11px] text-faint">Lecture sheet’s figure (p 020), not to scale. Dash-dot: lines of sight from A; I, J, K are on the taller pole of each pair at the other top’s level.</figcaption>
    </figure>
  )
}

/** the feet plotted to scale from the computed distances (A at the origin, AB along the page) */
function PlanToScale({ AB, r, three, g }: { AB: number; r: Sol; three: boolean; g: (k: AngKey) => number }) {
  const RADm = Math.PI / 180
  const at = (len: number, ang: number) => ({ e: len * Math.cos(ang * RADm), n: len * Math.sin(ang * RADm) })
  const BAD = three ? (r.BAD ?? NaN) : g('BAD')
  const feet: { k: string; p: { e: number; n: number } }[] = [
    { k: 'C', p: at(r.AC, r.BAC) },
    { k: 'D', p: at(r.AD, BAD) },
  ]
  if (three && r.AE != null) feet.push({ k: 'E', p: at(r.AE, g('BAE')) })
  const pts = [{ e: 0, n: 0 }, { e: AB, n: 0 }, ...feet.map((f) => f.p)]
  return (
    <details className="text-sm" open={false}>
      <summary className="cursor-pointer text-xs text-mute font-semibold">Plan to scale (check the angles make the figure you saw)</summary>
      <div className="mt-2">
        <PlanFrame north={false} pts={pts} unit="m" height={320}>
          {({ X, Y }) => (
            <g>
              <path d={'M' + [{ e: 0, n: 0 }, { e: AB, n: 0 }, ...[...feet].reverse().map((f) => f.p)].map((p) => `${X(p.e)} ${Y(p.n)}`).join(' L') + ' Z'} fill="var(--c-accent)" fillOpacity="0.08" stroke="var(--c-line)" />
              {feet.map((f) => (
                <g key={f.k}>
                  <line x1={X(0)} y1={Y(0)} x2={X(f.p.e)} y2={Y(f.p.n)} stroke="var(--c-line)" />
                  <line x1={X(AB)} y1={Y(0)} x2={X(f.p.e)} y2={Y(f.p.n)} stroke="var(--c-line)" />
                  <rect x={X(f.p.e) - 4} y={Y(f.p.n) - 4} width="8" height="8" fill="var(--c-accent)" opacity="0.8" />
                  <text x={X(f.p.e) + 7} y={Y(f.p.n) - 5} fontSize="11" fontWeight="700" fill="var(--c-ink)">
                    {f.k}
                  </text>
                </g>
              ))}
              <line x1={X(0)} y1={Y(0)} x2={X(AB)} y2={Y(0)} stroke="var(--c-ink)" strokeWidth="1.8" />
              <Station x={X(0)} y={Y(0)} label="A" />
              <Station x={X(AB)} y={Y(0)} label="B" />
            </g>
          )}
        </PlanFrame>
      </div>
    </details>
  )
}

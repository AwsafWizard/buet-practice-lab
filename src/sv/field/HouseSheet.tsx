// House setting by the centre-line method: grid of wall / column centre lines from the supplied plan →
// pegs for every column centre, footing-pit corners, trench edges, and the diagonals that prove the layout square.
import { useMemo } from 'react'
import { Check, Field, Grid, type Row } from './Grid'

export interface HouseData {
  xs: Row[]
  ys: Row[]
  /** square footing size (ft-in) */
  footing: string
  /** wall trench width (ft-in) */
  trench: string
  plinth: string
}

/** "14'-10\"", "14-10", "14 10", "14.83", "5'4" → feet */
export function parseFtIn(s: string | undefined): number {
  if (!s) return NaN
  const t = s.trim().replace(/[″"]/g, '"').replace(/[′’']/g, "'")
  if (!t) return NaN
  const m = t.match(/^(-?\d+(?:\.\d+)?)\s*'?\s*[-\s]?\s*(\d+(?:\.\d+)?)?\s*"?$/)
  if (m && (t.includes("'") || t.includes('-') || t.includes(' '))) return Number(m[1]) + (m[2] ? Number(m[2]) / 12 : 0)
  if (/^\d+(\.\d+)?"$/.test(t)) return Number(t.slice(0, -1)) / 12
  const v = Number(t)
  return isFinite(v) ? v : NaN
}

/** feet → 14′-10″ (to the nearest ⅛″) */
export function fmtFtIn(ft: number): string {
  if (!isFinite(ft)) return '—'
  const neg = ft < 0
  let inches = Math.round(Math.abs(ft) * 12 * 8) / 8
  const f = Math.floor(inches / 12)
  inches -= f * 12
  const whole = Math.floor(inches)
  const frac = inches - whole
  const fr = frac ? ' ' + ({ 0.125: '⅛', 0.25: '¼', 0.375: '⅜', 0.5: '½', 0.625: '⅝', 0.75: '¾', 0.875: '⅞' } as Record<number, string>)[frac] : ''
  return `${neg ? '−' : ''}${f}′-${whole}${fr}″`
}

export const houseBlank = (): HouseData => ({ xs: [{ g: 'A' }, { g: 'B', s: '' }], ys: [{ g: '1' }, { g: '2', s: '' }], footing: '', trench: '', plinth: '' })

/** this year's plan (lecture sheet): A–B 14′-10″, B–C 18′-10″; 1–2 13′-10″, 2–3 15′-10″; F1 5′-4″ square */
export const houseSample = (): HouseData => ({
  xs: [{ g: 'A' }, { g: 'B', s: "14'-10\"" }, { g: 'C', s: "18'-10\"" }],
  ys: [{ g: '1' }, { g: '2', s: "13'-10\"" }, { g: '3', s: "15'-10\"" }],
  footing: "5'-4\"",
  trench: "1'-6\"",
  plinth: '1.5',
})

export function HouseSheet({ data, set }: { data: HouseData; set: (d: HouseData) => void }) {
  const geo = useMemo(() => {
    const cum = (rows: Row[]) => {
      const out: { g: string; at: number }[] = []
      rows.forEach((r, i) => {
        const s = i === 0 ? 0 : parseFtIn(r.s)
        out.push({ g: r.g || String(i + 1), at: i === 0 ? 0 : out[i - 1].at + s })
      })
      return out
    }
    const X = cum(data.xs)
    const Y = cum(data.ys)
    const ok = [...X, ...Y].every((p) => isFinite(p.at))
    return { X, Y, ok }
  }, [data.xs, data.ys])
  const F = parseFtIn(data.footing)
  const tw = parseFtIn(data.trench)
  const W = geo.X[geo.X.length - 1]?.at ?? 0
  const Hh = geo.Y[geo.Y.length - 1]?.at ?? 0
  const diag = Math.hypot(W, Hh)

  return (
    <div className="space-y-5">
      <p className="text-xs text-mute">
        Grid lines are the centre lines of the walls / columns on the supplied plan. Spacings as <span className="num">14'-10"</span>, <span className="num">14-10</span> or decimal feet. Origin = the first grid in each direction (e.g. A1); x along the letters, y along the numbers.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="font-bold text-sm mb-1">Grids along x (A, B, C …)</div>
          <Grid rows={data.xs} onChange={(xs) => set({ ...data, xs })} minRows={2} newRow={(p) => ({ g: p?.g ? String.fromCharCode(p.g.charCodeAt(0) + 1) : '' })} cols={[{ key: 'g', label: 'Grid', w: '3rem', type: 'text' }, { key: 's', label: 'Spacing from previous', w: '7rem', type: 'text' }]} outs={[{ label: 'from first', cell: (i) => fmtFtIn(geo.X[i]?.at) }]} />
        </div>
        <div>
          <div className="font-bold text-sm mb-1">Grids along y (1, 2, 3 …)</div>
          <Grid rows={data.ys} onChange={(ys) => set({ ...data, ys })} minRows={2} newRow={(p) => ({ g: p?.g ? String(Number(p.g) + 1) : '' })} cols={[{ key: 'g', label: 'Grid', w: '3rem', type: 'text' }, { key: 's', label: 'Spacing from previous', w: '7rem', type: 'text' }]} outs={[{ label: 'from first', cell: (i) => fmtFtIn(geo.Y[i]?.at) }]} />
        </div>
      </div>
      <div className="flex flex-wrap gap-4 items-end">
        <Field label="Footing (square) size" type="text" value={data.footing} onChange={(v) => set({ ...data, footing: v })} w="6rem" ph={'5\'-4"'} hint={isFinite(F) ? `${(F * 12).toFixed(1)} in` : ''} />
        <Field label="Wall trench width" type="text" value={data.trench} onChange={(v) => set({ ...data, trench: v })} w="6rem" ph={'1\'-6"'} hint="as given / decided in class" />
        <Field label="Plinth above GL (ft)" value={data.plinth} onChange={(v) => set({ ...data, plinth: v })} w="5rem" hint="for the level pegs on the centre line" />
      </div>

      {geo.ok && W > 0 && Hh > 0 && (
        <>
          <div className="card p-4 space-y-1 text-sm">
            <div className="font-bold">Squaring checks (measure these on the ground)</div>
            <Check ok>
              Outer diagonals {geo.X[0].g}
              {geo.Y[0].g}–{geo.X[geo.X.length - 1].g}
              {geo.Y[geo.Y.length - 1].g} = {geo.X[geo.X.length - 1].g}
              {geo.Y[0].g}–{geo.X[0].g}
              {geo.Y[geo.Y.length - 1].g} = √({fmtFtIn(W)}² + {fmtFtIn(Hh)}²) = <b className="num">{fmtFtIn(diag)}</b> ({diag.toFixed(3)} ft). Both must be equal — if not, the corners are not 90°.
            </Check>
            {geo.X.slice(1).map((x, i) =>
              geo.Y.slice(1).map((y, j) => {
                const dx = x.at - geo.X[i].at,
                  dy = y.at - geo.Y[j].at
                return (
                  <div key={`${i}-${j}`} className="text-xs text-mute num">
                    Bay {geo.X[i].g}–{x.g} × {geo.Y[j].g}–{y.g}: diagonal {fmtFtIn(Math.hypot(dx, dy))}
                  </div>
                )
              }),
            )}
            <div className="text-xs text-mute">3-4-5 check for a corner: 3 ft along one line, 4 ft along the other — the tape between the marks must read exactly 5 ft (or 6-8-10).</div>
          </div>

          <div className="overflow-x-auto">
            <div className="font-bold text-sm mb-1">Column / footing pegs (from {geo.X[0].g}{geo.Y[0].g})</div>
            <table className="sv-grid text-sm border-separate border-spacing-0">
              <thead>
                <tr>
                  <th>Column</th>
                  <th>x</th>
                  <th>y</th>
                  {isFinite(F) && <th className="out">pit corners x</th>}
                  {isFinite(F) && <th className="out">pit corners y</th>}
                </tr>
              </thead>
              <tbody>
                {geo.Y.flatMap((y) =>
                  geo.X.map((x) => (
                    <tr key={x.g + y.g}>
                      <td className="px-2 font-bold">
                        {x.g}
                        {y.g}
                      </td>
                      <td className="px-2 num">{fmtFtIn(x.at)}</td>
                      <td className="px-2 num">{fmtFtIn(y.at)}</td>
                      {isFinite(F) && (
                        <td className="out">
                          {fmtFtIn(x.at - F / 2)} / {fmtFtIn(x.at + F / 2)}
                        </td>
                      )}
                      {isFinite(F) && (
                        <td className="out">
                          {fmtFtIn(y.at - F / 2)} / {fmtFtIn(y.at + F / 2)}
                        </td>
                      )}
                    </tr>
                  )),
                )}
              </tbody>
            </table>
            {isFinite(tw) && (
              <div className="text-xs text-mute mt-1">
                Wall trenches: two ropes {fmtFtIn(tw / 2)} either side of every centre line ({fmtFtIn(tw)} wide). Outer trench rectangle {fmtFtIn(W + tw)} × {fmtFtIn(Hh + tw)}, its corner at ({fmtFtIn(-tw / 2)}, {fmtFtIn(-tw / 2)}) from {geo.X[0].g}
                {geo.Y[0].g}.
              </div>
            )}
          </div>

          <HousePlan X={geo.X} Y={geo.Y} F={F} tw={tw} />
        </>
      )}
    </div>
  )
}

function HousePlan({ X, Y, F, tw }: { X: { g: string; at: number }[]; Y: { g: string; at: number }[]; F: number; tw: number }) {
  const W = X[X.length - 1].at,
    H = Y[Y.length - 1].at
  const m = Math.max(isFinite(F) ? F : 0, isFinite(tw) ? tw : 0) / 2 + 3
  const VW = 640
  const k = (VW - 60) / (W + 2 * m)
  const VH = (H + 2 * m) * k + 40
  const px = (x: number) => 30 + (x + m) * k
  const py = (y: number) => 20 + (y + m) * k
  return (
    <div>
      <div className="font-bold text-sm mb-1">Layout: centre lines (dash-dot), trench edges (dashed), footing pits (shaded)</div>
      <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full h-auto rounded-xl border border-line bg-bg">
        {isFinite(tw) &&
          [...X.map((x) => ({ v: true, at: x.at })), ...Y.map((y) => ({ v: false, at: y.at }))].map((l, i) =>
            l.v ? (
              <rect key={i} x={px(l.at - tw / 2)} y={py(-tw / 2)} width={tw * k} height={(H + tw) * k} fill="var(--c-soil)" opacity="0.35" />
            ) : (
              <rect key={i} x={px(-tw / 2)} y={py(l.at - tw / 2)} width={(W + tw) * k} height={tw * k} fill="var(--c-soil)" opacity="0.35" />
            ),
          )}
        {isFinite(F) && X.flatMap((x) => Y.map((y) => <rect key={x.g + y.g} x={px(x.at - F / 2)} y={py(y.at - F / 2)} width={F * k} height={F * k} fill="var(--c-accent)" fillOpacity="0.12" stroke="var(--c-accent)" strokeDasharray="4 3" />))}
        {X.map((x) => (
          <g key={x.g}>
            <line x1={px(x.at)} x2={px(x.at)} y1={py(-m + 1)} y2={py(H + m - 1)} stroke="var(--c-ink)" strokeDasharray="10 3 2 3" />
            <text x={px(x.at)} y={py(-m + 1) - 4} fontSize="12" fontWeight="700" textAnchor="middle" fill="var(--c-accent)">
              {x.g}
            </text>
          </g>
        ))}
        {Y.map((y) => (
          <g key={y.g}>
            <line x1={px(-m + 1)} x2={px(W + m - 1)} y1={py(y.at)} y2={py(y.at)} stroke="var(--c-ink)" strokeDasharray="10 3 2 3" />
            <text x={px(-m + 1) - 6} y={py(y.at) + 4} fontSize="12" fontWeight="700" textAnchor="end" fill="var(--c-accent)">
              {y.g}
            </text>
          </g>
        ))}
        <line x1={px(0)} y1={py(0)} x2={px(W)} y2={py(H)} stroke="var(--c-accent2)" strokeWidth="1.2" />
        <line x1={px(W)} y1={py(0)} x2={px(0)} y2={py(H)} stroke="var(--c-accent2)" strokeWidth="1.2" />
        {X.slice(1).map((x, i) => (
          <text key={'dx' + i} x={(px(X[i].at) + px(x.at)) / 2} y={py(H + m - 1) + 14} fontSize="10" textAnchor="middle" fill="var(--c-mute)">
            {fmtFtIn(x.at - X[i].at)}
          </text>
        ))}
      </svg>
    </div>
  )
}

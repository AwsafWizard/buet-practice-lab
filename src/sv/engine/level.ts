// Level book reduction: rise & fall and height-of-instrument (collimation) methods, with the book checks.
//
// One row = one staff point, written the way the level book is filled: a row has a BS (first sight of a
// set-up), an IS, an FS (last sight of a set-up), or FS + BS together on a change point.

export interface LevelRow {
  /** station / point label (BM, CP1, L1 …) */
  stn?: string
  /** chainage along the line (m) */
  ch?: number | null
  /** offset from the centre line, − left / + right (m) */
  off?: number | null
  bs?: number | null
  is?: number | null
  fs?: number | null
  remark?: string
}

export interface ReducedRow extends LevelRow {
  rise: number | null
  fall: number | null
  /** height of instrument (collimation) of the set-up this reading was taken from */
  hi: number | null
  rl: number | null
  /** set-up number (1, 2, …) the reading belongs to (a change point belongs to the old one for its FS) */
  setup: number
  /** adjusted RL when a closing BM is given */
  adj?: number | null
}

export interface LevelResult {
  rows: ReducedRow[]
  sumBS: number
  sumFS: number
  sumIS: number
  sumRise: number
  sumFall: number
  firstRL: number
  lastRL: number
  /** ΣBS − ΣFS */
  dBSFS: number
  /** ΣRise − ΣFall */
  dRF: number
  /** last RL − first RL */
  dRL: number
  /** arithmetic check holds (to 1 mm) */
  ok: boolean
  /** HI method check: ΣBS − ΣFS = last RL − first RL and Σ(HI × n) − ΣIS − ΣFS = ΣRL(except first) */
  hiCheck: { lhs: number; rhs: number; ok: boolean }
  setups: number
  /** set when a closing RL is known: computed − known (m) */
  misclosure?: number
  /** allowable for ordinary levelling, ±0.025√K m (K in km) — shown as a guide */
  errors: string[]
}

const num = (v: number | null | undefined): v is number => typeof v === 'number' && isFinite(v)

/** the reading that ends this row's comparison (FS, else IS) and the one the next row compares with (BS, else IS) */
const endOf = (r: LevelRow) => (num(r.fs) ? r.fs : num(r.is) ? r.is : null)
const startOf = (r: LevelRow) => (num(r.bs) ? r.bs : num(r.is) ? r.is : null)

/**
 * Reduce a level book. `firstRL` is the RL of the first row's point (the BM).
 * `closeRL`: the known RL of the last point (when the line closes on a BM) → misclosure and a
 * per-set-up adjustment (each set-up gets an equal share, accumulated).
 */
export function reduceLevels(input: LevelRow[], firstRL: number, closeRL?: number | null): LevelResult {
  const rows: ReducedRow[] = []
  const errors: string[] = []
  const src = input.filter((r) => num(r.bs) || num(r.is) || num(r.fs))
  let hi: number | null = null
  let setup = 0
  let prevStart: number | null = null
  let rl: number | null = null
  src.forEach((r, i) => {
    let rise: number | null = null
    let fall: number | null = null
    if (i === 0) {
      if (!num(r.bs)) errors.push('The first reading should be a back sight on the BM.')
      rl = firstRL
    } else {
      const end = endOf(r)
      if (prevStart === null || end === null) {
        errors.push(`Row ${i + 1}: needs an IS or FS (and the row before needs a BS or IS).`)
      } else {
        const d = prevStart - end
        if (d >= 0) rise = d
        else fall = -d
        rl = (rl ?? firstRL) + d
      }
    }
    // HI method
    let hiHere: number | null = hi
    if (i === 0) {
      setup = 1
      hi = firstRL + (r.bs ?? 0)
      hiHere = hi
    } else if (num(r.bs)) {
      // change point: FS from the old set-up, BS starts the new one
      hiHere = hi
      setup++
      if (!num(r.fs) && !num(r.is)) errors.push(`Row ${i + 1}: a BS after the first row must sit on a change point (needs its FS too).`)
      hi = (rl ?? 0) + r.bs
    }
    rows.push({ ...r, rise, fall, rl, hi: i === 0 ? hi : hiHere, setup: num(r.bs) && i > 0 ? setup - 1 : setup })
    prevStart = startOf(r)
  })
  const sum = (k: 'bs' | 'is' | 'fs') => src.reduce((s, r) => s + (num(r[k]) ? (r[k] as number) : 0), 0)
  const sumBS = sum('bs')
  const sumFS = sum('fs')
  const sumIS = sum('is')
  const sumRise = rows.reduce((s, r) => s + (r.rise ?? 0), 0)
  const sumFall = rows.reduce((s, r) => s + (r.fall ?? 0), 0)
  const lastRL = rows.length ? (rows[rows.length - 1].rl ?? firstRL) : firstRL
  const dBSFS = sumBS - sumFS
  const dRF = sumRise - sumFall
  const dRL = lastRL - firstRL
  const ok = rows.length > 1 && Math.abs(dBSFS - dRF) < 0.0005 && Math.abs(dRF - dRL) < 0.0005
  if (rows.length > 1 && !num(src[src.length - 1].fs)) errors.push('The last reading should be a fore sight (close the book on an FS).')

  // HI check: Σ over set-ups of HI × (number of IS + FS read from it) − ΣIS − ΣFS = Σ RL of every point but the first
  let lhs = 0
  rows.forEach((r, i) => {
    if (i === 0) return
    if (num(r.is) || num(r.fs)) lhs += r.hi ?? 0
  })
  lhs -= sumIS + sumFS
  const rhs = rows.slice(1).reduce((s, r) => s + (r.rl ?? 0), 0)
  const hiCheck = { lhs, rhs, ok: rows.length > 1 && Math.abs(lhs - rhs) < 0.001 }

  let misclosure: number | undefined
  if (num(closeRL) && rows.length > 1) {
    misclosure = lastRL - closeRL
    const nSet = setup
    // each set-up carries an equal share of the correction, accumulated along the line
    rows.forEach((r, i) => {
      const share = i === 0 ? 0 : r.setup
      r.adj = r.rl === null ? null : r.rl - (misclosure! * share) / nSet
    })
    rows[rows.length - 1].adj = closeRL
  }
  return { rows, sumBS, sumFS, sumIS, sumRise, sumFall, firstRL, lastRL, dBSFS, dRF, dRL, ok, hiCheck, setups: setup, misclosure, errors }
}

/** allowable closing error (m) for a line of `km` kilometres: ordinary levelling ±0.025√K, precise ±0.006√K */
export const allowableClosure = (km: number, kind: 'ordinary' | 'precise' = 'ordinary') => (kind === 'precise' ? 0.006 : 0.025) * Math.sqrt(Math.max(km, 0))

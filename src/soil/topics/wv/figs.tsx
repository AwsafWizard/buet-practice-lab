// Weight–volume figures: the live block diagram, the Dr gauge, and the step list renderer.
import { Tex } from '../../../components/ui'
import { DR_LAMBE, DR_SLIDE, nf, PERCENT_KEYS, PHASE_TEX, unitOf, type DrClass, type PhaseKey, type PhaseStep, type UnitSys } from '../../engine/phase'

const TXT = { fill: 'var(--c-ink)', fontSize: 11 } as const
const MUTE = { fill: 'var(--c-mute)', fontSize: 10 } as const

/** a value as shown on the diagram */
export function show(k: PhaseKey, v: number, u?: UnitSys) {
  if (!Number.isFinite(v)) return '?'
  if (PERCENT_KEYS.includes(k)) return `${nf(v * 100, 4)} %`
  const un = u ? unitOf(k, u) : ''
  return `${nf(v, 4)}${un ? ' ' + un : ''}`
}

/**
 * Block diagram drawn to scale by volume: air / water / solids, weights on the left, volumes on the right.
 * `known` = keys filled so far (others show "?"), `hot` = the block just filled.
 */
export function PhaseBlocks({ vals, known, hot, u, w = 460 }: { vals: Record<PhaseKey, number>; known: Set<PhaseKey>; hot?: PhaseKey; u?: UnitSys; w?: number }) {
  const top = 14
  const Htot = 220
  const V = vals.V
  const fr = (x: number) => (Number.isFinite(x) && V > 0 ? Math.max(0, x / V) : 1 / 3)
  let hA = fr(vals.Va) * Htot
  let hW = fr(vals.Vw) * Htot
  let hS = fr(vals.Vs) * Htot
  const min = 16
  // keep tiny blocks readable (not to scale below 16 px)
  const fix = (h: number) => (h > 0.5 && h < min ? min : h)
  hA = fix(hA)
  hW = fix(hW)
  hS = fix(hS)
  const sc = Htot / (hA + hW + hS || 1)
  hA *= sc
  hW *= sc
  hS *= sc
  const bx = 170
  const bw = 120
  const yA = top
  const yW = yA + hA
  const yS = yW + hW
  const yE = yS + hS
  const lab = (k: PhaseKey) => (known.has(k) ? show(k, vals[k], u) : '?')
  const col = (k: PhaseKey) => (k === hot ? 'var(--c-load)' : known.has(k) ? 'var(--c-ink)' : 'var(--c-faint)')
  const wt = (k: PhaseKey) => (k === hot ? 700 : 500)
  const row = (y: number, h: number, name: string, fill: string, Wk: PhaseKey | null, Vk: PhaseKey) =>
    h > 0.3 ? (
      <g key={name}>
        <rect x={bx} y={y} width={bw} height={h} fill={fill} stroke="var(--c-ink)" strokeWidth={1} />
        {h >= 12 && (
          <text x={bx + bw / 2} y={y + h / 2 + 4} textAnchor="middle" {...TXT}>
            {name}
          </text>
        )}
        <text x={bx - 10} y={y + h / 2 + 4} textAnchor="end" fontSize={11} fill={Wk ? col(Wk) : 'var(--c-mute)'} fontWeight={Wk ? wt(Wk) : 400}>
          {Wk ? `${Wk === 'Ws' ? 'Ws' : 'Ww'} = ${lab(Wk)}` : 'Wa ≈ 0'}
        </text>
        <text x={bx + bw + 10} y={y + h / 2 + 4} fontSize={11} fill={col(Vk)} fontWeight={wt(Vk)}>
          {`${Vk} = ${lab(Vk)}`}
        </text>
      </g>
    ) : null
  return (
    <svg viewBox="0 0 560 260" style={{ width: '100%', maxWidth: w }}>
      {row(yA, hA, 'Air', 'transparent', null, 'Va')}
      {row(yW, hW, 'Water', 'color-mix(in oklab, var(--c-water) 32%, transparent)', 'Ww', 'Vw')}
      {row(yS, hS, 'Solids', 'color-mix(in oklab, var(--c-soil) 72%, transparent)', 'Ws', 'Vs')}
      {hA <= 0.3 && (
        <text x={bx + bw + 10} y={yA - 2} {...MUTE}>
          Va = 0 (saturated)
        </text>
      )}
      {/* braces */}
      <path d={`M ${bx + bw + 150} ${yA} h 6 V ${yS} h -6`} fill="none" stroke={col('Vv')} />
      <text x={bx + bw + 160} y={(yA + yS) / 2 + 4} fontSize={11} fill={col('Vv')} fontWeight={wt('Vv')}>
        Vv = {lab('Vv')}
      </text>
      <path d={`M ${bx - 150} ${yW} h -6 V ${yE} h 6`} fill="none" stroke={col('W')} />
      <text x={bx - 162} y={(yW + yE) / 2 + 4} textAnchor="end" fontSize={11} fill={col('W')} fontWeight={wt('W')}>
        W = {lab('W')}
      </text>
      <line x1={bx} x2={bx + bw} y1={yE + 12} y2={yE + 12} stroke={col('V')} />
      <text x={bx + bw / 2} y={yE + 26} textAnchor="middle" fontSize={11} fill={col('V')} fontWeight={wt('V')}>
        V = {lab('V')}
      </text>
      {known.has('Gs') && (
        <text x={bx + bw / 2} y={yS + hS / 2 + 18} textAnchor="middle" {...MUTE}>
          Gs = {nf(vals.Gs, 4)}
        </text>
      )}
    </svg>
  )
}

/** the steps as tex lines; `upto` = how many are visible, the last visible one highlighted */
export function PhaseStepsView({ steps, upto, u }: { steps: PhaseStep[]; upto?: number; u?: UnitSys }) {
  const n = upto ?? steps.length
  return (
    <ol className="space-y-1 text-sm">
      {steps.slice(0, n).map((s, i) => (
        <li key={i} className={'flex gap-2 items-baseline rounded px-1 ' + (i === n - 1 && upto !== undefined ? 'bg-load/10' : '')}>
          <span className="chip !py-0 !text-[10px] shrink-0 w-14 justify-center">{s.kind}</span>
          <span className="overflow-x-auto">
            <Tex>{s.tex + (u && unitOf(s.key, u) && unitOf(s.key, u) !== '%' && s.kind !== 'basis' ? `\\ \\text{${unitOf(s.key, u)}}` : '')}</Tex>
            {s.note && <span className="text-xs text-faint ml-2">{s.note}</span>}
          </span>
        </li>
      ))}
    </ol>
  )
}

/** horizontal Dr gauge with the class bands */
export function DrGauge({ Dr, scale = 'slide', w = 460 }: { Dr: number; scale?: 'slide' | 'lambe'; w?: number }) {
  const S: DrClass[] = scale === 'slide' ? DR_SLIDE : DR_LAMBE
  const x0 = 20
  const W = 420
  const X = (p: number) => x0 + (Math.max(-5, Math.min(105, p)) / 100) * W
  const shades = [0.1, 0.22, 0.36, 0.52, 0.7]
  return (
    <svg viewBox="0 0 460 84" style={{ width: '100%', maxWidth: w }}>
      {S.map((c, i) => (
        <g key={c.label}>
          <rect x={X(c.lo)} y={20} width={X(c.hi) - X(c.lo)} height={22} fill={`color-mix(in oklab, var(--c-soil) ${shades[i] * 100}%, transparent)`} stroke="var(--c-line)" />
          <text x={(X(c.lo) + X(c.hi)) / 2} y={35} textAnchor="middle" fontSize={9.5} fill="var(--c-ink)">
            {c.label}
          </text>
          <text x={X(c.lo)} y={56} textAnchor="middle" {...MUTE}>
            {c.lo}
          </text>
        </g>
      ))}
      <text x={X(100)} y={56} textAnchor="middle" {...MUTE}>
        100
      </text>
      {scale === 'slide' && (
        <>
          <line x1={X(70)} x2={X(70)} y1={14} y2={46} stroke="var(--c-bad)" strokeWidth={2} />
          <text x={X(86)} y={72} textAnchor="middle" fontSize={9.5} fill="var(--c-bad)">
            good for EQ →
          </text>
        </>
      )}
      {Number.isFinite(Dr) && (
        <g>
          <polygon points={`${X(Dr)},18 ${X(Dr) - 6},6 ${X(Dr) + 6},6`} fill="var(--c-load)" />
          <text x={X(Dr)} y={80} textAnchor="middle" fontSize={10} fontWeight={700} fill="var(--c-load)">
            Dr = {nf(Dr, 3)} %
          </text>
        </g>
      )}
      <text x={X(0)} y={12} {...MUTE}>
        loose (e_max)
      </text>
      <text x={X(100)} y={12} textAnchor="end" {...MUTE}>
        dense (e_min)
      </text>
    </svg>
  )
}

export const keyTex = (k: PhaseKey) => PHASE_TEX[k]

// Labelled drawings of the CE 104 instruments. Each figure is plain SVG art plus a list of numbered parts
// (name + what it does). The auto level and the theodolite keep the lecture sheet's numbering (pp 7–8).
// Used three ways: the Learn tab's parts explorer, "name the part" quiz questions, and the quiz review.
import { useState, type ReactNode } from 'react'

export type FigId = 'chain' | 'kit' | 'osq' | 'pcomp' | 'ptable' | 'tripod' | 'alevel' | 'staff' | 'theo'

export interface Part {
  n: number
  name: string
  /** what it does, one sentence */
  does: string
  /** the point on the drawing */
  at: [number, number]
  /** where the number bubble sits */
  lab: [number, number]
}

export interface FigDef {
  id: FigId
  /** quiz index (stable: part of the generated question ids) */
  k: number
  title: string
  w: number
  h: number
  art: ReactNode
  parts: Part[]
  note?: string
}

const INK = 'var(--c-ink)'
const MUTE = 'var(--c-mute)'
const PANEL = 'var(--c-panel2)'
const BG = 'var(--c-bg)'
const BRASS = 'var(--c-load)'
const GLASS = 'var(--c-water)'
const RED = 'var(--c-bad)'

const sw = { stroke: INK, strokeWidth: 1.5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }

/* ------------------------------------------------------------------ chain */
const CY = 90
const Link = ({ a, b }: { a: number; b: number }) => (
  <g fill="none" {...sw}>
    <ellipse cx={a + 6} cy={CY} rx={6} ry={3.5} />
    <line x1={a + 12} x2={b - 12} y1={CY} y2={CY} strokeWidth={2.2} />
    <ellipse cx={b - 6} cy={CY} rx={6} ry={3.5} />
  </g>
)
const Rings = ({ x }: { x: number }) => (
  <g fill="none" {...sw}>
    <circle cx={x + 4} cy={CY} r={4.5} />
    <circle cx={x + 12} cy={CY} r={4.5} />
    <circle cx={x + 20} cy={CY} r={4.5} />
  </g>
)
function Tally({ x, y, k }: { x: number; y: number; k: number }) {
  if (k === 0)
    return (
      <g {...sw}>
        <line x1={x} x2={x} y1={y - 10} y2={y - 2} />
        <circle cx={x} cy={y + 6} r={8} fill={BRASS} fillOpacity={0.55} />
      </g>
    )
  const w = 16 / k
  return (
    <g {...sw}>
      <line x1={x} x2={x} y1={y - 10} y2={y} />
      <path d={`M${x - 8} ${y} H${x + 8} V${y + 7} ${Array.from({ length: k }, (_, i) => `L${x + 8 - (i + 0.5) * w} ${y + 15} L${x + 8 - (i + 1) * w} ${y + 7}`).join(' ')} Z`} fill={BRASS} fillOpacity={0.55} />
    </g>
  )
}
const Brk = ({ x }: { x: number }) => (
  <g stroke={MUTE} strokeWidth={1.4}>
    <line x1={x} x2={x + 8} y1={CY + 9} y2={CY - 9} />
    <line x1={x + 8} x2={x + 16} y1={CY + 9} y2={CY - 9} />
  </g>
)
const chainArt = (
  <g>
    {/* handle (outer edge = zero) and swivel */}
    <path d={`M46 72 L30 72 Q14 72 14 90 Q14 108 30 108 L46 108`} fill="none" stroke={BRASS} strokeWidth={5} strokeLinecap="round" />
    <path d={`M46 72 L30 72 Q14 72 14 90 Q14 108 30 108 L46 108`} fill="none" stroke={INK} strokeWidth={1} />
    <line x1={46} x2={46} y1={72} y2={108} stroke={INK} strokeWidth={2} />
    <line x1={46} x2={58} y1={CY} y2={CY} stroke={INK} strokeWidth={2.2} />
    <rect x={58} y={84} width={12} height={12} rx={2} fill={BRASS} fillOpacity={0.7} {...sw} />
    <line x1={70} x2={76} y1={CY} y2={CY} stroke={INK} strokeWidth={2.2} />
    <Link a={76} b={156} />
    <Rings x={156} />
    <Link a={180} b={260} />
    <Rings x={260} />
    <Brk x={290} />
    <Rings x={312} />
    <Tally x={324} y={104} k={1} />
    <Link a={336} b={416} />
    <Rings x={416} />
    <Brk x={446} />
    <Rings x={468} />
    <Tally x={480} y={104} k={0} />
    <Link a={492} b={572} />
    <line x1={578} x2={622} y1={CY} y2={CY} stroke={MUTE} strokeDasharray="3 4" strokeWidth={2} />
    {/* dimensions */}
    <g stroke={MUTE} strokeWidth={1} fill={MUTE} fontSize={10.5}>
      <line x1={14} x2={14} y1={30} y2={70} strokeDasharray="2 2" />
      <text x={18} y={34} stroke="none">
        chain length starts at the outer edge of the handle
      </text>
      <line x1={168} x2={272} y1={56} y2={56} />
      <line x1={168} x2={168} y1={50} y2={62} />
      <line x1={272} x2={272} y1={50} y2={62} />
      <text x={220} y={50} textAnchor="middle" stroke="none">
        1 link = 1 ft
      </text>
    </g>
    {/* the five tallies */}
    <text x={40} y={222} fontSize={11} fontWeight={700} fill={MUTE}>
      Tallies:
    </text>
    {[1, 2, 3, 4, 0].map((k, i) => (
      <g key={i}>
        <Tally x={150 + i * 80} y={210} k={k} />
        <text x={150 + i * 80} y={252} fontSize={10.5} textAnchor="middle" fill={MUTE}>
          {(i + 1) * 10} ft
        </text>
      </g>
    ))}
    <text x={310} y={274} fontSize={10.5} textAnchor="middle" fill={MUTE}>
      60, 70, 80, 90 ft carry 4, 3, 2, 1 teeth again (counted from the other handle)
    </text>
  </g>
)

/* ------------------------------------------------------------------ small kit */
const kitArt = (
  <g>
    {/* ranging rod */}
    {Array.from({ length: 8 }, (_, i) => (
      <rect key={i} x={65} y={30 + i * 27.5} width={10} height={27.5} fill={i % 2 ? BG : RED} fillOpacity={i % 2 ? 1 : 0.8} />
    ))}
    <rect x={65} y={30} width={10} height={220} fill="none" {...sw} />
    <path d="M65 250 L75 250 L70 280 Z" fill={MUTE} {...sw} />
    <path d="M75 32 L106 41 L75 51 Z" fill="var(--c-accent)" {...sw} />
    {/* arrow */}
    <circle cx={180} cy={92} r={9} fill="none" stroke={INK} strokeWidth={2} />
    <line x1={180} x2={180} y1={101} y2={258} stroke={INK} strokeWidth={2.4} />
    <path d="M177 256 L183 256 L180 268 Z" fill={INK} />
    <path d="M188 88 L214 80 L209 94 L216 104 L189 97 Z" fill={RED} fillOpacity={0.8} {...sw} />
    {/* wooden peg */}
    <path d="M266 170 L292 170 L292 236 L279 262 L266 236 Z" fill={BRASS} fillOpacity={0.35} {...sw} />
    <line x1={266} x2={292} y1={180} y2={180} stroke={MUTE} />
    {/* plumb bob */}
    <line x1={380} x2={380} y1={50} y2={180} stroke={INK} strokeWidth={1} />
    <rect x={374} y={180} width={12} height={8} rx={2} fill={BRASS} {...sw} />
    <path d="M369 188 L391 188 L380 230 Z" fill={BRASS} fillOpacity={0.7} {...sw} />
    <g stroke={MUTE} strokeWidth={1.2}>
      <line x1={372} x2={388} y1={246} y2={246} />
      <line x1={380} x2={380} y1={238} y2={254} />
    </g>
    {/* tape */}
    <circle cx={515} cy={155} r={42} fill={PANEL} {...sw} />
    <circle cx={515} cy={155} r={10} fill={BG} {...sw} />
    <line x1={515} x2={537} y1={155} y2={133} stroke={INK} strokeWidth={2.4} />
    <circle cx={540} cy={130} r={4.5} fill={BRASS} {...sw} />
    <rect x={515} y={192} width={95} height={10} fill={BRASS} fillOpacity={0.3} {...sw} />
    {Array.from({ length: 11 }, (_, i) => (
      <line key={i} x1={520 + i * 8.5} x2={520 + i * 8.5} y1={192} y2={i % 5 ? 196 : 199} stroke={INK} strokeWidth={0.8} />
    ))}
    <circle cx={617} cy={197} r={6.5} fill="none" stroke={BRASS} strokeWidth={2.5} />
  </g>
)

/* ------------------------------------------------------------------ optical square (plan, cut open) */
const osqArt = (
  <g>
    {/* the object and the far ranging rod */}
    <circle cx={360} cy={26} r={13} fill="var(--c-accent2)" fillOpacity={0.55} {...sw} />
    <line x1={360} x2={360} y1={39} y2={56} {...sw} />
    {Array.from({ length: 4 }, (_, i) => (
      <rect key={i} x={598} y={150 + i * 25} width={8} height={25} fill={i % 2 ? BG : RED} fillOpacity={i % 2 ? 1 : 0.8} />
    ))}
    <rect x={598} y={150} width={8} height={100} fill="none" {...sw} />
    {/* box */}
    <rect x={170} y={100} width={250} height={150} rx={14} fill={PANEL} {...sw} strokeWidth={2.2} />
    <rect x={342} y={96} width={36} height={8} fill={BG} />
    <rect x={416} y={186} width={8} height={28} fill={BG} />
    <rect x={166} y={196} width={8} height={8} fill={BG} />
    {/* rays */}
    <path d="M360 58 L360 140 L300 200 L178 200" fill="none" stroke="var(--c-accent)" strokeWidth={1.8} />
    <path d="M596 200 L300 200" fill="none" stroke={MUTE} strokeWidth={1.4} strokeDasharray="6 4" />
    <path d="M360 106 l-4.5 -9 h9 Z M330 170 L338.5 167.1 L332.9 161.5 Z M224 200 l9 -4.5 v9 Z" fill="var(--c-accent)" />
    {/* index glass (fully silvered) and horizon glass (half silvered) */}
    <line x1={351.6} y1={160.3} x2={368.4} y2={119.7} stroke={GLASS} strokeWidth={5} strokeLinecap="round" />
    <line x1={276.9} y1={209.6} x2={300} y2={200} stroke={GLASS} strokeWidth={5} strokeLinecap="round" />
    <line x1={300} y1={200} x2={323.1} y2={190.4} stroke={GLASS} strokeWidth={2} strokeDasharray="3 3" />
    {/* eye */}
    <ellipse cx={140} cy={200} rx={13} ry={7} fill={BG} {...sw} />
    <circle cx={146} cy={200} r={3} fill={INK} />
    <text x={300} y={292} fontSize={10.5} textAnchor="middle" fill={MUTE}>
      mirrors at 45° → the ray from the object is turned through 90°; image and ranging rod line up = perpendicular
    </text>
  </g>
)

/* ------------------------------------------------------------------ prismatic compass (side view) */
const ticks = Array.from({ length: 36 }, (_, i) => {
  const a = (i * 10 * Math.PI) / 180
  return <line key={i} x1={320 + 100 * Math.cos(a)} y1={190 + 27 * Math.sin(a)} x2={320 + 91 * Math.cos(a)} y2={190 + 24.5 * Math.sin(a)} stroke={MUTE} strokeWidth={1} />
})
const pcompArt = (
  <g>
    {/* stand */}
    <rect x={316} y={260} width={8} height={22} fill={PANEL} {...sw} />
    <circle cx={320} cy={289} r={7} fill={BRASS} fillOpacity={0.7} {...sw} />
    <path d="M320 296 L262 342 M320 296 L320 346 M320 296 L378 342" stroke={INK} strokeWidth={2.5} />
    {/* box */}
    <path d="M200 190 V226 A120 34 0 0 0 440 226 V190" fill={PANEL} {...sw} />
    <ellipse cx={320} cy={190} rx={120} ry={34} fill={BG} {...sw} />
    <ellipse cx={320} cy={190} rx={100} ry={27} fill="none" stroke={MUTE} />
    {ticks}
    <path d="M238 191 L320 185.5 L402 189 L320 194.5 Z" fill={RED} fillOpacity={0.6} {...sw} strokeWidth={1} />
    <circle cx={320} cy={190} r={2.5} fill={INK} />
    <circle cx={400} cy={236} r={4.5} fill={BRASS} {...sw} />
    {/* eye vane: slit, prism, focusing stud */}
    <rect x={194} y={100} width={12} height={92} fill={PANEL} {...sw} />
    <rect x={198.5} y={106} width={3} height={44} fill={BG} />
    <rect x={206} y={158} width={26} height={22} fill={GLASS} fillOpacity={0.25} {...sw} />
    <path d="M209 177 L229 177 L209 161 Z" fill="none" stroke={GLASS} strokeWidth={1.4} />
    <circle cx={189} cy={172} r={4.5} fill={BRASS} {...sw} />
    {/* object vane with the hair, mirror, lifting pin */}
    <rect x={432} y={60} width={16} height={126} fill="none" {...sw} strokeWidth={2} />
    <line x1={440} x2={440} y1={64} y2={182} stroke={INK} strokeWidth={0.8} />
    <circle cx={440} cy={190} r={3} fill={INK} />
    <path d="M450 120 L470 114 L470 150 L450 156 Z" fill={GLASS} fillOpacity={0.35} {...sw} />
    <rect x={452} y={196} width={6} height={14} fill={BRASS} {...sw} />
  </g>
)

/* ------------------------------------------------------------------ plane table */
const ptableArt = (
  <g>
    <line x1={120} x2={540} y1={318} y2={318} stroke={MUTE} strokeDasharray="5 4" />
    <g stroke={MUTE} strokeWidth={1.4}>
      <line x1={255} x2={269} y1={312} y2={312} />
      <line x1={262} x2={262} y1={305} y2={319} />
    </g>
    {/* tripod and head */}
    <path d="M305 184 L225 322 M320 184 L320 332 M335 184 L415 322" stroke={INK} strokeWidth={3} />
    <rect x={296} y={169} width={48} height={15} fill={PANEL} {...sw} />
    {/* board and sheet */}
    <path d="M100 160 L540 160 L540 169 L100 169 Z" fill="var(--c-soil)" {...sw} />
    <path d="M150 100 L490 100 L540 160 L100 160 Z" fill="var(--c-soil)" {...sw} />
    <path d="M175 107 L470 107 L510 152 L135 152 Z" fill={BG} stroke={MUTE} />
    {/* spirit level */}
    <rect x={145} y={125} width={40} height={8} rx={4} fill={GLASS} fillOpacity={0.25} {...sw} />
    <ellipse cx={165} cy={129} rx={5} ry={2.4} fill={BG} stroke={GLASS} />
    {/* trough compass */}
    <path d="M420 144 L500 138 L501 146 L421 152 Z" fill={PANEL} {...sw} />
    <line x1={430} x2={490} y1={147} y2={141.5} stroke={RED} strokeWidth={1.3} />
    {/* alidade: ruler (fiducial edge) + vanes */}
    <path d="M215 140 L400 126 L402 132 L217 146 Z" fill={BRASS} fillOpacity={0.55} {...sw} />
    <rect x={395} y={84} width={8} height={44} fill="none" {...sw} />
    <line x1={399} x2={399} y1={88} y2={124} stroke={INK} strokeWidth={0.8} />
    <rect x={209} y={100} width={8} height={42} fill={PANEL} {...sw} />
    <rect x={212} y={104} width={2} height={32} fill={BG} />
    {/* U-fork and plumb bob */}
    <path d="M262 148 L248 176 Q242 188 248 198 L262 206" fill="none" stroke={INK} strokeWidth={2.4} />
    <circle cx={262} cy={148} r={2} fill={INK} />
    <line x1={262} x2={262} y1={206} y2={282} stroke={INK} strokeWidth={1} />
    <path d="M255 282 L269 282 L262 300 Z" fill={BRASS} fillOpacity={0.7} {...sw} />
  </g>
)

/* ------------------------------------------------------------------ tripod */
const leg = (x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, o = 1) => (
  <g opacity={o}>
    <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={BRASS} strokeOpacity={0.55} strokeWidth={9} strokeLinecap="round" />
    <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={INK} strokeWidth={0.8} />
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={MUTE} strokeWidth={5} strokeLinecap="round" />
    <circle cx={x1} cy={y1} r={6} fill={BRASS} {...sw} />
  </g>
)
const tripodArt = (
  <g>
    <line x1={120} x2={520} y1={292} y2={292} stroke={MUTE} strokeDasharray="5 4" />
    {leg(320, 56, 320, 172, 320, 280, 0.45)}
    {leg(284, 56, 226, 170, 176, 272)}
    {leg(356, 56, 414, 170, 464, 272)}
    <path d="M176 272 L169 290 L180 274 Z M464 272 L471 290 L460 274 Z" fill={INK} />
    <path d="M168 266 L188 263 M472 266 L452 263" stroke={INK} strokeWidth={3} />
    <path d="M270 40 L370 40 L360 56 L280 56 Z" fill={PANEL} {...sw} />
    <rect x={314} y={56} width={12} height={20} fill={BRASS} {...sw} />
    <circle cx={320} cy={80} r={6} fill={BRASS} {...sw} />
    <line x1={414} x2={428} y1={170} y2={164} stroke={INK} strokeWidth={3} />
  </g>
)

/* ------------------------------------------------------------------ automatic level (lecture sheet Fig. 3.1 numbering) */
const knurl = (cx: number, cy: number, r: number, n = 16) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i * 2 * Math.PI) / n
    return <line key={i} x1={cx + r * Math.cos(a)} y1={cy + r * Math.sin(a)} x2={cx + (r - 3) * Math.cos(a)} y2={cy + (r - 3) * Math.sin(a)} stroke={INK} strokeWidth={0.8} />
  })
const alevelArt = (
  <g>
    {/* tripod head, centring screw */}
    <path d="M255 278 L200 336 M320 292 L320 338 M385 278 L440 336" stroke={INK} strokeWidth={3} />
    <path d="M235 262 L405 262 L392 278 L248 278 Z" fill={PANEL} {...sw} />
    <rect x={314} y={278} width={12} height={14} fill={BRASS} {...sw} />
    {/* base plate, foot screws, tribrach */}
    <rect x={220} y={250} width={200} height={12} fill={PANEL} {...sw} />
    <rect x={310} y={234} width={20} height={16} fill={BRASS} fillOpacity={0.35} {...sw} />
    <rect x={232} y={232} width={20} height={18} fill={BRASS} fillOpacity={0.7} {...sw} />
    <rect x={388} y={232} width={20} height={18} fill={BRASS} fillOpacity={0.7} {...sw} />
    <rect x={226} y={224} width={188} height={8} fill={PANEL} {...sw} />
    {/* horizontal circle ring */}
    <rect x={242} y={207} width={156} height={17} fill={BG} {...sw} />
    {Array.from({ length: 26 }, (_, i) => (
      <line key={i} x1={245 + i * 6} x2={245 + i * 6} y1={207} y2={i % 5 ? 211 : 214} stroke={INK} strokeWidth={0.8} />
    ))}
    {/* body */}
    <rect x={210} y={140} width={228} height={67} rx={16} fill={PANEL} {...sw} strokeWidth={1.8} />
    <ellipse cx={440} cy={172} rx={6} ry={22} fill={GLASS} fillOpacity={0.35} {...sw} />
    <rect x={186} y={158} width={24} height={28} fill={PANEL} {...sw} />
    {[192, 198, 204].map((x) => (
      <line key={x} x1={x} x2={x} y1={158} y2={186} stroke={INK} strokeWidth={0.8} />
    ))}
    <ellipse cx={186} cy={172} rx={4} ry={14} fill={GLASS} fillOpacity={0.3} {...sw} />
    <rect x={210} y={152} width={12} height={40} rx={3} fill={BRASS} fillOpacity={0.45} {...sw} />
    {/* reflector over the circular level, its adjusting screw */}
    <line x1={247} x2={247} y1={139} y2={146} stroke={INK} />
    <path d="M233 128 L259 124 L262 136 L236 140 Z" fill={GLASS} fillOpacity={0.35} {...sw} />
    <ellipse cx={247} cy={150} rx={11} ry={4} fill={BG} {...sw} />
    <circle cx={247} cy={150} r={1.8} fill={GLASS} />
    <circle cx={264} cy={152} r={2.5} fill={INK} />
    {/* peep sight */}
    <path d="M300 140 L332 140 L316 126 Z" fill="none" {...sw} />
    <line x1={316} x2={316} y1={126} y2={133} stroke={INK} />
    {/* focusing knob, circle window, fine motion */}
    <circle cx={360} cy={170} r={14} fill={PANEL} {...sw} />
    {knurl(360, 170, 14)}
    <circle cx={360} cy={170} r={5} fill={BG} {...sw} />
    <rect x={392} y={195} width={16} height={8} fill={BG} {...sw} />
    <circle cx={414} cy={216} r={7.5} fill={BRASS} {...sw} />
    {knurl(414, 216, 7.5, 10)}
  </g>
)

/* ------------------------------------------------------------------ staff and the view through the telescope */
const SY = 318
const staffArt = (
  <g>
    <defs>
      <clipPath id="sv-reticle">
        <circle cx={440} cy={170} r={118} />
      </clipPath>
    </defs>
    {/* staff, 1.000 m at the bottom of the drawing up to 1.500 m */}
    <rect x={110} y={20} width={60} height={298} fill={BG} />
    {Array.from({ length: 99 }, (_, i) => (i % 2 === 0 ? <rect key={i} x={110} y={SY - (i + 1) * 3} width={30} height={3} fill={INK} /> : null))}
    {Array.from({ length: 5 }, (_, d) => (
      <g key={d}>
        <line x1={110} x2={170} y1={SY - d * 60} y2={SY - d * 60} stroke={INK} strokeWidth={1} />
        <text x={156} y={SY - d * 60 - 6} fontSize={13} fontWeight={700} textAnchor="middle" fill={d === 0 ? RED : INK}>
          {(1 + d / 10).toFixed(1)}
        </text>
      </g>
    ))}
    <rect x={110} y={20} width={60} height={298} fill="none" {...sw} />
    <line x1={106} x2={174} y1={168} y2={168} stroke={MUTE} strokeWidth={1.2} />
    <rect x={170} y={160} width={10} height={16} fill={BRASS} {...sw} />
    <rect x={106} y={SY} width={68} height={10} fill={BRASS} fillOpacity={0.7} {...sw} />
    <line x1={92} x2={110} y1={240} y2={240} stroke={INK} />
    <circle cx={92} cy={240} r={7} fill={GLASS} fillOpacity={0.3} {...sw} />
    <circle cx={92} cy={240} r={2} fill={GLASS} />
    {/* reticle */}
    <circle cx={440} cy={170} r={118} fill={BG} />
    <g clipPath="url(#sv-reticle)">
      <rect x={405} y={40} width={70} height={270} fill={BG} stroke={MUTE} />
      {Array.from({ length: 34 }, (_, i) => (i % 2 === 0 ? <rect key={i} x={405} y={302 - (i + 1) * 8} width={35} height={8} fill={INK} fillOpacity={0.75} /> : null))}
    </g>
    <circle cx={440} cy={170} r={118} fill="none" {...sw} strokeWidth={2} />
    <g stroke="var(--c-accent)" strokeWidth={1.4}>
      <line x1={440} x2={440} y1={54} y2={286} />
      <line x1={324} x2={556} y1={170} y2={170} />
      <line x1={410} x2={470} y1={130} y2={130} />
      <line x1={410} x2={470} y1={210} y2={210} />
    </g>
  </g>
)

/* ------------------------------------------------------------------ digital theodolite (lecture sheet p8 numbering) */
function TheoBody({ cx, rear }: { cx: number; rear?: boolean }) {
  return (
    <g>
      <rect x={cx - 80} y={366} width={160} height={10} fill={PANEL} {...sw} />
      <rect x={cx - 10} y={348} width={20} height={18} fill={BRASS} fillOpacity={0.35} {...sw} />
      <rect x={cx - 70} y={346} width={20} height={20} fill={BRASS} fillOpacity={0.7} {...sw} />
      <rect x={cx + 50} y={346} width={20} height={20} fill={BRASS} fillOpacity={0.7} {...sw} />
      <rect x={cx - 76} y={338} width={152} height={8} fill={PANEL} {...sw} />
      <rect x={cx - 66} y={268} width={132} height={70} rx={6} fill={PANEL} {...sw} />
      <rect x={cx - 66} y={120} width={30} height={148} rx={4} fill={PANEL} {...sw} />
      <rect x={cx + 36} y={120} width={30} height={148} rx={4} fill={PANEL} {...sw} />
      <path d={`M${cx - 54} 122 V98 Q${cx - 54} 88 ${cx - 44} 88 H${cx + 44} Q${cx + 54} 88 ${cx + 54} 98 V122`} fill="none" stroke={INK} strokeWidth={9} />
      <path d={`M${cx - 54} 122 V98 Q${cx - 54} 88 ${cx - 44} 88 H${cx + 44} Q${cx + 54} 88 ${cx + 54} 98 V122`} fill="none" stroke={PANEL} strokeWidth={6} />
      <circle cx={cx} cy={190} r={32} fill={PANEL} {...sw} />
      {/* display + keys */}
      <rect x={cx - 50} y={284} width={52} height={28} rx={2} fill={BG} {...sw} />
      <text x={cx - 24} y={296} fontSize={8} textAnchor="middle" fill={MUTE} className="num">
        V 90°00′
      </text>
      <text x={cx - 24} y={307} fontSize={8} textAnchor="middle" fill={MUTE} className="num">
        H 0°00′
      </text>
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={cx + 12 + (i % 2) * 20} y={286 + Math.floor(i / 2) * 14} width={14} height={9} rx={2} fill={BG} {...sw} strokeWidth={1} />
      ))}
      {!rear ? (
        <g>
          <circle cx={cx} cy={190} r={22} fill={GLASS} fillOpacity={0.35} {...sw} />
          <rect x={cx - 96} y={292} width={30} height={16} fill={PANEL} {...sw} />
          <ellipse cx={cx - 96} cy={300} rx={3} ry={8} fill={GLASS} fillOpacity={0.3} {...sw} />
          <rect x={cx - 86} y={290} width={8} height={20} fill={BRASS} fillOpacity={0.7} {...sw} />
          <rect x={cx - 76} y={285} width={8} height={7} fill={BRASS} {...sw} />
          <ellipse cx={cx - 30} cy={342} rx={9} ry={3.5} fill={BG} {...sw} />
          <circle cx={cx - 30} cy={342} r={1.5} fill={GLASS} />
          <circle cx={cx - 16} cy={342} r={2} fill={INK} />
          <rect x={cx + 66} y={334} width={16} height={8} rx={2} fill={BRASS} {...sw} />
          <rect x={cx + 40} y={200} width={22} height={52} rx={3} fill="none" stroke={MUTE} strokeDasharray="3 2" />
          <path d={`M${cx + 66} 186 L${cx + 73} 190 L${cx + 66} 194 Z`} fill={INK} />
          <circle cx={cx + 51} cy={116} r={3.5} fill={BRASS} {...sw} />
        </g>
      ) : (
        <g>
          <circle cx={cx} cy={190} r={22} fill={BRASS} fillOpacity={0.3} {...sw} />
          {knurl(cx, 190, 32, 24)}
          <circle cx={cx} cy={190} r={9} fill={GLASS} fillOpacity={0.4} {...sw} />
          <path d={`M${cx - 8} 158 L${cx + 8} 158 L${cx} 147 Z`} fill="none" {...sw} />
          <rect x={cx - 12} y={84} width={24} height={4} fill={BG} {...sw} strokeWidth={1} />
          <path d={`M${cx - 34} 84 V92 M${cx - 38} 88 H${cx - 30}`} stroke={INK} strokeWidth={1.2} />
          <rect x={cx - 34} y={272} width={46} height={8} rx={3} fill={GLASS} fillOpacity={0.25} {...sw} />
          <ellipse cx={cx - 11} cy={276} rx={5} ry={2} fill={BG} stroke={GLASS} />
          <circle cx={cx + 20} cy={276} r={2.5} fill={INK} />
          <rect x={cx + 66} y={296} width={14} height={10} rx={2} fill={BRASS} {...sw} />
          <circle cx={cx + 74} cy={324} r={6} fill={BRASS} {...sw} />
          <rect x={cx - 82} y={206} width={16} height={10} rx={2} fill={BRASS} {...sw} />
          <circle cx={cx - 74} cy={236} r={6} fill={BRASS} {...sw} />
        </g>
      )}
    </g>
  )
}
const theoArt = (
  <g>
    <TheoBody cx={170} />
    <TheoBody cx={510} rear />
    <text x={170} y={20} fontSize={11} fontWeight={700} textAnchor="middle" fill={MUTE}>
      objective side
    </text>
    <text x={510} y={20} fontSize={11} fontWeight={700} textAnchor="middle" fill={MUTE}>
      eyepiece side
    </text>
  </g>
)

/* ------------------------------------------------------------------ the figures */
export const FIGS: FigDef[] = [
  {
    id: 'chain',
    k: 1,
    title: "Engineer's chain",
    w: 640,
    h: 290,
    art: chainArt,
    note: "100 ft, 100 links of 1 ft. Gunter's chain: 66 ft, 100 links of 0.66 ft. Metric chain: 20 m or 30 m, links of 0.2 m.",
    parts: [
      { n: 1, name: 'Handle', does: 'Brass handle at each end for holding and pulling the chain; its outer edge is the zero (and the 100 ft) point.', at: [16, 100], lab: [30, 150] },
      { n: 2, name: 'Swivel joint', does: 'Joins the handle to the first link so the chain can turn without twisting.', at: [64, 90], lab: [70, 150] },
      { n: 3, name: 'Link', does: 'Galvanised steel wire bent into an eye at each end; one link is 1 ft on an engineer’s chain.', at: [116, 90], lab: [116, 150] },
      { n: 4, name: 'Rings (three between links)', does: 'Three small oval rings join two links so the chain bends freely without kinking.', at: [168, 95], lab: [168, 150] },
      { n: 5, name: 'Tally (10 ft tag)', does: 'Brass tag every 10 links — 1, 2, 3, 4 teeth for 10, 20, 30, 40 ft — so the chain is read without counting links.', at: [324, 118], lab: [324, 160] },
      { n: 6, name: 'Round tally (50 ft)', does: 'Round brass tag at the middle of the chain, 50 ft from either end.', at: [480, 118], lab: [480, 160] },
    ],
  },
  {
    id: 'kit',
    k: 2,
    title: 'Ranging rod, arrow, peg, plumb bob and tape',
    w: 640,
    h: 300,
    art: kitArt,
    parts: [
      { n: 1, name: 'Ranging rod', does: 'Pole (2 m or 3 m) set up to mark a station and to fix points on a straight line (ranging).', at: [70, 150], lab: [30, 150] },
      { n: 2, name: 'Coloured bands', does: 'Alternate red and white bands (20 cm each) make the rod easy to see from far away.', at: [75, 112], lab: [122, 128] },
      { n: 3, name: 'Iron shoe', does: 'Pointed metal end that lets the rod be pushed into the ground.', at: [70, 268], lab: [30, 272] },
      { n: 4, name: 'Flag', does: 'Small flag at the top so the rod can be seen on long lines.', at: [92, 41], lab: [132, 40] },
      { n: 5, name: 'Arrow', does: 'Steel pin (about 40 cm) stuck in the ground at the end of every chain length; a set of 10 goes with the chain.', at: [180, 200], lab: [226, 212] },
      { n: 6, name: 'Arrow ring with red cloth', does: 'The bent ring end carries a strip of red cloth so the arrow is easy to find.', at: [205, 92], lab: [240, 60] },
      { n: 7, name: 'Wooden peg', does: 'Driven into the ground to mark a main station.', at: [290, 205], lab: [322, 150] },
      { n: 8, name: 'Plumb bob', does: 'Pointed weight on a string: centres instruments over a station, transfers points to the ground and checks that a rod is vertical.', at: [384, 210], lab: [432, 232] },
      { n: 9, name: 'Tape', does: 'Measures the short lengths — the offsets — more accurately than the chain.', at: [495, 125], lab: [462, 80] },
      { n: 10, name: 'Tape end ring', does: 'Brass ring at the zero end; the length is counted from its outer edge.', at: [617, 204], lab: [598, 250] },
    ],
  },
  {
    id: 'osq',
    k: 3,
    title: 'Optical square (box opened, seen from above)',
    w: 640,
    h: 300,
    art: osqArt,
    note: 'Hold it over the chain line, look at the far ranging rod through the clear half, walk along the line until the object’s image is exactly over the rod, then drop a plumb bob: that point is the foot of the perpendicular.',
    parts: [
      { n: 1, name: 'Eye hole', does: 'Small hole you look through, along the chain line.', at: [170, 200], lab: [140, 252] },
      { n: 2, name: 'Horizon glass (half silvered)', does: 'Upper half is a mirror, lower half clear glass: you see the ranging rod directly and the object’s image together.', at: [288, 205], lab: [262, 270] },
      { n: 3, name: 'Index glass (fully silvered)', does: 'Mirror that catches the ray from the object and throws it onto the horizon glass.', at: [360, 140], lab: [452, 135] },
      { n: 4, name: 'Window to the object', does: 'Opening at right angles to the line of sight through which the object is seen.', at: [360, 100], lab: [442, 80] },
      { n: 5, name: 'Opening to the ranging rod', does: 'Lets you sight the ranging rod at the end of the chain line directly.', at: [420, 200], lab: [470, 255] },
      { n: 6, name: 'Box (case)', does: 'Small metal box that holds the two mirrors fixed at 45° to each other.', at: [190, 112], lab: [150, 70] },
    ],
  },
  {
    id: 'pcomp',
    k: 4,
    title: 'Prismatic compass',
    w: 640,
    h: 350,
    art: pcompArt,
    note: 'Reads whole circle bearings (0–360°). The ring is fixed to the needle, its figures are written upside down with 0° at the south end, and the prism shows them upright — so you sight and read at the same time. Least count 30′.',
    parts: [
      { n: 1, name: 'Object vane with hair', does: 'Hinged frame with a vertical horse hair; the hair is laid on the object when sighting.', at: [440, 90], lab: [500, 70] },
      { n: 2, name: 'Mirror', does: 'Slides on the object vane and tilts, so objects well above or below the compass can be sighted.', at: [470, 135], lab: [515, 135] },
      { n: 3, name: 'Eye vane with sighting slit', does: 'Narrow slit above the prism; you look through it and line up the hair with the object.', at: [200, 125], lab: [140, 100] },
      { n: 4, name: 'Prism', does: 'Magnifies the ring and turns its inverted figures upright, so the bearing is read while sighting.', at: [219, 169], lab: [140, 150] },
      { n: 5, name: 'Focusing stud', does: 'Moves the prism up or down to bring the graduations into focus for your eye.', at: [189, 172], lab: [140, 205] },
      { n: 6, name: 'Graduated ring', does: 'Aluminium ring graduated 0–360° in half degrees, fixed to the needle so it always stays pointing north.', at: [250, 209], lab: [205, 290] },
      { n: 7, name: 'Magnetic needle', does: 'Balanced on a pivot; points to magnetic north and carries the graduated ring with it.', at: [360, 188], lab: [370, 128] },
      { n: 8, name: 'Glass cover', does: 'Glass lid that protects the needle and ring while letting you see them.', at: [270, 161], lab: [270, 118] },
      { n: 9, name: 'Lifting pin', does: 'Folding the object vane presses it and lifts the needle off the pivot, so the pivot does not wear in transit.', at: [455, 203], lab: [515, 205] },
      { n: 10, name: 'Brake pin', does: 'Pressed lightly to stop the ring swinging so it settles quickly for a reading.', at: [400, 236], lab: [470, 268] },
      { n: 11, name: 'Stand with ball-and-socket joint', does: 'Tripod stand; the ball-and-socket joint levels the compass and lets it turn.', at: [320, 289], lab: [250, 328] },
    ],
  },
  {
    id: 'ptable',
    k: 5,
    title: 'Plane table',
    w: 640,
    h: 340,
    art: ptableArt,
    note: 'At every station: Level (spirit level, two directions) → Centre (U-fork and plumb bob) → Orient (trough compass or back ray). Keep the alidade on the same side of the point for every ray.',
    parts: [
      { n: 1, name: 'Drawing board', does: 'Board that carries the drawing sheet; the map is drawn on it in the field.', at: [520, 152], lab: [580, 125] },
      { n: 2, name: 'Tripod', does: 'Three legs that hold the board steady at a working height.', at: [388, 275], lab: [450, 300] },
      { n: 3, name: 'Levelling head and clamp', does: 'Joins the board to the tripod; lets the board be levelled, turned and clamped.', at: [344, 177], lab: [400, 210] },
      { n: 4, name: 'Alidade', does: 'Ruler with two sight vanes; sights an object and the ray is drawn along its fiducial (bevelled) edge.', at: [300, 134], lab: [300, 52] },
      { n: 5, name: 'Object vane (hair)', does: 'Vane with a vertical hair at the far end of the alidade, laid on the object.', at: [399, 92], lab: [442, 52] },
      { n: 6, name: 'Sight vane (slit)', does: 'Vane with a narrow slit at the eye end of the alidade.', at: [213, 108], lab: [180, 58] },
      { n: 7, name: 'Spirit level', does: 'Levels the board; it is checked in two directions at right angles.', at: [148, 129], lab: [92, 112] },
      { n: 8, name: 'Trough compass', does: 'Long narrow compass laid on the sheet to draw the magnetic north line and orient the board.', at: [496, 142], lab: [585, 178] },
      { n: 9, name: 'U-fork', does: 'Hairpin-shaped fork: the upper arm’s tip is on the plotted station, the lower arm under the board carries the plumb bob.', at: [245, 188], lab: [190, 212] },
      { n: 10, name: 'Plumb bob', does: 'Hangs from the U-fork; when it is over the ground mark, the plotted point is right above the station (centring).', at: [262, 292], lab: [198, 292] },
    ],
  },
  {
    id: 'tripod',
    k: 6,
    title: 'Tripod',
    w: 640,
    h: 300,
    art: tripodArt,
    note: 'Set up: unbuckle the band, loosen the clamp screws, pull the legs out to bring the head near eye level, spread the tips into a regular triangle, keep the head roughly level and press the shoes into the ground.',
    parts: [
      { n: 1, name: 'Tripod head', does: 'Flat top on which the instrument sits; keep it roughly level when setting up.', at: [320, 46], lab: [420, 38] },
      { n: 2, name: 'Centring screw', does: 'Screws into the instrument’s base to fix it on the head (loosen it slightly to slide the instrument for centring).', at: [326, 76], lab: [420, 88] },
      { n: 3, name: 'Extension clamp screw', does: 'Loosened to slide the leg out to the right length, then tightened.', at: [420, 168], lab: [500, 150] },
      { n: 4, name: 'Leg', does: 'Sliding leg; the three tips are spread into a regular triangle on the ground.', at: [252, 115], lab: [170, 100] },
      { n: 5, name: 'Shoe', does: 'Pointed metal foot pressed firmly into the ground with your foot so the set-up does not sink.', at: [176, 280], lab: [110, 268] },
    ],
  },
  {
    id: 'alevel',
    k: 7,
    title: 'Automatic level (numbers as in the lecture sheet, Fig. 3.1)',
    w: 640,
    h: 340,
    art: alevelArt,
    note: 'Inside, a compensator keeps the line of sight horizontal once the circular bubble is centred — no long tubular bubble to set before each reading. Levelling does not need centring over a mark.',
    parts: [
      { n: 1, name: 'Reflector', does: 'Small mirror over the circular level, so the bubble can be seen from the eyepiece end.', at: [247, 132], lab: [200, 95] },
      { n: 2, name: 'Peep sight', does: 'Rough aiming: point the telescope at the staff with it before looking through the eyepiece.', at: [316, 133], lab: [316, 95] },
      { n: 3, name: 'Circular level adjusting screw', does: 'Adjusts the circular level itself — a permanent adjustment, not touched in the field.', at: [264, 152], lab: [266, 95] },
      { n: 4, name: 'Circular level', does: 'Bubble inside the centre circle means the instrument is level enough for the compensator.', at: [247, 150], lab: [150, 132] },
      { n: 5, name: 'Levelling foot screw', does: 'Three screws turned to bring the circular bubble to the centre.', at: [242, 241], lab: [150, 250] },
      { n: 6, name: 'Base plate', does: 'Bottom plate that sits on the tripod head; the centring screw holds it.', at: [228, 256], lab: [175, 295] },
      { n: 7, name: 'Horizontal fine motion screw', does: 'Turns the telescope slowly to bring the staff into the middle of the view.', at: [418, 219], lab: [500, 240] },
      { n: 8, name: 'Objective lens', does: 'Front lens that forms the image of the staff.', at: [444, 172], lab: [500, 160] },
      { n: 9, name: 'Focusing knob', does: 'Two-speed knob that brings the staff image into focus.', at: [370, 161], lab: [500, 115] },
      { n: 10, name: 'Horizontal circle positioning ring', does: 'Turns the horizontal circle to set a zero for rough horizontal angles.', at: [370, 218], lab: [500, 280] },
      { n: 11, name: 'Horizontal circle window', does: 'Window where the horizontal circle reading is seen.', at: [404, 199], lab: [500, 205] },
      { n: 12, name: 'Reticle adjusting screw cover', does: 'Covers the screws that adjust the cross-hairs (a permanent adjustment of the line of sight).', at: [216, 190], lab: [150, 212] },
      { n: 13, name: 'Eyepiece', does: 'Turned until the cross-hairs are sharp — the first step in focusing, against parallax.', at: [186, 172], lab: [150, 172] },
    ],
  },
  {
    id: 'staff',
    k: 8,
    title: 'Levelling staff and the view through the telescope',
    w: 640,
    h: 340,
    art: staffArt,
    note: 'Class staff: telescopic, 5 m when fully open, smallest division 5 mm (estimate the mm). Hold it vertical: a tilted staff always reads too much — rock it gently and take the smallest reading.',
    parts: [
      { n: 1, name: 'Graduations (5 mm)', does: 'Alternate black and white 5 mm divisions; the millimetre is estimated between them.', at: [126, 282], lab: [62, 290] },
      { n: 2, name: 'Figures (every 10 cm)', does: 'A number at every decimetre (here 1.1, 1.2 …) tells the metres and tenths.', at: [158, 194], lab: [216, 115] },
      { n: 3, name: 'Section joint and catch', does: 'The sections slide out here; the catch must click fully home or every reading above the joint is wrong.', at: [178, 168], lab: [216, 168] },
      { n: 4, name: 'Brass shoe', does: 'Metal foot; the zero of the staff is its bottom face, so keep it clean of mud.', at: [150, 323], lab: [216, 322] },
      { n: 5, name: 'Staff bubble', does: 'Small circular bubble (if fitted); centred, the staff is vertical.', at: [92, 240], lab: [50, 200] },
      { n: 6, name: 'Middle (horizontal) hair', does: 'The staff reading for levelling is taken on this hair.', at: [530, 170], lab: [600, 170] },
      { n: 7, name: 'Stadia hairs (upper and lower)', does: 'Short hairs above and below the middle one; the gap between their readings gives the distance (stadia).', at: [470, 130], lab: [600, 110] },
      { n: 8, name: 'Vertical hair', does: 'Used to centre the staff in the view and see that it is not leaning sideways.', at: [440, 278], lab: [505, 318] },
    ],
  },
  {
    id: 'theo',
    k: 9,
    title: 'Electronic digital theodolite (numbers as in the lecture sheet, p 8)',
    w: 680,
    h: 410,
    art: theoArt,
    note: 'Measures horizontal and vertical angles. Class least count 10″; V = 90° with the telescope horizontal. Mount the battery before centring and levelling. (Part 5, the data output connector, is not drawn.)',
    parts: [
      { n: 1, name: 'Handle', does: 'For carrying the instrument; it can be removed.', at: [150, 88], lab: [120, 50] },
      { n: 2, name: 'Handle securing screw', does: 'Fixes the handle to the instrument.', at: [221, 116], lab: [282, 95] },
      { n: 3, name: 'Instrument height mark', does: 'Marks the height of the telescope axis, so the instrument height above the station can be measured.', at: [240, 190], lab: [282, 168] },
      { n: 4, name: 'Battery cover', does: 'Covers the battery; fit the battery before levelling, or the instrument tilts.', at: [221, 226], lab: [282, 225] },
      { n: 6, name: 'Operation panel', does: 'Keys: ON, illumination, 0 SET (H angle to zero), R/L (H angle direction), HOLD (hold the H angle).', at: [204, 300], lab: [282, 285] },
      { n: 7, name: 'Shifting (tribrach) clamp', does: 'Locks the instrument into the tribrach; released to lift it out.', at: [248, 338], lab: [282, 330] },
      { n: 8, name: 'Base plate', does: 'Bottom plate that sits on the tripod head.', at: [215, 371], lab: [282, 375] },
      { n: 9, name: 'Levelling foot screw', does: 'Three screws: bring the station mark to the plummet centre, then centre the plate level.', at: [110, 356], lab: [40, 380] },
      { n: 10, name: 'Circular level adjusting screws', does: 'Adjust the circular level itself (permanent adjustment).', at: [154, 342], lab: [125, 400] },
      { n: 11, name: 'Circular level', does: 'For rough levelling — centred by changing the tripod leg lengths.', at: [140, 342], lab: [40, 335] },
      { n: 12, name: 'Display', does: 'Shows the vertical angle (V, top line) and the horizontal angle (H, bottom line).', at: [140, 298], lab: [282, 255] },
      { n: 13, name: 'Optical plummet eyepiece screw', does: 'Turned to focus the plummet’s reticle (the small circle).', at: [74, 300], lab: [40, 285] },
      { n: 14, name: 'Optical plummet reticle cover', does: 'Covers the screws that adjust the plummet’s reticle.', at: [98, 286], lab: [40, 255] },
      { n: 15, name: 'Optical plummet focusing ring', does: 'Focuses on the station mark on the ground, for centring.', at: [88, 310], lab: [40, 312] },
      { n: 16, name: 'Objective lens', does: 'Front lens of the telescope.', at: [170, 190], lab: [40, 190] },
      { n: 17, name: 'Tubular compass slot', does: 'Takes a tubular compass, to set the telescope on magnetic north.', at: [510, 86], lab: [510, 45] },
      { n: 18, name: 'Horizontal clamp', does: 'Locks the turning of the upper part about the vertical axis.', at: [583, 301], lab: [640, 300] },
      { n: 19, name: 'Horizontal fine motion screw', does: 'Turns the upper part slowly — works only with the horizontal clamp tightened.', at: [584, 324], lab: [640, 335] },
      { n: 20, name: 'Plate level', does: 'Tubular bubble for precise levelling, with foot screws A–B, then C at 90°.', at: [490, 276], lab: [395, 285] },
      { n: 21, name: 'Plate level adjusting screw', does: 'Adjusts the plate level itself (permanent adjustment).', at: [530, 276], lab: [640, 265] },
      { n: 22, name: 'Vertical clamp', does: 'Locks the tilting of the telescope.', at: [430, 211], lab: [395, 195] },
      { n: 23, name: 'Vertical fine motion screw', does: 'Tilts the telescope slowly — works only with the vertical clamp tightened.', at: [436, 236], lab: [395, 240] },
      { n: 24, name: 'Telescope eyepiece screw', does: 'Turned until the cross-hairs are sharp.', at: [510, 190], lab: [640, 150] },
      { n: 25, name: 'Telescope focusing ring', does: 'Focuses the telescope on the target.', at: [540, 200], lab: [640, 210] },
      { n: 26, name: 'Peep sight', does: 'Rough aiming before looking through the telescope.', at: [510, 153], lab: [395, 118] },
      { n: 27, name: 'Instrument center mark', does: 'Marks the centre of the instrument (on the vertical axis).', at: [476, 88], lab: [440, 45] },
    ],
  },
]

export const FIG = Object.fromEntries(FIGS.map((f) => [f.id, f])) as Record<FigId, FigDef>

/** the drawing with numbered callouts; `hi` is drawn in the accent colour (as "?" when `ask`) */
export function InstFigure({ id, hi, ask, onPick, className }: { id: FigId; hi?: number | null; ask?: boolean; onPick?: (n: number) => void; className?: string }) {
  const f = FIG[id]
  return (
    <svg viewBox={`0 0 ${f.w} ${f.h}`} className={'w-full h-auto rounded-xl border border-line bg-bg select-none ' + (className ?? '')} role="img" aria-label={f.title}>
      {f.art}
      {f.parts.map((p) => {
        const on = hi === p.n
        return (
          <g key={p.n} onClick={onPick ? () => onPick(p.n) : undefined} style={onPick ? { cursor: 'pointer' } : undefined}>
            <line x1={p.at[0]} y1={p.at[1]} x2={p.lab[0]} y2={p.lab[1]} stroke={on ? 'var(--c-accent)' : MUTE} strokeWidth={on ? 1.8 : 0.9} />
            <circle cx={p.at[0]} cy={p.at[1]} r={on ? 3 : 2.2} fill={on ? 'var(--c-accent)' : MUTE} />
            <circle cx={p.lab[0]} cy={p.lab[1]} r={on ? 12 : 10.5} fill={on ? 'var(--c-accent)' : BG} stroke={on ? 'var(--c-accent)' : MUTE} strokeWidth={1.2} />
            <text x={p.lab[0]} y={p.lab[1] + 4} fontSize={on ? 13 : 11} fontWeight={700} textAnchor="middle" fill={on ? BG : INK}>
              {on && ask ? '?' : p.n}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/** Learn tab: figure + clickable parts list, with a "hide names" self-test */
export function PartsExplorer({ id }: { id: FigId }) {
  const f = FIG[id]
  const [hi, setHi] = useState<number | null>(null)
  const [hide, setHide] = useState(false)
  const [seen, setSeen] = useState<Set<number>>(new Set())
  const pick = (n: number) => {
    setHi(n)
    if (hide) setSeen((s) => new Set(s).add(n))
  }
  return (
    <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <div className="min-w-0">
        <InstFigure id={id} hi={hi} onPick={pick} ask={hide && hi !== null && !seen.has(hi)} />
        {f.note && <p className="text-[13px] text-mute mt-2 leading-snug">{f.note}</p>}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-mute">Parts — tap one</span>
          <button
            className="btn !py-0.5 !px-2 !text-xs ml-auto"
            onClick={() => {
              setHide(!hide)
              setSeen(new Set())
              setHi(null)
            }}
          >
            {hide ? 'Show all names' : 'Hide names (test me)'}
          </button>
        </div>
        <ol className="space-y-0.5 text-sm">
          {f.parts.map((p) => {
            const open = !hide || seen.has(p.n)
            return (
              <li key={p.n}>
                <button type="button" onClick={() => pick(p.n)} className={'w-full text-left flex gap-2 rounded-lg px-2 py-1 transition-colors ' + (hi === p.n ? 'bg-accent/10' : 'hover:bg-panel2')}>
                  <span className={'num text-[11px] font-bold rounded-full w-5 h-5 grid place-items-center shrink-0 mt-0.5 ' + (hi === p.n ? 'bg-accent text-bg' : 'border border-line text-mute')}>{p.n}</span>
                  <span className="min-w-0">
                    {open ? (
                      <>
                        <b>{p.name}</b>
                        <span className="text-mute"> — {p.does}</span>
                      </>
                    ) : (
                      <span className="text-faint italic">tap to reveal</span>
                    )}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}

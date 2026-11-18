// ev-gw — groundwater: origin, zones, formations, aquifer types and properties, flow to a well (Dupuit, Thiem), interference, salt-water intrusion (Snigdha ma'am L3).
// Numbers (yield, K from a pumping test, interference, storage volume) live in engine/wells.ts.
import type { FC } from 'react'
import type { EvAnswer, EvCard, EvList, EvTopicContent } from '../types'

const T = 'ev-gw' as const
const ink = 'var(--c-ink)'
const mute = 'var(--c-mute)'
const faint = 'var(--c-faint)'
const line = 'var(--c-line)'
const panel2 = 'var(--c-panel2)'
const water = 'var(--c-water)'
const accent = 'var(--c-accent)'
const soil = 'var(--c-soil)'
const bad = 'var(--c-bad)'
const good = 'var(--c-good)'
const sn = 'var(--c-sn)'

const Tx = ({ x, y, t, a = 'middle', b, c = ink, s = 12 }: { x: number; y: number; t: string; a?: 'start' | 'middle' | 'end'; b?: boolean; c?: string; s?: number }) => (
  <text x={x} y={y} textAnchor={a} fontSize={s} fontWeight={b ? 700 : 400} fill={c}>
    {t}
  </text>
)
const Defs = ({ id }: { id: string }) => (
  <defs>
    <marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill={ink} />
    </marker>
    <pattern id={id + 'd'} width="8" height="8" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1" fill={soil} />
      <circle cx="6" cy="6" r="1" fill={soil} />
    </pattern>
    <pattern id={id + 'h'} width="8" height="8" patternUnits="userSpaceOnUse">
      <path d="M0,8 L8,0" stroke={mute} strokeWidth="1" />
    </pattern>
  </defs>
)

// ---------- figures ----------
/** unconfined well with the cone of depression: D, d, drawdown, R */
const ConeFig: FC = () => (
  <svg viewBox="0 0 660 320" width="100%" role="img" aria-label="Well with cone of depression">
    <Defs id="cn" />
    <line x1={20} y1={50} x2={640} y2={50} stroke={ink} strokeWidth={2} />
    <Tx x={30} y={42} a="start" t="Ground surface" c={mute} s={11} />
    <rect x={20} y={110} width={620} height={165} fill="url(#cnd)" stroke="none" />
    <rect x={20} y={275} width={620} height={26} fill="url(#cnh)" stroke={mute} />
    <Tx x={330} y={293} t="Impervious base" c={mute} s={11} />
    {/* static level */}
    <line x1={20} y1={110} x2={640} y2={110} stroke={water} strokeDasharray="6 4" strokeWidth={2} />
    <Tx x={30} y={104} a="start" t="Static water level (D)" c={water} s={11} />
    {/* cone */}
    <path d="M318,185 C290,184 270,170 230,142 C190,120 130,112 40,110" fill="none" stroke={water} strokeWidth={3} />
    <path d="M342,185 C370,184 390,170 430,142 C470,120 530,112 620,110" fill="none" stroke={water} strokeWidth={3} />
    {/* well */}
    <rect x={316} y={50} width={28} height={225} fill="none" stroke={ink} strokeWidth={2} />
    <rect x={318} y={185} width={24} height={90} fill={water} opacity={0.3} />
    <Tx x={330} y={176} t="pumping level (d)" s={11} c={water} />
    <Tx x={330} y={30} t="Pumping well" b s={11} />
    {/* drawdown arrow */}
    <line x1={380} y1={112} x2={380} y2={183} stroke={bad} strokeWidth={1.5} markerStart="url(#cn)" markerEnd="url(#cn)" />
    <Tx x={388} y={152} a="start" t="drawdown D − d" c={bad} s={11} />
    {/* R */}
    <line x1={330} y1={86} x2={620} y2={86} stroke={ink} strokeWidth={1.5} markerEnd="url(#cn)" />
    <Tx x={475} y={80} t="radius of influence R" s={11} />
    <line x1={620} y1={78} x2={620} y2={114} stroke={ink} strokeDasharray="3 3" />
    {/* flow arrows */}
    <path d="M520,200 C460,205 400,215 346,230" fill="none" stroke={accent} strokeWidth={1.5} markerEnd="url(#cn)" />
    <path d="M140,200 C200,205 260,215 314,230" fill="none" stroke={accent} strokeWidth={1.5} markerEnd="url(#cn)" />
    <Tx x={500} y={232} t="converging flow" c={accent} s={11} />
    <Tx x={330} y={262} t="well screen" c={mute} s={11} />
  </svg>
)

/** unconfined (Dupuit) section: x, y, D, d, r, R */
const DupuitFig: FC = () => (
  <svg viewBox="0 0 620 290" width="100%" role="img" aria-label="Unconfined aquifer well: section for the Dupuit derivation">
    <Defs id="dp" />
    <line x1={20} y1={40} x2={600} y2={40} stroke={ink} strokeWidth={2} />
    <rect x={20} y={95} width={580} height={150} fill="url(#dpd)" />
    <rect x={20} y={245} width={580} height={24} fill="url(#dph)" stroke={mute} />
    <Tx x={310} y={262} t="Impervious base (datum)" c={mute} s={11} />
    <line x1={20} y1={95} x2={600} y2={95} stroke={water} strokeDasharray="6 4" />
    <path d="M298,160 C270,158 250,140 215,118 C180,102 120,96 30,95" fill="none" stroke={water} strokeWidth={3} />
    <path d="M322,160 C350,158 370,140 405,118 C440,102 500,96 590,95" fill="none" stroke={water} strokeWidth={3} />
    <rect x={296} y={40} width={26} height={205} fill="none" stroke={ink} strokeWidth={2} />
    {/* D and d */}
    <line x1={50} y1={95} x2={50} y2={245} stroke={ink} markerStart="url(#dp)" markerEnd="url(#dp)" />
    <Tx x={58} y={175} a="start" t="D" b />
    <line x1={270} y1={160} x2={270} y2={245} stroke={ink} markerStart="url(#dp)" markerEnd="url(#dp)" />
    <Tx x={262} y={205} a="end" t="d" b />
    {/* element at x */}
    <line x1={410} y1={120} x2={410} y2={245} stroke={bad} strokeWidth={2} />
    <line x1={310} y1={230} x2={410} y2={230} stroke={ink} strokeWidth={1.5} markerEnd="url(#dp)" />
    <Tx x={360} y={224} t="x" b />
    <Tx x={418} y={185} a="start" t="y" b c={bad} />
    <Tx x={440} y={142} a="start" t="slope dy/dx" s={11} c={mute} />
    <line x1={310} y1={190} x2={590} y2={190} stroke={ink} strokeDasharray="3 3" />
    <line x1={590} y1={96} x2={590} y2={245} stroke={ink} strokeDasharray="3 3" />
    <Tx x={450} y={206} t="R" b />
    <Tx x={309} y={34} t="well, radius r" s={11} />
    <Tx x={60} y={30} a="start" t="Water table (unconfined)" c={water} s={11} />
  </svg>
)

/** confined (Thiem) section: b, D, d, piezometric surface */
const ThiemFig: FC = () => (
  <svg viewBox="0 0 640 310" width="100%" role="img" aria-label="Confined aquifer well: section for the Thiem derivation">
    <Defs id="th" />
    <line x1={20} y1={150} x2={620} y2={150} stroke={ink} strokeWidth={0} />
    <line x1={20} y1={70} x2={620} y2={70} stroke={ink} strokeWidth={2} />
    <Tx x={28} y={62} a="start" t="Ground surface" c={mute} s={11} />
    <rect x={20} y={125} width={600} height={30} fill="url(#thh)" stroke={mute} />
    <Tx x={90} y={144} t="aquiclude / aquitard" c={mute} s={11} />
    <rect x={20} y={155} width={600} height={85} fill="url(#thd)" />
    <Tx x={90} y={200} t="confined aquifer" c={soil} s={12} b />
    <rect x={20} y={240} width={600} height={30} fill="url(#thh)" stroke={mute} />
    <Tx x={90} y={259} t="aquiclude / aquitard" c={mute} s={11} />
    {/* piezometric */}
    <line x1={20} y1={95} x2={620} y2={95} stroke={water} strokeDasharray="6 4" strokeWidth={2} />
    <Tx x={28} y={89} a="start" t="Piezometric surface (static)" c={water} s={11} />
    <path d="M308,120 C280,118 260,108 220,100 C180,96 100,95 30,95" fill="none" stroke={water} strokeWidth={3} />
    <path d="M332,120 C360,118 380,108 420,100 C460,96 540,95 610,95" fill="none" stroke={water} strokeWidth={3} />
    <rect x={306} y={70} width={26} height={170} fill="none" stroke={ink} strokeWidth={2} />
    <Tx x={319} y={60} t="well" s={11} b />
    <line x1={470} y1={95} x2={470} y2={270} stroke={ink} markerStart="url(#th)" markerEnd="url(#th)" />
    <Tx x={478} y={190} a="start" t="D" b />
    <line x1={350} y1={120} x2={350} y2={270} stroke={ink} markerStart="url(#th)" markerEnd="url(#th)" />
    <Tx x={358} y={178} a="start" t="d" b />
    <line x1={575} y1={155} x2={575} y2={240} stroke={good} strokeWidth={2} markerStart="url(#th)" markerEnd="url(#th)" />
    <Tx x={567} y={200} a="end" t="b" b c={good} />
    <line x1={332} y1={290} x2={608} y2={290} stroke={ink} markerStart="url(#th)" markerEnd="url(#th)" />
    <Tx x={470} y={304} t="R (radius of influence)" s={11} />
    <Tx x={228} y={290} t="x, dx, dy" s={11} c={mute} />
    <Tx x={319} y={284} t="r" s={11} />
  </svg>
)

/** formations by water storage and transmission */
const FormationsFig: FC = () => {
  const Col = ({ x, name, def, ex, fill, dots, hatch }: { x: number; name: string; def: string[]; ex: string; fill: string; dots?: boolean; hatch?: boolean }) => (
    <g>
      <rect x={x} y={20} width={150} height={100} rx={6} fill={fill} stroke={line} />
      {dots && [...Array(20)].map((_, i) => <circle key={i} cx={x + 15 + (i % 5) * 30} cy={36 + Math.floor(i / 5) * 22} r={4} fill="none" stroke={water} />)}
      {hatch && [...Array(8)].map((_, i) => <line key={i} x1={x + 8} y1={30 + i * 12} x2={x + 142} y2={30 + i * 12} stroke={mute} strokeWidth={1} />)}
      <Tx x={x + 75} y={142} t={name} b s={13} c={sn} />
      {def.map((d, i) => (
        <Tx key={i} x={x + 75} y={162 + i * 15} t={d} s={11} c={ink} />
      ))}
      <Tx x={x + 75} y={162 + def.length * 15 + 4} t={ex} s={11} c={mute} />
    </g>
  )
  return (
    <svg viewBox="0 0 680 250" width="100%" role="img" aria-label="Aquifer, aquitard, aquiclude and aquifuge">
      <Col x={5} name="Aquifer" def={['porous AND permeable', 'stores and transmits']} ex="sand, gravel" fill={panel2} dots />
      <Col x={175} name="Aquitard" def={['low permeability', 'leaks vertically']} ex="sandy clay" fill={panel2} dots hatch />
      <Col x={345} name="Aquiclude" def={['porous, impermeable', 'stores, cannot transmit']} ex="clay, shale" fill={panel2} hatch />
      <Col x={515} name="Aquifuge" def={['neither porous nor', 'permeable']} ex="unfractured granite" fill="var(--c-faint)" />
    </svg>
  )
}

/** unconfined, confined (artesian, flowing), perched */
const AquiferTypesFig: FC = () => (
  <svg viewBox="0 0 780 360" width="100%" role="img" aria-label="Unconfined, confined and perched aquifers">
    <Defs id="aq" />
    {/* ground */}
    <path d="M0,70 L380,70 L780,120 L780,360 L0,360 z" fill={panel2} stroke="none" />
    <path d="M0,70 L380,70 L780,120" fill="none" stroke={ink} strokeWidth={2} />
    {/* aquifer */}
    <rect x={0} y={190} width={780} height={110} fill="url(#aqd)" stroke="none" />
    <rect x={0} y={300} width={780} height={60} fill="url(#aqh)" stroke={mute} />
    <Tx x={390} y={330} t="impervious base" c={mute} s={11} />
    {/* confining layer */}
    <path d="M380,152 L780,170 L780,190 L380,190 z" fill="url(#aqh)" stroke={mute} />
    <Tx x={600} y={185} t="aquiclude / aquitard (confining layer)" s={11} c={mute} />
    {/* water table */}
    <path d="M0,190 L380,190" stroke={water} strokeWidth={3} strokeDasharray="7 4" />
    <Tx x={190} y={182} t="water table" c={water} s={11} b />
    <Tx x={190} y={250} t="UNCONFINED aquifer" b c={sn} />
    <Tx x={190} y={268} t="(saturated, open to the atmosphere)" s={11} c={mute} />
    <Tx x={600} y={250} t="CONFINED (artesian) aquifer" b c={sn} />
    <Tx x={600} y={268} t="(under pressure between confining layers)" s={11} c={mute} />
    {/* perched */}
    <rect x={50} y={112} width={150} height={9} fill="url(#aqh)" stroke={mute} />
    <path d="M52,112 C100,102 150,102 198,112" fill="none" stroke={water} strokeWidth={3} />
    <Tx x={125} y={96} t="perched water table" c={water} s={11} b />
    <Tx x={125} y={140} t="unsaturated zone below" c={mute} s={11} />
    <Tx x={125} y={154} t="the lens" c={mute} s={11} />
    {/* piezometric surface */}
    <path d="M380,75 L780,100" fill="none" stroke={bad} strokeWidth={2} strokeDasharray="7 4" />
    <Tx x={470} y={72} t="piezometric surface" c={bad} s={11} b a="start" />
    {/* non-flowing artesian well */}
    <rect x={476} y={84} width={10} height={170} fill="none" stroke={ink} strokeWidth={2} />
    <rect x={478} y={79} width={6} height={10} fill={water} opacity={0.7} />
    <Tx x={481} y={118} t="artesian well" s={11} a="start" />
    {/* flowing artesian well */}
    <rect x={676} y={112} width={10} height={142} fill="none" stroke={ink} strokeWidth={2} />
    <path d="M681,112 C670,80 660,90 650,108 M681,112 C692,78 706,92 712,112" fill="none" stroke={water} strokeWidth={2} />
    <Tx x={690} y={78} t="flowing artesian well" c={water} s={11} a="middle" />
    {/* ordinary well */}
    <rect x={285} y={70} width={10} height={170} fill="none" stroke={ink} strokeWidth={2} />
    <Tx x={290} y={62} t="water-table well" s={11} />
    {/* recharge */}
    <path d="M330,50 L330,66 M345,50 L345,66 M360,50 L360,66" stroke={good} strokeWidth={2} />
    <Tx x={345} y={44} t="recharge area (rain)" s={11} c={good} />
    <path d="M330,200 C380,205 420,230 470,235" fill="none" stroke={accent} strokeWidth={1.5} markerEnd="url(#aq)" />
  </svg>
)

/** salt-water intrusion: natural and pumped, with Ghyben–Herzberg */
const SaltFig: FC = () => (
  <svg viewBox="0 0 780 320" width="100%" role="img" aria-label="Salt-water intrusion in a coastal aquifer, natural and with pumping">
    <Defs id="sl" />
    {[0, 400].map((ox, k) => (
      <g key={k}>
        <rect x={ox + 10} y={60} width={360} height={190} fill="url(#sld)" stroke="none" />
        <rect x={ox + 10} y={250} width={360} height={14} fill="url(#slh)" stroke={mute} />
        {/* sea */}
        <rect x={ox + 250} y={80} width={120} height={170} fill={water} opacity={0.35} />
        <path d={`M${ox + 10},62 L${ox + 250},62 L${ox + 250},80`} fill="none" stroke={ink} strokeWidth={2} />
        <Tx x={ox + 315} y={110} t="Sea" b c={water} />
        {/* fresh water table */}
        <path d={k === 0 ? `M${ox + 10},68 C${ox + 120},70 ${ox + 200},75 ${ox + 250},80` : `M${ox + 10},68 C${ox + 80},70 ${ox + 120},80 ${ox + 150},108 C${ox + 180},108 ${ox + 220},80 ${ox + 250},80`} fill="none" stroke={water} strokeWidth={3} />
        <Tx x={ox + 80} y={106} t="fresh water" c={water} s={11} />
        {/* interface */}
        <path d={k === 0 ? `M${ox + 250},250 C${ox + 250},200 ${ox + 240},150 ${ox + 250},80 M${ox + 250},250 C${ox + 200},248 ${ox + 150},240 ${ox + 100},200` : `M${ox + 250},250 C${ox + 200},248 ${ox + 150},235 ${ox + 100},200`} fill="none" stroke={bad} strokeWidth={3} />
        <Tx x={ox + 170} y={240} t="salt water" c={bad} s={11} b />
      </g>
    ))}
    {/* panel 2 inverted cone and well */}
    <path d="M552,235 C540,215 548,190 550,160" fill="none" stroke={bad} strokeWidth={3} />
    <path d="M490,200 C520,198 540,170 552,150 C560,170 580,198 610,200" fill="none" stroke={bad} strokeWidth={3} />
    <rect x={546} y={60} width={12} height={110} fill="none" stroke={ink} strokeWidth={2} />
    <Tx x={552} y={50} t="pumped well" s={11} b />
    <Tx x={552} y={188} t="salt water rises" s={11} c={bad} />
    <Tx x={552} y={202} t="(inverted cone)" s={11} c={bad} />
    <Tx x={190} y={290} t="(a) natural balance" b />
    <Tx x={590} y={290} t="(b) pumping disturbs the balance" b />
    {/* G-H */}
    <line x1={240} y1={62} x2={240} y2={80} stroke={ink} markerStart="url(#sl)" markerEnd="url(#sl)" />
    <Tx x={228} y={76} a="end" t="h" b s={11} />
    <Tx x={190} y={160} t="z ≈ 40 h" s={11} c={ink} b />
    <Tx x={190} y={176} t="(Ghyben–Herzberg)" s={11} c={mute} />
  </svg>
)

/** water-content profile above the water table in coarse sand after drainage */
const SandColumnFig: FC = () => (
  <svg viewBox="0 0 700 320" width="100%" role="img" aria-label="Distribution of water above the water table in coarse sand after drainage">
    <Defs id="sc" />
    <rect x={40} y={20} width={300} height={280} fill="url(#scd)" stroke={ink} />
    <Tx x={190} y={14} t="coarse sand after drainage" s={11} c={mute} />
    {/* zones */}
    <line x1={40} y1={140} x2={340} y2={140} stroke={mute} strokeDasharray="4 3" />
    <line x1={40} y1={196} x2={340} y2={196} stroke={mute} strokeDasharray="4 3" />
    <line x1={40} y1={212} x2={340} y2={212} stroke={water} strokeWidth={3} />
    <rect x={40.5} y={212} width={299} height={87} fill={water} opacity={0.3} />
    <Tx x={350} y={85} a="start" t="Soil-water zone" b s={11} c={sn} />
    <Tx x={350} y={100} a="start" t="hygroscopic + some capillary water" s={11} c={mute} />
    <Tx x={350} y={170} a="start" t="Intermediate (vadose) zone" b s={11} c={sn} />
    <Tx x={350} y={185} a="start" t="pendular water held at grain contacts" s={11} c={mute} />
    <Tx x={350} y={206} a="start" t="Capillary fringe (thin in coarse sand)" b s={11} c={sn} />
    <Tx x={350} y={228} a="start" t="Water table" b s={11} c={water} />
    <Tx x={350} y={256} a="start" t="Zone of saturation (groundwater)" b s={11} c={sn} />
    <Tx x={350} y={272} a="start" t="all pores full: moisture = porosity n" s={11} c={mute} />
    <Tx x={350} y={32} a="start" t="Zone of aeration (unsaturated)" b s={12} c={accent} />
    {/* moisture profile */}
    <line x1={540} y1={20} x2={540} y2={300} stroke={ink} />
    <line x1={540} y1={300} x2={690} y2={300} stroke={ink} />
    <Tx x={615} y={316} t="moisture content" s={11} c={mute} />
    <path d="M545,30 L552,110 L560,196 C566,205 600,205 670,212 L670,300" fill="none" stroke={accent} strokeWidth={3} />
    <Tx x={560} y={118} a="start" t="S_r (retained)" s={11} c={accent} />
    <Tx x={668} y={224} a="end" t="n" s={11} b c={accent} />
  </svg>
)

/** specific yield: draining a column of unconfined aquifer */
const StorageFig: FC = () => (
  <svg viewBox="0 0 620 270" width="100%" role="img" aria-label="Unconfined storativity: specific yield when the water table falls">
    <Defs id="st" />
    <rect x={60} y={30} width={240} height={200} fill="url(#std)" stroke={ink} />
    <rect x={60} y={230} width={240} height={14} fill="url(#sth)" stroke={mute} />
    <rect x={60} y={90} width={240} height={140} fill={water} opacity={0.25} />
    <line x1={60} y1={90} x2={300} y2={90} stroke={water} strokeDasharray="6 4" strokeWidth={2} />
    <rect x={60} y={90} width={240} height={50} fill="none" stroke={bad} strokeWidth={2} strokeDasharray="5 3" />
    <line x1={60} y1={140} x2={300} y2={140} stroke={water} strokeWidth={3} />
    <Tx x={70} y={84} a="start" t="water table before" c={water} s={11} />
    <Tx x={70} y={158} a="start" t="water table after" c={water} s={11} b />
    <line x1={320} y1={90} x2={320} y2={140} stroke={ink} markerStart="url(#st)" markerEnd="url(#st)" />
    <Tx x={330} y={120} a="start" t="Δh drop" b />
    <Tx x={180} y={118} t="drained (gravity)" c={bad} s={11} b />
    <Tx x={180} y={200} t="unconfined aquifer, area A" s={11} c={mute} />
    <Tx x={340} y={40} a="start" t="Specific yield (unconfined storativity)" b c={sn} />
    <Tx x={340} y={64} a="start" t="S_y = V_w / V_aquifer" s={12} />
    <Tx x={340} y={84} a="start" t="V_w = S_y · A · Δh" s={12} b />
    <Tx x={340} y={104} a="start" t="the water that drains by gravity" s={11} c={mute} />
    <Tx x={340} y={118} a="start" t="when the water table falls" s={11} c={mute} />
    <Tx x={340} y={150} a="start" t="Confined: water is released by" s={11} c={mute} />
    <Tx x={340} y={164} a="start" t="compression and expansion only," s={11} c={mute} />
    <Tx x={340} y={178} a="start" t="so S is 0.005–0.00005" s={11} c={mute} />
    <Tx x={340} y={198} a="start" t="Unconfined: S_y is 0.01–0.30" s={11} c={ink} b />
    <Tx x={340} y={212} a="start" t="(dewatering, much larger)" s={11} c={mute} />
  </svg>
)

// ---------- lists ----------
const lists: EvList[] = [
  {
    id: 'l-gw-origin',
    topic: T,
    title: 'Types (sources) of groundwater by origin',
    ask: 'Describe briefly the different sources of groundwater.',
    points: [
      { k: 'Meteoric water', alt: ['meteoric'], d: 'from the atmosphere (rain, snow, lakes, rivers) infiltrating to the zone of saturation; almost all supply groundwater' },
      { k: 'Connate water', alt: ['connate', 'fossil water', 'sedimentary water'], d: 'trapped in sedimentary and volcanic rock when deposited; saline, no use as a source' },
      { k: 'Juvenile water', alt: ['juvenile', 'magmatic water', 'virgin water'], d: 'from the earth’s interior, enters the water cycle for the first time; some hot springs and geysers' },
    ],
    hook: 'Rain (Meteoric), Rock (Connate), Magma (Juvenile).',
    seen: ['2007-08', '2008-09'],
    src: 'SN L3 p1–2',
  },
  {
    id: 'l-gw-vertical',
    topic: T,
    title: 'Vertical distribution of subsurface water (top to bottom)',
    points: [
      { k: 'Soil-water zone', alt: ['soil water zone', 'belt of soil water'], d: 'ground surface through the root zone, less than saturated' },
      { k: 'Intermediate (vadose) zone', alt: ['vadose zone', 'intermediate zone'], d: 'non-moving water held by hygroscopic and capillary forces; 0 to over 100 m thick' },
      { k: 'Capillary fringe', alt: ['capillary zone'], d: 'just above the water table, water held by capillary forces' },
      { k: 'Zone of saturation', alt: ['saturated zone', 'groundwater zone'], d: 'pores full: the only water that flows to a well' },
      { k: 'Zone of rock flowage', alt: ['zone of rock flow'], d: 'deep, no interstices: "internal water"' },
    ],
    ordered: true,
    seen: ['2009-10'],
    src: 'SN L3 p3–4',
    note: 'The first three together form the zone of aeration. The crust has two main zones: rock fracture (above) and rock flowage (below).',
  },
  {
    id: 'l-gw-formations',
    topic: T,
    title: 'Classification of formations by water storage and transmission',
    ask: 'Classify and define the water-bearing formations.',
    points: [
      { k: 'Aquifer', d: 'saturated, porous and permeable: stores and transmits water (sand, gravel)' },
      { k: 'Aquitard', alt: ['leaky confining layer'], d: 'low permeability: transmits water vertically, not laterally (sandy clay); leaks to an aquifer below' },
      { k: 'Aquiclude', alt: ['confining layer'], d: 'porous, can hold much water but essentially impermeable (clay, shale, compact limestone)' },
      { k: 'Aquifuge', d: 'neither porous nor permeable, no interconnected openings (unfractured granite)' },
    ],
    hook: 'Fuge = Fails to hold or pass any water; Clude = Closed; Tard = Tardy (slow); Aqui-fer = Ferries water.',
    seen: ['2023-24', '2022-23'],
    src: 'SN L3 p4',
  },
  {
    id: 'l-gw-aquifer-types',
    topic: T,
    title: 'Types of aquifer',
    ask: 'Define confined, unconfined and perched aquifers.',
    points: [
      { k: 'Unconfined aquifer', alt: ['water table aquifer', 'phreatic aquifer', 'unconfined'], d: 'no upper impermeable layer; top of saturation = water table at atmospheric pressure; recharged by infiltration' },
      { k: 'Confined aquifer', alt: ['artesian aquifer', 'pressure aquifer', 'confined'], d: 'between two aquicludes / aquitards, under pressure; water rises above the aquifer top to the piezometric surface' },
      { k: 'Leaky aquifer', alt: ['semi-confined aquifer', 'leaky'], d: 'a confined aquifer where one or both confining layers are aquitards' },
      { k: 'Perched aquifer', alt: ['perched water table', 'perched'], d: 'small independent unconfined body above the main water table, over a lens of impermeable material with an unsaturated zone below' },
    ],
    seen: ['2009-10', '2022-23'],
    src: 'SN L3 p4–5',
  },
  {
    id: 'l-gw-properties',
    topic: T,
    title: 'Aquifer properties',
    ask: 'What are the aquifer properties?',
    points: [
      { k: 'Porosity', d: 'n = Vv / V: how much water the formation can hold' },
      { k: 'Permeability (hydraulic conductivity K)', alt: ['hydraulic conductivity', 'coefficient of permeability', 'permeability'], d: 'how easily water moves, velocity under unit gradient' },
      { k: 'Specific yield', alt: ['S_y', 'unconfined storativity'], d: 'water that drains by gravity per unit volume of saturated aquifer' },
      { k: 'Specific retention', alt: ['S_r'], d: 'water retained against gravity; n = Sy + Sr' },
      { k: 'Specific storage', alt: ['S_s'], d: 'water released per unit volume per unit fall of head' },
      { k: 'Storativity (storage coefficient)', alt: ['storativity', 'storage coefficient', 'storage coefficient S'], d: 'water released per unit area per unit fall of head' },
      { k: 'Transmissivity', alt: ['coefficient of transmissibility', 'T = Kb'], d: 'T = Kb: flow through unit width of the full thickness under unit gradient' },
    ],
    seen: ['2009-10', '2010-11'],
    src: 'SN L3 p6–9',
  },
  {
    id: 'l-gw-well-terms',
    topic: T,
    title: 'Terms for flow towards a well',
    ask: 'Define: static water level, converging flow, cone of depression, pumping water level, drawdown, radius of influence.',
    points: [
      { k: 'Static water level', alt: ['static level', 'SWL'], d: 'level when the well is at rest: water table (unconfined) or piezometric surface (confined)' },
      { k: 'Converging flow', alt: ['radial flow'], d: 'water flows from all directions through ever-smaller cylindrical sections, so velocity rises towards the well' },
      { k: 'Cone of depression', alt: ['drawdown cone'], d: 'inverted-cone shaped water surface around a pumping well' },
      { k: 'Pumping water level', alt: ['pumping level', 'dynamic water level'], d: 'apex of the cone: water level in the well during pumping' },
      { k: 'Drawdown', alt: ['drawdown D−d'], d: 'static level minus pumping level, D − d; zero at the edge, maximum at the well' },
      { k: 'Radius of influence', alt: ['radius of circle of influence', 'R'], d: 'distance from the well centre to the outer limit of the cone' },
    ],
    seen: ['2007-08', '2008-09', '2009-10', '2012-13', '2015-16', '2016-17', '2021-22'],
    src: 'SN L3 p9–10; "static water level" etc. definitions from Delwar sir note',
  },
  {
    id: 'l-gw-thiem-assume',
    topic: T,
    title: 'Assumptions of the Thiem (confined aquifer) derivation',
    ask: 'State the assumptions considered in the derivation of the steady radial flow expression for a confined aquifer.',
    points: [
      { k: 'Horizontal aquifer', alt: ['aquifer is horizontal'] },
      { k: 'Confined between impermeable top and bottom', alt: ['confined between two parallel and horizontal impermeable formations', 'impermeable layers above and below'] },
      { k: 'Infinite horizontal extent', alt: ['infinite extent', 'infinite areal extent'] },
      { k: 'Constant thickness', alt: ['uniform thickness'] },
      { k: 'Homogeneous and isotropic', alt: ['homogeneous isotropic'] },
      { k: 'Single pumping well at constant rate', alt: ['constant pumping rate', 'one well'] },
      { k: 'Fully penetrating well', alt: ['well penetrates the entire aquifer'] },
      { k: 'Steady state', alt: ['steady flow', 'no change in drawdown with time'], d: 'negligible change in the drawdown curve with time' },
      { k: 'Radial horizontal flow, Darcy valid', alt: ['Darcy’s law valid', 'flow is horizontal and radial'], d: 'head before pumping constant at D; well storage neglected' },
    ],
    seen: ['2022-23'],
    src: 'SN L3 p11',
  },
  {
    id: 'l-gw-dupuit-assume',
    topic: T,
    title: 'Assumptions of the Dupuit (unconfined aquifer) derivation',
    points: [
      { k: 'Flow is horizontal and radial towards the well', alt: ['horizontal radial flow'] },
      { k: 'Vertical component of flow is negligible', alt: ['no vertical flow'], d: 'Dupuit assumption' },
      { k: 'Hydraulic gradient equals the slope of the water table', alt: ['gradient = water table slope'], d: 'dy/dx, same at all depths on a vertical line' },
      { k: 'Homogeneous isotropic aquifer on a horizontal impermeable base', alt: ['homogeneous and isotropic', 'horizontal base'] },
      { k: 'Fully penetrating well, constant Q, steady state', alt: ['steady state', 'constant pumping rate', 'fully penetrating'] },
      { k: 'Darcy’s law valid', alt: ['laminar flow'] },
    ],
    seen: [],
    src: 'SN L3 p10',
    note: 'More accurate when D is much larger than the drawdown D − d; inaccurate where the water table is steep or the flow strongly vertical.',
  },
  {
    id: 'l-gw-interference-effects',
    topic: T,
    title: 'Effects of interference of wells',
    points: [
      { k: 'Reduced yield of each well', alt: ['reduced discharge', 'lower discharge per unit drawdown'], d: 'discharge per unit drawdown falls' },
      { k: 'Higher pumping lift and cost', alt: ['increased pumping cost', 'greater lift'] },
      { k: 'Water level may fall below the pump intake', alt: ['well may go dry'], d: 'the well may go dry' },
    ],
    seen: [],
    src: 'SN L3 p12',
    note: 'Cones overlap, and the drawdown at any point is the sum of the drawdowns from each well. Spacing of 250–500 ft is satisfactory for water supply.',
  },
  {
    id: 'l-gw-recharge-purposes',
    topic: T,
    title: 'Purposes of artificial recharge of groundwater',
    points: [
      { k: 'Disposal of wastewater', alt: ['wastewater disposal'] },
      { k: 'Replenishment of over-pumped aquifers', alt: ['replenish overpumped aquifer'] },
      { k: 'Barrier against salt-water intrusion', alt: ['salt water barrier', 'prevent intrusion'] },
      { k: 'Replace surface storage by ground storage', alt: ['increase safe yield of surface supplies'] },
    ],
    seen: [],
    src: 'Delwar sir note (seniors); not in the slides',
  },
  {
    id: 'l-gw-salt-options',
    topic: T,
    title: 'Options to prevent pumping salt water',
    ask: 'What technological options can be adopted to prevent pumping salt water?',
    points: [
      { k: 'Limit the pumping rate and drawdown', alt: ['reduce pumping', 'reduce abstraction', 'small drawdown'], d: 'every 1 m of drawdown raises the salt water about 40 m' },
      { k: 'Shallow skimming or radial / collector wells', alt: ['radial well', 'skimming well', 'collector well', 'shallow wells'], d: 'draw fresh water over a wide area with a small drawdown' },
      { k: 'Recharge barrier', alt: ['artificial recharge', 'recharge', 'injection wells'], d: 'recharge with fresh water to keep the interface down' },
      { k: 'Pumping trough or abstraction barrier', alt: ['extraction barrier', 'salt water extraction wells'], d: 'pump salt water ahead of the fresh-water wells' },
      { k: 'Locate wells farther inland', alt: ['relocate wells', 'move wells inland'] },
      { k: 'Use surface water or rainwater instead', alt: ['alternative source', 'rainwater harvesting', 'surface water'] },
    ],
    seen: ['2010-11'],
    src: 'SN L1/L4b (salinity as a problem); Delwar sir note (z = 40h, radial well, recharge); the other options are textbook',
  },
  {
    id: 'l-gw-bd-aquifers',
    topic: T,
    title: 'Vertical aquifer zones of Bangladesh',
    points: [
      { k: 'Shallow (upper) aquifer', alt: ['shallow aquifer', 'upper aquifer'], d: 'very fine to fine sand, up to 60 m in the south; poor to moderate yield; arsenic-prone' },
      { k: 'Main aquifer', alt: ['main'], d: 'medium to coarse sand and gravel, 5 m (NW) to 140 m (south); main irrigation and drinking source; unconfined to leaky' },
      { k: 'Deep aquifer', alt: ['deep'], d: 'below 150 to 300+ m, under thick clay aquitards; safer, low salinity, for coastal and urban areas' },
    ],
    ordered: true,
    seen: [],
    src: 'SN L4b p4–5',
  },
]

// ---------- cards ----------
const cards: EvCard[] = [
  { id: 'c-gw-def', topic: T, front: 'Define groundwater (SN L3).', back: 'Water in the voids of soil and rock, and in fractures of rock formations; about 30% of the world’s readily available fresh water. In the saturation zone it is the only subsurface water that readily flows to a well.', src: 'SN L3 p1, L1 p6' },
  { id: 'c-gw-aquifer', topic: T, front: 'Define an aquifer.', back: 'A saturated soil or rock formation that is considerably porous and permeable, so water can be stored in it and flow through it (unconsolidated sand and gravel make a good aquifer). Little water is found below about 600 m (2000 ft).', seen: ['2023-24'], src: 'SN L3 p4' },
  { id: 'c-gw-aquitard', topic: T, front: 'What is an aquitard?', back: 'A leaky confining layer of low permeability (for example sandy clay) that may transmit water vertically but not laterally under a typical gradient; appreciable water can leak to an aquifer below.', seen: ['2022-23', '2023-24'], src: 'SN L3 p4' },
  { id: 'c-gw-aquiclude', topic: T, front: 'What is an aquiclude?', back: 'A confining layer that is essentially impermeable. It may hold large amounts of water because of its porosity, but the water cannot move (hard, compact, cemented rock, shale, some limestone).', seen: ['2023-24'], src: 'SN L3 p4' },
  { id: 'c-gw-aquifuge', topic: T, front: 'What is an aquifuge?', back: 'A formation that is neither porous nor permeable (for example unfractured granite): no interconnected openings, so it can neither hold nor transmit water.', seen: ['2023-24'], src: 'SN L3 p4' },
  { id: 'c-gw-perched', topic: T, front: 'What is a perched aquifer (perched water body)?', back: 'An independent unconfined aquifer separated from the main body of groundwater below by an unsaturated zone; it forms above a local impermeable lens or discontinuous aquitard, above the regional water table. Small yield; often confused with the main water table.', seen: ['2009-10', '2022-23'], src: 'SN L3 p5' },
  { id: 'c-gw-artesian', topic: T, front: 'What is an artesian well and a flowing artesian well?', back: 'A well in a confined aquifer where the water rises above the top of the aquifer because of pressure, to the piezometric (potentiometric) surface. If the piezometric surface is above the ground the well flows without pumping: a **flowing artesian well**.', seen: ['2022-23'], src: 'SN L3 p5' },
  { id: 'c-gw-piezo', topic: T, front: 'What is the piezometric surface?', back: 'The imaginary surface to which water rises in wells tapping a confined aquifer. It is the "static water level" of a confined aquifer, the analogue of the water table.', src: 'SN L3 p5' },
  { id: 'c-gw-wt', topic: T, front: 'What is the water table?', back: 'The upper surface of the zone of saturation in an unconfined aquifer, at atmospheric pressure; the highest level water rises to in a well or piezometer. It is in constant motion with seasons, pumping and recharge.', src: 'SN L3 p4–5' },
  { id: 'c-gw-sy-vs-s', topic: T, front: 'Specific yield vs storativity?', back: '**Specific yield $S_y$**: volume that drains by gravity per unit volume of saturated unconfined aquifer ($V_w/V$), 0.01–0.30. **Storativity $S$** (confined): volume released per unit area per unit fall of head ($S=S_sb$), 0.005–0.00005: only from compression, so much smaller.', seen: ['2022-23', '2023-24'], src: 'SN L3 p8' },
  { id: 'c-gw-unconf-s', topic: T, front: 'Why is specific yield called "unconfined storativity"?', back: 'Because in an unconfined aquifer storage is almost entirely by draining the pores as the water table falls: $S_{unconfined}=S_y+S_sb_{avg}$ and the $S_sb$ term is negligible, so the storativity is essentially $S_y$.', seen: ['2023-24'], src: 'SN L3 p8' },
  { id: 'c-gw-sr', topic: T, front: 'Specific retention and porosity relation?', back: '$S_r$ is the water held against gravity (capillary and molecular forces). $n=\\dfrac{V_{void}}{V}=S_y+S_r$. Clay has high porosity but very low specific yield.', src: 'SN L3 p8' },
  { id: 'c-gw-porosity', topic: T, front: 'Porosity: definition and qualitative classes.', back: '$n=V_v/V\\times100\\%$. More than 20% large; 5–20% medium; under 5% small. Porosity says how much water a formation can hold; permeability says how easily it moves. Both are needed for an aquifer.', src: 'SN L3 p6' },
  { id: 'c-gw-darcy', topic: T, front: 'State Darcy’s law and the coefficient of permeability.', back: '$v=Ki$ with $i=\\Delta h/l$, so $Q=KAi$. $K$ is the velocity under unit hydraulic gradient (m³/m²·day, hydraulic conductivity); $K=CD_{10}^2$ relates it to effective size.', seen: ['2010-11'], src: 'SN L3 p6' },
  { id: 'c-gw-t', topic: T, front: 'Transmissivity T: definition, units, a good aquifer?', back: '$T=Kb$ (b = aquifer thickness, saturated thickness for unconfined): rate of flow through a vertical strip of unit width and full thickness under unit gradient; m²/s. T above 0.015 m²/s usually means a good aquifer.', src: 'SN L3 p7' },
  { id: 'c-gw-ss', topic: T, front: 'Specific storage $S_s$.', back: 'Volume of water a unit volume of aquifer releases from storage per unit drop in hydraulic head: $S_s=V_w/(V\\Delta h)$, units 1/m. Applies to confined and unconfined aquifers.', src: 'SN L3 p6' },
  { id: 'c-gw-cone', topic: T, front: 'Define the cone of depression and the radius of influence.', back: 'Pumping lowers the water level around the well into an inverted cone, apex at the pumping level in the well. The radius of influence R is the distance from the well centre to the outer limit of the cone, where drawdown is zero. The cone expands and deepens ever more slowly; equilibrium may be reached.', seen: ['2021-22'], src: 'SN L3 p9–10' },
  { id: 'c-gw-spec-cap', topic: T, front: 'What is the specific capacity of a well?', back: 'The yield per unit drawdown, $Q/(D-d)$, in m³/d (or L/s) per m of drawdown. Since $Q\\propto(D-d)$ when the drawdown is small compared with D, it is roughly constant for a well.', src: 'SN L3 p10' },
  { id: 'c-gw-dupuit', topic: T, front: 'Dupuit equation (unconfined well).', back: '$Q=\\dfrac{\\pi K(D^2-d^2)}{\\ln(R/r)}$, Q in m³/d, K in m³/m²·d. Valid for horizontal radial flow with the gradient equal to the water-table slope (best when D is much larger than the drawdown).', seen: ['2008-09', '2016-17', 'Jan 2021', '2020-21', '2021-22'], src: 'SN L3 p10' },
  { id: 'c-gw-thiem', topic: T, front: 'Thiem equation (confined well).', back: '$Q=\\dfrac{2\\pi Kb(D-d)}{\\ln(R/r)}=\\dfrac{2\\pi T(D-d)}{\\ln(R/r)}$. Depth of flow is constant, b.', seen: ['2015-16', '2022-23'], src: 'SN L3 p11' },
  { id: 'c-gw-k-test', topic: T, front: 'K from two observation wells, confined and unconfined.', back: 'Confined: $K=\\dfrac{Q\\ln(r_2/r_1)}{2\\pi b(h_2-h_1)}$. Unconfined: $K=\\dfrac{Q\\ln(r_2/r_1)}{\\pi(h_2^2-h_1^2)}$, with h the depth of water at the observation wells.', src: 'SN L3 p10–11' },
  { id: 'c-gw-interf', topic: T, front: 'Interference of two identical wells a apart: yield formulas.', back: 'Replace $\\ln(R/r)$ by $\\ln(R^2/(r\\,a))$ for each of two equal wells pumped together. Unconfined: $Q_1=Q_2=\\pi K(D^2-d^2)/\\ln(R^2/ra)$ (the printed "2π" is a typo, π is used); confined: $2\\pi Kb(D-d)/\\ln(R^2/ra)$.', src: 'SN L3 p12–13' },
  { id: 'c-gw-interf-sup', topic: T, front: 'How is drawdown combined when cones overlap?', back: 'By superposition: the drawdown at any point on the composite cone equals the sum of the drawdowns there from each pumping well. Wells 250–500 ft apart are satisfactory for water supply.', src: 'SN L3 p12' },
  { id: 'c-gw-sw-gh', topic: T, front: 'Ghyben–Herzberg relation for salt water.', back: '$z=\\dfrac{\\rho_f}{\\rho_s-\\rho_f}h\\approx40h$ ($\\rho_f=1$, $\\rho_s=1.025$ g/cc): salt water lies about 40 times h below sea level for h of fresh water above it, so each metre of drawdown raises the interface about 40 m.', seen: ['2010-11', 'Jan 2021'], src: 'Delwar sir note (seniors); not in the CE22 slides' },
  { id: 'c-gw-origin', topic: T, front: 'Which type of groundwater is the supply source?', back: 'Meteoric water (from rain and snow): almost all supply groundwater. Connate (fossil, saline) and juvenile (magmatic, virgin) water are of no importance as exploitable sources.', seen: ['2007-08', '2008-09'], src: 'SN L3 p1–2' },
  { id: 'c-gw-unconf-conf', topic: T, front: 'Unconfined vs confined: flow and static level.', back: 'Unconfined: flow by gravity, static level at the water table. Confined: flow by pressure, always under pressure; the static level is imaginary (piezometric surface) and lies above the aquifer top.', src: 'class note C#6' },
  { id: 'c-gw-dhaka', topic: T, front: 'The Dhaka aquifer (Dupi Tila).', back: 'Madhupur clay over Dupi Tila sands about 140 m thick; supplies 95% of Dhaka’s drinking water. $S_s\\approx10^{-5}$/m; $S_y$ 0.005 (clay), 0.08 (fine sand), 0.2 (medium sand); K 15–30 m/d; Ca/Mg–HCO₃ water.', src: 'SN L4b p5' },
  { id: 'c-gw-sy-bd', topic: T, front: 'Specific yield and share of Bangladesh aquifers.', back: 'Specific yield varies from 0.02 to 0.25 and storage capacity rises with depth. The alluvial aquifer system supports 90% of irrigation and 99% of drinking water.', src: 'SN L4b p4–5' },
  { id: 'c-gw-springs', topic: T, front: 'What is a gravity spring?', back: 'A spring where the water table meets the ground surface (a land depression below the water table, or a hillside), so water flows out by gravity. Springs and seepage appear where the water table intersects the land surface.', seen: ['2010-11'], src: 'SN L3 p4; textbook' },
]

// ---------- answers ----------
const answers: EvAnswer[] = [
  {
    id: 'a-gw-origin',
    topic: T,
    q: 'Describe briefly the different sources (types) of groundwater.',
    seen: ['2007-08', '2008-09'],
    a: String.raw`### Groundwater by origin
1. **Meteoric water**: derived from the atmosphere (rain, snow, lakes, rivers); it infiltrates through pores, fissures and joints to the zone of saturation. About 26,000 cubic miles fall on the continents each year. Almost all water supply groundwater is of this type.
2. **Connate water** (fossil or sedimentary water): trapped in the interstices of sedimentary and volcanic rock when it was deposited in water; found deep in the saturation zone; normally **saline** and highly mineralised, does not mix with meteoric water, and is of no importance as a source.
3. **Juvenile (magmatic) water**: comes from the earth’s interior with magmatic activity; vapour from hot magma condenses and enters the water cycle for the first time (**virgin water**). Some hot springs and geysers are derived from it.`,
    keys: ['Meteoric', 'Connate', 'Juvenile', 'fossil', 'saline', 'virgin water', 'magmatic'],
    lists: ['l-gw-origin'],
    src: 'SN L3 p1–2',
  },
  {
    id: 'a-gw-vertical',
    topic: T,
    q: 'Describe the vertical distribution of subsurface water (and of water in coarse sand above the water table after drainage), with a sketch.',
    seen: ['2009-10'],
    a: String.raw`### Zones (top to bottom)
Below the ground the crust has a **zone of rock fracture** (stresses within the elastic limit, interstices exist) over a **zone of rock flowage** (no interstices, "internal water"). The zone of rock fracture holds the water of interest:

**A. Zone of aeration** (unsaturated: pores partly water, partly air)
1. **Soil-water zone**: ground surface through the root zone; less than saturated.
2. **Intermediate (vadose) zone**: non-moving water held by hygroscopic and capillary forces; 0 to over 100 m thick.
3. **Capillary fringe**: just above the water table; water suspended by capillary forces; thickness depends on texture and is nearly zero where pores are large.

**B. Zone of saturation**: all pores full, under hydrostatic pressure. Its water is **groundwater**, the only subsurface water that readily flows to a well.

### Coarse sand after drainage
The water has drained by gravity from the pores above the water table, leaving only **specific retention** (hygroscopic water on the grains and pendular water at the contacts). Below the water table the moisture content equals the **porosity**. The capillary fringe is very thin because the pores are large. The moisture-content profile in the sketch shows the low retained value above, the jump through the thin fringe, and saturation below the water table.`,
    keys: ['zone of rock fracture', 'Zone of aeration', 'Soil-water zone', 'vadose', 'Capillary fringe', 'Zone of saturation', 'specific retention', 'porosity', 'water table'],
    lists: ['l-gw-vertical'],
    src: 'SN L3 p3–4 (zones); the moisture profile in coarse sand is the textbook idea',
    Fig: SandColumnFig,
  },
  {
    id: 'a-gw-formations',
    topic: T,
    q: 'Classify and define the types of water-bearing ground formation on the basis of water transmitting and water storage capacity.',
    seen: ['2022-23', '2023-24'],
    a: String.raw`### Four categories of the saturated zone
| Formation | Defines | Example |
|---|---|---|
| **Aquifer** | saturated, considerably **porous and permeable**: stores and transmits water | sand, gravel |
| **Aquitard** | low-permeability **leaky confining layer**: transmits vertically but not laterally; water may leak to an aquifer | sandy clay |
| **Aquiclude** | porous, may hold much water but essentially **impermeable**: stores, does not transmit | clay, shale, compact limestone |
| **Aquifuge** | **neither porous nor permeable**: no interconnected openings | unfractured granite |

Ranking by transmission: aquifer (good) > aquitard (poor, vertical) > aquiclude (none) = aquifuge (none); by storage: aquifer and aquiclude can hold water, aquifuge cannot.`,
    keys: ['Aquifer', 'Aquitard', 'Aquiclude', 'Aquifuge', 'porous and permeable', 'leaky confining layer', 'impermeable', 'neither porous nor permeable'],
    lists: ['l-gw-formations'],
    src: 'SN L3 p4',
    Fig: FormationsFig,
  },
  {
    id: 'a-gw-aquifers',
    topic: T,
    q: 'Define confined, unconfined and leaky aquifers with neat sketches. What is a perched water body?',
    seen: ['2009-10', '2022-23'],
    a: String.raw`### Aquifer types
1. **Unconfined (water table) aquifer**: not confined by an upper impermeable layer. Its top is the **water table** at atmospheric pressure, the highest level water rises to in a well. Recharged by infiltration of rain; the water table rises and falls with seasons and pumping.
2. **Confined (artesian, pressure) aquifer**: between two aquicludes / aquitards, **under pressure**. Water in a well rises above the aquifer top to the **piezometric (potentiometric) surface**. If this surface is above the ground the well is a **flowing artesian well**. Recharged where the aquifer is exposed (the recharge area) or by leakage.
3. **Leaky aquifer**: a confined aquifer where one or both confining layers are **aquitards**, so water leaks in or out.

### Perched water body
A **perched aquifer** is a small independent unconfined body of water held above the regional water table by a local lens of impermeable or low-permeability material, separated from the main groundwater by an **unsaturated zone**. It has a small yield, dries quickly and is often mistaken for the main water table. A well drilled into it gives water, then goes dry or through it to the main aquifer.`,
    keys: ['Unconfined', 'water table', 'Confined', 'piezometric', 'flowing artesian well', 'Leaky', 'aquitards', 'Perched', 'unsaturated zone', 'recharge'],
    lists: ['l-gw-aquifer-types'],
    src: 'SN L3 p4–5',
    Fig: AquiferTypesFig,
  },
  {
    id: 'a-gw-notes-aqt',
    topic: T,
    q: 'Write short notes on: (i) aquitard, (ii) perched aquifer, (iii) flowing artesian well.',
    seen: ['2022-23'],
    a: String.raw`### (i) Aquitard
A **leaky confining layer** of low permeability (for example sandy clay). It transmits water **vertically but not laterally** under a typical gradient; appreciable water may leak into or out of the aquifer below or above it. Confined aquifers bounded by aquitards are **leaky aquifers**.

### (ii) Perched aquifer
An **independent unconfined** body of water **above the regional water table**, resting on a local impermeable or discontinuous aquitard / aquiclude lens and separated from the main groundwater by an **unsaturated zone**. Small yield; often confused with the true water table.

### (iii) Flowing artesian well
A well in a **confined aquifer** whose **piezometric surface is above the ground level**. Under the aquifer pressure the water rises above the ground and **flows without pumping**. If the piezometric level is above the aquifer top but below the ground the well is an ordinary (non-flowing) artesian well.`,
    keys: ['leaky confining layer', 'vertically but not laterally', 'independent unconfined', 'unsaturated zone', 'confined aquifer', 'piezometric surface', 'flows without pumping'],
    lists: ['l-gw-formations', 'l-gw-aquifer-types'],
    src: 'SN L3 p4–5',
    Fig: AquiferTypesFig,
  },
  {
    id: 'a-gw-flow-well',
    topic: T,
    q: 'State the hydraulics of groundwater flow towards a well (cone of depression, drawdown, radius of influence), with a sketch.',
    seen: ['2008-09', '2012-13', '2015-16', '2016-17', 'Jan 2021', '2021-22'],
    a: String.raw`### Hydraulics of flow to a well
1. **Static water level (D)**: the level when the well is at rest: the water table (unconfined) or the piezometric surface (confined).
2. **Pumping lowers the pressure in the well**; the higher pressure in the aquifer forces water in from **all directions**: **converging (radial) flow**.
3. The water passes through **cylindrical sections that get smaller** towards the well. The same Q must pass each, so the **velocity rises** and the **hydraulic gradient steepens** near the well ($Q=AV=KAi$).
4. The water surface takes the shape of an **inverted cone**: the **cone of depression**, with its apex at the **pumping water level (d)** in the well.
5. **Drawdown** $=D-d$: zero at the outer limit, maximum at the well.
6. **Radius of influence R**: distance from the well centre to the outer limit of the cone.
7. With time the cone **expands and deepens more slowly**, and an equilibrium may occur; this steady state gives the Dupuit (unconfined) and Thiem (confined) formulas.

For two wells close together the cones overlap (**interference**) and the drawdowns add.`,
    keys: ['Static water level', 'converging', 'cylindrical sections', 'hydraulic gradient', 'cone of depression', 'pumping water level', 'Drawdown', 'Radius of influence', 'interference'],
    lists: ['l-gw-well-terms'],
    src: 'SN L3 p9–10',
    Fig: ConeFig,
  },
  {
    id: 'a-gw-dupuit',
    topic: T,
    q: 'Deduce a mathematical expression for the yield of a well in an unconfined aquifer (Dupuit).',
    seen: ['2008-09', '2016-17', 'Jan 2021', '2020-21', '2021-22'],
    a: String.raw`### Assumptions
Flow is **horizontal and radial** towards the well; the vertical component is negligible, so the **hydraulic gradient equals the water-table slope**; homogeneous isotropic aquifer on a horizontal impermeable base; fully penetrating well, constant Q, **steady state**, Darcy valid.

### Derivation (the figure shows x, y, D, d, r, R)
1. Static depth of water above the base = $D$; depth in the well while pumping = $d$; well radius $r$; radius of influence $R$ (depth $D$ there).
2. At a distance $x$ from the well axis the water depth is $y$. Gradient $i=\dfrac{dy}{dx}$.
3. Flow area is the cylinder of radius $x$ and height $y$: $A=2\pi x\,y$.
4. Darcy: $Q=KAi$, so $$Q=2\pi K\,x\,y\,\frac{dy}{dx}$$
5. Separate the variables: $$Q\,\frac{dx}{x}=2\pi K\,y\,dy$$
6. Integrate: $$Q\ln x=\pi K\,y^2+C$$
7. Boundary conditions: $y=d$ at $x=r$ and $y=D$ at $x=R$. Subtract the two equations to remove $C$: $$Q\ln\frac{R}{r}=\pi K\,(D^2-d^2)$$
8. Hence the **yield (Dupuit formula)** $$\boxed{Q=\frac{\pi K\,(D^2-d^2)}{\ln (R/r)}}$$
Q in m³/d with K in m³/m²·d (same length unit throughout).

### Remarks
- $D^2-d^2=(D+d)(D-d)$: for small drawdown $Q\propto(D-d)$, so the **specific capacity** $Q/(D-d)$ is nearly constant.
- Accurate when $D\gg(D-d)$; inaccurate where the water-table slope is steep or the flow is strongly vertical.
- From two observation wells at $r_1$, $r_2$ (depths $h_1$, $h_2$): $K=\dfrac{Q\ln(r_2/r_1)}{\pi(h_2^2-h_1^2)}$.`,
    keys: ['horizontal and radial', 'hydraulic gradient equals', 'Darcy', 'Q=2\\pi K', 'Integrate', 'Boundary conditions', 'Dupuit', 'specific capacity', 'ln (R/r)'],
    lists: ['l-gw-dupuit-assume'],
    src: 'SN L3 p10',
    Fig: DupuitFig,
  },
  {
    id: 'a-gw-thiem',
    topic: T,
    q: 'Deduce the expression for the yield of a well in a confined aquifer (steady radial flow, Thiem), and state the assumptions.',
    seen: ['2015-16', '2022-23'],
    a: String.raw`### Assumptions
The aquifer is **horizontal**, **confined between two parallel horizontal impermeable formations**, of **infinite horizontal extent** and **constant thickness**, **homogeneous and isotropic**; a **single** well **fully penetrates** it and pumps at a **constant rate**; the well diameter is very small (storage in the well neglected); the head before pumping is constant at $D$; flow is radial and **steady** (negligible change of the drawdown curve with time); Darcy's law holds.

### Derivation (the figure shows b, D, d, x, y, r, R)
1. Thickness $b$ is constant, so at a distance $x$ the flow area is $A=2\pi x\,b$ (cylinder of height b).
2. The gradient is $i=\dfrac{dy}{dx}$, where $y$ is the piezometric head at $x$.
3. Darcy: $Q=KAi$, so $$Q=2\pi K b\,x\,\frac{dy}{dx}$$
4. Separate the variables: $$Q\,\frac{dx}{x}=2\pi K b\,dy$$
5. Integrate from $x=r$ ($y=d$) to $x=R$ ($y=D$): $$Q\ln\frac{R}{r}=2\pi K b\,(D-d)$$
6. Hence the **yield of a well in a confined aquifer** $$\boxed{Q=\frac{2\pi K b\,(D-d)}{\ln (R/r)}=\frac{2\pi T\,(D-d)}{\ln (R/r)}}$$
with $T=Kb$ the transmissivity: this is the **Thiem equation**. Q is proportional to the drawdown.

### Use
K from observation wells at $r_1$, $r_2$: $K=\dfrac{Q\ln(r_2/r_1)}{2\pi b\,(h_2-h_1)}$. For two equal wells a apart pumped together replace $\ln(R/r)$ by $\ln\!\big(R^2/(r\,a)\big)$.`,
    keys: ['horizontal', 'infinite horizontal extent', 'constant thickness', 'homogeneous and isotropic', 'single', 'steady', 'A=2\\pi x', 'Integrate', 'Thiem', 'transmissivity'],
    lists: ['l-gw-thiem-assume'],
    src: 'SN L3 p11–12',
    Fig: ThiemFig,
  },
  {
    id: 'a-gw-storage',
    topic: T,
    q: 'Define storativity (storage coefficient) and specific yield. Why is the specific yield of an unconfined aquifer called "unconfined storativity"? Show with a sketch.',
    seen: ['2009-10', '2022-23', '2023-24'],
    a: String.raw`### Definitions
- **Specific storage** $S_s$: volume of water a unit volume of aquifer releases from storage per unit drop in hydraulic head, $S_s=\dfrac{V_w}{V\,\Delta h}$ (units 1/m).
- **Storativity (storage coefficient) S** of a confined aquifer: volume of water released per **unit surface area** per **unit drop of head**: $S=S_s\,b=\dfrac{V_w}{A\,\Delta h}$; dimensionless, **0.005 to 0.00005**. The water comes only from compression of the aquifer and expansion of water.
- **Specific yield** $S_y$: volume of water that drains by **gravity** from a saturated unconfined aquifer when the water table falls, per unit volume: $S_y=\dfrac{V_w}{V_{aquifer}}$; usually **0.01 to 0.30**. Related to porosity by $n=S_y+S_r$ ($S_r$ = specific retention).

### Why "unconfined storativity"
In an unconfined aquifer $S_{unconfined}=S_y+S_s\,b_{avg}$. Storage is almost entirely by **draining the pores** as the water table falls, and the compressibility term $S_sb$ is negligible. So the storage coefficient of an unconfined aquifer is essentially $S_y$, much larger than the confined $S$.

### Volume released
$V_w=S\,A\,\Delta h$ (confined) and $V_w=S_y\,A\,\Delta h$ (unconfined), A the area and $\Delta h$ the fall of head / water table.`,
    keys: ['Specific storage', 'Storativity', 'unit surface area', '0.005 to 0.00005', 'Specific yield', 'gravity', 'unconfined storativity', 'S_y', 'porosity'],
    lists: ['l-gw-properties'],
    src: 'SN L3 p6–8',
    Fig: StorageFig,
  },
  {
    id: 'a-gw-k-notes',
    topic: T,
    q: 'Write short notes on hydraulic conductivity (permeability) and transmissivity of an aquifer.',
    seen: ['2010-11'],
    a: String.raw`### Hydraulic conductivity K (coefficient of permeability)
- From **Darcy's law**: velocity through porous media is proportional to the head loss and inversely to the path length, $v=Ki$, $i=\dfrac{h_A-h_B}{l}$, so $Q=KAi$.
- $K$ is the **velocity under unit hydraulic gradient**, usually in m³/m²·day (m/day): how easily a liquid moves through the soil. It depends on the grain size ($K=C\,D_{10}^2$), shape, packing and the fluid.
- High for clean sand and gravel, low for clay.

### Transmissivity T
- $T=Kb$ for a confined aquifer of thickness $b$ (saturated thickness for unconfined), unit m²/s or m²/d.
- The rate of flow through a vertical strip of **unit width** and the full aquifer thickness under **unit hydraulic gradient**.
- $T>0.015$ m²/s usually indicates a good aquifer for well exploration.
- Used in the Thiem equation $Q=2\pi T(D-d)/\ln(R/r)$.`,
    keys: ['Darcy', 'velocity under unit hydraulic gradient', 'm³/m²·day', 'D_{10}', 'Transmissivity', 'unit width', 'T=Kb', '0.015'],
    lists: ['l-gw-properties'],
    src: 'SN L3 p6–7',
  },
  {
    id: 'a-gw-interference',
    topic: T,
    q: 'What is interference of wells? Give its effects and the yield of two interfering wells.',
    seen: [],
    a: String.raw`### Interference
A group of small wells may be cheaper than one large well, but wells placed close together have **overlapping cones of depression**. The drawdown at any point on the composite cone equals the **sum of the drawdowns** at that point due to each pumping well (superposition).

### Effects
1. **Reduced yield** of each well: less discharge per unit drawdown.
2. **Higher pumping lift** and cost.
3. The water level in a well may fall **below the pump intake**: the well goes dry.
Space the wells for minimum interference; for water supply **250 to 500 ft** is satisfactory.

### Two identical wells, spacing $a$, pumped together ($Q_1=Q_2$)
Replace $\ln(R/r)$ by $\ln\!\big(R^2/(r\,a)\big)$:
- Unconfined: $Q=\dfrac{\pi K(D^2-d^2)}{\ln\!\big(R^2/(r a)\big)}$
- Confined: $Q=\dfrac{2\pi K b\,(D-d)}{\ln\!\big(R^2/(r a)\big)}$
Steps: find K from a single-well test, then R, then the interfering yield.`,
    keys: ['overlapping cones', 'sum of the drawdowns', 'Reduced yield', 'pumping lift', 'pump intake', '250 to 500 ft', 'R^2/(r a)'],
    lists: ['l-gw-interference-effects'],
    src: 'SN L3 p12–13',
  },
  {
    id: 'a-gw-salt',
    topic: T,
    q: 'Explain with diagrams the mechanism of salt-water intrusion in coastal wells. What technological options can prevent pumping salt water?',
    seen: ['2010-11', '2012-13', 'Jan 2021', '2020-21'],
    a: String.raw`### Mechanism (diagram: natural balance, then pumping)
1. Fresh groundwater (density 1.00) **floats on** denser sea water (1.025). In nature the **sloping water table** gives a hydraulic gradient towards the sea, so fresh water flows out through a **seepage face** into the sea.
2. The **interface** between fresh and salt water is held by the **hydrodynamic balance** of the two. By **Ghyben–Herzberg**, salt water lies about $z=\dfrac{\rho_f}{\rho_s-\rho_f}h\approx40h$ below sea level when the fresh-water table is $h$ above it.
3. **Pumping** lowers the water table around the well; the balance is disturbed and the salt water rises as an **inverted cone** (upconing) towards the well. **Each metre of drawdown raises the interface about 40 m**; the salt water also advances inland (lateral intrusion) when the fresh-water flow to the sea is reduced.
4. When the cone reaches the well screen the well **pumps salt water**. In Bangladesh intensive pumping, sea-level rise and low river flow worsen it in the coastal districts.

### Options to prevent pumping salt water
1. Limit pumping rate and **drawdown**.
2. **Shallow skimming or radial (collector) wells** that draw a large area with a small drawdown.
3. **Artificial recharge** (injection or recharge pond) to form a fresh-water **barrier** and push the interface down.
4. A pumping trough / **salt-water extraction wells** between the sea and the supply wells.
5. Locate wells **inland**, away from the coast.
6. Use an alternative source: **rainwater harvesting**, surface water or deep fresh aquifer.`,
    keys: ['sloping water table', 'seepage face', 'interface', 'hydrodynamic balance', 'Ghyben', '40', 'inverted cone', 'drawdown', 'radial', 'recharge'],
    lists: ['l-gw-salt-options', 'l-gw-recharge-purposes'],
    src: 'Delwar sir note (mechanism, z = 40h, radial wells and recharge); SN L1 / L4b for salinity in Bangladesh; other options textbook',
    Fig: SaltFig,
  },
  {
    id: 'a-gw-springs',
    topic: T,
    q: 'Write a short note on gravity springs.',
    seen: ['2010-11'],
    a: String.raw`### Gravity springs
A **spring** is a natural outflow of groundwater at the surface. A **gravity spring** (depression spring) forms where the **water table intersects the land surface**, for example at a valley side, a break in slope or a depression below the water table, or where an impermeable layer under a permeable one outcrops. Water flows out **by gravity** from an **unconfined** aquifer.
- Yield varies with the **water-table level**: it falls in the dry season and may stop.
- Quality: clear, but easily polluted at the outlet; **protect** it with a spring box.
- Contrast with an **artesian spring**, where confined water rises to the surface under pressure through a fault or a crack in the confining layer.
- Springs are a groundwater source used in hilly areas such as the Chittagong Hill Tracts.`,
    keys: ['gravity spring', 'water table', 'intersects the land surface', 'by gravity', 'unconfined', 'artesian spring'],
    lists: [],
    src: 'SN L3 p4 (water table meeting the land surface gives springs); the rest is textbook',
  },
]

export default { lists, cards, answers } satisfies EvTopicContent

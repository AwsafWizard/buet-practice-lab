import { useState } from 'react'
import { fmt } from '../components/DiagramView'
import { Md, Seg, Tex } from '../components/ui'
import { Cs, CT, etaFromDamping, kExponent, SOIL, SYSTEMS, ZONE_Z, type SiteClass } from '../engine/eq'
import { SpectrumPlot } from '../kit/loads'
import { Lookup, NumIn, ok, RT, type RefItem } from './common'

const SITES: SiteClass[] = ['SA', 'SB', 'SC', 'SD', 'SE']
const SiteSeg = ({ v, set }: { v: SiteClass; set: (s: SiteClass) => void }) => <Seg size="xs" value={v} onChange={set} items={SITES.map((s) => ({ v: s, label: s }))} />

function Zones() {
  return (
    <RT
      head={['Zone', 'Location', 'Intensity', 'Z']}
      rows={[
        [1, 'Southwest: Barisal, Khulna, Jessore, Rajshahi', 'Low', ZONE_Z[1]],
        [2, 'Lower central & northwest: Noakhali, Dhaka, Pabna, Dinajpur; SW corner incl. Sundarbans', 'Moderate', ZONE_Z[2]],
        [3, 'Upper central & northwest: Brahmanbaria, Sirajganj, Rangpur; also Chittagong (map)', 'Severe', ZONE_Z[3]],
        [4, 'Northeast: Sylhet, Mymensingh, Kurigram', 'Very severe', ZONE_Z[4]],
      ]}
      cap="Z = peak ground acceleration (g) on rock for the MCE (2 % in 50 years). Design earthquake = ⅔ MCE, hence the ⅔ in S_a."
    />
  )
}

function Occupancy() {
  return (
    <>
      <RT
        head={['Occupancy category', 'I (earthquake)']}
        rows={[
          ['I or II', '1.00'],
          ['III', '1.25'],
          ['IV', '1.50'],
        ]}
      />
      <Md>{`- **I**: low hazard to human life on failure (agricultural, temporary, minor storage).
- **II**: all buildings not in I, III, IV (ordinary residential, office, commercial).
- **III**: substantial hazard: > 300 people in one area, day care > 150, schools > 250, colleges > 500 students, health care ≥ 50 resident patients without surgery, jails.
- **IV**: essential facilities: hospitals with surgery/emergency, fire/rescue/police stations, designated earthquake/cyclone/emergency shelters, emergency communication centres, power stations for emergencies, and their ancillary structures.`}</Md>
    </>
  )
}

function SiteClassBody() {
  return (
    <>
      <RT
        head={['Site', 'Soil profile (top 30 m)', 'V̄_s (m/s)', 'N̄ (blows/30 cm)', 'S̄_u (kPa)']}
        rows={[
          ['SA', 'Rock or rock-like; ≤ 5 m weaker material at surface', '> 800', '—', '—'],
          ['SB', 'Very dense sand/gravel or very stiff clay, several tens of m thick', '360–800', '> 50', '> 250'],
          ['SC', 'Deep dense or medium-dense sand/gravel or stiff clay', '180–360', '15–50', '70–250'],
          ['SD', 'Loose-to-medium cohesionless or soft-to-firm cohesive soil', '< 180', '< 15', '< 70'],
          ['SE', 'Surface alluvium (V_s of C or D) 5–20 m thick on stiffer material, V_s > 800', '—', '—', '—'],
        ]}
      />
      <Tex block>{`\\bar N = \\frac{\\sum d_i}{\\sum d_i/N_i}\\quad(\\text{harmonic mean over the top 30 m})`}</Tex>
    </>
  )
}

function Spectrum() {
  const [site, setSite] = useState<SiteClass>('SC')
  const [T, setT] = useState(0.8)
  const [xi, setXi] = useState(5)
  const eta = etaFromDamping(ok(xi) ? xi : 5)
  const c = ok(T) && T > 0 ? Cs(T, site, eta) : null
  const s = SOIL[site]
  return (
    <>
      <RT head={['Soil type', 'S', 'T_B (s)', 'T_C (s)', 'T_D (s)']} rows={SITES.map((k) => [k, SOIL[k].S, SOIL[k].TB, SOIL[k].TC, SOIL[k].TD])} hl={(i) => SITES[i] === site} />
      <Md>{`$$C_s = \\begin{cases} S\\left(1 + \\dfrac{T}{T_B}(2.5\\eta - 1)\\right) & 0 \\le T \\le T_B\\\\[4pt] 2.5S\\eta & T_B \\le T \\le T_C\\\\[4pt] 2.5S\\eta\\dfrac{T_C}{T} & T_C \\le T \\le T_D\\\\[4pt] 2.5S\\eta\\dfrac{T_CT_D}{T^2} & T_D \\le T \\le 4\\text{ s}\\end{cases}$$
$$\\eta = \\sqrt{\\frac{10}{5 + \\xi}} \\ge 0.55$$
ξ = damping in % of critical (5 % → η = 1).`}</Md>
      <Lookup
        result={
          c ? (
            <Tex>{`\\eta = ${fmt(eta, 3)},\\ \\text{branch } ${c.branch}:\\ C_s(T = ${fmt(T, 3)}\\text{ s, ${site}}) = \\mathbf{${fmt(c.Cs, 3)}}`}</Tex>
          ) : (
            '—'
          )
        }
      >
        <SiteSeg v={site} set={setSite} />
        <NumIn label="T" value={T} onChange={setT} step={0.05} unit="s" w="w-16" />
        <NumIn label="ξ" value={xi} onChange={setXi} step={1} unit="%" w="w-14" />
      </Lookup>
      <SpectrumPlot site={site} T={c ? T : undefined} eta={eta} />
      <div className="text-[11px] text-faint">
        Site {site}: plateau 2.5Sη = {fmt(2.5 * s.S * eta, 3)} between T_B = {s.TB} s and T_C = {s.TC} s.
      </div>
    </>
  )
}

function SDCBody() {
  const t13 = { SA: 'B C C D', SB: 'B C D D', SC: 'B C D D', SD: 'C D D D', 'SE, S₁, S₂': 'D D D D' }
  const t4 = { SA: 'C D D D', SB: 'C D D D', SC: 'C D D D', SD: 'D D D D', 'SE, S₁, S₂': 'D D D D' }
  return (
    <>
      <RT
        groups={[['', 1], ['Occupancy I, II, III', 4], ['Occupancy IV', 4]]}
        head={['Site class', 'Zone 1', '2', '3', '4', 'Zone 1', '2', '3', '4']}
        rows={Object.keys(t13).map((k) => [k, ...t13[k as keyof typeof t13].split(' '), ...t4[k as keyof typeof t4].split(' ')])}
      />
      <div className="text-[11px] text-faint mt-1">SDC controls the height limit and which framing systems are permitted (next table).</div>
    </>
  )
}

function Systems() {
  return (
    <>
      <RT
        head={['C. Moment-resisting frames', 'R', 'Ω₀', 'C_d', 'SDC B', 'C', 'D']}
        rows={Object.values(SYSTEMS).map((s) => [s.name, s.R, s.Omega, s.Cd, s.limit.B, s.limit.C, s.limit.D])}
        cap="NL = no height limit, NP = not permitted, number = height limit (m). Papers expect the least-ductile RC frame allowed: SDC B → OMF (R = 3), C → IMF (R = 5), D → SMF (R = 8)."
      />
    </>
  )
}

function Period() {
  return (
    <>
      <Tex block>{`T = C_t\\,h_n^{\\,m}`}</Tex>
      <RT head={['Structure type', 'C_t', 'm']} rows={Object.values(CT).map((c) => [c.name, c.Ct, c.m])} />
      <div className="text-[11px] text-faint mt-1 leading-snug">
        h_n = height (m) from the foundation or top of a rigid basement. Basement storeys are excluded when their walls are tied to the ground-floor deck or fitted between columns, included otherwise.
      </div>
    </>
  )
}

function BaseShear() {
  const [T, setT] = useState(1.2)
  const k = ok(T) ? kExponent(T) : NaN
  return (
    <>
      <Md>{`$$S_a = \\frac23\\frac{ZI}{R}C_s\\ \\ (I/R \\le 1),\\qquad S_a \\ge 0.67\\beta ZIS,\\ \\beta = 0.11,\\qquad V = S_aW$$
$$F_x = V\\frac{w_xh_x^{\\,k}}{\\sum_{i=1}^{n} w_ih_i^{\\,k}},\\qquad k = \\begin{cases}1 & T \\le 0.5\\text{ s}\\\\ 1 + (T - 0.5)/2 & 0.5 < T < 2.5\\\\ 2 & T \\ge 2.5\\text{ s}\\end{cases}$$
Storey shear $V_x = \\sum_{i \\ge x} F_i$ (sum from the top down).`}</Md>
      <Lookup result={ok(k) ? <>k(T = {fmt(T, 3)} s) = <b>{fmt(k, 3)}</b></> : '—'}>
        <NumIn label="T" value={T} onChange={setT} step={0.05} unit="s" w="w-16" />
      </Lookup>
    </>
  )
}

function Weight() {
  return (
    <Md>{`Seismic weight **W** = total dead load (incl. partitions) + part of the live load:
- LL ≤ 3 kN/m² → at least **25 %** of LL;
- LL > 3 kN/m² → at least **50 %** of LL;
- 100 % of permanent heavy equipment, retained liquid, and sustained imposed loads.

The dashboard's solutions apply the same rule to the roof live load at roof level. Pedestal/plinth weights at the base level go into W but have $h = 0$, so they get no storey force.`}</Md>
  )
}

export const EQ_ITEMS: RefItem[] = [
  { id: 'e-sa', group: 'eq', title: 'S_a, base shear, storey forces, k', tag: 'Sec 2.5.7', exam: true, keywords: 'sa base shear v fx vertical distribution k exponent beta 0.11', Body: BaseShear },
  { id: 'e-z', group: 'eq', title: 'Seismic zones & zone coefficient Z', keywords: 'zone z dhaka sylhet chittagong 0.12 0.2 0.28 0.36', Body: Zones },
  { id: 'e-occ', group: 'eq', title: 'Occupancy category & importance factor I', tag: 'Table 6.2.17', keywords: 'importance occupancy 1.25 1.5 hospital school shelter', Body: Occupancy },
  { id: 'e-site', group: 'eq', title: 'Site classification (SPT, V_s)', keywords: 'site class spt n harmonic shear wave vs su', Body: SiteClassBody },
  { id: 'e-cs', group: 'eq', title: 'Soil factor S, T_B, T_C, T_D & spectrum C_s', tag: 'Table 6.2.16', exam: true, keywords: 'cs spectrum soil factor s tb tc td eta damping', Body: Spectrum },
  { id: 'e-sdc', group: 'eq', title: 'Seismic design category', tag: 'Table 6.2.18', exam: true, keywords: 'sdc b c d design category', Body: SDCBody },
  { id: 'e-r', group: 'eq', title: 'R, Ω₀, C_d & height limits', tag: 'Table 6.2.19', exam: true, keywords: 'r response reduction factor omega cd smf imf omf moment frame', Body: Systems },
  { id: 'e-t', group: 'eq', title: 'Period T = C_t h_n^m', tag: 'Table 6.2.20', keywords: 'period ct m hn natural', Body: Period },
  { id: 'e-w', group: 'eq', title: 'Seismic weight W', tag: 'Sec 2.5.7.3', keywords: 'weight w 25% 50% live load dead', Body: Weight },
]

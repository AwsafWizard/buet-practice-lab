// Bond "Which one?" drill: pick the Table 6.1 cell, ψ factor, splice class, minimum … for a given situation.

import { fmt } from '../../../components/DiagramView'
import { pick, randInt } from '../../../labs/common'
import { choices, type PickSkill } from '../../components/PickDrill'
import { bar, beamBarGeometry, compressionLap, hookFactors, ldcCalc, psiFactors, simplifiedCase, spliceClass, tieAreaCheck } from '../../engine/bond'

const f = (v: number, d = 2) => fmt(v, d)

const LD = {
  a25: '$\\ell_d = \\dfrac{f_y\\psi_t\\psi_e}{25\\lambda\\sqrt{f\'_c}}d_b$',
  a20: '$\\ell_d = \\dfrac{f_y\\psi_t\\psi_e}{20\\lambda\\sqrt{f\'_c}}d_b$',
  o50: '$\\ell_d = \\dfrac{3f_y\\psi_t\\psi_e}{50\\lambda\\sqrt{f\'_c}}d_b$',
  o40: '$\\ell_d = \\dfrac{3f_y\\psi_t\\psi_e}{40\\lambda\\sqrt{f\'_c}}d_b$',
}

const t61: PickSkill = {
  key: 't61',
  label: 'Table 6.1 cell',
  gen: (r) => {
    const id = pick(r, ['#4', '#5', '#6', '#7', '#8', '#9', '#10', '#11', '16mm', '20mm', '25mm'])
    const b = bar(id)
    const member = pick(r, ['beam', 'beam', 'slab', 'footing'] as const)
    const clearCover = member === 'beam' ? 1.875 : member === 'slab' ? 0.75 : 3
    const stirrups = member === 'beam' && r() < 0.7
    const clearSpacing = pick(r, [0.75, 1, 1.25, 1.5, 2, 2.5, 3, 4, 6])
    const c = simplifiedCase({ db: b.db, clearSpacing, clearCover, stirrupsMin: stirrups })
    const answer = c.met ? (b.small ? LD.a25 : LD.a20) : b.small ? LD.o50 : LD.o40
    const where = member === 'beam' ? `beam bars, ${stirrups ? 'code-minimum #3 stirrups along ld' : 'no stirrups along ld'}` : member === 'slab' ? 'slab bars (no stirrups)' : 'footing bars cast against earth (no stirrups)'
    return {
      q: `${b.label} bars (db = ${f(b.db, 3)} in), ${where}. Clear cover ${f(clearCover, 3)} in, clear spacing ${f(clearSpacing)} in. Which simplified formula?`,
      options: [LD.a25, LD.a20, LD.o50, LD.o40],
      answer,
      why: `${c.why}. ${b.label} is ${b.small ? 'No. 6 or smaller → the 25 / 50 column' : 'No. 7 or larger → the 20 / 40 column'}${b.mm ? ` (${b.label} is treated as its nearest US size, No. ${b.no})` : ''}. Table 6.1 uses **clear** spacing and **clear** cover.`,
      ref: 'b-ld',
    }
  },
}

const psiT: PickSkill = {
  key: 'psiT',
  label: 'ψt (top bar)',
  gen: (r) => {
    const kind = pick(r, ['beamTop', 'beamBot', 'slabTop', 'deepTop', 'footBot'] as const)
    const h = kind === 'slabTop' ? randInt(r, 5, 9) : kind === 'deepTop' ? randInt(r, 30, 42, 2) : randInt(r, 14, 28, 2)
    const below = kind === 'beamBot' || kind === 'footBot' ? 2.5 : h - 2.5
    const top = below > 12
    const p = psiFactors({ db: 1, small: false, top })
    const what = { beamTop: `top bars of a ${h} in deep beam`, beamBot: `bottom bars of a ${h} in deep beam`, slabTop: `top bars of a ${h} in slab`, deepTop: `top bars of a ${h} in deep transfer girder`, footBot: `bottom bars of a ${h} in footing` }[kind]
    return {
      q: `Straight bars in tension: the ${what} (about ${f(below, 1)} in of fresh concrete cast below the bars). ψt = ?`,
      options: ['1.0', '1.3', '1.2', '1.5'],
      answer: p.psiT.toFixed(1),
      why: top ? `More than 12 in of fresh concrete below the bar → **ψt = 1.3** (bleed water and air collect under the bar).` : `12 in or less of concrete below the bar → **ψt = 1.0**. Only horizontal bars with more than 12 in of fresh concrete below are "top bars".`,
      ref: 'b-psi',
    }
  },
}

const psiE: PickSkill = {
  key: 'psiE',
  label: 'ψe and ψtψe',
  gen: (r) => {
    const b = bar(pick(r, ['#5', '#6', '#7', '#8', '#9']))
    const coat = pick(r, ['uncoated', 'galv', 'epoxy', 'epoxy', 'epoxy'] as const)
    const cc = pick(r, [1.5, 1.875, 2, 3, 4])
    const cs = pick(r, [2, 3, 4, 6, 8])
    const top = r() < 0.5
    const p = psiFactors({ db: b.db, small: b.small, top, epoxy: coat === 'epoxy', clearCover: cc, clearSpacing: cs })
    const product = r() < 0.5
    const coatTxt = coat === 'uncoated' ? 'uncoated' : coat === 'galv' ? 'galvanized' : 'epoxy-coated'
    const q = `${coatTxt} ${b.label} ${top ? 'top' : 'bottom'} bars (db = ${f(b.db, 3)} in), clear cover ${f(cc, 3)} in, clear spacing ${f(cs)} in. ${product ? 'ψt·ψe to use = ?' : 'ψe = ?'}`
    if (!product)
      return { q, options: ['1.0', '1.2', '1.5', '1.7'], answer: p.psiE.toFixed(1), why: `${coat === 'galv' ? 'Galvanized counts as uncoated → ψe = 1.0' : p.eNote} (3db = ${f(3 * b.db)} in, 6db = ${f(6 * b.db)} in).`, ref: 'b-psi' }
    const ans = p.psiTE.toFixed(2)
    return {
      q,
      options: choices(r, ans, ['1.0', '1.2', '1.3', '1.5', '1.56', '1.7', '1.95'].map((x) => (+x).toFixed(2))),
      answer: ans,
      why: `ψt = ${p.psiT}, ψe = ${p.psiE} (${coat === 'galv' ? 'galvanized = uncoated' : p.eNote}) → product ${f(p.psiTEraw, 2)}${p.capped ? ', capped at **1.7**' : ''}.`,
      ref: 'b-psi',
    }
  },
}

const psiS: PickSkill = {
  key: 'psiS',
  label: 'ψs and λ',
  gen: (r) => {
    if (r() < 0.6) {
      const b = bar(pick(r, ['#3', '#4', '#5', '#6', '#7', '#8', '#9', '#10', '#11', '20mm', '25mm']))
      const p = psiFactors({ db: b.db, small: b.small })
      return {
        q: `General equation (Eq. 6.4) for ${b.label} bars. ψs = ?`,
        options: ['0.8', '1.0', '1.2', '0.75'],
        answer: p.psiS.toFixed(1),
        why: `${b.label} is ${b.small ? 'No. 6 or smaller → **ψs = 0.8**' : 'No. 7 or larger → **ψs = 1.0**'}. (In Table 6.1, ψs is already built into the 25 vs 20 split.)`,
        ref: 'b-psi',
      }
    }
    const conc = pick(r, ['normal', 'light'] as const)
    const p = psiFactors({ db: 1, small: false, lightweight: conc === 'light' })
    return {
      q: `${conc === 'light' ? 'Lightweight' : 'Normal-weight'} concrete, straight bars in tension. λ = ?`,
      options: ['1.0', '0.85', '0.75', '1.3'],
      answer: p.lambda.toFixed(conc === 'light' ? 2 : 1),
      why: conc === 'light' ? 'Lightweight concrete → **λ = 0.75** in the development equations (lower tensile strength, so longer ld).' : 'Normal-weight concrete → **λ = 1.0**.',
      ref: 'b-psi',
    }
  },
}

const excess: PickSkill = {
  key: 'excess',
  label: 'As,req/As,prov allowed?',
  gen: (r) => {
    const cases = [
      { t: 'straight bottom bars developed past the point of maximum moment', yes: true },
      { t: 'a standard hook (ldh) anchoring top bars into an exterior column', yes: true },
      { t: 'column dowels developed in compression (ldc) into a footing', yes: true },
      { t: 'a tension lap splice (lst = 1.0ld or 1.3ld) of beam bottom bars', yes: false },
      { t: 'the ld used inside a Class B tension splice', yes: false },
    ]
    const c = pick(r, cases)
    const ratio = pick(r, [0.82, 0.88, 0.91, 0.95])
    return {
      q: `As,req/As,prov = ${ratio} for ${c.t}. Do you multiply by As,req/As,prov?`,
      options: ['Yes, reduce the length', 'No, use the full length'],
      answer: c.yes ? 'Yes, reduce the length' : 'No, use the full length',
      why: c.yes ? 'Development length (straight, hooked or compression) may be reduced by $A_{s,req}/A_{s,prov}$, then the minimum applies.' : 'Lap splices: ld is computed with every ψ factor but **without** the excess-steel factor. The As,prov/As,req ratio is used only to decide Class A vs B.',
      ref: c.yes ? 'b-ld' : 'b-splice',
    }
  },
}

const splice: PickSkill = {
  key: 'splice',
  label: 'Splice class',
  gen: (r) => {
    if (r() < 0.12) {
      const id = pick(r, ['#14', '#18'])
      return {
        q: `${id} bars in tension need to be spliced at midspan. Which tension lap?`,
        options: ['Class A: $\\ell_{st} = 1.0\\ell_d$', 'Class B: $\\ell_{st} = 1.3\\ell_d$', 'No lap splice: bars larger than No. 11'],
        answer: 'No lap splice: bars larger than No. 11',
        why: 'Lap splices are not allowed for bars larger than No. 11 (use mechanical or welded splices).',
        ref: 'b-splice',
      }
    }
    const ratio = pick(r, [1.2, 1.5, 1.8, 2, 2.2, 2.5])
    const pct = pick(r, [25, 33, 50, 67, 100])
    const c = spliceClass(ratio, pct)
    return {
      q: `Tension lap splice: As,prov/As,req = ${ratio} over the splice length, ${pct}% of the bars spliced within the lap length. Which class?`,
      options: ['Class A: $\\ell_{st} = 1.0\\ell_d$', 'Class B: $\\ell_{st} = 1.3\\ell_d$', 'No lap splice: bars larger than No. 11'],
      answer: c.cls === 'A' ? 'Class A: $\\ell_{st} = 1.0\\ell_d$' : 'Class B: $\\ell_{st} = 1.3\\ell_d$',
      why: `${c.why}. Class A needs **both** conditions (ratio ≥ 2 AND ≤ 50 % spliced); everything else is Class B. lst ≥ 12 in.`,
      ref: 'b-splice',
    }
  },
}

const hook: PickSkill = {
  key: 'hook',
  label: 'Hook ψc / ψr',
  gen: (r) => {
    const b = bar(pick(r, ['#6', '#7', '#8', '#9', '#10', '#11', '#14']))
    const hk = pick(r, [90, 90, 180] as const)
    const side = pick(r, [1.5, 2, 2.5, 3])
    const tail = pick(r, [1.5, 2, 2.5])
    const ties = pick(r, [2, 3, 4, 6])
    const tieOK = ties <= 3 * b.db
    const askC = r() < 0.55
    const h = hookFactors({ no: b.no, hook: hk, sideCover: side, tailCover: tail, confined: tieOK })
    const q = `${b.label} bar, ${hk}° standard hook into a column: side cover ${side} in${hk === 90 ? `, cover on the tail ${tail} in` : ''}; ties along the hook at ${ties} in (3db = ${f(3 * b.db)} in). ${askC ? 'ψc = ?' : 'ψr = ?'}`
    return askC
      ? { q, options: ['0.7', '0.8', '1.0', '1.2'], answer: h.psiC.toFixed(1), why: `${h.cNote}. ψc = 0.7 needs No. 11 or smaller, side cover ≥ 2.5 in, and for a 90° hook cover on the tail ≥ 2 in.`, ref: 'b-hook' }
      : { q, options: ['0.7', '0.8', '1.0', '1.2'], answer: h.psiR.toFixed(1), why: `${b.no > 11 ? 'Bar larger than No. 11 → ψr = 1.0' : h.rNote}.`, ref: 'b-hook' }
  },
}

const ldc: PickSkill = {
  key: 'ldc',
  label: 'Compression ldc',
  gen: (r) => {
    if (r() < 0.5) {
      const fc = pick(r, [3000, 3500, 4000, 5000, 6000])
      const fy = pick(r, [40000, 60000])
      const b = bar(pick(r, ['#6', '#8', '#9', '#10']))
      const c = ldcCalc({ db: b.db, fc, fy })
      const A = '$\\dfrac{f_y\\psi_r}{50\\lambda\\sqrt{f\'_c}}d_b$'
      const B = '$0.0003f_y\\psi_r d_b$'
      return {
        q: `Compression development of ${b.label} bars, f′c = ${fc} psi, fy = ${fy / 1000} ksi. Which term governs ldc (before the 8 in minimum)?`,
        options: [A, B],
        answer: c.governs === 'a' ? A : B,
        why: `${f(c.a, 2)} in vs ${f(c.b, 2)} in → the larger governs. The 0.0003fy term wins when √f′c > 66.7, i.e. f′c above about 4440 psi.`,
        ref: 'b-ldc',
      }
    }
    const conf = pick(r, [
      { t: 'spiral of ⅜ in wire at 3 in pitch', ok: true },
      { t: 'spiral of ¼ in wire at 5 in pitch', ok: false },
      { t: 'No. 4 ties at 4 in', ok: true },
      { t: 'No. 4 ties at 6 in', ok: false },
      { t: 'No. 3 ties at 4 in', ok: false },
    ])
    return {
      q: `Column bars developed in compression, enclosed by a ${conf.t}. ψr = ?`,
      options: ['0.75', '0.8', '1.0', '0.83'],
      answer: conf.ok ? '0.75' : '1.0',
      why: 'ψr = 0.75 only for a spiral ≥ ¼ in at pitch ≤ 4 in, or No. 4 ties at ≤ 4 in; otherwise 1.0.',
      ref: 'b-ldc',
    }
  },
}

const lapc: PickSkill = {
  key: 'lapc',
  label: 'Compression lap',
  gen: (r) => {
    const db = bar(pick(r, ['#6', '#7', '#8', '#9'])).db
    if (r() < 0.55) {
      const fy = pick(r, [40000, 60000, 75000])
      const fc = pick(r, [2500, 3000, 4000, 5000])
      const c = compressionLap({ db, fy, fc })
      const lab = (hi: boolean, low: boolean) => `$${hi ? '(0.0009f_y - 24)d_b' : '0.0005f_yd_b'}${low ? '\\times\\tfrac43' : ''}$`
      const ans = lab(fy > 60000, c.low)
      return {
        q: `Compression lap splice, fy = ${fy / 1000} ksi, f′c = ${fc} psi. Basic lsc = ?`,
        options: [lab(false, false), lab(false, true), lab(true, false), lab(true, true)],
        answer: ans,
        why: `fy ${fy > 60000 ? '> 60 ksi → (0.0009fy − 24)db' : '≤ 60 ksi → 0.0005fy db'}; f′c ${c.low ? '< 3000 psi → increase by ⅓' : '≥ 3000 psi → no increase'}. Then ≥ 12 in.`,
        ref: 'b-splice',
      }
    }
    const kind = pick(r, ['tied', 'tied', 'spiral'] as const)
    const h = pick(r, [12, 16, 20, 24])
    const s = pick(r, [8, 10, 12, 16])
    const legs = pick(r, [2, 3, 4])
    const t = tieAreaCheck(h, s, legs * 0.11)
    const ans = kind === 'spiral' ? '× 0.75' : t.ok ? '× 0.83' : '× 1.0 (no reduction)'
    return {
      q: kind === 'spiral' ? 'Compression lap splice inside a spiral column. Factor on lsc?' : `Tied column, h = ${h} in, No. 3 ties at s = ${s} in with ${legs} legs crossing each direction (effective area ${f(legs * 0.11)} in²). Factor on lsc?`,
      options: ['× 0.83', '× 0.75', '× 1.0 (no reduction)', '× 1.33'],
      answer: ans,
      why: kind === 'spiral' ? 'Spiral column → × 0.75 (still ≥ 12 in).' : `Needs effective tie area ≥ 0.0015hs = ${f(t.req, 3)} in²; provided ${f(t.prov, 2)} in² → ${t.ok ? '× 0.83' : 'no reduction'}.`,
      ref: 'b-splice',
    }
  },
}

const colsp: PickSkill = {
  key: 'colsp',
  label: 'Column splice type',
  gen: (r) => {
    const c = pick(r, [
      { t: 'All bars in compression under every factored load combination.', a: 'Compression lap splice', w: 'compression → lsc (end bearing also possible)' },
      { t: 'Bar stress in tension, 0.4fy; half the bars spliced at a section, alternate splices staggered by ld.', a: 'Class A tension lap', w: 'tension ≤ 0.5fy with ≤ ½ the bars spliced and staggered by ld → Class A' },
      { t: 'Bar stress in tension, 0.4fy; all bars spliced at the same section.', a: 'Class B tension lap', w: 'tension ≤ 0.5fy but more than ½ spliced at a section → Class B' },
      { t: 'Bar stress in tension, 0.7fy (lateral-load frame).', a: 'Class B tension lap', w: 'tension > 0.5fy → Class B' },
    ])
    return { q: `Column bar splice. ${c.t} Which splice?`, options: ['Compression lap splice', 'Class A tension lap', 'Class B tension lap'], answer: c.a, why: `ACI 10.7.5: ${c.w}.`, ref: 'b-splice' }
  },
}

const mins: PickSkill = {
  key: 'mins',
  label: 'Minimum length',
  gen: (r) => {
    const c = pick(r, [
      { t: 'straight development ld in tension', a: '12 in' },
      { t: 'hooked development ldh', a: '$\\max(8d_b,\\ 6\\text{ in})$' },
      { t: 'development in compression ldc', a: '8 in' },
      { t: 'a Class B tension lap splice', a: '12 in' },
      { t: 'a compression lap splice', a: '12 in' },
    ])
    return {
      q: `The formula gives a short length for ${c.t}. What minimum applies?`,
      options: ['12 in', '8 in', '$\\max(8d_b,\\ 6\\text{ in})$', '$12d_b$'],
      answer: c.a,
      why: 'ld ≥ 12 in; ldh ≥ max(8db, 6 in); ldc ≥ 8 in; tension and compression laps ≥ 12 in (for Class B the 12 in applies to 1.3ld).',
      ref: 'b-ld',
    }
  },
}

const cut: PickSkill = {
  key: 'cut',
  label: 'Cut-off extension',
  gen: (r) => {
    const b = bar(pick(r, ['#7', '#8', '#9', '#10']))
    const d = pick(r, [14.5, 17.5, 19.5, 21.5, 24.5])
    const ln = pick(r, [18, 22, 26, 30, 36])
    const neg = r() < 0.5
    const v = { d, db12: 12 * b.db, ln16: (ln * 12) / 16 }
    const ans = neg ? Math.max(v.d, v.db12, v.ln16) : Math.max(v.d, v.db12)
    const L = (x: number) => `${f(x, 2)} in`
    return {
      q: neg
        ? `Negative bars (${b.label}), d = ${d} in, clear span ln = ${ln} ft. How far must at least ⅓ of the −As extend past the inflection point?`
        : `${b.label} bottom bars, d = ${d} in. How far past the theoretical cut-off point do you extend the bars that are cut?`,
      options: choices(r, L(ans), [L(v.d), L(v.db12), L(v.ln16), L(12)]),
      answer: L(ans),
      why: neg
        ? `max(d, 12db, ln/16) = max(${d}, ${f(v.db12)}, ${f(v.ln16)}) = **${f(ans)} in**.`
        : `max(d, 12db) = max(${d}, ${f(v.db12)}) = **${f(ans)} in** (ln/16 applies only to negative steel past the inflection point).`,
      ref: 'b-cutoff',
    }
  },
}

const cb: PickSkill = {
  key: 'cb',
  label: 'cb in Eq. 6.4',
  gen: (r) => {
    const b = bar(pick(r, ['#7', '#8', '#9', '#10']))
    const bw = pick(r, [10, 12, 14, 16, 18])
    const n = pick(r, [2, 3, 4, 5])
    const g = beamBarGeometry({ b: bw, cover: 1.5, ds: 0.375, db: b.db, n })
    if (g.clearSpacing <= 0) return cb.gen(r)
    const L = (x: number) => `${f(x, 3)} in`
    return {
      q: `${n} ${b.label} bars in one layer, bw = ${bw} in, 1.5 in clear cover, #3 stirrups. cb for Eq. 6.4 = ?`,
      options: choices(r, L(g.cb), [L(g.cSide), L(g.halfSpacing), L(g.spacingCC), L(g.clearSpacing), L(g.clearSide)]),
      answer: L(g.cb),
      why: `cb = smaller of bar **centre** to the nearest face (1.5 + 0.375 + db/2 = ${f(g.cSide, 3)} in) and **half** the centre-to-centre spacing (${f(g.spacingCC, 3)}/2 = ${f(g.halfSpacing, 3)} in) → ${f(g.cb, 3)} in. Clear distances are for Table 6.1, not cb.`,
      ref: 'b-geo',
    }
  },
}

export const BOND_PICKS: PickSkill[] = [t61, psiT, psiE, psiS, excess, splice, hook, ldc, lapc, colsp, mins, cut, cb]

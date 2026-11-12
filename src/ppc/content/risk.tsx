// pc-risk — Risk management, insurance, bonds, fiduciary risk (Tanvir sir L5).
// Source digest: CE301/Claude digests/lec_project_legal.md (pr-risk).
import type { FC } from 'react'
import type { PcAnswer, PcCard, PcList, PcTopicContent } from '../types'

const T = 'pc-risk' as const

// ---------- figure ----------
const ink = 'var(--c-ink)'
const mute = 'var(--c-mute)'
const panel2 = 'var(--c-panel2)'
const oia = 'var(--c-oia)'

const Node = ({ x, y, w, t, strong }: { x: number; y: number; w: number; t: string; strong?: boolean }) => (
  <g>
    <rect x={x} y={y} width={w} height={30} rx={5} fill={panel2} stroke={strong ? oia : mute} strokeWidth={strong ? 2.2 : 1.4} />
    <text x={x + w / 2} y={y + 19} textAnchor="middle" fontSize={12} fontWeight={strong ? 700 : 400} fill={ink}>
      {t}
    </text>
  </g>
)

const RiskTreeFig: FC = () => {
  const leaves: [string, number][] = [
    ['Identification', 20],
    ['Analysis', 62],
    ['Prioritisation', 104],
    ['Allocation (hold, avoid, reduce, transfer, share)', 166],
    ['Monitoring & reporting', 208],
  ]
  const p = (pts: number[]) => <polyline points={pts.join(' ')} fill="none" stroke={mute} strokeWidth={1.6} />
  return (
    <svg viewBox="0 0 620 260" width="100%" role="img" aria-label="Elements of risk management">
      <Node x={10} y={114} w={130} t="Risk management" strong />
      {p([140, 129, 160, 129])}
      {p([160, 77, 160, 197])}
      {p([160, 77, 180, 77])}
      {p([160, 197, 180, 197])}
      <Node x={180} y={62} w={110} t="Assessment" strong />
      <Node x={180} y={182} w={110} t="Action" strong />
      {p([290, 77, 310, 77])}
      {p([310, 35, 310, 119])}
      {p([290, 197, 310, 197])}
      {p([310, 181, 310, 223])}
      {leaves.map(([t, y]) => (
        <g key={t}>
          {p([310, y + 15, 326, y + 15])}
          <Node x={326} y={y} w={t.length > 20 ? 286 : 160} t={t} />
        </g>
      ))}
      <text x={10} y={252} fontSize={11} fill={mute}>
        Identification is the most critical element — risk cannot be managed if it is not identified.
      </text>
    </svg>
  )
}

// ---------- seen labels ----------
const CR_SEEN = ['2023-24', 'May 2024', '2021-22', '2016-17', '2015-16', '2013-14', '2011-12']
const CONC_SEEN = ['2023-24', 'May 2024', '2020-21', '2016-17', '2015-16', '2014-15', '2013-14']
const PLAYER_SEEN = ['2014-15', '2013-14', '2012-13', '2011-12']
const GLI_SEEN = ['May 2024', '2017-18', '2016-17', '2012-13', '2011-12']
const BOND_SEEN = ['May 2024', '2016-17', '2015-16', '2014-15', '2013-14', '2012-13', '2011-12']
const SURETY_SEEN = ['2023-24', '2021-22', '2020-21', '2017-18']
const FID_SEEN = ['2023-24', 'May 2024', '2020-21', 'Jan 2021', '2017-18', '2016-17', '2015-16', '2013-14', '2012-13', '2011-12']

const lists: PcList[] = [
  {
    id: 'l-rk-contract-risk',
    topic: T,
    title: 'Ways (activities) of dealing with contract risk',
    ask: 'Name the eight ways of dealing with contract risk — in the slide’s order.',
    points: [
      { k: 'Execute the contract in a professional manner', alt: ['execute professionally'], d: 'be quality oriented' },
      { k: 'Thoroughly educate clients', alt: ['educate clients'], d: 'use general conditions to cover costs' },
      { k: 'Identify problems', d: 'impose a fee premium or indemnification' },
      { k: 'Identify unavoidable/unacceptable risks', alt: ['unacceptable risks'], d: 'e.g. modification of existing structure, hazardous materials' },
      { k: 'Use the contract to close loopholes', alt: ['close loopholes and avoid traps'], d: '…and avoid traps: list services the client has declined' },
      { k: 'Establish extralegal conditions', alt: ['extralegal'], d: 'mediation/arbitration, reduce statute of limitations/repose, restrict damages' },
      { k: 'Develop clear contract language', alt: ['clear language'], d: 'easily understood by the client' },
      { k: 'Walk away', d: 'if a client is adamant about not taking prudent measures' },
    ],
    ordered: true,
    hook: '"E-E-I-I, U-E-C, W": two E’s (Execute, Educate), two I’s (problems, then unavoidable risks), then Use the contract, go Extralegal, write Clearly — and if the client still refuses, Walk.',
    seen: CR_SEEN,
    src: 'Tanvir sir L5 p2–3',
    note: 'The question bank gives eight different steps (read the contract, prefer model forms, check insurability…) — only "decline" matches "walk away". Learn the slide’s eight.',
  },
  {
    id: 'l-rk-three-factors',
    topic: T,
    title: 'Very important factors in dealing with risk',
    points: [{ k: 'A good formal contract' }, { k: 'Good project management' }, { k: 'Knowledge of prevent risks', alt: ['knowledge of preventable risks'] }],
    seen: ['2023-24'],
    src: 'Tanvir sir L5 p6',
  },
  {
    id: 'l-rk-before-proposing',
    topic: T,
    title: 'What a firm should do before proposing on a project',
    points: [
      { k: 'Background research on the client and project' },
      { k: 'Critically evaluate own capability and experience' },
      { k: 'Not rely on past behavior', d: '…as an indicator of the future' },
      { k: 'Not rely on assumptions' },
    ],
    seen: ['2023-24'],
    src: 'Tanvir sir L5 p9',
  },
  {
    id: 'l-rk-before-signing',
    topic: T,
    title: 'What the contract must include before signing',
    points: [
      { k: 'Appropriate clause' },
      { k: 'Explicit general conditions' },
      { k: 'A well-defined work-scope' },
      { k: 'An accurate schedule' },
      { k: 'A clear budget' },
    ],
    seen: ['2023-24'],
    src: 'Tanvir sir L5 p9',
  },
  {
    id: 'l-rk-techniques',
    topic: T,
    title: 'Techniques adopted to improve risk management in construction',
    points: [
      { k: 'PERT', alt: ['Program Evaluation & Review Technique'] },
      { k: 'Monte Carlo simulations' },
      { k: 'Cause & effect diagrams', alt: ['cause and effect diagram'] },
      { k: 'Fault trees' },
      { k: 'Decision trees' },
    ],
    hook: '"PERT Monte’s Cause — Fault or Decision?"',
    seen: [],
    src: 'Tanvir sir L5 p14',
  },
  {
    id: 'l-rk-elements',
    topic: T,
    title: 'Elements of risk management (Assessment → Action)',
    points: [
      { k: 'Identification', d: 'Assessment — the most critical element' },
      { k: 'Analysis', d: 'Assessment' },
      { k: 'Prioritisation', alt: ['prioritization'], d: 'Assessment' },
      { k: 'Allocation', d: 'Action — hold, avoid, reduce, transfer, share' },
      { k: 'Monitoring & reporting', alt: ['monitoring and reporting'], d: 'Action' },
    ],
    ordered: true,
    hook: '"I Am Prepared — Allocate, Monitor": three assessment steps, two action steps.',
    seen: ['2015-16', '2012-13'],
    src: 'Tanvir sir L5 p17–18',
    note: 'The question bank lists identification, analysis, response, monitoring and documentation, and calls the two phases "assessment" and "response/control". Slide: Assessment (identification, analysis, prioritisation) and Action (allocation, monitoring & reporting).',
  },
  {
    id: 'l-rk-allocation',
    topic: T,
    title: 'Risk allocation options',
    points: [{ k: 'Hold', alt: ['retain'] }, { k: 'Avoid' }, { k: 'Reduce' }, { k: 'Transfer' }, { k: 'Share' }],
    hook: '"HART-S": Hold, Avoid, Reduce, Transfer, Share.',
    seen: ['2015-16', '2012-13'],
    src: 'Tanvir sir L5 p18',
  },
  {
    id: 'l-rk-players',
    topic: T,
    title: 'Principal players in the professional liability insurance industry',
    points: [
      { k: 'Insureds', d: 'those to whom a policy’s coverage is extended' },
      { k: 'Insurance agents', alt: ['agents', 'brokers'], d: 'sell insurance; paid commissions' },
      { k: 'Insurers', alt: ['insurance companies'], d: 'issue policies; set coverage, limits, deductibles, premium' },
      { k: 'Actuaries', d: 'compute the odds a risk will materialize and its probable cost' },
      { k: 'Underwriters', d: 'evaluate each applicant; decide the premium' },
      { k: 'Claims managers', d: 'advise insureds when a claim arises' },
      { k: 'Reinsurers', d: 'insure insurers: back-up and stability' },
    ],
    hook: 'Follow a policy’s life: the Insured meets an Agent, buys from an Insurer whose Actuary did the odds and Underwriter set the premium; when trouble comes the Claims manager helps, and the Reinsurer backs the insurer. "I AIAU CR".',
    seen: PLAYER_SEEN,
    src: 'Tanvir sir L5 p21',
    note: 'The question bank writes "agents and brokers" and "claims managers and defence attorneys", and has actuaries setting premiums — on the slide the underwriter decides the premium.',
  },
  {
    id: 'l-rk-cost-drivers',
    topic: T,
    title: 'What a firm’s PLI premium is based on',
    points: [
      { k: 'Type of practice', d: 'geotechnical, structural, environmental…' },
      { k: 'Geographical area' },
      { k: 'Project mix' },
      { k: 'Claims history' },
      { k: 'Coverage needs' },
      { k: 'Resulting risks to insurer' },
    ],
    seen: CONC_SEEN,
    src: 'Tanvir sir L5 p27',
  },
  {
    id: 'l-rk-pli-concerns',
    topic: T,
    title: 'Specific concerns for professional liability insurance',
    points: [
      { k: 'Policy limits', d: 'more protection costs more; find the lowest practical amount; client requirements' },
      { k: 'Deductible', d: 'raising the limit is cheaper than lowering the deductible; new deductible each claim' },
      { k: 'Cost', d: 'set by the underwriter from practice type, area, project mix, claims history…' },
      { k: 'Insurability', d: 'indemnities and warranty-like certificates are not covered' },
      { k: 'Subconsultants', d: 'vicarious liability → review their policies' },
      { k: 'Joint ventures', d: 'like partnerships; one or all members liable' },
      { k: 'Project professional liability insurance', alt: ['project insurance', 'project PLI'], d: 'covers the whole project team' },
      { k: 'Expanded project delivery', d: 'design-build / developer cover through endorsements' },
      { k: 'Claims', d: 'timely reporting; barratry' },
    ],
    hook: 'Money first, then people, then trouble: 3 money words (Limits, Deductible, Cost) → 5 "who is covered" (Insurability, Subconsultants, Joint ventures, Project PLI, Expanded delivery) → Claims.',
    seen: CONC_SEEN,
    src: 'Tanvir sir L5 p26–30',
    note: 'The question bank lists nine different concerns (claims-made basis, retroactive date, hammer clause…). Only limits, deductible and project policy overlap — learn the slide’s nine.',
  },
  {
    id: 'l-rk-policy-considerations',
    topic: T,
    title: 'General policy considerations when buying PLI',
    points: [
      { k: 'Scope of coverage, endorsements, exclusions' },
      { k: 'Cost of the basic policy and endorsements' },
      { k: 'Part of overall financial management program?' },
    ],
    seen: [],
    src: 'Tanvir sir L5 p25',
  },
  {
    id: 'l-rk-gli-covers',
    topic: T,
    title: 'Exposures general liability insurance is meant for',
    points: [
      { k: 'Slips & falls', alt: ['slips and falls'] },
      { k: 'Libel & slander claims', alt: ['libel and slander'] },
      { k: 'Property damage to third parties', d: 'from office operations and nonprofessional jobsite activities' },
    ],
    seen: GLI_SEEN,
    src: 'Tanvir sir L5 p31',
  },
  {
    id: 'l-rk-gli-excludes',
    topic: T,
    title: 'Exposures general liability insurance does NOT cover',
    points: [{ k: 'Professional' }, { k: 'Automobile' }, { k: 'Workers’ compensation', alt: ['workers compensation'] }],
    seen: GLI_SEEN,
    src: 'Tanvir sir L5 p31',
    note: 'The question bank says general liability covers damage by the firm’s vehicle — the slide says automobile exposures are NOT covered.',
  },
  {
    id: 'l-rk-epli',
    topic: T,
    title: 'Employee charges covered by employment practices liability insurance',
    points: [{ k: 'Harassment' }, { k: 'Discrimination' }, { k: 'Wrongful termination' }],
    seen: ['May 2024', '2016-17'],
    src: 'Tanvir sir L5 p32',
  },
  {
    id: 'l-rk-bonds',
    topic: T,
    title: 'Most common bonds',
    points: [
      { k: 'Bid bond', d: 'winner will enter into the contract within a specified time and furnish required bonds' },
      { k: 'Payment bond', d: 'payment obligations of the project will be satisfied' },
      { k: 'Performance bond', d: 'delivered at contract signing; work per the contract documents' },
    ],
    seen: BOND_SEEN,
    src: 'Tanvir sir L5 p33–34',
    note: 'The question bank lists six bonds (adds advance payment, retention, maintenance) — the slide says the most common are these three.',
  },
  {
    id: 'l-rk-bond-cost',
    topic: T,
    title: 'What the cost of a bond depends on',
    points: [{ k: 'Class of project' }, { k: 'Contract amount' }, { k: 'Contract format' }],
    seen: [],
    src: 'Tanvir sir L5 p35',
  },
  {
    id: 'l-rk-surety',
    topic: T,
    title: 'Aspects of the surety company’s inquiry before issuing bonds',
    points: [
      { k: 'Essential characteristics of the project', d: 'size, type, nature; owner and ability to pay; contractor’s resources and experience' },
      { k: 'Total bonded and unbonded uncompleted work', alt: ['bonded and unbonded work'], d: 'is the contractor becoming overextended?' },
      { k: 'Adequacy of working capital and credit', alt: ['working capital'], d: 'substantiated by financial reports' },
      { k: 'Money between bid and next lowest bid', alt: ['left on table'], d: '"left on the table" — over 5–6% is a concern' },
      { k: 'Largest similar contract successfully completed', alt: ['largest contract amount of similar work'], d: 'stay within expertise; start small in a new sector' },
      { k: 'Terms of the contract and bonds required', d: 'payments, retention, time, liquidated damages, warranties' },
      { k: 'Amount subcontracted and subcontractor qualifications', alt: ['subcontracted work'], d: 'organization, finance, experience' },
    ],
    hook: 'Look at the job, then the contractor: Project → Workload → Wallet → Bid gap → Biggest past job → Terms → Subs. "P-W-W-B-B-T-S".',
    seen: SURETY_SEEN,
    src: 'Tanvir sir L5 p36–38',
    note: 'The question bank answers with the "three C’s" (character, capacity, capital) — not the slide’s seven aspects.',
  },
  {
    id: 'l-rk-fid-causes',
    topic: T,
    title: 'Factors behind the realization of fiduciary risk',
    points: [
      { k: 'Lack of capacity, competency or knowledge' },
      { k: 'Bureaucratic inefficiency' },
      { k: 'Active corruption' },
    ],
    seen: FID_SEEN,
    src: 'Tanvir sir L5 p40',
  },
  {
    id: 'l-rk-fid-principles',
    topic: T,
    title: 'Principles of managing fiduciary risk',
    points: [
      { k: 'Understanding the fiduciary risk environment', alt: ['understanding'] },
      { k: 'Mitigating risks to the proper use of funds', alt: ['mitigating'] },
      { k: 'Monitoring performance on an on-going basis', alt: ['monitoring'] },
    ],
    ordered: true,
    seen: ['Jan 2021'],
    src: 'Tanvir sir L5 p41–42',
    note: 'The question bank’s principles ("define the duty, act with loyalty, be prudent") are about fiduciary duties of the engineer — not the slide’s three.',
  },
  {
    id: 'l-rk-program',
    topic: T,
    title: 'Finally, in a risk management program a civil engineer should',
    points: [
      { k: 'React quickly to the symptoms of problems' },
      { k: 'Maintain open lines of communication' },
      { k: 'Use emotional intelligence', alt: ['emotion intelligence'] },
    ],
    seen: [],
    src: 'Tanvir sir L5 p13',
  },
]

const cards: PcCard[] = [
  {
    id: 'c-rk-risk',
    topic: T,
    front: 'Define **risk** (Tanvir sir).',
    back: 'Risk can be defined as **danger, chance, and/or exposure to loss or injury**.',
    src: 'Tanvir sir L5 p4',
  },
  {
    id: 'c-rk-hierarchy',
    topic: T,
    front: 'In what kind of organisation is construction risk managed, and why is that hard?',
    back: 'In **hierarchical networks of firms**, where problems are **highly interdependent** while the people, methods and organisations are **extraordinarily independent**; an unbroken flow of information across the life cycle is practically nonexistent.',
    src: 'Tanvir sir L5 p4–5',
  },
  {
    id: 'c-rk-prevent',
    topic: T,
    front: 'What is the **most effective preventive approach** to risk?',
    back: 'To **perform professionally** — not only technical execution but **eliminating misunderstanding and unrealistic expectations** with clients and other professionals.',
    seen: ['2023-24'],
    src: 'Tanvir sir L5 p6',
  },
  {
    id: 'c-rk-transfer',
    topic: T,
    front: 'Why are insurance and indemnification only **partial** risk transfer?',
    back: 'PLI, the most common mechanism, leaves many exposures **uncovered or covered only in part**; indemnification (full or partial — partial can cap liability) is likewise **imperfect**. **Transferring all risk is impossible.**',
    seen: ['2023-24'],
    src: 'Tanvir sir L5 p7–8',
  },
  {
    id: 'c-rk-reserves',
    topic: T,
    front: 'What is a **loss reserves account** and why is it hard to keep?',
    back: 'Money set aside by **including risks in the fees**; **competition in the marketplace** makes this difficult — and some risk problems are not merely financial (emotional drain, reputation).',
    src: 'Tanvir sir L5 p8',
  },
  {
    id: 'c-rk-documentation',
    topic: T,
    front: 'Which client statements does good **documentation** eliminate?',
    back: 'Notes, memos, e-mails and meeting minutes kill "**We never said that…**", "**You said…**" and "**I’ve never heard [seen] that before…**" — proper documentation often gets claims **dropped**.',
    src: 'Tanvir sir L5 p12',
  },
  {
    id: 'c-rk-surety-bond',
    topic: T,
    front: 'Define a **surety bond** by its three parties.',
    back: 'A financial instrument issued by a **third party (surety company)** to a **first party (owner)**, guaranteeing that a **second party (construction firm)** will complete the project according to the written contract.',
    seen: BOND_SEEN,
    src: 'Tanvir sir L5 p15',
  },
  {
    id: 'c-rk-identify',
    topic: T,
    front: 'Which element of risk management is **most critical**, and why?',
    back: '**Identification** — risk **cannot be managed if it is not identified**.',
    seen: ['2015-16', '2012-13'],
    src: 'Tanvir sir L5 p18',
  },
  {
    id: 'c-rk-two-phase',
    topic: T,
    front: 'What is the **two-phased approach** to risk management?',
    back: '**Assessment** (identification, analysis, prioritisation) then **Action** (allocation — hold, avoid, reduce, transfer, share — and monitoring & reporting). Advocated by practitioners and researchers as risk management becomes a distinct activity.',
    seen: ['2012-13'],
    src: 'Tanvir sir L5 p17–18',
  },
  {
    id: 'c-rk-firms',
    topic: T,
    front: 'How do construction firms actually treat risk?',
    back: 'Seldom quantitatively: they **ignore remote possibilities**, look at a few outcomes, **focus on opportunities rather than danger**, and pass risk to vendors and subcontractors through **performance clauses** — leading to sub-optimization of the whole project.',
    src: 'Tanvir sir L5 p16–17',
  },
  {
    id: 'c-rk-li',
    topic: T,
    front: 'Define **liability insurance** (slide wording).',
    back: 'A contract under which an insurance company agrees to **protect a person or entity against claims arising from real or alleged failure to fulfill an obligation or duty to a third party** who is an incidental beneficiary.',
    seen: ['2014-15'],
    src: 'Tanvir sir L5 p20',
  },
  {
    id: 'c-rk-pli',
    topic: T,
    front: 'Define **professional liability insurance** (slide wording).',
    back: 'Insurance coverage for the insured professional’s **legal liability for claims arising out of damages sustained by others allegedly as a result of negligent acts, errors, or omissions in the performance of professional services**.',
    seen: ['2014-15', '2011-12'],
    src: 'Tanvir sir L5 p20',
  },
  {
    id: 'c-rk-bond',
    topic: T,
    front: 'Define a **bond** (slide wording) — name the three parties.',
    back: 'In suretyship, an obligation by which one party (**surety** or obligator) agrees to guarantee performance by another (**principal**) of a specified obligation for the benefit of a third person or entity (**obligee**).',
    seen: ['May 2024', '2014-15', '2012-13'],
    src: 'Tanvir sir L5 p20',
  },
  {
    id: 'c-rk-actuary',
    topic: T,
    front: '**Actuaries** vs **underwriters**?',
    back: '**Actuaries** compute the **odds** that a given risk will materialize and its **probable cost**. **Underwriters** **evaluate each applicant** to determine the extent to which risks may occur and **what the premium should be**.',
    seen: PLAYER_SEEN,
    src: 'Tanvir sir L5 p21',
  },
  {
    id: 'c-rk-reinsurer',
    topic: T,
    front: 'Who are **reinsurers**?',
    back: 'Those who **insure insurers**, providing both **back-up** (should a large claim be filed) and **stability** to the industry.',
    seen: PLAYER_SEEN,
    src: 'Tanvir sir L5 p21',
  },
  {
    id: 'c-rk-insurers',
    topic: T,
    front: 'Who are **insureds** and **insurers**?',
    back: '**Insureds**: those to whom a policy’s coverage is extended. **Insurers**: insurance companies that **issue policies** and establish what they do and do not cover, **limits, deductibles and the premium**.',
    seen: PLAYER_SEEN,
    src: 'Tanvir sir L5 p21',
  },
  {
    id: 'c-rk-supply',
    topic: T,
    front: 'What influences the **cost of PLI** at industry level?',
    back: '**Risk, demand and level of coverage**; actuaries’ and underwriters’ analysis is a prime aspect. **Supply and demand**: high capacity + low demand → cheap; rising demand → more expensive.',
    seen: CONC_SEEN,
    src: 'Tanvir sir L5 p22–23',
  },
  {
    id: 'c-rk-deductible',
    topic: T,
    front: 'PLI **deductible**: the three slide points.',
    back: '1. **Raising a policy’s limit is relatively less expensive than lowering a deductible.** 2. Balance the **deductible, premium and level of coverage**. 3. A **new deductible obligation occurs with each claim**.',
    seen: ['2012-13', ...CONC_SEEN],
    src: 'Tanvir sir L5 p26',
  },
  {
    id: 'c-rk-project-pli',
    topic: T,
    front: '**Project professional liability insurance** — three points.',
    back: 'Covers the **entire project team, even those who practice without insurance**; **owners usually pay** when they want coverage beyond what design firms normally carry; when scope grows it can **cover consultants who could not otherwise obtain coverage**.',
    seen: ['2012-13', ...CONC_SEEN],
    src: 'Tanvir sir L5 p29',
  },
  {
    id: 'c-rk-insurability',
    topic: T,
    front: 'PLI concern **insurability**: what is not covered?',
    back: 'PLI covers only the professionals it is bought for. **Not covered**: owners’ demands that designers **indemnify** them, and **certificates that act as express warranties or guarantees**.',
    seen: CONC_SEEN,
    src: 'Tanvir sir L5 p28',
  },
  {
    id: 'c-rk-barratry',
    topic: T,
    front: 'What is **barratry**? And what claims point must a policy be checked for?',
    back: '**Barratry** = the **fomenting of claims where none exist**. Check for terms requiring **timely reporting of claims** — late reporting can jeopardize coverage.',
    seen: CONC_SEEN,
    src: 'Tanvir sir L5 p30',
  },
  {
    id: 'c-rk-jv',
    topic: T,
    front: 'PLI concern **joint ventures**?',
    back: 'Legally similar to **partnerships** (though with a more limited purpose); if a claim is made against a JV, **one or all members can be held liable** — take care over the type of PLI the JV uses.',
    seen: CONC_SEEN,
    src: 'Tanvir sir L5 p29',
  },
  {
    id: 'c-rk-devastating',
    topic: T,
    front: 'What is the **most devastating** professional and business risk for most CE firms?',
    back: '**Litigation based on accusations of negligence** in the performance of professional services. Buying appropriate insurance is a **major business decision**.',
    src: 'Tanvir sir L5 p32',
  },
  {
    id: 'c-rk-bid-bond',
    topic: T,
    front: '**Bid bond** guarantees…',
    back: 'That **if a contractor is successful in winning a bid**, it will **enter into a contract within a specified period of time and furnish any required bonds**.',
    seen: BOND_SEEN,
    src: 'Tanvir sir L5 p34',
  },
  {
    id: 'c-rk-perf-bond',
    topic: T,
    front: '**Performance bond**: when is it delivered and what does it guarantee?',
    back: 'Typically **delivered when the owner–contractor contract is signed**; guarantees the contractor will **perform the work in accordance with the contract documents**.',
    seen: BOND_SEEN,
    src: 'Tanvir sir L5 p34',
  },
  {
    id: 'c-rk-pay-bond',
    topic: T,
    front: '**Payment bond** provides…',
    back: 'Assurance that **certain payment obligations associated with a construction project will be satisfied**.',
    seen: BOND_SEEN,
    src: 'Tanvir sir L5 p34',
  },
  {
    id: 'c-rk-owner-surety',
    topic: T,
    front: 'What right does the owner usually reserve over bonds, and why does bonding capacity matter to a contractor?',
    back: 'The owner reserves the right to **approve the surety company and the form of the bond**. An entity’s ability to obtain bonds **greatly influences the type and size of projects it can pursue**.',
    seen: BOND_SEEN,
    src: 'Tanvir sir L5 p34–35',
  },
  {
    id: 'c-rk-left-table',
    topic: T,
    front: 'Surety inquiry: what is "**left on the table**" and when is it a concern?',
    back: 'The money between the contractor’s bid and the **next lowest bid**; a spread of **more than 5 or 6 percent** is cause for concern about the soundness of the contractor’s bidding practices.',
    seen: SURETY_SEEN,
    src: 'Tanvir sir L5 p37',
  },
  {
    id: 'c-rk-final-report',
    topic: T,
    front: 'What happens after a bonded project is completed?',
    back: 'The owner sends a **final report to the surety**: the contractor’s execution, changes made, and the **final total contract amount**, used to **adjust the final bond premium**.',
    src: 'Tanvir sir L5 p39',
  },
  {
    id: 'c-rk-fiduciary',
    topic: T,
    front: 'Define **fiduciary risk** (three parts).',
    back: 'The risk that funds **are not used for the intended purposes**; **do not achieve value for money**; and/or **are not properly accounted for**.',
    seen: FID_SEEN,
    src: 'Tanvir sir L5 p40',
  },
  {
    id: 'c-rk-fid-example',
    topic: T,
    front: 'Fiduciary risk from the trustee’s side — with the slide example.',
    back: 'The risk that a **trustee or other fiduciary** does not perform their duties or achieve the best value for the **beneficiary’s interests** — e.g. the fiduciary **making more trades than truly necessary**.',
    seen: FID_SEEN,
    src: 'Tanvir sir L5 p40',
  },
]

const answers: PcAnswer[] = [
  {
    id: 'a-rk-contract-risk',
    topic: T,
    q: 'What are the (eight) ways / activities of dealing with contract risk?',
    seen: CR_SEEN,
    a: `1. **Execute the contract in a professional manner** — be quality oriented.
2. **Thoroughly educate clients** — use general conditions to cover costs.
3. **Identify problems** — impose a fee premium or indemnification.
4. **Identify unavoidable/unacceptable risks** — e.g. modification of an existing structure, hazardous materials.
5. **Use the contract to close loopholes and avoid traps** — list services the client has declined.
6. **Establish extralegal conditions** — dispute resolution (mediation/arbitration), reduce the statute of limitations/repose, restrict damages.
7. **Develop clear contract language** — make sure the contract is easily understood by the client.
8. **If a client is adamant about not taking prudent measures — walk away.**

The question bank gives a different list (read the contract, prefer model forms, check insurability…) — not in the slides.`,
    keys: ['professional manner', 'quality oriented', 'educate clients', 'general conditions', 'Identify problems', 'fee premium', 'unavoidable/unacceptable risks', 'close loopholes', 'extralegal conditions', 'mediation/arbitration', 'clear contract language', 'walk away'],
    lists: ['l-rk-contract-risk'],
    src: 'Tanvir sir L5 p2–3',
  },
  {
    id: 'a-rk-general',
    topic: T,
    q: 'What general guidelines should be followed in dealing with risk?',
    seen: ['2023-24'],
    a: `### Prevent
- The most effective preventive approach is to **perform professionally** — eliminate misunderstanding and unrealistic expectations.
- Three very important factors: **a good formal contract**, **good project management**, **knowledge of preventable risks**.

### Transfer (partly)
- Transfer risk via **insurance and/or indemnification** — PLI gives only partial transfer; indemnification (full or partial) is also imperfect.
- **Transferring all risks is impossible**: keep a **loss reserves account** by including risk in fees; follow the "rules of the road"; be careful in **selecting clients and projects**.

### Before proposing
Do **background research** on the client and project; critically evaluate your capability; do not rely on past behaviour or assumptions.

### Before signing
Make sure of an appropriate clause, **explicit general conditions**, a **well-defined work-scope**, an accurate schedule and a clear budget.

### Other actions
Insist on an **adequate fee** or reduce scope (but never cut plan review, shop-drawing review or construction monitoring); add QC; do not agree to unmeetable deadlines; set up a **risk management program** with documentation; react quickly, communicate openly, use emotional intelligence.`,
    keys: ['perform professionally', 'good formal contract', 'good project management', 'insurance and/or indemnification', 'Transferring all risks is impossible', 'loss reserves', 'selecting clients', 'background research', 'explicit general conditions', 'well-defined work-scope', 'adequate fee', 'risk management program'],
    lists: ['l-rk-three-factors', 'l-rk-before-proposing', 'l-rk-before-signing', 'l-rk-program'],
    src: 'Tanvir sir L5 p6–13',
  },
  {
    id: 'a-rk-elements',
    topic: T,
    q: 'What are the elements of risk management? Describe the two-phased approach.',
    seen: ['2015-16', '2012-13'],
    a: `Optimizing within tasks has led to sub-optimization of whole projects, so risk management as a **distinct activity** is gaining attention. Practitioners and researchers advocate a **two-phased approach using assessment and action**.

### Phase 1 — Assessment
1. **Identification** — the **most critical element**: risk cannot be managed if it is not identified.
2. **Analysis**
3. **Prioritisation**

### Phase 2 — Action
4. **Allocation** — **hold, avoid, reduce, transfer, share**.
5. **Monitoring & reporting**

*Draw as a tree: Risk management → Assessment (identification, analysis, prioritisation) and Action (allocation, monitoring & reporting).*`,
    keys: ['two-phased approach', 'assessment', 'action', 'Identification', 'most critical element', 'Analysis', 'Prioritisation', 'Allocation', 'hold, avoid, reduce, transfer, share', 'Monitoring & reporting'],
    lists: ['l-rk-elements', 'l-rk-allocation'],
    src: 'Tanvir sir L5 p17–18',
    Fig: RiskTreeFig,
  },
  {
    id: 'a-rk-defs',
    topic: T,
    q: 'Define liability insurance, professional liability insurance and bond.',
    seen: ['May 2024', '2014-15', '2012-13', '2011-12'],
    a: `### Liability insurance
A contract under which an insurance company agrees to **protect a person or entity against claims arising from real or alleged failure to fulfill an obligation or duty to a third party** who is an incidental beneficiary.

### Professional liability insurance
Insurance coverage for the insured professional’s **legal liability for claims arising out of damages sustained by others allegedly as a result of negligent acts, errors, or omissions in the performance of professional services**. It is an essential part of risk management.

### Bond
In suretyship, an **obligation** by which one party (**surety** or obligator) agrees to **guarantee performance** by another (**principal**) of a specified obligation for the benefit of a third person or entity (**obligee**).`,
    keys: ['protect a person or entity', 'obligation or duty to a third party', 'legal liability', 'negligent acts, errors, or omissions', 'professional services', 'suretyship', 'surety', 'guarantee performance', 'principal', 'obligee'],
    src: 'Tanvir sir L5 p20',
  },
  {
    id: 'a-rk-players',
    topic: T,
    q: 'Who are the principal players in the professional liability insurance industry and what are their roles?',
    seen: PLAYER_SEEN,
    a: `1. **Insureds** — those to whom a policy’s coverage is extended (e.g. the civil engineering firm).
2. **Insurance agents** — specialize in selling various types of insurance and obtain **commissions** based on their sales.
3. **Insurers** — insurance companies that **issue policies** and establish what policies do and do not cover, **limits, deductibles, and the premium**.
4. **Actuaries** — compute the **odds** that a given risk will materialize and the **probable cost** of the risk.
5. **Underwriters** — **evaluate each applicant** to determine the extent to which risks may occur and **what the premium should be**.
6. **Claims managers** — **advise insureds** on what course of action to take when a claim arises.
7. **Reinsurers** — those who **insure insurers**, providing both **back-up** (should a large claim be filed) and **stability** to the industry.

Insurance is outlined in a **policy (contract)** between the civil engineer (insured) and the insurance company, protecting the professional in case of **negligence**.`,
    keys: ['Insureds', 'Insurance agents', 'commissions', 'Insurers', 'issue policies', 'Actuaries', 'odds', 'probable cost', 'Underwriters', 'evaluate each applicant', 'premium', 'Claims managers', 'Reinsurers', 'insure insurers'],
    lists: ['l-rk-players'],
    src: 'Tanvir sir L5 p21–22',
  },
  {
    id: 'a-rk-pli-concerns',
    topic: T,
    q: 'What are the specific concerns for professional liability insurance?',
    seen: CONC_SEEN,
    a: `1. **Policy limits** — the more protection, the more expensive; find the **lowest practical amount of coverage**, considering what clients require.
2. **Deductible** — raising the limit is relatively less expensive than lowering the deductible; balance deductible, premium and coverage; a **new deductible with each claim**.
3. **Cost** — calculated individually by the **underwriter** from type of practice, geographical area, project mix, **claims history**, coverage needs and resulting risks to the insurer.
4. **Insurability** — PLI covers only the professionals it is bought for; owner-demanded **indemnities** and warranty-like **certificates** are not covered.
5. **Subconsultants** — primes face **vicarious liability** for subconsultants’ negligence, so review their policies for limits and gaps.
6. **Joint ventures** — legally like **partnerships**; one or all members can be held liable.
7. **Project professional liability insurance** — covers the **entire project team**; usually paid by owners.
8. **Expanded project delivery** — cover for designers in **design-build** or acting as developers, via **endorsements**.
9. **Claims** — check for **timely reporting** terms; know **barratry** (fomenting claims where none exist).

The question bank lists other concerns (claims-made basis, retroactive date, hammer clause) — not in the slides.`,
    keys: ['Policy limits', 'lowest practical amount', 'Deductible', 'Cost', 'underwriter', 'claims history', 'Insurability', 'Subconsultants', 'vicarious liability', 'Joint ventures', 'Project professional liability insurance', 'Expanded project delivery', 'Claims', 'timely reporting', 'barratry'],
    lists: ['l-rk-pli-concerns', 'l-rk-cost-drivers'],
    src: 'Tanvir sir L5 p26–30',
  },
  {
    id: 'a-rk-deductible',
    topic: T,
    q: 'Short note: Deductible.',
    seen: ['2012-13'],
    a: `The deductible is the share of each claim the insured firm pays itself before the insurer pays — a specific concern for professional liability insurance.

1. Usually, **raising a policy’s limit is relatively less expensive than lowering a deductible**.
2. There has to be a **balance among the deductible, premium, and level of coverage**,
3. considering that a **new deductible obligation occurs with each claim**.`,
    keys: ['raising a policy’s limit', 'less expensive than lowering a deductible', 'balance', 'premium', 'level of coverage', 'new deductible obligation', 'each claim'],
    src: 'Tanvir sir L5 p26',
  },
  {
    id: 'a-rk-project-pli',
    topic: T,
    q: 'Short note: Project professional liability insurance.',
    seen: ['2012-13'],
    a: `1. Project insurance covers the **entire project team**, even those who **practice without insurance**.
2. **Owners usually pay** for project insurance when they desire coverage **beyond that normally carried by design firms**.
3. When the project scope is generally increased, it can provide a way to **cover consultants who could not otherwise obtain coverage**.`,
    keys: ['entire project team', 'practice without insurance', 'Owners usually pay', 'beyond that normally carried', 'cover consultants'],
    src: 'Tanvir sir L5 p29',
  },
  {
    id: 'a-rk-gli-epli',
    topic: T,
    q: 'Briefly discuss general liability insurance and employment practices liability insurance.',
    seen: GLI_SEEN,
    a: `In addition to professional liability insurance, a civil engineering firm may carry **additional liability insurance**:

### General liability insurance
- CE firms can be exposed to loss from other liability exposures such as **slips & falls**, **libel & slander** claims, and **property damage to third parties** arising from **office operations and nonprofessional activities at jobsites**.
- It usually covers claims involving **third-party liability** — **bodily injury, personal injury, property damage**, and so forth.
- It does **not cover professional, automobile, and workers’ compensation** exposures.

### Employment practices liability insurance
- In addition to sound management practices, some firms buy it to **protect against losses arising from employee charges of harassment, discrimination, and wrongful termination**.

Insurance may seem deceptively simple, but buying appropriate coverage is a **major business decision**. (The question bank says general liability covers the firm’s vehicles — the slide says automobile is not covered.)`,
    keys: ['slips & falls', 'libel & slander', 'property damage to third parties', 'nonprofessional activities', 'third-party liability', 'bodily injury', 'automobile', 'workers’ compensation', 'harassment', 'discrimination', 'wrongful termination'],
    lists: ['l-rk-gli-covers', 'l-rk-gli-excludes', 'l-rk-epli'],
    src: 'Tanvir sir L5 p31–32',
  },
  {
    id: 'a-rk-bonds',
    topic: T,
    q: 'Briefly describe the common types of bonds (bid bond, performance bond, payment bond).',
    seen: BOND_SEEN,
    a: `**Bond** — in suretyship, an obligation by which the **surety** guarantees performance by the **principal** of a specified obligation for the benefit of the **obligee**. Almost all contractors use **national surety companies**, which are subject to public regulation. The most common bonds are:

1. **Bid bond** — guarantees that **if a contractor is successful in winning a bid**, it will **enter into a contract within a specified period of time** and **furnish any required bonds**.
2. **Payment bond** — provides assurance that certain **payment obligations** associated with a construction project will be satisfied.
3. **Performance bond** — typically **delivered at the time the contract between the owner and contractor is signed**; it guarantees that the contractor will **perform the work in accordance with the contract documents**.

The **owner usually reserves the right to approve the surety company and the form of the bond**. The cost of a bond depends on the class of project, contract amount and contract format.`,
    keys: ['surety', 'principal', 'obligee', 'Bid bond', 'winning a bid', 'specified period of time', 'furnish any required bonds', 'Payment bond', 'payment obligations', 'Performance bond', 'contract documents', 'approve the surety company'],
    lists: ['l-rk-bonds', 'l-rk-bond-cost'],
    src: 'Tanvir sir L5 p20, p33–35',
  },
  {
    id: 'a-rk-surety',
    topic: T,
    q: 'What are the most important aspects of the inquiry surety companies undertake before issuing bonds?',
    seen: SURETY_SEEN,
    a: `Before issuing bonds, surety companies usually undertake thorough investigations. The usual and most important aspects are:

1. **Essential characteristics of the project** under consideration — size, type and nature; identity of the owner and the owner’s **ability to pay**; contractor’s adequate resources, equipment, expertise and experience.
2. **Total amount of bonded and unbonded uncompleted work** in the contractor’s current inventory — shows whether working capital, equipment and organization are becoming **overextended**.
3. **Adequacy of working capital and availability of credit** — substantiated by **financial reports**.
4. **Amount of money between the contractor’s bid and the next lowest bid** — what was "**left on the table**"; a spread over **5 or 6 percent** is cause for concern.
5. **Largest contract amount of similar work successfully undertaken and completed** — stay within expertise; start a new sector with small projects.
6. **Terms of the contract and bonds required** — payments, **retention**, time allotted, **liquidated damages**, required warranties.
7. **Amount of work subcontracted and qualifications of the subcontractors** — organization, financial resources and experience.

(Some books summarise this as "character, capacity, capital"; the slide gives these seven.)`,
    keys: ['Essential characteristics of the project', 'ability to pay', 'bonded and unbonded', 'overextended', 'working capital', 'availability of credit', 'next lowest bid', 'left on the table', '5 or 6 percent', 'similar work', 'Terms of the contract', 'retention', 'liquidated damages', 'subcontracted'],
    lists: ['l-rk-surety'],
    src: 'Tanvir sir L5 p36–38',
  },
  {
    id: 'a-rk-fiduciary',
    topic: T,
    q: 'What is fiduciary risk? What are the three principles of managing it, and how do they feed into each other?',
    seen: FID_SEEN,
    a: `### Definition
Fiduciary risk may be defined as the risk that funds **are not used for the intended purposes**; **do not achieve value for money**; and/or **are not properly accounted for**.

It can be realized through **lack of capacity, competency or knowledge**; **bureaucratic inefficiency**; and/or **active corruption**. It is also the risk that a **trustee or other fiduciary** does not perform their duties or achieve the best value for the **beneficiary’s interests** — e.g. making **more trades than truly necessary**.

### Three mutually reinforcing principles
1. **Understanding** the fiduciary risk environment
2. **Mitigating** risks to the proper use of funds
3. **Monitoring** performance on an on-going basis

### How they feed into each other
- A good **understanding** of fiduciary risk beforehand helps the designer decide **whether any mitigating measures are required** to safeguard funds.
- **Monitoring progress reinforces understanding** and allows **remedial action to be taken quickly** if problems arise.
- The three should be undertaken on a **continuous and continuing basis**.

(The question bank treats fiduciary risk as the engineer accepting trustee duties in a contract — not the slide’s meaning.)`,
    keys: ['intended purposes', 'value for money', 'properly accounted for', 'lack of capacity', 'bureaucratic inefficiency', 'active corruption', 'trustee', 'Understanding', 'Mitigating', 'Monitoring', 'remedial action', 'continuous and continuing'],
    lists: ['l-rk-fid-causes', 'l-rk-fid-principles'],
    src: 'Tanvir sir L5 p40–42',
  },
]

export default { lists, cards, answers } satisfies PcTopicContent

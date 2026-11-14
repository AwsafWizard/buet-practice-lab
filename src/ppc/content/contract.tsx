// pc-contract — Legal aspects: contracts, project delivery systems, procurement methods, contract formats (Tanvir sir L4).
// Source digest: CE301/Claude digests/lec_project_legal.md (pr-contract).
import type { FC } from 'react'
import type { PcAnswer, PcCard, PcList, PcTopicContent } from '../types'

const T = 'pc-contract' as const

// ---------- project delivery system organisation charts (theme tokens only) ----------
const ink = 'var(--c-ink)'
const mute = 'var(--c-mute)'
const line = 'var(--c-line)'
const panel2 = 'var(--c-panel2)'
const oia = 'var(--c-oia)'

const Box = ({ x, y, t, w = 96, strong }: { x: number; y: number; t: string[]; w?: number; strong?: boolean }) => (
  <g>
    <rect x={x} y={y} width={w} height={34} rx={5} fill={panel2} stroke={strong ? oia : mute} strokeWidth={strong ? 2.2 : 1.4} />
    {t.map((s, i) => (
      <text key={s} x={x + w / 2} y={y + (t.length === 1 ? 21 : 14 + i * 13)} textAnchor="middle" fontSize={11} fontWeight={strong ? 700 : 400} fill={ink}>
        {s}
      </text>
    ))}
  </g>
)
const L = ({ p, dotted }: { p: number[]; dotted?: boolean }) => (
  <polyline points={p.join(' ')} fill="none" stroke={mute} strokeWidth={1.6} strokeDasharray={dotted ? '2 3' : undefined} />
)
const Owner = ({ x = 102, y = 10 }: { x?: number; y?: number }) => <Box x={x} y={y} t={['Owner / Client']} strong />

type PdsKind = 'dbb' | 'db' | 'da' | 'mp' | 'acm' | 'cmr'
const CAPTION: Record<PdsKind, string> = {
  dbb: '1 – Design-Bid-Build (DBB)',
  db: '2 – Design-Build (DB)',
  da: '3 – Design-Assist (DA)',
  mp: '4 – Multiple Prime (MP)',
  acm: '5 – Agency Construction Management',
  cmr: '6 – Construction Management at Risk',
}

const PdsBody = ({ kind }: { kind: PdsKind }) => {
  switch (kind) {
    case 'dbb':
      return (
        <g>
          <Owner />
          <L p={[150, 44, 150, 62]} />
          <L p={[88, 80, 88, 62, 212, 62, 212, 80]} />
          <Box x={40} y={80} t={['Prime', 'Contractor']} />
          <Box x={164} y={80} t={['Prime', 'Designer']} />
          <L p={[88, 114, 88, 150]} />
          <L p={[212, 114, 212, 150]} />
          <Box x={40} y={150} t={['Subcontractors']} />
          <Box x={164} y={150} t={['Subconsultants']} />
        </g>
      )
    case 'db':
      return (
        <g>
          <Owner />
          <L p={[150, 44, 150, 70]} />
          <Box x={102} y={70} t={['Design-Build', 'Entity']} strong />
          <L p={[150, 104, 150, 122]} />
          <L p={[88, 140, 88, 122, 212, 122, 212, 140]} />
          <Box x={40} y={140} t={['Contractor /', 'Subcontractors']} />
          <Box x={164} y={140} t={['Prime Designer /', 'Subconsultants']} />
        </g>
      )
    case 'da':
      return (
        <g>
          <Owner />
          <L p={[150, 44, 150, 62]} />
          <L p={[50, 80, 50, 62, 250, 62, 250, 80]} />
          <L p={[150, 62, 150, 80]} />
          <Box x={6} y={80} w={88} t={['Prime', 'Contractor']} />
          <Box x={106} y={80} w={88} t={['Prime', 'Designer']} />
          <Box x={206} y={80} w={88} t={['Gen. Contractor', 'as Consultant']} strong />
          <L p={[194, 97, 206, 97]} dotted />
          <L p={[50, 114, 50, 150]} />
          <L p={[150, 114, 150, 150]} />
          <Box x={6} y={150} w={88} t={['Subcontractors']} />
          <Box x={106} y={150} w={88} t={['Subconsultants']} />
        </g>
      )
    case 'mp':
      return (
        <g>
          <Owner />
          <L p={[150, 44, 150, 52]} />
          <L p={[130, 177, 130, 52, 246, 52, 246, 70]} />
          {[60, 110, 160].map((y) => (
            <g key={y}>
              <Box x={20} y={y} t={['Prime', 'Contractor']} />
              <L p={[116, y + 17, 130, y + 17]} />
            </g>
          ))}
          <Box x={198} y={70} t={['Prime', 'Designer']} />
          <L p={[246, 104, 246, 140]} />
          <Box x={198} y={140} t={['Subconsultants']} />
        </g>
      )
    case 'acm':
      return (
        <g>
          <Owner y={8} />
          <L p={[150, 42, 150, 60]} />
          <Box x={102} y={60} t={['Construction', 'Manager']} strong />
          <L p={[150, 94, 150, 106]} />
          <L p={[88, 118, 88, 106, 212, 106, 212, 118]} />
          <Box x={40} y={118} t={['Prime', 'Contractor']} />
          <Box x={164} y={118} t={['Prime', 'Designer']} />
          <L p={[88, 152, 88, 176]} />
          <L p={[212, 152, 212, 176]} />
          <Box x={40} y={176} t={['Subcontractors']} />
          <Box x={164} y={176} t={['Subconsultants']} />
        </g>
      )
    case 'cmr':
      return (
        <g>
          <Owner />
          <L p={[150, 44, 150, 62]} />
          <L p={[88, 80, 88, 62, 212, 62, 212, 80]} />
          <Box x={40} y={80} t={['CM at Risk /', 'Gen. Contractor']} strong />
          <Box x={164} y={80} t={['Prime', 'Designer']} />
          <L p={[136, 97, 164, 97]} dotted />
          <L p={[88, 114, 88, 150]} />
          <L p={[212, 114, 212, 150]} />
          <Box x={40} y={150} t={['Subcontractors']} />
          <Box x={164} y={150} t={['Subconsultants']} />
        </g>
      )
  }
}

const PdsCell = ({ kind, x = 0, y = 0 }: { kind: PdsKind; x?: number; y?: number }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={2} y={2} width={296} height={236} rx={6} fill="none" stroke={line} />
    <PdsBody kind={kind} />
    <text x={150} y={228} textAnchor="middle" fontSize={12} fontWeight={700} fill={ink}>
      {CAPTION[kind]}
    </text>
  </g>
)

const PdsAllFig: FC = () => (
  <svg viewBox="0 0 900 480" width="100%" role="img" aria-label="Six project delivery systems as organisation charts">
    <PdsCell kind="dbb" />
    <PdsCell kind="db" x={300} />
    <PdsCell kind="da" x={600} />
    <PdsCell kind="mp" y={240} />
    <PdsCell kind="acm" x={300} y={240} />
    <PdsCell kind="cmr" x={600} y={240} />
  </svg>
)
const one = (kind: PdsKind): FC => {
  const F: FC = () => (
    <svg viewBox="0 0 300 240" width="100%" style={{ maxWidth: 420 }} role="img" aria-label={CAPTION[kind]}>
      <PdsCell kind={kind} />
    </svg>
  )
  return F
}
const DbbFig = one('dbb')
const MpFig = one('mp')
const DbbDbFig: FC = () => (
  <svg viewBox="0 0 600 240" width="100%" role="img" aria-label="DBB and DB organisation charts">
    <PdsCell kind="dbb" />
    <PdsCell kind="db" x={300} />
  </svg>
)

// ---------- seen labels ----------
const TT_SEEN = ['2023-24', '2022-23', '2020-21', '2016-17', '2015-16', '2014-15', '2013-14', '2012-13']
const TRIPLE_SEEN = ['2023-24', '2022-23', '2021-22', '2015-16', '2012-13']
const PDS_SEEN = ['2023-24', '2022-23', '2021-22', '2017-18', '2015-16', '2013-14', '2012-13']
const ELEM_SEEN = ['2020-21', 'Jan 2021', '2016-17']
const FMT_SEEN = ['2021-22', '2020-21', '2014-15', '2012-13', '2011-12']

const lists: PcList[] = [
  {
    id: 'l-ct-categories',
    topic: T,
    title: 'Terms used to categorize contracts',
    points: [
      { k: 'Bilateral / unilateral', alt: ['bilateral', 'unilateral'], d: 'involving two parties / involving one party' },
      { k: 'Enforceable / unenforceable', alt: ['enforceable', 'unenforceable'], d: 'containing / not containing all necessary elements (statute of frauds, statute of limitations)' },
      { k: 'Void', d: 'missing one or more elements, perhaps due to an oversight' },
      { k: 'Voidable', d: 'giving a party the right to call the contract void' },
      { k: 'Express / implied', alt: ['express', 'implied'], d: 'agreeing explicitly / relying on parties’ actions toward one another' },
      { k: 'Written / verbal', alt: ['written', 'verbal', 'oral'], d: 'text or orally based' },
    ],
    hook: '"Both Enforce, Void, Voidable, Express, Write" — B-E-V-V-E-W: pairs first and last, the two V’s in the middle.',
    seen: ['Jan 2021'],
    src: 'Tanvir sir L4 p4',
    note: 'The question bank adds executed/executory, formal/simple and payment basis, and defines bilateral as "promise for a promise" — not the slide.',
  },
  {
    id: 'l-ct-elements',
    topic: T,
    title: 'Elements that must be present for a contract to be binding',
    points: [
      { k: 'Agreement', d: 'acceptance of an offer' },
      { k: 'Consideration', d: 'agreed upon or perceived value' },
      { k: 'Legality', d: 'adherence to public policy (enforceability)' },
      { k: 'Authentication', alt: ['attestation', 'signature'], d: 'signature or corporate seal (attestation)' },
      { k: 'Capacity', alt: ['competent parties'], d: 'signatories sane and have authority to represent the business entity' },
      { k: 'Legal purpose', d: 'subject of the contract must be legal' },
    ],
    hook: '"ACL, ACL" — say it twice: A-C-L (the deal is valid), A-C-L (signed, by able people, for a lawful object).',
    seen: ELEM_SEEN,
    src: 'Tanvir sir L4 p5',
    note: 'The question bank gives offer, acceptance, mutual assent, consideration, competent parties, legal purpose — it drops Legality and Authentication. Write the slide’s six.',
  },
  {
    id: 'l-ct-formation',
    topic: T,
    title: 'Issues to consider in contract formation',
    points: [
      { k: 'Assumption of liability', d: 'avoid promising more than common law requires ("highest professional level")' },
      { k: 'Professional liability insurance', alt: ['PLI'], d: 'most policies exclude liabilities assumed in the contract' },
      { k: 'Disparate bargaining power', d: 'one party has an unfair advantage; contract of adhesion' },
      { k: 'Indemnifications', alt: ['indemnification', 'indemnity'], d: '"to secure against loss or damage"' },
    ],
    hook: '"A PID": Assumption, PLI, Imbalance of power (disparate), inDemnification.',
    seen: ['2011-12'],
    src: 'Tanvir sir L4 p6–10',
    note: 'The Tanvir note writes these under "typical contract formats" — a mislabel. The question bank lists ten generic contract terms instead.',
  },
  {
    id: 'l-ct-best-measures',
    topic: T,
    title: 'Best measures when entering into a contract with a client',
    points: [
      { k: 'Perform professionally' },
      { k: 'Create realistic expectations' },
      { k: 'Make clients aware of risks' },
      { k: 'Minimize one’s own risk', alt: ['minimize engineer risk'] },
      { k: 'Obtain liability insurance', d: '…and be sure of coverage' },
      { k: 'Consult a knowledgeable attorney' },
    ],
    seen: [],
    src: 'Tanvir sir L4 p11',
  },
  {
    id: 'l-ct-min-contents',
    topic: T,
    title: 'Minimum contents of any contract for civil engineering services',
    points: [{ k: 'Scope of services' }, { k: 'General conditions' }, { k: 'Performance schedule' }, { k: 'Fee proposal' }],
    seen: [],
    src: 'Tanvir sir L4 p14',
  },
  {
    id: 'l-ct-formats',
    topic: T,
    title: 'Commonly used contract formats',
    points: [
      { k: 'Conventional proposal', d: 'proposal in response to an RFP/RFQ; SOW + general conditions + fee + schedule' },
      { k: 'Negotiated terms and conditions', d: 'scope and risk negotiated; addendum (Special Conditions)' },
      { k: 'Multiple contracts', d: 'owner contracts separately with prime and subs' },
      { k: 'Special contracts for major projects', d: 'custom contracts with standard clauses; attorneys' },
      { k: 'Client-developed contracts', d: 'large clients shift risk to designers' },
      { k: 'Purchase orders', d: 'public client in a hurry; small jobs; meant for materials' },
      { k: 'Model contracts', alt: ['standard form contracts'], d: 'AIA, ConsensusDOCS, DBIA, FIDIC, JCT, ENAA' },
    ],
    hook: '"Can Negotiators Make Special Client Purchases Moderately?" — Conventional, Negotiated, Multiple, Special, Client-developed, Purchase orders, Model.',
    seen: FMT_SEEN,
    src: 'Tanvir sir L4 p14',
    note: 'The question bank lists only five (merges client-developed and purchase orders, omits special contracts for major projects).',
  },
  {
    id: 'l-ct-fee-items',
    topic: T,
    title: 'Fee items a conventional proposal mentions',
    points: [{ k: 'Staff rates/time' }, { k: 'Computer use' }, { k: 'Testing' }, { k: 'A schedule of fees' }, { k: 'Costs for additional services' }],
    seen: [],
    src: 'Tanvir sir L4 p17',
  },
  {
    id: 'l-ct-client-offsets',
    topic: T,
    title: 'How a CE can offset the risk of a client-developed contract',
    points: [
      { k: 'Read RFPs and RFQs carefully', d: 'responses can become part of the contract' },
      { k: 'Have attorneys review the contract' },
      { k: 'Charge a fee premium', alt: ['free premium'] },
      { k: 'List outstanding issues in a cover letter', d: '…and negotiate later' },
      { k: 'Attempt to make the client accept risk' },
    ],
    seen: [],
    src: 'Tanvir sir L4 p22',
  },
  {
    id: 'l-ct-model-bodies',
    topic: T,
    title: 'Bodies that publish model (standard form) contracts',
    points: [
      { k: 'AIA', alt: ['American Institute of Architects'], d: 'USA' },
      { k: 'ConsensusDOCS', d: 'AGC + 20 other organizations, USA' },
      { k: 'DBIA', alt: ['Design Build Institute of America'], d: 'USA' },
      { k: 'FIDIC', alt: ['International Federation of Consulting Engineers'], d: 'Lausanne; developing countries; World Bank recognised' },
      { k: 'JCT', alt: ['Joint Contract Tribunal'], d: 'Standard Form of Building Contract, UK' },
      { k: 'ENAA', alt: ['Engineering Advancement Association of Japan'], d: 'power plants on a design-build basis; World Bank recognised' },
    ],
    seen: ['2015-16', '2014-15', '2011-12'],
    src: 'Tanvir sir L4 p24–25',
  },
  {
    id: 'l-ct-interpretation',
    topic: T,
    title: 'How courts interpret contracts',
    points: [
      { k: 'As a whole', d: 'give reasonable meaning to all terms' },
      { k: 'Specific negotiated provisions outweigh general terms' },
      { k: 'Industry usage of words', d: 'words and how they are used in a specific industry' },
      { k: 'Course of performance and course of conduct', d: 'this contract / previous contracts' },
      { k: 'Unilateral mistakes are not part of the contract', d: '…nor unexpressed intentions' },
    ],
    seen: ['2011-12'],
    src: 'Tanvir sir L4 p26',
  },
  {
    id: 'l-ct-think-twice',
    topic: T,
    title: '"Think Twice" contract clauses',
    points: [
      { k: 'Certification', d: '"certify" can be read as guarantee/warrant → define it' },
      { k: 'Consequential damages', d: 'liability out of proportion to fee → general limit of liability' },
      { k: 'Construction cost estimates', alt: ['cost estimates'], d: 'seen as "guarantee maximum" → "opinion of probable construction cost"' },
      { k: 'Construction monitoring', d: 'plans never complete → make it an additional service' },
      { k: 'Curing a breach', d: 'method not addressed → define mutual responsibilities' },
      { k: 'Discovery of unanticipated hazardous materials', alt: ['hazardous materials'], d: 'claims → changed-conditions clause' },
      { k: 'Excluded services', d: 'client "not told" → list excluded services' },
      { k: 'Freedom to report', d: 'contractor sues over critical report → client indemnifies / report confidentially' },
      { k: 'Indemnification', alt: ['indemnity'], d: 'broad / intermediate / limited forms → eliminate or limit' },
      { k: 'Jobsite safety', d: 'stop-work responsibility → avoid; may void insurance' },
      { k: 'Limitation of liability', d: 'client sees no value → risk allocation clause' },
      { k: 'Maintenance of service', d: 'prime contract cancelled → right to carry on' },
      { k: 'Ownership of instruments of service', alt: ['ownership of documents'], d: 'reuse; strict liability → indemnity against reuse' },
      { k: 'Record documents', alt: ['as-built drawings'], d: '"as-built" implies no error → "record drawings"' },
      { k: 'Right to reject and/or stop work', alt: ['right to reject', 'stop work'], d: 'CE should observe → waiver + indemnification' },
    ],
    hook: 'The slide list is ALPHABETICAL: 5 C’s (Certify → Consequences → Cost → Construction → Cure), then D-E-F, I-J, L-M, O, R-R. Count it: 5 + 3 + 2 + 2 + 1 + 2 = 15.',
    seen: TT_SEEN,
    src: 'Tanvir sir L4 p27–37',
    note: 'The question bank lists 7 different clauses (standard of care, warranties, fiduciary duty, pay-when-paid…). Only indemnification, certification, consequential damages and limitation of liability overlap — learn the slide’s 15.',
  },
  {
    id: 'l-ct-indemnity-forms',
    topic: T,
    title: 'Forms of client-proposed indemnification clauses',
    points: [
      { k: 'Broad form', d: 'CE covers the client even when the problem is caused solely by the client' },
      { k: 'Intermediate form', d: 'CE’s negligence, sole or in concert — may pay 100% for 1% fault' },
      { k: 'Limited form', d: 'CE’s own negligence — mixes tort and contract liability' },
    ],
    seen: [],
    src: 'Tanvir sir L4 p31–32',
  },
  {
    id: 'l-ct-choices',
    topic: T,
    title: 'What clients must choose in project delivery',
    points: [{ k: 'Delivery system' }, { k: 'Procurement method' }, { k: 'Contract format' }],
    seen: TRIPLE_SEEN,
    src: 'Tanvir sir L4 p38',
  },
  {
    id: 'l-ct-choices-affect',
    topic: T,
    title: 'What the delivery / procurement / format choices directly affect',
    points: [{ k: 'The civil engineer’s role' }, { k: 'Type of services provided' }, { k: 'Means of compensation' }],
    seen: [],
    src: 'Tanvir sir L4 p38',
  },
  {
    id: 'l-ct-pds',
    topic: T,
    title: 'Project delivery systems',
    points: [
      { k: 'Design-Bid-Build (DBB)', alt: ['DBB', 'design bid build'], d: 'linear: design, then bid, then build; most common' },
      { k: 'Multiple Prime', alt: ['MP'], d: 'DBB variant: several prime contractors, no GC' },
      { k: 'Construction Management at Risk', alt: ['CM at risk', 'CMAR'], d: 'CM helps manage design, then builds' },
      { k: 'Agency Construction Management', alt: ['agency CM', 'CM agency'], d: 'CM is the client’s consultant; does not build' },
      { k: 'Design-Build (DB)', alt: ['DB', 'design build'], d: 'one entity designs and builds' },
      { k: 'Design-Assist', alt: ['DA', 'design assist'], d: 'contractor hired as consultant during DBB design' },
    ],
    hook: 'DBB and its family: split the contractor (Multiple Prime); add a CM who builds (at Risk) or only advises (Agency); merge designer and builder (DB); let a contractor advise the designer (Design-Assist).',
    seen: PDS_SEEN,
    src: 'Tanvir sir L4 p39–48 (Table 11.2, DBIA)',
    note: 'The question bank adds Turnkey/DBO, BOT/PPP and EPC and leaves out Design-Assist. The slide table has exactly these six.',
  },
  {
    id: 'l-ct-procurement',
    topic: T,
    title: 'Procurement methods (selecting consultants and contractors)',
    points: [
      { k: 'Sole source', d: 'client simply chooses; private sector; public only for national security / emergency' },
      { k: 'Limited competition — negotiation', alt: ['limited competition', 'negotiated'], d: 'panel interviews listed firms; negotiate with top 1–3' },
      { k: 'Qualifications-based selection (QBS)', alt: ['QBS', 'qualification based selection'], d: 'two-envelope system' },
      { k: 'Best value selection', alt: ['BV', 'BVS', 'best value'], d: 'two-phase: RFQ then RFP; technical + cost' },
      { k: 'Fee-based selection', alt: ['fee based', 'price based'], d: 'price alone' },
    ],
    hook: 'From no competition to pure price: Sole → Limited → Qualifications → Best value → Fee.',
    seen: [...TRIPLE_SEEN, 'Jan 2021'],
    src: 'Tanvir sir L4 p39, p49–54',
    note: 'The question bank adds "competitive sealed bidding (low bid)" and the PPA methods — not in this slide table. The p49 bullet list names four (no QBS) but QBS is described on p51–52 and is in the table.',
  },
  {
    id: 'l-ct-pricing',
    topic: T,
    title: 'Contract formats (in the client’s acquisition strategy)',
    points: [
      { k: 'Lump sum (fixed price)', alt: ['lump sum', 'fixed price'], d: 'single price; risk on the engineer' },
      { k: 'Cost plus a fixed fee', alt: ['cost plus'], d: 'cost of work + a fixed (percentage) fee' },
      { k: 'Guaranteed maximum price (GMP)', alt: ['GMP'], d: 'cost plus with an upper limit' },
      { k: 'Target', alt: ['target price'], d: 'target price + incentive fee on performance criteria' },
      { k: 'Unit price', d: 'prices variable quantities' },
    ],
    hook: '"One price, cost + fee, a cap, a target, per unit."',
    seen: ['2023-24', '2022-23', '2021-22', '2016-17', '2015-16', '2012-13'],
    src: 'Tanvir sir L4 p39, p55–61',
    note: 'Cost plus, GMP and target are the three "cost reimbursable" types (L4 p55). The question bank adds time-and-materials and incentive contracts — not on the slides.',
  },
  {
    id: 'l-ct-dbb-pros',
    topic: T,
    title: 'Why owners like DBB',
    points: [
      { k: 'Work directly with the prime designer', d: 'and exercise control over the entire project, including construction' },
      { k: 'Several contractors give prices', d: 'select the lowest bid' },
      { k: 'Allowed in public procurement' },
    ],
    seen: ['2022-23', '2017-18', '2015-16', '2013-14', '2012-13'],
    src: 'Tanvir sir L4 p42',
  },
  {
    id: 'l-ct-dbb-cons',
    topic: T,
    title: 'Downsides of DBB',
    points: [{ k: 'Contractor has no input in design' }, { k: 'Process tends not to be collaborative' }],
    seen: ['2022-23', '2017-18', '2015-16', '2013-14', '2012-13'],
    src: 'Tanvir sir L4 p42',
  },
  {
    id: 'l-ct-db-benefits',
    topic: T,
    title: 'Benefits of Design-Build',
    points: [
      { k: 'Innovation, value engineering, constructability enhanced' },
      { k: 'Schedules shortened, cost known early' },
      { k: 'Unified recommendations', d: 'designer and contractor on the same team' },
      { k: 'Fewer changes, claims and litigation', d: 'owner no longer between designer and contractor' },
      { k: 'Risks allocated to those who best manage them', d: 'also accommodates complex phasing' },
    ],
    seen: ['2022-23', '2017-18', '2013-14'],
    src: 'Tanvir sir L4 p43–44',
  },
  {
    id: 'l-ct-mp-cons',
    topic: T,
    title: 'Two primary disadvantages of Multiple Prime',
    points: [{ k: 'Client’s duty to coordinate the primes' }, { k: 'Liability for delays caused by one prime' }],
    seen: ['2017-18', '2016-17', '2013-14'],
    src: 'Tanvir sir L4 p45',
  },
  {
    id: 'l-ct-qbs-steps',
    topic: T,
    title: 'Steps of Qualification-Based Selection (two-envelope)',
    points: [
      { k: 'Selection on qualifications & project approach', alt: ['qualifications and project approach'] },
      { k: 'Two-envelope system', alt: ['two envelopes', 'firms submit two envelopes'], d: 'first envelope = the engineer’s response to the RFP; second envelope = the cost for executing the proposed work' },
      { k: 'Client issues an RFP', alt: ['RFP with clear requirements, budget, schedule'], d: 'ideally with a clear definition of project requirements and well-defined budget and schedule constraints' },
      { k: 'Firms ranked on the first envelope', alt: ['rank on the first envelope'] },
      { k: 'Short list interviewed and ranked again', alt: ['interview the short list'] },
      { k: 'Client opens the second envelope', alt: ['open the second envelope'], d: 'to learn the price, after a firm has been selected on the merits of its proposal and interview(s)' },
      { k: 'Negotiations with the top-ranked firm ensue', alt: ['negotiate with the top-ranked firm'] },
      { k: 'Scope and/or services added or deleted', d: 'until a mutually acceptable price can be reached' },
      { k: 'If no agreement, negotiate with firm ranked second', alt: ['negotiate with the second'] },
    ],
    ordered: true,
    seen: ['Jan 2021'],
    src: 'Tanvir sir L4 p51–52 (the slide’s nine bullets, as the 18-batch solve numbers them)',
  },
  {
    id: 'l-ct-bv-steps',
    topic: T,
    title: 'Steps of Best Value selection (two-phase)',
    points: [
      { k: 'Two-phase process: technical and cost criteria', alt: ['two-phase', 'technical and cost'] },
      { k: 'Client issues an RFQ; firms ranked' },
      { k: 'Short list issued an RFP', d: 'perhaps with a stipend or honorarium' },
      { k: 'Technical approach and cost scored independently' },
      { k: 'Higher cost can win on superior technical proposal' },
    ],
    ordered: true,
    seen: ['Jan 2021'],
    src: 'Tanvir sir L4 p53',
  },
]

const cards: PcCard[] = [
  {
    id: 'c-ct-contract',
    topic: T,
    front: 'Define a **contract**, and why must every project have a written one?',
    back: 'A **legally binding agreement that sets forth each party’s responsibility to each other**. Without a written agreement, responsibilities are left to **assumption** and key provisions to the **vagaries of memory**.',
    src: 'Tanvir sir L4 p3',
  },
  {
    id: 'c-ct-void',
    topic: T,
    front: '**Void** vs **voidable** contract?',
    back: '**Void**: missing one or more elements, perhaps due to an oversight. **Voidable**: gives a party the **right to call the contract void**.',
    seen: ['Jan 2021'],
    src: 'Tanvir sir L4 p4',
  },
  {
    id: 'c-ct-enforceable',
    topic: T,
    front: '**Enforceable** vs **unenforceable** — with examples of why a contract can be unenforceable.',
    back: 'Enforceable contains all necessary elements; unenforceable does not — e.g. the **statute of frauds** requires certain contracts to be in writing, or the **statute of limitations** has passed.',
    seen: ['Jan 2021'],
    src: 'Tanvir sir L4 p4',
  },
  {
    id: 'c-ct-standard',
    topic: T,
    front: 'What standard of practice does the law require of a CE, and what wording should be avoided?',
    back: 'Only "**ordinary skill and acceptance**". Avoid provisions demanding the "**highest professional level**" — they assume more than common law requires, and a negligent act then creates **both tort and contractual liability** (usually uninsured).',
    seen: ['2011-12'],
    src: 'Tanvir sir L4 p7',
  },
  {
    id: 'c-ct-adhesion',
    topic: T,
    front: 'What is a **contract of adhesion**, and what can the CE do about an onerous clause?',
    back: 'Results from **disparate bargaining power** — one party has little power (e.g. a very large client offering the only commissions in a small town). The CE can follow up with a **letter** saying the clause was accepted because the work was needed and disparate bargaining power was at work.',
    seen: ['2011-12'],
    src: 'Tanvir sir L4 p9',
  },
  {
    id: 'c-ct-indemnify',
    topic: T,
    front: 'Define **indemnification** and give two examples.',
    back: '"**To secure against loss or damage**." The client may indemnify the CE for required certifications; owner–contractor contracts often indemnify the **owner and design consultants** against suits by injured workers or visitors.',
    seen: ['2011-12'],
    src: 'Tanvir sir L4 p10',
  },
  {
    id: 'c-ct-general-conditions',
    topic: T,
    front: 'What are **general conditions**?',
    back: '**Nontechnical understandings** between the two parties — the business context and mutual responsibilities, such as **when payments are due** and **limitations of liability**. Most firms have standard general conditions; changes go in an addendum (**Special Conditions**).',
    src: 'Tanvir sir L4 p16, p18',
  },
  {
    id: 'c-ct-vicarious',
    topic: T,
    front: 'What is **vicarious liability**, and which contract format reduces it?',
    back: 'Exposure to liability **stemming from contractual relationships with other design professionals** (e.g. subconsultants). **Multiple contracts** — the owner contracts directly with the subs — reduce it for the prime designer.',
    seen: ['2014-15', '2011-12'],
    src: 'Tanvir sir L4 p19',
  },
  {
    id: 'c-ct-free-insurance',
    topic: T,
    front: 'How can a CE become the client’s source of **"free" insurance**?',
    back: 'Through **client-developed contracts** that shift more liability to the designer than law or custom requires; **insurers do not accept** these extra risks, so the CE carries them uninsured.',
    src: 'Tanvir sir L4 p21',
  },
  {
    id: 'c-ct-po',
    topic: T,
    front: 'When are **purchase orders** used to hire engineers, and what is the catch?',
    back: 'When a **public client with a critical need** has no time for formal selection; public contract codes cap the amount, so projects are **small**. POs are designed to **purchase materials** and are not really appropriate for professional services.',
    src: 'Tanvir sir L4 p23',
  },
  {
    id: 'c-ct-fidic',
    topic: T,
    front: 'What is **FIDIC** and why does it matter?',
    back: 'The **International Federation of Consulting Engineers**, headquartered in **Lausanne, Switzerland** — a coalition of independent consulting engineers; leader in standard form contracts, widely used in developing countries and **recognized by the World Bank**.',
    seen: ['2015-16', '2014-15', '2011-12'],
    src: 'Tanvir sir L4 p25',
  },
  {
    id: 'c-ct-dbb',
    topic: T,
    front: '**DBB** in one line?',
    back: 'Linear: client contracts a prime designer; when design is complete, contractors **bid** on the documents; client contracts the winning builder. **Designer and contractor share no direct, formal contract.** Still the most common method.',
    seen: PDS_SEEN,
    src: 'Tanvir sir L4 p41',
  },
  {
    id: 'c-ct-db',
    topic: T,
    front: '**DB** in one line?',
    back: 'Client contracts **one entity for both design and construction** (limited partnership, joint venture or integrated corporation; led by designer, contractor or developer); client supplies **design requirements and performance specifications**.',
    seen: PDS_SEEN,
    src: 'Tanvir sir L4 p43',
  },
  {
    id: 'c-ct-mp',
    topic: T,
    front: '**Multiple Prime** in one line, with its advantage?',
    back: 'A DBB variant for sophisticated clients with in-house CM capability: after design the client hires **several prime contractors instead of one general contractor** (site, steel, mechanical, electrical, or zones/phases). Advantage: **eliminates the GC’s fees**.',
    seen: ['2016-17', ...PDS_SEEN],
    src: 'Tanvir sir L4 p45',
  },
  {
    id: 'c-ct-cmr',
    topic: T,
    front: '**CM at Risk** in one line?',
    back: 'Client hires a prime designer and a **construction manager who helps manage the design and then builds** the project — earlier construction cost, value engineering, shorter schedule; a **guaranteed construction cost** known early when budgets are tight.',
    seen: PDS_SEEN,
    src: 'Tanvir sir L4 p46',
  },
  {
    id: 'c-ct-acm',
    topic: T,
    front: '**Agency CM** in one line?',
    back: 'The CM **acts as a consultant** to the client, managing the design-bid process and construction, **but does not construct**; adds a **layer of management and fees**, worthwhile for clients lacking specialized knowledge.',
    seen: PDS_SEEN,
    src: 'Tanvir sir L4 p47',
  },
  {
    id: 'c-ct-da',
    topic: T,
    front: '**Design-Assist** in one line, and its problem?',
    back: 'A **contractor hired as a consultant during the DBB design phase** for constructability reviews. Problem: the consulting contractor may differ from the one who builds (changes during construction), and **conflict-of-interest laws** may bar it from bidding.',
    seen: PDS_SEEN,
    src: 'Tanvir sir L4 p48',
  },
  {
    id: 'c-ct-ve',
    topic: T,
    front: 'Define **value engineering** and **constructability**.',
    back: '**Value engineering**: making changes to maintain or increase value to the client while lowering construction costs. **Constructability**: the **buildability** of the design.',
    src: 'Tanvir sir L4 p43, p46',
  },
  {
    id: 'c-ct-sole',
    topic: T,
    front: 'When is **sole source** selection allowed?',
    back: 'Common in the **private sector**, especially when only one firm can provide highly specialized services; generally **not permitted in the public sector** unless **national security or emergencies** arise.',
    seen: ['Jan 2021'],
    src: 'Tanvir sir L4 p50',
  },
  {
    id: 'c-ct-fee-based',
    topic: T,
    front: 'Why is **fee-based selection** not really appropriate for engineers?',
    back: 'The award criterion is **price alone**, unsuited to highly judgmental, creative work; review is fast and uncomplicated, but there are **few incentives for innovation** or exceptional performance.',
    seen: ['Jan 2021'],
    src: 'Tanvir sir L4 p54',
  },
  {
    id: 'c-ct-lump',
    topic: T,
    front: '**Lump sum** contract: who bears the risk, and when is it suitable?',
    back: 'A single price; the **SOW must be very clear**. **Risk is borne by the engineer**, who also keeps any savings; easy to administer (cost substantiation only for progress payments); price, schedule and performance known at the outset.',
    seen: ['2016-17'],
    src: 'Tanvir sir L4 p56',
  },
  {
    id: 'c-ct-costplus',
    topic: T,
    front: '**Cost reimbursable** / **cost plus a fixed fee**?',
    back: 'Actual cost is passed through to the client — used in **negotiated work on technically difficult or unique** projects; savings go to the client but price is unknown until completion. Cost plus: engineer bills cost **plus a fee**, usually a fixed **percentage negotiated before award**.',
    seen: ['2016-17'],
    src: 'Tanvir sir L4 p57',
  },
  {
    id: 'c-ct-gmp',
    topic: T,
    front: '**GMP** contract?',
    back: 'A version of cost plus where the **upper limit of cost is known initially**; savings below the GMP accrue to the client; substantial overhead in identifying/reporting costs, problems with wage mark-ups and staffing levels.',
    seen: ['2016-17'],
    src: 'Tanvir sir L4 p58',
  },
  {
    id: 'c-ct-target',
    topic: T,
    front: '**Target** contract?',
    back: 'Client and engineer set a **target price and an incentive fee** on performance criteria; the proposal contains **no profit**; fee is earned if performance and price targets are met — lowers client risk; cost reconciliation is a burden.',
    seen: ['2016-17'],
    src: 'Tanvir sir L4 p58–59',
  },
  {
    id: 'c-ct-unit',
    topic: T,
    front: '**Unit price** contract and its problems?',
    back: '**Prices variable quantities** (cubic yards of concrete, design hours, feet of paving). Problems: **composite units** (pipe — excavation, rebar, backfill?), units substituted for milestones, unmeasurable activities (permits), changed situations (overtime).',
    seen: ['2016-17'],
    src: 'Tanvir sir L4 p60–61',
  },
  {
    id: 'c-ct-opc',
    topic: T,
    front: 'Think-twice: what should a "cost estimate" be called in the contract, and why?',
    back: '"**Opinion of probable construction cost**" — the client may treat a "cost estimate" as a **guarantee maximum**, and an inaccurate estimate could trigger claims. Better still, use a cost-estimating specialist.',
    seen: TT_SEEN,
    src: 'Tanvir sir L4 p29',
  },
  {
    id: 'c-ct-record',
    topic: T,
    front: 'Think-twice: why say "**record drawings**" instead of "as-built drawings"?',
    back: '"As-built drawings" or "corrected specifications" imply **without error**, though they rely on others’ information. Use "**record drawings / record specifications**" with a prominent notice on each page.',
    seen: TT_SEEN,
    src: 'Tanvir sir L4 p36',
  },
  {
    id: 'c-ct-ownership',
    topic: T,
    front: 'Think-twice: why is **ownership of instruments of service** dangerous?',
    back: 'Client-owned plans and data invite **unauthorized reuse**; if treated as **products**, errors become product defects under **strict liability** rather than negligence — which can obviate PLI. Solution: indemnity against unauthorized reuse plus defence costs.',
    seen: TT_SEEN,
    src: 'Tanvir sir L4 p35',
  },
  {
    id: 'c-ct-course',
    topic: T,
    front: '**Course of performance** vs **course of conduct**?',
    back: 'Course of performance: how the parties performed **in the contract in question**. Course of conduct: how they performed **in previous contracts**. Courts look at both.',
    seen: ['2011-12'],
    src: 'Tanvir sir L4 p26',
  },
  {
    id: 'c-ct-attorney',
    topic: T,
    front: 'Should a CE leave contract wording to attorneys?',
    back: 'No — attorneys review language and conformance, but **CEs should not abdicate their responsibility**: a contract is a **communication tool**, and mutual understanding sets the tone for all the work that follows. Define words like "hazardous materials".',
    src: 'Tanvir sir L4 p12–13',
  },
]

const answers: PcAnswer[] = [
  {
    id: 'a-ct-think-twice',
    topic: T,
    q: 'What are the "Think Twice" contract clauses? (names, with one line each)',
    seen: TT_SEEN,
    a: `| # | Clause | Problem → solution (one line) |
|---|---|---|
| 1 | **Certification** | "certify" may be read as a guarantee → define "certify"; CE cannot certify what cannot be known |
| 2 | **Consequential damages** | damages out of proportion to the fee → general limit of liability |
| 3 | **Construction cost estimates** | read as "guarantee maximum" → "opinion of probable construction cost" |
| 4 | **Construction monitoring** | plans never complete → monitoring as an additional service, defined responsibility |
| 5 | **Curing a breach** | method not addressed → mutual responsibilities, what a breach implies |
| 6 | **Discovery of unanticipated hazardous materials** | injury claims → clause on changed conditions |
| 7 | **Excluded services** | "client not told" → list excluded services |
| 8 | **Freedom to report** | contractor sues over critical report → client indemnifies, or report confidentially to client |
| 9 | **Indemnification** | broad / intermediate / limited forms → eliminate, limit, legal review |
| 10 | **Jobsite safety** | stop-work responsibility, may void insurance → avoid; contractor waives claims |
| 11 | **Limitation of liability** | client sees no value → risk-allocation clause; fee reflects risk |
| 12 | **Maintenance of service** | prime contract cancelled → right to carry on work |
| 13 | **Ownership of instruments of service** | reuse; strict liability → indemnity against unauthorized reuse |
| 14 | **Record documents** | "as-built" implies no error → "record drawings / specifications" |
| 15 | **Right to reject and/or stop work** | CE should observe and monitor → waiver and indemnification |

The question bank lists other clauses (standard of care, warranties, fiduciary duty, pay-when-paid) — not in the slides.`,
    keys: [
      'Certification',
      'Consequential damages',
      'Construction cost estimates',
      'Construction monitoring',
      'Curing a breach',
      'hazardous materials',
      'Excluded services',
      'Freedom to report',
      'Indemnification',
      'Jobsite safety',
      'Limitation of liability',
      'Maintenance of service',
      'Ownership of instruments of service',
      'Record documents',
      'Right to reject',
    ],
    lists: ['l-ct-think-twice', 'l-ct-indemnity-forms'],
    src: 'Tanvir sir L4 p27–37',
  },
  {
    id: 'a-ct-triple',
    topic: T,
    q: 'Name the different types of project delivery system, procurement method and contract format.',
    seen: TRIPLE_SEEN,
    a: `Clients must choose the most appropriate **delivery system**, **procurement method** and **contract format**; these choices directly affect the civil engineer’s role, services and means of compensation (Clients’ Acquisition Strategy, DBIA).

| Project delivery system | Procurement method | Contract format |
|---|---|---|
| **Design-Bid-Build (DBB)** | **Sole source** | **Lump sum (fixed price)** |
| **Multiple Prime** | **Limited competition — negotiation** | **Cost plus a fixed fee** |
| **Construction Management at Risk** | **Qualifications-based selection** | **Guaranteed maximum price** |
| **Agency Construction Management** | **Best value selection** | **Target** |
| **Design-Build (DB)** | **Fee-based selection** | **Unit price** |
| **Design-Assist** | | |

Cost plus, GMP and target are the cost-reimbursable formats. The question bank adds Turnkey, BOT/PPP, EPC and low-bid tendering — not in the slides.`,
    keys: ['Design-Bid-Build', 'Multiple Prime', 'Construction Management at Risk', 'Agency Construction Management', 'Design-Build', 'Design-Assist', 'Sole source', 'Limited competition', 'Qualifications-based selection', 'Best value selection', 'Fee-based selection', 'Lump sum', 'Cost plus a fixed fee', 'Guaranteed maximum price', 'Unit price'],
    lists: ['l-ct-choices', 'l-ct-pds', 'l-ct-procurement', 'l-ct-pricing'],
    src: 'Tanvir sir L4 p38–39',
  },
  {
    id: 'a-ct-pds',
    topic: T,
    q: 'Show the six project delivery systems in flow charts and discuss them (advantages of DBB, DB and Multiple Prime).',
    seen: ['2017-18', '2013-14'],
    a: `### 1. Design-Bid-Build (DBB)
Owner → **prime contractor** (→ subcontractors) and **prime designer** (→ subconsultants), separately. Linear: design, bid, build; **prime designer and contractor share no direct, formal contract**; still the most common method. **Advantages:** owner works directly with the designer and **controls the entire project**; several contractors bid, so the owner can **select the lowest bid**; **allowed in public procurement**. Downside: contractor has no input in design; not collaborative.

### 2. Design-Build (DB)
Owner → **one design-build entity** → contractor/subcontractors and designer/subconsultants. **Advantages:** innovation, value engineering and constructability enhanced; **schedules shortened and cost known early**; unified recommendations; **fewer changes, fewer claims, less litigation**; risks allocated to those best able to manage them.

### 3. Design-Assist (DA)
DBB plus a **general contractor as consultant** during design (dotted link to the designer) for constructability reviews; problems if a different contractor builds; conflict-of-interest rules may bar it from bidding.

### 4. Multiple Prime (MP)
Owner → **several prime contractors** (site, steel, mechanical, electrical, or zones/phases) and the prime designer. **Advantage:** **eliminates the general contractor’s fees**. Disadvantages: client must coordinate the primes; liability for delays by one prime.

### 5. Agency Construction Management
Owner → **construction manager (consultant)** → prime contractor and prime designer; the CM manages design-bid and construction but **does not construct**; adds a layer of management and fees.

### 6. Construction Management at Risk
Owner → **CM at risk / general contractor** (→ subcontractors) and prime designer (dotted link); the CM helps manage design and **then builds**; cost known earlier, value engineering, shorter schedule, **guaranteed construction cost**.

The question bank draws Turnkey/DBO instead of Design-Assist — not in the slides.`,
    keys: ['Design-Bid-Build', 'no direct, formal contract', 'lowest bid', 'public procurement', 'Design-Build', 'cost known early', 'fewer claims', 'Design-Assist', 'Multiple Prime', 'general contractor’s fees', 'Agency Construction Management', 'does not construct', 'Construction Management at Risk', 'guaranteed construction cost'],
    lists: ['l-ct-pds', 'l-ct-dbb-pros', 'l-ct-db-benefits', 'l-ct-mp-cons'],
    src: 'Tanvir sir L4 p40–48',
    Fig: PdsAllFig,
  },
  {
    id: 'a-ct-dbb-db',
    topic: T,
    q: 'Compare DBB and DB.',
    seen: ['2022-23'],
    a: `| Point | Design-Bid-Build (DBB) | Design-Build (DB) |
|---|---|---|
| **Contracts** | client contracts the **prime designer** and, after bidding, the **winning builder** separately | client contracts **one entity for both design and construction** |
| **Designer–contractor link** | **no direct, formal contract** | **same team**, unified recommendations |
| **Process** | **linear** — separate stages for design, bid, construction | integrated; complex phasing accommodated |
| **Price** | many contractors bid — owner can **select the lowest bid** | **cost known early** |
| **Schedule** | longer (stages in sequence) | **schedules can be shortened** |
| **Owner’s role** | works directly with the designer, **controls the entire project** | gives **design requirements and performance specifications**; out of the middle → fewer changes, claims, litigation |
| **Contractor input** | **no input in design**; not collaborative | constructability and value engineering enhanced |
| **Use** | still the most common; **allowed in public procurement** | entity may be JV, partnership or integrated corporation |`,
    keys: ['prime designer', 'one entity', 'no direct, formal contract', 'linear', 'lowest bid', 'cost known early', 'schedules can be shortened', 'performance specifications', 'no input in design', 'public procurement'],
    lists: ['l-ct-dbb-pros', 'l-ct-dbb-cons', 'l-ct-db-benefits'],
    src: 'Tanvir sir L4 p41–44',
    Fig: DbbDbFig,
  },
  {
    id: 'a-ct-dbb',
    topic: T,
    q: 'Short note: Design-Bid-Build (DBB).',
    seen: ['2015-16', '2012-13'],
    a: `- **Still the most common method** used for designing and constructing projects.
- A **linear process** with separate stages for **design, bid and construction**.
- The **prime designer and client** enter into a contract for design services; when the design is complete, **contractors bid on contract documents** prepared by the designer; after an appropriate period the client contracts with the **winning builder**.
- The prime designer and contractor share **no direct, formal contract**.

**Why owners like it:** they work directly with the prime designer and **exercise control over the entire project**; several contractors give prices, so they can **select the lowest bid**; DBB is **allowed in public procurement**.

**Downside:** the **contractor has no input in design**, and the process **tends not to be collaborative**.`,
    keys: ['most common', 'linear process', 'design, bid and construction', 'contractors bid', 'winning builder', 'no direct, formal contract', 'control over the entire project', 'lowest bid', 'public procurement', 'no input in design', 'not to be collaborative'],
    lists: ['l-ct-dbb-pros', 'l-ct-dbb-cons'],
    src: 'Tanvir sir L4 p41–42',
    Fig: DbbFig,
  },
  {
    id: 'a-ct-mp',
    topic: T,
    q: 'Short note: Multiple Prime.',
    seen: ['2016-17', '2013-14'],
    a: `- A **variation of DBB** used by **sophisticated clients** or clients with **in-house construction management capability**.
- After the design is complete, the client hires **multiple contractors instead of one general contractor** — e.g. separate contracts for **site development, steel fabrication and erection, mechanical, electrical**; a large project may also be divided into **zones or phases**.
- **Advantage:** it **eliminates the general contractor’s fees**.
- **Two primary disadvantages:** the client’s **duty to coordinate** the multiple prime contractors, and the potential **liability for delays** caused by one of the prime contractors.`,
    keys: ['variation of DBB', 'sophisticated clients', 'in-house construction management', 'multiple contractors', 'general contractor', 'zones or phases', 'eliminates', 'duty to coordinate', 'liability for delays'],
    lists: ['l-ct-mp-cons'],
    src: 'Tanvir sir L4 p45',
    Fig: MpFig,
  },
  {
    id: 'a-ct-formats',
    topic: T,
    q: 'Name the most commonly used contract formats.',
    seen: FMT_SEEN,
    a: `Regardless of form, every contract for civil engineering services should include at least the **scope of services**, **general conditions**, **performance schedule** and **fee proposal**. The commonly used contract formats are:

1. **Conventional proposal** — proposal in response to an RFP/RFQ; SOW, general conditions, fee and schedule.
2. **Negotiated terms and conditions** — scope and risk negotiated; general conditions rewritten or Special Conditions added.
3. **Multiple contracts** — owner contracts separately and simultaneously with the prime and the subs.
4. **Special contracts for major projects** — custom contracts with standard clauses, attorney involvement.
5. **Client-developed contracts** — large clients shift risk to designers.
6. **Purchase orders** — public clients with a critical need; small projects.
7. **Model contracts** — standard forms by AIA, ConsensusDOCS, DBIA, FIDIC, JCT, ENAA.`,
    keys: ['scope of services', 'general conditions', 'performance schedule', 'fee proposal', 'Conventional proposal', 'Negotiated terms and conditions', 'Multiple contracts', 'Special contracts for major projects', 'Client-developed contracts', 'Purchase orders', 'Model contracts'],
    lists: ['l-ct-min-contents', 'l-ct-formats'],
    src: 'Tanvir sir L4 p14–25',
  },
  {
    id: 'a-ct-conventional',
    topic: T,
    q: 'Short note: Conventional proposal.',
    seen: ['2014-15', '2011-12'],
    a: `- Civil engineers often acquire work by preparing a **proposal in response to an RFP or RFQ**.
- In **qualifications-based selection (QBS)** the work scope in the proposal **becomes part of the contract**, and the proposal can clarify the SOW.
- With a **fee-based selection**, the client’s proposal should have (but not always does have) a well-defined SOW; the engineer’s **cover letter** can identify areas needing modification.
- Either way, the **SOW is an important component**.
- It includes **General Conditions** — nontechnical understandings: business context and mutual responsibilities, such as when payments are due and any limitations of liability.
- Whether two-envelope QBS or fee-based, it **mentions the fee**: staff rates/time, computer use, testing, a schedule of fees, costs for additional services.
- A **schedule** with milestones (completion dates, major deliverables) is incorporated.`,
    keys: ['RFP or RFQ', 'qualifications-based selection', 'becomes part of the contract', 'fee-based', 'cover letter', 'SOW', 'General Conditions', 'nontechnical', 'mentions the fee', 'schedule'],
    lists: ['l-ct-fee-items'],
    src: 'Tanvir sir L4 p15–17',
  },
  {
    id: 'a-ct-negotiated',
    topic: T,
    q: 'Short note: Negotiated terms and conditions.',
    seen: ['2014-15'],
    a: `- Negotiation of contract terms and conditions is **not strictly related to monetary issues**.
- Often the decision centres on the **scope of services** needed.
- The client may not agree to everything in the general conditions, such as the **indemnification provision**; client and civil engineer may want to **shift risk**.
- Contemplating the **assignment of risk** is best done in the **earliest stages** to minimize its effect.
- Sometimes the **general conditions are rewritten**, or an **addendum (Special Conditions)** is attached to the contract.`,
    keys: ['not strictly related to monetary', 'scope of services', 'indemnification', 'shift risk', 'earliest stages', 'general conditions are rewritten', 'Special Conditions'],
    src: 'Tanvir sir L4 p18',
  },
  {
    id: 'a-ct-multiple-contracts',
    topic: T,
    q: 'Short note: Multiple contracts.',
    seen: ['2014-15', '2011-12'],
    a: `- Owners **contract separately and simultaneously** with the **prime** (designer or contractor) and the **sub-consultants or subcontractors**.
- This gives the owner **more management responsibility and more control**.
- Sub-consultants have **greater access** and may receive **more prompt payment**.
- The prime designer may reduce **"vicarious liability"** — exposure to liability stemming from contractual relationships with other design professionals.

(Some books describe "multiple contracts" as a master agreement plus task orders — that is not the slide’s meaning.)`,
    keys: ['separately and simultaneously', 'prime', 'sub-consultants', 'more control', 'greater access', 'prompt payment', 'vicarious liability'],
    src: 'Tanvir sir L4 p19',
  },
  {
    id: 'a-ct-model',
    topic: T,
    q: 'Short note: Model (standard form) contracts.',
    seen: ['2015-16', '2014-15', '2011-12'],
    a: `- Model contracts are **developed by professional associations** — in the USA the **AIA** (American Institute of Architects), **ConsensusDOCS** (AGC and 20 other organizations) and **DBIA** (Design Build Institute of America).
- They provide a **vital function**: an **economical way** for parties to contract **without "lawyering up"**.
- Their clauses have been **tested over time**, and the documents are **revised periodically** to reflect changes in law.
- Internationally, **FIDIC** (International Federation of Consulting Engineers, Lausanne) leads; its forms are widely used in developing countries and **recognized by the World Bank**. **JCT** publishes the UK Standard Form of Building Contract; **ENAA** (Japan) publishes design-build power-plant contracts, also World Bank recognised.
- Caution: though meant to be fair and balanced, they may have **some bias in favour of their membership**.`,
    keys: ['professional associations', 'AIA', 'ConsensusDOCS', 'DBIA', 'economical', 'lawyering up', 'tested over time', 'revised periodically', 'FIDIC', 'World Bank', 'JCT', 'ENAA', 'bias'],
    lists: ['l-ct-model-bodies'],
    src: 'Tanvir sir L4 p24–25',
  },
  {
    id: 'a-ct-pricing',
    topic: T,
    q: 'Briefly discuss the different types of contract format in project delivery (lump sum, cost reimbursable, unit price).',
    seen: ['2021-22', '2016-17'],
    a: `### Lump sum (fixed price)
A **single price**; the SOW must be very clear. **Risk is borne by the engineer**, who also accrues any savings; easy to administer; price, schedule and performance known at the outset.

### Cost reimbursable
Actual cost passed through to the client — for **negotiated, technically difficult or unique** work; savings go to the client but the price is not known until completion.
- **Cost plus a fixed fee** — cost of work plus a fee, usually a fixed **percentage** negotiated before award.
- **Guaranteed maximum price (GMP)** — cost plus with the **upper limit known initially**; savings below it accrue to the client; heavy cost-reporting overhead.
- **Target** — target price and **incentive fee** on performance criteria; proposal contains **no profit**; fee earned only if targets are met; reconciliation is a burden.

### Unit price
Prices **variable quantities** (cubic yards of concrete, design hours, feet of paving); problems with **composite units**, units used as payment milestones, unmeasurable activities and changed situations — spell out the assumptions.`,
    keys: ['Lump sum', 'single price', 'Risk is borne by the engineer', 'Cost reimbursable', 'Cost plus a fixed fee', 'percentage', 'Guaranteed maximum price', 'upper limit', 'Target', 'incentive fee', 'Unit price', 'variable quantities', 'composite units'],
    lists: ['l-ct-pricing'],
    src: 'Tanvir sir L4 p55–61',
  },
  {
    id: 'a-ct-elements',
    topic: T,
    q: 'What are the six elements that must be present for a contract to be binding?',
    seen: ELEM_SEEN,
    a: `1. **Agreement** — acceptance of an offer.
2. **Consideration** — agreed upon or perceived value.
3. **Legality** — adherence to public policy (enforceability).
4. **Authentication** — signature or corporate seal (attestation).
5. **Capacity** — signatories are sane and have authority to represent the business entity.
6. **Legal purpose** — the subject of the contract must be legal.

(Some books list offer, acceptance, mutual assent, consideration, competent parties and legal purpose; the class list is the one above.)`,
    keys: ['Agreement', 'acceptance of an offer', 'Consideration', 'Legality', 'public policy', 'Authentication', 'signature or corporate seal', 'Capacity', 'Legal purpose'],
    lists: ['l-ct-elements'],
    src: 'Tanvir sir L4 p5',
  },
  {
    id: 'a-ct-categories',
    topic: T,
    q: 'What are the terms used to categorise contracts?',
    seen: ['Jan 2021'],
    a: `1. **Bilateral / unilateral** — involving two parties / involving one party.
2. **Enforceable / unenforceable** — containing all necessary elements / not containing them (e.g. the **statute of frauds** requires certain contracts to be in writing, or the **statute of limitations** has passed).
3. **Void** — missing one or more elements, perhaps due to an oversight.
4. **Voidable** — giving a party the right to call the contract void.
5. **Express / implied** — agreeing explicitly / relying on parties’ actions toward one another.
6. **Written / verbal** — text or orally based.`,
    keys: ['Bilateral', 'unilateral', 'Enforceable', 'statute of frauds', 'Void', 'Voidable', 'Express', 'implied', 'Written', 'verbal'],
    lists: ['l-ct-categories'],
    src: 'Tanvir sir L4 p4',
  },
  {
    id: 'a-ct-procurement',
    topic: T,
    q: 'What options do clients have for procuring a consultant? Describe QBS and Best Value Selection.',
    seen: ['Jan 2021', '2012-13'],
    a: `### Options
Private clients have a range of options open to them for selecting their consultants and contractors. These include:
1. **Sole source** — the client simply chooses a designer or builder and enters into a contract; common in the private sector, especially when only one firm can provide highly specialized services; generally not permitted in the public sector unless issues involving **national security** or emergencies arise.
2. **Limited competition — negotiated** — mostly the domain of private clients; the client prepares a list of potential service providers (often firms with previous positive experience); a client **selection panel** interviews each firm and enters into negotiations with the top one to three firms, then makes its selection.
3. **Best value selection** — two-phase, technical + cost (below).
4. **Fee-based selection** — the award criterion is **price alone**; the client's review is fast and uncomplicated, but there are few incentives for innovation, and it is not really appropriate for the highly judgmental and creative work of engineers.

Due to public contracting laws, public clients are more limited; the ability to use these methods varies from jurisdiction to jurisdiction. **Qualification-Based Selection (QBS)** is described on the next slides.

### Qualification-Based Selection (QBS)
1. The selection of firms is based on their **qualifications & project approach**.
2. QBS is a **two-envelope system**: the **first envelope** contains the engineer's response to the RFP; the **second envelope** contains the cost for executing the proposed work.
3. Ideally, the client issues an RFP with a clear definition of project requirements and well-defined budget and schedule constraints.
4. Proposing firms respond with the two envelopes and are **ranked** using the information contained in the first envelope.
5. Those making the **short list** are interviewed and ranked again.
6. After a firm has been selected on the merits of its proposal and interview(s), the client **opens the second envelope** to learn the price.
7. Negotiations with the **top-ranked firm** ensue.
8. Scope and/or services may be added or deleted until a **mutually acceptable price** can be reached.
9. If the client and the top-ranked firm cannot reach an agreement, the client may open negotiations with the firm **ranked second**.

### Best Value (BV) selection
1. Best Value selection is a **two-phase** process that combines **technical and cost** criteria.
2. The client issues an **RFQ**, and responding firms are ranked based on their proposals.
3. Firms making the short list are then issued an **RFP** and perhaps given a **stipend** or honorarium to cover the costs of phase-two proposal preparation.
4. Their second proposals include both their technical approach and cost, which are **scored independently**.
5. Consequently, a firm with a **higher cost** could be selected over a firm with a lower cost if its technical proposal is superior.`,
    keys: ['sole source', 'national security', 'limited competition', 'selection panel', 'best value', 'fee-based', 'price alone', 'Qualification-Based Selection', 'two-envelope', 'first envelope', 'second envelope', 'short list', 'top-ranked firm', 'mutually acceptable price', 'ranked second', 'two-phase', 'RFQ', 'stipend', 'scored independently', 'higher cost'],
    lists: ['l-ct-procurement', 'l-ct-qbs-steps', 'l-ct-bv-steps'],
    src: 'Tanvir sir L4 p49–53; 18-batch TF solve (Jan 2021 7b: 4 options, QBS 9 steps, BVS 5 steps)',
  },
  {
    id: 'a-ct-formation',
    topic: T,
    q: 'What issues need to be considered during contract formation? Briefly describe each.',
    seen: ['2011-12'],
    a: `1. **Assumption of liability** — liability in contract law centres on whether a provision has been breached. If a CE agrees to act non-negligently, a negligent act creates **both tort and contractual liability**. Avoid provisions demanding more than common law, e.g. "highest professional level"; the standard of practice requires only **"ordinary skill and acceptance"**.
2. **Professional liability insurance** — most policies **exclude liabilities assumed in the contract**; tell the client, who may drop the clause, pay for the added coverage or buy additional services (e.g. field observation).
3. **Disparate bargaining power** — one party has an unfair advantage; a **contract of adhesion** can result (e.g. the only big client in a small town). The CE can send a **letter** recording that the clause was accepted under disparate bargaining power.
4. **Indemnifications** — "**to secure against loss or damage**"; clauses can protect either party (client indemnifies the CE for certifications; contractors indemnify owners and designers against jobsite injury suits).

**Best measures:** perform professionally, create realistic expectations, make clients aware of risks, minimize own risk, obtain liability insurance, consult a knowledgeable attorney.`,
    keys: ['Assumption of liability', 'tort and contractual liability', 'ordinary skill and acceptance', 'Professional liability insurance', 'exclude liabilities assumed', 'Disparate bargaining power', 'contract of adhesion', 'Indemnifications', 'secure against loss or damage'],
    lists: ['l-ct-formation', 'l-ct-best-measures'],
    src: 'Tanvir sir L4 p6–11',
  },
  {
    id: 'a-ct-interpretation',
    topic: T,
    q: 'Short note: Contract interpretation.',
    seen: ['2011-12'],
    a: `1. Courts interpret contracts **as a whole** and attempt to give **reasonable meaning to all terms**.
2. **Specific negotiated provisions** are given **more weight than general terms**.
3. **Words and how they are used in a specific industry** are very important.
4. Courts look at the **course of performance** (how the parties performed in this contract) and the **course of conduct** (how they performed in previous contracts).
5. **Unilateral mistakes** and/or **unexpressed intentions** are **not considered part of the contract**.`,
    keys: ['as a whole', 'reasonable meaning', 'Specific negotiated provisions', 'more weight', 'specific industry', 'course of performance', 'course of conduct', 'Unilateral mistakes', 'unexpressed intentions'],
    lists: ['l-ct-interpretation'],
    src: 'Tanvir sir L4 p26',
  },
]

export default { lists, cards, answers } satisfies PcTopicContent

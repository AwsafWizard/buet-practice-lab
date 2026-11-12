// pc-methods — tendering methods for goods & works, OTM, NCT/ICT, domestic preference, e-GP (IA sir).
// Source digest: CE301/Claude digests/lec_procurement.md (pp-methods).
import type { PcAnswer, PcCard, PcList, PcTopicContent } from '../types'

const T = 'pc-methods' as const

const lists: PcList[] = [
  {
    id: 'l-tender-methods',
    topic: T,
    title: 'Tendering methods for goods and works',
    ask: 'Name the different types of tendering methods.',
    points: [
      { k: 'Open Tendering Method (OTM)', alt: ['OTM', 'open tender'], d: 'Preferred — PPA s.31, PPR r.61.' },
      { k: 'Limited Tendering Method (LTM)', alt: ['LTM', 'limited tender'], d: 's.32(1)(a), r.63–64.' },
      { k: 'Direct Procurement Method (DPM)', alt: ['DPM', 'DTM', 'direct procurement'], d: 's.32(1)(b), r.74–76.' },
      { k: 'Two-Stage Tendering Method', alt: ['TSTM', 'two stage'], d: 's.32(1)(c), r.65–68.' },
      { k: 'One-Stage Two-Envelope Method', alt: ['single stage two envelope', 'two envelope'], d: 's.32(1)(cc), r.68A–68D.' },
      { k: 'Request for Quotation (RFQ)', alt: ['RFQ', 'quotation'], d: 's.32(1)(d), r.69–73.' },
    ],
    hook: 'One Lazy Dog Takes One RFQ — OTM, LTM, DPM, Two-stage, One-stage two-envelope, RFQ (each NCT or ICT).',
    seen: ['2021-22', '2017-18', '2014-15', '2012-13', '2011-12'],
    src: 'IA sir “Steps with tentative timeline” p2 (method tree); PPA s.31–32',
  },
  {
    id: 'l-otm-conditions',
    topic: T,
    title: 'PPA s.31 conditions for using OTM',
    ask: 'What are the requirements of PPA regarding use of OTM?',
    points: [
      { k: 'Determine prequalification, if applicable', alt: ['prequalification'] },
      { k: 'Equal and non-discriminatory competition', alt: ['equal opportunity', 'non-discriminatory'] },
      { k: 'Invite tenders by advertisement (s.40)', alt: ['advertisement'] },
      { k: 'Allow prescribed minimum time', alt: ['minimum time'] },
      { k: 'Contract with lowest evaluated responsive tenderer', alt: ['lowest evaluated responsive'] },
    ],
    hook: 'P-E-A-M-L: “Please Each Advertise More Loudly”.',
    seen: ['2014-15'],
    src: 'PPA 2006 s.31(1)(a)–(e)',
  },
  {
    id: 'l-otm-why',
    topic: T,
    title: 'Why OTM is the preferred method',
    ask: 'Why is the Open Tendering Method a preferred method of procurement?',
    points: [
      { k: 'Transparency', alt: ['transparent'], d: 'Public advertisement and public opening.' },
      { k: 'Fair price (good value for money)', alt: ['fair price', 'value for money', 'best price'], d: 'Lowest evaluated responsive price wins.' },
      { k: 'Maximum competition', alt: ['competitive', 'competition'], d: 'All eligible tenderers may take part.' },
      { k: 'Equal opportunity, non-discrimination', alt: ['equal treatment', 'equal opportunity'], d: 'Same information and terms to all.' },
      { k: 'Accountability', alt: ['accountable'], d: 'Pre-disclosed criteria, records, complaints.' },
      { k: 'Less favouritism and collusion', alt: ['no favouritism', 'less collusion', 'less corruption'], d: 'Other methods need HOPE approval and recorded reasons.' },
    ],
    seen: ['2023-24', '2014-15'],
    src: 'Senior note Q7 (transparency, fair price, competitive); PPA preamble, s.31–32; PPR r.61',
  },
  {
    id: 'l-ltm-cases',
    topic: T,
    title: 'When the Limited Tendering Method may be used',
    points: [
      { k: 'Specialised nature, limited suppliers', alt: ['specialised', 'limited number of suppliers'], d: 'Aircraft, locomotives, specialised medical equipment, telecom, silos, ports.' },
      { k: 'Brand standardisation policy', alt: ['standardisation', 'spare parts'], d: 'To reduce spare-parts stock and maintenance costs.' },
      { k: 'Cost of many tenders disproportionate', alt: ['low value', 'enlisted contractors'], d: 'Enlisted suppliers/contractors within threshold (Tk 1.5 M goods, Tk 3 M works).' },
      { k: 'Urgent, unforeseen need', alt: ['urgency', 'urgent'], d: 'Open tendering impractical; not caused by PE delay (PPR r.63(1)(b),(c)).' },
    ],
    seen: ['2021-22', '2017-18', '2014-15', '2012-13'],
    src: 'PPA s.32(1)(a); PPR r.63',
  },
  {
    id: 'l-dpm-cases',
    topic: T,
    title: 'When the Direct Procurement Method may be used',
    points: [
      { k: 'Sole tenderer for technical reasons', alt: ['sole source', 'only one producer'] },
      { k: 'Local community, poverty alleviation', alt: ['community contract'] },
      { k: 'Additional procurement from original supplier', alt: ['additional', 'repeat order'] },
      { k: 'Exceptionally advantageous conditions; perishables', alt: ['advantageous', 'perishable', 'government price'] },
      { k: 'Government-owned factory', alt: ['govt factory', 'government owned industry'] },
      { k: 'Very urgent or essential, within limit', alt: ['emergency', 'urgent'] },
    ],
    seen: ['2021-22', '2017-18', '2014-15', '2012-13'],
    src: 'PPA s.32(1)(b)(i)–(vi); PPR r.76',
  },
  {
    id: 'l-dpm-weakness',
    topic: T,
    title: 'Why DPM is the least transparent (“worst”) method',
    points: [
      { k: 'No benefits of competition', alt: ['no competition'] },
      { k: 'Lacks transparency', alt: ['not transparent', 'no advertisement'] },
      { k: 'Encourages unacceptable, fraudulent practices', alt: ['fraud', 'fraudulent'] },
    ],
    seen: ['2021-22'],
    src: 'PPR r.74(2); senior note Q9',
  },
  {
    id: 'l-tstm-cases',
    topic: T,
    title: 'When Two-Stage Tendering may be used',
    points: [
      { k: 'Large, complex projects; specs not possible', alt: ['large and complex', 'turnkey'], d: 'Complete technical specifications cannot be prepared at the outset.' },
      { k: 'Alternative solutions, rapidly evolving technology', alt: ['rapidly evolving', 'alternative technical solutions'], d: 'e.g. communication technology, processing plants.' },
    ],
    seen: ['2021-22', '2017-18', '2014-15'],
    src: 'PPA s.32(1)(c); PPR r.65',
  },
  {
    id: 'l-rfq-cases',
    topic: T,
    title: 'When Request for Quotation may be used',
    points: [
      { k: 'Off-the-shelf low-value goods', alt: ['off the shelf', 'readily available'] },
      { k: 'Urgent spares for utility workshop', alt: ['emergency repairs', 'maintenance'] },
      { k: 'State-owned processing plants', alt: ['state owned industries', 'production plants'] },
      { k: 'Low value simple works', alt: ['simple works'] },
    ],
    seen: ['2021-22', '2017-18', '2014-15'],
    src: 'PPA s.32(1)(d); PPR r.69',
  },
  {
    id: 'l-ict-provisions',
    topic: T,
    title: 'Special provisions for international competitive tendering (PPA s.33)',
    ask: 'Describe special provisions to be made for international competitive bidding.',
    points: [
      { k: 'Advertisement in English, international media', alt: ['english advertisement'], d: 's.33(a), s.40(5).' },
      { k: 'Tender documents in English', alt: ['english documents'] },
      { k: 'Longer minimum time (42 days)', alt: ['42 days', 'time limit'] },
      { k: 'International standards in specifications', alt: ['international standards'] },
      { k: 'Securities in international currency', alt: ['currency', 'tender security currency'] },
      { k: 'Taka for local inputs', alt: ['local inputs in taka'] },
      { k: 'Payment in contract currencies', alt: ['payment currency'] },
      { k: 'International conditions of contract', alt: ['FIDIC', 'international trade conditions'] },
      { k: 'Domestic preference', alt: ['margin of preference'] },
      { k: 'JV with local partners encouraged, not mandatory', alt: ['joint venture'] },
      { k: 'ADR and international arbitration', alt: ['international arbitration', 'alternative dispute resolution'] },
    ],
    hook: 'Three E’s then three currencies: English ad, English docs, Extra time (42 d), intErnational standards; security currency, Taka local, contract-currency payment; then Conditions, Domestic preference, JV, Arbitration.',
    seen: ['2012-13'],
    src: 'PPA s.33(a)–(c)(ix); PPR r.83; IA sir steps slide (42 days)',
  },
  {
    id: 'l-malpractice',
    topic: T,
    title: 'Tendering malpractices defined in PPR',
    points: [
      { k: 'Corrupt practice', alt: ['bribery', 'corruption'], d: 'Offering, giving, receiving or soliciting a gratuity as inducement.' },
      { k: 'Fraudulent practice', alt: ['fraud'], d: 'Misrepresentation or omission of facts to influence a decision.' },
      { k: 'Collusive practice', alt: ['collusion', 'syndicate'], d: 'Two or more persons fix prices or reduce the number of tenders.' },
      { k: 'Coercive practice', alt: ['coercion', 'threat', 'obstruction'], d: 'Harming or threatening; obstructing tender submission.' },
    ],
    hook: 'C-F-C-C: “Cash, Fake, Club, Club-wielding”.',
    seen: ['2015-16'],
    src: 'PPR r.127(2); PPA s.64',
  },
  {
    id: 'l-egp-benefits',
    topic: T,
    title: 'How e-GP removes tendering malpractices',
    points: [
      { k: 'Online notices and documents for all', alt: ['online publication', 'anonymous download'] },
      { k: 'No physical tender dropping', alt: ['no tender box', 'online submission'] },
      { k: 'Encrypted bids, automatic opening', alt: ['encrypted', 'automatic opening'] },
      { k: 'Online payment of fees and security', alt: ['online payment'] },
      { k: 'Standard, system-driven evaluation', alt: ['less discretion'] },
      { k: 'Audit trail, time-stamped', alt: ['audit trail', 'log'] },
      { k: 'Automatic publication of results and NOA', alt: ['publication', 'public scrutiny'] },
      { k: 'Less face-to-face contact', alt: ['less contact', 'less bribery'] },
      { k: 'Wider competition, lower prices', alt: ['wider competition'] },
    ],
    seen: ['2015-16'],
    src: 'PPA s.65; PPR r.128 (list is the question bank’s; teacher’s e-GP slide not in our files)',
  },
]

const cards: PcCard[] = [
  { id: 'c-meth-other-approval', topic: T, front: 'What is needed to use any method other than OTM?', back: 'Approval of the **HOPE** (or an officer he authorises) on technical or economic grounds, and the **reasons recorded in a file** (PPA s.32(1)–(2); PPR r.62).', src: 'PPA s.32', seen: ['2014-15'] },
  { id: 'c-meth-ltm-security', topic: T, front: 'Tender security and performance security under LTM?', back: 'Tender security **not mandatory**; performance security **required** (PPR r.63(5); PPA s.14(b)). LTM needs prior HOPE approval; enlistment limits Tk 1.5 M goods, Tk 3 M works.', src: 'PPR r.63' },
  { id: 'c-meth-ltm-2crore', topic: T, front: 'Special LTM rule for domestic works ≤ Tk 2 crore?', back: 'Official estimate is **disclosed**; a tender more than **5% above or below** it is rejected; a tie in lowest rates may be broken by **lottery** (only here).', src: 'PPA s.19(1)(a), 49(1)(a)' },
  { id: 'c-meth-rfq', topic: T, front: 'RFQ — how many quotations, securities, advertisement?', back: 'At least **three responsive quotations**; **no tender or performance security**; no newspaper advertisement, no document fee; invitations by letter/fax/e-mail; TEC evaluates on the submission date.', src: 'PPR r.70–73' },
  { id: 'c-meth-rfq-limit', topic: T, front: 'RFQ value limits (development budget)?', back: 'Goods: ≤ Tk 200,000 each, Tk 500,000 a year. Works: ≤ Tk 300,000 each, Tk 1,000,000 a year. (Revenue budget: Tk 100,000 / 300,000 goods; Tk 200,000 / 500,000 works.)', src: 'PPR Sch II r.69' },
  { id: 'c-meth-tstm', topic: T, front: 'Two-stage tendering — what happens in each stage?', back: 'Stage 1: **unpriced technical proposals** on a conceptual design, no tender security, 42 days; confidential discussions → “Minutes of Tender Adjustments”. Stage 2: revised documents, **priced “best and final” tenders** (≥ 21 days), then as OTM.', src: 'PPR r.66–68, Sch II' },
  { id: 'c-meth-one-stage', topic: T, front: 'One-stage two-envelope method?', back: 'Used when two-stage is not applicable (PPA s.32(1)(cc)). Technical and financial envelopes submitted together; technical opened first, **financial kept secure** until the technical report is approved by HOPE (s.47(1)).', src: 'PPA s.32(1)(cc), 47(1)' },
  { id: 'c-meth-dpm-negotiate', topic: T, front: 'In which method may the PE negotiate with the tenderer?', back: '**Direct Procurement** — PE asks for a priced offer and is then free to negotiate (PPR r.75(3), 99(1)(a)). No advertisement, no tender security, performance security required.', src: 'PPR r.75, 99' },
  { id: 'c-meth-dpm-forms', topic: T, front: 'Forms of direct procurement (PPR r.75)?', back: 'Direct contracting; additional deliveries and repeat orders; variation orders; extra work orders; direct cash purchase; force account.', src: 'PPR r.75' },
  { id: 'c-meth-ict-when', topic: T, front: 'When is international competitive tendering used?', back: 'When the goods/works cannot be procured competitively within the country and effective international competition cannot be ensured without special efforts (PPA s.33). Min. **42 days** for tenders (28 for re-tender).', src: 'PPA s.33; PPR Sch II 83(1)' },
  { id: 'c-meth-dom-pref', topic: T, front: 'What is domestic preference and how much?', back: 'A margin of preference for local firms and locally made products in **international open tenders**: max **15%** of delivered price (goods), **7.5%** of contract price (works). Group B (foreign) prices are raised by it before comparison. Not compulsory.', src: 'PPR r.83, Sch II; senior note Q12' },
  { id: 'c-meth-group-a', topic: T, front: 'Which goods qualify as Group A for domestic preference?', back: 'Goods made in Bangladesh whose local labour, raw material and components exceed **30% of the ex-works price**. Works: firm registered in BD, majority BD ownership, ≤ 20% subcontracted to foreigners.', src: 'PPR r.83(2)–(3)' },
  { id: 'c-meth-pq', topic: T, front: 'What is prequalification?', back: '“A procedure for demonstrating qualifications as a pre-condition for being invited to tender” — capability assessment of firms before tendering. Optional; for large works (> Tk 350 M), pass/fail, min 21 days, ≥ 3 prequalified.', src: 'PPA s.2(19); PPR r.91–93, Sch II; senior note Q7' },
  { id: 'c-meth-egp-def', topic: T, front: 'What is e-GP?', back: 'Electronic Government Procurement: procurement by a PE using an **electronic processing system** — “the online processing of data through a website” (PPA s.65; PPR r.2(21)).', src: 'PPA s.65', seen: ['2015-16'] },
  { id: 'c-meth-sanctions', topic: T, front: 'What happens to a firm found in corrupt/collusive practice?', back: 'Excluded from the proceeding, its award recommendation rejected, and/or declared **ineligible (debarred)** indefinitely or for a period; staff face departmental and criminal action (PPA s.64; PPR r.127(4)).', src: 'PPA s.64; PPR r.127' },
]

const answers: PcAnswer[] = [
  {
    id: 'a-tender-methods-list',
    topic: T,
    q: 'Name the different types of tendering methods (for goods and works).',
    seen: ['2017-18', '2011-12'],
    a: `### National Competitive Tender (NCT)
1. **Open Tendering Method (OTM)** — preferred (PPA s.31, PPR r.61).
2. **Limited Tendering Method (LTM)** — s.32(1)(a), r.63–64.
3. **Direct Procurement Method (DPM)** — s.32(1)(b), r.74–76.
4. **Two-Stage Tendering Method** — s.32(1)(c), r.65–68.
5. **One-Stage Two-Envelope Method** — s.32(1)(cc), r.68A–68D.
6. **Request for Quotation (RFQ)** — s.32(1)(d), r.69–73.

### International Competitive Tender (ICT)
Open tender; other methods — limited tender, direct procurement, RFQ, two-stage (PPA s.33–34).

Methods 2–6 are “other methods”: used only with **HOPE approval** and reasons recorded (s.32).`,
    keys: ['Open Tendering Method', 'Limited Tendering Method', 'Direct Procurement Method', 'Two-Stage', 'One-Stage Two-Envelope', 'Request for Quotation', 'International Competitive Tender', 'HOPE approval'],
    lists: ['l-tender-methods'],
    src: 'IA sir “Steps” slides p2–3; PPA s.31–34',
  },
  {
    id: 'a-methods-applicability',
    topic: T,
    q: 'Name the tendering methods for works and goods (PPA s.31–32) with their applicability, advantages and disadvantages.',
    seen: ['2021-22', '2017-18', '2014-15', '2012-13'],
    a: `### OTM — PPA s.31 (preferred)
- **Applicability**: all goods, related services, works and physical services by default; advertised publicly, open to all eligible tenderers.
- Advantages: transparency, maximum competition, fair price. Disadvantages: takes longer; many tenders to evaluate.

### LTM — s.32(1)(a)
- **Specialised nature** available from a **limited number of suppliers** (aircraft, locomotives, medical equipment); **brand standardisation** policy to cut spare-parts stock and maintenance; cost of many tenders disproportionate to value (enlisted firms, Tk 1.5 M goods / Tk 3 M works); urgency.
- Advantages: quick, cheap. Disadvantages: less competition; tender security not mandatory.

### DPM — s.32(1)(b)
- **Sole tenderer** for technical reasons; local community (poverty alleviation); **additional procurement** from the original supplier; exceptionally advantageous conditions / perishables; Government-owned factory; very urgent needs within limit.
- Disadvantages (PPR r.74(2)): no benefits of competition, **lacks transparency**, could encourage fraudulent practices.

### Two-Stage — s.32(1)(c)
- **Large and complex** projects where complete specifications cannot be prepared; alternative solutions in a **rapidly evolving** industry. Stage 1 unpriced technical proposals; stage 2 priced tenders.
- Advantage: best technical solution. Disadvantage: long and costly.

### One-Stage Two-Envelope — s.32(1)(cc)
- When two-stage is not applicable but technical must be judged before price; financial envelope opened after technical approval.

### RFQ — s.32(1)(d)
- **Off-the-shelf** low-value goods, urgent spares for utility workshops, state-owned plants; low value simple works; at least **three quotations**; no securities.
- Advantage: quick, simple. Disadvantage: limited competition; risk of splitting packages.

All methods except OTM need **HOPE approval** and the **reasons recorded** in a file (s.32(2)).`,
    keys: ['OTM', 'Specialised nature', 'limited number of suppliers', 'brand standardisation', 'Sole tenderer', 'additional procurement', 'lacks transparency', 'Large and complex', 'rapidly evolving', 'Off-the-shelf', 'three quotations', 'HOPE approval', 'reasons recorded'],
    lists: ['l-tender-methods', 'l-ltm-cases', 'l-dpm-cases', 'l-dpm-weakness', 'l-tstm-cases', 'l-rfq-cases'],
    src: 'PPA s.31–32; PPR r.61–76; senior note Q9–10 (advantages/disadvantages partly question bank)',
  },
  {
    id: 'a-otm-preferred',
    topic: T,
    q: 'Why is the Open Tendering Method (OTM) a preferred method? What are the PPA requirements for its use?',
    seen: ['2023-24', '2014-15'],
    a: `OTM is the **preferred method** for goods, works and physical services (PPA s.31; PPR r.61), because:
1. **Transparency** — publicly advertised, publicly opened, pre-disclosed criteria.
2. **Fair price / value for money** — the lowest evaluated responsive tender wins.
3. **Maximum competition** — every eligible tenderer may take part.
4. **Equal opportunity** — same information and terms to all; non-discriminatory.
5. **Accountability** — records, complaints, published award.
6. **Less favouritism and collusion** — other methods need HOPE approval and recorded reasons.

### PPA s.31 requirements
1. **Determining prequalification**, if applicable.
2. Opportunity to compete on **equal and non-discriminatory** terms.
3. Inviting tenders through **advertisement** under s.40 (one Bangla and one English daily, websites).
4. Allowing the prescribed **minimum time** for submission (21 days NCT, 42 days ICT).
5. Signing the contract with the **lowest evaluated responsive tenderer**.`,
    keys: ['preferred method', 'Transparency', 'value for money', 'Maximum competition', 'Equal opportunity', 'Accountability', 'Determining prequalification', 'non-discriminatory', 'advertisement', 'minimum time', 'lowest evaluated responsive tenderer'],
    lists: ['l-otm-why', 'l-otm-conditions'],
    src: 'PPA s.31; PPR r.61; senior note Q7',
  },
  {
    id: 'a-ict-provisions',
    topic: T,
    q: 'Describe the special provisions to be made for international competitive bidding.',
    seen: ['2012-13'],
    a: `ICT is used when goods/works cannot be procured competitively within the country and effective international competition needs special efforts (PPA s.33). Provisions:
1. **Invitation in English**, advertised in international newspapers, UN Development Business, trade missions (s.33(a), s.40(5)).
2. **Tender documents in English**.
3. **Minimum time** for submission — **42 days** (28 for re-tender).
4. **International standards** for technical specifications ("or equivalent" if a BD standard is unique).
5. Tender and performance **security in an international currency**; bank guarantee of an international bank endorsed by a correspondent bank in Bangladesh.
6. **Taka for local inputs**.
7. **Payment in the contract currencies**.
8. **General and particular conditions** similar to those used in international trade.
9. **Domestic preference** — max 15% (goods) / 7.5% (works); goods exclusive, works inclusive of duties; not compulsory.
10. **Joint ventures** with local partners **encouraged, not mandatory**.
11. **Alternative dispute resolution**, with **international arbitration** for final settlement.

Other ICT methods (s.34): international two-stage, quotation for bulk commodities, international limited tendering, international direct procurement.`,
    keys: ['Invitation in English', 'Tender documents in English', '42 days', 'International standards', 'international currency', 'Taka for local inputs', 'contract currencies', 'Domestic preference', 'encouraged, not mandatory', 'international arbitration'],
    lists: ['l-ict-provisions'],
    src: 'PPA s.33–34, 40(5); PPR r.22, 27, 83–87, Sch II',
  },
  {
    id: 'a-egp',
    topic: T,
    q: 'Describe e-GP as a means of eliminating tendering malpractices.',
    seen: ['2015-16'],
    a: `**e-GP** (Electronic Government Procurement) = procurement through an **electronic processing system** — “the online processing of data through a website” (PPA s.65; PPR r.128; e-GP rules prevail on conflict).

### Malpractices it targets (PPR r.127)
**Corrupt** (gratuity as inducement), **fraudulent** (misrepresentation), **collusive** (price fixing, fewer tenders), **coercive** (threats, obstructing submission).

### How e-GP removes them
1. **Online notices and documents** — anyone can download anonymously; sale of documents cannot be blocked.
2. **No physical tender dropping** — ends tender-box snatching and intimidation (coercion).
3. **Encrypted bids**, opened automatically at the deadline — no late insertion or price leakage.
4. **Online payment** of fees and tender security.
5. **System-driven evaluation** on standard documents — less discretion.
6. **Audit trail** — every action time-stamped.
7. **Automatic publication** of opening reports, NOA and awards — public scrutiny.
8. **Less face-to-face contact** — less bribery and collusion.
9. **Wider competition** — tenderers from anywhere, lower prices.`,
    keys: ['e-GP', 'electronic processing system', 'Corrupt', 'fraudulent', 'collusive', 'coercive', 'No physical tender dropping', 'Encrypted bids', 'Audit trail', 'Automatic publication', 'Less face-to-face contact', 'Wider competition'],
    lists: ['l-malpractice', 'l-egp-benefits'],
    src: 'PPA s.64–65; PPR r.127–128 (benefit list: question bank; teacher’s e-GP slide not in our files)',
  },
]

export default { lists, cards, answers } satisfies PcTopicContent

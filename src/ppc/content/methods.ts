// pc-methods — tendering methods for goods & works, OTM, NCT/ICT, domestic preference, prequalification, e-GP (IA sir).
// Revised 13 Nov 2026 from CE301/Claude digests/v2_ia_solves.md and v2_ia_notes.md.
// The 18-batch solve: "MEMORIZE SECTION-31 & 32 COMPLETELY, WORD BY WORD" — so the sections below are the
// English PPA text (CE301/Claude digests/src/ia_Public-Procurement-Act-2006-English.txt), keywords in bold.
import type { PcAnswer, PcCard, PcList, PcTopicContent } from '../types'

const T = 'pc-methods' as const

// ---------- statute text, verbatim (shared by several answers) ----------
const S31 = `(1) The procuring entity shall, for procurement of goods, related services, works or physical services, use the **Open Tendering Method as the preferred method**, subject to fulfilment of the following conditions, namely:

- (a) **determining prequalification**, if applicable;
- (b) providing opportunity to tenderers for competition under **equal and non-discriminatory terms**;
- (c) inviting tenders through **advertisement** following the provisions of section 40;
- (d) allowing the **prescribed minimum time** for submission of tenders and supply of goods or of works;
- (e) signing a contract with the **lowest evaluated responsive tenderer**.

(2) The implementation procedures of the method mentioned in sub-section (1) may be prescribed by rules.`

const S31_PROVISO = `**Proviso — PPA s.31 as amended in 2025 (Ordinance No. 16 of 2025, re-enacted as Act No. 41 of 2026):** "Provided that, in case of any procurement, if an **unusually low price (significantly low price)** is quoted by a tenderer from the official estimated cost, such lower price shall be evaluated in accordance with the procedure prescribed by rules."`

const S32_HEAD = `(1) The procuring entity may, for procurement of goods, related services, works or physical services, use any one of the following methods, other than the one mentioned in section 31, **with the approval of the head of the procuring entity**, or an officer authorised by him, when considered justified on **technical or economic grounds**, namely:`

const S32_LTM = `**(a) Limited Tendering Method** may be used in the following cases, namely:

- (i) goods, related services, works or physical services by reason of their **specialised nature** are available only from a **limited number of suppliers or contractors**;
- (ii) in order to reduce stock requirements of spare parts and maintenance costs, if there is an established government policy regarding **standardisation of a brand**;
- (iii) the time and cost required to receive and evaluate a large number of tenders would be **disproportionate** when compared to the value of the contract:

Provided that for clauses (i) and (ii), no price limit shall apply and all suppliers or contractors shall be invited to tender, and that clause (iii) shall apply subject to use of **enlisted suppliers or contractors** and a threshold value as prescribed.`

const S32_DPM = `**(b) Direct Procurement Method** may be used in the following cases, when this method is not resorted to for **avoiding possible competition** or in a manner which would constitute a means of **discrimination among tenderers**, namely:

- (i) when for technical reasons, a **sole tenderer** is available for the supply or provision of the goods, related services, works and physical services;
- (ii) direct contract with the **local community** with related in projects poverty alleviation objectives if provided for in the project document;
- (iii) for **additional procurement** of goods, works or services by the original supplier, or contractor under conditions as prescribed;
- (iv) for procurement of goods under **exceptionally advantageous conditions**, provided that those are of the latest production, unused and are covered by manufacturer's warranty, or procurement of perishable commodities on market terms; or purchase of essential goods in which the government determines the purchase price rate;
- (v) unless the government otherwise decides, purchase of goods in special cases from a **government-owned industry or factory** using the government's own funds;
- (vi) procurement of goods, works, services of **very urgent or essential nature** within the amount as prescribed.`

const S32_TSTM = `**(c) Two-Stage Tendering Method** may be used in the following cases:

- (i) for **large and complex projects**, if at the outset of the procurement process it is not feasible on the part of the procuring entity to prepare **complete technical specifications** of the object to be procured; or
- (ii) when **alternative technical solutions** are available in a **rapidly evolving industry**.`

const S32_RFQ = `**(d) Request for Quotation Method** may be used, subject to the **prescribed price limit**, in the following cases, namely:

- (i) procurement of standard **off-the-shelf low value goods** or physical services readily available in the market;
- (ii) procurement of goods urgently required for **maintenance or emergency repairs** in a public sector utility's own operations and maintenance workshop;
- (iii) procurement of goods required for processing and production plants in **state-owned industries**.`

const S32_TAIL = `(2) In the case of procurement using any method under sub-section (1), a procuring entity shall properly **record in a file the reasons** for use of that method and preserve such records.

(3) The outline and implementation procedures of the methods mentioned in sub-section (1), shall be prescribed by rules.`

const lists: PcList[] = [
  {
    id: 'l-tender-methods',
    topic: T,
    title: 'Tendering methods for goods and works',
    ask: 'Name the different types of tendering methods.',
    points: [
      { k: 'Open Tendering Method (OTM)', alt: ['OTM', 'open tender'], d: 'The preferred method — PPA s.31. Usable in all cases.' },
      { k: 'Limited Tendering Method (LTM)', alt: ['LTM', 'limited tender'], d: 's.32(1)(a) — three cases.' },
      { k: 'Direct Procurement Method (DPM)', alt: ['DPM', 'DTM', 'direct procurement', 'direct tendering'], d: 's.32(1)(b) — six cases; the “worst method”.' },
      { k: 'Two-Stage Tendering Method', alt: ['TSTM', 'two stage'], d: 's.32(1)(c) — two cases; unknown solutions.' },
      { k: 'Request for Quotation (RFQ)', alt: ['RFQ', 'quotation'], d: 's.32(1)(d) — three cases; low value, within the price limit.' },
    ],
    hook: 'O-L-D-T-R: “Old Lions Don’t Take Requests” — the case counts after OTM are 3, 6, 2, 3.',
    seen: ['2021-22', '2017-18', '2014-15', '2012-13', '2011-12'],
    src: 'Nafee bhai note Ques-6 (“5 types of tender methods”); PPA s.31–32; IA sir “Steps with tentative timeline” p2 (method tree)',
    note: 'The Act also has s.32(1)(cc): if two-stage is not applicable, the Single Stage Two Envelope method may be applied; the 2025/2026 amendment adds (e) reverse auction. The class counts five.',
  },
  {
    id: 'l-otm-conditions',
    topic: T,
    title: 'PPA s.31 conditions for using OTM',
    ask: 'What are the requirements of PPA (section 31) regarding the use of OTM?',
    points: [
      { k: 'Determining prequalification, if applicable', alt: ['prequalification'], d: 's.31(1)(a).' },
      { k: 'Competition under equal and non-discriminatory terms', alt: ['equal opportunity', 'non-discriminatory', 'equal terms'], d: '(b) providing opportunity to tenderers for competition under equal and non-discriminatory terms.' },
      { k: 'Inviting tenders through advertisement (section 40)', alt: ['advertisement', 'section 40'], d: '(c) inviting tenders through advertisement following the provisions of section 40.' },
      { k: 'Allowing the prescribed minimum time', alt: ['minimum time', '21 days'], d: '(d) for submission of tenders and supply of goods or of works. Class label: 21 days (national), 42 days (international).' },
      { k: 'Contract with lowest evaluated responsive tenderer', alt: ['lowest evaluated responsive'], d: '(e) signing a contract with the lowest evaluated responsive tenderer.' },
    ],
    hook: 'P-E-A-M-L: “Please Each Advertise More Loudly” — Prequalification, Equal terms, Advertisement, Minimum time, Lowest evaluated responsive.',
    seen: ['2023-24', '2014-15'],
    src: 'PPA 2006 s.31(1)(a)–(e), verbatim; 18-batch TF solve p.14–16 (“memorize word by word”)',
    note: 'PPA s.31 as amended in 2025 (Ordinance No. 16 of 2025, re-enacted as Act No. 41 of 2026) adds a proviso after (e): an unusually low (significantly low) price compared with the official estimated cost is evaluated by the procedure prescribed by rules.',
  },
  {
    id: 'l-otm-why',
    topic: T,
    title: 'Why OTM is the preferred method',
    ask: 'Why is the Open Tendering Method a preferred method of procurement?',
    points: [
      { k: 'Participation for all', alt: ['open to all', 'equal opportunity'], d: 'Every eligible tenderer may take part.' },
      { k: 'Best to ensure transparency', alt: ['transparency', 'transparent'], d: 'Public advertisement, public opening, pre-disclosed criteria.' },
      { k: 'Good value of money', alt: ['good value for price', 'value for money', 'fair price'], d: 'Nafee’s note: fair price, good value for price.' },
      { k: 'Fair competition among contractors', alt: ['fair competition', 'competitive', 'equal competition'], d: 'Equal and non-discriminatory terms.' },
      { k: 'Quality product and contractor', alt: ['quality product', 'quality contractor'], d: 'The lowest evaluated responsive tenderer, not just the cheapest.' },
      { k: 'Wide competition', alt: ['maximum competition', 'wider competition'], d: 'Added by hand in the 18-batch solve.' },
    ],
    hook: 'P-T-V-F-Q-W: Participation, Transparency, Value, Fair competition, Quality, Wide competition — “People Trust Value From Quality Work”.',
    seen: ['2023-24', '2014-15'],
    src: '18-batch TF solve p.14 (marked VVI); Nafee bhai note Ques-7 (transparency, fair price, good value for price, competitive)',
  },
  {
    id: 'l-ltm-cases',
    topic: T,
    title: 'When the Limited Tendering Method may be used (s.32(1)(a))',
    points: [
      { k: 'Specialised nature, limited number of suppliers', alt: ['specialised', 'limited number of suppliers or contractors'], d: '(i) available only from a limited number of suppliers or contractors.' },
      { k: 'Government policy of brand standardisation', alt: ['standardisation of a brand', 'spare parts', 'maintenance costs'], d: '(ii) to reduce stock requirements of spare parts and maintenance costs.' },
      { k: 'Time and cost of many tenders disproportionate', alt: ['disproportionate', 'enlisted suppliers', 'low value'], d: '(iii) compared with the value of the contract; enlisted suppliers or contractors, within the threshold.' },
    ],
    seen: ['2021-22', '2017-18', '2014-15', '2012-13'],
    src: 'PPA s.32(1)(a)(i)–(iii), verbatim',
    note: 'For (i) and (ii) no price limit applies and all suppliers or contractors are invited; (iii) needs enlisted firms and a threshold. PPR r.63 adds urgent, unforeseen need — that is the Rules, not s.32.',
  },
  {
    id: 'l-dpm-cases',
    topic: T,
    title: 'When the Direct Procurement Method may be used (s.32(1)(b))',
    ask: 'Under which conditions can the Direct Procurement (Tendering) Method be allowed?',
    points: [
      { k: 'Sole tenderer, for technical reasons', alt: ['sole source', 'only one producer', 'sole tenderer'], d: '(i) only one can supply.' },
      { k: 'Direct contract with the local community', alt: ['community contract', 'poverty alleviation', 'local population'], d: '(ii) poverty-alleviation projects, if provided for in the project document.' },
      { k: 'Additional procurement by the original supplier', alt: ['additional', 'repeat order', 'original contractor'], d: '(iii) under conditions as prescribed (the 18-batch solve notes “up to 15%”).' },
      { k: 'Exceptionally advantageous conditions; perishables', alt: ['advantageous', 'perishable', 'government price'], d: '(iv) latest production, unused, under warranty; perishable commodities; essential goods at a government-fixed price.' },
      { k: 'Government-owned industry or factory', alt: ['govt factory', 'government owned industry'], d: '(v) using the government’s own funds.' },
      { k: 'Very urgent or essential nature', alt: ['emergency', 'urgent'], d: '(vi) within the amount as prescribed.' },
    ],
    hook: 'S-L-A-E-G-U: Sole, Local community, Additional, Exceptionally advantageous, Government factory, Urgent — “Some Lazy Ants Eat Grapes Urgently”.',
    seen: ['2021-22', '2017-18', '2014-15', '2012-13'],
    src: 'PPA s.32(1)(b)(i)–(vi), verbatim; Nafee bhai note Ques-8',
  },
  {
    id: 'l-dpm-weakness',
    topic: T,
    title: 'Why DPM is the least transparent (“worst”) method',
    ask: 'Why is the Direct Procurement (Tendering) Method less transparent and the worst method?',
    points: [
      { k: 'Purchased directly, no written agreement', alt: ['no written agreement', 'direct purchase'], d: 'Nafee’s note: bought directly without any written agreement.' },
      { k: 'No advertisement in newspaper or media', alt: ['no advertisement', 'lacks transparency', 'not transparent'] },
      { k: 'Other firms cannot take part', alt: ['no competition', 'no benefits of competition'], d: 'So there is no competition.' },
      { k: 'Entity’s internal methodology stays hidden', alt: ['internal methodology', 'intra methodology'], d: 'Nobody outside sees how the supplier was chosen.' },
      { k: 'Could encourage fraudulent practices', alt: ['fraud', 'fraudulent', 'favouritism'], d: 'PPR r.74(2).' },
    ],
    seen: ['2021-22'],
    src: 'Nafee bhai note Ques-8; 18-batch TF solve (“Worst Method” written beside DPM); PPR r.74(2)',
  },
  {
    id: 'l-tstm-cases',
    topic: T,
    title: 'When Two-Stage Tendering may be used (s.32(1)(c))',
    points: [
      { k: 'Large, complex projects; complete specifications not feasible', alt: ['large and complex', 'unknown solution', 'satellite launch', 'turnkey'], d: '(i) at the outset the PE cannot prepare complete technical specifications. Class: unknown solutions, e.g. a satellite launch.' },
      { k: 'Alternative technical solutions, rapidly evolving industry', alt: ['rapidly evolving', 'alternative technical solutions', 'fast technology'], d: '(ii).' },
    ],
    seen: ['2021-22', '2017-18', '2014-15'],
    src: 'PPA s.32(1)(c)(i)–(ii), verbatim; Nafee bhai note Ques-6',
  },
  {
    id: 'l-rfq-cases',
    topic: T,
    title: 'When Request for Quotation may be used (s.32(1)(d))',
    points: [
      { k: 'Standard off-the-shelf low value goods', alt: ['off the shelf', 'readily available', 'physical services'], d: '(i) or physical services readily available in the market.' },
      { k: 'Goods for maintenance or emergency repairs', alt: ['emergency repairs', 'maintenance', 'utility workshop'], d: '(ii) in a public sector utility’s own operations and maintenance workshop.' },
      { k: 'Goods for state-owned processing plants', alt: ['state owned industries', 'production plants'], d: '(iii) processing and production plants in state-owned industries.' },
    ],
    seen: ['2021-22', '2017-18', '2014-15'],
    src: 'PPA s.32(1)(d)(i)–(iii), verbatim',
    note: 'Always “subject to the prescribed price limit”. Class: a smaller tender, like DPM but with 2–3 parties instead of one, where advertising an open tender would cost more than it saves. PPR r.69 (and the 2025/2026 amendment) also allow low-value simple works.',
  },
  {
    id: 'l-ict-provisions',
    topic: T,
    title: 'Special provisions for international competitive tendering (PPA s.33)',
    ask: 'Describe special provisions to be made for international competitive bidding.',
    points: [
      { k: 'Invitation notice in English, advertised', alt: ['english advertisement', 'advertisement in english'], d: 's.33(a): published in English and advertised under s.40.' },
      { k: 'Tender documents in English', alt: ['english documents'], d: 's.33(b).' },
      { k: 'Specified minimum time (42 days)', alt: ['42 days', 'time limit', 'minimum time'], d: '(c)(i); class label “42 days”.' },
      { k: 'International standards in specifications', alt: ['international standards'], d: '(c)(ii) to the extent compatible with national requirements.' },
      { k: 'Securities in international currency', alt: ['currency', 'tender security currency', 'two currency'], d: '(c)(iii) tender and performance security in a currency widely used in international trade.' },
      { k: 'Taka for local inputs', alt: ['local inputs in taka', 'local staff in taka'], d: '(c)(iv). Class: two-currency dealings — local in Taka, foreign in dollars.' },
      { k: 'Payment in the contract currencies', alt: ['payment currency'], d: '(c)(v).' },
      { k: 'Provision for price escalation', alt: ['price escalation', 'price adjustment'], d: 'Class list: if prices rise the contractor is paid accordingly. Sir struck out “fixed price tender” and wrote this.' },
      { k: 'International conditions of contract (GCC, PCC)', alt: ['FIDIC', 'international trade conditions', 'GCC and PCC'], d: '(c)(vi) general and particular conditions similar to those used in international trade.' },
      { k: 'Domestic preference', alt: ['margin of preference', '5%'], d: '(c)(vii) at rates prescribed by the rules; class figure 5%.' },
      { k: 'JV with local partners encouraged, not mandatory', alt: ['joint venture', 'local partnerships'], d: '(c)(viii).' },
      { k: 'ADR and international arbitration', alt: ['international arbitration', 'alternative dispute resolution'], d: '(c)(ix) and its proviso.' },
    ],
    hook: 'English, English, 42 days, international standards; then four money lines (security currency, Taka local, contract-currency payment, price escalation); then Conditions, Domestic preference, JV, Arbitration.',
    seen: ['2012-13'],
    src: 'PPA s.33(a)–(c)(ix); Nafee bhai note Ques-10(a) (class list with price escalation and 5%); annotated PPA p.16 (sir’s correction “Provision for Price Escalation”)',
    note: 'Price escalation is in the class list, not in s.33 itself.',
  },
  {
    id: 'l-dom-pref-benefits',
    topic: T,
    title: 'Benefits of domestic preference',
    points: [
      { k: 'Local industry grows, jobs created', alt: ['local industry', 'employment', 'jobs'] },
      { k: 'GDP growth', alt: ['GDP'], d: 'New opportunities raise GDP.' },
      { k: 'Import dependency falls', alt: ['less import', 'import dependency'] },
      { k: 'Domestic currency reserve saved', alt: ['currency reserve', 'foreign exchange'] },
    ],
    seen: [],
    src: 'Nafee bhai note Ques-10(b)',
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
      { k: 'Efficiency, transparency and accountability', alt: ['efficiency', 'transparency', 'accountability'], d: 'The three key benefits.' },
      { k: 'Centralized data repositories', alt: ['centralised data', 'supply chain visibility'], d: 'Any authorised person can track the procure-to-pay lifecycle.' },
      { k: 'Open market, not a closed market', alt: ['closed market', 'bribery and corruption', 'open market'], d: 'A closed market only facilitates bribery and corruption.' },
      { k: 'Smaller businesses can compete', alt: ['small business', 'wider competition'], d: 'As well as larger businesses.' },
      { k: 'Standardized approval processes, formal workflows', alt: ['standardised approval', 'formal workflows', 'authorization'], d: 'The correct level of authorisation on each transaction.' },
      { k: 'Electronic audit trail cannot be edited', alt: ['audit trail', 'cannot be deleted or edited', 'log'], d: 'Cannot be deleted or edited midway; every change is traced.' },
    ],
    hook: 'E-T-A, then Data, Open market, Small firms, Standard approvals, Audit trail.',
    seen: ['2015-16'],
    src: 'Pallab’s 18-batch solve of 2015-16 Q3(c) = Nafee bhai note Ques-31 (marked TF); PPA s.65',
    note: 'Practical effects you can add: online notices and documents, no physical tender dropping, encrypted bids opened automatically, online payment, automatic publication of results.',
  },
]

const cards: PcCard[] = [
  { id: 'c-meth-other-approval', topic: T, front: 'What is needed to use any method other than OTM?', back: '“With the **approval of the head of the procuring entity**, or an officer authorised by him, when considered justified on **technical or economic grounds**” (s.32(1)), and the PE must “properly **record in a file the reasons** for use of that method and preserve such records” (s.32(2)).', src: 'PPA s.32(1)–(2)', seen: ['2014-15'] },
  { id: 'c-meth-s31-proviso', topic: T, front: 'What does the proviso added to PPA s.31 say?', back: '“Provided that, in case of any procurement, if an **unusually low price (significantly low price)** is quoted by a tenderer from the **official estimated cost**, such lower price shall be evaluated in accordance with the procedure prescribed by rules.” — PPA s.31 as amended in 2025 (Ordinance No. 16 of 2025, re-enacted as Act No. 41 of 2026).', src: 'PPA_Section_31_Comparison.pdf; ppa_25 / ppa_26 gazettes (the comparison sheet’s “2023” is a mislabel)' },
  { id: 'c-meth-min-time', topic: T, front: 'Minimum time for submission of tenders — national and international?', back: '**21 days** for a national tender (written by sir beside s.31(d)); **42 days** for an international tender (beside s.33).', src: 'Annotated PPA (class labels); Pallab’s 18-batch solve 2014-15 Q1(b); PPR Sch II' },
  { id: 'c-meth-ltm-security', topic: T, front: 'Tender security and performance security under LTM?', back: 'Tender security **not mandatory** (PPA s.14(b)); performance security **required** (PPR r.63(5)). LTM needs prior HOPE approval; enlistment limits Tk 1.5 M goods, Tk 3 M works.', src: 'PPA s.14(b); PPR r.63' },
  { id: 'c-meth-ltm-2crore', topic: T, front: 'Special LTM rule for domestic works ≤ Tk 2 crore?', back: 'Official estimate is **disclosed**; a tender more than **5% above or below** it is rejected; a tie in lowest rates may be broken by **lottery** (only here).', src: 'PPA s.19(1)(a), 49(1)(a)' },
  { id: 'c-meth-rfq', topic: T, front: 'RFQ — how many quotations, securities, advertisement?', back: 'Class: like direct procurement, but with **2–3 parties instead of one**; for low-value goods where an open-tender advertisement would be a loss. PPR: at least **three responsive quotations**; **no tender or performance security**; no newspaper advertisement.', src: 'Nafee bhai note Ques-6; PPR r.70–73' },
  { id: 'c-meth-rfq-limit', topic: T, front: 'RFQ value limits (development budget)?', back: 'Goods: ≤ Tk 200,000 each, Tk 500,000 a year. Works: ≤ Tk 300,000 each, Tk 1,000,000 a year. (Revenue budget: Tk 100,000 / 300,000 goods; Tk 200,000 / 500,000 works.)', src: 'PPR Sch II r.69' },
  { id: 'c-meth-tstm', topic: T, front: 'Two-stage tendering — what happens in each stage?', back: 'For mainly **unknown solutions** (class example: a satellite launch). Stage 1: the technically advanced firms **propose the solution** — unpriced technical proposals. Stage 2: revised documents, then the **price** — priced tenders, evaluated as in OTM.', src: 'Nafee bhai note Ques-6; Pallab’s 18-batch solve; PPR r.66–68' },
  { id: 'c-meth-one-stage', topic: T, front: 'One-stage (single stage) two-envelope method?', back: '“If Two Stage Tendering Method … is not applicable, **Single Stage Two Envelope** Tendering Method may be applied” (PPA s.32(1)(cc)). Technical and financial envelopes come together; technical opened first. After the 2025/2026 amendment: contract with the lowest tenderer among those successful in the technical evaluation.', src: 'PPA s.32(1)(cc), 47(1); Act No. 41 of 2026' },
  { id: 'c-meth-reverse-auction', topic: T, front: 'Which new method did the 2025/2026 amendment add to s.32?', back: '**(e) Reverse auction** — the procuring entity starts with one invitation for a specific good or service and the potential suppliers compete in real time by submitting **successively lower prices**. Not in the class list of five methods.', src: 'Ordinance No. 16 of 2025 / Act No. 41 of 2026, s.32' },
  { id: 'c-meth-dpm-negotiate', topic: T, front: 'In which method may the PE negotiate with the tenderer?', back: '**Direct Procurement** — PE asks for a priced offer and is then free to negotiate (PPR r.75(3), 99(1)(a)). No advertisement, no tender security, performance security required.', src: 'PPR r.75, 99' },
  { id: 'c-meth-dpm-forms', topic: T, front: 'Forms of direct procurement (PPR r.75)?', back: 'Direct contracting; additional deliveries and repeat orders; variation orders; extra work orders; direct cash purchase; force account.', src: 'PPR r.75' },
  { id: 'c-meth-ict-when', topic: T, front: 'When is international competitive tendering used?', back: '“Where it is **not feasible** to undertake any procurement by inviting **competitive tenders within the country** and it reasonably appears … that **effective international competition** cannot be ensured unless special efforts are made” (PPA s.33). Minimum **42 days** for tenders.', src: 'PPA s.33; annotated PPA (“42 Days”)' },
  { id: 'c-meth-dom-pref', topic: T, front: 'What is domestic preference and how much?', back: 'The **margin of preference given to local companies or individuals and to locally made products** in procurement (goods, works, services) under international tendering. Class figure: usually **5%** of the total project cost. PPR maxima: **15%** (goods), **7.5%** (works). It cannot be made compulsory (s.33(c)(vii)).', src: 'Nafee bhai note Ques-10(b); 18-batch TF solve p.31 and annotated PPA (“Domestic Preference 5%”); PPR r.83, Sch II' },
  { id: 'c-meth-group-a', topic: T, front: 'Which goods qualify as Group A for domestic preference?', back: 'Goods made in Bangladesh whose local labour, raw material and components exceed **30% of the ex-works price**. Works: firm registered in BD, majority BD ownership, ≤ 20% subcontracted to foreigners.', src: 'PPR r.83(2)–(3)' },
  { id: 'c-meth-pq', topic: T, front: 'What is prequalification?', back: 'Sir in class: “the process of **short listing eligible candidates** for allowing participations in the tender process of **large procurement**.” Nafee: capability assessment of firms to carry out a particular contract before inviting them to tender. **Not mandatory**; run above about **Tk 35 crore**.', src: '18-batch TF solve p.18 (“Sir in class”); Nafee bhai note Ques-9; PPA s.31(1)(a); PPR r.91–93' },
  { id: 'c-meth-egp-def', topic: T, front: 'What is e-GP (PPA s.65)?', back: '“For carrying out the purposes of this Act, any or all government procurement under this Act may be undertaken using **electronic processing system**” — i.e. “the online processing of data through a website”. The portal is run by **CPTU**. After the 2025/2026 amendment e-GP is **mandatory** wherever the portal can process it.', src: 'PPA s.65; Act No. 41 of 2026', seen: ['2015-16'] },
  { id: 'c-meth-sanctions', topic: T, front: 'What happens to a firm found in corrupt/collusive practice?', back: 'Excluded from the proceeding, its award recommendation rejected, and/or declared **ineligible (debarred)** indefinitely or for a period; staff face departmental and criminal action (PPA s.64; PPR r.127(4)).', src: 'PPA s.64; PPR r.127' },
]

const answers: PcAnswer[] = [
  {
    id: 'a-tender-methods-list',
    topic: T,
    q: 'Name the different types of tendering methods (for goods and works).',
    seen: ['2017-18', '2011-12'],
    a: `There are **five** tendering methods for goods and works (PPA 2006 s.31–32):
1. **Open Tendering Method (OTM)** — the **preferred method** (s.31); usable in all cases.
2. **Limited Tendering Method (LTM)** — s.32(1)(a).
3. **Direct Procurement Method (DPM)** — s.32(1)(b); the worst (least transparent) method.
4. **Two-Stage Tendering Method** — s.32(1)(c).
5. **Request for Quotation (RFQ)** — s.32(1)(d).

Methods 2–5 are the "other methods": used only **with the approval of the head of the procuring entity** when justified on technical or economic grounds, with the reasons recorded in a file (s.32).

Each may be a **national** or an **international** competitive tender (s.33–34).

The Act also lists a Single Stage Two Envelope method (s.32(1)(cc)) for when two-stage is not applicable.`,
    keys: ['five', 'Open Tendering Method', 'preferred method', 'Limited Tendering Method', 'Direct Procurement Method', 'Two-Stage Tendering Method', 'Request for Quotation', 'with the approval of the head of the procuring entity', 'international'],
    lists: ['l-tender-methods'],
    src: 'Nafee bhai note Ques-6 (“5 types”); PPA s.31–34; IA sir “Steps” slides p2–3',
  },
  {
    id: 'a-methods-applicability',
    topic: T,
    q: 'With reference to PPA 2006 sections 31 and 32, state the tendering methods for goods and works and the situation in which each applies (with advantages and disadvantages).',
    seen: ['2021-22', '2017-18', '2014-15', '2012-13'],
    a: `There are five methods: OTM (section 31) and four "other methods" (section 32) — LTM, DPM, Two-Stage and RFQ. Write the two sections word for word.

### Section 31 — Open Tendering Method (applicable in all cases)
${S31}

${S31_PROVISO}

### Section 32 — Use of other procurement methods
${S32_HEAD}

${S32_LTM}

${S32_DPM}

${S32_TSTM}

${S32_RFQ}

${S32_TAIL}

### Class remarks to add beside each
- **DPM** is the **worst method** (least transparent: no advertisement, no competition). Additional procurement is limited (the 18-batch solve notes "up to 15%").
- **Two-stage** is mainly for **unknown solutions**: the solution is proposed in the first stage, then the price — e.g. a satellite launch.
- **RFQ** is a smaller tender: like DPM, but with 2–3 parties instead of one.

### Advantages and disadvantages (only if the question asks)
| Method | Advantages | Disadvantages |
|---|---|---|
| OTM | Maximum competition, transparency, fair price, equal opportunity to all | Takes longer; advertisement and evaluation cost is higher |
| LTM | Quicker; suits specialised or standardised items; less evaluation effort | Limited competition; possible collusion among the few suppliers |
| DPM | Fastest; useful in emergency, sole source or additional work | No competition; least transparent; chance of higher price and favouritism |
| Two-Stage | The technical solution is developed with the tenderers for complex projects | Lengthy and complex; needs expertise to evaluate |
| RFQ | Simple and quick for low value off-the-shelf items | Only within the price limit; limited competition |

Also in the Act: s.32(1)(cc) — if two-stage is not applicable, the Single Stage Two Envelope method may be applied.`,
    keys: ['Open Tendering Method as the preferred method', 'determining prequalification', 'equal and non-discriminatory terms', 'prescribed minimum time', 'lowest evaluated responsive tenderer', 'unusually low price (significantly low price)', 'with the approval of the head of the procuring entity', 'technical or economic grounds', 'specialised nature', 'limited number of suppliers or contractors', 'standardisation of a brand', 'sole tenderer', 'additional procurement', 'large and complex projects', 'rapidly evolving industry', 'off-the-shelf low value goods', 'record in a file the reasons', 'worst method'],
    lists: ['l-tender-methods', 'l-otm-conditions', 'l-ltm-cases', 'l-dpm-cases', 'l-dpm-weakness', 'l-tstm-cases', 'l-rfq-cases'],
    src: 'PPA 2006 s.31–32, verbatim from the English Act; 18-batch TF solve p.14–16 (“memorize section 31 & 32 completely, word by word”); Pallab’s solve of 2014-15 Q1(a) (class remarks); advantages/disadvantages table: typed note PYQ-6, written by a current-batch student — no class source',
  },
  {
    id: 'a-otm-preferred',
    topic: T,
    q: 'Why is the Open Tendering Method (OTM) a preferred method? What are the PPA requirements for its use?',
    seen: ['2023-24', '2014-15'],
    a: `**Open Tendering Method (OTM)** is the method in which tenders are invited from all eligible tenderers by public advertisement. PPA section 31 makes it the **preferred method** for goods, related services, works and physical services, because it gives:
1. **Participation for all** — every eligible tenderer can take part.
2. **Best to ensure transparency** — public advertisement and public opening.
3. **Good value of money** — a fair price and good value for the price.
4. **Fair competition among contractors** — equal and non-discriminatory terms.
5. **Quality product and contractor**.
6. **Wide competition**.

### PPA 2006, section 31 — requirements for using OTM
${S31}

${S31_PROVISO}

Minimum time under (d): **21 days** for a national tender, 42 days for an international tender.`,
    keys: ['preferred method', 'Participation for all', 'Best to ensure transparency', 'Good value of money', 'Fair competition among contractors', 'Quality product and contractor', 'Wide competition', 'determining prequalification', 'equal and non-discriminatory terms', 'advertisement', 'prescribed minimum time', 'lowest evaluated responsive tenderer', 'unusually low price (significantly low price)', '21 days'],
    lists: ['l-otm-why', 'l-otm-conditions'],
    src: '18-batch TF solve p.14 (VVI: the six reasons, then s.31 and the proviso); Nafee bhai note Ques-7; PPA s.31 verbatim; proviso from PPA_Section_31_Comparison.pdf, cited to the 2025 Ordinance / 2026 Act',
  },
  {
    id: 'a-dpm-worst',
    topic: T,
    q: 'Why is the Direct Procurement (Tendering) Method less transparent and the worst method? Under which conditions can it be allowed?',
    seen: [],
    a: `**Direct Procurement Method (DPM / DTM)** is buying directly from one supplier or contractor without inviting tenders.

### Why it is less transparent and the worst method
1. The purchase is made **directly**, without any kind of written agreement.
2. **No advertisement** is given in a newspaper or the media.
3. So **other firms cannot take part** in the procurement — there is no competition.
4. The entity's **internal methodology** of choosing the supplier stays out of sight.
5. It could encourage fraudulent practices and favouritism.

### When it can be allowed — PPA s.32(1)(b)
${S32_DPM}

It needs the approval of the head of the procuring entity, and the reasons must be recorded in a file (s.32(1)–(2)).`,
    keys: ['directly', 'No advertisement', 'other firms cannot take part', 'internal methodology', 'avoiding possible competition', 'discrimination among tenderers', 'sole tenderer', 'local community', 'additional procurement', 'exceptionally advantageous conditions', 'government-owned industry or factory', 'very urgent or essential nature'],
    lists: ['l-dpm-weakness', 'l-dpm-cases'],
    src: 'Nafee bhai note Ques-8 (IA sir “important” list, Q9) — not in our 12 papers; PPA s.32(1)(b) verbatim; PPR r.74(2) (point 5)',
  },
  {
    id: 'a-prequal',
    topic: T,
    q: 'What is prequalification?',
    seen: [],
    a: `**Prequalification** is the process of **short listing eligible candidates** for allowing participations in the tender process of **large procurement** (sir, in class).

1. It is a **capability assessment of firms** to carry out a particular contract **before inviting them to submit a tender**.
2. It is done for high-value tenders — in practice above about **Tk 35 crore**.
3. It is **not mandatory**: PPA s.31(1)(a) says "determining prequalification, **if applicable**". (For intellectual services the matching step, the Expression of Interest, is mandatory.)
4. Only the prequalified firms are then invited to tender.
5. The lowest tenderer is still checked again by **post-qualification** before the award.`,
    keys: ['short listing eligible candidates', 'large procurement', 'capability assessment of firms', 'before inviting them to submit a tender', 'Tk 35 crore', 'not mandatory', 'if applicable', 'post-qualification'],
    src: '18-batch TF solve p.18 (“Sir in class”, starred); Nafee bhai note Ques-9; PPA s.31(1)(a), s.50; short note in CE 403 2009-10 and 2008-09 — not in our 12 papers',
  },
  {
    id: 'a-ict-provisions',
    topic: T,
    q: 'Describe the special provisions to be made for international competitive bidding (the conditions to be mentioned for international tenderers).',
    seen: ['2012-13'],
    a: `### PPA 2006, section 33 — open tendering in international competition
Where it is not feasible to undertake any procurement by inviting competitive tenders within the country and it reasonably appears that effective international competition cannot be ensured unless special efforts are made, the procuring entity shall apply the open international procurement method, fulfilling the following terms and conditions:

- (a) the Invitation for tender notice shall be **published in the English** and advertised in accordance with section 40;
- (b) **tender documents shall be prepared in the English**;
- (c) in preparing the tender document the procuring entity shall consider the following matters:
- (i) the **specified minimum time** is provided for submission of tenders — **42 days**;
- (ii) technical specifications, to the extent compatible with national requirements, are determined on the basis of **international standards** or standards widely used in international trade;
- (iii) tenderers are permitted to express their tender security and performance security in a **currency or currencies widely used in international trade**;
- (iv) tenderers are instructed to express their tenders only in **Taka for local inputs**;
- (v) provision for payment of the contract price is made in the currency or currencies as mentioned in the contract;
- (vi) **general and particular conditions of contract** similar to those used in international trade are set;
- (vii) provision for **domestic preference** at rates as prescribed by the rules is made, in the case of supply of goods at final destination exclusive of customs duties and taxes, and, in the case of works inclusive of all customs duties and taxes — class figure **5%**;
- (viii) **joint ventures with local partnerships are encouraged**, but shall not be imposed as a mandatory condition;
- (ix) **alternative methods for dispute resolution** are incorporated for the supply and installation in the case of large or complex contracts: Provided that **International Arbitration** provisions shall be made applicable for final resolution of disputes as provided for in the tender documents.

### As listed in class (nine points)
English advertisement; English documents; 42 days; two-currency dealings (local staff in Taka, foreign staff in dollars); **provision for price escalation** (if prices rise the contractor is paid accordingly — not a fixed-price tender); GCC and PCC; domestic preference 5%; ADR / international arbitration; JV with local partners encouraged.`,
    keys: ['published in the English', 'tender documents shall be prepared in the English', 'specified minimum time', '42 days', 'international standards', 'currency or currencies widely used in international trade', 'Taka for local inputs', 'general and particular conditions of contract', 'domestic preference', 'joint ventures with local partnerships are encouraged', 'alternative methods for dispute resolution', 'International Arbitration', 'provision for price escalation'],
    lists: ['l-ict-provisions'],
    src: 'PPA 2006 s.33 verbatim (18-batch TF solve p.30–31, “conditions to be mentioned for international traders”, discussed by sir in class); Nafee bhai note Ques-10(a) (class list); annotated PPA p.16 (price escalation, 42 days, 5%)',
  },
  {
    id: 'a-dom-pref',
    topic: T,
    q: 'What is domestic preference? How is it effected and applied?',
    seen: [],
    a: `**Domestic preference** refers to the **margin of preference given to local companies or individuals and to locally made products** in the procurement of goods, works, consulting services and non-consulting services (in an internationally tendered or development-partner financed project).

### How it is applied
1. It is a provision of **international** tendering: PPA s.33(c)(vii) — "provision for domestic preference at rates as prescribed by the rules is made", for goods **exclusive of customs duties and taxes**, for works inclusive of them.
2. It is usually given at **5%** of the total project cost (class figure); the PPR allows up to 15% for goods and 7.5% for works.
3. In evaluation the prices of foreign tenders are raised by the margin before comparison, so a local tender within the margin wins.
4. It **cannot be made compulsory**, and the tender or tenderer must meet the prescribed conditions.

### Benefits
1. **Local industry** develops and jobs are created for the unemployed.
2. New opportunities bring **GDP growth**.
3. **Import dependency** falls.
4. The **domestic currency reserve** is saved.`,
    keys: ['margin of preference given to local companies or individuals and to locally made products', 'international', 'exclusive of customs duties and taxes', '5%', 'cannot be made compulsory', 'Local industry', 'GDP growth', 'Import dependency', 'domestic currency reserve'],
    lists: ['l-dom-pref-benefits'],
    src: 'Nafee bhai note Ques-10(b) (definition, 5%, four benefits) — IA sir “important” list Q12, “discussed by Sir in class”; PPA s.33(c)(vii); PPR r.83, Sch II (15% / 7.5%, point 3); short note in CE 403 2009-10 — not in our 12 papers',
  },
  {
    id: 'a-egp',
    topic: T,
    q: 'What is e-GP? Describe e-GP as a means of eliminating tendering malpractices.',
    seen: ['2015-16'],
    a: `**e-GP** is electronic Government Procurement. PPA s.65(1): "For carrying out the purposes of this Act, any or all government procurement under this Act may be undertaken using **electronic processing system**" — the online processing of data through a website.

In Bangladesh the national **e-GP portal** is developed, owned and being operated by the **Central Procurement Technical Unit (CPTU), IME Division of the Ministry of Planning**. It provides an **online platform** to carry out the procurement activities of the public agencies — Procuring Agencies (PAs) and Procuring Entities (PEs). As amended, s.65(1) makes e-GP **mandatory** wherever the portal can process the procurement; exceptions only with the prior approval of the **BPPA**; procurement plans are published on the portal.

### How it eliminates malpractices
1. Its key benefits are **Efficiency, Transparency, and Accountability**.
2. **Centralized data repositories** improve supply chain visibility: any authorised person can track the procure-to-pay lifecycle.
3. A **closed market** only facilitates bribery and corruption; e-GP creates an open market.
4. It permits **smaller businesses** to compete for government contracts as well as larger businesses.
5. **Standardized approval processes** and formal workflows ensure the correct level of authorisation for each transaction.
6. An **electronic audit trail cannot be deleted or edited** midway through the procurement process; where and when any change happened is known.

Thus e-GP ensures elimination of all kinds of tendering malpractices — corrupt, fraudulent, collusive and coercive practices (PPR r.127).

According to the World Bank, with e-GP procurement has become more efficient, transparent and accountable, while also increasing overall competition that has improved value for money.`,
    keys: ['e-GP', 'electronic processing system', 'Central Procurement Technical Unit', 'online platform', 'Efficiency, Transparency, and Accountability', 'Centralized data repositories', 'closed market', 'smaller businesses', 'Standardized approval processes', 'electronic audit trail cannot be deleted or edited', 'corrupt, fraudulent, collusive and coercive'],
    lists: ['l-egp-benefits', 'l-malpractice'],
    src: 'Pallab’s 18-batch solve of 2015-16 Q3(c) = Nafee bhai note Ques-31 (marked TF); 18-batch TF solve p.21 (s.65, World Bank statement); PPA s.65; PPR r.127',
  },
]

export default { lists, cards, answers } satisfies PcTopicContent

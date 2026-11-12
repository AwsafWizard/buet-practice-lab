// pc-ce — The civil engineer (OIA Ma'am, Dr. Tanvir Manzur's Lecture 01).
// Source digest: CE301/Claude digests/lec_project_legal.md (pr-ce).
import type { PcAnswer, PcCard, PcList, PcTopicContent } from '../types'

const T = 'pc-ce' as const

const DEF_SEEN = ['2023-24', 'May 2024', '2021-22', '2020-21', '2017-18', '2016-17', '2015-16', '2014-15', '2013-14', '2012-13', '2011-12']
const ATTR_SEEN = ['2023-24', '2021-22', '2016-17', '2015-16', '2014-15', '2013-14', '2012-13', '2011-12']

const lists: PcList[] = [
  {
    id: 'l-ce-asce-roles',
    topic: T,
    title: 'Roles of civil engineers in the ASCE definition',
    ask: 'In the ASCE Body of Knowledge definition, civil engineers serve competently, collaboratively and ethically as … (5 roles, in order)',
    points: [
      { k: 'Master planners, designers, constructors', alt: ['planners designers constructors'] },
      { k: 'Stewards of the natural environment', alt: ['stewards of environment and its resources'], d: 'stewards of the natural environment and its resources' },
      { k: 'Innovators and integrators' },
      { k: 'Managers of risk and uncertainty' },
      { k: 'Leaders in discussions and decisions', alt: ['leaders shaping public policy'], d: 'leaders in discussions and decisions shaping public environmental and infrastructure policy' },
    ],
    ordered: true,
    hook: 'Plan it, Steward it, Innovate, Manage risk, Lead policy — "P-S-I-M-L": the engineer goes from the drawing board to the parliament.',
    seen: DEF_SEEN,
    src: 'Tanvir sir L1 p3',
    note: 'The question bank uses the longer ASCE Vision-2025 wording ("…constructors and operators of society’s economic and social engine…"). The slide is shorter and opens with "Entrusted by society to create a sustainable world and enhance the global quality of life".',
  },
  {
    id: 'l-ce-attributes',
    topic: T,
    title: 'Attributes (basic characteristics) of the civil engineering profession',
    ask: 'Name the five basic attributes of civil engineering as a profession.',
    points: [
      { k: 'Systematic body of theory', d: 'skills flow from an internally consistent system; spirit of rationality; based on mathematics and natural science' },
      { k: 'Authority', alt: ['professional authority'], d: 'extensive education highlights the layperson’s comparative ignorance; functional specificity, like law and medicine' },
      { k: 'Community sanction', alt: ['sanction of the community'], d: 'state-sponsored boards; license or registration' },
      { k: 'Ethical codes', alt: ['code of ethics', 'regulative code of ethics'], d: 'well-documented codes; the engineer is the client’s trusted advisor' },
      { k: 'A culture', alt: ['professional culture'], d: 'valuable services to society, appropriate behaviour, rich history and folklore' },
    ],
    hook: '"Some Authorities Command Ethical Culture" — Systematic theory, Authority, Community sanction, Ethical codes, Culture.',
    seen: ATTR_SEEN,
    src: 'Tanvir sir L1 p9–12',
    note: 'The question bank uses Greenwood’s labels (professional authority, sanction of the community, regulative code of ethics, professional culture) — same ideas; write the slide labels.',
  },
  {
    id: 'l-ce-ethics-relations',
    topic: T,
    title: 'Relationships covered by the ethical codes (attribute 4)',
    points: [
      { k: 'Ethical — professional' },
      { k: 'Client-professional', d: 'impulse to perform maximally' },
      { k: 'Colleague to colleague', d: 'cooperative, egalitarian, supportive' },
    ],
    seen: [],
    src: 'Tanvir sir L1 p11',
  },
  {
    id: 'l-ce-culture',
    topic: T,
    title: 'Elements of the civil engineer’s culture (attribute 5)',
    points: [
      { k: 'Social values' },
      { k: 'Services valuable to the community' },
      { k: 'Appropriate behaviour', alt: ['various mode of appropriate behavior'], d: 'sounding like a professional, saying "no" gracefully, making presentations and conducting meetings' },
      { k: 'Symbols', d: 'argot and jargon; insignia and emblem; history and folklore' },
    ],
    seen: [],
    src: 'Tanvir sir L1 p12',
  },
  {
    id: 'l-ce-outcomes-prof',
    topic: T,
    title: 'Necessary outcomes of CE education — Professional category (ASCE BOK2)',
    points: [
      { k: 'Communication' },
      { k: 'Public policy' },
      { k: 'Business & public administration', alt: ['business and public administration'] },
      { k: 'Globalization', alt: ['globalisation'] },
      { k: 'Leadership' },
      { k: 'Teamwork' },
      { k: 'Attitudes' },
      { k: 'Lifelong learning' },
      { k: 'Professional & ethical responsibilities', alt: ['professional and ethical responsibility'] },
    ],
    hook: '"Clever People Bring Global Leaders Together And Learn Professionally" — Communication, Public policy, Business & PA, Globalization, Leadership, Teamwork, Attitudes, Lifelong learning, Professional & ethical.',
    seen: ['2015-16', '2011-12'],
    src: 'Tanvir sir L1 p5 (ASCE BOK2, 2008)',
  },
  {
    id: 'l-ce-outcomes-found',
    topic: T,
    title: 'Necessary outcomes of CE education — Foundational category',
    points: [{ k: 'Mathematics' }, { k: 'Natural science' }, { k: 'Humanities' }, { k: 'Social sciences' }],
    seen: [],
    src: 'Tanvir sir L1 p5',
  },
  {
    id: 'l-ce-outcomes-tech',
    topic: T,
    title: 'Necessary outcomes of CE education — Technical category',
    points: [
      { k: 'Material science' },
      { k: 'Mechanics' },
      { k: 'Experiments' },
      { k: 'Problem recognition & solving', alt: ['problem recognition and solving'] },
      { k: 'Design' },
      { k: 'Sustainability' },
      { k: 'Contemporary issues / historical perspectives', alt: ['contemporary issues'] },
      { k: 'Risk & uncertainties', alt: ['risk and uncertainty'] },
      { k: 'Project management' },
      { k: 'Breadth in CE areas' },
      { k: 'Technical specialization' },
    ],
    seen: [],
    src: 'Tanvir sir L1 p5',
  },
  {
    id: 'l-ce-ancient-devices',
    topic: T,
    title: 'Ancient structural systems (devices to support roof or upper stories)',
    points: [
      { k: 'Corbel', d: 'Mesopotamia (clay, no stone or wood)' },
      { k: 'Post & lintel', alt: ['post and lintel'], d: 'Egypt; Greece & China' },
      { k: 'Arch & vault', alt: ['arch and vault', 'arch', 'vault'], d: 'Mesopotamia' },
      { k: 'Truss', d: 'Europe (abundant wood)' },
    ],
    hook: '"Clay Pots Are Timeless" — Corbel, Post & lintel, Arch & vault, Truss.',
    seen: ['2021-22', '2017-18'],
    src: 'Tanvir sir L1 p18–19',
    note: 'The question bank answers "post-and-lintel, arch, vault, dome" — dome is not on the slide and truss is missing there.',
  },
  {
    id: 'l-ce-ancient-factors',
    topic: T,
    title: 'Factors underpinning the success of ancient engineers',
    points: [
      { k: 'Intensive & careful use of existing principles and tools', alt: ['use of existing principles and tools'] },
      { k: 'Unlimited labor & power to command it', alt: ['unlimited labour'], d: 'unlimited labor and the power to organize and command it' },
      { k: 'A different perspective of time', d: 'perhaps the most important — the Ancients seemed to have infinite patience' },
    ],
    seen: ['2017-18'],
    src: 'Tanvir sir L1 p19',
  },
  {
    id: 'l-ce-bodies',
    topic: T,
    title: 'Professional bodies of civil engineers (in order of founding)',
    points: [
      { k: 'ICE 1818', alt: ['Institute of Civil Engineers'], d: 'British Institute of Civil Engineers, chartered 1818' },
      { k: 'ASCE 1852', alt: ['American Society of Civil Engineers'] },
      { k: 'ICEI 1860', d: 'Institution of Civil Engineers India' },
      { k: 'AICCP 1903', d: 'Spanish Asociación de Ingenieros de Caminos, Canales y Puertos' },
      { k: 'SAICE 1903', d: 'South African Institution of Civil Engineers' },
      { k: 'JSCE 1914', d: 'Japan Society of Civil Engineers' },
      { k: 'CICE 1936', d: 'Chinese Institute of Civil Engineering' },
    ],
    ordered: true,
    seen: [],
    src: 'Tanvir sir L1 p8',
  },
  {
    id: 'l-ce-asce-institutes',
    topic: T,
    title: 'Institutes currently incorporated in ASCE',
    points: [
      { k: 'Architectural Engineering (AEI)', alt: ['AEI'] },
      { k: 'Coasts, Oceans, Ports and Rivers (COPRI)', alt: ['COPRI'] },
      { k: 'Construction (CI)', alt: ['CI'] },
      { k: 'Engineering Mechanics (EMI)', alt: ['EMI'] },
      { k: 'Environmental and Water Resources (EWRI)', alt: ['EWRI'] },
      { k: 'Geo (G-I)', alt: ['G-I', 'geo institute'] },
      { k: 'Structural Engineering (SEI)', alt: ['SEI'] },
      { k: 'Transportation & Development (T&DI)', alt: ['T&DI'] },
    ],
    seen: [],
    src: 'Tanvir sir L1 p29',
  },
  {
    id: 'l-ce-21c',
    topic: T,
    title: 'Dominant activities in 21st-century civil engineering practice (the wheel)',
    points: [
      { k: 'Validate and optimize processes' },
      { k: 'Use engineering mechanics' },
      { k: 'Assess requirements' },
      { k: 'Write technical reports' },
      { k: 'Acquire knowledge' },
      { k: 'Make judgments' },
      { k: 'Work with determinate and non-determinate processes' },
      { k: 'Develop and evaluate design concepts' },
      { k: 'Investigate' },
      { k: 'Analyze risk' },
      { k: 'Develop ideas' },
      { k: 'Verify and interpret outcomes' },
    ],
    seen: [],
    src: 'Tanvir sir L1 p6',
  },
  {
    id: 'l-ce-entry',
    topic: T,
    title: 'Work given to entry-level civil engineers',
    points: [
      { k: 'Monitoring construction in the field', d: 'the "eyes & ears" of more senior design engineers' },
      { k: 'Routine analysis or design & interpretation' },
      { k: 'Project management of design projects' },
    ],
    seen: [],
    src: 'Tanvir sir L1 p28',
  },
  {
    id: 'l-ce-ancient-wonders',
    topic: T,
    title: 'Seven ancient wonders listed by Greek writers (c. 100 B.C.)',
    points: [
      { k: 'Great Pyramid at Giza' },
      { k: 'Hanging Gardens of Babylon' },
      { k: 'Statue of Zeus at Olympia' },
      { k: 'Temple of Artemis at Ephesus' },
      { k: 'Tomb of King Mausolos', alt: ['Mausoleum at Halikarnassos'] },
      { k: 'Colossus of Rhodes' },
      { k: 'Pharos Lighthouse of Alexandria' },
    ],
    seen: [],
    src: 'Tanvir sir L1 p15',
  },
  {
    id: 'l-ce-modern-wonders',
    topic: T,
    title: 'ASCE’s seven wonders of the modern world',
    points: [
      { k: 'Channel Tunnel', d: '1987–1994, Strait of Dover (UK–France)' },
      { k: 'CN Tower', d: '1973–1976, Toronto; tallest free-standing structure 1976–2007' },
      { k: 'Empire State Building', d: '1930–1931, New York; first building with 100+ stories' },
      { k: 'Golden Gate Bridge', d: '1933–1937, San Francisco' },
      { k: 'Panama Canal', d: '1880–1914' },
      { k: 'Delta Works', d: '1950–1997, the Netherlands' },
      { k: 'Itaipu Dam', d: '1970–1984, Paraná River (Brazil–Paraguay)' },
    ],
    seen: [],
    src: 'Tanvir sir L1 p20',
  },
]

const cards: PcCard[] = [
  {
    id: 'c-ce-def-open',
    topic: T,
    front: 'How does the ASCE Body of Knowledge definition of civil engineers **open** (before the roles)?',
    back: '"**Entrusted by society to create a sustainable world and enhance the global quality of life**, Civil Engineers serve, **competently, collaboratively, and ethically** as: …"',
    seen: DEF_SEEN,
    src: 'Tanvir sir L1 p3',
  },
  {
    id: 'c-ce-term',
    topic: T,
    front: 'Where does the term **"civil engineer"** come from?',
    back: 'Just before and during the Industrial Revolution (late 18th–early 19th c.) certain **military engineers began to work on nonmilitary, or civil, projects**; "civil engineer" was adopted to emphasize this difference.',
    src: 'Tanvir sir L1 p7',
  },
  {
    id: 'c-ce-first',
    topic: T,
    front: 'Who were the **first engineers**?',
    back: '**Irrigators, architects, and military engineers** — usually the same man was expected to be expert at all three. Specialization developed only in the last two or three centuries.',
    src: 'Tanvir sir L1 p13',
  },
  {
    id: 'c-ce-petroski',
    topic: T,
    front: 'What did **Henry Petroski** say about engineering history?',
    back: 'Engineering history is **both history and engineering**: lessons from the behaviour and especially the **failure** of even ancient designs are still relevant, and ignoring the past threatens the continuity of engineering and design judgment.',
    src: 'Tanvir sir L1 p13–14',
  },
  {
    id: 'c-ce-career',
    topic: T,
    front: 'ASCE career preparation: **today** vs **tomorrow** (the diagram)?',
    back: '**Today:** Baccalaureate → Experience (BoK *implicit*) → Exam/License → Professional practice & lifelong learning. **Tomorrow:** Modified baccalaureate → More focused experience + Master’s or ≈30 credits (BoK *explicit*) → Exam/License (possibly more comprehensive) → Practice & lifelong learning **with specialty certification**.',
    src: 'Tanvir sir L1 p4',
  },
  {
    id: 'c-ce-authority',
    topic: T,
    front: 'Attribute **Authority**: on what is it based?',
    back: 'Extensive education in systematic theory highlights the **layperson’s comparative ignorance**; **functional specificity** — like law and medicine, civil engineers are granted authority based on their extensive education.',
    seen: ATTR_SEEN,
    src: 'Tanvir sir L1 p10',
  },
  {
    id: 'c-ce-sanction',
    topic: T,
    front: 'Attribute **Community sanction**: what does it mean in practice?',
    back: '**State-sponsored boards** and **license or registration** — society formally recognises who may practise.',
    seen: ATTR_SEEN,
    src: 'Tanvir sir L1 p10',
  },
  {
    id: 'c-ce-theory',
    topic: T,
    front: 'Attribute **Systematic body of theory**: what does it require?',
    back: 'Skills flow from an **internally consistent system**; a **spirit of rationality** and expansion of theory; the theory is based on **mathematics and natural science**.',
    seen: ATTR_SEEN,
    src: 'Tanvir sir L1 p10',
  },
  {
    id: 'c-ce-materials',
    topic: T,
    front: 'Which ancient civilisation used which structural system, and why?',
    back: 'Styles depended on **locally available materials**. **Mesopotamia** (clay, no stone/wood) → corbel or arch & vault. **Egypt** (clay, stone), **Greece & China** (stone, clay, wood) → post & lintel. **Europe** (abundant wood) → developed the truss.',
    seen: ['2017-18'],
    src: 'Tanvir sir L1 p19',
  },
  {
    id: 'c-ce-time',
    topic: T,
    front: 'Which of the three factors behind ancient engineers’ success is **most important**?',
    back: '**A different perspective of time** — the Ancients seemed to have **infinite patience**.',
    seen: ['2017-18'],
    src: 'Tanvir sir L1 p19',
  },
  {
    id: 'c-ce-bodies-first',
    topic: T,
    front: 'First professional body of civil engineers, and when was ASCE founded?',
    back: '**ICE** (British Institute of Civil Engineers) was chartered in **1818**; **ASCE** was founded in **1852**.',
    src: 'Tanvir sir L1 p8',
  },
  {
    id: 'c-ce-profession-start',
    topic: T,
    front: 'From when does civil engineering date as a **formal profession**?',
    back: 'From the **Industrial Revolution**. Before modern times there was no clear distinction between civil engineering and architecture; in the medieval period masons and carpenters did most building.',
    src: 'Tanvir sir L1 p7, p30',
  },
  {
    id: 'c-ce-asce-quote',
    topic: T,
    front: 'Complete the ASCE line: "Civil engineers build …"',
    back: '"Civil engineers build **the world’s infrastructure**. In doing so, they **shape the history of nations** around the world."',
    src: 'Tanvir sir L1 p31',
  },
  {
    id: 'c-ce-practice',
    topic: T,
    front: 'What is **professional practice**?',
    back: '"Professional Practice is where a student is required to **extend knowledge and skills within a practical environment**." (IA sir’s intro slide — Tanvir sir’s slides give no definition; L1 lists the scope: project, engineer’s role, legal aspects.)',
    src: 'IA sir intro slide; Tanvir sir L1 p2',
  },
  {
    id: 'c-ce-esb',
    topic: T,
    front: 'Which modern wonder was the **first building with 100+ stories**, and which was the tallest free-standing structure 1976–2007?',
    back: '**Empire State Building** (1930–31; tallest structure 1931–1967). **CN Tower**, Toronto (1973–76).',
    src: 'Tanvir sir L1 p20',
  },
]

const answers: PcAnswer[] = [
  {
    id: 'a-ce-define',
    topic: T,
    q: 'Define "Civil Engineers" as per the ASCE Body of Knowledge.',
    seen: DEF_SEEN,
    a: `"**Entrusted by society to create a sustainable world and enhance the global quality of life**, Civil Engineers serve, **competently, collaboratively, and ethically** as:

1. **master planners, designers, constructors**;
2. **stewards of the natural environment and its resources**;
3. **innovators and integrators**;
4. **managers of risk and uncertainty**;
5. **leaders in discussions and decisions shaping public environmental and infrastructure policy**."

— ASCE Body of Knowledge

Some books give the longer ASCE Vision-2025 wording ("… constructors and operators of society’s economic and social engine …"); the class slide uses the version above.`,
    keys: [
      'Entrusted by society',
      'sustainable world',
      'global quality of life',
      'competently, collaboratively, and ethically',
      'master planners, designers, constructors',
      'stewards of the natural environment',
      'innovators and integrators',
      'managers of risk and uncertainty',
      'leaders in discussions and decisions',
      'infrastructure policy',
    ],
    lists: ['l-ce-asce-roles'],
    src: 'Tanvir sir L1 p3',
  },
  {
    id: 'a-ce-attributes',
    topic: T,
    q: 'Describe the five basic attributes of civil engineering as a profession.',
    seen: ATTR_SEEN,
    a: `Professional bodies (ICE 1818, ASCE 1852 …) helped formalize civil engineering as a profession. A profession has **five basic characteristics**, and they define today’s professional civil engineer:

1. **Systematic body of theory** — skills flow from an internally consistent system with a **spirit of rationality** and expansion of theory; the theory is based on **mathematics and natural science**.
2. **Authority** — extensive education highlights the layperson’s comparative ignorance; through **functional specificity**, like law and medicine, civil engineers are granted authority based on their extensive education.
3. **Community sanction** — **state-sponsored boards** and **license or registration**.
4. **Ethical codes** — civil engineers are held to well-documented ethical codes and are expected to be their clients’ **trusted advisors**: ethical (professional), client-professional (impulse to perform maximally), colleague to colleague (cooperative, egalitarian, supportive).
5. **A culture** — providing valuable services to society, behaving appropriately (sounding like a professional, saying "no" gracefully, presentations and meetings) and sharing a **rich history and folklore**; symbols such as argot/jargon and insignia/emblem.`,
    keys: [
      'Systematic body of theory',
      'spirit of rationality',
      'Authority',
      'functional specificity',
      'Community sanction',
      'license or registration',
      'Ethical codes',
      'trusted advisors',
      'A culture',
      'history and folklore',
    ],
    lists: ['l-ce-attributes', 'l-ce-ethics-relations', 'l-ce-culture'],
    src: 'Tanvir sir L1 p9–12',
  },
  {
    id: 'a-ce-outcomes',
    topic: T,
    q: 'What are the necessary outcomes of civil engineering education (ASCE BOK2)? Name the professional ones.',
    seen: ['2015-16', '2011-12'],
    a: `ASCE BOK2 (2008) groups the necessary outcomes of CE education in three columns.

### Professional (9)
1. **Communication**
2. **Public policy**
3. **Business & public administration**
4. **Globalization**
5. **Leadership**
6. **Teamwork**
7. **Attitudes**
8. **Lifelong learning**
9. **Professional & ethical responsibilities**

### Foundational (4)
Mathematics, natural science, humanities, social sciences.

### Technical (11)
Material science, mechanics, experiments, problem recognition & solving, design, sustainability, contemporary issues / historical perspectives, risk & uncertainties, project management, breadth in CE areas, technical specialization.`,
    keys: ['Communication', 'Public policy', 'Business & public administration', 'Globalization', 'Leadership', 'Teamwork', 'Attitudes', 'Lifelong learning', 'Professional & ethical responsibilities'],
    lists: ['l-ce-outcomes-prof', 'l-ce-outcomes-found', 'l-ce-outcomes-tech'],
    src: 'Tanvir sir L1 p5',
  },
  {
    id: 'a-ce-ancient',
    topic: T,
    q: 'Briefly describe the ancient structural systems.',
    seen: ['2021-22', '2017-18'],
    a: `Building styles were **dependent on locally available materials**. Buildings of antiquity used one or a combination of **four devices to support roof or upper stories**:

1. **Corbel**
2. **Post & lintel**
3. **Arch & vault**
4. **Truss**

### Materials decided the system
- **Mesopotamia** had lots of clay but no stone or wood → preferred **corbel or arch & vault**.
- **Egypt** (clay & stone) and **Greece & China** (stone, clay and wood) → favoured **post & lintel**.
- **Europe** had abundant wood → developed the **truss**.

### Three factors behind the success of ancient engineers
1. **Intensive & careful use of existing principles and tools**
2. **Unlimited labor** & the power to organize & command it
3. **A different perspective of time** — perhaps the most important: the Ancients seemed to have **infinite patience**.

Some books list "dome" among ancient systems; the class slide’s four are corbel, post & lintel, arch & vault, truss.`,
    keys: ['locally available materials', 'Corbel', 'Post & lintel', 'Arch & vault', 'Truss', 'Mesopotamia', 'Europe', 'Unlimited labor', 'perspective of time', 'infinite patience'],
    lists: ['l-ce-ancient-devices', 'l-ce-ancient-factors'],
    src: 'Tanvir sir L1 p18–19',
  },
]

export default { lists, cards, answers } satisfies PcTopicContent

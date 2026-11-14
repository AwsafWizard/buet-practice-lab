// pc-comm — communication basics. Source: Noor sir L01–L02 slides (CE22), digest CE301/Claude digests/v2_aan.md;
// Kabirul sir’s note / the 18-batch solve only where marked.
import { createElement as h, type FC, type ReactNode } from 'react'
import type { PcTopicContent } from '../types'

const T = 'pc-comm' as const
const S1 = 'Noor sir L01 (slide)'
const S2 = 'Noor sir L02 (slide)'

// ---------- figure: process of human communication (L01 slide elements), theme tokens only ----------
const ink = 'var(--c-ink)'
const mute = 'var(--c-mute)'
const panel2 = 'var(--c-panel2)'
const aan = 'var(--c-aan)'

const pbox = (x: number, name: string, role: string, key: string): ReactNode =>
  h('g', { key }, [
    h('rect', { key: 'r', x, y: 62, width: 134, height: 52, rx: 6, fill: panel2, stroke: aan, strokeWidth: 1.4 }),
    h('text', { key: 'n', x: x + 67, y: 84, textAnchor: 'middle', fontSize: 12.5, fontWeight: 700, fill: ink }, name),
    h('text', { key: 'd', x: x + 67, y: 101, textAnchor: 'middle', fontSize: 11, fill: mute }, role),
  ])
const parrow = (x1: number, x2: number, key: string): ReactNode =>
  h('line', { key, x1, y1: 88, x2: x2 - 2, y2: 88, stroke: mute, strokeWidth: 1.4, markerEnd: 'url(#pc-comm-arr)' })

const ProcessFig: FC = () =>
  h('svg', { viewBox: '0 0 640 200', width: '100%', role: 'img', 'aria-label': 'Process of human communication: inside a context, sender, message, medium or channel, receiver, and feedback back to the sender' }, [
    h('defs', { key: 'defs' }, h('marker', { id: 'pc-comm-arr', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto' }, h('path', { d: 'M0,0 L10,5 L0,10 z', fill: mute }))),
    h('rect', { key: 'ctx', x: 8, y: 10, width: 624, height: 180, rx: 8, fill: 'none', stroke: mute, strokeWidth: 1.2, strokeDasharray: '6 5' }),
    h('text', { key: 'ctxt', x: 22, y: 34, fontSize: 12.5, fontWeight: 700, fill: ink }, 'Context'),
    pbox(22, 'Sender', '(idea encoder)', 'b1'),
    parrow(156, 176, 'a1'),
    pbox(176, 'Message', '(encoded)', 'b2'),
    parrow(310, 330, 'a2'),
    pbox(330, 'Medium, Channel', '(transmission format)', 'b3'),
    parrow(464, 484, 'a3'),
    pbox(484, 'Receiver', '(decoder)', 'b4'),
    h('path', { key: 'fb', d: 'M551,114 L551,158 L89,158 L89,117', fill: 'none', stroke: aan, strokeWidth: 1.4, markerEnd: 'url(#pc-comm-arr)' }),
    h('text', { key: 'fbt', x: 320, y: 150, textAnchor: 'middle', fontSize: 12, fontWeight: 700, fill: ink }, 'Feedback'),
    h('text', { key: 'fbd', x: 320, y: 176, textAnchor: 'middle', fontSize: 11, fill: mute }, '(reaction of receiver)'),
  ])

export default {
  lists: [
    {
      id: 'l-comm-process',
      topic: T,
      title: 'Elements of the human communication process',
      ask: 'List the elements of the human communication process — in order.',
      ordered: true,
      points: [
        { k: 'Context', alt: ['situation', 'setting'], d: 'The situation in which communication takes place.' },
        { k: 'Sender (idea encoder)', alt: ['sender', 'encoder', 'idea encoder'], d: 'Decides to send a message and encodes the idea.' },
        { k: 'Message (encoded)', alt: ['message', 'encoded message'], d: 'The encoded idea.' },
        { k: 'Medium, Channel (transmission format)', alt: ['channel', 'medium', 'media', 'transmission format'], d: 'The message is communicated via a particular medium or channel.' },
        { k: 'Receiver (decoder)', alt: ['receiver', 'decoder', 'decode'], d: 'Receives the message and tries to figure it out (decode).' },
        { k: 'Feedback (reaction of receiver)', alt: ['feedback', 'reaction', 'response'], d: 'Receiver provides feedback.' },
      ],
      hook: '**C**an **S**ome **M**essages **C**ross **R**ivers **F**ast? — Context, Sender, Message, Channel, Receiver, Feedback.',
      seen: ['2023-24', '2021-22', '2017-18'],
      src: S1,
      note: 'Kabirul sir’s lecture (Nafee bhai’s note) gave it as Decision → Encoding → Media selection → Receiving → Decoding → Feedback. This term’s slide = the 6 above.',
    },
    {
      id: 'l-comm-process-steps',
      topic: T,
      title: 'Process of human communication (the five steps)',
      ask: 'Describe the process of human communication — the five steps on the slide, in order.',
      ordered: true,
      points: [
        { k: 'Someone decides to send a message', alt: ['decides to send', 'decide', 'in a given context'], d: 'In a given context, someone decides to send a message.' },
        { k: 'Message communicated via medium or channel', alt: ['medium', 'channel', 'communicated'], d: 'The message is communicated via particular medium or channel.' },
        { k: 'A receiver receives the message', alt: ['receiver receives', 'receive'] },
        { k: 'Receiver tries to figure it out', alt: ['decode', 'decode the message', 'figure it out'], d: 'Receiver tries to figure it out (decode the message).' },
        { k: 'Receiver provides feedback', alt: ['feedback'] },
      ],
      hook: '**D**ecide → **S**end → **R**eceive → **D**ecode → **F**eedback.',
      seen: ['2023-24', '2017-18'],
      src: `${S1} = what the 18-batch solve writes for “describe the process”`,
      note: 'Also asked 2018-19 Q6(a) and 2010-11 Q1(a) (Rahat’s question list).',
    },
    {
      id: 'l-comm-skills',
      topic: T,
      title: 'Basic communication skills',
      points: [
        { k: 'Listening' },
        { k: 'Speaking', alt: ['talking'] },
        { k: 'Reading' },
        { k: 'Writing' },
      ],
      hook: '**L**isten, **S**peak, **R**ead, **W**rite — the order a child learns them.',
      seen: ['2023-24'],
      src: S1,
      note: 'Slide order. Kabirul sir’s lecture (Nafee bhai’s note) said listening is used most.',
    },
    {
      id: 'l-comm-traits',
      topic: T,
      title: 'Traits of an effective communicator',
      points: [
        { k: 'Perception', alt: ['perceive'], d: 'Anticipates how the receiver will understand and react (explanation, not on slide).' },
        { k: 'Precision', alt: ['precise'], d: 'Creates a meeting of minds — the receiver gets exactly the intended meaning (explanation, not on slide).' },
        { k: 'Credibility', alt: ['credible', 'believable', 'trust'], d: 'The quality of being trusted, believed in, and relied upon; people accept what they say or represent as true, accurate, and valid.' },
        { k: 'Control', d: 'Shapes the response and keeps control of the message and situation (explanation, not on slide).' },
        { k: 'Congeniality', alt: ['congenial', 'friendly', 'likeable'], d: 'The quality of being pleasant, friendly, sociable, and agreeable; easy to get along with. AAN sir (class): first impression.' },
      ],
      hook: '**PP-CCC**: two P’s then three C’s (the C’s run Cr → Co → Cong).',
      seen: ['2023-24'],
      src: `${S1}; AAN sir class note L1`,
      note: 'AAN sir’s order: perception, precision, credibility, control, congeniality. Kabirul sir’s note puts congeniality before control. The slide defines only credibility and congeniality.',
    },
    {
      id: 'l-comm-importance',
      topic: T,
      title: 'Importance and necessity of communication (business)',
      ask: 'Explain the importance and necessity of communication in business (the six slide points).',
      points: [
        { k: 'Essential for teamwork and achieving objectives', alt: ['teamwork', 'team work', 'objectives'], d: 'Essential for teamwork and to achieve the objectives of business organizations.' },
        { k: 'Management directs, coordinates, plans, controls through communication', alt: ['management', 'coordinates', 'plans and controls'], d: 'Management directs, coordinates, plans and controls through communication.' },
        { k: 'Communication methods', alt: ['conferences', 'memos', 'reports', 'meetings'], d: 'Conferences, memos, reports, meetings, interviews, letters, emails, advertising, manuals.' },
        { k: 'Four skills among top five selection criteria', alt: ['employee selection', 'selecting employees', 'top five criteria'], d: 'Four communication skills (writing, speaking, listening and interpersonal communication) among top five criteria in USA for selecting employees.' },
        { k: 'Prime requisite for management or executive position', alt: ['management position', 'executive position', 'prime requisite'], d: 'Prime requisite for person in management or executive position.' },
        { k: 'Executives spend 60–90 % time communicating', alt: ['60-90 %', '60 to 90 percent', 'time communicating'], d: 'Management executives spend 60 %–90 % time communicating (speaking, writing, listening).' },
      ],
      hook: '**T**eam → **M**anagement → **M**ethods → **S**election → **E**xecutive post → **E**xecutive’s time.',
      seen: ['2017-18', '2015-16'],
      src: S1,
      note: 'Kabirul sir’s slides (18-batch solve) also had a survey of time spent communicating: managers 49.4 %, technical workers 40.7 %, clerical staff 29.1 %, social service workers 51.6 %. Not on Noor sir’s slide.',
    },
    {
      id: 'l-comm-global',
      topic: T,
      title: 'Importance and necessity of communication for global business',
      ask: 'Why is communication important and necessary for global business? (four slide points)',
      points: [
        { k: 'Prime requisite for progress in job or career', alt: ['career progress', 'job progress', 'promotion'] },
        { k: 'Encourages businesses to cross national boundaries', alt: ['national boundaries', 'cross national borders', 'international business'] },
        { k: 'Diversifies the work force', alt: ['diverse workforce', 'diversified work force'] },
        { k: 'Understand laws, customs, business practices of many countries', alt: ['laws', 'customs', 'business practices'], d: 'Requires businesspeople to understand the laws, customs, and business practices of many countries.' },
      ],
      seen: ['2017-18', '2015-16'],
      src: S1,
      note: 'The 18-batch solve writes these four inside its importance answer for both 2017-18 and 2015-16.',
    },
    {
      id: 'l-comm-global-qualities',
      topic: T,
      title: 'Communication qualities required for global business',
      points: [
        { k: 'Attitude, honesty, enthusiasm and competence', alt: ['attitude', 'honesty', 'enthusiasm', 'competence'] },
        { k: 'Sound judgment in choosing ideas', alt: ['sound judgment', 'sound judgement'] },
        { k: 'Patience and understanding', alt: ['patience', 'understanding'] },
        { k: 'Integrity' },
        { k: 'Command over language', alt: ['language'] },
        { k: 'Knowledge of communication principles', alt: ['communication principles'] },
        { k: 'Knowledge of cultural conventions, open mind', alt: ['cultural conventions', 'open mind'] },
      ],
      hook: '**A** **S**ound, **P**atient person of **I**ntegrity **C**ommands the language and **K**nows two things: the principles and the cultures.',
      seen: [],
      src: S1,
    },
    {
      id: 'l-comm-professions',
      topic: T,
      title: 'Importance and necessity of communication in professions',
      ask: 'Why is communication important and necessary in professions? (three slide points)',
      points: [
        { k: 'Progress in job influenced by ability to communicate', alt: ['progress in job', 'ability to communicate'], d: 'Progress in job strongly influenced by ability to communicate knowledge, proposals and ideas to others.' },
        { k: 'Primary requirement in many jobs', alt: ['primary requirement', 'customer relations', 'marketing', 'teaching'], d: 'Communication is a primary requirement in jobs such as customer relations, marketing, public relations, teaching.' },
        { k: 'Engineers, scientists need reading, writing, speaking', alt: ['engineers', 'scientists', 'reading, writing and speaking skills'], d: 'Engineers, scientists, researchers, politicians, accountants require reading, writing and speaking skills.' },
      ],
      seen: [],
      src: S1,
    },
    {
      id: 'l-comm-profession-qualities',
      topic: T,
      title: 'Communication qualities required for professions',
      points: [
        { k: 'Ability to communicate', alt: ['communicate'] },
        { k: 'Ambition, drive', alt: ['ambition', 'drive'] },
        { k: 'Education' },
        { k: 'Decision making skills', alt: ['decision making'] },
        { k: 'Self confidence', alt: ['self-confidence', 'confidence'] },
        { k: 'Appearance' },
        { k: 'Working with people', alt: ['work with people'] },
        { k: 'Hard work' },
      ],
      hook: '**A**ble, **A**mbitious, **E**ducated **D**eciders with **S**elf confidence look good (**A**ppearance), **W**ork with people and **W**ork hard.',
      seen: [],
      src: S1,
    },
    {
      id: 'l-comm-poor-effects',
      topic: T,
      title: 'Negative effects of poor communication',
      points: [
        { k: 'Waste and failure', alt: ['waste', 'failure'], d: 'Unclear, incomplete, inaccurate, inconsiderate, long or late communications result in waste and failure.' },
        { k: 'Alienate customer, destroy goodwill', alt: ['alienate customer', 'destroy goodwill', 'goodwill'], d: 'Poor communications alienate customer and destroy goodwill.' },
        { k: 'Loss of life and property', alt: ['loss of life', 'loss of property'], d: 'Poor instructions can result in loss of life and property in fields such as medicine, aviation, construction, mining.' },
      ],
      seen: [],
      src: S1,
    },
    {
      id: 'l-comm-categories',
      topic: T,
      title: 'Broad categories of communication activities of an organisation',
      ask: 'What are the three broad categories of communication (communication activities) in an organisation?',
      points: [
        { k: 'Internal operational', alt: ['internal'], d: 'Horizontal, upward and downward communication inside the organization.' },
        { k: 'External operational', alt: ['external'], d: 'Communication of the organization with public (people and group outside the business): suppliers, service companies, customers, general public.' },
        { k: 'Interpersonal', alt: ['personal', 'informal', 'personal communication'], d: 'Personal (informal): exchange of information and feelings between humans when they engage with each other.' },
      ],
      seen: ['2020-21', '2016-17', '2015-16', '2014-15', '2012-13', '2011-12'],
      src: S1,
      note: 'Slide heading: “Formal Communication Channels — communication activities of an organization can be divided into three broad categories”. The list says “Interpersonal”; its own slide is headed “Personal (Informal)”. Also asked 2018-19 Q6(b), 2009-10 Q1(a), 2008-09 Q2(a) (Rahat’s question list).',
    },
    {
      id: 'l-comm-internal',
      topic: T,
      title: 'Types of internal operational communication (formal channels)',
      points: [
        { k: 'Horizontal', alt: ['horizontal communication', 'lateral'], d: 'Flows from dept to dept, peer to peer, and helps employees do their jobs more efficiently by cooperating.' },
        { k: 'Upward', alt: ['upward communication', 'vertical upward'], d: 'Flow of information (opinions, suggestions, complaints, problems) from lower levels to managers. Helps managers monitor performance, obtain ideas, make decisions.' },
        { k: 'Downward', alt: ['downward communication', 'vertical downward'], d: 'Information, decisions, orders to achieve business objective communicated to lower level. Lets managers direct the activities of employees. Follows formal lines of organization.' },
      ],
      seen: ['2020-21', '2016-17', '2015-16', '2014-15', '2012-13', '2011-12'],
      src: S1,
    },
    {
      id: 'l-comm-external',
      topic: T,
      title: 'External operational communication — the public outside the business',
      ask: 'External operational communication is the communication of the organization with which four publics?',
      points: [
        { k: 'Suppliers' },
        { k: 'Service companies', alt: ['service providers'] },
        { k: 'Customers', alt: ['clients'] },
        { k: 'General public', alt: ['public'] },
      ],
      hook: 'The firm talks to those who **S**ell to it, **S**erve it, **B**uy from it and **W**atch it.',
      seen: ['2016-17', '2015-16', '2014-15', '2012-13', '2011-12'],
      src: S1,
      note: 'Communication of the organization with public (people and group outside the business). Objective: warmth, understanding, positiveness — in communication of business (business etiquette) with its customers.',
    },
    {
      id: 'l-comm-external-objective',
      topic: T,
      title: 'Objective of external operational communication',
      ask: 'What is the objective of external operational communication? (three words)',
      points: [
        { k: 'Warmth' },
        { k: 'Understanding' },
        { k: 'Positiveness', alt: ['positive', 'positivity'] },
      ],
      seen: ['2016-17', '2012-13', '2011-12'],
      src: S1,
      note: 'In communication of business (business etiquette) with its customers.',
    },
    {
      id: 'l-comm-external-methods',
      topic: T,
      title: 'Methods of external operational communication',
      points: [
        { k: 'Brochures', alt: ['brochure'] },
        { k: 'Radio and television messages', alt: ['radio', 'tv', 'television'] },
        { k: 'Telephone call-backs', alt: ['telephone', 'phone', 'call-backs'] },
        { k: 'Follow-up services', alt: ['follow-up', 'follow up'] },
        { k: 'Newspaper and magazine advertising', alt: ['newspaper', 'magazine', 'advertising'] },
        { k: 'Publicity/public speeches', alt: ['publicity', 'public speech', 'public speeches'] },
        { k: 'Tactful replies to comments and criticisms', alt: ['tactful reply', 'tactful replies'] },
        { k: 'Civic-mindedness of management', alt: ['civic-mindedness', 'civic mindedness', 'civic'] },
        { k: 'Courtesy of employees', alt: ['courtesy'] },
        { k: 'Condition of physical plant', alt: ['physical plant', 'condition of plant'] },
      ],
      hook: '**B**ig **R**adios **T**alk **F**irst, **N**ews**P**apers **T**alk later; then three C’s — **C**ivic, **C**ourtesy, **C**ondition.',
      seen: ['2016-17', '2012-13', '2011-12'],
      src: S1,
      note: 'Slide heading: “Method of Communication”. The 18-batch solve wrote all ten for 2016-17 (18 marks) but left them out for 2015-16 and 2014-15, where the categories were only part of the question.',
    },
    {
      id: 'l-comm-personal',
      topic: T,
      title: 'Interpersonal (personal, informal) communication — features',
      ask: 'What are the features of interpersonal (personal, informal) communication? (six slide points)',
      points: [
        { k: 'Follows no hierarchical path', alt: ['no hierarchy', 'no hierarchical path'] },
        { k: 'Part of communication activity of any business', alt: ['part of business', 'part of communication activity'] },
        { k: 'Significant effect on success of business operation', alt: ['affects business', 'success of business'], d: 'Have significant effect on success of business operation.' },
        { k: 'Affects behavior, attitude and motivation of worker', alt: ['behaviour', 'attitude', 'motivation'] },
        { k: 'Problems may result in emotional upset', alt: ['emotional upset', 'mental upset'], d: 'Problems in personal communication may result in emotional upset.' },
        { k: 'Excessive personal communications interfere with work', alt: ['too much hinders work', 'interferes with work', 'excess'] },
      ],
      hook: '**N**o path, yet **P**art of every business: it shapes **S**uccess and the worker’s **B**ehaviour; **P**roblems upset, **E**xcess interferes.',
      seen: ['2016-17', '2015-16', '2014-15', '2012-13', '2011-12'],
      src: S1,
      note: 'Slide: “Exchange of information and feelings between humans when they engage with each other.”',
    },
    {
      id: 'l-comm-nonverbal',
      topic: T,
      title: 'Main elements of non-verbal communication',
      points: [
        { k: 'Appearance', d: 'Personal appearance; appearance of surrounding — affect receivers’ attitude towards verbal message even before hearing or reading the message.' },
        { k: 'Body language', alt: ['kinesics'], d: 'Facial expressions; gesture and posture; voice and sounds — reveal to receiver hidden emotions of sender.' },
        { k: 'Silence, time and space', alt: ['silence', 'time', 'space', 'proxemics'], d: 'Silence; time delays between message and receivers’ response; space between sender and receiver — may cause hard feelings, negative attitude, loss of business.' },
      ],
      seen: ['2022-23', '2021-22', '2017-18', '2016-17'],
      src: S2,
    },
    {
      id: 'l-comm-body-language',
      topic: T,
      title: 'Elements of body language',
      points: [
        { k: 'Facial expressions', alt: ['facial expression', 'face', 'eye contact'] },
        { k: 'Gesture and posture', alt: ['gesture', 'posture'] },
        { k: 'Voice and sounds', alt: ['voice', 'sound', 'tone'] },
      ],
      seen: ['2021-22'],
      src: S2,
      note: 'Reveal to receiver hidden emotions of sender. Kabirul sir’s slides (18-batch solve, 2016-17) also had “Smell and Touch” — not on this term’s slide.',
    },
    {
      id: 'l-comm-barriers',
      topic: T,
      title: 'Major problems (barriers) in communication',
      ask: 'Why do problems in communication occur? List the major problems.',
      points: [
        { k: 'Differences in convention of meaning', alt: ['convention of meaning', 'conventions of meaning', 'meaning of words'], d: 'Miscommunicated instructions, denotations, connotations, euphemisms.' },
        { k: 'Differences in perceptions of reality', alt: ['perception of reality', 'perceptions of reality', 'perception'], d: 'Abstractions (incl. slanted abstract), inferring.' },
        { k: 'Differences in values, attitudes and opinions', alt: ['values, attitudes and opinions', 'values', 'attitudes', 'opinions'], d: 'Favorable or unfavorable information, inadequate or incorrect information, closed minds, sender’s attitude, circumstances affecting attitudes, opinions.' },
      ],
      hook: '**M**eaning, **P**erception, **V**alues — “**M**y **P**oint of **V**iew”.',
      seen: ['2022-23', '2017-18', '2016-17'],
      src: `${S2}; sub-items of 3 from Kabirul sir’s slide (18-batch solve)`,
    },
    {
      id: 'l-comm-meaning-problems',
      topic: T,
      title: 'Differences in convention of meaning — sub-categories',
      ask: 'What are the sub-categories of differences in convention of meaning?',
      points: [
        { k: 'Miscommunicated instructions', alt: ['bypassing', 'miscommunication', 'miscommunicated instruction'], d: 'Sender and receiver attribute different meaning to same word or use different words to convey same meaning (“biweekly”). Ask questions and clarify.' },
        { k: 'Denotations', alt: ['denotation', 'dictionary meaning'], d: 'Dictionary meaning of word; informs without indicating negative or positive qualities (heart, snake).' },
        { k: 'Connotations', alt: ['connotation'], d: 'Meaning of word implies qualitative judgement and personal reactions (scholar, bookworm, feminist, fanatic, conservative).' },
        { k: 'Euphemisms', alt: ['euphemism'], d: 'A mild or indirect word or expression substituted for one considered to be too harsh or blunt (“You are fired” → “We are letting you go”).' },
      ],
      hook: '**M**y **D**og **C**hews **E**verything — Miscommunicated instructions, Denotations, Connotations, Euphemisms.',
      seen: ['2022-23', '2017-18', '2016-17', '2011-12'],
      src: S2,
    },
    {
      id: 'l-comm-perception-problems',
      topic: T,
      title: 'Differences in perceptions of reality — sub-categories',
      ask: 'What are the sub-categories of differences in perceptions of reality?',
      points: [
        { k: 'Abstractions', alt: ['abstracting', 'abstraction', 'slanted abstract'], d: 'Focusing on some details and omitting others; when facts are selected to distort reality: slanted abstract.' },
        { k: 'Inferring', alt: ['inference', 'assumption'], d: 'Conclusions made from evidence, premise.' },
      ],
      seen: ['2022-23', '2017-18', '2016-17'],
      src: S2,
      note: 'A slanted abstract is a kind of abstraction, not a separate sub-category.',
    },
    {
      id: 'l-comm-value-problems',
      topic: T,
      title: 'Sub-categories of values, attitudes and opinions',
      points: [
        { k: 'Favorable or unfavorable information', alt: ['favourable', 'favorable', 'unfavourable information', 'favourable or unfavourable information'] },
        { k: 'Inadequate or incorrect information', alt: ['inadequate information', 'incorrect information', 'adequate or inadequate information'] },
        { k: 'Closed minds', alt: ['closed mind'] },
        { k: 'Sender’s attitude', alt: ["sender's attitude", 'sender attitude', "sender's credibility", 'credibility'] },
        { k: 'Circumstances affecting attitudes, opinions', alt: ['circumstances'] },
      ],
      hook: 'Is the news **good**, is it **correct**, is the reader’s mind **open**, how does the **sender feel**, and is it the **right moment**?',
      seen: ['2022-23', '2017-18', '2011-12'],
      src: 'Kabirul sir slide (via the 18-batch solve); Noor sir’s slide shows the heading only',
    },
    {
      id: 'l-comm-perceptual-interference',
      topic: T,
      title: 'Perceptual interference',
      ask: 'Name the nine sources of perceptual interference.',
      points: [
        { k: 'Language' },
        { k: 'Culture' },
        { k: 'Background' },
        { k: 'Age' },
        { k: 'Education' },
        { k: 'Social status', alt: ['status'] },
        { k: 'Economic position', alt: ['economic status', 'economic'] },
        { k: 'Religion' },
        { k: 'Life experience', alt: ['experience'] },
      ],
      hook: '**L**azy **C**ats **B**ite **A**nd **E**at **S**mall **E**els, **R**arely **L**eaving.',
      seen: [],
      src: `${S2} (new on this term’s slides)`,
    },
    {
      id: 'l-comm-distractions',
      topic: T,
      title: 'Communication distractions',
      points: [
        { k: 'Physical distractions', alt: ['physical', 'lighting', 'discomfort'], d: 'Lighting, discomfort, bad connections, illegible copy.' },
        { k: 'Poor listening', alt: ['listening'] },
        { k: 'Emotions', alt: ['emotion'] },
        { k: 'Information overload', alt: ['overload'] },
      ],
      seen: [],
      src: `${S2} (new on this term’s slides)`,
    },
    {
      id: 'l-comm-listening',
      topic: T,
      title: 'Listening activities to avoid poor listening',
      ordered: true,
      points: [
        { k: 'Receiving', alt: ['receive'] },
        { k: 'Interpreting', alt: ['interpret'] },
        { k: 'Remembering', alt: ['remember'] },
        { k: 'Evaluating', alt: ['evaluate'] },
        { k: 'Responding', alt: ['respond'] },
      ],
      hook: '**R**eally **I**nterested **R**eceivers **E**valuate, then **R**espond.',
      seen: [],
      src: `${S2} (new on this term’s slides)`,
    },
  ],

  cards: [
    { id: 'c-comm-define', topic: T, front: 'Define **communication** (slide wording).', back: 'Communication is a **two-way process of sending and receiving verbal and non-verbal messages** — a two-way process of exchanging ideas, information, or intelligence. It is effective when it achieves the **desired reaction or response of the receiver**. AAN sir (class): not necessarily verbal.', seen: ['2023-24', '2017-18', '2015-16'], src: `${S1}; AAN sir class note` },
    { id: 'c-comm-lifeblood', topic: T, front: 'Complete the slide line: “Communication is the ___ of every organization.”', back: '**Lifeblood.** Organizations manage and grow by making decisions, rules, proposals, contracts, agreements by exchanging information, ideas and plans.', src: S1 },
    { id: 'c-comm-decoder', topic: T, front: 'AAN sir: what is the **decoder**, and what causes miscommunication at that end?', back: 'The decoder is the receiving side that takes in the information. When the **speed of delivery and of receiving don’t sync**, it **causes miscommunication**.', src: 'AAN sir L1' },
    { id: 'c-comm-trait', topic: T, front: 'What is a **trait** (as in “traits of an effective communicator”)?', back: 'A trait is a **specific, distinguishing quality or characteristic** of a person, animal, or thing. It is a feature that helps define what makes someone or something unique.', src: S1 },
    { id: 'c-comm-exec-time', topic: T, front: 'How much of a management executive’s time goes on communication?', back: 'Management executives spend **60 %–90 %** of their time communicating (speaking, writing, listening).', src: S1 },
    { id: 'c-comm-methods', topic: T, front: 'Name the **communication methods** listed on the importance slide.', back: 'Conferences, memos, reports, meetings, interviews, letters, emails, advertising, manuals.', src: S1 },
    { id: 'c-comm-upward', topic: T, front: 'What flows **upward** in an organisation, and what is it for?', back: 'Flow of information (**opinions, suggestions, complaints, problems**) from lower levels to managers. Helps managers **monitor performance, obtain ideas, make decisions**.', seen: ['2020-21', '2011-12'], src: S1 },
    { id: 'c-comm-downward', topic: T, front: 'What flows **downward** in an organisation?', back: '**Information, decisions, orders** to achieve business objective communicated to lower level. Lets managers **direct the activities of employees**. Follows **formal lines of organization**.', seen: ['2020-21', '2011-12'], src: S1 },
    { id: 'c-comm-external-aim', topic: T, front: 'The objective of external operational communication (warmth, understanding, positiveness) applies to communication with whom?', back: 'In communication of business (**business etiquette**) with its **customers**.', src: S1 },
    { id: 'c-comm-barrier-def', topic: T, front: 'What is defined as a **problem and barrier to communication**?', back: 'A **communication barrier (problem or noise)** is any **interference in the communication process** that **distorts or obscures the sender’s meaning**.', seen: ['2022-23', '2017-18'], src: S2 },
    { id: 'c-comm-bypassing', topic: T, front: 'What are **miscommunicated instructions**?', back: 'Sender and receiver **attribute different meaning to the same word** or use different words to convey the same meaning. E.g. “**Biweekly**” — manager means twice a week, employee means every two weeks. Cure: **ask questions and clarify**.', seen: ['2011-12'], src: S2 },
    { id: 'c-comm-abstracting', topic: T, front: 'What is **abstracting** (abstraction)?', back: '**Focusing on some details and omitting others.** Facts pertinent to problem are selected due to **limitations of time, space, purpose** — necessary and desirable. When facts are selected to distort reality or support one’s own view of reality: **slanted abstract** (purpose: to deceive, mislead, miscommunicate).', seen: ['2022-23', '2020-21', '2017-18', '2016-17', '2014-15', '2012-13', '2011-12'], src: `${S2}; “necessary and desirable” from the 18-batch solve` },
    { id: 'c-comm-inferring', topic: T, front: 'What is **inferring**?', back: '**Conclusions made from evidence, premise.** Assumptions made and conclusions drawn, as not always possible to immediately verify evidence. **Necessary** for solving problems, making decisions, planning. **May be incorrect or unreliable**, particularly if decision based on guesswork rather than factual data. E.g. coworker arrives 20 minutes late, soaking wet, with a broken umbrella → a rainstorm delayed them.', seen: ['2016-17', '2014-15', '2012-13', '2011-12'], src: S2 },
    { id: 'c-comm-denotation', topic: T, front: 'What is **denotation**?', back: '**Dictionary meaning of word.** Informs without indicating negative or positive qualities. Will not miscommunicate if sender and receiver have similar understanding of context in which word is used. E.g. **heart, snake**.', seen: ['2022-23', '2014-15', '2012-13'], src: S2 },
    { id: 'c-comm-connotation', topic: T, front: 'What is **connotation**?', back: 'Meaning of word implies **qualitative judgement and personal reactions** (scholar, bookworm, feminist, fanatic, conservative). Some words have positive connotation in one context, negative in another. Word meaning affected by communicator’s **background, experience, interests**.', seen: ['2014-15', '2012-13'], src: S2 },
    { id: 'c-comm-euphemism', topic: T, front: 'What is a **euphemism**?', back: 'A **mild or indirect word or expression substituted for one considered to be too harsh or blunt** when referring to something unpleasant or embarrassing. “You are fired” → “We are letting you go”.', src: S2 },
    { id: 'c-comm-verbal-55-38-7', topic: T, front: '2017-18 asked the “three main elements of **verbal** communication”. What did the 18-batch solve write?', back: '**Body language**, **voice tonality**, **words**: 55 percent of impact is determined by body language (postures, gestures, eye contact), 38 percent by the tone of voice, 7 percent by the words used. Not on the slides — the slides have only the non-verbal three; write those, and mention this.', seen: ['2017-18'], src: '18-batch solve (Shafi); not on slides' },
    { id: 'c-comm-appearance', topic: T, front: 'Why does **appearance** count as non-verbal communication?', back: '**Personal appearance** and **appearance of surrounding** affect receivers’ attitude towards verbal message **even before hearing or reading the message**.', src: S2 },
    { id: 'c-comm-intercultural', topic: T, front: 'Define **intercultural communication**.', back: 'The process of sending and receiving messages between people whose cultural backgrounds lead them to **interpret verbal and nonverbal signs differently**.', src: S2 },
    { id: 'c-comm-culture', topic: T, front: 'Define **culture**.', back: 'A **shared system of symbols, beliefs, attitudes, values, expectations, and behaviors**.', src: S2 },
    { id: 'c-comm-subculture', topic: T, front: 'What is a **subculture**?', back: 'Distinct groups that exist within a major culture.', src: S2 },
    { id: 'c-comm-cultural-context', topic: T, front: 'What is **cultural context**?', back: 'The pattern of physical cues, environmental stimuli, and implicit understanding that convey meaning between two members of the same culture.', src: S2 },
    { id: 'c-comm-context', topic: T, front: '**Low-context** vs **high-context** culture?', back: '**High-context** (Japanese, Chinese, Arab, Greek, Mexican, Spanish): rely less on verbal communication, more on nonverbal actions and environmental setting; less emphasis on written word, **personal pledges more important than contracts**, more flexibility with the law. **Low-context** (German, Scandinavian, North American, English, French): rely more on verbal communication; the written word, written agreements as binding, strict adherence to the law.', src: S2 },
    { id: 'c-comm-ethnocentrism', topic: T, front: '**Ethnocentrism** vs **stereotyping**?', back: '**Ethnocentrism** is the belief that one’s own cultural background is superior. **Stereotyping** is predicting individual behavior on the basis of membership in a group or class.', src: S2 },
  ],

  answers: [
    {
      id: 'a-comm-definition',
      topic: T,
      q: 'Define communication.',
      seen: ['2023-24', '2017-18', '2015-16'],
      a: `- Communication is a **two-way process of sending and receiving verbal and non-verbal messages**.
- **Two-way process of exchanging ideas, information, or intelligence.**
- Communication is effective when it achieves the **desired reaction or response of the receiver**.
- Communication is the **lifeblood of every organization**.
- Organizations manage and grow by making decisions, rules, proposals, contracts, agreements by **exchanging information, ideas and plans**.

AAN sir (class): communication is **not necessarily verbal**.`,
      keys: ['two-way process of sending and receiving', 'verbal and non-verbal messages', 'exchanging ideas, information, or intelligence', 'desired reaction or response', 'lifeblood of every organization', 'not necessarily verbal'],
      src: `${S1}; AAN sir class note. The 18-batch solve writes only the first line when the definition is one part of a longer question.`,
    },
    {
      id: 'a-comm-process',
      topic: T,
      q: 'Describe the process (elements) of human communication.',
      seen: ['2023-24', '2021-22', '2017-18'],
      a: `**Communication is the process of sending and receiving messages.**

### The process
1. In a given context, someone decides to send a message.
2. The message is communicated via a particular medium or channel.
3. A receiver receives the message.
4. Receiver tries to figure it out (decode the message).
5. Receiver provides feedback.

### Elements of the human communication process
1. **Context** — the situation in which communication takes place.
2. **Sender (idea encoder)** — decides to send a message and encodes the idea.
3. **Message (encoded)** — the encoded idea.
4. **Medium, Channel (transmission format)** — the message is communicated via a particular medium or channel.
5. **Receiver (decoder)** — receives the message and tries to figure it out (decode).
6. **Feedback (reaction of receiver)** — the receiver provides feedback.

AAN sir (class): when the speed of delivery and of receiving don’t sync, it causes **miscommunication**.

*Kabirul sir’s lecture (Nafee bhai’s note) gave the steps as Decision → Encoding → Media selection → Receiving → Decoding → Feedback.*`,
      keys: ['process of sending and receiving messages', 'Context', 'Sender (idea encoder)', 'Message (encoded)', 'Medium, Channel', 'Receiver (decoder)', 'Feedback', 'miscommunication'],
      lists: ['l-comm-process-steps', 'l-comm-process'],
      src: `${S1}: the five steps (what the 18-batch solve writes for “describe the process”) and the six elements; one-line descriptions of the elements are explanations; diagram as Rahat’s note draws it (“always draw the diagram”). For “list the elements and describe” (2021-22) lead with the six elements.`,
      Fig: ProcessFig,
    },
    {
      id: 'a-comm-skills-traits',
      topic: T,
      q: 'Name the basic communication skills and the traits of an effective communicator.',
      seen: ['2023-24'],
      a: `### Basic communication skills
1. **Listening**
2. **Speaking**
3. **Reading**
4. **Writing**

### Traits of an effective communicator
1. **Perception**
2. **Precision**
3. **Credibility**
4. **Control**
5. **Congeniality**

The question says name without describing. If one line is wanted: **credibility** is the quality of being trusted, believed in, and relied upon; **congeniality** is the quality of being pleasant, friendly, sociable, and agreeable (AAN sir: first impression).`,
      keys: ['Listening', 'Speaking', 'Reading', 'Writing', 'Perception', 'Precision', 'Credibility', 'Control', 'Congeniality'],
      lists: ['l-comm-skills', 'l-comm-traits'],
      src: `${S1}; AAN sir class note`,
    },
    {
      id: 'a-comm-importance',
      topic: T,
      q: 'Why is communication important? Explain the importance and necessity of communication in business.',
      seen: ['2017-18', '2015-16'],
      a: `The importance and necessity of communication are explained below:

### In business
1. **Teamwork and objectives** — essential for teamwork and to achieve the objectives of business organizations.
2. **Management** — management directs, coordinates, plans and controls through communication.
3. **Communication methods** — conferences, memos, reports, meetings, interviews, letters, emails, advertising, manuals.
4. **Selecting employees** — four communication skills (writing, speaking, listening and interpersonal communication) are among the top five criteria in the USA for selecting employees.
5. **Management or executive position** — communication is a prime requisite for a person in a management or executive position.
6. **Executives’ time** — management executives spend 60 %–90 % of their time communicating (speaking, writing, listening).

### For global business
1. **Prime requisite for progress in job or career.**
2. Encourages businesses to **cross national boundaries**.
3. **Diversifies the work force.**
4. Requires businesspeople to understand the **laws, customs, and business practices** of many countries.

### Negative effects of poor communication
- Unclear, incomplete, inaccurate, inconsiderate, long or late communications result in **waste and failure**.
- Poor communications **alienate customer and destroy goodwill**.
- Poor instructions can result in **loss of life and property** in fields such as medicine, aviation, construction, mining.

From the points discussed above, we can conclude that communication is the **prime requirement for an organization** to function.

*Kabirul sir’s slides (18-batch solve) also gave a survey of time spent communicating: managers 49.4 %, technical workers 40.7 %, clerical staff 29.1 %, social service workers 51.6 % — not on Noor sir’s slide.*`,
      keys: ['Teamwork and objectives', 'directs, coordinates, plans and controls', 'Communication methods', 'top five criteria', 'prime requisite', '60 %–90 %', 'cross national boundaries', 'Diversifies the work force', 'laws, customs, and business practices', 'waste and failure', 'loss of life and property', 'prime requirement for an organization'],
      lists: ['l-comm-importance', 'l-comm-global', 'l-comm-poor-effects'],
      src: `${S1}; shape and closing line as the 18-batch solve (2017-18, 2015-16), which lists the six business points and the four global points as one numbered list`,
    },
    {
      id: 'a-comm-categories',
      topic: T,
      q: 'Describe the three broad categories of communication activities (formal communication channels) of an organisation and the types of internal operational communication.',
      seen: ['2020-21', '2016-17', '2015-16', '2014-15', '2012-13', '2011-12'],
      a: `Communication activities of an organization can be divided into **three broad categories** (formal communication channels):

### 1. Internal operational
1. **Horizontal communication** — flows from dept to dept, peer to peer, and helps employees do their jobs more efficiently by cooperating. E.g. the design team coordinates with the procurement team.
2. **Upward communication** — flow of information (opinions, suggestions, complaints, problems) from lower levels to managers. Helps managers monitor performance, obtain ideas, make decisions. E.g. a site engineer’s daily progress report to the project manager.
3. **Downward communication** — information, decisions, orders to achieve business objective communicated to lower level. Lets managers direct the activities of employees. Follows formal lines of organization. E.g. the project manager issues a work schedule to site engineers.

### 2. External operational
Communication of the organization with **public (people and group outside the business)**:
- Suppliers
- Service companies
- Customers
- General public

**Objective:** warmth, understanding, positiveness — in communication of business (business etiquette) with its customers.

**Method of communication:** brochures; radio and television messages; telephone call-backs; follow-up services; newspaper and magazine advertising; publicity/public speeches; tactful replies to comments and criticisms; civic-mindedness of management; courtesy of employees; condition of physical plant.

### 3. Interpersonal (personal, informal)
Exchange of information and feelings between humans when they engage with each other:
- Follows **no hierarchical path**
- Part of communication activity of any business
- Have significant effect on success of business operation
- Affects **behavior, attitude and motivation** of worker
- Problems in personal communication may result in **emotional upset**
- Excessive personal communications interfere with work`,
      keys: ['three broad categories', 'Internal operational', 'Horizontal', 'Upward', 'Downward', 'External operational', 'Suppliers', 'Service companies', 'General public', 'warmth, understanding, positiveness', 'brochures', 'Interpersonal', 'no hierarchical path', 'emotional upset'],
      lists: ['l-comm-categories', 'l-comm-internal', 'l-comm-external', 'l-comm-external-objective', 'l-comm-external-methods', 'l-comm-personal'],
      src: `${S1} = 18-batch solve (2016-17, 2015-16, 2014-15); the three “E.g.” examples are from Rahat’s note, not the slide`,
    },
    {
      id: 'a-comm-nonverbal',
      topic: T,
      q: 'Describe the three main elements (types) of non-verbal communication and the elements of body language.',
      seen: ['2022-23', '2021-22', '2017-18', '2016-17'],
      a: `Non-verbal communication has three main elements:

### 1. Appearance
- **Personal appearance**
- **Appearance of surrounding**

Affect receivers’ attitude towards verbal message even before hearing or reading the message.

### 2. Body language
- **Facial expressions**
- **Gesture and posture**
- **Voice and sounds**

Reveal to receiver **hidden emotions** of sender.

### 3. Silence, time and space
- **Silence**
- **Time delays** between message and receivers’ response
- **Space** between sender and receiver

May cause hard feelings, negative attitude, **loss of business**.

*Kabirul sir’s slides (18-batch solve, 2016-17) also had “smell and touch” under body language; this term’s slide has three.*`,
      keys: ['Appearance', 'Personal appearance', 'Appearance of surrounding', 'Body language', 'Facial expressions', 'Gesture and posture', 'Voice and sounds', 'hidden emotions', 'Silence, time and space', 'Time delays', 'loss of business'],
      lists: ['l-comm-nonverbal', 'l-comm-body-language'],
      src: S2,
    },
    {
      id: 'a-comm-barriers',
      topic: T,
      q: 'What is a problem and barrier to communication? Why do problems occur? List the major problems with sub-categories.',
      seen: ['2022-23', '2017-18', '2016-17'],
      a: `A **communication barrier (problem or noise)** is any **interference in the communication process** that **distorts or obscures the sender’s meaning**. It can be:

### 1. Differences in convention of meaning
- **Miscommunicated instructions** — sender and receiver attribute different meaning to same word or use different words to convey same meaning (“biweekly”).
- **Denotations** — dictionary meaning of word.
- **Connotations** — meaning of word implies qualitative judgement and personal reactions.
- **Euphemisms** — a mild or indirect word substituted for one too harsh or blunt.

### 2. Differences in perceptions of reality
- **Abstractions** — focusing on some details and omitting others; a **slanted abstract** when facts are selected to distort reality.
- **Inferring** — conclusions made from evidence, premise.

### 3. Differences in values, attitudes and opinions
- Favorable or unfavorable information
- Inadequate or incorrect information
- **Closed minds**
- **Sender’s attitude**
- Circumstances affecting attitudes, opinions

### Other barriers on the slides
- **Perceptual interference** — language, culture, background, age, education, social status, economic position, religion, life experience.
- **Communication distractions** — physical distractions (lighting, discomfort, bad connections, illegible copy), poor listening, emotions, information overload.
- **Listening activities to avoid poor listening** — receiving, interpreting, remembering, evaluating, responding.`,
      keys: ['communication barrier (problem or noise)', 'interference in the communication process', 'distorts or obscures the sender’s meaning', 'Differences in convention of meaning', 'Differences in perceptions of reality', 'Differences in values, attitudes and opinions', 'Miscommunicated instructions', 'Denotations', 'Connotations', 'Euphemisms', 'Abstractions', 'Inferring', 'Closed minds', 'Sender’s attitude', 'Perceptual interference'],
      lists: ['l-comm-barriers', 'l-comm-meaning-problems', 'l-comm-perception-problems', 'l-comm-value-problems', 'l-comm-perceptual-interference', 'l-comm-distractions', 'l-comm-listening'],
      src: `${S2}; sub-items of 3 from Kabirul sir’s slide (18-batch solve, 2017-18 and 2016-17). “Why do problems occur” = the three differences (the solve: “problems occur due to the differences in …”).`,
    },
    {
      id: 'a-comm-abstracting-inferring',
      topic: T,
      q: 'Briefly explain abstracting (abstraction) and inferring.',
      seen: ['2022-23', '2017-18', '2016-17', '2014-15', '2012-13', '2011-12'],
      a: `Both are **differences in perceptions of reality**.

### Abstracting (abstraction)
- **Focusing on some details and omitting others.**
- Facts pertinent to problem are selected due to **limitations of time, space, purpose** — so abstraction is necessary and desirable.
- When facts are selected to distort reality or support one’s own view of reality: **slanted abstract**.
- Purpose of a slanted abstract: to **deceive, mislead, miscommunicate**.
- Example (slide): the car has a brand-new engine and gets great gas mileage, but the AC is completely broken and the transmission is starting to fail. Honest: “I’m selling my car. It has a brand-new engine and gets great gas mileage, but it will need transmission and AC work.” Mentioning only the engine and mileage is a slanted abstract.

### Inferring
- **Conclusions made from evidence, premise.**
- Assumptions made and conclusions drawn, as it is not always possible to **immediately verify evidence**.
- **Necessary** for solving problems, making decisions, planning.
- **May be incorrect or unreliable**, particularly if decision based on **guesswork rather than factual data**.
- Example (slide): your coworker walks into the office 20 minutes late, completely soaking wet, holding a broken umbrella — you conclude they got caught in a severe rainstorm, which delayed their commute.`,
      keys: ['perceptions of reality', 'Focusing on some details and omitting others', 'limitations of time, space, purpose', 'necessary and desirable', 'slanted abstract', 'deceive, mislead, miscommunicate', 'Conclusions made from evidence, premise', 'immediately verify evidence', 'guesswork rather than factual data', 'soaking wet'],
      lists: ['l-comm-perception-problems'],
      src: `${S2}; “necessary and desirable” from the 18-batch solve; “mentioning only the engine and mileage” is the reading in Rahat’s note`,
    },
    {
      id: 'a-comm-denotation-connotation',
      topic: T,
      q: 'Explain denotation and connotation.',
      seen: ['2022-23', '2014-15', '2012-13'],
      a: `Both are **differences in convention of meaning**.

### Denotation
- **Dictionary meaning of word.**
- Informs **without indicating negative or positive qualities**.
- Will not miscommunicate if sender and receiver have similar understanding of the **context** in which the word is used.
- Examples (slide): heart, snake.

### Connotation
- Meaning of word implies **qualitative judgement and personal reactions** — scholar, bookworm, feminist, fanatic, conservative.
- Some words have **positive connotation in one context**, negative in another.
- Word meaning affected by communicator’s **background, experience, interests**.

| Denotation | Connotation |
|---|---|
| Dictionary (literal) meaning | Implied / emotional meaning |
| Neutral: no positive or negative quality | Carries judgement: positive or negative |
| Same for most people | Changes with background, experience, interests |
| Rarely miscommunicates | Can easily miscommunicate |

### Euphemism (same group)
A **mild or indirect word** or expression substituted for one considered to be too harsh or blunt when referring to something unpleasant or embarrassing: “You are fired” → “We are letting you go”.

*Kabirul sir’s slide (18-batch solve) ended connotation with: words to be chosen carefully to convey desired meaning.*`,
      keys: ['convention of meaning', 'Dictionary meaning of word', 'without indicating negative or positive qualities', 'heart, snake', 'qualitative judgement and personal reactions', 'positive connotation in one context', 'background, experience, interests', 'mild or indirect word'],
      lists: ['l-comm-meaning-problems'],
      src: `${S2}; comparison table from Rahat’s note`,
    },
    {
      id: 'a-comm-bypassing-slanting',
      topic: T,
      q: 'Briefly explain (i) miscommunicated instructions, (ii) sender’s attitude.',
      seen: ['2011-12'],
      a: `### (i) Miscommunicated instructions
A barrier under **differences in convention of meaning**: sender and receiver **attribute different meaning to the same word** or use different words to convey the same meaning. E.g. “**Biweekly**” — the manager means twice a week, the employee means every two weeks. Cure: **ask questions and clarify**.

### (ii) Sender’s attitude
A barrier under **differences in values, attitudes and opinions**. The sender’s attitude affects how the message is **encoded** (and the receiver’s attitude how it is decoded):
- a negative, angry or superior attitude shows in words and tone and makes the receiver **defensive**;
- a biased attitude makes the sender select only facts that suit him (**slanted abstract**);
- emotions block clear thinking and listening;
- a positive, respectful **“you attitude”** makes the receiver open and co-operative.`,
      keys: ['Miscommunicated instructions', 'attribute different meaning to the same word', 'Biweekly', 'ask questions and clarify', 'Sender’s attitude', 'values, attitudes and opinions', 'encoded', 'slanted abstract'],
      lists: ['l-comm-meaning-problems', 'l-comm-value-problems'],
      src: `(i) ${S2}; (ii) Kabirul sir slide list (via the 18-batch solve) + Rahat’s note. The same pair was also asked 2010-11 Q1(b) and 2009-10 Q1(b) (Rahat’s question list).`,
    },
    {
      id: 'a-comm-intercultural',
      topic: T,
      q: 'What is intercultural communication? Explain cultural context (high- and low-context cultures) and distinguish ethnocentrism from stereotyping.',
      seen: [],
      a: `### Intercultural communication
The process of sending and receiving messages between people whose cultural backgrounds lead them to **interpret verbal and nonverbal signs differently**.
- **Culture**: a shared system of symbols, beliefs, attitudes, values, expectations, and behaviors.
- **Subculture**: distinct groups that exist within a major culture.

### Cultural context
The pattern of physical cues, environmental stimuli, and implicit understanding that convey meaning between two members of the same culture.

| | High-context cultures | Low-context cultures |
|---|---|---|
| Examples | Japanese, Chinese, Arab, Greek, Mexican, Spanish | German, Scandinavian, North American, English, French |
| Rely on | Less on verbal communication, more on the context of nonverbal actions and environmental setting | More on verbal communication, less on circumstances and cues |
| Values | Less emphasis on written word; personal pledges more important than contracts; more flexibility with the law | The written word; written agreements as binding; strict adherence to the law |

### Ethnocentrism vs stereotyping
- **Ethnocentrism** is the belief that one’s own cultural background is superior.
- **Stereotyping** is predicting individual behavior on the basis of membership in a group or class.`,
      keys: ['interpret verbal and nonverbal signs differently', 'shared system of symbols', 'Subculture', 'Cultural context', 'High-context', 'Low-context', 'personal pledges more important than contracts', 'Ethnocentrism', 'Stereotyping'],
      src: `${S2}; not asked yet — new on this term’s slides (Rahat’s note marks it new)`,
    },
    {
      id: 'a-comm-favourable-info',
      topic: T,
      q: 'How should one communicate favorable or unfavorable information?',
      seen: [],
      a: `1. **Favorable information — direct or deductive approach** (when you think the receiver will have a favorable or neutral reaction): begin with the main ideas or best news; after the opening, include all necessary explanatory details; end with an appropriate friendly closing.
2. **Unfavorable information — indirect or inductive approach** (bad news): used to deny requests and announce unfavorable or negative information; difficult to prepare as the reader may react negatively.
3. **Completeness**: provide unfavorable information **honestly but tactfully**; **admit unavailable information** frankly and openly.
4. **Periodic report**: in a USA company a periodic report is expected to be **half a page** if the news is favorable; for unfavorable news the report may be one page, which should include reasons for the unfavorable situation and the way it was being handled.

*Rahat’s note adds for bad news: give the explanation first, the bad news tactfully, and end with goodwill — not on the slide.*`,
      keys: ['direct or deductive', 'indirect or inductive', 'honestly but tactfully', 'admit unavailable information', 'half a page'],
      lists: ['l-comm-value-problems'],
      src: '2010-11 Q1(b)(i) per Rahat’s question list (paper not in our set, not checked against a scan); points from Noor sir L08 (direct / indirect approach), L07 (completeness) and L06 (periodic report) slides',
    },
  ],
} satisfies PcTopicContent

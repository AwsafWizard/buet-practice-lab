import type { RcTopicId, SmTopicId, TopicId } from '../store'

const P: Record<TopicId | RcTopicId | SmTopicId, string> = {
  frames: 'M4 19 V7 H20 V19 M2 19 h4 M18 19 h4',
  truss: 'M3 18 L8 8 L13 18 L18 8 L21 18 Z M8 8 H18 M3 18 H21',
  ild: 'M3 14 L10 6 L21 14 M3 14 H21',
  floor: 'M3 8 H21 M5 8 V11 M10 8 V11 M14 8 V11 M19 8 V11 M3 11 H21 M3 16 L12 11 L21 16',
  wheel: 'M3 15 H21 M6 15 a2 2 0 1 0 0.01 0 M12 15 a2 2 0 1 0 0.01 0 M18 15 a2 2 0 1 0 0.01 0 M6 6 V11 M12 6 V11 M18 6 V11',
  lateral: 'M5 20 V6 H19 V20 M5 13 H19 M2 6 H5 M2 13 H5',
  vertical: 'M4 20 V9 H20 V20 M7 4 V8 M12 4 V8 M17 4 V8',
  stability: 'M4 17 H20 M7 17 L10 21 H4 Z M17 17 L20 21 H14 Z M12 17 V9',
  code: 'M6 3 H15 L19 7 V21 H6 Z M9 11 H16 M9 15 H16',
  wind: 'M3 8 H14 a3 3 0 1 0 -3 -3 M3 13 H18 a3 3 0 1 1 -3 3 M3 18 H10',
  eq: 'M2 12 H6 L8 6 L11 18 L14 4 L17 16 L19 12 H22',
  vw: 'M3 7 H21 M3 7 Q12 17 21 7 M12 12 V17 M10 15 L12 17 L14 15',
  cable: 'M3 5 Q12 19 21 5 M7 11 V18 M12 12 V18 M17 11 V18 M3 18 H21',
  // CE 315
  'rc-basics': 'M4 20 V8 L12 3 L20 8 V20 Z M9 20 V13 H15 V20',
  'rc-elastic': 'M7 3 V21 M7 3 L15 3 M7 21 L4 21 M12 12 L7 3 M12 12 L7 21 M16 10 V21 M16 21 H20',
  'rc-singly': 'M6 4 H18 V20 H6 Z M9 16.5 h0.01 M12 16.5 h0.01 M15 16.5 h0.01',
  'rc-doubly': 'M6 4 H18 V20 H6 Z M9 7.5 h0.01 M15 7.5 h0.01 M9 16.5 h0.01 M12 16.5 h0.01 M15 16.5 h0.01',
  'rc-tbeam': 'M3 4 H21 V8 H14 V20 H10 V8 H3 Z M11 17 h0.01 M13 17 h0.01',
  'rc-shear': 'M3 5 H21 V19 H3 Z M7 5 V19 M11 5 V19 M15 5 V19 M19 5 V19',
  'rc-torsion': 'M4 12 a8 4 0 1 0 16 0 a8 4 0 1 0 -16 0 M18 7 L20 9 L17 10',
  'rc-bond': 'M3 12 H16 a3 3 0 0 1 0 6 H12 M3 9 h1 M6 9 h1 M9 9 h1 M12 9 h1',
  'rc-oneway': 'M2 9 H22 V12 H2 Z M5 12 V19 M19 12 V19 M8 6 L12 4 L16 6',
  'rc-twoway': 'M4 4 H20 V20 H4 Z M4 12 H20 M12 4 V20 M8 8 L16 16',
  // CE 341
  'sm-wv': 'M6 3 H18 V21 H6 Z M6 8 H18 M6 13 H18 M9 17 h0.01 M14 18 h0.01 M11 19 h0.01',
  'sm-plast': 'M4 20 Q8 4 12 12 T20 6 M4 20 H20',
  'sm-class': 'M4 4 H20 L14 12 V19 L10 21 V12 Z',
  'sm-struct': 'M6 6 h0.01 M12 5 h0.01 M18 7 h0.01 M5 12 h0.01 M11 12 h0.01 M17 13 h0.01 M7 18 h0.01 M13 18 h0.01 M19 18 h0.01 M6 6 L12 5 L11 12 L5 12 Z',
  'sm-shear': 'M3 18 L21 6 M4 20 a8 8 0 0 1 16 0 M12 20 V18',
  'sm-lep': 'M5 3 V21 H9 V3 Z M9 6 L19 21 M11 9 H14 M13 13 H17 M15 17 H20',
  'sm-comp': 'M5 4 H19 V9 H5 Z M12 9 V13 M7 13 H17 V20 H7 Z',
  'sm-perm': 'M12 3 Q18 11 18 15 a6 6 0 0 1 -12 0 Q6 11 12 3 Z',
  'sm-seep': 'M11 3 V13 M3 9 Q11 22 21 9 M3 15 Q11 24 21 15',
  'sm-consol': 'M3 6 Q9 8 12 13 T21 18 M3 21 H21 M3 3 V21',
  'sm-stress': 'M12 3 V7 M10 5 L12 7 L14 5 M4 9 Q12 26 20 9 M7 9 Q12 18 17 9',
}

export function TopicIcon({ id, color, size = 18 }: { id: TopicId | RcTopicId | SmTopicId; color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color ?? 'currentColor'} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d={P[id]} />
    </svg>
  )
}

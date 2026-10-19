import type { TopicId } from '../store'

const P: Record<TopicId, string> = {
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
}

export function TopicIcon({ id, color, size = 18 }: { id: TopicId; color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color ?? 'currentColor'} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d={P[id]} />
    </svg>
  )
}

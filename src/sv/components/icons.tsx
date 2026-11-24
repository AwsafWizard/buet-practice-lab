// Topic marks for CE 104 (24 × 24 line drawings).
const P: Record<string, string> = {
  'sv-inst': 'M12 3 V6 M8.5 6 H15.5 V9.5 H8.5 Z M12 9.5 V12 M12 12 L6 21 M12 12 V21 M12 12 L18 21',
  'sv-chain': 'M4 20 L12 5 L20 20 Z M8 12.5 H5 M16.5 14 H19.5 M12 20 V23',
  'sv-compass': 'M12 12 m-8 0 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0 M12 6 L14 12 L12 18 L10 12 Z',
  'sv-level': 'M3 18 L8 14 L13 16 L21 9 M5 6 H11 V9 H5 Z M8 9 V11 M17 4 V12',
  'sv-contour': 'M12 12 m-3 0 a3 2 0 1 0 6 0 a3 2 0 1 0 -6 0 M12 12 m-6.5 0 a6.5 4.5 0 1 0 13 0 a6.5 4.5 0 1 0 -13 0 M2 20 Q8 17 12 19 T22 18',
  'sv-route': 'M3 21 C8 14 6 9 12 8 S17 3 21 3 M6 21 C11 14 9 11 15 10 M4 17 h2 M8 11 h2 M14 7 h2',
  'sv-traverse': 'M12 3 L20.5 9.2 L17.3 19.2 H6.7 L3.5 9.2 Z M12 3 V1 M12 3 h0.01',
  'sv-stadia': 'M4 12 L20 5 M4 12 L20 19 M4 12 L20 12 M18 4 V20',
  'sv-height': 'M17 3 V21 M15 3 H19 M3 21 H21 M5 19 L17 4',
  'sv-curve': 'M3 20 L8 15 C11 12 13 8 21 6 M8 15 l-2 -2 M12 10.5 l-2 -2 M16 7.5 l-1.4 -2.4',
  'sv-house': 'M4 20 V9 L12 4 L20 9 V20 Z M4 20 H20 M9 20 V14 H15 V20 M2 9 h2 M20 9 h2',
  'sv-modern': 'M5 15 H19 V19 H5 Z M8 15 V11 H16 V15 M12 11 V8 M9 5 a4 4 0 0 1 6 0 M7 3 a7 7 0 0 1 10 0',
}

export function SvTopicIcon({ id, color = 'currentColor', size = 18 }: { id: string; color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={P[id] ?? 'M4 12 H20'} />
    </svg>
  )
}

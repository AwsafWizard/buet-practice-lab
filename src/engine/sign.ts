// Rotational sign convention for everything shown to the user: support moment reactions (and their
// ILDs), rotations from virtual work, unit couples. The solver itself always works counter-clockwise +;
// these helpers turn its numbers into the chosen convention. Set from the store (default clockwise +).

let cw = true

export const setClockwise = (v: boolean) => {
  cw = v
}
export const isCW = () => cw
/** multiply a solver (ccw +) rotation / moment reaction by this to get the displayed value */
export const rotK = (): 1 | -1 => (cw ? -1 : 1)
/** solver (ccw +) value → displayed value */
export const rot = (ccw: number) => (ccw === 0 ? 0 : ccw * rotK())
/** short tag for labels: "cw +" or "ccw +" */
export const rotTag = () => (cw ? 'cw +' : 'ccw +')
/** the positive sense in words */
export const rotPos = () => (cw ? 'clockwise' : 'counter-clockwise')
/** arrow glyph of the positive sense */
export const rotArrow = () => (cw ? '↻' : '↺')
/** sense in words of a value already in the chosen convention */
export const rotWord = (v: number) => ((v > 0) === cw ? 'clockwise' : 'counter-clockwise')

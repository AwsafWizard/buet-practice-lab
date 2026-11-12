import { describe, expect, it } from 'vitest'
import { buildQueue, rate } from './leitner'
import { coverage, keysFound, matchLine, passes, sameWord, splitAnswer, stem } from './match'

describe('match', () => {
  it('stems and forgives typos', () => {
    expect(stem('tendering')).toBe(stem('tenders'))
    expect(sameWord('indemnification', 'indemnifcation')).toBe(true)
    expect(sameWord('bond', 'band')).toBe(false)
  })
  it('counts initials for a multi-word key', () => {
    expect(coverage('DBB', 'Design Bid Build')).toBe(1)
  })
  it('needs the one word of a one-word key', () => {
    expect(passes('warranty', { k: 'Warranties' })).toBe(true)
    expect(passes('guarantee', { k: 'Warranties' })).toBe(false)
    expect(passes('guarantee', { k: 'Warranties', alt: ['guarantees'] })).toBe(true)
  })
  it('accepts half the meaning words of a phrase', () => {
    expect(passes('educate the client', { k: 'Thoroughly educate clients' })).toBe(true)
    expect(passes('walk away', { k: 'Walk away if the client is adamant' })).toBe(true)
    expect(passes('client', { k: 'Thoroughly educate clients about risk' })).toBe(false)
  })
  it('matches a line to the best unfound point, in order on ties', () => {
    const pts = [{ k: 'Completeness' }, { k: 'Conciseness' }, { k: 'Consideration' }, { k: 'Concreteness' }, { k: 'Clarity' }, { k: 'Courtesy' }, { k: 'Correctness' }]
    const found = new Set<number>()
    expect(matchLine('concise', pts, found)).toBe(1)
    expect(matchLine('corectness', pts, found)).toBe(6)
    found.add(6)
    expect(matchLine('correctness', pts, found)).toBe(-1)
    expect(matchLine('banana', pts, found)).toBe(-1)
  })
  it('finds keys in a written answer', () => {
    const t = 'The scope, the schedule and the budget form a triangle; changing one changes the others.'
    expect(keysFound(t, ['scope', 'schedule', 'budget', 'interdependent', 'quality'])).toEqual([true, true, true, false, false])
  })
  it('splits an answer into points', () => {
    expect(splitAnswer('1. Scope 2. Schedule\n3) Budget; quality')).toEqual(['Scope', 'Schedule', 'Budget', 'quality'])
  })
})

describe('leitner', () => {
  it('moves a card up and back', () => {
    const a = rate(undefined, 'got', 0)
    expect(a.box).toBe(2)
    const b = rate(a, 'got', 1)
    expect(b.box).toBe(3)
    const c = rate(b, 'again', 2)
    expect(c).toMatchObject({ box: 1, miss: 1, n: 3 })
  })
  it('queues due cards before new ones, most-asked new first', () => {
    const q = buildQueue(
      [
        { id: 'x', weight: 1 },
        { id: 'y', weight: 5 },
        { id: 'z', weight: 0 },
      ],
      { z: { box: 1, due: 10, at: 0, n: 1, miss: 0 } },
      100,
    )
    expect(q).toEqual(['z', 'y', 'x'])
  })
})

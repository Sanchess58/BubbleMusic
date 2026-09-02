import {
  comboMultiplier,
  formatMinutesSeconds,
  quality,
  normalizeUrgency,
} from '../src/game/score';

describe('game helpers', () => {
  it('rates timing quality with named thresholds', () => {
    expect(quality(0.48, 1)).toBe('PERFECT');
    expect(quality(0.72, 1)).toBe('GREAT');
    expect(quality(0.9, 1)).toBe('GOOD');
  });

  it('formats elapsed time as mm:ss', () => {
    expect(formatMinutesSeconds(65)).toBe('1:05');
    expect(formatMinutesSeconds(9)).toBe('0:09');
  });

  it('normalizes urgency into a 0..1 range', () => {
    expect(normalizeUrgency(0.1, 1.2)).toBe(0);
    expect(normalizeUrgency(1.4, 1.2)).toBe(1);
    expect(normalizeUrgency(-1, 1.2)).toBe(0);
  });

  it('scales combo with flow', () => {
    expect(comboMultiplier(5, 50)).toBeCloseTo(1.6667, 3);
  });
});

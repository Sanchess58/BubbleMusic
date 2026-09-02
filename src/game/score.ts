import type { BubbleType } from './chart';

export type Quality = 'PERFECT' | 'GREAT' | 'GOOD';

const PERFECT_WINDOW = 0.11;
const GREAT_WINDOW = 0.25;
const HIT_TIMING_OFFSET_RATIO = 0.48;
const MAX_COMBO_FOR_SCALING = 60;
const COMBO_STEP = 30;
const FLOW_SCALE = 100;

const TIMING_MULTIPLIER: Record<Quality, number> = {
  PERFECT: 1.5,
  GREAT: 1.15,
  GOOD: 0.8,
};

const BASE_VALUES: Record<BubbleType, number> = {
  tap: 100,
  hold: 260,
  chain: 90,
  burst: 350,
};

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function timingMultiplier(q: Quality): number {
  return TIMING_MULTIPLIER[q];
}

export function baseValue(type: BubbleType): number {
  return BASE_VALUES[type] ?? BASE_VALUES.tap;
}

export function comboMultiplier(combo: number, flow: number): number {
  return (
    1 + Math.min(combo, MAX_COMBO_FOR_SCALING) / COMBO_STEP + flow / FLOW_SCALE
  );
}

export function quality(age: number, life: number): Quality {
  const targetHitTime = life * HIT_TIMING_OFFSET_RATIO;
  const distanceFromTarget = Math.abs(age - targetHitTime);

  if (distanceFromTarget < PERFECT_WINDOW) {
    return 'PERFECT';
  }

  if (distanceFromTarget < GREAT_WINDOW) {
    return 'GREAT';
  }

  return 'GOOD';
}

export function normalizeUrgency(age: number, life: number): number {
  const progress = age / Math.max(life, 0.001);
  const normalized = (progress - 0.25) / 0.6;

  return clamp(normalized, 0, 1);
}

export function formatMinutesSeconds(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds) % 60;

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

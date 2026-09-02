import { BUBBLE_COLORS } from './constants';

export type BubbleType = 'tap' | 'hold' | 'chain' | 'burst';

export type ChartEvent = {
  time: number;
  type: BubbleType;
  x: number;
  y: number;
  size: number;
  color: string;
  life: number;
  duration?: number;
  chainId?: string;
};

const CHART_COLOR_COUNT = 3;
const PRESET_EVENTS = 110;
const INITIAL_TIME_OFFSET = 1;
const BEAT_STEP_SECONDS = 0.5;
const HOLD_EVENT_MOD = 12;
const HOLD_EVENT_INDEX = 6;
const BURST_EVENT_MOD = 16;
const PATTERN_CHAIN_COUNT = 4;
const WAVE_EVENTS = [18, 36, 54] as const;
const CHAIN_PATTERNS = [
  [8, 0.18, 0.32],
  [14, 0.32, 0.65],
  [22, 0.72, 0.3],
  [30, 0.25, 0.7],
  [40, 0.78, 0.62],
  [48, 0.22, 0.28],
] as const;

export const chart: ChartEvent[] = [];

for (let i = 0; i < PRESET_EVENTS; i += 1) {
  const time = INITIAL_TIME_OFFSET + i * BEAT_STEP_SECONDS;
  const isBurst = i % BURST_EVENT_MOD === 0;
  const isHold = i % HOLD_EVENT_MOD === HOLD_EVENT_INDEX;

  chart.push({
    time,
    type: isBurst ? 'burst' : isHold ? 'hold' : 'tap',
    x: 0.5 + Math.sin(i * 0.83) * 0.34,
    y: 0.5 + Math.cos(i * 0.61) * 0.34,
    size: isBurst ? 0.085 : isHold ? 0.07 : 0.045,
    color: BUBBLE_COLORS[i % CHART_COLOR_COUNT],
    life: isHold ? 1.9 : 1.08,
    duration: isHold ? 1.7 : undefined,
  });
}

CHAIN_PATTERNS.forEach((pattern, patternIndex) => {
  const [baseTime, startX, startY] = pattern;

  for (let i = 0; i < PATTERN_CHAIN_COUNT; i += 1) {
    chart.push({
      time: baseTime + i * 0.18,
      type: 'chain',
      x: startX + i * 0.12,
      y: startY + i * 0.09,
      size: 0.036,
      color: BUBBLE_COLORS[(patternIndex + 1) % CHART_COLOR_COUNT],
      life: 0.72,
      chainId: `c${patternIndex}`,
    });
  }
});

WAVE_EVENTS.forEach((baseTime, waveIndex) => {
  for (let i = 0; i < 7; i += 1) {
    const angle = (i / 7) * Math.PI * 2;

    chart.push({
      time: baseTime + i * 0.11,
      type: 'burst',
      x: 0.5 + Math.cos(angle) * 0.38,
      y: 0.5 + Math.sin(angle) * 0.36,
      size: 0.047,
      color: BUBBLE_COLORS[(i + waveIndex) % BUBBLE_COLORS.length],
      life: 0.78,
      chainId: `b${waveIndex}`,
    });
  }
});

chart.sort((a, b) => a.time - b.time);

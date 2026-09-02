export const GAME_DURATION_SECONDS = 60;
export const FIELD_TOP_OFFSET = 120;

export const FLOW_MAX = 100;
export const FLOW_DECAY_PER_SECOND = 2.2;
export const FLOW_GAIN = {
  PERFECT: 5,
  GREAT: 3,
  GOOD: 2,
} as const;

export const PAN_TOUCH_TOLERANCE = 18;
export const PAN_STEP_DISTANCE = 35;
export const PAN_MIN_STEPS = 3;
export const HOLD_PRESS_DURATION_MS = 650;
export const FEEDBACK_CLEAR_DELAY_MS = 500;

export const HIT_RADIUS_MULTIPLIER = 1.7;
export const HOLD_RADIUS_MULTIPLIER = 1.8;

export const UI_COLORS = {
  background: '#050612',
  primary: '#665cff',
  accent: '#8b6cff',
  text: '#ffffff',
  textMuted: 'rgba(255,255,255,0.5)',
  miss: '#ff5577',
  panel: 'rgba(255,255,255,0.1)',
  panelStrong: 'rgba(255,255,255,0.13)',
  panelDark: 'rgba(10,10,28,0.96)',
} as const;

export const BUBBLE_COLORS = [
  '#4EE7FF',
  '#8B6CFF',
  '#FF4FC3',
  '#FFB84E',
] as const;

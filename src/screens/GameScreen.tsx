import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import Bubble from '../components/Bubble';
import { chart, ChartEvent } from '../game/chart';
import {
  FEEDBACK_CLEAR_DELAY_MS,
  FIELD_TOP_OFFSET,
  FLOW_DECAY_PER_SECOND,
  FLOW_GAIN,
  FLOW_MAX,
  GAME_DURATION_SECONDS,
  HOLD_PRESS_DURATION_MS,
  HOLD_RADIUS_MULTIPLIER,
  HIT_RADIUS_MULTIPLIER,
  PAN_MIN_STEPS,
  PAN_STEP_DISTANCE,
  PAN_TOUCH_TOLERANCE,
  UI_COLORS,
} from '../game/constants';
import {
  baseValue,
  comboMultiplier,
  formatMinutesSeconds,
  normalizeUrgency,
  quality,
  Quality,
  timingMultiplier,
} from '../game/score';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Hood } from '../widgets';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const FIELD_H = SCREEN_HEIGHT - FIELD_TOP_OFFSET;
const MAX_FRAME_DELTA_SECONDS = 0.05;

type Live = ChartEvent & {
  id: number;
  born: number;
  dead?: boolean;
};

type Props = {
  started: boolean;
  onStart: () => void;
  onRestart?: () => void;
};

export default function GameScreen({ started, onStart, onRestart }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [flow, setFlow] = useState(0);
  const [bubbles, setBubbles] = useState<Live[]>([]);
  const [feedback, setFeedback] = useState('');

  const [fieldLayout, setFieldLayout] = useState({
    width: SCREEN_WIDTH,
    height: FIELD_H,
  });

  const index = useRef(0);
  const id = useRef(0);
  const last = useRef(0);
  const running = useRef(false);

  const elapsedRef = useRef(0);
  const active = useRef<Live[]>([]);

  useEffect(() => {
    if (!started) {
      return;
    }

    running.current = true;
    last.current = Date.now();

    const loop = () => {
      if (!running.current) {
        return;
      }

      const now = Date.now();
      const dt = Math.min(MAX_FRAME_DELTA_SECONDS, (now - last.current) / 1000);

      last.current = now;
      const nextElapsed = elapsedRef.current + dt;
      elapsedRef.current = nextElapsed;

      setElapsed(nextElapsed);

      while (
        index.current < chart.length &&
        chart[index.current].time <= nextElapsed
      ) {
        const event = chart[index.current++];

        active.current.push({
          ...event,
          id: id.current++,
          born: nextElapsed,
        });
      }

      active.current = active.current.filter(
        bubble => !bubble.dead && nextElapsed - bubble.born < bubble.life,
      );

      setBubbles([...active.current]);
      setFlow(value => Math.max(0, value - dt * FLOW_DECAY_PER_SECOND));

      if (nextElapsed >= GAME_DURATION_SECONDS) {
        running.current = false;
        return;
      }

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);

    return () => {
      running.current = false;
    };
  }, [started]);

  const pop = (bubble: Live, q: Quality) => {
    if (bubble.dead) {
      return;
    }

    bubble.dead = true;

    const points = Math.round(
      baseValue(bubble.type) *
        timingMultiplier(q) *
        comboMultiplier(combo, flow),
    );

    setScore(value => value + points);
    setCombo(value => value + 1);
    setFlow(value => Math.min(FLOW_MAX, value + FLOW_GAIN[q]));
    setFeedback(q);

    setTimeout(() => {
      setFeedback('');
    }, FEEDBACK_CLEAR_DELAY_MS);

    setBubbles([...active.current]);
  };

  const hit = (px: number, py: number) => {
    let best: Live | undefined;
    let distance = Infinity;

    for (const bubble of active.current) {
      if (bubble.dead) {
        continue;
      }

      const x = bubble.x * fieldLayout.width;
      const y = bubble.y * fieldLayout.height;
      const d = Math.hypot(px - x, py - y);
      const radius = bubble.size * fieldLayout.width * HIT_RADIUS_MULTIPLIER;

      if (d < radius && d < distance) {
        best = bubble;
        distance = d;
      }
    }

    if (!best) {
      return;
    }

    const age = elapsedRef.current - best.born;

    if (best.type === 'hold') {
      return;
    }

    pop(best, quality(age, best.life));
  };

  const pan = Gesture.Pan()
    .onEnd(event => {
      const distance = Math.hypot(event.translationX, event.translationY);

      if (distance < PAN_TOUCH_TOLERANCE) {
        return;
      }

      const steps = Math.max(
        PAN_MIN_STEPS,
        Math.ceil(distance / PAN_STEP_DISTANCE),
      );

      for (let i = 0; i <= steps; i += 1) {
        hit(
          event.x - event.translationX + (event.translationX * i) / steps,

          event.y - event.translationY + (event.translationY * i) / steps,
        );
      }
    })
    .runOnJS(true);

  const long = Gesture.LongPress()
    .minDuration(HOLD_PRESS_DURATION_MS)
    .onEnd(event => {
      let best: Live | undefined;
      let distance = Infinity;

      for (const bubble of active.current) {
        if (bubble.dead || bubble.type !== 'hold') {
          continue;
        }

        const d = Math.hypot(
          event.x - bubble.x * SCREEN_WIDTH,
          event.y - bubble.y * FIELD_H,
        );

        if (
          d < bubble.size * SCREEN_WIDTH * HOLD_RADIUS_MULTIPLIER &&
          d < distance
        ) {
          best = bubble;
          distance = d;
        }
      }

      if (best) {
        pop(best, 'PERFECT');
      }
    })
    .runOnJS(true);

  const tap = Gesture.Tap()
    .maxDuration(250)
    .onEnd(event => {
      hit(event.x, event.y);
    })
    .runOnJS(true);

  const gesture = Gesture.Exclusive(long, tap, pan);

  return (
    <View style={styles.root}>
      <Hood combo={combo} flow={flow} score={score} />

      <View style={styles.flow}>
        <View style={[styles.flowIn, { width: `${flow}%` }]} />
      </View>

      <GestureDetector gesture={gesture}>
        <View
          style={styles.field}
          onLayout={event => {
            const { width, height } = event.nativeEvent.layout;

            setFieldLayout({
              width,
              height,
            });
          }}
        >
          {bubbles.map(bubble => (
            <Bubble
              key={bubble.id}
              x={bubble.x * fieldLayout.width}
              y={bubble.y * fieldLayout.height}
              size={bubble.size * fieldLayout.width}
              color={bubble.color}
              urgency={normalizeUrgency(elapsed - bubble.born, bubble.life)}
            />
          ))}

          {!!feedback && (
            <Text
              style={[
                styles.feedback,
                {
                  color: feedback === 'MISS' ? UI_COLORS.miss : UI_COLORS.text,
                },
              ]}
            >
              {feedback}
            </Text>
          )}
        </View>
      </GestureDetector>

      <View style={styles.bottom}>
        <Text style={styles.track}>BUBBLE MUSIC — WIP DEMO</Text>
        <Text style={styles.time}>
          {formatMinutesSeconds(elapsed)} /{' '}
          {formatMinutesSeconds(GAME_DURATION_SECONDS)}
        </Text>

        <Pressable style={styles.button} onPress={onRestart}>
          <Text style={styles.buttonText}>ЗАНОВО</Text>
        </Pressable>
      </View>

      {started && (
        <View style={styles.overlay}>
          <View style={styles.card}>
            <Text style={styles.logo}>BUBBLE</Text>
            <Text style={styles.sub}>• MUSIC •</Text>
            <Text style={styles.info}>
              Лопай пузыри в ритм. TAP, SWIPE и HOLD. Сохраняй COMBO и FLOW.
            </Text>

            <Pressable style={styles.button} onPress={onStart}>
              <Text style={styles.buttonText}>НАЧАТЬ ИГРУ</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: UI_COLORS.background,
  },

  container: {
    flex: 1,
    paddingTop: 0,
    paddingBottom: 20,
  },

  hud: {
    height: 76,
    paddingHorizontal: 18,
    paddingTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  center: {
    alignItems: 'center',
  },

  right: {
    alignItems: 'flex-end',
  },

  label: {
    fontSize: 9,
    letterSpacing: 2,
    color: UI_COLORS.textMuted,
    fontWeight: '700',
  },

  value: {
    fontSize: 22,
    color: UI_COLORS.text,
    fontWeight: '900',
  },

  combo: {
    fontSize: 29,
    color: UI_COLORS.text,
    fontWeight: '900',
  },

  flow: {
    height: 4,
    marginHorizontal: 18,
    backgroundColor: UI_COLORS.panel,
    borderRadius: 5,
    overflow: 'hidden',
  },

  flowIn: {
    height: '100%',
    backgroundColor: UI_COLORS.accent,
  },

  field: {
    flex: 1,
    position: 'relative',
  },

  feedback: {
    position: 'absolute',
    alignSelf: 'center',
    top: '46%',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
  },

  bottom: {
    height: 40,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },

  track: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
  },

  time: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.35)',
  },

  overlay: {
    // ...StyleSheet.absoluteFillObject,
    backgroundColor: UI_COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  card: {
    width: '88%',
    padding: 28,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: UI_COLORS.panelStrong,
    backgroundColor: UI_COLORS.panelDark,
    alignItems: 'center',
  },

  logo: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -2,
    color: UI_COLORS.accent,
  },

  sub: {
    fontSize: 11,
    letterSpacing: 4,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 4,
  },

  info: {
    fontSize: 13,
    lineHeight: 21,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.68)',
    marginVertical: 25,
  },

  button: {
    backgroundColor: UI_COLORS.primary,
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: 15,
  },

  buttonText: {
    fontWeight: '900',
    color: UI_COLORS.text,
    fontSize: 14,
  },
});

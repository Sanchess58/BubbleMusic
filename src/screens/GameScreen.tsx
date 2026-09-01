import React, {useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';

import Bubble from '../components/Bubble';
import {chart, ChartEvent} from '../game/chart';
import {
  baseValue,
  comboMultiplier,
  quality,
  Quality,
  timingMultiplier,
} from '../game/score';

const {width: W, height: H} = Dimensions.get('window');
const FIELD_H = H - 120;

type Live = ChartEvent & {
  id: number;
  born: number;
  dead?: boolean;
};

type Props = {
  started: boolean;
  onStart: () => void;
};

export default function GameScreen({started, onStart}: Props) {
  const [elapsed, setElapsed] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [flow, setFlow] = useState(0);
  const [bubbles, setBubbles] = useState<Live[]>([]);
  const [feedback, setFeedback] = useState('');

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
      const dt = Math.min(0.05, (now - last.current) / 1000);

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
        bubble =>
          !bubble.dead &&
          nextElapsed - bubble.born < bubble.life,
      );

      setBubbles([...active.current]);

      setFlow(value => Math.max(0, value - dt * 2.2));

      if (nextElapsed >= 60) {
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

    setFlow(value =>
      Math.min(
        100,
        value +
          (q === 'PERFECT'
            ? 5
            : q === 'GREAT'
              ? 3
              : 2),
      ),
    );

    setFeedback(q);

    setTimeout(() => {
      setFeedback('');
    }, 500);

    setBubbles([...active.current]);
  };

  const hit = (px: number, py: number) => {
    let best: Live | undefined;
    let distance = Infinity;

    for (const bubble of active.current) {
      if (bubble.dead) {
        continue;
      }

      const x = bubble.x * W;
      const y = bubble.y * FIELD_H;

      const d = Math.hypot(px - x, py - y);
      const radius = bubble.size * W * 1.7;

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
      const distance = Math.hypot(
        event.translationX,
        event.translationY,
      );

      if (distance < 18) {
        hit(event.x, event.y);
        return;
      }

      const steps = Math.max(
        3,
        Math.ceil(distance / 35),
      );

      for (let i = 0; i <= steps; i++) {
        hit(
          event.x -
            event.translationX +
            (event.translationX * i) / steps,
          event.y -
            event.translationY +
            (event.translationY * i) / steps,
        );
      }
    })
    .runOnJS(true);

  const long = Gesture.LongPress()
    .minDuration(650)
    .onEnd(event => {
      let best: Live | undefined;
      let distance = Infinity;

      for (const bubble of active.current) {
        if (
          bubble.dead ||
          bubble.type !== 'hold'
        ) {
          continue;
        }

        const d = Math.hypot(
          event.x - bubble.x * W,
          event.y - bubble.y * FIELD_H,
        );

        if (
          d < bubble.size * W * 1.8 &&
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

  const gesture = Gesture.Exclusive(long, pan);

  return (
    <View style={styles.root}>
      <View style={styles.hud}>
        <View>
          <Text style={styles.label}>SCORE</Text>
          <Text style={styles.value}>
            {score.toLocaleString()}
          </Text>
        </View>

        <View style={styles.center}>
          <Text style={styles.label}>COMBO</Text>
          <Text style={styles.combo}>
            ×{combo}
          </Text>
        </View>

        <View style={styles.right}>
          <Text style={styles.label}>FLOW</Text>
          <Text style={styles.value}>
            {Math.round(flow)}%
          </Text>
        </View>
      </View>

      <View style={styles.flow}>
        <View
          style={[
            styles.flowIn,
            {
              width: `${flow}%`,
            },
          ]}
        />
      </View>

      <GestureDetector gesture={gesture}>
        <View style={styles.field}>
          {bubbles.map(bubble => (
            <Bubble
              key={bubble.id}
              x={bubble.x * W}
              y={bubble.y * FIELD_H}
              size={bubble.size * W}
              color={bubble.color}
              urgency={Math.min(
                1,
                Math.max(
                  0,
                  (elapsed - bubble.born) /
                    bubble.life -
                    0.25,
                ) / 0.6,
              )}
            />
          ))}

          {!!feedback && (
            <Text
              style={[
                styles.feedback,
                {
                  color:
                    feedback === 'MISS'
                      ? '#ff5577'
                      : '#fff',
                },
              ]}>
              {feedback}
            </Text>
          )}
        </View>
      </GestureDetector>

      <View style={styles.bottom}>
        <Text style={styles.track}>
          BUBBLE MUSIC — WIP DEMO
        </Text>

        <Text style={styles.time}>
          {Math.floor(elapsed / 60)}:
          {String(Math.floor(elapsed) % 60).padStart(
            2,
            '0',
          )}{' '}
          / 1:00
        </Text>
      </View>

      {!started && (
        <View style={styles.overlay}>
          <View style={styles.card}>
            <Text style={styles.logo}>
              BUBBLE
            </Text>

            <Text style={styles.sub}>
              • MUSIC •
            </Text>

            <Text style={styles.info}>
              Лопай пузыри в ритм. TAP, SWIPE и HOLD.
              Сохраняй COMBO и FLOW.
            </Text>

            <Pressable
              style={styles.button}
              onPress={onStart}>
              <Text style={styles.buttonText}>
                НАЧАТЬ ИГРУ
              </Text>
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
    backgroundColor: '#050612',
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
    color: 'rgba(255,255,255,.5)',
    fontWeight: '700',
  },

  value: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '900',
  },

  combo: {
    fontSize: 29,
    color: '#fff',
    fontWeight: '900',
  },

  flow: {
    height: 4,
    marginHorizontal: 18,
    backgroundColor: 'rgba(255,255,255,.1)',
    borderRadius: 5,
    overflow: 'hidden',
  },

  flowIn: {
    height: '100%',
    backgroundColor: '#8b6cff',
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
    color: 'rgba(255,255,255,.8)',
  },

  time: {
    fontSize: 10,
    color: 'rgba(255,255,255,.35)',
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#050612',
    alignItems: 'center',
    justifyContent: 'center',
  },

  card: {
    width: '88%',
    padding: 28,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.13)',
    backgroundColor: 'rgba(10,10,28,.96)',
    alignItems: 'center',
  },

  logo: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -2,
    color: '#8b6cff',
  },

  sub: {
    fontSize: 11,
    letterSpacing: 4,
    color: 'rgba(255,255,255,.45)',
    marginTop: 4,
  },

  info: {
    fontSize: 13,
    lineHeight: 21,
    textAlign: 'center',
    color: 'rgba(255,255,255,.68)',
    marginVertical: 25,
  },

  button: {
    backgroundColor: '#665cff',
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: 15,
  },

  buttonText: {
    fontWeight: '900',
    color: '#fff',
    fontSize: 14,
  },
});
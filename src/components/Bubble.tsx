import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const PULSE_ANIMATION_DURATION_MS = 500;
const PULSE_SCALE = 1.055;
const BASE_CORE_OPACITY = 0.22;
const CORE_OPACITY_STEP = 0.22;
const BASE_RING_OPACITY = 0.18;
const RING_OPACITY_STEP = 0.4;
const RING_SCALE_STEP = 0.18;
const SHADOW_OPACITY = 0.8;
const SHADOW_RADIUS = 18;

type Props = {
  x: number;
  y: number;
  size: number;
  color: string;
  urgency: number;
};

export default function Bubble({ x, y, size, color, urgency }: Props) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(PULSE_SCALE, { duration: PULSE_ANIMATION_DURATION_MS }),
      -1,
      true,
    );
  }, [pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.bubble,
        {
          left: x - size,
          top: y - size,
          width: size * 2,
          height: size * 2,
          borderColor: color,
          shadowColor: color,
          shadowOpacity: SHADOW_OPACITY,
          shadowRadius: SHADOW_RADIUS,
        },
        animatedStyle,
      ]}
    >
      <View
        style={[
          styles.core,
          {
            backgroundColor: color,
            opacity: BASE_CORE_OPACITY + urgency * CORE_OPACITY_STEP,
          },
        ]}
      />
      <View
        style={[
          styles.ring,
          {
            borderColor: color,
            opacity: BASE_RING_OPACITY + urgency * RING_OPACITY_STEP,
            transform: [{ scale: 1 + urgency * RING_SCALE_STEP }],
          },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    borderWidth: 1.5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,.07)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  core: { width: '72%', height: '72%', borderRadius: 999 },
  ring: {
    position: 'absolute',
    width: '145%',
    height: '145%',
    borderRadius: 999,
    borderWidth: 1,
  },
});

import { StyleSheet } from 'react-native';
import { UI_COLORS } from '../../../../game/constants';

export const styles = StyleSheet.create({
  hoodItemContainer: {
    flexDirection: 'column',
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
});

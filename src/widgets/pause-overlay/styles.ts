import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },

  card: {
    width: '80%',
    padding: 24,
    borderRadius: 20,
    backgroundColor: '#171717',
    gap: 12,
  },

  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 100,
  },

  buttonsContainer: {
    gap: '15',
    width: '50%',
  },
});

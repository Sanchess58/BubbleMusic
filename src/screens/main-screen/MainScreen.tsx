import { Pressable, Text, View } from 'react-native';
import { styles } from './styles';

interface IMainScreen {
  onStart: () => void;
}

export const MainScreen = ({ onStart }: IMainScreen) => {
  return (
    <View style={styles.mainMenuContainer}>
      <Pressable onPress={onStart}>
        <Text style={styles.startGameButton}>Начать игру</Text>
      </Pressable>
    </View>
  );
};

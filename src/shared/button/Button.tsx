import { Button as ReactNativeButton, View } from 'react-native';
import { styles } from './styles';

interface IButtonProps {
  title: string;
  onPress: () => void;
}

export const Button = ({ title, onPress }: IButtonProps) => {
  return (
    <ReactNativeButton
      style={styles.button}
      title={title}
      onPress={onPress}
    ></ReactNativeButton>
  );
};

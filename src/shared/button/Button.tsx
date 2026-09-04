import { Pressable, Text } from 'react-native';
import { styles } from './styles';

interface IButtonProps {
  icon: string;
  iconOnly?: boolean;
  title: string;
  onPress: () => void;
}

export const Button = ({ icon, iconOnly, title, onPress }: IButtonProps) => {
  return (
    <Pressable onPress={onPress}>
      {(icon || iconOnly) && <img src={icon} />}
      {!iconOnly && <Text>{title}</Text>}
    </Pressable>
  );
};

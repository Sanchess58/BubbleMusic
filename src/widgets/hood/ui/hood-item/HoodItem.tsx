import { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { styles } from './styles';

interface IHoodItemProps {
  title: string;
  value: ReactNode | string | number;
}

export const HoodItem = ({ title, value }: IHoodItemProps) => {
  return (
    <View style={styles.hoodItemContainer}>
      <Text style={styles.label}>{title}</Text>
      <Text style={[styles.value, value === 'combo' && styles.combo]}>
        {value}
      </Text>
    </View>
  );
};

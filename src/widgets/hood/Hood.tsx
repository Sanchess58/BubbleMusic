import { Pressable, Text, View } from 'react-native';
import { hoodStyles } from './styles';
import { HoodItem } from './ui/hood-item/HoodItem';
import { PauseIcon } from '../../assets/icons';

export const TITLES = {
  SCORE: 'SCORE',
  COMBO: 'COMBO',
  FLOW: 'FLOW',
};

interface IHoodProps {
  score: number;
  combo: number;
  flow: number;
  onPause: () => void;
}

export const Hood = ({ score, combo, flow, onPause }: IHoodProps) => {
  interface IHoodItem {
    id: string;
    title: string;
    value: string;
  }

  const HOOD_ITEMS_OPTIONS: IHoodItem[] = [
    {
      id: 'score',
      title: TITLES.SCORE,
      value: score.toLocaleString(),
    },
    {
      id: 'combo',
      title: TITLES.COMBO,
      value: `×${combo}`,
    },
    {
      id: 'flow',
      title: TITLES.FLOW,
      value: `${Math.round(flow)}%`,
    },
  ];

  const renderHoodItems = () => {
    return HOOD_ITEMS_OPTIONS.map(item => (
      <HoodItem title={item.title} value={item.value} id={item.id} />
    ));
  };

  return (
    <View style={hoodStyles.hud}>
      {renderHoodItems()}

      <Pressable onPress={onPause}>
        <Text>
          <PauseIcon />
        </Text>
      </Pressable>

      {/* <img /> */}
    </View>
  );
};

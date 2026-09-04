import { View } from 'react-native';
import { hoodStyles } from './styles';
import { HoodItem } from './ui/hood-item/HoodItem';

export const TITLES = {
  SCORE: 'SCORE',
  COMBO: 'COMBO',
  FLOW: 'FLOW',
};

interface IHoodProps {
  score: number;
  combo: number;
  flow: number;
}

export const Hood = ({ score, combo, flow }: IHoodProps) => {
  const HOOD_ITEMS_OPTIONS = [
    {
      title: TITLES.SCORE,
      value: score.toLocaleString(),
    },
    {
      title: TITLES.COMBO,
      value: `×${combo}`,
    },
    {
      title: TITLES.FLOW,
      value: `${Math.round(flow)}%`,
    },
  ];

  const renderHoodItems = () => {
    return HOOD_ITEMS_OPTIONS.map(item => (
      <HoodItem title={item.title} value={item.value} />
    ));
  };

  return <View style={hoodStyles.hud}>{renderHoodItems()}</View>;
};

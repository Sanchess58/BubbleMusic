import { Button, Text, View } from 'react-native';
import { styles } from './styles';

interface IPauseOverlayProps {
  onContinue: () => void;
  onRestart?: () => void;
  onMenu: () => void;
  onSound?: () => void;
}

export const PauseOverlay = ({
  onContinue,
  onRestart,
  onMenu,
  onSound,
}: IPauseOverlayProps) => {
  interface IPauseButton {
    key?: string;
    title: string;
    onPress: () => void;
  }

  const BUTTONS_TITLES = {
    CONTINUE: 'Продолжить',
    RESTART: 'Заново',
    MENU: 'Главное меню',
    SOUND: 'Звук',
  };

  const PAUSE_BUTTONS_OPTIONS: IPauseButton[] = [
    {
      title: BUTTONS_TITLES.CONTINUE,
      onPress: onContinue,
    },
    {
      title: BUTTONS_TITLES.RESTART,
      onPress: () => {},
    },
    {
      title: BUTTONS_TITLES.MENU,
      onPress: onMenu,
    },
    {
      title: BUTTONS_TITLES.SOUND,
      onPress: () => {},
    },
  ];

  const renderButton = () => {
    return PAUSE_BUTTONS_OPTIONS.map(button => (
      <Button onPress={button.onPress} title={button.title} />
    ));
  };

  return (
    <View style={styles.overlay}>
      <Text style={styles.title}>Пауза</Text>

      <View style={styles.buttonsContainer}>{renderButton()}</View>
    </View>
  );
};

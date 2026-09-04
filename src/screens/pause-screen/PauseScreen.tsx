import { Button, Text, View } from 'react-native';

interface IPauseScreenProps {
  onContinue: () => void;
  onRestart: () => void;
  onMenu: () => void;
  onSound: () => void;
}

export const PauseScreen = ({
  onContinue,
  onRestart,
  onMenu,
  onSound,
}: IPauseScreenProps) => {
  interface IPauseButton {
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
      onPress: onRestart,
    },
    {
      title: BUTTONS_TITLES.MENU,
      onPress: onMenu,
    },
    {
      title: BUTTONS_TITLES.SOUND,
      onPress: onSound,
    },
  ];

  const renderButton = () => {
    return PAUSE_BUTTONS_OPTIONS.map(button => (
      <Button onPress={button.onPress} title={button.title} />
    ));
  };

  return (
    <View>
      <Text>Пауза</Text>

      {renderButton()}
    </View>
  );
};

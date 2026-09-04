import { useState } from 'react';

export const useAction = () => {
  const [started, setStarted] = useState<boolean>(false);
  const [paused, setPaused] = useState<boolean>(false);

  const handleStart = () => setStarted(true);

  const handleContinue = () => setPaused(false);

  const handlePause = () => setPaused(true);

  const handleMenu = () => {
    setPaused(false);
    setStarted(false);
  };

  return {
    started,
    paused,
    handleStart,
    handleContinue,
    handlePause,
    handleMenu,
  };
};

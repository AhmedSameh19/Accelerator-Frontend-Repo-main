import { useState, useEffect } from 'react';

const useEasterEgg = () => {
  const [showGame, setShowGame] = useState(false);
  const [typedText, setTypedText] = useState('');

  useEffect(() => {
    const handleKeyPress = (event) => {
      // Only track alphanumeric keys - safely check if event.key exists and has length
      if (event.key && event.key.length === 1) {
        const newText = (typedText + event.key).toLowerCase();
        setTypedText(newText.slice(-10)); // Keep only last 10 characters

        if (newText.includes('accelerator')) {
          setShowGame(true);
          setTypedText('');
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [typedText]);

  return { showGame, setShowGame };
};

export default useEasterEgg; 
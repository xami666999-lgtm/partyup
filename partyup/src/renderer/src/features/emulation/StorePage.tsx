import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConsoleStore, UiTheme } from './ConsoleStore';

export function StorePage() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<UiTheme>('ps5');
  return (
    <ConsoleStore
      theme={theme}
      onTheme={setTheme}
      onClassic={() => navigate('/emulation')}
      onSetup={() => navigate('/emulation')}
      onClose={() => navigate('/library')}
      startSystem="ps2"
    />
  );
}

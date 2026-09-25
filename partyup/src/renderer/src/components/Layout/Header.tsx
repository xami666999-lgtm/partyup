import React from 'react';
import { Search, Menu, Maximize2, Minimize, X, Sun, Moon, User } from 'lucide-react';
import { api } from '../../utils/api';
import { useAppStore } from '../../stores/appStore';
import { useThemeStore } from '../../stores/themeStore';

export function Header({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { windowState } = useAppStore();
  const { currentTheme, applyTheme } = useThemeStore();

  const handleWindowControl = (action: 'minimize' | 'maximize' | 'close') => {
    if (action === 'minimize') void api.system.minimize();
    if (action === 'maximize') void api.system.maximize();
    if (action === 'close') void api.system.close();
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <button className="icon-btn" onClick={onToggleSidebar} aria-label="Toggle sidebar">
          <Menu size={20} />
        </button>
        <div className="app-title">
          <span className="title-main">PartyUp</span>
        </div>
      </div>

      <div className="header-center">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search games, emulators, mods..."
            className="search-input"
            aria-label="Search"
          />
        </div>
      </div>

      <div className="header-right">
        <button className="icon-btn" onClick={() => applyTheme(currentTheme === 'hydra-dark' ? 'hydra-light' : 'hydra-dark')} aria-label="Toggle theme">
          {currentTheme === 'hydra-dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="user-menu">
          <button className="icon-btn user-avatar" aria-label="User menu">
            <User size={20} />
          </button>
        </div>

        <div className="window-controls">
          <button className="icon-btn win-btn" onClick={() => handleWindowControl('minimize')} aria-label="Minimize">
            <Minimize size={16} />
          </button>
          <button className="icon-btn win-btn" onClick={() => handleWindowControl('maximize')} aria-label={windowState === 'maximized' ? 'Restore' : 'Maximize'}>
            <Maximize2 size={16} />
          </button>
          <button className="icon-btn win-btn close-btn" onClick={() => handleWindowControl('close')} aria-label="Close">
            <X size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}

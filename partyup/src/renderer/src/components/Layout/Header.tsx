import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Menu, Maximize2, Minimize, X, Tv, User } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useVault } from '../../features/local/vault';

export function Header({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { setWindowState, windowState } = useAppStore();
  const people = useVault((s) => s.people);
  const active = useVault((s) => s.activePerson);
  const person = people.find((item) => item.id === active)?.name ?? 'You';

  const handleWindowControl = (action: 'minimize' | 'maximize' | 'close') => {
    if (window.electron?.api?.system) {
      window.electron.api.system[action]();
    }
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
        <Link className="icon-btn" to="/big-picture" aria-label="Big Picture">
          <Tv size={20} />
        </Link>
        <Link className="icon-btn user-avatar" to="/profiles" aria-label={person}>
          <User size={20} />
        </Link>

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

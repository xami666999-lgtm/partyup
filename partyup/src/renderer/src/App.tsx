import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { MainContent } from './components/Layout/MainContent';
import { GameGrid } from './features/library/GameGrid';
import { GameDetail } from './features/library/GameDetail';
import { LibraryView } from './features/library/LibraryView';
import { EmulationView } from './features/emulation/EmulationView';
import { StorePage } from './features/emulation/StorePage';
import { SettingsView } from './features/settings/SettingsView';
import { ThemesView } from './features/themes/ThemesView';
import { ProfilesView } from './features/profiles/ProfilesView';
import { t } from './features/local/i18n';
import { DownloadsView, ModsView, MultiplayerView, CloudGamingView, OptimizationView, AchievementsView, SavesView, SocialView, PluginsView, SteamView, HoardSyncView, BigPictureView } from './features/local/board';
import { useVault } from './features/local/vault';
import { useAppStore } from './stores/appStore';
import { useThemeStore } from './stores/themeStore';
import { SidebarNavItem } from './types/navigation';

const NAV_ITEMS: SidebarNavItem[] = [
  { id: 'library', label: 'library', icon: 'gamepad-2', path: '/library' },
  { id: 'steam', label: 'steam', icon: 'steam', path: '/steam' },
  { id: 'downloads', label: 'downloads', icon: 'download', path: '/downloads' },
  { id: 'emulation', label: 'consoles', icon: 'cpu', path: '/emulation' },
  { id: 'store', label: 'store', icon: 'store', path: '/store' },
  { id: 'mods', label: 'mods', icon: 'puzzle', path: '/mods' },
  { id: 'multiplayer', label: 'multiplayer', icon: 'users', path: '/multiplayer' },
  { id: 'cloud', label: 'cloud', icon: 'cloud', path: '/cloud' },
  { id: 'optimization', label: 'optimization', icon: 'sliders-horizontal', path: '/optimization' },
  { id: 'achievements', label: 'achievements', icon: 'trophy', path: '/achievements' },
  { id: 'saves', label: 'saves', icon: 'database', path: '/saves' },
  { id: 'hoard-sync', label: 'hoard', icon: 'database', path: '/hoard-sync' },
  { id: 'social', label: 'friends', icon: 'message-circle', path: '/social' },
  { id: 'profiles', label: 'profiles', icon: 'user', path: '/profiles' },
  { id: 'plugins', label: 'plugins', icon: 'plug', path: '/plugins' },
  { id: 'themes', label: 'themes', icon: 'palette', path: '/themes' },
  { id: 'settings', label: 'settings', icon: 'settings', path: '/settings' },
];

export function App() {
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const { currentTheme, applyTheme } = useThemeStore();
  const setupDone = useVault((state) => state.setupDone);
  const finishSetup = useVault((state) => state.finishSetup);
  const lang = useVault((state) => state.settings.lang);
  const patchSettings = useVault((state) => state.patchSettings);
  const [profileName, setProfileName] = useState('');
  const navItems = NAV_ITEMS.map((item) => ({ ...item, label: t(lang, item.label) }));

  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme, applyTheme]);

  useEffect(() => {
    if (window.electron) {
      window.electron.ipc.on('theme:apply', (_event: any, themeData: any) => {
        const root = document.documentElement;
        const colors = themeData.colors;
        Object.entries(colors).forEach(([key, value]) => {
          root.style.setProperty(`--color-${key}`, value as string);
        });
      });
    }
  }, []);

  if (!setupDone) {
    return (
      <form
        className="pu-setup"
        onSubmit={(event) => {
          event.preventDefault();
          if (!profileName.trim()) return;
          finishSetup(profileName.trim());
        }}
      >
        <h1>{t(lang, 'profileTitle')}</h1>
        <p>{t(lang, 'profileBody')}</p>
        <label>
          {t(lang, 'language')}
          <select value={lang || 'en'} aria-label={t(lang, 'language')} onChange={(event) => patchSettings({ lang: event.target.value })}>
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="ja">日本語</option>
            <option value="zh">中文</option>
            <option value="ru">Русский</option>
            <option value="pt">Português</option>
            <option value="it">Italiano</option>
          </select>
        </label>
        <input
          value={profileName}
          onChange={(event) => setProfileName(event.target.value)}
          placeholder="Your name"
          aria-label="Profile name"
          autoFocus
        />
        <button type="submit">{t(lang, 'continue')}</button>
      </form>
    );
  }

  return (
    <div className="app" data-theme={currentTheme}>
      <Header onToggleSidebar={toggleSidebar} />
      <div className="app-body">
        <Sidebar
          collapsed={sidebarCollapsed}
          items={navItems}
        />
        <MainContent>
          <Routes>
            <Route path="/library" element={<LibraryView />} />
            <Route path="/steam" element={<SteamView />} />
            <Route path="/profiles" element={<ProfilesView />} />
            <Route path="/big-picture" element={<BigPictureView />} />
            <Route path="/library/:view" element={<LibraryView />} />
            <Route path="/library/game/:id" element={<GameDetail />} />
            <Route path="/downloads" element={<DownloadsView />} />
            <Route path="/emulation" element={<EmulationView />} />
            <Route path="/store" element={<StorePage />} />
            <Route path="/mods" element={<ModsView />} />
            <Route path="/multiplayer" element={<MultiplayerView />} />
            <Route path="/cloud" element={<CloudGamingView />} />
            <Route path="/optimization" element={<OptimizationView />} />
            <Route path="/achievements" element={<AchievementsView />} />
<Route path="/saves" element={<SavesView />} />
            <Route path="/hoard-sync" element={<HoardSyncView />} />
            <Route path="/social" element={<SocialView />} />
            <Route path="/plugins" element={<PluginsView />} />
            <Route path="/themes" element={<ThemesView />} />
            <Route path="/settings" element={<SettingsView />} />
            <Route path="/" element={<Navigate to="/emulation" replace />} />
            <Route path="*" element={<Navigate to="/emulation" replace />} />
          </Routes>
        </MainContent>
      </div>
    </div>
  );
}

export default App;

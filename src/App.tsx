import { useEffect, useMemo, useState } from 'react';
import {
  Award,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Compass,
  Heart,
  Map as MapIcon,
  Moon,
  PackageCheck,
  Search,
  Settings2,
  Sun,
  Sunrise,
} from 'lucide-react';
import type { Season, Weather } from './types/stardew';
import { useFarmStore } from './state/useFarmStore';
import { ALL_CATALOG_ITEMS } from './data/items';
import { VILLAGERS } from './data/villagers';
import { getActiveBundles } from './utils/calculations';
import { SeasonBadgeIcon, WeatherIcon } from './components/AlmanacIcons';
import { TodayHub } from './components/TodayHub';
import { EncyclopediaView } from './components/EncyclopediaView';
import { BundlesView } from './components/BundlesView';
import { CalendarView } from './components/CalendarView';
import { FriendshipView } from './components/FriendshipView';
import { InteractiveMapView } from './components/InteractiveMapView';
import { GuidesJournalView } from './components/GuidesJournalView';
import { GlobalSearchModal, type AppTabId } from './components/GlobalSearchModal';
import { FarmSettingsModal } from './components/FarmSettingsModal';

const SEASONS: Season[] = ['Spring', 'Summer', 'Fall', 'Winter'];
const WEATHERS: Weather[] = ['Sunny', 'Rain', 'Storm', 'Wind', 'Green Rain', 'Snow'];
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function App() {
  const {
    theme,
    toggleTheme,
    profile,
    advanceDay,
    setCalendarDate,
    setWeather,
  } = useFarmStore();

  const [activeTab, setActiveTab] = useState<AppTabId>('today');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedVillagerId, setSelectedVillagerId] = useState<string | null>(null);
  const [selectedMapPinId, setSelectedMapPinId] = useState<string | null>(null);
  const [mapFocusNonce, setMapFocusNonce] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Global keyboard shortcut: Cmd/Ctrl + K or "/" opens Global Search
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT';

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (!isTyping && e.key === '/') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const openItem = (itemId: string) => {
    setSelectedItemId(itemId);
    setActiveTab('encyclopedia');
  };

  const openVillager = (villagerId: string) => {
    setSelectedVillagerId(villagerId);
    setActiveTab('friendship');
  };

  const openMapPin = (pinId: string) => {
    setSelectedMapPinId(pinId);
    setMapFocusNonce((n) => n + 1);
    setActiveTab('map');
  };

  const weekday = WEEKDAYS[(profile.day - 1) % 7];

  const railStats = useMemo(() => {
    const activeBundles = getActiveBundles(profile).filter(
      (b) => b.room !== 'Abandoned JojaMart'
    );
    const bundlesDone = activeBundles.filter(
      (b) =>
        b.items.filter((it) => profile.checkedBundleItems[`${b.id}:${it.id}`]).length >=
        b.slotsRequired
    ).length;

    const trackedCount = ALL_CATALOG_ITEMS.filter((i) => profile.trackedItems[i.id]).length;
    const friendsReady = VILLAGERS.filter(
      (v) => (profile.villagerHearts[v.id] ?? 0) >= (v.romanceable ? 8 : 10)
    ).length;

    return {
      bundlesLabel:
        profile.bundleMode === 'Joja'
          ? 'Joja'
          : `${bundlesDone}/${activeBundles.length}`,
      trackedLabel: `${trackedCount}/${ALL_CATALOG_ITEMS.length}`,
      friendsLabel: `${friendsReady}/${VILLAGERS.length}`,
    };
  }, [profile]);

  const navItems: {
    id: AppTabId;
    label: string;
    shortLabel: string;
    icon: typeof Compass;
    badge?: string;
  }[] = [
    { id: 'today', label: 'Today Hub', shortLabel: 'Today', icon: Sunrise },
    {
      id: 'encyclopedia',
      label: 'Encyclopedia',
      shortLabel: 'Wiki',
      icon: BookOpen,
      badge: railStats.trackedLabel,
    },
    {
      id: 'bundles',
      label: 'Community Center',
      shortLabel: 'Bundles',
      icon: PackageCheck,
      badge: railStats.bundlesLabel,
    },
    { id: 'calendar', label: 'Calendar', shortLabel: 'Calendar', icon: CalendarDays },
    {
      id: 'friendship',
      label: 'Villagers & Hearts',
      shortLabel: 'Friends',
      icon: Heart,
      badge: railStats.friendsLabel,
    },
    { id: 'map', label: 'Atlas Map', shortLabel: 'Map', icon: MapIcon },
    { id: 'guides', label: 'Guides & Journal', shortLabel: 'Guides', icon: Award },
  ];

  return (
    <div className="app-shell">
      {/* Top Bar with Live Valley Clock */}
      <header className="topbar">
        <div className="topbar-brand">
          <button
            type="button"
            className="brand-mark"
            aria-label="Open Today Hub"
            onClick={() => setActiveTab('today')}
            style={{ padding: 0, cursor: 'pointer' }}
          >
            <img src="/icons/favicon-64.png" alt="Pelican Almanac crest" />
          </button>
          <div>
            <div className="brand-title font-serif">Pelican Almanac</div>
            <button
              type="button"
              className="brand-sub"
              style={{ border: 'none', background: 'transparent', padding: 0, textAlign: 'left' }}
              onClick={() => setSettingsOpen(true)}
            >
              <span>
                {profile.name} • Year {profile.year}
              </span>
            </button>
          </div>
        </div>

        {/* Interactive Valley Clock Bar */}
        <div className="clock-bar" role="region" aria-label="In-Game Clock">
          <div className="clock-pill">
            <SeasonBadgeIcon season={profile.season} size={17} />
            <select
              aria-label="Current season"
              value={profile.season}
              onChange={(e) => setCalendarDate(e.target.value as Season, profile.day)}
              style={{
                border: 'none',
                background: 'transparent',
                fontWeight: 700,
                paddingRight: 2,
                cursor: 'pointer',
              }}
            >
              {SEASONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <span className="tabular-nums">
              {profile.day} ({weekday})
            </span>
          </div>

          <div className="clock-stepper">
            <button
              type="button"
              className="clock-step-btn"
              aria-label="Previous day"
              title="Go back 1 day"
              onClick={() => advanceDay(-1)}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className="clock-step-btn clock-day-advance"
              aria-label="Advance to next day"
              onClick={() => advanceDay(1)}
            >
              +1 Day
              <ChevronRight size={15} />
            </button>
          </div>

          <div className="clock-pill">
            <WeatherIcon weather={profile.weather} size={17} />
            <select
              aria-label="Current weather"
              value={profile.weather}
              onChange={(e) => setWeather(e.target.value as Weather)}
              style={{
                border: 'none',
                background: 'transparent',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {WEATHERS.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Global Search + Theme + Settings */}
        <div className="topbar-actions">
          <button
            type="button"
            className="btn btn-sm"
            aria-label="Global Almanac Search"
            onClick={() => setSearchOpen(true)}
          >
            <Search size={16} />
            <span>Search</span>
            <kbd
              style={{
                fontSize: '0.7rem',
                padding: '1px 5px',
                borderRadius: 4,
                background: 'var(--bg-muted)',
                border: '1px solid var(--wood-border)',
              }}
            >
              ⌘K
            </kbd>
          </button>

          <button
            type="button"
            className="icon-btn"
            aria-label={theme === 'daylight' ? 'Switch to Moonlight Cabin theme' : 'Switch to Pelican Parchment theme'}
            title={theme === 'daylight' ? 'Moonlight Cabin Mode' : 'Pelican Parchment Mode'}
            onClick={toggleTheme}
          >
            {theme === 'daylight' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <button
            type="button"
            className="icon-btn"
            aria-label="Farm Profiles and Save Importer"
            title="Farm Profiles & XML Save Import"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings2 size={18} />
          </button>
        </div>
      </header>

      {/* Main Navigation Rail + View Area */}
      <div className="workspace-frame">
        <aside className="side-rail" aria-label="Almanac Chapters">
          <div className="rail-section-label">Stardew 1.6 Almanac</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`rail-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.badge && <span className="rail-badge tabular-nums">{item.badge}</span>}
              </button>
            );
          })}

          <div className="rail-footer">
            <button type="button" className="rail-btn" onClick={() => setSettingsOpen(true)}>
              <Settings2 size={17} />
              <span>Farm &amp; XML Save</span>
            </button>
            <div style={{ padding: '4px 10px', fontSize: '0.74rem', color: 'var(--ink-soft)' }}>
              {profile.farmType} • Update 1.6
            </div>
          </div>
        </aside>

        <main className="main-content">
          {activeTab === 'today' && (
            <TodayHub
              onNavigateTab={setActiveTab}
              onOpenItem={openItem}
              onOpenVillager={openVillager}
              onOpenMapPin={openMapPin}
            />
          )}

          {activeTab === 'encyclopedia' && (
            <EncyclopediaView
              selectedItemId={selectedItemId}
              onSelectItem={setSelectedItemId}
              onOpenVillager={openVillager}
              onOpenMapPin={openMapPin}
            />
          )}

          {activeTab === 'bundles' && (
            <BundlesView onOpenItem={openItem} onOpenMapPin={openMapPin} />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              onOpenVillager={openVillager}
              onOpenMapPin={openMapPin}
              onOpenItem={openItem}
            />
          )}

          {activeTab === 'friendship' && (
            <FriendshipView
              selectedVillagerId={selectedVillagerId}
              onSelectVillager={setSelectedVillagerId}
              onOpenMapPin={openMapPin}
              onOpenItem={openItem}
            />
          )}

          {activeTab === 'map' && (
            <InteractiveMapView
              key={`map-${mapFocusNonce}`}
              selectedPinId={selectedMapPinId}
              onSelectPin={setSelectedMapPinId}
              onOpenVillager={openVillager}
              onOpenItem={openItem}
            />
          )}

          {activeTab === 'guides' && <GuidesJournalView onOpenMapPin={openMapPin} />}
        </main>
      </div>

      {/* Portrait iPad & Phone Fixed Bottom Dock */}
      <nav className="bottom-dock" aria-label="Mobile Navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`dock-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={18} />
              <span>{item.shortLabel}</span>
            </button>
          );
        })}
      </nav>

      {/* Modals */}
      {searchOpen && (
        <GlobalSearchModal
          isOpen={searchOpen}
          onClose={() => setSearchOpen(false)}
          onOpenItem={openItem}
          onOpenVillager={openVillager}
          onOpenMapPin={openMapPin}
          onNavigateTab={setActiveTab}
        />
      )}

      <FarmSettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

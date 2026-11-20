import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { FarmProfile, JournalEntry, Season, Weather } from '../types/stardew';
import {
  createBlankFarmProfile,
  createSampleFarmProfile,
  FarmStoreContext,
  STORAGE_KEY,
  type PersistedState,
  type ThemeMode,
} from './useFarmStore';

const SEASONS_ORDER: Season[] = ['Spring', 'Summer', 'Fall', 'Winter'];

function loadInitialState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PersistedState;
      if (parsed && Array.isArray(parsed.profiles) && parsed.profiles.length > 0) {
        return {
          theme: parsed.theme === 'moonlight' ? 'moonlight' : 'daylight',
          activeProfileId: parsed.activeProfileId || parsed.profiles[0].id,
          profiles: parsed.profiles,
        };
      }
    }
  } catch {
    // Ignore corrupt cache
  }
  const sample = createSampleFarmProfile();
  return {
    theme: 'daylight',
    activeProfileId: sample.id,
    profiles: [sample],
  };
}

export function FarmStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(loadInitialState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
  }, [state]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  const profile =
    state.profiles.find((p) => p.id === state.activeProfileId) ?? state.profiles[0];

  const updateProfile = (updater: (prev: FarmProfile) => FarmProfile) => {
    setState((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) => (p.id === profile.id ? updater(p) : p)),
    }));
  };

  const setTheme = (theme: ThemeMode) => setState((prev) => ({ ...prev, theme }));
  const toggleTheme = () =>
    setState((prev) => ({ ...prev, theme: prev.theme === 'daylight' ? 'moonlight' : 'daylight' }));

  const switchProfile = (id: string) =>
    setState((prev) => ({ ...prev, activeProfileId: id }));

  const createProfile = (
    name: string,
    farmerName: string,
    farmType: FarmProfile['farmType']
  ) => {
    const next = createBlankFarmProfile(name.trim() || 'New Valley Farm', farmerName.trim() || 'Farmer');
    next.farmType = farmType;
    setState((prev) => ({
      ...prev,
      activeProfileId: next.id,
      profiles: [...prev.profiles, next],
    }));
  };

  const addImportedProfile = (imported: FarmProfile) => {
    setState((prev) => ({
      ...prev,
      activeProfileId: imported.id,
      profiles: [...prev.profiles, imported],
    }));
  };

  const deleteProfile = (id: string) => {
    setState((prev) => {
      if (prev.profiles.length <= 1) return prev;
      const remaining = prev.profiles.filter((p) => p.id !== id);
      return {
        ...prev,
        profiles: remaining,
        activeProfileId: remaining[0].id,
      };
    });
  };

  const advanceDay = (delta = 1) => {
    updateProfile((prev) => {
      let day = prev.day + delta;
      let seasonIdx = SEASONS_ORDER.indexOf(prev.season);
      let year = prev.year;

      while (day > 28) {
        day -= 28;
        seasonIdx += 1;
        if (seasonIdx >= SEASONS_ORDER.length) {
          seasonIdx = 0;
          year += 1;
        }
      }
      while (day < 1) {
        day += 28;
        seasonIdx -= 1;
        if (seasonIdx < 0) {
          seasonIdx = SEASONS_ORDER.length - 1;
          year = Math.max(1, year - 1);
        }
      }

      const nextSeason = SEASONS_ORDER[seasonIdx];
      // In Stardew, Day 1, 8, 15, 22 are Mondays, Day 7, 14, 21, 28 are Sundays (week resets Sunday)
      const isSundayReset = delta > 0 && day % 7 === 0;
      const defaultWeather: Weather =
        nextSeason === 'Winter'
          ? 'Snow'
          : prev.greenRainDay === day && nextSeason === 'Summer'
            ? 'Green Rain'
            : 'Sunny';

      return {
        ...prev,
        year,
        season: nextSeason,
        day,
        weather: defaultWeather,
        villagerTalkedToday: {},
        villagerGiftedThisWeek: isSundayReset ? {} : prev.villagerGiftedThisWeek,
        dailyChores: prev.dailyChores.map((c) =>
          c.category === 'Morning' || c.category === 'Town' || c.category === 'Evening'
            ? { ...c, done: false }
            : c
        ),
      };
    });
  };

  const setCalendarDate = (season: Season, day: number, year?: number) => {
    updateProfile((prev) => ({
      ...prev,
      season,
      day: Math.min(28, Math.max(1, day)),
      year: year ? Math.max(1, year) : prev.year,
    }));
  };

  const setWeather = (weather: Weather) =>
    updateProfile((prev) => ({ ...prev, weather }));

  const toggleBundleItem = (bundleId: string, itemId: string) => {
    const key = `${bundleId}:${itemId}`;
    updateProfile((prev) => ({
      ...prev,
      checkedBundleItems: {
        ...prev.checkedBundleItems,
        [key]: !prev.checkedBundleItems[key],
      },
    }));
  };

  const toggleTrackedItem = (itemId: string) => {
    updateProfile((prev) => ({
      ...prev,
      trackedItems: {
        ...prev.trackedItems,
        [itemId]: !prev.trackedItems[itemId],
      },
    }));
  };

  const setVillagerHearts = (villagerId: string, hearts: number) => {
    updateProfile((prev) => ({
      ...prev,
      villagerHearts: {
        ...prev.villagerHearts,
        [villagerId]: Math.max(0, Math.min(14, hearts)),
      },
    }));
  };

  const incrementWeeklyGift = (villagerId: string) => {
    updateProfile((prev) => {
      const cur = prev.villagerGiftedThisWeek[villagerId] ?? 0;
      const next = (cur + 1) % 3;
      return {
        ...prev,
        villagerGiftedThisWeek: {
          ...prev.villagerGiftedThisWeek,
          [villagerId]: next,
        },
      };
    });
  };

  const toggleTalkedToday = (villagerId: string) => {
    updateProfile((prev) => ({
      ...prev,
      villagerTalkedToday: {
        ...prev.villagerTalkedToday,
        [villagerId]: !prev.villagerTalkedToday[villagerId],
      },
    }));
  };

  const toggleSeenHeartEvent = (villagerId: string, hearts: number) => {
    const key = `${villagerId}:${hearts}`;
    updateProfile((prev) => ({
      ...prev,
      seenHeartEvents: {
        ...prev.seenHeartEvents,
        [key]: !prev.seenHeartEvents[key],
      },
    }));
  };

  const addJournalEntry = (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => {
    const next: JournalEntry = {
      ...entry,
      id: `j-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: Date.now(),
    };
    updateProfile((prev) => ({
      ...prev,
      journalEntries: [next, ...prev.journalEntries],
    }));
  };

  const toggleJournalPin = (id: string) => {
    updateProfile((prev) => ({
      ...prev,
      journalEntries: prev.journalEntries.map((j) =>
        j.id === id ? { ...j, pinned: !j.pinned } : j
      ),
    }));
  };

  const deleteJournalEntry = (id: string) => {
    updateProfile((prev) => ({
      ...prev,
      journalEntries: prev.journalEntries.filter((j) => j.id !== id),
    }));
  };

  const addDailyChore = (
    text: string,
    category: 'Morning' | 'Town' | 'Evening' | 'Goal' = 'Morning'
  ) => {
    if (!text.trim()) return;
    updateProfile((prev) => ({
      ...prev,
      dailyChores: [
        ...prev.dailyChores,
        { id: `chore-${Date.now()}`, text: text.trim(), done: false, category },
      ],
    }));
  };

  const toggleDailyChore = (id: string) => {
    updateProfile((prev) => ({
      ...prev,
      dailyChores: prev.dailyChores.map((c) => (c.id === id ? { ...c, done: !c.done } : c)),
    }));
  };

  const deleteDailyChore = (id: string) => {
    updateProfile((prev) => ({
      ...prev,
      dailyChores: prev.dailyChores.filter((c) => c.id !== id),
    }));
  };

  const resetMorningChores = () => {
    updateProfile((prev) => ({
      ...prev,
      dailyChores: prev.dailyChores.map((c) => ({ ...c, done: false })),
    }));
  };

  const addReminder = (season: Season, day: number, text: string) => {
    if (!text.trim()) return;
    updateProfile((prev) => ({
      ...prev,
      reminders: [
        ...prev.reminders,
        { id: `rem-${Date.now()}`, season, day, text: text.trim(), done: false },
      ],
    }));
  };

  const deleteReminder = (id: string) => {
    updateProfile((prev) => ({
      ...prev,
      reminders: prev.reminders.filter((r) => r.id !== id),
    }));
  };

  const toggleBooksellerDay = (season: Season, day: number) => {
    updateProfile((prev) => {
      const current = prev.booksellerDays[season] ?? [];
      const exists = current.includes(day);
      const next = exists ? current.filter((d) => d !== day) : [...current, day].slice(-2);
      return {
        ...prev,
        booksellerDays: {
          ...prev.booksellerDays,
          [season]: next,
        },
      };
    });
  };

  const setGreenRainDay = (day: number | null) => {
    updateProfile((prev) => ({ ...prev, greenRainDay: day }));
  };

  const toggleGuideCheck = (checkId: string) => {
    updateProfile((prev) => ({
      ...prev,
      guideChecklistDone: {
        ...prev.guideChecklistDone,
        [checkId]: !prev.guideChecklistDone[checkId],
      },
    }));
  };

  const exportBackupJson = () => JSON.stringify(state, null, 2);

  const importBackupJson = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr) as PersistedState | FarmProfile;
      if ('profiles' in parsed && Array.isArray(parsed.profiles) && parsed.profiles.length > 0) {
        setState({
          theme: parsed.theme === 'moonlight' ? 'moonlight' : 'daylight',
          activeProfileId: parsed.activeProfileId || parsed.profiles[0].id,
          profiles: parsed.profiles,
        });
        return true;
      }
      if ('id' in parsed && 'season' in parsed && 'day' in parsed) {
        addImportedProfile({
          ...(parsed as FarmProfile),
          id: `farm-json-${Date.now()}`,
        });
        return true;
      }
    } catch {
      return false;
    }
    return false;
  };

  return (
    <FarmStoreContext.Provider
      value={{
        theme: state.theme,
        setTheme,
        toggleTheme,
        profiles: state.profiles,
        profile,
        switchProfile,
        createProfile,
        addImportedProfile,
        deleteProfile,
        updateProfile,
        advanceDay,
        setCalendarDate,
        setWeather,
        toggleBundleItem,
        toggleTrackedItem,
        setVillagerHearts,
        incrementWeeklyGift,
        toggleTalkedToday,
        toggleSeenHeartEvent,
        addJournalEntry,
        toggleJournalPin,
        deleteJournalEntry,
        addDailyChore,
        toggleDailyChore,
        deleteDailyChore,
        resetMorningChores,
        addReminder,
        deleteReminder,
        toggleBooksellerDay,
        setGreenRainDay,
        toggleGuideCheck,
        exportBackupJson,
        importBackupJson,
      }}
    >
      {children}
    </FarmStoreContext.Provider>
  );
}

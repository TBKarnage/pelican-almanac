import { createContext, useContext } from 'react';
import type { FarmProfile, JournalEntry, Season, Weather } from '../types/stardew';
import { DEFAULT_REMIXED_ACTIVE } from '../data/bundles';

export const STORAGE_KEY = 'pelican_almanac_state_v1';

export type ThemeMode = 'daylight' | 'moonlight';

export interface PersistedState {
  theme: ThemeMode;
  activeProfileId: string;
  profiles: FarmProfile[];
}

export function createBlankFarmProfile(name = 'Oakridge Farm', farmerName = 'Farmer'): FarmProfile {
  return {
    id: `farm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    farmerName,
    farmType: 'Meadowlands',
    year: 1,
    season: 'Spring',
    day: 1,
    weather: 'Sunny',
    bundleMode: 'Standard',
    activeRemixedBundles: { ...DEFAULT_REMIXED_ACTIVE },
    spoilerMode: true,
    checkedBundleItems: {},
    jojaProjects: {},
    villagerHearts: {},
    villagerGiftedThisWeek: {},
    villagerTalkedToday: {},
    villagerRelationship: {},
    seenHeartEvents: {},
    trackedItems: {},
    keepItemGoals: {
      'oak-resin': 20,
      hardwood: 200,
      'battery-pack': 10,
      'red-cabbage': 1,
    },
    journalEntries: [
      {
        id: 'j-welcome',
        title: 'First Day Goals — Seed Plan & Bundles',
        dateStamp: 'Spring 1, Year 1',
        tag: 'Farming',
        content:
          'Plant Lewis’s 15 Parsnips plus 1 Potato, Cauliflower, and Green Bean for Spring Crops. Save gold for Spring 13 Egg Festival Strawberries and hoard 300 Wood for the East Beach bridge!',
        pinned: true,
        createdAt: Date.now(),
      },
    ],
    dailyChores: [
      { id: 'c1', text: 'Check TV: Weather tomorrow, Queen of Sauce (Sun/Wed), Luck', done: false, category: 'Morning' },
      { id: 'c2', text: 'Pet coop/barn animals & collect Eggs / Milk / Cheese', done: false, category: 'Morning' },
      { id: 'c3', text: 'Check Pierre’s Help Wanted Board for Prize Tickets (1.6)', done: false, category: 'Town' },
      { id: 'c4', text: 'Check Traveling Cart if Friday or Sunday (Cindersap Forest)', done: false, category: 'Town' },
    ],
    reminders: [],
    booksellerDays: {
      Spring: [11, 22],
      Summer: [9, 25],
      Fall: [8, 22],
      Winter: [11, 24],
    },
    greenRainDay: 14,
    stardropsFound: {},
    goldenWalnuts: 0,
    obelisksCount: 0,
    goldenClockBuilt: false,
    monsterGoalsDone: 0,
    professions: {
      tiller: false,
      artisan: false,
      agriculturist: false,
      fisher: false,
      angler: false,
    },
    guideChecklistDone: {},
  };
}

export function createSampleFarmProfile(): FarmProfile {
  return {
    id: 'farm-demo-pelican',
    name: 'Meadowbrook Farm',
    farmerName: 'Rowan',
    farmType: 'Meadowlands',
    year: 1,
    season: 'Spring',
    day: 14,
    weather: 'Rain',
    bundleMode: 'Standard',
    activeRemixedBundles: { ...DEFAULT_REMIXED_ACTIVE },
    spoilerMode: true,
    checkedBundleItems: {
      'spring-foraging:wild-horseradish': true,
      'spring-foraging:daffodil': true,
      'spring-foraging:leek': true,
      'spring-crops:parsnip': true,
      'spring-crops:green-bean': true,
      'crafts-slot1': false,
      'ocean-fish:sardine': true,
      'ocean-fish:tuna': true,
      'river-fish:sunfish': true,
      'blacksmiths:copper-bar': true,
      'crab-pot:clam': true,
    },
    jojaProjects: {},
    villagerHearts: {
      caroline: 2,
      linus: 4,
      haley: 3,
      shane: 3,
      sebastian: 3,
      abigail: 2,
      willy: 2,
      pierre: 2,
      robin: 2,
      leah: 3,
    },
    villagerGiftedThisWeek: {
      haley: 1,
      caroline: 2,
      linus: 1,
    },
    villagerTalkedToday: {
      linus: true,
    },
    villagerRelationship: {},
    seenHeartEvents: {
      'caroline:2': true,
      'linus:0': true,
    },
    trackedItems: {
      parsnip: true,
      potato: true,
      cauliflower: true,
      strawberry: true,
      sunfish: true,
      catfish: true,
      sardine: true,
      'largemouth-bass': true,
      clam: true,
      quartz: true,
      'earth-crystal': true,
      'book-price-catalogue': true,
    },
    keepItemGoals: {
      'oak-resin': 20,
      'battery-pack': 5,
      hardwood: 300,
      'red-cabbage': 1,
    },
    journalEntries: [
      {
        id: 'j-spring14',
        title: "Haley's Birthday + Desert Festival Prep",
        dateStamp: 'Spring 14, Year 1',
        tag: 'Gifts',
        content:
          "Happy Birthday Haley! Bring a Daffodil to 2 Willow Lane or the Town Square fountain (8× birthday bonus = massive hearts!). Also harvest Strawberry beds tomorrow and remember Salmonberry bushes start tomorrow (Spring 15–18)!",
        pinned: true,
        createdAt: Date.now() - 3600_000,
      },
      {
        id: 'j-fishsmoker',
        title: 'Goal: Save for Willy’s Fish Smoker & 3 Jellies',
        dateStamp: 'Spring 11, Year 1',
        tag: 'Goals',
        content:
          'Today is Rainy! Grab a Catfish & Shad in Town River before 7pm. Keep 1 Sea Jelly, 1 River Jelly, and dive Mines Floor 20 for Cave Jelly once unlocked.',
        pinned: false,
        createdAt: Date.now() - 86400_000,
      },
    ],
    dailyChores: [
      { id: 'c1', text: 'Give Haley a Birthday Daffodil or Coconut at Willow Lane!', done: false, category: 'Town' },
      { id: 'c2', text: 'Catch Rainy Catfish & Shad in Town River today!', done: false, category: 'Goal' },
      { id: 'c3', text: 'Collect Mayo & Cheese before heading to Mines / River', done: true, category: 'Morning' },
      { id: 'c4', text: 'Save Salmonberry energy space — starts TOMORROW (Spring 15)!', done: false, category: 'Evening' },
    ],
    reminders: [
      { id: 'r-sb', season: 'Spring', day: 15, text: 'Salmonberry Bushes Days 15–18 — shake every bush in Valley!', done: false },
      { id: 'r-fd', season: 'Spring', day: 24, text: 'Flower Dance at Cindersap Meadow (need 4♥ to dance)', done: false },
    ],
    booksellerDays: {
      Spring: [11, 22],
      Summer: [9, 25],
      Fall: [8, 22],
      Winter: [11, 24],
    },
    greenRainDay: 14,
    stardropsFound: {},
    goldenWalnuts: 0,
    obelisksCount: 0,
    goldenClockBuilt: false,
    monsterGoalsDone: 0,
    professions: {
      tiller: false,
      artisan: false,
      agriculturist: false,
      fisher: true,
      angler: false,
    },
    guideChecklistDone: {
      'y1-bridge': true,
      'y1-strawberry': true,
    },
  };
}

export interface FarmStoreContextValue {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  profiles: FarmProfile[];
  profile: FarmProfile;
  switchProfile: (id: string) => void;
  createProfile: (name: string, farmerName: string, farmType: FarmProfile['farmType']) => void;
  addImportedProfile: (imported: FarmProfile) => void;
  deleteProfile: (id: string) => void;
  updateProfile: (updater: (prev: FarmProfile) => FarmProfile) => void;
  advanceDay: (delta?: number) => void;
  setCalendarDate: (season: Season, day: number, year?: number) => void;
  setWeather: (weather: Weather) => void;
  toggleBundleItem: (bundleId: string, itemId: string) => void;
  toggleTrackedItem: (itemId: string) => void;
  setVillagerHearts: (villagerId: string, hearts: number) => void;
  incrementWeeklyGift: (villagerId: string) => void;
  toggleTalkedToday: (villagerId: string) => void;
  toggleSeenHeartEvent: (villagerId: string, hearts: number) => void;
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => void;
  toggleJournalPin: (id: string) => void;
  deleteJournalEntry: (id: string) => void;
  addDailyChore: (text: string, category?: 'Morning' | 'Town' | 'Evening' | 'Goal') => void;
  toggleDailyChore: (id: string) => void;
  deleteDailyChore: (id: string) => void;
  resetMorningChores: () => void;
  addReminder: (season: Season, day: number, text: string) => void;
  deleteReminder: (id: string) => void;
  toggleBooksellerDay: (season: Season, day: number) => void;
  setGreenRainDay: (day: number | null) => void;
  toggleGuideCheck: (checkId: string) => void;
  exportBackupJson: () => string;
  importBackupJson: (jsonStr: string) => boolean;
}

export const FarmStoreContext = createContext<FarmStoreContextValue | null>(null);

export function useFarmStore() {
  const ctx = useContext(FarmStoreContext);
  if (!ctx) throw new Error('useFarmStore must be used inside FarmStoreProvider');
  return ctx;
}

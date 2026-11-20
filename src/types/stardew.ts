export type Season = 'Spring' | 'Summer' | 'Fall' | 'Winter';
export type Weather = 'Sunny' | 'Rain' | 'Storm' | 'Wind' | 'Green Rain' | 'Snow';

export type ItemCategory =
  | 'Crop'
  | 'Fruit Tree'
  | 'Fish'
  | 'Crab Pot'
  | 'Forage'
  | 'Animal Product'
  | 'Artisan Good'
  | 'Mineral'
  | 'Artifact'
  | 'Resource'
  | 'Cooking'
  | 'Crafting'
  | 'Power Book'
  | 'Monster Loot'
  | 'Seed';

export interface CropInfo {
  id: string;
  name: string;
  seasons: Season[];
  seedName: string;
  seedPrice: number | null; // null if special/not bought directly
  seedSource: string;
  jojaPrice?: number;
  growDays: number;
  regrowDays?: number;
  harvestYield: number; // average items per harvest (e.g. 3 for Blueberry, 1.25 for Potato, 4 for Coffee)
  sellPrice: number;
  energy: number;
  health: number;
  category: 'Fruit' | 'Vegetable' | 'Flower' | 'Other';
  trellis?: boolean;
  giantCrop?: boolean;
  waterNotRequired?: boolean; // e.g. Tea Leaves, Unmilled Rice near water
  artisanType?: 'Wine' | 'Juice' | 'Special';
  specialArtisanPrice?: number; // e.g. Coffee (150g), Pale Ale (300g), Beer (200g), Green Tea (100g)
  dehydratorPrice?: number; // 5 fruits -> 7.5x base + 25
  usedIn?: string[];
  bundleTags?: string[];
  description: string;
  version?: '1.6';
}

export type FishBehavior = 'Mixed' | 'Smooth' | 'Sinker' | 'Floater' | 'Dart' | 'Trap';

export interface FishInfo {
  id: string;
  name: string;
  seasons: Season[]; // empty or all 4 = All Seasons
  seasonNote?: string;
  locations: string[];
  timeWindow: string; // e.g. '6am – 7pm', 'Anytime', '6pm – 2am'
  startHour?: number; // 6 to 26 (26 = 2am)
  endHour?: number;
  weather: 'Any' | 'Sunny' | 'Rain' | 'Sunny/Wind';
  sellPrice: number;
  difficulty: number; // 0 for crab pot / jelly
  behavior: FishBehavior;
  minLevel?: number;
  energy: number;
  health: number;
  isLegendary?: boolean;
  isLegendaryII?: boolean;
  isCrabPot?: boolean;
  isNightMarket?: boolean;
  isJelly?: boolean;
  roePrice?: number;
  usedIn?: string[];
  bundleTags?: string[];
  description: string;
  tip?: string;
  version?: '1.6';
}

export interface CatalogItem {
  id: string;
  name: string;
  category: ItemCategory;
  seasons: Season[]; // empty means Year-Round / Any
  sellPrice: number;
  energy?: number;
  health?: number;
  source: string;
  mapPinIds?: string[];
  bundleIds?: string[];
  lovedBy?: string[];
  likedBy?: string[];
  usedIn?: string[];
  perfectionTrack?: 'shipped' | 'fish' | 'museum' | 'cooking' | 'crafting' | 'book';
  description: string;
  tags?: string[];
  subType?: string; // e.g., 'Gem', 'Geode Mineral', 'Artifact', 'Dish', 'Machine'
  ingredients?: { item: string; qty: number }[];
  recipeSource?: string;
  buffs?: string;
  version?: '1.6';
}

export interface BundleItemRequirement {
  id: string;
  name: string;
  qty: number;
  quality?: 'Normal' | 'Silver' | 'Gold';
  source: string;
  seasons?: Season[];
  itemId?: string;
}

export interface BundleDefinition {
  id: string;
  room: 'Crafts Room' | 'Pantry' | 'Fish Tank' | 'Boiler Room' | 'Bulletin Board' | 'Vault' | 'Abandoned JojaMart';
  name: string;
  slotsRequired: number;
  reward: string;
  isRemixedVariant?: boolean;
  variantGroup?: string; // groups standard & remixed alternatives for the same slot
  items: BundleItemRequirement[];
}

export interface HeartEvent {
  hearts: number;
  title: string;
  location: string;
  time: string;
  weather: string;
  seasonNote?: string;
  summary: string;
  choices?: string;
}

export interface Villager {
  id: string;
  name: string;
  role: string;
  birthday: { season: Season; day: number };
  romanceable: boolean;
  isRoommateCandidate?: boolean;
  address: string;
  mapPinId: string;
  accentColor: string;
  maxHearts: number; // 10 for bachelors (14 married), 10 for others
  loves: string[];
  likes: string[];
  hatesHighlights: string[];
  scheduleSummary: string;
  heartEvents: HeartEvent[];
  arrivalNote?: string; // e.g. Kent arrives Year 2, Leo on Ginger Island until 6 hearts
}

export interface CalendarEvent {
  id: string;
  season: Season;
  startDay: number;
  endDay: number;
  name: string;
  type: 'Festival' | 'Multi-Day Event' | 'Foraging Window' | 'Special';
  time: string;
  location: string;
  mapPinId?: string;
  description: string;
  highlights: string[];
  version?: '1.6';
}

export type MapRegion = 'valley' | 'ginger-island';

export type MapCategory =
  | 'Shop'
  | 'Residence'
  | 'Fishing'
  | 'Foraging'
  | 'Mining'
  | 'Landmark'
  | 'Transport';

export interface MapPin {
  id: string;
  region: MapRegion;
  name: string;
  subtitle: string;
  category: MapCategory;
  x: number; // percentage 0-100 on SVG viewBox
  y: number; // percentage 0-100 on SVG viewBox
  hours?: string;
  closedDays?: string;
  residents?: string[];
  shopsItems?: string[];
  fishHere?: string[];
  forageHere?: string[];
  resourcesHere?: string[];
  secrets?: string[];
  unlockCondition?: string;
  tags: string[];
}

export interface GuideArticle {
  id: string;
  title: string;
  category: 'Starter' | 'Profit' | 'Fishing' | 'Mining' | 'Late Game' | 'Update 1.6';
  readTime: string;
  summary: string;
  sections: {
    heading: string;
    body: string;
    bullets?: string[];
    callout?: string;
  }[];
  checklist?: { id: string; text: string }[];
}

export interface JournalEntry {
  id: string;
  title: string;
  dateStamp: string; // e.g., "Spring 14, Year 1"
  tag: 'Farming' | 'Mining' | 'Goals' | 'Gifts' | 'Shopping' | 'Secrets' | 'General';
  content: string;
  pinned?: boolean;
  createdAt: number;
}

export interface DailyChore {
  id: string;
  text: string;
  done: boolean;
  category: 'Morning' | 'Town' | 'Evening' | 'Goal';
}

export interface CustomReminder {
  id: string;
  season: Season;
  day: number;
  text: string;
  done?: boolean;
}

export interface FarmProfile {
  id: string;
  name: string;
  farmerName: string;
  farmType: 'Standard' | 'Riverland' | 'Forest' | 'Hill-top' | 'Wilderness' | 'Four Corners' | 'Beach' | 'Meadowlands';
  year: number;
  season: Season;
  day: number; // 1..28
  weather: Weather;
  bundleMode: 'Standard' | 'Remixed' | 'Joja';
  activeRemixedBundles: Record<string, string>; // slotGroup -> bundleId
  spoilerMode: boolean; // hide late-game Ginger Island / 1.6 spoilers unless enabled
  checkedBundleItems: Record<string, boolean>; // `${bundleId}:${itemId}`
  jojaProjects: Record<string, boolean>;
  villagerHearts: Record<string, number>;
  villagerGiftedThisWeek: Record<string, number>; // 0, 1, 2
  villagerTalkedToday: Record<string, boolean>;
  villagerRelationship: Record<string, 'none' | 'bouquet' | 'married' | 'roommate'>;
  seenHeartEvents: Record<string, boolean>; // `${villagerId}:${hearts}`
  trackedItems: Record<string, boolean>; // itemId -> shipped/caught/donated/cooked/crafted/read
  keepItemGoals: Record<string, number>; // itemId -> qty to keep
  journalEntries: JournalEntry[];
  dailyChores: DailyChore[];
  reminders: CustomReminder[];
  booksellerDays: Record<Season, number[]>; // user-marked balloon days per season
  greenRainDay: number | null;
  stardropsFound: Record<string, boolean>;
  goldenWalnuts: number;
  obelisksCount: number;
  goldenClockBuilt: boolean;
  monsterGoalsDone: number;
  professions: {
    tiller: boolean;
    artisan: boolean;
    agriculturist: boolean;
    fisher: boolean;
    angler: boolean;
  };
  guideChecklistDone: Record<string, boolean>;
}

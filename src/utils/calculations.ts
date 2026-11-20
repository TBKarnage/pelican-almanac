import type { CropInfo, FarmProfile, FishInfo } from '../types/stardew';
import { BUNDLES } from '../data/bundles';
import { ALL_CATALOG_ITEMS } from '../data/items';
import { FISH } from '../data/fish';
import { VILLAGERS } from '../data/villagers';
import { STARDROPS } from '../data/guides';

export type FertilizerType = 'none' | 'speed-gro' | 'deluxe-speed-gro' | 'hyper-speed-gro';

export interface CropProfitSummary {
  effectiveGrowDays: number;
  maxHarvestsFromDay: number;
  canMatureInSeason: boolean;
  rawUnitSell: number;
  bestProcessedLabel: string;
  bestProcessedUnitSell: number;
  rawGoldPerDay: number;
  bestGoldPerDay: number;
  kegSell: number;
  jarSell: number;
  dehydratorPerCropSell: number;
}

export function getEffectiveGrowDays(
  growDays: number,
  fertilizer: FertilizerType,
  agriculturist: boolean
): number {
  let speedBonus = agriculturist ? 0.1 : 0;
  if (fertilizer === 'speed-gro') speedBonus += 0.1;
  else if (fertilizer === 'deluxe-speed-gro') speedBonus += 0.25;
  else if (fertilizer === 'hyper-speed-gro') speedBonus += 0.33;

  if (speedBonus <= 0) return growDays;
  return Math.max(1, growDays - Math.floor(growDays * speedBonus));
}

export function calculateCropProfit(
  crop: CropInfo,
  options: {
    currentDay: number;
    daysOverride?: number;
    fertilizer?: FertilizerType;
    tiller?: boolean;
    artisan?: boolean;
    agriculturist?: boolean;
  }
): CropProfitSummary {
  const daysLeft = options.daysOverride ?? Math.max(0, 28 - options.currentDay);
  const effectiveGrowDays = getEffectiveGrowDays(
    crop.growDays,
    options.fertilizer ?? 'none',
    Boolean(options.agriculturist)
  );

  let harvests = 0;
  if (daysLeft >= effectiveGrowDays) {
    if (crop.regrowDays && crop.regrowDays > 0) {
      harvests = 1 + Math.floor((daysLeft - effectiveGrowDays) / crop.regrowDays);
    } else {
      harvests = Math.floor(daysLeft / effectiveGrowDays);
    }
  }

  const tillerEligible =
    crop.category === 'Fruit' || crop.category === 'Vegetable' || crop.id === 'sweet-gem-berry';
  const tillerMult = options.tiller && tillerEligible ? 1.1 : 1.0;
  const artisanMult = options.artisan ? 1.4 : 1.0;

  const rawUnitSell = Math.floor(crop.sellPrice * tillerMult);

  let kegBase = 0;
  let kegLabel = 'None';
  if (crop.specialArtisanPrice) {
    kegBase = crop.specialArtisanPrice;
    if (crop.id === 'hops') kegLabel = 'Pale Ale (Keg)';
    else if (crop.id === 'wheat') kegLabel = 'Beer (Keg)';
    else if (crop.id === 'coffee-bean') kegLabel = 'Coffee (Keg)';
    else if (crop.id === 'tea-leaves') kegLabel = 'Green Tea (Keg)';
    else kegLabel = 'Keg Artisan';
  } else if (crop.artisanType === 'Wine') {
    kegBase = crop.sellPrice * 3;
    kegLabel = 'Wine (Keg)';
  } else if (crop.artisanType === 'Juice') {
    kegBase = Math.floor(crop.sellPrice * 2.25);
    kegLabel = 'Juice (Keg)';
  }

  // Note: Coffee in Keg does NOT get Artisan bonus! Other wines/juices/ales/teas DO.
  const kegSell =
    crop.id === 'coffee-bean' ? kegBase : Math.floor(kegBase * artisanMult);

  const jarEligible = crop.category === 'Fruit' || crop.category === 'Vegetable';
  const jarBase = jarEligible ? crop.sellPrice * 2 + 50 : 0;
  const jarSell = Math.floor(jarBase * artisanMult);
  const jarLabel = crop.category === 'Fruit' ? 'Jelly (Jar)' : 'Pickles (Jar)';

  const dehydratorPerCropBase = crop.dehydratorPrice ? crop.dehydratorPrice / 5 : 0;
  const dehydratorPerCropSell =
    dehydratorPerCropBase > 0 ? Math.floor(dehydratorPerCropBase * artisanMult) : 0;
  const dehydratorLabel = crop.id === 'grape' ? 'Raisins (1.6 Dehyd.)' : 'Dried Fruit (1.6)';

  const candidates: { label: string; sell: number }[] = [
    { label: 'Raw Sale', sell: rawUnitSell },
  ];
  if (kegSell > 0) candidates.push({ label: kegLabel, sell: kegSell });
  if (jarSell > 0) candidates.push({ label: jarLabel, sell: jarSell });
  if (dehydratorPerCropSell > 0) {
    candidates.push({ label: dehydratorLabel, sell: dehydratorPerCropSell });
  }
  candidates.sort((a, b) => b.sell - a.sell);
  const best = candidates[0];

  const seedCost = crop.seedPrice ?? 0;
  // Special inputs that require multiple crops per keg craft (Coffee Bean: 5 beans per brew -> adjust)
  const effectiveBestUnit =
    crop.id === 'coffee-bean' ? Math.floor(kegSell / 5) : best.sell;

  const spanDays = Math.max(1, daysLeft);
  const totalRawRevenue = harvests * crop.harvestYield * rawUnitSell;
  const totalBestRevenue = harvests * crop.harvestYield * effectiveBestUnit;
  const totalSeedCost =
    crop.regrowDays || crop.id === 'tea-leaves' ? seedCost : harvests * seedCost;

  const rawGoldPerDay =
    harvests > 0 ? Number(((totalRawRevenue - totalSeedCost) / spanDays).toFixed(1)) : 0;
  const bestGoldPerDay =
    harvests > 0 ? Number(((totalBestRevenue - totalSeedCost) / spanDays).toFixed(1)) : 0;

  return {
    effectiveGrowDays,
    maxHarvestsFromDay: harvests,
    canMatureInSeason: harvests > 0,
    rawUnitSell,
    bestProcessedLabel: best.label,
    bestProcessedUnitSell: effectiveBestUnit,
    rawGoldPerDay,
    bestGoldPerDay,
    kegSell: crop.id === 'coffee-bean' ? Math.floor(kegSell / 5) : kegSell,
    jarSell,
    dehydratorPerCropSell,
  };
}

export function calculateFishValues(
  fish: FishInfo,
  options: { fisher?: boolean; angler?: boolean; artisan?: boolean }
) {
  const fishMult = options.angler ? 1.5 : options.fisher ? 1.25 : 1.0;
  const artisanMult = options.artisan ? 1.4 : 1.0;

  const normalSell = Math.floor(fish.sellPrice * fishMult);
  const iridiumSell = Math.floor(fish.sellPrice * 2 * fishMult);

  const canSmoke = !fish.isJelly;
  const smokedBase = canSmoke ? fish.sellPrice * 2 : 0;
  // 1.6 Smoked Fish stacks BOTH Fisher/Angler AND Artisan!
  const smokedNormal = Math.floor(smokedBase * fishMult * artisanMult);
  const smokedIridium = Math.floor(smokedBase * 2 * fishMult * artisanMult);

  const roeBase = fish.isCrabPot || fish.isJelly ? 0 : Math.floor(fish.sellPrice / 2) + 30;
  const agedRoeSell =
    roeBase > 0 ? Math.floor(roeBase * 2 * artisanMult) : 0;

  return {
    normalSell,
    iridiumSell,
    canSmoke,
    smokedNormal,
    smokedIridium,
    roeBase,
    agedRoeSell,
  };
}

export function getActiveBundles(profile: FarmProfile) {
  return BUNDLES.filter((bundle) => {
    if (profile.bundleMode === 'Standard') {
      return !bundle.isRemixedVariant;
    }
    if (!bundle.variantGroup) return true;
    const chosenId = profile.activeRemixedBundles[bundle.variantGroup];
    return chosenId ? chosenId === bundle.id : !bundle.isRemixedVariant;
  });
}

export interface PerfectionMetrics {
  overallPercent: number;
  parts: {
    id: string;
    label: string;
    weight: number;
    current: number;
    total: number;
    earnedWeight: number;
  }[];
}

export function calculatePerfection(profile: FarmProfile): PerfectionMetrics {
  const shippable = ALL_CATALOG_ITEMS.filter((i) => i.perfectionTrack === 'shipped');
  const shippedDone = shippable.filter((i) => profile.trackedItems[i.id]).length;

  const collectionFish = FISH.filter((f) => !f.isLegendaryII);
  const fishDone = collectionFish.filter((f) => profile.trackedItems[f.id]).length;

  const cooking = ALL_CATALOG_ITEMS.filter((i) => i.perfectionTrack === 'cooking');
  const cookingDone = cooking.filter((i) => profile.trackedItems[i.id]).length;

  const crafting = ALL_CATALOG_ITEMS.filter((i) => i.perfectionTrack === 'crafting');
  const craftingDone = crafting.filter((i) => profile.trackedItems[i.id]).length;

  const greatFriendsDone = VILLAGERS.filter((v) => {
    const h = profile.villagerHearts[v.id] ?? 0;
    const target = v.romanceable ? 8 : 10;
    return h >= target;
  }).length;

  const stardropsDone = STARDROPS.filter((s) => profile.stardropsFound[s.id]).length;

  const parts = [
    {
      id: 'shipped',
      label: 'Produce & Goods Shipped',
      weight: 15,
      current: shippedDone,
      total: Math.max(1, shippable.length),
    },
    {
      id: 'obelisks',
      label: 'Obelisks Built (4)',
      weight: 4,
      current: Math.min(4, profile.obelisksCount),
      total: 4,
    },
    {
      id: 'gold-clock',
      label: 'Gold Clock Built',
      weight: 10,
      current: profile.goldenClockBuilt ? 1 : 0,
      total: 1,
    },
    {
      id: 'monsters',
      label: 'Monster Slayer Hero',
      weight: 10,
      current: Math.min(12, profile.monsterGoalsDone),
      total: 12,
    },
    {
      id: 'friends',
      label: 'Great Friends (Max Hearts)',
      weight: 11,
      current: greatFriendsDone,
      total: VILLAGERS.length,
    },
    {
      id: 'stardrops',
      label: 'All 7 Stardrops',
      weight: 10,
      current: stardropsDone,
      total: STARDROPS.length,
    },
    {
      id: 'cooking',
      label: 'Key Recipes Cooked',
      weight: 10,
      current: cookingDone,
      total: Math.max(1, cooking.length),
    },
    {
      id: 'crafting',
      label: 'Stations & Recipes Crafted',
      weight: 10,
      current: craftingDone,
      total: Math.max(1, crafting.length),
    },
    {
      id: 'fish',
      label: 'Master Angler Fish',
      weight: 10,
      current: fishDone,
      total: collectionFish.length,
    },
    {
      id: 'walnuts',
      label: 'Golden Walnuts Found',
      weight: 5,
      current: Math.min(130, profile.goldenWalnuts),
      total: 130,
    },
    {
      id: 'skills',
      label: 'Farmer Levels (5 Skills -> 5% baseline)',
      weight: 5,
      current: 5,
      total: 5,
    },
  ].map((p) => ({
    ...p,
    earnedWeight: Number(((p.current / p.total) * p.weight).toFixed(1)),
  }));

  const overallPercent = Math.min(
    100,
    Math.round(parts.reduce((sum, p) => sum + (p.current / p.total) * p.weight, 0))
  );

  return { overallPercent, parts };
}

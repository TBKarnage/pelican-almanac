import { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  BookMarked,
  Check,
  Fish,
  Heart,
  MapPin,
  Search,
  Sparkles,
  Sprout,
  Utensils,
  X,
} from 'lucide-react';
import type { CatalogItem, ItemCategory, Season } from '../types/stardew';
import { useFarmStore } from '../state/useFarmStore';
import {
  ALL_CATALOG_ITEMS,
  getItemById,
  resolveMapPinsForItem,
} from '../data/items';
import { CROPS } from '../data/crops';
import { FISH } from '../data/fish';
import { MAP_PINS } from '../data/mapPins';
import { VILLAGERS } from '../data/villagers';
import {
  calculateCropProfit,
  calculateFishValues,
  type FertilizerType,
} from '../utils/calculations';
import { GoldCoinIcon, SeasonBadgeIcon } from './AlmanacIcons';

export type EncyclopediaSubTab = 'all' | 'crops' | 'fish' | 'museum' | 'cooking' | 'books';

interface EncyclopediaViewProps {
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
  onOpenVillager: (villagerId: string) => void;
  onOpenMapPin: (pinId: string) => void;
}

const CATEGORIES: ('All' | ItemCategory)[] = [
  'All',
  'Crop',
  'Fruit Tree',
  'Fish',
  'Crab Pot',
  'Forage',
  'Animal Product',
  'Artisan Good',
  'Mineral',
  'Artifact',
  'Cooking',
  'Crafting',
  'Power Book',
  'Resource',
  'Monster Loot',
];

const SEASONS: ('Any' | Season)[] = ['Any', 'Spring', 'Summer', 'Fall', 'Winter'];

type AllSortKey = 'name' | 'category' | 'sellPrice' | 'energy' | 'tracked';
type CropSortKey = 'name' | 'growDays' | 'harvests' | 'rawSell' | 'processedSell' | 'goldPerDay';
type FishSortKey = 'name' | 'difficulty' | 'sellPrice' | 'smoked' | 'agedRoe';

function SortIndicator({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  if (!active) return <ArrowUpDown size={13} />;
  return dir === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />;
}

export function EncyclopediaView({
  selectedItemId,
  onSelectItem,
  onOpenVillager,
  onOpenMapPin,
}: EncyclopediaViewProps) {
  const { profile, updateProfile, toggleTrackedItem, addJournalEntry } = useFarmStore();

  const [subTab, setSubTab] = useState<EncyclopediaSubTab>('all');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | ItemCategory>('All');
  const [seasonFilter, setSeasonFilter] = useState<'Any' | Season>('Any');
  const [onlyMissing, setOnlyMissing] = useState(false);
  const [onlyBundleNeeded, setOnlyBundleNeeded] = useState(false);

  // All items sort
  const [allSortKey, setAllSortKey] = useState<AllSortKey>('name');
  const [allSortDir, setAllSortDir] = useState<'asc' | 'desc'>('asc');

  // Crops calculator controls
  const [fertilizer, setFertilizer] = useState<FertilizerType>('none');
  const [calcStartDay, setCalcStartDay] = useState<'today' | 'day1'>('today');
  const [cropSeason, setCropSeason] = useState<'Any' | Season>(profile.season);
  const [cropSortKey, setCropSortKey] = useState<CropSortKey>('goldPerDay');
  const [cropSortDir, setCropSortDir] = useState<'asc' | 'desc'>('desc');

  // Fish controls
  const [catchableTodayOnly, setCatchableTodayOnly] = useState(false);
  const [fishLocFilter, setFishLocFilter] = useState('All');
  const [fishSortKey, setFishSortKey] = useState<FishSortKey>('sellPrice');
  const [fishSortDir, setFishSortDir] = useState<'asc' | 'desc'>('desc');

  const query = search.trim().toLowerCase();

  const toggleAllSort = (key: AllSortKey) => {
    if (allSortKey === key) setAllSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setAllSortKey(key);
      setAllSortDir(key === 'sellPrice' || key === 'energy' ? 'desc' : 'asc');
    }
  };

  const toggleCropSort = (key: CropSortKey) => {
    if (cropSortKey === key) setCropSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setCropSortKey(key);
      setCropSortDir(key === 'name' || key === 'growDays' ? 'asc' : 'desc');
    }
  };

  const toggleFishSort = (key: FishSortKey) => {
    if (fishSortKey === key) setFishSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setFishSortKey(key);
      setFishSortDir(key === 'name' ? 'asc' : 'desc');
    }
  };

  // 1. ALL ITEMS SORTABLE LIST
  const filteredAllItems = useMemo(() => {
    const base = ALL_CATALOG_ITEMS.filter((item) => {
      if (subTab === 'museum' && item.category !== 'Mineral' && item.category !== 'Artifact') {
        return false;
      }
      if (subTab === 'cooking' && item.category !== 'Cooking' && item.category !== 'Crafting') {
        return false;
      }
      if (subTab === 'books' && item.category !== 'Power Book') {
        return false;
      }
      if (subTab === 'all' && categoryFilter !== 'All' && item.category !== categoryFilter) {
        return false;
      }
      if (seasonFilter !== 'Any') {
        if (item.seasons.length > 0 && !item.seasons.includes(seasonFilter)) return false;
      }
      if (onlyMissing && profile.trackedItems[item.id]) return false;
      if (onlyBundleNeeded && (!item.bundleIds || item.bundleIds.length === 0)) return false;

      if (!query) return true;
      const hay = [
        item.name,
        item.category,
        item.subType ?? '',
        item.source,
        item.description,
        ...(item.lovedBy ?? []),
        ...(item.bundleIds ?? []),
        ...(item.usedIn ?? []),
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(query);
    });

    return base.sort((a, b) => {
      let cmp = 0;
      if (allSortKey === 'name') cmp = a.name.localeCompare(b.name);
      else if (allSortKey === 'category') cmp = a.category.localeCompare(b.category);
      else if (allSortKey === 'sellPrice') cmp = a.sellPrice - b.sellPrice;
      else if (allSortKey === 'energy') cmp = (a.energy ?? 0) - (b.energy ?? 0);
      else if (allSortKey === 'tracked') {
        cmp = (profile.trackedItems[a.id] ? 1 : 0) - (profile.trackedItems[b.id] ? 1 : 0);
      }
      return allSortDir === 'asc' ? cmp : -cmp;
    });
  }, [
    subTab,
    categoryFilter,
    seasonFilter,
    onlyMissing,
    onlyBundleNeeded,
    query,
    allSortKey,
    allSortDir,
    profile.trackedItems,
  ]);

  // 2. CROPS & PROFIT ROWS
  const cropRows = useMemo(() => {
    const startDayNum = calcStartDay === 'today' ? profile.day : 1;
    const rows = CROPS.filter((crop) => {
      if (cropSeason !== 'Any' && !crop.seasons.includes(cropSeason)) return false;
      if (onlyBundleNeeded && (!crop.bundleTags || crop.bundleTags.length === 0)) return false;
      if (query) {
        const hay = `${crop.name} ${crop.seedName} ${crop.seedSource} ${crop.description} ${(crop.usedIn ?? []).join(' ')}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    }).map((crop) => ({
      crop,
      profit: calculateCropProfit(crop, {
        currentDay: startDayNum,
        fertilizer,
        tiller: profile.professions.tiller,
        artisan: profile.professions.artisan,
        agriculturist: profile.professions.agriculturist,
      }),
    }));

    return rows.sort((a, b) => {
      let cmp = 0;
      if (cropSortKey === 'name') cmp = a.crop.name.localeCompare(b.crop.name);
      else if (cropSortKey === 'growDays') cmp = a.profit.effectiveGrowDays - b.profit.effectiveGrowDays;
      else if (cropSortKey === 'harvests') cmp = a.profit.maxHarvestsFromDay - b.profit.maxHarvestsFromDay;
      else if (cropSortKey === 'rawSell') cmp = a.profit.rawUnitSell - b.profit.rawUnitSell;
      else if (cropSortKey === 'processedSell') cmp = a.profit.bestProcessedUnitSell - b.profit.bestProcessedUnitSell;
      else if (cropSortKey === 'goldPerDay') cmp = a.profit.bestGoldPerDay - b.profit.bestGoldPerDay;
      return cropSortDir === 'asc' ? cmp : -cmp;
    });
  }, [
    cropSeason,
    calcStartDay,
    profile.day,
    fertilizer,
    profile.professions,
    onlyBundleNeeded,
    query,
    cropSortKey,
    cropSortDir,
  ]);

  // 3. FISH & ANGLING ROWS
  const fishRows = useMemo(() => {
    const rows = FISH.filter((fish) => {
      if (seasonFilter !== 'Any' && !fish.seasons.includes(seasonFilter)) return false;
      if (onlyMissing && profile.trackedItems[fish.id]) return false;
      if (onlyBundleNeeded && (!fish.bundleTags || fish.bundleTags.length === 0)) return false;
      if (catchableTodayOnly) {
        if (!fish.seasons.includes(profile.season)) return false;
        if (
          fish.weather === 'Rain' &&
          profile.weather !== 'Rain' &&
          profile.weather !== 'Storm' &&
          profile.weather !== 'Green Rain'
        ) {
          return false;
        }
        if (fish.weather === 'Sunny' && (profile.weather === 'Rain' || profile.weather === 'Storm')) {
          return false;
        }
        if (fish.weather === 'Sunny/Wind' && profile.weather !== 'Sunny' && profile.weather !== 'Wind') {
          return false;
        }
      }
      if (fishLocFilter !== 'All') {
        const locStr = fish.locations.join(' ').toLowerCase();
        if (!locStr.includes(fishLocFilter.toLowerCase())) return false;
      }
      if (query) {
        const hay = `${fish.name} ${fish.locations.join(' ')} ${fish.weather} ${fish.behavior} ${fish.description}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    }).map((fish) => ({
      fish,
      vals: calculateFishValues(fish, {
        fisher: profile.professions.fisher,
        angler: profile.professions.angler,
        artisan: profile.professions.artisan,
      }),
    }));

    return rows.sort((a, b) => {
      let cmp = 0;
      if (fishSortKey === 'name') cmp = a.fish.name.localeCompare(b.fish.name);
      else if (fishSortKey === 'difficulty') cmp = a.fish.difficulty - b.fish.difficulty;
      else if (fishSortKey === 'sellPrice') cmp = a.vals.normalSell - b.vals.normalSell;
      else if (fishSortKey === 'smoked') cmp = a.vals.smokedNormal - b.vals.smokedNormal;
      else if (fishSortKey === 'agedRoe') cmp = a.vals.agedRoeSell - b.vals.agedRoeSell;
      return fishSortDir === 'asc' ? cmp : -cmp;
    });
  }, [
    seasonFilter,
    onlyMissing,
    onlyBundleNeeded,
    catchableTodayOnly,
    profile.season,
    profile.weather,
    profile.trackedItems,
    profile.professions,
    fishLocFilter,
    query,
    fishSortKey,
    fishSortDir,
  ]);

  // Selected item detail drawer
  const inspectedItem: CatalogItem | undefined = selectedItemId
    ? getItemById(selectedItemId)
    : undefined;
  const inspectedPins = inspectedItem
    ? resolveMapPinsForItem(inspectedItem)
        .map((id) => MAP_PINS.find((p) => p.id === id))
        .filter((p): p is NonNullable<typeof p> => Boolean(p))
    : [];

  const inspectedCrop = inspectedItem
    ? CROPS.find((c) => c.id === inspectedItem.id)
    : undefined;
  const inspectedFish = inspectedItem
    ? FISH.find((f) => f.id === inspectedItem.id)
    : undefined;

  // Completion Counts
  const booksTotal = ALL_CATALOG_ITEMS.filter((i) => i.category === 'Power Book').length;
  const booksDone = ALL_CATALOG_ITEMS.filter(
    (i) => i.category === 'Power Book' && profile.trackedItems[i.id]
  ).length;
  const fishTotal = FISH.filter((f) => !f.isLegendaryII).length;
  const fishCaught = FISH.filter((f) => !f.isLegendaryII && profile.trackedItems[f.id]).length;
  const museumItems = ALL_CATALOG_ITEMS.filter(
    (i) => i.category === 'Mineral' || i.category === 'Artifact'
  );
  const museumDone = museumItems.filter((i) => profile.trackedItems[i.id]).length;

  return (
    <div>
      <header className="page-header">
        <div>
          <h1 className="page-title">Pelican Encyclopedia & Profit Almanac</h1>
          <p className="page-subtitle">
            Sortable catalog of all Valley & Ginger Island crops, fish, artisan goods, museum relics,
            recipes, and Update 1.6 books.
          </p>
        </div>

        <div className="segmented-bar" role="tablist" aria-label="Encyclopedia sections">
          <button
            type="button"
            className={`seg-btn ${subTab === 'all' ? 'active' : ''}`}
            onClick={() => setSubTab('all')}
          >
            All Items ({ALL_CATALOG_ITEMS.length})
          </button>
          <button
            type="button"
            className={`seg-btn ${subTab === 'crops' ? 'active' : ''}`}
            onClick={() => setSubTab('crops')}
          >
            <Sprout size={14} style={{ verticalAlign: '-2px', marginRight: 4 }} />
            Crops & Calc ({CROPS.length})
          </button>
          <button
            type="button"
            className={`seg-btn ${subTab === 'fish' ? 'active' : ''}`}
            onClick={() => setSubTab('fish')}
          >
            <Fish size={14} style={{ verticalAlign: '-2px', marginRight: 4 }} />
            Fish ({fishCaught}/{fishTotal})
          </button>
          <button
            type="button"
            className={`seg-btn ${subTab === 'museum' ? 'active' : ''}`}
            onClick={() => setSubTab('museum')}
          >
            Museum ({museumDone}/{museumItems.length})
          </button>
          <button
            type="button"
            className={`seg-btn ${subTab === 'cooking' ? 'active' : ''}`}
            onClick={() => setSubTab('cooking')}
          >
            <Utensils size={14} style={{ verticalAlign: '-2px', marginRight: 4 }} />
            Cook & Craft
          </button>
          <button
            type="button"
            className={`seg-btn ${subTab === 'books' ? 'active' : ''}`}
            onClick={() => setSubTab('books')}
          >
            <BookMarked size={14} style={{ verticalAlign: '-2px', marginRight: 4 }} />
            1.6 Books ({booksDone}/{booksTotal})
          </button>
        </div>
      </header>

      {/* Filter & Search Bar */}
      <section className="card" style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 10 }}>
          <div className="search-wrap">
            <Search size={17} />
            <input
              type="search"
              className="input"
              placeholder="Search any item, seed, fish, villager lover, bundle, or recipe..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            type="button"
            className={`chip ${onlyMissing ? 'active' : ''}`}
            onClick={() => setOnlyMissing((v) => !v)}
          >
            Uncaught / Unchecked Only
          </button>

          <button
            type="button"
            className={`chip ${onlyBundleNeeded ? 'active' : ''}`}
            onClick={() => setOnlyBundleNeeded((v) => !v)}
          >
            Bundle Items Only
          </button>
        </div>

        {/* Context Filter Controls */}
        {subTab === 'all' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="chip-row">
              {SEASONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`chip ${seasonFilter === s ? 'active' : ''}`}
                  onClick={() => setSeasonFilter(s)}
                >
                  {s !== 'Any' && <SeasonBadgeIcon season={s} size={13} />}
                  {s === 'Any' ? 'All Seasons' : s}
                </button>
              ))}
            </div>
            <div className="chip-row">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`chip ${categoryFilter === cat ? 'active' : ''}`}
                  onClick={() => setCategoryFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {subTab === 'crops' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <div className="chip-row">
              {SEASONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`chip ${cropSeason === s ? 'active' : ''}`}
                  onClick={() => setCropSeason(s)}
                >
                  {s !== 'Any' && <SeasonBadgeIcon season={s} size={13} />}
                  {s === 'Any' ? 'All Seasons' : s}
                </button>
              ))}
            </div>

            <select
              aria-label="Fertilizer"
              className="select"
              style={{ width: 'auto', minWidth: 185 }}
              value={fertilizer}
              onChange={(e) => setFertilizer(e.target.value as FertilizerType)}
            >
              <option value="none">No Speed Fertilizer</option>
              <option value="speed-gro">Speed-Gro (+10%)</option>
              <option value="deluxe-speed-gro">Deluxe Speed-Gro (+25%)</option>
              <option value="hyper-speed-gro">Hyper Speed-Gro (+33%)</option>
            </select>

            <div className="segmented-bar">
              <button
                type="button"
                className={`seg-btn ${calcStartDay === 'today' ? 'active' : ''}`}
                onClick={() => setCalcStartDay('today')}
              >
                Plant Today ({profile.season} {profile.day})
              </button>
              <button
                type="button"
                className={`seg-btn ${calcStartDay === 'day1' ? 'active' : ''}`}
                onClick={() => setCalcStartDay('day1')}
              >
                Full Season (Day 1)
              </button>
            </div>

            <div className="chip-row">
              <button
                type="button"
                className={`chip ${profile.professions.tiller ? 'active' : ''}`}
                onClick={() =>
                  updateProfile((p) => ({
                    ...p,
                    professions: { ...p.professions, tiller: !p.professions.tiller },
                  }))
                }
              >
                Tiller (+10%)
              </button>
              <button
                type="button"
                className={`chip ${profile.professions.artisan ? 'active' : ''}`}
                onClick={() =>
                  updateProfile((p) => ({
                    ...p,
                    professions: { ...p.professions, artisan: !p.professions.artisan },
                  }))
                }
              >
                Artisan (+40%)
              </button>
              <button
                type="button"
                className={`chip ${profile.professions.agriculturist ? 'active' : ''}`}
                onClick={() =>
                  updateProfile((p) => ({
                    ...p,
                    professions: { ...p.professions, agriculturist: !p.professions.agriculturist },
                  }))
                }
              >
                Agriculturist (+10% Spd)
              </button>
            </div>
          </div>
        )}

        {subTab === 'fish' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <button
              type="button"
              className={`chip ${catchableTodayOnly ? 'active' : ''}`}
              onClick={() => setCatchableTodayOnly((v) => !v)}
            >
              Catchable Today ({profile.season} • {profile.weather})
            </button>

            <div className="chip-row">
              {SEASONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`chip ${seasonFilter === s ? 'active' : ''}`}
                  onClick={() => setSeasonFilter(s)}
                >
                  {s === 'Any' ? 'All Seasons' : s}
                </button>
              ))}
            </div>

            <select
              aria-label="Water location filter"
              className="select"
              style={{ width: 'auto', minWidth: 170 }}
              value={fishLocFilter}
              onChange={(e) => setFishLocFilter(e.target.value)}
            >
              <option value="All">All Waters</option>
              <option value="River">Rivers (Town/Forest)</option>
              <option value="Mountain Lake">Mountain Lake</option>
              <option value="Beach">Beach / Ocean</option>
              <option value="Mines">The Mines</option>
              <option value="Desert">Calico Desert</option>
              <option value="Ginger Island">Ginger Island</option>
              <option value="Crab Pot">Crab Pots</option>
              <option value="Submarine">Night Market Submarine</option>
            </select>

            <button
              type="button"
              className={`chip ${profile.professions.angler ? 'active' : ''}`}
              onClick={() =>
                updateProfile((p) => ({
                  ...p,
                  professions: {
                    ...p.professions,
                    angler: !p.professions.angler,
                    fisher: p.professions.angler ? p.professions.fisher : false,
                  },
                }))
              }
            >
              Angler (+50%)
            </button>
            <button
              type="button"
              className={`chip ${profile.professions.artisan ? 'active' : ''}`}
              onClick={() =>
                updateProfile((p) => ({
                  ...p,
                  professions: { ...p.professions, artisan: !p.professions.artisan },
                }))
              }
            >
              Artisan (+40% Smoker!)
            </button>
          </div>
        )}
      </section>

      {/* TABLE: CROPS & PROFIT CALCULATOR */}
      {subTab === 'crops' && (
        <div className="table-scroll">
          <table className="almanac-table">
            <thead>
              <tr>
                <th>Done</th>
                <th>
                  <button type="button" className="th-sort-btn" onClick={() => toggleCropSort('name')}>
                    Crop <SortIndicator active={cropSortKey === 'name'} dir={cropSortDir} />
                  </button>
                </th>
                <th>Seasons</th>
                <th>
                  <button type="button" className="th-sort-btn" onClick={() => toggleCropSort('growDays')}>
                    Grow Time <SortIndicator active={cropSortKey === 'growDays'} dir={cropSortDir} />
                  </button>
                </th>
                <th>
                  <button type="button" className="th-sort-btn" onClick={() => toggleCropSort('harvests')}>
                    Harvests <SortIndicator active={cropSortKey === 'harvests'} dir={cropSortDir} />
                  </button>
                </th>
                <th>
                  <button type="button" className="th-sort-btn" onClick={() => toggleCropSort('rawSell')}>
                    Raw Sell <SortIndicator active={cropSortKey === 'rawSell'} dir={cropSortDir} />
                  </button>
                </th>
                <th>
                  <button type="button" className="th-sort-btn" onClick={() => toggleCropSort('processedSell')}>
                    Best Artisan <SortIndicator active={cropSortKey === 'processedSell'} dir={cropSortDir} />
                  </button>
                </th>
                <th>
                  <button type="button" className="th-sort-btn" onClick={() => toggleCropSort('goldPerDay')}>
                    Profit/Day <SortIndicator active={cropSortKey === 'goldPerDay'} dir={cropSortDir} />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {cropRows.map(({ crop, profit }) => {
                const tracked = Boolean(profile.trackedItems[crop.id]);
                return (
                  <tr
                    key={crop.id}
                    className={tracked ? 'is-checked' : ''}
                    onClick={() => onSelectItem(crop.id)}
                  >
                    <td onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="check-toggle"
                        aria-label={`Mark ${crop.name} shipped`}
                        style={{
                          background: tracked ? 'var(--sage)' : undefined,
                          borderColor: tracked ? 'var(--sage)' : undefined,
                        }}
                        onClick={() => toggleTrackedItem(crop.id)}
                      >
                        {tracked && <Check size={14} strokeWidth={3} />}
                      </button>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>
                        {crop.name}{' '}
                        {crop.version === '1.6' && <span className="badge badge-plum">1.6</span>}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
                        Seed: {crop.seedPrice !== null ? `${crop.seedPrice}g` : 'Special/Free'} •{' '}
                        {crop.category}
                        {crop.giantCrop && ' • 3×3 Giant'}
                      </div>
                    </td>
                    <td>{crop.seasons.join(', ')}</td>
                    <td className="tabular-nums">
                      <strong>{profit.effectiveGrowDays}d</strong>
                      {crop.regrowDays ? (
                        <div style={{ fontSize: '0.75rem', color: 'var(--sage)' }}>
                          +{crop.regrowDays}d regrow
                        </div>
                      ) : null}
                    </td>
                    <td className="tabular-nums">
                      {profit.canMatureInSeason ? (
                        <span className="badge badge-sage">{profit.maxHarvestsFromDay}× left</span>
                      ) : (
                        <span className="badge badge-crimson">Too Late</span>
                      )}
                    </td>
                    <td className="tabular-nums font-bold">
                      {profit.rawUnitSell}
                      <GoldCoinIcon size={12} />
                    </td>
                    <td className="tabular-nums">
                      <strong>
                        {profit.bestProcessedUnitSell}
                        <GoldCoinIcon size={12} />
                      </strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>
                        {profit.bestProcessedLabel}
                      </div>
                    </td>
                    <td className="tabular-nums">
                      <span style={{ fontWeight: 800, color: 'var(--sage)' }}>
                        {profit.bestGoldPerDay}g/d
                      </span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>
                        Raw: {profit.rawGoldPerDay}g/d
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TABLE: FISH & SMOKER CALCULATOR */}
      {subTab === 'fish' && (
        <div className="table-scroll">
          <table className="almanac-table">
            <thead>
              <tr>
                <th>Caught</th>
                <th>
                  <button type="button" className="th-sort-btn" onClick={() => toggleFishSort('name')}>
                    Fish <SortIndicator active={fishSortKey === 'name'} dir={fishSortDir} />
                  </button>
                </th>
                <th>Seasons & Weather</th>
                <th>Where & Time</th>
                <th>
                  <button type="button" className="th-sort-btn" onClick={() => toggleFishSort('difficulty')}>
                    Diff. <SortIndicator active={fishSortKey === 'difficulty'} dir={fishSortDir} />
                  </button>
                </th>
                <th>
                  <button type="button" className="th-sort-btn" onClick={() => toggleFishSort('sellPrice')}>
                    Catch Value <SortIndicator active={fishSortKey === 'sellPrice'} dir={fishSortDir} />
                  </button>
                </th>
                <th>
                  <button type="button" className="th-sort-btn" onClick={() => toggleFishSort('smoked')}>
                    1.6 Smoked (2×) <SortIndicator active={fishSortKey === 'smoked'} dir={fishSortDir} />
                  </button>
                </th>
                <th>
                  <button type="button" className="th-sort-btn" onClick={() => toggleFishSort('agedRoe')}>
                    Aged Roe <SortIndicator active={fishSortKey === 'agedRoe'} dir={fishSortDir} />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {fishRows.map(({ fish, vals }) => {
                const caught = Boolean(profile.trackedItems[fish.id]);
                return (
                  <tr
                    key={fish.id}
                    className={caught ? 'is-checked' : ''}
                    onClick={() => onSelectItem(fish.id)}
                  >
                    <td onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="check-toggle"
                        aria-label={`Mark ${fish.name} caught`}
                        style={{
                          background: caught ? 'var(--sage)' : undefined,
                          borderColor: caught ? 'var(--sage)' : undefined,
                        }}
                        onClick={() => toggleTrackedItem(fish.id)}
                      >
                        {caught && <Check size={14} strokeWidth={3} />}
                      </button>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>
                        {fish.name}{' '}
                        {fish.isLegendary && <span className="badge badge-gold">Legend</span>}
                        {fish.isLegendaryII && <span className="badge badge-plum">Qi Quest</span>}
                        {fish.version === '1.6' && <span className="badge badge-plum">1.6</span>}
                      </div>
                      {fish.bundleTags?.length ? (
                        <span className="badge badge-sage">{fish.bundleTags[0]}</span>
                      ) : null}
                    </td>
                    <td>
                      <div>{fish.seasons.length === 4 ? 'All Seasons' : fish.seasons.join(', ')}</div>
                      <span
                        className={`badge ${
                          fish.weather === 'Rain'
                            ? 'badge-river'
                            : fish.weather === 'Any'
                              ? 'badge-neutral'
                              : 'badge-gold'
                        }`}
                      >
                        {fish.weather}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.86rem', fontWeight: 600 }}>
                        {fish.locations.join(', ')}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--ink-muted)' }}>
                        {fish.timeWindow}
                      </div>
                    </td>
                    <td className="tabular-nums">
                      <strong>{fish.difficulty || '—'}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>
                        {fish.behavior}
                      </div>
                    </td>
                    <td className="tabular-nums">
                      <strong>{vals.normalSell}g</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--plum)' }}>
                        Iridium: {vals.iridiumSell}g
                      </div>
                    </td>
                    <td className="tabular-nums">
                      {vals.canSmoke ? (
                        <>
                          <strong style={{ color: 'var(--sage)' }}>{vals.smokedNormal}g</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>
                            Iridium: {vals.smokedIridium}g
                          </div>
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="tabular-nums">
                      {vals.agedRoeSell > 0 ? <strong>{vals.agedRoeSell}g</strong> : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TABLE: UNIFIED ALL ITEMS / MUSEUM / COOK & CRAFT / 1.6 BOOKS */}
      {subTab !== 'crops' && subTab !== 'fish' && (
        <div className="table-scroll">
          <table className="almanac-table">
            <thead>
              <tr>
                <th>
                  <button type="button" className="th-sort-btn" onClick={() => toggleAllSort('tracked')}>
                    Tracked <SortIndicator active={allSortKey === 'tracked'} dir={allSortDir} />
                  </button>
                </th>
                <th>
                  <button type="button" className="th-sort-btn" onClick={() => toggleAllSort('name')}>
                    Item <SortIndicator active={allSortKey === 'name'} dir={allSortDir} />
                  </button>
                </th>
                <th>
                  <button type="button" className="th-sort-btn" onClick={() => toggleAllSort('category')}>
                    Category <SortIndicator active={allSortKey === 'category'} dir={allSortDir} />
                  </button>
                </th>
                <th>Seasons</th>
                <th>Where / How to Get</th>
                <th>
                  <button type="button" className="th-sort-btn" onClick={() => toggleAllSort('sellPrice')}>
                    Sell <SortIndicator active={allSortKey === 'sellPrice'} dir={allSortDir} />
                  </button>
                </th>
                <th>
                  <button type="button" className="th-sort-btn" onClick={() => toggleAllSort('energy')}>
                    Energy <SortIndicator active={allSortKey === 'energy'} dir={allSortDir} />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAllItems.map((item) => {
                const tracked = Boolean(profile.trackedItems[item.id]);
                return (
                  <tr
                    key={item.id}
                    className={tracked ? 'is-checked' : ''}
                    onClick={() => onSelectItem(item.id)}
                  >
                    <td onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="check-toggle"
                        aria-label={`Mark ${item.name} tracked`}
                        style={{
                          background: tracked ? 'var(--sage)' : undefined,
                          borderColor: tracked ? 'var(--sage)' : undefined,
                        }}
                        onClick={() => toggleTrackedItem(item.id)}
                      >
                        {tracked && <Check size={14} strokeWidth={3} />}
                      </button>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>
                        {item.name}{' '}
                        {item.version === '1.6' && <span className="badge badge-plum">1.6</span>}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 3 }}>
                        {item.bundleIds?.slice(0, 2).map((b) => (
                          <span key={b} className="badge badge-sage">
                            {b}
                          </span>
                        ))}
                        {item.lovedBy && item.lovedBy.length > 0 && (
                          <span className="badge badge-crimson">
                            ♥ {item.lovedBy.slice(0, 2).join(', ')}
                            {item.lovedBy.length > 2 ? ` +${item.lovedBy.length - 2}` : ''}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-neutral">{item.category}</span>
                      {item.subType && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', marginTop: 2 }}>
                          {item.subType}
                        </div>
                      )}
                    </td>
                    <td>{item.seasons.length === 0 ? 'Year-Round' : item.seasons.join(', ')}</td>
                    <td style={{ maxWidth: 320, fontSize: '0.84rem', color: 'var(--ink-muted)' }}>
                      {item.source}
                      {item.buffs && (
                        <div style={{ color: 'var(--gold)', fontWeight: 700, marginTop: 2 }}>
                          Buff: {item.buffs}
                        </div>
                      )}
                    </td>
                    <td className="tabular-nums" style={{ fontWeight: 700 }}>
                      {item.sellPrice > 0 ? (
                        <>
                          {item.sellPrice}
                          <GoldCoinIcon size={12} />
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="tabular-nums">{item.energy ? `+${item.energy}` : '—'}</td>
                  </tr>
                );
              })}
              {filteredAllItems.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 28, color: 'var(--ink-muted)' }}>
                    No items match those filters. Clear a filter or search term to explore everything.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* SLIDE-OVER ITEM FIELD CARD DRAWER */}
      {inspectedItem && (
        <div
          className="drawer-backdrop"
          onClick={() => onSelectItem(null)}
          role="dialog"
          aria-label={`${inspectedItem.name} field details`}
        >
          <aside className="drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="card-header" style={{ paddingBottom: 10, borderBottom: '1.5px solid var(--wood-border)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span className="badge badge-neutral">{inspectedItem.category}</span>
                  {inspectedItem.version === '1.6' && <span className="badge badge-plum">Update 1.6</span>}
                </div>
                <h2 className="page-title" style={{ marginTop: 4 }}>
                  {inspectedItem.name}
                </h2>
              </div>
              <button
                type="button"
                className="icon-btn"
                aria-label="Close detail card"
                onClick={() => onSelectItem(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 14 }}>
              <p style={{ margin: 0, fontSize: '0.96rem' }}>{inspectedItem.description}</p>

              {/* Quick Actions */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={`btn ${profile.trackedItems[inspectedItem.id] ? 'btn-primary' : ''}`}
                  onClick={() => toggleTrackedItem(inspectedItem.id)}
                >
                  <Check size={16} />
                  {profile.trackedItems[inspectedItem.id] ? 'Tracked / Collected' : 'Mark Collected'}
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    addJournalEntry({
                      title: `Note: ${inspectedItem.name}`,
                      dateStamp: `${profile.season} ${profile.day}, Year ${profile.year}`,
                      tag: 'Goals',
                      content: `${inspectedItem.name} (${inspectedItem.category}) — ${inspectedItem.source}.`,
                    });
                  }}
                >
                  <Sparkles size={16} /> Save to Journal
                </button>
              </div>

              {/* Key Stats Grid */}
              <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', fontWeight: 700 }}>
                    BASE SELL PRICE
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1.08rem' }} className="tabular-nums">
                    {inspectedItem.sellPrice > 0 ? `${inspectedItem.sellPrice}g` : 'Not Sold'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', fontWeight: 700 }}>
                    AVAILABILITY
                  </div>
                  <div style={{ fontWeight: 700 }}>
                    {inspectedItem.seasons.length === 0
                      ? 'All Seasons'
                      : inspectedItem.seasons.join(', ')}
                  </div>
                </div>
                {inspectedItem.energy !== undefined && inspectedItem.energy !== 0 && (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', fontWeight: 700 }}>
                      ENERGY / HEALTH
                    </div>
                    <div style={{ fontWeight: 700 }}>
                      +{inspectedItem.energy} E / +{inspectedItem.health ?? 0} HP
                    </div>
                  </div>
                )}
                {inspectedItem.buffs && (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', fontWeight: 700 }}>
                      BUFFS
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--gold)' }}>{inspectedItem.buffs}</div>
                  </div>
                )}
              </div>

              {/* Source & Crafting */}
              <div className="callout callout-sage">
                <div style={{ fontWeight: 700, marginBottom: 3 }}>Where & How to Obtain</div>
                <div>{inspectedItem.source}</div>
              </div>

              {inspectedItem.ingredients && (
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Ingredients / Recipe</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {inspectedItem.ingredients.map((ing) => (
                      <span key={ing.item} className="badge badge-neutral">
                        {ing.qty}× {ing.item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Crop specific breakdown */}
              {inspectedCrop && (() => {
                const cProfit = calculateCropProfit(inspectedCrop, {
                  currentDay: profile.day,
                  fertilizer,
                  tiller: profile.professions.tiller,
                  artisan: profile.professions.artisan,
                  agriculturist: profile.professions.agriculturist,
                });
                return (
                  <div className="card">
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>
                      Season Return ({profile.season} Day {profile.day})
                    </div>
                    <div style={{ fontSize: '0.88rem', display: 'grid', gap: 4 }}>
                      <div>• Grow time: {inspectedCrop.growDays}d ({inspectedCrop.regrowDays ? `regrows every ${inspectedCrop.regrowDays}d` : 'single harvest'})</div>
                      <div>• Harvests remaining if planted today: <strong>{cProfit.maxHarvestsFromDay}×</strong></div>
                      <div>• Keg price: {cProfit.kegSell > 0 ? `${cProfit.kegSell}g` : 'N/A'} • Jar price: {cProfit.jarSell > 0 ? `${cProfit.jarSell}g` : 'N/A'}</div>
                      {cProfit.dehydratorPerCropSell > 0 && (
                        <div>• 1.6 Dehydrator share (per 1 of 5 fruits): <strong>{cProfit.dehydratorPerCropSell}g</strong></div>
                      )}
                      <div>• Best Strategy: <strong style={{ color: 'var(--sage)' }}>{cProfit.bestProcessedLabel} ({cProfit.bestGoldPerDay}g/day)</strong></div>
                    </div>
                  </div>
                );
              })()}

              {/* Fish specific breakdown */}
              {inspectedFish && (() => {
                const fVals = calculateFishValues(inspectedFish, {
                  fisher: profile.professions.fisher,
                  angler: profile.professions.angler,
                  artisan: profile.professions.artisan,
                });
                return (
                  <div className="card">
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>Angler & 1.6 Smoker Math</div>
                    <div style={{ fontSize: '0.88rem', display: 'grid', gap: 4 }}>
                      <div>• Difficulty / Behavior: <strong>{inspectedFish.difficulty}</strong> ({inspectedFish.behavior})</div>
                      <div>• Normal → Iridium: {fVals.normalSell}g → {fVals.iridiumSell}g</div>
                      {fVals.canSmoke && (
                        <div>• 1.6 Fish Smoker (Normal → Iridium): <strong style={{ color: 'var(--sage)' }}>{fVals.smokedNormal}g → {fVals.smokedIridium}g</strong></div>
                      )}
                      {fVals.agedRoeSell > 0 && (
                        <div>• Fish Pond Aged Roe: <strong>{fVals.agedRoeSell}g</strong></div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {inspectedItem.bundleIds && inspectedItem.bundleIds.length > 0 && (
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Needed in Community Center</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {inspectedItem.bundleIds.map((b) => (
                      <span key={b} className="badge badge-sage">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {inspectedItem.usedIn && inspectedItem.usedIn.length > 0 && (
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Key Uses</div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.9rem' }}>
                    {inspectedItem.usedIn.map((u) => (
                      <li key={u}>{u}</li>
                    ))}
                  </ul>
                </div>
              )}

              {(inspectedItem.lovedBy?.length || inspectedItem.likedBy?.length) && (
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Heart size={15} color="var(--crimson)" /> Villager Gift Reactions
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {inspectedItem.lovedBy?.map((name) => {
                      const v = VILLAGERS.find((x) => x.name === name || x.name.includes(name));
                      return (
                        <button
                          key={`love-${name}`}
                          type="button"
                          className="chip"
                          style={{ borderColor: 'var(--crimson)', color: 'var(--crimson)' }}
                          onClick={() => {
                            if (v) {
                              onSelectItem(null);
                              onOpenVillager(v.id);
                            }
                          }}
                        >
                          ♥ Loves: {name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Locate on Interactive Map */}
              {inspectedPins.length > 0 && (
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <MapPin size={15} color="var(--river)" /> Locate on Atlas Map
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {inspectedPins.map((pin) => (
                      <button
                        key={pin.id}
                        type="button"
                        className="btn btn-sm"
                        onClick={() => {
                          onSelectItem(null);
                          onOpenMapPin(pin.id);
                        }}
                      >
                        <MapPin size={14} /> {pin.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

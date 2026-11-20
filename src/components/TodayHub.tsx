import { useState } from 'react';
import {
  BookOpen,
  CalendarDays,
  Check,
  Compass,
  Fish,
  Gift,
  Plus,
  RotateCcw,
  ShoppingCart,
  Sprout,
  Trash2,
  Tv,
} from 'lucide-react';
import { useFarmStore } from '../state/useFarmStore';
import { CALENDAR_EVENTS, QUEEN_OF_SAUCE_SCHEDULE } from '../data/calendar';
import { VILLAGERS } from '../data/villagers';
import { FISH } from '../data/fish';
import { CROPS } from '../data/crops';
import { calculateCropProfit, getActiveBundles } from '../utils/calculations';
import { GoldCoinIcon, JunimoSealIcon, SeasonBadgeIcon } from './AlmanacIcons';

interface TodayHubProps {
  onNavigateTab: (tab: 'today' | 'encyclopedia' | 'bundles' | 'calendar' | 'friendship' | 'map' | 'guides') => void;
  onOpenItem: (itemId: string) => void;
  onOpenVillager: (villagerId: string) => void;
  onOpenMapPin: (pinId: string) => void;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function TodayHub({
  onNavigateTab,
  onOpenItem,
  onOpenVillager,
  onOpenMapPin,
}: TodayHubProps) {
  const {
    profile,
    advanceDay,
    toggleDailyChore,
    addDailyChore,
    deleteDailyChore,
    resetMorningChores,
    toggleTrackedItem,
  } = useFarmStore();

  const [newChore, setNewChore] = useState('');
  const weekday = WEEKDAYS[(profile.day - 1) % 7];
  const isCartDay = weekday === 'Fri' || weekday === 'Sun';
  const isSunday = weekday === 'Sun';
  const isWednesday = weekday === 'Wed';
  const isPierreClosed = isWednesday;

  // Birthdays today & upcoming in next 3 days
  const todaysBirthdays = VILLAGERS.filter(
    (v) => v.birthday.season === profile.season && v.birthday.day === profile.day
  );
  const upcomingBirthdays = VILLAGERS.filter(
    (v) =>
      v.birthday.season === profile.season &&
      v.birthday.day > profile.day &&
      v.birthday.day <= profile.day + 3
  );

  // Calendar events active today
  const todaysEvents = CALENDAR_EVENTS.filter(
    (e) => e.season === profile.season && profile.day >= e.startDay && profile.day <= e.endDay
  );
  const isBooksellerToday = (profile.booksellerDays[profile.season] ?? []).includes(profile.day);
  const isGreenRainToday =
    profile.weather === 'Green Rain' ||
    (profile.season === 'Summer' && profile.greenRainDay === profile.day);

  // Queen of Sauce episode (Years cycle odd/even)
  const qosYearCycle: 1 | 2 = profile.year % 2 === 1 ? 1 : 2;
  const sundayDay = isSunday ? profile.day : Math.max(7, Math.floor(profile.day / 7) * 7);
  const qosToday = QUEEN_OF_SAUCE_SCHEDULE.find(
    (q) => q.year === qosYearCycle && q.season === profile.season && q.day === (isSunday ? profile.day : sundayDay)
  );

  // Catchable Fish Today matching Season & Weather
  const catchableToday = FISH.filter((f) => {
    if (f.isCrabPot || f.isLegendaryII) return false;
    const seasonMatch = f.seasons.includes(profile.season);
    if (!seasonMatch) return false;
    if (f.weather === 'Rain') return profile.weather === 'Rain' || profile.weather === 'Storm' || profile.weather === 'Green Rain';
    if (f.weather === 'Sunny') return profile.weather === 'Sunny' || profile.weather === 'Snow';
    if (f.weather === 'Sunny/Wind') return profile.weather === 'Sunny' || profile.weather === 'Wind';
    return true;
  }).sort((a, b) => {
    const aUncaught = profile.trackedItems[a.id] ? 1 : 0;
    const bUncaught = profile.trackedItems[b.id] ? 1 : 0;
    if (aUncaught !== bUncaught) return aUncaught - bUncaught;
    const aBundle = a.bundleTags?.length ? 0 : 1;
    const bBundle = b.bundleTags?.length ? 0 : 1;
    if (aBundle !== bBundle) return aBundle - bBundle;
    return b.sellPrice - a.sellPrice;
  });

  // Plantable Crops with days left in current season
  const daysLeft = 28 - profile.day;
  const plantableCrops = CROPS.filter((c) => c.seasons.includes(profile.season) && c.id !== 'tea-leaves')
    .map((c) => ({
      crop: c,
      profit: calculateCropProfit(c, {
        currentDay: profile.day,
        tiller: profile.professions.tiller,
        artisan: profile.professions.artisan,
        agriculturist: profile.professions.agriculturist,
      }),
    }))
    .filter((entry) => entry.profit.maxHarvestsFromDay > 0)
    .sort((a, b) => b.profit.bestGoldPerDay - a.profit.bestGoldPerDay);

  // Active Bundles needing items available in current season
  const activeBundles = getActiveBundles(profile);
  const seasonalUrgentItems = activeBundles.flatMap((b) => {
    const checkedCount = b.items.filter((it) => profile.checkedBundleItems[`${b.id}:${it.id}`]).length;
    if (checkedCount >= b.slotsRequired) return [];
    return b.items
      .filter(
        (it) =>
          !profile.checkedBundleItems[`${b.id}:${it.id}`] &&
          it.seasons?.includes(profile.season)
      )
      .map((it) => ({ bundleName: b.name, room: b.room, item: it }));
  });

  const pinnedNote = profile.journalEntries.find((j) => j.pinned) ?? profile.journalEntries[0];

  const handleAddChore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChore.trim()) return;
    addDailyChore(newChore, 'Morning');
    setNewChore('');
  };

  return (
    <div>
      <header className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <SeasonBadgeIcon season={profile.season} size={26} />
            Today in the Valley — {profile.season} {profile.day} ({weekday}), Year {profile.year}
          </h1>
          <p className="page-subtitle">
            {profile.name} ({profile.farmType}) • Farmer {profile.farmerName} • {daysLeft} growing{' '}
            {daysLeft === 1 ? 'day' : 'days'} left in {profile.season}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-primary" onClick={() => advanceDay(1)}>
            End Day (+1 Morning)
          </button>
          <button type="button" className="btn" onClick={() => onNavigateTab('calendar')}>
            <CalendarDays size={16} /> Full Calendar
          </button>
        </div>
      </header>

      {/* Priority Alerts Ribbon */}
      <section className="card-elevated" style={{ marginBottom: 16 }}>
        <div className="card-header" style={{ marginBottom: 10 }}>
          <h2 className="card-title">Morning Almanac Briefing</h2>
          <span className="badge badge-neutral">{profile.weather} Weather</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {todaysBirthdays.map((v) => (
            <button
              key={v.id}
              type="button"
              className="btn btn-sm"
              style={{ borderColor: 'var(--crimson)', background: 'var(--crimson-soft)' }}
              onClick={() => onOpenVillager(v.id)}
            >
              <Gift size={15} color="var(--crimson)" />
              <strong>Birthday: {v.name}</strong> (Loves: {v.loves.slice(0, 2).join(', ')})
            </button>
          ))}

          {todaysEvents.map((ev) => (
            <button
              key={ev.id}
              type="button"
              className="btn btn-sm"
              style={{ borderColor: 'var(--gold)', background: 'var(--gold-soft)' }}
              onClick={() => (ev.mapPinId ? onOpenMapPin(ev.mapPinId) : onNavigateTab('calendar'))}
            >
              <CalendarDays size={15} color="var(--gold)" />
              <strong>{ev.name}</strong> ({ev.time})
            </button>
          ))}

          {isBooksellerToday && (
            <button
              type="button"
              className="btn btn-sm"
              style={{ borderColor: 'var(--plum)', background: 'var(--plum-soft)' }}
              onClick={() => onOpenMapPin('bookseller-hill')}
            >
              <BookOpen size={15} color="var(--plum)" />
              <strong>The Bookseller is in Town!</strong> (Cliff above Joja)
            </button>
          )}

          {isGreenRainToday && (
            <div className="callout callout-sage" style={{ flex: '1 1 100%' }}>
              <strong>Green Rain Event Today:</strong> Scythe mossy weeds & wild trees across Town,
              Forest, and Mountains for Fiber, Moss & Fiddlehead Ferns!
            </div>
          )}

          {isCartDay && (
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => onOpenMapPin('cindersap-forest')}
            >
              <ShoppingCart size={15} color="var(--sage)" />
              <strong>Traveling Cart Open</strong> (Cindersap Forest till 8pm)
            </button>
          )}

          {isSunday && qosToday && (
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => onNavigateTab('calendar')}
            >
              <Tv size={15} color="var(--river)" />
              <strong>Queen of Sauce (Sun):</strong> {qosToday.recipe}
            </button>
          )}

          {isWednesday && qosToday && (
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => onNavigateTab('calendar')}
            >
              <Tv size={15} color="var(--river)" />
              <strong>QOS Re-run (Wed)</strong> & Pierre Closed until CC complete
            </button>
          )}

          {isPierreClosed && !isWednesday && (
            <span className="badge badge-neutral">Pierre Closed Wed</span>
          )}

          {todaysBirthdays.length === 0 &&
            todaysEvents.length === 0 &&
            !isCartDay &&
            !isSunday &&
            !isBooksellerToday &&
            !isGreenRainToday && (
              <p style={{ margin: 0, color: 'var(--ink-muted)', fontSize: '0.92rem' }}>
                Quiet valley day — ideal for mining, upgrading tools (
                {profile.weather === 'Rain' ? 'rain waters your crops!' : 'check tomorrow’s TV weather'}),
                or building friendships.
                {upcomingBirthdays.length > 0 && (
                  <>
                    {' '}
                    Upcoming birthday: <strong>{upcomingBirthdays[0].name}</strong> ({profile.season}{' '}
                    {upcomingBirthdays[0].birthday.day}).
                  </>
                )}
              </p>
            )}
        </div>
      </section>

      {/* Main Two-Column Brief */}
      <div className="grid-2" style={{ alignItems: 'start', marginBottom: 16 }}>
        {/* Left: Daily Chores & Pinned Journal */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <section className="card">
            <div className="card-header">
              <h2 className="card-title">Daily Chores & Reminders</h2>
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                onClick={resetMorningChores}
                title="Reset all chore checks"
              >
                <RotateCcw size={14} /> Reset
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
              {profile.dailyChores.map((chore) => (
                <div key={chore.id} className={`check-row ${chore.done ? 'done' : ''}`}>
                  <button
                    type="button"
                    className="check-toggle"
                    aria-label={`Mark "${chore.text}" as ${chore.done ? 'incomplete' : 'done'}`}
                    onClick={() => toggleDailyChore(chore.id)}
                  >
                    {chore.done && <Check size={16} strokeWidth={3} />}
                  </button>
                  <span
                    style={{
                      flex: 1,
                      fontSize: '0.92rem',
                      textDecoration: chore.done ? 'line-through' : 'none',
                      color: chore.done ? 'var(--ink-soft)' : 'var(--ink)',
                    }}
                  >
                    {chore.text}
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    aria-label="Remove chore"
                    onClick={() => deleteDailyChore(chore.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddChore} style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                className="input"
                placeholder="Add chore (e.g. Give Clint Iron Pickaxe)..."
                value={newChore}
                onChange={(e) => setNewChore(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">
                <Plus size={16} /> Add
              </button>
            </form>
          </section>

          {/* Community Center Seasonal Urgency */}
          <section className="card">
            <div className="card-header">
              <h2 className="card-title">
                <JunimoSealIcon size={20} /> Needed This Season ({profile.season})
              </h2>
              <button type="button" className="btn btn-sm" onClick={() => onNavigateTab('bundles')}>
                Bundles
              </button>
            </div>

            {profile.bundleMode === 'Joja' ? (
              <p style={{ margin: 0, color: 'var(--ink-muted)', fontSize: '0.9rem' }}>
                Joja Development mode active. Focus on pure Gold/Day crops and Kegs!
              </p>
            ) : seasonalUrgentItems.length === 0 ? (
              <p style={{ margin: 0, color: 'var(--sage)', fontWeight: 600, fontSize: '0.92rem' }}>
                All {profile.season}-exclusive bundle requirements are checked off!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {seasonalUrgentItems.slice(0, 7).map((entry, idx) => (
                  <button
                    key={`${entry.bundleName}-${entry.item.id}-${idx}`}
                    type="button"
                    className="check-row"
                    style={{ textAlign: 'left', width: '100%' }}
                    onClick={() =>
                      entry.item.itemId ? onOpenItem(entry.item.itemId) : onNavigateTab('bundles')
                    }
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                        {entry.item.name} ×{entry.item.qty}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
                        {entry.bundleName} • {entry.item.source}
                      </div>
                    </div>
                    <span className="badge badge-gold">Due</span>
                  </button>
                ))}
                {seasonalUrgentItems.length > 7 && (
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={() => onNavigateTab('bundles')}
                  >
                    View all {seasonalUrgentItems.length} {profile.season} bundle items →
                  </button>
                )}
              </div>
            )}
          </section>

          {pinnedNote && (
            <section className="card">
              <div className="card-header">
                <h2 className="card-title">Pinned Farm Journal Note</h2>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => onNavigateTab('guides')}
                >
                  Open Journal
                </button>
              </div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{pinnedNote.title}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', marginBottom: 6 }}>
                {pinnedNote.dateStamp} • {pinnedNote.tag}
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--ink-muted)' }}>
                {pinnedNote.content}
              </p>
            </section>
          )}
        </div>

        {/* Right: Catchable Fish Today + Plantable Crops Today */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <section className="card">
            <div className="card-header">
              <h2 className="card-title">
                <Fish size={19} color="var(--river)" /> Catchable Today ({profile.weather}{' '}
                {profile.season})
              </h2>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => onNavigateTab('encyclopedia')}
              >
                All Fish
              </button>
            </div>
            <p style={{ margin: '0 0 10px', fontSize: '0.84rem', color: 'var(--ink-muted)' }}>
              Sorted by uncaught collection status & highest value. Tap any fish for locations &
              Fish Smoker prices.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {catchableToday.slice(0, 7).map((fish) => {
                const caught = Boolean(profile.trackedItems[fish.id]);
                return (
                  <div key={fish.id} className={`check-row ${caught ? 'done' : ''}`}>
                    <button
                      type="button"
                      className="check-toggle"
                      title={caught ? 'Caught' : 'Mark caught'}
                      onClick={() => toggleTrackedItem(fish.id)}
                    >
                      {caught && <Check size={15} strokeWidth={3} />}
                    </button>
                    <button
                      type="button"
                      style={{
                        flex: 1,
                        border: 'none',
                        background: 'transparent',
                        textAlign: 'left',
                        padding: 0,
                      }}
                      onClick={() => onOpenItem(fish.id)}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                        {fish.name}{' '}
                        {fish.isLegendary && <span className="badge badge-gold">Legendary</span>}
                        {fish.bundleTags?.length ? (
                          <span className="badge badge-sage" style={{ marginLeft: 4 }}>
                            Bundle
                          </span>
                        ) : null}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
                        {fish.locations[0]} • {fish.timeWindow} • {fish.weather}
                      </div>
                    </button>
                    <span className="tabular-nums" style={{ fontWeight: 700, fontSize: '0.86rem' }}>
                      {fish.sellPrice}
                      <GoldCoinIcon size={13} />
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="card">
            <div className="card-header">
              <h2 className="card-title">
                <Sprout size={19} color="var(--sage)" /> Still Plantable Today ({daysLeft}d left)
              </h2>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => onNavigateTab('encyclopedia')}
              >
                Profit Calc
              </button>
            </div>
            {plantableCrops.length === 0 ? (
              <p style={{ margin: 0, color: 'var(--ink-muted)', fontSize: '0.9rem' }}>
                No standard outdoor {profile.season} crops mature in the remaining {daysLeft} days
                (use Speed-Gro, or prepare seeds & Fertilizer for next season!).
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {plantableCrops.slice(0, 6).map(({ crop, profit }) => (
                  <button
                    key={crop.id}
                    type="button"
                    className="check-row"
                    style={{ width: '100%', textAlign: 'left' }}
                    onClick={() => onOpenItem(crop.id)}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                        {crop.name}{' '}
                        <span className="badge badge-neutral" style={{ marginLeft: 4 }}>
                          {profit.effectiveGrowDays}d grow
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
                        Up to {profit.maxHarvestsFromDay}× harvest • {profit.bestProcessedLabel}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="tabular-nums" style={{ fontWeight: 700, color: 'var(--sage)' }}>
                        +{profit.bestGoldPerDay}g/d
                      </div>
                      <div className="tabular-nums" style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>
                        Raw: {profit.rawGoldPerDay}g/d
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="card">
            <div className="card-header">
              <h2 className="card-title">
                <Compass size={19} color="var(--wood)" /> Quick Almanac Jumps
              </h2>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <button type="button" className="btn btn-sm" onClick={() => onNavigateTab('map')}>
                Valley & Ginger Island Map
              </button>
              <button type="button" className="btn btn-sm" onClick={() => onNavigateTab('friendship')}>
                34 Villagers & Heart Events
              </button>
              <button type="button" className="btn btn-sm" onClick={() => onNavigateTab('guides')}>
                1.6 Perfection Tracker
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

import { useMemo, useState } from 'react';
import {
  BookOpen,
  CalendarPlus,
  Check,
  CloudRain,
  Gift,
  MapPin,
  ShoppingCart,
  Trash2,
  Tv,
} from 'lucide-react';
import type { Season } from '../types/stardew';
import { useFarmStore } from '../state/useFarmStore';
import {
  BOOKSELLER_INFO,
  CALENDAR_EVENTS,
  GREEN_RAIN_INFO,
  QUEEN_OF_SAUCE_SCHEDULE,
} from '../data/calendar';
import { VILLAGERS } from '../data/villagers';
import { findCatalogItemByName } from '../data/items';
import { SeasonBadgeIcon } from './AlmanacIcons';

interface CalendarViewProps {
  onOpenVillager: (villagerId: string) => void;
  onOpenMapPin: (pinId: string) => void;
  onOpenItem: (itemId: string) => void;
}

const SEASONS: Season[] = ['Spring', 'Summer', 'Fall', 'Winter'];
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function CalendarView({
  onOpenVillager,
  onOpenMapPin,
  onOpenItem,
}: CalendarViewProps) {
  const {
    profile,
    setCalendarDate,
    addReminder,
    deleteReminder,
    toggleBooksellerDay,
    setGreenRainDay,
  } = useFarmStore();

  const [viewSeason, setViewSeason] = useState<Season>(profile.season);
  const [selectedDay, setSelectedDay] = useState<number>(profile.day);
  const [qosCycle, setQosCycle] = useState<1 | 2>(profile.year % 2 === 1 ? 1 : 2);
  const [newReminderText, setNewReminderText] = useState('');

  const days = useMemo(() => Array.from({ length: 28 }, (_, idx) => idx + 1), []);

  const getWeekday = (d: number) => WEEKDAYS[(d - 1) % 7];

  const getDayData = (season: Season, day: number) => {
    const weekday = getWeekday(day);
    const birthdays = VILLAGERS.filter(
      (v) => v.birthday.season === season && v.birthday.day === day
    );
    const events = CALENDAR_EVENTS.filter(
      (e) => e.season === season && day >= e.startDay && day <= e.endDay
    );
    const isBookseller = (profile.booksellerDays[season] ?? []).includes(day);
    const isPossibleBookseller = BOOKSELLER_INFO.possibleDaysBySeason[season].includes(day);
    const isGreenRain = season === 'Summer' && profile.greenRainDay === day;
    const isCart = weekday === 'Fri' || weekday === 'Sun';
    const isSunday = weekday === 'Sun';
    const isWednesday = weekday === 'Wed';
    const qos = isSunday
      ? QUEEN_OF_SAUCE_SCHEDULE.find(
          (q) => q.year === qosCycle && q.season === season && q.day === day
        )
      : null;
    const reminders = profile.reminders.filter((r) => r.season === season && r.day === day);
    return {
      weekday,
      birthdays,
      events,
      isBookseller,
      isPossibleBookseller,
      isGreenRain,
      isCart,
      isSunday,
      isWednesday,
      qos,
      reminders,
    };
  };

  const selectedData = getDayData(viewSeason, selectedDay);

  const seasonBirthdays = useMemo(
    () =>
      VILLAGERS.filter((v) => v.birthday.season === viewSeason).sort(
        (a, b) => a.birthday.day - b.birthday.day
      ),
    [viewSeason]
  );

  const seasonQos = useMemo(
    () =>
      QUEEN_OF_SAUCE_SCHEDULE.filter((q) => q.season === viewSeason && q.year === qosCycle),
    [viewSeason, qosCycle]
  );

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminderText.trim()) return;
    addReminder(viewSeason, selectedDay, newReminderText);
    setNewReminderText('');
  };

  return (
    <div>
      <header className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <SeasonBadgeIcon season={viewSeason} size={28} />
            {viewSeason} Valley Calendar (28 Days)
          </h1>
          <p className="page-subtitle">
            Festivals, 1.6 Multi-Day Events (Desert Festival, Trout Derby, SquidFest), Queen of Sauce, Bookseller &amp; Birthdays.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="segmented-bar" role="group" aria-label="Season">
            {SEASONS.map((s) => (
              <button
                key={s}
                type="button"
                className={`seg-btn ${viewSeason === s ? 'active' : ''}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                onClick={() => setViewSeason(s)}
              >
                <SeasonBadgeIcon season={s} size={15} /> {s}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="btn btn-sm"
            onClick={() => {
              setViewSeason(profile.season);
              setSelectedDay(profile.day);
            }}
          >
            Jump to Today ({profile.season} {profile.day})
          </button>
        </div>
      </header>

      {/* Main Split: Calendar Grid + Day Inspector */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.65fr) minmax(300px, 1fr)',
          gap: 16,
          alignItems: 'start',
          marginBottom: 18,
        }}
        className="calendar-responsive-grid"
      >
        <style>{`
          @media (max-width: 1060px) {
            .calendar-responsive-grid {
              grid-template-columns: minmax(0, 1fr) !important;
            }
          }
        `}</style>

        <section className="card">
          {/* Legend + Year Cycle */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              gap: 8,
              marginBottom: 12,
              alignItems: 'center',
            }}
          >
            <div className="chip-row" style={{ gap: 6 }}>
              <span className="badge badge-crimson">Birthday</span>
              <span className="badge badge-gold">Festival / 1.6 Event</span>
              <span className="badge badge-sage">Forage / Green Rain</span>
              <span className="badge badge-plum">Bookseller Balloon</span>
              <span className="badge badge-river">Cart / Queen of Sauce</span>
            </div>
            <div className="segmented-bar">
              <button
                type="button"
                className={`seg-btn ${qosCycle === 1 ? 'active' : ''}`}
                style={{ minHeight: 32, padding: '3px 10px', fontSize: '0.78rem' }}
                onClick={() => setQosCycle(1)}
              >
                TV: Odd Yrs (Y1)
              </button>
              <button
                type="button"
                className={`seg-btn ${qosCycle === 2 ? 'active' : ''}`}
                style={{ minHeight: 32, padding: '3px 10px', fontSize: '0.78rem' }}
                onClick={() => setQosCycle(2)}
              >
                TV: Even Yrs (Y2)
              </button>
            </div>
          </div>

          <div className="calendar-weekdays">
            {WEEKDAYS.map((w) => (
              <div key={w} className="calendar-weekday">
                {w}
              </div>
            ))}
          </div>

          <div className="calendar-grid">
            {days.map((day) => {
              const info = getDayData(viewSeason, day);
              const isToday = viewSeason === profile.season && day === profile.day;
              const isSelected = day === selectedDay;

              return (
                <button
                  key={day}
                  type="button"
                  className={`cal-cell ${isToday ? 'is-today' : ''} ${
                    isSelected ? 'is-selected' : ''
                  }`}
                  onClick={() => setSelectedDay(day)}
                >
                  <div className="cal-day-num">
                    <span>{day}</span>
                    <span style={{ display: 'inline-flex', gap: 3, alignItems: 'center' }}>
                      {info.isBookseller && (
                        <span
                          title="Bookseller Balloon Day"
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: 'var(--plum)',
                            display: 'inline-block',
                          }}
                        />
                      )}
                      {info.isCart && (
                        <span
                          title="Traveling Cart Day"
                          style={{ fontSize: '0.68rem', color: 'var(--sage)' }}
                        >
                          Cart
                        </span>
                      )}
                    </span>
                  </div>

                  {info.birthdays.map((b) => (
                    <span key={b.id} className="cal-tag badge-crimson">
                      🎂 {b.name}
                    </span>
                  ))}

                  {info.events.slice(0, 2).map((ev) => (
                    <span
                      key={ev.id}
                      className={`cal-tag ${
                        ev.type === 'Foraging Window' ? 'badge-sage' : 'badge-gold'
                      }`}
                    >
                      {ev.name}
                    </span>
                  ))}

                  {info.isGreenRain && (
                    <span className="cal-tag badge-sage">☔ Green Rain</span>
                  )}

                  {info.isBookseller && (
                    <span className="cal-tag badge-plum">🎈 Bookseller</span>
                  )}

                  {info.qos && (
                    <span className="cal-tag badge-river">📺 {info.qos.recipe}</span>
                  )}

                  {info.reminders.length > 0 && (
                    <span className="cal-tag badge-neutral">📌 Note ({info.reminders.length})</span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Right: Selected Day Inspector */}
        <aside className="card-elevated" style={{ position: 'sticky', top: 82 }}>
          <div className="card-header">
            <div>
              <h2 className="card-title">
                {viewSeason} {selectedDay} ({selectedData.weekday})
              </h2>
              {viewSeason === profile.season && selectedDay === profile.day && (
                <span className="badge badge-sage" style={{ marginTop: 4 }}>
                  Current Farm Day
                </span>
              )}
            </div>
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={() => setCalendarDate(viewSeason, selectedDay)}
            >
              <Check size={14} /> Set Today
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Birthdays */}
            {selectedData.birthdays.map((v) => (
              <div
                key={v.id}
                className="card"
                style={{ borderColor: 'var(--crimson)', padding: 12 }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 6,
                  }}
                >
                  <strong style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--crimson)' }}>
                    <Gift size={16} /> {v.name}&apos;s Birthday (8× Gift Bonus!)
                  </strong>
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={() => onOpenVillager(v.id)}
                  >
                    Profile
                  </button>
                </div>
                <div style={{ fontSize: '0.84rem', marginBottom: 6 }}>
                  <strong>Loves:</strong>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {v.loves.slice(0, 6).map((gift) => {
                    const match = findCatalogItemByName(gift);
                    return (
                      <button
                        key={gift}
                        type="button"
                        className="chip"
                        style={{ minHeight: 28, fontSize: '0.76rem' }}
                        onClick={() => match && onOpenItem(match.id)}
                      >
                        ♥ {gift}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Events */}
            {selectedData.events.map((ev) => (
              <div key={ev.id} className="callout">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.96rem' }}>{ev.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
                      {ev.type} • {ev.time} • {ev.location}
                    </div>
                  </div>
                  {ev.mapPinId && (
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => onOpenMapPin(ev.mapPinId!)}
                    >
                      <MapPin size={14} /> Map
                    </button>
                  )}
                </div>
                <p style={{ margin: '6px 0', fontSize: '0.86rem' }}>{ev.description}</p>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.83rem' }}>
                  {ev.highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </div>
            ))}

            {/* TV & Cart */}
            {(selectedData.isCart || selectedData.qos || selectedData.isWednesday) && (
              <div className="card" style={{ padding: 12 }}>
                {selectedData.isCart && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.88rem' }}>
                      <ShoppingCart size={15} color="var(--sage)" /> Traveling Cart (6am–8pm)
                    </span>
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => onOpenMapPin('cindersap-forest')}
                    >
                      Map
                    </button>
                  </div>
                )}
                {selectedData.qos && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.88rem' }}>
                    <Tv size={15} color="var(--river)" />
                    <span>
                      Queen of Sauce (Y{qosCycle}): <strong>{selectedData.qos.recipe}</strong>
                    </span>
                  </div>
                )}
                {selectedData.isWednesday && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.86rem', color: 'var(--ink-muted)' }}>
                    <Tv size={15} color="var(--river)" />
                    Queen of Sauce Re-run (unlearned recipes) &amp; Pierre&apos;s Closed pre-CC.
                  </div>
                )}
              </div>
            )}

            {/* 1.6 Bookseller Toggle */}
            <div className="card" style={{ padding: 12 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <span style={{ fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <BookOpen size={15} color="var(--plum)" /> 1.6 Bookseller Balloon
                </span>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => onOpenMapPin('bookseller-hill')}
                >
                  Spot
                </button>
              </div>
              <p style={{ margin: '0 0 8px', fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
                Possible {viewSeason} days:{' '}
                <strong>{BOOKSELLER_INFO.possibleDaysBySeason[viewSeason].join(', ')}</strong>. Mark your save&apos;s 2 Balloon days:
              </p>
              <button
                type="button"
                className={`btn btn-sm ${selectedData.isBookseller ? 'btn-primary' : ''}`}
                style={{ width: '100%' }}
                onClick={() => toggleBooksellerDay(viewSeason, selectedDay)}
              >
                {selectedData.isBookseller
                  ? `Balloon Marked on ${viewSeason} ${selectedDay} (Tap to Remove)`
                  : `Mark Bookseller Balloon on ${viewSeason} ${selectedDay}`}
              </button>
            </div>

            {/* 1.6 Green Rain Marker in Summer */}
            {viewSeason === 'Summer' && (
              <div className="card" style={{ padding: 12 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    marginBottom: 6,
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CloudRain size={15} color="var(--sage)" /> Summer Green Rain (1.6)
                  </span>
                </div>
                <p style={{ margin: '0 0 8px', fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
                  Possible days: {GREEN_RAIN_INFO.possibleDays.join(', ')}. Once the Weather Report predicts an anomaly, mark it:
                </p>
                <button
                  type="button"
                  className={`btn btn-sm ${selectedData.isGreenRain ? 'btn-primary' : ''}`}
                  style={{ width: '100%' }}
                  onClick={() =>
                    setGreenRainDay(selectedData.isGreenRain ? null : selectedDay)
                  }
                >
                  {selectedData.isGreenRain
                    ? `Green Rain Marked Summer ${selectedDay} (Clear)`
                    : `Mark Green Rain on Summer ${selectedDay}`}
                </button>
                {selectedData.isGreenRain && (
                  <ul style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: '0.8rem' }}>
                    {GREEN_RAIN_INFO.checklist.map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Custom User Reminders */}
            <div className="card" style={{ padding: 12 }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 8 }}>
                Custom Farm Reminders ({viewSeason} {selectedDay})
              </div>
              {selectedData.reminders.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
                  {selectedData.reminders.map((rem) => (
                    <div
                      key={rem.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                        padding: '6px 9px',
                        borderRadius: 8,
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--wood-border)',
                        fontSize: '0.85rem',
                      }}
                    >
                      <span>{rem.text}</span>
                      <button
                        type="button"
                        className="btn btn-sm btn-ghost"
                        aria-label="Delete reminder"
                        onClick={() => deleteReminder(rem.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <form onSubmit={handleAddReminder} style={{ display: 'flex', gap: 6 }}>
                <input
                  type="text"
                  className="input"
                  placeholder="Reminder (e.g. Harvest Pumpkins)..."
                  value={newReminderText}
                  onChange={(e) => setNewReminderText(e.target.value)}
                />
                <button type="submit" className="btn btn-sm btn-primary" aria-label="Add reminder">
                  <CalendarPlus size={15} />
                </button>
              </form>
            </div>
          </div>
        </aside>
      </div>

      {/* Season Reference Tables Below */}
      <div className="grid-2">
        <section className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Gift size={18} color="var(--crimson)" /> All {viewSeason} Birthdays ({seasonBirthdays.length})
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {seasonBirthdays.map((v) => (
              <button
                key={v.id}
                type="button"
                className="check-row"
                style={{ width: '100%', textAlign: 'left', alignItems: 'center' }}
                onClick={() => onOpenVillager(v.id)}
              >
                <span className="badge badge-crimson tabular-nums">
                  {viewSeason.slice(0, 3)} {v.birthday.day}
                </span>
                <strong style={{ minWidth: 92 }}>{v.name}</strong>
                <span style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', flex: 1 }}>
                  Loves: {v.loves.slice(0, 3).join(', ')}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Tv size={18} color="var(--river)" /> {viewSeason} Queen of Sauce &amp; 1.6 Highlights
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            {seasonQos.map((ep) => (
              <div key={`${ep.year}-${ep.day}`} className="check-row" style={{ alignItems: 'center' }}>
                <span className="badge badge-river tabular-nums">
                  Sun {ep.day} (Y{ep.year})
                </span>
                <strong style={{ flex: 1 }}>{ep.recipe}</strong>
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  onClick={() => {
                    const found = findCatalogItemByName(ep.recipe);
                    if (found) onOpenItem(found.id);
                  }}
                >
                  Recipe Card
                </button>
              </div>
            ))}
          </div>

          <div className="callout">
            <strong>{BOOKSELLER_INFO.title}:</strong> {BOOKSELLER_INFO.summary}
          </div>
        </section>
      </div>
    </div>
  );
}

import { useMemo, useState } from 'react';
import {
  Award,
  BookOpen,
  Check,
  NotebookPen,
  Pin,
  PinOff,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import type { GuideArticle, JournalEntry } from '../types/stardew';
import { useFarmStore } from '../state/useFarmStore';
import { GUIDES, MONSTER_GOALS, PERFECTION_BREAKDOWN, STARDROPS } from '../data/guides';
import { calculatePerfection } from '../utils/calculations';

interface GuidesJournalViewProps {
  onOpenMapPin: (pinId: string) => void;
}

type SubTab = 'perfection' | 'guides' | 'journal';
const GUIDE_CATS: ('All' | GuideArticle['category'])[] = [
  'All',
  'Starter',
  'Profit',
  'Fishing',
  'Mining',
  'Update 1.6',
  'Late Game',
];
const JOURNAL_TAGS: JournalEntry['tag'][] = [
  'Farming',
  'Mining',
  'Goals',
  'Gifts',
  'Shopping',
  'Secrets',
  'General',
];

export function GuidesJournalView({ onOpenMapPin }: GuidesJournalViewProps) {
  const {
    profile,
    updateProfile,
    addJournalEntry,
    toggleJournalPin,
    deleteJournalEntry,
    toggleGuideCheck,
  } = useFarmStore();

  const [subTab, setSubTab] = useState<SubTab>('perfection');
  const [guideCat, setGuideCat] = useState<'All' | GuideArticle['category']>('All');
  const [guideSearch, setGuideSearch] = useState('');
  const [activeGuideId, setActiveGuideId] = useState<string>(GUIDES[0].id);

  // Journal form state
  const [jTitle, setJTitle] = useState('');
  const [jTag, setJTag] = useState<JournalEntry['tag']>('Goals');
  const [jContent, setJContent] = useState('');
  const [jPinned, setJPinned] = useState(false);
  const [jFilterTag, setJFilterTag] = useState<'All' | JournalEntry['tag']>('All');
  const [jSearch, setJSearch] = useState('');

  const perfection = useMemo(() => calculatePerfection(profile), [profile]);

  const toggleStardrop = (id: string) => {
    updateProfile((prev) => ({
      ...prev,
      stardropsFound: {
        ...prev.stardropsFound,
        [id]: !prev.stardropsFound[id],
      },
    }));
  };

  const toggleMonsterGoal = (goalId: string) => {
    const checkKey = `monster:${goalId}`;
    updateProfile((prev) => {
      const nextDone = {
        ...prev.guideChecklistDone,
        [checkKey]: !prev.guideChecklistDone[checkKey],
      };
      const count = MONSTER_GOALS.filter((m) => nextDone[`monster:${m.id}`]).length;
      return {
        ...prev,
        guideChecklistDone: nextDone,
        monsterGoalsDone: count,
      };
    });
  };

  const adjustPerfectionField = (
    field: 'goldenWalnuts' | 'obelisksCount' | 'monsterGoalsDone',
    delta: number,
    max: number
  ) => {
    updateProfile((prev) => ({
      ...prev,
      [field]: Math.max(0, Math.min(max, prev[field] + delta)),
    }));
  };

  const filteredGuides = useMemo(() => {
    const q = guideSearch.trim().toLowerCase();
    return GUIDES.filter((g) => {
      if (guideCat !== 'All' && g.category !== guideCat) return false;
      if (!q) return true;
      const hay = [
        g.title,
        g.summary,
        ...g.sections.flatMap((s) => [s.heading, s.body, ...(s.bullets ?? [])]),
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [guideCat, guideSearch]);

  const activeGuide =
    filteredGuides.find((g) => g.id === activeGuideId) ?? filteredGuides[0] ?? GUIDES[0];

  const filteredJournal = useMemo(() => {
    const q = jSearch.trim().toLowerCase();
    return [...profile.journalEntries]
      .sort((a, b) => {
        if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1;
        return b.createdAt - a.createdAt;
      })
      .filter((entry) => {
        if (jFilterTag !== 'All' && entry.tag !== jFilterTag) return false;
        if (!q) return true;
        return (
          entry.title.toLowerCase().includes(q) || entry.content.toLowerCase().includes(q)
        );
      });
  }, [profile.journalEntries, jFilterTag, jSearch]);

  const handleAddJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jTitle.trim() && !jContent.trim()) return;
    addJournalEntry({
      title: jTitle.trim() || `${profile.season} ${profile.day} Note`,
      dateStamp: `${profile.season} ${profile.day}, Year ${profile.year}`,
      tag: jTag,
      content: jContent.trim(),
      pinned: jPinned,
    });
    setJTitle('');
    setJContent('');
    setJPinned(false);
  };

  return (
    <div>
      <header className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BookOpen size={26} color="var(--wood)" />
            Perfection (1.6), Field Guides &amp; Farm Journal
          </h1>
          <p className="page-subtitle">
            Track Stardrops, Monster Slayer goals, Mr. Qi&apos;s Perfection meter, step-by-step Year 1 guides, and personal farm logs.
          </p>
        </div>

        <div className="segmented-bar" role="group" aria-label="Guides section">
          <button
            type="button"
            className={`seg-btn ${subTab === 'perfection' ? 'active' : ''}`}
            onClick={() => setSubTab('perfection')}
          >
            <Award size={15} /> Perfection ({perfection.overallPercent}%)
          </button>
          <button
            type="button"
            className={`seg-btn ${subTab === 'guides' ? 'active' : ''}`}
            onClick={() => setSubTab('guides')}
          >
            <BookOpen size={15} /> Field Guides ({GUIDES.length})
          </button>
          <button
            type="button"
            className={`seg-btn ${subTab === 'journal' ? 'active' : ''}`}
            onClick={() => setSubTab('journal')}
          >
            <NotebookPen size={15} /> Journal ({profile.journalEntries.length})
          </button>
        </div>
      </header>

      {/* ==================== TAB 1: PERFECTION ==================== */}
      {subTab === 'perfection' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <section className="card-elevated">
            <div className="card-header">
              <div>
                <h2 className="card-title">Qi Perfection Tracker Estimate</h2>
                <div style={{ fontSize: '0.84rem', color: 'var(--ink-muted)' }}>
                  Auto-computes from tracked Almanac items, Villager hearts, Stardrops &amp; counters below.
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => onOpenMapPin('qi-walnut-room')}
                >
                  Qi&apos;s Walnut Room
                </button>
                <span className="badge badge-gold tabular-nums" style={{ fontSize: '1.05rem', padding: '6px 12px' }}>
                  {perfection.overallPercent}%
                </span>
              </div>
            </div>

            <div className="progress-track" style={{ height: 14, marginBottom: 14 }}>
              <div
                className="progress-fill"
                style={{ width: `${perfection.overallPercent}%`, background: 'var(--gold)' }}
              />
            </div>

            {/* Quick Interactive Counters */}
            <div className="grid-auto">
              <div className="card" style={{ padding: 12 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink-soft)' }}>
                  GOLDEN WALNUTS (5% WEIGHT)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                  <strong className="tabular-nums" style={{ fontSize: '1.15rem' }}>
                    {profile.goldenWalnuts} / 130
                  </strong>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => adjustPerfectionField('goldenWalnuts', -5, 130)}
                    >
                      -5
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => adjustPerfectionField('goldenWalnuts', 1, 130)}
                    >
                      +1
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => adjustPerfectionField('goldenWalnuts', 5, 130)}
                    >
                      +5
                    </button>
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: 12 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink-soft)' }}>
                  WIZARD OBELISKS (4% WEIGHT)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                  <strong className="tabular-nums" style={{ fontSize: '1.15rem' }}>
                    {profile.obelisksCount} / 4
                  </strong>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => adjustPerfectionField('obelisksCount', -1, 4)}
                    >
                      -1
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => adjustPerfectionField('obelisksCount', 1, 4)}
                    >
                      +1
                    </button>
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: 12 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink-soft)' }}>
                  MONSTER GOALS (10% WEIGHT)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                  <strong className="tabular-nums" style={{ fontSize: '1.15rem' }}>
                    {profile.monsterGoalsDone} / 12
                  </strong>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => adjustPerfectionField('monsterGoalsDone', -1, 12)}
                    >
                      -1
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => adjustPerfectionField('monsterGoalsDone', 1, 12)}
                    >
                      +1
                    </button>
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: 12 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink-soft)' }}>
                  GOLD CLOCK (10% WEIGHT)
                </div>
                <div style={{ marginTop: 6 }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${profile.goldenClockBuilt ? 'btn-primary' : ''}`}
                    style={{ width: '100%' }}
                    onClick={() =>
                      updateProfile((prev) => ({
                        ...prev,
                        goldenClockBuilt: !prev.goldenClockBuilt,
                      }))
                    }
                  >
                    {profile.goldenClockBuilt ? 'Built (10,000,000g ✓)' : 'Mark Gold Clock Built'}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Breakdown Bars */}
          <section className="card">
            <h3 className="card-title" style={{ marginBottom: 12 }}>
              Official Perfection Category Breakdown
            </h3>
            <div className="grid-2">
              {perfection.parts.map((part, idx) => {
                const ref = PERFECTION_BREAKDOWN[idx];
                const pct = Math.min(100, Math.round((part.current / part.total) * 100));
                return (
                  <div key={part.id} className="card-elevated" style={{ padding: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <strong style={{ fontSize: '0.9rem' }}>{part.label}</strong>
                      <span className="tabular-nums" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                        {part.current}/{part.total} (+{part.earnedWeight}/{part.weight}%)
                      </span>
                    </div>
                    <div className="progress-track" style={{ height: 7, marginBottom: 5 }}>
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    {ref && (
                      <div style={{ fontSize: '0.76rem', color: 'var(--ink-soft)' }}>{ref.note}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Stardrops & Monster Eradication */}
          <div className="grid-2" style={{ alignItems: 'start' }}>
            <section className="card">
              <div className="card-header">
                <h3 className="card-title">All 7 Stardrops (+34 Energy Each)</h3>
                <span className="badge badge-plum tabular-nums">
                  {STARDROPS.filter((s) => profile.stardropsFound[s.id]).length}/7
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {STARDROPS.map((sd) => {
                  const found = Boolean(profile.stardropsFound[sd.id]);
                  return (
                    <div key={sd.id} className={`check-row ${found ? 'done' : ''}`}>
                      <button
                        type="button"
                        className="check-toggle"
                        aria-label={`Toggle ${sd.name}`}
                        onClick={() => toggleStardrop(sd.id)}
                      >
                        {found && <Check size={16} strokeWidth={3} />}
                      </button>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{sd.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
                          {sd.source}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--sage)', marginTop: 2 }}>
                          Tip: {sd.tip}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="card">
              <div className="card-header">
                <h3 className="card-title">Monster Eradication Goals (Gil Rewards)</h3>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => onOpenMapPin('adventurers-guild')}
                >
                  Guild
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {MONSTER_GOALS.map((mg) => {
                  const done = Boolean(profile.guideChecklistDone[`monster:${mg.id}`]);
                  return (
                    <div key={mg.id} className={`check-row ${done ? 'done' : ''}`}>
                      <button
                        type="button"
                        className="check-toggle"
                        aria-label={`Toggle ${mg.target}`}
                        onClick={() => toggleMonsterGoal(mg.id)}
                      >
                        {done && <Check size={16} strokeWidth={3} />}
                      </button>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
                          <strong style={{ fontSize: '0.9rem' }}>
                            {mg.count}× {mg.target}
                          </strong>
                          <span className="badge badge-gold">{mg.reward}</span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
                          Where: {mg.where}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: FIELD GUIDES ==================== */}
      {subTab === 'guides' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <section className="card">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
              <div className="search-wrap">
                <Search size={17} />
                <input
                  type="search"
                  className="input"
                  placeholder="Search guides (e.g. Fish Smoker, Skull Cavern, Tea Sapling, Mastery)..."
                  value={guideSearch}
                  onChange={(e) => setGuideSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="chip-row">
              {GUIDE_CATS.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`chip ${guideCat === cat ? 'active' : ''}`}
                  onClick={() => setGuideCat(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </section>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(240px, 0.9fr) minmax(0, 1.8fr)',
              gap: 16,
              alignItems: 'start',
            }}
            className="guides-split"
          >
            <style>{`
              @media (max-width: 900px) {
                .guides-split {
                  grid-template-columns: minmax(0, 1fr) !important;
                }
              }
            `}</style>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {filteredGuides.map((g) => {
                const isSelected = g.id === activeGuide.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    className={isSelected ? 'card-elevated' : 'card'}
                    style={{
                      textAlign: 'left',
                      borderColor: isSelected ? 'var(--sage)' : undefined,
                    }}
                    onClick={() => setActiveGuideId(g.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6, marginBottom: 4 }}>
                      <span className="badge badge-sage">{g.category}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>{g.readTime}</span>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '0.96rem', marginBottom: 4 }}>{g.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>{g.summary}</div>
                  </button>
                );
              })}
            </div>

            {activeGuide && (
              <article className="card-elevated" style={{ padding: 20 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <span className="badge badge-sage">{activeGuide.category}</span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--ink-soft)' }}>
                    {activeGuide.readTime}
                  </span>
                </div>
                <h2 style={{ margin: '0 0 6px', fontSize: '1.45rem' }}>{activeGuide.title}</h2>
                <p style={{ margin: '0 0 18px', color: 'var(--ink-muted)' }}>{activeGuide.summary}</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {activeGuide.sections.map((sec) => (
                    <section key={sec.heading}>
                      <h3 style={{ margin: '0 0 6px', fontSize: '1.08rem', color: 'var(--wood-dark)' }}>
                        {sec.heading}
                      </h3>
                      <p style={{ margin: '0 0 8px', fontSize: '0.93rem' }}>{sec.body}</p>
                      {sec.bullets && (
                        <ul style={{ margin: 0, paddingLeft: 20, fontSize: '0.9rem', display: 'grid', gap: 5 }}>
                          {sec.bullets.map((b) => (
                            <li key={b}>{b}</li>
                          ))}
                        </ul>
                      )}
                      {sec.callout && (
                        <div className="callout callout-sage" style={{ marginTop: 10 }}>
                          {sec.callout}
                        </div>
                      )}
                    </section>
                  ))}

                  {activeGuide.checklist && activeGuide.checklist.length > 0 && (
                    <section>
                      <h3 style={{ margin: '0 0 10px', fontSize: '1.04rem' }}>
                        Actionable Checklist
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                        {activeGuide.checklist.map((item) => {
                          const done = Boolean(profile.guideChecklistDone[item.id]);
                          return (
                            <div key={item.id} className={`check-row ${done ? 'done' : ''}`}>
                              <button
                                type="button"
                                className="check-toggle"
                                aria-label={`Toggle ${item.text}`}
                                onClick={() => toggleGuideCheck(item.id)}
                              >
                                {done && <Check size={16} strokeWidth={3} />}
                              </button>
                              <span style={{ fontSize: '0.92rem' }}>{item.text}</span>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  )}
                </div>
              </article>
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB 3: FARM JOURNAL ==================== */}
      {subTab === 'journal' && (
        <div className="grid-2" style={{ alignItems: 'start' }}>
          <section className="card-elevated">
            <h2 className="card-title" style={{ marginBottom: 12 }}>
              New Almanac Journal Entry
            </h2>
            <form onSubmit={handleAddJournal} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                type="text"
                className="input"
                placeholder="Note title (e.g. Fall Crops Fertilizer Plan)..."
                value={jTitle}
                onChange={(e) => setJTitle(e.target.value)}
              />

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <select
                  className="select"
                  style={{ flex: 1, minWidth: 140 }}
                  value={jTag}
                  onChange={(e) => setJTag(e.target.value as JournalEntry['tag'])}
                >
                  {JOURNAL_TAGS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <span className="badge badge-neutral">
                  Stamped: {profile.season} {profile.day}, Y{profile.year}
                </span>
              </div>

              <textarea
                className="textarea"
                placeholder="Write notes on crop layouts, mine goals, Skull Cavern prep, or villagers to gift..."
                value={jContent}
                onChange={(e) => setJContent(e.target.value)}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  className={`chip ${jPinned ? 'active' : ''}`}
                  onClick={() => setJPinned((v) => !v)}
                >
                  <Pin size={14} /> {jPinned ? 'Pinned to Today Hub' : 'Pin Note'}
                </button>
                <button type="submit" className="btn btn-primary">
                  <Plus size={16} /> Save Journal Entry
                </button>
              </div>
            </form>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="card">
              <div className="search-wrap" style={{ marginBottom: 8 }}>
                <Search size={16} />
                <input
                  type="search"
                  className="input"
                  placeholder="Search journal entries..."
                  value={jSearch}
                  onChange={(e) => setJSearch(e.target.value)}
                />
              </div>
              <div className="chip-row">
                <button
                  type="button"
                  className={`chip ${jFilterTag === 'All' ? 'active' : ''}`}
                  onClick={() => setJFilterTag('All')}
                >
                  All
                </button>
                {JOURNAL_TAGS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`chip ${jFilterTag === t ? 'active' : ''}`}
                    onClick={() => setJFilterTag(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {filteredJournal.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: 28 }}>
                <p style={{ margin: 0, color: 'var(--ink-muted)' }}>No journal entries yet.</p>
              </div>
            ) : (
              filteredJournal.map((entry) => (
                <article
                  key={entry.id}
                  className="card"
                  style={{ borderColor: entry.pinned ? 'var(--gold)' : undefined }}
                >
                  <div className="card-header" style={{ marginBottom: 6 }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem' }}>{entry.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--ink-soft)' }}>
                        {entry.dateStamp} • <span className="badge badge-neutral">{entry.tag}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        type="button"
                        className="btn btn-sm btn-ghost"
                        title={entry.pinned ? 'Unpin' : 'Pin to Today Hub'}
                        onClick={() => toggleJournalPin(entry.id)}
                      >
                        {entry.pinned ? <PinOff size={15} color="var(--gold)" /> : <Pin size={15} />}
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-ghost"
                        aria-label="Delete entry"
                        onClick={() => deleteJournalEntry(entry.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
                    {entry.content}
                  </p>
                </article>
              ))
            )}
          </section>
        </div>
      )}
    </div>
  );
}

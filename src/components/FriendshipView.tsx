import { useMemo, useState } from 'react';
import {
  Check,
  Eye,
  EyeOff,
  Gift,
  Heart,
  MapPin,
  MessageCircle,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import type { Villager } from '../types/stardew';
import { useFarmStore } from '../state/useFarmStore';
import { UNIVERSAL_GIFTS, VILLAGERS } from '../data/villagers';
import { findCatalogItemByName } from '../data/items';
import { SeasonBadgeIcon } from './AlmanacIcons';

interface FriendshipViewProps {
  selectedVillagerId: string | null;
  onSelectVillager: (id: string | null) => void;
  onOpenMapPin: (pinId: string) => void;
  onOpenItem: (itemId: string) => void;
}

type FriendFilter = 'all' | 'romanceable' | 'gift-left' | 'birthday-season' | 'needs-hearts';

export function FriendshipView({
  selectedVillagerId,
  onSelectVillager,
  onOpenMapPin,
  onOpenItem,
}: FriendshipViewProps) {
  const {
    profile,
    updateProfile,
    setVillagerHearts,
    incrementWeeklyGift,
    toggleTalkedToday,
    toggleSeenHeartEvent,
  } = useFarmStore();

  const [search, setSearch] = useState('');
  const [giftQuery, setGiftQuery] = useState('');
  const [filter, setFilter] = useState<FriendFilter>('all');
  const [showUniversals, setShowUniversals] = useState(false);
  const [revealedSpoilers, setRevealedSpoilers] = useState<Record<string, boolean>>({});

  const inspectedVillager: Villager | undefined = useMemo(
    () => VILLAGERS.find((v) => v.id === selectedVillagerId),
    [selectedVillagerId]
  );

  const getHeartCap = (v: Villager) => {
    const rel = profile.villagerRelationship[v.id] ?? 'none';
    if (rel === 'married' || rel === 'roommate') return 14;
    return v.maxHearts;
  };

  const setRelationship = (
    villagerId: string,
    rel: 'none' | 'bouquet' | 'married' | 'roommate'
  ) => {
    updateProfile((prev) => ({
      ...prev,
      villagerRelationship: {
        ...prev.villagerRelationship,
        [villagerId]: rel,
      },
    }));
  };

  const toggleRevealSpoiler = (key: string) => {
    setRevealedSpoilers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Reverse gift matching
  const normalizedGift = giftQuery.trim().toLowerCase();
  const giftMatches = useMemo(() => {
    if (!normalizedGift) return null;
    const map = new Map<string, 'Love' | 'Like'>();
    for (const v of VILLAGERS) {
      if (v.loves.some((g) => g.toLowerCase().includes(normalizedGift))) {
        map.set(v.id, 'Love');
      } else if (v.likes.some((g) => g.toLowerCase().includes(normalizedGift))) {
        map.set(v.id, 'Like');
      }
    }
    return map;
  }, [normalizedGift]);

  const filteredVillagers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return VILLAGERS.filter((v) => {
      if (filter === 'romanceable' && !v.romanceable && !v.isRoommateCandidate) return false;
      if (filter === 'gift-left' && (profile.villagerGiftedThisWeek[v.id] ?? 0) >= 2) return false;
      if (filter === 'birthday-season' && v.birthday.season !== profile.season) return false;
      if (filter === 'needs-hearts') {
        const target = v.romanceable ? 8 : 10;
        if ((profile.villagerHearts[v.id] ?? 0) >= target) return false;
      }
      if (giftMatches && !giftMatches.has(v.id)) return false;

      if (!q) return true;
      const hay = [v.name, v.role, v.address, ...v.loves, ...v.likes].join(' ').toLowerCase();
      return hay.includes(q);
    }).sort((a, b) => {
      // Sort birthday today first, then Love before Like if reverse searching, else birthday in season / name
      const aBdayToday = a.birthday.season === profile.season && a.birthday.day === profile.day ? 0 : 1;
      const bBdayToday = b.birthday.season === profile.season && b.birthday.day === profile.day ? 0 : 1;
      if (aBdayToday !== bBdayToday) return aBdayToday - bBdayToday;
      if (giftMatches) {
        const aRank = giftMatches.get(a.id) === 'Love' ? 0 : 1;
        const bRank = giftMatches.get(b.id) === 'Love' ? 0 : 1;
        if (aRank !== bRank) return aRank - bRank;
      }
      return a.name.localeCompare(b.name);
    });
  }, [filter, search, giftMatches, profile]);

  const maxFriendsReady = VILLAGERS.filter(
    (v) => (profile.villagerHearts[v.id] ?? 0) >= (v.romanceable ? 8 : 10)
  ).length;

  return (
    <div>
      <header className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Heart size={26} color="var(--crimson)" fill="var(--crimson)" />
            Villagers, Gifts &amp; Heart Events
          </h1>
          <p className="page-subtitle">
            All 34 Stardew Valley &amp; Ginger Island villagers • {maxFriendsReady}/34 at Perfection Friend target • Stardrop Tea ignores weekly caps!
          </p>
        </div>
        <button
          type="button"
          className={`btn btn-sm ${showUniversals ? 'btn-primary' : ''}`}
          onClick={() => setShowUniversals((v) => !v)}
        >
          <Sparkles size={15} /> Universal Gifts Cheat Sheet
        </button>
      </header>

      {showUniversals && (
        <section className="card-elevated" style={{ marginBottom: 16 }}>
          <div className="card-header">
            <h2 className="card-title">Universal Gift Rules (Save Inventory!)</h2>
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => setShowUniversals(false)}>
              Close
            </button>
          </div>
          <div className="grid-3">
            <div className="card" style={{ borderColor: 'var(--crimson)' }}>
              <strong style={{ color: 'var(--crimson)' }}>Universal Loves</strong>
              <ul style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: '0.84rem' }}>
                {UNIVERSAL_GIFTS.loves.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
            <div className="card" style={{ borderColor: 'var(--sage)' }}>
              <strong style={{ color: 'var(--sage)' }}>Universal Likes</strong>
              <ul style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: '0.84rem' }}>
                {UNIVERSAL_GIFTS.likes.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
            <div className="card" style={{ borderColor: 'var(--wood-border-strong)' }}>
              <strong>Universal Hates</strong>
              <ul style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: '0.84rem' }}>
                {UNIVERSAL_GIFTS.hates.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Search + Reverse Gift Finder + Filters */}
      <section className="card" style={{ marginBottom: 16 }}>
        <div className="grid-2" style={{ marginBottom: 10 }}>
          <div className="search-wrap">
            <Search size={17} />
            <input
              type="search"
              className="input"
              placeholder="Search villager by name or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="search-wrap">
            <Gift size={17} />
            <input
              type="search"
              className="input"
              placeholder="Reverse Gift Finder: Who loves/likes (e.g. Amethyst, Beer, Melon)..."
              value={giftQuery}
              onChange={(e) => setGiftQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="chip-row">
          {(
            [
              ['all', 'All Villagers (34)'],
              ['romanceable', 'Marriage / Roommate (13)'],
              ['gift-left', 'Gifts Remaining This Week'],
              ['birthday-season', `${profile.season} Birthdays`],
              ['needs-hearts', 'Needs Hearts (<Target)'],
            ] as [FriendFilter, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`chip ${filter === key ? 'active' : ''}`}
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Villager Cards Grid */}
      <div className="grid-auto">
        {filteredVillagers.map((v) => {
          const hearts = profile.villagerHearts[v.id] ?? 0;
          const cap = getHeartCap(v);
          const gifted = profile.villagerGiftedThisWeek[v.id] ?? 0;
          const talked = Boolean(profile.villagerTalkedToday[v.id]);
          const rel = profile.villagerRelationship[v.id] ?? 'none';
          const isBdayToday =
            v.birthday.season === profile.season && v.birthday.day === profile.day;
          const seenCount = v.heartEvents.filter(
            (ev) => profile.seenHeartEvents[`${v.id}:${ev.hearts}`]
          ).length;
          const giftReaction = giftMatches?.get(v.id);

          return (
            <article
              key={v.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                borderColor: isBdayToday ? 'var(--crimson)' : undefined,
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 11,
                    background: v.accentColor,
                    color: '#fffdf7',
                    fontWeight: 800,
                    fontSize: '1.08rem',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  {v.name.slice(0, 2).toUpperCase()}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      style={{
                        border: 'none',
                        background: 'transparent',
                        padding: 0,
                        fontWeight: 800,
                        fontSize: '1.04rem',
                        textAlign: 'left',
                      }}
                      onClick={() => onSelectVillager(v.id)}
                    >
                      {v.name}
                    </button>
                    {giftReaction && (
                      <span
                        className={`badge ${
                          giftReaction === 'Love' ? 'badge-crimson' : 'badge-sage'
                        }`}
                      >
                        {giftReaction}s &ldquo;{giftQuery.trim()}&rdquo;
                      </span>
                    )}
                    {isBdayToday && <span className="badge badge-crimson">Birthday Today!</span>}
                    {rel === 'bouquet' && <span className="badge badge-plum">Dating</span>}
                    {rel === 'married' && <span className="badge badge-gold">Spouse</span>}
                    {rel === 'roommate' && <span className="badge badge-plum">Roommate</span>}
                  </div>
                  <div
                    style={{
                      fontSize: '0.79rem',
                      color: 'var(--ink-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <SeasonBadgeIcon season={v.birthday.season} size={13} />
                    <span>
                      {v.birthday.season} {v.birthday.day} •{' '}
                      {seenCount}/{v.heartEvents.length} Events
                    </span>
                  </div>
                </div>
              </div>

              {/* Interactive Heart Meter */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                <div className="heart-meter" aria-label={`${v.name} hearts`}>
                  {Array.from({ length: cap }, (_, i) => {
                    const heartNum = i + 1;
                    const filled = hearts >= heartNum;
                    const isBonusHeart = heartNum > 10;
                    return (
                      <button
                        key={heartNum}
                        type="button"
                        className={`heart-pip ${filled ? (isBonusHeart ? 'bonus' : 'filled') : ''}`}
                        title={`Set ${v.name} to ${hearts === heartNum ? heartNum - 1 : heartNum} hearts`}
                        onClick={() =>
                          setVillagerHearts(v.id, hearts === heartNum ? heartNum - 1 : heartNum)
                        }
                      >
                        <Heart
                          size={15}
                          fill={filled ? 'currentColor' : 'none'}
                          strokeWidth={2}
                        />
                      </button>
                    );
                  })}
                </div>
                <span className="tabular-nums" style={{ fontWeight: 800, fontSize: '0.86rem' }}>
                  {hearts}/{cap}♥
                </span>
              </div>

              {/* Top Loves */}
              <div style={{ fontSize: '0.82rem', color: 'var(--ink-muted)' }}>
                <strong style={{ color: 'var(--crimson)' }}>Loves:</strong>{' '}
                {v.loves.slice(0, 4).join(', ')}
                {v.loves.length > 4 ? ` +${v.loves.length - 4}` : ''}
              </div>

              {/* Actions Bar */}
              <div style={{ display: 'flex', gap: 6, marginTop: 'auto', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${gifted >= 2 ? 'btn-primary' : ''}`}
                  onClick={() => incrementWeeklyGift(v.id)}
                >
                  <Gift size={14} /> {gifted}/2 Gifts
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${talked ? 'btn-primary' : ''}`}
                  onClick={() => toggleTalkedToday(v.id)}
                >
                  <MessageCircle size={14} /> {talked ? 'Talked' : 'Talk'}
                </button>
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{ marginLeft: 'auto' }}
                  onClick={() => onSelectVillager(v.id)}
                >
                  Events &amp; Profile
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* SLIDE-OVER VILLAGER PROFILE & HEART EVENTS DRAWER */}
      {inspectedVillager && (() => {
        const hearts = profile.villagerHearts[inspectedVillager.id] ?? 0;
        const cap = getHeartCap(inspectedVillager);
        const rel = profile.villagerRelationship[inspectedVillager.id] ?? 'none';

        return (
          <div className="drawer-backdrop" onClick={() => onSelectVillager(null)}>
            <aside
              className="drawer-panel"
              role="dialog"
              aria-label={inspectedVillager.name}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="card-header" style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: inspectedVillager.accentColor,
                      color: '#fffdf7',
                      fontWeight: 800,
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    {inspectedVillager.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.35rem' }}>{inspectedVillager.name}</h2>
                    <div style={{ fontSize: '0.84rem', color: 'var(--ink-muted)' }}>
                      {inspectedVillager.role}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label="Close villager drawer"
                  onClick={() => onSelectVillager(null)}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span className="badge badge-crimson">
                    Birthday: {inspectedVillager.birthday.season} {inspectedVillager.birthday.day}
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={() => {
                      onSelectVillager(null);
                      onOpenMapPin(inspectedVillager.mapPinId);
                    }}
                  >
                    <MapPin size={14} /> Locate: {inspectedVillager.address}
                  </button>
                </div>

                {inspectedVillager.arrivalNote && (
                  <div className="callout callout-river">
                    <strong>Unlock / Schedule Note:</strong> {inspectedVillager.arrivalNote}
                  </div>
                )}

                {/* Hearts & Relationship Control */}
                <div className="card">
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 8,
                    }}
                  >
                    <strong>Friendship Level ({hearts}/{cap}♥)</strong>
                    <span style={{ fontSize: '0.82rem', color: 'var(--ink-muted)' }}>
                      {(profile.villagerGiftedThisWeek[inspectedVillager.id] ?? 0)}/2 gifts this week
                    </span>
                  </div>

                  <div className="heart-meter" style={{ marginBottom: 10 }}>
                    {Array.from({ length: cap }, (_, i) => {
                      const n = i + 1;
                      const filled = hearts >= n;
                      return (
                        <button
                          key={n}
                          type="button"
                          className={`heart-pip ${filled ? (n > 10 ? 'bonus' : 'filled') : ''}`}
                          onClick={() => setVillagerHearts(inspectedVillager.id, hearts === n ? n - 1 : n)}
                        >
                          <Heart size={18} fill={filled ? 'currentColor' : 'none'} />
                        </button>
                      );
                    })}
                  </div>

                  {(inspectedVillager.romanceable || inspectedVillager.isRoommateCandidate) && (
                    <div className="segmented-bar" style={{ width: '100%' }}>
                      <button
                        type="button"
                        className={`seg-btn ${rel === 'none' ? 'active' : ''}`}
                        style={{ flex: 1 }}
                        onClick={() => setRelationship(inspectedVillager.id, 'none')}
                      >
                        Single
                      </button>
                      {inspectedVillager.romanceable && (
                        <>
                          <button
                            type="button"
                            className={`seg-btn ${rel === 'bouquet' ? 'active' : ''}`}
                            style={{ flex: 1 }}
                            onClick={() => setRelationship(inspectedVillager.id, 'bouquet')}
                          >
                            Bouquet
                          </button>
                          <button
                            type="button"
                            className={`seg-btn ${rel === 'married' ? 'active' : ''}`}
                            style={{ flex: 1 }}
                            onClick={() => setRelationship(inspectedVillager.id, 'married')}
                          >
                            Married (14♥)
                          </button>
                        </>
                      )}
                      {inspectedVillager.isRoommateCandidate && (
                        <button
                          type="button"
                          className={`seg-btn ${rel === 'roommate' ? 'active' : ''}`}
                          style={{ flex: 1 }}
                          onClick={() => setRelationship(inspectedVillager.id, 'roommate')}
                        >
                          Roommate (14♥)
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Routine */}
                <div className="card">
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>Daily Schedule &amp; Hangouts</div>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--ink-muted)' }}>
                    {inspectedVillager.scheduleSummary}
                  </p>
                </div>

                {/* Gifts Breakdown */}
                <div className="card">
                  <div style={{ fontWeight: 700, color: 'var(--crimson)', marginBottom: 6 }}>
                    Loved Gifts (+80 pts / 640 Birthday)
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                    {inspectedVillager.loves.map((gift) => {
                      const match = findCatalogItemByName(gift);
                      return (
                        <button
                          key={gift}
                          type="button"
                          className="chip"
                          style={{
                            borderColor: 'var(--crimson)',
                            color: 'var(--crimson)',
                            minHeight: 30,
                            fontSize: '0.8rem',
                          }}
                          onClick={() => {
                            if (match) {
                              onSelectVillager(null);
                              onOpenItem(match.id);
                            }
                          }}
                        >
                          ♥ {gift}
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ fontWeight: 700, color: 'var(--sage)', marginBottom: 4 }}>
                    Easy Liked Gifts (+45 pts)
                  </div>
                  <div style={{ fontSize: '0.86rem', color: 'var(--ink-muted)', marginBottom: 10 }}>
                    {inspectedVillager.likes.join(' • ')}
                  </div>

                  <div style={{ fontWeight: 700, marginBottom: 4 }}>Watch Out (Hates)</div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--ink-soft)' }}>
                    {inspectedVillager.hatesHighlights.join(' • ')}
                  </div>
                </div>

                {/* Heart Events */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 8,
                    }}
                  >
                    <h3 style={{ margin: 0, fontSize: '1.05rem' }}>
                      Heart Events ({inspectedVillager.heartEvents.length})
                    </h3>
                    {profile.spoilerMode && (
                      <span className="badge badge-neutral">Spoiler Shield Active</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                    {inspectedVillager.heartEvents.map((ev) => {
                      const key = `${inspectedVillager.id}:${ev.hearts}`;
                      const seen = Boolean(profile.seenHeartEvents[key]);
                      const lockedBehindSpoiler =
                        profile.spoilerMode && !seen && hearts < ev.hearts && !revealedSpoilers[key];

                      return (
                        <div key={key} className={`check-row ${seen ? 'done' : ''}`}>
                          <button
                            type="button"
                            className="check-toggle"
                            aria-label={`Mark ${ev.hearts}-heart event seen`}
                            onClick={() => toggleSeenHeartEvent(inspectedVillager.id, ev.hearts)}
                          >
                            {seen && <Check size={16} strokeWidth={3} />}
                          </button>

                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                              <span className="badge badge-crimson tabular-nums">{ev.hearts}♥</span>
                              <strong>{ev.title}</strong>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginTop: 3 }}>
                              <strong>Where:</strong> {ev.location} • <strong>When:</strong> {ev.time} •{' '}
                              <strong>Weather:</strong> {ev.weather}
                            </div>
                            {ev.seasonNote && (
                              <div
                                style={{
                                  fontSize: '0.78rem',
                                  color: 'var(--gold)',
                                  fontWeight: 700,
                                  marginTop: 2,
                                }}
                              >
                                Note: {ev.seasonNote}
                              </div>
                            )}

                            {lockedBehindSpoiler ? (
                              <button
                                type="button"
                                className="btn btn-sm btn-ghost"
                                style={{ marginTop: 5, paddingLeft: 4 }}
                                onClick={() => toggleRevealSpoiler(key)}
                              >
                                <Eye size={14} /> Unlocks at {ev.hearts}♥ — Reveal Event Summary
                              </button>
                            ) : (
                              <div style={{ fontSize: '0.84rem', marginTop: 5 }}>
                                {ev.summary}
                                {profile.spoilerMode && hearts < ev.hearts && (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-ghost"
                                    style={{ marginLeft: 6, padding: '2px 6px', minHeight: 24 }}
                                    onClick={() => toggleRevealSpoiler(key)}
                                  >
                                    <EyeOff size={12} /> Hide
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        );
      })()}
    </div>
  );
}

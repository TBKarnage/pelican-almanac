import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  CalendarDays,
  Heart,
  MapPin,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { ALL_CATALOG_ITEMS } from '../data/items';
import { VILLAGERS } from '../data/villagers';
import { MAP_PINS } from '../data/mapPins';
import { CALENDAR_EVENTS } from '../data/calendar';
import { BUNDLES } from '../data/bundles';
import { GUIDES } from '../data/guides';

export type AppTabId =
  | 'today'
  | 'encyclopedia'
  | 'bundles'
  | 'calendar'
  | 'friendship'
  | 'map'
  | 'guides';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenItem: (itemId: string) => void;
  onOpenVillager: (villagerId: string) => void;
  onOpenMapPin: (pinId: string) => void;
  onNavigateTab: (tab: AppTabId) => void;
}

export function GlobalSearchModal({
  isOpen,
  onClose,
  onOpenItem,
  onOpenVillager,
  onOpenMapPin,
  onNavigateTab,
}: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => inputRef.current?.focus(), 40);
    return () => clearTimeout(t);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!q) {
      return {
        items: ALL_CATALOG_ITEMS.slice(0, 6),
        villagers: VILLAGERS.slice(0, 4),
        pins: MAP_PINS.slice(0, 4),
        bundles: BUNDLES.slice(0, 3),
        events: CALENDAR_EVENTS.slice(0, 3),
        guides: GUIDES.slice(0, 3),
      };
    }

    return {
      items: ALL_CATALOG_ITEMS.filter(
        (it) =>
          it.name.toLowerCase().includes(q) ||
          it.category.toLowerCase().includes(q) ||
          it.source.toLowerCase().includes(q)
      ).slice(0, 10),
      villagers: VILLAGERS.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.role.toLowerCase().includes(q) ||
          v.loves.some((l) => l.toLowerCase().includes(q))
      ).slice(0, 6),
      pins: MAP_PINS.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      ).slice(0, 6),
      bundles: BUNDLES.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.items.some((i) => i.name.toLowerCase().includes(q))
      ).slice(0, 5),
      events: CALENDAR_EVENTS.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q)
      ).slice(0, 4),
      guides: GUIDES.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.summary.toLowerCase().includes(q)
      ).slice(0, 4),
    };
  }, [q]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        className="modal-panel"
        role="dialog"
        aria-label="Global Almanac Search"
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div className="search-wrap" style={{ flex: 1 }}>
            <Search size={18} />
            <input
              ref={inputRef}
              type="search"
              className="input"
              placeholder="Search ANY item, fish, crop, villager, bundle, festival, or map spot..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button type="button" className="icon-btn" aria-label="Close search" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {results.items.length > 0 && (
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--ink-soft)', marginBottom: 6 }}>
                ENCYCLOPEDIA ITEMS
              </div>
              <div style={{ display: 'grid', gap: 6 }}>
                {results.items.map((it) => (
                  <button
                    key={it.id}
                    type="button"
                    className="check-row"
                    style={{ width: '100%', textAlign: 'left', alignItems: 'center' }}
                    onClick={() => {
                      onClose();
                      onOpenItem(it.id);
                    }}
                  >
                    <Sparkles size={15} color="var(--gold)" />
                    <div style={{ flex: 1 }}>
                      <strong>{it.name}</strong>{' '}
                      <span className="badge badge-neutral" style={{ marginLeft: 4 }}>
                        {it.category}
                      </span>
                      <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>{it.source}</div>
                    </div>
                    <span className="tabular-nums" style={{ fontWeight: 700, fontSize: '0.84rem' }}>
                      {it.sellPrice > 0 ? `${it.sellPrice}g` : ''}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.villagers.length > 0 && (
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--ink-soft)', marginBottom: 6 }}>
                VILLAGERS &amp; HEART EVENTS
              </div>
              <div style={{ display: 'grid', gap: 6 }}>
                {results.villagers.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    className="check-row"
                    style={{ width: '100%', textAlign: 'left', alignItems: 'center' }}
                    onClick={() => {
                      onClose();
                      onOpenVillager(v.id);
                    }}
                  >
                    <Heart size={15} color="var(--crimson)" />
                    <div style={{ flex: 1 }}>
                      <strong>{v.name}</strong> •{' '}
                      <span style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
                        {v.birthday.season} {v.birthday.day}
                      </span>
                      <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
                        Loves: {v.loves.slice(0, 3).join(', ')}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.pins.length > 0 && (
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--ink-soft)', marginBottom: 6 }}>
                ATLAS MAP LOCATIONS
              </div>
              <div style={{ display: 'grid', gap: 6 }}>
                {results.pins.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className="check-row"
                    style={{ width: '100%', textAlign: 'left', alignItems: 'center' }}
                    onClick={() => {
                      onClose();
                      onOpenMapPin(p.id);
                    }}
                  >
                    <MapPin size={15} color="var(--river)" />
                    <div style={{ flex: 1 }}>
                      <strong>{p.name}</strong>
                      <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>{p.subtitle}</div>
                    </div>
                    <span className="badge badge-neutral">{p.category}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {(results.bundles.length > 0 || results.events.length > 0 || results.guides.length > 0) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {results.bundles.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  className="btn btn-sm"
                  onClick={() => {
                    onClose();
                    onNavigateTab('bundles');
                  }}
                >
                  Bundle: {b.name}
                </button>
              ))}
              {results.events.map((ev) => (
                <button
                  key={ev.id}
                  type="button"
                  className="btn btn-sm"
                  onClick={() => {
                    onClose();
                    onNavigateTab('calendar');
                  }}
                >
                  <CalendarDays size={14} /> {ev.name} ({ev.season} {ev.startDay})
                </button>
              ))}
              {results.guides.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className="btn btn-sm"
                  onClick={() => {
                    onClose();
                    onNavigateTab('guides');
                  }}
                >
                  <BookOpen size={14} /> {g.title}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

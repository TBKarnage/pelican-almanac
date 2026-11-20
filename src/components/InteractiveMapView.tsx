import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Compass,
  Fish,
  Home,
  Leaf,
  LocateFixed,
  MapPin as MapPinIcon,
  Minus,
  Pickaxe,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  Tag,
  Train,
  User,
  X,
} from 'lucide-react';
import type { MapCategory, MapPin, MapRegion } from '../types/stardew';
import { useFarmStore } from '../state/useFarmStore';
import { MAP_PINS } from '../data/mapPins';
import { VILLAGERS } from '../data/villagers';
import { findCatalogItemByName } from '../data/items';
import { AtlasArtwork } from './AtlasArtwork';

interface InteractiveMapViewProps {
  selectedPinId: string | null;
  onSelectPin: (pinId: string | null) => void;
  onOpenVillager: (villagerId: string) => void;
  onOpenItem: (itemId: string) => void;
}

const CATEGORY_COLORS: Record<MapCategory, string> = {
  Shop: '#B86D14',
  Residence: '#9C4B3B',
  Fishing: '#2C6482',
  Foraging: '#386A35',
  Mining: '#635368',
  Landmark: '#7A5428',
  Transport: '#466C44',
};

const CATEGORIES: ('All' | MapCategory)[] = [
  'All',
  'Shop',
  'Residence',
  'Fishing',
  'Foraging',
  'Mining',
  'Landmark',
  'Transport',
];

const QUICK_SEARCHES = ['Auto-Petter', 'Hardwood', 'Red Cabbage', 'Walnuts', 'Stardrop', 'Legend'];

const MAP_W = 1200;
const MAP_H = 760;

const SHORT_PIN_LABELS: Record<string, string> = {
  'skull-cavern': 'Skull Cavern',
  'robins-carpentry': "Robin's Carpentry",
  'linus-tent': "Linus's Tent & Leo",
  'railroad-spa': 'Railroad & Spa',
  'mountain-lake': 'Mountain Lake',
  'the-mines': 'The Mines',
  'the-quarry': 'The Quarry',
  'bookseller-hill': 'Bookseller',
  'community-center': 'Community Center',
  'pierres-store': "Pierre's Store",
  'harveys-clinic': "Harvey's Clinic",
  'town-square': 'Town Square',
  'stardrop-saloon': 'Stardrop Saloon',
  'trailer-pam-house': "Pam's / Trailer",
  'mayors-manor': "Mayor's Manor",
  'the-sewers': 'The Sewers',
  'museum': 'Museum & Library',
  'jojamart': 'JojaMart / Theater',
  'the-beach': 'Beach & Pier',
  'willys-shop': "Willy's Fish Shop",
  'tide-pools': 'East Tide Pools',
  'cindersap-forest': 'Traveling Cart',
  'secret-woods': 'Secret Woods',
  'wizard-tower': "Wizard's Tower",
  'giant-stump': 'Giant Stump',
  'forest-river': 'Hat Mouse & River',
  'forest-pond': 'Cindersap Lake',
  'desert-oasis': 'The Oasis',
  'desert-trader': 'Desert Trader',
  'island-south': 'Resort & Dock',
  'island-field-office': 'Field Office',
  'island-north': 'Island Trader & Dig',
  'volcano-dungeon': 'Volcano & Forge',
  'island-west': 'Island West Farm',
  'qi-walnut-room': "Qi's Walnut Room",
  'birdies-hut': "Birdie's Hut",
  'island-east': "Leo's Jungle",
  'pirate-cove': 'Pirate Cove',
};

// Widely spaced anchor pins shown cleanly even at 100% Valley overview
const OVERVIEW_LABEL_PINS = new Set([
  'farm',
  'skull-cavern',
  'railroad-spa',
  'the-mines',
  'the-quarry',
  'secret-woods',
  'cindersap-forest',
  'wizard-tower',
  'pierres-store',
  'willys-shop',
  'tide-pools',
]);

interface MapZonePreset {
  id: string;
  label: string;
  x: number;
  y: number;
  zoom: number;
}

const VALLEY_ZONES: MapZonePreset[] = [
  { id: 'all', label: 'Whole Valley', x: 50, y: 50, zoom: 1 },
  { id: 'town', label: 'Pelican Town', x: 69, y: 45, zoom: 1.85 },
  { id: 'farm', label: 'Farm & Bus Stop', x: 30, y: 34, zoom: 2.1 },
  { id: 'mountains', label: 'Mountains & Mines', x: 69, y: 15, zoom: 1.95 },
  { id: 'desert', label: 'Calico Desert', x: 16, y: 16, zoom: 2.25 },
  { id: 'forest', label: 'Cindersap & Woods', x: 25, y: 59, zoom: 1.95 },
  { id: 'beach', label: 'The Beach', x: 75, y: 74, zoom: 2.1 },
];

const ISLAND_ZONES: MapZonePreset[] = [
  { id: 'all', label: 'Whole Island', x: 50, y: 50, zoom: 1 },
  { id: 'volcano', label: 'Volcano & Dig Site', x: 54, y: 24, zoom: 2.1 },
  { id: 'west', label: 'West Farm & Qi', x: 22, y: 51, zoom: 2.05 },
  { id: 'south', label: 'South Resort & Dock', x: 53, y: 70, zoom: 2.1 },
  { id: 'east', label: 'East Jungle & Cove', x: 83, y: 59, zoom: 2.1 },
];

function CategoryGlyph({ category, size = 14 }: { category: MapCategory; size?: number }) {
  switch (category) {
    case 'Shop':
      return <ShoppingBag size={size} strokeWidth={2.4} />;
    case 'Residence':
      return <Home size={size} strokeWidth={2.4} />;
    case 'Fishing':
      return <Fish size={size} strokeWidth={2.4} />;
    case 'Foraging':
      return <Leaf size={size} strokeWidth={2.4} />;
    case 'Mining':
      return <Pickaxe size={size} strokeWidth={2.4} />;
    case 'Transport':
      return <Train size={size} strokeWidth={2.4} />;
    case 'Landmark':
    default:
      return <Star size={size} strokeWidth={2.4} />;
  }
}

export function InteractiveMapView({
  selectedPinId,
  onSelectPin,
  onOpenVillager,
  onOpenItem,
}: InteractiveMapViewProps) {
  const { profile } = useFarmStore();

  const initialPin = useMemo(
    () => (selectedPinId ? MAP_PINS.find((p) => p.id === selectedPinId) ?? null : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const initializedPanRef = useRef(false);
  const [viewportSize, setViewportSize] = useState({ width: 920, height: 583 });

  const [region, setRegion] = useState<MapRegion>(() => initialPin?.region ?? 'valley');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | MapCategory>('All');
  const [showAllLabels, setShowAllLabels] = useState(false);
  const [hoveredPinId, setHoveredPinId] = useState<string | null>(null);
  const [activeZoneId, setActiveZoneId] = useState<string>(() => (initialPin ? 'custom' : 'all'));

  useEffect(() => {
    const el = viewportRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setViewportSize({ width: rect.width, height: rect.height });
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const fitScale = useMemo(() => {
    const sx = (viewportSize.width - 8) / MAP_W;
    const sy = (viewportSize.height - 8) / MAP_H;
    return Math.max(0.28, Math.min(sx, sy));
  }, [viewportSize]);

  // Zoom is relative to fitted full-map view (1 = Fit entire map in viewport, max 3.4)
  const [zoom, setZoom] = useState(() => (initialPin ? 1.85 : 1));
  const [pan, setPan] = useState(() => {
    if (!initialPin) return { x: 0, y: 0 };
    const defaultFit = Math.min((920 - 8) / MAP_W, (583 - 8) / MAP_H);
    const eff = defaultFit * 1.85;
    const dx = ((initialPin.x - 50) / 100) * MAP_W;
    const dy = ((initialPin.y - 50) / 100) * MAP_H;
    return { x: -dx * eff, y: -dy * eff };
  });
  const [isDragging, setIsDragging] = useState(false);

  const effectiveScale = fitScale * zoom;

  const clampPan = useCallback(
    (x: number, y: number, targetZoom: number) => {
      const eff = fitScale * targetZoom;
      const maxX = Math.max(24, (MAP_W * eff) / 2 - viewportSize.width * 0.22);
      const maxY = Math.max(24, (MAP_H * eff) / 2 - viewportSize.height * 0.22);
      return {
        x: Math.max(-maxX, Math.min(maxX, x)),
        y: Math.max(-maxY, Math.min(maxY, y)),
      };
    },
    [fitScale, viewportSize]
  );

  // Re-center initial cross-tab pin once true ResizeObserver dimensions arrive
  useEffect(() => {
    if (initializedPanRef.current || !initialPin) return;
    if (viewportSize.width === 920 && viewportSize.height === 583) return;
    initializedPanRef.current = true;
    const eff = fitScale * 1.85;
    const dx = ((initialPin.x - 50) / 100) * MAP_W;
    const dy = ((initialPin.y - 50) / 100) * MAP_H;
    setPan(clampPan(-dx * eff, -dy * eff, 1.85));
  }, [initialPin, viewportSize, fitScale, clampPan]);

  // Track pointer positions for pan + two-finger pinch zoom
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const pinchStartRef = useRef<{
    dist: number;
    zoom: number;
    panX: number;
    panY: number;
    midX: number;
    midY: number;
  } | null>(null);

  const focusPoint = useCallback(
    (percentX: number, percentY: number, targetZoom: number) => {
      const clampedZoom = Math.max(0.85, Math.min(3.4, Number(targetZoom.toFixed(2))));
      const eff = fitScale * clampedZoom;
      const dx = ((percentX - 50) / 100) * MAP_W;
      const dy = ((percentY - 50) / 100) * MAP_H;
      setZoom(clampedZoom);
      setPan(clampPan(-dx * eff, -dy * eff, clampedZoom));
    },
    [fitScale, clampPan]
  );

  const centerOnPin = useCallback(
    (pin: MapPin, targetZoom = 1.9) => {
      setRegion(pin.region);
      setActiveZoneId('custom');
      focusPoint(pin.x, pin.y, Math.max(zoom, targetZoom));
    },
    [focusPoint, zoom]
  );

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setActiveZoneId('all');
  }, []);

  const zoomAtPoint = useCallback(
    (nextZoomRaw: number, clientX?: number, clientY?: number) => {
      const nextZoom = Math.max(0.85, Math.min(3.4, Number(nextZoomRaw.toFixed(2))));
      const el = viewportRef.current;
      if (!el || clientX === undefined || clientY === undefined) {
        const ratio = nextZoom / zoom;
        setZoom(nextZoom);
        setPan((prev) => clampPan(prev.x * ratio, prev.y * ratio, nextZoom));
        setActiveZoneId(nextZoom <= 1.05 ? 'all' : 'custom');
        return;
      }

      const rect = el.getBoundingClientRect();
      const px = clientX - (rect.left + rect.width / 2);
      const py = clientY - (rect.top + rect.height / 2);
      const eff1 = fitScale * zoom;
      const eff2 = fitScale * nextZoom;
      const mapX = (px - pan.x) / eff1;
      const mapY = (py - pan.y) / eff1;

      setZoom(nextZoom);
      setPan(clampPan(px - mapX * eff2, py - mapY * eff2, nextZoom));
      setActiveZoneId(nextZoom <= 1.05 ? 'all' : 'custom');
    },
    [clampPan, fitScale, pan.x, pan.y, zoom]
  );

  const query = search.trim().toLowerCase();

  // Search across BOTH Valley & Ginger Island
  const searchMatches = useMemo(() => {
    if (!query) return [];
    return MAP_PINS.filter((pin) => {
      if (categoryFilter !== 'All' && pin.category !== categoryFilter) return false;
      const hay = [
        pin.name,
        pin.subtitle,
        pin.category,
        ...(pin.residents ?? []),
        ...(pin.shopsItems ?? []),
        ...(pin.fishHere ?? []),
        ...(pin.forageHere ?? []),
        ...(pin.resourcesHere ?? []),
        ...(pin.secrets ?? []),
        ...(pin.tags ?? []),
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(query);
    });
  }, [query, categoryFilter]);

  const visiblePinsInRegion = useMemo(() => {
    return MAP_PINS.filter((pin) => {
      if (pin.region !== region) return false;
      if (categoryFilter !== 'All' && pin.category !== categoryFilter) return false;
      if (!query) return true;
      return searchMatches.some((m) => m.id === pin.id);
    });
  }, [region, categoryFilter, query, searchMatches]);

  const inspectedPin = useMemo(
    () => MAP_PINS.find((p) => p.id === selectedPinId) ?? null,
    [selectedPinId]
  );

  // Pointer & pinch handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        panX: pan.x,
        panY: pan.y,
      };
      pinchStartRef.current = null;
    } else if (pointersRef.current.size === 2) {
      const pts = Array.from(pointersRef.current.values());
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      pinchStartRef.current = {
        dist,
        zoom,
        panX: pan.x,
        panY: pan.y,
        midX: (pts[0].x + pts[1].x) / 2,
        midY: (pts[0].y + pts[1].y) / 2,
      };
      dragStartRef.current = null;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size === 2 && pinchStartRef.current && viewportRef.current) {
      const pts = Array.from(pointersRef.current.values());
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      if (pinchStartRef.current.dist > 0) {
        const ratio = dist / pinchStartRef.current.dist;
        const nextZoom = Math.max(0.85, Math.min(3.4, pinchStartRef.current.zoom * ratio));
        const rect = viewportRef.current.getBoundingClientRect();
        const px = pinchStartRef.current.midX - (rect.left + rect.width / 2);
        const py = pinchStartRef.current.midY - (rect.top + rect.height / 2);
        const eff1 = fitScale * pinchStartRef.current.zoom;
        const eff2 = fitScale * nextZoom;
        const mapX = (px - pinchStartRef.current.panX) / eff1;
        const mapY = (py - pinchStartRef.current.panY) / eff1;
        setZoom(nextZoom);
        setPan(clampPan(px - mapX * eff2, py - mapY * eff2, nextZoom));
        setActiveZoneId(nextZoom <= 1.05 ? 'all' : 'custom');
      }
      return;
    }

    if (dragStartRef.current) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setPan(clampPan(dragStartRef.current.panX + dx, dragStartRef.current.panY + dy, zoom));
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) pinchStartRef.current = null;
    if (pointersRef.current.size === 0) {
      dragStartRef.current = null;
      setIsDragging(false);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.2 : -0.2;
    zoomAtPoint(zoom + delta, e.clientX, e.clientY);
  };

  const handleSelectPin = (pin: MapPin) => {
    onSelectPin(pin.id);
    centerOnPin(pin, 1.9);
  };

  const valleyTotal = useMemo(() => MAP_PINS.filter((p) => p.region === 'valley').length, []);
  const islandTotal = useMemo(() => MAP_PINS.filter((p) => p.region === 'ginger-island').length, []);
  const zonePresets = region === 'valley' ? VALLEY_ZONES : ISLAND_ZONES;

  return (
    <div>
      <header className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Compass size={26} color="var(--river)" />
            Interactive Valley &amp; Ginger Island Atlas
          </h1>
          <p className="page-subtitle">
            Search any shop, villager, fish, forage item, bundle bottleneck, or secret across all {MAP_PINS.length} mapped locations. Drag or pinch to explore.
          </p>
        </div>

        <div className="segmented-bar" role="group" aria-label="Map Region">
          <button
            type="button"
            className={`seg-btn ${region === 'valley' ? 'active' : ''}`}
            onClick={() => {
              setRegion('valley');
              resetView();
            }}
          >
            Stardew Valley &amp; Town ({valleyTotal})
          </button>
          <button
            type="button"
            className={`seg-btn ${region === 'ginger-island' ? 'active' : ''}`}
            onClick={() => {
              setRegion('ginger-island');
              resetView();
            }}
          >
            Ginger Island ({islandTotal})
          </button>
        </div>
      </header>

      {/* Search & Category Bar */}
      <section className="card" style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 10 }}>
          <div className="search-wrap">
            <Search size={17} />
            <input
              type="search"
              className="input"
              placeholder="Search items, fish, NPCs, shops, secrets (e.g. Auto-Petter, Catfish, Krobus, Walnuts)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            type="button"
            className={`chip ${showAllLabels ? 'active' : ''}`}
            onClick={() => setShowAllLabels((v) => !v)}
          >
            <Tag size={14} /> {showAllLabels ? 'All Labels On' : 'Smart Labels'}
          </button>
        </div>

        <div className="chip-row" style={{ marginBottom: 8 }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`chip ${categoryFilter === cat ? 'active' : ''}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat !== 'All' && (
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: CATEGORY_COLORS[cat],
                    display: 'inline-block',
                  }}
                />
              )}
              {cat}
            </button>
          ))}
        </div>

        {/* One-Tap Quick Searches */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: '0.76rem', color: 'var(--ink-soft)', fontWeight: 700 }}>
            Quick find:
          </span>
          {QUICK_SEARCHES.map((term) => (
            <button
              key={term}
              type="button"
              className={`badge ${query === term.toLowerCase() ? 'badge-gold' : 'badge-neutral'}`}
              style={{ border: 'none', cursor: 'pointer', padding: '3px 8px' }}
              onClick={() => setSearch((prev) => (prev === term ? '' : term))}
            >
              {term}
            </button>
          ))}
        </div>

        {/* Instant Cross-Region Search Results Strip */}
        {query && (
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px dashed var(--wood-border)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink-soft)', marginBottom: 6 }}>
              Matched Locations ({searchMatches.length}):
            </div>
            {searchMatches.length === 0 ? (
              <span style={{ fontSize: '0.86rem', color: 'var(--ink-muted)' }}>
                No locations match &ldquo;{search}&rdquo;.
              </span>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {searchMatches.slice(0, 12).map((pin) => (
                  <button
                    key={pin.id}
                    type="button"
                    className={`btn btn-sm ${selectedPinId === pin.id ? 'btn-primary' : ''}`}
                    onClick={() => handleSelectPin(pin)}
                  >
                    <MapPinIcon size={13} /> {pin.name}
                    {pin.region !== region && (
                      <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>
                        {pin.region === 'ginger-island' ? 'Island' : 'Valley'}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Unified Framed Interactive Atlas */}
      <div className="map-frame">
        {/* Top Neighborhood Jump Strip (outside viewport canvas so zero pins are obstructed!) */}
        <div className="map-zone-bar" role="group" aria-label="Quick neighborhood zoom">
          {zonePresets.map((zone) => (
            <button
              key={zone.id}
              type="button"
              className={`map-zone-pill ${activeZoneId === zone.id ? 'active' : ''}`}
              onClick={() => {
                setActiveZoneId(zone.id);
                if (zone.id === 'all') resetView();
                else focusPoint(zone.x, zone.y, zone.zoom);
              }}
            >
              {zone.label}
            </button>
          ))}
        </div>

        {/* Interactive Zoomable / Pannable Map Viewport */}
        <div
          ref={viewportRef}
          className="map-viewport"
          style={{
            background: region === 'ginger-island' ? '#124259' : '#322316',
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onWheel={handleWheel}
          onDoubleClick={(e) => {
            if ((e.target as HTMLElement).closest('button')) return;
            if (zoom >= 1.9) resetView();
            else zoomAtPoint(2.0, e.clientX, e.clientY);
          }}
        >
          {/* Cross-Region Match Helper Banner when query hits the other map */}
          {query && visiblePinsInRegion.length === 0 && searchMatches.length > 0 && (
            <div className="map-empty-banner">
              <span>
                No matches on {region === 'valley' ? 'Valley' : 'Ginger Island'} ({searchMatches.length}{' '}
                found on {region === 'valley' ? 'Ginger Island' : 'Stardew Valley'})
              </span>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={() => handleSelectPin(searchMatches[0])}
              >
                Jump to {searchMatches[0].name}
              </button>
            </div>
          )}

          {/* Pan + Zoom Layer */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: MAP_W,
              height: MAP_H,
              transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${effectiveScale})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            {/* HAND-CRAFTED CARTOGRAPHIC SVG ATLAS */}
            <AtlasArtwork region={region} />

            {/* INTERACTIVE PIN OVERLAY MARKERS */}
            {visiblePinsInRegion.map((pin) => {
              const isSelected = selectedPinId === pin.id;
              const isHovered = hoveredPinId === pin.id;
              const color = CATEGORY_COLORS[pin.category];
              const invScale = 1 / Math.max(0.45, Math.pow(effectiveScale, 0.72));
              const showLabel =
                showAllLabels ||
                region === 'ginger-island' ||
                OVERVIEW_LABEL_PINS.has(pin.id) ||
                isSelected ||
                isHovered ||
                Boolean(query) ||
                categoryFilter !== 'All' ||
                zoom >= 1.45;

              const badgeText = isSelected || isHovered ? pin.name : (SHORT_PIN_LABELS[pin.id] ?? pin.name);

              return (
                <button
                  key={pin.id}
                  type="button"
                  className="map-pin-btn"
                  aria-label={`${pin.name} (${pin.category})`}
                  onClick={() => handleSelectPin(pin)}
                  onMouseEnter={() => setHoveredPinId(pin.id)}
                  onMouseLeave={() => setHoveredPinId((prev) => (prev === pin.id ? null : prev))}
                  style={{
                    left: `${pin.x}%`,
                    top: `${pin.y}%`,
                    transform: `translate(-50%, -100%) scale(${
                      isSelected ? invScale * 1.2 : isHovered ? invScale * 1.12 : invScale
                    })`,
                    transformOrigin: 'bottom center',
                    zIndex: isSelected ? 30 : isHovered ? 28 : 14,
                  }}
                >
                  {showLabel && (
                    <span
                      className="map-pin-label"
                      style={{
                        background: isSelected ? '#2B1E13' : 'rgba(255, 253, 247, 0.95)',
                        color: isSelected ? '#FFFDF7' : '#2B1E13',
                        border: `1.5px solid ${isSelected ? '#F2B830' : color}`,
                      }}
                    >
                      {badgeText}
                    </span>
                  )}
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50% 50% 50% 4px',
                      transform: 'rotate(-45deg)',
                      background: color,
                      color: '#FFFDF7',
                      border: `2.5px solid ${isSelected ? '#F2B830' : '#FFFDF7'}`,
                      boxShadow: isSelected
                        ? '0 0 0 5px rgba(242, 184, 48, 0.45), 0 4px 12px rgba(0,0,0,0.38)'
                        : '0 3px 8px rgba(0,0,0,0.35)',
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        transform: 'rotate(45deg)',
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      <CategoryGlyph category={pin.category} size={13} />
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Floating Map HUD Zoom Buttons */}
          <div className="map-hud-controls">
            <span className="map-zoom-badge">{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              className="icon-btn"
              aria-label="Zoom in map"
              onClick={() => zoomAtPoint(zoom + 0.35)}
            >
              <Plus size={19} />
            </button>
            <button
              type="button"
              className="icon-btn"
              aria-label="Zoom out map"
              onClick={() => zoomAtPoint(zoom - 0.35)}
            >
              <Minus size={19} />
            </button>
            <button
              type="button"
              className="icon-btn"
              aria-label="Reset map zoom and pan"
              onClick={resetView}
            >
              <LocateFixed size={18} />
            </button>
          </div>
        </div>

        {/* Bottom Docked Clickable Category Legend (keeps map artwork completely unobstructed!) */}
        <div className="map-legend-bar">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            {(['Shop', 'Residence', 'Fishing', 'Foraging', 'Mining', 'Landmark'] as MapCategory[]).map(
              (cat) => (
                <button
                  key={cat}
                  type="button"
                  style={{
                    border: 'none',
                    background: categoryFilter === cat ? 'var(--bg-muted)' : 'transparent',
                    borderRadius: 6,
                    padding: '3px 7px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 'inherit',
                    fontWeight: categoryFilter === cat ? 800 : 700,
                    color: categoryFilter === cat ? 'var(--ink)' : 'inherit',
                    cursor: 'pointer',
                  }}
                  onClick={() => setCategoryFilter((prev) => (prev === cat ? 'All' : cat))}
                >
                  <span
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: '50%',
                      background: CATEGORY_COLORS[cat],
                      display: 'inline-block',
                    }}
                  />
                  {cat}
                </button>
              )
            )}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--ink-soft)' }}>
            Double-tap or scroll to zoom • Tap any pin to inspect items &amp; Villagers
          </span>
        </div>
      </div>

      {/* Directory List Below Map for Fast One-Tap Jumping */}
      <section style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: '1.08rem', marginBottom: 10 }}>
          {region === 'valley' ? 'Pelican Town & Stardew Valley Locations' : 'Ginger Island Locations'} ({visiblePinsInRegion.length})
        </h2>
        <div className="grid-auto">
          {visiblePinsInRegion.map((pin) => (
            <button
              key={pin.id}
              type="button"
              className="card"
              style={{
                textAlign: 'left',
                borderColor: selectedPinId === pin.id ? CATEGORY_COLORS[pin.category] : undefined,
              }}
              onClick={() => handleSelectPin(pin)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span
                  className="badge"
                  style={{
                    background: `${CATEGORY_COLORS[pin.category]}22`,
                    color: CATEGORY_COLORS[pin.category],
                  }}
                >
                  {pin.category}
                </span>
                {pin.hours && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--ink-soft)' }}>
                    {pin.hours.split('(')[0].slice(0, 22)}
                  </span>
                )}
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{pin.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>{pin.subtitle}</div>
            </button>
          ))}
        </div>
      </section>

      {/* SLIDE-OVER LOCATION INSPECTOR DRAWER */}
      {inspectedPin && (
        <div className="drawer-backdrop" onClick={() => onSelectPin(null)}>
          <aside
            className="drawer-panel"
            role="dialog"
            aria-label={inspectedPin.name}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-header" style={{ marginBottom: 8 }}>
              <div>
                <span
                  className="badge"
                  style={{
                    background: `${CATEGORY_COLORS[inspectedPin.category]}22`,
                    color: CATEGORY_COLORS[inspectedPin.category],
                    marginBottom: 4,
                  }}
                >
                  {inspectedPin.category} •{' '}
                  {inspectedPin.region === 'ginger-island' ? 'Ginger Island' : 'Stardew Valley'}
                </span>
                <h2 style={{ margin: 0, fontSize: '1.32rem' }}>{inspectedPin.name}</h2>
                <div style={{ fontSize: '0.86rem', color: 'var(--ink-muted)' }}>
                  {inspectedPin.subtitle}
                </div>
              </div>
              <button
                type="button"
                className="icon-btn"
                aria-label="Close location inspector"
                onClick={() => onSelectPin(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => {
                  centerOnPin(inspectedPin, 2.2);
                  onSelectPin(null);
                }}
              >
                <LocateFixed size={14} /> Zoom Here on Map
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              {(inspectedPin.hours || inspectedPin.closedDays) && (
                <div className="card" style={{ padding: 12 }}>
                  {inspectedPin.hours && (
                    <div style={{ fontSize: '0.88rem' }}>
                      <strong>Hours:</strong> {inspectedPin.hours}
                    </div>
                  )}
                  {inspectedPin.closedDays && (
                    <div style={{ fontSize: '0.86rem', color: 'var(--crimson)', marginTop: 4, fontWeight: 600 }}>
                      Closed: {inspectedPin.closedDays}
                    </div>
                  )}
                </div>
              )}

              {inspectedPin.unlockCondition && (
                <div className="callout callout-river">
                  <strong>Unlock / Access:</strong> {inspectedPin.unlockCondition}
                </div>
              )}

              {/* Residents */}
              {inspectedPin.residents && inspectedPin.residents.length > 0 && (
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <User size={15} /> Villagers &amp; Staff Here
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {inspectedPin.residents.map((rName) => {
                      const v = VILLAGERS.find((x) => x.name === rName || x.name.includes(rName));
                      return (
                        <button
                          key={rName}
                          type="button"
                          className="btn btn-sm"
                          onClick={() => {
                            if (v) {
                              onSelectPin(null);
                              onOpenVillager(v.id);
                            }
                          }}
                        >
                          {rName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Shop Stock */}
              {inspectedPin.shopsItems && inspectedPin.shopsItems.length > 0 && (
                <div className="card">
                  <div style={{ fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <ShoppingBag size={15} color="var(--gold)" /> Notable Shop Goods &amp; Services
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.87rem', display: 'grid', gap: 3 }}>
                    {inspectedPin.shopsItems.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Catchable Fish */}
              {inspectedPin.fishHere && inspectedPin.fishHere.length > 0 && (
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Fish size={15} color="var(--river)" /> Catchable Fish (Tap for Encyclopedia)
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {inspectedPin.fishHere.map((fishName) => {
                      const match = findCatalogItemByName(fishName);
                      return (
                        <button
                          key={fishName}
                          type="button"
                          className="chip"
                          style={{ borderColor: 'var(--river)', color: 'var(--river)' }}
                          onClick={() => {
                            if (match) {
                              onSelectPin(null);
                              onOpenItem(match.id);
                            }
                          }}
                        >
                          🐟 {fishName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Forage */}
              {inspectedPin.forageHere && inspectedPin.forageHere.length > 0 && (
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Foraging Spawns</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {inspectedPin.forageHere.map((fName) => {
                      const match = findCatalogItemByName(fName);
                      return (
                        <button
                          key={fName}
                          type="button"
                          className="chip"
                          onClick={() => {
                            if (match) {
                              onSelectPin(null);
                              onOpenItem(match.id);
                            }
                          }}
                        >
                          🌿 {fName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Resources */}
              {inspectedPin.resourcesHere && inspectedPin.resourcesHere.length > 0 && (
                <div className="card">
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Key Resources &amp; Drops</div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.87rem' }}>
                    {inspectedPin.resourcesHere.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Secrets & Tips */}
              {inspectedPin.secrets && inspectedPin.secrets.length > 0 && (
                <div className="callout callout-sage">
                  <div style={{ fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Sparkles size={15} /> Secrets &amp; 1.6 Pro Tips
                    {profile.spoilerMode && inspectedPin.region === 'ginger-island' && (
                      <span className="badge badge-neutral">Island Lore</span>
                    )}
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.86rem', display: 'grid', gap: 4 }}>
                    {inspectedPin.secrets.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

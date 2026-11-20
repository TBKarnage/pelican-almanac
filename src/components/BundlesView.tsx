import { useMemo, useState } from 'react';
import { Check, CheckCheck, MapPin, RotateCcw, SlidersHorizontal, Sparkles } from 'lucide-react';
import type { BundleDefinition } from '../types/stardew';
import { useFarmStore } from '../state/useFarmStore';
import {
  COMMUNITY_CENTER_ROOMS,
  JOJA_PROJECTS,
  REMIXED_SLOT_GROUPS,
  BUNDLES,
} from '../data/bundles';
import { getActiveBundles } from '../utils/calculations';
import { GoldCoinIcon, JunimoSealIcon, SeasonBadgeIcon } from './AlmanacIcons';

interface BundlesViewProps {
  onOpenItem: (itemId: string) => void;
  onOpenMapPin: (pinId: string) => void;
}

export function BundlesView({ onOpenItem, onOpenMapPin }: BundlesViewProps) {
  const { profile, updateProfile, toggleBundleItem } = useFarmStore();

  const [selectedRoom, setSelectedRoom] = useState<'All' | BundleDefinition['room']>('All');
  const [onlySeasonNow, setOnlySeasonNow] = useState(false);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [showRemixedConfig, setShowRemixedConfig] = useState(false);

  const activeBundles = useMemo(() => getActiveBundles(profile), [profile]);

  const setBundleMode = (mode: 'Standard' | 'Remixed' | 'Joja') => {
    updateProfile((prev) => ({ ...prev, bundleMode: mode }));
  };

  const setRemixedOption = (groupId: string, bundleId: string) => {
    updateProfile((prev) => ({
      ...prev,
      activeRemixedBundles: {
        ...prev.activeRemixedBundles,
        [groupId]: bundleId,
      },
    }));
  };

  const markBundleAll = (bundle: BundleDefinition, check: boolean) => {
    updateProfile((prev) => {
      const next = { ...prev.checkedBundleItems };
      for (const item of bundle.items) {
        next[`${bundle.id}:${item.id}`] = check;
      }
      return { ...prev, checkedBundleItems: next };
    });
  };

  const toggleJojaProject = (projectId: string) => {
    updateProfile((prev) => ({
      ...prev,
      jojaProjects: {
        ...prev.jojaProjects,
        [projectId]: !prev.jojaProjects[projectId],
      },
    }));
  };

  // Compute completion metrics for Community Center
  const bundleStats = useMemo(() => {
    const coreBundles = activeBundles.filter((b) => b.room !== 'Abandoned JojaMart');
    let completedBundles = 0;
    let totalSlotsNeeded = 0;
    let filledSlotsCapped = 0;

    for (const b of coreBundles) {
      const checked = b.items.filter((it) => profile.checkedBundleItems[`${b.id}:${it.id}`]).length;
      if (checked >= b.slotsRequired) completedBundles++;
      totalSlotsNeeded += b.slotsRequired;
      filledSlotsCapped += Math.min(b.slotsRequired, checked);
    }

    const roomStatus = COMMUNITY_CENTER_ROOMS.map((room) => {
      const roomBundles = activeBundles.filter((b) => b.room === room.id);
      const doneBundles = roomBundles.filter((b) => {
        const count = b.items.filter((it) => profile.checkedBundleItems[`${b.id}:${it.id}`]).length;
        return count >= b.slotsRequired;
      }).length;
      const urgentCount = roomBundles.reduce((sum, b) => {
        const count = b.items.filter((it) => profile.checkedBundleItems[`${b.id}:${it.id}`]).length;
        if (count >= b.slotsRequired) return sum;
        return (
          sum +
          b.items.filter(
            (it) =>
              !profile.checkedBundleItems[`${b.id}:${it.id}`] &&
              it.seasons?.includes(profile.season)
          ).length
        );
      }, 0);
      return {
        room,
        total: roomBundles.length,
        done: doneBundles,
        complete: roomBundles.length > 0 && doneBundles === roomBundles.length,
        urgentCount,
      };
    });

    const pct = totalSlotsNeeded > 0 ? Math.round((filledSlotsCapped / totalSlotsNeeded) * 100) : 0;
    return {
      totalBundles: coreBundles.length,
      completedBundles,
      filledSlotsCapped,
      totalSlotsNeeded,
      pct,
      roomStatus,
    };
  }, [activeBundles, profile.checkedBundleItems, profile.season]);

  // Joja metrics
  const jojaStats = useMemo(() => {
    const mainProjects = JOJA_PROJECTS.filter((p) => p.id !== 'joja-theater');
    const spent = JOJA_PROJECTS.filter((p) => profile.jojaProjects[p.id]).reduce((s, p) => s + p.cost, 0);
    const remainingCore = mainProjects
      .filter((p) => !profile.jojaProjects[p.id])
      .reduce((s, p) => s + p.cost, 0);
    const doneCount = mainProjects.filter((p) => profile.jojaProjects[p.id]).length;
    return {
      doneCount,
      totalCore: mainProjects.length,
      spent,
      remainingCore,
      pct: Math.round((doneCount / mainProjects.length) * 100),
    };
  }, [profile.jojaProjects]);

  const visibleBundles = useMemo(() => {
    return activeBundles.filter((b) => {
      if (selectedRoom !== 'All' && b.room !== selectedRoom) return false;
      const checkedCount = b.items.filter((it) => profile.checkedBundleItems[`${b.id}:${it.id}`]).length;
      const isComplete = checkedCount >= b.slotsRequired;
      if (hideCompleted && isComplete) return false;
      if (onlySeasonNow) {
        const hasCurrentSeasonItem = b.items.some(
          (it) =>
            !profile.checkedBundleItems[`${b.id}:${it.id}`] &&
            it.seasons?.includes(profile.season)
        );
        if (!hasCurrentSeasonItem) return false;
      }
      return true;
    });
  }, [activeBundles, selectedRoom, hideCompleted, onlySeasonNow, profile.checkedBundleItems, profile.season]);

  return (
    <div>
      <header className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <JunimoSealIcon size={28} />
            {profile.bundleMode === 'Joja'
              ? 'Joja Community Development Form'
              : 'Community Center & Bundles Tracker'}
          </h1>
          <p className="page-subtitle">
            Supports Standard, Remixed (including 1.6 Forest, Helper&apos;s &amp; Winter Star bundles), and Joja Route.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="segmented-bar" role="group" aria-label="Bundle Mode">
            {(['Standard', 'Remixed', 'Joja'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                className={`seg-btn ${profile.bundleMode === mode ? 'active' : ''}`}
                onClick={() => setBundleMode(mode)}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="btn btn-sm"
            onClick={() =>
              onOpenMapPin(profile.bundleMode === 'Joja' ? 'jojamart' : 'community-center')
            }
          >
            <MapPin size={15} /> Locate on Map
          </button>
        </div>
      </header>

      {/* Top Progress Summary */}
      {profile.bundleMode === 'Joja' ? (
        <section className="card-elevated" style={{ marginBottom: 16 }}>
          <div className="card-header">
            <h2 className="card-title">Joja Town Restoration Progress</h2>
            <span className="badge badge-river tabular-nums">
              {jojaStats.doneCount}/{jojaStats.totalCore} Civic Projects ({jojaStats.pct}%)
            </span>
          </div>
          <div className="progress-track" style={{ marginBottom: 10 }}>
            <div
              className="progress-fill"
              style={{ width: `${jojaStats.pct}%`, background: 'var(--river)' }}
            />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: '0.9rem' }}>
            <div>
              Total Invested:{' '}
              <strong className="tabular-nums">
                {jojaStats.spent.toLocaleString()}g <GoldCoinIcon size={14} />
              </strong>
            </div>
            <div>
              Remaining to Finish Town:{' '}
              <strong className="tabular-nums" style={{ color: 'var(--gold)' }}>
                {jojaStats.remainingCore.toLocaleString()}g <GoldCoinIcon size={14} />
              </strong>
            </div>
          </div>
        </section>
      ) : (
        <section className="card-elevated" style={{ marginBottom: 16 }}>
          <div className="card-header">
            <div>
              <h2 className="card-title">
                Golden Scroll Restoration — {bundleStats.completedBundles}/{bundleStats.totalBundles} Core Bundles
              </h2>
              <div style={{ fontSize: '0.84rem', color: 'var(--ink-muted)', marginTop: 2 }}>
                {bundleStats.filledSlotsCapped} of {bundleStats.totalSlotsNeeded} required bundle slots donated
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {profile.bundleMode === 'Remixed' && (
                <button
                  type="button"
                  className={`btn btn-sm ${showRemixedConfig ? 'btn-primary' : ''}`}
                  onClick={() => setShowRemixedConfig((v) => !v)}
                >
                  <SlidersHorizontal size={15} /> Customize Remixed Rolls
                </button>
              )}
              <span className="badge badge-sage tabular-nums">{bundleStats.pct}%</span>
            </div>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${bundleStats.pct}%` }} />
          </div>
        </section>
      )}

      {/* JOJA VIEW */}
      {profile.bundleMode === 'Joja' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="callout callout-river">
            <strong>JojaMart Route Notes:</strong> Buying the 5,000g JojaMart Membership turns the
            Community Center into a Joja Warehouse permanently. Benefit: zero seasonal bundle stress,
            Morris fixes upgrades overnight with pure Gold, and JojaMart later sells{' '}
            <strong>Auto-Petters (50,000g)</strong> after Warehouse completion!
          </div>
          <div className="grid-2">
            {JOJA_PROJECTS.map((proj) => {
              const done = Boolean(profile.jojaProjects[proj.id]);
              return (
                <div key={proj.id} className={`check-row ${done ? 'done' : ''}`}>
                  <button
                    type="button"
                    className="check-toggle"
                    aria-label={`Toggle ${proj.name}`}
                    onClick={() => toggleJojaProject(proj.id)}
                  >
                    {done && <Check size={16} strokeWidth={3} />}
                  </button>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 8,
                        flexWrap: 'wrap',
                      }}
                    >
                      <strong style={{ fontSize: '0.96rem' }}>{proj.name}</strong>
                      <span className="badge badge-gold tabular-nums">
                        {proj.cost.toLocaleString()}g <GoldCoinIcon size={12} />
                      </span>
                    </div>
                    <div style={{ fontSize: '0.84rem', color: 'var(--ink-muted)', marginTop: 4 }}>
                      {proj.reward}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <>
          {/* Remixed Configurator Drawer/Card */}
          {profile.bundleMode === 'Remixed' && showRemixedConfig && (
            <section className="card" style={{ marginBottom: 16, borderColor: 'var(--plum)' }}>
              <div className="card-header">
                <h3 className="card-title">
                  <Sparkles size={17} color="var(--plum)" /> Configure Your Save&apos;s Remixed Bundle Slots
                </h3>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => setShowRemixedConfig(false)}
                >
                  Done
                </button>
              </div>
              <p style={{ margin: '0 0 12px', fontSize: '0.86rem', color: 'var(--ink-muted)' }}>
                Pick which bundle rolled inside each Community Center slot in your Remixed save.
              </p>
              <div className="grid-3">
                {REMIXED_SLOT_GROUPS.map((grp) => {
                  const chosen = profile.activeRemixedBundles[grp.groupId] ?? grp.options[0];
                  return (
                    <div key={grp.groupId} className="card-elevated" style={{ padding: 12 }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-soft)' }}>
                        {grp.room}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 8 }}>
                        {grp.slotLabel}
                      </div>
                      <select
                        className="select"
                        value={chosen}
                        onChange={(e) => setRemixedOption(grp.groupId, e.target.value)}
                      >
                        {grp.options.map((optId) => {
                          const def = BUNDLES.find((b) => b.id === optId);
                          return (
                            <option key={optId} value={optId}>
                              {def ? def.name : optId}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Room Selector Chips + Filters */}
          <section className="card" style={{ marginBottom: 16 }}>
            <div className="chip-row" style={{ marginBottom: 10 }}>
              <button
                type="button"
                className={`chip ${selectedRoom === 'All' ? 'active' : ''}`}
                onClick={() => setSelectedRoom('All')}
              >
                All Rooms ({bundleStats.completedBundles}/{bundleStats.totalBundles})
              </button>
              {bundleStats.roomStatus.map(({ room, done, total, complete, urgentCount }) => (
                <button
                  key={room.id}
                  type="button"
                  className={`chip ${selectedRoom === room.id ? 'active' : ''}`}
                  onClick={() => setSelectedRoom(room.id)}
                >
                  <span
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: '50%',
                      background: complete ? 'var(--sage)' : room.color,
                      display: 'inline-block',
                    }}
                  />
                  {room.title} ({done}/{total})
                  {urgentCount > 0 && selectedRoom !== room.id && (
                    <span className="badge badge-gold" style={{ padding: '0 5px', fontSize: '0.68rem' }}>
                      {urgentCount} {profile.season}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="chip-row">
              <button
                type="button"
                className={`chip ${onlySeasonNow ? 'active' : ''}`}
                onClick={() => setOnlySeasonNow((v) => !v)}
              >
                <SeasonBadgeIcon season={profile.season} size={14} /> Obtainable in {profile.season}
              </button>
              <button
                type="button"
                className={`chip ${hideCompleted ? 'active' : ''}`}
                onClick={() => setHideCompleted((v) => !v)}
              >
                Hide Completed Bundles
              </button>
            </div>
          </section>

          {/* Rooms & Bundles List */}
          {visibleBundles.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 32 }}>
              <p style={{ margin: 0, fontWeight: 600 }}>
                No bundles match your active filter. Try disabling &ldquo;Obtainable in {profile.season}&rdquo; or &ldquo;Hide Completed&rdquo;.
              </p>
            </div>
          ) : (
            COMMUNITY_CENTER_ROOMS.filter(
              (room) =>
                (selectedRoom === 'All' || room.id === selectedRoom) &&
                visibleBundles.some((b) => b.room === room.id)
            ).map((room) => {
              const roomBundles = visibleBundles.filter((b) => b.room === room.id);
              const meta = bundleStats.roomStatus.find((r) => r.room.id === room.id);
              return (
                <section key={room.id} style={{ marginBottom: 22 }}>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      marginBottom: 10,
                      paddingBottom: 6,
                      borderBottom: `2px solid ${room.color}44`,
                    }}
                  >
                    <div>
                      <h2
                        style={{
                          margin: 0,
                          fontSize: '1.22rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: 4,
                            background: room.color,
                            display: 'inline-block',
                          }}
                        />
                        {room.title}
                        {meta?.complete && <span className="badge badge-sage">Restored</span>}
                      </h2>
                      <div style={{ fontSize: '0.84rem', color: 'var(--ink-muted)' }}>
                        <strong>Reward:</strong> {room.reward} • {room.unlockRequirement}
                      </div>
                    </div>
                    {meta && (
                      <span className="badge badge-neutral tabular-nums">
                        {meta.done}/{meta.total} Bundles
                      </span>
                    )}
                  </div>

                  <div className="grid-2" style={{ alignItems: 'start' }}>
                    {roomBundles.map((bundle) => {
                      const checkedCount = bundle.items.filter(
                        (it) => profile.checkedBundleItems[`${bundle.id}:${it.id}`]
                      ).length;
                      const isDone = checkedCount >= bundle.slotsRequired;
                      const pct = Math.min(
                        100,
                        Math.round((checkedCount / bundle.slotsRequired) * 100)
                      );

                      return (
                        <article
                          key={bundle.id}
                          className="card"
                          style={{
                            borderColor: isDone ? 'var(--sage)' : undefined,
                            background: isDone ? 'var(--bg-elevated)' : undefined,
                          }}
                        >
                          <div className="card-header" style={{ marginBottom: 8 }}>
                            <div>
                              <h3 className="card-title" style={{ fontSize: '1rem' }}>
                                {bundle.name}
                              </h3>
                              <div style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
                                Reward: <strong>{bundle.reward}</strong>
                              </div>
                            </div>
                            <span
                              className={`badge tabular-nums ${
                                isDone ? 'badge-sage' : 'badge-gold'
                              }`}
                            >
                              {Math.min(checkedCount, bundle.slotsRequired)}/{bundle.slotsRequired} slots
                            </span>
                          </div>

                          <div className="progress-track" style={{ height: 7, marginBottom: 10 }}>
                            <div className="progress-fill" style={{ width: `${pct}%` }} />
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 10 }}>
                            {bundle.items.map((item) => {
                              const key = `${bundle.id}:${item.id}`;
                              const checked = Boolean(profile.checkedBundleItems[key]);
                              const inCurrentSeason = item.seasons?.includes(profile.season);

                              return (
                                <div key={item.id} className={`check-row ${checked ? 'done' : ''}`}>
                                  <button
                                    type="button"
                                    className="check-toggle"
                                    aria-label={`Toggle ${item.name} in ${bundle.name}`}
                                    onClick={() => toggleBundleItem(bundle.id, item.id)}
                                  >
                                    {checked && <Check size={16} strokeWidth={3} />}
                                  </button>

                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        gap: 5,
                                        fontWeight: 700,
                                        fontSize: '0.91rem',
                                      }}
                                    >
                                      <span>
                                        {item.name}
                                        {bundle.room !== 'Vault' && item.qty > 1
                                          ? ` ×${item.qty.toLocaleString()}`
                                          : ''}
                                      </span>
                                      {item.quality && (
                                        <span className="badge badge-gold">{item.quality} ★</span>
                                      )}
                                      {!checked && inCurrentSeason && (
                                        <span className="badge badge-sage">Available Now</span>
                                      )}
                                    </div>
                                    <div style={{ fontSize: '0.79rem', color: 'var(--ink-muted)' }}>
                                      {item.source}
                                      {item.seasons?.length ? ` (${item.seasons.join('/')})` : ''}
                                    </div>
                                  </div>

                                  {item.itemId && (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-ghost"
                                      onClick={() => onOpenItem(item.itemId!)}
                                    >
                                      Card
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                            {!isDone ? (
                              <button
                                type="button"
                                className="btn btn-sm btn-ghost"
                                onClick={() => markBundleAll(bundle, true)}
                              >
                                <CheckCheck size={14} /> Complete Bundle
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-sm btn-ghost"
                                onClick={() => markBundleAll(bundle, false)}
                              >
                                <RotateCcw size={14} /> Reset
                              </button>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              );
            })
          )}
        </>
      )}
    </div>
  );
}

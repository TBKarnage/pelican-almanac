import { useState } from 'react';
import {
  Check,
  Download,
  EyeOff,
  FileUp,
  Moon,
  Plus,
  Smartphone,
  Sun,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import type { FarmProfile } from '../types/stardew';
import { useFarmStore } from '../state/useFarmStore';
import { parseStardewSaveXml } from '../utils/saveImporter';

interface FarmSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FARM_TYPES: FarmProfile['farmType'][] = [
  'Meadowlands',
  'Standard',
  'Four Corners',
  'Forest',
  'Riverland',
  'Hill-top',
  'Beach',
  'Wilderness',
];

export function FarmSettingsModal({ isOpen, onClose }: FarmSettingsModalProps) {
  const {
    theme,
    setTheme,
    profiles,
    profile,
    switchProfile,
    createProfile,
    addImportedProfile,
    deleteProfile,
    updateProfile,
    exportBackupJson,
    importBackupJson,
  } = useFarmStore();

  const [newFarmName, setNewFarmName] = useState('');
  const [newFarmerName, setNewFarmerName] = useState('');
  const [newFarmType, setNewFarmType] = useState<FarmProfile['farmType']>('Meadowlands');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateFarm = (e: React.FormEvent) => {
    e.preventDefault();
    createProfile(newFarmName || 'New Valley Farm', newFarmerName || 'Farmer', newFarmType);
    setNewFarmName('');
    setNewFarmerName('');
    setErrorMsg(null);
    setStatusMsg('Created & switched to new farm profile!');
  };

  const handleSaveXmlUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg(null);
    setStatusMsg(null);
    try {
      const content = await file.text();
      const summary = parseStardewSaveXml(content, profile);
      addImportedProfile(summary.profile);
      setStatusMsg(summary.notes.join(' '));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to parse XML save file.');
    }
    e.target.value = '';
  };

  const handleExportJson = () => {
    const json = exportBackupJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pelican-almanac-backup-Y${profile.year}-${profile.season}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMsg('Downloaded JSON backup file.');
  };

  const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg(null);
    try {
      const ok = importBackupJson(await file.text());
      if (ok) setStatusMsg('Almanac JSON backup restored successfully!');
      else setErrorMsg('File was not a valid Pelican Almanac JSON backup.');
    } catch {
      setErrorMsg('Could not read selected backup file.');
    }
    e.target.value = '';
  };

  const toggleProfession = (key: keyof FarmProfile['professions']) => {
    updateProfile((prev) => ({
      ...prev,
      professions: {
        ...prev.professions,
        [key]: !prev.professions[key],
      },
    }));
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        className="modal-panel"
        role="dialog"
        aria-label="Farm Profiles, Save Importer & Preferences"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-header" style={{ marginBottom: 14 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.3rem' }}>Farm Profiles &amp; Almanac Settings</h2>
            <div style={{ fontSize: '0.84rem', color: 'var(--ink-muted)' }}>
              Active: <strong>{profile.name}</strong> • Farmer {profile.farmerName}
            </div>
          </div>
          <button type="button" className="icon-btn" aria-label="Close settings" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {statusMsg && (
          <div className="callout callout-sage" style={{ marginBottom: 12 }}>
            {statusMsg}
          </div>
        )}
        {errorMsg && (
          <div
            className="callout"
            style={{
              marginBottom: 12,
              borderLeftColor: 'var(--crimson)',
              background: 'var(--crimson-soft)',
            }}
          >
            {errorMsg}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Theme & Preferences */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: 10 }}>
              <strong style={{ fontSize: '0.96rem' }}>Appearance &amp; Spoiler Protection</strong>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              <button
                type="button"
                className={`btn btn-sm ${theme === 'daylight' ? 'btn-primary' : ''}`}
                onClick={() => setTheme('daylight')}
              >
                <Sun size={15} /> Pelican Parchment (Daylight)
              </button>
              <button
                type="button"
                className={`btn btn-sm ${theme === 'moonlight' ? 'btn-primary' : ''}`}
                onClick={() => setTheme('moonlight')}
              >
                <Moon size={15} /> Moonlight Cabin (Night)
              </button>
            </div>
            <button
              type="button"
              className={`check-row ${profile.spoilerMode ? 'done' : ''}`}
              style={{ width: '100%', textAlign: 'left', alignItems: 'center' }}
              onClick={() =>
                updateProfile((prev) => ({ ...prev, spoilerMode: !prev.spoilerMode }))
              }
            >
              <span className="check-toggle">
                {profile.spoilerMode && <Check size={15} strokeWidth={3} />}
              </span>
              <div style={{ flex: 1 }}>
                <strong>
                  <EyeOff size={14} style={{ verticalAlign: '-2px' }} /> Spoiler Shield for Locked Heart Events
                </strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
                  Hides story summaries for heart events you haven&apos;t unlocked yet unless clicked.
                </div>
              </div>
            </button>
          </div>

          {/* Professions */}
          <div className="card">
            <strong style={{ display: 'block', marginBottom: 8 }}>
              Farmer Professions (Used in Profit Calculators)
            </strong>
            <div className="chip-row">
              {(
                [
                  ['tiller', 'Tiller (+10% Crops)'],
                  ['artisan', 'Artisan (+40% Wine/Jelly/Cheese/Smoked)'],
                  ['agriculturist', 'Agriculturist (+10% Speed)'],
                  ['fisher', 'Fisher (+25% Fish)'],
                  ['angler', 'Angler (+50% Fish)'],
                ] as [keyof FarmProfile['professions'], string][]
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={`chip ${profile.professions[key] ? 'active' : ''}`}
                  onClick={() => toggleProfession(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Stardew Valley Save XML Importer */}
          <div className="card">
            <strong style={{ display: 'block', marginBottom: 4 }}>
              Personalize From Stardew Valley Save File (XML)
            </strong>
            <p style={{ margin: '0 0 10px', fontSize: '0.82rem', color: 'var(--ink-muted)' }}>
              Optionally upload your Stardew Valley save XML file (found in iPad Files app under{' '}
              <code>On My iPad/Stardew Valley</code>, or PC/Mac{' '}
              <code>~/.config/StardewValley/Saves</code>) to auto-sync Season, Year, Villager
              Hearts, Caught Fish, Shipped items &amp; Museum donations completely locally on-device.
            </p>
            <label className="btn btn-primary" style={{ display: 'inline-flex', cursor: 'pointer' }}>
              <FileUp size={16} /> Import Stardew Save File (.xml)
              <input
                type="file"
                accept=".xml,text/xml,*"
                style={{ display: 'none' }}
                onChange={handleSaveXmlUpload}
              />
            </label>
          </div>

          {/* Farm Profile Switcher & New Farm */}
          <div className="card">
            <strong style={{ display: 'block', marginBottom: 8 }}>
              Saved Farm Slots ({profiles.length})
            </strong>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 12 }}>
              {profiles.map((p) => {
                const isActive = p.id === profile.id;
                return (
                  <div
                    key={p.id}
                    className={`check-row ${isActive ? 'done' : ''}`}
                    style={{ alignItems: 'center' }}
                  >
                    <button
                      type="button"
                      style={{
                        flex: 1,
                        border: 'none',
                        background: 'transparent',
                        textAlign: 'left',
                        padding: 0,
                      }}
                      onClick={() => switchProfile(p.id)}
                    >
                      <div style={{ fontWeight: 800 }}>
                        {p.name}{' '}
                        {isActive && (
                          <span className="badge badge-sage" style={{ marginLeft: 4 }}>
                            Active
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
                        Farmer {p.farmerName} • {p.farmType} • {p.season} {p.day}, Year {p.year}
                      </div>
                    </button>
                    {profiles.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-sm btn-ghost"
                        aria-label={`Delete ${p.name}`}
                        onClick={() => deleteProfile(p.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <form
              onSubmit={handleCreateFarm}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr auto',
                gap: 8,
                paddingTop: 10,
                borderTop: '1px dashed var(--wood-border)',
              }}
            >
              <input
                type="text"
                className="input"
                placeholder="New Farm name..."
                value={newFarmName}
                onChange={(e) => setNewFarmName(e.target.value)}
              />
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="text"
                  className="input"
                  placeholder="Farmer..."
                  value={newFarmerName}
                  onChange={(e) => setNewFarmerName(e.target.value)}
                />
                <select
                  className="select"
                  value={newFarmType}
                  onChange={(e) => setNewFarmType(e.target.value as FarmProfile['farmType'])}
                >
                  {FARM_TYPES.map((ft) => (
                    <option key={ft} value={ft}>
                      {ft}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-primary">
                <Plus size={16} /> New
              </button>
            </form>
          </div>

          {/* JSON Backup & iPad PWA Help */}
          <div className="grid-2">
            <div className="card">
              <strong style={{ display: 'block', marginBottom: 6 }}>Almanac JSON Backup</strong>
              <p style={{ margin: '0 0 10px', fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
                Move progress between iPad Safari &amp; Mac anytime.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <button type="button" className="btn btn-sm" onClick={handleExportJson}>
                  <Download size={14} /> Export JSON
                </button>
                <label className="btn btn-sm" style={{ cursor: 'pointer' }}>
                  <Upload size={14} /> Restore JSON
                  <input
                    type="file"
                    accept=".json,application/json"
                    style={{ display: 'none' }}
                    onChange={handleImportJson}
                  />
                </label>
              </div>
            </div>

            <div className="callout">
              <strong style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Smartphone size={15} /> iPad PWA Installation
              </strong>
              <div style={{ fontSize: '0.8rem' }}>
                In Safari on iPad, tap <strong>Share (square with arrow)</strong> →{' '}
                <strong>&ldquo;Add to Home Screen&rdquo;</strong>. Launches full-screen like a native app and works offline with cached Service Worker data!
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

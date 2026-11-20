import type { Season, Weather } from '../types/stardew';

export function SeasonBadgeIcon({ season, size = 16 }: { season: Season; size?: number }) {
  if (season === 'Spring') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 21V11" stroke="#3B6E38" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M12 13C7 13 5 9 6 5C10 5 13 7 12 13Z" fill="#77B85B" stroke="#3B6E38" strokeWidth="1.6" />
        <path d="M12 11C17 11 19 7 18 4C14 4 11 6 12 11Z" fill="#F294A8" stroke="#A63F5B" strokeWidth="1.6" />
      </svg>
    );
  }
  if (season === 'Summer') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="5" fill="#F0B136" stroke="#B36B12" strokeWidth="1.8" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2.2 2.2M16.8 16.8L19 19M19 5l-2.2 2.2M7.2 16.8L5 19" stroke="#B36B12" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (season === 'Fall') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3L15 8L20 7L17 12L20 16L13 17L12 21L11 17L4 16L7 12L4 7L9 8L12 3Z" fill="#D97828" stroke="#8C3B14" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2v20M4.5 6.5l15 11M19.5 6.5l-15 11" stroke="#3B82A6" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="2.2" fill="#E6F4FA" stroke="#3B82A6" strokeWidth="1.5" />
    </svg>
  );
}

export function WeatherIcon({ weather, size = 16 }: { weather: Weather; size?: number }) {
  if (weather === 'Sunny') return <SeasonBadgeIcon season="Summer" size={size} />;
  if (weather === 'Rain' || weather === 'Green Rain') {
    const color = weather === 'Green Rain' ? '#499944' : '#2C6482';
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6.5 14A4.5 4.5 0 0 1 8 5.2 5.5 5.5 0 0 1 18.5 7.5 3.5 3.5 0 0 1 18 14H6.5Z" fill={weather === 'Green Rain' ? '#CFE8C8' : '#CFE6F2'} stroke={color} strokeWidth="1.8" />
        <path d="M8 17l-1.5 3M13 17l-1.5 3M18 17l-1.5 3" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (weather === 'Storm') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6.5 13A4.5 4.5 0 0 1 8 4.2 5.5 5.5 0 0 1 18.5 6.5 3.5 3.5 0 0 1 18 13H6.5Z" fill="#6D7A8C" stroke="#374352" strokeWidth="1.8" />
        <path d="M13 13l-2.5 4h3L11.5 21.5" stroke="#E29E38" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (weather === 'Snow') return <SeasonBadgeIcon season="Winter" size={size} />;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 9h12a2.5 2.5 0 1 0-2.5-2.5M3 14h15a2.5 2.5 0 1 1-2.5 2.5" stroke="#D97828" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function JunimoSealIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3v3M12 3c2 0 3.5-1 4-2" stroke="#3B6E38" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="13.5" r="7.5" fill="#88C96D" stroke="#3B6E38" strokeWidth="1.8" />
      <circle cx="9.5" cy="12.5" r="1.1" fill="#2B1E13" />
      <circle cx="14.5" cy="12.5" r="1.1" fill="#2B1E13" />
      <path d="M9.5 15.8h5" stroke="#2B1E13" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function GoldCoinIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" style={{ verticalAlign: '-2px' }} aria-hidden="true">
      <circle cx="10" cy="10" r="8" fill="#F2B830" stroke="#9C5E08" strokeWidth="1.6" />
      <text x="10" y="13.5" textAnchor="middle" fontSize="10" fontWeight="800" fill="#703E02" fontFamily="sans-serif">
        g
      </text>
    </svg>
  );
}

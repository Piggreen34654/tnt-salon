import { useEffect, useRef, useState } from 'react';

export function Header({
  count,
  categories,
  category,
  onCategory,
  onImport,
  onReset,
  imported,
  notice,
}) {
  const inputRef = useRef(null);
  const clock = useClock();

  return (
    <header className="header">
      <div className="header-top">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">TN</span>
          <div>
            <p className="brand-name">TNT Salon</p>
            <p className="brand-sub">
              {count} chaîne{count > 1 ? 's' : ''} · flux de test publics
            </p>
          </div>
        </div>
        <div className="clock" aria-live="polite">
          <p className="clock-time">{clock.time}</p>
          <p className="clock-date">{clock.date}</p>
        </div>
      </div>

      <div className="header-tools">
        <div className="filters" role="toolbar" aria-label="Catégories">
          {categories.map((name) => (
            <button
              key={name}
              type="button"
              className="chip"
              aria-pressed={name === category}
              onClick={() => onCategory(name)}
            >
              {name}
            </button>
          ))}
        </div>
        <div className="header-actions">
          <button type="button" className="ghost-btn" onClick={() => inputRef.current?.click()}>
            Importer un M3U
          </button>
          {imported ? (
            <button type="button" className="ghost-btn" onClick={onReset}>
              Liste d’exemple
            </button>
          ) : null}
          <input
            ref={inputRef}
            className="sr-only"
            type="file"
            aria-hidden="true"
            tabIndex={-1}
            accept=".m3u,.m3u8,audio/x-mpegurl,application/vnd.apple.mpegurl"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = '';
              if (file) onImport(file);
            }}
          />
        </div>
      </div>

      {notice ? (
        <p className="banner" role="status">
          {notice}
        </p>
      ) : null}
    </header>
  );
}

function useClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return {
    time: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    date: now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }),
  };
}

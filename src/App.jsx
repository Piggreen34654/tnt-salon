import { useEffect, useMemo, useState } from 'react';
import { Header } from './components/Header';
import { ChannelGrid } from './components/ChannelGrid';
import { Player } from './components/Player';
import { loadChannels, normalizeList } from './data/loadChannels';
import { parseM3u } from './lib/parseM3u';

export default function App() {
  const [channels, setChannels] = useState([]);
  const [status, setStatus] = useState('loading');
  const [notice, setNotice] = useState('');
  const [imported, setImported] = useState(false);
  const [category, setCategory] = useState('Toutes');
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    loadChannels()
      .then((list) => {
        if (cancelled) return;
        setChannels(list);
        setStatus('ready');
      })
      .catch(() => {
        if (cancelled) return;
        setStatus('error');
        setNotice('Impossible de charger channels.json.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => {
    const names = [...new Set(channels.map((channel) => channel.category))];
    return ['Toutes', ...names];
  }, [channels]);

  const visible = useMemo(
    () => (category === 'Toutes' ? channels : channels.filter((channel) => channel.category === category)),
    [channels, category],
  );

  const activeIndex = visible.findIndex((channel) => channel.id === activeId);
  const active = activeIndex >= 0 ? visible[activeIndex] : null;

  useEffect(() => {
    document.title = active ? `${active.number} · ${active.name} — TNT Salon` : 'TNT Salon';
  }, [active]);

  useEffect(() => {
    document.body.classList.toggle('player-open', Boolean(active));
    return () => document.body.classList.remove('player-open');
  }, [active]);

  useEffect(() => {
    if (activeId && !visible.some((channel) => channel.id === activeId)) {
      setActiveId(null);
    }
  }, [activeId, visible]);

  function selectCategory(next) {
    setCategory(next);
    setNotice('');
  }

  function zap(delta) {
    if (visible.length < 2 || activeIndex < 0) return;
    const next = (activeIndex + delta + visible.length) % visible.length;
    setActiveId(visible[next].id);
  }

  async function importM3u(file) {
    try {
      const text = await file.text();
      const result = parseM3u(text);
      if (result.error) {
        setNotice(result.error);
        return;
      }
      setChannels(normalizeList(result.channels));
      setImported(true);
      setCategory('Toutes');
      setActiveId(null);
      setNotice(`Liste importée : ${result.channels.length} chaîne${result.channels.length > 1 ? 's' : ''}. Elle reste en mémoire jusqu’au rechargement.`);
      setStatus('ready');
    } catch {
      setNotice('Impossible de lire ce fichier.');
    }
  }

  async function resetJson() {
    setStatus('loading');
    setNotice('');
    try {
      const list = await loadChannels();
      setChannels(list);
      setImported(false);
      setCategory('Toutes');
      setActiveId(null);
      setStatus('ready');
    } catch {
      setStatus('error');
      setNotice('Impossible de recharger channels.json.');
    }
  }

  return (
    <div className="app">
      <div inert={active ? true : undefined}>
        <Header
          count={channels.length}
          categories={categories}
          category={category}
          onCategory={selectCategory}
          onImport={importM3u}
          onReset={resetJson}
          imported={imported}
          notice={notice}
        />

        <main className="main">
        {status === 'loading' && channels.length === 0 ? (
          <p className="empty">Chargement des chaînes…</p>
        ) : null}
        {status === 'error' && channels.length === 0 ? (
          <div className="empty">
            <p>La grille n’a pas pu être chargée.</p>
            <button type="button" className="ghost-btn" onClick={resetJson}>
              Réessayer
            </button>
          </div>
        ) : null}
        {channels.length > 0 ? (
          <ChannelGrid
            channels={visible}
            onSelect={(channel) => {
              setNotice('');
              setActiveId(channel.id);
            }}
            playerOpen={Boolean(active)}
          />
        ) : null}
        <p className="hint">
            Flèches pour parcourir, Entrée pour lancer, Espace pour la pause, Échap pour revenir.
            Pendant la lecture, gauche et droite changent de chaîne.
          </p>
        </main>
      </div>

      {active ? (
        <Player
          channel={active}
          disableZap={visible.length < 2}
          onClose={() => setActiveId(null)}
          onPrev={() => zap(-1)}
          onNext={() => zap(1)}
        />
      ) : null}
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { ChannelCard } from './ChannelCard';

/**
 * Grille avec focus clavier (flèches), pratique pour une télécommande
 * qui envoie les mêmes touches qu'un clavier.
 */
export function ChannelGrid({ channels, onSelect, playerOpen }) {
  const gridRef = useRef(null);
  const [focusIndex, setFocusIndex] = useState(0);

  useEffect(() => {
    setFocusIndex(0);
  }, [channels]);

  useEffect(() => {
    if (playerOpen) return;
    const cards = gridRef.current?.querySelectorAll('[data-channel-card]');
    const card = cards?.[focusIndex];
    card?.focus();
    card?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [focusIndex, playerOpen, channels]);

  function columnCount() {
    const grid = gridRef.current;
    if (!grid) return 1;
    const tracks = getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean);
    return tracks.length || 1;
  }

  function onKeyDown(event) {
    if (!channels.length) return;
    const cols = columnCount();
    const max = channels.length - 1;
    let next = null;
    if (event.key === 'ArrowRight') next = Math.min(max, focusIndex + 1);
    else if (event.key === 'ArrowLeft') next = Math.max(0, focusIndex - 1);
    else if (event.key === 'ArrowDown') next = Math.min(max, focusIndex + cols);
    else if (event.key === 'ArrowUp') next = Math.max(0, focusIndex - cols);
    else return;
    event.preventDefault();
    setFocusIndex(next);
  }

  if (!channels.length) {
    return <p className="empty">Aucune chaîne dans cette catégorie.</p>;
  }

  return (
    <div className="grid" ref={gridRef} onKeyDown={onKeyDown}>
      {channels.map((channel, index) => (
        <ChannelCard
          key={channel.id}
          channel={channel}
          tabIndex={index === focusIndex ? 0 : -1}
          onFocus={() => setFocusIndex(index)}
          onSelect={() => onSelect(channel)}
        />
      ))}
    </div>
  );
}

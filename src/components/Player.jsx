import { useEffect, useRef } from 'react';
import { usePlayer } from '../hooks/usePlayer';
import { PlayerControls } from './PlayerControls';

export function Player({ channel, onClose, onPrev, onNext, disableZap }) {
  const videoRef = useRef(null);
  const shellRef = useRef(null);
  const playRef = useRef(null);
  const {
    playing,
    loading,
    error,
    volume,
    muted,
    isFullscreen,
    toggle,
    changeVolume,
    toggleMute,
    toggleFullscreen,
  } = usePlayer(videoRef, shellRef, channel);

  useEffect(() => {
    playRef.current?.focus();
  }, [channel.id]);

  useEffect(() => {
    function onKey(event) {
      const target = event.target;
      const onSlider = target instanceof HTMLInputElement;
      if (event.key === 'Escape') {
        event.preventDefault();
        if (document.fullscreenElement) {
          document.exitFullscreen();
          return;
        }
        onClose();
        return;
      }
      if (onSlider) return;
      if (event.key === ' ' || event.code === 'Space') {
        event.preventDefault();
        toggle();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        onPrev();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        onNext();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onNext, onPrev, toggle]);

  const number = String(channel.number).padStart(2, '0');

  return (
    <div
      className="player-shell"
      ref={shellRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Lecture de ${channel.name}`}
    >
      <div className="player-stage">
        <video ref={videoRef} className="player-video" playsInline preload="auto" />

        <div className="player-top">
          <div className="player-heading">
            <p className="player-kicker">Chaîne {number}</p>
            <h2>{channel.name}</h2>
            {channel.description ? <p className="player-desc">{channel.description}</p> : null}
          </div>
        </div>

        {loading && !error ? <p className="player-status">Chargement du flux…</p> : null}

        {!playing && !loading && !error ? (
          <button type="button" className="center-play" onClick={toggle} aria-label="Lecture">
            <span className="center-play-icon" aria-hidden="true" />
          </button>
        ) : null}

        {error ? (
          <div className="player-error">
            <p>{error}</p>
            <button type="button" className="ghost-btn" onClick={onClose}>
              Retour aux chaînes
            </button>
          </div>
        ) : null}
      </div>

      <PlayerControls
        playing={playing}
        volume={volume}
        muted={muted}
        isFullscreen={isFullscreen}
        disableZap={disableZap}
        disablePlayback={Boolean(error)}
        playRef={playRef}
        onToggle={toggle}
        onVolume={changeVolume}
        onToggleMute={toggleMute}
        onFullscreen={toggleFullscreen}
        onPrev={onPrev}
        onNext={onNext}
        onClose={onClose}
      />
    </div>
  );
}

export function PlayerControls({
  playing,
  volume,
  muted,
  isFullscreen,
  disableZap,
  disablePlayback,
  playRef,
  onToggle,
  onVolume,
  onToggleMute,
  onFullscreen,
  onPrev,
  onNext,
  onClose,
}) {
  const silent = muted || volume === 0;

  return (
    <div className="player-bar">
      <div className="transport">
        <button
          type="button"
          className="icon-btn"
          onClick={onPrev}
          disabled={disableZap}
          aria-label="Chaîne précédente"
        >
          <IconPrev />
        </button>
        <button
          ref={playRef}
          type="button"
          className="icon-btn play-btn"
          onClick={onToggle}
          disabled={disablePlayback}
          aria-label={playing ? 'Pause' : 'Lecture'}
          aria-pressed={playing}
        >
          {playing ? <IconPause /> : <IconPlay />}
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={onNext}
          disabled={disableZap}
          aria-label="Chaîne suivante"
        >
          <IconNext />
        </button>
      </div>

      <label className="volume">
        <button
          type="button"
          className="icon-btn"
          onClick={onToggleMute}
          aria-label={silent ? 'Activer le son' : 'Couper le son'}
        >
          {silent ? <IconMute /> : <IconVolume />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={silent ? 0 : volume}
          aria-label="Volume"
          onChange={(event) => onVolume(event.target.value)}
        />
      </label>

      <div className="transport">
        <button
          type="button"
          className="icon-btn"
          onClick={onFullscreen}
          aria-label={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
        >
          {isFullscreen ? <IconExitFullscreen /> : <IconFullscreen />}
        </button>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Fermer le lecteur">
          <IconClose />
        </button>
      </div>
    </div>
  );
}

function Svg({ children, stroke }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      aria-hidden="true"
      fill={stroke ? 'none' : 'currentColor'}
      stroke={stroke ? 'currentColor' : 'none'}
      strokeWidth={stroke ? 2 : 0}
      strokeLinecap="round"
    >
      {children}
    </svg>
  );
}

function IconPlay() {
  return (
    <Svg>
      <path d="M8 5v14l11-7z" />
    </Svg>
  );
}

function IconPause() {
  return (
    <Svg>
      <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
    </Svg>
  );
}

function IconPrev() {
  return (
    <Svg>
      <path d="M6 5h2.2v14H6zM19 5v14L9.2 12z" />
    </Svg>
  );
}

function IconNext() {
  return (
    <Svg>
      <path d="M16 5h2.2v14H16zM5 5v14l9.8-7z" />
    </Svg>
  );
}

function IconVolume() {
  return (
    <Svg>
      <path d="M3 9v6h4l5 4V5L7 9H3zm11.5 3a3.5 3.5 0 0 0-1.8-3.05v6.1A3.5 3.5 0 0 0 14.5 12z" />
    </Svg>
  );
}

function IconMute() {
  return (
    <Svg stroke>
      <path d="M4 9v6h3.5L12 19V5L7.5 9H4z" fill="currentColor" stroke="none" />
      <path d="M16 9l5 6M21 9l-5 6" />
    </Svg>
  );
}

function IconFullscreen() {
  return (
    <Svg stroke>
      <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" />
    </Svg>
  );
}

function IconExitFullscreen() {
  return (
    <Svg stroke>
      <path d="M9 4v5H4M15 4v5h5M20 15h-5v5M4 15h5v5" />
    </Svg>
  );
}

function IconClose() {
  return (
    <Svg stroke>
      <path d="M6 6l12 12M18 6L6 18" />
    </Svg>
  );
}

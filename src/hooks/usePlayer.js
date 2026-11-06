import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { resolveStreamKind } from '../lib/streamKind';

const PLAYBACK_ERROR =
  'Ce flux ne peut pas être lu. Vérifie l’adresse, le format (MP4 ou M3U8) et que le serveur autorise la lecture dans le navigateur.';

/**
 * Branche un flux sur la balise video.
 * MP4 : lecture native. HLS : hls.js, sauf si le navigateur (Safari)
 * sait déjà lire un .m3u8.
 */
export function usePlayer(videoRef, containerRef, channel) {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const volumeRef = useRef(volume);
  const mutedRef = useRef(muted);
  volumeRef.current = volume;
  mutedRef.current = muted;

  const streamUrl = channel?.url?.trim() ?? '';
  const streamType = channel?.type ?? 'auto';
  const streamId = channel?.id ?? '';

  // useLayoutEffect : le play() part dans le même clic que la carte,
    // sinon le navigateur bloque le son (autoplay).
  useLayoutEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    let hls = null;
    let cancelled = false;

    setPlaying(false);
    setError('');

    if (!streamUrl) {
      setLoading(false);
      setError('Cette chaîne n’a pas d’adresse de flux. Ajoute un champ url dans channels.json.');
      return undefined;
    }

    setLoading(true);
    video.volume = volumeRef.current;
    video.muted = mutedRef.current;

    const onPlaying = () => {
      setLoading(false);
      setPlaying(true);
    };
    const onPause = () => setPlaying(false);
    const onWaiting = () => setLoading(true);
    const onCanPlay = () => setLoading(false);
    const onVideoError = () => {
      if (cancelled) return;
      // Un load() de nettoyage, sans adresse, émet aussi "error".
      // On l'ignore pour ne pas afficher un échec au moment de zapper.
      if (!video.currentSrc) return;
      setLoading(false);
      setPlaying(false);
      setError(PLAYBACK_ERROR);
    };

    video.addEventListener('playing', onPlaying);
    video.addEventListener('pause', onPause);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('error', onVideoError);

    const kind = resolveStreamKind({ url: streamUrl, type: streamType });
    // Les extraits MP4 ont une fin : on les boucle pour garder l'image.
    // Un flux HLS continu n'en a pas besoin.
    video.loop = kind === 'mp4';
    // HLS passe par fetch : le serveur doit envoyer CORS.
    // Un MP4 se lit sans cet attribut, même si le serveur n'annonce pas CORS.
    if (kind === 'hls') video.crossOrigin = 'anonymous';
    else video.removeAttribute('crossorigin');

    const playSafe = () => {
      const pending = video.play();
      if (pending?.catch) pending.catch(() => {
        if (!cancelled) setPlaying(false);
      });
    };

    const nativeHls = Boolean(video.canPlayType('application/vnd.apple.mpegurl'));

    if (kind === 'hls' && nativeHls) {
      video.src = streamUrl;
      playSafe();
    } else if (kind === 'hls' && Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (!cancelled) playSafe();
      });
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data?.fatal || cancelled) return;
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
          return;
        }
        setLoading(false);
        setPlaying(false);
        setError(PLAYBACK_ERROR);
      });
    } else if (kind === 'hls') {
      setLoading(false);
      setError('Ce navigateur ne sait pas lire un flux HLS (M3U8).');
    } else {
      video.src = streamUrl;
      playSafe();
    }

    return () => {
      cancelled = true;
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('error', onVideoError);
      if (hls) hls.destroy();
      video.pause();
      video.removeAttribute('src');
    };
  }, [streamId, streamUrl, streamType, videoRef]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
    video.muted = muted;
  }, [volume, muted, videoRef, streamId]);

  useEffect(() => {
    const sync = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, [containerRef]);

  const toggle = useCallback(() => {
    const video = videoRef.current;
    if (!video || error) return;
    if (video.paused) {
      video.play().catch(() => setPlaying(false));
    } else {
      video.pause();
    }
  }, [error, videoRef]);

  const changeVolume = useCallback((next) => {
    const value = Math.min(1, Math.max(0, Number(next)));
    if (Number.isNaN(value)) return;
    setVolume(value);
    setMuted(value === 0);
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((current) => {
      if (current && volumeRef.current === 0) setVolume(0.5);
      return !current;
    });
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const shell = containerRef.current;
    const video = videoRef.current;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }
      if (shell?.requestFullscreen) {
        await shell.requestFullscreen();
        return;
      }
    } catch {
      // Certains mobiles refusent le plein écran d'un conteneur.
    }
    // iPhone : le plein écran n'est proposé que sur l'élément video.
    video?.webkitEnterFullscreen?.();
  }, [containerRef, videoRef]);

  return {
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
  };
}

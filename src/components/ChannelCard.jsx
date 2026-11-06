import { useState } from 'react';
import { resolveStreamKind } from '../lib/streamKind';

export function ChannelCard({ channel, tabIndex, onFocus, onSelect }) {
  const kind = resolveStreamKind(channel);

  return (
    <button
      type="button"
      className="card"
      style={{ '--card-color': channel.color }}
      data-channel-card
      tabIndex={tabIndex}
      onFocus={onFocus}
      onClick={() => {
        onFocus();
        onSelect();
      }}
    >
      <span className="card-top">
        <span className="card-number">{String(channel.number).padStart(2, '0')}</span>
        <span className="card-kind">{kind === 'hls' ? 'HLS' : 'MP4'}</span>
      </span>
      <Logo channel={channel} />
      <span className="card-name">{channel.name}</span>
      <span className="card-category">{channel.category}</span>
      {channel.description ? <span className="card-desc">{channel.description}</span> : null}
    </button>
  );
}

function Logo({ channel }) {
  const [failed, setFailed] = useState(false);
  if (channel.logo && !failed) {
    return (
      <img
        className="logo-img"
        src={channel.logo}
        alt=""
        draggable="false"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <span className="logo-fallback" style={{ background: channel.color }} aria-hidden="true">
      {channel.logoText}
    </span>
  );
}

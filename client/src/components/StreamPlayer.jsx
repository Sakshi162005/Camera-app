import { useEffect, useRef, useState } from 'react';
import JSMpeg from '@cycjimmy/jsmpeg-player';
import { streamUrl } from '../api/client.js';

// Plays an MPEG1/MPEG-TS stream delivered over WebSocket (see server/src/stream/streamer.js).
export default function StreamPlayer({ cameraId, showStatus = true }) {
  const containerRef = useRef(null);
  const [status, setStatus] = useState('connecting');

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    setStatus('connecting');

    let disposed = false;
    let player = null;

    // Connect on the next tick so React StrictMode's mount/unmount/mount in dev
    // never opens a WebSocket that is thrown away before the handshake finishes.
    const timer = setTimeout(() => {
      if (disposed) return;
      player = new JSMpeg.VideoElement(el, streamUrl(cameraId), {
        autoplay: true,
        audio: false,
        videoBufferSize: 1024 * 1024,
        hooks: {
          play: () => { if (!disposed) setStatus('live'); },
          pause: () => { if (!disposed) setStatus('paused'); },
        },
      });

      const socket = player.player?.source?.socket;
      if (socket) {
        socket.addEventListener('close', (ev) => {
          if (!disposed) setStatus(ev.code === 1000 ? 'ended' : `disconnected (${ev.reason || ev.code})`);
        });
        socket.addEventListener('error', () => { if (!disposed) setStatus('error'); });
      }
    }, 0);

    return () => {
      disposed = true;
      clearTimeout(timer);
      if (!player) return;
      const socket = player.player?.source?.socket;
      try { player.destroy(); } catch { /* already gone */ }
      // destroy() closes the socket, but if the handshake is still in flight make
      // sure it is closed as soon as it opens so the server never keeps a ghost viewer.
      if (socket && socket.readyState === WebSocket.CONNECTING) {
        socket.addEventListener('open', () => socket.close());
      }
    };
  }, [cameraId]);

  return (
    <div className="player">
      <div ref={containerRef} className="player-canvas" />
      {showStatus && (
        <div className={`player-status ${status === 'live' ? 'live' : ''}`}>
          <span className={`dot ${status === 'live' ? 'on' : ''}`} />
          {status}
        </div>
      )}
    </div>
  );
}

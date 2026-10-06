import { Link } from 'react-router-dom';
import { Maximize2, X, Grid2x2, Grid3x3, Square, LayoutGrid, MonitorPlay } from 'lucide-react';
import { useCameras } from '../context/CamerasContext.jsx';
import StreamPlayer from './StreamPlayer.jsx';

const LAYOUTS = [
  { id: 'auto', label: 'Auto', Icon: LayoutGrid },
  { id: '1', label: '1 x 1', Icon: Square },
  { id: '4', label: '2 x 2', Icon: Grid2x2 },
  { id: '9', label: '3 x 3', Icon: Grid3x3 },
];

function columnsFor(layout, count) {
  if (layout === '1') return 1;
  if (layout === '4') return 2;
  if (layout === '9') return 3;
  if (count <= 1) return 1;
  if (count <= 4) return 2;
  if (count <= 9) return 3;
  return 4;
}

export default function VideoWall() {
  const { wall, byId, removeFromWall, layout, setLayout, clearWall } = useCameras();
  const tiles = wall.map(byId).filter(Boolean);
  const cols = columnsFor(layout, tiles.length);

  return (
    <div className="wall">
      <div className="wall-bar">
        <div>
          <h1>Video wall</h1>
          <p className="muted small">{tiles.length === 0 ? 'Pick cameras from the tree on the left.' : `${tiles.length} live tile${tiles.length === 1 ? '' : 's'}`}</p>
        </div>
        <div className="wall-actions">
          <div className="seg">
            {LAYOUTS.map(({ id, label, Icon }) => (
              <button key={id} className={layout === id ? 'active' : ''} onClick={() => setLayout(id)} title={label}>
                <Icon size={16} />
              </button>
            ))}
          </div>
          {tiles.length > 0 && <button className="btn ghost" onClick={clearWall}>Clear wall</button>}
        </div>
      </div>

      {tiles.length === 0 ? (
        <div className="empty">
          <MonitorPlay size={40} />
          <h2>Nothing on the wall yet</h2>
          <p className="muted">Click a camera in the tree to start streaming it here. You can add as many as you like.</p>
        </div>
      ) : (
        <div className="wall-grid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {tiles.map((cam) => (
            <div key={cam.id} className="tile">
              <div className="tile-head">
                <div className="tile-title">
                  <span className="tile-name">{cam.name}</span>
                  {cam.group && <span className="tile-group">{cam.group.replaceAll('/', ' / ')}</span>}
                </div>
                <div className="tile-btns">
                  <Link to={`/cameras/${cam.id}`} className="icon-btn" title="Open full view"><Maximize2 size={15} /></Link>
                  <button className="icon-btn" onClick={() => removeFromWall(cam.id)} title="Remove from wall"><X size={15} /></button>
                </div>
              </div>
              <StreamPlayer cameraId={cam.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

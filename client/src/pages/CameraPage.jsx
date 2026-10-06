import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Check } from 'lucide-react';
import { api, errorMessage } from '../api/client.js';
import { useCameras } from '../context/CamerasContext.jsx';
import StreamPlayer from '../components/StreamPlayer.jsx';

// Full-size view of a single camera.
export default function CameraPage() {
  const { id } = useParams();
  const { isOnWall, toggleWall } = useCameras();
  const [camera, setCamera] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setCamera(null);
    setError('');
    api.get(`/cameras/${id}`)
      .then((r) => setCamera(r.data.camera))
      .catch((err) => setError(errorMessage(err)));
  }, [id]);

  if (error) {
    return (
      <div className="card">
        <p className="error">{error}</p>
        <Link to="/">Back to wall</Link>
      </div>
    );
  }
  if (!camera) return <p className="center">Loading...</p>;

  const on = isOnWall(camera.id);
  return (
    <div className="single">
      <div className="wall-bar">
        <div>
          <Link to="/" className="back"><ArrowLeft size={14} /> Video wall</Link>
          <h1>{camera.name}</h1>
          <p className="muted small">{camera.group ? camera.group.replaceAll('/', ' / ') : 'Ungrouped'} &middot; {camera.type}</p>
        </div>
        <button className={`btn ${on ? 'ghost' : ''}`} onClick={() => toggleWall(camera.id)}>
          {on ? <><Check size={15} /> On wall</> : <><Plus size={15} /> Add to wall</>}
        </button>
      </div>
      <div className="single-player">
        <StreamPlayer cameraId={camera.id} />
      </div>
    </div>
  );
}

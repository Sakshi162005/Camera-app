import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight, ChevronDown, Folder, FolderOpen, Video, Search, CheckSquare, Square, X } from 'lucide-react';
import { useCameras } from '../context/CamerasContext.jsx';

// Split the query into words; a camera matches when every word appears in its name, group or type.
const tokens = (q) => q.toLowerCase().split(/\s+/).filter(Boolean);
const matches = (cam, words) => {
  const hay = `${cam.name} ${cam.group || ''} ${cam.type}`.toLowerCase();
  return words.every((w) => hay.includes(w));
};

// Wraps every occurrence of a query word in <mark>.
function Highlight({ text, words }) {
  if (!words.length || !text) return text;
  const pattern = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const splitter = new RegExp(`(${pattern})`, 'ig');
  const isMatch = new RegExp(`^(${pattern})$`, 'i');
  return text.split(splitter).map((part, i) =>
    isMatch.test(part) ? <mark key={i}>{part}</mark> : <span key={i}>{part}</span>,
  );
}

function SearchBox({ value, onChange, resultCount, total }) {
  const ref = useRef(null);

  // Press "/" anywhere (outside another input) to jump to the search box.
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const clear = () => {
    onChange('');
    ref.current?.focus();
  };

  return (
    <div className="search-wrap">
      <label className={`search ${value ? 'active' : ''}`}>
        <Search size={15} className="search-ico" />
        <input
          ref={ref}
          placeholder="Search cameras"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Escape') clear(); }}
          aria-label="Search cameras"
        />
        {value ? (
          <button type="button" className="search-clear" onClick={clear} aria-label="Clear search" title="Clear (Esc)">
            <X size={14} />
          </button>
        ) : (
          <kbd className="search-kbd" title="Press / to search">/</kbd>
        )}
      </label>
      {value && (
        <div className="search-meta">
          {resultCount === 0 ? 'No cameras match' : `${resultCount} of ${total} camera${total === 1 ? '' : 's'}`}
        </div>
      )}
    </div>
  );
}

// Builds a folder tree from each camera's "group" path, e.g. "Building A/Floor 2".
function buildTree(cameras) {
  const root = { name: '', path: '', children: new Map(), cameras: [] };
  for (const cam of cameras) {
    const parts = (cam.group || '').split('/').filter(Boolean);
    let node = root;
    let path = '';
    for (const part of parts) {
      path = path ? `${path}/${part}` : part;
      if (!node.children.has(part)) {
        node.children.set(part, { name: part, path, children: new Map(), cameras: [] });
      }
      node = node.children.get(part);
    }
    node.cameras.push(cam);
  }
  return root;
}

function countCameras(node) {
  let n = node.cameras.length;
  for (const child of node.children.values()) n += countCameras(child);
  return n;
}

export default function CameraTree({ onPick }) {
  const { cameras, loading, error, wall, toggleWall, isOnWall, clearWall } = useCameras();
  const [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState(() => new Set());
  const navigate = useNavigate();
  const location = useLocation();

  const words = useMemo(() => tokens(query), [query]);
  const filtered = useMemo(
    () => (words.length ? cameras.filter((c) => matches(c, words)) : cameras),
    [cameras, words],
  );

  const tree = useMemo(() => buildTree(filtered), [filtered]);

  const toggleFolder = (path) =>
    setCollapsed((s) => {
      const next = new Set(s);
      next.has(path) ? next.delete(path) : next.add(path);
      return next;
    });

  const pick = (cam) => {
    toggleWall(cam.id);
    if (location.pathname !== '/') navigate('/');
    onPick?.();
  };

  const renderFolder = (node, depth) => {
    const open = !collapsed.has(node.path) || query;
    return (
      <li key={node.path}>
        <button className="tree-row tree-folder" style={{ paddingLeft: 8 + depth * 14 }} onClick={() => toggleFolder(node.path)}>
          {open ? <ChevronDown size={14} className="chev" /> : <ChevronRight size={14} className="chev" />}
          {open ? <FolderOpen size={16} className="ico folder" /> : <Folder size={16} className="ico folder" />}
          <span className="tree-label"><Highlight text={node.name} words={words} /></span>
          <span className="tree-count">{countCameras(node)}</span>
        </button>
        {open && <ul className="tree">{renderChildren(node, depth + 1)}</ul>}
      </li>
    );
  };

  const renderCamera = (cam, depth) => {
    const on = isOnWall(cam.id);
    return (
      <li key={cam.id}>
        <button
          className={`tree-row tree-cam ${on ? 'selected' : ''}`}
          style={{ paddingLeft: 8 + depth * 14 }}
          onClick={() => pick(cam)}
          title={on ? 'Remove from wall' : 'Add to wall'}
        >
          {on ? <CheckSquare size={15} className="check" /> : <Square size={15} className="check" />}
          <Video size={16} className="ico" />
          <span className="tree-label">
            <Highlight text={cam.name} words={words} />
            {words.length > 0 && cam.group && (
              <span className="tree-sub"><Highlight text={cam.group.replaceAll('/', ' / ')} words={words} /></span>
            )}
          </span>
          <span className={`dot ${cam.live ? 'on' : ''}`} title={cam.live ? `Live, ${cam.viewers} watching` : 'Idle'} />
        </button>
      </li>
    );
  };

  const renderChildren = (node, depth) => [
    ...[...node.children.values()].map((child) => renderFolder(child, depth)),
    ...node.cameras.map((cam) => renderCamera(cam, depth)),
  ];

  return (
    <div className="tree-panel">
      <div className="tree-head">
        <span className="tree-title">Cameras</span>
        <span className="tree-count">{cameras.length}</span>
      </div>
      <SearchBox value={query} onChange={setQuery} resultCount={filtered.length} total={cameras.length} />

      {loading && <p className="muted small pad">Loading...</p>}
      {error && <p className="error small pad">{error}</p>}
      {!loading && cameras.length === 0 && <p className="muted small pad">No cameras yet.</p>}
      {!loading && cameras.length > 0 && filtered.length === 0 && (
        <div className="search-empty">
          <p className="muted small">Nothing matches &ldquo;{query.trim()}&rdquo;.</p>
          <button className="link-btn small" onClick={() => setQuery('')}>Clear search</button>
        </div>
      )}

      <ul className="tree root">{renderChildren(tree, 0)}</ul>

      <div className="tree-foot">
        <span className="muted small">{wall.length} on wall</span>
        {wall.length > 0 && <button className="link-btn small" onClick={clearWall}>Clear</button>}
      </div>
    </div>
  );
}

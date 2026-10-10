import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Heart,
  Menu,
  X,
  ArrowRight,
  Shield,
  Zap,
  LayoutGrid,
  Layers,
  Lock,
  Activity,
  Maximize2,
  Video,
  MonitorPlay,
  CheckCircle2,
  Sliders,
  ChevronRight,
  LogIn,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const STREAMS = [
  {
    id: 'living',
    name: 'Living Room 4K',
    location: 'Interior / Main Lounge',
    img: '/images/scene_living.jpg',
    fps: '60 FPS',
    res: '3840 x 2160',
    bitrate: '8.4 Mbps',
    status: 'ONLINE'
  },
  {
    id: 'driveway',
    name: 'Front Driveway & Gate',
    location: 'Exterior / Perimeter North',
    img: '/images/scene_driveway.jpg',
    fps: '60 FPS',
    res: '3840 x 2160',
    bitrate: '9.2 Mbps',
    status: 'ONLINE'
  },
  {
    id: 'backyard',
    name: 'Backyard Pool & Patio',
    location: 'Exterior / Perimeter South',
    img: '/images/scene_backyard.jpg',
    fps: '60 FPS',
    res: '3840 x 2160',
    bitrate: '7.8 Mbps',
    status: 'ONLINE'
  }
];

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeStreamIndex, setActiveStreamIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [favoriteActive, setFavoriteActive] = useState(false);

  const activeStream = STREAMS[activeStreamIndex];

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-root">
      {/* ============================================================ */}
      {/* 1. HERO SECTION (STRICT REPRODUCTION OF REFERENCE IMAGE)    */}
      {/* ============================================================ */}
      <section className="hero-section" id="home">
        {/* Deep atmospheric glow layers matching reference */}
        <div className="hero-atmosphere">
          <div className="hero-glow-core" />
          <div className="hero-glow-right" />
          <div className="hero-vignette" />
        </div>

        {/* Navigation Bar */}
        <header className="hero-navbar">
          <nav className="hero-nav-left">
            <button className="nav-link active" onClick={() => scrollToSection('home')}>
              Home
              <span className="active-underline" />
            </button>
            <button className="nav-link" onClick={() => scrollToSection('live-view')}>
              Live View
            </button>
            <button className="nav-link" onClick={() => scrollToSection('features')}>
              Features
            </button>
            <button className="nav-link" onClick={() => scrollToSection('gallery')}>
              Gallery
            </button>
            <button className="nav-link" onClick={() => scrollToSection('about')}>
              About
            </button>
          </nav>

          {/* Centered CAMSTREAM Brand Logo */}
          <Link to="/" className="hero-brand">
            <span className="brand-cam">CAM</span>
            <span className="brand-stream">STREAM</span>
          </Link>

          {/* Right Action Icons & Auth */}
          <div className="hero-nav-right">
            <button
              className={`nav-icon-btn ${searchOpen ? 'active' : ''}`}
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Search cameras"
              title="Search"
            >
              <Search size={19} />
            </button>
            <button
              className={`nav-icon-btn ${favoriteActive ? 'favorite' : ''}`}
              onClick={() => setFavoriteActive((v) => !v)}
              aria-label="Favorite cameras"
              title="Favorites"
            >
              <Heart size={19} fill={favoriteActive ? '#E50920' : 'none'} color={favoriteActive ? '#E50920' : 'currentColor'} />
            </button>
            
            {user ? (
              <Link to="/" className="hero-auth-btn">
                <LayoutGrid size={15} />
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link to="/login" className="hero-auth-btn">
                <LogIn size={15} />
                <span>Sign In</span>
              </Link>
            )}

            <button
              className="nav-icon-btn mobile-menu-toggle"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </header>

        {/* Quick Search Overlay if toggled */}
        {searchOpen && (
          <div className="hero-search-bar">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search camera streams, zones, or RTSP feeds..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <button className="search-close" onClick={() => setSearchOpen(false)}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-nav-drawer">
            <button className="mobile-nav-link" onClick={() => scrollToSection('home')}>Home</button>
            <button className="mobile-nav-link" onClick={() => scrollToSection('live-view')}>Live View</button>
            <button className="mobile-nav-link" onClick={() => scrollToSection('features')}>Features</button>
            <button className="mobile-nav-link" onClick={() => scrollToSection('gallery')}>Gallery</button>
            <button className="mobile-nav-link" onClick={() => scrollToSection('about')}>About</button>
            <div className="mobile-nav-auth">
              {user ? (
                <Link to="/" className="btn wide"><LayoutGrid size={16} /> Open Video Wall</Link>
              ) : (
                <>
                  <Link to="/login" className="btn wide"><LogIn size={16} /> Sign In</Link>
                  <Link to="/register" className="btn ghost wide"><UserPlus size={16} /> Register</Link>
                </>
              )}
            </div>
          </div>
        )}

        {/* Hero Visual Composition Container */}
        <div className="hero-stage">
          {/* Oversized Background Typography: LIVE with corner-frame markings */}
          <div className="hero-live-container">
            {/* Corner Crop Marks */}
            <div className="corner-mark top-left" />
            <div className="corner-mark top-right" />
            <div className="corner-mark bottom-left" />
            <div className="corner-mark bottom-right" />

            <h1 className="hero-live-text">LIVE</h1>
          </div>

          {/* Dominant 3D CCTV Camera Foreground Object */}
          <div className="hero-camera-container">
            <img
              src="/images/camera_transparent.png"
              alt="CAMSTREAM 4K Surveillance Security Camera"
              className="hero-camera-image"
            />
            {/* Lens flare & illumination pulse */}
            <div className="camera-lens-flare" />
          </div>

          {/* Floating Live-Camera Preview Card (Right) */}
          <div
            className="hero-floating-card"
            onClick={() => scrollToSection('live-view')}
            title="Click to view live stream"
          >
            <div className="floating-card-screen">
              <img
                src={activeStream.img}
                alt={activeStream.name}
                className="floating-card-image"
              />
              <div className="floating-card-overlay">
                <div className="live-status-pill">
                  <span className="live-rec-dot" />
                  <span className="live-text">LIVE</span>
                  <span className="live-conn-dot" />
                </div>
                <div className="floating-cam-name">{activeStream.name}</div>
              </div>
            </div>
          </div>

          {/* Bottom Left: Stream Selector */}
          <div className="hero-stream-selector">
            <div className="stream-thumbnails">
              {STREAMS.map((s, idx) => (
                <button
                  key={s.id}
                  className={`thumbnail-circle ${idx === activeStreamIndex ? 'active' : ''}`}
                  onClick={() => setActiveStreamIndex(idx)}
                  title={`Switch to ${s.name}`}
                  aria-label={s.name}
                >
                  <img src={s.img} alt={s.name} />
                </button>
              ))}
            </div>

            <div className="stream-divider" />

            <button
              className="explore-streams-btn"
              onClick={() => scrollToSection('gallery')}
            >
              <span>Explore Streams</span>
              <ArrowRight size={17} className="explore-arrow" />
            </button>
          </div>

          {/* Bottom Right: Headline & Supporting Text */}
          <div className="hero-headline-block">
            <h2 className="hero-headline">Your world, in real time.</h2>
            <p className="hero-subtext">
              Stream your cameras anytime, anywhere.<br />
              Secure, simple, and always connected.
            </p>
            <div className="hero-red-line" />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. LIVE VIEW / INTERACTIVE STREAM GALLERY SECTION            */}
      {/* ============================================================ */}
      <section className="section-wrap live-view-section" id="live-view">
        <div className="section-header">
          <div className="section-badge">
            <Activity size={14} />
            <span>REAL-TIME STREAMING PIPELINE</span>
          </div>
          <h2 className="section-title">High-Definition Surveillance Feeds</h2>
          <p className="section-subtitle">
            Zero-latency MPEG delivery over WebSockets with hardware-accelerated decoding.
          </p>
        </div>

        <div className="live-showcase-grid">
          {/* Main Large Stream Viewport */}
          <div className="showcase-main-feed">
            <div className="feed-media-wrap">
              <img src={activeStream.img} alt={activeStream.name} className="feed-image" />
              
              {/* HUD Surveillance Overlay */}
              <div className="feed-hud-header">
                <div className="hud-pill live">
                  <span className="hud-dot" />
                  <span>LIVE FEED</span>
                </div>
                <div className="hud-cam-meta">
                  <span className="hud-meta-name">{activeStream.name}</span>
                  <span className="hud-meta-group">{activeStream.location}</span>
                </div>
                <div className="hud-pill res">{activeStream.res}</div>
              </div>

              <div className="feed-hud-footer">
                <div className="hud-metrics">
                  <span>{activeStream.fps}</span>
                  <span className="metric-sep">&bull;</span>
                  <span>{activeStream.bitrate}</span>
                  <span className="metric-sep">&bull;</span>
                  <span className="hud-proto">MPEG-TS/WS</span>
                </div>
                {user ? (
                  <Link to="/" className="btn small">
                    <Maximize2 size={14} /> Open Wall
                  </Link>
                ) : (
                  <Link to="/login" className="btn small">
                    <LogIn size={14} /> Connect Stream
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Stream Picker Sidebar */}
          <div className="showcase-list">
            <div className="showcase-list-header">
              <span className="list-title">Active Feeds</span>
              <span className="list-count">{STREAMS.length} Online</span>
            </div>
            
            <div className="showcase-items">
              {STREAMS.map((s, idx) => (
                <div
                  key={s.id}
                  className={`showcase-card ${idx === activeStreamIndex ? 'selected' : ''}`}
                  onClick={() => setActiveStreamIndex(idx)}
                >
                  <div className="card-thumb">
                    <img src={s.img} alt={s.name} />
                    <span className="thumb-status" />
                  </div>
                  <div className="card-info">
                    <div className="card-name">{s.name}</div>
                    <div className="card-sub">{s.location}</div>
                    <div className="card-tags">
                      <span className="card-tag">{s.fps}</span>
                      <span className="card-tag">{s.res.split(' ')[0]}</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="card-arrow" />
                </div>
              ))}
            </div>

            <div className="showcase-cta">
              <p className="cta-text">Add IP cameras, webcams, or RTSP streams directly to your private video wall.</p>
              {user ? (
                <Link to="/" className="btn wide">
                  <LayoutGrid size={16} /> Launch Video Wall
                </Link>
              ) : (
                <Link to="/register" className="btn wide">
                  <UserPlus size={16} /> Get Started Free
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. FEATURES SECTION (SURVEILLANCE TECH SUITE)                */}
      {/* ============================================================ */}
      <section className="section-wrap features-section" id="features">
        <div className="section-header">
          <div className="section-badge">
            <Zap size={14} />
            <span>ENTERPRISE CAPABILITIES</span>
          </div>
          <h2 className="section-title">Built for Mission-Critical Security</h2>
          <p className="section-subtitle">
            Engineered from the ground up for low-latency surveillance, seamless device management, and high reliability.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrap">
              <LayoutGrid size={24} className="feature-icon" />
            </div>
            <h3>Multi-Tile Video Wall</h3>
            <p>
              Simultaneously view 1x1, 2x2, 3x3 or adaptive camera grids. Organize your workspace dynamically for full situational awareness.
            </p>
            <ul className="feature-bullets">
              <li><CheckCircle2 size={15} /> Instant layout toggling</li>
              <li><CheckCircle2 size={15} /> Zero-stutter multi-camera rendering</li>
            </ul>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrap">
              <Zap size={24} className="feature-icon" />
            </div>
            <h3>Sub-Second Latency</h3>
            <p>
              MPEG-1 video transcoding via WebSockets bypasses heavy HLS buffering, giving you instantaneous real-time feeds with near-zero latency.
            </p>
            <ul className="feature-bullets">
              <li><CheckCircle2 size={15} /> WebSocket binary streaming</li>
              <li><CheckCircle2 size={15} /> Hardware accelerated decoding</li>
            </ul>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrap">
              <Layers size={24} className="feature-icon" />
            </div>
            <h3>Hierarchical Grouping</h3>
            <p>
              Structure cameras by building, floor, room, or perimeter with nested folder trees and instant keyboard-shortcut search (<kbd>/</kbd>).
            </p>
            <ul className="feature-bullets">
              <li><CheckCircle2 size={15} /> Deep folder hierarchy</li>
              <li><CheckCircle2 size={15} /> Real-time search & match highlights</li>
            </ul>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrap">
              <Video size={24} className="feature-icon" />
            </div>
            <h3>Universal Hardware Support</h3>
            <p>
              Connect RTSP IP security cameras, DirectShow USB webcams, V4L2 Linux devices, AVFoundation feeds, and HTTP streams with automatic protocol detection.
            </p>
            <ul className="feature-bullets">
              <li><CheckCircle2 size={15} /> Auto-detect source formats</li>
              <li><CheckCircle2 size={15} /> On-demand FFmpeg transcode pipeline</li>
            </ul>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrap">
              <Lock size={24} className="feature-icon" />
            </div>
            <h3>Role-Based Access Control</h3>
            <p>
              Secure administrative access with granular user controls, viewer authorization, password resets, and session security.
            </p>
            <ul className="feature-bullets">
              <li><CheckCircle2 size={15} /> Admin & Viewer permissions</li>
              <li><CheckCircle2 size={15} /> Per-camera role restriction</li>
            </ul>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrap">
              <Shield size={24} className="feature-icon" />
            </div>
            <h3>Self-Hosted & Private</h3>
            <p>
              Run on your local network or private cloud with zero vendor lock-in. Your surveillance feeds stay within your network perimeter.
            </p>
            <ul className="feature-bullets">
              <li><CheckCircle2 size={15} /> Direct local network streaming</li>
              <li><CheckCircle2 size={15} /> No third-party data tracking</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. GALLERY / CAMERA PREVIEW SECTION                         */}
      {/* ============================================================ */}
      <section className="section-wrap gallery-section" id="gallery">
        <div className="section-header">
          <div className="section-badge">
            <Sliders size={14} />
            <span>SURVEILLANCE ZONES</span>
          </div>
          <h2 className="section-title">Comprehensive Coverage Everywhere</h2>
          <p className="section-subtitle">
            From residential perimeters to enterprise commercial facilities, CAMSTREAM delivers crystal clarity.
          </p>
        </div>

        <div className="gallery-grid">
          {STREAMS.map((s, idx) => (
            <div key={s.id} className="gallery-card">
              <div className="gallery-image-wrap">
                <img src={s.img} alt={s.name} className="gallery-image" />
                <div className="gallery-overlay">
                  <span className="live-chip"><span className="dot on" /> 4K LIVE</span>
                  <div className="gallery-specs">
                    <span>{s.res}</span>
                    <span>{s.fps}</span>
                  </div>
                </div>
              </div>
              <div className="gallery-info">
                <h4 className="gallery-name">{s.name}</h4>
                <p className="gallery-loc">{s.location}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. ABOUT SECTION                                            */}
      {/* ============================================================ */}
      <section className="section-wrap about-section" id="about">
        <div className="about-grid">
          <div className="about-text-col">
            <div className="section-badge">
              <Shield size={14} />
              <span>ABOUT CAMSTREAM</span>
            </div>
            <h2 className="about-title">
              Precision Surveillance Technology Designed for Modern Security.
            </h2>
            <p className="about-desc">
              CAMSTREAM is an advanced camera streaming platform engineered to bridge the gap between high-grade surveillance hardware and instant web accessibility. By combining ultra-low-latency WebSocket delivery with a dynamic video wall interface, CAMSTREAM gives operators instantaneous clarity across every camera feed.
            </p>
            
            <div className="about-stats-grid">
              <div className="stat-card">
                <div className="stat-value">&lt; 150ms</div>
                <div className="stat-label">Ultra-Low Latency</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">4K UHD</div>
                <div className="stat-label">Crystal Resolution</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">Multi-OS</div>
                <div className="stat-label">Linux / Win / Mac</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">100%</div>
                <div className="stat-label">Self-Contained</div>
              </div>
            </div>
          </div>

          <div className="about-visual-col">
            <div className="about-visual-card">
              <div className="tech-spec-header">
                <span className="spec-dot" />
                <span className="spec-title">SYSTEM ARCHITECTURE</span>
              </div>
              <div className="tech-spec-content">
                <div className="spec-row">
                  <span className="spec-k">Stream Engine</span>
                  <span className="spec-v">FFmpeg MPEG-1 WebSocket Pipeline</span>
                </div>
                <div className="spec-row">
                  <span className="spec-k">Client Decoder</span>
                  <span className="spec-v">JSMpeg Canvas Hardware Renderer</span>
                </div>
                <div className="spec-row">
                  <span className="spec-k">Auth Protocol</span>
                  <span className="spec-v">JWT &amp; HttpOnly Cookie Sessions</span>
                </div>
                <div className="spec-row">
                  <span className="spec-k">Supported Inputs</span>
                  <span className="spec-v">RTSP, HLS, DirectShow, V4L2, MJPEG</span>
                </div>
                <div className="spec-row">
                  <span className="spec-k">System Status</span>
                  <span className="spec-v highlight">OPERATIONAL &bull; 99.99% Uptime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. CTA BANNER SECTION                                       */}
      {/* ============================================================ */}
      <section className="cta-banner-section">
        <div className="cta-banner-content">
          <h2>Ready to Take Control of Your Feeds?</h2>
          <p>Access your live video wall right now or configure new camera endpoints in seconds.</p>
          <div className="cta-buttons">
            {user ? (
              <Link to="/" className="btn big">
                <LayoutGrid size={18} /> Launch Video Wall
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn big">
                  <UserPlus size={18} /> Create Account
                </Link>
                <Link to="/login" className="btn ghost big">
                  <LogIn size={18} /> Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. FOOTER SECTION                                           */}
      {/* ============================================================ */}
      <footer className="landing-footer">
        <div className="footer-top">
          <div className="footer-brand-col">
            <Link to="/" className="hero-brand footer-brand">
              <span className="brand-cam">CAM</span>
              <span className="brand-stream">STREAM</span>
            </Link>
            <p className="footer-tagline">
              Real-time video surveillance and multi-camera streaming platform for mission-critical monitoring.
            </p>
            <div className="footer-status-pill">
              <span className="footer-status-dot" />
              <span>System Online &bull; Active Node</span>
            </div>
          </div>

          <div className="footer-links-col">
            <h4>Platform</h4>
            <button onClick={() => scrollToSection('home')}>Home</button>
            <button onClick={() => scrollToSection('live-view')}>Live View</button>
            <button onClick={() => scrollToSection('features')}>Features</button>
            <button onClick={() => scrollToSection('gallery')}>Gallery</button>
          </div>

          <div className="footer-links-col">
            <h4>Quick Access</h4>
            <Link to="/login">Sign In</Link>
            <Link to="/register">Create Account</Link>
            {user && <Link to="/">Video Wall</Link>}
            {user?.role === 'admin' && <Link to="/cameras">Manage Cameras</Link>}
            {user?.role === 'admin' && <Link to="/users">User Management</Link>}
          </div>

          <div className="footer-links-col">
            <h4>Surveillance Tech</h4>
            <span>RTSP / IP Video</span>
            <span>WebSocket Streaming</span>
            <span>DirectShow Hardware</span>
            <span>Zero Latency Core</span>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} CAMSTREAM Inc. All rights reserved. Secure real-time surveillance.</p>
          <div className="footer-bottom-links">
            <span>Privacy Policy</span>
            <span className="sep">&bull;</span>
            <span>Terms of Service</span>
            <span className="sep">&bull;</span>
            <span>Security</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// src/screens/public/LandingScreen.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicMap from "../../components/map/PublicMap";

// ── Fonts ────────────────────────────────────────────────────────────────────
const FONT_LINK = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,700&family=DM+Sans:wght@300;400;500;600&display=swap";

// ── Données statiques ─────────────────────────────────────────────────────────
const METIERS = [
  { emoji: "⚡", label: "Électricien" },
  { emoji: "🔧", label: "Plombier" },
  { emoji: "🎨", label: "Peintre" },
  { emoji: "🌿", label: "Jardinier" },
  { emoji: "❄️", label: "Climatisation" },
  { emoji: "🧹", label: "Ménage" },
  { emoji: "🧱", label: "Maçon" },
  { emoji: "📸", label: "Photographe" },
  { emoji: "💻", label: "Informaticien" },
  { emoji: "🛵", label: "Coursier" },
  { emoji: "🪚", label: "Menuisier" },
  { emoji: "👶", label: "Garde enfants" },
];

const STATS = [
  { value: "500+", label: "Prestataires actifs" },
  { value: "4.8★", label: "Note moyenne" },
  { value: "< 5min", label: "Temps de réponse" },
  { value: "World", label: "Partout dans le monde" },
];

const TEMOIGNAGES = [
  { nom: "Marie K.", quartier: "Anse Vata", texte: "Électricien trouvé en 3 minutes, intervention le jour même. Incroyable !", note: 5 },
  { nom: "Samuel W.", quartier: "Dumbéa", texte: "Le plombier était professionnel et rapide. Je recommande Hopela à tous.", note: 5 },
  { nom: "Angélique T.", quartier: "Mont-Dore", texte: "La carte en temps réel c'est génial, on voit exactement où est le prestataire.", note: 5 },
];

// ── Styles CSS globaux ────────────────────────────────────────────────────────
const CSS = `
  :root {
    --gold: #c9a84c;
    --gold-light: #e8c97a;
    --gold-dim: rgba(201,168,76,0.18);
    --dark: #0a0804;
    --dark-2: #120e07;
    --dark-3: #1c1610;
    --cream: #f5f0e8;
    --cream-dim: rgba(245,240,232,0.55);
    --border: rgba(201,168,76,0.18);
  }

  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

  html { scroll-behavior: smooth; }

  body {
    background: var(--dark);
    font-family: 'DM Sans', sans-serif;
    color: var(--cream);
    overflow-x: hidden;
  }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--dark); }
  ::-webkit-scrollbar-thumb { background: var(--gold-dim); border-radius: 2px; }

  /* ── Animations ── */
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(28px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity:0; }
    to   { opacity:1; }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes float {
    0%,100% { transform: translateY(0px); }
    50%     { transform: translateY(-8px); }
  }
  @keyframes rotateSlow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  .fade-up   { animation: fadeUp 0.7s ease both; }
  .fade-up-1 { animation: fadeUp 0.7s 0.1s ease both; }
  .fade-up-2 { animation: fadeUp 0.7s 0.2s ease both; }
  .fade-up-3 { animation: fadeUp 0.7s 0.3s ease both; }
  .fade-up-4 { animation: fadeUp 0.7s 0.4s ease both; }
  .fade-up-5 { animation: fadeUp 0.7s 0.5s ease both; }

  /* ── Header ── */
  .lp-header {
    position: fixed; top:0; left:0; right:0; z-index:200;
    height: 68px;
    display: flex; align-items:center; justify-content:space-between;
    padding: 0 48px;
    background: rgba(10,8,4,0.8);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    transition: all 0.3s;
  }
  .lp-header.scrolled {
    background: rgba(10,8,4,0.96);
    border-bottom-color: rgba(201,168,76,0.3);
  }
  .lp-logo {
    display:flex; align-items:center; gap:12px; text-decoration:none;
  }
  .lp-logo-mark {
    width:38px; height:38px; border-radius:50%;
    background: linear-gradient(135deg, #c9a84c, #8a6c28);
    display:flex; align-items:center; justify-content:center;
    font-family:'Cormorant Garamond',serif; font-weight:700; font-size:19px;
    color:#0a0804; flex-shrink:0;
    box-shadow: 0 0 0 1px rgba(201,168,76,0.4), 0 4px 16px rgba(201,168,76,0.2);
  }
  .lp-logo-name {
    font-family:'Cormorant Garamond',serif; font-weight:700; font-size:24px;
    color:var(--cream); letter-spacing:0.5px;
  }
  .lp-nav { display:flex; align-items:center; gap:32px; }
  .lp-nav a {
    font-size:13px; font-weight:500; color:var(--cream-dim);
    text-decoration:none; letter-spacing:0.3px; transition:color 0.2s;
  }
  .lp-nav a:hover { color:var(--gold); }
  .lp-header-cta {
    display:flex; align-items:center; gap:12px;
  }
  .btn-ghost {
    font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500;
    color:var(--cream-dim); background:none; border:none; cursor:pointer;
    text-decoration:none; transition:color 0.2s; letter-spacing:0.3px;
  }
  .btn-ghost:hover { color:var(--cream); }
  .btn-gold {
    font-family:'DM Sans',sans-serif; font-size:12px; font-weight:600;
    letter-spacing:1.5px; text-transform:uppercase;
    color:#0a0804; background:linear-gradient(135deg,#c9a84c,#e8c97a);
    border:none; cursor:pointer; text-decoration:none;
    padding:10px 22px; border-radius:6px; transition:all 0.2s;
    box-shadow:0 2px 12px rgba(201,168,76,0.25);
  }
  .btn-gold:hover { box-shadow:0 4px 20px rgba(201,168,76,0.4); transform:translateY(-1px); }

  /* ── Section commune ── */
  .lp-section { padding:100px 48px; max-width:1200px; margin:0 auto; }

  /* ── Hero ── */
  .lp-hero {
    min-height: 100vh;
    display:flex; flex-direction:column; justify-content:center;
    padding: 120px 48px 60px;
    position:relative; overflow:hidden;
  }
  .lp-hero-bg {
    position:absolute; inset:0; z-index:0;
    background:
      radial-gradient(ellipse 60% 50% at 70% 50%, rgba(201,168,76,0.06) 0%, transparent 70%),
      radial-gradient(ellipse 40% 60% at 20% 80%, rgba(201,168,76,0.04) 0%, transparent 60%);
  }
  .lp-hero-grid {
    position:absolute; inset:0; z-index:0; opacity:0.03;
    background-image:
      linear-gradient(var(--border) 1px, transparent 1px),
      linear-gradient(90deg, var(--border) 1px, transparent 1px);
    background-size: 60px 60px;
  }
  .lp-hero-content { position:relative; z-index:1; max-width:700px; }
  .lp-eyebrow {
    display:inline-flex; align-items:center; gap:10px;
    margin-bottom:24px;
  }
  .lp-eyebrow-line { width:28px; height:1px; background:var(--gold); }
  .lp-eyebrow-text {
    font-family:'DM Sans',sans-serif; font-size:10px; font-weight:600;
    letter-spacing:3.5px; text-transform:uppercase; color:var(--gold);
  }
  .lp-hero h1 {
    font-family:'Cormorant Garamond',serif;
    font-size:clamp(52px,7vw,88px);
    font-weight:700; line-height:1.02; letter-spacing:-1.5px;
    color:var(--cream); margin-bottom:24px;
  }
  .lp-hero h1 em {
    font-style:italic; color:var(--gold);
    background: linear-gradient(90deg,#c9a84c,#e8c97a,#c9a84c);
    background-size:200% auto;
    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
    background-clip:text;
    animation:shimmer 4s linear infinite;
  }
  .lp-hero-sub {
    font-size:17px; font-weight:300; color:var(--cream-dim);
    line-height:1.8; max-width:500px; margin-bottom:44px;
  }
  .lp-hero-actions { display:flex; gap:14px; flex-wrap:wrap; align-items:center; }
  .btn-hero-primary {
    font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600;
    letter-spacing:1.5px; text-transform:uppercase;
    color:#0a0804; background:linear-gradient(135deg,#c9a84c,#e8c97a);
    border:none; cursor:pointer; text-decoration:none;
    padding:16px 36px; border-radius:6px;
    box-shadow:0 4px 24px rgba(201,168,76,0.3);
    transition:all 0.25s;
  }
  .btn-hero-primary:hover { transform:translateY(-2px); box-shadow:0 8px 32px rgba(201,168,76,0.45); }
  .btn-hero-secondary {
    font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500;
    color:var(--cream-dim); background:none;
    border:1px solid var(--border); cursor:pointer; text-decoration:none;
    padding:16px 28px; border-radius:6px; transition:all 0.25s;
  }
  .btn-hero-secondary:hover { border-color:rgba(201,168,76,0.4); color:var(--cream); }

  /* ── Map section ── */
  .lp-map-section {
    padding:0 32px 80px;
  }
  .lp-map-header {
    display:flex; align-items:flex-end; justify-content:space-between;
    padding:0 16px; margin-bottom:24px;
  }
  .lp-map-title {
    font-family:'Cormorant Garamond',serif;
    font-size:clamp(28px,3vw,42px); font-weight:700;
    color:var(--cream); letter-spacing:-0.5px;
  }
  .lp-map-title em { font-style:italic; color:var(--gold); }
  .lp-map-subtitle {
    font-size:13px; color:var(--cream-dim); font-weight:300;
    max-width:300px; text-align:right; line-height:1.6;
  }
  .lp-map-container {
    height:560px; border-radius:20px; overflow:hidden;
    border:1px solid var(--border);
    box-shadow:0 0 0 1px rgba(201,168,76,0.06), 0 40px 100px rgba(0,0,0,0.6);
    position:relative;
  }
  .lp-map-overlay-top {
    position:absolute; top:0; left:0; right:0; height:60px;
    background:linear-gradient(to bottom,rgba(10,8,4,0.5),transparent);
    z-index:5; pointer-events:none;
  }

  /* ── Stats ── */
  .lp-stats {
    display:grid; grid-template-columns:repeat(4,1fr); gap:1px;
    background:var(--border);
    border:1px solid var(--border);
    border-radius:16px; overflow:hidden;
    margin:0 32px 80px;
  }
  .lp-stat {
    background:var(--dark-2);
    padding:36px 28px; text-align:center;
    transition:background 0.2s;
  }
  .lp-stat:hover { background:var(--dark-3); }
  .lp-stat-value {
    font-family:'Cormorant Garamond',serif;
    font-size:42px; font-weight:700; color:var(--gold);
    line-height:1; margin-bottom:8px;
  }
  .lp-stat-label {
    font-size:12px; color:var(--cream-dim); font-weight:400;
    letter-spacing:0.5px; text-transform:uppercase;
  }

  /* ── Métiers ── */
  .lp-metiers-title {
    font-family:'Cormorant Garamond',serif;
    font-size:clamp(32px,4vw,52px); font-weight:700;
    color:var(--cream); letter-spacing:-0.5px;
    margin-bottom:8px;
  }
  .lp-metiers-title em { font-style:italic; color:var(--gold); }
  .lp-metiers-sub {
    font-size:15px; color:var(--cream-dim); font-weight:300;
    margin-bottom:52px; max-width:480px;
  }
  .lp-metiers-grid {
    display:grid; grid-template-columns:repeat(6,1fr); gap:12px;
  }
  .lp-metier-card {
    background:var(--dark-2); border:1px solid var(--border);
    border-radius:14px; padding:24px 16px;
    display:flex; flex-direction:column; align-items:center; gap:10px;
    cursor:pointer; transition:all 0.22s; text-decoration:none;
  }
  .lp-metier-card:hover {
    background:var(--dark-3);
    border-color:rgba(201,168,76,0.4);
    transform:translateY(-3px);
    box-shadow:0 12px 32px rgba(0,0,0,0.3);
  }
  .lp-metier-emoji { font-size:28px; }
  .lp-metier-label {
    font-size:11px; font-weight:500; color:var(--cream-dim);
    text-align:center; letter-spacing:0.3px;
  }

  /* ── Comment ça marche ── */
  .lp-steps-title {
    font-family:'Cormorant Garamond',serif;
    font-size:clamp(32px,4vw,52px); font-weight:700;
    color:var(--cream); letter-spacing:-0.5px;
    margin-bottom:8px;
  }
  .lp-steps-title em { font-style:italic; color:var(--gold); }
  .lp-steps-sub {
    font-size:15px; color:var(--cream-dim); margin-bottom:64px;
  }
  .lp-steps-grid {
    display:grid; grid-template-columns:repeat(3,1fr); gap:32px;
    position:relative;
  }
  .lp-steps-grid::before {
    content:'';
    position:absolute; top:36px; left:calc(16.66% + 16px); right:calc(16.66% + 16px);
    height:1px; background:linear-gradient(90deg,var(--gold),transparent 50%,var(--gold));
    opacity:0.3;
  }
  .lp-step {
    background:var(--dark-2); border:1px solid var(--border);
    border-radius:20px; padding:36px 28px; position:relative;
    transition:all 0.25s;
  }
  .lp-step:hover {
    border-color:rgba(201,168,76,0.35);
    box-shadow:0 16px 48px rgba(0,0,0,0.3);
    transform:translateY(-4px);
  }
  .lp-step-num {
    font-family:'Cormorant Garamond',serif;
    font-size:56px; font-weight:700; color:var(--gold-dim);
    line-height:1; margin-bottom:20px;
    background:linear-gradient(135deg,rgba(201,168,76,0.2),rgba(201,168,76,0.05));
    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
    background-clip:text;
  }
  .lp-step-icon { font-size:32px; margin-bottom:16px; }
  .lp-step h3 {
    font-family:'Cormorant Garamond',serif;
    font-size:22px; font-weight:700; color:var(--cream);
    margin-bottom:10px;
  }
  .lp-step p {
    font-size:14px; color:var(--cream-dim); line-height:1.75; font-weight:300;
  }

  /* ── Témoignages ── */
  .lp-temoignages-title {
    font-family:'Cormorant Garamond',serif;
    font-size:clamp(32px,4vw,52px); font-weight:700;
    color:var(--cream); letter-spacing:-0.5px;
    margin-bottom:8px;
  }
  .lp-temoignages-title em { font-style:italic; color:var(--gold); }
  .lp-temoignages-sub {
    font-size:15px; color:var(--cream-dim); margin-bottom:52px;
  }
  .lp-temoignages-grid {
    display:grid; grid-template-columns:repeat(3,1fr); gap:20px;
  }
  .lp-temoignage {
    background:var(--dark-2); border:1px solid var(--border);
    border-radius:16px; padding:28px; transition:all 0.22s;
  }
  .lp-temoignage:hover {
    border-color:rgba(201,168,76,0.3);
    transform:translateY(-2px);
  }
  .lp-temoignage-stars { color:var(--gold); font-size:15px; margin-bottom:14px; }
  .lp-temoignage-texte {
    font-size:14px; color:var(--cream-dim); line-height:1.75;
    font-style:italic; margin-bottom:20px; font-weight:300;
  }
  .lp-temoignage-texte::before { content:'"'; font-size:32px; color:var(--gold-dim); line-height:0; vertical-align:-12px; margin-right:4px; }
  .lp-temoignage-author {
    display:flex; align-items:center; gap:10px;
  }
  .lp-temoignage-avatar {
    width:36px; height:36px; border-radius:50%;
    background:linear-gradient(135deg,#c9a84c,#8a6c28);
    display:flex; align-items:center; justify-content:center;
    font-size:14px; font-weight:700; color:#0a0804;
    font-family:'Cormorant Garamond',serif;
    flex-shrink:0;
  }
  .lp-temoignage-name {
    font-size:13px; font-weight:600; color:var(--cream);
  }
  .lp-temoignage-loc {
    font-size:11px; color:var(--cream-dim); margin-top:1px;
  }

  /* ── CTA final ── */
  .lp-cta-section {
    margin:0 32px 80px;
    background:linear-gradient(135deg,var(--dark-2),var(--dark-3));
    border:1px solid var(--border);
    border-radius:24px; padding:80px 48px;
    text-align:center; position:relative; overflow:hidden;
  }
  .lp-cta-bg {
    position:absolute; inset:0;
    background:radial-gradient(ellipse 60% 80% at 50% 100%,rgba(201,168,76,0.08),transparent);
    pointer-events:none;
  }
  .lp-cta-section h2 {
    font-family:'Cormorant Garamond',serif;
    font-size:clamp(36px,5vw,64px); font-weight:700;
    color:var(--cream); letter-spacing:-1px; margin-bottom:16px;
    position:relative;
  }
  .lp-cta-section h2 em { font-style:italic; color:var(--gold); }
  .lp-cta-section p {
    font-size:16px; color:var(--cream-dim); font-weight:300;
    margin-bottom:44px; position:relative;
  }
  .lp-cta-actions { display:flex; gap:16px; justify-content:center; flex-wrap:wrap; position:relative; }

  /* ── Footer ── */
  .lp-footer {
    border-top:1px solid var(--border);
    padding:32px 48px;
    display:flex; align-items:center; justify-content:space-between;
  }
  .lp-footer-logo {
    font-family:'Cormorant Garamond',serif;
    font-size:18px; font-weight:700; color:rgba(201,168,76,0.5);
  }
  .lp-footer-copy {
    font-size:12px; color:rgba(245,240,232,0.2); letter-spacing:0.5px;
  }

  /* ── Responsive ── */
  @media (max-width:900px) {
    .lp-header { padding:0 24px; }
    .lp-nav { display:none; }
    .lp-hero { padding:100px 24px 60px; }
    .lp-section { padding:80px 24px; }
    .lp-map-section { padding:0 16px 60px; }
    .lp-stats { grid-template-columns:repeat(2,1fr); margin:0 16px 60px; }
    .lp-metiers-grid { grid-template-columns:repeat(3,1fr); }
    .lp-steps-grid { grid-template-columns:1fr; }
    .lp-steps-grid::before { display:none; }
    .lp-temoignages-grid { grid-template-columns:1fr; }
    .lp-cta-section { margin:0 16px 60px; padding:60px 24px; }
    .lp-map-header { flex-direction:column; align-items:flex-start; gap:8px; }
    .lp-map-subtitle { text-align:left; }
    .lp-footer { padding:24px; flex-direction:column; gap:8px; text-align:center; }
  }
`;

// ── Composant ─────────────────────────────────────────────────────────────────
const LandingScreen = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Injecter les fonts
    if (!document.getElementById("lp-fonts")) {
      const link = document.createElement("link");
      link.id = "lp-fonts"; link.rel = "stylesheet"; link.href = FONT_LINK;
      document.head.appendChild(link);
    }
    // Injecter les styles
    if (!document.getElementById("lp-css")) {
      const style = document.createElement("style");
      style.id = "lp-css"; style.textContent = CSS;
      document.head.appendChild(style);
    }
    // Scroll listener
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ background: "#0a0804", minHeight: "100vh" }}>

      {/* ══════════ HEADER ══════════ */}
      <header className={`lp-header${scrolled ? " scrolled" : ""}`}>
        <a href="/" className="lp-logo">
          <div className="lp-logo-mark">H</div>
          <span className="lp-logo-name">Hopela</span>
        </a>

        <nav className="lp-nav">
          {["Services", "Comment ça marche", "Avis", "Contact"].map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace(/\s/g, "-")}`}>{item}</a>
          ))}
        </nav>

        <div className="lp-header-cta">
          <button className="btn-ghost" onClick={() => navigate("/login")}>
            Connexion
          </button>
          <button className="btn-gold" onClick={() => navigate("/login")}>
            Commencer
          </button>
        </div>
      </header>

      {/* ══════════ HERO ══════════ */}
      <section className="lp-hero" id="accueil">
        <div className="lp-hero-bg" />
        <div className="lp-hero-grid" />

        <div className="lp-hero-content">
          <div className="lp-eyebrow fade-up">
            <div className="lp-eyebrow-line" />
            <span className="lp-eyebrow-text">Nouvelle-Calédonie</span>
          </div>

          <h1 className="fade-up-1">
            Trouvez un<br />
            <em>prestataire</em><br />
            en temps réel
          </h1>

          <p className="lp-hero-sub fade-up-2">
            Hopela connecte les particuliers aux prestataires de services locaux
            géolocalisés en direct. Disponibilité instantanée, partout en Calédonie.
          </p>

          <div className="lp-hero-actions fade-up-3">
            <button className="btn-hero-primary" onClick={() => navigate("/login")}>
              Trouver un prestataire
            </button>
            <button className="btn-hero-secondary" onClick={() => navigate("/login")}>
              Devenir prestataire →
            </button>
          </div>
        </div>
      </section>

      {/* ══════════ CARTE ══════════ */}
      <section className="lp-map-section" id="carte">
        <div className="lp-map-header">
          <div>
            <div className="lp-eyebrow" style={{ marginBottom: 12 }}>
              <div className="lp-eyebrow-line" />
              <span className="lp-eyebrow-text">Géolocalisation temps réel</span>
            </div>
            <h2 className="lp-map-title">
              Ils sont <em>près de vous</em>
            </h2>
          </div>
          <p className="lp-map-subtitle">
            Chaque point est un prestataire disponible maintenant, visible en direct sur la carte.
          </p>
        </div>

        <div className="lp-map-container">
          <div className="lp-map-overlay-top" />
          <PublicMap />
        </div>
      </section>

      {/* ══════════ STATS ══════════ */}
      <div className="lp-stats">
        {STATS.map(({ value, label }) => (
          <div key={label} className="lp-stat">
            <div className="lp-stat-value">{value}</div>
            <div className="lp-stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* ══════════ MÉTIERS ══════════ */}
      <section className="lp-section" id="services">
        <div className="lp-eyebrow" style={{ marginBottom: 16 }}>
          <div className="lp-eyebrow-line" />
          <span className="lp-eyebrow-text">Nos services</span>
        </div>
        <h2 className="lp-metiers-title">
          Tous les <em>métiers</em>
        </h2>
        <p className="lp-metiers-sub">
          Des prestataires qualifiés dans tous les domaines, disponibles maintenant près de chez vous.
        </p>
        <div className="lp-metiers-grid">
          {METIERS.map(({ emoji, label }) => (
            <a key={label} href="#carte" className="lp-metier-card">
              <span className="lp-metier-emoji">{emoji}</span>
              <span className="lp-metier-label">{label}</span>
            </a>
          ))}
        </div>
      </section>

      {/* ══════════ COMMENT ÇA MARCHE ══════════ */}
      <section className="lp-section" id="comment-ça-marche">
        <div className="lp-eyebrow" style={{ marginBottom: 16 }}>
          <div className="lp-eyebrow-line" />
          <span className="lp-eyebrow-text">Simple & rapide</span>
        </div>
        <h2 className="lp-steps-title">
          Comment ça <em>marche</em>
        </h2>
        <p className="lp-steps-sub">Trois étapes, moins de 5 minutes.</p>

        <div className="lp-steps-grid">
          {[
            { num:"01", icon:"🗺️", titre:"Consultez la carte", desc:"Visualisez en temps réel tous les prestataires disponibles autour de vous grâce à la géolocalisation." },
            { num:"02", icon:"👆", titre:"Choisissez un profil", desc:"Consultez les avis, la note et le métier de chaque prestataire. Cliquez sur un marqueur pour les détails." },
            { num:"03", icon:"✅", titre:"Contactez & confirmez", desc:"Prenez contact directement avec le prestataire et planifiez votre intervention en quelques secondes." },
          ].map(({ num, icon, titre, desc }) => (
            <div key={num} className="lp-step">
              <div className="lp-step-num">{num}</div>
              <div className="lp-step-icon">{icon}</div>
              <h3>{titre}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ TÉMOIGNAGES ══════════ */}
      <section className="lp-section" id="avis">
        <div className="lp-eyebrow" style={{ marginBottom: 16 }}>
          <div className="lp-eyebrow-line" />
          <span className="lp-eyebrow-text">Ils nous font confiance</span>
        </div>
        <h2 className="lp-temoignages-title">
          Ce qu'ils en <em>pensent</em>
        </h2>
        <p className="lp-temoignages-sub">
          Des centaines de Calédoniens utilisent Hopela chaque jour.
        </p>
        <div className="lp-temoignages-grid">
          {TEMOIGNAGES.map(({ nom, quartier, texte, note }) => (
            <div key={nom} className="lp-temoignage">
              <div className="lp-temoignage-stars">{"★".repeat(note)}</div>
              <p className="lp-temoignage-texte">{texte}</p>
              <div className="lp-temoignage-author">
                <div className="lp-temoignage-avatar">{nom[0]}</div>
                <div>
                  <div className="lp-temoignage-name">{nom}</div>
                  <div className="lp-temoignage-loc">📍 {quartier}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ CTA FINAL ══════════ */}
      <div className="lp-cta-section">
        <div className="lp-cta-bg" />
        <h2>Prêt à trouver votre <em>prestataire</em> ?</h2>
        <p>Rejoignez des centaines de Calédoniens qui font confiance à Hopela.</p>
        <div className="lp-cta-actions">
          <button className="btn-hero-primary" onClick={() => navigate("/login")}>
            Trouver un prestataire
          </button>
          <button className="btn-hero-secondary" onClick={() => navigate("/login")}>
            Je suis prestataire →
          </button>
        </div>
      </div>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="lp-footer">
        <span className="lp-footer-logo">Hopela</span>
        <span className="lp-footer-copy">© 2025 Hopela — Nouvelle-Calédonie</span>
      </footer>

    </div>
  );
};

export default LandingScreen;
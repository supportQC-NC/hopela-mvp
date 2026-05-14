// src/screens/public/LandingScreen.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import PublicMap from "../../components/map/PublicMap";
import "./LandingScreen.css";

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,700&family=DM+Sans:wght@300;400;500;600&display=swap";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

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

const STEPS = [
  { num: "01", icon: "🗺️", titre: "Consultez la carte",    desc: "Visualisez en temps réel tous les prestataires disponibles autour de vous grâce à la géolocalisation." },
  { num: "02", icon: "👆", titre: "Choisissez un profil",  desc: "Consultez le métier et les services de chaque prestataire. Cliquez sur un marqueur pour les détails." },
  { num: "03", icon: "✅", titre: "Contactez & confirmez", desc: "Prenez contact directement avec le prestataire et planifiez votre intervention en quelques secondes." },
];

const TEMOIGNAGES = [
  { nom: "Marie K.",     quartier: "Anse Vata", texte: "Électricien trouvé en 3 minutes, intervention le jour même. Incroyable !", note: 5 },
  { nom: "Samuel W.",    quartier: "Dumbéa",    texte: "Le plombier était professionnel et rapide. Je recommande Hopela à tous.", note: 5 },
  { nom: "Angélique T.", quartier: "Mont-Dore", texte: "La carte en temps réel c'est génial, on voit exactement où est le prestataire.", note: 5 },
];

/* ── Hook stats BDD ─────────────────────────────────────────────── */
const usePublicStats = () => {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    fetch(`${API_URL}/api/users/stats/public`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => d && setStats(d))
      .catch(() => {});
  }, []);
  return stats;
};

/* ── StatsBloc ──────────────────────────────────────────────────── */
const StatsBloc = ({ stats }) => {
  const items = [
    { value: stats ? `${stats.prestatairesActifs}+` : null, label: "Prestataires actifs",    icon: "🛠️" },
    { value: stats ? `${stats.usersActifs}+`        : null, label: "Utilisateurs inscrits",  icon: "👥" },
    { value: "< 5min",                                      label: "Temps de réponse moyen", icon: "⚡" },
  ];
  return (
    <div className="lp-stats-wrap">
      <div className="lp-stats">
        {items.map(({ value, label, icon }) => (
          <div key={label} className="lp-stat">
            <span className="lp-stat-icon">{icon}</span>
            <div className={`lp-stat-value${!value ? " lp-skeleton" : ""}`}>{value ?? "···"}</div>
            <div className="lp-stat-label">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── MetiersBloc : select mobile / chips tablette+ ─────────────── */
const MetiersBloc = () => {
  const [selected, setSelected] = useState("");

  const toCarte = () =>
    document.getElementById("carte")?.scrollIntoView({ behavior: "smooth" });

  const handleChip = (label) => {
    setSelected((prev) => (prev === label ? "" : label));
    toCarte();
  };

  const handleSelect = (e) => {
    setSelected(e.target.value);
    if (e.target.value) setTimeout(toCarte, 80);
  };

  return (
    <section className="lp-section" id="services">
      <div className="lp-eyebrow">
        <div className="lp-eyebrow-line" />
        <span className="lp-eyebrow-text">Nos services</span>
      </div>
      <h2 className="lp-section-title">Tous les <em>métiers</em></h2>
      <p className="lp-section-sub">
        Des prestataires qualifiés dans tous les domaines, disponibles maintenant près de chez vous.
      </p>

      {/* SELECT — mobile < 640px */}
      <div className="lp-select-wrap">
        <span className="lp-select-prefix">🔍</span>
        <select className="lp-select" value={selected} onChange={handleSelect}>
          <option value="">Choisir un métier…</option>
          {METIERS.map(({ emoji, label }) => (
            <option key={label} value={label}>{emoji}  {label}</option>
          ))}
        </select>
        <span className="lp-select-arrow" aria-hidden>›</span>
      </div>

      {/* CHIPS — tablette+ ≥ 640px */}
      <div className="lp-chips">
        {METIERS.map(({ emoji, label }) => (
          <button
            key={label}
            type="button"
            className={`lp-chip${selected === label ? " lp-chip--on" : ""}`}
            onClick={() => handleChip(label)}
          >
            <span className="lp-chip-e">{emoji}</span>
            <span className="lp-chip-l">{label}</span>
          </button>
        ))}
      </div>

      {selected && (
        <div className="lp-hint">
          <span>{METIERS.find((m) => m.label === selected)?.emoji}</span>
          <span><strong>{selected}</strong> — disponible sur la carte</span>
          <a href="#carte" className="lp-hint-btn">Voir ↓</a>
        </div>
      )}
    </section>
  );
};

/* ── TemoignagesBloc ─────────────────────────────────────────────── */
const TemoignagesBloc = () => {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);
  const x0 = useRef(null);

  const goTo = (i) => {
    setActive(i);
    trackRef.current?.scrollTo({ left: trackRef.current.offsetWidth * i, behavior: "smooth" });
  };
  const onTouchStart = (e) => { x0.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (x0.current === null) return;
    const dx = x0.current - e.changedTouches[0].clientX;
    if (Math.abs(dx) < 40) return;
    if (dx > 0 && active < TEMOIGNAGES.length - 1) goTo(active + 1);
    if (dx < 0 && active > 0) goTo(active - 1);
    x0.current = null;
  };
  const onScroll = () => {
    if (!trackRef.current) return;
    setActive(Math.round(trackRef.current.scrollLeft / trackRef.current.offsetWidth));
  };

  return (
    <section className="lp-section" id="avis">
      <div className="lp-eyebrow">
        <div className="lp-eyebrow-line" />
        <span className="lp-eyebrow-text">Ils nous font confiance</span>
      </div>
      <h2 className="lp-section-title">Ce qu'ils en <em>pensent</em></h2>
      <p className="lp-section-sub">Des centaines de Calédoniens utilisent Hopela chaque jour.</p>
      <div className="lp-temoignages" ref={trackRef}
        onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} onScroll={onScroll}>
        {TEMOIGNAGES.map(({ nom, quartier, texte, note }) => (
          <article key={nom} className="lp-temoignage">
            <div className="lp-stars">{"★".repeat(note)}</div>
            <p className="lp-texte">{texte}</p>
            <div className="lp-author">
              <div className="lp-avatar">{nom[0]}</div>
              <div>
                <div className="lp-author-name">{nom}</div>
                <div className="lp-author-loc">📍 {quartier}</div>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="lp-dots">
        {TEMOIGNAGES.map((_, i) => (
          <button key={i} className={`lp-dot${i === active ? " lp-dot--on" : ""}`}
            onClick={() => goTo(i)} aria-label={`Avis ${i + 1}`} />
        ))}
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════
   PAGE PRINCIPALE
═══════════════════════════════════════════════════ */
const LandingScreen = () => {
  const navigate = useNavigate();
  const stats = usePublicStats();

  // Nombre de prestataires en ligne — remontée depuis PublicMap via prop
  const [prestatairesEnLigne, setPrestatairesEnLigne] = useState(null);
  const handleCount = useCallback((n) => setPrestatairesEnLigne(n), []);

  useEffect(() => {
    if (!document.getElementById("hopela-fonts")) {
      const link = document.createElement("link");
      link.id = "hopela-fonts"; link.rel = "stylesheet"; link.href = FONT_HREF;
      document.head.appendChild(link);
    }
  }, []);

  return (
    <div style={{ background: "#0a0804", minHeight: "100vh" }}>
      <Header />

      {/* ══ HERO ══ */}
      <section className="lp-hero" id="accueil">
        <div className="lp-hero-bg" />
        <div className="lp-hero-grid" />
        <div className="lp-hero-content">
          <div className="lp-eyebrow fade-up">
            <div className="lp-eyebrow-line" />
            <span className="lp-eyebrow-text">Nouvelle-Calédonie</span>
          </div>
          <h1 className="fade-up-1">
            Trouvez un<br /><em>prestataire</em><br />en temps réel
          </h1>
          <p className="lp-hero-sub fade-up-2">
            Hopela connecte les particuliers aux prestataires de services locaux
            géolocalisés en direct. Disponibilité instantanée, partout en Calédonie.
          </p>
          <div className="lp-hero-actions fade-up-3">
            <button className="btn-primary" onClick={() => navigate("/login")}>
              Trouver un prestataire
            </button>
            <button className="btn-secondary" onClick={() => navigate("/register?role=prestataire")}>
              Devenir prestataire →
            </button>
          </div>

          {/* Badge live — affiche le vrai nombre */}
          <div className="lp-hero-badge fade-up-4">
            <span className="lp-live-dot" />
            {prestatairesEnLigne === null ? (
              <span>Prestataires disponibles en ce moment</span>
            ) : prestatairesEnLigne === 0 ? (
              <span>Aucun prestataire en ligne pour le moment</span>
            ) : (
              <span>
                <strong style={{ color: "#4caf6e", fontWeight: 700 }}>{prestatairesEnLigne}</strong>
                {" "}prestataire{prestatairesEnLigne > 1 ? "s" : ""} disponible{prestatairesEnLigne > 1 ? "s" : ""} en ce moment
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ══ CARTE ══ */}
      <section className="lp-map-section" id="carte">
        <div className="lp-map-header">
          <div>
            <div className="lp-eyebrow" style={{ marginBottom: 10 }}>
              <div className="lp-eyebrow-line" />
              <span className="lp-eyebrow-text">Géolocalisation temps réel</span>
            </div>
            <h2 className="lp-map-title">Ils sont <em>près de vous</em></h2>
          </div>
          <p className="lp-map-subtitle">
            Chaque point est un prestataire disponible maintenant, visible en direct.
          </p>
        </div>
        <div className="lp-map-container">
          {/* onCountChange remonte le nb de prestataires en ligne vers le badge hero */}
          <PublicMap onCountChange={handleCount} />
        </div>
      </section>

      {/* ══ STATS ══ */}
      <StatsBloc stats={stats} />

      {/* ══ MÉTIERS ══ */}
      <MetiersBloc />

      {/* ══ COMMENT ÇA MARCHE ══ */}
      <section className="lp-section" id="comment-ca-marche">
        <div className="lp-eyebrow">
          <div className="lp-eyebrow-line" />
          <span className="lp-eyebrow-text">Simple & rapide</span>
        </div>
        <h2 className="lp-section-title">Comment ça <em>marche</em></h2>
        <p className="lp-section-sub">Trois étapes, moins de 5 minutes.</p>
        <div className="lp-steps">
          {STEPS.map(({ num, icon, titre, desc }, i) => (
            <div key={num} className="lp-step">
              {i < STEPS.length - 1 && <div className="lp-step-connector" />}
              <div className="lp-step-head">
                <span className="lp-step-num">{num}</span>
                <span className="lp-step-icon">{icon}</span>
              </div>
              <h3 className="lp-step-title">{titre}</h3>
              <p className="lp-step-desc">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ TÉMOIGNAGES ══ */}
      <TemoignagesBloc />

      {/* ══ CTA FINAL ══ */}
      <div className="lp-cta" id="contact">
        <div className="lp-cta-glow" />
        <h2>Prêt à trouver votre <em>prestataire</em> ?</h2>
        <p>Rejoignez des centaines de Calédoniens qui font confiance à Hopela.</p>
        <div className="lp-cta-actions">
          <button className="btn-primary" onClick={() => navigate("/login")}>
            Trouver un prestataire
          </button>
          <button className="btn-secondary" onClick={() => navigate("/register?role=prestataire")}>
            Je suis prestataire →
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LandingScreen;
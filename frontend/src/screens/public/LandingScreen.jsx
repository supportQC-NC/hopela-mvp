// src/screens/public/LandingScreen.jsx
import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import PublicMap from "../../components/map/PublicMap";
import "./LandingScreen.css";

const FONT_HREF = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,700&family=DM+Sans:wght@300;400;500;600&display=swap";

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
  { nom: "Marie K.",    quartier: "Anse Vata",  texte: "Électricien trouvé en 3 minutes, intervention le jour même. Incroyable !", note: 5 },
  { nom: "Samuel W.",   quartier: "Dumbéa",     texte: "Le plombier était professionnel et rapide. Je recommande Hopela à tous.", note: 5 },
  { nom: "Angélique T.",quartier: "Mont-Dore",  texte: "La carte en temps réel c'est génial, on voit exactement où est le prestataire.", note: 5 },
];

const LandingScreen = () => {
  const navigate = useNavigate();

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
            <button className="btn-hero-primary" onClick={() => navigate("/login")}>
              Trouver un prestataire
            </button>
            <button className="btn-hero-secondary" onClick={() => navigate("/login")}>
              Devenir prestataire →
            </button>
          </div>
          <div className="lp-hero-badge fade-up-4">
            <span className="lp-live-dot" />
            <span>Prestataires disponibles en ce moment</span>
          </div>
        </div>
      </section>

      {/* ══ CARTE ══ */}
      <section className="lp-map-section" id="carte">
        <div className="lp-map-header">
          <div>
            <div className="lp-eyebrow" style={{ marginBottom: 12 }}>
              <div className="lp-eyebrow-line" />
              <span className="lp-eyebrow-text">Géolocalisation temps réel</span>
            </div>
            <h2 className="lp-map-title">Ils sont <em>près de vous</em></h2>
          </div>
          <p className="lp-map-subtitle">
            Chaque point est un prestataire disponible maintenant, visible en direct sur la carte.
          </p>
        </div>
        <div className="lp-map-container">
          <PublicMap />
        </div>
      </section>

      {/* ══ MÉTIERS ══ */}
      <section className="lp-section" id="services">
        <div className="lp-eyebrow">
          <div className="lp-eyebrow-line" />
          <span className="lp-eyebrow-text">Nos services</span>
        </div>
        <h2 className="lp-section-title">Tous les <em>métiers</em></h2>
        <p className="lp-section-sub">
          Des prestataires qualifiés dans tous les domaines, disponibles maintenant près de chez vous.
        </p>
        <div className="lp-metiers-grid">
          {METIERS.map(({ emoji, label }) => (
            <Link key={label} to="/services" className="lp-metier-card">
              <span className="lp-metier-emoji">{emoji}</span>
              <span className="lp-metier-label">{label}</span>
            </Link>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <Link to="/services" style={{ display: "inline-block", padding: "12px 32px", borderRadius: 4, border: "1px solid rgba(201,168,76,0.35)", color: "#c9a84c", fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", textDecoration: "none" }}>
            Voir tous les services →
          </Link>
        </div>
      </section>

      {/* ══ COMMENT ÇA MARCHE ══ */}
      <section className="lp-section" id="comment-ca-marche">
        <div className="lp-eyebrow">
          <div className="lp-eyebrow-line" />
          <span className="lp-eyebrow-text">Simple & rapide</span>
        </div>
        <h2 className="lp-section-title">Comment ça <em>marche</em></h2>
        <p className="lp-section-sub">Trois étapes, moins de 5 minutes.</p>
        <div className="lp-steps-grid">
          {STEPS.map(({ num, icon, titre, desc }) => (
            <div key={num} className="lp-step">
              <div className="lp-step-num">{num}</div>
              <div className="lp-step-icon">{icon}</div>
              <h3>{titre}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <Link to="/comment-ca-marche" style={{ display: "inline-block", padding: "12px 32px", borderRadius: 4, border: "1px solid rgba(201,168,76,0.35)", color: "#c9a84c", fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", textDecoration: "none" }}>
            En savoir plus →
          </Link>
        </div>
      </section>

      {/* ══ TÉMOIGNAGES ══ */}
      <section className="lp-section" id="avis">
        <div className="lp-eyebrow">
          <div className="lp-eyebrow-line" />
          <span className="lp-eyebrow-text">Ils nous font confiance</span>
        </div>
        <h2 className="lp-section-title">Ce qu'ils en <em>pensent</em></h2>
        <p className="lp-section-sub">Des centaines de Calédoniens utilisent Hopela chaque jour.</p>
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

      {/* ══ CTA FINAL ══ */}
      <div className="lp-cta-section">
        <div className="lp-cta-bg" />
        <h2>Prêt à trouver votre <em>prestataire</em> ?</h2>
        <p>Rejoignez des centaines de Calédoniens qui font confiance à Hopela.</p>
        <div className="lp-cta-actions">
          <button className="btn-hero-primary" onClick={() => navigate("/login")}>
            Trouver un prestataire
          </button>
          <Link to="/contact" className="btn-hero-secondary" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
            Nous contacter →
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LandingScreen;
/* eslint-disable react-hooks/exhaustive-deps */
// src/screens/public/ServicesScreen.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const METIER_ICONS = {
  "Électricien":"⚡","Plombier":"🔧","Menuisier":"🪚","Peintre":"🎨",
  "Jardinier":"🌿","Climatisation":"❄️","Femme de ménage":"🧹","Maçon":"🧱",
  "Photographe":"📸","Carreleur":"🔲","Garde d'enfants":"👶","Informaticien":"💻","Coursier":"🛵",
};
const METIER_COLORS = {
  "Électricien":"#f59e0b","Plombier":"#3b82f6","Menuisier":"#92400e","Peintre":"#ec4899",
  "Jardinier":"#22c55e","Climatisation":"#06b6d4","Femme de ménage":"#a78bfa","Maçon":"#f97316",
  "Photographe":"#e11d48","Carreleur":"#84cc16","Garde d'enfants":"#f43f5e","Informaticien":"#6366f1","Coursier":"#14b8a6",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');
  .sv-root { min-height:100vh; background:#0a0804; color:#f5f0e8; font-family:'DM Sans',sans-serif; }
  .sv-hero { padding:120px 24px 80px; text-align:center; background:linear-gradient(180deg,#0f0b05,#0a0804); position:relative; }
  .sv-hero-eyebrow { font-size:10px; letter-spacing:4px; text-transform:uppercase; color:#c9a84c; margin-bottom:20px; }
  .sv-hero h1 { font-family:'Cormorant Garamond',serif; font-size:clamp(36px,6vw,72px); font-weight:700; color:#f5f0e8; line-height:1.1; margin-bottom:20px; }
  .sv-hero h1 em { font-style:italic; color:#c9a84c; }
  .sv-hero p { font-size:16px; color:rgba(245,240,232,0.5); max-width:560px; margin:0 auto 40px; line-height:1.7; }
  .sv-cta { display:inline-block; background:linear-gradient(135deg,#c9a84c,#e8c97a); color:#0a0804; text-decoration:none; font-weight:700; font-size:13px; letter-spacing:2px; text-transform:uppercase; padding:16px 40px; border-radius:4px; transition:all 0.2s; }
  .sv-cta:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(201,168,76,0.4); }
  .sv-section { padding:80px 24px; max-width:1100px; margin:0 auto; }
  .sv-section-title { font-family:'Cormorant Garamond',serif; font-size:clamp(28px,4vw,48px); font-weight:700; color:#f5f0e8; text-align:center; margin-bottom:12px; }
  .sv-section-title em { font-style:italic; color:#c9a84c; }
  .sv-section-sub { text-align:center; font-size:14px; color:rgba(245,240,232,0.4); margin-bottom:56px; }
  .sv-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:20px; }
  .sv-card { background:#120e07; border:1px solid rgba(201,168,76,0.12); border-radius:16px; padding:28px 20px; text-align:center; transition:all 0.3s; cursor:default; }
  .sv-card:hover { border-color:rgba(201,168,76,0.35); transform:translateY(-4px); box-shadow:0 16px 40px rgba(0,0,0,0.4); }
  .sv-card-icon { font-size:36px; margin-bottom:14px; }
  .sv-card-name { font-family:'Cormorant Garamond',serif; font-size:20px; font-weight:700; color:#f5f0e8; margin-bottom:8px; }
  .sv-card-count { font-size:11px; color:rgba(245,240,232,0.35); margin-bottom:12px; }
  .sv-card-badge { display:inline-block; font-size:10px; font-weight:600; letter-spacing:1px; padding:3px 10px; border-radius:20px; }
  .sv-avantages { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:20px; margin-top:0; }
  .sv-av-card { background:#120e07; border:1px solid rgba(201,168,76,0.12); border-radius:14px; padding:24px; display:flex; gap:16px; }
  .sv-av-icon { font-size:28px; flex-shrink:0; }
  .sv-av-title { font-size:15px; font-weight:600; color:#f5f0e8; margin-bottom:6px; }
  .sv-av-text { font-size:13px; color:rgba(245,240,232,0.45); line-height:1.6; }
  .sv-divider { height:1px; background:rgba(201,168,76,0.08); max-width:1100px; margin:0 auto; }
  .sv-cta-section { padding:80px 24px; text-align:center; }
  .sv-cta-section h2 { font-family:'Cormorant Garamond',serif; font-size:clamp(28px,4vw,48px); font-weight:700; color:#f5f0e8; margin-bottom:16px; }
  .sv-cta-section h2 em { font-style:italic; color:#c9a84c; }
  .sv-cta-section p { font-size:14px; color:rgba(245,240,232,0.45); margin-bottom:32px; }
  .sv-cta-row { display:flex; gap:16px; justify-content:center; flex-wrap:wrap; }
  .sv-btn-ghost { border:1px solid rgba(201,168,76,0.35); color:#c9a84c; background:none; padding:14px 32px; border-radius:4px; font-family:'DM Sans',sans-serif; font-size:12px; font-weight:600; letter-spacing:1.5px; text-transform:uppercase; cursor:pointer; text-decoration:none; transition:all 0.2s; }
`;

const AVANTAGES = [
  { icon: "📍", title: "Géolocalisation en temps réel", text: "Trouvez les prestataires disponibles autour de vous maintenant, pas dans 3 heures." },
  { icon: "✅", title: "Prestataires vérifiés", text: "Chaque prestataire est validé par notre équipe avec vérification du RIDET." },
  { icon: "📞", title: "Contact direct", text: "Appelez directement le prestataire sans intermédiaire ni commission cachée." },
  { icon: "🔒", title: "Inscription sécurisée", text: "Vos données sont protégées. Aucune information partagée sans votre accord." },
  { icon: "🗺️", title: "Couverture Grand Nouméa", text: "Nouméa, Dumbéa, Paita, Mont-Dore — tous les prestataires de la zone." },
  { icon: "⚡", title: "Disponibilité immédiate", text: "Le prestataire partage sa position en direct — vous savez s'il est disponible maintenant." },
];

const ServicesScreen = () => {
  const [metiers, setMetiers] = useState([]);
  const [prestataires, setPrestataires] = useState([]);

  useEffect(() => {
    if (!document.getElementById("sv-css")) {
      const s = document.createElement("style"); s.id = "sv-css"; s.textContent = CSS;
      document.head.appendChild(s);
    }
    fetch(`${API_URL}/api/metiers`).then(r => r.json()).then(setMetiers).catch(console.error);
    fetch(`${API_URL}/api/users/prestataires/positions/public`).then(r => r.json()).then(setPrestataires).catch(console.error);
  }, []);

  const countByMetier = (metierNom) =>
    prestataires.filter(p => p.metiers?.[0]?.nom === metierNom).length;

  return (
    <div className="sv-root">
      <Header />

      {/* Hero */}
      <div className="sv-hero">
        <div className="sv-hero-eyebrow">Hopela — Services disponibles</div>
        <h1>Les meilleurs professionnels<br /><em>près de chez vous</em></h1>
        <p>Trouvez instantanément un prestataire qualifié disponible maintenant, géolocalisé sur la carte en temps réel.</p>
        <Link to="/login" className="sv-cta">Trouver un prestataire →</Link>
      </div>

      {/* Grille métiers */}
      <div className="sv-section">
        <div className="sv-section-title">Nos <em>métiers</em></div>
        <div className="sv-section-sub">{metiers.length} catégories de services disponibles sur la plateforme</div>
        <div className="sv-grid">
          {metiers.map((m) => {
            const icon  = METIER_ICONS[m.nom]  || "📍";
            const color = METIER_COLORS[m.nom] || "#c9a84c";
            const count = countByMetier(m.nom);
            return (
              <div className="sv-card" key={m._id}>
                <div className="sv-card-icon">{icon}</div>
                <div className="sv-card-name">{m.nom}</div>
                <div className="sv-card-count">{count > 0 ? `${count} disponible${count > 1 ? "s" : ""} maintenant` : "Aucun disponible actuellement"}</div>
                <span className="sv-card-badge" style={{ background: color + "18", color, border: `1px solid ${color}40` }}>
                  {count > 0 ? "🟢 Disponible" : "⚫ Hors ligne"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="sv-divider" />

      {/* Avantages */}
      <div className="sv-section">
        <div className="sv-section-title">Pourquoi choisir <em>Hopela</em></div>
        <div className="sv-section-sub">La plateforme pensée pour les habitants de Nouvelle-Calédonie</div>
        <div className="sv-avantages">
          {AVANTAGES.map((a) => (
            <div className="sv-av-card" key={a.title}>
              <div className="sv-av-icon">{a.icon}</div>
              <div>
                <div className="sv-av-title">{a.title}</div>
                <div className="sv-av-text">{a.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sv-divider" />

      {/* CTA final */}
      <div className="sv-cta-section">
        <h2>Prêt à trouver votre<br /><em>prestataire</em> ?</h2>
        <p>Créez votre compte gratuitement et accédez à tous les prestataires disponibles près de vous.</p>
        <div className="sv-cta-row">
          <Link to="/login" className="sv-cta">Créer un compte gratuit</Link>
          <Link to="/comment-ca-marche" className="sv-btn-ghost">Comment ça marche ?</Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ServicesScreen;
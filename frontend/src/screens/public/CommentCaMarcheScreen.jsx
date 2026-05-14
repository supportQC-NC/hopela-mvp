/* eslint-disable react-hooks/exhaustive-deps */
// src/screens/public/CommentCaMarcheScreen.jsx
import { useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { useState } from "react";
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');
  .ccm-root { min-height:100vh; background:#0a0804; color:#f5f0e8; font-family:'DM Sans',sans-serif; }
  .ccm-hero { padding:120px 24px 80px; text-align:center; }
  .ccm-eyebrow { font-size:10px; letter-spacing:4px; text-transform:uppercase; color:#c9a84c; margin-bottom:20px; }
  .ccm-hero h1 { font-family:'Cormorant Garamond',serif; font-size:clamp(36px,6vw,72px); font-weight:700; color:#f5f0e8; margin-bottom:20px; line-height:1.1; }
  .ccm-hero h1 em { font-style:italic; color:#c9a84c; }
  .ccm-hero p { font-size:16px; color:rgba(245,240,232,0.5); max-width:540px; margin:0 auto; line-height:1.7; }
  .ccm-section { padding:80px 24px; max-width:1000px; margin:0 auto; }
  .ccm-divider { height:1px; background:rgba(201,168,76,0.08); max-width:1000px; margin:0 auto; }
  .ccm-title { font-family:'Cormorant Garamond',serif; font-size:clamp(26px,4vw,42px); font-weight:700; color:#f5f0e8; text-align:center; margin-bottom:12px; }
  .ccm-title em { font-style:italic; color:#c9a84c; }
  .ccm-sub { text-align:center; font-size:14px; color:rgba(245,240,232,0.4); margin-bottom:56px; }

  /* Étapes */
  .ccm-steps { display:flex; flex-direction:column; gap:0; }
  .ccm-step { display:flex; gap:32px; align-items:flex-start; padding:32px 0; border-bottom:1px solid rgba(201,168,76,0.08); }
  .ccm-step:last-child { border-bottom:none; }
  .ccm-step-num { font-family:'Cormorant Garamond',serif; font-size:64px; font-weight:700; color:rgba(201,168,76,0.15); line-height:1; flex-shrink:0; width:80px; text-align:center; }
  .ccm-step-content { flex:1; }
  .ccm-step-icon { font-size:28px; margin-bottom:10px; }
  .ccm-step-title { font-family:'Cormorant Garamond',serif; font-size:22px; font-weight:700; color:#f5f0e8; margin-bottom:10px; }
  .ccm-step-text { font-size:14px; color:rgba(245,240,232,0.5); line-height:1.75; }
  .ccm-step-badge { display:inline-block; margin-top:12px; font-size:10px; font-weight:600; letter-spacing:1.5px; text-transform:uppercase; color:#c9a84c; background:rgba(201,168,76,0.08); border:1px solid rgba(201,168,76,0.2); border-radius:20px; padding:4px 12px; }

  /* Deux colonnes user / presta */
  .ccm-two-col { display:grid; grid-template-columns:1fr 1fr; gap:24px; }
  @media(max-width:640px){ .ccm-two-col{grid-template-columns:1fr;} .ccm-step{flex-direction:column;gap:16px;} }
  .ccm-col-card { background:#120e07; border:1px solid rgba(201,168,76,0.12); border-radius:16px; padding:32px 24px; }
  .ccm-col-title { font-family:'Cormorant Garamond',serif; font-size:22px; font-weight:700; color:#f5f0e8; margin-bottom:20px; padding-bottom:16px; border-bottom:1px solid rgba(201,168,76,0.1); }
  .ccm-col-title em { color:#c9a84c; font-style:italic; }
  .ccm-col-list { list-style:none; display:flex; flex-direction:column; gap:12px; }
  .ccm-col-list li { display:flex; gap:12px; font-size:13px; color:rgba(245,240,232,0.6); line-height:1.6; }
  .ccm-col-list li span:first-child { flex-shrink:0; font-size:16px; }

  /* FAQ */
  .ccm-faq { display:flex; flex-direction:column; gap:12px; }
  .ccm-faq-item { background:#120e07; border:1px solid rgba(201,168,76,0.12); border-radius:12px; overflow:hidden; }
  .ccm-faq-q { padding:18px 20px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; font-size:14px; font-weight:500; color:#f5f0e8; }
  .ccm-faq-q:hover { background:rgba(201,168,76,0.04); }
  .ccm-faq-a { padding:0 20px 18px; font-size:13px; color:rgba(245,240,232,0.5); line-height:1.7; }

  .ccm-cta { padding:80px 24px; text-align:center; }
  .ccm-cta h2 { font-family:'Cormorant Garamond',serif; font-size:clamp(28px,4vw,48px); font-weight:700; color:#f5f0e8; margin-bottom:16px; }
  .ccm-cta h2 em { font-style:italic; color:#c9a84c; }
  .ccm-cta p { font-size:14px; color:rgba(245,240,232,0.45); margin-bottom:32px; }
  .ccm-cta-row { display:flex; gap:16px; justify-content:center; flex-wrap:wrap; }
  .ccm-btn-gold { background:linear-gradient(135deg,#c9a84c,#e8c97a); color:#0a0804; text-decoration:none; font-weight:700; font-size:12px; letter-spacing:2px; text-transform:uppercase; padding:15px 36px; border-radius:4px; transition:all 0.2s; }
  .ccm-btn-ghost { border:1px solid rgba(201,168,76,0.35); color:#c9a84c; background:none; padding:14px 32px; border-radius:4px; font-size:12px; font-weight:600; letter-spacing:1.5px; text-transform:uppercase; text-decoration:none; transition:all 0.2s; }
`;

const STEPS_USER = [
  { num: "01", icon: "👤", title: "Créez votre compte gratuit", text: "Inscription en 30 secondes. Renseignez votre nom, email et mot de passe. Aucune carte bancaire requise.", badge: "Gratuit & sans engagement" },
  { num: "02", icon: "📍", title: "Activez votre position", text: "Autorisez la géolocalisation pour voir les prestataires disponibles près de vous sur la carte en temps réel.", badge: "Position GPS en temps réel" },
  { num: "03", icon: "🗺️", title: "Explorez la carte", text: "Voyez en un coup d'œil tous les prestataires disponibles dans votre rayon. Filtrez par métier, ajustez le rayon de recherche.", badge: "Filtre par métier & rayon" },
  { num: "04", icon: "📞", title: "Contactez directement", text: "Appelez directement le prestataire depuis la carte ou depuis le tableau de résultats. Aucun intermédiaire, aucune commission.", badge: "Contact direct garanti" },
];

const STEPS_PRESTA = [
  { num: "01", icon: "📝", title: "Inscrivez votre entreprise", text: "Créez votre profil prestataire avec votre RIDET et votre numéro de téléphone. Notre équipe valide votre compte sous 24h.", badge: "Validation sous 24h" },
  { num: "02", icon: "✅", title: "Validation par notre équipe", text: "Nous vérifions vos informations pour garantir la qualité de la plateforme. Vous recevez un email de confirmation.", badge: "Compte certifié" },
  { num: "03", icon: "📍", title: "Partagez votre position", text: "Activez le partage depuis votre tableau de bord. Votre marqueur apparaît en temps réel sur la carte pour tous les utilisateurs près de vous.", badge: "Visibilité immédiate" },
  { num: "04", icon: "📱", title: "Recevez des appels", text: "Les clients vous contactent directement. Gérez votre disponibilité en un tap — arrêtez le partage quand vous n'êtes plus disponible.", badge: "Disponibilité flexible" },
];

const FAQ = [
  { q: "Hopela est-il gratuit ?", a: "Oui, l'accès à la plateforme est entièrement gratuit pour les utilisateurs particuliers. Pour les prestataires, l'inscription et la visibilité sont également gratuites pendant la phase MVP." },
  { q: "Comment mes données de localisation sont-elles gérées ?", a: "Votre position n'est partagée que si vous l'activez explicitement. Pour les prestataires, la position est visible uniquement lors du partage actif. Pour les utilisateurs, la position sert uniquement à filtrer les prestataires et n'est jamais stockée de façon permanente." },
  { q: "Puis-je utiliser Hopela sans créer de compte ?", a: "Vous pouvez consulter la carte en mode public sur la page d'accueil. Pour voir les prestataires dans un rayon personnalisé, enregistrer des adresses et accéder au tableau complet, un compte gratuit est requis." },
  { q: "Comment devenir prestataire sur Hopela ?", a: "Créez un compte prestataire avec votre RIDET et numéro de téléphone professionnel. Notre équipe valide votre inscription sous 24h et vous recevez un email de confirmation pour accéder à votre espace." },
  { q: "Hopela couvre-t-il toute la Nouvelle-Calédonie ?", a: "Actuellement, la plateforme est optimisée pour le Grand Nouméa (Nouméa, Dumbéa, Paita, Mont-Dore). L'extension à d'autres zones est prévue selon la croissance de la communauté de prestataires." },
];

const CommentCaMarcheScreen = () => {
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    if (!document.getElementById("ccm-css")) {
      const s = document.createElement("style"); s.id = "ccm-css"; s.textContent = CSS;
      document.head.appendChild(s);
    }
  }, []);

  return (
    <div className="ccm-root">
      <Header />

      <div className="ccm-hero">
        <div className="ccm-eyebrow">Guide d'utilisation</div>
        <h1>Comment ça<br /><em>marche ?</em></h1>
        <p>Hopela est simple, rapide et gratuit. Voici comment trouver un prestataire ou proposer vos services en quelques étapes.</p>
      </div>

      {/* Étapes utilisateur */}
      <div className="ccm-section">
        <div className="ccm-title">Pour les <em>particuliers</em></div>
        <div className="ccm-sub">Trouver un prestataire disponible maintenant</div>
        <div className="ccm-steps">
          {STEPS_USER.map((s) => (
            <div className="ccm-step" key={s.num}>
              <div className="ccm-step-num">{s.num}</div>
              <div className="ccm-step-content">
                <div className="ccm-step-icon">{s.icon}</div>
                <div className="ccm-step-title">{s.title}</div>
                <div className="ccm-step-text">{s.text}</div>
                <span className="ccm-step-badge">{s.badge}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ccm-divider" />

      {/* Étapes prestataire */}
      <div className="ccm-section">
        <div className="ccm-title">Pour les <em>prestataires</em></div>
        <div className="ccm-sub">Proposer vos services et être visible en temps réel</div>
        <div className="ccm-steps">
          {STEPS_PRESTA.map((s) => (
            <div className="ccm-step" key={s.num}>
              <div className="ccm-step-num">{s.num}</div>
              <div className="ccm-step-content">
                <div className="ccm-step-icon">{s.icon}</div>
                <div className="ccm-step-title">{s.title}</div>
                <div className="ccm-step-text">{s.text}</div>
                <span className="ccm-step-badge">{s.badge}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ccm-divider" />

      {/* Comparatif */}
      <div className="ccm-section">
        <div className="ccm-title">Ce que vous <em>obtenez</em></div>
        <div className="ccm-sub">Selon votre profil</div>
        <div className="ccm-two-col">
          <div className="ccm-col-card">
            <div className="ccm-col-title">Particulier <em>👤</em></div>
            <ul className="ccm-col-list">
              <li><span>🗺️</span><span>Carte en temps réel avec tous les prestataires disponibles</span></li>
              <li><span>📍</span><span>Jusqu'à 10 adresses enregistrées (domicile, bureau…)</span></li>
              <li><span>⊙</span><span>Rayon de recherche personnalisable (1 à 100 km)</span></li>
              <li><span>📞</span><span>Contact direct — pas d'intermédiaire</span></li>
              <li><span>🔍</span><span>Filtrage par métier en temps réel</span></li>
              <li><span>🆓</span><span>100% gratuit</span></li>
            </ul>
          </div>
          <div className="ccm-col-card">
            <div className="ccm-col-title">Prestataire <em>🔧</em></div>
            <ul className="ccm-col-list">
              <li><span>📍</span><span>Visibilité sur la carte pour tous les utilisateurs du Grand Nouméa</span></li>
              <li><span>⚡</span><span>Partage de position en un tap — activable / désactivable</span></li>
              <li><span>✅</span><span>Profil certifié avec badge RIDET vérifié</span></li>
              <li><span>🔧</span><span>Affichage de votre métier et vos coordonnées</span></li>
              <li><span>📱</span><span>Dashboard simple et mobile-first</span></li>
              <li><span>🆓</span><span>Gratuit pendant le MVP</span></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="ccm-divider" />

      {/* FAQ */}
      <div className="ccm-section">
        <div className="ccm-title">Questions <em>fréquentes</em></div>
        <div className="ccm-sub">Tout ce que vous devez savoir</div>
        <div className="ccm-faq">
          {FAQ.map((f, i) => (
            <div className="ccm-faq-item" key={i}>
              <div className="ccm-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span>{f.q}</span>
                <span style={{ color: "#c9a84c", fontSize: 18 }}>{openFaq === i ? "−" : "+"}</span>
              </div>
              {openFaq === i && <div className="ccm-faq-a">{f.a}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="ccm-cta">
        <h2>Prêt à <em>commencer</em> ?</h2>
        <p>Rejoignez Hopela gratuitement et trouvez les prestataires disponibles près de vous.</p>
        <div className="ccm-cta-row">
          <Link to="/login" className="ccm-btn-gold">Créer un compte →</Link>
          <Link to="/services" className="ccm-btn-ghost">Voir les services</Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CommentCaMarcheScreen;
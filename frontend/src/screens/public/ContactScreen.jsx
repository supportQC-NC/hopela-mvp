/* eslint-disable react-hooks/exhaustive-deps */
// src/screens/public/ContactScreen.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');

  /* Variables pour la cohérence */
  :root {
    --bg-main: #0A0D12;
    --bg-card: #111620;
    --primary: #145C45;
    --primary-hover: #1E7A5C;
    --text-main: #F0F2F5;
    --text-secondary: #B0B8C8;
    --border-color: #1d2430;
  }

  .ct-root { min-height:100vh; background:var(--bg-main); color:var(--text-main); font-family:'DM Sans',sans-serif; }
  .ct-hero { padding:120px 24px 60px; text-align:center; background: linear-gradient(180deg, #0F1219, var(--bg-main)); }
  
  .ct-eyebrow { font-size:10px; letter-spacing:4px; text-transform:uppercase; color:var(--primary-hover); margin-bottom:20px; font-weight:700; }
  .ct-hero h1 { font-family:'Cormorant Garamond',serif; font-size:clamp(36px,6vw,66px); font-weight:700; color:var(--text-main); margin-bottom:16px; line-height:1.1; }
  .ct-hero h1 em { font-style:italic; color:var(--primary); }
  .ct-hero p { font-size:15px; color:var(--text-secondary); max-width:500px; margin:0 auto; line-height:1.7; font-weight:300; }
  
  .ct-body { padding:60px 24px 80px; max-width:900px; margin:0 auto; display:grid; grid-template-columns:1fr 380px; gap:48px; }
  @media(max-width:768px){ .ct-body{grid-template-columns:1fr;} }

  /* Formulaire */
  .ct-form-card { 
    background:var(--bg-card); 
    border:1px solid var(--border-color); 
    border-radius:20px; padding:36px 32px; 
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  }
  
  .ct-form-title { font-family:'Cormorant Garamond',serif; font-size:26px; font-weight:700; color:var(--text-main); margin-bottom:6px; }
  .ct-form-sub { font-size:13px; color:var(--text-secondary); margin-bottom:28px; font-weight:300; }
  
  .ct-field { margin-bottom:18px; }
  .ct-label { display:block; font-size:10px; font-weight:600; letter-spacing:1.5px; text-transform:uppercase; color:var(--text-secondary); margin-bottom:7px; }
  
  .ct-input-wrap { position:relative; }
  .ct-input-icon { position:absolute; left:13px; top:50%; transform:translateY(-50%); font-size:14px; pointer-events:none; opacity: 0.7; }
  
  .ct-input { 
    width:100%; 
    background:rgba(255,255,255,0.03); 
    border:1px solid var(--border-color); 
    border-radius:10px; 
    padding:12px 13px 12px 40px; 
    font-family:'DM Sans',sans-serif; font-size:14px; 
    color:var(--text-main); 
    outline:none; 
    transition:all 0.2s; 
    box-sizing:border-box; -webkit-appearance:none; 
  }
  .ct-input::placeholder { color:var(--text-secondary); opacity: 0.5; }
  .ct-input:focus { 
    border-color:var(--primary); 
    background:rgba(20, 92, 69, 0.05); 
    box-shadow:0 0 0 3px rgba(20, 92, 69, 0.15); 
  }
  
  .ct-textarea { 
    width:100%; 
    background:rgba(255,255,255,0.03); 
    border:1px solid var(--border-color); 
    border-radius:10px; 
    padding:12px 14px; 
    font-family:'DM Sans',sans-serif; font-size:14px; 
    color:var(--text-main); 
    outline:none; 
    transition:all 0.2s; 
    box-sizing:border-box; resize:vertical; min-height:140px; -webkit-appearance:none; 
  }
  .ct-textarea::placeholder { color:var(--text-secondary); opacity: 0.5; }
  .ct-textarea:focus { 
    border-color:var(--primary); 
    background:rgba(20, 92, 69, 0.05); 
    box-shadow:0 0 0 3px rgba(20, 92, 69, 0.15); 
  }
  
  .ct-btn { 
    width:100%; 
    background:linear-gradient(135deg,var(--primary),var(--primary-hover)); 
    border:none; 
    border-radius:10px; 
    padding:15px; 
    font-family:'DM Sans',sans-serif; font-size:12px; font-weight:700; 
    letter-spacing:2px; text-transform:uppercase; 
    color:#ffffff; /* Blanc pour lisibilité sur le vert */
    cursor:pointer; 
    transition:all 0.25s; 
    box-shadow:0 4px 15px rgba(20, 92, 69, 0.3); 
    margin-top:6px; 
    display:flex; align-items:center; justify-content:center; gap:8px; 
  }
  .ct-btn:hover { transform:translateY(-2px); box-shadow:0 8px 25px rgba(20, 92, 69, 0.5); filter: brightness(1.1); }
  .ct-btn:disabled { opacity:0.6; cursor:not-allowed; transform:none; filter: grayscale(0.5); }
  
  @keyframes spin { to{transform:rotate(360deg);} }
  .ct-spinner { 
    width:16px; height:16px; 
    border:2px solid rgba(255,255,255,0.3); 
    border-top-color:#ffffff; /* Spinner blanc sur fond vert */
    border-radius:50%; animation:spin 0.7s linear infinite; 
  }
  
  .ct-error { 
    background:rgba(239,68,68,0.1); 
    border:1px solid rgba(239,68,68,0.3); 
    border-radius:10px; padding:12px 14px; font-size:13px; color:#fca5a5; margin-bottom:16px; 
  }
  
  .ct-success { 
    background:rgba(20, 92, 69, 0.1); /* Fond vert très subtil */
    border:1px solid rgba(20, 92, 69, 0.3); 
    border-radius:16px; padding:32px 24px; text-align:center; 
  }
  .ct-success-icon { font-size:48px; margin-bottom:16px; }
  .ct-success-title { font-family:'Cormorant Garamond',serif; font-size:24px; font-weight:700; color:var(--text-main); margin-bottom:10px; }
  .ct-success-text { font-size:13px; color:var(--text-secondary); line-height:1.7; font-weight: 300; }

  /* Sidebar infos */
  .ct-sidebar { display:flex; flex-direction:column; gap:16px; }
  .ct-info-card { 
    background:var(--bg-card); 
    border:1px solid var(--border-color); 
    border-radius:14px; padding:22px; 
    transition: transform 0.2s;
  }
  .ct-info-card:hover { transform: translateY(-2px); border-color: rgba(20, 92, 69, 0.3); }
  
  .ct-info-icon { font-size:24px; margin-bottom:10px; }
  .ct-info-title { font-size:14px; font-weight:600; color:var(--text-main); margin-bottom:6px; }
  .ct-info-text { font-size:12px; color:var(--text-secondary); line-height:1.7; font-weight: 300; }
  .ct-info-link { display:inline-block; margin-top:10px; font-size:12px; color:var(--primary-hover); text-decoration:none; font-weight:600; }
  .ct-info-link:hover { color: var(--primary); text-decoration: underline; }
  
  .ct-divider-card { 
    background:rgba(20, 92, 69, 0.03); 
    border:1px dashed rgba(20, 92, 69, 0.2); 
    border-radius:14px; padding:22px; 
  }
  .ct-divider-card p { font-size:12px; color:var(--text-secondary); line-height:1.7; font-weight: 300; }
  .ct-divider-card strong { color: var(--primary-hover); }
`;

const SUJETS = [
  "Question générale",
  "Problème technique",
  "Signalement d'un prestataire",
  "Devenir prestataire",
  "Partenariat",
  "Autre",
];

const ContactScreen = () => {
  const [form, setForm] = useState({
    nom: "",
    email: "",
    sujet: SUJETS[0],
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!document.getElementById("ct-css")) {
      const s = document.createElement("style");
      s.id = "ct-css";
      s.textContent = CSS;
      document.head.appendChild(s);
    }
  }, []);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/contact/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de l'envoi");
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ct-root">
      <Header />

      <div className="ct-hero">
        <div className="ct-eyebrow">Hopela — Nous contacter</div>
        <h1>
          Une question ?<br />
          <em>Écrivez-nous.</em>
        </h1>
        <p>
          Notre équipe vous répond dans les meilleurs délais. Vous recevrez une
          confirmation par email.
        </p>
      </div>

      <div className="ct-body">
        {/* Formulaire */}
        <div className="ct-form-card">
          {success ? (
            <div className="ct-success">
              <div className="ct-success-icon">✉️</div>
              <div className="ct-success-title">Message envoyé !</div>
              <div className="ct-success-text">
                Merci pour votre message. Vous avez reçu un accusé de réception
                par email. Notre équipe vous répondra dans les meilleurs délais
                (généralement sous 24-48h).
              </div>
            </div>
          ) : (
            <>
              <div className="ct-form-title">Envoyez-nous un message</div>
              <div className="ct-form-sub">
                Accessible à tous — compte non requis
              </div>

              {error && <div className="ct-error">⚠️ {error}</div>}

              <form onSubmit={handleSubmit}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  <div className="ct-field">
                    <label className="ct-label">Votre nom *</label>
                    <div className="ct-input-wrap">
                      <span className="ct-input-icon">👤</span>
                      <input
                        name="nom"
                        className="ct-input"
                        placeholder="Jean Dupont"
                        value={form.nom}
                        onChange={onChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="ct-field">
                    <label className="ct-label">Votre email *</label>
                    <div className="ct-input-wrap">
                      <span className="ct-input-icon">✉️</span>
                      <input
                        name="email"
                        type="email"
                        className="ct-input"
                        placeholder="vous@example.com"
                        value={form.email}
                        onChange={onChange}
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>
                </div>

                <div className="ct-field">
                  <label className="ct-label">Sujet *</label>
                  <div className="ct-input-wrap">
                    <span className="ct-input-icon">📋</span>
                    <select
                      name="sujet"
                      className="ct-input"
                      value={form.sujet}
                      onChange={onChange}
                      style={{ cursor: "pointer", paddingLeft: 40 }}
                    >
                      {SUJETS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="ct-field">
                  <label className="ct-label">Votre message *</label>
                  <textarea
                    name="message"
                    className="ct-textarea"
                    placeholder="Décrivez votre demande en détail…"
                    value={form.message}
                    onChange={onChange}
                    required
                    minLength={20}
                  />
                </div>

                <button
                  type="submit"
                  className="ct-btn"
                  disabled={
                    loading || !form.nom || !form.email || !form.message
                  }
                >
                  {loading ? <span className="ct-spinner" /> : null}
                  {loading ? "Envoi en cours…" : "Envoyer le message →"}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="ct-sidebar">
          <div className="ct-info-card">
            <div className="ct-info-icon">📧</div>
            <div className="ct-info-title">Par email</div>
            <div className="ct-info-text">
              Utilisez le formulaire ci-contre. Vous recevrez une confirmation
              immédiate et une réponse sous 24-48h.
            </div>
          </div>

          <div className="ct-info-card">
            <div className="ct-info-icon">⏰</div>
            <div className="ct-info-title">Délai de réponse</div>
            <div className="ct-info-text">
              Notre équipe traite les messages du lundi au vendredi. Délai
              habituel : 24 à 48 heures ouvrées.
            </div>
          </div>

          <div className="ct-info-card">
            <div className="ct-info-icon">🔧</div>
            <div className="ct-info-title">Vous êtes prestataire ?</div>
            <div className="ct-info-text">
              Pour toute question sur la validation de compte, l'inscription ou
              votre profil prestataire.
            </div>
            <Link to="/login" className="ct-info-link">
              Accéder à mon espace →
            </Link>
          </div>

          <div className="ct-divider-card">
            <p>
              <strong>Hopela</strong> est une plateforme locale développée pour
              connecter les habitants de Nouvelle-Calédonie aux prestataires de
              services locaux. Vos données sont traitées conformément à notre{" "}
              <Link to="/confidentialite" className="ct-info-link">
                politique de confidentialité
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ContactScreen;

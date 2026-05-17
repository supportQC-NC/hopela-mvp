/* eslint-disable react-hooks/exhaustive-deps */
// src/screens/public/ContactScreen.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import "./ContactScreen.scss";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

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

      <main>
        <section className="ct-hero">
          <div className="ct-hero-bg" />

          <div className="ct-hero-content fade-up">
            <div className="ct-eyebrow">
              <span className="ct-live-dot" />
              <span>Support Hopela</span>
            </div>

            <h1>
              Contactez notre
              <br />
              <em>équipe locale.</em>
            </h1>

            <p>
              Une question sur votre compte, une inscription prestataire ou le
              fonctionnement de la plateforme ? Envoyez-nous votre demande, nous
              vous répondons clairement et rapidement.
            </p>

            <div
              className="ct-hero-points"
              aria-label="Informations de contact"
            >
              <span>Réponse 24–48h ouvrées</span>
              <span>Compte non requis</span>
              <span>Support Nouvelle-Calédonie</span>
            </div>
          </div>
        </section>

        <section className="ct-section">
          <div className="ct-body">
            <div className="ct-form-card fade-up-1">
              {success ? (
                <div className="ct-success">
                  <div className="ct-success-icon">✉️</div>
                  <h2 className="ct-success-title">Message envoyé !</h2>
                  <p className="ct-success-text">
                    Merci pour votre message. Vous avez reçu un accusé de
                    réception par email. Notre équipe vous répondra dans les
                    meilleurs délais.
                  </p>
                  <Link to="/" className="ct-btn ct-btn--soft">
                    Retour à l'accueil
                  </Link>
                </div>
              ) : (
                <>
                  <div className="ct-form-head">
                    <span className="ct-form-kicker">Formulaire sécurisé</span>
                    <h2>Envoyez-nous un message</h2>
                    <p>
                      Décrivez votre demande en quelques lignes. Plus votre
                      message est précis, plus notre réponse sera efficace.
                    </p>
                  </div>

                  {error && <div className="ct-error">⚠️ {error}</div>}

                  <form onSubmit={handleSubmit} className="ct-form">
                    <div className="ct-row">
                      <div className="ct-field">
                        <label className="ct-label" htmlFor="ct-nom">
                          Votre nom *
                        </label>
                        <div className="ct-input-wrap">
                          <span className="ct-input-icon">👤</span>
                          <input
                            id="ct-nom"
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
                        <label className="ct-label" htmlFor="ct-email">
                          Votre email *
                        </label>
                        <div className="ct-input-wrap">
                          <span className="ct-input-icon">✉️</span>
                          <input
                            id="ct-email"
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
                      <label className="ct-label" htmlFor="ct-sujet">
                        Sujet *
                      </label>
                      <div className="ct-input-wrap">
                        <span className="ct-input-icon">📋</span>
                        <select
                          id="ct-sujet"
                          name="sujet"
                          className="ct-input ct-select"
                          value={form.sujet}
                          onChange={onChange}
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
                      <label className="ct-label" htmlFor="ct-message">
                        Votre message *
                      </label>
                      <textarea
                        id="ct-message"
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
                      {loading && <span className="ct-spinner" />}
                      {loading ? "Envoi en cours…" : "Envoyer le message →"}
                    </button>
                  </form>
                </>
              )}
            </div>

            <aside
              className="ct-sidebar fade-up-2"
              aria-label="Informations utiles"
            >
              <div className="ct-support-card">
                <span className="ct-support-badge">Support local</span>
                <h3>Une réponse humaine, pas un robot.</h3>
                <p>
                  Nous traitons les demandes liées aux comptes, aux prestataires
                  et au fonctionnement de Hopela avec un suivi clair par email.
                </p>
              </div>

              <div className="ct-info-card">
                <div className="ct-info-icon">📧</div>
                <div>
                  <h3>Confirmation immédiate</h3>
                  <p>
                    Après l'envoi du formulaire, vous recevez une confirmation
                    par email avec le récapitulatif de votre demande.
                  </p>
                </div>
              </div>

              <div className="ct-info-card">
                <div className="ct-info-icon">⏰</div>
                <div>
                  <h3>Délai de réponse</h3>
                  <p>
                    Les messages sont traités du lundi au vendredi. Délai
                    habituel : 24 à 48 heures ouvrées.
                  </p>
                </div>
              </div>

              <div className="ct-info-card">
                <div className="ct-info-icon">🔧</div>
                <div>
                  <h3>Vous êtes prestataire ?</h3>
                  <p>
                    Pour une question sur votre inscription, votre validation ou
                    votre profil professionnel.
                  </p>
                  <Link to="/login" className="ct-info-link">
                    Accéder à mon espace →
                  </Link>
                </div>
              </div>

              <div className="ct-note-card">
                <p>
                  <strong>Hopela</strong> connecte les habitants de
                  Nouvelle-Calédonie aux prestataires de services locaux. Vos
                  données sont traitées selon notre{" "}
                  <Link to="/confidentialite">
                    politique de confidentialité
                  </Link>
                  .
                </p>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ContactScreen;

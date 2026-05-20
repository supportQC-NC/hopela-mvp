// src/screens/public/PrestairePublicPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Tag, Star, Zap, Gift, Percent, Flame, Clock, BadgeCheck,
  Heart, Phone, Mail, Globe, MapPin,
  Share2, Link2,
  ExternalLink, ChevronLeft, ChevronRight, X, Users,
} from "lucide-react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { addFavori, removeFavori, checkFavori, fetchFavoriCount } from "../../slices/favoriSlice";
import "./PrestatairePublicPage.scss";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// ── Badge icons map ────────────────────────────────────────────────────────────
const BADGE_ICONS = { Tag, Star, Zap, Gift, Percent, Flame, Clock, BadgeCheck };
const BADGE_LABELS = {
  Tag:        "Promotion",
  Star:       "Offre spéciale",
  Zap:        "Flash",
  Gift:       "Cadeau",
  Percent:    "Réduction",
  Flame:      "Populaire",
  Clock:      "Limité",
  BadgeCheck: "Certifié",
};
const BADGE_COLORS = {
  Tag:        { bg: "#e8f7f8", color: "#00a6b2", border: "rgba(0,166,178,0.2)" },
  Star:       { bg: "#fef9e7", color: "#d4a017", border: "rgba(212,160,23,0.25)" },
  Zap:        { bg: "#fff3e0", color: "#e65100", border: "rgba(230,81,0,0.2)" },
  Gift:       { bg: "#fce4ec", color: "#c2185b", border: "rgba(194,24,91,0.2)" },
  Percent:    { bg: "#e8f5e9", color: "#2e7d32", border: "rgba(46,125,50,0.2)" },
  Flame:      { bg: "#fbe9e7", color: "#bf360c", border: "rgba(191,54,12,0.2)" },
  Clock:      { bg: "#ede7f6", color: "#6a1b9a", border: "rgba(106,27,154,0.2)" },
  BadgeCheck: { bg: "rgba(0,166,178,0.08)", color: "#00a6b2", border: "rgba(0,166,178,0.2)" },
};

// ── Format date ────────────────────────────────────────────────────────────────
const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : null;

// ── Galerie lightbox ───────────────────────────────────────────────────────────
const Lightbox = ({ images, startIndex, onClose }) => {
  const [current, setCurrent] = useState(startIndex);
  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length);
  const next = () => setCurrent((c) => (c + 1) % images.length);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); if (e.key === "ArrowLeft") prev(); if (e.key === "ArrowRight") next(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  return (
    <div className="ppg-lightbox" onClick={onClose}>
      <button className="ppg-lb-close" onClick={onClose}><X size={20} /></button>
      <button className="ppg-lb-prev" onClick={(e) => { e.stopPropagation(); prev(); }}><ChevronLeft size={24} /></button>
      <img
        src={`${API_URL}${images[current]}`}
        alt={`Vue ${current + 1}`}
        className="ppg-lb-img"
        onClick={(e) => e.stopPropagation()}
      />
      <button className="ppg-lb-next" onClick={(e) => { e.stopPropagation(); next(); }}><ChevronRight size={24} /></button>
      <div className="ppg-lb-counter">{current + 1} / {images.length}</div>
    </div>
  );
};

// ── Bouton favori ──────────────────────────────────────────────────────────────
const FavoriButton = ({ prestataireId, favoriCount }) => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { userInfo } = useSelector((s) => s.auth);
  const isFavori  = useSelector((s) => s.favori.favoriStatus[prestataireId]);
  const count     = useSelector((s) => s.favori.favoriCounts[prestataireId] ?? favoriCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userInfo) dispatch(checkFavori(prestataireId));
    dispatch(fetchFavoriCount(prestataireId));
  }, [prestataireId, userInfo, dispatch]);

  const handleToggle = async () => {
    if (!userInfo) {
      // Invite à se connecter
      if (window.confirm("Connectez-vous pour ajouter ce prestataire à vos favoris.\n\nAller à la page de connexion ?")) {
        navigate("/login");
      }
      return;
    }
    setLoading(true);
    if (isFavori) {
      await dispatch(removeFavori(prestataireId));
    } else {
      await dispatch(addFavori(prestataireId));
    }
    setLoading(false);
  };

  return (
    <button
      className={`ppg-favori-btn ${isFavori ? "ppg-favori-btn--active" : ""}`}
      onClick={handleToggle}
      disabled={loading}
      title={isFavori ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <Heart size={18} fill={isFavori ? "#ff4655" : "none"} />
      <span>{count > 0 ? count : ""}</span>
    </button>
  );
};

// ── Composant principal ────────────────────────────────────────────────────────
const PrestairePublicPage = () => {
  const { id } = useParams();
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [lightbox, setLightbox] = useState(null); // { images, index }

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/prestataires/${id}/public`)
      .then((r) => { if (!r.ok) throw new Error("not_found"); return r.json(); })
      .then(setData)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="ppg-root">
      <Header />
      <div className="ppg-loading">
        <div className="ppg-loading-spinner" />
        <p>Chargement du profil...</p>
      </div>
      <Footer />
    </div>
  );

  if (notFound) return (
    <div className="ppg-root">
      <Header />
      <div className="ppg-not-found">
        <div className="ppg-nf-icon">🔍</div>
        <h1>Prestataire introuvable</h1>
        <p>Ce profil n'existe pas ou n'est plus disponible.</p>
        <Link to="/" className="ppg-back-link">← Retour à l'accueil</Link>
      </div>
      <Footer />
    </div>
  );

  const { prestataire: p, promotions, favoriCount } = data;
  const metier = p.metiers?.[0];
  const categorie = metier?.categorie;

  return (
    <div className="ppg-root">
      <Header />

      {/* ── Hero profil ─────────────────────────────────────────────────────── */}
      <section className="ppg-hero">
        <div className="ppg-hero-bg" />
        <div className="ppg-hero-inner">

          {/* Breadcrumb */}
          <nav className="ppg-breadcrumb">
            <Link to="/">Accueil</Link>
            <span>›</span>
            {categorie && <Link to="/services">{categorie.nom}</Link>}
            {categorie && <span>›</span>}
            <span>{p.prenom} {p.nom}</span>
          </nav>

          <div className="ppg-hero-card">
            {/* Avatar */}
            <div className="ppg-avatar-wrap">
              {p.avatar ? (
                <img src={`${API_URL}${p.avatar}`} alt={`${p.prenom} ${p.nom}`} className="ppg-avatar" />
              ) : (
                <div className="ppg-avatar ppg-avatar--placeholder">
                  {p.prenom?.[0]}{p.nom?.[0]}
                </div>
              )}
              {p.isTracked && <span className="ppg-online-badge" title="En ligne maintenant" />}
            </div>

            {/* Infos principales */}
            <div className="ppg-hero-info">
              <div className="ppg-hero-meta">
                {metier && (
                  <span className="ppg-metier-tag">{metier.nom}</span>
                )}
                {p.isTracked && (
                  <span className="ppg-live-tag">
                    <span className="ppg-live-dot" />
                    Disponible maintenant
                  </span>
                )}
              </div>

              <h1 className="ppg-name">{p.prenom} {p.nom}</h1>

              {p.ridet && (
                <p className="ppg-ridet">RIDET {p.ridet}</p>
              )}

              {p.location?.coordinates?.[0] !== 0 && (
                <p className="ppg-location">
                  <MapPin size={14} />
                  Nouméa, Nouvelle-Calédonie
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="ppg-hero-actions">
              <FavoriButton prestataireId={id} favoriCount={favoriCount} />
              {p.telephoneContact && (
                <a href={`tel:${p.telephoneContact}`} className="ppg-action-btn ppg-action-btn--primary">
                  <Phone size={16} /> Appeler
                </a>
              )}
              {p.emailContact && (
                <a href={`mailto:${p.emailContact}`} className="ppg-action-btn ppg-action-btn--ghost">
                  <Mail size={16} /> Email
                </a>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="ppg-stats">
            <div className="ppg-stat">
              <Users size={16} />
              <span><strong>{favoriCount}</strong> favori{favoriCount !== 1 ? "s" : ""}</span>
            </div>
            {promotions.length > 0 && (
              <div className="ppg-stat">
                <Tag size={16} />
                <span><strong>{promotions.length}</strong> offre{promotions.length !== 1 ? "s" : ""} en cours</span>
              </div>
            )}
            {p.isTracked && (
              <div className="ppg-stat ppg-stat--online">
                <span className="ppg-live-dot" />
                <span>Signal actif</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Contenu ─────────────────────────────────────────────────────────── */}
      <div className="ppg-content">
        <div className="ppg-content-inner">

          {/* Colonne principale */}
          <main className="ppg-main">

            {/* Promotions */}
            {promotions.length > 0 && (
              <section className="ppg-section">
                <h2 className="ppg-section-title">
                  <Tag size={20} /> Offres & promotions
                </h2>
                <div className="ppg-promos-grid">
                  {promotions.map((promo) => {
                    const BadgeIcon = BADGE_ICONS[promo.badge] || Tag;
                    const badgeStyle = BADGE_COLORS[promo.badge] || BADGE_COLORS.Tag;
                    return (
                      <article key={promo._id} className="ppg-promo-card">
                        {/* Badge */}
                        <div
                          className="ppg-promo-badge"
                          style={{ background: badgeStyle.bg, color: badgeStyle.color, border: `1px solid ${badgeStyle.border}` }}
                        >
                          <BadgeIcon size={13} />
                          {BADGE_LABELS[promo.badge] || promo.badge}
                        </div>

                        {/* Galerie */}
                        {promo.images?.length > 0 && (
                          <div className="ppg-promo-gallery">
                            {promo.images.map((img, idx) => (
                              <button
                                key={idx}
                                className="ppg-promo-img-btn"
                                onClick={() => setLightbox({ images: promo.images, index: idx })}
                              >
                                <img src={`${API_URL}${img}`} alt={`${promo.titre} — vue ${idx + 1}`} />
                                <div className="ppg-promo-img-overlay"><ExternalLink size={16} /></div>
                              </button>
                            ))}
                          </div>
                        )}

                        <h3 className="ppg-promo-titre">{promo.titre}</h3>
                        {promo.description && <p className="ppg-promo-desc">{promo.description}</p>}

                        {/* Dates */}
                        {(promo.dateDebut || promo.dateFin) && (
                          <div className="ppg-promo-dates">
                            <Clock size={13} />
                            {promo.dateDebut && <span>Du {formatDate(promo.dateDebut)}</span>}
                            {promo.dateFin && <span>au {formatDate(promo.dateFin)}</span>}
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>
            )}

            {promotions.length === 0 && (
              <section className="ppg-section ppg-section--empty">
                <p>Aucune offre en cours pour ce prestataire.</p>
              </section>
            )}
          </main>

          {/* Sidebar */}
          <aside className="ppg-sidebar">

            {/* Contact */}
            <div className="ppg-sidebar-card">
              <h3 className="ppg-sidebar-title">Contact</h3>
              <div className="ppg-contact-list">
                {p.telephoneContact && (
                  <a href={`tel:${p.telephoneContact}`} className="ppg-contact-item">
                    <Phone size={16} /> {p.telephoneContact}
                  </a>
                )}
                {p.emailContact && (
                  <a href={`mailto:${p.emailContact}`} className="ppg-contact-item">
                    <Mail size={16} /> {p.emailContact}
                  </a>
                )}
                {p.siteWeb && (
                  <a href={p.siteWeb} target="_blank" rel="noreferrer" className="ppg-contact-item">
                    <Globe size={16} /> Site web
                  </a>
                )}
              </div>
            </div>

            {/* Réseaux sociaux */}
            {(p.reseauxSociaux?.instagram || p.reseauxSociaux?.facebook) && (
              <div className="ppg-sidebar-card">
                <h3 className="ppg-sidebar-title">Réseaux sociaux</h3>
                <div className="ppg-social-list">
                  {p.reseauxSociaux?.instagram && (
                    <a href={p.reseauxSociaux.instagram} target="_blank" rel="noreferrer" className="ppg-social-item">
                      <Link2 size={16} /> Instagram
                    </a>
                  )}
                  {p.reseauxSociaux?.facebook && (
                    <a href={p.reseauxSociaux.facebook} target="_blank" rel="noreferrer" className="ppg-social-item">
                      <Share2 size={16} /> Facebook
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Métier */}
            {metier && (
              <div className="ppg-sidebar-card">
                <h3 className="ppg-sidebar-title">Spécialité</h3>
                <p className="ppg-sidebar-metier">{metier.nom}</p>
                {metier.description && <p className="ppg-sidebar-metier-desc">{metier.description}</p>}
                {categorie && (
                  <Link to={`/services/categories/${categorie._id}`} className="ppg-sidebar-cat-link">
                    Voir tous les {categorie.nom} →
                  </Link>
                )}
              </div>
            )}

            {/* Membre depuis */}
            <div className="ppg-sidebar-card ppg-sidebar-card--muted">
              <p className="ppg-member-since">
                Membre depuis {new Date(p.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
              </p>
            </div>

          </aside>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <Lightbox
          images={lightbox.images}
          startIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}

      <Footer />
    </div>
  );
};

export default PrestairePublicPage;
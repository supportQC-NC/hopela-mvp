// src/components/public/PromotionsCarousel.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Tag, Star, Zap, Gift, Percent, Flame, Clock, BadgeCheck } from "lucide-react";
import { API_URL } from "./landingData";
import "./PromotionsCarousel.scss";

const BADGE_ICONS = { Tag, Star, Zap, Gift, Percent, Flame, Clock, BadgeCheck };
const BADGE_LABELS = {
  Tag: "Promotion", Star: "Offre spéciale", Zap: "Flash",
  Gift: "Cadeau", Percent: "Réduction", Flame: "Populaire",
  Clock: "Limité", BadgeCheck: "Certifié",
};
const BADGE_COLORS = {
  Tag:        "#00a6b2",
  Star:       "#d4a017",
  Zap:        "#e65100",
  Gift:       "#c2185b",
  Percent:    "#2e7d32",
  Flame:      "#bf360c",
  Clock:      "#6a1b9a",
  BadgeCheck: "#00a6b2",
};

// ─── Sous-composant : slider d'images interne à une card ───────────────────
const CardImageSlider = ({ images, titre, badgeColor, BadgeIcon }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const sliderRef = useRef(null);

  // Synchronise le scroll physique avec l'index actif
  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    el.scrollTo({ left: activeIndex * el.clientWidth, behavior: "smooth" });
  }, [activeIndex]);

  // Détecte le slide visible après un scroll manuel (swipe)
  const handleScroll = useCallback(() => {
    const el = sliderRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex(index);
  }, []);

  const goTo = (e, idx) => {
    // On ne stopPropagation pas : le Link parent s'ouvre quand même
    setActiveIndex(idx);
  };

  const hasMultiple = images.length > 1;

  return (
    <div className="lp-promo-img-wrapper">
      {/* ── Slides ── */}
      <div
        className="lp-promo-img-slider"
        ref={sliderRef}
        onScroll={handleScroll}
      >
        {images.map((src, i) => (
          <div key={i} className="lp-promo-img-slide">
            <img src={`${API_URL}${src}`} alt={`${titre} – photo ${i + 1}`} />
          </div>
        ))}
      </div>

      {/* ── Dots ── */}
      {hasMultiple && (
        <div className="lp-promo-img-dots">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`lp-promo-img-dot${i === activeIndex ? " lp-promo-img-dot--active" : ""}`}
              aria-label={`Photo ${i + 1}`}
              onClick={(e) => goTo(e, i)}
            />
          ))}
        </div>
      )}

      {/* ── Compteur discret (ex : 2 / 3) ── */}
      {hasMultiple && (
        <div className="lp-promo-img-counter">
          {activeIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
};

// ─── Placeholder quand aucune image ───────────────────────────────────────
const CardImagePlaceholder = ({ badgeColor, BadgeIcon }) => (
  <div className="lp-promo-img-wrapper">
    <div
      className="lp-promo-img-placeholder"
      style={{ background: `linear-gradient(135deg, ${badgeColor}22, ${badgeColor}08)` }}
    >
      <BadgeIcon size={48} strokeWidth={1.2} style={{ color: badgeColor, opacity: 0.35 }} />
    </div>
  </div>
);

// ─── Composant principal ──────────────────────────────────────────────────
const PromotionsCarousel = () => {
  const trackRef = useRef(null);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [isPaused, setIsPaused]     = useState(false);
  const [canLeft, setCanLeft]       = useState(false);
  const [canRight, setCanRight]     = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/promotions/actives`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setPromotions(Array.isArray(data) ? data : []))
      .catch(() => setPromotions([]))
      .finally(() => setLoading(false));
  }, []);

  const checkScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollWidth - el.scrollLeft - el.clientWidth > 8);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    checkScroll();
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [promotions, checkScroll]);

  // Auto-scroll du carrousel principal (entre les cards)
  useEffect(() => {
    if (isPaused || loading || promotions.length <= 2) return;
    const interval = setInterval(() => {
      const el = trackRef.current;
      if (!el) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      const next = el.scrollLeft + 380;
      el.scrollTo({ left: next >= maxScroll - 10 ? 0 : next, behavior: "smooth" });
    }, 4200);
    return () => clearInterval(interval);
  }, [isPaused, loading, promotions.length]);

  const scroll = (dir) => {
    trackRef.current?.scrollBy({ left: dir * 400, behavior: "smooth" });
  };

  if (!loading && promotions.length === 0) return null;

  return (
    <section className="lp-promos-section" id="promotions">
      <div className="lp-promos-header">
        <div className="lp-promos-intro">
          <div className="lp-eyebrow">Offres en cours</div>
          <h2 className="lp-section-title">
            Promotions <em>du moment</em>
          </h2>
          <p className="lp-section-sub">
            Des professionnels près de vous proposent des offres exclusives, disponibles maintenant.
          </p>
        </div>

        <div className="lp-carousel-arrows">
          <button
            type="button"
            className={`lp-arrow${!canLeft ? " lp-arrow--disabled" : ""}`}
            onClick={() => scroll(-1)}
            disabled={!canLeft}
            aria-label="Précédent"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            className={`lp-arrow${!canRight ? " lp-arrow--disabled" : ""}`}
            onClick={() => scroll(1)}
            disabled={!canRight}
            aria-label="Suivant"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="lp-promos-skeletons">
          {[1, 2, 3].map(i => <div key={i} className="lp-promo-skeleton" />)}
        </div>
      ) : (
        <div
          className="lp-promos-track"
          ref={trackRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {promotions.map((promo, index) => {
            const BadgeIcon   = BADGE_ICONS[promo.badge] || Tag;
            const badgeColor  = BADGE_COLORS[promo.badge] || "#00a6b2";
            const badgeLabel  = BADGE_LABELS[promo.badge] || promo.badge;
            const prestataire = promo.prestataire;
            const images      = promo.images?.length ? promo.images : [];
            const metierNom   = prestataire?.metiers?.[0]?.nom || null;

            return (
              <Link
                key={promo._id}
                to={`/prestataire/${prestataire?._id}`}
                className="lp-promo-card"
                style={{ "--delay": `${index * 60}ms` }}
              >
                {/* ── Zone image avec slider ── */}
                {images.length > 0 ? (
                  <CardImageSlider
                    images={images}
                    titre={promo.titre}
                    badgeColor={badgeColor}
                    BadgeIcon={BadgeIcon}
                  />
                ) : (
                  <CardImagePlaceholder badgeColor={badgeColor} BadgeIcon={BadgeIcon} />
                )}

                {/* ── Badge flottant sur l'image ── */}
                <div
                  className="lp-promo-badge"
                  style={{
                    background: `${badgeColor}18`,
                    border: `1px solid ${badgeColor}40`,
                    color: badgeColor,
                  }}
                >
                  <BadgeIcon size={12} />
                  {badgeLabel}
                </div>

                {/* ── Corps de la card ── */}
                <div className="lp-promo-card-body">
                  {/* Prestataire */}
                  <div className="lp-promo-presta">
                    {prestataire?.avatar ? (
                      <img
                        src={`${API_URL}${prestataire.avatar}`}
                        alt={prestataire.prenom}
                        className="lp-promo-avatar"
                      />
                    ) : (
                      <div className="lp-promo-avatar lp-promo-avatar--placeholder">
                        {prestataire?.prenom?.[0]}{prestataire?.nom?.[0]}
                      </div>
                    )}
                    <div className="lp-promo-presta-info">
                      <span className="lp-promo-presta-name">
                        {prestataire?.prenom} {prestataire?.nom}
                      </span>
                      {metierNom && (
                        <span className="lp-promo-presta-metier">{metierNom}</span>
                      )}
                    </div>
                  </div>

                  {/* Titre & description */}
                  <h3 className="lp-promo-titre">{promo.titre}</h3>
                  {promo.description && (
                    <p className="lp-promo-desc">{promo.description}</p>
                  )}

                  {/* Date de fin */}
                  {promo.dateFin && (
                    <div className="lp-promo-date">
                      <Clock size={12} />
                      Jusqu'au{" "}
                      {new Date(promo.dateFin).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                      })}
                    </div>
                  )}

                  <div className="lp-promo-cta">Voir le profil →</div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default PromotionsCarousel;
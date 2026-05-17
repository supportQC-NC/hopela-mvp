import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CatIcon from "./CatIcon";
import { API_URL } from "./landingData";
import "./CategoriesCarousel.scss";

const CategoriesCarousel = () => {
  const navigate = useNavigate();
  const trackRef = useRef(null);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then((r) => r.json())
      .then((d) => setCats(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const checkScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollWidth - el.scrollLeft - el.clientWidth > 10);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;

    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    checkScroll();

    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [cats, checkScroll]);

  useEffect(() => {
    if (isPaused || loading) return undefined;

    const interval = setInterval(() => {
      const el = trackRef.current;
      if (!el) return;

      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 5) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: 300, behavior: "smooth" });
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [isPaused, loading]);

  const scroll = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

  if (loading) {
    return (
      <section className="lp-carousel-section">
        <div className="lp-carousel-loading">Chargement des catégories…</div>
      </section>
    );
  }

  return (
    <section className="lp-carousel-section" id="categories">
      <div className="lp-carousel-header">
        <div className="lp-carousel-intro">
          <div className="lp-eyebrow">Nos services</div>
          <h2 className="lp-section-title">
            Explorez nos <em>catégories</em>
          </h2>
          <p className="lp-section-sub">
            Un large éventail de métiers disponibles pour répondre à tous vos besoins au quotidien.
          </p>
        </div>

        <div className="lp-carousel-arrows">
          <button
            type="button"
            className={`lp-arrow${!canScrollLeft ? " lp-arrow--disabled" : ""}`}
            onClick={() => scroll(-1)}
            aria-label="Précédent"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            className={`lp-arrow${!canScrollRight ? " lp-arrow--disabled" : ""}`}
            onClick={() => scroll(1)}
            aria-label="Suivant"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div
        className="lp-carousel-track"
        ref={trackRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {cats.map((cat) => (
          <article
            key={cat._id}
            className="lp-cat-card"
            onClick={() => navigate(`/services/categories/${cat._id}`)}
            onKeyDown={(e) => e.key === "Enter" && navigate(`/services/categories/${cat._id}`)}
            role="button"
            tabIndex={0}
          >
            <div className="lp-cat-icon">
              <CatIcon icone={cat.icone} size={28} />
            </div>
            <h3 className="lp-cat-nom">{cat.nom}</h3>
            {cat.description && <p className="lp-cat-desc">{cat.description}</p>}
            <div className="lp-cat-link">Découvrir <span>→</span></div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default CategoriesCarousel;

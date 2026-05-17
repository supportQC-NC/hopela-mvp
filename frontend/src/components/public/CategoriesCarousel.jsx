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
      .catch(() => setCats([]))
      .finally(() => setLoading(false));
  }, []);

  const checkScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollWidth - el.scrollLeft - el.clientWidth > 8);
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
    if (isPaused || loading || cats.length <= 3) return undefined;

    const interval = setInterval(() => {
      const el = trackRef.current;
      if (!el) return;

      const maxScroll = el.scrollWidth - el.clientWidth;
      const nextScroll = el.scrollLeft + 340;

      if (nextScroll >= maxScroll - 10) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollTo({ left: nextScroll, behavior: "smooth" });
      }
    }, 4200);

    return () => clearInterval(interval);
  }, [isPaused, loading, cats.length]);

  const scroll = (dir) => {
    const el = trackRef.current;
    if (!el) return;

    el.scrollBy({
      left: dir * 360,
      behavior: "smooth",
    });
  };

  const openCategory = (id) => {
    navigate(`/services/categories/${id}`);
  };

  if (loading) {
    return (
      <section className="lp-carousel-section" id="categories">
        <div className="lp-carousel-loading">
          <span />
          Chargement des catégories…
        </div>
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
            Trouvez rapidement le bon professionnel pour vos besoins du
            quotidien, avec des services clairs, accessibles et organisés par
            métier.
          </p>
        </div>

        <div className="lp-carousel-arrows">
          <button
            type="button"
            className={`lp-arrow${!canScrollLeft ? " lp-arrow--disabled" : ""}`}
            onClick={() => scroll(-1)}
            disabled={!canScrollLeft}
            aria-label="Catégories précédentes"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            type="button"
            className={`lp-arrow${!canScrollRight ? " lp-arrow--disabled" : ""}`}
            onClick={() => scroll(1)}
            disabled={!canScrollRight}
            aria-label="Catégories suivantes"
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
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {cats.map((cat, index) => (
          <article
            key={cat._id}
            className="lp-cat-card"
            style={{ "--delay": `${index * 70}ms` }}
            onClick={() => openCategory(cat._id)}
            onKeyDown={(e) => e.key === "Enter" && openCategory(cat._id)}
            role="button"
            tabIndex={0}
          >
            <div className="lp-cat-top">
              <div className="lp-cat-icon">
                <CatIcon icone={cat.icone} size={28} />
              </div>

              <span className="lp-cat-number">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>

            <div className="lp-cat-body">
              <h3 className="lp-cat-nom">{cat.nom}</h3>

              {cat.description && (
                <p className="lp-cat-desc">{cat.description}</p>
              )}
            </div>

            <div className="lp-cat-link">
              Découvrir <span>→</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default CategoriesCarousel;

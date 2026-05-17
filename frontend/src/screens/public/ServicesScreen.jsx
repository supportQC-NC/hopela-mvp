// src/screens/public/ServicesScreen.jsx

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Wrench,
  Home,
  Sparkles,
  HeartPulse,
  Accessibility,
  Car,
  BookOpen,
  FolderOpen,
} from "lucide-react";

import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import "./servicesScreen.scss";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const LUCIDE_CAT = {
  wrench: Wrench,
  home: Home,
  sparkles: Sparkles,
  "heart-pulse": HeartPulse,
  accessibility: Accessibility,
  car: Car,
  "book-open": BookOpen,
};

const CatIcon = ({ icone, size = 32 }) => {
  const Icon = LUCIDE_CAT[icone] || FolderOpen;
  return <Icon size={size} strokeWidth={1.5} />;
};

const AVANTAGES = [
  {
    icon: "📍",
    title: "Géolocalisation en temps réel",
    text: "Trouvez les prestataires disponibles autour de vous maintenant, pas dans 3 heures.",
  },
  {
    icon: "✅",
    title: "Prestataires vérifiés",
    text: "Chaque prestataire est validé par notre équipe avec vérification du RIDET.",
  },
  {
    icon: "📞",
    title: "Contact direct",
    text: "Appelez directement le prestataire sans intermédiaire ni commission cachée.",
  },
  {
    icon: "🔒",
    title: "Inscription sécurisée",
    text: "Vos données sont protégées. Aucune information partagée sans votre accord.",
  },
  {
    icon: "🗺️",
    title: "Couverture Grand Nouméa",
    text: "Nouméa, Dumbéa, Paita, Mont-Dore — tous les prestataires de la zone.",
  },
  {
    icon: "⚡",
    title: "Disponibilité immédiate",
    text: "Le prestataire partage sa position en direct — vous savez s'il est disponible maintenant.",
  },
];

const ServicesScreen = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [prestataires, setPrestataires] = useState([]);
  const [metiers, setMetiers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/categories`).then((r) => r.json()),
      fetch(`${API_URL}/api/metiers`).then((r) => r.json()),
      fetch(`${API_URL}/api/users/prestataires/positions/public`).then((r) =>
        r.json(),
      ),
    ])
      .then(([cats, mets, prestas]) => {
        setCategories(Array.isArray(cats) ? cats : []);
        setMetiers(Array.isArray(mets) ? mets : []);
        setPrestataires(Array.isArray(prestas) ? prestas : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const metiersByCategorie = (catId) =>
    metiers.filter((m) => (m.categorie?._id || m.categorie) === catId).length;

  const prestaByCategorie = (catId) =>
    prestataires.filter((p) =>
      p.metiers?.some((m) => (m.categorie?._id || m.categorie) === catId),
    ).length;

  return (
    <div className="sv-root">
      <Header />

      <section className="sv-section sv-section-categories">
        <div className="sv-section-head">
          <div className="sv-eyebrow">Catégories</div>
          <h2 className="sv-section-title">
            Nos <em>catégories</em> de services
          </h2>
          <p className="sv-section-sub">
            {loading
              ? "Chargement des catégories…"
              : `${categories.length} catégorie${
                  categories.length > 1 ? "s" : ""
                } de services disponibles sur la plateforme`}
          </p>
        </div>

        {loading ? (
          <div className="sv-skeleton-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="sv-skeleton-card" />
            ))}
          </div>
        ) : (
          <div className="sv-cat-grid">
            {categories.map((cat) => {
              const nbMetiers = metiersByCategorie(cat._id);
              const nbPrestas = prestaByCategorie(cat._id);

              return (
                <article
                  key={cat._id}
                  className="sv-cat-card"
                  onClick={() => navigate(`/services/categories/${cat._id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    navigate(`/services/categories/${cat._id}`)
                  }
                >
                  <div className="sv-cat-card-head">
                    <div className="sv-cat-icon-wrap">
                      <CatIcon icone={cat.icone} size={28} />
                    </div>

                    <span className="sv-cat-count-badge">
                      {nbMetiers} métier{nbMetiers > 1 ? "s" : ""} · {nbPrestas}{" "}
                      pro{nbPrestas > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div>
                    <h3 className="sv-cat-nom">{cat.nom}</h3>
                    {cat.description && (
                      <p className="sv-cat-desc">{cat.description}</p>
                    )}
                  </div>

                  <div className="sv-cat-card-foot">
                    <span>Voir les métiers</span>
                    <strong>→</strong>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="sv-section sv-section-avantages">
        <div className="sv-section-head">
          <div className="sv-eyebrow">Pourquoi Hopela</div>
          <h2 className="sv-section-title">
            Une plateforme pensée pour la <em>proximité</em>
          </h2>
          <p className="sv-section-sub">
            Simple, locale et rapide pour trouver un professionnel en
            Nouvelle-Calédonie.
          </p>
        </div>

        <div className="sv-avantages">
          {AVANTAGES.map((a) => (
            <article className="sv-av-card" key={a.title}>
              <div className="sv-av-icon">{a.icon}</div>
              <div>
                <h3>{a.title}</h3>
                <p>{a.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="sv-cta-section">
        <h2>
          Prêt à trouver votre
          <br />
          <em>prestataire</em> ?
        </h2>

        <p>
          Créez votre compte gratuitement et accédez à tous les prestataires
          disponibles près de vous.
        </p>

        <div className="sv-cta-row">
          <Link to="/login" className="sv-cta">
            Créer un compte gratuit
          </Link>
          <Link to="/comment-ca-marche" className="sv-btn-ghost">
            Comment ça marche ?
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ServicesScreen;

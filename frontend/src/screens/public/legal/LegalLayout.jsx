// src/screens/public/legal/LegalLayout.jsx
import { Link, useLocation } from "react-router-dom";
import heroImg from "../../../bh_hero.jpg";
import logo from "../../../logo.png";
import "./LegalLayout.scss";

const NAV_LINKS = [
  { to: "/mentions-legales", label: "Mentions légales" },
  { to: "/cgu",              label: "CGU" },
  { to: "/cgv",              label: "CGV" },
  { to: "/confidentialite",  label: "Confidentialité" },
  { to: "/cookies",          label: "Cookies" },
];

const LegalLayout = ({ eyebrow, title, titleAccent, date, children }) => {
  const { pathname } = useLocation();

  return (
    <div className="legal-root">

      {/* ── HERO ── */}
      <header className="legal-hero">
        <img src={heroImg} alt="" className="legal-hero__img" />
        <div className="legal-hero__overlay" />
        <div className="legal-hero__grid" />

        <div className="legal-hero__content">
          <div className="legal-logo">
            <img src={logo}  alt="Hopela" />
          </div>

          {eyebrow && (
            <div className="legal-badge">
              <span className="legal-badge__dot" />
              {eyebrow}
            </div>
          )}

          <h1 className="legal-hero-title">
            {title}{titleAccent && <> <span>{titleAccent}</span></>}
          </h1>

          {date && (
            <p className="legal-hero-date">Dernière mise à jour : {date}</p>
          )}
        </div>
      </header>

      {/* ── NAV STICKY ── */}
      <div className="legal-nav-wrap">
        <nav className="legal-nav">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`legal-nav__link${pathname === to ? " legal-nav__link--active" : ""}`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>

      {/* ── CONTENU ── */}
      <main className="legal-body">
        {children}
      </main>

      {/* ── FOOTER ── */}
      <footer className="legal-footer">
        © {new Date().getFullYear()} Hopela — <Link to="/">Retour à l'accueil</Link>
      </footer>

    </div>
  );
};

export default LegalLayout;

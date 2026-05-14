// src/components/layout/Footer.jsx
import { Link } from "react-router-dom";
import "./Footer.css";

const COLS = [
  {
    title: "Plateforme",
    links: [
      { label: "Comment ça marche", to: "/comment-ca-marche" },
      { label: "Nos services",       to: "/services" },
      { label: "Nous contacter",     to: "/contact" },
    ],
  },
  {
    title: "Accès",
    links: [
      { label: "Se connecter",       to: "/login" },
      { label: "Créer un compte",    to: "/login" },
    ],
  },
  {
    title: "Légal",
    links: [
      { label: "Mentions légales",     to: "/mentions-legales" },
      { label: "CGU",                  to: "/cgu" },
      { label: "CGV",                  to: "/cgv" },
      { label: "Confidentialité",      to: "/confidentialite" },
      { label: "Politique de cookies", to: "/cookies" },
    ],
  },
];

// Mini footer utilisé dans les dashboards (users / prestataires)
export const AppFooter = () => (
  <footer style={{
    borderTop: "1px solid rgba(201,168,76,0.08)",
    padding: "16px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
    background: "#0a0804",
    fontFamily: "'DM Sans', sans-serif",
  }}>
    <span style={{ fontSize: 11, color: "rgba(245,240,232,0.2)" }}>
      © {new Date().getFullYear()} Hopela
    </span>
    <div style={{ display: "flex", gap: 16 }}>
      {[
        { label: "Services",          to: "/services" },
        { label: "Comment ça marche", to: "/comment-ca-marche" },
        { label: "Contact",           to: "/contact" },
        { label: "Mentions légales",  to: "/mentions-legales" },
      ].map(({ label, to }) => (
        <Link key={label} to={to} style={{ fontSize: 11, color: "rgba(245,240,232,0.3)", textDecoration: "none", transition: "color 0.2s" }}
          onMouseEnter={(e) => e.target.style.color = "#c9a84c"}
          onMouseLeave={(e) => e.target.style.color = "rgba(245,240,232,0.3)"}
        >
          {label}
        </Link>
      ))}
    </div>
  </footer>
);

const Footer = () => (
  <footer className="lp-footer">
    <div className="lp-footer-top">
      <div className="lp-footer-brand">
        <Link to="/" className="lp-footer-logo">
          <div className="lp-footer-logo-mark">H</div>
          <span className="lp-footer-logo-name">Hopela</span>
        </Link>
        <p className="lp-footer-tagline">
          La plateforme qui connecte les particuliers aux prestataires locaux en temps réel, partout en Nouvelle-Calédonie.
        </p>
      </div>

      {COLS.map(({ title, links }) => (
        <div key={title}>
          <p className="lp-footer-col-title">{title}</p>
          <ul className="lp-footer-links">
            {links.map(({ label, to }) => (
              <li key={label}><Link to={to}>{label}</Link></li>
            ))}
          </ul>
        </div>
      ))}
    </div>

    <div className="lp-footer-bottom">
      <span className="lp-footer-copy">
        © {new Date().getFullYear()} Hopela — Tous droits réservés
      </span>
      <div className="lp-footer-legal">
        <Link to="/mentions-legales">Mentions légales</Link>
        <Link to="/cgu">CGU</Link>
        <Link to="/cgv">CGV</Link>
        <Link to="/confidentialite">Confidentialité</Link>
        <Link to="/cookies">Cookies</Link>
      </div>
    </div>
  </footer>
);

export default Footer;
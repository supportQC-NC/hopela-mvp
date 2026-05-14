// src/components/layout/Footer.jsx
import { Link } from "react-router-dom";
import "./Footer.css";

const COLS = [
  {
    title: "Plateforme",
    links: [
      { label: "Comment ça marche", href: "#comment-ca-marche" },
      { label: "Nos services",       href: "#services" },
      { label: "La carte",           href: "#carte" },
      { label: "Témoignages",        href: "#avis" },
    ],
  },
  {
    title: "Accès",
    links: [
      { label: "Se connecter",      to: "/login" },
      { label: "Créer un compte",   to: "/register" },
      { label: "Espace prestataire",to: "/register?role=prestataire" },
    ],
  },
  {
    title: "Légal",
    links: [
      { label: "Mentions légales",        to: "/mentions-legales" },
      { label: "CGU",                     to: "/cgu" },
      { label: "Politique de cookies",    to: "/cookies" },
      { label: "Confidentialité",         to: "/confidentialite" },
    ],
  },
];

const Footer = () => (
  <footer className="lp-footer">

    <div className="lp-footer-top">

      {/* Brand */}
      <div className="lp-footer-brand">
        <Link to="/" className="lp-footer-logo">
          <div className="lp-footer-logo-mark">H</div>
          <span className="lp-footer-logo-name">Hopela</span>
        </Link>
        <p className="lp-footer-tagline">
          La plateforme qui connecte les particuliers aux prestataires locaux en temps réel, partout dans le monde.
        </p>
      </div>

      {/* Colonnes */}
      {COLS.map(({ title, links }) => (
        <div key={title}>
          <p className="lp-footer-col-title">{title}</p>
          <ul className="lp-footer-links">
            {links.map(({ label, href, to }) => (
              <li key={label}>
                {to ? (
                  <Link to={to}>{label}</Link>
                ) : (
                  <a href={href}>{label}</a>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}

    </div>

    {/* Bottom */}
    <div className="lp-footer-bottom">
      <span className="lp-footer-copy">
        © {new Date().getFullYear()} Hopela — Tous droits réservés
      </span>
      <div className="lp-footer-legal">
        <Link to="/mentions-legales">Mentions légales</Link>
        <Link to="/cgu">CGU</Link>
        <Link to="/confidentialite">Confidentialité</Link>
        <Link to="/cookies">Cookies</Link>
      </div>
    </div>

  </footer>
);

export default Footer;
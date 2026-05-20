// src/components/layout/Header.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import "./Header.scss";
import logo from "../../logo.png";

const NAV_LINKS = [
  { label: "Prestataires",       to: "/services" },
  { label: "Comment ça marche",  to: "/comment-ca-marche" },
  { label: "Contact",            to: "/contact" },
];

const Header = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Ferme le menu si on redimensionne vers desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 960) setMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Bloque le scroll body quand le menu est ouvert
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const getDashPath = (role) => {
    if (role === "admin")       return "/admin/dashboard";
    if (role === "prestataire") return "/prestataire/dashboard";
    return "/dashboard";
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`lp-header${scrolled ? " scrolled" : ""}${menuOpen ? " menu-open" : ""}`}>
      <div className="lp-header-inner">
        {/* ── Logo ── */}
        <Link to="/" className="lp-logo" onClick={closeMenu}>
          <div className="lp-logo-mark">
            <img src={logo} alt="Hopela Logo" className="lp-logo-img" />
          </div>
          <span className="lp-logo-name">Hopela</span>
        </Link>

        {/* ── Nav desktop ── */}
        <nav className="lp-nav" aria-label="Navigation principale">
          {NAV_LINKS.map(({ label, to }) => (
            <Link key={label} to={to}>{label}</Link>
          ))}
        </nav>

        {/* ── CTA desktop ── */}
        <div className="lp-header-cta">
          {userInfo ? (
            <button className="btn-gold" onClick={() => navigate(getDashPath(userInfo.role))}>
              Mon espace
            </button>
          ) : (
            <>
              <button className="btn-ghost" onClick={() => navigate("/login")}>Connexion</button>
              <button className="btn-gold"  onClick={() => navigate("/login")}>Commencer</button>
            </>
          )}
        </div>

        {/* ── Burger mobile ── */}
        <button
          className={`lp-burger${menuOpen ? " open" : ""}`}
          onClick={() => setMenuOpen((x) => !x)}
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* ── Menu mobile ── */}
      <div className={`lp-mobile-menu${menuOpen ? " visible" : ""}`} aria-hidden={!menuOpen}>
        <nav className="lp-mobile-nav">
          {NAV_LINKS.map(({ label, to }) => (
            <Link key={label} to={to} className="lp-mobile-link" onClick={closeMenu}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="lp-mobile-cta">
          {userInfo ? (
            <button
              className="btn-gold"
              onClick={() => { navigate(getDashPath(userInfo.role)); closeMenu(); }}
            >
              Mon espace
            </button>
          ) : (
            <>
              <button className="btn-ghost" onClick={() => { navigate("/login"); closeMenu(); }}>
                Connexion
              </button>
              <button className="btn-gold"  onClick={() => { navigate("/login"); closeMenu(); }}>
                Commencer
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Overlay sombre derrière le menu ── */}
      {menuOpen && <div className="lp-menu-overlay" onClick={closeMenu} aria-hidden="true" />}
    </header>
  );
};

export default Header;
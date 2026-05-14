// src/components/layout/Header.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import "./Header.css";
import logo from "../../logo.jpg";
const NAV_LINKS = [
  { label: "Services",          to: "/services" },
  { label: "Comment ça marche", to: "/comment-ca-marche" },
  { label: "Contact",           to: "/contact" },
];

const Header = () => {
  const navigate  = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [scrolled,   setScrolled]   = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const getDashPath = (role) => {
    if (role === "admin")       return "/admin/dashboard";
    if (role === "prestataire") return "/prestataire/dashboard";
    return "/dashboard";
  };

  return (
    <header className={"lp-header" + (scrolled ? " scrolled" : "")}>
      {/* Logo */}
      {/* <Link to="/" className="lp-logo">
        <div className="lp-logo-mark">H</div>
        <span className="lp-logo-name">Hopela</span>
      </Link> */}
      <Link to="/" className="lp-logo">
  <div className="lp-logo-mark">
    <img src={logo} alt="Hopela Logo" className="lp-logo-img" />
  </div>
  <span className="lp-logo-name">Hopela</span>
</Link>

      {/* Nav desktop */}
      <nav className="lp-nav">
        {NAV_LINKS.map(({ label, to }) => (
          <Link key={label} to={to}>{label}</Link>
        ))}
      </nav>

      {/* CTA desktop */}
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

      {/* Burger mobile */}
      <button className="lp-burger" onClick={() => setMenuOpen((x) => !x)} aria-label="Menu">
        <span /><span /><span />
      </button>

      {/* Menu mobile */}
      {menuOpen && (
        <div className="lp-mobile-menu" onClick={() => setMenuOpen(false)}>
          {NAV_LINKS.map(({ label, to }) => (
            <Link key={label} to={to} className="lp-mobile-link">{label}</Link>
          ))}
          <div className="lp-mobile-cta">
            {userInfo ? (
              <button className="btn-gold" onClick={() => navigate(getDashPath(userInfo.role))}>Mon espace</button>
            ) : (
              <>
                <button className="btn-ghost" onClick={() => navigate("/login")}>Connexion</button>
                <button className="btn-gold"  onClick={() => navigate("/login")}>Commencer</button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
// src/components/layout/Header.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import "./Header.css";

const NAV_LINKS = [
  { label: "Services",           href: "#services" },
  { label: "Comment ça marche",  href: "#comment-ca-marche" },
  { label: "Avis",               href: "#avis" },
  { label: "Contact",            href: "#contact" },
];

const Header = () => {
  const navigate  = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`lp-header${scrolled ? " scrolled" : ""}`}>

      {/* Logo */}
      <Link to="/" className="lp-logo">
        <div className="lp-logo-mark">H</div>
        <span className="lp-logo-name">Hopela</span>
      </Link>

      {/* Nav */}
      <nav className="lp-nav">
        {NAV_LINKS.map(({ label, href }) => (
          <a key={label} href={href}>{label}</a>
        ))}
      </nav>

      {/* CTA */}
      <div className="lp-header-cta">
        {userInfo ? (
          <button className="btn-gold" onClick={() => navigate("/dashboard")}>
            Mon espace
          </button>
        ) : (
          <>
            <button className="btn-ghost" onClick={() => navigate("/login")}>
              Connexion
            </button>
            <button className="btn-gold" onClick={() => navigate("/register")}>
              Commencer
            </button>
          </>
        )}
      </div>

    </header>
  );
};

export default Header;
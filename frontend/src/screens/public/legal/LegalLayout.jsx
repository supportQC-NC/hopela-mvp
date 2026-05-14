// src/screens/public/legal/LegalLayout.jsx
// Layout commun à toutes les pages légales
import { useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');
  .legal-root { min-height:100vh; background:#0a0804; color:#f5f0e8; font-family:'DM Sans',sans-serif; }
  .legal-hero { padding:100px 24px 48px; text-align:center; border-bottom:1px solid rgba(201,168,76,0.08); }
  .legal-eyebrow { font-size:10px; letter-spacing:4px; text-transform:uppercase; color:#c9a84c; margin-bottom:16px; }
  .legal-hero h1 { font-family:'Cormorant Garamond',serif; font-size:clamp(28px,5vw,52px); font-weight:700; color:#f5f0e8; margin-bottom:10px; }
  .legal-hero h1 em { font-style:italic; color:#c9a84c; }
  .legal-hero-date { font-size:12px; color:rgba(245,240,232,0.3); }
  .legal-body { max-width:800px; margin:0 auto; padding:56px 24px 80px; }
  .legal-nav { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:40px; }
  .legal-nav a { font-size:11px; padding:5px 12px; border-radius:20px; border:1px solid rgba(201,168,76,0.15); color:rgba(245,240,232,0.45); text-decoration:none; transition:all 0.2s; }
  .legal-nav a:hover, .legal-nav a.active { border-color:rgba(201,168,76,0.4); color:#c9a84c; background:rgba(201,168,76,0.06); }
  .legal-section { margin-bottom:40px; }
  .legal-section h2 { font-family:'Cormorant Garamond',serif; font-size:22px; font-weight:700; color:#f5f0e8; margin-bottom:12px; padding-bottom:10px; border-bottom:1px solid rgba(201,168,76,0.08); }
  .legal-section h3 { font-size:15px; font-weight:600; color:#c9a84c; margin:16px 0 8px; }
  .legal-section p { font-size:14px; color:rgba(245,240,232,0.55); line-height:1.85; margin-bottom:12px; }
  .legal-section ul { list-style:none; padding:0; margin:0 0 12px; }
  .legal-section ul li { font-size:14px; color:rgba(245,240,232,0.55); line-height:1.85; padding:3px 0 3px 16px; position:relative; }
  .legal-section ul li::before { content:'—'; position:absolute; left:0; color:rgba(201,168,76,0.4); }
  .legal-section a { color:#c9a84c; }
  .legal-highlight { background:rgba(201,168,76,0.06); border:1px solid rgba(201,168,76,0.15); border-left:3px solid #c9a84c; border-radius:0 8px 8px 0; padding:14px 18px; margin-bottom:16px; }
  .legal-highlight p { margin-bottom:0; color:rgba(245,240,232,0.65); }
  .legal-table { width:100%; border-collapse:collapse; margin-bottom:16px; font-size:13px; }
  .legal-table th { text-align:left; padding:10px 12px; background:rgba(201,168,76,0.08); color:#c9a84c; font-weight:600; font-size:11px; letter-spacing:1px; text-transform:uppercase; border-bottom:1px solid rgba(201,168,76,0.15); }
  .legal-table td { padding:10px 12px; border-bottom:1px solid rgba(255,255,255,0.04); color:rgba(245,240,232,0.55); vertical-align:top; }
  .legal-table tr:last-child td { border-bottom:none; }
`;

const NAV_LINKS = [
  { to: "/mentions-legales", label: "Mentions légales" },
  { to: "/cgu",              label: "CGU" },
  { to: "/cgv",              label: "CGV" },
  { to: "/confidentialite",  label: "Confidentialité" },
  { to: "/cookies",          label: "Cookies" },
];

const LegalLayout = ({ eyebrow, title, date, children }) => {
  useEffect(() => {
    if (!document.getElementById("legal-css")) {
      const s = document.createElement("style"); s.id = "legal-css"; s.textContent = CSS;
      document.head.appendChild(s);
    }
  }, []);

  return (
    <div className="legal-root">
      <Header />
      <div className="legal-hero">
        <div className="legal-eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        {date && <div className="legal-hero-date">Dernière mise à jour : {date}</div>}
      </div>
      <div className="legal-body">
        <nav className="legal-nav">
          {NAV_LINKS.map(({ to, label }) => (
            <Link key={to} to={to} className={window.location.pathname === to ? "active" : ""}>
              {label}
            </Link>
          ))}
        </nav>
        {children}
      </div>
      <Footer />
    </div>
  );
};

export default LegalLayout;
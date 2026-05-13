// src/components/admin/AdminModal.jsx
import { useEffect } from "react";
import "./AdminModal.css";

const AdminModal = ({ title, onClose, children, footer }) => {
  // Fermer avec Echap
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="am-overlay" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="am-modal">
        <div className="am-header">
          <span className="am-title">{title}</span>
          <button className="am-close" onClick={onClose}>✕</button>
        </div>
        <div className="am-body">{children}</div>
        {footer && <div className="am-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default AdminModal;
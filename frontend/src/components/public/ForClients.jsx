import { useNavigate } from "react-router-dom";
import "./ForClients.scss";

const PROFILS = [
  "Un coiffeur à domicile.",
  "Un thérapeute.",
  "Un jardinier.",
  "Un artisan.",
  "Un professionnel mobile.",
];

const ForClients = () => {
  const navigate = useNavigate();

  return (
    <section className="fc-section" id="pour-les-clients">
      <div className="fc-inner">

        {/* Colonne gauche — contenu éditorial */}
        <div className="fc-col-content">
          <div className="fc-eyebrow">Pour les clients</div>

          <h2 className="fc-title">
            Le professionnel dont vous avez besoin est peut-être à{" "}
            <em>800 mètres.</em>
          </h2>

          <div className="fc-body">
            <p>Il ne le sait pas encore. Vous non plus.</p>
            <p>
              Hopela le rend visible —&nbsp;grâce à votre position géographique.
            </p>
          </div>

          {/* Liste des profils */}
          <ul className="fc-profils">
            {PROFILS.map((p) => (
              <li key={p} className="fc-profil-item">
                <span className="fc-profil-dot" />
                {p}
              </li>
            ))}
          </ul>

          <p className="fc-signal-line">
            Leur présence est déjà là.
            <br />
            <strong>Hopela vous envoie le signal.</strong>
          </p>

          <div className="fc-actions">
            <button
              className="fc-btn fc-btn--primary"
              onClick={() => navigate("/login")}
            >
              → Trouver autour de moi
            </button>
            <button
              className="fc-btn fc-btn--ghost"
              onClick={() => navigate("/comment-ca-marche")}
            >
              Comment ça marche
            </button>
          </div>
        </div>

        {/* Colonne droite — carte visuelle */}
        <div className="fc-col-visual">
          <div className="fc-visual-card">
            <div className="fc-radar">
              <div className="fc-radar-ring fc-radar-ring--1" />
              <div className="fc-radar-ring fc-radar-ring--2" />
              <div className="fc-radar-ring fc-radar-ring--3" />
              <div className="fc-radar-center">
                <span className="fc-radar-dot" />
              </div>
              {/* Points prestataires */}
              <div className="fc-radar-pin" style={{ top: "22%", left: "62%" }}>
                <span className="fc-pin-dot" />
                <span className="fc-pin-label">Plombier</span>
              </div>
              <div className="fc-radar-pin" style={{ top: "58%", left: "28%" }}>
                <span className="fc-pin-dot" />
                <span className="fc-pin-label">Jardinier</span>
              </div>
              <div className="fc-radar-pin" style={{ top: "70%", left: "65%" }}>
                <span className="fc-pin-dot" />
                <span className="fc-pin-label">Électricien</span>
              </div>
            </div>

            <div className="fc-visual-badge">
              <span className="fc-badge-dot" />
              <span>3 prestataires détectés dans votre zone</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ForClients;
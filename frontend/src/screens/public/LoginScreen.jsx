// src/screens/public/LoginScreen.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, registerUser } from "../../slices/authSlice";
import "./LoginScreen.scss";
import logo from "../../logo.png";
// ── Redirect selon le rôle ─────────────────────────────────────────────────
const getRedirectPath = (role) => {
  if (role === "admin") return "/admin/dashboard";
  if (role === "prestataire") return "/prestataire/dashboard";
  return "/dashboard";
};

const LoginScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  const [role, setRole] = useState("user");
  const [telephone, setTelephone] = useState("");
  const [ridet, setRidet] = useState("");

  const [pendingValidation, setPendingValidation] = useState(false);

  useEffect(() => {
    if (userInfo) navigate(getRedirectPath(userInfo.role), { replace: true });
  }, [userInfo, navigate]);

  const resetMessages = () => {
    setError("");
    setPendingValidation(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await dispatch(loginUser({ email, password }));

    if (loginUser.fulfilled.match(result)) {
      navigate(getRedirectPath(result.payload.role), { replace: true });
    } else {
      setError(result.payload || "Erreur de connexion");
    }

    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (role === "prestataire") {
      if (!telephone.trim()) {
        setError("Le numéro de téléphone est obligatoire.");
        setLoading(false);
        return;
      }

      if (!ridet.trim()) {
        setError("Le RIDET est obligatoire.");
        setLoading(false);
        return;
      }
    }

    const result = await dispatch(
      registerUser({
        nom,
        prenom,
        email: regEmail,
        password: regPass,
        role,
        telephoneContact: role === "prestataire" ? telephone.trim() : undefined,
        ridet: role === "prestataire" ? ridet.trim() : undefined,
      }),
    );

    if (registerUser.fulfilled.match(result)) {
      if (result.payload.pendingValidation) {
        setPendingValidation(true);
      } else {
        navigate(getRedirectPath(result.payload.role), { replace: true });
      }
    } else {
      setError(result.payload || "Erreur lors de la création du compte");
    }

    setLoading(false);
  };

  return (
    <main className="login-root">
      <section className="login-visual" aria-label="Présentation Hopela">
        <div className="login-visual-bg" />
        <div className="login-visual-grid" />
        <div className="login-visual-orb login-visual-orb--one" />
        <div className="login-visual-orb login-visual-orb--two" />

        <Link
          to="/"
          className="login-visual-logo"
          aria-label="Retour à l'accueil Hopela"
        >
          <span className="login-visual-logo-mark">
            <img src={logo} alt="" />
          </span>
          <span className="login-visual-logo-name">Hopela</span>
        </Link>

        <div className="login-visual-content fade-up">
          <span className="login-eyebrow">
            Hopela <span>booster</span> d'opportunités
          </span>
          <h1 className="login-visual-title">
            Rejoignez 
            <br />
             <em>Hopela</em>.
          </h1>
          <p className="login-visual-sub">
          Signalez. Trouvez. En temps réel
          </p>

          <div className="login-visual-benefits" aria-label="Avantages Hopela">
            <div className="login-visual-benefit">
              <span>✓</span>
              Connexion rapide et sécurisée
            </div>
            <div className="login-visual-benefit">
              <span>✓</span>
              Accès client et prestataire
            </div>
            <div className="login-visual-benefit">
              <span>✓</span>
              Suivi des disponibilités en temps réel
            </div>
          </div>

          <div className="login-visual-dots" aria-hidden="true">
            <span
              className={
                "login-visual-dot" + (tab === "login" ? " active" : "")
              }
            />
            <span
              className={
                "login-visual-dot" + (tab === "register" ? " active" : "")
              }
            />
          </div>
        </div>
      </section>

      <section
        className="login-panel"
        aria-label="Connexion et création de compte"
      >
        <div className="login-card fade-up-1">
          <div
            className="login-tabs"
            role="tablist"
            aria-label="Choix du formulaire"
          >
            <button
              type="button"
              className={"login-tab" + (tab === "login" ? " active" : "")}
              onClick={() => {
                setTab("login");
                resetMessages();
              }}
            >
              Connexion
            </button>
            <button
              type="button"
              className={"login-tab" + (tab === "register" ? " active" : "")}
              onClick={() => {
                setTab("register");
                resetMessages();
              }}
            >
              Créer un compte
            </button>
          </div>

          {tab === "login" && (
            <>
              <div className="login-form-head">
                <span className="login-form-kicker">Espace Hopela</span>
                <h2 className="login-form-title">Bon retour 👋</h2>
                <p className="login-form-sub">
                  Connectez-vous à votre espace Hopela.
                </p>
              </div>

              {error && (
                <div className="login-error">
                  <span>⚠️</span>
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="login-form">
                <div className="login-field">
                  <label className="login-label" htmlFor="login-email">
                    Adresse email
                  </label>
                  <div className="login-input-wrap">
                    <span className="login-input-icon">✉️</span>
                    <input
                      id="login-email"
                      type="email"
                      className="login-input"
                      placeholder="vous@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="login-field">
                  <label className="login-label" htmlFor="login-password">
                    Mot de passe
                  </label>
                  <div className="login-input-wrap">
                    <span className="login-input-icon">🔑</span>
                    <input
                      id="login-password"
                      type="password"
                      className={"login-input" + (error ? " error" : "")}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                <div className="login-forgot">
                  <Link to="/forgot-password">Mot de passe oublié ?</Link>
                </div>

                <button type="submit" className="login-btn" disabled={loading}>
                  {loading && <span className="login-spinner" />}
                  {loading ? "Connexion..." : "Se connecter →"}
                </button>
              </form>
            </>
          )}

          {tab === "register" && (
            <>
              {pendingValidation ? (
                <div className="login-pending">
                  <div className="login-pending-icon">⏳</div>
                  <h2 className="login-form-title">Compte créé !</h2>
                  <div className="login-pending-box">
                    <p>
                      Votre compte prestataire est{" "}
                      <strong>en attente de validation</strong> par un
                      administrateur Hopela.
                      <br />
                      <br />
                      Vous recevrez un email dès que votre compte sera activé.
                      Cela prend généralement moins de 24h.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="login-btn"
                    onClick={() => {
                      setTab("login");
                      setPendingValidation(false);
                    }}
                  >
                    Retour à la connexion
                  </button>
                </div>
              ) : (
                <>
                  <div className="login-form-head">
                    <span className="login-form-kicker">
                      Inscription gratuite
                    </span>
                    <h2 className="login-form-title">Créer un compte</h2>
                    <p className="login-form-sub">
                      Rejoignez Hopela en quelques secondes.
                    </p>
                  </div>

                  {error && (
                    <div className="login-error">
                      <span>⚠️</span>
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleRegister} className="login-form">
                    <div className="login-row">
                      <div className="login-field">
                        <label
                          className="login-label"
                          htmlFor="register-prenom"
                        >
                          Prénom
                        </label>
                        <div className="login-input-wrap">
                          <span className="login-input-icon">👤</span>
                          <input
                            id="register-prenom"
                            type="text"
                            className="login-input"
                            placeholder="Jean"
                            value={prenom}
                            onChange={(e) => setPrenom(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="login-field">
                        <label className="login-label" htmlFor="register-nom">
                          Nom
                        </label>
                        <div className="login-input-wrap">
                          <span className="login-input-icon">👤</span>
                          <input
                            id="register-nom"
                            type="text"
                            className="login-input"
                            placeholder="Dupont"
                            value={nom}
                            onChange={(e) => setNom(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="login-field">
                      <label className="login-label" htmlFor="register-email">
                        Adresse email
                      </label>
                      <div className="login-input-wrap">
                        <span className="login-input-icon">✉️</span>
                        <input
                          id="register-email"
                          type="email"
                          className="login-input"
                          placeholder="vous@example.com"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          required
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    <div className="login-field">
                      <label
                        className="login-label"
                        htmlFor="register-password"
                      >
                        Mot de passe
                      </label>
                      <div className="login-input-wrap">
                        <span className="login-input-icon">🔑</span>
                        <input
                          id="register-password"
                          type="password"
                          className="login-input"
                          placeholder="Min. 6 caractères"
                          value={regPass}
                          onChange={(e) => setRegPass(e.target.value)}
                          required
                          minLength={6}
                          autoComplete="new-password"
                        />
                      </div>
                    </div>

                    <div className="login-field">
                      <label className="login-label" htmlFor="register-role">
                        Je suis
                      </label>
                      <div className="login-input-wrap">
                        <span className="login-input-icon">🛡️</span>
                        <select
                          id="register-role"
                          className="login-select"
                          value={role}
                          onChange={(e) => {
                            setRole(e.target.value);
                            setTelephone("");
                            setRidet("");
                          }}
                        >
                          <option value="user">
                            Particulier — je cherche un prestataire
                          </option>
                          <option value="prestataire">
                            Prestataire — je propose mes services
                          </option>
                        </select>
                      </div>
                    </div>

                    {role === "prestataire" && (
                      <div className="login-pro-fields fade-up">
                        <div className="login-field">
                          <label
                            className="login-label"
                            htmlFor="register-telephone"
                          >
                            Téléphone professionnel *
                          </label>
                          <div className="login-input-wrap">
                            <span className="login-input-icon">📞</span>
                            <input
                              id="register-telephone"
                              type="tel"
                              className="login-input"
                              placeholder="+687 XX XX XX"
                              value={telephone}
                              onChange={(e) => setTelephone(e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        <div className="login-field">
                          <label
                            className="login-label"
                            htmlFor="register-ridet"
                          >
                            RIDET *
                          </label>
                          <div className="login-input-wrap">
                            <span className="login-input-icon">🏢</span>
                            <input
                              id="register-ridet"
                              type="text"
                              className="login-input"
                              placeholder="Ex : 1234567-001"
                              value={ridet}
                              onChange={(e) => setRidet(e.target.value)}
                              required
                            />
                          </div>
                          <p className="login-help">
                            Registre de l'Industrie, du Commerce et des Métiers
                            (Nouvelle-Calédonie)
                          </p>
                        </div>

                        <div className="login-info">
                          ℹ️ Votre compte sera activé après validation par un
                          administrateur. Vous recevrez un email de
                          confirmation.
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="login-btn"
                      disabled={loading}
                    >
                      {loading && <span className="login-spinner" />}
                      {loading ? "Création..." : "Créer mon compte →"}
                    </button>
                  </form>
                </>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
};

export default LoginScreen;

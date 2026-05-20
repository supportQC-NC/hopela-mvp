// backend/emails/templates/welcomeEmail.js
const generateWelcomeEmail = ({ nom, prenom, email, password, role }) => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Bienvenue sur Hopela</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      background-color: #f4f7f9;
      font-family: 'DM Sans', 'Inter', Arial, sans-serif;
      color: #102a43;
      padding: 40px 16px;
      -webkit-font-smoothing: antialiased;
    }

    .wrapper {
      max-width: 600px;
      margin: 0 auto;
    }

    /* ── PRE-HEADER ── */
    .pre-header {
      text-align: center;
      margin-bottom: 16px;
    }
    .pre-header span {
      font-size: 10px;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #5b7083;
      font-weight: 700;
    }

    /* ── HEADER ── */
    .header {
      background: #102a43;
      border-radius: 20px 20px 0 0;
      padding: 52px 48px 48px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .header-glow {
      position: absolute;
      inset: 0;
      background-image:
        radial-gradient(ellipse at 20% 50%, rgba(0,166,178,0.13) 0%, transparent 60%),
        radial-gradient(ellipse at 80% 20%, rgba(0,166,178,0.08) 0%, transparent 50%);
      pointer-events: none;
    }

    .logo-wrap {
      position: relative;
      z-index: 1;
      margin-bottom: 28px;
    }
    .logo-ring {
      display: inline-block;
      width: 72px;
      height: 72px;
      border-radius: 50%;
      border: 1.5px solid rgba(0,166,178,0.35);
      padding: 4px;
    }
    .logo-inner {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: linear-gradient(135deg, #00a6b2, #007b87);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      font-weight: 900;
      color: #ffffff;
      letter-spacing: -0.02em;
    }

    .header-eyebrow {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 16px;
    }
    .eyebrow-line {
      width: 28px;
      height: 1px;
      background: rgba(0,166,178,0.35);
    }
    .eyebrow-text {
      font-size: 10px;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #00a6b2;
      font-weight: 700;
    }

    .header h1 {
      font-size: 36px;
      font-weight: 900;
      color: #ffffff;
      letter-spacing: -0.04em;
      line-height: 1.1;
      position: relative;
      z-index: 1;
      margin-bottom: 12px;
    }
    .header h1 em {
      font-style: italic;
      color: #00a6b2;
    }
    .header-sub {
      font-size: 13px;
      color: rgba(255,255,255,0.45);
      line-height: 1.75;
      font-weight: 400;
      position: relative;
      z-index: 1;
    }

    /* ── ACCENT BAR ── */
    .accent-bar {
      height: 3px;
      background: linear-gradient(90deg, #102a43, #00a6b2 40%, rgba(0,166,178,0.3) 100%);
    }

    /* ── BODY ── */
    .body {
      background: #ffffff;
      padding: 44px 44px 40px;
      border-left: 1px solid rgba(16,42,67,0.09);
      border-right: 1px solid rgba(16,42,67,0.09);
    }

    .greeting {
      font-size: 22px;
      font-weight: 900;
      color: #102a43;
      letter-spacing: -0.03em;
      margin-bottom: 10px;
    }
    .greeting em {
      font-style: italic;
      color: #00a6b2;
    }

    .intro {
      font-size: 13px;
      color: #5b7083;
      line-height: 1.85;
      margin-bottom: 36px;
      font-weight: 400;
    }

    /* ── SECTION LABEL ── */
    .section-label {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }
    .section-label-text {
      font-size: 10px;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      color: #5b7083;
      font-weight: 700;
      white-space: nowrap;
    }
    .section-label-line {
      flex: 1;
      height: 1px;
      background: rgba(16,42,67,0.09);
    }

    /* ── CREDENTIALS CARD ── */
    .card {
      border: 1px solid rgba(16,42,67,0.09);
      border-radius: 16px;
      overflow: hidden;
      margin-bottom: 24px;
      background: #ffffff;
      box-shadow: 0 2px 10px rgba(16,42,67,0.05);
    }
    .card-header {
      padding: 14px 22px;
      background: #102a43;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .card-header-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #00a6b2;
    }
    .card-header-label {
      font-size: 11px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: rgba(255,255,255,0.45);
      font-weight: 700;
    }

    .credential-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 22px;
      border-bottom: 1px solid rgba(16,42,67,0.06);
      gap: 16px;
    }
    .credential-row:last-child { border-bottom: none; }

    .cred-left {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }
    .cred-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: rgba(0,166,178,0.08);
      border: 1px solid rgba(0,166,178,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
    }
    .cred-label {
      font-size: 12px;
      color: #5b7083;
      font-weight: 600;
    }
    .cred-value {
      font-size: 13px;
      font-weight: 700;
      color: #102a43;
      text-align: right;
      word-break: break-all;
    }
    .cred-value.password-val {
      font-family: 'Courier New', monospace;
      background: #102a43;
      color: #00a6b2;
      padding: 7px 14px;
      border-radius: 8px;
      font-size: 14px;
      letter-spacing: 2px;
      font-weight: 700;
    }

    /* ── ROLE BADGES ── */
    .role-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .role-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
    }
    .role-admin {
      background: rgba(0,166,178,0.10);
      color: #00a6b2;
      border: 1px solid rgba(0,166,178,0.22);
    }
    .role-admin .role-dot { background: #00a6b2; }

    .role-user {
      background: rgba(16,42,67,0.07);
      color: #5b7083;
      border: 1px solid rgba(16,42,67,0.12);
    }
    .role-user .role-dot { background: #5b7083; }

    .role-prestataire {
      background: rgba(34,197,94,0.08);
      color: #16a34a;
      border: 1px solid rgba(34,197,94,0.2);
    }
    .role-prestataire .role-dot { background: #22c55e; }

    /* ── WARNING ── */
    .warning {
      display: flex;
      gap: 14px;
      align-items: flex-start;
      background: #fffbeb;
      border: 1px solid rgba(245,158,11,0.2);
      border-left: 3px solid #f59e0b;
      border-radius: 12px;
      padding: 16px 18px;
      margin-bottom: 32px;
    }
    .warning-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
    .warning p { font-size: 13px; color: #92400e; line-height: 1.7; }
    .warning strong { font-weight: 700; color: #78350f; }

    /* ── CTA BUTTON ── */
    .btn-wrap { text-align: center; }
    .btn {
      display: inline-block;
      background: #00a6b2;
      color: #ffffff !important;
      text-decoration: none;
      font-family: 'DM Sans', Arial, sans-serif;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.04em;
      padding: 14px 44px;
      border-radius: 10px;
      box-shadow: 0 4px 18px rgba(0,166,178,0.28);
    }

    /* ── FOOTER ── */
    .footer {
      background: #102a43;
      border-radius: 0 0 20px 20px;
      padding: 28px 44px;
      text-align: center;
    }
    .footer-logo {
      font-size: 20px;
      font-weight: 900;
      color: #00a6b2;
      letter-spacing: -0.03em;
      margin-bottom: 10px;
    }
    .footer p {
      font-size: 11px;
      color: rgba(255,255,255,0.25);
      line-height: 1.8;
      font-weight: 400;
    }
    .footer strong { color: rgba(255,255,255,0.45); }

    /* ── RESPONSIVE ── */
    @media (max-width: 480px) {
      .header  { padding: 40px 24px 36px; }
      .body    { padding: 32px 20px 28px; }
      .footer  { padding: 24px 20px; }
      .header h1 { font-size: 28px; }
      .credential-row { flex-direction: column; align-items: flex-start; gap: 8px; }
      .cred-value { text-align: left; }
    }
  </style>
</head>
<body>
  <div class="wrapper">

    <div class="pre-header">
      <span>Notification de création de compte</span>
    </div>

    <!-- HEADER -->
    <div class="header">
      <div class="header-glow"></div>
      <div class="logo-wrap">
        <div class="logo-ring">
          <div class="logo-inner">H</div>
        </div>
      </div>
      <div class="header-eyebrow">
        <div class="eyebrow-line"></div>
        <span class="eyebrow-text">Nouveau compte</span>
        <div class="eyebrow-line"></div>
      </div>
      <h1>Bienvenue sur<br/><em>Hopela</em></h1>
      <p class="header-sub">
        Votre accès vient d'être créé par un administrateur.<br/>
        Retrouvez vos identifiants ci-dessous.
      </p>
    </div>

    <div class="accent-bar"></div>

    <!-- BODY -->
    <div class="body">

      <p class="greeting">Bonjour <em>${prenom} ${nom}</em>,</p>
      <p class="intro">
        Votre compte Hopela a été configuré avec succès. Vous pouvez dès maintenant
        accéder à la plateforme en utilisant les identifiants ci-dessous. Pour votre
        sécurité, nous vous recommandons de modifier votre mot de passe dès votre
        première connexion.
      </p>

      <!-- Section label -->
      <div class="section-label">
        <span class="section-label-text">Identifiants de connexion</span>
        <div class="section-label-line"></div>
      </div>

      <!-- Credentials card -->
      <div class="card">
        <div class="card-header">
          <div class="card-header-dot"></div>
          <span class="card-header-label">Informations du compte</span>
        </div>

        <div class="credential-row">
          <div class="cred-left">
            <div class="cred-icon">👤</div>
            <span class="cred-label">Nom complet</span>
          </div>
          <span class="cred-value">${prenom} ${nom}</span>
        </div>

        <div class="credential-row">
          <div class="cred-left">
            <div class="cred-icon">✉️</div>
            <span class="cred-label">Adresse email</span>
          </div>
          <span class="cred-value">${email}</span>
        </div>

        <div class="credential-row">
          <div class="cred-left">
            <div class="cred-icon">🔑</div>
            <span class="cred-label">Mot de passe</span>
          </div>
          <span class="cred-value password-val">${password}</span>
        </div>

        <div class="credential-row">
          <div class="cred-left">
            <div class="cred-icon">🛡️</div>
            <span class="cred-label">Rôle attribué</span>
          </div>
          <span class="role-badge ${
            role === 'admin'
              ? 'role-admin'
              : role === 'prestataire'
              ? 'role-prestataire'
              : 'role-user'
          }">
            <span class="role-dot"></span>
            ${
              role === 'admin'
                ? 'Administrateur'
                : role === 'prestataire'
                ? 'Prestataire'
                : 'Utilisateur'
            }
          </span>
        </div>
      </div>

      <!-- Warning -->
      <div class="warning">
        <span class="warning-icon">⚠️</span>
        <p>
          <strong>Modifiez votre mot de passe</strong> dès votre première connexion.
          Ne partagez jamais ces informations avec qui que ce soit.
        </p>
      </div>

      <!-- CTA -->
      <div class="btn-wrap">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="btn">
          Accéder à Hopela →
        </a>
      </div>

    </div>

    <!-- FOOTER -->
    <div class="footer">
      <div class="footer-logo">Hopela</div>
      <p>
        Cet email a été envoyé automatiquement suite à la création de votre compte.<br/>
        <strong>Ne répondez pas à cet email.</strong>
      </p>
    </div>

  </div>
</body>
</html>
`;

export default generateWelcomeEmail;

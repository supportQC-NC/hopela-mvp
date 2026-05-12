const generateWelcomeEmail = ({ nom, prenom, email, password, role }) => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Bienvenue sur Hopela</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Mulish:wght@300;400;500;600&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background-color: #f5f0eb;
      font-family: 'Mulish', sans-serif;
      color: #2c2416;
      padding: 48px 16px;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper { max-width: 600px; margin: 0 auto; }

    /* PRE-HEADER */
    .pre-header {
      text-align: center;
      margin-bottom: 20px;
    }
    .pre-header span {
      font-size: 10px;
      letter-spacing: 4px;
      text-transform: uppercase;
      color: #a89070;
      font-family: 'Mulish', sans-serif;
      font-weight: 600;
    }

    /* HEADER */
    .header {
      background: #1c1409;
      border-radius: 20px 20px 0 0;
      padding: 56px 48px 52px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .header-texture {
      position: absolute;
      inset: 0;
      background-image:
        radial-gradient(ellipse at 20% 50%, rgba(212,166,100,0.12) 0%, transparent 60%),
        radial-gradient(ellipse at 80% 20%, rgba(212,166,100,0.08) 0%, transparent 50%);
      pointer-events: none;
    }
    .logo-wrap {
      position: relative;
      z-index: 1;
      margin-bottom: 32px;
    }
    .logo-ring {
      display: inline-block;
      width: 76px;
      height: 76px;
      border-radius: 50%;
      border: 1.5px solid rgba(212,166,100,0.4);
      padding: 4px;
    }
    .logo-inner {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: linear-gradient(145deg, #d4a664, #a07040);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      font-weight: 900;
      color: #1c1409;
      letter-spacing: -1px;
    }
    .header-eyebrow {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 18px;
    }
    .eyebrow-line {
      width: 32px;
      height: 1px;
      background: rgba(212,166,100,0.4);
    }
    .eyebrow-text {
      font-size: 10px;
      letter-spacing: 3.5px;
      text-transform: uppercase;
      color: #d4a664;
      font-weight: 600;
    }
    .header h1 {
      font-family: 'Playfair Display', serif;
      font-size: 36px;
      font-weight: 900;
      color: #f5f0eb;
      letter-spacing: -0.5px;
      line-height: 1.15;
      position: relative;
      z-index: 1;
      margin-bottom: 14px;
    }
    .header h1 em {
      font-style: italic;
      color: #d4a664;
    }
    .header-sub {
      font-size: 14px;
      color: #7a6a54;
      line-height: 1.7;
      font-weight: 300;
      position: relative;
      z-index: 1;
    }

    /* DIVIDER */
    .divider {
      height: 3px;
      background: linear-gradient(90deg, #1c1409, #d4a664 40%, #c8965a 60%, #1c1409);
    }

    /* BODY */
    .body {
      background: #faf7f3;
      padding: 48px 48px 40px;
      border-left: 1px solid #e8dfd4;
      border-right: 1px solid #e8dfd4;
    }
    .greeting {
      font-family: 'Playfair Display', serif;
      font-size: 24px;
      font-weight: 700;
      color: #1c1409;
      margin-bottom: 12px;
    }
    .intro {
      font-size: 14px;
      color: #6b5d4a;
      line-height: 1.85;
      margin-bottom: 40px;
      font-weight: 300;
    }

    /* SECTION LABEL */
    .section-label {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 20px;
    }
    .section-label span {
      font-size: 10px;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #a89070;
      font-weight: 600;
      white-space: nowrap;
    }
    .section-label::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #e0d5c5;
    }

    /* CARD */
    .card {
      border: 1px solid #e0d5c5;
      border-radius: 16px;
      overflow: hidden;
      margin-bottom: 28px;
      background: #fff;
    }
    .card-header {
      padding: 16px 24px;
      background: #1c1409;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .card-header-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #d4a664;
    }
    .card-header span {
      font-size: 11px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #a89070;
      font-weight: 600;
    }
    .credential-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 24px;
      border-bottom: 1px solid #f0e8dc;
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
      background: #f5f0eb;
      border: 1px solid #e0d5c5;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
    }
    .cred-label {
      font-size: 12px;
      color: #a89070;
      font-weight: 500;
    }
    .cred-value {
      font-size: 14px;
      font-weight: 600;
      color: #2c2416;
      text-align: right;
      word-break: break-all;
    }
    .cred-value.password-val {
      font-family: 'Courier New', monospace;
      background: #1c1409;
      color: #d4a664;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 15px;
      letter-spacing: 2px;
      font-weight: 700;
    }
    .role-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .role-dot { width: 5px; height: 5px; border-radius: 50%; }
    .role-admin {
      background: rgba(212,166,100,0.12);
      color: #a07040;
      border: 1px solid rgba(212,166,100,0.3);
    }
    .role-admin .role-dot { background: #d4a664; }
    .role-user {
      background: rgba(44,36,22,0.07);
      color: #6b5d4a;
      border: 1px solid rgba(44,36,22,0.15);
    }
    .role-user .role-dot { background: #6b5d4a; }
    .role-prestataire {
      background: rgba(100,140,100,0.1);
      color: #4a7050;
      border: 1px solid rgba(100,140,100,0.25);
    }
    .role-prestataire .role-dot { background: #4a7050; }

    /* WARNING */
    .warning {
      display: flex;
      gap: 14px;
      align-items: flex-start;
      background: #fffbf5;
      border: 1px solid #e8d5b0;
      border-left: 3px solid #d4a664;
      border-radius: 12px;
      padding: 18px 20px;
      margin-bottom: 36px;
    }
    .warning-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
    .warning p { font-size: 13px; color: #7a6040; line-height: 1.7; }
    .warning strong { font-weight: 600; color: #5a4020; }

    /* BUTTON */
    .btn-wrap { text-align: center; }
    .btn {
      display: inline-block;
      background: #1c1409;
      color: #f5f0eb !important;
      text-decoration: none;
      font-family: 'Mulish', sans-serif;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      padding: 18px 52px;
      border-radius: 4px;
      border-bottom: 2px solid #d4a664;
    }

    /* FOOTER */
    .footer {
      background: #1c1409;
      border-radius: 0 0 20px 20px;
      padding: 32px 48px;
      text-align: center;
    }
    .footer-logo {
      font-family: 'Playfair Display', serif;
      font-size: 20px;
      font-weight: 900;
      color: #d4a664;
      letter-spacing: 1px;
      margin-bottom: 12px;
    }
    .footer p {
      font-size: 12px;
      color: #4a3c28;
      line-height: 1.8;
      font-weight: 300;
    }
    .footer strong { color: #7a6a54; }
  </style>
</head>
<body>
  <div class="wrapper">

    <div class="pre-header">
      <span>Notification de création de compte</span>
    </div>

    <div class="header">
      <div class="header-texture"></div>
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
      <p class="header-sub">Votre accès vient d'être créé par un administrateur.<br/>Retrouvez vos identifiants ci-dessous.</p>
    </div>

    <div class="divider"></div>

    <div class="body">
      <p class="greeting">Bonjour ${prenom} ${nom},</p>
      <p class="intro">
        Votre compte Hopela a été configuré avec succès. Vous pouvez dès maintenant
        accéder à la plateforme en utilisant les identifiants ci-dessous. Pour votre
        sécurité, nous vous recommandons de modifier votre mot de passe dès votre
        première connexion.
      </p>

      <div class="section-label"><span>Identifiants de connexion</span></div>

      <div class="card">
        <div class="card-header">
          <div class="card-header-dot"></div>
          <span>Informations du compte</span>
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

      <div class="warning">
        <span class="warning-icon">⚠️</span>
        <p><strong>Modifiez votre mot de passe</strong> dès votre première connexion. Ne partagez jamais ces informations avec qui que ce soit.</p>
      </div>

      <div class="btn-wrap">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="btn">
          Accéder à Hopela →
        </a>
      </div>
    </div>

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
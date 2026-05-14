// backend/emails/templates/resetEmail.js
const generateResetEmail = ({ prenom, nom, resetUrl }) => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Réinitialisation de votre mot de passe</title>
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

    .pre-header { text-align: center; margin-bottom: 20px; }
    .pre-header span {
      font-size: 10px; letter-spacing: 4px; text-transform: uppercase;
      color: #a89070; font-family: 'Mulish', sans-serif; font-weight: 600;
    }

    .header {
      background: #1c1409; border-radius: 20px 20px 0 0;
      padding: 56px 48px 52px; text-align: center;
      position: relative; overflow: hidden;
    }
    .header-texture {
      position: absolute; inset: 0;
      background-image:
        radial-gradient(ellipse at 20% 50%, rgba(212,166,100,0.12) 0%, transparent 60%),
        radial-gradient(ellipse at 80% 20%, rgba(212,166,100,0.08) 0%, transparent 50%);
      pointer-events: none;
    }
    .logo-wrap { position: relative; z-index: 1; margin-bottom: 32px; }
    .logo-ring {
      display: inline-block; width: 76px; height: 76px; border-radius: 50%;
      border: 1.5px solid rgba(212,166,100,0.4); padding: 4px;
    }
    .logo-inner {
      width: 100%; height: 100%; border-radius: 50%;
      background: linear-gradient(145deg, #d4a664, #a07040);
      display: flex; align-items: center; justify-content: center;
      font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 900;
      color: #1c1409; letter-spacing: -1px;
    }
    .header-eyebrow {
      position: relative; z-index: 1;
      display: flex; align-items: center; justify-content: center;
      gap: 12px; margin-bottom: 18px;
    }
    .eyebrow-line { width: 32px; height: 1px; background: rgba(212,166,100,0.4); }
    .eyebrow-text {
      font-size: 10px; letter-spacing: 3.5px; text-transform: uppercase;
      color: #d4a664; font-weight: 600;
    }
    .header h1 {
      font-family: 'Playfair Display', serif; font-size: 34px; font-weight: 900;
      color: #f5f0eb; letter-spacing: -0.5px; line-height: 1.15;
      position: relative; z-index: 1; margin-bottom: 14px;
    }
    .header h1 em { font-style: italic; color: #d4a664; }
    .header-sub {
      font-size: 14px; color: #7a6a54; line-height: 1.7; font-weight: 300;
      position: relative; z-index: 1;
    }

    .divider {
      height: 3px;
      background: linear-gradient(90deg, #1c1409, #d4a664 40%, #c8965a 60%, #1c1409);
    }

    .body {
      background: #faf7f3; padding: 48px 48px 40px;
      border-left: 1px solid #e8dfd4; border-right: 1px solid #e8dfd4;
    }
    .greeting {
      font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 700;
      color: #1c1409; margin-bottom: 12px;
    }
    .intro {
      font-size: 14px; color: #6b5d4a; line-height: 1.85;
      margin-bottom: 36px; font-weight: 300;
    }

    /* Bloc bouton principal */
    .cta-block {
      background: #1c1409; border-radius: 16px; padding: 36px 32px;
      text-align: center; margin-bottom: 32px;
    }
    .cta-label {
      font-size: 10px; letter-spacing: 3px; text-transform: uppercase;
      color: #7a6a54; font-weight: 600; margin-bottom: 20px;
      display: flex; align-items: center; justify-content: center; gap: 12px;
    }
    .cta-label::before, .cta-label::after {
      content: ''; flex: 1; height: 1px; background: rgba(212,166,100,0.2); max-width: 40px;
    }
    .cta-btn {
      display: inline-block; background: linear-gradient(135deg, #d4a664, #c8965a);
      color: #1c1409 !important; text-decoration: none;
      font-family: 'Mulish', sans-serif; font-size: 13px; font-weight: 800;
      letter-spacing: 2px; text-transform: uppercase;
      padding: 18px 52px; border-radius: 4px;
      box-shadow: 0 4px 20px rgba(212,166,100,0.3);
    }
    .cta-expire {
      margin-top: 16px; font-size: 12px; color: #7a6a54;
    }

    /* Lien alternatif */
    .link-block {
      background: #f0ebe3; border: 1px solid #e0d5c5; border-radius: 12px;
      padding: 16px 20px; margin-bottom: 32px;
    }
    .link-label {
      font-size: 11px; color: #a89070; font-weight: 600;
      text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;
    }
    .link-url {
      font-size: 11px; color: #6b5d4a; word-break: break-all;
      font-family: 'Courier New', monospace; line-height: 1.6;
    }

    /* Warning */
    .warning {
      display: flex; gap: 14px; align-items: flex-start;
      background: #fffbf5; border: 1px solid #e8d5b0;
      border-left: 3px solid #d4a664; border-radius: 12px;
      padding: 18px 20px; margin-bottom: 0;
    }
    .warning-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
    .warning p { font-size: 13px; color: #7a6040; line-height: 1.7; }
    .warning strong { font-weight: 600; color: #5a4020; }

    .footer {
      background: #1c1409; border-radius: 0 0 20px 20px;
      padding: 32px 48px; text-align: center;
    }
    .footer-logo {
      font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 900;
      color: #d4a664; letter-spacing: 1px; margin-bottom: 12px;
    }
    .footer p { font-size: 12px; color: #4a3c28; line-height: 1.8; font-weight: 300; }
    .footer strong { color: #7a6a54; }
  </style>
</head>
<body>
  <div class="wrapper">

    <div class="pre-header">
      <span>Réinitialisation de mot de passe</span>
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
        <span class="eyebrow-text">Sécurité du compte</span>
        <div class="eyebrow-line"></div>
      </div>
      <h1>Réinitialiser votre<br/><em>mot de passe</em></h1>
      <p class="header-sub">
        Une demande de réinitialisation a été effectuée.<br/>
        Ce lien est valable pendant <strong style="color:#d4a664">30 minutes</strong>.
      </p>
    </div>

    <div class="divider"></div>

    <div class="body">
      <p class="greeting">Bonjour ${prenom} ${nom},</p>
      <p class="intro">
        Nous avons reçu une demande de réinitialisation du mot de passe associé à votre
        compte Hopela. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
        Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email —
        votre compte reste sécurisé.
      </p>

      <div class="cta-block">
        <div class="cta-label">Lien de réinitialisation</div>
        <a href="${resetUrl}" class="cta-btn">
          Réinitialiser mon mot de passe →
        </a>
        <p class="cta-expire">Ce lien expire dans 30 minutes.</p>
      </div>

      <div class="link-block">
        <div class="link-label">Ou copiez ce lien dans votre navigateur</div>
        <div class="link-url">${resetUrl}</div>
      </div>

      <div class="warning">
        <span class="warning-icon">🔒</span>
        <p>
          <strong>Vous n'avez pas fait cette demande ?</strong> Ignorez cet email.
          Votre mot de passe ne sera pas modifié. Si vous recevez cet email régulièrement
          sans l'avoir demandé, contactez notre support.
        </p>
      </div>
    </div>

    <div class="footer">
      <div class="footer-logo">Hopela</div>
      <p>
        Cet email a été envoyé automatiquement suite à une demande de réinitialisation.<br/>
        <strong>Ne répondez pas à cet email.</strong>
      </p>
    </div>

  </div>
</body>
</html>
`;

export default generateResetEmail;
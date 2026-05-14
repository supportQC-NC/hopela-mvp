// backend/emails/templates/validationEmail.js
const generateValidationEmail = ({ prenom, nom, loginUrl }) => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Compte validé — Hopela</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Mulish:wght@300;400;500;600&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    body { background:#f5f0eb; font-family:'Mulish',sans-serif; color:#2c2416; padding:48px 16px; }
    .wrapper { max-width:600px; margin:0 auto; }
    .pre-header { text-align:center; margin-bottom:20px; }
    .pre-header span { font-size:10px; letter-spacing:4px; text-transform:uppercase; color:#a89070; font-weight:600; }
    .header { background:#1c1409; border-radius:20px 20px 0 0; padding:56px 48px 52px; text-align:center; position:relative; overflow:hidden; }
    .header-texture { position:absolute; inset:0; background-image:radial-gradient(ellipse at 20% 50%,rgba(212,166,100,0.12) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(212,166,100,0.08) 0%,transparent 50%); pointer-events:none; }
    .logo-wrap { position:relative; z-index:1; margin-bottom:32px; }
    .logo-ring { display:inline-block; width:76px; height:76px; border-radius:50%; border:1.5px solid rgba(212,166,100,0.4); padding:4px; }
    .logo-inner { width:100%; height:100%; border-radius:50%; background:linear-gradient(145deg,#d4a664,#a07040); display:flex; align-items:center; justify-content:center; font-family:'Playfair Display',serif; font-size:28px; font-weight:900; color:#1c1409; }
    .eyebrow { position:relative; z-index:1; display:flex; align-items:center; justify-content:center; gap:12px; margin-bottom:18px; }
    .eyebrow-line { width:32px; height:1px; background:rgba(212,166,100,0.4); }
    .eyebrow-text { font-size:10px; letter-spacing:3.5px; text-transform:uppercase; color:#d4a664; font-weight:600; }
    .header h1 { font-family:'Playfair Display',serif; font-size:34px; font-weight:900; color:#f5f0eb; letter-spacing:-0.5px; line-height:1.15; position:relative; z-index:1; margin-bottom:14px; }
    .header h1 em { font-style:italic; color:#d4a664; }
    .header-sub { font-size:14px; color:#7a6a54; line-height:1.7; font-weight:300; position:relative; z-index:1; }
    .divider { height:3px; background:linear-gradient(90deg,#1c1409,#d4a664 40%,#c8965a 60%,#1c1409); }
    .body { background:#faf7f3; padding:48px; border-left:1px solid #e8dfd4; border-right:1px solid #e8dfd4; }
    .greeting { font-family:'Playfair Display',serif; font-size:24px; font-weight:700; color:#1c1409; margin-bottom:12px; }
    .intro { font-size:14px; color:#6b5d4a; line-height:1.85; margin-bottom:36px; font-weight:300; }
    .check-block { text-align:center; margin-bottom:32px; }
    .check-icon { font-size:56px; margin-bottom:16px; }
    .cta-block { background:#1c1409; border-radius:16px; padding:32px; text-align:center; margin-bottom:32px; }
    .cta-label { font-size:10px; letter-spacing:3px; text-transform:uppercase; color:#7a6a54; font-weight:600; margin-bottom:20px; }
    .cta-btn { display:inline-block; background:linear-gradient(135deg,#d4a664,#c8965a); color:#1c1409 !important; text-decoration:none; font-family:'Mulish',sans-serif; font-size:13px; font-weight:800; letter-spacing:2px; text-transform:uppercase; padding:18px 52px; border-radius:4px; }
    .footer { background:#1c1409; border-radius:0 0 20px 20px; padding:32px 48px; text-align:center; }
    .footer-logo { font-family:'Playfair Display',serif; font-size:20px; font-weight:900; color:#d4a664; letter-spacing:1px; margin-bottom:12px; }
    .footer p { font-size:12px; color:#4a3c28; line-height:1.8; font-weight:300; }
    .footer strong { color:#7a6a54; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="pre-header"><span>Validation de compte prestataire</span></div>
    <div class="header">
      <div class="header-texture"></div>
      <div class="logo-wrap"><div class="logo-ring"><div class="logo-inner">H</div></div></div>
      <div class="eyebrow"><div class="eyebrow-line"></div><span class="eyebrow-text">Bonne nouvelle</span><div class="eyebrow-line"></div></div>
      <h1>Votre compte est<br/><em>validé !</em></h1>
      <p class="header-sub">Vous pouvez maintenant accéder à votre espace prestataire Hopela.</p>
    </div>
    <div class="divider"></div>
    <div class="body">
      <p class="greeting">Bonjour ${prenom} ${nom},</p>
      <p class="intro">
        Votre compte prestataire vient d'être validé par notre équipe. Vous avez maintenant
        accès à l'ensemble de votre espace : gestion de votre disponibilité, partage de
        position en temps réel, et visibilité auprès des clients près de vous.
      </p>
      <div class="check-block"><div class="check-icon">✅</div></div>
      <div class="cta-block">
        <div class="cta-label">Accéder à mon espace</div>
        <a href="${loginUrl}" class="cta-btn">Se connecter →</a>
      </div>
    </div>
    <div class="footer">
      <div class="footer-logo">Hopela</div>
      <p>Bienvenue dans la communauté des prestataires Hopela.<br/><strong>L'équipe Hopela</strong></p>
    </div>
  </div>
</body>
</html>
`;

export default generateValidationEmail;
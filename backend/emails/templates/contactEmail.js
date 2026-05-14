// backend/emails/templates/contactEmail.js
// Email accusé de réception envoyé au visiteur après soumission du formulaire
const generateContactEmail = ({ nom, sujet, message }) => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Votre message a bien été reçu — Hopela</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{background:#f5f0eb;font-family:'Helvetica Neue',Arial,sans-serif;color:#2c2416;padding:40px 16px;}
    .wrap{max-width:580px;margin:0 auto;}
    .header{background:#1c1409;border-radius:16px 16px 0 0;padding:48px 40px;text-align:center;}
    .logo-ring{display:inline-block;width:64px;height:64px;border-radius:50%;border:1.5px solid rgba(212,166,100,0.4);padding:4px;margin-bottom:24px;}
    .logo-inner{width:100%;height:100%;border-radius:50%;background:linear-gradient(145deg,#d4a664,#a07040);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:900;color:#1c1409;font-family:Georgia,serif;}
    .header h1{font-family:Georgia,serif;font-size:28px;font-weight:700;color:#f5f0eb;margin-bottom:10px;}
    .header h1 em{font-style:italic;color:#d4a664;}
    .header p{font-size:13px;color:#7a6a54;}
    .divider{height:3px;background:linear-gradient(90deg,#1c1409,#d4a664 40%,#c8965a 60%,#1c1409);}
    .body{background:#faf7f3;padding:40px;border:1px solid #e8dfd4;border-top:none;}
    .greeting{font-family:Georgia,serif;font-size:20px;color:#1c1409;margin-bottom:14px;}
    .text{font-size:13px;color:#6b5d4a;line-height:1.8;margin-bottom:20px;}
    .recap{background:#f0ebe3;border:1px solid #e0d5c5;border-left:3px solid #d4a664;border-radius:10px;padding:18px;margin-bottom:24px;}
    .recap-label{font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#a89070;margin-bottom:8px;}
    .recap-sujet{font-size:14px;font-weight:600;color:#2c2416;margin-bottom:8px;}
    .recap-msg{font-size:12px;color:#7a6a54;line-height:1.7;white-space:pre-wrap;}
    .footer{background:#1c1409;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;}
    .footer p{font-size:11px;color:#4a3c28;line-height:1.8;}
    .footer strong{color:#7a6a54;}
  </style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <div class="logo-ring"><div class="logo-inner">H</div></div>
    <h1>Message bien <em>reçu !</em></h1>
    <p>Nous vous répondrons dans les meilleurs délais.</p>
  </div>
  <div class="divider"></div>
  <div class="body">
    <p class="greeting">Bonjour ${nom},</p>
    <p class="text">Votre message a bien été reçu par l'équipe Hopela. Nous vous répondrons à cette adresse email dans les meilleurs délais (généralement sous 24-48h).</p>
    <div class="recap">
      <div class="recap-label">Votre message</div>
      <div class="recap-sujet">Sujet : ${sujet}</div>
      <div class="recap-msg">${message}</div>
    </div>
    <p class="text" style="font-size:12px;color:#9a8a78;">Si vous n'avez pas envoyé ce message, ignorez cet email.</p>
  </div>
  <div class="footer">
    <p><strong>Hopela</strong> — La plateforme qui connecte les particuliers aux prestataires locaux en Nouvelle-Calédonie.</p>
  </div>
</div>
</body>
</html>
`;
export default generateContactEmail;
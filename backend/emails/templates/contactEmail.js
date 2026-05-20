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
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      background: #f4f7f9;
      font-family: "DM Sans", "Inter", "Helvetica Neue", Arial, sans-serif;
      color: #102a43;
      padding: 40px 16px;
    }

    .wrap {
      max-width: 580px;
      margin: 0 auto;
    }

    /* ── Header ── */
    .header {
      background: #102a43;
      border-radius: 16px 16px 0 0;
      padding: 48px 40px;
      text-align: center;
    }

    .logo-ring {
      display: inline-block;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      border: 1.5px solid rgba(0, 166, 178, 0.35);
      padding: 4px;
      margin-bottom: 24px;
    }

    .logo-inner {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: linear-gradient(135deg, #00a6b2, #007b87);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 900;
      color: #ffffff;
      font-family: "DM Sans", "Inter", Arial, sans-serif;
      letter-spacing: -0.02em;
    }

    .header h1 {
      font-size: 28px;
      font-weight: 900;
      color: #ffffff;
      letter-spacing: -0.04em;
      line-height: 1.1;
      margin-bottom: 10px;
    }

    .header h1 em {
      font-style: italic;
      color: #00a6b2;
    }

    .header p {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.45);
      font-weight: 500;
    }

    /* ── Accent bar ── */
    .divider {
      height: 3px;
      background: linear-gradient(90deg, #00a6b2, rgba(0, 166, 178, 0.3));
    }

    /* ── Body ── */
    .body {
      background: #ffffff;
      padding: 40px;
      border: 1px solid rgba(16, 42, 67, 0.09);
      border-top: none;
    }

    .greeting {
      font-size: 20px;
      font-weight: 800;
      color: #102a43;
      letter-spacing: -0.02em;
      margin-bottom: 14px;
    }

    .text {
      font-size: 13px;
      color: #5b7083;
      line-height: 1.8;
      margin-bottom: 20px;
      font-weight: 400;
    }

    /* ── Recap card ── */
    .recap {
      background: rgba(0, 166, 178, 0.04);
      border: 1px solid rgba(0, 166, 178, 0.22);
      border-left: 3px solid #00a6b2;
      border-radius: 12px;
      padding: 18px 20px;
      margin-bottom: 24px;
    }

    .recap-label {
      font-size: 10px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-weight: 700;
      color: #00a6b2;
      margin-bottom: 10px;
    }

    .recap-sujet {
      font-size: 14px;
      font-weight: 700;
      color: #102a43;
      letter-spacing: -0.01em;
      margin-bottom: 10px;
    }

    .recap-msg {
      font-size: 12px;
      color: #5b7083;
      line-height: 1.75;
      white-space: pre-wrap;
    }

    /* ── Online badge style note ── */
    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 700;
      color: #16a34a;
      background: rgba(34, 197, 94, 0.08);
      border: 1px solid rgba(34, 197, 94, 0.2);
      border-radius: 20px;
      padding: 4px 12px;
      margin-bottom: 20px;
    }

    .status-dot {
      display: inline-block;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #22c55e;
    }

    /* ── Footer ── */
    .footer {
      background: #102a43;
      border-radius: 0 0 16px 16px;
      padding: 24px 40px;
      text-align: center;
      border: 1px solid rgba(16, 42, 67, 0.09);
      border-top: none;
    }

    .footer p {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.3);
      line-height: 1.8;
    }

    .footer strong {
      color: rgba(0, 166, 178, 0.8);
      font-weight: 700;
    }
  </style>
</head>
<body>
<div class="wrap">

  <div class="header">
    <div class="logo-ring">
      <div class="logo-inner">H</div>
    </div>
    <h1>Message bien <em>reçu !</em></h1>
    <p>Nous vous répondrons dans les meilleurs délais.</p>
  </div>

  <div class="divider"></div>

  <div class="body">
    <p class="greeting">Bonjour ${nom},</p>

    <span class="status-pill">
      <span class="status-dot"></span>
      Message enregistré
    </span>

    <p class="text">
      Votre message a bien été reçu par l'équipe Hopela. Nous vous répondrons
      à cette adresse email dans les meilleurs délais (généralement sous 24-48h).
    </p>

    <div class="recap">
      <div class="recap-label">Votre message</div>
      <div class="recap-sujet">Sujet : ${sujet}</div>
      <div class="recap-msg">${message}</div>
    </div>

    <p class="text" style="font-size:12px;color:rgba(16,42,67,0.4);">
      Si vous n'avez pas envoyé ce message, ignorez simplement cet email.
    </p>
  </div>

  <div class="footer">
    <p>
      <strong>Hopela</strong> — La plateforme qui connecte les particuliers
      aux prestataires locaux en Nouvelle-Calédonie.
    </p>
  </div>

</div>
</body>
</html>
`;

export default generateContactEmail;

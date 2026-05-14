// src/screens/public/legal/CookiesScreen.jsx
import LegalLayout from "./LegalLayout";

const CookiesScreen = () => (
  <LegalLayout eyebrow="Gestion des cookies" title={<>Politique de<br/><em>cookies</em></>} date="1er janvier 2025">

    <div className="legal-highlight">
      <p>Hopela utilise des cookies et technologies similaires pour assurer le fonctionnement de la plateforme. Cette page vous explique quels cookies nous utilisons, pourquoi, et comment les gérer.</p>
    </div>

    <div className="legal-section">
      <h2>1. Qu'est-ce qu'un cookie ?</h2>
      <p>Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, smartphone, tablette) lors de votre visite sur un site web. Il permet au site de mémoriser des informations sur votre visite, comme votre langue préférée et d'autres paramètres.</p>
    </div>

    <div className="legal-section">
      <h2>2. Cookies utilisés par Hopela</h2>
      <table className="legal-table">
        <thead>
          <tr><th>Cookie</th><th>Type</th><th>Durée</th><th>Finalité</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><code style={{color:"#c9a84c"}}>token</code></td>
            <td>Strictement nécessaire</td>
            <td>Session</td>
            <td>Authentification sécurisée (httpOnly, SameSite)</td>
          </tr>
          <tr>
            <td>LocalStorage Redux</td>
            <td>Fonctionnel</td>
            <td>Session navigateur</td>
            <td>Mémorisation des préférences utilisateur (rayon de recherche, état UI)</td>
          </tr>
        </tbody>
      </table>
      <p>Hopela <strong style={{color:"#f5f0e8"}}>n'utilise aucun cookie publicitaire</strong> ou de traçage tiers. Aucun cookie de réseaux sociaux ou d'outils analytiques tiers n'est déposé.</p>
    </div>

    <div className="legal-section">
      <h2>3. Cookies strictement nécessaires</h2>
      <p>Le cookie <code style={{color:"#c9a84c"}}>token</code> est indispensable au fonctionnement de la plateforme. Il permet de maintenir votre session de connexion sécurisée. Ce cookie ne peut pas être désactivé sans empêcher l'utilisation du service.</p>
      <p>Il est configuré avec les attributs de sécurité suivants :</p>
      <ul>
        <li><strong style={{color:"#f5f0e8"}}>HttpOnly</strong> : inaccessible depuis JavaScript (protection XSS)</li>
        <li><strong style={{color:"#f5f0e8"}}>SameSite</strong> : protection contre les attaques CSRF</li>
        <li><strong style={{color:"#f5f0e8"}}>Secure</strong> : transmis uniquement via HTTPS en production</li>
      </ul>
    </div>

    <div className="legal-section">
      <h2>4. Géolocalisation</h2>
      <p>La géolocalisation n'est pas un cookie mais une permission navigateur distincte. Hopela vous demande l'autorisation d'accéder à votre position GPS. Cette autorisation est :</p>
      <ul>
        <li>Demandée explicitement par le navigateur</li>
        <li>Révocable à tout moment depuis les paramètres de votre navigateur</li>
        <li>Utilisée uniquement pour afficher les prestataires à proximité</li>
        <li>Non partagée avec des tiers</li>
      </ul>
    </div>

    <div className="legal-section">
      <h2>5. Comment gérer les cookies</h2>
      <h3>Depuis votre navigateur</h3>
      <ul>
        <li><strong style={{color:"#f5f0e8"}}>Chrome :</strong> Paramètres → Confidentialité et sécurité → Cookies</li>
        <li><strong style={{color:"#f5f0e8"}}>Firefox :</strong> Paramètres → Vie privée et sécurité → Cookies</li>
        <li><strong style={{color:"#f5f0e8"}}>Safari :</strong> Préférences → Confidentialité → Cookies</li>
        <li><strong style={{color:"#f5f0e8"}}>Edge :</strong> Paramètres → Cookies et autorisations de site</li>
      </ul>
      <p style={{marginTop:12}}>Attention : la suppression du cookie <code style={{color:"#c9a84c"}}>token</code> vous déconnectera de la plateforme.</p>
    </div>

    <div className="legal-section">
      <h2>6. Mise à jour de la politique</h2>
      <p>Cette politique de cookies peut être mise à jour pour refléter les changements apportés aux cookies que nous utilisons ou pour d'autres raisons opérationnelles, légales ou réglementaires. Revisitez cette page régulièrement pour rester informé.</p>
    </div>

    <div className="legal-section">
      <h2>7. Contact</h2>
      <p>Pour toute question : <a href="mailto:infos@hopela.nc">infos@hopela.nc</a> ou via notre <a href="/contact">formulaire de contact</a>.</p>
    </div>

  </LegalLayout>
);

export default CookiesScreen;
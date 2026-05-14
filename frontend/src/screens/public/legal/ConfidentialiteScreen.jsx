// src/screens/public/legal/ConfidentialiteScreen.jsx
import LegalLayout from "./LegalLayout";

const ConfidentialiteScreen = () => (
  <LegalLayout eyebrow="Protection des données" title={<>Politique de<br/><em>confidentialité</em></>} date="1er janvier 2025">

    <div className="legal-highlight">
      <p>Hopela accorde une importance primordiale à la protection de vos données personnelles. Cette politique décrit comment nous collectons, utilisons et protégeons vos informations conformément au Règlement Général sur la Protection des Données (RGPD) et à la réglementation applicable en Nouvelle-Calédonie.</p>
    </div>

    <div className="legal-section">
      <h2>1. Responsable du traitement</h2>
      <p><strong style={{color:"#f5f0e8"}}>Hopela</strong><br />
      Email de contact DPO : <a href="mailto:infos@hopela.nc">infos@hopela.nc</a></p>
    </div>

    <div className="legal-section">
      <h2>2. Données collectées</h2>
      <h3>2.1 Données d'inscription</h3>
      <ul>
        <li>Nom, prénom, adresse email</li>
        <li>Mot de passe (stocké chiffré, jamais accessible en clair)</li>
        <li>Rôle (utilisateur ou prestataire)</li>
        <li>Pour les prestataires : numéro RIDET, téléphone professionnel</li>
      </ul>
      <h3>2.2 Données de géolocalisation</h3>
      <ul>
        <li><strong style={{color:"#f5f0e8"}}>Utilisateurs :</strong> position GPS utilisée uniquement pour filtrer les prestataires à proximité. Non stockée de manière permanente.</li>
        <li><strong style={{color:"#f5f0e8"}}>Prestataires :</strong> position partagée en temps réel uniquement lors de l'activation manuelle du partage. Stockée temporairement et mise à jour en continu.</li>
        <li><strong style={{color:"#f5f0e8"}}>Adresses enregistrées :</strong> les utilisateurs peuvent enregistrer jusqu'à 10 adresses nommées (coordonnées GPS + libellé).</li>
      </ul>
      <h3>2.3 Données de navigation</h3>
      <ul>
        <li>Cookies techniques nécessaires au fonctionnement (session, authentification)</li>
        <li>Logs de connexion (adresse IP, horodatage) pour des raisons de sécurité</li>
      </ul>
    </div>

    <div className="legal-section">
      <h2>3. Finalités et bases légales</h2>
      <table className="legal-table">
        <thead>
          <tr><th>Finalité</th><th>Base légale</th></tr>
        </thead>
        <tbody>
          <tr><td>Gestion des comptes utilisateurs</td><td>Exécution du contrat</td></tr>
          <tr><td>Géolocalisation en temps réel</td><td>Consentement explicite</td></tr>
          <tr><td>Mise en relation prestataires/utilisateurs</td><td>Exécution du contrat</td></tr>
          <tr><td>Envoi d'emails transactionnels</td><td>Exécution du contrat</td></tr>
          <tr><td>Sécurité et prévention des fraudes</td><td>Intérêt légitime</td></tr>
          <tr><td>Amélioration du service</td><td>Intérêt légitime</td></tr>
        </tbody>
      </table>
    </div>

    <div className="legal-section">
      <h2>4. Durée de conservation</h2>
      <ul>
        <li>Données de compte : durée de vie du compte + 3 ans après suppression</li>
        <li>Données de géolocalisation temps réel : non conservées au-delà de la session active</li>
        <li>Adresses enregistrées : jusqu'à suppression par l'utilisateur</li>
        <li>Logs de sécurité : 12 mois</li>
        <li>Messages de contact : 3 ans</li>
      </ul>
    </div>

    <div className="legal-section">
      <h2>5. Partage des données</h2>
      <p>Hopela ne vend ni ne loue vos données personnelles à des tiers. Les données peuvent être partagées avec :</p>
      <ul>
        <li><strong style={{color:"#f5f0e8"}}>Hostinger</strong> : hébergement des données (serveurs en Europe)</li>
        <li><strong style={{color:"#f5f0e8"}}>MongoDB Atlas</strong> : base de données (chiffrée au repos)</li>
        <li><strong style={{color:"#f5f0e8"}}>Mapbox</strong> : affichage cartographique (données de carte uniquement)</li>
        <li>Autorités compétentes en cas d'obligation légale</li>
      </ul>
    </div>

    <div className="legal-section">
      <h2>6. Vos droits</h2>
      <p>Conformément au RGPD, vous disposez des droits suivants :</p>
      <ul>
        <li><strong style={{color:"#f5f0e8"}}>Droit d'accès</strong> : obtenir une copie de vos données</li>
        <li><strong style={{color:"#f5f0e8"}}>Droit de rectification</strong> : corriger des données inexactes</li>
        <li><strong style={{color:"#f5f0e8"}}>Droit à l'effacement</strong> : supprimer vos données ("droit à l'oubli")</li>
        <li><strong style={{color:"#f5f0e8"}}>Droit à la portabilité</strong> : recevoir vos données dans un format structuré</li>
        <li><strong style={{color:"#f5f0e8"}}>Droit d'opposition</strong> : s'opposer au traitement de vos données</li>
        <li><strong style={{color:"#f5f0e8"}}>Droit de retrait du consentement</strong> : à tout moment pour la géolocalisation</li>
      </ul>
      <p>Pour exercer ces droits : <a href="mailto:infos@hopela.nc">infos@hopela.nc</a> ou via notre <a href="/contact">formulaire de contact</a>. Délai de réponse : 30 jours maximum.</p>
    </div>

    <div className="legal-section">
      <h2>7. Sécurité</h2>
      <p>Hopela met en œuvre les mesures techniques et organisationnelles appropriées pour protéger vos données :</p>
      <ul>
        <li>Chiffrement des mots de passe (bcrypt, facteur de coût 12)</li>
        <li>Communications chiffrées (HTTPS/TLS)</li>
        <li>Base de données chiffrée au repos</li>
        <li>Authentification par cookies httpOnly sécurisés</li>
        <li>Accès aux données restreint par rôle (RBAC)</li>
      </ul>
    </div>

    <div className="legal-section">
      <h2>8. Contact et réclamation</h2>
      <p>Pour toute question relative à la protection de vos données personnelles, contactez-nous à <a href="mailto:infos@hopela.nc">infos@hopela.nc</a>.</p>
      <p>Vous avez également le droit d'introduire une réclamation auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés) : <a href="https://www.cnil.fr" target="_blank" rel="noreferrer">www.cnil.fr</a>.</p>
    </div>

  </LegalLayout>
);

export default ConfidentialiteScreen;
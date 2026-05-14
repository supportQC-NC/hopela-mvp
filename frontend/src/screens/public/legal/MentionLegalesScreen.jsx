// src/screens/public/legal/MentionLegalesScreen.jsx
import LegalLayout from "./LegalLayout";

const MentionLegalesScreen = () => (
  <LegalLayout eyebrow="Informations légales" title={<>Mentions <em>légales</em></>} date="1er janvier 2025">

    <div className="legal-highlight">
      <p>Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004 pour la confiance en l'économie numérique, il est précisé aux utilisateurs du site Hopela l'identité des différents intervenants dans le cadre de sa réalisation et de son suivi.</p>
    </div>

    <div className="legal-section">
      <h2>1. Éditeur du site</h2>
      <p><strong style={{color:"#f5f0e8"}}>Hopela</strong><br />
      Plateforme de mise en relation entre particuliers et prestataires de services en Nouvelle-Calédonie.<br />
      Adresse : Nouméa, Nouvelle-Calédonie<br />
      Email : <a href="mailto:infos@hopela.nc">infos@hopela.nc</a><br />
      </p>
    </div>

    <div className="legal-section">
      <h2>2. Hébergement</h2>
      <p>Le site Hopela est hébergé par :<br />
      <strong style={{color:"#f5f0e8"}}>Hostinger International Ltd.</strong><br />
      61 Lordou Vironos Street, 6023 Larnaca, Chypre<br />
      Site web : <a href="https://www.hostinger.com" target="_blank" rel="noreferrer">www.hostinger.com</a></p>
    </div>

    <div className="legal-section">
      <h2>3. Propriété intellectuelle</h2>
      <p>L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.</p>
      <p>La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est formellement interdite sauf autorisation expresse du directeur de la publication.</p>
    </div>

    <div className="legal-section">
      <h2>4. Données personnelles</h2>
      <p>Les informations recueillies sur ce site font l'objet d'un traitement informatique destiné à la gestion des comptes utilisateurs et prestataires. Pour en savoir plus, consultez notre <a href="/confidentialite">politique de confidentialité</a>.</p>
    </div>

    <div className="legal-section">
      <h2>5. Cookies</h2>
      <p>Ce site utilise des cookies techniques nécessaires à son fonctionnement. Pour plus d'informations, consultez notre <a href="/cookies">politique de gestion des cookies</a>.</p>
    </div>

    <div className="legal-section">
      <h2>6. Limitation de responsabilité</h2>
      <p>Hopela ne pourra être tenu responsable des dommages directs et indirects causés au matériel de l'utilisateur, lors de l'accès au site, et résultant soit de l'utilisation d'un matériel ne répondant pas aux spécifications techniques requises, soit de l'apparition d'un bug ou d'une incompatibilité.</p>
      <p>Hopela ne pourra également être tenu responsable des dommages indirects consécutifs à l'utilisation du site. Des espaces interactifs sont à la disposition des utilisateurs. Hopela se réserve le droit de supprimer, sans mise en demeure préalable, tout contenu déposé dans cet espace qui contreviendrait à la législation applicable en France.</p>
    </div>

    <div className="legal-section">
      <h2>7. Droit applicable et juridiction</h2>
      <p>Tout litige en relation avec l'utilisation du site est soumis au droit français. En dehors des cas où la loi ne le permet pas, il est fait attribution exclusive de juridiction aux tribunaux compétents de Nouméa, Nouvelle-Calédonie.</p>
    </div>

  </LegalLayout>
);

export default MentionLegalesScreen;
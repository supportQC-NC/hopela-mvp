// src/screens/public/legal/CgvScreen.jsx
import LegalLayout from "./LegalLayout";

const CgvScreen = () => (
  <LegalLayout eyebrow="Conditions de vente" title={<>Conditions Générales<br/><em>de Vente</em></>} date="1er janvier 2025">

    <div className="legal-highlight">
      <p>Dans la version actuelle (MVP) de Hopela, la plateforme est accessible gratuitement pour l'ensemble des utilisateurs et prestataires. Les présentes Conditions Générales de Vente (CGV) définissent les conditions applicables et anticipent les évolutions tarifaires futures.</p>
    </div>

    <div className="legal-section">
      <h2>1. Tarification actuelle</h2>
      <p>Hopela est actuellement disponible <strong style={{color:"#f5f0e8"}}>gratuitement</strong> pour :</p>
      <ul>
        <li>Les utilisateurs particuliers : accès complet à la carte, recherche de prestataires, gestion d'adresses</li>
        <li>Les prestataires : inscription, visibilité sur la carte, gestion du profil et du partage de position</li>
      </ul>
      <p>Aucune commission n'est prélevée sur les transactions entre utilisateurs et prestataires. Les échanges commerciaux se font directement entre les parties.</p>
    </div>

    <div className="legal-section">
      <h2>2. Évolutions tarifaires</h2>
      <p>Hopela se réserve le droit d'introduire des offres payantes dans le futur (abonnements prestataires premium, fonctionnalités avancées, etc.). Tout changement tarifaire affectant les utilisateurs actuels fera l'objet d'une notification préalable d'au moins 30 jours.</p>
      <p>Les utilisateurs et prestataires pourront refuser les nouvelles conditions tarifaires en supprimant leur compte.</p>
    </div>

    <div className="legal-section">
      <h2>3. Facturation et paiement</h2>
      <p>Dans le cas où des services payants seraient introduits :</p>
      <ul>
        <li>La facturation sera mensuelle ou annuelle selon l'offre choisie</li>
        <li>Les paiements seront sécurisés via des prestataires certifiés PCI-DSS</li>
        <li>Les factures seront disponibles dans l'espace personnel de l'utilisateur</li>
      </ul>
    </div>

    <div className="legal-section">
      <h2>4. Droit de rétractation</h2>
      <p>Conformément à la réglementation applicable, les utilisateurs personnes physiques disposent d'un délai de rétractation de 14 jours à compter de la souscription à tout service payant, sans avoir à justifier de motif.</p>
    </div>

    <div className="legal-section">
      <h2>5. Responsabilité</h2>
      <p>Hopela n'étant qu'un intermédiaire de mise en relation, la responsabilité de Hopela ne saurait être engagée en cas de litige entre un utilisateur et un prestataire concernant la prestation de services, la qualité du travail fourni, ou le paiement entre les parties.</p>
      <p>Les utilisateurs et prestataires traitent directement entre eux et sont seuls responsables de leurs engagements réciproques.</p>
    </div>

    <div className="legal-section">
      <h2>6. Contact</h2>
      <p>Pour toute question relative aux présentes CGV : <a href="mailto:infos@hopela.nc">infos@hopela.nc</a> ou via notre <a href="/contact">formulaire de contact</a>.</p>
    </div>

  </LegalLayout>
);

export default CgvScreen;
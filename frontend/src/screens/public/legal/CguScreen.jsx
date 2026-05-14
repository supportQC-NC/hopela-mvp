// src/screens/public/legal/CguScreen.jsx
import LegalLayout from "./LegalLayout";

const CguScreen = () => (
  <LegalLayout eyebrow="Conditions d'utilisation" title={<>Conditions Générales<br/><em>d'Utilisation</em></>} date="1er janvier 2025">

    <div className="legal-highlight">
      <p>En accédant et en utilisant la plateforme Hopela, vous acceptez sans réserve les présentes Conditions Générales d'Utilisation (CGU). Veuillez les lire attentivement avant toute utilisation.</p>
    </div>

    <div className="legal-section">
      <h2>1. Présentation de Hopela</h2>
      <p>Hopela est une plateforme numérique de mise en relation entre des particuliers (ci-après "Utilisateurs") et des prestataires de services locaux géolocalisés (ci-après "Prestataires") en Nouvelle-Calédonie. La plateforme permet aux utilisateurs de visualiser en temps réel les prestataires disponibles à proximité et de les contacter directement.</p>
    </div>

    <div className="legal-section">
      <h2>2. Accès au service</h2>
      <h3>2.1 Inscription</h3>
      <p>L'utilisation complète de la plateforme nécessite la création d'un compte. L'inscription est gratuite. L'utilisateur s'engage à fournir des informations exactes, complètes et à jour lors de son inscription.</p>
      <h3>2.2 Comptes Prestataires</h3>
      <p>Les comptes prestataires font l'objet d'une validation par l'équipe Hopela. La validation requiert notamment la fourniture d'un numéro RIDET valide (Registre de l'Industrie, du Commerce et des Métiers de Nouvelle-Calédonie) et d'un numéro de téléphone professionnel. Hopela se réserve le droit de refuser toute inscription sans avoir à en justifier le motif.</p>
      <h3>2.3 Responsabilité du compte</h3>
      <p>L'utilisateur est seul responsable de la confidentialité de ses identifiants de connexion. Toute activité réalisée depuis son compte est sous sa responsabilité.</p>
    </div>

    <div className="legal-section">
      <h2>3. Géolocalisation</h2>
      <p>Le fonctionnement de Hopela repose sur la géolocalisation. En activant cette fonctionnalité :</p>
      <ul>
        <li>Les <strong style={{color:"#f5f0e8"}}>Utilisateurs</strong> autorisent l'accès à leur position pour afficher les prestataires à proximité. Cette position n'est pas stockée de manière permanente.</li>
        <li>Les <strong style={{color:"#f5f0e8"}}>Prestataires</strong> autorisent le partage de leur position en temps réel lorsqu'ils activent manuellement le partage depuis leur tableau de bord. Ce partage peut être désactivé à tout moment.</li>
      </ul>
    </div>

    <div className="legal-section">
      <h2>4. Règles d'utilisation</h2>
      <p>Il est strictement interdit :</p>
      <ul>
        <li>D'utiliser la plateforme à des fins illicites ou contraires aux présentes CGU</li>
        <li>De publier des informations fausses ou trompeuses</li>
        <li>D'usurper l'identité d'un tiers</li>
        <li>D'utiliser des moyens automatisés pour accéder à la plateforme</li>
        <li>De porter atteinte aux droits de propriété intellectuelle de Hopela</li>
        <li>De perturber le fonctionnement de la plateforme</li>
      </ul>
    </div>

    <div className="legal-section">
      <h2>5. Rôle de Hopela</h2>
      <p>Hopela agit en qualité d'intermédiaire technique de mise en relation. Hopela n'est pas partie aux transactions conclues entre les utilisateurs et les prestataires. Hopela ne garantit pas la qualité des prestations fournies par les prestataires référencés sur la plateforme.</p>
      <p>Hopela vérifie les informations fournies par les prestataires lors de leur inscription (RIDET, identité) mais ne peut garantir l'exactitude de toutes les informations affichées.</p>
    </div>

    <div className="legal-section">
      <h2>6. Suspension et résiliation</h2>
      <p>Hopela se réserve le droit de suspendre ou supprimer tout compte qui ne respecterait pas les présentes CGU, sans préavis ni indemnité. L'utilisateur peut également supprimer son compte à tout moment en contactant le support.</p>
    </div>

    <div className="legal-section">
      <h2>7. Modification des CGU</h2>
      <p>Hopela se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés de toute modification substantielle. La poursuite de l'utilisation de la plateforme après notification vaut acceptation des nouvelles CGU.</p>
    </div>

    <div className="legal-section">
      <h2>8. Droit applicable</h2>
      <p>Les présentes CGU sont soumises au droit français et au droit applicable en Nouvelle-Calédonie. Tout litige relatif à leur interprétation ou exécution relève de la compétence exclusive des tribunaux de Nouméa.</p>
    </div>

  </LegalLayout>
);

export default CguScreen;
// backend/data/metiers.js
// Le champ `categorieNom` est résolu par le seeder via le categorieMap.
// Il ne doit PAS être inséré en base (le seeder le retire et injecte l'ObjectId).

const metiers = [

  // ── Urgence & dépannage ────────────────────────────────────────────────────
  { nom: "Plombier",                              description: "Plomberie, sanitaires et chauffage",                        icone: "droplets",    categorieNom: "Urgence & dépannage",                    isActive: true },
  { nom: "Serrurier",                             description: "Dépannage serrurerie, ouverture de portes",                 icone: "key",         categorieNom: "Urgence & dépannage",                    isActive: true },
  { nom: "Électricien dépannage",                 description: "Dépannage et interventions électriques d'urgence",         icone: "zap",         categorieNom: "Urgence & dépannage",                    isActive: true },
  { nom: "Réparateur électroménager",             description: "Réparation d'appareils électroménagers à domicile",        icone: "washing-machine", categorieNom: "Urgence & dépannage",                isActive: true },
  { nom: "Mécanicien mobile",                     description: "Dépannage automobile sur site",                            icone: "car",         categorieNom: "Urgence & dépannage",                    isActive: true },
  { nom: "Vitrier",                               description: "Remplacement et réparation de vitres",                     icone: "square",      categorieNom: "Urgence & dépannage",                    isActive: true },
  { nom: "Réparateur smartphone",                 description: "Réparation de smartphones et tablettes",                   icone: "smartphone",  categorieNom: "Urgence & dépannage",                    isActive: true },
  { nom: "Technicien climatisation",              description: "Installation et maintenance de climatisation et froid",    icone: "wind",        categorieNom: "Urgence & dépannage",                    isActive: true },

  // ── Services à domicile — récurrents ──────────────────────────────────────
  { nom: "Agent d'entretien",                     description: "Nettoyage et entretien du domicile",                       icone: "sparkles",    categorieNom: "Services à domicile — récurrents",       isActive: true },
  { nom: "Jardinier paysagiste",                  description: "Entretien des espaces verts et jardins",                   icone: "leaf",        categorieNom: "Services à domicile — récurrents",       isActive: true },
  { nom: "Pisciniste itinérant",                  description: "Entretien et maintenance de piscines à domicile",          icone: "waves",       categorieNom: "Services à domicile — récurrents",       isActive: true },
  { nom: "Laveur de vitres",                      description: "Nettoyage de vitres et baies vitrées",                     icone: "droplet",     categorieNom: "Services à domicile — récurrents",       isActive: true },
  { nom: "Déménageur",                            description: "Transport et déménagement de meubles",                     icone: "truck",       categorieNom: "Services à domicile — récurrents",       isActive: true },
  { nom: "Bricoleur multi-services",              description: "Petits travaux, réparations et bricolage à domicile",      icone: "hammer",      categorieNom: "Services à domicile — récurrents",       isActive: true },
  { nom: "Monteur de meubles",                    description: "Assemblage et montage de meubles à domicile",              icone: "package",     categorieNom: "Services à domicile — récurrents",       isActive: true },

  // ── Beauté & bien-être à domicile ─────────────────────────────────────────
  { nom: "Prothésiste ongulaire",                 description: "Pose et décoration d'ongles à domicile",                   icone: "hand",        categorieNom: "Beauté & bien-être à domicile",          isActive: true },
  { nom: "Coiffeuse mobile",                      description: "Coiffure et barbier à domicile",                           icone: "scissors",    categorieNom: "Beauté & bien-être à domicile",          isActive: true },
  { nom: "Esthéticienne mobile",                  description: "Soins esthétiques et beauté à domicile",                   icone: "star",        categorieNom: "Beauté & bien-être à domicile",          isActive: true },
  { nom: "Maquilleuse événementielle",            description: "Maquillage mariages, événements et shooting",              icone: "palette",     categorieNom: "Beauté & bien-être à domicile",          isActive: true },
  { nom: "Masseuse bien-être",                    description: "Massages de bien-être et relaxation à domicile",           icone: "heart",       categorieNom: "Beauté & bien-être à domicile",          isActive: true },
  { nom: "Réflexologue",                          description: "Réflexologie plantaire et palmaire à domicile",            icone: "footprints",  categorieNom: "Beauté & bien-être à domicile",          isActive: true },
  { nom: "Épilateur mobile",                      description: "Épilation à la cire, fil ou laser à domicile",             icone: "feather",     categorieNom: "Beauté & bien-être à domicile",          isActive: true },

  // ── Sport, santé & para-médical ───────────────────────────────────────────
  { nom: "Kinésithérapeute",                      description: "Kinésithérapie et physiothérapie à domicile",              icone: "activity",    categorieNom: "Sport, santé & para-médical",            isActive: true },
  { nom: "Ostéopathe mobile",                     description: "Ostéopathie à domicile",                                   icone: "bone",        categorieNom: "Sport, santé & para-médical",            isActive: true },
  { nom: "Coach sportif",                         description: "Coaching sportif et personal training à domicile",         icone: "dumbbell",    categorieNom: "Sport, santé & para-médical",            isActive: true },
  { nom: "Coach pilates yoga",                    description: "Cours de pilates et yoga à domicile",                      icone: "person-standing", categorieNom: "Sport, santé & para-médical",        isActive: true },
  { nom: "Infirmier libéral",                     description: "Soins infirmiers à domicile",                              icone: "stethoscope", categorieNom: "Sport, santé & para-médical",            isActive: true },
  { nom: "Aide-soignant",                         description: "Aide aux soins et accompagnement à domicile",              icone: "heart-handshake", categorieNom: "Sport, santé & para-médical",        isActive: true },
  { nom: "Orthophoniste mobile",                  description: "Rééducation orthophonique à domicile",                     icone: "mic",         categorieNom: "Sport, santé & para-médical",            isActive: true },
  { nom: "Diététicien",                           description: "Conseils nutritionnels et diététique à domicile",          icone: "salad",       categorieNom: "Sport, santé & para-médical",            isActive: true },
  { nom: "Psychologue mobile",                    description: "Suivi psychologique et thérapie en déplacement",           icone: "brain",       categorieNom: "Sport, santé & para-médical",            isActive: true },

  // ── Services aux personnes à mobilité réduite ─────────────────────────────
  { nom: "Auxiliaire de vie",                     description: "Aide à la vie quotidienne des personnes dépendantes",      icone: "users",       categorieNom: "Services aux personnes à mobilité réduite", isActive: true },
  { nom: "Aide à domicile",                       description: "Services d'aide à domicile (SAAD)",                        icone: "house-heart", categorieNom: "Services aux personnes à mobilité réduite", isActive: true },
  { nom: "Garde-malade",                          description: "Surveillance et accompagnement de malades à domicile",     icone: "shield-check", categorieNom: "Services aux personnes à mobilité réduite", isActive: true },
  { nom: "Pédicure podologue",                    description: "Soins des pieds à domicile",                               icone: "footprints",  categorieNom: "Services aux personnes à mobilité réduite", isActive: true },
  { nom: "Coiffeur gériatrique",                  description: "Coiffure spécialisée en EHPAD et à domicile",              icone: "scissors",    categorieNom: "Services aux personnes à mobilité réduite", isActive: true },
  { nom: "Livreur médicaments",                   description: "Livraison de médicaments et matériel de pharmacie",        icone: "pill",        categorieNom: "Services aux personnes à mobilité réduite", isActive: true },
  { nom: "Technicien matériel médical",           description: "Installation et entretien de fauteuils roulants et prothèses", icone: "wrench", categorieNom: "Services aux personnes à mobilité réduite", isActive: true },

  // ── Transport & mobilité ──────────────────────────────────────────────────
  { nom: "Chauffeur VTC",                         description: "Transport de personnes en VTC",                            icone: "car",         categorieNom: "Transport & mobilité",                   isActive: true },
  { nom: "Chauffeur accompagnateur PMR",          description: "Transport accompagné pour personnes à mobilité réduite",  icone: "car-front",   categorieNom: "Transport & mobilité",                   isActive: true },
  { nom: "Livreur express",                       description: "Livraison express et courses à domicile",                 icone: "bike",        categorieNom: "Transport & mobilité",                   isActive: true },
  { nom: "Transporteur marchandises",             description: "Transport de marchandises légères",                        icone: "truck",       categorieNom: "Transport & mobilité",                   isActive: true },
  { nom: "Chauffeur événementiel",                description: "Chauffeur pour mariages, événements et soirées",          icone: "star",        categorieNom: "Transport & mobilité",                   isActive: true },

  // ── Enseignement & coaching mobile ────────────────────────────────────────
  { nom: "Professeur particulier",                description: "Cours particuliers à domicile toutes matières",            icone: "book-open",   categorieNom: "Enseignement & coaching mobile",          isActive: true },
  { nom: "Coach développement personnel",         description: "Coaching en développement personnel et professionnel",    icone: "lightbulb",   categorieNom: "Enseignement & coaching mobile",          isActive: true },
  { nom: "Formateur itinérant",                   description: "Formation professionnelle en entreprise ou à domicile",   icone: "graduation-cap", categorieNom: "Enseignement & coaching mobile",       isActive: true },
  { nom: "Photographe mobile",                    description: "Photographie et vidéographie événementielle",             icone: "camera",      categorieNom: "Enseignement & coaching mobile",          isActive: true },
  { nom: "Tuteur scolaire",                       description: "Soutien scolaire à domicile",                             icone: "pencil",      categorieNom: "Enseignement & coaching mobile",          isActive: true },
];

export default metiers;
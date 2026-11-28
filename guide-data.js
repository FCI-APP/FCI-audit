/**
 * FCI v1.0 — Base de contenu structurée du « Guide d'utilisation » (Consultation seule)
 * Direction Contrôle Générale — Division Contrôle Permanent — Barid Al-Maghrib
 *
 * ARCHITECTURE & MAINTENANCE :
 * - Ce fichier est 100 % indépendant des données opérationnelles (aucun accès à IndexedDB / localStorage métier / GitHub).
 * - Pour mettre à jour une rubrique ou associer une capture d'écran validée (Phase 3),
 *   renseignez simplement la propriété `imageSrc` (ex. "guide-assets/CAP-01.png") dans l'objet `illustration` de la feuille concernée.
 * - Ne jamais inscrire de mots de passe ni de données métier confidentielles dans ce fichier.
 */
(function () {
    'use strict';

    window.FCIGuideData = {
        meta: {
            version: '1.0',
            dateMiseAJour: '28 novembre 2026',
            application: 'Fiche de Contrôle Intelligente (FCI) v1.0',
            organisme: 'Direction Contrôle Générale — Division Contrôle Permanent · Barid Al-Maghrib',
            nbComptes: 41
        },

        profiles: [
            {
                id: 'ALL',
                label: 'Tous les profils',
                short: 'Tous profils',
                badgeClass: 'badge-prof-all',
                icon: 'fa-users',
                summary: 'Vue complète du guide commun aux 41 comptes (avec repérage visuel des fonctions réservées par profil).'
            },
            {
                id: 'CONTROLEUR',
                label: 'Contrôleur Régional',
                short: 'Contrôleur Régional',
                badgeClass: 'badge-prof-ctrl',
                icon: 'fa-user-check',
                summary: '34 comptes répartis sur 10 Directions Régionales. Espace Régional cloisonné + gestion des missions interrégionales.'
            },
            {
                id: 'CHEF_SERVICE',
                label: 'Chef de service (Siège)',
                short: 'Chef de service',
                badgeClass: 'badge-prof-chef',
                icon: 'fa-user-tie',
                summary: '5 comptes Siège (chef service-001 à chef service-005). Préparation & soumission des campagnes FC/FV, diffusion de ses campagnes validées, visibilité globale.'
            },
            {
                id: 'DIRECTEUR',
                label: 'Directeur (Siège)',
                short: 'Directeur',
                badgeClass: 'badge-prof-dir',
                icon: 'fa-award',
                summary: '1 compte Siège (directeur-001). Validation, modification inline et notification officielle des campagnes FC et FV, pilotage national.'
            },
            {
                id: 'ADMIN',
                label: 'Administrateur (Siège)',
                short: 'Admin uniquement',
                badgeClass: 'badge-prof-admin',
                icon: 'fa-user-shield',
                summary: '1 compte Siège (admin-siege). Accès exclusif à la Feuille 1 (Référentiel), visibilité totale, administration globale et purge globale sur les boutons Vider.'
            }
        ],

        // =====================================================================
        // RUBRIQUE 1 : PRÉSENTATION GÉNÉRALE
        // =====================================================================
        presentation: {
            intro: "L'application Fiche de Contrôle Intelligente (FCI v1.0) est l'outil interne de la Division Contrôle Permanent (Direction Contrôle Générale — Barid Al-Maghrib) dédié à la planification, l'exécution terrain, la centralisation et le pilotage décisionnel des missions de contrôle permanent et de vérification des encaisses.",
            perimetre: [
                {
                    titre: 'Contrôles Permanents (FC)',
                    icone: 'fa-clipboard-check',
                    couleur: '#003366',
                    description: 'Couvre 33 processus nationaux, 413 risques, 444 contrôles et 1 605 points de contrôle (referentiel.json). Planifiés en Feuille 2 (circuit hiérarchique Siège ou planification directe régionale) et exécutés en Feuille 3 (Fiche de Contrôle Terrain).'
                },
                {
                    titre: 'Vérifications des Encaisses (FV)',
                    icone: 'fa-vault',
                    couleur: '#047857',
                    description: 'Couvre 3 processus clés (Trésorerie et Financement, Philatélie, Gestion de la Sûreté) et 10 points de contrôle dédiés (Encaisses.json). Planifiés, validés, lancés et exécutés intégralement dans la Feuille 4 (Vérification Encaisses).'
                },
                {
                    titre: 'Centralisation & Archivage (BDD)',
                    icone: 'fa-database',
                    couleur: '#1D4ED8',
                    description: 'La Feuille 5 (BDD) unifie l’ensemble des constats FC et FV (initiaux, modifiés et suivis) avec filtrage croisé sur 8 axes, exports Excel/PDF/JSON et synchronisation vers les archives mensuelles GitHub (archives/AAAA/MM/).'
                },
                {
                    titre: 'Analyse & Pilotage (TDB)',
                    icone: 'fa-chart-line',
                    couleur: '#B45309',
                    description: 'La Feuille 6 (TDB) consolide les indicateurs de conformité pondérés, la clôture, la couverture territoriale (10 régions, 135 centres), la participation des contrôleurs et les alertes automatiques (< 75 %).'
                }
            ],
            comptesTableau: [
                { espace: 'Espace Siège (Visibilité globale)', role: 'Administrateur (ADMIN)', nombre: '1 compte', identifiants: 'admin-siege', accueil: 'Feuille 1 — Référentiel de contrôle' },
                { espace: 'Espace Siège (Visibilité globale)', role: 'Directeur (DIRECTEUR)', nombre: '1 compte', identifiants: 'directeur-001', accueil: 'Feuille 2 — Planification' },
                { espace: 'Espace Siège (Visibilité globale)', role: 'Chef de service (CHEF_SERVICE)', nombre: '5 comptes', identifiants: 'chef service-001 à chef service-005', accueil: 'Feuille 2 — Planification' },
                { espace: 'Espace Régional (Cloisonné + Interrégional)', role: 'Contrôleur Régional (CONTROLEUR)', nombre: '34 comptes (10 régions)', identifiants: 'CASA (5), RABAT (5), SETTAT (3), TANGER (3), MARRAKECH (3), AGADIR (3), FES (3), MEKNES (3), LAYOUNE (3), OUJDA (3)', accueil: 'Feuille 2 — Planification' }
            ],
            matriceDroits: [
                { fonction: 'Feuille 1 : Référentiel de contrôle (index.html)', admin: 'Accès complet', directeur: 'Masqué / Redirigé', chef: 'Masqué / Redirigé', controleur: 'Masqué / Redirigé' },
                { fonction: 'Feuille 2 : Workflow hiérarchique FC (Étape 1 — Préparation)', admin: 'Autorisé', directeur: 'Autorisé', chef: 'Autorisé', controleur: 'Masqué' },
                { fonction: 'Feuille 2 : Espace Directeur FC (Édition / Validation / Notification)', admin: 'Lecture seule (si ≥1 campagne)', directeur: 'Accès complet', chef: 'Masqué', controleur: 'Masqué' },
                { fonction: 'Feuille 2 : Diffusion FC validée (Étape 2)', admin: 'Toutes campagnes', directeur: 'Toutes campagnes', chef: 'Ses propres campagnes', controleur: 'Masqué' },
                { fonction: 'Feuille 2 : Planification directe régionale & exécution missions Siège', admin: 'Suivi global + Supprimer', directeur: 'Suivi global + Supprimer', chef: 'Suivi global + Exécuter si affecté', controleur: 'Formulaire direct + Exécuter ses missions' },
                { fonction: 'Feuille 3 : Fiche de Contrôle (FC) — Missions diffusées & onglets processus', admin: 'Saisie / Modif BDD globale', directeur: 'Saisie / Modif BDD globale', chef: 'Saisie / Modif BDD globale', controleur: 'Auto-préchargement missions Siège + onglets processus + BDD régionale' },
                { fonction: 'Feuille 4 : Workflow FV 2 étapes & lancement vérification', admin: 'Étape 1 & 2 + Lecture Directeur', directeur: 'Étape 1 & 2 + Espace Directeur complet', chef: 'Étape 1 & 2 (ses campagnes)', controleur: 'Notifications lancement + Tableau suivi + Saisie' },
                { fonction: 'Feuille 5 : Base de Données (BDD)', admin: 'Globale (Siège + 10 régions)', directeur: 'Globale (Siège + 10 régions)', chef: 'Globale (Siège + 10 régions)', controleur: 'Sa région + missions interrégionales (Siège masqué)' },
                { fonction: 'Feuille 6 : Tableau de Bord (TDB) — Niveau National', admin: 'Actif (défaut)', directeur: 'Actif (défaut)', chef: 'Actif (défaut)', controleur: 'Désactivé (Niveau Régional & Centre uniquement)' },
                { fonction: 'Feuille 7 : Guide d’utilisation', admin: 'Accès universel (lecture seule)', directeur: 'Accès universel (lecture seule)', chef: 'Accès universel (lecture seule)', controleur: 'Accès universel (lecture seule)' },
                { fonction: 'Portée des boutons « Vider » sur les feuilles opérationnelles', admin: 'Suppression physique globale (41 comptes)', directeur: 'Masquage isolé à son compte uniquement', chef: 'Masquage isolé à son compte uniquement', controleur: 'Masquage isolé à son compte uniquement' }
            ],
            stockagePoints: [
                'Stockage local haute capacité : les données sont enregistrées dans IndexedDB (base FCI_Audit_LargeDB) avec un miroir automatique dans localStorage tant que le volume reste inférieur à 4 Mo.',
                'Synchronisation temps réel entre onglets : toute mise à jour est propagée instantanément aux autres onglets ouverts via BroadcastChannel et les événements système.',
                'Archivage cloud mensuel sur GitHub : lorsqu’un Fine-grained Personal Access Token est configuré dans la Feuille 5 (BDD), les opérations sont archivées dans le dépôt privé FCI-APP/FCI-audit-archives sous archives/AAAA/MM/ (fichiers mensuels FC_AAAA-MM.json, FV_AAAA-MM.json et PLAN_AAAA-MM.json, avec partitionnement automatique au-delà de 12 Mo).',
                'Session volatile sécurisée : la connexion est stockée uniquement dans sessionStorage ; la fermeture de l’onglet ou du navigateur déconnecte automatiquement le compte.'
            ]
        },

        // =====================================================================
        // RUBRIQUE 2 : PREMIÈRE UTILISATION (GU-08)
        // =====================================================================
        firstUse: {
            etapesConnexion: [
                {
                    num: 1,
                    titre: 'Ouvrir la page de connexion (login.html)',
                    detail: 'Si vous accédez directement à une feuille sans session active, l’application vous redirige automatiquement vers login.html. Par sécurité, les champs sont systématiquement vidés au chargement pour bloquer le remplissage automatique du navigateur.'
                },
                {
                    num: 2,
                    titre: 'Saisir votre nom d’utilisateur et votre mot de passe',
                    detail: 'Cliquez dans le champ « Nom d’utilisateur » (insensible aux majuscules/minuscules, ex. CASA-001 ou chef service-001), puis dans « Mot de passe » (sensible à la casse). Utilisez l’icône œil à droite du champ mot de passe pour vérifier votre saisie si nécessaire.'
                },
                {
                    num: 3,
                    titre: 'Valider et vérifier votre espace dans le menu latéral',
                    detail: 'Cliquez sur « Se connecter ». Dès l’ouverture de l’application, vérifiez en bas de la barre latérale bleue l’encart de session indiquant votre identifiant, votre fonction et votre badge d’espace (ESPACE SIÈGE · VISIBILITÉ GLOBALE ou ESPACE RÉGIONAL · VOTRE RÉGION).'
                }
            ],
            checklistsParProfil: {
                CONTROLEUR: {
                    titre: 'Démarrage rapide — Contrôleur Régional',
                    accueil: 'Vous arrivez directement sur la Feuille 2 : Planification (la Feuille 1 « Référentiel » est masquée pour votre profil).',
                    actions: [
                        'Vérifiez en Feuille 2 (Planification) ou en Feuille 3 (Fiche de Contrôle) si le Siège vous a diffusé des missions de contrôle : elles apparaissent automatiquement dans « Mes Missions Planifiées & Diffusées par le Siège ».',
                        'Consultez en Feuille 4 (Vérification Encaisses) la bannière de notifications et votre tableau de suivi pour repérer toute vérification d’encaisses lancée par le Siège.',
                        'Pour suivre vos résultats et vos constats déjà archivés, ouvrez la Feuille 5 (BDD) et la Feuille 6 (TDB — onglets Niveau Régional et Niveau Centre / Site).'
                    ]
                },
                CHEF_SERVICE: {
                    titre: 'Démarrage rapide — Chef de service (Siège)',
                    accueil: 'Vous arrivez sur la Feuille 2 : Planification avec accès au circuit hiérarchique Siège (Étapes 1 & 2) et à la bannière des notifications.',
                    actions: [
                        'Consultez la bannière « Notifications » en haut de la Feuille 2 (FC) et de la Feuille 4 (FV) pour prendre connaissance des campagnes validées par le Directeur.',
                        'Dans l’Étape 1, sélectionnez vos processus (FC) et composez votre lot d’affectations (centres, contrôleurs, dates), puis cliquez sur « Soumettre pour validation ».',
                        'Une fois la campagne validée par directeur-001, basculez sur l’onglet Étape 2 pour diffuser les missions (FC) ou lancer individuellement les vérifications (FV).'
                    ]
                },
                DIRECTEUR: {
                    titre: 'Démarrage rapide — Directeur (Siège)',
                    accueil: 'Vous arrivez sur la Feuille 2 : Planification où s’affiche votre espace dédié « Espace Directeur — Validation & Notification ».',
                    actions: [
                        'Vérifiez les compteurs de campagnes en attente de validation en Feuille 2 (FC) et en Feuille 4 (FV).',
                        'Ajustez si besoin en ligne les centres, contrôleurs ou dates, puis cliquez sur « Valider la planification » et « Notifier les collaborateurs ».',
                        'Ouvrez la Feuille 6 (TDB — Niveau National actif par défaut) pour suivre le taux de conformité pondéré, les alertes (< 75 %) et la couverture des 10 régions.'
                    ]
                },
                ADMIN: {
                    titre: 'Démarrage rapide — Administrateur (Siège)',
                    accueil: 'Vous arrivez sur la Feuille 1 : Référentiel de contrôle (1 605 PC), accessible exclusivement à votre compte admin-siege.',
                    actions: [
                        'Explorez le référentiel en cascade (Feuille 1) ou supervisez les workflows de planification FC (Feuille 2) et FV (Feuille 4).',
                        'Configurez si nécessaire le Token GitHub et le Dépôt Archive dans la Feuille 5 (BDD) pour activer la synchronisation cloud mensuelle.',
                        'Précaution importante : sur votre compte Administrateur, chaque bouton « Vider » entraîne une suppression physique globale sur les 41 comptes (après confirmation).'
                    ]
                }
            }
        },

        // =====================================================================
        // RUBRIQUE 3 : DÉCOUVERTE DE L'INTERFACE
        // =====================================================================
        interfaceOverview: {
            menuItems: [
                { num: '1', nom: 'Référentiel de contrôle', fichier: 'index.html', profils: ['ADMIN'], desc: 'Consultation en cascade des 1 605 PC nationaux, export Excel et envoi vers la Planification. Réservé exclusivement à l’Administrateur.' },
                { num: '2', nom: 'Planification', fichier: 'Planification.html', profils: ['ALL'], desc: 'Planification des contrôles permanents (FC) : circuit hiérarchique Siège (2 étapes + validation Directeur) ou planification directe régionale.' },
                { num: '3', nom: 'Fiche de Contrôle (FC)', fichier: 'FicheControle.html', profils: ['ALL'], desc: 'Saisie terrain des constats FC point par point, calcul des taux de conformité, archivage, modification, suivi et suppression.' },
                { num: '4', nom: 'Fiche Vérification Encaisses', fichier: 'FicheEncaisses.html', profils: ['ALL'], desc: 'Workflow Siège 2 étapes FV + exécution terrain des vérifications d’encaisses (Encaisses.json), archivage, modification et suivi.' },
                { num: '5', nom: 'Base de Données (BDD)', fichier: 'BDD.html', profils: ['ALL'], desc: 'Consultation unifiée de tous les constats FC & FV accessibles, filtrage 8 axes, exports Excel/PDF/JSON et synchronisation GitHub.' },
                { num: '6', nom: 'Tableau de Bord / Analyse & Pilotage', fichier: 'TDB.html', profils: ['ALL'], desc: 'Pilotage multi-niveaux (Centre, Régional, National pour Siège), KPI, alertes, graphiques, couverture territoriale et participation.' },
                { num: '7', nom: 'Guide d’utilisation', fichier: 'GuideUtilisation.html', profils: ['ALL'], desc: 'Manuel interactif en consultation seule, disponible dans les 41 comptes sans restriction de profil ni de licence.' }
            ],
            badgesLegende: [
                { groupe: 'Statuts des constats', items: [
                    { label: '🟡 En cours', style: 'pill-warn', sens: 'Constat saisi ou en cours de traitement / suivi.' },
                    { label: '🟢 Clôturé', style: 'pill-ok', sens: 'Constat traité et clôturé (comptabilisé dans le Taux de Clôture).' },
                    { label: '🔴 Non clôturé', style: 'pill-err', sens: 'Anomalie demeurant ouverte / non levée (génère une alerte dans le TDB).' }
                ]},
                { groupe: 'Types de mission & historique', items: [
                    { label: '🔵 Thématique', style: 'pill-info', sens: 'Contrôle permanent ciblé sur un ou plusieurs processus spécifiques (FC).' },
                    { label: '🟠 Systématique', style: 'pill-warn', sens: 'Contrôle permanent systématique / périodique (FC).' },
                    { label: '🟢 Vérification', style: 'pill-ok', sens: 'Mission de Vérification des Encaisses (FV).' },
                    { label: '✏️ Modifié', style: 'pill-warn', sens: 'Constat existant mis à jour sur place via le bouton Modifier.' },
                    { label: '🔁 Suivi', style: 'pill-purple', sens: 'Nouvelle ligne créée via le bouton Suivi tout en conservant le constat initial intact.' }
                ]},
                { groupe: 'Origine & cloisonnement', items: [
                    { label: 'ESPACE SIÈGE', style: 'pill-gold', sens: 'Compte Siège (Admin, Directeur, Chef de service) bénéficiant d’une visibilité globale.' },
                    { label: 'ESPACE RÉGIONAL · <REG>', style: 'pill-info', sens: 'Compte Contrôleur régional cloisonné sur sa région + missions interrégionales.' },
                    { label: 'Planifié Siège', style: 'pill-info', sens: 'Mission mandatée par le Siège et diffusée nominativement à un contrôleur.' },
                    { label: 'Interrégional / Ctrl: <REG>', style: 'pill-purple', sens: 'Mission effectuée par un contrôleur dans une autre région que sa région d’affectation.' }
                ]},
                { groupe: 'Barème d’Avis Global du Centre (FC & FV)', items: [
                    { label: '≥ 95 % — Très bonne gestion', style: 'pill-ok', sens: 'Niveau de maîtrise fort (Risque Faible).' },
                    { label: '80 % à 94,99 % — Bonne gestion', style: 'pill-info', sens: 'Niveau de risque maîtrisé (Risque Modéré).' },
                    { label: '60 % à 79,99 % — Gestion satisfaisante', style: 'pill-warn', sens: 'Niveau de risque modéré à surveiller (Risque Élevé).' },
                    { label: '< 60 % — Gestion non satisfaisante', style: 'pill-err', sens: 'Niveau de risque critique ; plan d’action immédiat requis.' }
                ]}
            ],
            regleVider: {
                titre: 'Point de vigilance majeur : fonctionnement des boutons « Vider » selon votre profil',
                admin: 'En compte Administrateur (admin-siege), confirmer un bouton « Vider » lié à la base de données supprime physiquement et définitivement les données concernées dans le compte Administrateur ET dans les 40 autres comptes (Siège et Régions). Les archives déjà poussées sur GitHub ne sont toutefois pas supprimées.',
                nonAdmin: 'En compte Directeur, Chef de service ou Contrôleur Régional, confirmer un bouton « Vider » ne supprime rien pour les autres utilisateurs : les enregistrements sont uniquement masqués dans votre compte (marquage individuel). Attention : ce masquage ne dispose pas de bouton « Restaurer » dans l’interface.',
                pcIndividuel: 'Exception : le bouton « Vider » situé sur une carte Point de Contrôle (PC) individuelle dans la Feuille 3 (FC) ou la Feuille 4 (FV) réinitialise uniquement la saisie en cours sur cet écran, sans aucune modification de la Base de Données.'
            }
        },

        // =====================================================================
        // RUBRIQUE 4 : GUIDE DÉTAILLÉ PAR FEUILLE (MODÈLE OBLIGATOIRE 8 BLOCS)
        // =====================================================================
        sheets: [
            // -----------------------------------------------------------------
            // ÉCRAN 0 : CONNEXION (login.html)
            // -----------------------------------------------------------------
            {
                id: 'login',
                code: 'Écran 0',
                nom: 'Connexion',
                fichier: 'login.html',
                icone: 'fa-right-to-bracket',
                profils: ['ALL'],
                badgeAcces: 'Tous les 41 comptes',
                badgeClass: 'badge-prof-all',
                objectif: 'Sécuriser l’accès à l’application FCI v1.0, identifier le profil connecté (Siège ou Régional) et ouvrir une session volatile dédiée dans l’onglet du navigateur.',
                utilisateurs: [
                    { profil: 'Tous les 41 comptes', droits: 'Saisie de l’identifiant et du mot de passe attribués. Redirection automatique vers index.html pour admin-siege, et vers Planification.html pour les 40 autres comptes (Directeur, 5 Chefs de service, 34 Contrôleurs).' }
                ],
                interfaceZones: [
                    { zone: 'En-tête bleu marine', desc: 'Rappel institutionnel « Direction Contrôle Générale · Division Contrôle Permanent · Barid Al-Maghrib » et titre « FCI v1.0 — Accès Sécurisé ».' },
                    { zone: 'Bandeau d’erreur (#loginError)', desc: 'Masqué par défaut ; apparaît en rouge uniquement si les identifiants sont rejetés.' },
                    { zone: 'Formulaire d’authentification', desc: 'Deux champs sécurisés contre l’auto-complétion navigateur (vidés automatiquement au chargement) + bouton « Se connecter ».' }
                ],
                illustration: {
                    code: 'CAP-00',
                    titre: 'Écran de connexion sécurisé (login.html)',
                    imageSrc: '',
                    layoutType: 'login',
                    markers: [
                        { num: 1, x: 50, y: 18, label: 'En-tête institutionnel FCI v1.0', detail: 'Confirme que vous accédez à l’interface officielle Barid Al-Maghrib.' },
                        { num: 2, x: 50, y: 45, label: 'Champ Nom d’utilisateur', detail: 'Saisie obligatoire, insensible à la casse (ex. CASA-001, directeur-001).' },
                        { num: 3, x: 84, y: 63, label: 'Bouton Afficher / Masquer (œil)', detail: 'Permet de visualiser temporairement le mot de passe saisi.' },
                        { num: 4, x: 50, y: 80, label: 'Bouton « Se connecter »', detail: 'Vérifie le compte, ouvre la session volatile et redirige vers la page d’accueil du profil.' }
                    ]
                },
                boutons: [
                    { nom: 'Afficher / Masquer (icône œil)', zone: 'Champ Mot de passe', profils: ['ALL'], conditions: 'Toujours actif', effet: 'Bascule l’affichage du mot de passe entre masqué (points) et texte lisible.' },
                    { nom: 'Se connecter', zone: 'Bas du formulaire', profils: ['ALL'], conditions: 'Toujours actif', effet: 'Appelle FCIAuth.login(). Si valide : vide les champs, crée sessionStorage["fci_auth_session_v1"] et redirige vers index.html (Admin) ou Planification.html (autres comptes).' }
                ],
                champs: [
                    { nom: 'Nom d’utilisateur', type: 'Texte', obligatoire: 'Oui', valeurs: 'Un des 41 identifiants habilités (ex. CASA-001, chef service-001)', regles: 'Espaces avant/après ignorés, insensible à la casse. Lecture seule levée dès le clic ou le focus (anti-autofill).' },
                    { nom: 'Mot de passe', type: 'Mot de passe', obligatoire: 'Oui', valeurs: 'Mot de passe personnel du compte', regles: 'Espaces avant/après ignorés, sensible à la casse (majuscules/minuscules et caractères spéciaux exacts).' }
                ],
                procedures: [
                    {
                        titre: 'Se connecter à son compte FCI',
                        profils: ['ALL'],
                        etapes: [
                            'Cliquez dans le champ « Nom d’utilisateur » et saisissez votre identifiant (ex. CASA-001).',
                            'Cliquez dans « Mot de passe » et saisissez votre mot de passe (utilisez l’icône œil en cas de doute).',
                            'Cliquez sur « Se connecter » (ou appuyez sur Entrée).'
                        ],
                        resultat: 'Ouverture immédiate de votre espace (Feuille 1 pour l’Administrateur, Feuille 2 pour tous les autres comptes) avec affichage de votre profil dans la barre latérale.'
                    }
                ],
                erreursPrecautions: [
                    { type: 'erreur', titre: 'Message : « Nom d’utilisateur ou mot de passe incorrect. »', detail: 'Identifiant inexistant, espace manquant dans « chef service-00X », ou erreur de casse dans le mot de passe.', solution: 'Vérifiez l’orthographe exacte (notamment LAYOUNE-00X sans double A et l’espace dans chef service-00X) et vérifiez la touche Verr. Maj avec l’icône œil.' },
                    { type: 'precaution', titre: 'Session volatile', detail: 'Fermer l’onglet ou le navigateur ferme automatiquement votre session.', solution: 'Utilisez toujours le bouton rouge « Déconnexion » dans la barre latérale lorsque vous quittez un poste partagé.' }
                ]
            },

            // -----------------------------------------------------------------
            // FEUILLE 1 : RÉFÉRENTIEL DE CONTRÔLE (index.html)
            // -----------------------------------------------------------------
            {
                id: 'index',
                code: 'Feuille 1',
                nom: 'Référentiel de contrôle',
                fichier: 'index.html',
                icone: 'fa-book-open',
                profils: ['ADMIN'],
                badgeAcces: 'Administrateur uniquement',
                badgeClass: 'badge-prof-admin',
                objectif: 'Consulter en cascade hiérarchique le Référentiel National de contrôle permanent (1 605 points de contrôle répartis sur 33 processus, 413 risques et 444 contrôles), sélectionner des points de contrôle, les exporter en Excel/PDF ou les transférer directement vers la Feuille 2 (Planification).',
                utilisateurs: [
                    { profil: 'Administrateur (admin-siege)', droits: 'Accès complet à toutes les fonctionnalités de la feuille.' },
                    { profil: 'Directeur, Chefs de service et Contrôleurs', droits: 'Accès interdit : le lien « 1. Référentiel de contrôle » est masqué dans le menu latéral et tout accès direct à index.html redirige automatiquement vers Planification.html. (Les Chefs de service et le Directeur accèdent au référentiel directement dans l’Étape 1 de Planification.html.)' }
                ],
                interfaceZones: [
                    { zone: 'En-tête & statut BDD', desc: 'Affiche le badge vert « BDD à jour (1605 PC) » (ou rouge si referentiel.json est absent) et les boutons Actualiser / Vider.' },
                    { zone: 'Carte « Filtrage en cascade hiérarchique »', desc: '3 listes déroulantes liées (Processus → Risque → Contrôle) avec compteurs, description du filtre actif, « Vider filtres » et « Afficher PC (N PC) ».' },
                    { zone: 'Carte Tableau des Points de Contrôle', desc: 'Barre d’outils (Sélectionner/Désélectionner tout, compteur de points cochés, Vider, Imprimer PDF, Excel, Planification), tableau scrollable 5 colonnes et pied de tableau.' }
                ],
                illustration: {
                    code: 'CAP-01',
                    titre: 'Feuille 1 : Référentiel de contrôle (index.html — Vue Admin)',
                    imageSrc: '',
                    layoutType: 'referentiel',
                    markers: [
                        { num: 1, x: 82, y: 12, label: 'Statut Référentiel & boutons d’en-tête', detail: 'Indique le nombre total de PC chargés (1605 PC), bouton Actualiser et bouton Vider (purge globale Admin).' },
                        { num: 2, x: 48, y: 34, label: 'Filtrage en cascade (3 niveaux)', detail: '1. Processus → 2. Intitulé du risque → 3. Intitulé contrôle, puis bouton « Afficher PC ».' },
                        { num: 3, x: 28, y: 55, label: 'Sélection & compteur', detail: 'Boutons Sélectionner tout / Désélectionner tout et compteur cumulatif des PC sélectionnés.' },
                        { num: 4, x: 80, y: 55, label: 'Exports & bouton Planification', detail: 'Imprimer PDF, Télécharger format Excel (.xlsx) et transfert vers la Feuille 2 (Planification).' },
                        { num: 5, x: 50, y: 78, label: 'Tableau des Points de Contrôle', detail: 'Cases à cocher individuelles + case maître en en-tête pour composer le panier de PC.' }
                    ]
                },
                boutons: [
                    { nom: 'Actualiser', zone: 'En-tête', profils: ['ADMIN'], conditions: 'Toujours actif', effet: 'Recharge entièrement la page et relit referentiel.json.' },
                    { nom: 'Vider (En-tête, Filtrage et Tableau)', zone: 'En-tête / Carte Filtres / Barre Tableau', profils: ['ADMIN'], conditions: 'Toujours actif (avec confirmation)', effet: 'ATTENTION : ces 3 boutons appellent tous la purge globale Admin (FCIDatabase.viderDonneesEspace("ALL")), qui supprime toutes les données BDD des 41 comptes, puis vide la sélection et réinitialise les filtres.' },
                    { nom: 'Vider filtres', zone: 'Carte Filtrage', profils: ['ADMIN'], conditions: 'Toujours actif', effet: 'Remet les 3 listes déroulantes à vide et vide l’affichage du tableau, sans toucher à la BDD ni aux points déjà cochés en mémoire.' },
                    { nom: 'Afficher PC (N PC)', zone: 'Carte Filtrage', profils: ['ADMIN'], conditions: 'Toujours actif', effet: 'Affiche dans le tableau tous les PC correspondant aux filtres choisis (ou les 1 605 PC si aucun processus n’est sélectionné).' },
                    { nom: 'Sélectionner tout / Désélectionner tout', zone: 'Barre Tableau', profils: ['ADMIN'], conditions: 'Actif quand des PC sont affichés', effet: 'Coche ou décoche l’ensemble des PC actuellement filtrés dans le tableau (le panier cumule les sélections sur plusieurs processus).' },
                    { nom: 'Imprimer PDF', zone: 'Barre Tableau', profils: ['ADMIN'], conditions: 'Toujours actif', effet: 'Ouvre l’impression navigateur en masquant la barre latérale et les filtres.' },
                    { nom: 'Télécharger format Excel', zone: 'Barre Tableau', profils: ['ADMIN'], conditions: 'Au moins 1 PC coché', effet: 'Télécharge FCI_Points_Controle_Selectionnes.xlsx (onglet « Points de Contrôle ») contenant uniquement les PC sélectionnés.' },
                    { nom: 'Planification', zone: 'Barre Tableau', profils: ['ADMIN'], conditions: 'Au moins 1 PC coché', effet: 'Enregistre les PC cochés dans localStorage["fci_planification_pc"] et ouvre Planification.html.' }
                ],
                champs: [
                    { nom: '1. Processus', type: 'Liste déroulante', obligatoire: 'Facultatif', valeurs: '33 processus triés alphabétiquement issus de referentiel.json', regles: 'Déverrouille et alimente « 2. Intitulé du risque » ; met à jour le compteur du bouton « Afficher PC ».' },
                    { nom: '2. Intitulé du risque', type: 'Liste déroulante', obligatoire: 'Facultatif', valeurs: 'Risques du processus sélectionné', regles: 'Désactivé tant qu’aucun processus n’est choisi. Déverrouille « 3. Intitulé contrôle ».' },
                    { nom: '3. Intitulé contrôle', type: 'Liste déroulante', obligatoire: 'Facultatif', valeurs: 'Contrôles du couple (Processus, Risque)', regles: 'Désactivé tant qu’aucun risque n’est choisi.' },
                    { nom: 'Cases à cocher (maître & lignes)', type: 'Checkbox', obligatoire: 'Au moins 1 pour Excel/Planification', valeurs: 'Coché / Décoché', regles: 'Les PC sélectionnés persistent lorsqu’on change de filtre afin de composer une sélection multi-processus.' }
                ],
                procedures: [
                    {
                        titre: 'Sélectionner des PC et les envoyer en Planification (Admin)',
                        profils: ['ADMIN'],
                        etapes: [
                            'Sélectionnez un Processus (et éventuellement un Risque puis un Contrôle).',
                            'Cliquez sur « Afficher PC » pour charger les lignes dans le tableau.',
                            'Cochez les PC souhaités (ou cliquez sur « Sélectionner tout »). Répétez sur d’autres processus si besoin.',
                            'Cliquez sur « Planification » (ou « Télécharger format Excel » pour un export).'
                        ],
                        resultat: 'Le compteur jaune affiche le total de PC cochés ; le clic sur « Planification » transfère automatiquement ce panier dans la Feuille 2.'
                    }
                ],
                erreursPrecautions: [
                    { type: 'precaution', titre: 'Précaution critique : ne pas confondre « Vider filtres » et « Vider »', detail: 'Les boutons rouges « Vider » (même dans la carte Filtrage ou Tableau) lancent une suppression globale de toute la BDD sur les 41 comptes en mode Administrateur.', solution: 'Pour simplement réinitialiser votre recherche de processus, cliquez exclusivement sur le bouton blanc « Vider filtres ».' },
                    { type: 'erreur', titre: 'Badge rouge « referentiel.json introuvable »', detail: 'L’application a été ouverte en fichier local (file://) bloquant fetch(), ou le fichier referentiel.json manque.', solution: 'Accédez à l’application via son serveur web (GitHub Pages ou serveur HTTP local) et vérifiez la présence de referentiel.json.' },
                    { type: 'erreur', titre: 'Alerte « Veuillez sélectionner au moins un point... »', detail: 'Clic sur Excel ou Planification alors que le compteur est à 0.', solution: 'Affichez au moins un processus et cochez une ou plusieurs lignes avant d’exporter ou transférer.' }
                ]
            },

            // -----------------------------------------------------------------
            // FEUILLE 2 : PLANIFICATION (Planification.html)
            // -----------------------------------------------------------------
            {
                id: 'planification',
                code: 'Feuille 2',
                nom: 'Planification',
                fichier: 'Planification.html',
                icone: 'fa-calendar-check',
                profils: ['ALL'],
                badgeAcces: 'Tous profils (vues adaptées)',
                badgeClass: 'badge-prof-all',
                objectif: 'Organiser les missions de Contrôle permanent (FC exclusivement — les vérifications d’encaisses FV se planifient en Feuille 4). Côté Siège, elle pilote le circuit hiérarchique complet (préparation multi-processus → validation & notification Directeur → diffusion nominative aux contrôleurs → suivi). Côté Régional, elle permet d’exécuter les missions reçues du Siège ou de créer une planification directe.',
                utilisateurs: [
                    { profil: 'Chef de service (Siège)', droits: 'Voit la bannière Notifications Siège, le Workflow 2 étapes (préparation, soumission, et diffusion de SES propres campagnes validées) et le suivi global Siège (+ bouton Exécuter FC s’il est lui-même affecté).' },
                    { profil: 'Directeur (directeur-001)', droits: 'Accès complet à l’Espace Directeur (modification inline des affectations sur campagnes SOUMISE/VALIDEE, ajout/retrait de lignes, Validation/Revalidation, Notification des collaborateurs), Workflow 2 étapes (peut aussi diffuser) et suivi global Siège.' },
                    { profil: 'Administrateur (admin-siege)', droits: 'Workflow 2 étapes (peut préparer, soumettre et diffuser toute campagne validée), Espace Directeur en lecture seule (s’il existe ≥ 1 campagne), Notifications Siège et suivi global Siège.' },
                    { profil: 'Contrôleur Régional', droits: 'Ne voit ni les notifications Siège, ni l’Espace Directeur, ni le Workflow Siège. Voit ses missions mandatées par le Siège (tableau avec bouton « Exécuter FC ») et le formulaire « Informations Générales de la Mission » pour une planification directe.' }
                ],
                interfaceZones: [
                    { zone: 'Bannière Notifications Siège (Siège seul)', desc: 'Affiche les notifications officielles émises par le Directeur après validation d’une campagne FC, avec compteur de non lues, tableau récapitulatif des affectations et bouton « Marquer comme lue ».' },
                    { zone: 'Espace Directeur (Directeur + lecture seule Admin)', desc: 'Compteurs (en attente, validées, diffusées), cartes de campagnes avec tableau d’affectations éditable en ligne (pour le Directeur), panneaux dépliables « Voir Référentiel » et « Historique ».' },
                    { zone: 'Workflow Siège 2 étapes (Siège seul)', desc: 'Onglet 1 (Préparation multi-processus depuis referentiel.json + bouton compteur PC + composition du lot d’affectations avec filtre centres non contrôlés cette année + liste des propositions soumises) et Onglet 2 (Diffusion des campagnes validées avec pastille de compteur).' },
                    { zone: 'Suivi des Contrôles Planifiés (Tous — adapté)', desc: 'Tableau 8 colonnes : vision globale de toutes les planifications FC pour le Siège ; vision strictement nominative des missions diffusées qui lui sont assignées pour un Contrôleur.' },
                    { zone: 'Bandeau 4 KPI + Formulaire Régional + Liste des PC', desc: '4 compteurs temps réel (Processus, Risques, Contrôles, PC cochés), formulaire 6 champs (Contrôleur seul), barre d’outils PC, blocs dépliés par processus avec cases à cocher et bouton final « Lancer la Fiche de Contrôle ».' }
                ],
                illustration: {
                    code: 'CAP-02',
                    titre: 'Feuille 2 : Planification des missions de contrôle (Planification.html)',
                    imageSrc: '',
                    layoutType: 'planification',
                    markers: [
                        { num: 1, x: 50, y: 12, label: 'Bannière Notifications & Espace Directeur (Siège)', detail: 'Validation, modification en ligne et notification officielle réservées au Directeur (directeur-001).' },
                        { num: 2, x: 35, y: 31, label: 'Onglets Workflow Siège (Étapes 1 & 2)', detail: 'Étape 1 : Préparation & Soumission. Étape 2 : Diffusion ciblée des campagnes validées.' },
                        { num: 3, x: 50, y: 47, label: 'Sélection multi-processus & Lot d’affectations', detail: 'Ajout des PC depuis referentiel.json, ciblage des centres non contrôlés dans l’année et affectations (y compris interrégionales).' },
                        { num: 4, x: 50, y: 66, label: 'Tableau Suivi des Contrôles Planifiés', detail: 'Suivi temps réel (Planifiée / En cours / Réalisée) + bouton « Exécuter FC » pour le contrôleur affecté.' },
                        { num: 5, x: 50, y: 84, label: 'Formulaire Direct (Contrôleur) & Liste des PC cochés', detail: '4 KPI, sélection fine des PC par cases à cocher, export CSV et bouton « Lancer la Fiche de Contrôle ».' }
                    ]
                },
                boutons: [
                    { nom: 'Actualiser', zone: 'En-tête', profils: ['ALL'], conditions: 'Toujours actif', effet: 'Réhydrate la BDD locale puis recharge la page (attention : efface un lot d’affectations non encore soumis).' },
                    { nom: '1 — Préparation et validation / 2 — Diffusion validée', zone: 'Workflow Siège', profils: ['ADMIN', 'DIRECTEUR', 'CHEF_SERVICE'], conditions: 'Comptes Siège', effet: 'Bascule entre la préparation/soumission d’une campagne et la diffusion des campagnes validées.' },
                    { nom: 'Processus sélectionné : N PC / Ajouter ce processus à la campagne', zone: 'Étape 1A (Siège)', profils: ['ADMIN', 'DIRECTEUR', 'CHEF_SERVICE'], conditions: '1 processus sélectionné', effet: 'Ajoute les PC filtrés (sans doublon) à la campagne courante et les coche automatiquement.' },
                    { nom: 'Ajouter une affectation', zone: 'Étape 1B (Siège)', profils: ['ADMIN', 'DIRECTEUR', 'CHEF_SERVICE'], conditions: 'Centre, Contrôleur et Dates valides', effet: 'Empile une ligne d’affectation dans le lot en cours (répétable pour plusieurs centres/contrôleurs).' },
                    { nom: 'Soumettre pour validation', zone: 'Étape 1B (Siège)', profils: ['ADMIN', 'DIRECTEUR', 'CHEF_SERVICE'], conditions: '≥ 1 PC coché et ≥ 1 affectation valide', effet: 'Enregistre une campagne au statut SOUMISE destinée à directeur-001 (avec synchro GitHub si token actif) et réinitialise le formulaire.' },
                    { nom: 'Valider la planification / Enregistrer & revalider', zone: 'Espace Directeur', profils: ['DIRECTEUR'], conditions: 'Campagne SOUMISE ou VALIDEE, toutes lignes complètes', effet: 'Passe la campagne au statut VALIDEE, enregistre l’historique et la rend disponible à l’Étape 2.' },
                    { nom: 'Notifier / Renotifier les collaborateurs', zone: 'Espace Directeur', profils: ['DIRECTEUR'], conditions: 'Campagne VALIDEE ou DIFFUSEE', effet: 'Diffuse une notification officielle (avec tableau des affectations) à tous les 7 comptes Siège.' },
                    { nom: 'Ajouter / Retirer une affectation (Directeur)', zone: 'Espace Directeur', profils: ['DIRECTEUR'], conditions: 'Statut SOUMISE ou VALIDEE (min. 1 ligne conservée)', effet: 'Permet au Directeur d’ajuster le périmètre avant validation/revalidation.' },
                    { nom: 'Voir Référentiel / Historique', zone: 'Cartes Campagnes', profils: ['ADMIN', 'DIRECTEUR', 'CHEF_SERVICE'], conditions: 'Toujours actif sur la campagne', effet: 'Déplie ou replie la liste des PC partagés ou le journal chronologique des actions.' },
                    { nom: 'Diffuser les missions', zone: 'Étape 2 (Siège)', profils: ['ADMIN', 'DIRECTEUR', 'CHEF_SERVICE'], conditions: 'Campagne VALIDEE (Chef de service : ses propres campagnes uniquement)', effet: 'Crée les missions individuelles DIFFUSEE dans db.planifications pour chaque contrôleur désigné.' },
                    { nom: 'Exécuter FC', zone: 'Tableau Suivi Planifications', profils: ['CONTROLEUR', 'CHEF_SERVICE'], conditions: 'Mission assignée au compte et non Réalisée', effet: 'Passe la planification en statut EN_COURS, précharge la mission dans localStorage et ouvre FicheControle.html.' },
                    { nom: 'Supprimer (icône corbeille planification)', zone: 'Tableau Suivi Siège', profils: ['ADMIN', 'DIRECTEUR', 'CHEF_SERVICE'], conditions: 'Vue Siège uniquement', effet: 'Supprime immédiatement la planification de la BDD (+ archive GitHub si token), sans boîte de confirmation.' },
                    { nom: 'Sélectionner tout / Désélectionner tout / Retirer le Processus', zone: 'Barre d’outils & blocs PC', profils: ['ALL'], conditions: 'PC présents', effet: 'Ajuste les PC cochés (ou retire un processus/PC du panier courant).' },
                    { nom: 'Imprimer PDF / Télécharger format Excel', zone: 'Barre d’outils PC', profils: ['ALL'], conditions: '≥ 1 PC coché pour l’export', effet: 'Lance l’impression ou télécharge un fichier CSV compatible Excel (Planification_Mission_AAAA-MM-JJ.csv, séparateur point-virgule).' },
                    { nom: 'Lancer la Fiche de Contrôle', zone: 'Bas de page', profils: ['ALL'], conditions: 'Champs mission complets et ≥ 1 PC coché', effet: 'Enregistre une mission directe dans db.missions, transfère les PC vers FicheControle.html et ouvre la fiche.' },
                    { nom: 'Vider (Header, Siège, Régional, Toolbar, Notifs, Directeur, Suivi)', zone: 'Divers sous-espaces', profils: ['ALL'], conditions: 'Confirmation obligatoire', effet: 'Purge globale (Admin) ou masquage compte uniquement (autres profils) selon le périmètre du bouton.' }
                ],
                champs: [
                    { nom: 'Processus / Risque / Contrôle (Étape 1A)', type: '3 listes en cascade', obligatoire: 'Processus obligatoire pour ajouter', valeurs: 'Issus de referentiel.json (33 processus)', regles: 'Risque et Contrôle sont facultatifs (tous inclus par défaut).' },
                    { nom: 'Type de contrôle (Étape 1B)', type: 'Liste déroulante', obligatoire: 'Oui', valeurs: 'Thématique (défaut), Systématique', regles: 'Commun à toutes les affectations de la campagne.' },
                    { nom: 'Afficher aussi les centres déjà contrôlés cette année', type: 'Case à cocher', obligatoire: 'Facultatif', valeurs: 'Décoché par défaut', regles: 'Par défaut, masque les centres déjà présents dans les contrôles FC de l’année civile en cours.' },
                    { nom: 'Centre ciblé * & Région (auto) *', type: 'Liste + Texte readonly', obligatoire: 'Oui', valeurs: '143 centres réseau (10 régions) + 5 entités Siège', regles: 'La région est renseignée automatiquement à la sélection du centre.' },
                    { nom: 'Contrôleur affecté *', type: 'Liste déroulante', obligatoire: 'Oui', valeurs: '34 contrôleurs régionaux + 5 Chefs de service', regles: 'L’affectation hors région est autorisée et signalée par un badge « Affectation interrégionale ».' },
                    { nom: 'Date début * & Date fin de contrôle *', type: 'Dates', obligatoire: 'Oui', valeurs: 'Format date (défaut : aujourd’hui)', regles: 'Date fin doit être postérieure ou égale à Date début.' },
                    { nom: 'Formulaire Régional (6 champs)', type: 'Listes + Dates + Texte', obligatoire: 'Tous obligatoires', valeurs: 'Région (pré-remplie, modifiable), Entité, Type (Thématique/Systématique), Début, Fin, Nom du/des contrôleurs', regles: 'Visible uniquement pour les Contrôleurs régionaux.' }
                ],
                procedures: [
                    {
                        titre: 'Préparer et soumettre une campagne FC au Directeur (Siège)',
                        profils: ['CHEF_SERVICE', 'ADMIN', 'DIRECTEUR'],
                        etapes: [
                            'Dans l’Étape 1A, sélectionnez un ou plusieurs processus (et éventuellement risques/contrôles) puis cliquez sur « Ajouter ce processus à la campagne ».',
                            'Vérifiez les PC cochés dans le tableau en bas de page et décochez ceux non retenus.',
                            'Dans l’Étape 1B, choisissez le Type de contrôle, le Centre ciblé, le Contrôleur affecté, les Dates début/fin et cliquez sur « Ajouter une affectation » pour chaque mission.',
                            'Cliquez sur « Soumettre pour validation ».'
                        ],
                        resultat: 'Message de confirmation : la campagne apparaît dans les propositions en attente chez directeur-001.'
                    },
                    {
                        titre: 'Valider, notifier puis diffuser une campagne FC (Directeur → Auteur)',
                        profils: ['DIRECTEUR', 'CHEF_SERVICE', 'ADMIN'],
                        etapes: [
                            'Directeur : dans l’Espace Directeur, vérifiez ou ajustez en ligne les affectations puis cliquez sur « Valider la planification ».',
                            'Directeur : cliquez ensuite sur « Notifier les collaborateurs » pour informer les 7 comptes Siège.',
                            'Chef de service auteur (ou Directeur / Admin) : ouvrez l’onglet « 2 — Diffusion de la planification validée » et cliquez sur « Diffuser les missions ».'
                        ],
                        resultat: 'Chaque contrôleur affecté reçoit immédiatement sa mission dans son tableau « Contrôles planifiés » et dans sa Fiche de Contrôle.'
                    },
                    {
                        titre: 'Exécuter une mission reçue du Siège ou planifier directement (Contrôleur)',
                        profils: ['CONTROLEUR'],
                        etapes: [
                            'Pour une mission Siège : repérez la ligne dans votre tableau de suivi et cliquez sur « Exécuter FC ».',
                            'Pour un contrôle direct : vérifiez les PC cochés, renseignez les 6 champs de « Informations Générales de la Mission » et cliquez sur « Lancer la Fiche de Contrôle ».'
                        ],
                        resultat: 'Redirection automatique vers FicheControle.html avec la mission préchargée.'
                    }
                ],
                erreursPrecautions: [
                    { type: 'precaution', titre: 'Brouillons volatils avant soumission', detail: 'Le lot d’affectations en préparation et les cases décochées sont en mémoire temporaire : cliquer sur « Actualiser » (ou F5) avant soumission les réinitialise.', solution: 'Terminez et soumettez votre campagne avant d’actualiser la page.' },
                    { type: 'precaution', titre: 'Suppression immédiate d’une planification diffusée (Siège)', detail: 'Le bouton corbeille du tableau Suivi Siège supprime la ligne sans boîte de confirmation.', solution: 'Vérifiez bien la ligne ciblée avant de cliquer sur la corbeille.' },
                    { type: 'precaution', titre: 'Portée des boutons « Vider »', detail: 'Le bouton « Vider » de la barre d’outils PC vide/masque l’ensemble du périmètre Planification FC (et pas uniquement les coches locales).', solution: 'Pour simplement décocher les PC sans toucher à la BDD, utilisez « Désélectionner tout ».' },
                    { type: 'erreur', titre: 'Alerte « La date fin de contrôle doit être postérieure ou égale à la date début. »', detail: 'Date de fin antérieure à la date de début dans l’Étape 1.', solution: 'Corrigez la date de fin pour qu’elle soit supérieure ou égale à la date de début.' }
                ]
            },

            // -----------------------------------------------------------------
            // FEUILLE 3 : FICHE DE CONTRÔLE TERRAIN (FicheControle.html)
            // -----------------------------------------------------------------
            {
                id: 'fichecontrole',
                code: 'Feuille 3',
                nom: 'Fiche de Contrôle (FC)',
                fichier: 'FicheControle.html',
                icone: 'fa-clipboard-check',
                profils: ['ALL'],
                badgeAcces: 'Tous profils (vues adaptées)',
                badgeClass: 'badge-prof-all',
                objectif: 'Exécuter sur le terrain une mission de Contrôle permanent (FC) : évaluer chaque Point de Contrôle (Population, Échantillon, OK, KO calculé, Taux de Conformité calculé, Statut, Constat, Recommandation, Avis), archiver/modifier/suivre/supprimer PC par PC dans la BDD et calculer l’avis global du centre.',
                utilisateurs: [
                    { profil: 'Contrôleur Régional', droits: 'Bénéficie du panneau « Mes Missions Planifiées & Diffusées par le Siège » (avec préchargement automatique de la première mission à exécuter) et des onglets de filtrage par processus lorsque la mission en compte plusieurs. L’espace Modification BDD est limité à sa région et à ses missions interrégionales.' },
                    { profil: 'Siège (Admin, Directeur, Chefs de service)', droits: 'Saisie complète et accès global à l’espace Modification / Suivi BDD (Siège + toutes régions). Les tuiles de missions diffusées contrôleur et les onglets processus ne s’affichent pas côté Siège.' }
                ],
                interfaceZones: [
                    { zone: 'En-tête d’actions', desc: 'Boutons Actualiser, Vider, Export Excel, Imprimer / PDF.' },
                    { zone: 'Mes Missions Diffusées (Contrôleur seul)', desc: 'Tuiles cliquables des missions FC diffusées par le Siège avec avancement (À exécuter / En cours X/Y PC / Réalisée) et bouton « Charger cette mission ».' },
                    { zone: 'Espace Saisie de la Mission', desc: '7 champs de métadonnées (Région, Centre, Date contrôle, Dates début/fin, Contrôleur, Type), badges « Planifié par le Siège » / « Mission interrégionale » et pilule date.' },
                    { zone: 'Espace Modification / Suivi & Suppression (Source BDD)', desc: 'Compteur de constats FC accessibles, bandeau de retour d’opération (#searchStatus), 4 filtres croisés (Date, Région, Site, Processus), boutons Réinitialiser et « Charger depuis BDD ».' },
                    { zone: 'KPI, Cartes PC & Synthèse globale', desc: '4 KPI (TC Moyen Centre, Clôturés, Non Clôturés, En cours), onglets processus (Contrôleur si >1 processus), cartes PC avec 5 boutons individuels et encadré final « Taux moyen du centre & Avis global ».' }
                ],
                illustration: {
                    code: 'CAP-03',
                    titre: 'Feuille 3 : Fiche de Contrôle Terrain (FicheControle.html)',
                    imageSrc: '',
                    layoutType: 'fichecontrole',
                    markers: [
                        { num: 1, x: 50, y: 15, label: 'Missions diffusées Siège (Contrôleur uniquement)', detail: 'Précharge automatiquement votre première mission FC en cours ; cliquez sur une tuile pour changer de mission.' },
                        { num: 2, x: 50, y: 31, label: 'Barre Saisie de la Mission (7 métadonnées)', detail: 'Région *, Centre *, Date contrôle *, Dates début/fin, Contrôleur *, Type de contrôle.' },
                        { num: 3, x: 50, y: 46, label: 'Espace Modification / Suivi (Source BDD)', detail: '4 filtres en cascade + bouton « Charger depuis BDD » pour retrouver et mettre à jour des constats archivés.' },
                        { num: 4, x: 75, y: 66, label: 'Actions PC par PC (5 boutons)', detail: 'Archiver, Modifier, Suivi, Vider (local PC seul), Supprimer. Chaque action BDD retire uniquement le PC traité.' },
                        { num: 5, x: 50, y: 84, label: 'Évaluation numérique, textes & Synthèse', detail: 'Pop., Échant., OK → calcul auto KO et Conformité %, Constat *, Recommandation *, Avis (facultatif) et avis global.' }
                    ]
                },
                boutons: [
                    { nom: 'Charger cette mission / Mission active', zone: 'Tuiles missions diffusées', profils: ['CONTROLEUR'], conditions: 'Mission FC diffusée au contrôleur', effet: 'Charge les PC restants de la mission, passe son statut de PLANIFIEE à EN_COURS et hydrate les PC éventuellement déjà archivés.' },
                    { nom: 'Charger depuis BDD / Réinitialiser filtres', zone: 'Espace Modification BDD', profils: ['ALL'], conditions: 'Au moins 1 des 4 filtres choisi', effet: 'Charge dans la fiche tous les constats FC correspondant aux critères afin de les modifier, suivre ou supprimer.' },
                    { nom: 'Archiver (sur un PC)', zone: 'Carte PC', profils: ['ALL'], conditions: 'Champs obligatoires valides (Région, Centre, Contrôleur, Échant. > 0, Constat, Recommandation)', effet: 'Enregistre ce PC dans db.constatsControle et db.missions, le retire immédiatement de la fiche (les autres PC restent intacts) et synchronise GitHub en arrière-plan si un token est configuré.' },
                    { nom: 'Modifier (sur un PC)', zone: 'Carte PC', profils: ['ALL'], conditions: 'PC modifié par rapport à son état initial chargé + champs valides', effet: 'Met à jour le constat existant en BDD en le marquant « Modifié » (isModifie: true), retire le PC de la fiche et synchronise GitHub.' },
                    { nom: 'Suivi (sur un PC)', zone: 'Carte PC', profils: ['ALL'], conditions: 'PC modifié + champs valides', effet: 'Conserve intacte la ligne initiale en BDD et ajoute une NOUVELLE ligne de suivi (isSuivi: true), retire le PC de la fiche et synchronise GitHub.' },
                    { nom: 'Vider (sur un PC)', zone: 'Carte PC', profils: ['ALL'], conditions: 'Toujours actif, sans confirmation', effet: 'Remet à zéro uniquement la saisie locale de ce PC (Pop/Ech/OK/KO/TC = 0, Statut = En cours, textes vides). Ne touche PAS à la BDD.' },
                    { nom: 'Supprimer (sur un PC)', zone: 'Carte PC', profils: ['ALL'], conditions: 'Boîte de confirmation obligatoire', effet: 'Retire le PC de la fiche ; s’il provenait de la BDD, le supprime physiquement de db.constatsControle (et de l’archive GitHub si token actif).' },
                    { nom: 'Imprimer / PDF', zone: 'En-tête', profils: ['ALL'], conditions: 'Toujours actif', effet: 'Imprime proprement la fiche en masquant la barre latérale, les filtres BDD et les boutons.' },
                    { nom: 'Vider (En-tête, Saisie, Modif BDD, Missions)', zone: 'En-tête / Cartes', profils: ['ALL'], conditions: 'Confirmation obligatoire', effet: 'ATTENTION : appelle FCIDatabase.viderDonneesEspace("FC" ou "SUIVI_PLANIF_FC") qui purge (Admin) ou masque (autres comptes) la BDD FC.' }
                ],
                champs: [
                    { nom: 'Région * / Centre * / Contrôleur *', type: '2 listes + Texte', obligatoire: 'Oui', valeurs: '11 régions, 140 centres, nom du contrôleur', regles: 'Changer la région vide le champ Centre. Obligatoires pour Archiver / Modifier / Suivi.' },
                    { nom: 'Date contrôle * / Dates début & fin / Type', type: '3 Dates + Liste', obligatoire: 'Date contrôle recommandée', valeurs: 'Type : Thématique ou Systématique', regles: 'Attention : modifier « Date contrôle * » dans l’en-tête met à jour la date individuelle de TOUS les PC ouverts sur la fiche.' },
                    { nom: 'Date PC * & Statut PC *', type: 'Date + Liste', obligatoire: 'Oui', valeurs: 'CLOTURE (Clôturé), NON_CLOTURE (Non clôturé), EN_COURS (En cours)', regles: 'La date individuelle d’un PC peut être ajustée indépendamment.' },
                    { nom: 'Pop. * / Échant. * / OK * / KO (calculé)', type: 'Nombres ≥ 0', obligatoire: 'Échant. > 0 obligatoire', valeurs: 'Entiers positifs', regles: 'Échantillon ≤ Population (si Pop. > 0). OK est plafonné à Échantillon. KO = max(0, Échant. - OK). Conformité = (OK / Échant.) × 100.' },
                    { nom: 'Constat * / Recommandation * / Avis Responsable', type: '3 Zones de texte', obligatoire: 'Constat & Recommandation obligatoires', valeurs: 'Texte libre', regles: 'L’Avis du Responsable est facultatif. Toute saisie est sauvegardée automatiquement en brouillon local.' }
                ],
                procedures: [
                    {
                        titre: 'Saisir et archiver une Fiche de Contrôle point par point',
                        profils: ['ALL'],
                        etapes: [
                            'Chargez votre mission (depuis Planification ou depuis vos tuiles de missions diffusées si Contrôleur).',
                            'Vérifiez les métadonnées dans l’Espace Saisie (Région, Centre, Date contrôle, Contrôleur, Type).',
                            'Pour le premier PC, saisissez Date, Statut, Pop., Échant., OK (vérifiez KO et TC % calculés), puis Constat, Recommandation et éventuellement Avis du Responsable.',
                            'Cliquez sur « Archiver » sur ce PC : il disparaît de la fiche et le bandeau vert confirme son enregistrement en BDD. Répétez pour les PC suivants.'
                        ],
                        resultat: 'Chaque PC archivé est immédiatement visible en Feuille 5 (BDD) et agrégé en Feuille 6 (TDB).'
                    },
                    {
                        titre: 'Corriger un constat (Modifier) ou enregistrer un contrôle de suivi (Suivi)',
                        profils: ['ALL'],
                        etapes: [
                            'Dans « Espace Modification / Suivi & Suppression (Source BDD) », sélectionnez Date, Région, Site et/ou Processus puis cliquez sur « Charger depuis BDD ».',
                            'Effectuez vos modifications sur le PC souhaité (le badge passe à « Modifié (Prêt pour Modifier ou Suivi) »).',
                            'Cliquez sur « Modifier » pour corriger l’enregistrement existant, OU cliquez sur « Suivi » pour conserver le constat initial et ajouter une nouvelle ligne historisée.'
                        ],
                        resultat: 'En BDD, la ligne porte le tag « Modifié » (cas Modifier) ou une nouvelle ligne « Suivi » apparaît à la nouvelle date (cas Suivi).'
                    }
                ],
                erreursPrecautions: [
                    { type: 'precaution', titre: 'Vigilance sur les boutons « Vider » des espaces Saisie et Modification', detail: 'Contrairement au bouton « Vider » d’un PC individuel (qui reste local), les boutons « Vider » en haut de l’Espace Saisie ou de l’Espace Modification vident/masquent les constats FC de la BDD.', solution: 'Pour effacer la saisie d’un point sans toucher à la BDD, utilisez exclusivement le bouton « Vider » situé sur la carte du PC.' },
                    { type: 'limite', titre: 'Chargement BDD multi-sites', detail: 'Si votre filtre BDD renvoie des constats appartenant à plusieurs sites différents en même temps, la barre Saisie reprend le site du premier constat.', solution: 'Filtrez toujours jusqu’au « Site contrôlé » (et à la Date) avant de cliquer sur « Charger depuis BDD » puis sur Modifier/Suivi.' },
                    { type: 'limite', titre: 'Export Excel sur FicheControle.html', detail: 'Une limite technique existe actuellement sur le bouton « Export Excel » de la Feuille 3.', solution: 'Pour obtenir un fichier Excel (.xlsx) complet et fiable de vos constats FC, utilisez le bouton « Télécharger fichier Excel » de la Feuille 5 (BDD) ou de la Feuille 6 (TDB), ou utilisez « Imprimer / PDF » sur la Feuille 3.' },
                    { type: 'erreur', titre: 'Alerte « Aucune modification détectée sur ce point de contrôle. »', detail: 'Vous avez cliqué sur Modifier ou Suivi sans changer aucune valeur du PC chargé depuis la BDD.', solution: 'Modifiez au moins un champ (date, statut, chiffres ou texte) avant de valider.' }
                ]
            },

            // -----------------------------------------------------------------
            // FEUILLE 4 : VÉRIFICATION ENCAISSES (FicheEncaisses.html)
            // -----------------------------------------------------------------
            {
                id: 'ficheencaisses',
                code: 'Feuille 4',
                nom: 'Fiche Vérification Encaisses',
                fichier: 'FicheEncaisses.html',
                icone: 'fa-vault',
                profils: ['ALL'],
                badgeAcces: 'Tous profils (vues adaptées)',
                badgeClass: 'badge-prof-all',
                objectif: 'Gérer l’ensemble du cycle des Vérifications des Encaisses (FV) : planification Siège en 2 étapes avec validation Directeur et lancement notifié au contrôleur, suivi temps réel, puis saisie terrain des points de contrôle du référentiel Encaisses.json (Trésorerie et Financement, Philatélie, Gestion de la Sûreté), archivage, modification et suivi.',
                utilisateurs: [
                    { profil: 'Chef de service (Siège)', droits: 'Prépare des lots de vérifications (Étape 1), soumet au Directeur, puis lance individuellement (« Exécuter la vérification ») ou diffuse globalement (« Diffuser les missions ») ses campagnes validées à l’Étape 2. Voit toutes les planifications FV et notifications Siège.' },
                    { profil: 'Directeur (directeur-001)', droits: 'Dispose de l’Espace Directeur FV (édition inline, ajout/suppression de lignes, Validation, Notification Siège) en plus du Workflow 2 étapes et du suivi complet.' },
                    { profil: 'Administrateur (admin-siege)', droits: 'Workflow 2 étapes complet, Espace Directeur FV en lecture seule (si ≥ 1 campagne), lancement/diffusion/suppression sur toutes les planifications FV.' },
                    { profil: 'Contrôleur Régional', droits: 'Ne voit pas le Workflow Siège ni l’Espace Directeur. Reçoit les notifications de lancement de vérification (« Ouvrir la vérification »), consulte ses vérifications assignées dans le tableau de suivi (« Ouvrir », « Clôturer » / « Remettre En cours ») et réalise la saisie / modification sur son périmètre régional.' }
                ],
                interfaceZones: [
                    { zone: 'Espace Planification & Suivi FV', desc: 'Regroupe : (1) Bannière Notifications FV (lancements ciblés pour contrôleurs + validations Siège), (2) Espace Directeur FV (Directeur + lecture Admin), (3) Workflow Siège 2 étapes (Onglet 1 Préparation lot / Onglet 2 Diffusion & bouton « Exécuter la vérification »), (4) Tableau de suivi temps réel 7 colonnes.' },
                    { zone: 'Espace Saisie de la Vérification', desc: '8 champs d’en-tête (Région *, Centre *, Date vérif. *, Dates début/fin *, Contrôleur *, Vérification, Chef de centre facultatif) et badge interrégional / Siège.' },
                    { zone: 'Espace Modification / Suivi & Suppression (BDD)', desc: '4 filtres croisés (Date, Région, Site vérifié, Processus vérifié) et bouton « Charger depuis BDD ».' },
                    { zone: 'Bandeau Suivi + 5 KPI + Sélection Référence (Encaisses.json)', desc: 'Compteurs par statut, 5 KPI, sélection en cascade Processus → Risque → Contrôle avec aperçu du PC et bouton « Ajouter ce point ».' },
                    { zone: 'Cartes PC (multi-constats) & Synthèse globale', desc: 'Chaque PC peut contenir un ou plusieurs constats (« Ajouter un autre constat à ce point »), avec 5 actions par PC et synthèse globale du centre.' }
                ],
                illustration: {
                    code: 'CAP-04',
                    titre: 'Feuille 4 : Fiche de Vérification des Encaisses (FicheEncaisses.html)',
                    imageSrc: '',
                    layoutType: 'ficheencaisses',
                    markers: [
                        { num: 1, x: 50, y: 14, label: 'Notifications & Espace Directeur FV', detail: 'Notifie les comptes Siège après validation et notifie nominativement le contrôleur au lancement (« Ouvrir la vérification »).' },
                        { num: 2, x: 50, y: 31, label: 'Workflow Siège FV (2 étapes) & Tableau de suivi', detail: 'Préparation lot → Validation → Exécuter la vérification / Diffuser → Suivi temps réel (En cours / Clôturé).' },
                        { num: 3, x: 50, y: 49, label: 'Espace Saisie & Espace Modification BDD', detail: 'Pré-rempli automatiquement lors du clic sur « Ouvrir » depuis une notification ou le tableau de suivi.' },
                        { num: 4, x: 50, y: 66, label: 'Sélection Référence (Encaisses.json)', detail: 'Cascade Processus → Risque → Contrôle puis « Ajouter ce point ».' },
                        { num: 5, x: 50, y: 84, label: 'Cartes PC (multi-constats) & 5 boutons d’action', detail: 'Saisie Pop/Ech/OK/KO/Statut/Textes, ajout d’un autre constat, Archiver / Modifier / Suivi / Vider / Supprimer.' }
                    ]
                },
                boutons: [
                    { nom: 'Ajouter une affectation / Soumettre pour validation (Étape 1)', zone: 'Workflow Siège FV', profils: ['ADMIN', 'DIRECTEUR', 'CHEF_SERVICE'], conditions: 'Centre, Contrôleur et Dates valides', effet: 'Constitue un lot d’affectations FV puis crée la campagne CAMP-FV-* au statut SOUMISE pour directeur-001.' },
                    { nom: 'Valider la planification / Notifier les collaborateurs', zone: 'Espace Directeur FV', profils: ['DIRECTEUR'], conditions: 'Campagne SOUMISE (Valider) / VALIDEE ou DIFFUSEE (Notifier)', effet: 'Valide la campagne FV et envoie une notification récapitulative à tous les comptes Siège.' },
                    { nom: 'Exécuter la vérification / Relancer', zone: 'Étape 2 & Tableau Suivi', profils: ['ADMIN', 'DIRECTEUR', 'CHEF_SERVICE'], conditions: 'Campagne validée (ou ligne suivi non clôturée)', effet: 'Crée/active la planification FV (PLAN-FV-*) et envoie une notification directe de lancement au contrôleur concerné.' },
                    { nom: 'Diffuser les missions', zone: 'Étape 2', profils: ['ADMIN', 'DIRECTEUR', 'CHEF_SERVICE'], conditions: 'Campagne VALIDEE (Chef : ses campagnes uniquement)', effet: 'Envoie simultanément toutes les vérifications non encore lancées aux contrôleurs concernés et passe la campagne à DIFFUSEE.' },
                    { nom: 'Ouvrir la vérification / Ouvrir', zone: 'Bannière Notifs / Tableau Suivi', profils: ['ALL'], conditions: 'Notification lancement ou ligne suivi', effet: 'Marque la notification lue, pré-remplit l’Espace Saisie (Région, Centre, Dates, Contrôleur) et fait défiler jusqu’à la saisie.' },
                    { nom: 'Clôturer / Remettre En cours', zone: 'Tableau Suivi', profils: ['ALL'], conditions: 'Ligne présente dans le suivi', effet: 'Bascule manuellement l’état d’avancement de la vérification planifiée (EN_COURS ↔ CLOTURE).' },
                    { nom: 'Supprimer (corbeille suivi)', zone: 'Tableau Suivi', profils: ['ADMIN', 'DIRECTEUR', 'CHEF_SERVICE'], conditions: 'Comptes Siège uniquement', effet: 'Supprime la planification FV de la BDD (et de GitHub si token actif) sans confirmation.' },
                    { nom: 'Ajouter ce point / Ajouter un autre constat à ce point', zone: 'Référence & Carte PC', profils: ['ALL'], conditions: 'Contrôle sélectionné / Carte PC ouverte', effet: 'Ajoute le PC issu d’Encaisses.json à la fiche ou ajoute un constat supplémentaire sous un même PC.' },
                    { nom: 'Archiver / Modifier / Suivi / Vider / Supprimer (par PC)', zone: 'Carte PC', profils: ['ALL'], conditions: 'Région, Centre, Contrôleur requis (+ modification pour Modifier/Suivi)', effet: 'Enregistre/met à jour/crée un suivi dans db.constatsEncaisses et retire le PC de la fiche (Archiver clôture automatiquement la planification FV correspondante). Vider PC reste purement local.' },
                    { nom: 'Charger depuis BDD / Imprimer / PDF', zone: 'Modif BDD / En-tête', profils: ['ALL'], conditions: '≥ 1 filtre pour BDD', effet: 'Recharge les constats FV existants ou imprime la fiche.' }
                ],
                champs: [
                    { nom: 'Planification FV (5 champs)', type: 'Listes + Dates', obligatoire: 'Tous obligatoires', valeurs: 'Centre ciblé (148 entrées), Région (auto), Contrôleur affecté, Date début, Date fin (≥ début)', regles: 'Utilisés à l’Étape 1 Siège.' },
                    { nom: 'Espace Saisie FV (8 champs)', type: 'Listes + Dates + Texte', obligatoire: 'Région, Centre et Contrôleur bloquants', valeurs: 'Région (11), Centre, Date vérif., Dates début/fin, Contrôleur, Type (Vérification), Chef de centre (facultatif)', regles: 'Modifier Date vérification met à jour la date de tous les PC/constats ouverts.' },
                    { nom: 'Sélection Référence (Encaisses.json)', type: '3 listes en cascade', obligatoire: 'Pour ajouter un PC', valeurs: '3 processus : Trésorerie et Financement, Philatélie, Gestion de la Sûreté', regles: 'Affiche l’aperçu du point de contrôle avant ajout.' },
                    { nom: 'Champs Constat FV (Pop., Ech., OK, KO, Statut, Textes)', type: 'Nombres + Liste + Textareas', obligatoire: 'Statut (défaut En cours)', valeurs: 'Ech ≤ Pop (si Pop > 0) ; OK ≤ Ech ; KO = max(0, Ech - OK)', regles: 'Particularité : si Ech > 0, TC = (OK / Ech) × 100 ; si Ech = 0 à l’ajout, TC vaut 100 % par défaut (pensez à renseigner Pop/Ech/OK avant d’archiver). Aucun tableau de billetage financier séparé n’existe : les vérifications sont saisies via ces indicateurs.' }
                ],
                procedures: [
                    {
                        titre: 'Planifier, valider et lancer une Vérification des Encaisses (Siège)',
                        profils: ['CHEF_SERVICE', 'DIRECTEUR', 'ADMIN'],
                        etapes: [
                            'Étape 1 : renseignez Centre, Contrôleur, Dates début/fin, cliquez sur « Ajouter une affectation » puis « Soumettre pour validation ».',
                            'Directeur : dans l’Espace Directeur FV, ajustez si nécessaire puis cliquez sur « Valider la planification » et « Notifier les collaborateurs ».',
                            'Étape 2 : cliquez sur « Exécuter la vérification » sur une ligne précise (ou « Diffuser les missions » pour tout envoyer) afin de notifier immédiatement le contrôleur.'
                        ],
                        resultat: 'La mission apparaît dans le tableau de suivi avec le badge « Lancée » et le contrôleur reçoit une notification avec bouton « Ouvrir la vérification ».'
                    },
                    {
                        titre: 'Réaliser et archiver une Vérification des Encaisses (Contrôleur)',
                        profils: ['CONTROLEUR', 'ALL'],
                        etapes: [
                            'Cliquez sur « Ouvrir la vérification » dans votre notification (ou « Ouvrir » dans le tableau de suivi) pour pré-remplir l’Espace Saisie.',
                            'Dans « Sélection Référence (Encaisses.json) », sélectionnez Processus → Risque → Contrôle puis cliquez sur « Ajouter ce point » pour chaque point vérifié.',
                            'Renseignez Pop., Ech., OK, Statut constat, Constat et Recommandation (ajoutez un autre constat si besoin).',
                            'Cliquez sur « Archiver » sur chaque PC vérifié.'
                        ],
                        resultat: 'Les constats sont enregistrés en BDD (constatsEncaisses), synchronisés sur GitHub si configuré, et la planification FV passe en statut Clôturé.'
                    }
                ],
                erreursPrecautions: [
                    { type: 'precaution', titre: 'Clôture automatique dès le 1er PC archivé', detail: 'Archiver un premier PC clôture automatiquement la ligne de planification FV dans le tableau de suivi.', solution: 'Si vous avez plusieurs PC à vérifier sur une même mission, vous pouvez continuer à les ajouter et les archiver (ou cliquer sur « Remettre En cours » si vous reprenez plus tard).' },
                    { type: 'precaution', titre: 'Renseigner les champs avant d’archiver (taux 100 % par défaut)', detail: 'Sur la Feuille 4, un PC ajouté sans saisie affiche 100 % et peut être archivé avec des textes par défaut.', solution: 'Saisissez toujours Pop., Ech., OK, Constat et Recommandation avant de cliquer sur Archiver.' },
                    { type: 'precaution', titre: 'Boutons « Vider » de sous-espaces (Saisie, Modif, Référence, Points)', detail: 'Ces boutons appellent le vidage/masquage global de la BDD FV (après confirmation), contrairement au bouton « Vider » d’une carte PC individuelle.', solution: 'Utilisez le bouton « Vider » de la carte PC pour réinitialiser une saisie locale sans affecter la BDD.' },
                    { type: 'limite', titre: 'Limites connues sur FV (Export Excel & 2 PC de Encaisses.json)', detail: '(1) Le bouton « Exporter Excel » de la Feuille 4 rencontre une limite technique ; exportez depuis la Feuille 5 (BDD) ou imprimez en PDF. (2) Dans la sélection en cascade d’Encaisses.json, 2 PC partageant le même intitulé de contrôle (versements EMS-Chronopost et chèques bancaires compte BAM) pointent actuellement sur le premier PC du même intitulé : précisez le détail dans le texte du Constat si besoin.', solution: 'Utilisez « Ajouter un autre constat à ce point » sur le contrôle concerné pour documenter distinctement chaque type de versement.' }
                ]
            },

            // -----------------------------------------------------------------
            // FEUILLE 5 : BASE DE DONNÉES CENTRALISÉE (BDD.html)
            // -----------------------------------------------------------------
            {
                id: 'bdd',
                code: 'Feuille 5',
                nom: 'Base de Données (BDD)',
                fichier: 'BDD.html',
                icone: 'fa-database',
                profils: ['ALL'],
                badgeAcces: 'Tous profils (périmètre adapté)',
                badgeClass: 'badge-prof-all',
                objectif: 'Consulter en lecture seule la table unifiée de tous les constats FC (Feuille 3) et FV (Feuille 4) accessibles à votre profil, appliquer des filtres croisés sur 8 axes, exporter les données (Excel, PDF, JSON) et gérer la synchronisation avec les archives mensuelles GitHub (FCI-APP/FCI-audit-archives).',
                utilisateurs: [
                    { profil: 'Siège (Admin, Directeur, Chefs de service)', droits: 'Visibilité globale sur les données internes du Siège (avec badge « Siège ») et sur les 10 régions. L’export Excel comporte 20 colonnes (inclut « Espace ») et l’export JSON inclut les 6 collections complètes.' },
                    { profil: 'Contrôleur Régional', droits: 'Visibilité strictement limitée à sa région d’affectation et aux missions interrégionales effectuées par/dans sa région (les données internes du Siège sont masquées). Export Excel à 19 colonnes ; export JSON limité aux 3 collections de constats/missions.' }
                ],
                interfaceZones: [
                    { zone: 'En-tête, pastille d’espace & statut stockage', desc: 'Affiche votre espace actif, l’état du stockage local (IndexedDB, volume utilisé / quota), le dépôt GitHub configuré, l’état du token et les 9 boutons d’action.' },
                    { zone: 'Barre multi-filtres (8 axes croisés)', desc: 'Date début, Date fin, Région, Site, Processus, Statut, Type de contrôle et Contrôleur avec compteurs dynamiques mis à jour en cascade.' },
                    { zone: 'Tableau unifié 16 colonnes', desc: 'Date, Région (+ badges Siège / Planifié Siège / Ctrl), Centre, Contrôleur, Processus, Risque, Contrôle, PC, Pop, Ech, OK, KO, TC (%), Constat, Statut constat, Type de contrôle (+ tags Modifié / Suivi). Lignes colorées selon le type.' }
                ],
                illustration: {
                    code: 'CAP-05',
                    titre: 'Feuille 5 : Base de Données Centralisée (BDD.html)',
                    imageSrc: '',
                    layoutType: 'bdd',
                    markers: [
                        { num: 1, x: 30, y: 14, label: 'Pastille espace & ligne d’état Stockage / GitHub', detail: 'Indique le moteur IndexedDB, le dépôt cible (FCI-APP/FCI-audit-archives) et si le Token GitHub est actif.' },
                        { num: 2, x: 75, y: 16, label: 'Barre des 9 boutons d’actions', detail: 'Actualiser, Token GitHub, Dépôt Archive, Archiver → GitHub, Charger Archives, Vider la BDD, Excel, PDF, JSON.' },
                        { num: 3, x: 50, y: 38, label: '8 filtres croisés dynamiques', detail: 'Date début, Date fin, Région, Site, Processus, Statut, Type de contrôle, Contrôleur.' },
                        { num: 4, x: 50, y: 70, label: 'Tableau unifié 16 colonnes (FC + FV)', detail: 'Lecture seule avec badges de statut, origine, Modifié et Suivi ; trié chronologiquement.' }
                    ]
                },
                boutons: [
                    { nom: 'Actualiser', zone: 'En-tête', profils: ['ALL'], conditions: 'Toujours actif', effet: 'Recharge la page et réinitialise les 8 filtres.' },
                    { nom: 'Token GitHub', zone: 'En-tête', profils: ['ADMIN', 'DIRECTEUR', 'CHEF_SERVICE'], conditions: 'Recommandé Administrateur / Siège (visible tous comptes)', effet: 'Ouvre une boîte de saisie pour enregistrer localement votre Fine-grained Personal Access Token (droits Contents: Read & Write) sur le poste.' },
                    { nom: 'Dépôt Archive', zone: 'En-tête', profils: ['ADMIN', 'DIRECTEUR', 'CHEF_SERVICE'], conditions: 'Recommandé Administrateur / Siège', effet: 'Configure le dépôt cible proprietaire/depot (défaut : FCI-APP/FCI-audit-archives) et la branche (défaut : main).' },
                    { nom: 'Archiver BDD → GitHub', zone: 'En-tête', profils: ['ADMIN', 'DIRECTEUR', 'CHEF_SERVICE'], conditions: 'Token GitHub requis (demandé si absent)', effet: 'Pousse en lots mensuels (archives/AAAA/MM/) les données de votre périmètre vers GitHub, par fusion sans écrasement.' },
                    { nom: 'Charger Archives GitHub', zone: 'En-tête', profils: ['ADMIN', 'DIRECTEUR', 'CHEF_SERVICE'], conditions: 'Token GitHub requis', effet: 'Télécharge et fusionne toutes les archives mensuelles GitHub dans la BDD locale IndexedDB, puis rafraîchit l’affichage filtré selon votre profil.' },
                    { nom: 'Vider la BDD', zone: 'En-tête', profils: ['ALL'], conditions: 'Confirmation obligatoire', effet: 'Scope ALL : en Admin, supprime physiquement les 6 collections locales pour les 41 comptes (sans toucher GitHub) ; en non-Admin, masque toutes les données visibles dans votre compte uniquement.' },
                    { nom: 'Télécharger fichier Excel', zone: 'En-tête', profils: ['ALL'], conditions: '≥ 1 ligne affichée', effet: 'Exporte uniquement les lignes actuellement filtrées dans FCI_BDD_Constats_AAAA-MM-JJ.xlsx (onglet BDD_Constats).' },
                    { nom: 'Imprimer PDF', zone: 'En-tête', profils: ['ALL'], conditions: 'Toujours actif', effet: 'Imprime la table filtrée en masquant le menu latéral et les boutons.' },
                    { nom: 'Exporter (JSON)', zone: 'En-tête', profils: ['ALL'], conditions: 'Toujours actif', effet: 'Télécharge une sauvegarde brute FCI_BDD_Backup_AAAA-MM-JJ.json de votre périmètre complet (ignore les filtres écran).' }
                ],
                champs: [
                    { nom: 'Date début & Date fin', type: '2 listes de dates', obligatoire: 'Facultatif', valeurs: 'Dates présentes en BDD (JJ/MM/AAAA)', regles: 'ATTENTION : choisir uniquement « Date début » filtre sur cette date EXACTE ; choisir uniquement « Date fin » filtre toutes les dates ≤ Date fin ; renseigner les deux filtre l’intervalle inclusif.' },
                    { nom: 'Région / Site / Processus / Statut / Type / Contrôleur', type: '6 listes croisées', obligatoire: 'Facultatif', valeurs: 'Valeurs réellement présentes dans le sous-ensemble actif', regles: 'Les filtres se mettent à jour mutuellement ; si un critère devient incompatible, il revient automatiquement sur « Tous ».' }
                ],
                procedures: [
                    {
                        titre: 'Filtrer et exporter les constats en Excel',
                        profils: ['ALL'],
                        etapes: [
                            'Sélectionnez vos critères dans la barre de 8 filtres (ex. une période Date début + Date fin, une Région, un Statut « Non clôturé »).',
                            'Vérifiez le compteur « N ligne(s) » et l’aperçu dans le tableau.',
                            'Cliquez sur « Télécharger fichier Excel » (pour un fichier .xlsx filtré) ou « Imprimer PDF ».'
                        ],
                        resultat: 'Le fichier FCI_BDD_Constats_AAAA-MM-JJ.xlsx est téléchargé avec exactement les lignes filtrées.'
                    },
                    {
                        titre: 'Configurer GitHub et synchroniser les archives (Recommandé Admin / Siège)',
                        profils: ['ADMIN', 'DIRECTEUR', 'CHEF_SERVICE'],
                        etapes: [
                            'Cliquez sur « Dépôt Archive » et vérifiez FCI-APP/FCI-audit-archives (branche main).',
                            'Cliquez sur « Token GitHub » et collez votre Fine-grained Personal Access Token (droits Contents: Read & Write). Vérifiez que la ligne de statut indique « Archivage GitHub actif ».',
                            'Cliquez sur « Archiver BDD → GitHub » pour sauvegarder vos données locales, ou sur « Charger Archives GitHub » pour restaurer l’historique sur un nouveau poste.'
                        ],
                        resultat: 'Un message récapitule le nombre de fichiers mensuels archivés ou restaurés (FC, FV, Planifications).'
                    }
                ],
                erreursPrecautions: [
                    { type: 'precaution', titre: 'Portée globale de « Vider la BDD »', detail: 'Ce bouton vide/masque également les Planifications, Campagnes et Notifications (scope ALL), et pas seulement les constats.', solution: 'Faites toujours un « Exporter (JSON) » ou « Archiver BDD → GitHub » avant d’utiliser « Vider la BDD ».' },
                    { type: 'precaution', titre: 'Boutons GitHub sur les comptes non-Admin', detail: 'La configuration du token et du dépôt GitHub est destinée en priorité à l’Administrateur et au Siège. Ne partagez jamais un Personal Access Token.', solution: 'Les contrôleurs régionaux n’ont pas à modifier le dépôt d’archive sauf consigne explicite de l’Administrateur.' },
                    { type: 'limite', titre: 'Pas de bouton « Réinitialiser les filtres » dédié ni d’import JSON', detail: 'Pour remettre rapidement les 8 filtres à « Tous », utilisez le bouton « Actualiser » (en-tête) ou repositionnez chaque liste sur sa première option.', solution: 'Pour recharger des archives, utilisez « Charger Archives GitHub ».' },
                    { type: 'erreur', titre: 'Erreurs GitHub HTTP 401 / 403 / 404', detail: '401 : token expiré ou invalide. 403 : token sans permission Contents (Read & Write). 404 : nom de dépôt ou branche incorrect.', solution: 'Vérifiez le dépôt via « Dépôt Archive » et régénérez un token Fine-grained valide via « Token GitHub ».' }
                ]
            },

            // -----------------------------------------------------------------
            // FEUILLE 6 : TABLEAU DE BORD — ANALYSE & PILOTAGE (TDB.html)
            // -----------------------------------------------------------------
            {
                id: 'tdb',
                code: 'Feuille 6',
                nom: 'Tableau de Bord (TDB)',
                fichier: 'TDB.html',
                icone: 'fa-chart-line',
                profils: ['ALL'],
                badgeAcces: 'Tous profils (National = Siège seul)',
                badgeClass: 'badge-prof-all',
                objectif: 'Fournir un pilotage décisionnel multi-niveaux (Centre / Site, Régional, National) consolidant les performances de conformité (FC & FV), la clôture, l’avancement des planifications, la couverture territoriale des 135 centres sur 10 régions, la participation des contrôleurs et les alertes automatiques sous le seuil de 75 %.',
                utilisateurs: [
                    { profil: 'Siège (Admin, Directeur, Chefs de service)', droits: 'Accès aux 3 niveaux (Niveau National actif par défaut), visibilité complète Siège + 10 régions, badge Rang National, export Excel complet (colonne Espace incluse) et export JSON complet.' },
                    { profil: 'Contrôleur Régional', droits: 'L’onglet « Niveau National » est désactivé ; la page s’ouvre automatiquement sur « Niveau Régional ». Le filtre Région est verrouillé sur sa région d’affectation (ou limité à ses régions en cas de missions interrégionales). Données internes Siège strictement masquées.' }
                ],
                interfaceZones: [
                    { zone: 'Barre de pilotage (3 onglets + 10 filtres globaux)', desc: 'Onglets Centre / Site, Régional, National (Siège seul), indicateur de périmètre, bouton Réinitialiser et 10 filtres croisés.' },
                    { zone: '5 cartes KPI & Descriptions analytiques', desc: 'Volume (FC/FV), Taux de Conformité Pondéré, Taux de Clôture, Anomalies (KO), et Évolution / Taux de Couverture + synthèse textuelle auto-générée.' },
                    { zone: 'Synthèse Consolidée Planification FC & FV', desc: '5 filtres dédiés, 4 mini-KPI, 2 barres d’avancement séparées (FC vs FV) et tableau consolidé 9 colonnes.' },
                    { zone: 'Benchmark 3 niveaux & Détection d’Alertes', desc: 'Comparaison Sélection vs Moyenne Régionale vs Moyenne Nationale/Référence + jusqu’à 4 alertes automatiques (seuil TC < 75 %).' },
                    { zone: '4 Graphiques principaux + Section Couverture & Classements', desc: 'Chart.js : Comparatif TC, Processus/PC, Statuts (doughnut), Évolution TC & KO (bi-axe). En Régional/National uniquement : Graphique Couverture, Classement Régions, Top 12 Centres et Tableau nominal de Couverture (avec 3 filtres propres par défaut sur l’année civile en cours).' },
                    { zone: 'Tableaux détaillés (Classement, Participation, Croisé, Constats)', desc: 'Classement & Évolution, Analyse de la Participation des Contrôleurs, Synthèse par Type & Top 6 Processus sensibles, et Table détaillée des constats (14 colonnes).' }
                ],
                illustration: {
                    code: 'CAP-06',
                    titre: 'Feuille 6 : Tableau de Bord — Analyse & Pilotage (TDB.html)',
                    imageSrc: '',
                    layoutType: 'tdb',
                    markers: [
                        { num: 1, x: 75, y: 11, label: 'Actions d’export & Actualiser', detail: 'Télécharger Excel (6 à 7 onglets), Imprimer PDF (A4 paysage), Actualiser, Exporter JSON (prudence sur Vider TDB).' },
                        { num: 2, x: 45, y: 26, label: 'Onglets 3 niveaux & 10 filtres globaux', detail: 'Centre / Site, Régional, National (verrouillé pour les contrôleurs) + filtres en cascade.' },
                        { num: 3, x: 50, y: 42, label: '5 KPI clés & Synthèse Planification FC/FV', detail: 'TC pondéré = ΣOK / ΣEch × 100, Taux clôture, KO, Couverture et avancement des missions planifiées.' },
                        { num: 4, x: 50, y: 63, label: 'Alertes (< 75 %) & Graphiques Chart.js', detail: 'Comparatif, Processus, Statuts, Évolution chronologique et Classements.' },
                        { num: 5, x: 50, y: 84, label: 'Couverture territoriale (filtres dédiés) & Participation', detail: 'Liste nominale des centres contrôlés (FC), vérifiés (FV) et non contrôlés + participation des contrôleurs.' }
                    ]
                },
                boutons: [
                    { nom: 'Niveau Centre / Site · Niveau Régional · Niveau National', zone: 'Barre de pilotage', profils: ['ALL'], conditions: 'Niveau National réservé au Siège', effet: 'Adapte les filtres actifs, les KPI, les graphiques, la section Couverture (masquée en Centre) et les colonnes des tableaux.' },
                    { nom: 'Réinitialiser (Barre globale)', zone: 'Barre de pilotage', profils: ['ALL'], conditions: 'Toujours actif', effet: 'Remet tous les filtres globaux, planification et couverture à leurs valeurs par défaut (en conservant le verrouillage région si contrôleur mono-région).' },
                    { nom: 'Réinitialiser (Synthèse Planification)', zone: 'Section Planification', profils: ['ALL'], conditions: 'Toujours actif', effet: 'Remet les 5 filtres propres de la synthèse planification sur « Tous ».' },
                    { nom: 'Année en cours', zone: 'Section Couverture', profils: ['ALL'], conditions: 'Niveaux Régional & National uniquement', effet: 'Réinitialise les filtres de couverture sur du 01/01 au 31/12 de l’année en cours et tous types.' },
                    { nom: 'Télécharger Excel', zone: 'En-tête', profils: ['ALL'], conditions: 'Bibliothèque SheetJS chargée', effet: 'Génère un classeur multi-onglets (FCI_Analyse_Pilotage_<NIVEAU>_<DATE>.xlsx) de 6 à 7 feuilles (KPIs, Classements, Couverture, Participation, Détail, Planifications).' },
                    { nom: 'Imprimer PDF', zone: 'En-tête', profils: ['ALL'], conditions: 'Toujours actif', effet: 'Ouvre l’impression navigateur mise en page en format A4 paysage.' },
                    { nom: 'Exporter (JSON)', zone: 'En-tête', profils: ['ALL'], conditions: 'Toujours actif', effet: 'Exporte la base JSON accessible (complet Siège ou 4 collections Régional).' },
                    { nom: 'Actualiser', zone: 'En-tête', profils: ['ALL'], conditions: 'Toujours actif', effet: 'Recharge entièrement la page et ses données.' },
                    { nom: 'Vider TDB', zone: 'En-tête', profils: ['ALL'], conditions: 'Confirmation obligatoire', effet: 'ATTENTION CRITIQUE : ce bouton appelle le vidage global ALL de la BDD (suppression définitive 41 comptes en Admin, ou masquage sur TOUTES les feuilles en non-Admin) et ne se limite pas à l’affichage du TDB.' }
                ],
                champs: [
                    { nom: '10 filtres globaux en cascade', type: '10 listes déroulantes', obligatoire: 'Facultatif', valeurs: 'Région, Centre/Site (actif en Centre uniquement), Date début, Date fin, Type, Processus, Contrôle, PC, Statut, Contrôleur', regles: 'Comme en BDD, « Date début » seule filtre la date exacte. Ces filtres n’affectent pas les sections autonomes Planification (sauf Région/Centre) ni Couverture.' },
                    { nom: '5 filtres Synthèse Planification', type: '5 listes déroulantes', obligatoire: 'Facultatif', valeurs: 'Région, Centre/Site, Contrôleur, Nature (FC / FV), État (En cours / Clôturé)', regles: 'Pilotent uniquement les 4 mini-KPI, les 2 barres FC/FV et le tableau de planification.' },
                    { nom: '3 filtres dédiés Couverture', type: '2 Dates + 1 Liste', obligatoire: 'Facultatif (défaut année en cours)', valeurs: 'Date début (01/01), Date fin (31/12), Type (Tous / Thématique / Systématique / Vérification)', regles: 'Pilotent uniquement le graphique et le tableau nominal de couverture (10 régions / 135 centres).' },
                    { nom: 'Formules de calcul clés', type: 'Indicateurs calculés', obligatoire: 'Automatique', valeurs: 'TC pondéré = (ΣOK / ΣEch) × 100 ; Clôture = (Clôturés / Total) × 100 ; Évolution = TC dernière date − TC dates antérieures ; Alerte si TC < 75 %', regles: 'Criticité : Critique (TC < 60 ou KO ≥ 10), Élevé (TC < 80 ou KO ≥ 5), Modéré (TC < 95), Faible (TC ≥ 95 et KO < 5).' }
                ],
                procedures: [
                    {
                        titre: 'Analyser les performances et exporter un reporting Excel/PDF',
                        profils: ['ALL'],
                        etapes: [
                            'Choisissez le niveau d’analyse souhaité (Centre / Site, Régional, ou National pour le Siège).',
                            'Affinez les filtres (période Date début + Date fin, Région, Centre, Processus ou Type de contrôle).',
                            'Consultez les 5 KPI, les alertes automatiques (< 75 %), le benchmark, les graphiques et le tableau de couverture.',
                            'Cliquez sur « Télécharger Excel » (classeur 6 à 7 onglets) ou « Imprimer PDF » (A4 paysage).'
                        ],
                        resultat: 'Vous obtenez un rapport consolidé chiffré prêt pour diffusion ou comité de pilotage.'
                    }
                ],
                erreursPrecautions: [
                    { type: 'precaution', titre: 'AVERTISSEMENT IMPORTANT : ne pas utiliser « Vider TDB » pour effacer les filtres', detail: 'Malgré son infobulle, le bouton « Vider TDB » déclenche un vidage/masquage complet de toute la base de données (y compris BDD et Planification).', solution: 'Pour remettre les filtres du Tableau de Bord à zéro, utilisez exclusivement le bouton « Réinitialiser » situé dans la barre de pilotage.' },
                    { type: 'limite', titre: 'Écart possible entre la carte KPI Couverture et le Tableau de Couverture', detail: 'La 5e carte KPI applique les 10 filtres globaux, tandis que le Tableau et le Graphique de Couverture utilisent leurs 3 filtres autonomes (initialisés sur l’année civile en cours).', solution: 'Alignez les dates entre la barre globale et la barre Couverture si vous souhaitez comparer les deux valeurs sur la même période.' },
                    { type: 'limite', titre: 'Pas de drill-down au clic sur les graphiques', detail: 'Cliquer sur une barre ou un secteur ne change pas de niveau automatiquement.', solution: 'Utilisez les 3 onglets de niveau et les listes Région / Centre pour descendre au niveau détaillé.' },
                    { type: 'erreur', titre: 'Alerte « La bibliothèque Excel (SheetJS) n’est pas chargée. »', detail: 'Connexion Internet absente empêchant le chargement du CDN SheetJS.', solution: 'Vérifiez votre accès réseau puis cliquez sur « Actualiser » avant de relancer l’export Excel.' }
                ]
            }
        ],

        // =====================================================================
        // RUBRIQUE 5 : PROCÉDURES DE TRAVAIL COMPLÈTES (GU-05)
        // =====================================================================
        workflows: [
            {
                id: 'wf-a',
                code: 'Parcours A',
                titre: 'Cycle complet d’un Contrôle Permanent planifié par le Siège (FC)',
                profils: ['CHEF_SERVICE', 'DIRECTEUR', 'CONTROLEUR', 'ADMIN'],
                resume: 'De la préparation multi-processus au Siège jusqu’à la consolidation dans la BDD et le Tableau de Bord.',
                etapes: [
                    { num: 1, feuille: 'Feuille 2 — Planification', acteur: 'Chef de service (ou Admin/Directeur)', action: 'Sélectionnez les processus dans l’Étape 1A, composez les affectations (centres, contrôleurs, dates) dans l’Étape 1B, puis cliquez sur « Soumettre pour validation ».', resultat: 'Campagne enregistrée au statut SOUMISE chez directeur-001.' },
                    { num: 2, feuille: 'Feuille 2 — Planification', acteur: 'Directeur (directeur-001)', action: 'Contrôlez ou ajustez les affectations dans l’Espace Directeur, cliquez sur « Valider la planification » puis sur « Notifier les collaborateurs ».', resultat: 'Campagne VALIDEE et notification officielle reçue par les 7 comptes Siège.' },
                    { num: 3, feuille: 'Feuille 2 — Planification', acteur: 'Chef de service auteur (ou Directeur/Admin)', action: 'Ouvrez l’onglet « 2 — Diffusion de la planification validée » et cliquez sur « Diffuser les missions ».', resultat: 'Chaque contrôleur désigné reçoit sa mission individuellement (statut DIFFUSEE).' },
                    { num: 4, feuille: 'Feuille 3 — Fiche de Contrôle', acteur: 'Contrôleur désigné', action: 'Ouvrez la mission (préchargée automatiquement ou via « Exécuter FC »), saisissez chaque PC (Pop, Ech, OK, Statut, Constat, Recommandation) puis cliquez sur « Archiver » PC par PC.', resultat: 'Constats enregistrés en BDD et retirés un à un de la fiche.' },
                    { num: 5, feuille: 'Feuilles 5 & 6 — BDD & TDB', acteur: 'Contrôleur & Siège', action: 'Vérifiez les constats dans la BDD (Feuille 5) et analysez les indicateurs dans le TDB (Feuille 6).', resultat: 'Taux de conformité, clôture, couverture et participation mis à jour automatiquement.' }
                ]
            },
            {
                id: 'wf-b',
                code: 'Parcours B',
                titre: 'Cycle complet d’une Vérification des Encaisses (FV)',
                profils: ['CHEF_SERVICE', 'DIRECTEUR', 'CONTROLEUR', 'ADMIN'],
                resume: 'Planification en 2 étapes dans la Feuille 4, notification de lancement au contrôleur et saisie des constats Encaisses.json.',
                etapes: [
                    { num: 1, feuille: 'Feuille 4 — Vérification Encaisses', acteur: 'Chef de service (Siège)', action: 'Dans l’Étape 1 FV, ajoutez les affectations (Centre, Contrôleur, Dates) puis cliquez sur « Soumettre pour validation ».', resultat: 'Campagne CAMP-FV-* créée au statut SOUMISE.' },
                    { num: 2, feuille: 'Feuille 4 — Vérification Encaisses', acteur: 'Directeur (directeur-001)', action: 'Vérifiez les lignes dans l’Espace Directeur FV, cliquez sur « Valider la planification » puis « Notifier les collaborateurs ».', resultat: 'Campagne VALIDEE et visible à l’Étape 2.' },
                    { num: 3, feuille: 'Feuille 4 — Vérification Encaisses', acteur: 'Chef de service auteur (ou Directeur/Admin)', action: 'À l’Étape 2 (ou depuis le tableau de suivi), cliquez sur « Exécuter la vérification » (envoi ciblé) ou « Diffuser les missions » (envoi global).', resultat: 'Le contrôleur reçoit une notification de lancement dans sa Feuille 4.' },
                    { num: 4, feuille: 'Feuille 4 — Vérification Encaisses', acteur: 'Contrôleur désigné', action: 'Cliquez sur « Ouvrir la vérification », ajoutez les PC depuis « Sélection Référence (Encaisses.json) », saisissez les indicateurs/constats et cliquez sur « Archiver » pour chaque PC.', resultat: 'Constats FV enregistrés dans la BDD et mission passée à Clôturé.' }
                ]
            },
            {
                id: 'wf-c',
                code: 'Parcours C',
                titre: 'Réaliser un contrôle régional direct (sans mandat Siège)',
                profils: ['CONTROLEUR'],
                resume: 'Lancement autonome d’un contrôle permanent par un contrôleur dans sa région ou en mission interrégionale.',
                etapes: [
                    { num: 1, feuille: 'Feuille 2 — Planification', acteur: 'Contrôleur Régional', action: 'Vérifiez que des PC sont présents et cochés, puis remplissez les 6 champs de « Informations Générales de la Mission » (Région, Entité, Type, Début, Fin, Contrôleur).', resultat: 'Formulaire prêt pour lancement.' },
                    { num: 2, feuille: 'Feuille 2 → Feuille 3', acteur: 'Contrôleur Régional', action: 'Cliquez sur « Lancer la Fiche de Contrôle ».', resultat: 'Mission créée dans db.missions et ouverture automatique de FicheControle.html.' },
                    { num: 3, feuille: 'Feuille 3 — Fiche de Contrôle', acteur: 'Contrôleur Régional', action: 'Complétez et archivez chaque PC un par un.', resultat: 'Les constats alimentent votre espace BDD et TDB (visibles également par le Siège).' }
                ]
            },
            {
                id: 'wf-d',
                code: 'Parcours D',
                titre: 'Modifier un constat existant vs Enregistrer un Suivi',
                profils: ['ALL'],
                resume: 'Savoir choisir entre corriger une erreur (Modifier) et tracer une vérification ultérieure (Suivi).',
                etapes: [
                    { num: 1, feuille: 'Feuille 3 (FC) ou Feuille 4 (FV)', acteur: 'Tous profils autorisés', action: 'Dans « Espace Modification / Suivi & Suppression (Source BDD) », filtrez précisément par Date, Région, Site et Processus puis cliquez sur « Charger depuis BDD ».', resultat: 'Le ou les constats recherchés s’affichent dans la fiche avec le statut « Chargé depuis BDD ».' },
                    { num: 2, feuille: 'Feuille 3 (FC) ou Feuille 4 (FV)', acteur: 'Tous profils autorisés', action: 'Modifiez les champs concernés (date, statut, chiffres ou texte) jusqu’à voir le badge « Modifié (Prêt pour Modifier ou Suivi) ».', resultat: 'Modification détectée par la fiche.' },
                    { num: 3, feuille: 'Feuille 3 (FC) ou Feuille 4 (FV)', acteur: 'Tous profils autorisés', action: 'Cliquez sur « Modifier » pour corriger la ligne initiale en place (tag Modifié), OU cliquez sur « Suivi » pour conserver la ligne initiale intacte et créer une nouvelle ligne de suivi datée (tag Suivi).', resultat: 'Mise à jour immédiate en BDD et retrait du PC de la fiche.' }
                ]
            },
            {
                id: 'wf-e',
                code: 'Parcours E',
                titre: 'Configurer et synchroniser les archives GitHub',
                profils: ['ADMIN', 'DIRECTEUR', 'CHEF_SERVICE'],
                resume: 'Sauvegarder la BDD locale vers le dépôt privé FCI-APP/FCI-audit-archives ou restaurer les données sur un nouveau poste.',
                etapes: [
                    { num: 1, feuille: 'Feuille 5 — BDD', acteur: 'Administrateur / Siège', action: 'Cliquez sur « Dépôt Archive » et vérifiez FCI-APP/FCI-audit-archives (branche main).', resultat: 'Configuration du dépôt confirmée dans la ligne d’état.' },
                    { num: 2, feuille: 'Feuille 5 — BDD', acteur: 'Administrateur / Siège', action: 'Cliquez sur « Token GitHub » et collez un Fine-grained Personal Access Token doté des droits Contents (Read & Write).', resultat: 'La ligne de statut affiche « Archivage GitHub actif ».' },
                    { num: 3, feuille: 'Feuille 5 — BDD', acteur: 'Administrateur / Siège', action: 'Cliquez sur « Archiver BDD → GitHub » pour sauvegarder vos données locales, ou « Charger Archives GitHub » pour récupérer toutes les archives mensuelles.', resultat: 'Message de confirmation listant le nombre de fichiers mensuels traités.' }
                ]
            },
            {
                id: 'wf-f',
                code: 'Parcours F',
                titre: 'Produire un reporting décisionnel depuis le Tableau de Bord',
                profils: ['ALL'],
                resume: 'Filtrer le TDB par niveau, contrôler la couverture territoriale et exporter le classeur Excel consolidé.',
                etapes: [
                    { num: 1, feuille: 'Feuille 6 — TDB', acteur: 'Tous profils', action: 'Sélectionnez l’onglet de niveau adapté (Centre / Site, Régional, ou National pour le Siège) puis appliquez vos filtres de période, région, processus ou type.', resultat: 'KPIs, alertes, graphiques et tableaux se recalculent instantanément.' },
                    { num: 2, feuille: 'Feuille 6 — TDB', acteur: 'Tous profils', action: 'En Régional/National, vérifiez les 3 filtres dédiés de la section Couverture (par défaut année civile en cours) pour identifier les centres non encore contrôlés.', resultat: 'Liste nominale des centres contrôlés (FC), vérifiés (FV) et non touchés.' },
                    { num: 3, feuille: 'Feuille 6 — TDB', acteur: 'Tous profils', action: 'Cliquez sur « Télécharger Excel » pour obtenir le rapport multi-onglets ou sur « Imprimer PDF » (format A4 paysage).', resultat: 'Fichier .xlsx (6 à 7 onglets) ou impression PDF prête à diffuser.' }
                ]
            }
        ],

        // =====================================================================
        // RUBRIQUE 6 : QUESTIONS FRÉQUENTES (FAQ — GU-06)
        // =====================================================================
        faq: [
            {
                cat: 'Accès & Profils',
                profils: ['CONTROLEUR', 'CHEF_SERVICE', 'DIRECTEUR'],
                q: 'Pourquoi la Feuille 1 « Référentiel de contrôle » n’apparaît-elle pas dans mon menu ?',
                r: 'La Feuille 1 (index.html) est réservée exclusivement au compte Administrateur (admin-siege). Pour les 40 autres comptes, le lien est automatiquement masqué et l’application s’ouvre directement sur la Feuille 2 (Planification). Les Chefs de service et le Directeur accèdent au référentiel des 1 605 PC directement dans l’Étape 1 de la Feuille 2.'
            },
            {
                cat: 'Accès & Profils',
                profils: ['CONTROLEUR'],
                q: 'Pourquoi l’onglet « Niveau National » est-il grisé dans le Tableau de Bord (TDB) ?',
                r: 'L’analyse nationale consolidée sur les 10 régions est réservée aux 7 comptes de l’Espace Siège. En tant que Contrôleur Régional, vous accédez aux onglets « Niveau Régional » (ouvert par défaut) et « Niveau Centre / Site » sur votre périmètre autorisé.'
            },
            {
                cat: 'Accès & Profils',
                profils: ['ALL'],
                q: 'Le « Guide d’utilisation » est-il accessible à tous les comptes sans restriction ?',
                r: 'Oui. La Feuille 7 « Guide d’utilisation » est accessible à l’ensemble des 41 comptes (Administrateur, Directeur, 5 Chefs de service et 34 Contrôleurs régionaux) sans restriction de profil ni de licence, en mode consultation seule.'
            },
            {
                cat: 'Saisie FC & FV',
                profils: ['ALL'],
                q: 'Quelle est la différence entre « Archiver », « Modifier » et « Suivi » sur un Point de Contrôle ?',
                r: '« Archiver » enregistre un nouveau constat (ou sauvegarde un PC) dans la BDD. « Modifier » met à jour sur place un constat déjà archivé (chargé depuis la BDD) en ajoutant le badge « Modifié ». « Suivi » conserve la ligne initiale intacte dans la BDD et crée une NOUVELLE ligne distincte datée (badge « Suivi ») pour tracer l’évolution dans le temps.'
            },
            {
                cat: 'Saisie FC & FV',
                profils: ['ALL'],
                q: 'Pourquoi un Point de Contrôle disparaît-il de ma fiche juste après avoir cliqué sur Archiver, Modifier ou Suivi ?',
                r: 'C’est le comportement normal : dès que le PC est enregistré en BDD, il est immédiatement retiré de la fiche de saisie pour vous permettre de traiter proprement les PC restants un par un, sans risque de double saisie. Un bandeau de confirmation s’affiche en haut de l’espace Modification.'
            },
            {
                cat: 'Planification',
                profils: ['CHEF_SERVICE', 'DIRECTEUR', 'ADMIN'],
                q: 'Un contrôleur voit-il une campagne dès que je la soumets pour validation ?',
                r: 'Non. Tant qu’une campagne FC ou FV est au statut « SOUMISE » ou « VALIDEE », elle reste strictement interne au Siège. Un contrôleur régional ne la voit qu’après la diffusion officielle (« Diffuser les missions » ou « Exécuter la vérification » à l’Étape 2), et uniquement s’il est nommément affecté.'
            },
            {
                cat: 'Planification',
                profils: ['CHEF_SERVICE'],
                q: 'Pourquoi ne vois-je pas le bouton « Diffuser les missions » sur la campagne d’un autre Chef de service ?',
                r: 'À l’Étape 2 (FC et FV), la diffusion d’une campagne validée est réservée au Chef de service qui l’a soumise, ainsi qu’au Directeur et à l’Administrateur.'
            },
            {
                cat: 'Planification',
                profils: ['CONTROLEUR', 'ALL'],
                q: 'Comment fonctionne une mission interrégionale (contrôleur d’une région intervenant dans une autre région) ?',
                r: 'L’application gère nativement les missions interrégionales : le Siège peut affecter un contrôleur sur un centre d’une autre région (badge rose « Interrégional »). Après archivage, les constats sont visibles par le Siège, par la région du contrôleur et par la région du centre contrôlé.'
            },
            {
                cat: 'Sécurité & Données',
                profils: ['ALL'],
                q: 'Que fait exactement le bouton « Vider » ? Vais-je effacer les données de mes collègues ?',
                r: 'Si vous êtes Directeur, Chef de service ou Contrôleur Régional : NON, les données des autres comptes restent intactes (elles sont seulement masquées dans votre compte). En revanche, si vous êtes connecté en Administrateur (admin-siege), confirmer un bouton « Vider » lié à la BDD supprime définitivement ces données dans les 41 comptes !'
            },
            {
                cat: 'Sécurité & Données',
                profils: ['ALL'],
                q: 'Pourquoi dois-je me reconnecter après avoir fermé mon navigateur ?',
                r: 'Par mesure de sécurité, la session FCI est volontairement stockée dans sessionStorage (session volatile) et non de façon permanente. Fermer l’onglet ou le navigateur déconnecte automatiquement votre compte.'
            },
            {
                cat: 'BDD & Exports',
                profils: ['ALL'],
                q: 'Pourquoi le filtre « Date début » seul ne m’affiche-t-il qu’une seule journée en BDD ou TDB ?',
                r: 'Dans la BDD et le TDB, sélectionner uniquement « Date début » filtre sur cette date exacte. Pour filtrer une plage de dates, renseignez également « Date fin » (ou uniquement « Date fin » pour obtenir toutes les dates jusqu’à cette date).'
            },
            {
                cat: 'BDD & Exports',
                profils: ['ALL'],
                q: 'Quelle est la différence entre « Télécharger fichier Excel » et « Exporter (JSON) » dans la BDD ?',
                r: '« Télécharger fichier Excel » exporte uniquement les lignes actuellement filtrées à l’écran dans un tableur .xlsx lisible. « Exporter (JSON) » sauvegarde l’intégralité technique de votre périmètre BDD (sans tenir compte des filtres écran) pour archivage/backup.'
            },
            {
                cat: 'TDB & Indicateurs',
                profils: ['ALL'],
                q: 'Comment est calculé le Taux de Conformité Pondéré dans le TDB ?',
                r: 'Il est calculé par la formule (Somme des OK ÷ Somme des Échantillons) × 100 sur les constats filtrés (et par la moyenne simple des taux individuels si la somme des échantillons vaut 0).'
            },
            {
                cat: 'TDB & Indicateurs',
                profils: ['ALL'],
                q: 'Pourquoi le Taux de Couverture de la carte KPI 5 diffère-t-il parfois du Tableau de Couverture ?',
                r: 'La 5e carte KPI reflète les 10 filtres globaux du haut de page, alors que la section Couverture (graphique et tableau nominal) possède ses 3 propres filtres (initialisés sur l’année civile en cours).'
            },
            {
                cat: 'Sécurité & Données',
                profils: ['ALL'],
                q: 'Consulter ce Guide d’utilisation risque-t-il de modifier mes fiches ou ma BDD ?',
                r: 'Jamais. Le Guide d’utilisation fonctionne en consultation seule stricte : il ne lit ni ne modifie aucune donnée métier dans IndexedDB, localStorage ou GitHub.'
            }
        ],

        // =====================================================================
        // RUBRIQUE 7 : RÉSOLUTION DES PROBLÈMES / DÉPANNAGE (GU-07)
        // =====================================================================
        troubleshooting: [
            {
                symptome: '« Nom d’utilisateur ou mot de passe incorrect. » sur login.html',
                feuille: 'Connexion',
                profils: ['ALL'],
                cause: 'Faute de frappe dans l’identifiant (ex. espace oublié dans chef service-001, double A dans LAYOUNE-001) ou erreur de majuscule/minuscule dans le mot de passe.',
                solution: 'Utilisez l’icône œil pour contrôler votre mot de passe, vérifiez le format exact de votre identifiant et reconnectez-vous.'
            },
            {
                symptome: 'Badge rouge « referentiel.json introuvable » ou « Encaisses.json introuvable »',
                feuille: 'Feuilles 1, 2, 4',
                profils: ['ALL'],
                cause: 'Ouverture des fichiers HTML directement via file:// (le navigateur bloque les appels fetch locaux) ou absence du fichier JSON à côté des pages.',
                solution: 'Ouvrez l’application depuis son adresse web (GitHub Pages ou serveur HTTP) et vérifiez la présence de referentiel.json et Encaisses.json.'
            },
            {
                symptome: '« ⚠️ L’échantillon doit être inférieur ou égal à la population. »',
                feuille: 'Feuilles 3 & 4',
                profils: ['ALL'],
                cause: 'La valeur saisie dans Échantillon dépasse celle saisie dans Population (alors que Population > 0). L’application remet automatiquement Échantillon à 0.',
                solution: 'Saisissez d’abord la Population totale, puis un Échantillon inférieur ou égal à cette Population.'
            },
            {
                symptome: '« ⚠️ Point "..." : Échantillon requis / Constat obligatoire / Recommandation obligatoire. »',
                feuille: 'Feuille 3 (FC)',
                profils: ['ALL'],
                cause: 'Un ou plusieurs champs obligatoires du PC sont vides ou Échantillon vaut 0.',
                solution: 'Complétez Échantillon (> 0), Constat et Recommandation (ainsi que Région, Centre et Contrôleur en haut de page) avant de cliquer sur Archiver.'
            },
            {
                symptome: '« ⚠️ Aucune modification détectée sur ce point de contrôle. »',
                feuille: 'Feuilles 3 & 4',
                profils: ['ALL'],
                cause: 'Clic sur « Modifier » ou « Suivi » sur un constat chargé depuis la BDD sans avoir modifié aucun de ses champs.',
                solution: 'Modifiez au moins un champ (date, statut, chiffres, constat, recommandation ou avis) jusqu’à l’apparition du badge « Modifié », puis cliquez à nouveau.'
            },
            {
                symptome: '« La date fin ... doit être postérieure ou égale à la date début. »',
                feuille: 'Feuilles 2 & 4',
                profils: ['ADMIN', 'DIRECTEUR', 'CHEF_SERVICE'],
                cause: 'La date de fin choisie précède chronologiquement la date de début.',
                solution: 'Sélectionnez une date de fin identique ou ultérieure à la date de début.'
            },
            {
                symptome: '« Seul le compte directeur-001 est habilité à valider / notifier... »',
                feuille: 'Feuille 2',
                profils: ['ADMIN', 'CHEF_SERVICE'],
                cause: 'Tentative d’action réservée au rôle DIRECTEUR.',
                solution: 'Seul le compte directeur-001 peut valider les campagnes soumises et émettre la notification officielle au Siège.'
            },
            {
                symptome: '« Veuillez sélectionner au moins un critère ... dans la BDD. » ou « Aucun constat correspondant »',
                feuille: 'Feuilles 3 & 4',
                profils: ['ALL'],
                cause: 'Aucun des 4 filtres BDD n’a été sélectionné, ou aucun constat accessible à votre profil ne correspond à la combinaison choisie.',
                solution: 'Sélectionnez au moins une Date, une Région, un Site ou un Processus présent dans la liste, ou vérifiez votre périmètre d’accès.'
            },
            {
                symptome: 'Le bouton « Export Excel » sur Feuille 3 (FC) ou Feuille 4 (FV) ne télécharge pas de fichier',
                feuille: 'Feuilles 3 & 4',
                profils: ['ALL'],
                cause: 'Limite technique connue de l’export Excel direct sur ces deux feuilles de saisie.',
                solution: 'Archivez vos PC puis utilisez « Télécharger fichier Excel » dans la Feuille 5 (BDD) ou dans la Feuille 6 (TDB), qui génèrent des classeurs .xlsx complets.'
            },
            {
                symptome: '« La bibliothèque Excel (SheetJS) n’est pas chargée. »',
                feuille: 'Feuilles 1, 5, 6',
                profils: ['ALL'],
                cause: 'Absence de connexion Internet ou blocage réseau du CDN jsdelivr lors du chargement de la page.',
                solution: 'Rétablissez la connexion Internet et cliquez sur « Actualiser » avant d’exporter.'
            },
            {
                symptome: 'Erreur GitHub « Token GitHub requis » ou « HTTP 401 / 403 / 404 »',
                feuille: 'Feuille 5 (BDD)',
                profils: ['ADMIN', 'DIRECTEUR', 'CHEF_SERVICE'],
                cause: 'Token absent, expiré (401), dépourvu des droits Contents Read & Write (403), ou nom de dépôt/branche erroné (404).',
                solution: 'Dans la Feuille 5 (BDD), vérifiez « Dépôt Archive » (FCI-APP/FCI-audit-archives, branche main) puis saisissez un Fine-grained PAT valide via « Token GitHub ».'
            },
            {
                symptome: 'Mes données n’apparaissent plus après un clic sur « Vider » ou « Vider TDB »',
                feuille: 'Toutes feuilles',
                profils: ['ALL'],
                cause: 'En Admin, « Vider » supprime physiquement les données locales sur les 41 comptes. En non-Admin, « Vider » masque les données pour votre compte uniquement.',
                solution: 'Si un archivage GitHub a été effectué, utilisez « Charger Archives GitHub » (Feuille 5 BDD) en compte Admin. À l’avenir, utilisez « Réinitialiser » (TDB) ou « Vider filtres » (Feuille 1) plutôt que « Vider ».'
            },
            {
                symptome: 'Je change de compte sur le même ordinateur et je vois une ancienne fiche ouverte en Feuille 3',
                feuille: 'Feuille 3 (FC)',
                profils: ['ALL'],
                cause: 'Le brouillon de travail localStorage["fci_fiche_controle_active"] reste en cache navigateur sur un poste partagé.',
                solution: 'Chargez votre propre mission depuis vos tuiles « Mes Missions Diffusées » ou depuis « Planification ».'
            },
            {
                symptome: 'Dans Encaisses.json (Feuille 4), je ne trouve pas séparément le PC EMS-Chronopost ou Chèques bancaires compte BAM',
                feuille: 'Feuille 4 (FV)',
                profils: ['ALL'],
                cause: 'Dans le référentiel actuel, ces deux points partagent exactement le même intitulé de contrôle que le versement espèces compte BAM.',
                solution: 'Ajoutez le point « Contrôle de versement des fonds... » puis utilisez « Ajouter un autre constat à ce point » en précisant clairement EMS-Chronopost ou Chèques bancaires dans le texte du Constat.'
            }
        ],

        // =====================================================================
        // RUBRIQUE 8 : BONNES PRATIQUES
        // =====================================================================
        bestPractices: [
            {
                titre: 'Qualité et traçabilité des constats',
                icone: 'fa-check-double',
                couleur: '#047857',
                conseils: [
                    'Renseignez toujours l’ensemble des métadonnées (Région, Centre, Dates, Contrôleur) avant d’archiver le premier PC.',
                    'En Feuille 3 (FC), définissez la « Date contrôle » globale avant d’ajuster des dates individuelles par PC (la date globale écrase toutes les dates PC ouverts).',
                    'Utilisez « Modifier » uniquement pour corriger une erreur de saisie ; utilisez « Suivi » pour tracer une nouvelle vérification ultérieure sans perdre l’historique.',
                    'Lors d’un rechargement depuis la BDD pour modification, filtrez toujours jusqu’au Site contrôlé afin d’éviter de mélanger plusieurs centres.'
                ]
            },
            {
                titre: 'Précautions sur les boutons « Vider » et « Supprimer »',
                icone: 'fa-triangle-exclamation',
                couleur: '#DC2626',
                conseils: [
                    'Ne cliquez jamais sur « Vider TDB » ou « Vider » (en-tête/sous-espaces) si vous voulez seulement réinitialiser des filtres : utilisez « Réinitialiser » (TDB), « Vider filtres » (Feuille 1) ou « Désélectionner tout » (Feuille 2).',
                    'Sur une carte PC individuelle (FC/FV), seul le bouton « Vider » de la carte reste purement local sans impact BDD.',
                    'En compte Administrateur, réalisez systématiquement une sauvegarde « Exporter (JSON) » ou « Archiver BDD → GitHub » avant toute purge.',
                    'Avant de cliquer sur une icône corbeille dans les tableaux de suivi de planification (FC/FV), vérifiez la ligne car la suppression est immédiate.'
                ]
            },
            {
                titre: 'Sécurité des comptes & confidentialité',
                icone: 'fa-shield-halved',
                couleur: '#003366',
                conseils: [
                    'Ne partagez jamais votre identifiant, votre mot de passe ni votre Personal Access Token GitHub.',
                    'Cliquez systématiquement sur le bouton rouge « Déconnexion » en bas de la barre latérale à la fin de votre session, en particulier sur un poste partagé.',
                    'Ne saisissez jamais de mots de passe ni de données personnelles non nécessaires dans les zones de texte libre (Constat, Recommandation, Avis).'
                ]
            },
            {
                titre: 'Archivage & pérennité des données',
                icone: 'fa-cloud-arrow-up',
                couleur: '#1D4ED8',
                conseils: [
                    'Vérifiez régulièrement dans la Feuille 5 (BDD) que la ligne d’état indique « Archivage GitHub actif » afin que chaque archivage soit sauvegardé automatiquement dans archives/AAAA/MM/.',
                    'Après une série de contrôles hors connexion ou sans token, lancez un « Archiver BDD → GitHub » complet depuis la Feuille 5.',
                    'Conservez périodiquement un export JSON local (« Exporter (JSON) ») en complément des archives mensuelles GitHub.'
                ]
            }
        ]
    };
})();

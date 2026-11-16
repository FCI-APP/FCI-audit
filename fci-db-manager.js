/**
 * FCI v1.0 © 2026 - 2027 - Gestionnaire de la Base de Données Centralisée (BDD)
 * Organisme : Barid Al-Maghrib (Direction Contrôle Générale — Division Contrôle Permanent)
 * Dépôt GitHub : FCI-APP/FCI-audit (branche main)
 * Clé localStorage : 'fci_database'
 */

const FCI_GITHUB_CONFIG = {
    owner: 'FCI-APP',
    repo: 'FCI-audit',
    branch: 'main',
    archiveFolder: 'archives',
    tokenKey: 'fci_github_pat'
};

const FCIDatabase = {
    KEY: 'fci_database',

    init() {
        if (!localStorage.getItem(this.KEY)) {
            const schema = {
                version: '1.0',
                derniereMiseAJour: new Date().toISOString(),
                missions: [],         // Table A (Planification)
                constatsControle: [], // Table B (Fiche de Contrôle FC)
                constatsEncaisses: [] // Table C (Fiche des Encaisses FV)
            };
            localStorage.setItem(this.KEY, JSON.stringify(schema));
        }
    },

    getDB() {
        this.init();
        try {
            const parsed = JSON.parse(localStorage.getItem(this.KEY));
            if (!parsed || typeof parsed !== 'object') throw new Error('Format BDD invalide');
            if (!Array.isArray(parsed.missions)) parsed.missions = [];
            if (!Array.isArray(parsed.constatsControle)) parsed.constatsControle = [];
            if (!Array.isArray(parsed.constatsEncaisses)) parsed.constatsEncaisses = [];
            return parsed;
        } catch (e) {
            return {
                version: '1.0',
                derniereMiseAJour: new Date().toISOString(),
                missions: [],
                constatsControle: [],
                constatsEncaisses: []
            };
        }
    },

    saveDB(db) {
        db.derniereMiseAJour = new Date().toISOString();
        try {
            localStorage.setItem(this.KEY, JSON.stringify(db));
        } catch (e) {
            console.error("[FCI BDD] Erreur d'écriture localStorage :", e);
            alert("⚠️ Espace de stockage local saturé. Veuillez exporter la BDD ou synchroniser vos archives sur GitHub.");
            throw e;
        }
    },

    // =========================================================================
    // GESTION DU TOKEN GITHUB & UTILITAIRES UTF-8 / BASE64 / ARBORESCENCE
    // =========================================================================

    getGitHubToken() {
        return localStorage.getItem(FCI_GITHUB_CONFIG.tokenKey) || '';
    },

    setGitHubToken(token) {
        if (token && token.trim() !== '') {
            localStorage.setItem(FCI_GITHUB_CONFIG.tokenKey, token.trim());
            return true;
        }
        return false;
    },

    configurerGitHubToken() {
        const actuel = this.getGitHubToken();
        const saisie = prompt(
            "Configuration Archivage GitHub (FCI-APP/FCI-audit)\n" +
            "Veuillez coller votre Fine-grained Personal Access Token (droits Contents: Read & Write) :",
            actuel
        );
        if (saisie !== null && saisie.trim() !== '') {
            this.setGitHubToken(saisie.trim());
            return this.getGitHubToken();
        }
        return actuel;
    },

    encodeBase64UTF8(str) {
        const bytes = new TextEncoder().encode(str);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    },

    decodeBase64UTF8(base64) {
        const binary = atob(base64.replace(/\s/g, ''));
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return new TextDecoder().decode(bytes);
    },

    nettoyerNomFichier(texte) {
        return String(texte || 'SansRef')
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9_-]/g, '_');
    },

    extraireSousDossierAnneeMois(donnees) {
        let dateRef = '';
        const cible = Array.isArray(donnees) ? donnees[0] : donnees;
        if (cible && typeof cible === 'object') {
            dateRef = cible.date || cible.dateControle || cible.dateVerification || cible.dateDebut || '';
        }

        let str = String(dateRef || '').trim();
        if (str.includes('T')) str = str.split('T')[0];

        // Format jj/mm/aaaa
        if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
            const [, m, y] = str.split('/');
            return `${y}/${m.padStart(2, '0')}`;
        }
        // Format aaaa-mm-jj
        if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(str)) {
            const [y, m] = str.split('-');
            return `${y}/${m.padStart(2, '0')}`;
        }

        // Par défaut : année et mois courants
        const now = new Date();
        return `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;
    },

    fusionnerItemDansTable(liste, nouvelItem, champId) {
        const index = liste.findIndex(existing => existing[champId] === nouvelItem[champId]);
        if (index < 0) {
            liste.push(nouvelItem);
            return;
        }

        const existant = liste[index];
        const dateModifExistante = existant.dateModification || '';
        const dateModifNouvelle = nouvelItem.dateModification || '';

        if (dateModifNouvelle && dateModifNouvelle >= dateModifExistante) {
            liste[index] = { ...existant, ...nouvelItem };
        } else if (nouvelItem.isModifie && !existant.isModifie) {
            liste[index] = { ...existant, ...nouvelItem };
        } else if (!existant.dateModification && !dateModifNouvelle) {
            liste[index] = { ...existant, ...nouvelItem };
        }
    },

    // =========================================================================
    // MÉTHODES MÉTIER (SAUVEGARDE LOCALE + ARCHIVAGE AUTOMATIQUE GITHUB)
    // =========================================================================

    enregistrerMission(dataMission, syncGitHub = true) {
        const db = this.getDB();
        this.fusionnerItemDansTable(db.missions, dataMission, 'idMission');
        this.saveDB(db);

        if (syncGitHub) {
            const entite = dataMission.entite || dataMission.agence || 'Mission';
            const id = dataMission.idMission || Date.now();
            return this.archiverSurGitHub('PLAN', entite, id, dataMission);
        }
        return Promise.resolve({ success: true, localOnly: true });
    },

    enregistrerConstatsControle(constatsArray, syncGitHub = true) {
        const db = this.getDB();
        constatsArray.forEach(c => {
            this.fusionnerItemDansTable(db.constatsControle, c, 'idConstat');
        });
        this.saveDB(db);

        if (syncGitHub && constatsArray.length > 0) {
            const premier = constatsArray[0];
            const entite = premier.entite || premier.site || premier.agence || 'Controle';
            const idMission = premier.idMission || premier.idConstat || Date.now();
            return this.archiverSurGitHub('FC', entite, idMission, constatsArray);
        }
        return Promise.resolve({ success: true, localOnly: true });
    },

    enregistrerConstatEncaisse(dataEncaisse, syncGitHub = true) {
        const db = this.getDB();
        this.fusionnerItemDansTable(db.constatsEncaisses, dataEncaisse, 'idEncaisse');
        this.saveDB(db);

        if (syncGitHub) {
            const entite = dataEncaisse.site || dataEncaisse.entite || dataEncaisse.bureau || 'Encaisse';
            const id = dataEncaisse.idEncaisse || dataEncaisse.idMission || Date.now();
            return this.archiverSurGitHub('FV', entite, id, dataEncaisse);
        }
        return Promise.resolve({ success: true, localOnly: true });
    },

    enregistrerLotEncaisses(listeEncaisses, site, idMission, syncGitHub = true) {
        const db = this.getDB();
        listeEncaisses.forEach(dataEncaisse => {
            this.fusionnerItemDansTable(db.constatsEncaisses, dataEncaisse, 'idEncaisse');
        });
        this.saveDB(db);

        if (syncGitHub && listeEncaisses.length > 0) {
            const premier = listeEncaisses[0];
            const siteCible = site || premier.site || premier.entite || 'Encaisse';
            const missionCible = idMission || premier.idMission || Date.now();
            return this.archiverSurGitHub('FV', siteCible, missionCible, listeEncaisses);
        }
        return Promise.resolve({ success: true, localOnly: true });
    },

    // =========================================================================
    // MOTEUR API REST GITHUB (CRÉATION / MISE À JOUR / LECTURE RÉCURSIVE)
    // =========================================================================

    async archiverSurGitHub(typeFiche, entite, identifiant, donnees) {
        // Normalisation si un objet legacy est passé en premier paramètre
        if (typeFiche && typeof typeFiche === 'object') {
            const legacyObj = typeFiche;
            const prefix = String(entite || legacyObj.type || '');
            if (prefix.includes('FC') || legacyObj.type === 'MODIFICATION_FC') {
                typeFiche = 'FC';
                donnees = legacyObj.constats || legacyObj;
                identifiant = legacyObj.idMission || Date.now();
                entite = (Array.isArray(donnees) && donnees[0]?.entite) || prefix.replace(/^FC_MODIF_/, '') || 'Controle';
            } else if (prefix.includes('FV') || legacyObj.type === 'MODIFICATION_FV') {
                typeFiche = 'FV';
                donnees = legacyObj.constats || legacyObj;
                identifiant = legacyObj.idMission || Date.now();
                entite = legacyObj.site || (Array.isArray(donnees) && donnees[0]?.site) || prefix.replace(/^FV_MODIF_/, '') || 'Encaisse';
            }
        }

        let token = this.getGitHubToken();
        if (!token) {
            token = this.configurerGitHubToken();
        }
        if (!token) {
            console.warn("[FCI GitHub] Archivage distant ignoré (aucun token configuré). Données enregistrées en local.");
            return { success: false, reason: 'NO_TOKEN' };
        }

        // Sous-dossier mensuel automatique : archives/AAAA/MM/
        const sousDossierMensuel = this.extraireSousDossierAnneeMois(donnees);
        const dateJour = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const nomFichier = `${typeFiche}_${dateJour}_${this.nettoyerNomFichier(entite)}_${this.nettoyerNomFichier(identifiant)}.json`;
        const cheminGitHub = `${FCI_GITHUB_CONFIG.archiveFolder}/${sousDossierMensuel}/${nomFichier}`;
        const apiUrl = `https://api.github.com/repos/${FCI_GITHUB_CONFIG.owner}/${FCI_GITHUB_CONFIG.repo}/contents/${cheminGitHub}`;

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            'Content-Type': 'application/json'
        };

        try {
            // 1. Récupération du SHA si le fichier existe déjà (mise à jour sans erreur HTTP 422)
            let existingSha = null;
            const checkResponse = await fetch(`${apiUrl}?ref=${FCI_GITHUB_CONFIG.branch}`, {
                method: 'GET',
                headers
            });
            if (checkResponse.ok) {
                const fileInfo = await checkResponse.json();
                existingSha = fileInfo.sha;
            }

            // 2. Préparation de l'enveloppe JSON
            const enveloppeArchive = {
                application: "Fiche de contrôle intelligente (FCI) v1.0 © 2026 - 2027",
                organisme: "Barid Al-Maghrib - Direction Contrôle Générale",
                typeArchive: typeFiche,
                dateArchivage: new Date().toISOString(),
                donnees: donnees
            };

            const contenuBase64 = this.encodeBase64UTF8(JSON.stringify(enveloppeArchive, null, 2));

            const bodyPayload = {
                message: `[FCI Auto-Archive] ${typeFiche} - ${entite} (${identifiant})`,
                content: contenuBase64,
                branch: FCI_GITHUB_CONFIG.branch
            };

            if (existingSha) {
                bodyPayload.sha = existingSha;
            }

            // 3. Envoi via PUT sur l'API REST GitHub (crée automatiquement archives/AAAA/MM/)
            const putResponse = await fetch(apiUrl, {
                method: 'PUT',
                headers,
                body: JSON.stringify(bodyPayload)
            });

            if (!putResponse.ok) {
                const err = await putResponse.json();
                throw new Error(`HTTP ${putResponse.status} : ${err.message}`);
            }

            const result = await putResponse.json();
            console.info(`[FCI GitHub] Fichier archivé avec succès : ${cheminGitHub}`);
            return { success: true, path: cheminGitHub, url: result.content.html_url };

        } catch (error) {
            console.error("[FCI GitHub] Erreur lors de l'archivage :", error);
            return { success: false, error: error.message };
        }
    },

    async listerArchivesGitHub() {
        const token = this.getGitHubToken();
        if (!token) return [];

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28'
        };

        // Lecture récursive via Git Trees API : parcourt archives/ + tous les sous-dossiers archives/AAAA/MM/
        const treeUrl = `https://api.github.com/repos/${FCI_GITHUB_CONFIG.owner}/${FCI_GITHUB_CONFIG.repo}/git/trees/${FCI_GITHUB_CONFIG.branch}?recursive=1`;
        const treeRes = await fetch(treeUrl, { headers });

        if (treeRes.ok) {
            const treeData = await treeRes.json();
            const prefixeDossier = `${FCI_GITHUB_CONFIG.archiveFolder}/`;
            return (treeData.tree || [])
                .filter(item =>
                    item.type === 'blob' &&
                    item.path.startsWith(prefixeDossier) &&
                    item.path.endsWith('.json')
                )
                .map(item => ({
                    name: item.path.split('/').pop(),
                    path: item.path,
                    url: `https://api.github.com/repos/${FCI_GITHUB_CONFIG.owner}/${FCI_GITHUB_CONFIG.repo}/contents/${item.path}?ref=${FCI_GITHUB_CONFIG.branch}`
                }))
                .sort((a, b) => a.name.localeCompare(b.name));
        }

        // Fallback sur la racine archives/ si l'arbre Git n'est pas disponible
        const fallbackUrl = `https://api.github.com/repos/${FCI_GITHUB_CONFIG.owner}/${FCI_GITHUB_CONFIG.repo}/contents/${FCI_GITHUB_CONFIG.archiveFolder}?ref=${FCI_GITHUB_CONFIG.branch}`;
        const res = await fetch(fallbackUrl, { headers });
        if (!res.ok) return [];
        const fichiers = await res.json();
        return Array.isArray(fichiers)
            ? fichiers.filter(f => f.name.endsWith('.json')).sort((a, b) => a.name.localeCompare(b.name))
            : [];
    },

    async restaurerDepuisGitHub() {
        let token = this.getGitHubToken();
        if (!token) {
            token = this.configurerGitHubToken();
        }
        if (!token) return { success: false, message: "Token GitHub requis pour la restauration." };

        const fichiers = await this.listerArchivesGitHub();
        if (fichiers.length === 0) {
            return { success: true, count: 0, message: "Aucune archive JSON trouvée dans le dossier archives/." };
        }

        let nbRestaures = 0;
        for (const f of fichiers) {
            const res = await fetch(f.url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github+json'
                }
            });
            if (!res.ok) continue;
            const fileData = await res.json();

            let texteJson = '';
            if (fileData.content) {
                texteJson = this.decodeBase64UTF8(fileData.content);
            } else if (fileData.download_url) {
                const rawRes = await fetch(fileData.download_url);
                if (!rawRes.ok) continue;
                texteJson = await rawRes.text();
            }
            if (!texteJson) continue;

            const archive = JSON.parse(texteJson);
            if (!archive || !archive.donnees) continue;

            // Réinjection dans localStorage sans re-déclencher un push GitHub (syncGitHub = false)
            if (archive.typeArchive === 'PLAN') {
                this.enregistrerMission(archive.donnees, false);
                nbRestaures++;
            } else if (archive.typeArchive === 'FC' && Array.isArray(archive.donnees)) {
                this.enregistrerConstatsControle(archive.donnees, false);
                nbRestaures++;
            } else if (archive.typeArchive === 'FV') {
                if (Array.isArray(archive.donnees)) {
                    this.enregistrerLotEncaisses(archive.donnees, '', '', false);
                } else {
                    this.enregistrerConstatEncaisse(archive.donnees, false);
                }
                nbRestaures++;
            }
        }

        return {
            success: true,
            count: nbRestaures,
            message: `${nbRestaures} archive(s) synchronisée(s) depuis GitHub (tous mois confondus) vers la BDD locale.`
        };
    },

    // =========================================================================
    // OUTILS DE MAINTENANCE BDD LOCALE
    // =========================================================================

    viderBDD() {
        const emptySchema = {
            version: '1.0',
            derniereMiseAJour: new Date().toISOString(),
            missions: [],
            constatsControle: [],
            constatsEncaisses: []
        };
        localStorage.setItem(this.KEY, JSON.stringify(emptySchema));
    },

    exporterBDD() {
        const db = this.getDB();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `FCI_BDD_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    }
};

FCIDatabase.init();

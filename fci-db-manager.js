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
        return JSON.parse(localStorage.getItem(this.KEY));
    },

    saveDB(db) {
        db.derniereMiseAJour = new Date().toISOString();
        localStorage.setItem(this.KEY, JSON.stringify(db));
    },

    // =========================================================================
    // GESTION DU TOKEN GITHUB & UTILITAIRES UTF-8 / BASE64
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

    // =========================================================================
    // MÉTHODES MÉTIER (SAUVEGARDE LOCALE + ARCHIVAGE AUTOMATIQUE GITHUB)
    // =========================================================================

    enregistrerMission(dataMission, syncGitHub = true) {
        const db = this.getDB();
        const index = db.missions.findIndex(m => m.idMission === dataMission.idMission);
        if (index >= 0) {
            db.missions[index] = dataMission;
        } else {
            db.missions.push(dataMission);
        }
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
            const index = db.constatsControle.findIndex(existing => existing.idConstat === c.idConstat);
            if (index >= 0) {
                db.constatsControle[index] = c;
            } else {
                db.constatsControle.push(c);
            }
        });
        this.saveDB(db);

        if (syncGitHub && constatsArray.length > 0) {
            const premier = constatsArray[0];
            const entite = premier.entite || premier.agence || 'Controle';
            const idMission = premier.idMission || premier.idConstat || Date.now();
            return this.archiverSurGitHub('FC', entite, idMission, constatsArray);
        }
        return Promise.resolve({ success: true, localOnly: true });
    },

    enregistrerConstatEncaisse(dataEncaisse, syncGitHub = true) {
        const db = this.getDB();
        const index = db.constatsEncaisses.findIndex(e => e.idEncaisse === dataEncaisse.idEncaisse);
        if (index >= 0) {
            db.constatsEncaisses[index] = dataEncaisse;
        } else {
            db.constatsEncaisses.push(dataEncaisse);
        }
        this.saveDB(db);

        if (syncGitHub) {
            const entite = dataEncaisse.entite || dataEncaisse.bureau || dataEncaisse.agence || 'Encaisse';
            const id = dataEncaisse.idEncaisse || dataEncaisse.idMission || Date.now();
            return this.archiverSurGitHub('FV', entite, id, dataEncaisse);
        }
        return Promise.resolve({ success: true, localOnly: true });
    },

    // =========================================================================
    // MOTEUR API REST GITHUB (CRÉATION / MISE À JOUR / LECTURE DES ARCHIVES)
    // =========================================================================

    async archiverSurGitHub(typeFiche, entite, identifiant, donnees) {
        let token = this.getGitHubToken();
        if (!token) {
            token = this.configurerGitHubToken();
        }
        if (!token) {
            console.warn("[FCI GitHub] Archivage distant ignoré (aucun token configuré). Données enregistrées en local.");
            return { success: false, reason: 'NO_TOKEN' };
        }

        const dateJour = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const nomFichier = `${typeFiche}_${dateJour}_${this.nettoyerNomFichier(entite)}_${this.nettoyerNomFichier(identifiant)}.json`;
        const cheminGitHub = `${FCI_GITHUB_CONFIG.archiveFolder}/${nomFichier}`;
        const apiUrl = `https://api.github.com/repos/${FCI_GITHUB_CONFIG.owner}/${FCI_GITHUB_CONFIG.repo}/contents/${cheminGitHub}`;

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            'Content-Type': 'application/json'
        };

        try {
            // 1. Récupération du SHA si le fichier existe déjà (pour mise à jour sans erreur 422)
            let existingSha = null;
            const checkResponse = await fetch(`${apiUrl}?ref=${FCI_GITHUB_CONFIG.branch}`, {
                method: 'GET',
                headers
            });
            if (checkResponse.ok) {
                const fileInfo = await checkResponse.json();
                existingSha = fileInfo.sha;
            }

            // 2. Préparation du contenu JSON structuré
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

            // 3. Envoi via PUT sur l'API REST GitHub
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

        const apiUrl = `https://api.github.com/repos/${FCI_GITHUB_CONFIG.owner}/${FCI_GITHUB_CONFIG.repo}/contents/${FCI_GITHUB_CONFIG.archiveFolder}?ref=${FCI_GITHUB_CONFIG.branch}`;
        const res = await fetch(apiUrl, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github+json'
            }
        });

        if (!res.ok) return [];
        const fichiers = await res.json();
        return Array.isArray(fichiers) ? fichiers.filter(f => f.name.endsWith('.json')) : [];
    },

    async restaurerDepuisGitHub() {
        let token = this.getGitHubToken();
        if (!token) {
            token = this.configurerGitHubToken();
        }
        if (!token) return { success: false, message: "Token GitHub requis pour la restauration." };

        const fichiers = await this.listerArchivesGitHub();
        if (fichiers.length === 0) {
            return { success: true, count: 0, message: "Aucune archive JSON trouvée dans archives/." };
        }

        let nbRestaures = 0;
        for (const f of fichiers) {
            const res = await fetch(`${f.url}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github+json'
                }
            });
            if (!res.ok) continue;
            const fileData = await res.json();
            const archive = JSON.parse(this.decodeBase64UTF8(fileData.content));

            if (!archive || !archive.donnees) continue;

            // Réinjection dans localStorage sans re-déclencher un push GitHub (syncGitHub = false)
            if (archive.typeArchive === 'PLAN') {
                this.enregistrerMission(archive.donnees, false);
                nbRestaures++;
            } else if (archive.typeArchive === 'FC' && Array.isArray(archive.donnees)) {
                this.enregistrerConstatsControle(archive.donnees, false);
                nbRestaures++;
            } else if (archive.typeArchive === 'FV') {
                this.enregistrerConstatEncaisse(archive.donnees, false);
                nbRestaures++;
            }
        }

        return {
            success: true,
            count: nbRestaures,
            message: `${nbRestaures} archive(s) synchronisée(s) depuis GitHub vers la BDD locale.`
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
        downloadAnchor.setAttribute("download", `FCI_BDD_${new Date().toISOString().slice(0,10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    }
};

FCIDatabase.init();

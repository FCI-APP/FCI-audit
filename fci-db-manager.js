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
        const raw = localStorage.getItem(this.KEY);
        if (!raw) {
            const schema = {
                version: '1.0',
                derniereMiseAJour: new Date().toISOString(),
                missions: [],         // Table A (Planification)
                constatsControle: [], // Table B (Fiche de Contrôle FC)
                constatsEncaisses: [] // Table C (Fiche des Encaisses FV)
            };
            localStorage.setItem(this.KEY, JSON.stringify(schema));
        } else {
            try {
                const parsed = JSON.parse(raw);
                let modified = false;
                if (!Array.isArray(parsed.missions)) { parsed.missions = []; modified = true; }
                if (!Array.isArray(parsed.constatsControle)) { parsed.constatsControle = []; modified = true; }
                if (!Array.isArray(parsed.constatsEncaisses)) { parsed.constatsEncaisses = []; modified = true; }
                if (modified) {
                    localStorage.setItem(this.KEY, JSON.stringify(parsed));
                }
            } catch (e) {
                console.error("[FCI BDD] Erreur parsing localStorage, réinitialisation:", e);
                this.viderBDD();
            }
        }
    },

    getDB() {
        this.init();
        return JSON.parse(localStorage.getItem(this.KEY));
    },

    saveDB(db) {
        db.derniereMiseAJour = new Date().toISOString();
        localStorage.setItem(this.KEY, JSON.stringify(db));
        window.dispatchEvent(new CustomEvent('fci-db-updated', { detail: db }));
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

    genererIdUnique(prefixe) {
        return `${prefixe}-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    },

    // =========================================================================
    // MÉTHODES MÉTIER (SAUVEGARDE LOCALE PRIORITAIRE + ARCHIVAGE GITHUB)
    // =========================================================================

    enregistrerMission(dataMission, syncGitHub = true) {
        const db = this.getDB();
        if (!dataMission.idMission) {
            dataMission.idMission = this.genererIdUnique('MIS');
        }
        const index = db.missions.findIndex(m => m.idMission && m.idMission === dataMission.idMission);
        if (index >= 0) {
            db.missions[index] = { ...db.missions[index], ...dataMission };
        } else {
            db.missions.push(dataMission);
        }
        this.saveDB(db);

        if (syncGitHub) {
            const entite = dataMission.entite || dataMission.site || dataMission.agence || 'Mission';
            const id = dataMission.idMission;
            return this.archiverSurGitHub('PLAN', entite, id, dataMission);
        }
        return Promise.resolve({ success: true, localOnly: true });
    },

    enregistrerConstatsControle(constatsInput, syncGitHub = true) {
        const db = this.getDB();
        const constatsArray = Array.isArray(constatsInput) ? constatsInput : [constatsInput];

        constatsArray.forEach((c, idx) => {
            if (!c) return;
            if (!c.idConstat) {
                c.idConstat = this.genererIdUnique(`FC-${idx}`);
            }
            const index = db.constatsControle.findIndex(existing => existing.idConstat && existing.idConstat === c.idConstat);
            if (index >= 0) {
                db.constatsControle[index] = { ...db.constatsControle[index], ...c };
            } else {
                db.constatsControle.push(c);
            }
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
        if (!dataEncaisse) return Promise.resolve({ success: false });

        if (!dataEncaisse.idEncaisse) {
            dataEncaisse.idEncaisse = this.genererIdUnique('FV');
        }

        const index = db.constatsEncaisses.findIndex(e => e.idEncaisse && e.idEncaisse === dataEncaisse.idEncaisse);
        if (index >= 0) {
            db.constatsEncaisses[index] = { ...db.constatsEncaisses[index], ...dataEncaisse };
        } else {
            db.constatsEncaisses.push(dataEncaisse);
        }
        this.saveDB(db);

        if (syncGitHub) {
            const entite = dataEncaisse.site || dataEncaisse.entite || dataEncaisse.bureau || 'Encaisse';
            const id = dataEncaisse.idMission || dataEncaisse.idEncaisse;
            return this.archiverSurGitHub('FV', entite, id, dataEncaisse);
        }
        return Promise.resolve({ success: true, localOnly: true });
    },

    enregistrerLotEncaisses(listeEncaisses, site, idMission, syncGitHub = true) {
        const db = this.getDB();
        const lot = Array.isArray(listeEncaisses) ? listeEncaisses : [listeEncaisses];

        lot.forEach((dataEncaisse, idx) => {
            if (!dataEncaisse) return;
            if (!dataEncaisse.idEncaisse) {
                dataEncaisse.idEncaisse = this.genererIdUnique(`FV-${idx}`);
            }
            const index = db.constatsEncaisses.findIndex(e => e.idEncaisse && e.idEncaisse === dataEncaisse.idEncaisse);
            if (index >= 0) {
                db.constatsEncaisses[index] = { ...db.constatsEncaisses[index], ...dataEncaisse };
            } else {
                db.constatsEncaisses.push(dataEncaisse);
            }
        });
        this.saveDB(db);

        if (syncGitHub && lot.length > 0) {
            return this.archiverSurGitHub('FV', site || 'Encaisse', idMission || Date.now(), lot);
        }
        return Promise.resolve({ success: true, localOnly: true });
    },

    modifierEnregistrementBDD(id, table, nouveauxChamps) {
        const db = this.getDB();
        if (table === 'constatsControle') {
            const idx = db.constatsControle.findIndex(c => c.idConstat === id);
            if (idx >= 0) {
                db.constatsControle[idx] = { ...db.constatsControle[idx], ...nouveauxChamps };
                this.saveDB(db);
                return true;
            }
        } else if (table === 'constatsEncaisses') {
            const idx = db.constatsEncaisses.findIndex(e => e.idEncaisse === id);
            if (idx >= 0) {
                db.constatsEncaisses[idx] = { ...db.constatsEncaisses[idx], ...nouveauxChamps };
                this.saveDB(db);
                return true;
            }
        }
        return false;
    },

    supprimerEnregistrementBDD(id, table) {
        const db = this.getDB();
        if (table === 'constatsControle') {
            db.constatsControle = db.constatsControle.filter(c => c.idConstat !== id);
        } else if (table === 'constatsEncaisses') {
            db.constatsEncaisses = db.constatsEncaisses.filter(e => e.idEncaisse !== id);
        }
        this.saveDB(db);
        return true;
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
            console.warn("[FCI GitHub] Archivage distant ignoré (aucun token configuré). Données enregistrées dans la BDD locale.");
            return { success: true, localOnly: true, reason: 'NO_TOKEN' };
        }

        const dateJour = new Date().toISOString().slice(0, 10);
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
            let existingSha = null;
            const checkResponse = await fetch(`${apiUrl}?ref=${FCI_GITHUB_CONFIG.branch}&t=${Date.now()}`, {
                method: 'GET',
                headers
            });
            if (checkResponse.ok) {
                const fileInfo = await checkResponse.json();
                existingSha = fileInfo.sha;
            }

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
            console.error("[FCI GitHub] Erreur lors de l'archivage (données conservées en local) :", error);
            return { success: true, localOnly: true, githubError: error.message };
        }
    },

    async listerArchivesGitHub() {
        const token = this.getGitHubToken();
        const headers = { 'Accept': 'application/vnd.github+json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const apiUrl = `https://api.github.com/repos/${FCI_GITHUB_CONFIG.owner}/${FCI_GITHUB_CONFIG.repo}/contents/${FCI_GITHUB_CONFIG.archiveFolder}?ref=${FCI_GITHUB_CONFIG.branch}&t=${Date.now()}`;
        const res = await fetch(apiUrl, { headers });

        if (!res.ok) return [];
        const fichiers = await res.json();
        return Array.isArray(fichiers) ? fichiers.filter(f => f.name.endsWith('.json')) : [];
    },

    async restaurerDepuisGitHub(silencieux = false) {
        let token = this.getGitHubToken();
        if (!token && !silencieux) {
            token = this.configurerGitHubToken();
        }

        const headers = { 'Accept': 'application/vnd.github+json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const fichiers = await this.listerArchivesGitHub();
        if (fichiers.length === 0) {
            return { success: true, count: 0, message: "Aucune archive JSON trouvée dans le dossier archives/." };
        }

        let nbRestaures = 0;
        for (const f of fichiers) {
            try {
                let archive = null;
                if (f.download_url) {
                    const rawRes = await fetch(`${f.download_url}?t=${Date.now()}`);
                    if (rawRes.ok) {
                        archive = await rawRes.json();
                    }
                }
                if (!archive) {
                    const res = await fetch(f.url, { headers });
                    if (!res.ok) continue;
                    const fileData = await res.json();
                    archive = JSON.parse(this.decodeBase64UTF8(fileData.content));
                }

                if (!archive) continue;

                const donnees = archive.donnees || archive;
                const type = archive.typeArchive || (
                    f.name.startsWith('PLAN_') ? 'PLAN' :
                    f.name.startsWith('FC_') ? 'FC' :
                    f.name.startsWith('FV_') ? 'FV' : ''
                );

                if (type === 'PLAN') {
                    this.enregistrerMission(donnees, false);
                    nbRestaures++;
                } else if (type === 'FC') {
                    this.enregistrerConstatsControle(donnees, false);
                    nbRestaures++;
                } else if (type === 'FV') {
                    if (Array.isArray(donnees)) {
                        this.enregistrerLotEncaisses(donnees, '', '', false);
                    } else {
                        this.enregistrerConstatEncaisse(donnees, false);
                    }
                    nbRestaures++;
                }
            } catch (err) {
                console.warn(`[FCI GitHub] Fichier ignoré (${f.name}):`, err);
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

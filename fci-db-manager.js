/**
 * FCI-DB-MANAGER.JS
 * Gestionnaire unifié de persistance locale (BDD) et synchronisation GitHub (FCI-APP/FCI-audit)
 * Barid Al-Maghrib - Direction Contrôle Générale / Division Contrôle Permanent
 */

const FCI_CONFIG = {
    owner: 'FCI-APP',
    repo: 'FCI-audit',
    branch: 'main',
    archiveFolder: 'archives',
    masterFile: 'archives/bdd_master.json',
    storageKey: 'fci_bdd_records',
    tokenKey: 'fci_github_token'
};

const FCIDBManager = {
    // Récupérer le token GitHub enregistré
    getToken() {
        return localStorage.getItem(FCI_CONFIG.tokenKey) || '';
    },

    // Définir le token GitHub
    setToken(token) {
        if (token && token.trim() !== '') {
            localStorage.setItem(FCI_CONFIG.tokenKey, token.trim());
        }
    },

    // Lire tous les enregistrements de la BDD locale
    getAllRecords() {
        try {
            const raw = localStorage.getItem(FCI_CONFIG.storageKey);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error("Erreur lecture BDD locale:", e);
            return [];
        }
    },

    // Sauvegarder tout le tableau en local
    saveAllRecords(records) {
        try {
            localStorage.setItem(FCI_CONFIG.storageKey, JSON.stringify(records));
            return true;
        } catch (e) {
            console.error("Erreur sauvegarde BDD locale:", e);
            alert("Attention : Espace de stockage local saturé. Pensez à exporter ou purger d'anciennes archives.");
            return false;
        }
    },

    /**
     * Fonction principale appelée par les boutons "Archiver" de FC et FV
     * 1. Stocke immédiatement dans la BDD locale (BDD.html)
     * 2. Archive le fichier individuel + met à jour bdd_master.json sur GitHub
     */
    async archiveRecord(recordData) {
        if (!recordData.uid) {
            recordData.uid = 'REC-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        }
        recordData.archivedAt = new Date().toISOString();

        // ÉTAPE 1 : Stockage immédiat dans la BDD locale (Prioritaire)
        const records = this.getAllRecords();
        const existingIndex = records.findIndex(r => r.uid === recordData.uid);
        
        if (existingIndex !== -1) {
            records[existingIndex] = recordData;
        } else {
            records.unshift(recordData); // Ajoute en haut de la liste
        }
        
        const localSaved = this.saveAllRecords(records);

        // ÉTAPE 2 : Synchronisation GitHub (Non bloquante pour la BDD locale)
        const token = this.getToken();
        if (!token) {
            return {
                success: localSaved,
                githubSynced: false,
                message: "Données enregistrées dans la feuille BDD locale (Token GitHub non configuré)."
            };
        }

        try {
            // A. Créer le fichier d'archive individuel dans /archives/
            const safeMission = (recordData.missionId || 'SANS_ID').replace(/[^a-zA-Z0-9_-]/g, '_');
            const safeType = (recordData.sourceType || 'CTRL').replace(/[^a-zA-Z0-9_-]/g, '_');
            const fileName = `${FCI_CONFIG.archiveFolder}/${safeType}_${safeMission}_${Date.now()}.json`;

            await this.uploadFileToGitHub(
                fileName,
                JSON.stringify(recordData, null, 2),
                `Archive ${safeType} - Mission ${recordData.missionId} (${recordData.site})`,
                token
            );

            // B. Mettre à jour le fichier maître consolidé sur GitHub
            await this.syncMasterFileToGitHub(records, token);

            return {
                success: true,
                githubSynced: true,
                message: "Données archivées avec succès dans la feuille BDD et synchronisées sur GitHub !"
            };
        } catch (err) {
            console.warn("Erreur sync GitHub (données bien présentes dans BDD locale):", err);
            return {
                success: localSaved,
                githubSynced: false,
                message: "Données enregistrées dans la feuille BDD locale. (Synchronisation GitHub en attente : " + err.message + ")"
            };
        }
    },

    // Mettre à jour un enregistrement modifié depuis BDD.html
    async updateRecord(uid, updatedFields) {
        const records = this.getAllRecords();
        const idx = records.findIndex(r => r.uid === uid);
        if (idx === -1) return false;

        records[idx] = { ...records[idx], ...updatedFields, updatedAt: new Date().toISOString() };
        this.saveAllRecords(records);

        const token = this.getToken();
        if (token) {
            try {
                await this.syncMasterFileToGitHub(records, token);
            } catch (e) {
                console.warn("Sync GitHub après modification échouée:", e);
            }
        }
        return true;
    },

    // Supprimer un enregistrement depuis BDD.html
    async deleteRecord(uid) {
        let records = this.getAllRecords();
        records = records.filter(r => r.uid !== uid);
        this.saveAllRecords(records);

        const token = this.getToken();
        if (token) {
            try {
                await this.syncMasterFileToGitHub(records, token);
            } catch (e) {
                console.warn("Sync GitHub après suppression échouée:", e);
            }
        }
        return true;
    },

    // Récupérer et fusionner les archives depuis GitHub vers la BDD locale
    async pullFromGitHub() {
        const token = this.getToken();
        const headers = { 'Accept': 'application/vnd.github.v3+json' };
        if (token) headers['Authorization'] = `token ${token}`;

        try {
            const url = `https://api.github.com/repos/${FCI_CONFIG.owner}/${FCI_CONFIG.repo}/contents/${FCI_CONFIG.archiveFolder}?ref=${FCI_CONFIG.branch}&t=${Date.now()}`;
            const response = await fetch(url, { headers });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const files = await response.json();
            if (!Array.isArray(files)) return this.getAllRecords();

            const localRecords = this.getAllRecords();
            const recordMap = new Map(localRecords.map(r => [r.uid, r]));

            // Lire le fichier master s'il existe
            const masterEntry = files.find(f => f.path === FCI_CONFIG.masterFile);
            if (masterEntry && masterEntry.download_url) {
                const mRes = await fetch(masterEntry.download_url + `?t=${Date.now()}`);
                if (mRes.ok) {
                    const masterData = await mRes.json();
                    if (Array.isArray(masterData)) {
                        masterData.forEach(item => {
                            if (item.uid && !recordMap.has(item.uid)) {
                                recordMap.set(item.uid, item);
                            }
                        });
                    }
                }
            }

            // Lire les fichiers individuels JSON du dossier archives/
            const jsonFiles = files.filter(f => f.name.endsWith('.json') && f.path !== FCI_CONFIG.masterFile);
            for (const file of jsonFiles) {
                if (file.download_url) {
                    try {
                        const fRes = await fetch(file.download_url + `?t=${Date.now()}`);
                        if (fRes.ok) {
                            const item = await fRes.json();
                            const key = item.uid || file.sha;
                            item.uid = key;
                            if (!recordMap.has(key)) {
                                recordMap.set(key, item);
                            }
                        }
                    } catch (e) { /* Ignorer fichier illisible */ }
                }
            }

            const merged = Array.from(recordMap.values()).sort((a, b) => {
                return new Date(b.archivedAt || b.date || 0) - new Date(a.archivedAt || a.date || 0);
            });

            this.saveAllRecords(merged);
            return merged;
        } catch (error) {
            console.error("Erreur récupération GitHub:", error);
            return this.getAllRecords();
        }
    },

    // Utilitaire d'encodage Base64 compatible UTF-8 (accents français/arabes)
    utf8ToBase64(str) {
        return btoa(unescape(encodeURIComponent(str)));
    },

    // Upload ou mise à jour d'un fichier sur GitHub
    async uploadFileToGitHub(path, contentStr, commitMessage, token) {
        const apiUrl = `https://api.github.com/repos/${FCI_CONFIG.owner}/${FCI_CONFIG.repo}/contents/${path}`;
        let sha = null;

        // Vérifier si le fichier existe déjà pour obtenir son SHA
        const checkRes = await fetch(`${apiUrl}?ref=${FCI_CONFIG.branch}`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        if (checkRes.ok) {
            const existing = await checkRes.json();
            sha = existing.sha;
        }

        const body = {
            message: commitMessage,
            content: this.utf8ToBase64(contentStr),
            branch: FCI_CONFIG.branch
        };
        if (sha) body.sha = sha;

        const putRes = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!putRes.ok) {
            const errData = await putRes.json().catch(() => ({}));
            throw new Error(errData.message || `Erreur GitHub ${putRes.status}`);
        }
        return await putRes.json();
    },

    async syncMasterFileToGitHub(records, token) {
        return await this.uploadFileToGitHub(
            FCI_CONFIG.masterFile,
            JSON.stringify(records, null, 2),
            `Mise à jour BDD consolidée (${records.length} enregistrements)`,
            token
        );
    }
};

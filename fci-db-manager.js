/**
 * FCI v1.0 - Gestionnaire Central de Base de Données Haute Capacité (IndexedDB + localStorage)
 * & Archivage Automatique GitHub par Année / Mois (archives/AAAA/MM/)
 * Gestion interrégionale, diffusion ciblée des planifications Siège & Cloisonnement Deux Espaces
 * Direction Contrôle Générale - Division Contrôle Permanent - Barid Al-Maghrib
 */
(function () {
    const LOCAL_DB_KEY = 'fci_database';
    const GITHUB_TOKEN_KEY = 'fci_github_pat';
    const GITHUB_CONFIG_KEY = 'fci_github_config_v3';
    const GITHUB_PROMPT_DISMISSED_KEY = 'fci_github_prompt_dismissed';

    const IDB_NAME = 'FCI_Audit_LargeDB';
    const IDB_VERSION = 1;
    const IDB_STORE = 'kv';
    const IDB_RECORD_KEY = 'fci_database';

    // Seuil de sécurité localStorage (~4 Mo pour éviter QuotaExceededError à 5 Mo)
    const LOCALSTORAGE_SAFE_CHAR_LIMIT = 4000000;
    // Seuil d'auto-partitionnement mensuel GitHub (12 Mo brut -> bien en dessous de la limite GitHub 50/100 Mo)
    const GITHUB_SHARD_MAX_BYTES = 12 * 1024 * 1024;

    const DEFAULT_GITHUB_CONFIG = {
        owner: 'FCI-APP',
        repo: 'FCI-audit-archives',
        branch: 'main',
        archiveFolder: 'archives'
    };

    function getDefaultSchema() {
        return {
            missions: [],
            constatsControle: [],
            constatsEncaisses: [],
            planifications: [],
            campagnesPlanification: [],
            notifications: [],
            lastSync: null
        };
    }

    function normalizeDbObject(parsed) {
        return {
            ...getDefaultSchema(),
            ...(parsed && typeof parsed === 'object' ? parsed : {}),
            missions: Array.isArray(parsed?.missions) ? parsed.missions : [],
            constatsControle: Array.isArray(parsed?.constatsControle) ? parsed.constatsControle : [],
            constatsEncaisses: Array.isArray(parsed?.constatsEncaisses) ? parsed.constatsEncaisses : [],
            planifications: Array.isArray(parsed?.planifications) ? parsed.planifications : [],
            campagnesPlanification: Array.isArray(parsed?.campagnesPlanification) ? parsed.campagnesPlanification : [],
            notifications: Array.isArray(parsed?.notifications) ? parsed.notifications : []
        };
    }

    // =========================================================================
    // MOTEUR HAUTE CAPACITÉ LOCAL : INDEXEDDB + CACHE MÉMOIRE + BROADCAST
    // =========================================================================

    let memoryRawDb = null;
    let storedInIndexedDBOnly = false;
    let idbInstancePromise = null;
    let githubWriteQueue = Promise.resolve();

    let broadcastChannel = null;
    try {
        if (typeof BroadcastChannel !== 'undefined') {
            broadcastChannel = new BroadcastChannel('fci_database_sync');
            broadcastChannel.onmessage = (event) => {
                if (event?.data?.type === 'DB_UPDATED') {
                    hydraterDepuisIndexedDB(true);
                }
            };
        }
    } catch (e) {}

    function openIndexedDB() {
        if (idbInstancePromise) return idbInstancePromise;
        idbInstancePromise = new Promise((resolve) => {
            if (typeof indexedDB === 'undefined') {
                resolve(null);
                return;
            }
            try {
                const req = indexedDB.open(IDB_NAME, IDB_VERSION);
                req.onupgradeneeded = (e) => {
                    const db = e.target.result;
                    if (!db.objectStoreNames.contains(IDB_STORE)) {
                        db.createObjectStore(IDB_STORE);
                    }
                };
                req.onsuccess = (e) => resolve(e.target.result);
                req.onerror = () => resolve(null);
            } catch (e) {
                resolve(null);
            }
        });
        return idbInstancePromise;
    }

    async function idbGet(key) {
        const db = await openIndexedDB();
        if (!db) return null;
        return new Promise((resolve) => {
            try {
                const tx = db.transaction(IDB_STORE, 'readonly');
                const req = tx.objectStore(IDB_STORE).get(key);
                req.onsuccess = () => resolve(req.result || null);
                req.onerror = () => resolve(null);
            } catch (e) {
                resolve(null);
            }
        });
    }

    async function idbSet(key, value) {
        const db = await openIndexedDB();
        if (!db) return false;
        return new Promise((resolve) => {
            try {
                const tx = db.transaction(IDB_STORE, 'readwrite');
                tx.objectStore(IDB_STORE).put(value, key);
                tx.oncomplete = () => resolve(true);
                tx.onerror = () => resolve(false);
            } catch (e) {
                resolve(false);
            }
        });
    }

    function readLocalStorageRaw() {
        try {
            const raw = localStorage.getItem(LOCAL_DB_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (parsed && parsed.__storedInIndexedDB) {
                storedInIndexedDBOnly = true;
                return null;
            }
            return normalizeDbObject(parsed);
        } catch (e) {
            return null;
        }
    }

    function mergeCollectionArrays(baseArr, incomingArr, keyField) {
        const result = Array.isArray(baseArr) ? baseArr.map(x => ({ ...x })) : [];
        (Array.isArray(incomingArr) ? incomingArr : []).forEach(item => {
            if (!item || typeof item !== 'object') return;
            const keyVal = keyField ? item[keyField] : (item.id || '');
            const idx = keyVal
                ? result.findIndex(e => (keyField && e[keyField] === keyVal) || (item.id && e.id === item.id))
                : -1;
            if (idx === -1) {
                result.push(item);
            } else {
                const existant = result[idx];
                const dOld = String(existant.updatedAt || existant.dateModification || existant.createdAt || '');
                const dNew = String(item.updatedAt || item.dateModification || item.createdAt || '');
                if (!dOld || (dNew && dNew >= dOld) || (item.isModifie && !existant.isModifie)) {
                    result[idx] = { ...existant, ...item };
                }
            }
        });
        return result;
    }

    function readRawDatabase() {
        if (memoryRawDb) return memoryRawDb;
        const fromLS = readLocalStorageRaw();
        memoryRawDb = fromLS || getDefaultSchema();
        return memoryRawDb;
    }

    function persistRawDatabase(fullDb, notifyTabs = true) {
        const normalized = normalizeDbObject(fullDb);
        normalized.lastSync = normalized.lastSync || new Date().toISOString();
        memoryRawDb = normalized;

        // 1. Écriture principale haute capacité dans IndexedDB (plusieurs centaines de Mo / Go)
        idbSet(IDB_RECORD_KEY, normalized).catch(() => {});

        // 2. Miroir localStorage si la taille reste sous le seuil sûr (< 4 Mo)
        try {
            const serialized = JSON.stringify(normalized);
            if (serialized.length <= LOCALSTORAGE_SAFE_CHAR_LIMIT) {
                localStorage.setItem(LOCAL_DB_KEY, serialized);
                storedInIndexedDBOnly = false;
            } else {
                storedInIndexedDBOnly = true;
                localStorage.setItem(LOCAL_DB_KEY, JSON.stringify({
                    __storedInIndexedDB: true,
                    lastSync: normalized.lastSync,
                    counts: {
                        missions: normalized.missions.length,
                        constatsControle: normalized.constatsControle.length,
                        constatsEncaisses: normalized.constatsEncaisses.length,
                        planifications: normalized.planifications.length,
                        campagnesPlanification: normalized.campagnesPlanification.length,
                        notifications: normalized.notifications.length
                    }
                }));
            }
        } catch (e) {
            // Quota localStorage dépassé -> bascule transparente en mode IndexedDB exclusif sans blocage
            storedInIndexedDBOnly = true;
            try {
                localStorage.setItem(LOCAL_DB_KEY, JSON.stringify({
                    __storedInIndexedDB: true,
                    lastSync: normalized.lastSync
                }));
            } catch (_) {}
        }

        if (notifyTabs && broadcastChannel) {
            try {
                broadcastChannel.postMessage({ type: 'DB_UPDATED', lastSync: normalized.lastSync });
            } catch (e) {}
        }

        return normalized;
    }

    async function hydraterDepuisIndexedDB(forceReplace = false) {
        try {
            const fromIDB = await idbGet(IDB_RECORD_KEY);
            const fromLS = readLocalStorageRaw();

            if (fromIDB && typeof fromIDB === 'object') {
                const idbNorm = normalizeDbObject(fromIDB);
                if (forceReplace || !memoryRawDb) {
                    memoryRawDb = idbNorm;
                } else {
                    const current = memoryRawDb;
                    const idbTs = String(idbNorm.lastSync || '');
                    const curTs = String(current.lastSync || '');
                    const base = idbTs >= curTs ? current : idbNorm;
                    const fresher = idbTs >= curTs ? idbNorm : current;
                    memoryRawDb = {
                        missions: mergeCollectionArrays(base.missions, fresher.missions, 'idMission'),
                        constatsControle: mergeCollectionArrays(base.constatsControle, fresher.constatsControle, 'idConstat'),
                        constatsEncaisses: mergeCollectionArrays(base.constatsEncaisses, fresher.constatsEncaisses, 'idEncaisse'),
                        planifications: mergeCollectionArrays(base.planifications, fresher.planifications, 'idPlanification'),
                        campagnesPlanification: mergeCollectionArrays(base.campagnesPlanification, fresher.campagnesPlanification, 'idCampagne'),
                        notifications: mergeCollectionArrays(base.notifications, fresher.notifications, 'idNotification'),
                        lastSync: fresher.lastSync || base.lastSync || new Date().toISOString()
                    };
                }
                window.dispatchEvent(new CustomEvent('fci-db-synced', { detail: getDB() }));
            } else if (fromLS) {
                // Migration transparente initiale localStorage -> IndexedDB
                memoryRawDb = fromLS;
                await idbSet(IDB_RECORD_KEY, fromLS);
            }
        } catch (e) {
            console.warn('[FCI IndexedDB] Hydratation différée ignorée :', e);
        }
        return getDB();
    }

    const readyPromise = hydraterDepuisIndexedDB(false);

    // =========================================================================
    // AUTHENTIFICATION & CLOISONNEMENT DEUX ESPACES (SIÈGE / RÉGIONAL)
    // =========================================================================

    function getCurrentUser() {
        if (window.FCIAuth && typeof window.FCIAuth.getCurrentUser === 'function') {
            return window.FCIAuth.getCurrentUser();
        }
        return null;
    }

    function isSiegeUser(user = getCurrentUser()) {
        if (!user) return false;
        if (window.FCIAuth && typeof window.FCIAuth.isSiege === 'function') {
            return window.FCIAuth.isSiege();
        }
        return String(user.region || '').toUpperCase() === 'SIEGE';
    }

    function tagRecord(record, user = getCurrentUser()) {
        if (!record || typeof record !== 'object') return record;
        if (window.FCIAuth && typeof window.FCIAuth.tagRecordWithSpace === 'function') {
            return window.FCIAuth.tagRecordWithSpace(record, user);
        }
        return record;
    }

    function canAccess(record, user = getCurrentUser()) {
        if (!record || typeof record !== 'object') return false;
        if (window.FCIAuth && typeof window.FCIAuth.canAccessRecord === 'function') {
            return window.FCIAuth.canAccessRecord(record, user);
        }
        return true;
    }

    function canAccessPlan(plan, user = getCurrentUser()) {
        if (!plan || typeof plan !== 'object') return false;
        if (window.FCIAuth && typeof window.FCIAuth.canAccessPlanification === 'function') {
            return window.FCIAuth.canAccessPlanification(plan, user);
        }
        return canAccess(plan, user);
    }

    /**
     * Retourne uniquement les données visibles selon les règles d'accès de l'utilisateur connecté.
     */
    function getDB() {
        const rawDb = readRawDatabase();
        const user = getCurrentUser();
        if (!user) return getDefaultSchema();

        if (window.FCIAuth && typeof window.FCIAuth.filterDatabase === 'function') {
            const filtered = window.FCIAuth.filterDatabase(rawDb, user);
            return {
                ...filtered,
                controles: filtered.constatsControle,
                encaisses: filtered.constatsEncaisses,
                bdd: [...filtered.constatsControle, ...filtered.constatsEncaisses]
            };
        }

        return rawDb;
    }

    /**
     * Sauvegarde la base dans IndexedDB (+ miroir localStorage) tout en préservant
     * intactes les données hors périmètre (autres régions / données internes du Siège).
     */
    function saveDB(updatedScopedDb) {
        const user = getCurrentUser();
        const fullRawDb = readRawDatabase();
        const incoming = (updatedScopedDb && typeof updatedScopedDb === 'object') ? updatedScopedDb : {};

        const collections = ['missions', 'constatsControle', 'constatsEncaisses', 'planifications'];
        const mergedDb = { ...fullRawDb };

        collections.forEach(colName => {
            if (!Array.isArray(incoming[colName])) return;

            const taggedIncoming = incoming[colName].map(item => {
                if (item && (item.espaceSaisie === 'SIEGE' || item.espaceSaisie === 'REGIONAL')) {
                    if (!item.controleurRegion && item.auteurRegion) {
                        return { ...item, controleurRegion: item.auteurRegion };
                    }
                    return item;
                }
                return tagRecord(item, user);
            });

            if (!user || isSiegeUser(user)) {
                mergedDb[colName] = taggedIncoming;
            } else {
                const accessFn = colName === 'planifications' ? canAccessPlan : canAccess;
                const horsPerimetre = (fullRawDb[colName] || []).filter(existing => !accessFn(existing, user));
                mergedDb[colName] = [...horsPerimetre, ...taggedIncoming];
            }
        });

        // Collections exclusives Siège (campagnesPlanification & notifications) :
        // Un utilisateur régional ne peut jamais écraser les campagnes/notifications du Siège.
        if (!user || isSiegeUser(user)) {
            if (Array.isArray(incoming.campagnesPlanification)) {
                mergedDb.campagnesPlanification = incoming.campagnesPlanification;
            }
            if (Array.isArray(incoming.notifications)) {
                mergedDb.notifications = incoming.notifications;
            }
        } else {
            mergedDb.campagnesPlanification = Array.isArray(fullRawDb.campagnesPlanification) ? fullRawDb.campagnesPlanification : [];
            mergedDb.notifications = Array.isArray(fullRawDb.notifications) ? fullRawDb.notifications : [];
        }

        mergedDb.lastSync = new Date().toISOString();
        persistRawDatabase(mergedDb, true);

        window.dispatchEvent(new CustomEvent('fci-db-synced', { detail: getDB() }));
        return getDB();
    }

    function viderBDD() {
        return saveDB({
            missions: [],
            constatsControle: [],
            constatsEncaisses: [],
            planifications: [],
            campagnesPlanification: [],
            notifications: []
        });
    }

    // =========================================================================
    // CONFIGURATION GITHUB (DÉPÔT, BRANCHE, DOSSIER ARCHIVES & TOKEN)
    // =========================================================================

    function getGitHubConfig() {
        try {
            const raw = localStorage.getItem(GITHUB_CONFIG_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed === 'object') {
                    return {
                        owner: String(parsed.owner || DEFAULT_GITHUB_CONFIG.owner).trim(),
                        repo: String(parsed.repo || DEFAULT_GITHUB_CONFIG.repo).trim(),
                        branch: String(parsed.branch || DEFAULT_GITHUB_CONFIG.branch).trim(),
                        archiveFolder: String(parsed.archiveFolder || DEFAULT_GITHUB_CONFIG.archiveFolder).replace(/^\/+|\/+$/g, '') || 'archives'
                    };
                }
            }
        } catch (e) {}
        return { ...DEFAULT_GITHUB_CONFIG };
    }

    function setGitHubConfig(cfg = {}) {
        const current = getGitHubConfig();
        const next = {
            owner: String(cfg.owner || current.owner).trim(),
            repo: String(cfg.repo || current.repo).trim(),
            branch: String(cfg.branch || current.branch).trim(),
            archiveFolder: String(cfg.archiveFolder || current.archiveFolder).replace(/^\/+|\/+$/g, '') || 'archives'
        };
        localStorage.setItem(GITHUB_CONFIG_KEY, JSON.stringify(next));
        return next;
    }

    function configurerStockageGitHub() {
        const cfg = getGitHubConfig();
        const repoActuel = `${cfg.owner}/${cfg.repo}`;
        const saisieRepo = prompt(
            "Configuration de l'espace d'archivage GitHub (Multi-années / Haute capacité)\n\n" +
            "Dépôt cible au format proprietaire/depot :\n" +
            "• Par défaut (recommandé, privé) : FCI-APP/FCI-audit-archives\n" +
            "• Dépôt applicatif : FCI-APP/FCI-audit",
            repoActuel
        );
        if (saisieRepo === null) return cfg;

        const cleanRepo = saisieRepo.trim();
        let owner = cfg.owner;
        let repo = cfg.repo;
        if (cleanRepo.includes('/')) {
            const parts = cleanRepo.split('/').map(s => s.trim()).filter(Boolean);
            if (parts.length >= 2) {
                owner = parts[0];
                repo = parts[1];
            }
        }

        const saisieBranche = prompt(
            `Branche GitHub pour les archives (${owner}/${repo}) :\n` +
            "• Par défaut : main",
            cfg.branch
        );
        if (saisieBranche === null) return setGitHubConfig({ owner, repo });

        const branch = saisieBranche.trim() || 'main';
        const updated = setGitHubConfig({ owner, repo, branch, archiveFolder: 'archives' });
        return updated;
    }

    function getGitHubToken() {
        try {
            return String(localStorage.getItem(GITHUB_TOKEN_KEY) || '').trim();
        } catch (e) {
            return '';
        }
    }

    function setGitHubToken(token) {
        const clean = String(token || '').trim();
        if (clean) {
            localStorage.setItem(GITHUB_TOKEN_KEY, clean);
            try { sessionStorage.removeItem(GITHUB_PROMPT_DISMISSED_KEY); } catch (e) {}
        }
        return clean;
    }

    function configurerGitHubToken() {
        const cfg = getGitHubConfig();
        const actuel = getGitHubToken();
        const saisie = prompt(
            `Configuration Archivage GitHub (${cfg.owner}/${cfg.repo} — dossier ${cfg.archiveFolder}/AAAA/MM/)\n` +
            "Veuillez coller votre Fine-grained Personal Access Token (droits Contents : Read & Write) :",
            actuel
        );
        if (saisie !== null && saisie.trim() !== '') {
            return setGitHubToken(saisie.trim());
        }
        if (saisie === null) {
            try { sessionStorage.setItem(GITHUB_PROMPT_DISMISSED_KEY, '1'); } catch (e) {}
        }
        return actuel;
    }

    function obtenirTokenPourSyncAuto() {
        let token = getGitHubToken();
        if (token) return token;
        let dismissed = false;
        try { dismissed = sessionStorage.getItem(GITHUB_PROMPT_DISMISSED_KEY) === '1'; } catch (e) {}
        if (!dismissed && typeof prompt === 'function') {
            token = configurerGitHubToken();
        }
        return token;
    }

    // =========================================================================
    // UTILITAIRES UTF-8 / BASE64 / EXTRACTION ANNÉE-MOIS (AAAA/MM)
    // =========================================================================

    function encodeBase64UTF8(str) {
        const bytes = new TextEncoder().encode(str);
        const chunkSize = 0x8000;
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i += chunkSize) {
            binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
        }
        return btoa(binary);
    }

    function decodeBase64UTF8(base64) {
        const binary = atob(String(base64 || '').replace(/\s/g, ''));
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return new TextDecoder().decode(bytes);
    }

    function extraireAnneeMois(itemOrArray) {
        const cible = Array.isArray(itemOrArray) ? itemOrArray[0] : itemOrArray;
        const candidats = [];
        if (cible && typeof cible === 'object') {
            candidats.push(
                cible.date,
                cible.dateControle,
                cible.dateVerification,
                cible.datePrevue,
                cible.dateDebut,
                cible.dateArchivage,
                cible.createdAt
            );
        } else if (typeof itemOrArray === 'string') {
            candidats.push(itemOrArray);
        }

        for (const raw of candidats) {
            let str = String(raw || '').trim();
            if (!str) continue;
            if (str.includes('T')) str = str.split('T')[0];

            // Format jj/mm/aaaa
            if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
                const [, m, y] = str.split('/');
                const mois = m.padStart(2, '0');
                if (Number(mois) >= 1 && Number(mois) <= 12) {
                    return { annee: y, mois, dossier: `${y}/${mois}`, tag: `${y}-${mois}` };
                }
            }
            // Format aaaa-mm-jj ou aaaa-mm
            if (/^\d{4}-\d{1,2}(-\d{1,2})?$/.test(str)) {
                const [y, m] = str.split('-');
                const mois = m.padStart(2, '0');
                if (Number(mois) >= 1 && Number(mois) <= 12) {
                    return { annee: y, mois, dossier: `${y}/${mois}`, tag: `${y}-${mois}` };
                }
            }
        }

        const now = new Date();
        const annee = String(now.getFullYear());
        const mois = String(now.getMonth() + 1).padStart(2, '0');
        return { annee, mois, dossier: `${annee}/${mois}`, tag: `${annee}-${mois}` };
    }

    // =========================================================================
    // MOTEUR API REST GITHUB (ARCHIVAGE CONSOLIDÉ PAR ANNÉE/MOIS + SHARDING)
    // =========================================================================

    function buildGitHubHeaders(token, withJsonContent = false) {
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28'
        };
        if (withJsonContent) {
            headers['Content-Type'] = 'application/json';
        }
        return headers;
    }

    /**
     * Lit un fichier JSON sur GitHub quelle que soit sa taille (<= 1 Mo via Contents API,
     * > 1 Mo jusqu'à 100 Mo via Git Blobs API).
     */
    async function lireFichierGitHub(cfg, token, cheminGitHub, knownSha = '') {
        const headers = buildGitHubHeaders(token, false);
        const contentsUrl = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${cheminGitHub}?ref=${encodeURIComponent(cfg.branch)}`;

        if (knownSha) {
            const blobUrl = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/git/blobs/${knownSha}`;
            const blobRes = await fetch(blobUrl, { headers });
            if (blobRes.ok) {
                const blobData = await blobRes.json();
                const texte = blobData.encoding === 'base64'
                    ? decodeBase64UTF8(blobData.content || '')
                    : String(blobData.content || '');
                return { exists: true, sha: knownSha, json: texte ? JSON.parse(texte) : null };
            }
        }

        const res = await fetch(contentsUrl, { headers });
        if (res.status === 404) {
            return { exists: false, sha: null, json: null };
        }

        if (res.ok) {
            const fileData = await res.json();
            if (fileData.content) {
                const texte = decodeBase64UTF8(fileData.content);
                return { exists: true, sha: fileData.sha, json: texte ? JSON.parse(texte) : null };
            }
            if (fileData.sha) {
                const blobUrl = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/git/blobs/${fileData.sha}`;
                const blobRes = await fetch(blobUrl, { headers });
                if (blobRes.ok) {
                    const blobData = await blobRes.json();
                    const texte = blobData.encoding === 'base64'
                        ? decodeBase64UTF8(blobData.content || '')
                        : String(blobData.content || '');
                    return { exists: true, sha: fileData.sha, json: texte ? JSON.parse(texte) : null };
                }
            }
            return { exists: true, sha: fileData.sha || null, json: null };
        }

        // Si HTTP 403 too_large (> 1 Mo sur Contents API), récupérer le SHA depuis le dossier parent
        if (res.status === 403) {
            const parentDir = cheminGitHub.split('/').slice(0, -1).join('/');
            const fileName = cheminGitHub.split('/').pop();
            const dirUrl = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${parentDir}?ref=${encodeURIComponent(cfg.branch)}`;
            const dirRes = await fetch(dirUrl, { headers });
            if (dirRes.ok) {
                const entries = await dirRes.json();
                const entry = Array.isArray(entries) ? entries.find(e => e.name === fileName) : null;
                if (entry && entry.sha) {
                    return lireFichierGitHub(cfg, token, cheminGitHub, entry.sha);
                }
            }
        }

        const errData = await res.json().catch(() => ({}));
        throw new Error(`HTTP ${res.status} : ${errData.message || 'Lecture impossible'}`);
    }

    function cheminFichierMensuel(cfg, typeFiche, infoPeriode, partie = 1) {
        const suffixePartie = partie > 1 ? `_part${partie}` : '';
        return `${cfg.archiveFolder}/${infoPeriode.dossier}/${typeFiche}_${infoPeriode.tag}${suffixePartie}.json`;
    }

    function compterEnregistrementsArchive(typeFiche, donnees) {
        if (typeFiche === 'PLAN' && donnees && !Array.isArray(donnees)) {
            return (donnees.missions?.length || 0) +
                   (donnees.planifications?.length || 0) +
                   (donnees.campagnesPlanification?.length || 0) +
                   (donnees.notifications?.length || 0);
        }
        return Array.isArray(donnees) ? donnees.length : (donnees ? 1 : 0);
    }

    function fusionnerDonneesArchive(typeFiche, existant, entrant) {
        if (typeFiche === 'FC') {
            const baseArr = Array.isArray(existant) ? existant : (existant ? [existant] : []);
            const incArr = Array.isArray(entrant) ? entrant : (entrant ? [entrant] : []);
            return mergeCollectionArrays(baseArr, incArr, 'idConstat');
        }
        if (typeFiche === 'FV') {
            const baseArr = Array.isArray(existant) ? existant : (existant ? [existant] : []);
            const incArr = Array.isArray(entrant) ? entrant : (entrant ? [entrant] : []);
            return mergeCollectionArrays(baseArr, incArr, 'idEncaisse');
        }
        // PLAN : missions + planifications + campagnesPlanification + notifications regroupées proprement
        const isPlanContainer = (obj) => obj && !Array.isArray(obj) && (
            Array.isArray(obj.missions) ||
            Array.isArray(obj.planifications) ||
            Array.isArray(obj.campagnesPlanification) ||
            Array.isArray(obj.notifications)
        );
        const baseObj = isPlanContainer(existant)
            ? existant
            : {
                missions: existant && existant.idMission ? [existant] : [],
                planifications: existant && existant.idPlanification ? [existant] : [],
                campagnesPlanification: existant && existant.idCampagne ? [existant] : [],
                notifications: existant && existant.idNotification ? [existant] : []
            };
        const incObj = isPlanContainer(entrant)
            ? entrant
            : {
                missions: entrant && entrant.idMission ? [entrant] : [],
                planifications: entrant && entrant.idPlanification ? [entrant] : [],
                campagnesPlanification: entrant && entrant.idCampagne ? [entrant] : [],
                notifications: entrant && entrant.idNotification ? [entrant] : []
            };
        return {
            missions: mergeCollectionArrays(baseObj.missions || [], incObj.missions || [], 'idMission'),
            planifications: mergeCollectionArrays(baseObj.planifications || [], incObj.planifications || [], 'idPlanification'),
            campagnesPlanification: mergeCollectionArrays(baseObj.campagnesPlanification || [], incObj.campagnesPlanification || [], 'idCampagne'),
            notifications: mergeCollectionArrays(baseObj.notifications || [], incObj.notifications || [], 'idNotification')
        };
    }

    /**
     * Archive un lot de données dans le dossier mensuel archives/AAAA/MM/{TYPE}_AAAA-MM.json
     * avec fusion sans écrasement, gestion des conflits HTTP 409/422 et auto-partitionnement (> 12 Mo).
     */
    async function upsertMensuelGitHub(typeFiche, infoPeriode, donneesEntrantes, commitContext = '', tokenForce = '') {
        const token = tokenForce || obtenirTokenPourSyncAuto();
        if (!token) {
            return { success: false, reason: 'NO_TOKEN', message: 'Token GitHub non configuré.' };
        }

        const cfg = getGitHubConfig();
        const headers = buildGitHubHeaders(token, true);
        let partie = 1;

        while (partie <= 25) {
            const cheminGitHub = cheminFichierMensuel(cfg, typeFiche, infoPeriode, partie);
            const apiUrl = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${cheminGitHub}`;

            for (let tentative = 1; tentative <= 4; tentative++) {
                try {
                    const lecture = await lireFichierGitHub(cfg, token, cheminGitHub);
                    const existantDonnees = lecture.json && lecture.json.donnees !== undefined ? lecture.json.donnees : null;
                    const fusionne = fusionnerDonneesArchive(typeFiche, existantDonnees, donneesEntrantes);

                    const enveloppe = {
                        application: "Fiche de contrôle intelligente (FCI) v1.0 © 2026 - 2027",
                        organisme: "Barid Al-Maghrib - Direction Contrôle Générale",
                        formatVersion: "2.0-monthly",
                        typeArchive: typeFiche,
                        periode: infoPeriode.tag,
                        partie,
                        dateArchivage: new Date().toISOString(),
                        nbEnregistrements: compterEnregistrementsArchive(typeFiche, fusionne),
                        donnees: fusionne
                    };

                    const jsonText = JSON.stringify(enveloppe);

                    // Si le fichier mensuel existant + nouvelles données dépasse 12 Mo, passer au volume suivant (_part2, _part3...)
                    if (lecture.exists && jsonText.length > GITHUB_SHARD_MAX_BYTES) {
                        partie++;
                        break;
                    }

                    const bodyPayload = {
                        message: `[FCI Archive ${infoPeriode.dossier}] ${typeFiche}${commitContext ? ' - ' + commitContext : ''} (${enveloppe.nbEnregistrements} élément(s))`,
                        content: encodeBase64UTF8(jsonText),
                        branch: cfg.branch
                    };
                    if (lecture.sha) {
                        bodyPayload.sha = lecture.sha;
                    }

                    const putRes = await fetch(apiUrl, {
                        method: 'PUT',
                        headers,
                        body: JSON.stringify(bodyPayload)
                    });

                    if (putRes.status === 409 || putRes.status === 422) {
                        // Conflit SHA concurrent : nouvel essai avec lecture fraîche
                        await new Promise(r => setTimeout(r, 250 * tentative));
                        continue;
                    }

                    if (!putRes.ok) {
                        const err = await putRes.json().catch(() => ({}));
                        throw new Error(`HTTP ${putRes.status} : ${err.message || 'Échec PUT GitHub'}`);
                    }

                    const result = await putRes.json();
                    console.info(`[FCI GitHub] Archivé : ${cheminGitHub} (${enveloppe.nbEnregistrements} enregistrements)`);
                    return {
                        success: true,
                        path: cheminGitHub,
                        url: result?.content?.html_url || '',
                        count: enveloppe.nbEnregistrements
                    };
                } catch (error) {
                    if (tentative === 4) {
                        console.error(`[FCI GitHub] Erreur d'archivage (${cheminGitHub}) :`, error);
                        return { success: false, path: cheminGitHub, error: error.message };
                    }
                    await new Promise(r => setTimeout(r, 250 * tentative));
                }
            }
        }

        return { success: false, error: 'Nombre maximal de partitions mensuelles atteint.' };
    }

    function enfilerEcritureGitHub(taskFn) {
        const next = githubWriteQueue.then(taskFn, taskFn);
        githubWriteQueue = next.catch(() => {});
        return next;
    }

    async function archiverSurGitHub(typeFiche, entite, identifiant, donnees) {
        const typeNorm = String(typeFiche || 'FC').toUpperCase();

        if (typeNorm === 'PLAN') {
            const info = extraireAnneeMois(donnees);
            const payload = (donnees && (donnees.missions || donnees.planifications || donnees.campagnesPlanification || donnees.notifications))
                ? donnees
                : (donnees?.idCampagne
                    ? { campagnesPlanification: [donnees] }
                    : (donnees?.idNotification
                        ? { notifications: [donnees] }
                        : (donnees?.idPlanification ? { planifications: [donnees] } : { missions: [donnees] })));
            const res = await enfilerEcritureGitHub(() =>
                upsertMensuelGitHub('PLAN', info, payload, entite || identifiant || '')
            );
            return { ...res, paths: res.path ? [res.path] : [] };
        }

        const items = Array.isArray(donnees) ? donnees : (donnees ? [donnees] : []);
        if (items.length === 0) return { success: true, paths: [] };

        // Regrouper automatiquement par sous-dossier AAAA/MM selon la date de chaque constat
        const parPeriode = new Map();
        items.forEach(item => {
            const info = extraireAnneeMois(item);
            if (!parPeriode.has(info.dossier)) {
                parPeriode.set(info.dossier, { info, items: [] });
            }
            parPeriode.get(info.dossier).items.push(item);
        });

        const paths = [];
        let lastError = '';
        for (const { info, items: lot } of parPeriode.values()) {
            const res = await enfilerEcritureGitHub(() =>
                upsertMensuelGitHub(typeNorm, info, lot, entite || identifiant || '')
            );
            if (res.success && res.path) {
                paths.push(res.path);
            } else if (res.reason === 'NO_TOKEN') {
                return res;
            } else {
                lastError = res.error || 'Erreur inconnue';
            }
        }

        return {
            success: paths.length > 0 && !lastError,
            path: paths[0] || '',
            paths,
            error: lastError || undefined
        };
    }

    /**
     * Supprime des identifiants donnés dans le fichier mensuel GitHub correspondant
     * afin d'éviter qu'un élément supprimé ne réapparaisse lors d'une restauration.
     */
    async function supprimerDeArchiveGitHub(typeFiche, idsASupprimer = [], dateRef = '') {
        const token = getGitHubToken();
        if (!token) return { success: false, reason: 'NO_TOKEN' };

        const idsSet = new Set((Array.isArray(idsASupprimer) ? idsASupprimer : [idsASupprimer]).filter(Boolean));
        if (idsSet.size === 0) return { success: true, removed: 0 };

        const typeNorm = String(typeFiche || '').toUpperCase();
        const cfg = getGitHubConfig();
        const headers = buildGitHubHeaders(token, true);

        return enfilerEcritureGitHub(async () => {
            try {
                const info = extraireAnneeMois(dateRef);
                const fichiers = await listerArchivesGitHub({ annee: info.annee, mois: info.mois });
                const cibles = fichiers.filter(f => f.name.startsWith(`${typeNorm}_${info.tag}`));

                let totalRemoved = 0;
                for (const fichier of cibles) {
                    const lecture = await lireFichierGitHub(cfg, token, fichier.path, fichier.sha);
                    if (!lecture.exists || !lecture.json || lecture.json.donnees === undefined) continue;

                    let modifie = false;
                    let donneesMaj = lecture.json.donnees;

                    if (typeNorm === 'FC' && Array.isArray(donneesMaj)) {
                        const avant = donneesMaj.length;
                        donneesMaj = donneesMaj.filter(x => !idsSet.has(x.idConstat));
                        totalRemoved += (avant - donneesMaj.length);
                        modifie = donneesMaj.length !== avant;
                    } else if (typeNorm === 'FV' && Array.isArray(donneesMaj)) {
                        const avant = donneesMaj.length;
                        donneesMaj = donneesMaj.filter(x => !idsSet.has(x.idEncaisse));
                        totalRemoved += (avant - donneesMaj.length);
                        modifie = donneesMaj.length !== avant;
                    } else if (typeNorm === 'PLAN' && donneesMaj && !Array.isArray(donneesMaj)) {
                        const mAvant = (donneesMaj.missions || []).length;
                        const pAvant = (donneesMaj.planifications || []).length;
                        donneesMaj = {
                            missions: (donneesMaj.missions || []).filter(m => !idsSet.has(m.idMission)),
                            planifications: (donneesMaj.planifications || []).filter(p => !idsSet.has(p.idPlanification))
                        };
                        const diff = (mAvant - donneesMaj.missions.length) + (pAvant - donneesMaj.planifications.length);
                        totalRemoved += diff;
                        modifie = diff > 0;
                    }

                    if (modifie) {
                        const enveloppe = {
                            ...lecture.json,
                            dateArchivage: new Date().toISOString(),
                            nbEnregistrements: compterEnregistrementsArchive(typeNorm, donneesMaj),
                            donnees: donneesMaj
                        };
                        const apiUrl = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${fichier.path}`;
                        await fetch(apiUrl, {
                            method: 'PUT',
                            headers,
                            body: JSON.stringify({
                                message: `[FCI Suppression ${info.dossier}] ${typeNorm} (${totalRemoved} supprimé(s))`,
                                content: encodeBase64UTF8(JSON.stringify(enveloppe)),
                                branch: cfg.branch,
                                sha: lecture.sha
                            })
                        });
                    }
                }
                return { success: true, removed: totalRemoved };
            } catch (e) {
                console.warn('[FCI GitHub] Suppression archive ignorée :', e);
                return { success: false, error: e.message };
            }
        });
    }

    /**
     * Liste récursivement toutes les archives JSON sous archives/AAAA/MM/ via l'API Git Trees.
     * Supporte le filtrage optionnel par année et/ou mois : { annee: '2026', mois: '11' }.
     */
    async function listerArchivesGitHub(filtre = {}) {
        const token = getGitHubToken();
        if (!token) return [];

        const cfg = getGitHubConfig();
        const headers = buildGitHubHeaders(token, false);
        const prefixeBase = `${cfg.archiveFolder}/`;
        let prefixeCible = prefixeBase;
        if (filtre?.annee) {
            prefixeCible += `${String(filtre.annee).trim()}/`;
            if (filtre?.mois) {
                prefixeCible += `${String(filtre.mois).trim().padStart(2, '0')}/`;
            }
        }

        const treeUrl = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/git/trees/${encodeURIComponent(cfg.branch)}?recursive=1`;
        const treeRes = await fetch(treeUrl, { headers });

        if (treeRes.ok) {
            const treeData = await treeRes.json();
            return (treeData.tree || [])
                .filter(item =>
                    item.type === 'blob' &&
                    item.path.startsWith(prefixeCible) &&
                    item.path.endsWith('.json')
                )
                .map(item => ({
                    name: item.path.split('/').pop(),
                    path: item.path,
                    sha: item.sha,
                    size: item.size || 0
                }))
                .sort((a, b) => a.path.localeCompare(b.path));
        }

        return [];
    }

    /**
     * Restaure les archives GitHub (toutes années/mois ou période filtrée) dans IndexedDB + localStorage,
     * compatible avec les fichiers mensuels v2 (FC_AAAA-MM.json, FV_AAAA-MM.json, PLAN_AAAA-MM.json)
     * et les anciens fichiers individuels v1.
     */
    async function restaurerDepuisGitHub(filtre = {}) {
        await readyPromise;

        let token = getGitHubToken();
        if (!token) {
            token = configurerGitHubToken();
        }
        if (!token) {
            return { success: false, message: "Token GitHub requis pour charger les archives." };
        }

        const cfg = getGitHubConfig();
        const fichiers = await listerArchivesGitHub(filtre);
        if (fichiers.length === 0) {
            return {
                success: true,
                count: 0,
                message: `Aucune archive JSON trouvée dans ${cfg.owner}/${cfg.repo}/${cfg.archiveFolder}/.`
            };
        }

        const fullRawDb = normalizeDbObject(readRawDatabase());
        const stats = { fichiers: 0, missions: 0, planifications: 0, constatsControle: 0, constatsEncaisses: 0 };

        for (const f of fichiers) {
            try {
                const lecture = await lireFichierGitHub(cfg, token, f.path, f.sha);
                const archive = lecture.json;
                if (!archive || archive.donnees === undefined) continue;

                const typeArch = String(archive.typeArchive || '').toUpperCase();
                const d = archive.donnees;

                if (typeArch === 'PLAN') {
                    if (d && !Array.isArray(d) && (Array.isArray(d.missions) || Array.isArray(d.planifications) || Array.isArray(d.campagnesPlanification) || Array.isArray(d.notifications))) {
                        const incM = d.missions || [];
                        const incP = d.planifications || [];
                        const incC = d.campagnesPlanification || [];
                        const incN = d.notifications || [];
                        fullRawDb.missions = mergeCollectionArrays(fullRawDb.missions, incM, 'idMission');
                        fullRawDb.planifications = mergeCollectionArrays(fullRawDb.planifications, incP, 'idPlanification');
                        fullRawDb.campagnesPlanification = mergeCollectionArrays(fullRawDb.campagnesPlanification, incC, 'idCampagne');
                        fullRawDb.notifications = mergeCollectionArrays(fullRawDb.notifications, incN, 'idNotification');
                        stats.missions += incM.length;
                        stats.planifications += incP.length;
                    } else if (d && typeof d === 'object') {
                        if (d.idCampagne) {
                            fullRawDb.campagnesPlanification = mergeCollectionArrays(fullRawDb.campagnesPlanification, [d], 'idCampagne');
                        } else if (d.idNotification) {
                            fullRawDb.notifications = mergeCollectionArrays(fullRawDb.notifications, [d], 'idNotification');
                        } else if (d.idPlanification) {
                            fullRawDb.planifications = mergeCollectionArrays(fullRawDb.planifications, [d], 'idPlanification');
                            stats.planifications += 1;
                        } else {
                            fullRawDb.missions = mergeCollectionArrays(fullRawDb.missions, [d], 'idMission');
                            stats.missions += 1;
                        }
                    }
                    stats.fichiers++;
                } else if (typeArch === 'FC') {
                    const incFC = Array.isArray(d) ? d : [d];
                    fullRawDb.constatsControle = mergeCollectionArrays(fullRawDb.constatsControle, incFC, 'idConstat');
                    stats.constatsControle += incFC.length;
                    stats.fichiers++;
                } else if (typeArch === 'FV') {
                    const incFV = Array.isArray(d) ? d : [d];
                    fullRawDb.constatsEncaisses = mergeCollectionArrays(fullRawDb.constatsEncaisses, incFV, 'idEncaisse');
                    stats.constatsEncaisses += incFV.length;
                    stats.fichiers++;
                }
            } catch (e) {
                console.warn(`[FCI GitHub] Lecture ignorée pour ${f.path} :`, e);
            }
        }

        fullRawDb.lastSync = new Date().toISOString();
        persistRawDatabase(fullRawDb, true);
        window.dispatchEvent(new CustomEvent('fci-db-synced', { detail: getDB() }));

        return {
            success: true,
            count: stats.fichiers,
            stats,
            message: `${stats.fichiers} archive(s) mensuelle(s) chargée(s) depuis ${cfg.owner}/${cfg.repo}/${cfg.archiveFolder}/ (${stats.constatsControle} FC, ${stats.constatsEncaisses} FV, ${stats.missions + stats.planifications} Planifications) vers la BDD haute capacité.`
        };
    }

    /**
     * Archive en masse toutes les données présentes en BDD locale vers GitHub
     * en les rangeant automatiquement dans archives/AAAA/MM/.
     */
    async function archiverTouteLaBDDSurGitHub(onProgress = null) {
        await readyPromise;

        let token = getGitHubToken();
        if (!token) {
            token = configurerGitHubToken();
        }
        if (!token) {
            return { success: false, message: "Token GitHub requis pour archiver la BDD sur GitHub." };
        }

        const db = getDB();
        const cfg = getGitHubConfig();

        // Regroupement par (type, AAAA/MM)
        const buckets = new Map();
        const addBucket = (type, item, subKey = '') => {
            if (!item || typeof item !== 'object') return;
            const info = extraireAnneeMois(item);
            const k = `${type}__${info.dossier}`;
            if (!buckets.has(k)) {
                buckets.set(k, {
                    type,
                    info,
                    data: type === 'PLAN' ? { missions: [], planifications: [], campagnesPlanification: [], notifications: [] } : []
                });
            }
            const entry = buckets.get(k);
            if (type === 'PLAN') {
                entry.data[subKey].push(item);
            } else {
                entry.data.push(item);
            }
        };

        (db.constatsControle || []).forEach(c => addBucket('FC', c));
        (db.constatsEncaisses || []).forEach(e => addBucket('FV', e));
        (db.missions || []).forEach(m => addBucket('PLAN', m, 'missions'));
        (db.planifications || []).forEach(p => addBucket('PLAN', p, 'planifications'));
        (db.campagnesPlanification || []).forEach(c => addBucket('PLAN', c, 'campagnesPlanification'));
        (db.notifications || []).forEach(n => addBucket('PLAN', n, 'notifications'));

        if (buckets.size === 0) {
            return { success: true, filesUpdated: 0, paths: [], message: "Aucune donnée en BDD locale à archiver." };
        }

        const totalBuckets = buckets.size;
        let done = 0;
        const paths = [];
        const erreurs = [];

        for (const bucket of buckets.values()) {
            const res = await enfilerEcritureGitHub(() =>
                upsertMensuelGitHub(bucket.type, bucket.info, bucket.data, 'Sync BDD complète', token)
            );
            done++;
            if (typeof onProgress === 'function') {
                try { onProgress(done, totalBuckets, res.path || ''); } catch (e) {}
            }
            if (res.success && res.path) {
                paths.push(res.path);
            } else {
                erreurs.push(`${bucket.type} ${bucket.info.dossier}: ${res.error || 'Erreur'}`);
            }
        }

        if (erreurs.length > 0 && paths.length === 0) {
            return {
                success: false,
                filesUpdated: 0,
                paths,
                message: `Échec de l'archivage GitHub : ${erreurs[0]}`
            };
        }

        return {
            success: erreurs.length === 0,
            filesUpdated: paths.length,
            paths,
            message: `${paths.length} dossier(s)/fichier(s) mensuel(s) archivé(s) dans ${cfg.owner}/${cfg.repo}/${cfg.archiveFolder}/AAAA/MM/` +
                (erreurs.length > 0 ? ` (${erreurs.length} erreur(s) partielle(s))` : '.')
        };
    }

    // =========================================================================
    // MÉTHODES MÉTIER (BDD HAUTE CAPACITÉ + ARCHIVAGE AUTOMATIQUE GITHUB)
    // =========================================================================

    async function enregistrerMission(mission, syncGitHub = true) {
        if (!mission || typeof mission !== 'object') return getDB();
        const user = getCurrentUser();
        const db = getDB();

        const taggedMission = tagRecord({
            ...mission,
            idMission: mission.idMission || ('MISS-' + Date.now())
        }, user);

        const missions = db.missions || [];
        const idx = missions.findIndex(m => m.idMission === taggedMission.idMission);
        if (idx !== -1) {
            missions[idx] = { ...missions[idx], ...taggedMission };
        } else {
            missions.push(taggedMission);
        }

        db.missions = missions;
        const saved = saveDB(db);

        if (syncGitHub) {
            const entite = taggedMission.entite || taggedMission.site || taggedMission.agence || 'Mission';
            const ghRes = await archiverSurGitHub('PLAN', entite, taggedMission.idMission, { missions: [taggedMission] });
            saved._githubArchive = ghRes;
        }
        return saved;
    }

    async function enregistrerLotControle(lotConstats, site = '', idMission = '', syncGitHub = true) {
        if (!Array.isArray(lotConstats) || lotConstats.length === 0) return getDB();
        const user = getCurrentUser();
        const db = getDB();

        const taggedLot = lotConstats.map(item => tagRecord({
            ...item,
            sourceFeuille: 'FC',
            site: item.site || site,
            idMission: item.idMission || idMission
        }, user));

        const existants = db.constatsControle || [];
        taggedLot.forEach(item => {
            const idx = existants.findIndex(e =>
                (item.idConstat && e.idConstat === item.idConstat) ||
                (item.id && e.id === item.id)
            );
            if (idx !== -1) {
                existants[idx] = { ...existants[idx], ...item };
            } else {
                existants.push(item);
            }
        });

        db.constatsControle = existants;
        const saved = saveDB(db);

        if (syncGitHub && taggedLot.length > 0) {
            const premier = taggedLot[0];
            const entiteCible = site || premier.entite || premier.site || 'Controle';
            const missionCible = idMission || premier.idMission || premier.idConstat || Date.now();
            const ghRes = await archiverSurGitHub('FC', entiteCible, missionCible, taggedLot);
            saved._githubArchive = ghRes;
        }
        return saved;
    }

    async function enregistrerConstatsControle(lotConstats, syncGitHub = true) {
        return enregistrerLotControle(lotConstats, '', '', syncGitHub);
    }

    async function enregistrerLotEncaisses(lotEncaisses, site = '', idMission = '', syncGitHub = true) {
        if (!Array.isArray(lotEncaisses) || lotEncaisses.length === 0) return getDB();
        const user = getCurrentUser();
        const db = getDB();

        const taggedLot = lotEncaisses.map(item => tagRecord({
            ...item,
            sourceFeuille: 'FV',
            site: item.site || site,
            idMission: item.idMission || idMission
        }, user));

        const existants = db.constatsEncaisses || [];
        taggedLot.forEach(item => {
            const idx = existants.findIndex(e =>
                (item.idEncaisse && e.idEncaisse === item.idEncaisse) ||
                (item.id && e.id === item.id)
            );
            if (idx !== -1) {
                existants[idx] = { ...existants[idx], ...item };
            } else {
                existants.push(item);
            }
        });

        db.constatsEncaisses = existants;
        const saved = saveDB(db);

        if (syncGitHub && taggedLot.length > 0) {
            const premier = taggedLot[0];
            const siteCible = site || premier.site || premier.entite || 'Encaisse';
            const missionCible = idMission || premier.idMission || premier.idEncaisse || Date.now();
            const ghRes = await archiverSurGitHub('FV', siteCible, missionCible, taggedLot);
            saved._githubArchive = ghRes;
        }
        return saved;
    }

    async function enregistrerConstatEncaisse(encaisse, syncGitHub = true) {
        if (!encaisse) return getDB();
        return enregistrerLotEncaisses([encaisse], encaisse.site || '', encaisse.idMission || '', syncGitHub);
    }

    /**
     * Enregistre ou met à jour une ligne de planification (FC Contrôle ou FV Vérification)
     * avec diffusion ciblée aux contrôleurs désignés + archivage mensuel GitHub.
     */
    async function enregistrerPlanification(plan, syncGitHub = true) {
        if (!plan || typeof plan !== 'object') return getDB();
        const user = getCurrentUser();
        const db = getDB();

        const sourceFeuille = String(plan.sourceFeuille || (String(plan.natureMission || '').toUpperCase().includes('VERIF') ? 'FV' : 'FC')).toUpperCase();
        const basePlan = {
            ...plan,
            sourceFeuille,
            idPlanification: plan.idPlanification || ((sourceFeuille === 'FV' ? 'PLAN-FV-' : 'PLAN-') + Date.now())
        };

        const taggedPlan = (plan.espaceSaisie === 'SIEGE' || plan.espaceSaisie === 'REGIONAL')
            ? basePlan
            : tagRecord(basePlan, user);

        const plans = db.planifications || [];
        const idx = plans.findIndex(p => p.idPlanification === taggedPlan.idPlanification);
        if (idx !== -1) {
            plans[idx] = { ...plans[idx], ...taggedPlan };
        } else {
            plans.push(taggedPlan);
        }

        db.planifications = plans;
        const saved = saveDB(db);

        if (syncGitHub) {
            const entite = taggedPlan.entite || taggedPlan.site || taggedPlan.centre || 'Planification';
            const ghRes = await archiverSurGitHub('PLAN', entite, taggedPlan.idPlanification, { planifications: [taggedPlan] });
            saved._githubArchive = ghRes;
        }
        return saved;
    }

    /**
     * Supprime une planification autorisée par son identifiant (+ synchronisation archive GitHub si token actif).
     */
    function supprimerPlanification(idPlanification) {
        if (!idPlanification) return getDB();
        const db = getDB();
        const cible = (db.planifications || []).find(p => p.idPlanification === idPlanification);
        db.planifications = (db.planifications || []).filter(p => p.idPlanification !== idPlanification);
        const saved = saveDB(db);

        if (cible && getGitHubToken()) {
            supprimerDeArchiveGitHub('PLAN', [idPlanification], cible).catch(() => {});
        }
        return saved;
    }

    /**
     * Met à jour l'état d'avancement d'une planification (EN_COURS <-> CLOTURE / REALISEE)
     * visible immédiatement par le Siège et par le contrôleur concerné.
     */
    function marquerPlanificationStatut(idPlanification, statut, extra = {}) {
        if (!idPlanification) return getDB();
        const fullRawDb = normalizeDbObject(readRawDatabase());
        const idx = (fullRawDb.planifications || []).findIndex(p => p.idPlanification === idPlanification);
        if (idx !== -1) {
            const maj = {
                ...fullRawDb.planifications[idx],
                statutExecution: statut,
                statutAvancement: (statut === 'CLOTURE' || statut === 'REALISEE') ? 'Clôturé' : 'En cours',
                ...extra,
                updatedAt: new Date().toISOString()
            };
            fullRawDb.planifications[idx] = maj;
            fullRawDb.lastSync = new Date().toISOString();
            persistRawDatabase(fullRawDb, true);
            window.dispatchEvent(new CustomEvent('fci-db-synced', { detail: getDB() }));

            if (getGitHubToken()) {
                const entite = maj.entite || maj.site || maj.centre || 'Planification';
                archiverSurGitHub('PLAN', entite, maj.idPlanification, { planifications: [maj] }).catch(() => {});
            }
        }
        return getDB();
    }

    /**
     * Enregistre ou met à jour une campagne de planification hiérarchique
     * (séparant campagne, processus/référentiel partagés et affectations individuelles + historique).
     */
    async function enregistrerCampagnePlanification(campagne, syncGitHub = true) {
        if (!campagne || typeof campagne !== 'object') return getDB();
        const db = getDB();
        const list = Array.isArray(db.campagnesPlanification) ? [...db.campagnesPlanification] : [];
        const nowIso = new Date().toISOString();

        const item = {
            ...campagne,
            idCampagne: campagne.idCampagne || ('CAMP-' + Date.now()),
            espaceSaisie: 'SIEGE',
            updatedAt: nowIso,
            createdAt: campagne.createdAt || nowIso
        };

        const idx = list.findIndex(c => c.idCampagne === item.idCampagne);
        if (idx !== -1) {
            list[idx] = { ...list[idx], ...item };
        } else {
            list.push(item);
        }

        db.campagnesPlanification = list;
        const saved = saveDB(db);

        if (syncGitHub && getGitHubToken()) {
            const label = item.titre || item.idCampagne;
            const ghRes = await archiverSurGitHub('PLAN', label, item.idCampagne, { campagnesPlanification: [item] });
            saved._githubArchive = ghRes;
        }
        return saved;
    }

    function supprimerCampagnePlanification(idCampagne) {
        if (!idCampagne) return getDB();
        const db = getDB();
        db.campagnesPlanification = (db.campagnesPlanification || []).filter(c => c.idCampagne !== idCampagne);
        return saveDB(db);
    }

    /**
     * Ajoute une notification (ex. notification Directeur -> tous les collaborateurs du Siège).
     */
    async function ajouterNotification(notif, syncGitHub = true) {
        if (!notif || typeof notif !== 'object') return getDB();
        const db = getDB();
        const list = Array.isArray(db.notifications) ? [...db.notifications] : [];
        const nowIso = new Date().toISOString();

        const item = {
            idNotification: notif.idNotification || ('NOTIF-' + Date.now()),
            destinataires: notif.destinataires || 'SIEGE',
            lusPar: Array.isArray(notif.lusPar) ? notif.lusPar : [],
            ...notif,
            createdAt: notif.createdAt || nowIso,
            updatedAt: nowIso
        };

        const idx = list.findIndex(n => n.idNotification === item.idNotification);
        if (idx !== -1) {
            list[idx] = { ...list[idx], ...item };
        } else {
            list.push(item);
        }

        db.notifications = list;
        const saved = saveDB(db);

        if (syncGitHub && getGitHubToken()) {
            archiverSurGitHub('PLAN', 'Notification', item.idNotification, { notifications: [item] }).catch(() => {});
        }
        return saved;
    }

    function marquerNotificationLue(idNotification, username = '') {
        if (!idNotification) return getDB();
        const user = getCurrentUser();
        const uId = String(username || user?.username || '').trim();
        if (!uId) return getDB();

        const db = getDB();
        const list = Array.isArray(db.notifications) ? [...db.notifications] : [];
        const idx = list.findIndex(n => n.idNotification === idNotification);
        if (idx !== -1) {
            const lus = Array.isArray(list[idx].lusPar) ? [...list[idx].lusPar] : [];
            if (!lus.includes(uId)) {
                lus.push(uId);
                list[idx] = { ...list[idx], lusPar: lus, updatedAt: new Date().toISOString() };
                db.notifications = list;
                return saveDB(db);
            }
        }
        return db;
    }

    function exporterBDD() {
        const scopedDb = getDB();
        const payload = {
            missions: scopedDb.missions || [],
            constatsControle: scopedDb.constatsControle || [],
            constatsEncaisses: scopedDb.constatsEncaisses || [],
            planifications: scopedDb.planifications || [],
            campagnesPlanification: scopedDb.campagnesPlanification || [],
            notifications: scopedDb.notifications || [],
            exportDate: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `FCI_BDD_Backup_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    function importerBDD(importedData) {
        if (!importedData || typeof importedData !== 'object') return getDB();
        const user = getCurrentUser();
        const currentScoped = getDB();

        const mergeByKey = (existingArr, incomingArr, keyField, accessCheckFn = canAccess) => {
            const result = [...existingArr];
            (Array.isArray(incomingArr) ? incomingArr : []).forEach(item => {
                if (!item || typeof item !== 'object') return;
                if (user && !isSiegeUser(user) && !accessCheckFn(item, user)) return;

                const tagged = (item.espaceSaisie === 'SIEGE' || item.espaceSaisie === 'REGIONAL')
                    ? item
                    : tagRecord(item, user);

                const idx = keyField && tagged[keyField]
                    ? result.findIndex(e => e[keyField] === tagged[keyField])
                    : -1;

                if (idx !== -1) {
                    result[idx] = { ...result[idx], ...tagged };
                } else {
                    result.push(tagged);
                }
            });
            return result;
        };

        const payloadSave = {
            missions: mergeByKey(currentScoped.missions, importedData.missions, 'idMission', canAccess),
            constatsControle: mergeByKey(currentScoped.constatsControle, importedData.constatsControle, 'idConstat', canAccess),
            constatsEncaisses: mergeByKey(currentScoped.constatsEncaisses, importedData.constatsEncaisses, 'idEncaisse', canAccess),
            planifications: mergeByKey(currentScoped.planifications, importedData.planifications, 'idPlanification', canAccessPlan)
        };
        if (!user || isSiegeUser(user)) {
            if (Array.isArray(importedData.campagnesPlanification)) {
                payloadSave.campagnesPlanification = mergeCollectionArrays(
                    currentScoped.campagnesPlanification || [],
                    importedData.campagnesPlanification,
                    'idCampagne'
                );
            }
            if (Array.isArray(importedData.notifications)) {
                payloadSave.notifications = mergeCollectionArrays(
                    currentScoped.notifications || [],
                    importedData.notifications,
                    'idNotification'
                );
            }
        }
        return saveDB(payloadSave);
    }

    async function getStorageStats() {
        await readyPromise;
        const raw = normalizeDbObject(readRawDatabase());
        const cfg = getGitHubConfig();
        const bytesApprox = JSON.stringify(raw).length;
        let quotaBytes = null;
        let usageBytes = null;
        try {
            if (navigator.storage && typeof navigator.storage.estimate === 'function') {
                const est = await navigator.storage.estimate();
                quotaBytes = est.quota || null;
                usageBytes = est.usage || null;
            }
        } catch (e) {}

        return {
            engine: storedInIndexedDBOnly ? 'IndexedDB (Haute Capacité)' : 'IndexedDB + Cache Local',
            totalRecords: raw.missions.length + raw.constatsControle.length + raw.constatsEncaisses.length + raw.planifications.length + raw.campagnesPlanification.length,
            counts: {
                missions: raw.missions.length,
                constatsControle: raw.constatsControle.length,
                constatsEncaisses: raw.constatsEncaisses.length,
                planifications: raw.planifications.length,
                campagnesPlanification: raw.campagnesPlanification.length,
                notifications: raw.notifications.length
            },
            bytesApprox,
            quotaBytes,
            usageBytes,
            githubConfig: cfg,
            githubTokenConfigured: Boolean(getGitHubToken())
        };
    }

    window.FCIDatabase = {
        ready: readyPromise,
        init: () => hydraterDepuisIndexedDB(false),
        getDB,
        saveDB,
        viderBDD,
        getGitHubConfig,
        setGitHubConfig,
        configurerStockageGitHub,
        getGitHubToken,
        setGitHubToken,
        configurerGitHubToken,
        extraireAnneeMois,
        archiverSurGitHub,
        archiverTouteLaBDDSurGitHub,
        supprimerDeArchiveGitHub,
        listerArchivesGitHub,
        restaurerDepuisGitHub,
        enregistrerMission,
        enregistrerLotControle,
        enregistrerConstatsControle,
        enregistrerLotEncaisses,
        enregistrerConstatEncaisse,
        enregistrerPlanification,
        supprimerPlanification,
        marquerPlanificationStatut,
        enregistrerCampagnePlanification,
        supprimerCampagnePlanification,
        ajouterNotification,
        marquerNotificationLue,
        exporterBDD,
        importerBDD,
        getStorageStats,
        canAccessRecord: canAccess,
        canAccessPlanification: canAccessPlan
    };

    window.FCIDBManager = {
        getLocalDatabase: getDB,
        saveLocalDatabase: saveDB,
        upsertFCIMission: enregistrerMission,
        upsertFCIRecord: async (record, moduleSource = 'FC') => {
            if (moduleSource === 'FV') {
                return enregistrerLotEncaisses([record], record.site || '', record.idMission || '');
            }
            return enregistrerLotControle([record], record.site || '', record.idMission || '');
        },
        upsertFCIPlanification: enregistrerPlanification
    };
})();

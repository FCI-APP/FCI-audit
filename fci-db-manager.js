/**
 * FCI v1.0 - Gestionnaire Central de Base de Données (fci_database)
 * Cloisonnement Deux Espaces : Espace Régional (partagé par région + Siège) & Espace Siège (confidentiel)
 * Direction Contrôle Générale - Division Contrôle Permanent - Barid Al-Maghrib
 */
(function () {
    const LOCAL_DB_KEY = 'fci_database';

    function getDefaultSchema() {
        return {
            missions: [],
            constatsControle: [],
            constatsEncaisses: [],
            planifications: [],
            lastSync: null
        };
    }

    function readRawDatabase() {
        try {
            const raw = localStorage.getItem(LOCAL_DB_KEY);
            if (!raw) return getDefaultSchema();
            const parsed = JSON.parse(raw);
            return {
                ...getDefaultSchema(),
                ...(parsed && typeof parsed === 'object' ? parsed : {}),
                missions: Array.isArray(parsed?.missions) ? parsed.missions : [],
                constatsControle: Array.isArray(parsed?.constatsControle) ? parsed.constatsControle : [],
                constatsEncaisses: Array.isArray(parsed?.constatsEncaisses) ? parsed.constatsEncaisses : [],
                planifications: Array.isArray(parsed?.planifications) ? parsed.planifications : []
            };
        } catch (e) {
            return getDefaultSchema();
        }
    }

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

    /**
     * Retourne uniquement les données visibles selon l'espace de l'utilisateur connecté :
     * - Espace Siège : toutes les données (internes Siège + toutes les régions).
     * - Espace Régional : uniquement les données régionales de sa région (aucune donnée Siège ni autre région).
     */
    function getDB() {
        const rawDb = readRawDatabase();
        const user = getCurrentUser();
        if (!user) return getDefaultSchema();

        if (window.FCIAuth && typeof window.FCIAuth.filterDatabase === 'function') {
            const filtered = window.FCIAuth.filterDatabase(rawDb, user);
            return {
                ...filtered,
                // Alias de compatibilité
                controles: filtered.constatsControle,
                encaisses: filtered.constatsEncaisses,
                bdd: [...filtered.constatsControle, ...filtered.constatsEncaisses]
            };
        }

        return rawDb;
    }

    /**
     * Sauvegarde la base tout en :
     * 1. Étiquetant automatiquement les nouvelles saisies avec l'espace d'origine ('SIEGE' ou 'REGIONAL').
     * 2. Préservant intactes dans localStorage les données appartenant aux autres régions ou au Siège.
     */
    function saveDB(updatedScopedDb) {
        const user = getCurrentUser();
        const fullRawDb = readRawDatabase();
        const incoming = (updatedScopedDb && typeof updatedScopedDb === 'object') ? updatedScopedDb : {};

        const collections = ['missions', 'constatsControle', 'constatsEncaisses', 'planifications'];
        const mergedDb = { ...fullRawDb };

        collections.forEach(colName => {
            if (!Array.isArray(incoming[colName])) return;

            // Étiquetage de chaque enregistrement entrant avec l'espace de l'utilisateur courant
            // (sauf s'il possède déjà un espaceSaisie valide, ex. modification par le Siège d'une ligne régionale)
            const taggedIncoming = incoming[colName].map(item => {
                if (item && (item.espaceSaisie === 'SIEGE' || item.espaceSaisie === 'REGIONAL')) {
                    return item;
                }
                return tagRecord(item, user);
            });

            if (!user || isSiegeUser(user)) {
                // Le Siège a accès à tout : l'état envoyé représente l'intégralité de la collection
                mergedDb[colName] = taggedIncoming;
            } else {
                // Utilisateur régional : on conserve intactes les lignes hors de son périmètre
                // (données Siège + autres régions) et on remplace uniquement le périmètre de sa région
                const horsPerimetre = (fullRawDb[colName] || []).filter(existing => !canAccess(existing, user));
                mergedDb[colName] = [...horsPerimetre, ...taggedIncoming];
            }
        });

        mergedDb.lastSync = new Date().toISOString();
        localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(mergedDb));

        window.dispatchEvent(new CustomEvent('fci-db-synced', { detail: getDB() }));
        return getDB();
    }

    /**
     * Enregistre ou met à jour un lot de constats de Fiche de Contrôle (FC).
     */
    async function enregistrerLotControle(lotConstats, site = '', idMission = '') {
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
        return saveDB(db);
    }

    /**
     * Enregistre ou met à jour un lot de constats de Vérification des Encaisses (FV).
     */
    async function enregistrerLotEncaisses(lotEncaisses, site = '', idMission = '') {
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
                (item.idEncaisse && e.idEncaisse === item.idEncaisse)
            );
            if (idx !== -1) {
                existants[idx] = { ...existants[idx], ...item };
            } else {
                existants.push(item);
            }
        });

        db.constatsEncaisses = existants;
        return saveDB(db);
    }

    /**
     * Enregistre ou met à jour une ligne de planification (Espace Siège ou Espace Régional).
     */
    async function enregistrerPlanification(plan) {
        if (!plan || typeof plan !== 'object') return getDB();
        const user = getCurrentUser();
        const db = getDB();

        const taggedPlan = tagRecord({
            ...plan,
            idPlanification: plan.idPlanification || ('PLAN-' + Date.now())
        }, user);

        const plans = db.planifications || [];
        const idx = plans.findIndex(p => p.idPlanification === taggedPlan.idPlanification);
        if (idx !== -1) {
            plans[idx] = { ...plans[idx], ...taggedPlan };
        } else {
            plans.push(taggedPlan);
        }

        db.planifications = plans;
        return saveDB(db);
    }

    // Exposition globale unifiée pour toutes les feuilles (FC, FV, Planification, BDD, TDB)
    window.FCIDatabase = {
        getDB,
        saveDB,
        enregistrerLotControle,
        enregistrerLotEncaisses,
        enregistrerPlanification,
        canAccessRecord: canAccess
    };

    // Alias de rétrocompatibilité
    window.FCIDBManager = {
        getLocalDatabase: getDB,
        saveLocalDatabase: saveDB,
        upsertFCIRecord: async (record, moduleSource = 'FC') => {
            if (moduleSource === 'FV') {
                return enregistrerLotEncaisses([record], record.site || '', record.idMission || '');
            }
            return enregistrerLotControle([record], record.site || '', record.idMission || '');
        },
        upsertFCIPlanification: enregistrerPlanification
    };
})();

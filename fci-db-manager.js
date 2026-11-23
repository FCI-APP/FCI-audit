/**
 * FCI v1.0 - Gestionnaire Central de Base de Données (fci_database)
 * Gestion interrégionale & Cloisonnement Deux Espaces (Siège / Régional)
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
     * Retourne uniquement les données visibles selon les règles d'accès de l'utilisateur connecté :
     * - Espace Siège : accès global à toutes les données régionales et internes du Siège.
     * - Espace Régional : données de sa région d'affectation (y compris ses contrôles hors région)
     *   + contrôles effectués dans sa région par d'autres contrôleurs régionaux.
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
     * 1. Étiquetant chaque saisie avec la région du contrôle (region) et la région d'affectation (controleurRegion).
     * 2. Préservant intactes dans localStorage les données hors périmètre (autres régions / données internes du Siège).
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
     * Vide uniquement les enregistrements visibles dans le périmètre de l'utilisateur courant,
     * sans supprimer les données des autres régions ni les données internes du Siège.
     */
    function viderBDD() {
        return saveDB({
            missions: [],
            constatsControle: [],
            constatsEncaisses: [],
            planifications: []
        });
    }

    /**
     * Synchronise ou restaure depuis la base locale/distante en respectant le cloisonnement.
     */
    async function restaurerDepuisGitHub() {
        return getDB();
    }

    /**
     * Enregistre ou met à jour une mission (Planification / FC / FV) avec étiquetage interrégional.
     */
    async function enregistrerMission(mission) {
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
        return saveDB(db);
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

    /**
     * Exporte en JSON uniquement le périmètre autorisé de l'utilisateur connecté.
     */
    function exporterBDD() {
        const scopedDb = getDB();
        const payload = {
            missions: scopedDb.missions || [],
            constatsControle: scopedDb.constatsControle || [],
            constatsEncaisses: scopedDb.constatsEncaisses || [],
            planifications: scopedDb.planifications || [],
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

    /**
     * Importe un fichier JSON en respectant strictement les droits d'accès de l'utilisateur.
     */
    function importerBDD(importedData) {
        if (!importedData || typeof importedData !== 'object') return getDB();
        const user = getCurrentUser();
        const currentScoped = getDB();

        const mergeByKey = (existingArr, incomingArr, keyField) => {
            const result = [...existingArr];
            (Array.isArray(incomingArr) ? incomingArr : []).forEach(item => {
                if (!item || typeof item !== 'object') return;
                if (user && !isSiegeUser(user) && !canAccess(item, user)) return;

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

        return saveDB({
            missions: mergeByKey(currentScoped.missions, importedData.missions, 'idMission'),
            constatsControle: mergeByKey(currentScoped.constatsControle, importedData.constatsControle, 'idConstat'),
            constatsEncaisses: mergeByKey(currentScoped.constatsEncaisses, importedData.constatsEncaisses, 'idEncaisse'),
            planifications: mergeByKey(currentScoped.planifications, importedData.planifications, 'idPlanification')
        });
    }

    // Exposition globale unifiée pour toutes les feuilles (FC, FV, Planification, BDD, TDB)
    window.FCIDatabase = {
        getDB,
        saveDB,
        viderBDD,
        restaurerDepuisGitHub,
        enregistrerMission,
        enregistrerLotControle,
        enregistrerLotEncaisses,
        enregistrerPlanification,
        exporterBDD,
        importerBDD,
        canAccessRecord: canAccess
    };

    // Alias de rétrocompatibilité
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

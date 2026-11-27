/**
 * FCI v1.0 - Module d'Authentification & Cloisonnement Deux Espaces (Siège / Régional)
 * Gestion interrégionale & Diffusion ciblée des planifications Siège -> Contrôleurs désignés.
 * Direction Contrôle Générale - Division Contrôle Permanent - Barid Al-Maghrib
 * Session volatile (sessionStorage uniquement) : fermer/quitter déconnecte automatiquement.
 */
(function () {
    const SESSION_KEY = 'fci_auth_session_v1';

    // Purge systématique de toute session persistante résiduelle dans localStorage
    try {
        localStorage.removeItem(SESSION_KEY);
    } catch (e) {}

    const FCI_USERS = [
        // ================= 7 COMPTES SIÈGE =================
        { username: 'admin-siege',      password: 'dcp@+2026',            fonction: 'Administrateur',       role: 'ADMIN',        region: 'SIEGE' },
        { username: 'directeur-001',    password: 'directeur@+2026',      fonction: 'Directeur',            role: 'DIRECTEUR',    region: 'SIEGE' },
        { username: 'chef service-001', password: 'chef service1@+2026',  fonction: 'Chef de service 1',    role: 'CHEF_SERVICE', region: 'SIEGE' },
        { username: 'chef service-002', password: 'chef service2@+2026',  fonction: 'Chef de service 2',    role: 'CHEF_SERVICE', region: 'SIEGE' },
        { username: 'chef service-003', password: 'chef service3@+2026',  fonction: 'Chef de service 3',    role: 'CHEF_SERVICE', region: 'SIEGE' },
        { username: 'chef service-004', password: 'chef service4@+2026',  fonction: 'Chef de service 4',    role: 'CHEF_SERVICE', region: 'SIEGE' },
        { username: 'chef service-005', password: 'chef service5@+2026',  fonction: 'Chef de service 5',    role: 'CHEF_SERVICE', region: 'SIEGE' },

        // ================= 34 COMPTES CONTRÔLEURS RÉGIONAUX =================
        // Casablanca (5)
        { username: 'CASA-001',         password: 'CASA1@+2026',          fonction: 'Contrôleur Casablanca', role: 'CONTROLEUR',  region: 'CASA' },
        { username: 'CASA-002',         password: 'CASA2@+2026',          fonction: 'Contrôleur Casablanca', role: 'CONTROLEUR',  region: 'CASA' },
        { username: 'CASA-003',         password: 'CASA3@+2026',          fonction: 'Contrôleur Casablanca', role: 'CONTROLEUR',  region: 'CASA' },
        { username: 'CASA-004',         password: 'CASA4@+2026',          fonction: 'Contrôleur Casablanca', role: 'CONTROLEUR',  region: 'CASA' },
        { username: 'CASA-005',         password: 'CASA5@+2026',          fonction: 'Contrôleur Casablanca', role: 'CONTROLEUR',  region: 'CASA' },

        // Settat (3)
        { username: 'SETTAT-001',       password: 'SETTAT1@+2026',        fonction: 'Contrôleur Settat',     role: 'CONTROLEUR',  region: 'SETTAT' },
        { username: 'SETTAT-002',       password: 'SETTAT2@+2026',        fonction: 'Contrôleur Settat',     role: 'CONTROLEUR',  region: 'SETTAT' },
        { username: 'SETTAT-003',       password: 'SETTAT3@+2026',        fonction: 'Contrôleur Settat',     role: 'CONTROLEUR',  region: 'SETTAT' },

        // Rabat (5)
        { username: 'RABAT-001',        password: 'RABAT1@+2026',         fonction: 'Contrôleur Rabat',      role: 'CONTROLEUR',  region: 'RABAT' },
        { username: 'RABAT-002',        password: 'RABAT2@+2026',         fonction: 'Contrôleur Rabat',      role: 'CONTROLEUR',  region: 'RABAT' },
        { username: 'RABAT-003',        password: 'RABAT3@+2026',         fonction: 'Contrôleur Rabat',      role: 'CONTROLEUR',  region: 'RABAT' },
        { username: 'RABAT-004',        password: 'RABAT4@+2026',         fonction: 'Contrôleur Rabat',      role: 'CONTROLEUR',  region: 'RABAT' },
        { username: 'RABAT-005',        password: 'RABAT5@+2026',         fonction: 'Contrôleur Rabat',      role: 'CONTROLEUR',  region: 'RABAT' },

        // Tanger (3)
        { username: 'TANGER-001',       password: 'TANGER1@+2026',        fonction: 'Contrôleur Tanger',     role: 'CONTROLEUR',  region: 'TANGER' },
        { username: 'TANGER-002',       password: 'TANGER2@+2026',        fonction: 'Contrôleur Tanger',     role: 'CONTROLEUR',  region: 'TANGER' },
        { username: 'TANGER-003',       password: 'TANGER3@+2026',        fonction: 'Contrôleur Tanger',     role: 'CONTROLEUR',  region: 'TANGER' },

        // Marrakech (3)
        { username: 'MARRAKECH-001',    password: 'MARRAKECH1@+2026',     fonction: 'Contrôleur Marrakech',  role: 'CONTROLEUR',  region: 'MARRAKECH' },
        { username: 'MARRAKECH-002',    password: 'MARRAKECH2@+2026',     fonction: 'Contrôleur Marrakech',  role: 'CONTROLEUR',  region: 'MARRAKECH' },
        { username: 'MARRAKECH-003',    password: 'MARRAKECH3@+2026',     fonction: 'Contrôleur Marrakech',  role: 'CONTROLEUR',  region: 'MARRAKECH' },

        // Agadir (3)
        { username: 'AGADIR-001',       password: 'AGADIR1@+2026',        fonction: 'Contrôleur Agadir',     role: 'CONTROLEUR',  region: 'AGADIR' },
        { username: 'AGADIR-002',       password: 'AGADIR2@+2026',        fonction: 'Contrôleur Agadir',     role: 'CONTROLEUR',  region: 'AGADIR' },
        { username: 'AGADIR-003',       password: 'AGADIR3@+2026',        fonction: 'Contrôleur Agadir',     role: 'CONTROLEUR',  region: 'AGADIR' },

        // Fès (3)
        { username: 'FES-001',          password: 'FES1@+2026',           fonction: 'Contrôleur Fès',        role: 'CONTROLEUR',  region: 'FES' },
        { username: 'FES-002',          password: 'FES2@+2026',           fonction: 'Contrôleur Fès',        role: 'CONTROLEUR',  region: 'FES' },
        { username: 'FES-003',          password: 'FES3@+2026',           fonction: 'Contrôleur Fès',        role: 'CONTROLEUR',  region: 'FES' },

        // Meknès (3)
        { username: 'MEKNES-001',       password: 'MEKNES1@+2026',        fonction: 'Contrôleur Meknès',     role: 'CONTROLEUR',  region: 'MEKNES' },
        { username: 'MEKNES-002',       password: 'MEKNES2@+2026',        fonction: 'Contrôleur Meknès',     role: 'CONTROLEUR',  region: 'MEKNES' },
        { username: 'MEKNES-003',       password: 'MEKNES3@+2026',        fonction: 'Contrôleur Meknès',     role: 'CONTROLEUR',  region: 'MEKNES' },

        // Laâyoune (3)
        { username: 'LAYOUNE-001',      password: 'LAYOUNE1@+2026',       fonction: 'Contrôleur Laâyoune',   role: 'CONTROLEUR',  region: 'LAAYOUNE' },
        { username: 'LAYOUNE-002',      password: 'LAYOUNE2@+2026',       fonction: 'Contrôleur Laâyoune',   role: 'CONTROLEUR',  region: 'LAAYOUNE' },
        { username: 'LAYOUNE-003',      password: 'LAYOUNE3@+2026',       fonction: 'Contrôleur Laâyoune',   role: 'CONTROLEUR',  region: 'LAAYOUNE' },

        // Oujda (3)
        { username: 'OUJDA-001',        password: 'OUJDA1@+2026',         fonction: 'Contrôleur Oujda',      role: 'CONTROLEUR',  region: 'OUEJDA' },
        { username: 'OUJDA-002',        password: 'OUJDA2@+2026',         fonction: 'Contrôleur Oujda',      role: 'CONTROLEUR',  region: 'OUEJDA' },
        { username: 'OUJDA-003',        password: 'OUJDA3@+2026',         fonction: 'Contrôleur Oujda',      role: 'CONTROLEUR',  region: 'OUEJDA' }
    ];

    const SIEGE_ROLES = new Set(['ADMIN', 'DIRECTEUR', 'CHEF_SERVICE']);
    const SIEGE_USERNAMES = new Set(
        FCI_USERS.filter(u => u.region === 'SIEGE').map(u => u.username.toLowerCase())
    );
    const SIEGE_FONCTIONS = new Set(
        FCI_USERS.filter(u => u.region === 'SIEGE').map(u => u.fonction.toLowerCase())
    );

    function normaliserRegion(val) {
        let reg = String(val || '').toUpperCase().trim();
        if (reg === 'OUJDA' || reg === 'OUJEDA') reg = 'OUEJDA';
        if (reg === 'LAYOUNE') reg = 'LAAYOUNE';
        if (reg === 'SIÈGE' || reg === 'SIÉGE') reg = 'SIEGE';
        return reg;
    }

    function getCurrentUser() {
        try {
            const raw = sessionStorage.getItem(SESSION_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (!parsed || !parsed.username) return null;
            return parsed;
        } catch (e) {
            return null;
        }
    }

    function isSiegeUser(user = getCurrentUser()) {
        if (!user) return false;
        return normaliserRegion(user.region) === 'SIEGE' || SIEGE_ROLES.has(String(user.role || '').toUpperCase());
    }

    function isAdmin(user = getCurrentUser()) {
        if (!user) return false;
        return String(user.role || '').toUpperCase() === 'ADMIN';
    }

    function isDirecteur(user = getCurrentUser()) {
        if (!user) return false;
        return String(user.role || '').toUpperCase() === 'DIRECTEUR' ||
               String(user.username || '').toLowerCase().trim() === 'directeur-001';
    }

    function isChefService(user = getCurrentUser()) {
        if (!user) return false;
        return String(user.role || '').toUpperCase() === 'CHEF_SERVICE';
    }

    function isControleur(user = getCurrentUser()) {
        if (!user) return false;
        return String(user.role || '').toUpperCase() === 'CONTROLEUR';
    }

    function getSpace(user = getCurrentUser()) {
        if (!user) return 'NONE';
        return isSiegeUser(user) ? 'SIEGE' : 'REGIONAL';
    }

    /**
     * Retourne la liste des comptes contrôleurs régionaux (sans mot de passe),
     * filtrée par région si un code région est fourni.
     * Si la région est 'SIEGE', retourne les 5 Chefs de service.
     */
    function getControllersByRegion(region = '') {
        const targetReg = normaliserRegion(region);
        if (targetReg === 'SIEGE') {
            return getChefsDeService();
        }
        return FCI_USERS
            .filter(u => u.role === 'CONTROLEUR' && (!targetReg || normaliserRegion(u.region) === targetReg))
            .map(u => ({
                username: u.username,
                fonction: u.fonction,
                region: normaliserRegion(u.region),
                role: u.role
            }));
    }

    /**
     * Retourne tous les comptes contrôleurs régionaux (34 comptes, toutes régions confondues).
     */
    function getAllControllers() {
        return FCI_USERS
            .filter(u => u.role === 'CONTROLEUR')
            .map(u => ({
                username: u.username,
                fonction: u.fonction,
                region: normaliserRegion(u.region),
                role: u.role
            }));
    }

    /**
     * Retourne tous les utilisateurs affectables à une mission (contrôleurs régionaux + chefs de service).
     */
    function getAllAssignableUsers() {
        return FCI_USERS
            .filter(u => u.role === 'CONTROLEUR' || u.role === 'CHEF_SERVICE')
            .map(u => ({
                username: u.username,
                fonction: u.fonction,
                region: normaliserRegion(u.region),
                role: u.role
            }));
    }

    /**
     * Retourne tous les collaborateurs du Siège (7 comptes : Admin, Directeur, 5 Chefs de service).
     */
    function getSiegeUsers() {
        return FCI_USERS
            .filter(u => u.region === 'SIEGE' || SIEGE_ROLES.has(u.role))
            .map(u => ({
                username: u.username,
                fonction: u.fonction,
                region: 'SIEGE',
                role: u.role
            }));
    }

    /**
     * Retourne la liste des comptes Chefs de service du Siège (sans mot de passe)
     * pouvant effectuer des contrôles ou vérifications à la demande du Siège.
     */
    function getChefsDeService() {
        return FCI_USERS
            .filter(u => u.role === 'CHEF_SERVICE')
            .map(u => ({
                username: u.username,
                fonction: u.fonction,
                region: normaliserRegion(u.region || 'SIEGE'),
                role: u.role
            }));
    }

    /**
     * Détermine si un enregistrement (mission, constat FC, constat FV, planification)
     * appartient aux données internes du Siège.
     */
    function isRecordFromSiege(record) {
        if (!record || typeof record !== 'object') return false;

        // 1. Marqueur explicite d'espace
        const espace = String(record.espaceSaisie || record.espace || record.scope || '').toUpperCase().trim();
        if (espace === 'SIEGE') return true;
        if (espace === 'REGIONAL') return false;

        // 2. Région de l'auteur ou du contrôleur marquée SIEGE
        const auteurRegion = normaliserRegion(record.auteurRegion || record.controleurRegion || record.creeParRegion || '');
        if (auteurRegion === 'SIEGE') return true;

        // 3. Rôle de l'auteur appartenant au Siège
        const roleAuteur = String(record.creeParRole || record.auteurRole || record.role || '').toUpperCase().trim();
        if (SIEGE_ROLES.has(roleAuteur)) return true;

        // 4. Identifiant de l'auteur appartenant aux comptes Siège
        const candidatsIds = [
            record.creeParId,
            record.auteurId,
            record.controleurId,
            record.username,
            record.identifiant
        ].map(v => String(v || '').toLowerCase().trim()).filter(Boolean);

        if (candidatsIds.some(id => SIEGE_USERNAMES.has(id))) {
            return true;
        }

        // 5. Fallback rétroactif : nom/fonction d'un compte Siège dans controleur / controleurs / auteurFonction
        const candidatsTexte = [
            record.auteurFonction,
            record.controleur,
            Array.isArray(record.controleurs) ? record.controleurs.join(',') : record.controleurs
        ].map(v => String(v || '').toLowerCase().trim()).filter(Boolean);

        for (const txt of candidatsTexte) {
            for (const uSiege of SIEGE_USERNAMES) {
                if (txt.includes(uSiege)) return true;
            }
            for (const fSiege of SIEGE_FONCTIONS) {
                if (txt.includes(fSiege)) return true;
            }
        }

        // 6. Région cible marquée SIEGE
        if (normaliserRegion(record.region) === 'SIEGE') {
            return true;
        }

        return false;
    }

    /**
     * Règle d'accès spécifique aux lignes de planification (Feuille 2 - Fiche de Contrôle) :
     * - Tous les membres du Siège (7 comptes) voient toutes les planifications (Siège + Régions).
     * - Une planification émise par le Siège (planifiePar === 'SIEGE') n'est visible côté régional
     *   QUE par les contrôleurs nommément désignés dans controleursAssignes (ex. MARRAKECH-001).
     * - Une planification régionale standard est visible par les contrôleurs de la région concernée.
     */
    function canAccessPlanification(plan, user = getCurrentUser()) {
        if (!user || !plan) return false;
        if (isSiegeUser(user)) return true;

        // Une planification issue du circuit de validation Siège n'est visible par les contrôleurs
        // qu'après sa diffusion officielle (statutWorkflow === 'DIFFUSEE').
        const wf = String(plan.statutWorkflow || '').toUpperCase().trim();
        if (wf && wf !== 'DIFFUSEE') {
            return false;
        }

        const userId = String(user.username || user.identifiant || '').toUpperCase().trim();
        const userRegion = normaliserRegion(user.region);
        const assignes = Array.isArray(plan.controleursAssignes)
            ? plan.controleursAssignes.map(c => String(c || '').toUpperCase().trim()).filter(Boolean)
            : [];
        const ctrlId = String(plan.controleurId || '').toUpperCase().trim();

        const isSiegePlan = String(plan.planifiePar || '').toUpperCase() === 'SIEGE' || isRecordFromSiege(plan);
        if (isSiegePlan) {
            return Boolean(userId) && (assignes.includes(userId) || ctrlId === userId);
        }

        if (!userRegion) return false;
        const targetRegion = normaliserRegion(plan.region || '');
        const homeRegion = normaliserRegion(plan.controleurRegion || plan.auteurRegion || '');

        return (Boolean(targetRegion) && targetRegion === userRegion) ||
               (Boolean(homeRegion) && homeRegion === userRegion) ||
               (Boolean(userId) && (assignes.includes(userId) || ctrlId === userId));
    }

    /**
     * Règle d'accès interrégionale pour les constats et missions exécutées :
     * - Espace Siège : accès global à toutes les données régionales et aux données internes du Siège.
     * - Données internes du Siège : exclusivement accessibles aux utilisateurs autorisés du Siège.
     * - Espace Régional : accès aux données de leur région d'affectation (y compris contrôles hors région)
     *   ET aux contrôles effectués dans leur région par d'autres contrôleurs régionaux.
     */
    function canAccessRecord(record, user = getCurrentUser()) {
        if (!user || !record) return false;

        if (isSiegeUser(user)) {
            return true;
        }

        if (isRecordFromSiege(record)) {
            return false;
        }

        const userRegion = normaliserRegion(user.region);
        if (!userRegion) return false;

        const targetRegion = normaliserRegion(record.region || '');
        const homeRegion = normaliserRegion(
            record.controleurRegion || record.auteurRegion || record.creeParRegion || ''
        );

        return (Boolean(targetRegion) && targetRegion === userRegion) ||
               (Boolean(homeRegion) && homeRegion === userRegion);
    }

    function filterVisibleRecords(records, user = getCurrentUser()) {
        if (!Array.isArray(records)) return [];
        if (!user) return [];
        if (isSiegeUser(user)) return records;
        return records.filter(item => canAccessRecord(item, user));
    }

    function filterNotifications(notifications, user = getCurrentUser()) {
        if (!Array.isArray(notifications) || !user) return [];
        const siege = isSiegeUser(user);
        const userId = String(user.username || user.identifiant || '').toUpperCase().trim();
        return notifications.filter(n => {
            if (!n) return false;
            const dest = String(n.destinataires || 'SIEGE').toUpperCase().trim();
            if (dest === 'SIEGE') return siege;
            if (dest === 'TOUS') return true;
            if (Array.isArray(n.destinatairesIds)) {
                return n.destinatairesIds.some(id => String(id || '').toUpperCase().trim() === userId);
            }
            return siege;
        });
    }

    function filterDatabase(db, user = getCurrentUser()) {
        const safeDb = (db && typeof db === 'object') ? db : {};
        const siege = isSiegeUser(user);
        return {
            ...safeDb,
            missions: filterVisibleRecords(safeDb.missions || [], user),
            constatsControle: filterVisibleRecords(safeDb.constatsControle || [], user),
            constatsEncaisses: filterVisibleRecords(safeDb.constatsEncaisses || [], user),
            planifications: (safeDb.planifications || []).filter(p => canAccessPlanification(p, user)),
            campagnesPlanification: siege ? (Array.isArray(safeDb.campagnesPlanification) ? safeDb.campagnesPlanification : []) : [],
            notifications: filterNotifications(safeDb.notifications || [], user)
        };
    }

    function tagRecordWithSpace(record, user = getCurrentUser()) {
        if (!record || typeof record !== 'object') return record;
        if (!user) return record;

        const siege = isSiegeUser(user);
        const userReg = normaliserRegion(user.region);
        const targetReg = normaliserRegion(record.region || '');
        const homeReg = normaliserRegion(record.controleurRegion || record.auteurRegion || userReg);

        return {
            ...record,
            espaceSaisie: siege ? 'SIEGE' : 'REGIONAL',
            auteurId: record.auteurId || user.identifiant || user.username,
            auteurFonction: record.auteurFonction || user.fonction || '',
            auteurRole: record.auteurRole || user.role || '',
            auteurRegion: homeReg,
            controleurRegion: homeReg,
            creeParId: record.creeParId || user.identifiant || user.username,
            creeParRole: record.creeParRole || user.role || '',
            region: targetReg || (siege ? 'SIEGE' : userReg)
        };
    }

    function login(usernameInput, passwordInput) {
        const cleanUser = String(usernameInput || '').trim();
        const cleanPass = String(passwordInput || '').trim();

        const found = FCI_USERS.find(
            u => u.username.toLowerCase() === cleanUser.toLowerCase() && u.password === cleanPass
        );

        if (!found) {
            return { success: false, message: "Nom d'utilisateur ou mot de passe incorrect." };
        }

        const espace = found.region === 'SIEGE' ? 'SIEGE' : 'REGIONAL';

        const sessionData = {
            username: found.username,
            identifiant: found.username,
            fonction: found.fonction,
            role: found.role,
            region: found.region,
            espace: espace,
            loginTime: new Date().toISOString()
        };

        try {
            localStorage.removeItem(SESSION_KEY);
        } catch (e) {}
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
        return { success: true, user: sessionData };
    }

    function logout() {
        try {
            sessionStorage.removeItem(SESSION_KEY);
            localStorage.removeItem(SESSION_KEY);
        } catch (e) {}
        window.location.replace('login.html');
    }

    function injecterProfilSidebar(user) {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar || document.getElementById('fciUserSessionBox')) return;

        const footer = sidebar.querySelector('.sidebar-footer');
        const box = document.createElement('div');
        box.id = 'fciUserSessionBox';
        box.style.cssText = [
            'margin: 10px 12px;',
            'padding: 10px 12px;',
            'background: rgba(0, 0, 0, 0.28);',
            'border: 1px solid rgba(234, 170, 0, 0.45);',
            'border-radius: 6px;',
            'color: #FFFFFF;',
            'font-size: 0.76rem;',
            'line-height: 1.4;'
        ].join('');

        const badgePerimetre = isSiegeUser(user)
            ? '<span style="display:inline-block;margin-top:4px;padding:2px 7px;border-radius:4px;background:#EAAA00;color:#002244;font-weight:800;font-size:0.68rem;">ESPACE SIÈGE · VISIBILITÉ GLOBALE</span>'
            : `<span style="display:inline-block;margin-top:4px;padding:2px 7px;border-radius:4px;background:#0284C7;color:#FFFFFF;font-weight:800;font-size:0.68rem;">ESPACE RÉGIONAL · ${user.region}</span>`;

        box.innerHTML = `
            <div style="display:flex;align-items:center;gap:7px;font-weight:800;color:#FDE68A;">
                <i class="fa-solid fa-user-shield"></i>
                <span>${user.username}</span>
            </div>
            <div style="color:rgba(255,255,255,0.85);font-size:0.72rem;margin-top:2px;">${user.fonction}</div>
            <div>${badgePerimetre}</div>
            <button type="button" id="btnFciLogout" style="margin-top:9px;width:100%;padding:6px 10px;border:none;border-radius:5px;background:#DC2626;color:#FFFFFF;font-family:inherit;font-size:0.74rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;">
                <i class="fa-solid fa-right-from-bracket"></i> Déconnexion
            </button>
        `;

        if (footer) {
            sidebar.insertBefore(box, footer);
        } else {
            sidebar.appendChild(box);
        }

        document.getElementById('btnFciLogout').addEventListener('click', logout);
    }

    function masquerReferentielSiNonAdmin(user) {
        if (!user || isAdmin(user)) return;
        try {
            const links = document.querySelectorAll('.sidebar a[href]');
            links.forEach(a => {
                const href = String(a.getAttribute('href') || '').trim().toLowerCase();
                if (href === 'index.html' || href.endsWith('/index.html')) {
                    const li = a.closest('li');
                    if (li) {
                        li.style.display = 'none';
                    } else {
                        a.style.display = 'none';
                    }
                }
            });
        } catch (e) {}
    }

    const pathLower = window.location.pathname.toLowerCase();
    const isLoginPage = pathLower.endsWith('login.html');
    const isReferentielPage = pathLower.endsWith('index.html') || pathLower.endsWith('/');
    const currentUser = getCurrentUser();

    if (!isLoginPage && !currentUser) {
        window.location.replace('login.html');
    } else if (!isLoginPage && currentUser && isReferentielPage && !isAdmin(currentUser)) {
        window.location.replace('Planification.html');
    } else if (!isLoginPage && currentUser) {
        document.addEventListener('DOMContentLoaded', () => {
            masquerReferentielSiNonAdmin(currentUser);
            injecterProfilSidebar(currentUser);
            window.dispatchEvent(new CustomEvent('fci-auth-ready', { detail: currentUser }));
        });
    }

    window.FCIAuth = {
        getCurrentUser,
        getSpace,
        login,
        logout,
        isSiege: () => isSiegeUser(),
        isAdmin: () => isAdmin(),
        isDirecteur: () => isDirecteur(),
        isChefService: () => isChefService(),
        isControleur: () => isControleur(),
        isRecordFromSiege,
        canAccessRecord,
        canAccessPlanification,
        filterVisibleRecords,
        filterDatabase,
        tagRecordWithSpace,
        normaliserRegion,
        getControllersByRegion,
        getAllControllers,
        getAllAssignableUsers,
        getSiegeUsers,
        getChefsDeService,
        getAllUsersCount: () => FCI_USERS.length
    };
})();

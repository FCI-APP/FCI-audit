/**
 * FCI v1.0 - Module d'Authentification & Cloisonnement Régional (41 Comptes)
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

    function getCurrentUser() {
        try {
            // Lecture strictement depuis sessionStorage : la fermeture de l'application efface automatiquement la session
            const raw = sessionStorage.getItem(SESSION_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (!parsed || !parsed.username) return null;
            return parsed;
        } catch (e) {
            return null;
        }
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

        const sessionData = {
            username: found.username,
            identifiant: found.username,
            fonction: found.fonction,
            role: found.role,
            region: found.region,
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

    function isSiege() {
        const u = getCurrentUser();
        return Boolean(u && u.region === 'SIEGE');
    }

    function isAdmin() {
        const u = getCurrentUser();
        return Boolean(u && u.role === 'ADMIN');
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

        const badgePerimetre = user.region === 'SIEGE'
            ? '<span style="display:inline-block;margin-top:4px;padding:2px 7px;border-radius:4px;background:#EAAA00;color:#002244;font-weight:800;font-size:0.68rem;">SIÈGE · ACCÈS NATIONAL</span>'
            : `<span style="display:inline-block;margin-top:4px;padding:2px 7px;border-radius:4px;background:#0284C7;color:#FFFFFF;font-weight:800;font-size:0.68rem;">RÉGION : ${user.region}</span>`;

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

    const isLoginPage = window.location.pathname.toLowerCase().endsWith('login.html');
    const currentUser = getCurrentUser();

    if (!isLoginPage && !currentUser) {
        window.location.replace('login.html');
    } else if (!isLoginPage && currentUser) {
        document.addEventListener('DOMContentLoaded', () => {
            injecterProfilSidebar(currentUser);
            window.dispatchEvent(new CustomEvent('fci-auth-ready', { detail: currentUser }));
        });
    }

    window.FCIAuth = {
        getCurrentUser,
        login,
        logout,
        isSiege,
        isAdmin,
        getAllUsersCount: () => FCI_USERS.length
    };
})();

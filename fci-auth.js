/**
 * Module d'authentification et de gestion de session — FCI v1.0
 * Dépôt : FCI-APP/FCI-audit
 */
(function () {
  "use strict";

  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyCNf8cxY2IX4iQA5QkvFhd3YgrLloB9CxY",
    authDomain: "fci-audit-auth.firebaseapp.com",
    projectId: "fci-audit-auth",
    storageBucket: "fci-audit-auth.firebasestorage.app",
    messagingSenderId: "270808708",
    appId: "1:270808708:web:cf9ed710bb843ada7534d1"
  };

  const DOMAIN_SUFFIX = "@fci-audit.local";
  const SESSION_KEY = "fci_current_user";
  const SDK_VERSION = "10.14.1";

  const ROLE_LABELS = {
    ADMIN: "Administrateur Siège",
    RESPONSABLE_REGIONAL: "Responsable Régional",
    CONTROLEUR: "Contrôleur"
  };

  // Masquer immédiatement les pages protégées pendant la vérification
  const isLoginPage = /(^|\/)login\.html(\?|#|$)/i.test(window.location.pathname);
  if (!isLoginPage && document.documentElement) {
    document.documentElement.style.visibility = "hidden";
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const s = document.createElement("script");
      s.src = src;
      s.async = false;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Échec de chargement : " + src));
      document.head.appendChild(s);
    });
  }

  let initPromise = null;
  function ensureFirebaseReady() {
    if (initPromise) return initPromise;
    initPromise = (async () => {
      if (!window.firebase) {
        await loadScript(`https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-app-compat.js`);
        await loadScript(`https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-auth-compat.js`);
        await loadScript(`https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-firestore-compat.js`);
      }
      if (!firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
      }
      return {
        auth: firebase.auth(),
        db: firebase.firestore()
      };
    })();
    return initPromise;
  }

  function normalizeEmail(identifiant) {
    const clean = String(identifiant || "").trim().toLowerCase();
    if (!clean) return "";
    return clean.includes("@") ? clean : `${clean}${DOMAIN_SUFFIX}`;
  }

  function getCachedUser() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setCachedUser(profile) {
    try {
      if (profile) {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(profile));
      } else {
        sessionStorage.removeItem(SESSION_KEY);
      }
    } catch (e) {
      // Ignorer erreur quota sessionStorage
    }
  }

  async function fetchUserProfile(uid) {
    const { db } = await ensureFirebaseReady();
    const doc = await db.collection("utilisateurs").doc(uid).get();
    if (!doc.exists) return null;
    return { uid, ...doc.data() };
  }

  async function login(identifiant, password) {
    const { auth } = await ensureFirebaseReady();
    const email = normalizeEmail(identifiant);
    if (!email || !password) {
      throw new Error("Veuillez saisir votre identifiant et votre mot de passe.");
    }

    const cred = await auth.signInWithEmailAndPassword(email, password);
    const profile = await fetchUserProfile(cred.user.uid);

    if (!profile) {
      await auth.signOut();
      throw new Error("Profil utilisateur introuvable dans la base. Contactez l'administrateur.");
    }

    if (profile.actif === false) {
      await auth.signOut();
      throw new Error("Ce compte est désactivé. Contactez l'administrateur.");
    }

    setCachedUser(profile);
    return profile;
  }

  async function logout() {
    try {
      const { auth } = await ensureFirebaseReady();
      await auth.signOut();
    } finally {
      setCachedUser(null);
      window.location.replace("login.html");
    }
  }

  function renderUserWidget(profile) {
    if (document.getElementById("fci-auth-user-card")) return;

    const roleText = ROLE_LABELS[profile.role] || profile.role || "Utilisateur";
    const regionText = profile.region === "SIEGE" ? "Direction Centrale (Siège)" : `DR ${profile.region}`;
    const isAdmin = profile.role === "ADMIN";

    const card = document.createElement("div");
    card.id = "fci-auth-user-card";
    card.style.cssText = [
      "margin: 12px 10px",
      "padding: 12px",
      "border-radius: 10px",
      "background: rgba(255, 255, 255, 0.08)",
      "border: 1px solid rgba(234, 170, 0, 0.35)",
      "color: #ffffff",
      "font-family: 'Plus Jakarta Sans', sans-serif",
      "font-size: 12px"
    ].join(";");

    card.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
        <div style="width:30px;height:30px;border-radius:50%;background:#EAAA00;color:#003366;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0;">
          <i class="fas fa-user-shield"></i>
        </div>
        <div style="overflow:hidden;">
          <div style="font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${profile.nomComplet || profile.identifiant}">
            ${profile.nomComplet || profile.identifiant}
          </div>
          <div style="font-size:11px;color:#EAAA00;font-weight:600;">${roleText}</div>
        </div>
      </div>
      <div style="font-size:11px;color:rgba(255,255,255,0.82);margin-bottom:10px;padding-left:2px;">
        <i class="fas fa-map-marker-alt" style="color:#EAAA00;margin-right:4px;"></i>${regionText}
      </div>
      ${isAdmin ? `
        <a href="AdminComptes.html" style="display:block;text-align:center;margin-bottom:7px;padding:6px 8px;border-radius:6px;background:#EAAA00;color:#003366;font-weight:700;text-decoration:none;font-size:11.5px;">
          <i class="fas fa-users-cog" style="margin-right:5px;"></i>Gestion des comptes
        </a>
      ` : ""}
      <button type="button" id="fci-logout-btn" style="width:100%;padding:6px 8px;border-radius:6px;border:1px solid rgba(255,255,255,0.28);background:rgba(220,38,38,0.85);color:#fff;font-weight:600;font-size:11.5px;cursor:pointer;">
        <i class="fas fa-sign-out-alt" style="margin-right:5px;"></i>Déconnexion
      </button>
    `;

    // Recherche de la barre latérale existante sans modifier sa structure
    const sidebar =
      document.querySelector(".sidebar") ||
      document.querySelector("aside") ||
      document.querySelector("#sidebar");

    if (sidebar) {
      sidebar.appendChild(card);
    } else {
      card.style.position = "fixed";
      card.style.bottom = "12px";
      card.style.left = "12px";
      card.style.zIndex = "9999";
      card.style.background = "#003366";
      card.style.boxShadow = "0 6px 18px rgba(0,0,0,0.25)";
      document.body.appendChild(card);
    }

    const logoutBtn = document.getElementById("fci-logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => logout());
    }
  }

  function protectPage(options = {}) {
    if (isLoginPage) return;

    ensureFirebaseReady()
      .then(({ auth }) => {
        auth.onAuthStateChanged(async (user) => {
          if (!user) {
            setCachedUser(null);
            window.location.replace("login.html");
            return;
          }

          try {
            const profile = await fetchUserProfile(user.uid);
            if (!profile || profile.actif === false) {
              await auth.signOut();
              setCachedUser(null);
              window.location.replace("login.html");
              return;
            }

            if (options.adminOnly && profile.role !== "ADMIN") {
              window.location.replace("index.html");
              return;
            }

            setCachedUser(profile);
            document.documentElement.style.visibility = "visible";

            const mountUI = () => {
              renderUserWidget(profile);
              window.dispatchEvent(new CustomEvent("fci-auth-ready", { detail: profile }));
            };

            if (document.readyState === "loading") {
              document.addEventListener("DOMContentLoaded", mountUI);
            } else {
              mountUI();
            }
          } catch (err) {
            console.error("Erreur vérification session FCI :", err);
            window.location.replace("login.html");
          }
        });
      })
      .catch((err) => {
        console.error("Erreur initialisation Firebase FCI :", err);
        window.location.replace("login.html");
      });
  }

  window.FCIAuth = {
    FIREBASE_CONFIG,
    DOMAIN_SUFFIX,
    ROLE_LABELS,
    ensureFirebaseReady,
    login,
    logout,
    getCurrentUser: getCachedUser,
    protectPage
  };

  // Protection automatique sur toute page autre que login.html
  if (!isLoginPage) {
    protectPage({
      adminOnly: /(^|\/)AdminComptes\.html(\?|#|$)/i.test(window.location.pathname)
    });
  }
})();

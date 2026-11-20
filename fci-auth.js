/**
 * FCI Auth & Security Manager — Projet Firebase : fci-vesion1
 * Barid Al-Maghrib — Direction Contrôle Générale / Division Contrôle Permanent
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDHFD7Gz1jGKPLnLLr6_Keo0lLfSZlJZYs",
  authDomain: "fci-vesion1.firebaseapp.com",
  projectId: "fci-vesion1",
  storageBucket: "fci-vesion1.firebasestorage.app",
  messagingSenderId: "691715794182",
  appId: "1:691715794182:web:e9b211a6901303f27fea87"
};

const app = initializeApp(FIREBASE_CONFIG);
const secondaryApp = initializeApp(FIREBASE_CONFIG, "SecondaryAdminWorker");

export const auth = getAuth(app);
export const secondaryAuth = getAuth(secondaryApp);
export const db = getFirestore(app);

// Normalisation insensible à la casse (Section 7 du CDC)
export function usernameToEmail(username) {
  const clean = String(username || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
  return `${clean}@fci.barid.ma`;
}

export function normalizePassword(password) {
  return String(password || "").trim().toLowerCase();
}

export function normalizeUsername(username) {
  return String(username || "").trim().toUpperCase();
}

// Journalisation des actions sensibles (Section 5.4 & Section 10)
export async function logAuditAction(action, details = {}) {
  try {
    const user = window.FCI_CURRENT_USER || { username: "SYSTEME", role: "SYSTEME" };
    await addDoc(collection(db, "audit_logs"), {
      action,
      acteur_username: user.username,
      acteur_role: user.role,
      details,
      timestamp: new Date().toISOString(),
      server_time: serverTimestamp()
    });
  } catch (e) {
    console.warn("Journalisation audit différée:", e);
  }
}

// Connexion
export async function loginFCI(rawUsername, rawPassword) {
  const email = usernameToEmail(rawUsername);
  const pass = normalizePassword(rawPassword);

  const cred = await signInWithEmailAndPassword(auth, email, pass);
  const userSnap = await getDoc(doc(db, "users", cred.user.uid));

  if (!userSnap.exists()) {
    await signOut(auth);
    throw new Error("Profil utilisateur introuvable dans la base.");
  }

  const profile = { uid: cred.user.uid, ...userSnap.data() };
  if (profile.actif === false) {
    await signOut(auth);
    throw new Error("Ce compte est désactivé. Contactez l'Administrateur principal.");
  }

  sessionStorage.setItem("fci_user_profile", JSON.stringify(profile));
  await logAuditAction("CONNEXION", { username: profile.username, role: profile.role });
  return profile;
}

// Déconnexion
export async function logoutFCI() {
  await logAuditAction("DECONNEXION", {});
  sessionStorage.removeItem("fci_user_profile");
  localStorage.removeItem("fci_database");
  await signOut(auth);
  window.location.href = "login.html";
}

// Changement de mot de passe réservé EXCLUSIVEMENT à l'Administrateur principal
export async function changeAdminOwnPassword(oldPassword, newPassword) {
  const profile = window.FCI_CURRENT_USER;
  if (!profile || profile.role !== "ADMIN") {
    throw new Error("Accès refusé : seul l'Administrateur principal peut modifier son mot de passe.");
  }
  const user = auth.currentUser;
  const cred = EmailAuthProvider.credential(user.email, normalizePassword(oldPassword));
  await reauthenticateWithCredential(user, cred);
  await updatePassword(user, normalizePassword(newPassword));
  await logAuditAction("MODIFICATION_MDP_ADMIN", { username: profile.username });
}

// Création d'un compte par l'Administrateur (via instance secondaire isolée)
export async function adminProvisionUser(accountData) {
  const profile = window.FCI_CURRENT_USER;
  if (!profile || profile.role !== "ADMIN") {
    throw new Error("Opération réservée à l'Administrateur principal.");
  }

  const username = normalizeUsername(accountData.username);
  const email = usernameToEmail(username);
  const pass = normalizePassword(accountData.password);

  const cred = await createUserWithEmailAndPassword(secondaryAuth, email, pass);
  const uid = cred.user.uid;
  await signOut(secondaryAuth);

  const userRecord = {
    uid,
    username,
    email,
    role: accountData.role,
    fonction: accountData.fonction,
    region: accountData.region || "SIEGE",
    region_code: accountData.region_code || "SIEGE",
    nom_complet: accountData.nom_complet || username,
    actif: accountData.actif !== false,
    date_creation: new Date().toISOString(),
    cree_par: profile.username
  };

  await setDoc(doc(db, "users", uid), userRecord);
  await logAuditAction("CREATION_COMPTE", { cible: username, role: userRecord.role, region: userRecord.region });
  return userRecord;
}

// Métadonnées de traçabilité (Section 10 du CDC)
export function buildAuditMetadata(existingRecord = null) {
  const u = window.FCI_CURRENT_USER || { username: "INCONNU", nom_complet: "Inconnu", role: "", region_code: "" };
  const now = new Date().toISOString();

  if (!existingRecord || !existingRecord.cree_par_id) {
    return {
      ...(existingRecord || {}),
      record_uid: (existingRecord && existingRecord.record_uid) || ("FCI-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7).toUpperCase()),
      cree_par_id: u.username,
      cree_par_nom: u.nom_complet,
      cree_par_role: u.role,
      cree_par_region: u.region_code,
      date_creation: (existingRecord && existingRecord.date_creation) || now,
      modifie_par_id: u.username,
      modifie_par_nom: u.nom_complet,
      date_modification: now
    };
  }

  return {
    ...existingRecord,
    modifie_par_id: u.username,
    modifie_par_nom: u.nom_complet,
    date_modification: now
  };
}

// Garde de sécurité & Injection dans la barre latérale fixe
export function initFCISessionGuard(options = { adminOnly: false }) {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        window.location.href = "login.html";
        return;
      }

      const snap = await getDoc(doc(db, "users", firebaseUser.uid));
      if (!snap.exists() || snap.data().actif === false) {
        await signOut(auth);
        window.location.href = "login.html";
        return;
      }

      const user = { uid: firebaseUser.uid, ...snap.data() };
      window.FCI_CURRENT_USER = user;
      sessionStorage.setItem("fci_user_profile", JSON.stringify(user));

      if (options.adminOnly && user.role !== "ADMIN") {
        window.location.href = "index.html";
        return;
      }

      injectSidebarUserPanel(user);
      window.dispatchEvent(new CustomEvent("fci-auth-ready", { detail: user }));
      resolve(user);
    });
  });
}

function injectSidebarUserPanel(user) {
  const sidebar = document.querySelector(".sidebar, nav, #sidebar");
  if (!sidebar || document.getElementById("fci-auth-sidebar-box")) return;

  const isAdmin = user.role === "ADMIN";
  const box = document.createElement("div");
  box.id = "fci-auth-sidebar-box";
  box.style.cssText = `
    margin-top: auto;
    padding: 12px;
    border-top: 1px solid rgba(255,255,255,0.15);
    background: rgba(0, 20, 45, 0.45);
    color: #fff;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 12px;
  `;

  box.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
      <div style="width:30px;height:30px;border-radius:6px;background:#EAAA00;color:#002244;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <i class="fas fa-user-shield"></i>
      </div>
      <div style="overflow:hidden;">
        <div style="font-weight:700;color:#EAAA00;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${user.username}</div>
        <div style="font-size:11px;opacity:0.9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${user.nom_complet}</div>
        <div style="font-size:10px;opacity:0.75;">${user.fonction} • ${user.region}</div>
      </div>
    </div>

    ${isAdmin ? `
      <a href="AdminComptes.html" style="display:flex;align-items:center;gap:8px;padding:8px 10px;margin-bottom:6px;border-radius:6px;background:#EAAA00;color:#002244;font-weight:700;text-decoration:none;">
        <i class="fas fa-users-cog"></i> Administration des comptes
      </a>
      <button id="btn-admin-change-pwd" type="button" style="width:100%;display:flex;align-items:center;gap:8px;padding:7px 10px;margin-bottom:6px;border-radius:6px;border:1px solid rgba(255,255,255,0.25);background:transparent;color:#fff;cursor:pointer;font-size:11px;">
        <i class="fas fa-key"></i> Changer mon mot de passe
      </button>
    ` : ""}

    <button id="btn-fci-logout" type="button" style="width:100%;display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:6px;border:none;background:#c0392b;color:#fff;font-weight:600;cursor:pointer;font-size:11px;">
      <i class="fas fa-sign-out-alt"></i> Déconnexion
    </button>
  `;

  sidebar.appendChild(box);

  document.getElementById("btn-fci-logout").addEventListener("click", logoutFCI);

  if (isAdmin) {
    document.getElementById("btn-admin-change-pwd").addEventListener("click", async () => {
      const oldPwd = prompt("Saisissez votre mot de passe administrateur actuel :");
      if (!oldPwd) return;
      const newPwd = prompt("Saisissez votre nouveau mot de passe administrateur (min. 8 caractères) :");
      if (!newPwd || newPwd.length < 8) {
        alert("Le nouveau mot de passe doit contenir au moins 8 caractères.");
        return;
      }
      try {
        await changeAdminOwnPassword(oldPwd, newPwd);
        alert("Mot de passe administrateur mis à jour avec succès.");
      } catch (err) {
        alert("Erreur : " + err.message);
      }
    });
  }
}

window.FCI_AUTH = {
  db,
  auth,
  loginFCI,
  logoutFCI,
  initFCISessionGuard,
  adminProvisionUser,
  buildAuditMetadata,
  logAuditAction
};

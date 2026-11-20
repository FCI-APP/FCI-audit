/**
 * FCI Database Manager — Synchronisation Firestore & Cache localStorage
 * Préserve la compatibilité complète avec fci_database sur les 6 feuilles
 */
import { db, buildAuditMetadata, logAuditAction } from "./fci-auth.js";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const LOCAL_DB_KEY = "fci_database";

function getDefaultLocalSchema() {
  return {
    referentiel: [],
    planifications: [],
    controles: [],
    encaisses: [],
    bdd: [],
    lastSync: null
  };
}

export function getLocalDatabase() {
  try {
    const raw = localStorage.getItem(LOCAL_DB_KEY);
    if (!raw) return getDefaultLocalSchema();
    return { ...getDefaultLocalSchema(), ...JSON.parse(raw) };
  } catch (e) {
    return getDefaultLocalSchema();
  }
}

export function saveLocalDatabase(data) {
  localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(data));
}

// Chargement initial depuis Firestore selon les droits du profil connecté
export async function syncFromFirestoreToLocal(user) {
  if (!user) return getLocalDatabase();

  const localDb = getLocalDatabase();
  const isControleur = user.role === "CONTROLEUR";

  // 1. Enregistrements (FC, FV, BDD)
  const qRecords = isControleur
    ? query(collection(db, "fci_enregistrements"), where("cree_par_id", "==", user.username))
    : collection(db, "fci_enregistrements");

  const snapRecords = await getDocs(qRecords);
  const allRecords = snapRecords.docs.map(d => ({ firestore_id: d.id, ...d.data() }));

  localDb.bdd = allRecords;
  localDb.controles = allRecords.filter(r => r.source_module === "FC" || r.type_fiche === "FC");
  localDb.encaisses = allRecords.filter(r => r.source_module === "FV" || r.type_fiche === "FV");

  // 2. Planifications
  const qPlans = isControleur
    ? query(collection(db, "fci_planifications"), where("cree_par_id", "==", user.username))
    : collection(db, "fci_planifications");

  const snapPlans = await getDocs(qPlans);
  localDb.planifications = snapPlans.docs.map(d => ({ firestore_id: d.id, ...d.data() }));

  localDb.lastSync = new Date().toISOString();
  saveLocalDatabase(localDb);

  // Déclenche le rafraîchissement des tableaux/graphiques de la page active
  window.dispatchEvent(new CustomEvent("fci-db-synced", { detail: localDb }));
  return localDb;
}

// Sauvegarde d'un enregistrement (FC, FV ou ligne modifiée en BDD)
export async function upsertFCIRecord(record, moduleSource = "BDD") {
  const user = window.FCI_CURRENT_USER;
  if (!user) throw new Error("Utilisateur non authentifié.");

  // Vérification de propriété côté client avant appel serveur
  if (user.role === "CONTROLEUR" && record.cree_par_id && record.cree_par_id !== user.username) {
    throw new Error("Action refusée : vous ne pouvez modifier que vos propres enregistrements.");
  }

  const enriched = buildAuditMetadata({
    ...record,
    source_module: record.source_module || moduleSource
  });

  const docId = enriched.firestore_id || enriched.record_uid;
  enriched.firestore_id = docId;

  await setDoc(doc(db, "fci_enregistrements", docId), enriched, { merge: true });

  // Mise à jour immédiate du cache localStorage
  const localDb = getLocalDatabase();
  const idx = localDb.bdd.findIndex(item => (item.firestore_id || item.record_uid) === docId);
  if (idx >= 0) {
    localDb.bdd[idx] = enriched;
  } else {
    localDb.bdd.unshift(enriched);
  }
  localDb.controles = localDb.bdd.filter(r => r.source_module === "FC" || r.type_fiche === "FC");
  localDb.encaisses = localDb.bdd.filter(r => r.source_module === "FV" || r.type_fiche === "FV");
  saveLocalDatabase(localDb);

  return enriched;
}

// Suppression d'un enregistrement (Admin ou contrôleur propriétaire uniquement)
export async function deleteFCIRecord(recordOrId) {
  const user = window.FCI_CURRENT_USER;
  if (!user) throw new Error("Utilisateur non authentifié.");

  const docId = typeof recordOrId === "string"
    ? recordOrId
    : (recordOrId.firestore_id || recordOrId.record_uid);

  const localDb = getLocalDatabase();
  const existing = localDb.bdd.find(item => (item.firestore_id || item.record_uid) === docId);

  if (user.role === "CONTROLEUR" && existing && existing.cree_par_id !== user.username) {
    throw new Error("Action refusée : vous ne pouvez supprimer que vos propres enregistrements.");
  }

  await deleteDoc(doc(db, "fci_enregistrements", docId));
  await logAuditAction("SUPPRESSION_ENREGISTREMENT", { record_id: docId });

  localDb.bdd = localDb.bdd.filter(item => (item.firestore_id || item.record_uid) !== docId);
  localDb.controles = localDb.bdd.filter(r => r.source_module === "FC" || r.type_fiche === "FC");
  localDb.encaisses = localDb.bdd.filter(r => r.source_module === "FV" || r.type_fiche === "FV");
  saveLocalDatabase(localDb);
}

// Sauvegarde d'une planification
export async function upsertFCIPlanification(plan) {
  const user = window.FCI_CURRENT_USER;
  if (!user) throw new Error("Utilisateur non authentifié.");

  if (user.role === "CONTROLEUR" && plan.cree_par_id && plan.cree_par_id !== user.username) {
    throw new Error("Action refusée : vous ne pouvez modifier que vos propres planifications.");
  }

  const enriched = buildAuditMetadata(plan);
  const docId = enriched.firestore_id || enriched.record_uid;
  enriched.firestore_id = docId;

  await setDoc(doc(db, "fci_planifications", docId), enriched, { merge: true });

  const localDb = getLocalDatabase();
  const idx = localDb.planifications.findIndex(item => (item.firestore_id || item.record_uid) === docId);
  if (idx >= 0) {
    localDb.planifications[idx] = enriched;
  } else {
    localDb.planifications.unshift(enriched);
  }
  saveLocalDatabase(localDb);

  return enriched;
}

// Synchronisation automatique dès que la session Firebase est validée
window.addEventListener("fci-auth-ready", async (e) => {
  await syncFromFirestoreToLocal(e.detail);
});

window.FCIDBManager = {
  getLocalDatabase,
  saveLocalDatabase,
  syncFromFirestoreToLocal,
  upsertFCIRecord,
  deleteFCIRecord,
  upsertFCIPlanification
};

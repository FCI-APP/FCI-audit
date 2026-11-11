/**
 * FCI v1.0 - Gestionnaire de la Base de Données Centralisée (BDD)
 * Dépôt GitHub : FCI-APP/FCI-audit
 * Clé localStorage : 'fci_database'
 */

const FCIDatabase = {
    KEY: 'fci_database',

    init() {
        if (!localStorage.getItem(this.KEY)) {
            const schema = {
                version: '1.0',
                derniereMiseAJour: new Date().toISOString(),
                missions: [],         // Table A (Planification)
                constatsControle: [], // Table B (Fiche de Contrôle)
                constatsEncaisses: [] // Table C (Fiche des Encaisses)
            };
            localStorage.setItem(this.KEY, JSON.stringify(schema));
        }
    },

    getDB() {
        this.init();
        return JSON.parse(localStorage.getItem(this.KEY));
    },

    saveDB(db) {
        db.derniereMiseAJour = new Date().toISOString();
        localStorage.setItem(this.KEY, JSON.stringify(db));
    },

    enregistrerMission(dataMission) {
        const db = this.getDB();
        const index = db.missions.findIndex(m => m.idMission === dataMission.idMission);
        if (index >= 0) {
            db.missions[index] = dataMission;
        } else {
            db.missions.push(dataMission);
        }
        this.saveDB(db);
    },

    enregistrerConstatControle(dataConstat) {
        const db = this.getDB();
        const index = db.constatsControle.findIndex(c => c.idConstat === dataConstat.idConstat);
        if (index >= 0) {
            db.constatsControle[index] = dataConstat;
        } else {
            db.constatsControle.push(dataConstat);
        }
        this.saveDB(db);
    },

    enregistrerConstatEncaisse(dataEncaisse) {
        const db = this.getDB();
        const index = db.constatsEncaisses.findIndex(e => e.idEncaisse === dataEncaisse.idEncaisse);
        if (index >= 0) {
            db.constatsEncaisses[index] = dataEncaisse;
        } else {
            db.constatsEncaisses.push(dataEncaisse);
        }
        this.saveDB(db);
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

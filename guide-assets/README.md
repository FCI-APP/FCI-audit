# Captures d'écran du Guide d'utilisation (`guide-assets/`)

Ce dossier accueille les captures d'écran annotées ou brutes des écrans réels de FCI v1.0 (avec **données de démonstration uniquement**, sans mots de passe ni informations confidentielles réelles).

## Comment associer une capture à une feuille

1. Déposez votre image PNG/JPG dans ce dossier (ex. `CAP-01.png`).
2. Ouvrez [guide-data.js](../guide-data.js) et renseignez la propriété `imageSrc` dans le bloc `illustration` de la feuille correspondante :
   ```js
   imageSrc: 'guide-assets/CAP-01.png'
   ```
3. Ajustez si nécessaire les coordonnées `x` et `y` (en pourcentage `0..100`) des repères numérotés `markers` pour qu'ils pointent exactement sur les zones de votre capture.

## Correspondance des codes de captures

| Code | Fichier recommandé | Feuille couverte |
|---|---|---|
| `CAP-00` | `CAP-00.png` | Écran de connexion (`login.html`) |
| `CAP-01` | `CAP-01.png` | Feuille 1 : Référentiel de contrôle (`index.html`) |
| `CAP-02` | `CAP-02.png` | Feuille 2 : Planification (`Planification.html`) |
| `CAP-03` | `CAP-03.png` | Feuille 3 : Fiche de Contrôle (`FicheControle.html`) |
| `CAP-04` | `CAP-04.png` | Feuille 4 : Vérification Encaisses (`FicheEncaisses.html`) |
| `CAP-05` | `CAP-05.png` | Feuille 5 : Base de Données (`BDD.html`) |
| `CAP-06` | `CAP-06.png` | Feuille 6 : Tableau de Bord (`TDB.html`) |

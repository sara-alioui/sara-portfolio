# Portfolio — Sara Alioui

## 📁 Structure

```
portfolio/
├── index.html              # Page principale (structure uniquement)
├── css/
│   ├── variables.css       # Couleurs, polices, espacements
│   ├── base.css             # Reset et styles globaux
│   ├── layout.css           # Grille, sections, responsive
│   ├── components.css       # Boutons, cartes, formulaire
│   └── animations.css       # Animations d'apparition (minimales)
├── js/
│   ├── main.js               # Animations au scroll + formulaire
│   ├── navigation.js         # Menu mobile + lien actif
│   └── projects.js           # Génère les cartes projets depuis projects.json
├── data/
│   └── projects.json         # ⭐ Tous tes projets — à compléter ici
└── assets/
    ├── images/
    │   └── profile.jpg        # À remplacer par ta photo
    └── cv/
        └── CV_Sara_Alioui.pdf # À remplacer par ton vrai CV
```

## ➕ Ajouter un nouveau projet

Ouvre `data/projects.json` et ajoute un bloc comme celui-ci dans le tableau :

```json
{
  "title": "Nom du projet",
  "description": "Description courte du projet.",
  "tags": ["Python", "SQL", "..."],
  "github": "https://github.com/sara-alioui/nom-du-repo",
  "demo": "https://lien-demo-si-existant.com"
}
```

C'est tout — pas besoin de toucher au HTML, la carte s'affiche automatiquement.
Si un projet n'a pas de démo, laisse `"demo": ""`.

## 🖼️ Images et CV à ajouter

Avant de publier, remplace ces deux fichiers par les tiens (mêmes noms, ou mets à jour les
chemins dans `index.html`) :
- `assets/images/profile.jpg`
- `assets/cv/CV_Sara_Alioui.pdf`

## 🚀 Publier sur GitHub Pages

1. Pousse tout le dossier `portfolio/` dans ton repo GitHub (le contenu du dossier doit être
   à la racine du repo, ou dans un dossier `/docs` si tu préfères).
2. Va dans **Settings → Pages** de ton repo et active GitHub Pages sur la branche `main`.
3. Le lien de ton site apparaîtra en haut de cette page.

## 🎨 Personnaliser les couleurs

Toutes les couleurs sont centralisées dans `css/variables.css`. Change `--accent` pour changer
la couleur principale du site partout d'un coup.

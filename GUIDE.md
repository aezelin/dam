# Strip Collage — Guide d'utilisation

> **Version 2.1** · Export navigateur · JPG · WebP · PNG · AVIF (via serveur Node)

---

## Table des matières

1. [Installation](#1-installation)
2. [Démarrage rapide](#2-démarrage-rapide)
3. [Interface — Vue d'ensemble](#3-interface--vue-densemble)
4. [Workflow étape par étape](#4-workflow-étape-par-étape)
5. [Marques, thèmes et dimensions](#5-marques-thèmes-et-dimensions)
6. [Paramètres des strips](#6-paramètres-des-strips)
7. [Color Burn+](#7-color-burn)
8. [Export](#8-export)
9. [Variables](#9-variables)
10. [Sauvegarde sur serveur](#10-sauvegarde-sur-serveur)
11. [Configurations](#11-configurations)
12. [Tour guidé et aide contextuelle](#12-tour-guidé-et-aide-contextuelle)
13. [Personnalisation JSON](#13-personnalisation-json)
14. [Résolution de problèmes](#14-résolution-de-problèmes)

---

## 1. Installation

### Mode standalone (sans Node.js)

```
1. Décompresser strip-collage-v2.zip
2. Ouvrir index.html dans Chrome, Firefox ou Safari
3. Prêt — tous les formats sauf AVIF disponibles
```

### Mode complet (AVIF + sauvegarde disque)

```bash
npm install        # installe sharp (encodeur AVIF)
node server.js     # démarre sur http://localhost:7842
```

Ouvrir `http://localhost:7842`. L'indicateur ⚫ passe à 🟢 automatiquement.

### Configuration du dossier de sortie

Modifier en tête de `server.js` :

```js
const EXPORT_DIR     = './exports';  // chemin absolu ou relatif
const SUBDIR_BY_DATE = true;         // sous-dossier YYYY-MM-DD automatique
const PORT           = 7842;
```

| Contexte | Valeur EXPORT_DIR |
|----------|-------------------|
| Disque réseau Windows (Z:) | `'Z:\\projets\\strip-collage'` |
| NAS Linux monté | `'/mnt/nas/exports'` |
| Dossier local | `'./exports'` |

---

## 2. Démarrage rapide

```
1. Glisser une image sur "Image source" (sidebar gauche)
2. Repositionner le cadre → "Valider le recadrage →"
3. Cocher une marque dans la barre Marques
4. Ajuster les strips si disponibles pour la marque
5. Renseigner le dossier de destination et le nom (optionnel)
6. Cliquer "Exporter"
```

---

## 3. Interface — Vue d'ensemble

```
┌─ Header ──────────────────────────── Tour guidé ↗ ────────────┐
│  Strip Collage    1·Image → 2·Recadrage → 3·Composition        │
├─ Marques ⓘ ───────────────────────────────────────────────────┤
│  □ BECM  becm_   [orient.̶] [strips̶] [offsets̶] [CB+̶]            │
│  ■ CIC BP cicbp_ [orient.] [strips] [offsets] [CB+]  ▾        │
│    ■ Produits  □ Square 800×800  ■ Portrait 800×1200  □ …      │
│    □ Hubs      □ Banner 1200×400  □ Square HD 1080×1080        │
│    □ Articles  □ Vignette 640×360  □ Mobile 375×812            │
├─ Panel ──────────────────────────────┬────────────────────────┤
│  Sidebar                             │  Zone preview          │
│  · Image source ⓘ                   │  ● Onboarding          │
│  · Taille du document ⓘ             │  ● Phase crop          │
│  · Orientation ⓘ                    │  ● Phase compo         │
│  · Strips ⓘ                         │    Toggle format/      │
│  · Décalages individuels ⓘ          │    tous les formats    │
│  · Color Burn+ ⓘ                    │    Miniatures groupées │
│  · Réinitialiser                     │    par thème           │
├─ Export ──────────────────────────────────────────────────────┤
│  Dossier ⓘ [projets/{{brand}}]  Nom ⓘ [visuel_{{dimensions}}] │
│  Formats  [Exporter]  □ Sauvegarder sur serveur 🟢             │
│  Aperçu des fichiers qui seront générés                        │
├─ Job Queue ────────────────────────────────────────────────────┤
├─ Galerie ──────────────────────────────────────────────────────┤
└─ Configurations (accordéon) ──────────────────────────────────┘
```

---

## 4. Workflow étape par étape

### Étape 1 — Importer une image

- Glisser-déposer sur la zone **Image source ⓘ**, ou cliquer pour parcourir
- Formats : JPEG, PNG, WebP, GIF, BMP, TIFF
- L'indicateur passe à **2 · Recadrage**

### Étape 2 — Choisir le point d'intérêt

- **Glisser** l'image pour repositionner le cadre
- Le cadre respecte le ratio des dimensions du document courant
- La **grille en tiers** aide à composer

Cliquer **"Valider le recadrage →"**.

> ↩ Cliquer **"← Recadrer"** à tout moment pour ajuster.

### Étape 3 — Composer

L'image est fixe. Les strips se superposent comme des masques.

**Toggle preview :**
- `Voir format actuel` → aperçu unique en temps réel
- `Voir tous les formats` → miniatures de toutes les dimensions cochées, groupées par thème

---

## 5. Marques, thèmes et dimensions

### Cocher une marque

Trois effets simultanés :
1. La marque est incluse dans le **batch export**
2. La **sidebar** affiche uniquement les sections disponibles (selon features)
3. Le **preview** affiche les dimensions de cette marque

### Thèmes de dimensions

Les dimensions sont organisées en **thèmes** (Produits, Hubs, Articles…).
Chaque thème a une case "tout cocher/décocher" avec état intermédiaire (⊟) si partiellement coché.

```
■ Produits   ■ Square 800×800   ■ Portrait 800×1200   □ Paysage 1200×800
□ Hubs       □ Banner 1200×400  □ Square HD 1080×1080
□ Articles   □ Vignette 640×360 □ Mobile 375×812
```

Cliquer sur la ligne d'une marque pour ouvrir/fermer son accordéon de thèmes.

### Badges de features

| Badge | Bleu = actif | Barré = inactif |
|-------|-------------|-----------------|
| `orient.` | Orientation + angle disponibles | Vertical fixe |
| `strips` | Paramètres strips visibles | Image pleine surface |
| `offsets` | Décalages individuels visibles | — |
| `CB+` | Color Burn disponible | — |

---

## 6. Paramètres des strips

| Paramètre | Description |
|-----------|-------------|
| **Nombre** (2–10) | Nombre de strips |
| **Hauteur %** | % de la hauteur doc (V/D) ou largeur (H) |
| **Largeur %** | % total occupé par l'ensemble |
| **Gap** | Espace entre strips (px, scalé à l'export) |
| **Angle** | Inclinaison en mode Diagonal (−60° à +60°) |
| **Décalage global** | Alternance ±v/2 sur tous les strips |

### Décalages et hauteurs individuels

- **Décalage** (−150 à +150 px) : déplace perpendiculairement aux bords
- **Hauteur** (20% à 150%) : hauteur relative à la valeur globale

---

## 7. Color Burn+

| Paramètre | Rôle |
|-----------|------|
| **Strip n°** | 0 = désactivé, 1–N = strip ciblé |
| **Couleur** | Cliquer le carré pour ouvrir le sélecteur |
| **Opacité** | Intensité de l'effet (10–100%) |

> 60–80% d'opacité donne généralement le meilleur rendu.

---

## 8. Export

### Dossier de destination

Accepte des sous-dossiers séparés par `/` et des variables (voir section 9).

```
projets/ete_2026/{{brand}}   →  projets/ete_2026/becm/
{{brand}}/{{date}}           →  becm/20260505/
```

Laisser vide = fichiers dans `EXPORT_DIR` directement (+ sous-dossier date si activé).

### Nom du fichier

Accepte du texte libre et des variables (voir section 9).

### Formats

| Format | Qualité | Fond | Nécessite Node |
|--------|---------|------|----------------|
| JPG HQ | 95% | Blanc | Non |
| JPG Web | 75% | Blanc | Non |
| WebP | 90% | Transparent | Non |
| AVIF | 80% | Transparent | **Oui** |
| PNG | Lossless | Transparent | Non |

### Job Queue

- File de jobs : ⏳ → ⚙️ → ✅
- Barre de progression globale
- Téléchargement navigateur automatique
- Sauvegarde serveur si cochée

---

## 9. Variables

Les variables sont des **modèles entourés de `{{` et `}}`** remplacés automatiquement à l'export par leur valeur réelle.

### Dans le champ Dossier

| Variable | Valeur produite | Exemple |
|----------|----------------|---------|
| `{{brand}}` | Nom de la marque cochée en minuscules | `becm` |
| `{{date}}` | Date du jour au format YYYYMMDD | `20260505` |
| `{{mode}}` | Orientation des strips | `vertical` |

**Exemples :**
```
projets/{{brand}}/{{date}}     →  projets/becm/20260505/
social/{{mode}}                →  social/vertical/
```

### Dans le champ Nom du fichier

| Variable | Valeur produite | Exemple |
|----------|----------------|---------|
| `{{dimensions}}` | Largeur × hauteur du format export | `800x1200` |
| `{{brand}}` | Nom de la marque | `becm` |
| `{{date}}` | Date YYYYMMDD | `20260505` |
| `{{mode}}` | Orientation | `vertical` |
| `{{count}}` | Nombre de strips | `3` |

**Exemple complet :**
- Dossier : `social/{{brand}}`
- Nom : `visuel_{{dimensions}}`
- Résultat : `exports/2026-05-05/social/becm/becm_visuel_800x800_hq.jpg`

> 💡 Cliquer sur l'icône **ⓘ** à côté de "Dossier" ou "Nom du fichier" pour ouvrir le tour guidé avec une démo interactive des variables.

---

## 10. Sauvegarde sur serveur

Cocher **"Sauvegarder sur serveur"** pour écrire les fichiers sur le disque du serveur Node en plus du téléchargement navigateur.

**Indicateur :**
- ⚫ Serveur non démarré — sans effet (fallback silencieux)
- 🟢 Serveur connecté — fichiers écrits sur disque

**Structure sur le serveur :**

```
EXPORT_DIR/
  └── 2026-05-05/                ← SUBDIR_BY_DATE = true
        └── social/becm/         ← dossier saisi dans l'interface
              ├── becm_visuel_800x800_hq.jpg
              └── becm_visuel_800x1200_hq.jpg
```

**Routes disponibles :**

| Route | Méthode | Rôle |
|-------|---------|------|
| `/status` | GET | État + chemin d'export |
| `/save` | POST | Écrit un fichier sur disque |
| `/convert` | POST | PNG → AVIF via sharp |
| `/files` | GET | Liste récursive des exports |

> Les séquences `..` dans les chemins sont neutralisées côté serveur (protection path traversal).

---

## 11. Configurations

### Sauvegarder

1. Régler tous les paramètres
2. Ouvrir l'accordéon **"Configurations"** (clic sur l'en-tête)
3. Nommer le slot (ou laisser le placeholder)
4. Cliquer **Sauvegarder**

Les configs persistent en **localStorage** entre sessions.

> En navigation privée, localStorage ne persiste pas. Exporter en JSON.

### Boutons par slot

| Bouton | Action |
|--------|--------|
| **Sauvegarder** | Enregistre l'état courant dans ce slot |
| **Preview** | Charge et prévisualise sans changer le slot actif |
| **Charger** | Charge et marque ce slot comme actif |
| **Vider** | Efface le slot (confirmation requise) |

### Export / Import JSON

- **↓ JSON** — télécharge toutes les configs dans un fichier horodaté
- **↑ JSON** — importe depuis un fichier JSON

---

## 12. Tour guidé et aide contextuelle

### Tour guidé complet

Cliquer **"Tour guidé ↗"** dans le header pour lancer les 11 étapes.
Navigation : boutons ← / → ou touches clavier `←` `→` `Échap`.
La **×** en haut à droite ferme le tour à tout moment.

### Icônes ⓘ

Des icônes **ⓘ** apparaissent à côté de chaque section.
Cliquer dessus ouvre le tour directement à l'étape correspondante :

| Section | Étape ouverte |
|---------|--------------|
| Marques | 3 · Choisir une marque |
| Image source | 1 · Importer une image |
| Taille du document | 3 · Marques et dimensions |
| Orientation | 4 · Configurer les strips |
| Strips | 4 · Configurer les strips |
| Décalages individuels | 4 · Configurer les strips |
| Color Burn+ | 5 · Color Burn+ |
| Dossier de destination | 7 · Variables du dossier (démo interactive) |
| Nom du fichier | 8 · Variables du nom (démo interactive) |

### Démo interactive des variables

Les étapes 7 et 8 du tour affichent :
- Un tableau des variables avec leur **valeur réelle** au moment de la lecture
- Un **champ de saisie** pour tester son propre modèle
- Le **résultat en temps réel** avec les valeurs substituées

---

## 13. Personnalisation JSON

### Ajouter une marque avec thèmes

```js
{
  name    : 'Ma Marque',
  prefix  : 'mm_',
  checked : false,
  preview : false,
  features: {
    docSize     : false,  // dimensions fixées par JSON
    orientation : true,
    strips      : true,
    offsets     : false,
    colorBurn   : true
  },
  themes: [
    { theme: 'Produits', checked: true, items: [
      { label: 'Square',   w: 800,  h: 800,  checked: true  },
      { label: 'Portrait', w: 800,  h: 1200, checked: false }
    ]},
    { theme: 'Réseaux sociaux', checked: false, items: [
      { label: 'Story',    w: 1080, h: 1920, checked: false },
      { label: 'Post',     w: 1080, h: 1080, checked: false }
    ]}
  ]
}
```

### Ajouter un thème à une marque existante

```js
{ theme: 'Mon thème', checked: false, items: [
  { label: 'Mon format', w: 1200, h: 628, checked: false }
]}
```

### Modifier les slots de configuration

```js
configs: {
  slots : 8,
  cols  : 4,
  names : ['A','B','C','D','E','F','G','H']
}
```

### Changer le port

Dans `server.js` : `const PORT = 7842;`
Dans `index.html` (chercher `AVIF_SERVER`) : `var AVIF_SERVER = 'http://localhost:7842';`

---

## 14. Résolution de problèmes

| Problème | Solution |
|----------|----------|
| Indicateur ⚫ (AVIF / serveur) | Vérifier que `node server.js` est lancé. Tester `http://localhost:7842/status`. |
| Export ne démarre pas | Cocher au moins une marque, une dimension et un format. |
| Preview vide | Cliquer "Valider le recadrage →" après import. |
| Strips absents | Vérifier que la marque a `strips: true` dans ses features. |
| Fichiers non écrits sur disque | "Sauvegarder sur serveur" coché + indicateur 🟢. |
| Dossier non créé sur serveur | `node server.js` doit avoir les droits d'écriture sur `EXPORT_DIR`. |
| Configs perdues | En navigation privée, localStorage ne persiste pas. Exporter en JSON. |
| Téléchargements bloqués | Autoriser les téléchargements multiples dans les paramètres du navigateur. |
| `npm install` échoue | Vérifier Node.js ≥ 18 : `node --version`. |
| AVIF échoue malgré 🟢 | `npm install` n'a peut-être pas installé sharp. Relancer dans le dossier du package. |

---

*Strip Collage v2.1 — Export navigateur multi-formats · Tour guidé intégré*

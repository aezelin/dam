# Strip Collage v2.1

Outil de composition visuelle multi-strips — export multi-formats, multi-marques, batch.

## Démarrage rapide

### Sans Node.js (mode standalone)

Ouvrir `index.html` directement dans le navigateur.
Tous les formats disponibles sauf AVIF.

### Avec Node.js (AVIF + sauvegarde disque)

```bash
npm install        # installe sharp pour l'encodage AVIF
node server.js     # démarre sur http://localhost:7842
```

## Configuration

Modifier en tête de `server.js` :

```js
const EXPORT_DIR     = './exports';  // dossier de sortie (absolu ou relatif)
const SUBDIR_BY_DATE = true;         // crée un sous-dossier YYYY-MM-DD
const PORT           = 7842;
```

Exemples pour EXPORT_DIR :

| Contexte                      | Valeur                              |
|-------------------------------|-------------------------------------|
| Disque réseau Windows (Z:)    | `'Z:\\projets\\strip-collage'`      |
| NAS Linux monté               | `'/mnt/nas/exports'`                |
| Dossier local                 | `'./exports'`                       |

## Contenu du package

```
strip-collage/
├── index.html     — interface complète (standalone ou via serveur)
├── server.js      — serveur Node : AVIF + sauvegarde disque
├── package.json   — dépendances npm
├── README.md      — ce fichier
└── exports/       — dossier de sortie (créé automatiquement)
```

## Routes serveur

| Route      | Méthode | Rôle                        |
|------------|---------|-----------------------------|
| `/status`  | GET     | État + chemin d'export      |
| `/save`    | POST    | Écrit un fichier sur disque |
| `/convert` | POST    | PNG → AVIF via sharp        |
| `/files`   | GET     | Liste des exports           |

Voir `GUIDE.md` pour la documentation complète.

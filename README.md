# Clean & Peek

Dépôt GitHub : **https://github.com/Les-Doubles-A/clean-peek**

Extension Manifest V3 (Chrome / Edge / Brave) : nettoyage d'URL + visualiseur de cookies et traqueurs.

## Installation
1. Ouvre `chrome://extensions`, active le **mode développeur**.
2. **Charger l'extension non empaquetée** et choisis ce dossier.
3. Épingle l'icône ; recharge les onglets déjà ouverts pour que les traqueurs soient détectés.

## Fonctionnalités
- Suppression automatique des paramètres de tracking (utm_*, fbclid, gclid…) à la navigation (declarativeNetRequest).
- Clic droit sur un lien : « Copier le lien nettoyé ».
- Onglet Cookies : liste, drapeaux de sécurité, détection des cookies de suivi, suppression ciblée.
- Onglet Traqueurs : domaines tiers contactés par la page, classés par catégorie. Le badge indique le nombre de traqueurs connus.

## Personnaliser
- `shared.js` : listes `TRACKING_PARAMS` et `TRACKER_DOMAINS`.

<!-- installeur-release -->
## Installation

Téléchargez **`clean-peek-Setup-1.0.1.exe`** depuis la [dernière release](https://github.com/Les-Doubles-A/clean-peek/releases/latest), puis lancez-le.

L'installeur copie l'extension dans `%LOCALAPPDATA%\Programs\clean-peek\extension` puis affiche la marche à suivre :

1. Ouvrez la page des extensions du navigateur (`chrome://extensions`, `edge://extensions`, `vivaldi://extensions`...).
2. Activez le **Mode développeur**.
3. Cliquez sur **Charger l'extension non empaquetée** et choisissez le dossier `extension` (raccourci dans le menu Démarrer).

L'installeur n'est pas signé : si Windows SmartScreen l'affiche, cliquez sur « Informations complémentaires » puis « Exécuter quand même ».

### Recréer l'installeur

Lancer [Inno Setup 6](https://jrsoftware.org/isinfo.php) : `iscc installer\clean-peek.iss`. Le setup est créé dans `installer\Output\`.

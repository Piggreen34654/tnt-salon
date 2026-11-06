# TNT Salon

Interface de télévision en français, à ouvrir dans un navigateur. Elle reprend le geste d’une box TNT : grille numérotée, logos, catégories, lecteur. Elle ne s’installe pas sur le téléviseur.

Les chaînes d’exemple ont des noms fictifs. Leurs flux sont des vidéos de test publiques : films ouverts Blender (W3C, Blender.org, Archive.org), une vidéo CC0 (MDN), démos HLS Mux, Shaka et Unified Streaming, et deux flux live de test Akamai. Le seau d’exemples Google (`gtv-videos-bucket`) ne s’ouvre plus sans compte, il n’est pas utilisé.

Pour brancher un autre flux, remplace le champ `url` par une adresse que tu as le droit de lire : fichier à toi, flux officiel, ou autre démo.

## Lancer

Dans le dossier du projet :

```bash
npm install
npm run dev
```

Ouvre [http://localhost:5173](http://localhost:5173).

Le serveur écoute aussi sur le réseau local. Dans le terminal, Vite affiche une adresse du type `http://192.168.x.x:5173`. Sur un téléphone ou une box Android (Chrome), ouvre cette adresse. L’ordinateur et l’écran doivent être sur le même Wi-Fi. Windows peut demander d’autoriser Node dans le pare-feu.

Pour une version figée, sans le mode développement :

```bash
npm run build
npm run preview
```

Le résultat est dans `dist/`. Tu peux le servir avec n’importe quel hébergement de fichiers statiques.

## Utiliser

- Clique une carte, ou parcours-les avec les flèches puis Entrée.
- Espace met en pause. Échap revient à la grille (ou quitte le plein écran d’abord).
- Pendant la lecture, flèche gauche et flèche droite changent de chaîne dans la catégorie affichée.
- Le bouton **Importer un M3U** lit un fichier sur l’appareil. Cette liste reste en mémoire jusqu’au rechargement de la page. **Liste d’exemple** revient à `channels.json`.

## Ajouter une chaîne

Édite [`public/channels.json`](public/channels.json). C’est un tableau. Ajoute un objet, enregistre, recharge la page.

```json
{
  "id": "ma-chaine",
  "number": 21,
  "name": "Ma chaîne",
  "category": "Chaînes",
  "logo": "",
  "logoText": "MC",
  "color": "#e85d4c",
  "description": "Ma vidéo de test",
  "url": "/ma-video.mp4",
  "type": "auto"
}
```

- `url` est le seul champ indispensable pour le lecteur. Les autres servent à l’affichage.
- `type` : `mp4`, `hls`, ou `auto`. En `auto`, une adresse qui finit par `.m3u8` est lue en HLS, le reste en MP4.
- `logo` vide : pastille colorée avec `logoText`. Tu peux mettre un fichier dans `public/` (par exemple `logo` : `"/logos/ma-chaine.svg"`) ou une adresse d’image.
- `color` : couleur hexadécimale de la pastille et du liseré (`#e85d4c`).
- Pour une vidéo à toi, place le fichier dans `public/` et utilise une adresse du site, par exemple `"/ma-video.mp4"`.

Le fichier peut aussi être un objet `{ "channels": [ ... ] }`.

## Importer un M3U

Un fichier de chaînes, pas un flux. Une entrée par chaîne :

```
#EXTM3U
#EXTINF:-1 tvg-chno="21" tvg-logo="" group-title="Chaînes",Ma chaîne
https://exemple.com/ma-video.mp4
```

`group-title` devient la catégorie, `tvg-chno` le numéro, `tvg-logo` le logo. [`public/exemple.m3u`](public/exemple.m3u) reprend les mêmes flux que le JSON.

Un `.m3u8` qui contient `#EXT-X-` est un flux vidéo. Ne l’importe pas comme liste : colle son adresse dans `url`.

## Si une chaîne ne démarre pas

Le lecteur affiche un message et tu peux revenir à la grille ou zapper. Causes fréquentes : adresse incorrecte, format ni MP4 ni HLS, ou serveur qui refuse la lecture depuis une page web (en-têtes CORS absents). Les flux de démo fournis sont prévus pour un navigateur.

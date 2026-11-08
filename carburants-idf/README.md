# CarbuPrix

Application Next.js en JavaScript pour comparer les prix de carburants à partir du fichier JSON fourni. Le catalogue contient 872 stations, principalement situées en Île-de-France.

## Démarrage

1. Installer Node.js 20.9 ou supérieur.
2. Ouvrir le dossier `carburants-idf` dans VS Code.
3. Dans le terminal du dossier, lancer :

   ```bash
   npm ci
   npm run dev
   ```

4. Ouvrir [http://localhost:3000](http://localhost:3000).

Pour vérifier la compilation, exécuter `npm run build`. Pour lancer ensuite la version compilée, exécuter `npm run start`.

## Utilisation

- Choisir un carburant parmi les six proposés.
- Saisir une ville, un code postal ou une enseigne. La recherche accepte les noms sans accents.
- Affiner la recherche par département et trier les résultats.
- Sélectionner un repère sur la carte pour voir l’adresse et le prix du carburant choisi. Les repères suivent les filtres.
- Ouvrir la fiche d’une station pour voir ses autres prix, ses services et la date du relevé.

Une station apparaît dans les résultats si le fichier contient un prix pour le carburant sélectionné. Le tableau de la fiche affiche un tiret lorsque le prix est absent. Les prix correspondent au fichier fourni et la date indiquée est celle de la mise à jour de la fiche station.

## Organisation

| Fichier | Rôle |
| --- | --- |
| `app/page.js` | Charge le fichier JSON et affiche le comparateur. |
| `app/comparator.js` | Gère les filtres, le tri et les fiches de stations. |
| `app/stations-map.js` | Place les stations sur une carte React Leaflet avec un fond OpenStreetMap. |
| `app/globals.css` | Définit la mise en page sur ordinateur et mobile. |
| `data/prix-des-carburants-j-7.json` | Contient les données fournies. |

L’application lit le fichier local. Elle fonctionne sans clé API ni base de données. Le fond de carte OpenStreetMap est chargé en ligne.

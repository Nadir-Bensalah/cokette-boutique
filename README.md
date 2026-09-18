# Cokette Girls · boutique

Front de la boutique en ligne de prêt-à-porter féminin (Bray-sur-Somme),
pensée pour la vente en live. Téléphone d'abord.

**Démonstration** : https://nadir-bensalah.github.io/cokette-boutique/

## Démarrer

```bash
npm install
npm run dev      # http://localhost:4321/cokette-boutique
npm run build    # dist/ prêt pour GitHub Pages
npm run preview
```

## Le découpage

| Dossier | Rôle |
|---|---|
| `src/pages` | Une route = un fichier. Les fiches produit et les catégories sont générées depuis les données. |
| `src/views` *(à venir)* | Les vues, quand une page dépassera quelques dizaines de lignes |
| `src/components` | Briques Astro (rendues au build) |
| `src/components/islands` | Briques React (hydratées dans le navigateur) : panier, filtres, tailles |
| `src/components/deco` | Dessins au trait et bords irréguliers |
| `src/lib` | Chemins, accès aux données |
| `src/stores` | Le panier (nanostores + localStorage) |
| `src/data` | Le catalogue, importé du site actuel |

## Les règles qui comptent

**Les chemins.** Le site vit sous `/cokette-boutique` sur GitHub Pages et à la
racine sur un domaine dédié. `BASE_PATH` règle ça. **Tout lien passe par
`href()`, tout fichier statique par `asset()`** (`src/lib/paths.ts`). Oublier
l'un des deux casse le site sur Pages sans le casser en local.

**Le stock est par taille.** Une pièce n'est pas « disponible » ou non : chaque
taille a son compteur. `availableSizes()` donne celles qu'on peut encore vendre,
`isSoldOut()` ne vaut que si toutes sont à zéro.

**Les animations se désactivent.** Tout mouvement est derrière
`prefers-reduced-motion`. L'apparition au défilement part d'un état visible :
sans JavaScript, la page reste entièrement lisible.

**Le débordement se coupe sur `body`.** Les cartes penchées et les décors
dépassent volontiers. Un `overflow` sur un conteneur intermédiaire casserait
le `position: sticky` de l'en-tête.

## Ce qui n'est pas branché

Cette version est une démonstration du front. Le paiement, les comptes
clientes et l'espace de gestion viennent avec la base de données (Supabase)
et Stripe. Le panier est réel et persiste dans le navigateur.

Les photos viennent du site actuel de la boutique.

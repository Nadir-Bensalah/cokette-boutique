/**
 * La démonstration publique montre l'accueil, la boutique, les fiches, le live
 * et le panier. Le reste est voilé à la construction : les sections écartées
 * ne sont pas rendues, les pages écartées sont remplacées. Il n'y a donc rien
 * à « déflouter » dans le navigateur.
 *
 *   DEMO=1 npm run build   -> démonstration voilée (GitHub Pages)
 *   npm run build          -> site complet
 */
export const DEMO = import.meta.env.DEMO === '1';

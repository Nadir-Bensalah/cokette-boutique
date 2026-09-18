import { atom, computed } from 'nanostores';

/** Une ligne = un produit ET une taille : le même haut en S et en M fait deux lignes. */
export interface Line {
  key: string;
  product_id: string;
  slug: string;
  name: string;
  image: string;
  size: string;
  price: number;
  qty: number;
  /** Ce que la boutique avait en stock pour cette taille au moment de l'ajout. */
  max: number;
}

const CLE = 'cokette.panier.v1';

const lire = (): Line[] => {
  if (typeof localStorage === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(CLE) ?? '[]'); } catch { return []; }
};

export const cartLines = atom<Line[]>(lire());
export const cartOpen = atom(false);

const ecrire = (lines: Line[]) => {
  cartLines.set(lines);
  try { localStorage.setItem(CLE, JSON.stringify(lines)); } catch { /* navigation privée */ }
};

export const cartCount = computed(cartLines, (l) => l.reduce((n, x) => n + x.qty, 0));
export const cartTotal = computed(cartLines, (l) => l.reduce((n, x) => n + x.qty * x.price, 0));

export function addToCart(item: Omit<Line, 'key' | 'qty'>, qty = 1) {
  const key = `${item.product_id}::${item.size}`;
  const lines = [...cartLines.get()];
  const i = lines.findIndex((l) => l.key === key);
  if (i >= 0) lines[i] = { ...lines[i], qty: Math.min(lines[i].qty + qty, lines[i].max) };
  else lines.push({ ...item, key, qty: Math.min(qty, item.max) });
  ecrire(lines);
}

export const setQty = (key: string, qty: number) =>
  ecrire(cartLines.get().map((l) => (l.key === key ? { ...l, qty: Math.max(1, Math.min(qty, l.max)) } : l)));

export const removeLine = (key: string) => ecrire(cartLines.get().filter((l) => l.key !== key));
export const clearCart = () => ecrire([]);
export const openCartDrawer = () => cartOpen.set(true);
export const closeCartDrawer = () => cartOpen.set(false);

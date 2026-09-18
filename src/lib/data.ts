import catalogue from '@/data/catalogue.json';

export interface Category { slug: string; name: string; description: string }
export interface Product {
  id: string; slug: string; name: string; short: string; category: string;
  price: number; images: string[]; sizes: string[];
  stock: Record<string, number>; badges: string[]; description: string;
}

export const categories: Category[] = catalogue.categories;
export const products: Product[] = catalogue.products as Product[];

export const byCategory = (slug: string) => products.filter((p) => p.category === slug);
export const bySlug = (slug: string) => products.find((p) => p.slug === slug);

/** Total toutes tailles confondues. Zéro = la pièce ne peut plus être vendue. */
export const totalStock = (p: Product) => Object.values(p.stock).reduce((a, b) => a + b, 0);
export const isSoldOut = (p: Product) => totalStock(p) === 0;
export const isLow = (p: Product) => { const t = totalStock(p); return t > 0 && t <= 2; };

/** Les tailles encore disponibles, dans l'ordre déclaré. */
export const availableSizes = (p: Product) => p.sizes.filter((s) => (p.stock[s] ?? 0) > 0);

export const formatPrice = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);

export const featured = () => products.filter((p) => !isSoldOut(p)).slice(0, 8);
export const newArrivals = () => products.filter((p) => p.badges.includes('nouveau') && !isSoldOut(p));

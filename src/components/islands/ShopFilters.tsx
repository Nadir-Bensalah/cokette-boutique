import { useMemo, useState } from 'react';

interface P {
  id: string; slug: string; name: string; short: string; category: string;
  price: number; images: string[]; sizes: string[]; stock: Record<string, number>; badges: string[];
}

const eur = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);
const dispoDe = (p: P) => p.sizes.filter((s) => (p.stock[s] ?? 0) > 0);

/** Filtres de la boutique : catégorie, taille, disponibilité, tri.
 *  Tout se fait dans le navigateur, sans recharger la page. */
export default function ShopFilters({ products, categories, base }: {
  products: P[]; categories: { slug: string; name: string }[]; base: string;
}) {
  const b = base.replace(/\/$/, '');
  const [cat, setCat] = useState('tout');
  const [taille, setTaille] = useState('tout');
  const [dispoSeul, setDispoSeul] = useState(false);
  const [tri, setTri] = useState<'nouveau' | 'prix-croissant' | 'prix-decroissant'>('nouveau');

  const toutesTailles = useMemo(() => {
    const s = new Set<string>();
    products.forEach((p) => p.sizes.forEach((t) => { if (t !== 'Taille unique') s.add(t); }));
    const ordre = ['S', 'M', 'L', 'XL'];
    return [...s].sort((a, z) => {
      const ia = ordre.indexOf(a), iz = ordre.indexOf(z);
      if (ia >= 0 && iz >= 0) return ia - iz;
      if (ia >= 0) return -1;
      if (iz >= 0) return 1;
      return a.localeCompare(z, 'fr', { numeric: true });
    });
  }, [products]);

  const liste = useMemo(() => {
    let r = products.filter((p) => {
      if (cat !== 'tout' && p.category !== cat) return false;
      if (taille !== 'tout' && (p.stock[taille] ?? 0) === 0) return false;
      if (dispoSeul && dispoDe(p).length === 0) return false;
      return true;
    });
    if (tri === 'prix-croissant') r = [...r].sort((a, z) => a.price - z.price);
    if (tri === 'prix-decroissant') r = [...r].sort((a, z) => z.price - a.price);
    return r;
  }, [products, cat, taille, dispoSeul, tri]);

  const Pastille = ({ actif, children, ...rest }: any) => (
    <button
      type="button"
      aria-pressed={actif}
      className={`chip border transition-colors ${actif ? 'border-wine bg-wine text-white' : 'border-line-2 bg-paper text-ink-2 hover:border-wine'}`}
      {...rest}
    >{children}</button>
  );

  return (
    <div>
      <div className="flex flex-col gap-3">
        <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          <Pastille actif={cat === 'tout'} onClick={() => setCat('tout')}>Tout</Pastille>
          {categories.map((c) => (
            <Pastille key={c.slug} actif={cat === c.slug} onClick={() => setCat(c.slug)}>{c.name}</Pastille>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-3">Taille</span>
          <Pastille actif={taille === 'tout'} onClick={() => setTaille('tout')}>Toutes</Pastille>
          {toutesTailles.map((t) => (
            <Pastille key={t} actif={taille === t} onClick={() => setTaille(t)}>{t}</Pastille>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink-2">
            <input type="checkbox" checked={dispoSeul} onChange={(e) => setDispoSeul(e.target.checked)}
              className="h-4 w-4 accent-[var(--color-wine)]" />
            Seulement les pièces disponibles
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-ink-2">
            Trier
            <select value={tri} onChange={(e) => setTri(e.target.value as any)}
              className="rounded-md border border-line-2 bg-paper px-3 py-2 text-sm">
              <option value="nouveau">Nouveautés d'abord</option>
              <option value="prix-croissant">Prix croissant</option>
              <option value="prix-decroissant">Prix décroissant</option>
            </select>
          </label>
        </div>
      </div>

      <p className="mt-5 text-sm text-ink-3" role="status" aria-live="polite">
        {liste.length === 0 ? 'Aucune pièce ne correspond.' : `${liste.length} pièce${liste.length > 1 ? 's' : ''}`}
      </p>

      {liste.length === 0 ? (
        <div className="mt-6 rounded-lg bg-paper p-8 text-center shadow-card">
          <p className="text-ink-2">Essayez une autre taille ou une autre catégorie.</p>
          <button type="button" className="btn btn-soft btn-sm mt-4"
            onClick={() => { setCat('tout'); setTaille('tout'); setDispoSeul(false); }}>
            Tout afficher
          </button>
        </div>
      ) : (
        <div className="grille mt-6 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {liste.map((p, i) => {
            const dispo = dispoDe(p);
            const epuise = dispo.length === 0;
            const tilt = i % 2 === 0 ? 'a' : 'b';
            return (
              <article key={p.id}
                className={`group relative flex flex-col rounded-lg bg-paper p-3 shadow-card transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-float sm:p-3.5 tilt-${tilt}`}>
                <a href={`${b}/produits/${p.slug}`} className="relative block" tabIndex={-1} aria-hidden="true">
                  <div className="panel relative aspect-[3/4] rounded-lg bg-rose shadow-[0_10px_24px_-14px_rgba(142,29,66,.6)]">
                    <div className="photo absolute inset-2 overflow-hidden rounded-md bg-cream">
                      <img src={`${b}/images/products/${p.images[0]}`} alt="" width="800" height="1066" loading="lazy" decoding="async"
                        className={`h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 ${epuise ? 'grayscale' : ''}`} />
                    </div>
                  </div>
                  {epuise && <span className="tag bg-ink text-cream">Épuisé</span>}
                </a>
                <div className="flex flex-1 flex-col gap-1 pt-3">
                  <h3 className="text-base font-semibold leading-tight">
                    <a href={`${b}/produits/${p.slug}`} className="after:absolute after:inset-0 after:content-['']">{p.name}</a>
                  </h3>
                  {!epuise && <p className="text-xs text-ink-3">{dispo.join(' · ')}</p>}
                  <span className="mt-auto pt-3 font-display text-lg font-semibold tabular">{eur(p.price)}</span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <style>{`
        .tilt-a .panel { transform: rotate(-2.5deg) } .tilt-a .photo { transform: rotate(2.5deg) scale(1.04) }
        .tilt-b .panel { transform: rotate(2deg) }    .tilt-b .photo { transform: rotate(-2deg) scale(1.04) }
        .group:hover .panel { transform: none } .group:hover .photo { transform: scale(1.04) }
        .panel, .photo { transition: transform .5s cubic-bezier(0.16,1,0.3,1) }
        .grille { padding-inline: 2px }
        .tag { position:absolute; top:-.35rem; inset-inline-end:-.35rem; z-index:2; padding:.35rem .7rem;
               border-radius:6px; font-size:.7rem; font-weight:700; letter-spacing:.05em; text-transform:uppercase;
               transform:rotate(6deg); box-shadow:0 6px 16px -8px rgba(43,27,32,.5) }
        @media (prefers-reduced-motion: reduce) { .panel, .photo { transition: none } }
      `}</style>
    </div>
  );
}

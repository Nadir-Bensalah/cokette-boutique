import { useState } from 'react';
import AddButton from './AddButton';

interface Props {
  product: { id: string; slug: string; name: string; image: string; price: number; sizes: string[]; stock: Record<string, number> };
  base: string;
}

/** Choix de la taille sur la fiche produit, puis ajout au panier.
 *  Une taille épuisée reste visible mais barrée : la cliente voit que la
 *  pièce existe dans cette taille, et qu'elle est partie. */
export default function SizePicker({ product, base }: Props) {
  const dispo = product.sizes.filter((s) => (product.stock[s] ?? 0) > 0);
  const unique = product.sizes.length === 1 && product.sizes[0] === 'Taille unique';
  const [size, setSize] = useState<string | null>(unique && dispo.length ? dispo[0] : null);

  if (dispo.length === 0) {
    return (
      <div className="mt-6">
        <p className="rounded-lg bg-cream-2 px-4 py-3 text-sm text-ink-2">
          Cette pièce est épuisée. Écrivez-nous&nbsp;: nous vous prévenons dès qu'elle revient.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {!unique && (
        <>
          <div className="flex items-baseline justify-between gap-3">
            <p className="label mb-0">Taille</p>
            <a href={`${base.replace(/\/$/, '')}/guide-des-tailles`} className="text-sm text-wine underline underline-offset-2">
              Guide des tailles
            </a>
          </div>
          <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Choisir une taille">
            {product.sizes.map((s) => {
              const reste = product.stock[s] ?? 0;
              const choisie = size === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  disabled={reste === 0}
                  aria-pressed={choisie}
                  className={`min-w-14 rounded-md border px-4 py-3 text-sm font-semibold transition-colors ${
                    choisie ? 'border-wine bg-wine text-white'
                    : reste === 0 ? 'cursor-not-allowed border-line bg-cream-2 text-ink-3 line-through'
                    : 'border-line-2 bg-paper text-ink hover:border-wine'
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
          {size && (product.stock[size] ?? 0) <= 2 && (
            <p className="mt-2 text-sm font-semibold text-wine">
              Plus que {product.stock[size]} pièce{(product.stock[size] ?? 0) > 1 ? 's' : ''} en {size}.
            </p>
          )}
          {!size && <p className="help">Choisissez une taille pour continuer.</p>}
        </>
      )}

      <div className="mt-4">
        <AddButton product={product} base={base} size={size ?? undefined} />
      </div>
    </div>
  );
}
